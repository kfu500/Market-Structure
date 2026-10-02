import { createHash } from 'node:crypto';
import { constants, rmSync } from 'node:fs';
import { mkdtemp, open, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { inflateSync } from 'node:zlib';
import { externalPath } from './storage.js';

const MiB = 1024 * 1024;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const FREQUENCIES = new Set(['daily', 'calendar_daily', 'monthly', 'quarterly', 'MTD', 'QTD', 'YTD', 'point_in_time', 'snapshot']);
const STALE_DAYS = { daily: 7, calendar_daily: 7, monthly: 62, quarterly: 150, MTD: 7, QTD: 7, YTD: 7, point_in_time: 7, snapshot: 7 };
const REQUIRED_TABLES = ['components', 'metrics', 'observations', 'sources', 'research', 'metric_calculations'];
const object = () => Object.create(null);
const has = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const fail = message => { throw new Error(`Legacy database validation failed: ${message}.`); };

// Source histories use both first-of-month and month-end period labels. Preserve
// those labels and observation-date precision; do not manufacture a cutoff day.
export function legacyDate(value, { monthAllowed = false } = {}) {
  if (typeof value !== 'string' || !(monthAllowed ? /^\d{4}-\d{2}(?:-\d{2})?$/ : /^\d{4}-\d{2}-\d{2}$/).test(value)) return null;
  const [year, month, day = 1] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12) return null;
  const days = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  if (day < 1 || day > days) return null;
  const precision = value.length === 7 ? 'month' : 'day';
  const upperBound = precision === 'month' ? `${value}-${days}` : value;
  return { value, precision, upperBound };
}

function readPointer(text) {
  let pointer;
  try { pointer = JSON.parse(text); } catch { fail('observation pointer is not JSON'); }
  if (!Array.isArray(pointer) || !pointer.length || pointer.length > 64 || pointer.some(key =>
    !((typeof key === 'string' && !FORBIDDEN_KEYS.has(key)) || (Number.isSafeInteger(key) && key >= 0)))) {
    fail('observation pointer is not a safe JSON array');
  }
  return pointer;
}

function pointAt(component, pointer) {
  let parent = component;
  for (const key of pointer.slice(0, -1)) {
    if (!parent || typeof parent !== 'object' || !has(parent, key) ||
      (Array.isArray(parent) && !Number.isSafeInteger(key))) fail('observation pointer does not resolve');
    parent = parent[key];
  }
  const key = pointer.at(-1);
  if (!parent || typeof parent !== 'object' || !has(parent, key) ||
    (Array.isArray(parent) && !Number.isSafeInteger(key))) fail('observation pointer does not resolve');
  return { parent, key };
}

function freezeTree(root) {
  const pending = [root];
  while (pending.length) {
    const value = pending.pop();
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const child of Object.values(value)) if (child && typeof child === 'object') pending.push(child);
    }
  }
  return root;
}

function boundedJson(blob, limits, expectedHash) {
  let raw;
  try { raw = inflateSync(blob, { maxOutputLength: limits.component }); }
  catch { fail('component or research payload cannot be decompressed within the size limit'); }
  limits.total += raw.byteLength;
  if (limits.total > limits.maximum) fail('decompressed payloads exceed the total size limit');
  if (expectedHash !== undefined && (typeof expectedHash !== 'string' ||
    !/^[a-f0-9]{64}$/.test(expectedHash) || createHash('sha256').update(raw).digest('hex') !== expectedHash)) {
    fail('component SHA-256 does not match its uncompressed bytes');
  }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw)); }
  catch { fail('component or research payload is not valid UTF-8 JSON'); }
}

function updateRange(range, value) {
  if (!value) return;
  if (range.first === null || value < range.first) range.first = value;
  if (range.last === null || value > range.last) range.last = value;
}

function newCoverage() {
  return { observations: 0, metrics: new Set(), units: new Set(), latestPeriod: null,
    latestAsOf: null, latestAsOfPrecision: null, latestAsOfUpperBound: null,
    staleAfterDays: null, quarantined: 0, futureDates: 0 };
}

function observeCoverage(item, row, period, asOf, future) {
  item.observations++;
  item.metrics.add(row.metric_id);
  item.units.add(row.unit);
  if (!period || !asOf) { item.quarantined++; return; }
  if (future) { item.futureDates++; return; }
  if (!item.latestPeriod || period.value > item.latestPeriod) item.latestPeriod = period.value;
  if (!item.latestAsOf || asOf.upperBound > item.latestAsOfUpperBound ||
    (asOf.upperBound === item.latestAsOfUpperBound && asOf.precision === 'day' && item.latestAsOfPrecision === 'month')) {
    item.latestAsOf = asOf.value;
    item.latestAsOfPrecision = asOf.precision;
    item.latestAsOfUpperBound = asOf.upperBound;
    item.staleAfterDays = STALE_DAYS[row.frequency];
  } else if (asOf.upperBound === item.latestAsOfUpperBound) {
    item.staleAfterDays = Math.min(item.staleAfterDays, STALE_DAYS[row.frequency]);
  }
}

function finishCoverage(item, today) {
  item.metrics = item.metrics.size;
  item.units = [...item.units].sort();
  item.ageDays = item.latestAsOf ? Math.max(0, Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${item.latestAsOfUpperBound}T00:00:00Z`)) / 86400000)) : null;
  item.stale = item.ageDays === null || item.ageDays > item.staleAfterDays;
  item.status = item.latestAsOf === null ? 'missing' : item.stale ? 'stale' : 'dated-snapshot';
  delete item.latestAsOfUpperBound;
}

function effectiveResearchDate(sourceDate, payload) {
  if (sourceDate !== '' && sourceDate !== null && !legacyDate(sourceDate)) fail('research source date is invalid');
  for (const candidate of [sourceDate, payload?.report_date, payload?.date, payload?.received_at]) {
    if (typeof candidate !== 'string') continue;
    // Preserve a supplied ISO month, day, or the dated portion of an ISO
    // timestamp. Arbitrary prose/digit prefixes are never interpreted as dates.
    const value = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(candidate)
      && Number.isFinite(Date.parse(candidate)) ? candidate.slice(0, 10) : candidate;
    const parsed = legacyDate(value, { monthAllowed: true });
    if (parsed) return parsed;
  }
  return null;
}

async function noJournal(filename) {
  for (const suffix of ['-wal', '-journal']) {
    try {
      if ((await stat(`${filename}${suffix}`)).size > 0) {
        fail('database has an active journal; provide a checkpointed standalone SQLite snapshot');
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

/** Check the original source before copying, as well as the final snapshot. */
export async function assertStandaloneLegacy(filename) {
  const resolved = await externalPath(filename);
  await noJournal(resolved);
  const handle = await open(resolved, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    if (!(await handle.stat()).isFile()) fail('input must be a regular SQLite file');
  } finally { await handle.close(); }
  return resolved;
}

async function hashHandle(handle) {
  const hash = createHash('sha256');
  const buffer = Buffer.allocUnsafe(4 * MiB);
  let position = 0;
  for (;;) {
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, position);
    if (!bytesRead) return hash.digest('hex');
    hash.update(buffer.subarray(0, bytesRead));
    position += bytesRead;
  }
}

function assertUnchanged(before, after) {
  if (before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) fail('database changed while being read');
}

function removePortableSnapshot(directory) {
  if (directory) rmSync(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

// Windows has no /proc descriptor pathname. An exclusive private temporary copy
// gives SQLite a stable native pathname without reopening the mutable source.
// Windows inherits the current user's temporary-directory ACL; on POSIX,
// mkdtemp and the explicit file mode also exclude other users.
async function copyPortableSnapshot(source, { expectedFileHash, temporaryDirectory }) {
  const root = await externalPath(temporaryDirectory, { directory: true });
  const directory = await mkdtemp(path.join(root, 'market-structure-readonly-'));
  const filename = path.join(directory, 'snapshot.sqlite');
  let target;
  try {
    target = await open(filename, 'wx+', 0o600);
    const hash = createHash('sha256');
    const buffer = Buffer.allocUnsafe(4 * MiB);
    let position = 0;
    for (;;) {
      const { bytesRead } = await source.read(buffer, 0, buffer.length, position);
      if (!bytesRead) break;
      const chunk = buffer.subarray(0, bytesRead);
      hash.update(chunk);
      await target.writeFile(chunk);
      position += bytesRead;
    }
    const copiedHash = hash.digest('hex');
    if (expectedFileHash !== undefined && copiedHash !== expectedFileHash) fail('database file SHA-256 does not match the pinned snapshot digest');
    await target.sync();
    if (await hashHandle(target) !== copiedHash) fail('private snapshot copy SHA-256 does not match its source bytes');
    await target.close();
    target = undefined;
    return { directory, filename };
  } catch (error) {
    await target?.close();
    removePortableSnapshot(directory);
    throw error;
  }
}

/**
 * Open an external, checkpointed SQLite snapshot without running imported code.
 * Components remain lossless JSON; normalized rows are reconciled with their
 * original component pointers. Mixed-frequency and overlapping source roles are
 * preserved, never added together or silently converted to a monthly schema.
 */
export async function openLegacyStore(filename, {
  now = new Date(), maxComponentBytes = 256 * MiB, maxTotalBytes = 512 * MiB, expectedFileHash,
  platform = process.platform, temporaryDirectory = os.tmpdir(),
} = {}) {
  if (!(now instanceof Date) || !Number.isFinite(now.valueOf())) throw new Error('A valid validation date is required.');
  if (![maxComponentBytes, maxTotalBytes].every(value => Number.isSafeInteger(value) && value > 0)) throw new Error('Positive payload size limits are required.');
  if (expectedFileHash !== undefined && (typeof expectedFileHash !== 'string' || !/^[a-f0-9]{64}$/.test(expectedFileHash))) {
    throw new Error('Expected database file hash must be a lowercase SHA-256 digest.');
  }
  const resolved = await assertStandaloneLegacy(filename);
  // The descriptor pins the validated regular file against leaf replacement.
  // Linux opens this descriptor read-only with immutable=1. Other platforms
  // receive a verified private process snapshot, opened by its native pathname.
  const handle = await open(resolved, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  let db;
  let portableSnapshot;
  try {
    const before = await handle.stat({ bigint: true });
    if (!before.isFile()) fail('input must be a regular SQLite file');
    let sqliteFilename;
    if (platform === 'linux') {
      if (expectedFileHash !== undefined && await hashHandle(handle) !== expectedFileHash) fail('database file SHA-256 does not match the pinned snapshot digest');
      sqliteFilename = `file:/proc/self/fd/${handle.fd}?mode=ro&immutable=1`;
    } else {
      portableSnapshot = await copyPortableSnapshot(handle, { expectedFileHash, temporaryDirectory });
      assertUnchanged(before, await handle.stat({ bigint: true }));
      sqliteFilename = portableSnapshot.filename;
    }
    await noJournal(resolved);
    // Native file paths and readOnly are documented Node 24 DatabaseSync
    // options. The portable copy is never shared with an updater or writer.
    db = new DatabaseSync(sqliteFilename, {
      readOnly: true, allowExtension: false, enableForeignKeyConstraints: true,
      enableDoubleQuotedStringLiterals: false,
    });
    db.exec('PRAGMA query_only = ON; PRAGMA trusted_schema = OFF;');
    const tables = new Map(db.prepare("SELECT name,type FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%'").all().map(row => [row.name, row.type]));
    if (REQUIRED_TABLES.some(name => tables.get(name) !== 'table')) fail('required tables are missing or replaced by views');
    const integrity = db.prepare('PRAGMA integrity_check').all();
    if (integrity.length !== 1 || Object.values(integrity[0])[0] !== 'ok') fail('SQLite integrity check did not pass');
    if (db.prepare('PRAGMA foreign_key_check').get()) fail('foreign key check did not pass');
    if (db.prepare('SELECT 1 FROM observations GROUP BY metric_id, period, frequency HAVING COUNT(*) > 1 LIMIT 1').get()) {
      fail('duplicate metric, period and frequency observation');
    }

    const components = object();
    const componentHashes = object();
    const limits = { component: maxComponentBytes, maximum: maxTotalBytes, total: 0 };
    for (const row of db.prepare('SELECT name,payload,sha256 FROM components ORDER BY name').iterate()) {
      if (!nonempty(row.name) || FORBIDDEN_KEYS.has(row.name)) fail('component name is invalid');
      components[row.name] = boundedJson(row.payload, limits, row.sha256);
      componentHashes[row.name] = row.sha256;
    }
    if (!has(components, 'DB') || !components.DB || typeof components.DB !== 'object' || Array.isArray(components.DB)) fail('primary DB component is missing or invalid');

    const metrics = new Map();
    for (const row of db.prepare('SELECT metric_id,entity FROM metrics').iterate()) {
      if (!nonempty(row.metric_id) || !nonempty(row.entity)) fail('metric identifier or entity is missing');
      metrics.set(row.metric_id, row.entity);
    }
    const counts = { components: Object.keys(components).length, observations: 0, metrics: metrics.size,
      sources: db.prepare('SELECT count(*) AS n FROM sources').get().n, research: 0, calculations: 0 };
    const coverage = object();
    const seriesCoverage = object();
    const frequencies = object();
    const roles = object();
    const periodRange = { first: null, last: null };
    const observationDateRange = { first: null, last: null };
    const quarantined = [];
    let ambiguousUnits = 0;
    let monthPrecisionDates = 0;
    let futureDates = 0;
    const today = now.toISOString().slice(0, 10);
    for (const row of db.prepare('SELECT observation_id,metric_id,period,as_of,frequency,value,unit,status,role,component,pointer FROM observations').iterate()) {
      if (!metrics.has(row.metric_id) || !has(components, row.component)) fail('observation reference does not resolve');
      if (typeof row.value !== 'number' || !Number.isFinite(row.value)) fail('observation value is not finite');
      if (!nonempty(row.unit)) fail('observation unit is missing');
      if (!FREQUENCIES.has(row.frequency)) fail('observation frequency is missing or unsupported');
      const periodMissing = row.period === '' || row.period === null;
      const asOfMissing = row.as_of === '' || row.as_of === null;
      const period = periodMissing ? null : legacyDate(row.period);
      const asOf = asOfMissing ? null : legacyDate(row.as_of, { monthAllowed: true });
      if ((!periodMissing && !period) || (!asOfMissing && !asOf)) fail('observation date is not a valid Gregorian date');
      const pointer = readPointer(row.pointer);
      if (periodMissing || asOfMissing) {
        if (row.frequency !== 'MTD' || !/provisional|preliminary|partial/i.test(row.status || '') ||
          !/unverified|withheld|staged/i.test(row.role || '')) fail('observation date is missing outside a quarantined provisional MTD record');
        quarantined.push({ observationId: row.observation_id, component: row.component, pointer,
          frequency: row.frequency, reason: 'Missing date; provisional MTD cutoff unverified. Excluded from dated freshness coverage.' });
      }
      const { parent, key } = pointAt(components[row.component], pointer);
      if (typeof parent[key] !== 'number' || parent[key] !== row.value) {
        fail('typed observation and component value disagree; reconcile the source snapshot before loading');
      }
      // Explicitly materialize the typed value after verifying alignment. This
      // is an in-memory projection only; neither the DB nor its payload changes.
      parent[key] = row.value;
      counts.observations++;
      frequencies[row.frequency] = (frequencies[row.frequency] || 0) + 1;
      const role = row.role || 'unspecified';
      roles[role] = (roles[role] || 0) + 1;
      const entity = metrics.get(row.metric_id);
      if (!has(coverage, entity)) coverage[entity] = newCoverage();
      const seriesKey = JSON.stringify([entity, row.metric_id, row.frequency]);
      if (!has(seriesCoverage, seriesKey)) seriesCoverage[seriesKey] = {
        entity, metricId: row.metric_id, frequency: row.frequency, ...newCoverage(),
      };
      if (/not specified|unknown|unspecified/i.test(row.unit)) ambiguousUnits++;
      if (asOf?.precision === 'month') monthPrecisionDates++;
      const future = (period && period.value > today) || (asOf && asOf.value > today);
      if (future) futureDates++;
      if (period) updateRange(periodRange, period.value);
      if (asOf) updateRange(observationDateRange, asOf.value);
      observeCoverage(coverage[entity], row, period, asOf, future);
      observeCoverage(seriesCoverage[seriesKey], row, period, asOf, future);
    }
    for (const item of [...Object.values(coverage), ...Object.values(seriesCoverage)]) finishCoverage(item, today);
    const metricCalculations = object();
    for (const row of db.prepare('SELECT company,metric,period,yoy,seq_pct,acceleration_pp,growth_unit FROM metric_calculations').iterate()) {
      if (![row.company, row.metric].every(value => nonempty(value) && !FORBIDDEN_KEYS.has(value)) || !legacyDate(row.period)) fail('calculation identity or period is invalid');
      if (!['percent', 'percentage_points'].includes(row.growth_unit)) fail('calculation growth unit is unsupported');
      if (![row.yoy, row.seq_pct, row.acceleration_pp].every(value => value === null || (typeof value === 'number' && Number.isFinite(value)))) fail('calculation value is not finite or explicitly missing');
      metricCalculations[row.company] ||= object();
      metricCalculations[row.company][row.metric] ||= object();
      metricCalculations[row.company][row.metric][row.period] = {
        yoy: row.yoy, seq_pct: row.seq_pct, acceleration_pp: row.acceleration_pp, growth_unit: row.growth_unit,
      };
      counts.calculations++;
    }
    const research = [];
    const researchDates = [];
    let undatedResearch = 0;
    for (const row of db.prepare('SELECT payload,source_date FROM research ORDER BY record_id').iterate()) {
      const payload = boundedJson(row.payload, limits);
      if (!payload || typeof payload !== 'object') fail('research payload is not structured JSON');
      const date = effectiveResearchDate(row.source_date, payload);
      if (!date) undatedResearch++;
      researchDates.push(date ? { value: date.value, precision: date.precision } : null);
      research.push(payload);
    }
    counts.research = research.length;
    const after = await handle.stat({ bigint: true });
    assertUnchanged(before, after);
    await noJournal(resolved);
    const warnings = [];
    if (quarantined.length) warnings.push(`${quarantined.length} provisional MTD records have missing dates and are quarantined from dated freshness coverage.`);
    if (ambiguousUnits) warnings.push(`${ambiguousUnits} observations retain source-reported unspecified units; no unit conversion or cross-source aggregation is performed.`);
    if (undatedResearch) warnings.push(`${undatedResearch} research records have no source date.`);
    if (futureDates) warnings.push(`${futureDates} observations have a future period or observation date and require source review.`);
    const manifest = {
      schemaVersion: 1, source: 'legacy-sqlite', mode: 'private', storage: 'external',
      loadedAt: now.toISOString(), asOf: Object.values(coverage).map(row => row.latestAsOf).filter(Boolean).sort().at(-1) || null,
      refresh: { status: 'not-connected', live: false, lastSuccessfulAt: null },
      counts, coverage, seriesCoverage, frequencies, roles, periodRange, observationDateRange, researchDates,
      quarantined, monthPrecisionDates, ambiguousUnits, undatedResearch, futureDates,
      validation: { status: 'passed-with-warnings', integrity: 'ok', foreignKeys: 'ok',
        componentHashes: 'verified', observationPointers: 'verified', typedValueMismatches: 0,
        errors: [], warnings },
      componentHashes,
      authority: 'Read-only SQLite snapshot. Typed values reconcile with the preserved component JSON; source roles may overlap and are not additive.',
      coverageNote: 'Entity freshness reports the newest dated observation, not completeness of every series. Missing observation dates and unspecified units remain explicitly flagged.',
    };
    if (!warnings.length) manifest.validation.status = 'passed';
    const snapshot = freezeTree({ components, metricCalculations, research, manifest });
    let closed = false;
    const ready = () => { if (closed) throw new Error('Legacy data store is closed.'); };
    return Object.freeze({
      snapshot() { ready(); return snapshot; },
      component(name) { ready(); return typeof name === 'string' && has(components, name) ? components[name] : undefined; },
      research() { ready(); return research; },
      status() { ready(); return manifest; },
      observations({ entity, metricId, frequency, limit = 500, offset = 0 } = {}) {
        ready();
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000 || !Number.isSafeInteger(offset) || offset < 0) {
          throw new Error('Observation pages require a limit from 1 to 1000 and a nonnegative integer offset.');
        }
        const filters = [];
        const parameters = [];
        for (const [column, value] of [['m.entity', entity], ['o.metric_id', metricId], ['o.frequency', frequency]]) {
          if (value !== undefined) {
            if (!nonempty(value) || value.length > 1000) throw new Error('Observation filters must be nonempty text.');
            filters.push(`${column} = ?`);
            parameters.push(value);
          }
        }
        const where = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
        const joins = ' FROM observations o JOIN metrics m ON m.metric_id=o.metric_id LEFT JOIN sources s ON s.source_id=o.source_id';
        const total = db.prepare(`SELECT count(*) AS n${joins}${where}`).get(...parameters).n;
        const rows = db.prepare(`SELECT o.observation_id AS observationId, o.metric_id AS metricId,
          m.entity, m.name AS metric, o.period, o.as_of AS asOf, o.frequency, o.value, o.unit,
          o.status, o.role, o.component, o.source_location AS sourceLocation,
          s.document AS sourceDocument, s.url AS sourceUrl, s.retrieved_at AS retrievedAt
          ${joins}${where} ORDER BY o.metric_id,o.period,o.frequency,o.observation_id LIMIT ? OFFSET ?`).all(...parameters, limit, offset);
        return { total, offset, limit, rows };
      },
      close() {
        if (!closed) {
          closed = true;
          try { db.close(); } finally { removePortableSnapshot(portableSnapshot?.directory); }
        }
      },
    });
  } catch (error) {
    try { db?.close(); } finally { removePortableSnapshot(portableSnapshot?.directory); }
    throw error;
  } finally { await handle.close(); }
}

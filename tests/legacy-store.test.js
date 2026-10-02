import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { openLegacyStore, legacyDate, assertStandaloneLegacy } from '../src/legacy-store.js';
import { REPO_ROOT } from '../src/storage.js';
import { syntheticLegacyFixture, setSyntheticComponent } from './helpers/legacy-fixture.js';

const now = new Date('2026-10-02T12:00:00Z');
async function load(t, mutate, options = {}) {
  const filename = await syntheticLegacyFixture(t, mutate);
  const store = await openLegacyStore(filename, { now, ...options });
  t.after(() => store.close());
  return { filename, store };
}
async function rejects(t, mutate, expression) {
  const filename = await syntheticLegacyFixture(t, mutate);
  await assert.rejects(openLegacyStore(filename, { now }), expression);
}

test('read-only materialization preserves bytes, mixed frequency/units, research and nullable calculations', async t => {
  const filename = await syntheticLegacyFixture(t);
  const before = await readFile(filename);
  const store = await openLegacyStore(filename, { now });
  t.after(() => store.close());
  const snapshot = store.snapshot();
  assert.equal(store.component('DB').synthetic, true);
  assert.equal(store.component('DB').rows[1].value, 20);
  assert.equal(snapshot.manifest.counts.observations, 3);
  assert.equal(snapshot.manifest.frequencies.daily, 1);
  assert.equal(snapshot.manifest.frequencies.monthly, 1);
  assert.deepEqual({ ...snapshot.metricCalculations.CME['Synthetic volume']['2026-08-01'] },
    { yoy: 25, seq_pct: 5, acceleration_pp: null, growth_unit: 'percent' });
  assert.equal(store.research()[0].synthetic, true);
  assert.equal(store.status().refresh.status, 'not-connected');
  assert.equal(store.status().refresh.live, false);
  assert.equal(store.status().validation.typedValueMismatches, 0);
  assert.deepEqual(await readFile(filename), before);
  assert.deepEqual(await readdir(path.dirname(filename)), ['synthetic.sqlite']);
  assert.equal(snapshot, store.snapshot(), 'one validated immutable cache per load');
  assert.throws(() => { snapshot.components.DB.rows[0].value = 100; }, TypeError);
  assert.equal(store.component('__proto__'), undefined);
  const serialized = JSON.stringify(snapshot);
  assert.doesNotMatch(serialized, /Synthetic template must never execute|Synthetic raw content must not be returned/);
  assert.equal('templates' in snapshot, false);
  assert.equal('raw_files' in snapshot, false);
  store.close();
  store.close();
  assert.throws(() => store.snapshot(), /closed/);
});

test('quarantines provisional undated MTD and flags unit ambiguity and undated research', async t => {
  const { store } = await load(t);
  const status = store.status();
  assert.equal(status.quarantined.length, 1);
  assert.equal(status.quarantined[0].observationId, 'synthetic-provisional');
  assert.equal(status.ambiguousUnits, 1);
  assert.equal(status.undatedResearch, 1);
  assert.equal(status.monthPrecisionDates, 1);
  assert.equal(status.coverage.CME.latestAsOf, '2026-08');
  assert.equal(status.coverage.CME.latestAsOfPrecision, 'month');
  assert.equal(status.seriesCoverage[JSON.stringify(['CME', 'synthetic-volume', 'daily'])].stale, true);
  assert.equal(status.seriesCoverage[JSON.stringify(['CME', 'synthetic-volume', 'monthly'])].stale, false);
  assert.equal(status.seriesCoverage[JSON.stringify(['CME', 'synthetic-volume', 'MTD'])].status, 'missing');
  assert.equal(status.validation.warnings.length, 3);
});

test('typed history pages preserve row units, periods and source roles with parameterized filters', async t => {
  const { store } = await load(t);
  const page = store.observations({ entity: 'CME', limit: 2 });
  assert.equal(page.total, 3);
  assert.equal(page.rows.length, 2);
  assert.deepEqual(page.rows.map(row => row.unit), ['contracts/day', 'million contracts/month']);
  assert.equal(store.observations({ frequency: 'monthly' }).rows[0].asOf, '2026-08');
  assert.equal(store.observations({ entity: "' OR 1=1 --" }).total, 0);
  assert.equal(store.observations({ metricId: 'synthetic-volume', offset: 2 }).rows.length, 1);
  assert.throws(() => store.observations({ limit: 1001 }), /limit/);
  assert.throws(() => store.observations({ offset: -1 }), /offset/);
});

test('strict Gregorian dates preserve day/month precision and reject impossible calendar dates', () => {
  assert.equal(legacyDate('2024-02-29').precision, 'day');
  assert.equal(legacyDate('2024-02', { monthAllowed: true }).upperBound, '2024-02-29');
  assert.equal(legacyDate('2026-08', { monthAllowed: true }).precision, 'month');
  for (const value of ['2025-02-29', '2024-02-30', '2026-13-01', '0000-01-01', '2026-1-01', '2026-01-01T00:00:00Z', '', null]) assert.equal(legacyDate(value), null);
  assert.equal(legacyDate('2026-08'), null);
});

test('rejects a changed component hash, corrupt compressed JSON and decompression over budget', async t => {
  await rejects(t, db => db.exec("UPDATE components SET sha256='bad' WHERE name='DB'"), /SHA-256/);
  await rejects(t, db => db.prepare("UPDATE components SET payload=? WHERE name='DB'").run(Buffer.from('synthetic corrupt compressed payload')), /decompressed/);
  const filename = await syntheticLegacyFixture(t);
  await assert.rejects(openLegacyStore(filename, { maxComponentBytes: 8 }), /size limit/);
  await assert.rejects(openLegacyStore(filename, { maxTotalBytes: 8 }), /total size limit/);
});

test('requires typed observations to agree with their preserved component values', async t => {
  await rejects(t, db => db.exec("UPDATE observations SET value=999 WHERE observation_id='synthetic-daily'"), /typed observation and component value disagree/);
  await rejects(t, (db, components) => {
    components.DB.rows[0].value = '10';
    setSyntheticComponent(db, 'DB', components.DB);
  }, /typed observation and component value disagree/);
});

test('rejects duplicate metric/period/frequency but retains different frequencies for the same period', async t => {
  await rejects(t, db => db.exec("UPDATE observations SET frequency='daily' WHERE observation_id='synthetic-monthly'"), /duplicate metric, period and frequency/);
  const { store } = await load(t);
  assert.equal(store.status().counts.observations, 3);
});

test('rejects missing units, invalid frequency and invalid or unquarantined dates', async t => {
  for (const [assignment, pattern] of [
    ["unit=''", /unit is missing/],
    ["frequency='synthetic-invalid'", /frequency/],
    ["period='2026-02-30'", /Gregorian/],
    ["as_of='2025-02-29'", /Gregorian/],
    ["period=NULL", /date is missing/],
    ["as_of=''", /date is missing/],
  ]) await rejects(t, db => db.exec(`UPDATE observations SET ${assignment} WHERE observation_id='synthetic-daily'`), pattern);
  await rejects(t, db => db.exec("UPDATE observations SET role='existing_portal_series' WHERE observation_id='synthetic-provisional'"), /date is missing/);
});

test('rejects nonfinite and missing typed values', async t => {
  await rejects(t, db => db.exec("UPDATE observations SET value=NULL WHERE observation_id='synthetic-daily'"), /not finite/);
  await rejects(t, db => db.prepare("UPDATE observations SET value=? WHERE observation_id='synthetic-daily'").run(Infinity), /not finite/);
});

test('rejects invalid pointers, missing references and prototype-polluting paths', async t => {
  for (const pointer of ['not JSON', '{}', '[]', '["rows",99,"value"]', '["rows","0","value"]', '["__proto__","value"]', '["constructor","prototype"]', '["rows",-1,"value"]']) {
    await rejects(t, db => db.prepare("UPDATE observations SET pointer=? WHERE observation_id='synthetic-daily'").run(pointer), /pointer/);
  }
  await rejects(t, db => {
    db.exec('PRAGMA foreign_keys=OFF');
    db.exec("UPDATE observations SET component='synthetic-missing' WHERE observation_id='synthetic-daily'");
  }, /foreign key/);
});

test('validates derived calculation units, missing values and source research dates', async t => {
  await rejects(t, db => db.exec("UPDATE metric_calculations SET growth_unit='USD'"), /growth unit/);
  await rejects(t, db => db.prepare('UPDATE metric_calculations SET yoy=?').run(Infinity), /calculation value/);
  await rejects(t, db => db.exec("UPDATE metric_calculations SET period='2026-02-30'"), /calculation identity or period/);
  await rejects(t, db => db.exec("UPDATE research SET source_date='2026-02-30'"), /research source date/);
  await rejects(t, db => db.prepare('UPDATE research SET payload=?').run(deflateSync(Buffer.from('synthetic invalid JSON'))), /UTF-8 JSON/);
});

test('research dates use preserved payload dates when the indexed source date is absent', async t => {
  for (const payload of [
    { synthetic: true, report_date: '2026-09-01' },
    { synthetic: true, date: '2026-09-01' },
    { synthetic: true, received_at: '2026-09-01T12:00:00Z' },
  ]) {
    const { store } = await load(t, db => db.prepare('UPDATE research SET payload=?').run(deflateSync(Buffer.from(JSON.stringify(payload)))));
    assert.equal(store.status().undatedResearch, 0);
    assert.deepEqual(store.status().researchDates, [{ value: '2026-09-01', precision: 'day' }]);
    assert.deepEqual(store.research()[0], payload);
  }
});

test('rejects checkout paths and active journals instead of ignoring committed WAL data', async t => {
  await assert.rejects(openLegacyStore(path.join(REPO_ROOT, 'synthetic.sqlite')), /outside the repository/);
  const filename = await syntheticLegacyFixture(t);
  await writeFile(`${filename}-wal`, 'Synthetic journal marker');
  await assert.rejects(openLegacyStore(filename), /active journal/);
  await assert.rejects(assertStandaloneLegacy(filename), /active journal/);
});

test('pins the complete database digest including source tables outside component hashes', async t => {
  const filename = await syntheticLegacyFixture(t);
  const expectedFileHash = createHash('sha256').update(await readFile(filename)).digest('hex');
  const original = await openLegacyStore(filename, { now, expectedFileHash });
  original.close();
  for (const invalid of ['', 'bad', 'A'.repeat(64), null, 1]) {
    await assert.rejects(openLegacyStore(filename, { expectedFileHash: invalid }), /lowercase SHA-256/);
  }
  const editor = new DatabaseSync(filename);
  try { editor.exec("UPDATE sources SET document='Synthetic revised source metadata'"); }
  finally { editor.close(); }
  await assert.rejects(openLegacyStore(filename, { now, expectedFileHash }), /pinned snapshot digest/);
  const changed = await openLegacyStore(filename, { now });
  assert.equal(changed.status().validation.componentHashes, 'verified');
  changed.close();
});

test('standalone preflight rejects a source with committed WAL changes before it can be copied', async t => {
  const filename = await syntheticLegacyFixture(t);
  const writer = new DatabaseSync(filename);
  try {
    writer.exec("PRAGMA journal_mode=WAL; UPDATE sources SET document='Synthetic committed WAL revision';");
    await assert.rejects(assertStandaloneLegacy(filename), /active journal/);
    await assert.rejects(openLegacyStore(filename), /active journal/);
  } finally { writer.close(); }
  assert.equal(await assertStandaloneLegacy(filename), filename);
});

test('portable platform uses a verified private copy with stable observations and complete cleanup', async t => {
  const filename = await syntheticLegacyFixture(t);
  const temporaryDirectory = path.dirname(filename);
  const originalBytes = await readFile(filename);
  const expectedFileHash = createHash('sha256').update(originalBytes).digest('hex');
  const store = await openLegacyStore(filename, { now, platform: 'win32', temporaryDirectory, expectedFileHash });
  t.after(() => store.close());
  const entries = await readdir(temporaryDirectory);
  const temporary = entries.find(name => name.startsWith('market-structure-readonly-'));
  assert.ok(temporary, 'portable branch creates its own exclusive snapshot directory');
  assert.deepEqual(await readdir(path.join(temporaryDirectory, temporary)), ['snapshot.sqlite']);
  assert.deepEqual(await readFile(path.join(temporaryDirectory, temporary, 'snapshot.sqlite')), originalBytes);
  assert.equal(store.snapshot().components.DB.rows[0].value, 10);
  assert.deepEqual(await readFile(filename), originalBytes, 'loading never writes the source');
  const editor = new DatabaseSync(filename);
  try { editor.exec("UPDATE sources SET document='Synthetic later source revision'"); }
  finally { editor.close(); }
  assert.equal(store.observations().rows[0].sourceDocument, 'Synthetic document', 'queries stay on the verified process snapshot');
  store.close();
  store.close();
  assert.deepEqual(await readdir(temporaryDirectory), ['synthetic.sqlite']);
});

test('portable snapshot cleanup covers digest errors, validation errors and forbidden temporary paths', async t => {
  const filename = await syntheticLegacyFixture(t);
  const temporaryDirectory = path.dirname(filename);
  const options = { now, platform: 'win32', temporaryDirectory };
  await assert.rejects(openLegacyStore(filename, { ...options, expectedFileHash: '0'.repeat(64) }), /pinned snapshot digest/);
  assert.deepEqual(await readdir(temporaryDirectory), ['synthetic.sqlite']);
  await assert.rejects(openLegacyStore(filename, { ...options, maxComponentBytes: 8 }), /size limit/);
  assert.deepEqual(await readdir(temporaryDirectory), ['synthetic.sqlite']);
  await assert.rejects(openLegacyStore(filename, { ...options, temporaryDirectory: REPO_ROOT }), /outside the repository/);
  await writeFile(`${filename}-wal`, 'Synthetic active WAL marker');
  await assert.rejects(openLegacyStore(filename, options), /active journal/);
  assert.deepEqual((await readdir(temporaryDirectory)).sort(), ['synthetic.sqlite', 'synthetic.sqlite-wal']);
});

test('rejects virtualized required tables and reports future dates without calling snapshots live', async t => {
  await rejects(t, db => db.exec('ALTER TABLE research RENAME TO hidden_research; CREATE VIEW research AS SELECT * FROM hidden_research;'), /replaced by views/);
  const { store } = await load(t, db => db.exec("UPDATE observations SET as_of='2027-01-01' WHERE observation_id='synthetic-daily'"));
  assert.equal(store.status().futureDates, 1);
  assert.equal(store.status().seriesCoverage[JSON.stringify(['CME', 'synthetic-volume', 'daily'])].latestAsOf, null);
  assert.equal(store.status().seriesCoverage[JSON.stringify(['CME', 'synthetic-volume', 'daily'])].status, 'missing');
  assert.equal(store.status().coverage.CME.latestAsOf, '2026-08');
  assert.equal(store.status().asOf, '2026-08');
  assert.ok(store.status().validation.warnings.some(message => message.includes('future')));
  assert.equal(store.status().refresh.live, false);
});

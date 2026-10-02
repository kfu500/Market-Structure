import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { deflateSync } from 'node:zlib';
import { DatabaseSync } from 'node:sqlite';
import { openLegacyStore } from '../src/legacy-store.js';
import { openBrowserStore } from '../browser/sqlite-store.js';
import { syntheticLegacyFixture, setSyntheticComponent } from './helpers/legacy-fixture.js';

const require = createRequire(import.meta.url);
const wasmBytes = await readFile(require.resolve('sql.js/dist/sql-wasm.wasm'));
const now = new Date('2026-10-02T12:00:00Z');
const plain = value => JSON.parse(JSON.stringify(value));

async function openFixture(t, mutate, options = {}) {
  const filename = await syntheticLegacyFixture(t, mutate);
  const bytes = await readFile(filename);
  const store = await openBrowserStore(bytes, { wasmBytes, now, ...options });
  t.after(() => store.close());
  return { filename, bytes, store };
}

// Every fixture in this suite is synthetic. Production browser checks may load
// external private snapshots, but their contents never become fixtures.
test('browser SQLite preserves the full validated Node snapshot and paginated history', async t => {
  const { filename, bytes, store } = await openFixture(t);
  const original = await readFile(filename);
  const nodeStore = await openLegacyStore(filename, { now });
  t.after(() => nodeStore.close());
  const browserSnapshot = plain(store.snapshot());
  assert.equal(browserSnapshot.manifest.storage, 'browser-memory');
  browserSnapshot.manifest.storage = 'external';
  assert.deepEqual(browserSnapshot, plain(nodeStore.snapshot()));
  for (const filter of [{}, { entity: 'CME', limit: 2 }, { frequency: 'monthly' }, { metricId: 'synthetic-volume', offset: 2 }, { entity: "' OR 1=1 --" }]) {
    assert.deepEqual(store.observations(filter), nodeStore.observations(filter));
  }
  assert.equal(store.status().refresh.live, false);
  assert.equal(store.status().quarantined.length, 1);
  assert.equal(store.status().ambiguousUnits, 1);
  assert.equal(store.status().monthPrecisionDates, 1);
  assert.equal(store.snapshot(), store.snapshot());
  assert.equal(store.component('__proto__'), undefined);
  assert.throws(() => { store.snapshot().components.DB.rows[0].value = 100; }, TypeError);
  assert.throws(() => store.observations({ limit: 1001 }), /limit/);
  assert.throws(() => store.observations({ offset: -1 }), /offset/);
  assert.deepEqual(bytes, original, 'loading leaves selected bytes unchanged');
  assert.deepEqual(Object.keys(store).sort(), ['close', 'component', 'observations', 'research', 'snapshot', 'status']);
  store.close();
  store.close();
  assert.throws(() => store.observations(), /closed/);
});

test('browser rejects malformed typed history, units, dates, calculations, references and duplicates', async t => {
  for (const [name, mutate, pattern] of [
    ['typed mismatch', db => db.exec("UPDATE observations SET value=999 WHERE observation_id='synthetic-daily'"), /typed observation and component value disagree/],
    ['duplicate', db => db.exec("UPDATE observations SET frequency='daily' WHERE observation_id='synthetic-monthly'"), /duplicate metric, period and frequency/],
    ['missing unit', db => db.exec("UPDATE observations SET unit='' WHERE observation_id='synthetic-daily'"), /unit is missing/],
    ['invalid date', db => db.exec("UPDATE observations SET period='2026-02-30' WHERE observation_id='synthetic-daily'"), /Gregorian/],
    ['missing date', db => db.exec("UPDATE observations SET period=NULL WHERE observation_id='synthetic-daily'"), /date is missing/],
    ['invalid frequency', db => db.exec("UPDATE observations SET frequency='invalid' WHERE observation_id='synthetic-daily'"), /frequency/],
    ['missing value', db => db.exec("UPDATE observations SET value=NULL WHERE observation_id='synthetic-daily'"), /not finite/],
    ['invalid pointer', db => db.exec(`UPDATE observations SET pointer='["__proto__","value"]' WHERE observation_id='synthetic-daily'`), /pointer/],
    ['foreign key', db => { db.exec('PRAGMA foreign_keys=OFF'); db.exec("UPDATE observations SET component='synthetic-missing' WHERE observation_id='synthetic-daily'"); }, /foreign key/],
    ['calculation unit', db => db.exec("UPDATE metric_calculations SET growth_unit='USD'"), /growth unit/],
    ['calculation date', db => db.exec("UPDATE metric_calculations SET period='2026-02-30'"), /calculation identity or period/],
    ['research date', db => db.exec("UPDATE research SET source_date='2026-02-30'"), /research source date/],
    ['view substitution', db => db.exec('ALTER TABLE research RENAME TO hidden_research; CREATE VIEW research AS SELECT * FROM hidden_research;'), /replaced by views/],
  ]) {
    await t.test(name, async t => {
      const filename = await syntheticLegacyFixture(t, mutate);
      await assert.rejects(openBrowserStore(await readFile(filename), { wasmBytes, now }), pattern);
    });
  }
});

test('browser bounds decompression and verifies component SHA-256 and zlib checksum', async t => {
  for (const [mutate, options, pattern] of [
    [db => db.exec("UPDATE components SET sha256='bad' WHERE name='DB'"), {}, /SHA-256/],
    [db => db.prepare("UPDATE components SET payload=? WHERE name='DB'").run(Buffer.from('synthetic corrupt payload')), {}, /decompressed/],
    [db => { const compressed = deflateSync(Buffer.from('{"synthetic":true}')); compressed[compressed.length - 1] ^= 1; db.prepare('UPDATE research SET payload=?').run(compressed); }, {}, /decompressed/],
    [db => db.prepare('UPDATE research SET payload=?').run(deflateSync(Buffer.from('synthetic invalid JSON'))), {}, /UTF-8 JSON/],
    [undefined, { maxComponentBytes: 8 }, /size limit/],
    [undefined, { maxTotalBytes: 8 }, /total size limit/],
    [(db, components) => { components.DB.syntheticLarge = 'S'.repeat(2 * 1024 * 1024); setSyntheticComponent(db, 'DB', components.DB); }, { maxComponentBytes: 1024 }, /size limit/],
  ]) {
    const filename = await syntheticLegacyFixture(t, mutate);
    await assert.rejects(openBrowserStore(await readFile(filename), { wasmBytes, now, ...options }), pattern);
  }
});

test('browser preserves valid payloads across multiple bounded decompression chunks', async t => {
  const syntheticLarge = 'Synthetic long UTF-8 payload: € ✓ '.repeat(100000);
  const { store } = await openFixture(t, (db, components) => {
    components.DB.syntheticLarge = syntheticLarge;
    setSyntheticComponent(db, 'DB', components.DB);
  });
  assert.equal(store.component('DB').syntheticLarge, syntheticLarge);
  assert.equal(store.status().validation.componentHashes, 'verified');
});

test('browser rejects WAL-mode base files when adjacent committed changes cannot be selected', async t => {
  const filename = await syntheticLegacyFixture(t);
  const writer = new DatabaseSync(filename);
  try {
    writer.exec("PRAGMA journal_mode=WAL; UPDATE sources SET document='Synthetic committed WAL revision';");
    await assert.rejects(openBrowserStore(await readFile(filename), { wasmBytes, now }), /WAL/);
  } finally { writer.close(); }
});

test('browser validates input size, SQLite header, WASM presence, and dates before exposure', async t => {
  const filename = await syntheticLegacyFixture(t);
  const bytes = await readFile(filename);
  await assert.rejects(openBrowserStore(bytes, { now }), /WebAssembly bytes/);
  await assert.rejects(openBrowserStore(new Uint8Array(100), { wasmBytes, now }), /standalone SQLite/);
  await assert.rejects(openBrowserStore(bytes, { wasmBytes, maxDatabaseBytes: 100 }), /size limit/);
  await assert.rejects(openBrowserStore(bytes, { wasmBytes, now: new Date('invalid') }), /valid validation date/);
  await assert.rejects(openBrowserStore(bytes, { wasmBytes, maxTotalBytes: -1 }), /Positive payload size limits/);
});

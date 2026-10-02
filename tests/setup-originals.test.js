import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { crc32 } from 'node:zlib';
import { fileIdentity, writeReviewedPresentation, assertSourceComponents, setupFromOriginals } from '../scripts/setup-from-originals.js';
import { portHtml } from '../scripts/port-legacy-ui.js';
import { REPO_ROOT } from '../src/storage.js';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'synthetic-local-setup-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

function syntheticStoredZip(name, content) {
  const filename = Buffer.from(name), bytes = Buffer.from(content);
  const local = Buffer.alloc(30), central = Buffer.alloc(46), end = Buffer.alloc(22);
  local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4);
  local.writeUInt32LE(crc32(bytes), 14); local.writeUInt32LE(bytes.length, 18);
  local.writeUInt32LE(bytes.length, 22); local.writeUInt16LE(filename.length, 26);
  central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
  central.writeUInt32LE(crc32(bytes), 16); central.writeUInt32LE(bytes.length, 20);
  central.writeUInt32LE(bytes.length, 24); central.writeUInt16LE(filename.length, 28);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + filename.length, 12);
  end.writeUInt32LE(local.length + filename.length + bytes.length, 16);
  return Buffer.concat([local, filename, bytes, central, filename, end]);
}

test('source coherence compares every component and calculation value, allowing null-prototype store maps', () => {
  const calculations = { CME: { 'Synthetic volume': { '2026-01': { yoy: 12, seq_pct: null, acceleration_pp: null, growth_unit: 'percent' } } } };
  const ported = { components: { DB: { synthetic: true, value: 17 }, metricCalculations: calculations, databaseManifest: { synthetic: true } } };
  const map = Object.assign(Object.create(null), calculations);
  const snapshot = { components: { DB: { synthetic: true, value: 17 } }, metricCalculations: map };
  assert.doesNotThrow(() => assertSourceComponents(ported, snapshot));
  ported.components.metricCalculations.CME['Synthetic empty metric'] = {};
  const noEmptyContainer = structuredClone(snapshot);
  delete noEmptyContainer.metricCalculations.CME['Synthetic empty metric'];
  assert.doesNotThrow(() => assertSourceComponents(ported, noEmptyContainer));
  for (const mutate of [
    value => { value.components.DB.value = 18; },
    value => { value.components.extra = { synthetic: true }; },
    value => { delete value.components.DB; },
    value => { value.metricCalculations.CME['Synthetic volume']['2026-01'].yoy = null; },
    value => { delete value.metricCalculations.CME; },
  ]) {
    const changed = structuredClone(snapshot); mutate(changed);
    assert.throws(() => assertSourceComponents(ported, changed), /different snapshots|calculation records/);
  }
});

test('private presentation is written only after every generated module matches reviewed code exactly', async t => {
  const root = await fixture(t);
  const code = path.join(root, 'reviewed-code'); await mkdir(code);
  const ported = portHtml('<!doctype html><html><head><style>p{color:navy}</style></head><body><p>Synthetic private caption</p><script>window.synthetic = "Synthetic private literal";</script></body></html>');
  for (const [name, content] of ported.codes) await writeFile(path.join(code, name), content);
  const target = path.join(root, 'presentation');
  await writeReviewedPresentation(ported, target, code);
  assert.match(await readFile(path.join(target, 'ui-content.json'), 'utf8'), /Synthetic private literal/);
  assert.equal([...ported.codes.values()].some(value => value.includes('Synthetic private literal')), false);
  const first = [...ported.codes.keys()][0];
  await writeFile(path.join(code, first), '// Synthetic changed executable');
  const rejected = path.join(root, 'rejected');
  await assert.rejects(writeReviewedPresentation(ported, rejected, code), /reviewed application code/);
  assert.equal((await readdir(root)).includes('rejected'), false);
  await writeFile(path.join(code, 'module-099.js'), '// Synthetic additional reviewed module');
  await assert.rejects(writeReviewedPresentation(ported, rejected, code), /reviewed application modules/);
});

test('setup refuses existing private storage and in-repository destinations without changing inputs', async t => {
  const root = await fixture(t);
  const html = path.join(root, 'original.html');
  const database = path.join(root, 'original.zip');
  const output = path.join(root, 'private');
  await writeFile(html, '<html>Synthetic original</html>');
  await writeFile(database, 'Synthetic placeholder archive');
  await mkdir(output); await writeFile(path.join(output, 'keep.txt'), 'Synthetic existing data');
  const before = [await fileIdentity(html), await fileIdentity(database)];
  await assert.rejects(setupFromOriginals({ html, database, output, message() {} }), /already exists/);
  assert.equal(await readFile(path.join(output, 'keep.txt'), 'utf8'), 'Synthetic existing data');
  await assert.rejects(setupFromOriginals({ html, database, output: path.join(REPO_ROOT, 'forbidden-synthetic-private'), message() {} }), /outside the repository/);
  assert.deepEqual([await fileIdentity(html), await fileIdentity(database)], before);
});

test('failed archive processing leaves originals and sibling files intact and removes owned staging', async t => {
  const root = await fixture(t);
  const html = path.join(root, 'original.html');
  const database = path.join(root, 'original.zip');
  await writeFile(html, '<html>Synthetic original preserved</html>');
  await writeFile(database, 'Synthetic invalid ZIP; never executable');
  const before = await readdir(root);
  const hashes = [await fileIdentity(html), await fileIdentity(database)];
  await assert.rejects(setupFromOriginals({ html, database, output: path.join(root, 'new-private'), message() {} }));
  assert.deepEqual(await readdir(root), before);
  assert.deepEqual([await fileIdentity(html), await fileIdentity(database)], hashes);
});

test('missing or duplicate database part indices fail without producing a private runtime', async t => {
  const root = await fixture(t);
  const html = path.join(root, 'original.html');
  await writeFile(html, '<html>Synthetic original</html>');
  const parts = path.join(root, 'parts'); await mkdir(parts);
  await writeFile(path.join(parts, 'Market_Structure_Database_Part_2_of_4.zip'), 'Synthetic part placeholder');
  await assert.rejects(setupFromOriginals({ html, database: parts, output: path.join(root, 'new-private'), message() {} }), /complete, consecutively numbered/);
  assert.equal((await readdir(root)).some(name => name.startsWith('.market-structure-setup') || name === 'new-private'), false);
  assert.deepEqual(await readdir(parts), ['Market_Structure_Database_Part_2_of_4.zip']);
});

test('CLI syntax failures do not print source snippets and leave no private output', async t => {
  const root = await fixture(t);
  const html = path.join(root, 'original.html');
  const database = path.join(root, 'original.zip');
  const output = path.join(root, 'private');
  await writeFile(html, '<html><script>const DB = {"SYNTHETIC_PRIVATE_ERROR_MARKER": };</script></html>');
  await writeFile(database, syntheticStoredZip('data/Market_Structure.sqlite', 'Synthetic unexamined database placeholder'));
  const result = spawnSync(process.execPath, [path.join(REPO_ROOT, 'scripts/setup-from-originals.js'), '--html', html, '--database', database, '--output', output], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Source metadata could not be parsed/);
  assert.equal((result.stdout + result.stderr).includes('SYNTHETIC_PRIVATE_ERROR_MARKER'), false);
  assert.deepEqual((await readdir(root)).sort(), ['original.html', 'original.zip']);
});

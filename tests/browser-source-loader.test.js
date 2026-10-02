import test from 'node:test';
import assert from 'node:assert/strict';
import { zipSync, strToU8 } from 'fflate';
import { createHash } from 'node:crypto';
import { portHtml as nodePortHtml } from '../scripts/port-legacy-ui.js';
import { assertReviewedModules, assertSourceComponents, loadOriginalSources, portHtml } from '../browser/source-loader.js';
import { extractSourceZipMember, openSourceZip } from '../browser/zip-reader.js';

// All source content and database bytes in these tests are explicitly synthetic.
const syntheticHtml = '<html><body><script>window.synthetic = "synthetic source value";</script></body></html>';
const syntheticDatabase = () => {
  const bytes = new Uint8Array(128);
  bytes.set(strToU8('SQLite format 3\0'));
  return bytes;
};
const file = (name, bytes) => new File([bytes], name);
const archive = (members, level = 6) => new Blob([zipSync(members, { level })]);
const reviewed = () => Object.fromEntries(portHtml(syntheticHtml).codes);

test('browser static source separation exactly matches the Node maintenance parser', () => {
  const actual = portHtml(syntheticHtml);
  assert.deepEqual(actual, nodePortHtml(syntheticHtml));
  assertReviewedModules(actual, reviewed());
  assert.throws(() => assertReviewedModules(actual, {}), /does not match/);
  assert.throws(() => assertReviewedModules(portHtml(syntheticHtml.replace('window.synthetic', 'window.different')), reviewed()), /does not match/);
});

test('local HTML and database ZIP are read without executing source and preserve source bytes', async () => {
  const html = file('synthetic.html', syntheticHtml);
  const bytes = zipSync({ 'data/Market_Structure.sqlite': syntheticDatabase(), 'ignored/synthetic-report.txt': strToU8('synthetic unused report') });
  const database = file('synthetic-database.zip', bytes);
  const result = await loadOriginalSources({ htmlFile: html, databaseFile: database, reviewedModules: reviewed() });
  assert.deepEqual(result.databaseBytes, syntheticDatabase());
  assert.equal(result.sourceHashes.html.size, html.size);
  assert.match(result.sourceHashes.sqlite.sha256, /^[a-f0-9]{64}$/);
  assert.equal(globalThis.synthetic, undefined);
  assert.deepEqual(new Uint8Array(await database.arrayBuffer()), bytes);
});

test('changed executable source and active network capabilities are rejected before use', async () => {
  const databaseFile = file('synthetic.sqlite', syntheticDatabase());
  await assert.rejects(loadOriginalSources({ htmlFile: file('synthetic.html', '<script>window.different = 1;</script>'), databaseFile, reviewedModules: reviewed() }), /does not match/);
  await assert.rejects(loadOriginalSources({ htmlFile: file('synthetic.html', '<script>fetch("https://invalid.example/")</script>'), databaseFile, reviewedModules: reviewed() }), /Unsupported executable capability/);
});

test('ZIP reader rejects unsafe paths, duplicate names and malformed directories', async () => {
  await assert.rejects(openSourceZip(archive({ '../synthetic.html': strToU8('synthetic') })), /unsafe filename/);
  await assert.rejects(openSourceZip(archive({ 'C:/synthetic.html': strToU8('synthetic') })), /unsafe filename/);
  await assert.rejects(openSourceZip(archive({ 'Synthetic.txt': strToU8('one'), 'synthetic.txt': strToU8('two') })), /duplicate filenames/);
  await assert.rejects(openSourceZip(new Blob([new Uint8Array(100)])), /incomplete or malformed/);
});

test('ZIP reads enforce declared sizes, extraction limits and CRC integrity', async () => {
  const valid = await openSourceZip(archive({ 'synthetic.txt': strToU8('synthetic data') }));
  await assert.rejects(extractSourceZipMember(valid, 'synthetic.txt', { maxBytes: 3 }), /size limit/);
  await assert.rejects(extractSourceZipMember(valid, 'missing.txt', { maxBytes: 100 }), /missing/);
  const bytes = new Uint8Array(await archive({ 'synthetic.txt': strToU8('synthetic data') }, 0).arrayBuffer());
  bytes[30 + 'synthetic.txt'.length] ^= 1;
  const corrupt = await openSourceZip(new Blob([bytes]));
  await assert.rejects(extractSourceZipMember(corrupt, 'synthetic.txt', { maxBytes: 100 }), /CRC integrity/);
  const compressed = zipSync({ 'synthetic.txt': strToU8('synthetic data that exceeds the claimed length') });
  const view = new DataView(compressed.buffer);
  view.setUint32(22, 1, true);
  for (let i = 30; i < compressed.length - 46; i++) {
    if (view.getUint32(i, true) === 0x02014b50) { view.setUint32(i + 24, 1, true); break; }
  }
  const undersized = await openSourceZip(new Blob([compressed]));
  await assert.rejects(extractSourceZipMember(undersized, 'synthetic.txt', { maxBytes: 100 }), /beyond its declared size/);
});

test('HTML ZIP source manifests must match selected HTML and archive', async () => {
  const database = file('synthetic.sqlite', syntheticDatabase());
  const wrapped = file('synthetic-html.zip', zipSync({ 'synthetic.html': strToU8(syntheticHtml), 'portal_source_manifest.json': strToU8(JSON.stringify({ html: { size_bytes: 1, sha256: '0'.repeat(64) } })) }));
  await assert.rejects(loadOriginalSources({ htmlFile: wrapped, databaseFile: database, reviewedModules: reviewed() }), /does not match the source manifest/);
  const many = file('synthetic-html.zip', zipSync({ 'one.html': strToU8(syntheticHtml), 'two.html': strToU8(syntheticHtml) }));
  await assert.rejects(loadOriginalSources({ htmlFile: many, databaseFile: database, reviewedModules: reviewed() }), /exactly one HTML/);
});

test('valid HTML manifests also enforce the matching complete database archive checksum', async () => {
  const databaseBytes = zipSync({ 'data/Market_Structure.sqlite': syntheticDatabase() });
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const wrapped = file('synthetic-html.zip', zipSync({
    'synthetic.html': strToU8(syntheticHtml),
    'portal_source_manifest.json': strToU8(JSON.stringify({ html: { size_bytes: strToU8(syntheticHtml).length, sha256: hash(syntheticHtml) }, database: { size_bytes: databaseBytes.length, sha256: hash(databaseBytes) } })),
  }));
  const options = { htmlFile: wrapped, reviewedModules: reviewed() };
  await assert.doesNotReject(loadOriginalSources({ ...options, databaseFile: file('synthetic.zip', databaseBytes) }));
  await assert.rejects(loadOriginalSources({ ...options, databaseFile: file('synthetic.zip', zipSync({ 'data/Market_Structure.sqlite': syntheticDatabase(), 'extra-synthetic.txt': strToU8('synthetic') })) }), /database archive does not match/);
  await assert.rejects(loadOriginalSources({ ...options, databaseFile: file('synthetic.sqlite', syntheticDatabase()) }), /declares an original database archive/);
});

test('all numbered original database wrappers reconstruct and validate without executing their contents', async () => {
  const bytes = zipSync({ 'data/Market_Structure.sqlite': syntheticDatabase() });
  const cut = Math.floor(bytes.length / 2);
  const partsFiles = [bytes.slice(0, cut), bytes.slice(cut)].map((part, index) => file(`Market_Structure_Database_Part_${index + 1}_of_2.zip`, zipSync({ [`Market_Structure_Database.zip.part00${index + 1}`]: part })));
  const options = { htmlFile: file('synthetic.html', syntheticHtml), partsFiles, reviewedModules: reviewed() };
  const result = await loadOriginalSources(options);
  assert.deepEqual(result.databaseBytes, syntheticDatabase());
  assert.equal(result.sourceHashes.databaseParts.length, 2);
  await assert.rejects(loadOriginalSources({ ...options, partsFiles: partsFiles.slice(0, 1) }), /every database-part/);
  await assert.rejects(loadOriginalSources({ ...options, partsFiles: [partsFiles[0], partsFiles[0]] }), /every database-part/);
});

test('HTML and database comparison requires identical records but allows empty containers', () => {
  const components = { DB: { synthetic: [1, null, 'synthetic'] } };
  const calculations = { SYN: { synthetic: { '2025-01': { value: 2, unit: 'count' } } } };
  const snapshot = { components, metricCalculations: calculations };
  assert.doesNotThrow(() => assertSourceComponents({ components: { ...components, metricCalculations: { ...calculations, EMPTY: {} }, databaseManifest: {} } }, snapshot));
  assert.throws(() => assertSourceComponents({ components: { DB: {}, metricCalculations: calculations } }, snapshot), /different snapshots/);
  assert.throws(() => assertSourceComponents({ components: { ...components, metricCalculations: { SYN: { synthetic: { '2025-01': { value: 3, unit: 'count' } } } } } }, snapshot), /calculation records/);
});

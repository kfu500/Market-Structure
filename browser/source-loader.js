/** Local originals become private browser memory. Uploaded scripts are never evaluated. */
import { sha256 } from '@noble/hashes/sha2.js';
import { portHtml as portHtmlCore } from '../src/legacy-port-core.js';
import { extractSourceZipMember, MAX_ARCHIVE_BYTES, openSourceZip, readBlobRange } from './zip-reader.js';

const HTML_LIMIT = 96 * 1024 ** 2;
const SQLITE_LIMIT = 512 * 1024 ** 2;
const MANIFEST_LIMIT = 1024 ** 2;
const PART_NAME = /^Market_Structure_Database\.zip\.part(\d{3})$/;
const WRAPPER_NAME = /^Market_Structure_Database_Part_(\d+)_of_(\d+)\.zip$/i;
const fail = message => { throw new Error(message); };
const hex = bytes => [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
const encoder = new TextEncoder();
const decode = bytes => new TextDecoder('utf-8', { fatal: true }).decode(bytes);
const digest = bytes => hex(sha256(bytes));
export const portHtml = html => portHtmlCore(html, { hash: text => digest(encoder.encode(text)) });

async function identity(blob, limit = MAX_ARCHIVE_BYTES) {
  if (!blob || !Number.isSafeInteger(blob.size) || blob.size <= 0 || blob.size > limit || typeof blob.slice !== 'function') fail('Choose an original file within the supported size limit.');
  const hasher = sha256.create();
  for (let offset = 0; offset < blob.size; offset += 1024 ** 2) hasher.update(await readBlobRange(blob, offset, Math.min(1024 ** 2, blob.size - offset)));
  return { size: blob.size, sha256: hex(hasher.digest()) };
}

function declaredMatches(actual, declared) {
  return declared && declared.size_bytes === actual.size && declared.sha256 === actual.sha256;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const left = Object.keys(a), right = Object.keys(b);
  return left.length === right.length && left.every(key => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
}

/** All executable modules must be the exact reviewed code bundled with this application. */
export function assertReviewedModules(ported, reviewedModules) {
  const modules = reviewedModules instanceof Map ? reviewedModules : new Map(Object.entries(reviewedModules ?? {}));
  if (!modules.size || ported.codes.size !== modules.size || [...ported.codes].some(([name, code]) => !modules.has(name) || modules.get(name) !== code)) {
    fail('This HTML version does not match the reviewed portal code. Its scripts were not run. Use the matching original HTML, or have this version reviewed before updating the application.');
  }
}

/** Compare actual records, allowing SQLite to omit empty metric/company containers. */
export function assertSourceComponents(ported, snapshot) {
  const names = Object.keys(ported.components).filter(name => !['metricCalculations', 'databaseManifest'].includes(name));
  if (!deepEqual([...names].sort(), Object.keys(snapshot.components).sort()) || names.some(name => !deepEqual(ported.components[name], snapshot.components[name]))) fail('The portal HTML and database are different snapshots. Choose the matching original files.');
  const rows = calculations => {
    const entries = value => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Calculation maps have an unsupported structure.');
      return Object.entries(value);
    };
    const result = [];
    for (const [company, metrics] of entries(calculations)) for (const [metric, periods] of entries(metrics)) for (const [period, value] of entries(periods)) result.push({ key: JSON.stringify([company, metric, period]), value });
    return result.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
  };
  if (!deepEqual(rows(ported.components.metricCalculations), rows(snapshot.metricCalculations))) fail('The HTML and database calculation records do not match.');
}

async function loadHtml(file) {
  const original = await identity(file, /\.html?$/i.test(file?.name ?? '') ? HTML_LIMIT : MAX_ARCHIVE_BYTES);
  if (/\.html?$/i.test(file.name)) {
    const bytes = await readBlobRange(file, 0, file.size);
    return { html: decode(bytes), htmlIdentity: original, original };
  }
  if (!/\.zip$/i.test(file.name ?? '')) fail('Choose the original HTML file or its Portal_HTML ZIP.');
  const archive = await openSourceZip(file);
  const htmlEntries = archive.entries.filter(entry => !entry.directory && /\.html?$/i.test(entry.name));
  if (htmlEntries.length !== 1) fail('The portal ZIP must contain exactly one HTML file.');
  const bytes = await extractSourceZipMember(archive, htmlEntries[0].name, { maxBytes: HTML_LIMIT });
  const htmlIdentity = { size: bytes.length, sha256: digest(bytes) };
  let declared;
  if (archive.entries.some(entry => entry.name === 'portal_source_manifest.json')) {
    declared = JSON.parse(decode(await extractSourceZipMember(archive, 'portal_source_manifest.json', { maxBytes: MANIFEST_LIMIT })));
    if (!declaredMatches(htmlIdentity, declared.html)) fail('The HTML does not match the source manifest in its original ZIP.');
  }
  return { html: decode(bytes), htmlIdentity, original, declared };
}

async function assembleParts(files, onProgress) {
  const wrappers = Array.from(files ?? []).map(file => {
    const match = WRAPPER_NAME.exec(file.name ?? '');
    if (!match) fail('Select only the complete numbered set of original database-part ZIPs.');
    return { file, index: Number(match[1]), total: Number(match[2]) };
  }).sort((a, b) => a.index - b.index);
  if (!wrappers.length || wrappers.length > 20 || wrappers.some((part, index) => part.index !== index + 1 || part.total !== wrappers.length)) fail('Select every database-part ZIP, with no duplicates or missing numbers.');
  const chunks = [], inputs = [];
  let total = 0;
  for (const wrapper of wrappers) {
    onProgress(`Checking database part ${wrapper.index} of ${wrappers.length}…`);
    inputs.push(await identity(wrapper.file));
    const archive = await openSourceZip(wrapper.file);
    const member = archive.entries[0];
    if (archive.entries.length !== 1 || member.directory || !PART_NAME.test(member.name) || Number(PART_NAME.exec(member.name)[1]) !== wrapper.index) fail('A database ZIP part contains an unexpected member or sequence.');
    const bytes = await extractSourceZipMember(archive, member.name, { maxBytes: 32 * 1024 ** 2 });
    total += bytes.length;
    if (total > MAX_ARCHIVE_BYTES) fail('The assembled database archive exceeds the supported limit.');
    chunks.push(bytes);
  }
  return { blob: new Blob(chunks, { type: 'application/zip' }), inputs };
}

/** Returns verified local data only; the caller validates SQLite rows before rendering. */
export async function loadOriginalSources({ htmlFile, databaseFile, partsFiles, onProgress = () => {}, reviewedModules }) {
  onProgress('Reading the original HTML without running its scripts…');
  const html = await loadHtml(htmlFile);
  onProgress('Checking the HTML against the reviewed application code…');
  const ported = portHtml(html.html);
  assertReviewedModules(ported, reviewedModules);
  // Release the large source string as soon as static separation has completed.
  html.html = undefined;
  const selectedParts = Array.from(partsFiles ?? []);
  if (selectedParts.length && databaseFile) fail('Choose either a complete database file or the numbered ZIP parts.');
  let database, inputs;
  if (selectedParts.length) ({ blob: database, inputs } = await assembleParts(selectedParts, onProgress));
  else {
    if (!databaseFile) fail('Choose the matching complete database ZIP or all numbered database-part ZIPs.');
    database = databaseFile;
    inputs = [await identity(database)];
  }
  onProgress('Verifying the original database file…');
  const databaseIdentity = selectedParts.length ? await identity(database) : inputs[0];
  const header = await readBlobRange(database, 0, Math.min(16, database.size));
  const isSqlite = header.length === 16 && new TextDecoder().decode(header) === 'SQLite format 3\0';
  // A manifest describes the original archive. An extracted SQLite cannot prove
  // that archive identity, so require the original ZIP whenever it is declared.
  if (html.declared && isSqlite) fail('This HTML ZIP declares an original database archive. Choose that database ZIP or its complete numbered parts so its source checksum can be verified.');
  if (html.declared && !declaredMatches(databaseIdentity, html.declared.database)) fail('The database archive does not match the original portal source manifest.');
  let databaseBytes;
  if (isSqlite) {
    if (database.size > SQLITE_LIMIT) fail('The SQLite database exceeds the browser size limit.');
    databaseBytes = await readBlobRange(database, 0, database.size);
  } else {
    onProgress('Extracting the database into browser memory…');
    const archive = await openSourceZip(database);
    databaseBytes = await extractSourceZipMember(archive, 'data/Market_Structure.sqlite', { maxBytes: SQLITE_LIMIT });
  }
  if (databaseBytes.length < 100 || new TextDecoder().decode(databaseBytes.subarray(0, 16)) !== 'SQLite format 3\0') fail('The selected database is not a supported SQLite file.');
  const sqliteIdentity = { size: databaseBytes.length, sha256: digest(databaseBytes) };
  return {
    databaseBytes, ported,
    sourceHashes: { schemaVersion: 1, html: html.htmlIdentity, htmlInput: html.original, databaseInput: databaseIdentity, databaseParts: selectedParts.length ? inputs : [], sqlite: sqliteIdentity, refresh: 'not-connected' },
  };
}

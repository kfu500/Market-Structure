#!/usr/bin/env node
/** Build external private storage from original local uploads. Never execute source HTML. */
import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp, open, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { externalPath, isWithin, REPO_ROOT } from '../src/storage.js';
import { assertNode24, launchLocal } from './launch-local.js';
import { listSourceZipEntries, extractSourceZipMember } from './reconstruct-recovery.mjs';

const HTML_LIMIT = 96 * 1024 ** 2;
const ARCHIVE_LIMIT = 2 * 1024 ** 3;
const PART_NAME = /^Market_Structure_Database\.zip\.part(\d{3})$/;
const WRAPPER_NAME = /^Market_Structure_Database_Part_(\d+)_of_(\d+)\.zip$/i;
const fail = message => { throw new Error(message); };

async function exists(filename) {
  try { await lstat(filename); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

export async function fileIdentity(filename, limit = ARCHIVE_LIMIT) {
  const info = await lstat(filename);
  if (!info.isFile() || info.isSymbolicLink() || info.size > limit) fail('An original must be an ordinary file within the supported size limit.');
  const handle = await open(filename, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const before = await handle.stat();
    if (before.ino !== info.ino || before.dev !== info.dev || before.size !== info.size) fail('An original changed while being read.');
    const hash = createHash('sha256');
    for await (const chunk of handle.createReadStream({ autoClose: false })) hash.update(chunk);
    const after = await handle.stat();
    const current = await lstat(filename);
    if (after.size !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs || current.isSymbolicLink() || current.ino !== before.ino || current.dev !== before.dev) fail('An original changed while being read.');
    return { size: after.size, sha256: hash.digest('hex') };
  } finally { await handle.close(); }
}

async function copyOriginal(source, target, limit) {
  source = await externalPath(source);
  const before = await fileIdentity(source, limit);
  await copyFile(source, target, constants.COPYFILE_EXCL);
  const handle = await open(target, 'r+');
  try { await handle.chmod(0o600); await handle.sync(); } finally { await handle.close(); }
  if (!isDeepStrictEqual(before, await fileIdentity(target, limit)) || !isDeepStrictEqual(before, await fileIdentity(source, limit))) fail('An original changed during copying.');
  return { input: source, ...before };
}

function matchesDeclared(actual, declared) {
  return declared && declared.size_bytes === actual.size && declared.sha256 === actual.sha256;
}

async function prepareHtml(input, sources) {
  const filename = path.join(sources, 'portal.html');
  if (/\.html?$/i.test(input)) return { filename, inputs: [await copyOriginal(input, filename, HTML_LIMIT)] };
  if (!/\.zip$/i.test(input)) fail('Select the original portal HTML file or its ZIP wrapper.');
  const wrapper = path.join(sources, 'portal-upload.zip');
  const identity = await copyOriginal(input, wrapper, ARCHIVE_LIMIT);
  const entries = await listSourceZipEntries(wrapper);
  const html = entries.filter(entry => !entry.directory && /\.html?$/i.test(entry.name));
  if (html.length !== 1) fail('The portal ZIP must contain exactly one HTML file.');
  await extractSourceZipMember({ archive: wrapper, member: html[0].name, destination: filename, maxBytes: HTML_LIMIT });
  let declared;
  if (entries.some(entry => entry.name === 'portal_source_manifest.json')) {
    const manifestPath = path.join(sources, 'original-source-manifest.json');
    await extractSourceZipMember({ archive: wrapper, member: 'portal_source_manifest.json', destination: manifestPath, maxBytes: 1024 * 1024 });
    declared = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (!matchesDeclared(await fileIdentity(filename, HTML_LIMIT), declared.html)) fail('The portal HTML does not match its original source manifest.');
  }
  // Preserve the selected ZIP byte-for-byte; never run any bundled restore script.
  return { filename, inputs: [identity], declared };
}

async function prepareDatabase(input, sources) {
  const filename = path.join(sources, 'database.zip');
  const sourceInfo = await lstat(input);
  if (!sourceInfo.isDirectory() && !WRAPPER_NAME.test(path.basename(input))) {
    return { filename, inputs: [await copyOriginal(input, filename, ARCHIVE_LIMIT)] };
  }
  const directory = await externalPath(sourceInfo.isDirectory() ? input : path.dirname(input), { directory: true });
  const wrappers = (await readdir(directory)).filter(name => WRAPPER_NAME.test(name)).map(name => {
    const match = WRAPPER_NAME.exec(name);
    return { name, index: Number(match[1]), total: Number(match[2]) };
  }).sort((a, b) => a.index - b.index);
  if (!wrappers.length || wrappers.length > 20 || wrappers.some((part, index) => part.index !== index + 1 || part.total !== wrappers.length)) fail('The database folder must contain one complete, consecutively numbered set of ZIP parts.');
  const inputs = [];
  const output = await open(filename, 'wx', 0o600);
  let total = 0;
  try {
    for (const wrapper of wrappers) {
      const source = await externalPath(path.join(directory, wrapper.name));
      const before = await fileIdentity(source);
      const entries = await listSourceZipEntries(source);
      if (entries.length !== 1 || entries[0].directory || !PART_NAME.test(entries[0].name) || Number(PART_NAME.exec(entries[0].name)[1]) !== wrapper.index) fail('A database ZIP part has an unexpected member or order.');
      const partPath = path.join(sources, `part-${wrapper.index}.tmp`);
      await extractSourceZipMember({ archive: source, member: entries[0].name, destination: partPath, maxBytes: 32 * 1024 ** 2 });
      const handle = await open(partPath, 'r');
      try {
        for await (const chunk of handle.createReadStream({ autoClose: false })) {
          total += chunk.length;
          if (total > ARCHIVE_LIMIT) fail('The assembled database archive exceeds the supported limit.');
          await output.writeFile(chunk);
        }
      } finally { await handle.close(); }
      await rm(partPath);
      if (!isDeepStrictEqual(before, await fileIdentity(source))) fail('A database ZIP part changed during setup.');
      inputs.push({ input: source, ...before });
    }
    await output.sync();
  } finally { await output.close(); }
  return { filename, inputs };
}

/** A changed portal cannot introduce executable code: all modules must match the reviewed repository. */
export async function writeReviewedPresentation(ported, directory, codeRoot = path.join(REPO_ROOT, 'public/legacy')) {
  const expected = (await readdir(codeRoot)).filter(name => /^module-\d{3}\.js$/.test(name)).sort();
  if (!isDeepStrictEqual([...ported.codes.keys()].sort(), expected)) fail('The original HTML does not match the reviewed application modules.');
  for (const [name, code] of ported.codes) {
    if (!(await readFile(path.join(codeRoot, name))).equals(Buffer.from(code))) fail('The original HTML does not match the reviewed application code. Use the matching source version; never bypass this check.');
  }
  await mkdir(directory, { mode: 0o700 });
  for (const [name, value] of Object.entries({ 'ui-content.json': JSON.stringify(ported.content), 'shell.html': ported.shell, 'styles.css': ported.css, 'source-mapping.json': JSON.stringify(ported.mapping, null, 2) })) {
    await writeFile(path.join(directory, name), value, { flag: 'wx', mode: 0o600 });
  }
}

export function assertSourceComponents(ported, snapshot) {
  const names = Object.keys(ported.components).filter(name => !['metricCalculations', 'databaseManifest'].includes(name));
  if (!isDeepStrictEqual([...names].sort(), Object.keys(snapshot.components).sort()) || names.some(name => !isDeepStrictEqual(ported.components[name], snapshot.components[name]))) fail('The portal HTML and database are different snapshots. Use the matching original files.');
  // SQLite stores records, not empty company/metric containers. Preserve the
  // original HTML, but compare all actual records with their complete values.
  const rows = calculations => {
    const result = [];
    const entries = value => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Calculation maps have an unsupported structure.');
      return Object.entries(value);
    };
    for (const [company, metrics] of entries(calculations)) for (const [metric, periods] of entries(metrics)) for (const [period, value] of entries(periods)) {
      result.push({ key: JSON.stringify([company, metric, period]), value: JSON.parse(JSON.stringify(value)) });
    }
    return result.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
  };
  if (!isDeepStrictEqual(rows(ported.components.metricCalculations), rows(snapshot.metricCalculations))) fail('The HTML and database calculation records do not match.');
}

export async function setupFromOriginals({ html, database, output = path.resolve(REPO_ROOT, '..', 'private'), message = console.log }) {
  assertNode24();
  // Lazy import lets the CLI give clear installation help before parsing sources.
  const { portHtml } = await import('./port-legacy-ui.js');
  const { openLegacyStore } = await import('../src/legacy-store.js');
  const { importLegacy } = await import('./import-legacy.js');
  html = await externalPath(path.resolve(html));
  database = await externalPath(path.resolve(database));
  output = await externalPath(path.resolve(output));
  const parent = await externalPath(path.dirname(output), { directory: true });
  if (await exists(output)) fail('The private destination already exists. Choose a new folder; existing data will not be replaced.');
  if (isWithin(output, html) || isWithin(output, database)) fail('Keep original inputs outside the new private destination.');
  const stage = await mkdtemp(path.join(parent, '.market-structure-setup-'));
  let ownedOutput;
  try {
    const sources = path.join(stage, 'sources');
    await mkdir(sources, { mode: 0o700 });
    message('Checking and preserving the original files locally...');
    const portalSource = await prepareHtml(html, sources);
    const databaseSource = await prepareDatabase(database, sources);
    const databaseIdentity = await fileIdentity(databaseSource.filename);
    if (portalSource.declared && !matchesDeclared(databaseIdentity, portalSource.declared.database)) fail('The database archive does not match the original portal source manifest.');
    const sqlite = path.join(sources, 'source.sqlite');
    await extractSourceZipMember({ archive: databaseSource.filename, member: 'data/Market_Structure.sqlite', destination: sqlite, maxBytes: ARCHIVE_LIMIT });
    message('Comparing the source with the reviewed application and validating the historical data...');
    const ported = portHtml(await readFile(portalSource.filename, 'utf8'));
    const presentation = path.join(stage, 'presentation');
    await writeReviewedPresentation(ported, presentation);
    const store = await openLegacyStore(sqlite);
    try { assertSourceComponents(ported, store.snapshot()); } finally { store.close(); }
    const imported = await importLegacy({ database: sqlite, presentation, dataDir: path.join(stage, 'runtime') });
    await rm(sqlite); // Rebuildable extraction; original ZIP and verified runtime database are preserved.
    await writeFile(path.join(stage, 'setup-manifest.json'), JSON.stringify({ schemaVersion: 1, createdAt: new Date().toISOString(), inputs: [...portalSource.inputs, ...databaseSource.inputs], html: await fileIdentity(portalSource.filename, HTML_LIMIT), databaseArchive: databaseIdentity, release: imported.release, refresh: 'not-connected' }, null, 2), { flag: 'wx', mode: 0o600 });
    // Reserve exclusively. A retry never replaces a pre-existing private folder.
    await externalPath(output);
    await mkdir(output, { mode: 0o700 });
    ownedOutput = await lstat(output);
    for (const name of await readdir(stage)) await rename(path.join(stage, name), path.join(output, name));
    await rm(stage, { recursive: true });
    ownedOutput = undefined;
    message('Private setup completed. Originals are unchanged; no source files were uploaded.');
    return { dataDir: path.join(output, 'runtime'), ...imported };
  } catch (error) {
    if (ownedOutput) {
      const current = await lstat(output).catch(() => null);
      if (current?.isDirectory() && !current.isSymbolicLink() && current.ino === ownedOutput.ino && current.dev === ownedOutput.dev) await rm(output, { recursive: true, force: true });
    }
    await rm(stage, { recursive: true, force: true });
    throw error;
  }
}

function cleanInput(value) {
  const trimmed = value.trim();
  return trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed;
}

async function main() {
  assertNode24();
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/setup-from-originals.js [--html ORIGINAL_HTML_OR_ZIP --database FULL_ZIP_OR_PARTS_FOLDER --output NEW_PRIVATE_FOLDER] [--launch]');
    console.log('Without paths, prompts for the original files. Requires Node 24 and npm ci --ignore-scripts.');
    return;
  }
  const options = {};
  let launch = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--launch') { launch = true; continue; }
    if (!['--html', '--database', '--output'].includes(args[i]) || !args[i + 1] || options[args[i].slice(2)]) fail('Invalid setup arguments. Use --help.');
    options[args[i].slice(2)] = args[++i];
  }
  if (!options.html || !options.database) {
    if (!process.stdin.isTTY) fail('Supply --html and --database paths when not using an interactive terminal.');
    const terminal = createInterface({ input: process.stdin, output: process.stdout });
    try {
      console.log('Choose your ORIGINAL files, outside the application folder. You can paste file paths including surrounding quotes.');
      options.html ||= cleanInput(await terminal.question('Portal HTML file or portal HTML ZIP: '));
      options.database ||= cleanInput(await terminal.question('Complete database ZIP, or folder containing all database-part ZIPs: '));
      if (!options.html || !options.database) fail('Both original inputs are required.');
    } finally { terminal.close(); }
  }
  const result = await setupFromOriginals(options);
  if (launch) {
    const portal = await launchLocal({ dataDir: result.dataDir });
    let stopping = false;
    const stop = async () => { if (!stopping) { stopping = true; await portal.stop(); process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); } };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  } else console.log(`Start with: node scripts/launch-local.js --data-dir ${JSON.stringify(result.dataDir)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof SyntaxError ? 'Source metadata could not be parsed. Use the matching original files.' : error.code === 'ERR_MODULE_NOT_FOUND' ? 'Install the pinned parsers first: npm ci --ignore-scripts --no-audit --no-fund' : error.code ? 'Setup failed. Check the original files, available disk space and folder permissions. Existing files were not replaced.' : error.message);
    process.exitCode = 1;
  });
}

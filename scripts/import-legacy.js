import { constants } from 'node:fs';
import { copyFile, mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { externalPath, isWithin } from '../src/storage.js';
import { openLegacyStore, assertStandaloneLegacy } from '../src/legacy-store.js';
import { validatePresentation } from '../src/legacy-runtime.js';

async function hashFile(filename) {
  const digest = createHash('sha256');
  const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    if (!(await handle.stat()).isFile()) throw new Error('Source must be a regular file.');
    for await (const chunk of handle.createReadStream({ autoClose: false })) digest.update(chunk);
    return digest.digest('hex');
  } finally { await handle.close(); }
}

async function durableWrite(filename, bytes) {
  const handle = await open(filename, 'wx', 0o600);
  try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
}
// Native Windows cannot open/fsync directory handles through this Node API.
// Import calls use the actual platform; injected dependencies exercise both
// branches in synthetic tests without suppressing real POSIX storage failures.
export async function syncDirectory(directory, { platform = process.platform, openDirectory = open } = {}) {
  if (platform === 'win32') return 'not-supported-on-windows';
  const handle = await openDirectory(directory, 'r');
  try { await handle.sync(); } finally { await handle.close(); }
  return 'completed';
}

/** Activate an immutable external copy; preserve the source and older releases. */
export async function importLegacy({ database, presentation, dataDir }) {
  const source = await assertStandaloneLegacy(database);
  const presentationRoot = await externalPath(presentation, { directory: true });
  const root = await externalPath(dataDir, { directory: true, create: true });
  if (isWithin(root, source) || isWithin(root, presentationRoot)) throw new Error('Keep source inputs outside the runtime release directory.');
  const checked = await validatePresentation(presentationRoot);
  const sourceHash = await hashFile(source);
  const release = randomUUID();
  const releases = await externalPath(path.join(root, 'releases'), { directory: true, create: true });
  if (!isWithin(root, releases)) throw new Error('Release directory escapes private storage.');
  const target = path.join(releases, release);
  await mkdir(target, { mode: 0o700 });
  let activated = false;
  const temp = path.join(root, `.legacy-${release}.tmp`);
  try {
    const copy = path.join(target, 'database.sqlite');
    await copyFile(source, copy, constants.COPYFILE_EXCL);
    const handle = await open(copy, 'r+');
    try { await handle.chmod(0o600); await handle.sync(); } finally { await handle.close(); }
    await assertStandaloneLegacy(source);
    if (await hashFile(copy) !== sourceHash || await hashFile(source) !== sourceHash) throw new Error('Source database changed during import; original manifest was not replaced.');
    const store = await openLegacyStore(copy, { expectedFileHash: sourceHash });
    const status = store.status();
    store.close();
    for (const file of ['ui-content.json', 'shell.html', 'styles.css']) {
      const bytes = await readFile(path.join(presentationRoot, file));
      await durableWrite(path.join(target, file), bytes);
    }
    const copied = await validatePresentation(target);
    if (copied.presentationHash !== checked.presentationHash) throw new Error('Presentation changed during import.');
    const manifest = { schemaVersion: 1, format: 'legacy-sqlite', release,
      database: `releases/${release}/database.sqlite`, presentation: `releases/${release}/ui-content.json`,
      databaseSha256: sourceHash, presentationSha256: copied.presentationHash, importedAt: new Date().toISOString(),
      refresh: 'not-connected' };
    await durableWrite(path.join(target, 'import-manifest.json'), JSON.stringify(manifest, null, 2));
    await syncDirectory(target);
    await syncDirectory(releases);
    const file = await open(temp, 'wx', 0o600);
    try { await file.writeFile(`${JSON.stringify(manifest, null, 2)}\n`); await file.sync(); } finally { await file.close(); }
    await rename(temp, path.join(root, 'legacy.json'));
    activated = true;
    const directorySync = await syncDirectory(root);
    return { counts: status.counts, warnings: status.validation.warnings.length, release, directorySync };
  } catch (error) {
    await rm(temp, { force: true });
    if (!activated) await rm(target, { recursive: true, force: true });
    if (activated) throw new Error('Private release activated but durability confirmation failed. Previous releases remain preserved.');
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const keys = { '--database': 'database', '--presentation': 'presentation', '--data-dir': 'dataDir' };
  try {
    if (args.length !== 6) throw new Error('Usage: npm run data:import-legacy -- --database /private/source.sqlite --presentation /private/presentation --data-dir /private/runtime');
    const options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (!keys[args[i]] || options[keys[args[i]]] || !args[i + 1]) throw new Error('Invalid or repeated import option.');
      options[keys[args[i]]] = args[i + 1];
    }
    const result = await importLegacy(options);
    console.log(`Private release activated: ${result.counts.observations} reconciled observations; ${result.warnings} source-quality warnings. Original inputs and older releases preserved. Refresh remains unconnected.`);
    if (result.directorySync === 'not-supported-on-windows') console.log('File contents were synced. Directory flush is unavailable through Node on Windows; directory-entry crash durability is not confirmed.');
  } catch (error) {
    console.error(error.code ? 'Legacy import failed. Check external source files and permissions. No private values are printed.' : error.message);
    process.exitCode = 1;
  }
}

import { constants } from 'node:fs';
import { mkdir, open, realpath, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateDataset } from '../src/domain.js';
import { externalPath, isWithin, MAX_DATA_BYTES } from '../src/storage.js';

async function durableWrite(filename, bytes) {
  const handle = await open(filename, 'wx', 0o600);
  try { await handle.writeFile(bytes); await handle.sync(); }
  finally { await handle.close(); }
}

async function privateSubdirectory(root, name) {
  const target = path.join(root, name);
  await mkdir(target, { recursive: true, mode: 0o700 });
  const resolved = await realpath(target);
  if (resolved !== target || !isWithin(root, resolved)) throw new Error('Private storage subdirectories may not be symlinks.');
  await externalPath(resolved, { directory: true });
  return target;
}

async function readBytes(filename) {
  const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.size > MAX_DATA_BYTES) throw new Error('Input must be a regular JSON file no larger than 32 MiB.');
    const bytes = await handle.readFile();
    if (bytes.length > MAX_DATA_BYTES) throw new Error('Input exceeds 32 MiB.');
    return bytes;
  } finally { await handle.close(); }
}

export async function importDataset({ input, dataDir, asOf } = {}) {
  const source = await externalPath(input);
  const bytes = await readBytes(source);
  let dataset;
  try { dataset = JSON.parse(bytes.toString('utf8')); }
  catch { throw new Error('Input is not valid JSON. The legacy HTML/ZIP must first be inspected and mapped to the documented data contract.'); }
  const validation = validateDataset(dataset, asOf ? { asOf } : undefined);
  // Details remain local and can contain user-selected metric labels, so the
  // CLI prints only counts; programmatic callers can inspect validation.
  if (validation.errors.length) {
    const error = new Error(`Dataset rejected: ${validation.errors.length} validation error(s). No snapshot replaced.`);
    error.validation = validation;
    throw error;
  }
  const root = await externalPath(dataDir, { directory: true, create: true });
  const originals = await privateSubdirectory(root, 'originals');
  const backups = await privateSubdirectory(root, 'backups');
  const digest = createHash('sha256').update(bytes).digest('hex');
  const importId = `${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}`;
  const snapshot = path.join(root, 'dataset.json');
  const temp = path.join(root, `.dataset-${importId}.tmp`);
  // Keep byte-for-byte original input copies and the previous snapshot outside
  // the repository. Never modify, move, or delete the user's input file.
  await durableWrite(path.join(originals, `${importId}-${digest}.json`), bytes);
  try {
    await durableWrite(path.join(backups, `${importId}.json`), await readBytes(snapshot));
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  let activated = false;
  try {
    // Retain the validated bytes: pretty-printing could expand a valid input
    // past the server's size cap and replace a good snapshot with an unreadable one.
    await durableWrite(temp, bytes);
    await rename(temp, snapshot);
    activated = true;
    const directory = await open(root, constants.O_RDONLY);
    try { await directory.sync(); } finally { await directory.close(); }
  } catch (error) {
    await unlink(temp).catch(() => {});
    if (activated) throw new Error('Snapshot was replaced, but durability confirmation failed. The prior snapshot backup remains available. Check storage before continuing.');
    throw error;
  }
  return { observations: dataset.observations.length, warnings: validation.warnings.length, sha256: digest, kind: dataset.dataset.kind };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const usage = 'Usage: npm run data:import -- --input /absolute/external/normalized.json --data-dir /absolute/external/private-data';
  if (args.length !== 4 || !args.includes('--input') || !args.includes('--data-dir')) {
    console.error(usage); process.exitCode = 1;
  } else {
    try {
      const result = await importDataset({ input: args[args.indexOf('--input') + 1], dataDir: args[args.indexOf('--data-dir') + 1] });
      console.log(`Imported ${result.observations} observations (${result.kind}); ${result.warnings} data quality warning(s). Original preserved; snapshot replaced atomically. No refresh connection is configured.`);
    } catch (error) {
      console.error(error.code ? 'Import failed. Check external file locations and permissions; existing snapshot was preserved.' : error.message);
      process.exitCode = 1;
    }
  }
}

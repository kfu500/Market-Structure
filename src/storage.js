import { constants } from 'node:fs';
import { access, lstat, mkdir, open, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MAX_DATA_BYTES = 32 * 1024 * 1024;

export function isWithin(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

// Resolve existing ancestors as well as a not-yet-created leaf, so a symlink
// cannot disguise an in-repository destination as external private storage.
async function resolveProspective(candidate) {
  try { return await realpath(candidate); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const parent = path.dirname(candidate);
    if (parent === candidate) throw error;
    return path.join(await resolveProspective(parent), path.basename(candidate));
  }
}

export async function externalPath(input, { directory = false, create = false } = {}) {
  if (!input || !path.isAbsolute(input)) throw new Error('Use an absolute path outside the repository for private files.');
  const resolved = await resolveProspective(path.resolve(input));
  const root = await realpath(REPO_ROOT);
  if (isWithin(root, resolved) || isWithin(root, path.resolve(input))) {
    throw new Error('Private files must be outside the repository, including symlink targets.');
  }
  // Avoid other Git checkouts, too. /workspace/.git is a platform mount rather
  // than a repository; a real Git directory has HEAD or a gitdir pointer file.
  for (let current = directory ? resolved : path.dirname(resolved); ; current = path.dirname(current)) {
    const git = path.join(current, '.git');
    try {
      const info = await lstat(git);
      if (info.isFile() || info.isSymbolicLink()) throw new Error('Private files must not be stored inside a Git checkout.');
      if (info.isDirectory()) {
        let hasHead = false;
        try { await access(path.join(git, 'HEAD'), constants.F_OK); hasHead = true; }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
        if (hasHead) throw new Error('Private files must not be stored inside a Git checkout.');
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (path.dirname(current) === current) break;
  }
  if (create) await mkdir(resolved, { recursive: true, mode: 0o700 });
  if (directory && !(await stat(resolved)).isDirectory()) throw new Error('Data storage must be a directory.');
  return resolved;
}

export async function readJsonFile(filename) {
  // O_NOFOLLOW also rejects a replaced leaf symlink after path checks.
  const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.size > MAX_DATA_BYTES) throw new Error('Dataset must be a regular JSON file no larger than 32 MiB.');
    const text = await handle.readFile('utf8');
    if (Buffer.byteLength(text) > MAX_DATA_BYTES) throw new Error('Dataset exceeds 32 MiB.');
    return JSON.parse(text);
  } finally { await handle.close(); }
}

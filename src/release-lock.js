import { constants } from 'node:fs';
import { open, unlink } from 'node:fs/promises';
import path from 'node:path';
import { readJsonFile } from './storage.js';

async function currentRelease(root) {
  try {
    const manifest = await readJsonFile(path.join(root, 'legacy.json'));
    if (manifest.format !== 'legacy-sqlite' || typeof manifest.release !== 'string' || !manifest.release) {
      throw new Error('Current private release manifest is invalid. It was not replaced.');
    }
    return manifest.release;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

/** All cooperating importers serialize activation and compare the exact release
 * the caller reviewed. A crash leaves the lock for deliberate operator recovery;
 * this function never guesses that a different writer is dead or steals a lock. */
export async function withReleaseGuard(root, expectedRelease, operation) {
  const lockPath = path.join(root, '.legacy-import.lock');
  let lock;
  try {
    lock = await open(lockPath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error('Another import holds the private release lock. No release was replaced.');
    throw error;
  }
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    await lock.sync();
    const observed = await currentRelease(root);
    const expected = expectedRelease === undefined ? null : expectedRelease;
    if (expected !== null && (typeof expected !== 'string' || !expected)) {
      throw new Error('Expected release must be a nonempty identifier or null for initial import.');
    }
    if (observed !== expected) {
      throw new Error('Private release changed or an expected release is required. Re-read the current release before importing.');
    }
    const assertUnchanged = async () => {
      if (await currentRelease(root) !== observed) throw new Error('Private release changed during import. No replacement was made.');
    };
    return await operation(assertUnchanged);
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}

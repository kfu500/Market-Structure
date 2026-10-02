import { createHash } from 'node:crypto';
import { constants, rmSync } from 'node:fs';
import { mkdtemp, open, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { inflateSync } from 'node:zlib';
import { externalPath } from './storage.js';
import { createLegacyStore } from './legacy-store-core.js';
export { legacyDate } from './legacy-store-core.js';

const MiB = 1024 * 1024;
const fail = message => { throw new Error(`Legacy database validation failed: ${message}.`); };

async function noJournal(filename) {
  for (const suffix of ['-wal', '-journal']) {
    try {
      if ((await stat(`${filename}${suffix}`)).size > 0) {
        fail('database has an active journal; provide a checkpointed standalone SQLite snapshot');
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

/** Check the original source before copying, as well as the final snapshot. */
export async function assertStandaloneLegacy(filename) {
  const resolved = await externalPath(filename);
  await noJournal(resolved);
  const handle = await open(resolved, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    if (!(await handle.stat()).isFile()) fail('input must be a regular SQLite file');
  } finally { await handle.close(); }
  return resolved;
}

async function hashHandle(handle) {
  const hash = createHash('sha256');
  const buffer = Buffer.allocUnsafe(4 * MiB);
  let position = 0;
  for (;;) {
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, position);
    if (!bytesRead) return hash.digest('hex');
    hash.update(buffer.subarray(0, bytesRead));
    position += bytesRead;
  }
}

function assertUnchanged(before, after) {
  if (before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) fail('database changed while being read');
}

function removePortableSnapshot(directory) {
  if (directory) rmSync(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

// Windows has no /proc descriptor pathname. An exclusive private temporary copy
// gives SQLite a stable native pathname without reopening the mutable source.
// Windows inherits the current user's temporary-directory ACL; on POSIX,
// mkdtemp and the explicit file mode also exclude other users.
async function copyPortableSnapshot(source, { expectedFileHash, temporaryDirectory }) {
  const root = await externalPath(temporaryDirectory, { directory: true });
  const directory = await mkdtemp(path.join(root, 'market-structure-readonly-'));
  const filename = path.join(directory, 'snapshot.sqlite');
  let target;
  try {
    target = await open(filename, 'wx+', 0o600);
    const hash = createHash('sha256');
    const buffer = Buffer.allocUnsafe(4 * MiB);
    let position = 0;
    for (;;) {
      const { bytesRead } = await source.read(buffer, 0, buffer.length, position);
      if (!bytesRead) break;
      const chunk = buffer.subarray(0, bytesRead);
      hash.update(chunk);
      await target.writeFile(chunk);
      position += bytesRead;
    }
    const copiedHash = hash.digest('hex');
    if (expectedFileHash !== undefined && copiedHash !== expectedFileHash) fail('database file SHA-256 does not match the pinned snapshot digest');
    await target.sync();
    if (await hashHandle(target) !== copiedHash) fail('private snapshot copy SHA-256 does not match its source bytes');
    await target.close();
    target = undefined;
    return { directory, filename };
  } catch (error) {
    await target?.close();
    removePortableSnapshot(directory);
    throw error;
  }
}

/**
 * Open an external, checkpointed SQLite snapshot without running imported code.
 * Components remain lossless JSON; normalized rows are reconciled with their
 * original component pointers. Mixed-frequency and overlapping source roles are
 * preserved, never added together or silently converted to a monthly schema.
 */
export async function openLegacyStore(filename, {
  now = new Date(), maxComponentBytes = 256 * MiB, maxTotalBytes = 512 * MiB, expectedFileHash,
  platform = process.platform, temporaryDirectory = os.tmpdir(),
} = {}) {
  if (!(now instanceof Date) || !Number.isFinite(now.valueOf())) throw new Error('A valid validation date is required.');
  if (![maxComponentBytes, maxTotalBytes].every(value => Number.isSafeInteger(value) && value > 0)) throw new Error('Positive payload size limits are required.');
  if (expectedFileHash !== undefined && (typeof expectedFileHash !== 'string' || !/^[a-f0-9]{64}$/.test(expectedFileHash))) {
    throw new Error('Expected database file hash must be a lowercase SHA-256 digest.');
  }
  const resolved = await assertStandaloneLegacy(filename);
  // The descriptor pins the validated regular file against leaf replacement.
  // Linux opens this descriptor read-only with immutable=1. Other platforms
  // receive a verified private process snapshot, opened by its native pathname.
  const handle = await open(resolved, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  let db;
  let portableSnapshot;
  try {
    const before = await handle.stat({ bigint: true });
    if (!before.isFile()) fail('input must be a regular SQLite file');
    let sqliteFilename;
    if (platform === 'linux') {
      if (expectedFileHash !== undefined && await hashHandle(handle) !== expectedFileHash) fail('database file SHA-256 does not match the pinned snapshot digest');
      sqliteFilename = `file:/proc/self/fd/${handle.fd}?mode=ro&immutable=1`;
    } else {
      portableSnapshot = await copyPortableSnapshot(handle, { expectedFileHash, temporaryDirectory });
      assertUnchanged(before, await handle.stat({ bigint: true }));
      sqliteFilename = portableSnapshot.filename;
    }
    await noJournal(resolved);
    // Native file paths and readOnly are documented Node 24 DatabaseSync
    // options. The portable copy is never shared with an updater or writer.
    db = new DatabaseSync(sqliteFilename, {
      readOnly: true, allowExtension: false, enableForeignKeyConstraints: true,
      enableDoubleQuotedStringLiterals: false,
    });
    const store = createLegacyStore(db, {
      now, maxComponentBytes, maxTotalBytes,
      inflate: (bytes, maximum) => inflateSync(bytes, { maxOutputLength: maximum }),
      sha256: bytes => createHash('sha256').update(bytes).digest('hex'),
      closeDatabase() {
        try { db.close(); } finally { removePortableSnapshot(portableSnapshot?.directory); }
      },
    });
    const after = await handle.stat({ bigint: true });
    assertUnchanged(before, after);
    await noJournal(resolved);
    return store;
  } catch (error) {
    try { db?.close(); } finally { removePortableSnapshot(portableSnapshot?.directory); }
    throw error;
  } finally { await handle.close(); }
}

#!/usr/bin/env node
// Offline recovery uses only Node's standard library. Never execute recovered content.
import { constants, createReadStream, createWriteStream } from 'node:fs';
import { chmod, copyFile, lstat, mkdir, mkdtemp, open, readdir, rename, rm, utimes } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PassThrough, Transform, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInflateRaw, crc32 } from 'node:zlib';

const PART_BYTES = 30 * 1024 * 1024;
const MAX_ARCHIVE = 0xffffffff - 1;
const MAX_FILE = 8 * 1024 ** 3;
const MAX_TOTAL = 32 * 1024 ** 3;
const MAX_MANIFEST = 16 * 1024 ** 2;
const MAX_ENTRIES = 60000;
const SHA = /^[a-f0-9]{64}$/;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

class RecoveryError extends Error {}
function check(condition, message = 'Recovery package validation failed.') {
  if (!condition) throw new RecoveryError(message);
}
function integer(value, maximum = Number.MAX_SAFE_INTEGER) {
  return Number.isSafeInteger(value) && value >= 0 && value <= maximum;
}
function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function sameKeys(value, keys) {
  return object(value) && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}
function parseJson(buffer) {
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer)); }
  catch { throw new RecoveryError('Recovery metadata is invalid.'); }
}
function folded(value) { return value.normalize('NFC').toUpperCase(); }

// Reject Windows aliases on every platform so Linux-created bundles remain portable.
function validateRelativePath(value, allowRoot = false, logical = false) {
  check(typeof value === 'string' && (value.length > 0 || allowRoot) && value.length <= 240);
  if (value === '') return;
  check(value.isWellFormed() && value.normalize('NFC') === value && !value.startsWith('/') && !value.endsWith('/'));
  const segments = value.split('/');
  if (logical) check(segments[0] === 'application' || segments[0] === 'private');
  for (const segment of segments) {
    check(segment.length > 0 && Buffer.byteLength(segment) <= 255);
    check(segment !== '.' && segment !== '..' && !/[<>:"\\|?*\x00-\x1f\x7f]/u.test(segment));
    check(!/[. ]$/u.test(segment) && folded(segment) !== '.GIT');
    const deviceBase = segment.split('.')[0].replace(/ +$/u, '');
    check(!/^(?:CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³]|CONIN\$|CONOUT\$)$/iu.test(deviceBase));
  }
}

export function validateLogicalPath(value, allowRoot = false) {
  validateRelativePath(value, allowRoot, true);
}

async function exists(file) {
  try { await lstat(file); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

async function gitMarker(directory) {
  const marker = path.join(directory, '.git');
  try {
    const info = await lstat(marker);
    // Cloud mount guards are empty .git directories. Real repositories have a
    // HEAD, or use a gitdir file; neither may contain recovery inputs or output.
    return info.isSymbolicLink() || info.isFile() || (info.isDirectory() && await exists(path.join(marker, 'HEAD')));
  } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

// lstat recognizes Windows junctions as symbolic links. Refuse a Git marker in
// any ancestor, including worktrees whose .git is a file rather than a directory.
async function safeDirectory(directory) {
  const resolved = path.resolve(directory);
  const root = path.parse(resolved).root;
  let cursor = root;
  for (const component of resolved.slice(root.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, component);
    const info = await lstat(cursor);
    check(info.isDirectory() && !info.isSymbolicLink(), 'Recovery requires ordinary directories outside Git.');
    check(!await gitMarker(cursor), 'Recovery requires ordinary directories outside Git.');
  }
  check(!await gitMarker(root), 'Recovery requires ordinary directories outside Git.');
  return resolved;
}

async function regularFile(file, maximum) {
  const info = await lstat(file);
  check(info.isFile() && !info.isSymbolicLink() && info.size <= maximum);
  const handle = await open(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const actual = await handle.stat();
    check(actual.isFile() && actual.size === info.size && actual.ino === info.ino && actual.dev === info.dev);
    return handle;
  } catch (error) { await handle.close(); throw error; }
}

async function readAt(handle, offset, size) {
  const bytes = Buffer.alloc(size);
  let count = 0;
  while (count < size) {
    const result = await handle.read(bytes, count, size - count, offset + count);
    check(result.bytesRead > 0);
    count += result.bytesRead;
  }
  return bytes;
}

function validateParts(metadata) {
  check(sameKeys(metadata, ['format', 'schemaVersion', 'archive', 'partBytes', 'parts']));
  check(metadata.format === 'market-structure-recovery-parts' && metadata.schemaVersion === 1);
  check(metadata.partBytes === PART_BYTES && sameKeys(metadata.archive, ['file', 'size', 'sha256']));
  check(metadata.archive.file === 'recovery.zip' && integer(metadata.archive.size, MAX_ARCHIVE) && metadata.archive.size >= 22 && SHA.test(metadata.archive.sha256));
  check(Array.isArray(metadata.parts) && metadata.parts.length === Math.ceil(metadata.archive.size / PART_BYTES));
  let total = 0;
  for (const [index, part] of metadata.parts.entries()) {
    check(sameKeys(part, ['file', 'size', 'sha256']));
    check(part.file === `recovery.part-${String(index + 1).padStart(3, '0')}` && SHA.test(part.sha256));
    const expectedSize = Math.min(PART_BYTES, metadata.archive.size - total);
    check(part.size === expectedSize && expectedSize > 0);
    total += part.size;
  }
  check(total === metadata.archive.size);
  return metadata;
}

async function joinParts(input, metadata, destination) {
  const wholeHash = createHash('sha256');
  const output = await open(destination, 'wx', 0o600);
  try {
    for (const part of metadata.parts) {
      const inputFile = await regularFile(path.join(input, part.file), PART_BYTES);
      const hash = createHash('sha256');
      let size = 0;
      try {
        const stream = inputFile.createReadStream({ autoClose: false });
        for await (const chunk of stream) {
          size += chunk.length;
          check(size <= part.size, 'A recovery part failed verification.');
          hash.update(chunk); wholeHash.update(chunk);
          let offset = 0;
          while (offset < chunk.length) {
            const result = await output.write(chunk, offset, chunk.length - offset);
            check(result.bytesWritten > 0);
            offset += result.bytesWritten;
          }
        }
      } finally { await inputFile.close(); }
      check(size === part.size && hash.digest('hex') === part.sha256, 'A recovery part failed verification.');
    }
    check(wholeHash.digest('hex') === metadata.archive.sha256, 'The recovery archive failed verification.');
  } finally { await output.close(); }
}

function validateExtra(extra) {
  let offset = 0;
  const allowed = new Set([0x000a, 0x5455, 0x5855, 0x7875, 0x7075]);
  while (offset < extra.length) {
    check(offset + 4 <= extra.length);
    const tag = extra.readUInt16LE(offset);
    const length = extra.readUInt16LE(offset + 2);
    check(allowed.has(tag) && offset + 4 + length <= extra.length);
    offset += 4 + length;
  }
}

async function parseZip(handle, size, sourceArchive = false) {
  check(integer(size, MAX_ARCHIVE) && size >= 22);
  const lastBytes = sourceArchive ? Math.min(size, 65557) : 22;
  const trailer = await readAt(handle, size - lastBytes, lastBytes);
  let tailOffset = trailer.length - 22;
  if (sourceArchive) {
    while (tailOffset >= 0 && (trailer.readUInt32LE(tailOffset) !== 0x06054b50 || tailOffset + 22 + trailer.readUInt16LE(tailOffset + 20) !== trailer.length)) tailOffset--;
  }
  check(tailOffset >= 0);
  const tail = trailer.subarray(tailOffset, tailOffset + 22);
  const endOffset = size - lastBytes + tailOffset;
  check(tail.readUInt32LE(0) === 0x06054b50 && (sourceArchive || tail.readUInt16LE(20) === 0));
  check(tail.readUInt16LE(4) === 0 && tail.readUInt16LE(6) === 0);
  const count = tail.readUInt16LE(10);
  check(count > 0 && count <= MAX_ENTRIES && tail.readUInt16LE(8) === count);
  const directorySize = tail.readUInt32LE(12);
  const directoryOffset = tail.readUInt32LE(16);
  check(directoryOffset + directorySize === endOffset && directorySize <= MAX_MANIFEST);
  const entries = new Map();
  let cursor = directoryOffset;
  for (let index = 0; index < count; index++) {
    check(cursor + 46 <= endOffset);
    const header = await readAt(handle, cursor, 46);
    check(header.readUInt32LE(0) === 0x02014b50);
    const flags = header.readUInt16LE(8);
    const method = header.readUInt16LE(10);
    const crc = header.readUInt32LE(16);
    const compressedSize = header.readUInt32LE(20);
    const plainSize = header.readUInt32LE(24);
    const nameLength = header.readUInt16LE(28);
    const extraLength = header.readUInt16LE(30);
    const commentLength = header.readUInt16LE(32);
    const external = header.readUInt32LE(38);
    const offset = header.readUInt32LE(42);
    const mode = external >>> 16;
    check([0, 3].includes(header[5]) && header.readUInt16LE(6) <= 20);
    check((flags === 0 || flags === 0x800) && (method === 8 || (sourceArchive && method === 0)) && header.readUInt16LE(34) === 0);
    check(sourceArchive || (extraLength === 0 && commentLength === 0 && (external & 0x10) === 0));
    check((mode & 0xf000) === 0 || (mode & 0xf000) === 0x8000 || (sourceArchive && (mode & 0xf000) === 0x4000));
    check((compressedSize > 0 || method === 0) && compressedSize < 0xffffffff && plainSize < 0xffffffff && offset < directoryOffset);
    check(method !== 0 || compressedSize === plainSize);
    check(nameLength > 0 && nameLength <= (sourceArchive ? 1024 : 80) && cursor + 46 + nameLength + extraLength + commentLength <= endOffset);
    const nameBytes = await readAt(handle, cursor + 46, nameLength);
    const name = new TextDecoder('utf-8', { fatal: true }).decode(nameBytes);
    check(flags === 0x800 || Buffer.from(name, 'ascii').equals(nameBytes));
    const directory = sourceArchive && name.endsWith('/');
    if (sourceArchive) {
      validateRelativePath(directory ? name.slice(0, -1) : name);
      check(directory || ((external & 0x10) === 0 && (mode & 0xf000) !== 0x4000));
      if (directory) check(plainSize === 0);
      validateExtra(await readAt(handle, cursor + 46 + nameLength, extraLength));
    } else check(name === 'recovery-manifest.json' || /^blobs\/[a-f0-9]{64}$/.test(name));
    check(!entries.has(name));
    check(plainSize <= (name === 'recovery-manifest.json' ? MAX_MANIFEST : MAX_FILE));
    entries.set(name, { name, nameBytes, flags, method, crc, compressedSize, plainSize, offset, directory, time: header.readUInt32LE(12) });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  check(cursor === endOffset && (sourceArchive || entries.has('recovery-manifest.json')));
  // Require a single contiguous layout: no overlapping streams, hidden entries,
  // self-extracting prefix, trailing payloads, or local/central disagreements.
  cursor = 0;
  for (const entry of [...entries.values()].sort((a, b) => a.offset - b.offset)) {
    check(entry.offset === cursor && cursor + 30 <= directoryOffset);
    const local = await readAt(handle, cursor, 30);
    check(local.readUInt32LE(0) === 0x04034b50 && local.readUInt16LE(4) <= 20);
    check(local.readUInt16LE(6) === entry.flags && local.readUInt16LE(8) === entry.method);
    check(local.readUInt32LE(10) === entry.time && local.readUInt32LE(14) === entry.crc);
    check(local.readUInt32LE(18) === entry.compressedSize && local.readUInt32LE(22) === entry.plainSize);
    const extraLength = local.readUInt16LE(28);
    check(local.readUInt16LE(26) === entry.nameBytes.length && (sourceArchive || extraLength === 0));
    const name = await readAt(handle, cursor + 30, entry.nameBytes.length);
    check(name.equals(entry.nameBytes));
    if (sourceArchive) validateExtra(await readAt(handle, cursor + 30 + name.length, extraLength));
    entry.dataOffset = cursor + 30 + name.length + extraLength;
    cursor = entry.dataOffset + entry.compressedSize;
    check(cursor <= directoryOffset);
  }
  check(cursor === directoryOffset);
  return entries;
}

async function inflateEntry(archive, entry, destination, expectedDigest) {
  const hash = createHash('sha256');
  let count = 0;
  let crc = 0;
  const chunks = [];
  const verify = new Transform({
    transform(chunk, encoding, callback) {
      count += chunk.length;
      if (count > entry.plainSize) return callback(new RecoveryError('Recovery content failed verification.'));
      hash.update(chunk);
      crc = crc32(chunk, crc);
      callback(null, chunk);
    },
  });
  const inflate = entry.method === 8 ? createInflateRaw() : new PassThrough();
  const output = destination
    ? createWriteStream(destination, { flags: 'wx', mode: 0o600 })
    : new Writable({ write(chunk, encoding, callback) { chunks.push(chunk); callback(); } });
  const source = entry.compressedSize > 0
    ? createReadStream(archive, { start: entry.dataOffset, end: entry.dataOffset + entry.compressedSize - 1 })
    : (async function* () {})();
  await pipeline(
    source,
    inflate, verify, output,
  );
  check(count === entry.plainSize && crc === entry.crc && (entry.method === 0 || inflate.bytesWritten === entry.compressedSize),
    'Recovery content failed verification.');
  const digest = hash.digest('hex');
  if (expectedDigest) check(digest === expectedDigest, 'Recovery content failed verification.');
  return destination ? undefined : Buffer.concat(chunks);
}

function validateManifest(manifest, entries) {
  check(object(manifest));
  const hasDerived = Object.hasOwn(manifest, 'derivedFiles');
  check(sameKeys(manifest, ['format', 'schemaVersion', 'directories', 'files', 'totals', ...(hasDerived ? ['derivedFiles'] : [])]));
  check(manifest.format === 'market-structure-recovery' && manifest.schemaVersion === 1);
  check(Array.isArray(manifest.directories) && manifest.directories.length <= MAX_ENTRIES);
  check(Array.isArray(manifest.files) && manifest.files.length <= MAX_ENTRIES);
  const derivedFiles = hasDerived ? manifest.derivedFiles : [];
  check(Array.isArray(derivedFiles) && manifest.files.length + derivedFiles.length <= MAX_ENTRIES);
  const paths = new Set();
  const directories = new Set();
  for (const name of manifest.directories) {
    validateLogicalPath(name, true);
    check(!paths.has(folded(name)));
    paths.add(folded(name)); directories.add(name);
  }
  check(directories.has('') && directories.has('application') && directories.has('private'));
  for (const name of directories) {
    if (name) check(directories.has(path.posix.dirname(name) === '.' ? '' : path.posix.dirname(name)));
  }
  let logicalBytes = 0;
  const hashes = new Map();
  const ordinaryFiles = new Map();
  for (const [files, derived] of [[manifest.files, false], [derivedFiles, true]]) for (const file of files) {
    check(sameKeys(file, ['path', 'size', 'sha256', 'mtimeNs', ...(derived ? ['fromZip'] : [])]));
    validateLogicalPath(file.path);
    check(!paths.has(folded(file.path)) && file.path.includes('/'));
    paths.add(folded(file.path));
    check(directories.has(path.posix.dirname(file.path)));
    check(integer(file.size, MAX_FILE) && SHA.test(file.sha256));
    check(typeof file.mtimeNs === 'string' && /^(?:0|[1-9][0-9]{0,21})$/.test(file.mtimeNs));
    check(BigInt(file.mtimeNs) <= 8640000000000000000000n);
    if (derived) {
      check(sameKeys(file.fromZip, ['archive', 'member']));
      validateLogicalPath(file.fromZip.archive);
      validateRelativePath(file.fromZip.member);
      check(ordinaryFiles.has(file.fromZip.archive));
    } else {
      const entry = entries.get(`blobs/${file.sha256}`);
      check(entry && entry.plainSize === file.size);
      check(!hashes.has(file.sha256) || hashes.get(file.sha256) === file.size);
      hashes.set(file.sha256, file.size);
      ordinaryFiles.set(file.path, file);
    }
    logicalBytes += file.size;
    check(logicalBytes <= MAX_TOTAL);
  }
  check(entries.size === hashes.size + 1);
  const uniqueBytes = [...hashes.values()].reduce((a, b) => a + b, 0);
  check(sameKeys(manifest.totals, ['files', 'uniqueBlobs', 'logicalBytes', 'uniqueBytes']));
  check(manifest.totals.files === manifest.files.length + derivedFiles.length && manifest.totals.uniqueBlobs === hashes.size);
  check(manifest.totals.logicalBytes === logicalBytes && manifest.totals.uniqueBytes === uniqueBytes);
  return { manifest, hashes, derivedFiles, ordinaryFiles };
}

/** Reconstruct into a new directory. Existing inputs and targets are never replaced. */
export async function reconstructRecovery({ input = scriptDirectory, output = path.join(input, 'recovered-market-structure') } = {}) {
  check(Number(process.versions.node.split('.')[0]) === 24, 'Recovery requires Node.js 24.');
  let temporary;
  let ownedOutput = false;
  let outputIdentity;
  try {
    input = await safeDirectory(input);
    output = path.resolve(output);
    validateRelativePath(path.basename(output));
    const parent = await safeDirectory(path.dirname(output));
    check(!await exists(output), 'The recovery destination already exists. Choose a new directory.');
    const metadataHandle = await regularFile(path.join(input, 'recovery-parts.json'), 1024 * 1024);
    let metadata;
    try { metadata = validateParts(parseJson(await metadataHandle.readFile())); }
    finally { await metadataHandle.close(); }
    temporary = await mkdtemp(path.join(parent, '.market-structure-recovery-'));
    await chmod(temporary, 0o700);
    const archive = path.join(temporary, 'recovery.zip');
    await joinParts(input, metadata, archive);
    const archiveHandle = await open(archive, 'r');
    let entries;
    try { entries = await parseZip(archiveHandle, metadata.archive.size); }
    finally { await archiveHandle.close(); }
    const { manifest, hashes, derivedFiles, ordinaryFiles } = validateManifest(parseJson(await inflateEntry(archive, entries.get('recovery-manifest.json'))), entries);
    const blobs = path.join(temporary, 'blobs');
    const tree = path.join(temporary, 'tree');
    await mkdir(blobs, { mode: 0o700 });
    await mkdir(tree, { mode: 0o700 });
    for (const hash of hashes.keys()) await inflateEntry(archive, entries.get(`blobs/${hash}`), path.join(blobs, hash), hash);
    for (const name of [...manifest.directories].filter(Boolean).sort((a, b) => a.split('/').length - b.split('/').length)) {
      await mkdir(path.join(tree, ...name.split('/')), { mode: 0o700 });
    }
    for (const file of manifest.files) {
      const destination = path.join(tree, ...file.path.split('/'));
      await copyFile(path.join(blobs, file.sha256), destination, constants.COPYFILE_EXCL);
      await chmod(destination, 0o600);
      const seconds = Number(BigInt(file.mtimeNs)) / 1e9;
      await utimes(destination, seconds, seconds);
    }
    const sourceEntries = new Map();
    for (const file of derivedFiles) {
      const sourcePath = path.join(tree, ...file.fromZip.archive.split('/'));
      if (!sourceEntries.has(file.fromZip.archive)) {
        const sourceHandle = await regularFile(sourcePath, MAX_ARCHIVE);
        try {
          sourceEntries.set(file.fromZip.archive, await parseZip(sourceHandle, ordinaryFiles.get(file.fromZip.archive).size, true));
        } finally { await sourceHandle.close(); }
      }
      const entry = sourceEntries.get(file.fromZip.archive).get(file.fromZip.member);
      check(entry && !entry.directory && entry.plainSize === file.size);
      const destination = path.join(tree, ...file.path.split('/'));
      await inflateEntry(sourcePath, entry, destination, file.sha256);
      const seconds = Number(BigInt(file.mtimeNs)) / 1e9;
      await utimes(destination, seconds, seconds);
    }
    // Node does not offer a portable rename-without-replacement for directories.
    // Reserve a new destination exclusively after verification, then activate its
    // verified roots. Observers may briefly see an incomplete output directory.
    await safeDirectory(parent);
    await mkdir(output, { mode: 0o700 });
    ownedOutput = true;
    outputIdentity = await lstat(output);
    for (const name of await readdir(tree)) await rename(path.join(tree, name), path.join(output, name));
    await rm(temporary, { recursive: true, force: true });
    temporary = undefined;
    ownedOutput = false;
    return { files: manifest.totals.files, uniqueBlobs: hashes.size, logicalBytes: manifest.totals.logicalBytes };
  } catch (error) {
    if (ownedOutput && outputIdentity) {
      try {
        const current = await lstat(output);
        if (current.isDirectory() && !current.isSymbolicLink() && current.ino === outputIdentity.ino && current.dev === outputIdentity.dev) {
          await rm(output, { recursive: true, force: true });
        }
      } catch { /* Never remove a path whose identity cannot be verified. */ }
    }
    if (temporary) { try { await rm(temporary, { recursive: true, force: true }); } catch { /* Keep private permissions on an undeletable staging directory. */ } }
    if (error instanceof RecoveryError) throw error;
    throw new RecoveryError('Recovery could not complete. Check available space, permissions, and the package files.');
  }
}

async function main(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node reconstruct-recovery.mjs [--input PACKAGE_DIRECTORY] [--output NEW_DIRECTORY]');
    console.log('Defaults: package beside this script; recovered-market-structure within that package.');
    console.log('Requires Node.js 24. Recovery is offline; the destination must be new and outside Git.');
    console.log('Files use private POSIX permissions. On Windows, choose a private folder with suitable NTFS permissions.');
    return;
  }
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    check((name === '--input' || name === '--output') && args[index + 1] && !args[index + 1].startsWith('--') && !Object.hasOwn(options, name.slice(2)), 'Invalid arguments. Use --help for instructions.');
    options[name.slice(2)] = args[index + 1];
  }
  const result = await reconstructRecovery(options);
  console.log(`Recovery completed: ${result.files} files verified and restored. The original package is unchanged.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => {
    console.error(error instanceof RecoveryError ? error.message : 'Recovery failed.');
    process.exitCode = 1;
  });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { appendFileSync, watch } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { crc32, deflateRawSync } from 'node:zlib';
import { extractSourceZipMember, listSourceZipEntries } from '../scripts/reconstruct-recovery.mjs';

// Invented source archives only. No application or private source files are used.
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function zip(items) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const item of items) {
    const name = Buffer.from(item.name);
    const bytes = Buffer.from(item.bytes ?? 'synthetic content');
    const method = item.method ?? 8;
    const encoded = method === 0 ? bytes : deflateRawSync(bytes);
    const checksum = item.crc ?? crc32(bytes);
    const size = item.size ?? bytes.length;
    const flags = item.flags ?? 0;
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4);
    header.writeUInt16LE(flags, 6); header.writeUInt16LE(method, 8);
    header.writeUInt32LE(checksum, 14); header.writeUInt32LE(encoded.length, 18);
    header.writeUInt32LE(size, 22); header.writeUInt16LE(name.length, 26);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(0x314, 4);
    directory.writeUInt16LE(20, 6); directory.writeUInt16LE(flags, 8); directory.writeUInt16LE(method, 10);
    directory.writeUInt32LE(checksum, 16); directory.writeUInt32LE(encoded.length, 20);
    directory.writeUInt32LE(size, 24); directory.writeUInt16LE(name.length, 28);
    directory.writeUInt32LE(((item.mode ?? 0o100600) * 65536) >>> 0, 38);
    directory.writeUInt32LE(offset, 42);
    local.push(header, name, encoded); central.push(directory, name);
    offset += header.length + name.length + encoded.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(items.length, 8); end.writeUInt16LE(items.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}
async function fixture(t, entries = [{ name: 'data/example.sqlite' }]) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'synthetic-source-zip-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const archive = path.join(root, 'original.zip');
  const destination = path.join(root, 'extracted.sqlite');
  await writeFile(archive, zip(entries));
  return { root, archive, destination, member: entries[0].name, maxBytes: 1024 };
}

test('lists metadata and extracts exactly one bounded member with CRC and optional SHA verification', async t => {
  const contents = Buffer.from('SYNTHETIC historical observations');
  for (const method of [0, 8]) {
    const f = await fixture(t, [{ name: 'data/example.sqlite', bytes: contents, method },
      { name: 'never-execute.js', bytes: 'throw new Error("synthetic untrusted source");' }]);
    const original = await readFile(f.archive);
    const entries = await listSourceZipEntries(f.archive);
    assert.equal(entries.length, 2);
    assert.deepEqual(Object.keys(entries[0]).sort(), ['compressedSize', 'directory', 'name', 'size']);
    const result = await extractSourceZipMember({ ...f, expectedSha256: hash(contents) });
    assert.deepEqual(result, { member: f.member, size: contents.length, sha256: hash(contents) });
    assert.deepEqual(await readFile(f.destination), contents);
    assert.deepEqual(await readFile(f.archive), original);
    assert.deepEqual((await readdir(f.root)).sort(), ['extracted.sqlite', 'original.zip']);
    if (process.platform !== 'win32') assert.equal((await stat(f.destination)).mode & 0o777, 0o600);
  }
});

test('rejects unsafe paths, symlink members, encryption and case/parent collisions before output', async t => {
  const variants = [
    [{ name: '../escape' }], [{ name: '/absolute' }], [{ name: 'a\\b' }],
    [{ name: 'CON.txt' }], [{ name: '.git/HEAD' }], [{ name: 'name.' }],
    [{ name: 'safe', mode: 0o120777 }], [{ name: 'safe', flags: 1 }],
    [{ name: 'same' }, { name: 'same' }], [{ name: 'File' }, { name: 'file' }],
    [{ name: 'Data/a' }, { name: 'data/b' }], [{ name: 'data/a' }, { name: 'data' }],
  ];
  for (const entries of variants) {
    const f = await fixture(t, entries);
    await assert.rejects(listSourceZipEntries(f.archive));
    await assert.rejects(extractSourceZipMember({ ...f, member: 'safe' }));
    await assert.rejects(stat(f.destination), { code: 'ENOENT' });
  }
});

test('size caps and required member names are enforced without changing inputs', async t => {
  const f = await fixture(t);
  const original = await readFile(f.archive);
  for (const options of [{ maxBytes: 1 }, { maxBytes: -1 }, { maxBytes: Infinity },
    { maxBytes: 1.5 }, { member: 'missing' }, { member: '../bad' }, { expectedSha256: 'bad' }]) {
    await assert.rejects(extractSourceZipMember({ ...f, ...options }));
    await assert.rejects(stat(f.destination), { code: 'ENOENT' });
  }
  assert.deepEqual(await readFile(f.archive), original);
});

test('CRC, hash, false expanded-size and truncated archive failures clean only their own new file', async t => {
  for (const variation of ['crc', 'hash', 'size', 'truncated']) {
    const entry = { name: 'data/example.sqlite', bytes: 'synthetic bounded payload' };
    if (variation === 'crc') entry.crc = 0;
    if (variation === 'size') entry.size = 1;
    const f = await fixture(t, [entry]);
    if (variation === 'truncated') {
      const bytes = await readFile(f.archive);
      await writeFile(f.archive, bytes.subarray(0, bytes.length - 1));
    }
    const original = await readFile(f.archive);
    await assert.rejects(extractSourceZipMember({ ...f,
      ...(variation === 'hash' ? { expectedSha256: '0'.repeat(64) } : {}) }));
    await assert.rejects(stat(f.destination), { code: 'ENOENT' });
    assert.deepEqual(await readFile(f.archive), original);
  }
});

test('existing files and symlink destinations are never overwritten or removed', async t => {
  const f = await fixture(t);
  await writeFile(f.destination, 'existing user content');
  await assert.rejects(extractSourceZipMember(f), { code: 'EEXIST' });
  assert.equal(await readFile(f.destination, 'utf8'), 'existing user content');
  await assert.rejects(extractSourceZipMember({ ...f, destination: f.archive }), { code: 'EEXIST' });
  if (process.platform !== 'win32') {
    const link = path.join(f.root, 'output-link');
    await symlink(f.destination, link);
    await assert.rejects(extractSourceZipMember({ ...f, destination: link }), { code: 'EEXIST' });
    const sourceLink = path.join(f.root, 'source-link');
    await symlink(f.archive, sourceLink);
    await assert.rejects(listSourceZipEntries(sourceLink));
    assert.equal(await readFile(f.destination, 'utf8'), 'existing user content');
  }
});

test('source and destination must use ordinary directories outside Git', async t => {
  const f = await fixture(t);
  const checkout = path.join(f.root, 'checkout');
  await mkdir(checkout); await writeFile(path.join(checkout, '.git'), 'gitdir: invented');
  await assert.rejects(extractSourceZipMember({ ...f, destination: path.join(checkout, 'private.sqlite') }), /outside Git/);
  const gitSource = path.join(checkout, 'source.zip');
  await writeFile(gitSource, await readFile(f.archive));
  await assert.rejects(listSourceZipEntries(gitSource), /outside Git/);
  await assert.rejects(listSourceZipEntries('relative.zip'), /absolute/);
  if (process.platform !== 'win32') {
    const link = path.join(f.root, 'parent-link');
    await symlink(f.root, link);
    await assert.rejects(extractSourceZipMember({ ...f, destination: path.join(link, 'new.sqlite') }), /ordinary directories/);
  }
});

test('mutation of an opened source during extraction is detected and its output removed', async t => {
  const bytes = Buffer.alloc(8 * 1024 * 1024, 42);
  const f = await fixture(t, [{ name: 'large.synthetic', bytes }]);
  let changed = false;
  const watcher = watch(f.root, (event, filename) => {
    if (!changed && filename === path.basename(f.destination)) {
      changed = true;
      appendFileSync(f.archive, Buffer.from('synthetic source mutation'));
    }
  });
  t.after(() => watcher.close());
  await assert.rejects(extractSourceZipMember({ ...f, maxBytes: bytes.length }), /changed during reading/);
  assert.equal(changed, true);
  await assert.rejects(stat(f.destination), { code: 'ENOENT' });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomBytes } from 'node:crypto';
import { deflateRawSync, crc32 } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { reconstructRecovery, validateLogicalPath } from '../scripts/reconstruct-recovery.mjs';

// Every payload is invented; all generated files live outside every Git checkout.
const PART_BYTES = 30 * 1024 * 1024;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inventedTime = '1700000000000000000';

function syntheticZip(entries, comment = Buffer.alloc(0)) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const item of entries) {
    const name = Buffer.from(item.name);
    const bytes = Buffer.from(item.bytes ?? '');
    const method = item.method ?? 8;
    const compressed = method === 0 ? bytes : deflateRawSync(bytes);
    const extra = item.extra ?? Buffer.alloc(0);
    const flags = item.flags ?? 0;
    const checksum = item.crc ?? crc32(bytes);
    const size = item.size ?? bytes.length;
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4); header.writeUInt16LE(flags, 6); header.writeUInt16LE(method, 8);
    header.writeUInt32LE(checksum, 14); header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(size, 22);
    header.writeUInt16LE(name.length, 26); header.writeUInt16LE(extra.length, 28);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0); directory.writeUInt16LE(0x314, 4);
    directory.writeUInt16LE(20, 6); directory.writeUInt16LE(flags, 8); directory.writeUInt16LE(method, 10);
    directory.writeUInt32LE(checksum, 16); directory.writeUInt32LE(compressed.length, 20); directory.writeUInt32LE(size, 24);
    directory.writeUInt16LE(name.length, 28); directory.writeUInt16LE(extra.length, 30);
    directory.writeUInt32LE(((item.mode ?? 0o100600) * 65536) >>> 0, 38); directory.writeUInt32LE(offset, 42);
    local.push(header, name, extra, compressed);
    central.push(directory, name, extra);
    offset += header.length + name.length + extra.length + compressed.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16); end.writeUInt16LE(comment.length, 20);
  return Buffer.concat([...local, directory, end, comment]);
}

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'synthetic-recovery-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = path.join(root, 'package');
  const output = path.join(root, 'restored');
  await mkdir(input);
  return { root, input, output };
}

async function packageFixture(input, specs, { derivedFiles, mutateManifest, mutateEntries, mutateMetadata } = {}) {
  const directories = new Set(['', 'application', 'private']);
  const blobs = new Map();
  const files = specs.map(spec => {
    const bytes = Buffer.from(spec.bytes);
    const digest = hash(bytes);
    blobs.set(digest, bytes);
    return { path: spec.path, size: bytes.length, sha256: digest, mtimeNs: inventedTime };
  });
  for (const file of [...files, ...(derivedFiles ?? [])]) {
    let parent = path.posix.dirname(file.path);
    while (parent !== '.' && parent !== '/') {
      directories.add(parent);
      const next = path.posix.dirname(parent);
      if (next === parent) break;
      parent = next;
    }
  }
  const manifest = {
    format: 'market-structure-recovery', schemaVersion: 1,
    directories: [...directories].sort(), files,
    ...(derivedFiles === undefined ? {} : { derivedFiles }),
    totals: {
      files: files.length + (derivedFiles?.length ?? 0), uniqueBlobs: blobs.size,
      logicalBytes: [...files, ...(derivedFiles ?? [])].reduce((total, file) => total + file.size, 0),
      uniqueBytes: [...blobs.values()].reduce((total, bytes) => total + bytes.length, 0),
    },
  };
  mutateManifest?.(manifest);
  const entries = [
    { name: 'recovery-manifest.json', bytes: JSON.stringify(manifest) },
    ...[...blobs].map(([digest, bytes]) => ({ name: `blobs/${digest}`, bytes })),
  ];
  mutateEntries?.(entries);
  const archive = syntheticZip(entries);
  const metadata = {
    format: 'market-structure-recovery-parts', schemaVersion: 1,
    archive: { file: 'recovery.zip', size: archive.length, sha256: hash(archive) },
    partBytes: PART_BYTES,
    parts: [],
  };
  for (let offset = 0; offset < archive.length; offset += PART_BYTES) {
    const bytes = archive.subarray(offset, offset + PART_BYTES);
    const name = `recovery.part-${String(metadata.parts.length + 1).padStart(3, '0')}`;
    metadata.parts.push({ file: name, size: bytes.length, sha256: hash(bytes) });
    await writeFile(path.join(input, name), bytes);
  }
  mutateMetadata?.(metadata);
  await writeFile(path.join(input, 'recovery-parts.json'), JSON.stringify(metadata));
  return { manifest, metadata };
}

const basicFiles = [
  { path: 'application/package.json', bytes: '{"name":"synthetic-offline-app"}' },
  { path: 'private/originals/synthetic.txt', bytes: 'SYNTHETIC duplicate source' },
  { path: 'private/runtime/synthetic-copy.txt', bytes: 'SYNTHETIC duplicate source' },
  { path: 'private/runtime/empty.txt', bytes: '' },
];

async function assertClean(root, output) {
  await assert.rejects(stat(output), { code: 'ENOENT' });
  assert.equal((await readdir(root)).some(name => name.startsWith('.market-structure-recovery-')), false);
}

test('offline reconstruction verifies and restores duplicate blobs, empty files, directories and private modes', async t => {
  const { root, input, output } = await fixture(t);
  const { metadata } = await packageFixture(input, basicFiles);
  const result = await reconstructRecovery({ input, output });
  assert.equal(result.files, 4); assert.equal(result.uniqueBlobs, 3);
  for (const file of basicFiles) assert.equal(await readFile(path.join(output, file.path), 'utf8'), file.bytes);
  assert.equal(hash(await readFile(path.join(input, metadata.parts[0].file))), metadata.parts[0].sha256);
  assert.equal((await readdir(root)).some(name => name.startsWith('.market-structure-recovery-')), false);
  if (process.platform !== 'win32') {
    assert.equal((await stat(output)).mode & 0o777, 0o700);
    assert.equal((await stat(path.join(output, 'private/runtime/synthetic-copy.txt'))).mode & 0o777, 0o600);
  }
});

test('corrupt or truncated parts fail before output creation and leave source pieces untouched', async t => {
  for (const truncated of [false, true]) {
    const { root, input, output } = await fixture(t);
    await packageFixture(input, basicFiles);
    const partPath = path.join(input, 'recovery.part-001');
    const bytes = await readFile(partPath);
    const corrupted = truncated ? bytes.subarray(0, bytes.length - 1) : Buffer.from(bytes);
    if (!truncated) corrupted[10] ^= 1;
    await writeFile(partPath, corrupted);
    await assert.rejects(reconstructRecovery({ input, output }), /part failed verification/);
    assert.deepEqual(await readFile(partPath), corrupted);
    await assertClean(root, output);
  }
});

test('whole archive checksum is enforced independently of valid part hashes', async t => {
  const { root, input, output } = await fixture(t);
  await packageFixture(input, basicFiles, { mutateMetadata: metadata => { metadata.archive.sha256 = '0'.repeat(64); } });
  await assert.rejects(reconstructRecovery({ input, output }), /archive failed verification/);
  await assertClean(root, output);
});

test('real 30 MiB transport boundaries rejoin correctly and corrupt later pieces are rejected', async t => {
  const { root, input, output } = await fixture(t);
  const payload = randomBytes(PART_BYTES + 1024);
  const files = [{ path: 'private/synthetic-random.bin', bytes: payload }];
  const { metadata } = await packageFixture(input, files);
  assert.equal(metadata.parts.length, 2);
  assert.equal(metadata.parts[0].size, PART_BYTES);
  await reconstructRecovery({ input, output });
  assert.equal(hash(await readFile(path.join(output, files[0].path))), hash(payload));
  const later = path.join(input, metadata.parts[1].file);
  const bytes = await readFile(later);
  bytes[bytes.length - 1] ^= 1;
  await writeFile(later, bytes);
  const failedOutput = path.join(root, 'second-restored');
  await assert.rejects(reconstructRecovery({ input, output: failedOutput }), /part failed verification/);
  await assertClean(root, failedOutput);
});

test('blob SHA is verified even when archive, parts and CRC are valid', async t => {
  const { root, input, output } = await fixture(t);
  await packageFixture(input, [basicFiles[0]], {
    mutateManifest: manifest => { manifest.files[0].sha256 = '0'.repeat(64); },
    mutateEntries: entries => { entries[1].name = `blobs/${'0'.repeat(64)}`; },
  });
  await assert.rejects(reconstructRecovery({ input, output }), /content failed verification/);
  await assertClean(root, output);
});

test('existing destinations are preserved including their original contents', async t => {
  const { input, output } = await fixture(t);
  await packageFixture(input, basicFiles);
  await mkdir(output);
  await writeFile(path.join(output, 'sentinel'), 'synthetic-original');
  await assert.rejects(reconstructRecovery({ input, output }), /already exists/);
  assert.equal(await readFile(path.join(output, 'sentinel'), 'utf8'), 'synthetic-original');
});

test('logical traversal, Windows device aliases, Git markers and case collisions are refused', async t => {
  for (const unsafe of ['private/../escape', 'private/CON.txt', 'private/CON .txt', 'private/NUL .json', 'private/com¹', 'private/.GiT/config', 'private/file.', 'private/file ', 'private/a:b', 'private/a\\b', '/private/absolute', 'private//empty', 'private/\ud800.txt', 'private/\udc00.txt']) {
    assert.throws(() => validateLogicalPath(unsafe));
  }
  for (const paths of [['private/CON.txt'], ['private/File.txt', 'private/file.txt'], ['private/A/x', 'private/a/y']]) {
    const { root, input, output } = await fixture(t);
    await packageFixture(input, paths.map(name => ({ path: name, bytes: 'synthetic-content' })));
    await assert.rejects(reconstructRecovery({ input, output }), /validation failed/);
    await assertClean(root, output);
  }
});

test('ZIP traversal, symbolic links, encryption, extras, CRC damage and oversized expansion are rejected', async t => {
  const mutations = [
    entries => { entries[1].name = '../synthetic-escape'; },
    entries => { entries[1].mode = 0o120777; },
    entries => { entries[1].flags = 1; },
    entries => { entries[1].extra = Buffer.from([0x55, 0x54, 0, 0]); },
    entries => { entries[1].crc = 1; },
    entries => { entries[1].size = 1; },
    entries => { entries.push({ ...entries[1] }); },
  ];
  for (const mutateEntries of mutations) {
    const { root, input, output } = await fixture(t);
    await packageFixture(input, [basicFiles[0]], { mutateEntries });
    await assert.rejects(reconstructRecovery({ input, output }));
    await assertClean(root, output);
  }
});

test('Git ancestors are rejected for input and output, including worktree marker files', async t => {
  for (const target of ['input', 'parent', 'checkout']) {
    const { root, input, output } = await fixture(t);
    await packageFixture(input, basicFiles);
    if (target === 'checkout') {
      await mkdir(path.join(root, '.git'));
      await writeFile(path.join(root, '.git', 'HEAD'), 'ref: refs/heads/synthetic');
    } else await writeFile(path.join(target === 'input' ? input : root, '.git'), 'gitdir: synthetic');
    await assert.rejects(reconstructRecovery({ input, output }), /outside Git/);
    await assert.rejects(stat(output), { code: 'ENOENT' });
  }
});

test('symlinked or junction input and output ancestors are refused', async t => {
  const { root, input, output } = await fixture(t);
  await packageFixture(input, basicFiles);
  const alias = path.join(root, 'alias');
  await symlink(input, alias, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(reconstructRecovery({ input: alias, output }), /ordinary directories/);
  await assert.rejects(reconstructRecovery({ input, output: path.join(alias, 'new') }), /ordinary directories/);
  await assertClean(root, output);
});

// Creating file symlinks requires Developer Mode or elevation on Windows;
// directory junctions above exercise the ordinary Windows boundary without it.
test('symlinked package parts are refused', { skip: process.platform === 'win32' }, async t => {
  const { root, input, output } = await fixture(t);
  await packageFixture(input, basicFiles);
  const partPath = path.join(input, 'recovery.part-001');
  const saved = path.join(root, 'synthetic-saved-part');
  await writeFile(saved, await readFile(partPath)); await rm(partPath); await symlink(saved, partPath);
  await assert.rejects(reconstructRecovery({ input, output }));
  await assertClean(root, output);
});

function sourceBundle({ method = 8, crc, extra, member = 'data/synthetic.sqlite' } = {}) {
  const database = Buffer.from('SYNTHETIC SQLite-like source bytes; never evaluated.');
  const source = syntheticZip([
    { name: 'data/', bytes: '', method: 0, mode: 0o40700 },
    { name: member, bytes: database, method, crc, extra },
    { name: 'unselected/synthetic-script.js', bytes: 'throw Error("SYNTHETIC must never execute");', method: 0 },
  ]);
  const files = [basicFiles[0], { path: 'private/originals/synthetic-source.zip', bytes: source }];
  const derivedFiles = [{
    path: 'private/runtime/synthetic.sqlite', size: database.length, sha256: hash(database), mtimeNs: inventedTime,
    fromZip: { archive: files[1].path, member },
  }];
  return { database, source, files, derivedFiles };
}

test('derived files restore from preserved ZIP members using stored or deflated bytes, without extracting other members', async t => {
  for (const method of [0, 8]) {
    const { input, output } = await fixture(t);
    const bundle = sourceBundle({ method, extra: Buffer.from([0x55, 0x54, 5, 0, 3, 0, 0, 0, 0, 0x75, 0x78, 3, 0, 1, 0, 0]) });
    await packageFixture(input, bundle.files, { derivedFiles: bundle.derivedFiles });
    const result = await reconstructRecovery({ input, output });
    assert.equal(result.files, 3); assert.equal(result.uniqueBlobs, 2);
    assert.deepEqual(await readFile(path.join(output, bundle.derivedFiles[0].path)), bundle.database);
    assert.deepEqual(await readFile(path.join(output, bundle.files[1].path)), bundle.source);
    await assert.rejects(stat(path.join(output, 'unselected')), { code: 'ENOENT' });
  }
});

test('derived wrong member, checksum, target, archive reference, cycles, CRC and ZIP64 extras are rejected', async t => {
  const changes = [
    bundle => { bundle.derivedFiles[0].fromZip.member = 'data/missing.sqlite'; },
    bundle => { bundle.derivedFiles[0].sha256 = '0'.repeat(64); },
    bundle => { bundle.derivedFiles[0].path = 'private/../escape'; },
    bundle => { bundle.derivedFiles[0].fromZip.member = '../escape'; },
    bundle => { bundle.derivedFiles[0].fromZip.archive = 'private/originals/missing.zip'; },
    bundle => { bundle.derivedFiles[0].fromZip.archive = bundle.derivedFiles[0].path; },
    bundle => { bundle.derivedFiles[0].path = bundle.files[1].path; },
  ];
  for (const change of changes) {
    const { root, input, output } = await fixture(t);
    const bundle = sourceBundle(); change(bundle);
    await packageFixture(input, bundle.files, { derivedFiles: bundle.derivedFiles });
    await assert.rejects(reconstructRecovery({ input, output }));
    await assertClean(root, output);
  }
  for (const options of [{ crc: 1 }, { extra: Buffer.from([1, 0, 0, 0]) }]) {
    const { root, input, output } = await fixture(t);
    const bundle = sourceBundle(options);
    await packageFixture(input, bundle.files, { derivedFiles: bundle.derivedFiles });
    await assert.rejects(reconstructRecovery({ input, output }));
    await assertClean(root, output);
  }
});

test('CLI failures return nonzero without exposing private input paths or filesystem exception details', async t => {
  const { input, output } = await fixture(t);
  const script = fileURLToPath(new URL('../scripts/reconstruct-recovery.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [script, '--input', input, '--output', output], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(result.stderr.includes(input), false);
  assert.equal(result.stderr.includes('ENOENT'), false);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /Recovery could not complete/);
});

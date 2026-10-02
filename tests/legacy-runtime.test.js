import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { importLegacy, syncDirectory } from '../scripts/import-legacy.js';
import { openLegacyRuntime, validatePresentation, sha256, checkedChild } from '../src/legacy-runtime.js';
import { REPO_ROOT } from '../src/storage.js';
import { createPortalServer } from '../src/server.js';
import { writeSyntheticLegacyDatabase } from './helpers/legacy-fixture.js';

async function fixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'market-structure-release-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const database = path.join(dir, 'source.sqlite');
  writeSyntheticLegacyDatabase(database);
  const presentation = path.join(dir, 'presentation');
  await mkdir(presentation);
  const code = await readFile(path.join(REPO_ROOT, 'public/legacy/module-000.js'));
  const shell = '<!doctype html><html><body><p>Synthetic private presentation test</p></body></html>';
  const css = 'p { color: navy; }';
  const ui = { schemaVersion: 1, modules: [{ id: 'module-000', file: 'module-000.js', sha256: sha256(code) }],
    literals: { 'module-000': [] }, jsonScripts: [], extraComponents: {}, shellSha256: sha256(shell), stylesSha256: sha256(css) };
  for (const [file, bytes] of Object.entries({ 'ui-content.json': JSON.stringify(ui), 'shell.html': shell, 'styles.css': css })) await writeFile(path.join(presentation, file), bytes);
  return { dir, database, presentation, dataDir: path.join(dir, 'runtime'), ui, shell, css, code };
}

test('legacy import preserves source bytes, activates reconciled data and retains immutable previous releases', async t => {
  const f = await fixture(t);
  const before = sha256(await readFile(f.database));
  const result = await importLegacy(f);
  assert.equal(result.counts.observations, 3);
  assert.equal(result.directorySync, process.platform === 'win32' ? 'not-supported-on-windows' : 'completed');
  assert.equal(sha256(await readFile(f.database)), before);
  const first = await openLegacyRuntime(f.dataDir);
  assert.equal(first.snapshot().components.DB.synthetic, true);
  assert.equal(first.status().refresh.status, 'not-connected');
  assert.equal(first.observations({ entity: 'CME', limit: 1 }).rows.length, 1);
  assert.deepEqual(first.asset('module-000.js'), f.code);
  assert.equal(first.asset('../src/server.js'), undefined);
  first.close();
  await importLegacy(f);
  assert.equal((await readdir(path.join(f.dataDir, 'releases'))).length, 2);
});

test('legacy import rejects an active source WAL and leaves the previous manifest intact', async t => {
  const f = await fixture(t);
  await importLegacy(f);
  const before = await readFile(path.join(f.dataDir, 'legacy.json'));
  const db = new DatabaseSync(f.database);
  t.after(() => db.close());
  db.exec('PRAGMA journal_mode=WAL; PRAGMA wal_autocheckpoint=0;');
  db.prepare('UPDATE sources SET document=?').run('Synthetic committed WAL revision');
  await assert.rejects(importLegacy(f), /journal/);
  assert.deepEqual(await readFile(path.join(f.dataDir, 'legacy.json')), before);
  assert.equal((await readdir(path.join(f.dataDir, 'releases'))).length, 1);
});

test('runtime verifies the complete imported database digest, including unindexed metadata', async t => {
  const f = await fixture(t);
  await importLegacy(f);
  const manifest = JSON.parse(await readFile(path.join(f.dataDir, 'legacy.json'), 'utf8'));
  const db = new DatabaseSync(path.join(f.dataDir, manifest.database));
  db.prepare('UPDATE sources SET document=?').run('Synthetic changed source metadata');
  db.close();
  await assert.rejects(openLegacyRuntime(f.dataDir), /SHA-256|fingerprint|hash/i);
});

test('presentation verification binds private literals, shell and cached executable bytes', async t => {
  const f = await fixture(t);
  const codeRoot = path.join(f.dir, 'code');
  await mkdir(codeRoot);
  await writeFile(path.join(codeRoot, 'module-000.js'), f.code);
  const verified = await validatePresentation(f.presentation, { codeRoot });
  await writeFile(path.join(codeRoot, 'module-000.js'), '// Synthetic changed module');
  assert.deepEqual(verified.assets.get('module-000.js'), f.code);
  await assert.rejects(validatePresentation(f.presentation, { codeRoot }), /reviewed application code differ/);
  await writeFile(path.join(f.presentation, 'shell.html'), '<script>Synthetic forbidden shell</script>');
  await assert.rejects(validatePresentation(f.presentation), /integrity/);
});

test('private artifact paths and altered presentation manifests cannot escape the external release', async t => {
  const f = await fixture(t);
  await symlink(REPO_ROOT, path.join(f.presentation, 'checkout'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(checkedChild(f.presentation, 'checkout/README.md'), /escapes/);
  await assert.rejects(checkedChild(f.presentation, '../source.sqlite'), /Invalid/);
  f.ui.modules[0].file = '../../src/server.js';
  await writeFile(path.join(f.presentation, 'ui-content.json'), JSON.stringify(f.ui));
  await assert.rejects(importLegacy(f), /module manifest/);
});

test('full legacy HTTP contract serves reviewed application and snapshot, never original database or reports', async t => {
  const f = await fixture(t);
  await importLegacy(f);
  const server = await createPortalServer({ dataDir: f.dataDir });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.match(await (await fetch(base)).text(), /legacy-bootstrap/);
  const status = await (await fetch(`${base}/api/status`)).json();
  assert.equal(status.format, 'legacy-sqlite');
  const response = await fetch(`${base}/api/legacy/bootstrap`);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const data = await response.json();
  assert.equal(data.snapshot.components.DB.synthetic, true);
  assert.equal(data.presentation.content.modules[0].id, 'module-000');
  assert.equal(data.snapshot.templates, undefined);
  assert.equal(data.snapshot.raw_files, undefined);
  assert.equal((await fetch(`${base}/legacy/module-000.js`)).status, 200);
  assert.equal((await fetch(`${base}/legacy/module-999.js`)).status, 404);
  for (const route of ['/legacy.json', '/database.sqlite', '/originals/report.pdf', '/api/legacy/raw_files', '/api/legacy/template']) assert.equal((await fetch(`${base}${route}`)).status, 404);
  assert.equal((await fetch(`${base}/api/legacy/bootstrap`, { headers: { Origin: 'https://invalid.example' } })).status, 403);
});


test('directory flush skips the unsupported Windows operation only on win32', async () => {
  let opened = false;
  const result = await syncDirectory('synthetic-directory', {
    platform: 'win32',
    openDirectory: async () => { opened = true; throw new Error('Synthetic unexpected directory open'); },
  });
  assert.equal(result, 'not-supported-on-windows');
  assert.equal(opened, false);
  for (const platform of ['linux', 'darwin', 'freebsd']) {
    const operations = [];
    const completed = await syncDirectory('synthetic-directory', {
      platform,
      openDirectory: async (directory, flags) => {
        operations.push(['open', directory, flags]);
        return {
          sync: async () => { operations.push(['sync']); },
          close: async () => { operations.push(['close']); },
        };
      },
    });
    assert.equal(completed, 'completed');
    assert.deepEqual(operations, [['open', 'synthetic-directory', 'r'], ['sync'], ['close']]);
  }
});

test('POSIX directory open, flush and close failures remain observable', async () => {
  const openError = Object.assign(new Error('Synthetic denied directory'), { code: 'EACCES' });
  await assert.rejects(syncDirectory('synthetic-directory', {
    platform: 'linux', openDirectory: async () => { throw openError; },
  }), error => error === openError);

  let closed = 0;
  const syncError = Object.assign(new Error('Synthetic unsupported POSIX flush'), { code: 'ENOTSUP' });
  await assert.rejects(syncDirectory('synthetic-directory', {
    platform: 'linux',
    openDirectory: async () => ({
      sync: async () => { throw syncError; },
      close: async () => { closed++; },
    }),
  }), error => error === syncError);
  assert.equal(closed, 1);

  const closeError = Object.assign(new Error('Synthetic close failure'), { code: 'EIO' });
  await assert.rejects(syncDirectory('synthetic-directory', {
    platform: 'linux',
    openDirectory: async () => ({ sync: async () => {}, close: async () => { throw closeError; } }),
  }), error => error === closeError);
});

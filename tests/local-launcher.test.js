import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { sha256 } from '../src/legacy-runtime.js';
import { REPO_ROOT } from '../src/storage.js';
import { writeSyntheticLegacyDatabase } from './helpers/legacy-fixture.js';
import { assertNode24, parseOptions, browserCommand, launchLocal } from '../scripts/launch-local.js';

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'synthetic local launcher '));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const database = path.join(directory, 'synthetic.sqlite');
  writeSyntheticLegacyDatabase(database);
  const presentation = path.join(directory, 'presentation');
  await mkdir(presentation);
  const code = await readFile(path.join(REPO_ROOT, 'public/legacy/module-000.js'));
  const shell = '<!doctype html><html><body>Synthetic launcher fixture</body></html>';
  const css = 'body { color: navy; }';
  const content = { schemaVersion: 1, modules: [{ id: 'module-000', file: 'module-000.js', sha256: sha256(code) }],
    literals: { 'module-000': [] }, jsonScripts: [], shellSha256: sha256(shell), stylesSha256: sha256(css) };
  for (const [name, value] of Object.entries({ 'ui-content.json': JSON.stringify(content), 'shell.html': shell, 'styles.css': css })) {
    await writeFile(path.join(presentation, name), value);
  }
  const dataDir = path.join(directory, 'private', 'runtime');
  // Build an already-restored synthetic release. The launcher must not depend
  // on importer directory-fsync behavior, which is a separate host workflow.
  const release = 'synthetic-local-release';
  const releaseDirectory = path.join(dataDir, 'releases', release);
  await mkdir(releaseDirectory, { recursive: true });
  await copyFile(database, path.join(releaseDirectory, 'database.sqlite'));
  for (const name of ['ui-content.json', 'shell.html', 'styles.css']) {
    await copyFile(path.join(presentation, name), path.join(releaseDirectory, name));
  }
  await writeFile(path.join(dataDir, 'legacy.json'), JSON.stringify({
    schemaVersion: 1, format: 'legacy-sqlite', release,
    database: `releases/${release}/database.sqlite`,
    presentation: `releases/${release}/ui-content.json`,
    databaseSha256: sha256(await readFile(database)),
    presentationSha256: sha256(await readFile(path.join(presentation, 'ui-content.json'))),
    importedAt: '2026-09-01T00:00:00Z', refresh: 'not-connected',
  }));
  return { directory, dataDir };
}

test('local launcher requires Node 24 and resolves the sibling private package layout', () => {
  assert.doesNotThrow(() => assertNode24('24.19.0'));
  for (const version of ['22.0.0', '25.0.0', '124.0.0', 'invalid']) assert.throws(() => assertNode24(version), /Node.js 24/);
  const application = path.resolve(os.tmpdir(), 'synthetic portable package', 'application');
  assert.deepEqual(parseOptions([], application), { dataDir: path.resolve(application, '..', 'private', 'runtime'), browser: true, help: false });
  assert.equal(parseOptions(['--no-browser'], application).browser, false);
  assert.throws(() => parseOptions(['--data-dir', 'relative']), /absolute/);
  assert.throws(() => parseOptions(['--unknown']), /Use/);
});

test('browser command permits only a numeric owned loopback URL, including Windows start quoting', () => {
  assert.deepEqual(browserCommand('http://127.0.0.1:54321/', 'win32'), {
    command: 'cmd.exe', args: ['/d', '/c', 'start', '', 'http://127.0.0.1:54321/'],
  });
  for (const url of ['https://example.invalid/', 'http://127.0.0.1:0/', 'http://127.0.0.1:65536/',
    'http://127.0.0.1:3000/&calc', 'http://127.0.0.1:3000/;echo', 'http://localhost:3000/']) {
    assert.throws(() => browserCommand(url, 'win32'), /owned loopback/);
  }
});

test('local launcher fails closed for absent or non-legacy private data', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'synthetic-launcher-missing-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(path.join(directory, 'dataset.json'), JSON.stringify({ synthetic: true }));
  await assert.rejects(launchLocal({ dataDir: directory, browser: false }), /No demonstration was started/);
  await writeFile(path.join(directory, 'legacy.json'), JSON.stringify({ schemaVersion: 1, format: 'synthetic' }));
  await assert.rejects(launchLocal({ dataDir: directory, browser: false }), /No demonstration was started/);
  await assert.rejects(launchLocal({ dataDir: REPO_ROOT, browser: false }), /outside Git/);
});

test('local launch owns distinct loopback ports, validates private health, and closes the listeners', async t => {
  const f = await fixture(t);
  const messages = [];
  const first = await launchLocal({ dataDir: f.dataDir, browser: false, message: value => messages.push(value) });
  t.after(() => first.stop());
  const second = await launchLocal({ dataDir: f.dataDir, browser: false, message: () => {} });
  t.after(() => second.stop());
  assert.equal(first.server.address().address, '127.0.0.1');
  assert.notEqual(first.url, second.url);
  const health = await (await fetch(`${first.url}api/health`)).json();
  assert.equal(health.mode, 'private');
  assert.equal(health.format, 'legacy-sqlite');
  assert.ok(messages.some(message => message.includes(first.url)));
  assert.ok(messages.every(message => !message.includes(f.dataDir)));
  await first.stop();
  await first.stop();
  assert.equal(first.server.listening, false);
  await assert.rejects(fetch(`${first.url}api/health`));
});

test('launcher CLI starts without a browser and owns the private server it shuts down', async t => {
  const f = await fixture(t);
  const child = spawn(process.execPath, [path.join(REPO_ROOT, 'scripts/launch-local.js'), '--data-dir', f.dataDir, '--no-browser'], {
    cwd: f.directory, stdio: ['ignore', 'pipe', 'pipe'],
    // Any synthetic portable SQLite copy left by forced Windows termination
    // stays inside this test's external temporary tree for cleanup.
    env: { ...process.env, TMP: f.directory, TEMP: f.directory, TMPDIR: f.directory },
  });
  const exited = once(child, 'exit');
  let output = '';
  const ready = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Synthetic launcher did not become ready')), 15_000);
    child.stdout.on('data', data => {
      output += data.toString();
      const match = /ready: (http:\/\/127\.0\.0\.1:\d+\/)/.exec(output);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Synthetic launcher exited before ready: ${code}`)); });
  });
  try {
    const url = await ready;
    assert.equal((await (await fetch(`${url}api/health`)).json()).format, 'legacy-sqlite');
    await t.test('POSIX SIGINT reaches the graceful CLI shutdown handler', {
      skip: process.platform === 'win32'
        ? 'Windows child.kill(SIGINT) forcibly terminates a process; it does not emulate console Ctrl+C. Programmatic server.stop remains tested on Windows.'
        : false,
    }, async () => {
      child.kill('SIGINT');
      const [code, signal] = await exited;
      assert.equal(code, 0);
      assert.equal(signal, null);
      assert.match(output, /Private portal stopped/);
    });
    if (process.platform === 'win32') {
      child.kill('SIGTERM');
      await exited;
    }
    await assert.rejects(fetch(`${url}api/health`));
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    await exited.catch(() => {});
  }
});

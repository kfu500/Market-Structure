import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, readdir, rm, symlink, mkdir, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { createPortalServer } from '../src/server.js';
import { externalPath, REPO_ROOT } from '../src/storage.js';
import { importDataset } from '../scripts/import-data.js';

const fixture = () => readFile(path.join(REPO_ROOT, 'examples/synthetic.json'), 'utf8').then(JSON.parse);
async function temp(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'market-structure-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
async function serve(t, options = {}) {
  const server = await createPortalServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}
async function rawStatus(url, headers) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, { headers }, response => { response.resume(); resolve(response.statusCode); });
    request.on('error', reject);
  });
}

test('demo server loads all company data with explicit synthetic and unconnected-refresh status', async t => {
  const url = await serve(t);
  const data = await (await fetch(`${url}/api/data`)).json();
  assert.equal(data.dataset.kind, 'synthetic');
  assert.deepEqual([...new Set(data.observations.map(row => row.entity))].sort(), ['CBOE', 'CME', 'HOOD', 'ICE', 'NDAQ', 'PREDICTION', 'TW']);
  const status = await (await fetch(`${url}/api/status`)).json();
  assert.equal(status.refresh.status, 'not-connected');
  assert.equal(status.refresh.lastSuccessfulAt, null);
  assert.equal(status.validation.errors.length, 0);
  const snapshot = await (await fetch(`${url}/api/snapshot`)).json();
  assert.equal(snapshot.status.datasetName, snapshot.data.dataset.name);
  assert.equal(snapshot.status.mode, snapshot.data.dataset.kind);
  assert.equal(snapshot.status.asOf, snapshot.data.dataset.asOf);
  for (const route of ['/', '/app.js', '/styles.css', '/src/domain.js']) {
    const result = await fetch(`${url}${route}`);
    assert.equal(result.status, 200, route);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.match(result.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.ok((await result.text()).length > 0);
  }
});

test('only explicit assets/API exposed; data, source, reports, and cross-origin requests blocked', async t => {
  const url = await serve(t);
  for (const route of ['/README.md', '/.git/config', '/.env', '/examples/synthetic.json', '/dataset.json', '/originals/report.pdf', '/src/server.js', '/%2e%2e/package.json']) {
    assert.equal((await fetch(`${url}${route}`)).status, 404, route);
  }
  assert.equal((await fetch(`${url}/api/data`, { method: 'POST', body: '{}' })).status, 405);
  assert.equal((await fetch(`${url}/api/data`, { headers: { Origin: 'https://untrusted.example' } })).status, 403);
  // Node fetch owns the Host header; use a raw HTTP request to test rebinding.
  assert.equal(await rawStatus(`${url}/api/data`, { Host: 'untrusted.example' }), 403);
  assert.equal(await rawStatus(`${url}/api/data`, { 'Sec-Fetch-Site': 'cross-site' }), 403);
  assert.equal((await fetch(`${url}/api/data`)).headers.get('access-control-allow-origin'), null);
});

test('import preserves original bytes/hash, protects permissions, and backs up prior snapshot', async t => {
  const dir = await temp(t);
  const dataDir = path.join(dir, 'private');
  const input = path.join(dir, 'input.json');
  const dataset = await fixture();
  dataset.dataset.kind = 'private';
  const original = Buffer.from(JSON.stringify(dataset));
  await writeFile(input, original);
  const result = await importDataset({ input, dataDir });
  assert.equal(result.sha256, createHash('sha256').update(original).digest('hex'));
  assert.deepEqual(await readFile(input), original);
  const originals = await readdir(path.join(dataDir, 'originals'));
  assert.equal(originals.length, 1);
  assert.deepEqual(await readFile(path.join(dataDir, 'originals', originals[0])), original);
  // Byte-preserving snapshots cannot expand beyond the accepted input size cap.
  assert.deepEqual(await readFile(path.join(dataDir, 'dataset.json')), original);
  assert.equal((await stat(path.join(dataDir, 'dataset.json'))).mode & 0o777, 0o600);
  const previous = await readFile(path.join(dataDir, 'dataset.json'));
  dataset.dataset.name = 'Synthetic test revision';
  await writeFile(input, JSON.stringify(dataset));
  await importDataset({ input, dataDir });
  const backups = await readdir(path.join(dataDir, 'backups'));
  assert.equal(backups.length, 1);
  assert.deepEqual(await readFile(path.join(dataDir, 'backups', backups[0])), previous);
  assert.equal((await readdir(path.join(dataDir, 'originals'))).length, 2);
  const url = await serve(t, { dataDir });
  const status = await (await fetch(`${url}/api/status`)).json();
  assert.equal(status.mode, 'private');
  assert.equal(status.storage, 'external');
  assert.equal((await (await fetch(`${url}/api/data`)).json()).dataset.name, 'Synthetic test revision');
  assert.equal((await fetch(`${url}/originals/${originals[0]}`)).status, 404);
});

test('failed imports retain last valid snapshot and server fails closed if disk snapshot becomes invalid', async t => {
  const dir = await temp(t);
  const dataDir = path.join(dir, 'private');
  const input = path.join(dir, 'input.json');
  const dataset = await fixture();
  await writeFile(input, JSON.stringify(dataset));
  await importDataset({ input, dataDir });
  const previous = await readFile(path.join(dataDir, 'dataset.json'));
  const url = await serve(t, { dataDir });
  dataset.observations.push(dataset.observations[0]);
  await writeFile(input, JSON.stringify(dataset));
  await assert.rejects(importDataset({ input, dataDir }), /validation error/);
  assert.deepEqual(await readFile(path.join(dataDir, 'dataset.json')), previous);
  await writeFile(path.join(dataDir, 'dataset.json'), '{broken');
  const response = await fetch(`${url}/api/data`);
  assert.equal(response.status, 503);
  const error = await response.text();
  assert.doesNotMatch(error, new RegExp(dir));
  assert.doesNotMatch(error, /observations|Synthetic monthly/);
});

test('private paths reject checkout destinations, symlink escapes, other Git checkouts, and repo input', async t => {
  const dir = await temp(t);
  await assert.rejects(externalPath(path.join(REPO_ROOT, 'private'), { directory: true, create: true }), /outside the repository/);
  const link = path.join(dir, 'link');
  await symlink(REPO_ROOT, link);
  await assert.rejects(externalPath(path.join(link, 'private'), { directory: true, create: true }), /outside the repository/);
  const other = path.join(dir, 'another-checkout');
  await mkdir(path.join(other, '.git'), { recursive: true });
  await writeFile(path.join(other, '.git/HEAD'), 'ref: refs/heads/main\n');
  await assert.rejects(externalPath(path.join(other, 'private'), { directory: true, create: true }), /Git checkout/);
  const linkedGit = path.join(dir, 'linked-git-checkout');
  await mkdir(linkedGit);
  await symlink(path.join(other, '.git'), path.join(linkedGit, '.git'));
  await assert.rejects(externalPath(path.join(linkedGit, 'private'), { directory: true, create: true }), /Git checkout/);
  await assert.rejects(importDataset({ input: path.join(REPO_ROOT, 'examples/synthetic.json'), dataDir: path.join(dir, 'private') }), /outside the repository/);
  await assert.rejects(createPortalServer({ dataDir: path.join(dir, 'missing') }));
  await assert.rejects(createPortalServer({ dataDir: '' }), /absolute path/);
  const privateDir = path.join(dir, 'private');
  await mkdir(privateDir);
  await symlink(path.join(REPO_ROOT, 'examples/synthetic.json'), path.join(privateDir, 'dataset.json'));
  await assert.rejects(createPortalServer({ dataDir: privateDir }), /configured private directory/);
});

test('server reads the next atomically imported snapshot without restart', async t => {
  const dir = await temp(t);
  const dataDir = path.join(dir, 'private');
  const input = path.join(dir, 'input.json');
  const dataset = await fixture();
  await writeFile(input, JSON.stringify(dataset));
  await importDataset({ input, dataDir });
  const url = await serve(t, { dataDir });
  dataset.dataset.name = 'Synthetic updated snapshot';
  await writeFile(input, JSON.stringify(dataset));
  await importDataset({ input, dataDir });
  assert.equal((await (await fetch(`${url}/api/data`)).json()).dataset.name, 'Synthetic updated snapshot');
});

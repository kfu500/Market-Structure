import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, realpath, stat } from 'node:fs/promises';
import { validateDataset } from './domain.js';
import { externalPath, isWithin, readJsonFile, REPO_ROOT } from './storage.js';
import { openLegacyRuntime } from './legacy-runtime.js';

const ASSETS = new Map([
  ['/', ['public/index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['public/index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['public/app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['public/styles.css', 'text/css; charset=utf-8']],
  ['/src/domain.js', ['src/domain.js', 'text/javascript; charset=utf-8']],
  ['/src/legacy-analytics.js', ['src/legacy-analytics.js', 'text/javascript; charset=utf-8']],
  ['/legacy-bootstrap.js', ['public/legacy-bootstrap.js', 'text/javascript; charset=utf-8']],
  ['/legacy-hooks.js', ['public/legacy-hooks.js', 'text/javascript; charset=utf-8']],
  ['/legacy-bridge.css', ['public/legacy-bridge.css', 'text/css; charset=utf-8']],
]);

const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export async function createPortalServer({ dataDir = process.env.MARKET_STRUCTURE_DATA_DIR } = {}) {
  // Explicit private configuration always fails closed. Never substitute demo
  // data for an unreadable/invalid private snapshot.
  const privateRoot = dataDir !== undefined ? await externalPath(dataDir, { directory: true }) : null;
  const datasetPath = privateRoot ? path.join(privateRoot, 'dataset.json') : path.join(REPO_ROOT, 'examples/synthetic.json');
  let legacy = null;
  let legacyFingerprint = null;
  let pendingLegacy = null;
  async function getLegacy() {
    if (!privateRoot) return null;
    let fingerprint;
    try {
      const info = await stat(path.join(privateRoot, 'legacy.json'));
      fingerprint = `${info.ino}:${info.size}:${info.mtimeMs}:${new Date().toISOString().slice(0, 10)}`;
    } catch (error) {
      if (error.code === 'ENOENT' && !legacy) return null;
      throw error;
    }
    if (fingerprint === legacyFingerprint && legacy) return legacy;
    if (!pendingLegacy) pendingLegacy = openLegacyRuntime(privateRoot).then(next => {
      legacy?.close(); legacy = next; legacyFingerprint = fingerprint; return legacy;
    }).finally(() => { pendingLegacy = null; });
    return pendingLegacy;
  }
  async function loadSnapshot() {
    if (privateRoot) {
      const resolved = await realpath(datasetPath);
      if (!isWithin(privateRoot, resolved)) throw new Error('Snapshot must remain in its configured private directory.');
      await externalPath(resolved);
    }
    const dataset = await readJsonFile(datasetPath);
    const validation = validateDataset(dataset);
    if (validation.errors.length) throw new Error('Snapshot failed data validation. Run the importer to inspect validation errors.');
    if (!privateRoot && dataset.dataset.kind !== 'synthetic') throw new Error('Repository examples must be synthetic.');
    return { dataset, status: {
      mode: dataset.dataset.kind,
      storage: privateRoot ? 'external' : 'example',
      loadedAt: new Date().toISOString(),
      datasetName: dataset.dataset.name,
      asOf: dataset.dataset.asOf,
      refresh: { status: 'not-connected', lastSuccessfulAt: null },
      validation,
    } };
  }
  if (!await getLegacy()) await loadSnapshot();
  const server = http.createServer(async (request, response) => {
    const send = (code, body, type = 'application/json; charset=utf-8') => {
      const headers = { ...SECURITY_HEADERS, 'Content-Type': type };
      // Reviewed legacy widgets use dynamic inline CSS. Executable inline code
      // remains forbidden; all scripts are audited same-origin assets.
      if (legacy) headers['Content-Security-Policy'] = SECURITY_HEADERS['Content-Security-Policy'].replace("style-src 'self'", "style-src 'self' 'unsafe-inline'");
      response.writeHead(code, headers);
      response.end(request.method === 'HEAD' ? undefined : body);
    };
    // Prevent browser cross-origin requests/DNS rebinding to the local API.
    const host = request.headers.host || '';
    if (!/^(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(host)) {
      send(403, JSON.stringify({ error: 'Access through the configured loopback host is required.' })); return;
    }
    const origin = request.headers.origin;
    if ((origin && origin !== `http://${host}`) || request.headers['sec-fetch-site'] === 'cross-site') {
      send(403, JSON.stringify({ error: 'Cross-origin access is disabled.' })); return;
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.setHeader('Allow', 'GET, HEAD');
      send(405, JSON.stringify({ error: 'Read-only server.' })); return;
    }
    try {
      const url = new URL(request.url, `http://${host}`);
      const runtime = await getLegacy();
      if (runtime) {
        if (['/', '/index.html'].includes(url.pathname)) { send(200, await readFile(path.join(REPO_ROOT, 'public/legacy.html')), 'text/html; charset=utf-8'); return; }
        if (url.pathname === '/api/health') { send(200, JSON.stringify({ ok: true, mode: 'private', format: 'legacy-sqlite', refresh: 'not-connected' })); return; }
        if (url.pathname === '/api/status') { send(200, JSON.stringify(runtime.status())); return; }
        if (url.pathname === '/api/legacy/snapshot') { send(200, JSON.stringify(runtime.snapshot())); return; }
        if (url.pathname === '/api/legacy/bootstrap') { send(200, JSON.stringify({ snapshot: runtime.snapshot(), presentation: runtime.presentation() })); return; }
        if (url.pathname === '/api/legacy/presentation') { send(200, JSON.stringify(runtime.presentation())); return; }
        if (url.pathname === '/api/legacy/styles.css') { send(200, runtime.css(), 'text/css; charset=utf-8'); return; }
        if (/^\/legacy\/module-\d{3}\.js$/.test(url.pathname)) {
          const code = runtime.asset(path.basename(url.pathname));
          if (!code) send(404, JSON.stringify({ error: 'Not found.' }));
          else send(200, code, 'text/javascript; charset=utf-8');
          return;
        }
        if (url.pathname === '/api/legacy/observations') {
          const options = { limit: Number(url.searchParams.get('limit') || 100), offset: Number(url.searchParams.get('offset') || 0) };
          for (const field of ['entity', 'metricId', 'frequency']) if (url.searchParams.has(field)) options[field] = url.searchParams.get(field);
          send(200, JSON.stringify(runtime.observations(options))); return;
        }
        if (/^\/api\/(?:snapshot|data)$/.test(url.pathname)) { send(409, JSON.stringify({ error: 'This snapshot uses the full legacy data contract.' })); return; }
      }
      if (/^\/api\/legacy\//.test(url.pathname)) { send(404, JSON.stringify({ error: 'No private legacy snapshot is configured.' })); return; }
      if (/^\/legacy\/module-\d{3}\.js$/.test(url.pathname)) {
        try { send(200, await readFile(path.join(REPO_ROOT, 'public', url.pathname)), 'text/javascript; charset=utf-8'); }
        catch (error) { if (error.code === 'ENOENT') send(404, JSON.stringify({ error: 'Not found.' })); else throw error; }
        return;
      }
      if (['/api/data', '/api/status', '/api/health', '/api/snapshot'].includes(url.pathname)) {
        const snapshot = await loadSnapshot();
        const result = url.pathname === '/api/snapshot' ? { data: snapshot.dataset, status: snapshot.status } : url.pathname === '/api/data' ? snapshot.dataset : url.pathname === '/api/status' ? snapshot.status : { ok: true, mode: snapshot.status.mode, refresh: 'not-connected' };
        send(200, JSON.stringify(result)); return;
      }
      const asset = ASSETS.get(url.pathname);
      if (!asset) { send(404, JSON.stringify({ error: 'Not found.' })); return; }
      send(200, await readFile(path.join(REPO_ROOT, asset[0])), asset[1]);
    } catch {
      // Never leak paths, original content, stack traces, or previous data.
      send(503, JSON.stringify({ error: 'Snapshot unavailable or invalid. Check the external dataset using the import command; the portal has not substituted example data.' }));
    }
  });
  server.on('close', () => legacy?.close());
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) { console.error('PORT must be an integer from 1 to 65535.'); process.exitCode = 1; }
  else {
    try {
      const server = await createPortalServer();
      server.on('error', (error) => { console.error(`Server could not start (${error.code || 'configuration error'}).`); process.exitCode = 1; });
      server.listen(port, '127.0.0.1', () => console.log(`Market Structure portal listening on 127.0.0.1:${port}. Read-only snapshot; refresh is not connected.`));
      for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close());
    } catch (error) {
      console.error(`Portal startup failed: ${error.code ? 'Check the external data directory and dataset.json permissions.' : error.message}`);
      process.exitCode = 1;
    }
  }
}

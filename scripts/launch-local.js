#!/usr/bin/env node
/** Start a restored private portal on an OS-assigned loopback port. */
import { spawn } from 'node:child_process';
import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APPLICATION_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function assertNode24(version = process.versions.node) {
  if (!/^24\./.test(version)) throw new Error('Node.js 24 is required. Install Node 24, then reopen Start-Market-Structure.cmd.');
}

export function parseOptions(args, applicationRoot = APPLICATION_ROOT) {
  const options = { dataDir: path.resolve(applicationRoot, '..', 'private', 'runtime'), browser: true, help: false };
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--no-browser') options.browser = false;
    else if (args[index] === '--help') options.help = true;
    else if (args[index] === '--data-dir' && args[index + 1]) {
      const value = args[++index];
      if (!path.isAbsolute(value)) throw new Error('--data-dir must name an absolute private runtime directory outside Git.');
      options.dataDir = value;
    } else throw new Error('Use --data-dir ABSOLUTE_PRIVATE_RUNTIME, --no-browser, or --help.');
  }
  return options;
}

export function browserCommand(url, platform = process.platform) {
  // Keep shell syntax and user-controlled paths out of the Windows start command.
  const match = /^http:\/\/127\.0\.0\.1:([1-9][0-9]{0,4})\/$/.exec(url);
  if (!match || Number(match[1]) > 65535) throw new Error('Browser opening requires the owned loopback server URL.');
  if (platform === 'win32') return { command: 'cmd.exe', args: ['/d', '/c', 'start', '', url] };
  if (platform === 'darwin') return { command: 'open', args: [url] };
  return { command: 'xdg-open', args: [url] };
}

async function openBrowser(url) {
  const { command, args } = browserCommand(url);
  return new Promise(resolve => {
    let child;
    let timer;
    const finish = result => { clearTimeout(timer); resolve(result); };
    try {
      child = spawn(command, args, { stdio: 'ignore', windowsHide: true, shell: false });
      child.once('error', () => finish(false));
      child.once('exit', code => finish(code === 0));
      timer = setTimeout(() => {
        // Only terminate our short-lived opener if it hangs, never the browser.
        child.kill();
        finish(false);
      }, 5000);
    } catch { finish(false); }
  });
}

async function requirePrivateRuntime(dataDir) {
  const { externalPath } = await import('../src/storage.js');
  let root;
  try {
    root = await externalPath(dataDir, { directory: true });
    const manifestPath = path.join(root, 'legacy.json');
    const info = await lstat(manifestPath);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 64 * 1024) throw new Error();
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (manifest.schemaVersion !== 1 || manifest.format !== 'legacy-sqlite') throw new Error();
  } catch {
    throw new Error('Private runtime is missing or invalid. Extract the complete package with application and private folders together, outside Git. No demonstration was started.');
  }
  return root;
}

/** No port probe or child server: the listening socket belongs to this process. */
export async function launchLocal({ dataDir = path.resolve(APPLICATION_ROOT, '..', 'private', 'runtime'), browser = true, message = console.log } = {}) {
  assertNode24();
  const root = await requirePrivateRuntime(dataDir);
  let server;
  let stopping;
  const stop = () => {
    if (!stopping) stopping = new Promise(resolve => {
      if (!server) { resolve(); return; }
      const timeout = setTimeout(() => server.closeAllConnections(), 2000);
      timeout.unref();
      server.close(() => { clearTimeout(timeout); resolve(); });
      server.closeIdleConnections();
    });
    return stopping;
  };
  try {
    // Delay SQLite imports until after the version and private-layout checks.
    const { createPortalServer } = await import('../src/server.js');
    server = await createPortalServer({ dataDir: root });
    await new Promise((resolve, reject) => {
      const failed = error => reject(error);
      server.once('error', failed);
      server.listen(0, '127.0.0.1', () => { server.removeListener('error', failed); resolve(); });
    });
    const url = `http://127.0.0.1:${server.address().port}/`;
    const response = await fetch(`${url}api/health`, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    const health = response.ok ? await response.json() : null;
    if (health?.ok !== true || health.mode !== 'private' || health.format !== 'legacy-sqlite') throw new Error();
    message(`Private Market Structure portal is ready: ${url}`);
    message('Keep this window open. Press Ctrl+C here to stop. Refresh is not connected.');
    if (browser && !await openBrowser(url)) message('The browser did not open automatically. Copy the address above into your browser.');
    return { server, url, stop };
  } catch {
    await stop();
    throw new Error('The private portal could not start or pass validation. Keep application and private folders from the same package together, with Node 24 installed. No source files were changed and no demonstration was substituted.');
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  if (options.help) {
    console.log('Usage: node scripts/launch-local.js [--data-dir ABSOLUTE_PRIVATE_RUNTIME] [--no-browser]');
    console.log('Default private runtime: the sibling private/runtime folder. Requires Node 24.');
    return;
  }
  const portal = await launchLocal(options);
  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    await portal.stop();
    process.removeListener('SIGINT', shutdown);
    process.removeListener('SIGTERM', shutdown);
    console.log('Private portal stopped.');
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}

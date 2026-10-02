import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { open, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { externalPath, isWithin, REPO_ROOT } from './storage.js';
import { openLegacyStore } from './legacy-store.js';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export async function readPrivateFile(filename, maximum = 16 * 1024 * 1024) {
  const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.size > maximum) throw new Error('Private presentation file is not a regular file within the size limit.');
    const bytes = await handle.readFile();
    if (bytes.length > maximum) throw new Error('Private presentation file exceeds the size limit.');
    return bytes;
  } finally { await handle.close(); }
}

export async function checkedChild(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.split(/[\\/]/).some(part => part === '..' || part === '.')) throw new Error('Invalid private artifact path.');
  const resolved = await realpath(path.join(root, relative));
  if (!isWithin(root, resolved)) throw new Error('Private artifact escapes its configured directory.');
  return externalPath(resolved);
}

/** Verify the content pack corresponds exactly to reviewed executable assets. */
export async function validatePresentation(directory, { codeRoot = path.join(REPO_ROOT, 'public/legacy') } = {}) {
  const root = await externalPath(directory, { directory: true });
  const bytes = await readPrivateFile(await checkedChild(root, 'ui-content.json'));
  const ui = JSON.parse(bytes.toString('utf8'));
  if (ui.schemaVersion !== 1 || !Array.isArray(ui.modules) || !ui.modules.length || ui.modules.length > 100 || !ui.literals || !Array.isArray(ui.jsonScripts)) throw new Error('Unsupported private presentation contract.');
  const ids = new Set();
  const assets = new Map();
  for (const module of ui.modules) {
    if (!/^module-\d{3}$/.test(module.id) || module.file !== `${module.id}.js` || ids.has(module.id) || !/^[a-f0-9]{64}$/.test(module.sha256) || !Array.isArray(ui.literals[module.id])) throw new Error('Invalid reviewed module manifest.');
    ids.add(module.id);
    const code = await readFile(path.join(codeRoot, module.file));
    if (sha256(code) !== module.sha256) throw new Error('Private presentation and reviewed application code differ. Rebuild and review the presentation pack before loading.');
    assets.set(module.file, code);
  }
  if (Object.keys(ui.literals).some(id => !ids.has(id))) throw new Error('Unexpected literal pool.');
  const jsonIds = new Set();
  for (const item of ui.jsonScripts) {
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,100}$/.test(item.id) || jsonIds.has(item.id)) throw new Error('Invalid private JSON component identifier.');
    jsonIds.add(item.id);
  }
  const shellBytes = await readPrivateFile(await checkedChild(root, 'shell.html'));
  const styleBytes = await readPrivateFile(await checkedChild(root, 'styles.css'));
  if (sha256(shellBytes) !== ui.shellSha256 || sha256(styleBytes) !== ui.stylesSha256) throw new Error('Private presentation integrity check failed.');
  const shell = shellBytes.toString('utf8');
  const css = styleBytes.toString('utf8');
  if (/<(?:script|iframe|object|embed|base|link)\b|\bon[a-z]+\s*=|javascript\s*:/i.test(shell)) throw new Error('Private shell contains unsupported active content.');
  if (/@import\b|url\s*\(/i.test(css)) throw new Error('Private styles may not load external resources.');
  return { ui, shell, css, assets, presentationHash: sha256(bytes) };
}

export async function openLegacyRuntime(directory) {
  const root = await externalPath(directory, { directory: true });
  const config = JSON.parse((await readPrivateFile(await checkedChild(root, 'legacy.json'), 64 * 1024)).toString('utf8'));
  if (config.schemaVersion !== 1 || config.format !== 'legacy-sqlite') throw new Error('Unsupported legacy runtime configuration.');
  if (typeof config.databaseSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(config.databaseSha256)) throw new Error('Missing or invalid private database fingerprint.');
  const database = await checkedChild(root, config.database);
  const presentationFile = await checkedChild(root, config.presentation);
  if (path.basename(presentationFile) !== 'ui-content.json') throw new Error('Invalid private presentation filename.');
  const presentation = await validatePresentation(path.dirname(presentationFile));
  if (config.presentationSha256 !== presentation.presentationHash) throw new Error('Private runtime manifest integrity check failed.');
  const store = await openLegacyStore(database, { expectedFileHash: config.databaseSha256 });
  try {
    const snapshot = store.snapshot();
    const components = { ...snapshot.components, metricCalculations: snapshot.metricCalculations,
      databaseManifest: presentation.ui.extraComponents?.databaseManifest || snapshot.manifest };
    if (presentation.ui.jsonScripts.some(item => !Object.hasOwn(components, item.id))) throw new Error('Private presentation references unavailable data components.');
    return {
      manifest: config,
      status: () => ({ ...store.status(), format: 'legacy-sqlite', datasetName: 'Private Market Structure database', release: config.release }),
      snapshot: () => ({ ...snapshot, components }),
      presentation: () => ({ content: presentation.ui, shell: presentation.shell }),
      css: () => presentation.css,
      asset: name => presentation.assets.get(name),
      observations: options => store.observations(options),
      close: () => store.close(),
    };
  } catch (error) { store.close(); throw error; }
}

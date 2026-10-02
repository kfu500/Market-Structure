import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { Analytics, safeCsvCell } from '../src/legacy-analytics.js';

const fingerprint = text => bytesToHex(sha256(new TextEncoder().encode(text)));
const digestPattern = /^[a-f0-9]{64}$/;
const initializationFailure = 'A reviewed application module could not be initialized. Reload this page before trying again.';
let mounted = false;

/** Validate every executable against the build's reviewed sources before mounting.
 * Source HTML is data: its script bodies are never executed by this renderer.
 */
export function verifyPresentation({ snapshot, presentation, reviewedModules, hooks }) {
  const { content, shell, css } = presentation || {};
  if (!snapshot?.components?.DB || !snapshot.manifest?.counts || !snapshot.manifest?.validation
    || content?.schemaVersion !== 1 || !Array.isArray(content.modules) || !content.modules.length
    || content.modules.length > 100 || !content.literals || !Array.isArray(content.jsonScripts)
    || typeof shell !== 'string' || typeof css !== 'string'
    || !reviewedModules || typeof reviewedModules !== 'object') {
    throw new Error('The selected files do not provide a supported portal snapshot.');
  }
  const reviewedFiles = Object.keys(reviewedModules).sort();
  if (content.modules.length !== reviewedFiles.length) {
    throw new Error('The selected portal does not match this reviewed application version.');
  }
  const moduleIds = new Set();
  const scripts = content.modules.map((module, index) => {
    if (!/^module-\d{3}$/.test(module?.id) || module.file !== `${module.id}.js`
      || module.file !== reviewedFiles[index] || moduleIds.has(module.id)
      || !digestPattern.test(module.sha256) || !Array.isArray(content.literals[module.id])) {
      throw new Error('The selected portal has an unsupported reviewed module manifest.');
    }
    moduleIds.add(module.id);
    const source = reviewedModules[module.file];
    if (typeof source !== 'string' || fingerprint(source) !== module.sha256) {
      throw new Error('The selected portal does not match this reviewed application version.');
    }
    return { id: module.id, source };
  });
  if (Object.keys(content.literals).some(id => !moduleIds.has(id))) {
    throw new Error('The selected portal contains an unexpected literal pool.');
  }
  const jsonIds = new Set();
  for (const item of content.jsonScripts) {
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,100}$/.test(item?.id) || jsonIds.has(item.id)
      || !Object.hasOwn(snapshot.components, item.id)) {
      throw new Error('A required portal data component is unavailable or duplicated.');
    }
    jsonIds.add(item.id);
  }
  if (fingerprint(shell) !== content.shellSha256 || fingerprint(css) !== content.stylesSha256) {
    throw new Error('The selected portal presentation failed its integrity check.');
  }
  if (/<(?:script|iframe|object|embed|base|link|style)\b|\bon[a-z]+\s*=|(?:javascript|vbscript)\s*:/i.test(shell)
    || /@import\b|url\s*\(/i.test(css)) {
    throw new Error('The selected portal presentation contains unsupported active content.');
  }
  if (typeof hooks?.source !== 'string' || !digestPattern.test(hooks.sha256)
    || fingerprint(hooks.source) !== hooks.sha256) {
    throw new Error('The application integration failed its integrity check.');
  }
  return scripts;
}

const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};

function renderQuality(quality, manifest) {
  quality.replaceChildren(element('h2', 'Data quality and preservation'));
  quality.append(element('p', 'Historical snapshot. No refresh connection has been verified. This browser edition reads only the files you select on your computer.'));
  const counts = manifest.counts;
  quality.append(element('p', `${counts.observations.toLocaleString()} typed observations · ${counts.metrics} source metric definitions · ${counts.components} preserved components · ${counts.research} indexed research records.`));
  quality.append(element('p', 'Daily, monthly, quarterly, partial-period and source-specific definitions remain separate. Latest dates below describe each source series; they do not certify complete trading-session coverage.'));
  for (const warning of manifest.validation.warnings || []) quality.append(element('p', warning, 'private-warning'));
  const details = element('details');
  details.append(element('summary', 'Inspect observation dates, stale series and missing cutoffs'));
  const scroll = element('div', undefined, 'private-quality-scroll');
  const table = element('table');
  const head = element('tr');
  for (const value of ['Entity / source metric', 'Frequency / unit', 'Latest period', 'Observed as of', 'Status']) head.append(element('th', value));
  table.append(head);
  for (const item of Object.values(manifest.seriesCoverage || {})) {
    const row = element('tr');
    for (const value of [`${item.entity} · ${item.metricId}`, `${item.frequency} · ${item.units.join(' / ')}`, item.latestPeriod || 'Missing', item.latestAsOf || 'Missing — quarantined', item.status]) row.append(element('td', value));
    table.append(row);
  }
  scroll.append(table); details.append(scroll); quality.append(details);
  quality.append(element('p', 'Your original HTML, database ZIP and research files remain unchanged on your computer. Keep them as your private recovery copy. The downloaded application contains only reviewed code.'));
}

function parsePrivateShell(shell) {
  const parsed = new DOMParser().parseFromString(shell, 'text/html');
  if (parsed.querySelector('script,iframe,object,embed,base,link,style,meta[http-equiv]')) {
    throw new Error('The selected portal shell contains unsupported active content.');
  }
  const ids = new Set();
  for (const node of parsed.querySelectorAll('*')) {
    for (const attribute of node.attributes) {
      if (/^on/i.test(attribute.name) || /^(?:javascript|vbscript):/i.test(attribute.value.trim())) {
        throw new Error('The selected portal shell contains an unsupported active attribute.');
      }
    }
    if (node.id) {
      if (ids.has(node.id) || document.getElementById(node.id)) {
        throw new Error('The selected portal shell contains a duplicate application identifier.');
      }
      ids.add(node.id);
    }
  }
  return parsed;
}

/** Classic inline elements preserve shared top-level lexical bindings. Each
 * source is a byte-for-byte checked application asset and must also be allowed
 * by its SHA-256 in the generated page's CSP. No eval or uploaded script runs.
 */
async function executeReviewedScript(source, id) {
  let failed = false;
  const captureError = event => {
    failed = true;
    // Exception text can contain private literal values; do not log it or put
    // it in the error UI. Suppress the browser's default source-value logging.
    event.preventDefault();
  };
  const capturePolicy = event => {
    if (event.disposition === 'enforce' && /^script-src/.test(event.effectiveDirective)) failed = true;
  };
  window.addEventListener('error', captureError);
  window.addEventListener('unhandledrejection', captureError);
  document.addEventListener('securitypolicyviolation', capturePolicy);
  try {
    const script = document.createElement('script');
    script.id = id;
    script.textContent = source;
    script.addEventListener('error', captureError);
    document.body.append(script);
    // Inline execution is synchronous; CSP reports and rejected initialization
    // promises may arrive in the following task. Never mark a blocked UI ready.
    await new Promise(resolve => setTimeout(resolve, 0));
    if (failed) throw new Error(initializationFailure);
  } catch {
    throw new Error(initializationFailure);
  } finally {
    window.removeEventListener('error', captureError);
    window.removeEventListener('unhandledrejection', captureError);
    document.removeEventListener('securitypolicyviolation', capturePolicy);
  }
}

/** One mount per document. Reload the page before opening another snapshot:
 * classic application scripts intentionally keep their existing global scope.
 * The outer browser UI owns the reload button and file selection lifecycle.
 */
export async function renderPortal(options) {
  if (mounted) throw new Error('Reload this page before opening another snapshot.');
  const root = document.getElementById('legacy-root');
  const statusText = document.getElementById('private-snapshot-status');
  const quality = document.getElementById('private-quality');
  const toggle = document.getElementById('private-quality-toggle');
  if (!root || !statusText || !quality || !toggle || !document.getElementById('private-selected-status')) {
    throw new Error('The browser application shell is incomplete.');
  }
  root.dataset.ready = 'false';
  try {
    const scripts = verifyPresentation(options);
    const { snapshot, presentation: { content, shell, css }, hooks } = options;
    const parsed = parsePrivateShell(shell);
    for (const item of content.jsonScripts) {
      if (parsed.getElementById(item.id) || document.getElementById(item.id)) {
        throw new Error('The selected portal contains a duplicate data component identifier.');
      }
    }
    mounted = true;
    window.__MARKET_STRUCTURE_SNAPSHOT = snapshot;
    window.MarketStructureAnalytics = Analytics;
    window.__MS_SAFE_CSV = safeCsvCell;
    window.__MS_LITERAL = (module, index) => {
      const values = content.literals[module];
      if (!Array.isArray(values) || !Number.isSafeInteger(index) || index < 0 || index >= values.length) {
        throw new Error('A private presentation literal is unavailable.');
      }
      return values[index];
    };
    window.__MS_TEMPLATE = value => `${value}`;
    Object.defineProperty(window, '__MARKET_STRUCTURE_RUNTIME__', { value: Object.freeze({
      literal: window.__MS_LITERAL, template: window.__MS_TEMPLATE,
      RegExp: globalThis.RegExp, BigInt: globalThis.BigInt, analytics: Analytics, snapshot,
    }) });
    const style = element('style', css);
    style.id = 'private-presentation-css';
    document.head.insertBefore(style, document.head.querySelector('style'));
    root.removeAttribute('role');
    root.replaceChildren(...[...parsed.body.childNodes].map(node => document.importNode(node, true)));
    for (const item of content.jsonScripts) {
      const node = element('script', JSON.stringify(snapshot.components[item.id]));
      node.type = 'application/json'; node.id = item.id;
      document.body.append(node);
    }
    for (const script of scripts) await executeReviewedScript(script.source, script.id);
    await executeReviewedScript(hooks.source, 'browser-reviewed-hooks');
    renderQuality(quality, snapshot.manifest);
    toggle.addEventListener('click', () => {
      quality.hidden = !quality.hidden;
      if (!quality.hidden) quality.scrollIntoView({ block: 'start' });
    });
    statusText.textContent = `No verified refresh connection · observed through ${snapshot.manifest.asOf || 'an unknown date'} · assessed ${new Date().toISOString().slice(0, 10)} · files stay on this computer`;
    root.dataset.ready = 'true';
    document.title = 'Market Structure · Private browser portal';
    return { ready: true };
  } catch (error) {
    const message = mounted ? initializationFailure : error.message;
    statusText.textContent = 'Snapshot unavailable. No example data has been substituted.';
    root.replaceChildren(element('h1', 'The private portal needs attention.'), element('p', message));
    root.setAttribute('role', 'alert');
    throw new Error(message);
  }
}

import { Analytics, safeCsvCell } from '/src/legacy-analytics.js';

const root = document.getElementById('legacy-root');
const statusText = document.getElementById('private-snapshot-status');
const quality = document.getElementById('private-quality');
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const today = () => new Date().toISOString().slice(0, 10);

function renderQuality(manifest) {
  quality.replaceChildren(element('h2', 'Data quality and preservation'));
  quality.append(element('p', 'Historical snapshot. No refresh connection has been verified. Reload rereads the configured private release; it does not retrieve market data.'));
  const counts = manifest.counts;
  quality.append(element('p', `${counts.observations.toLocaleString()} typed observations · ${counts.metrics} source metric definitions · ${counts.components} preserved components · ${counts.research} indexed research records.`));
  quality.append(element('p', 'Daily, monthly, quarterly, partial-period and source-specific definitions remain separate. Latest dates below describe each source series; they do not certify complete trading-session coverage.'));
  for (const warning of manifest.validation.warnings) quality.append(element('p', warning, 'private-warning'));
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
  quality.append(element('p', 'Original uploads, archived reports, revisions, and the complete SQLite source remain in private storage. Application files contain no proprietary literal content.'));
}

function installPrivateShell(shell) {
  const documentCopy = new DOMParser().parseFromString(shell, 'text/html');
  if (documentCopy.querySelector('script,iframe,object,embed,base,link,style')) throw new Error('Private shell contains unsupported active content.');
  for (const node of documentCopy.querySelectorAll('*')) {
    for (const attribute of node.attributes) {
      if (/^on/i.test(attribute.name) || /^(?:javascript|vbscript):/i.test(attribute.value.trim())) throw new Error('Private shell contains an unsafe attribute.');
    }
  }
  root.replaceChildren(...[...documentCopy.body.childNodes].map(node => document.importNode(node, true)));
}

function loadScript(file, id, digest) {
  return new Promise((resolve, reject) => {
    const node = document.createElement('script');
    node.src = file;
    node.async = false;
    if (id) node.id = id;
    if (digest) node.integrity = `sha256-${btoa(digest.match(/../g).map(value => String.fromCharCode(parseInt(value, 16))).join(''))}`;
    let evaluationFailed = false;
    const capture = event => {
      if (event.filename === node.src) {
        evaluationFailed = true;
        // Source exceptions can include private literal values. Show only the
        // generic failure below and never mark a partially initialized UI ready.
        event.preventDefault();
      }
    };
    const finish = failed => {
      window.removeEventListener('error', capture);
      if (failed) reject(new Error('A reviewed application module could not be initialized.'));
      else resolve();
    };
    window.addEventListener('error', capture);
    node.onload = () => finish(evaluationFailed);
    node.onerror = () => finish(true);
    document.body.append(node);
  });
}

document.getElementById('private-quality-toggle').addEventListener('click', () => {
  quality.hidden = !quality.hidden;
  if (!quality.hidden) quality.scrollIntoView({ block: 'start' });
});
document.getElementById('private-reload').addEventListener('click', () => location.reload());

try {
  const response = await fetch('/api/legacy/bootstrap', { cache: 'no-store' });
  if (!response.ok) throw new Error('The private snapshot or presentation could not be loaded. Check the validated import and retry.');
  const { snapshot, presentation } = await response.json();
  const { content, shell } = presentation;
  if (!snapshot?.components?.DB || content?.schemaVersion !== 1 || !Array.isArray(content.modules)) throw new Error('Unsupported private snapshot contract.');
  window.__MARKET_STRUCTURE_SNAPSHOT = snapshot;
  window.MarketStructureAnalytics = Analytics;
  window.__MS_SAFE_CSV = safeCsvCell;
  window.__MS_LITERAL = (module, index) => {
    const values = content.literals[module];
    if (!Array.isArray(values) || !Number.isSafeInteger(index) || index < 0 || index >= values.length) throw new Error('Private presentation literal is unavailable.');
    return values[index];
  };
  window.__MS_TEMPLATE = value => `${value}`;
  Object.defineProperty(window, '__MARKET_STRUCTURE_RUNTIME__', { value: Object.freeze({
    literal: window.__MS_LITERAL, template: window.__MS_TEMPLATE,
    RegExp: globalThis.RegExp, BigInt: globalThis.BigInt,
    analytics: Analytics, snapshot,
  }) });
  installPrivateShell(shell);
  // These elements are inert JSON, not executable uploaded source. Reviewed
  // application modules retain the original IDs and component interfaces.
  for (const item of content.jsonScripts) {
    if (!Object.hasOwn(snapshot.components, item.id)) throw new Error('A required data component is missing.');
    const node = document.createElement('script');
    node.type = 'application/json'; node.id = item.id;
    node.textContent = JSON.stringify(snapshot.components[item.id]);
    document.body.append(node);
  }
  for (const module of content.modules) {
    if (!/^module-\d{3}$/.test(module.id) || module.file !== `${module.id}.js`) throw new Error('Invalid reviewed module identifier.');
    await loadScript(`/legacy/${module.file}`, module.id, module.sha256);
  }
  await loadScript('/legacy-hooks.js');
  renderQuality(snapshot.manifest);
  statusText.textContent = `No verified refresh connection · observed through ${snapshot.manifest.asOf || 'an unknown date'} · assessed ${today()}`;
  root.dataset.ready = 'true';
  document.title = 'Market Structure · Private research portal';
} catch (error) {
  statusText.textContent = 'Snapshot unavailable. No example data has been substituted.';
  root.replaceChildren(element('h1', 'The private portal needs attention.'), element('p', error.message));
  root.setAttribute('role', 'alert');
}

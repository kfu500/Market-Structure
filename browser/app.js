import { loadOriginalSources, assertSourceComponents } from './source-loader.js';
import { openBrowserStore } from './sqlite-store.js';
import { renderPortal } from './render-portal.js';
import { exportVisibleChart } from './export-chart.js';
import { reviewedModules, hooks, wasmBase64 } from 'portal:assets';

const byId = id => document.getElementById(id);
const paint = () => new Promise(resolve => setTimeout(resolve, 25));
let store;
const reset = () => location.reload();
byId('private-reload').addEventListener('click', reset);
byId('browser-reset').addEventListener('click', reset);
byId('browser-print').addEventListener('click', () => window.print());
byId('browser-export').hidden = false;
byId('browser-export').addEventListener('click', async () => {
  const button = byId('browser-export');
  button.disabled = true;
  const status = byId('browser-export-status');
  status.textContent = 'Preparing the first visible chart…';
  try {
    await exportVisibleChart();
    status.textContent = 'Chart PNG prepared. Save it in a private folder.';
  } catch {
    status.textContent = 'The chart could not be exported. Open a page with a visible chart, or use Print / Save PDF.';
  } finally { button.disabled = false; }
});
window.addEventListener('pagehide', () => { store?.close(); store = undefined; });

byId('browser-form').addEventListener('submit', async event => {
  event.preventDefault();
  const htmlFile = byId('portal-html-input').files[0];
  const databaseFile = byId('database-input').files[0];
  const partsFiles = [...byId('database-parts-input').files];
  const errorBox = byId('browser-error');
  errorBox.hidden = true;
  if (!htmlFile || (!databaseFile && !partsFiles.length) || (databaseFile && partsFiles.length)) {
    errorBox.textContent = 'Choose your original portal HTML and either the complete database file or all numbered database ZIP parts.';
    errorBox.hidden = false;
    return;
  }
  for (const control of byId('browser-form').elements) control.disabled = true;
  const progress = byId('browser-progress');
  progress.hidden = false;
  const onProgress = message => { progress.textContent = message; };
  let stage = 'source';
  try {
    onProgress('Reading your selected files locally. Large databases can take a minute…');
    await paint();
    const sources = await loadOriginalSources({ htmlFile, databaseFile, partsFiles, reviewedModules, onProgress });
    stage = 'database';
    onProgress('Checking database records, dates, units and calculations. Keep this tab open…');
    await paint();
    const wasmBytes = Uint8Array.from(atob(wasmBase64), character => character.charCodeAt(0));
    store = await openBrowserStore(sources.databaseBytes, { wasmBytes });
    sources.databaseBytes = undefined;
    const snapshot = store.snapshot();
    assertSourceComponents(sources.ported, snapshot);
    const fullSnapshot = { ...snapshot, components: { ...snapshot.components,
      metricCalculations: snapshot.metricCalculations,
      databaseManifest: sources.ported.content.extraComponents?.databaseManifest || snapshot.manifest,
    } };
    stage = 'presentation';
    onProgress('Opening the validated portal…');
    await paint();
    byId('browser-loader').hidden = true;
    byId('browser-portal').hidden = false;
    await renderPortal({ snapshot: fullSnapshot,
      presentation: { content: sources.ported.content, shell: sources.ported.shell, css: sources.ported.css },
      reviewedModules, hooks });
    Object.defineProperty(window, 'MarketStructureBrowser', { value: Object.freeze({
      status: () => store.status(), observations: options => store.observations(options),
      sourceHashes: Object.freeze(sources.sourceHashes),
    }) });
  } catch (error) {
    store?.close(); store = undefined;
    byId('browser-loader').hidden = false;
    byId('browser-portal').hidden = true;
    // Parser/SQLite exceptions may contain private source text. Never echo or
    // log arbitrary exception details; these known messages are actionable.
    const text = String(error?.message || '');
    const messages = [
      [/does not match the reviewed portal code|does not match this reviewed application version/, 'This HTML version differs from the reviewed application. Its scripts were not run. Keep the file unchanged and request a source-version update.'],
      [/different snapshots|calculation records do not match|does not match the original portal source manifest/, 'The selected HTML and database do not match. Choose the original files from the same export.'],
      [/Select every database-part ZIP|complete numbered set/, 'Select all numbered original database ZIP parts together, with no duplicates.'],
      [/exceeds|size limit|out of memory|Cannot enlarge memory/, 'The selected files exceed the available browser memory or supported size. Close other large tabs and try again.'],
      [/original database archive/, 'Choose the original database ZIP or all its numbered parts to match the HTML ZIP source manifest.'],
    ];
    errorBox.textContent = messages.find(([pattern]) => pattern.test(text))?.[1]
      || ({ source: 'The selected source files could not be validated. Choose the original matching portal HTML and database ZIP.',
        database: 'The database failed its integrity or data-quality checks. Keep the originals unchanged and report this message.',
        presentation: 'The reviewed portal could not initialize in this browser. Keep the originals unchanged and report this message.' }[stage]);
    errorBox.hidden = false;
    progress.hidden = true;
    byId('browser-reset').hidden = false;
    // A failed mount may have defined classic lexical bindings. A full reload
    // is the only safe retry; do not run a second set of scripts in this page.
    errorBox.focus();
  }
});

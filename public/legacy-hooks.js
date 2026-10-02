// Reviewed integration hooks for the original classic-script workbench.
// No source values, report text, dates or coefficients belong in this file.
window.__MS_GET_STATE = () => ({ company: state.company, tab: state.tab, metric: state.metric, view: state.view });
window.__MS_GET_SERIES = key => getSeries(key);
window.__MS_GET_SPEC = key => spec(key);
window.csvCell = window.__MS_SAFE_CSV;

(() => {
  const target = document.getElementById('private-selected-status');
  let pending = false;
  function update() {
    pending = false;
    const series = getSeries(state.metric);
    const definition = spec(state.metric);
    if (!Array.isArray(series) || !series.length) {
      target.textContent = 'Selected operating series: no observations available.';
      target.hidden = false; return;
    }
    const last = [...series].sort((a, b) => String(a.date).localeCompare(String(b.date))).at(-1);
    const partial = /partial|mtd|prelim|forecast|carry.forward/i.test(`${last.period_status || ''} ${last.classification || ''}`) || Boolean(last.analysis_block);
    const month = /^\d{4}-\d{2}/.test(last.date || '') ? last.date.slice(0, 7) : null;
    const end = month ? new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)) : null;
    const age = end ? Math.floor((Date.now() - end.getTime()) / 86400000) : null;
    const threshold = definition.frequency === 'quarterly' ? 150 : 62;
    target.textContent = `Selected series: ${definition.title || state.metric} · period ${last.date || 'missing'} · ${definition.unit || 'unit unspecified'} · ${partial ? 'partial, forecast or blocked: excluded from derived comparisons' : age === null ? 'missing date' : age > threshold ? `stale (${age} days since period end)` : 'historical observation'} · no verified refresh connection`;
    target.hidden = false;
  }
  const observer = new MutationObserver(() => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  });
  observer.observe(document.getElementById('legacy-root'), { childList: true, subtree: true });
  update();
})();

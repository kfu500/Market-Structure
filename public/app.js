import { ENTITIES, summarizeMetric } from '/src/domain.js';

const ENTITY_DETAILS = {
  CME: { category: 'Derivatives', description: 'Futures, options & risk transfer' },
  CBOE: { category: 'Options & volatility', description: 'Options, equities & volatility markets' },
  ICE: { category: 'Exchanges & data', description: 'Energy, fixed income & market infrastructure' },
  HOOD: { category: 'Retail platforms', description: 'Retail brokerage & digital assets' },
  NDAQ: { category: 'Market infrastructure', description: 'Trading, listings & financial technology' },
  TW: { category: 'Electronic trading', description: 'Rates, credit & electronic marketplaces' },
  PREDICTION: { category: 'Prediction markets', description: 'Event contracts & emerging marketplaces' },
};
const state = { data: null, status: null, error: null, selected: {}, dashboardEntity: 'CME', loading: false };
const main = document.getElementById('main');
const banner = document.getElementById('snapshot-banner');
const reloadButton = document.getElementById('reload');
const today = () => new Date().toISOString().slice(0, 10);

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'onClick') node.addEventListener('click', value);
    else if (key === 'onChange') node.addEventListener('change', value);
    else node.setAttribute(key, value);
  }
  for (const child of Array.isArray(children) ? children : [children]) if (child != null) node.append(child);
  return node;
}
function svg(tag, props = {}, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(props)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}
function monthLabel(date, short = false) {
  if (!date) return 'No period';
  return new Intl.DateTimeFormat('en', { month: short ? 'short' : 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
function dayLabel(date) {
  if (!date) return 'Not available';
  const parsed = new Date(date.length === 10 ? `${date}T00:00:00Z` : date);
  if (!Number.isFinite(parsed.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}
function numeric(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return 'Unavailable';
  const absolute = Math.abs(value);
  const options = absolute >= 1e15 || (absolute > 0 && absolute < 0.01)
    ? { notation: 'scientific', maximumSignificantDigits: Math.max(3, maximumFractionDigits) }
    : { maximumFractionDigits };
  return new Intl.NumberFormat('en', options).format(value);
}
function valueLabel(value, unit, exact = false) {
  if (!Number.isFinite(value)) return 'Unavailable';
  const formatted = numeric(value, exact ? 20 : 2);
  if (unit === 'percent') return `${formatted}%`;
  if (unit === 'USD millions') return `$${formatted}m`;
  if (unit === 'USD billions') return `$${formatted}bn`;
  if (unit === 'USD' || unit?.startsWith('USD per')) return `$${formatted}`;
  return formatted;
}
function compactLabel(value, unit) {
  if (!Number.isFinite(value)) return 'Unavailable';
  if (Math.abs(value) >= 1e15 || (Math.abs(value) > 0 && Math.abs(value) < 0.01)) return valueLabel(value, unit);
  if (['percent', 'USD millions', 'USD billions', 'USD per contract', 'USD per share'].includes(unit)) return valueLabel(value, unit);
  const prefix = unit === 'USD' ? '$' : '';
  return prefix + new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
}
function comparisonLabel(comparison) {
  if (!comparison || !Number.isFinite(comparison.value)) return 'Unavailable';
  return `${comparison.value > 0 ? '+' : ''}${numeric(comparison.value, 1)}%`;
}
function metricsFor(entity) {
  return state.data.metrics.filter(metric => metric.entities.includes(entity));
}
function selectedMetric(entity) {
  const available = metricsFor(entity);
  return available.find(metric => metric.id === state.selected[entity]) || available[0] || null;
}
function summaryFor(entity, metric) {
  return metric ? summarizeMetric(state.data, entity, metric.id, today()) : null;
}
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  if (parts[0] === 'quality') return { type: 'quality' };
  if (parts[0] === 'company' && Object.hasOwn(ENTITIES, parts[1])) return { type: 'company', entity: parts[1] };
  if (!parts[0]) return { type: 'overview' };
  return { type: 'not-found' };
}
function badge(status) {
  const labels = { ok: 'Current snapshot', stale: 'Stale data', missing: 'Missing data' };
  return el('span', { class: `badge badge-${status || 'missing'}`, text: labels[status] || 'Missing data' });
}
function buildNavigation() {
  const nav = document.getElementById('navigation');
  const current = route();
  nav.replaceChildren();
  const link = (href, label, icon, active) => el('a', { href, class: `nav-link${active ? ' active' : ''}`, ...(active ? { 'aria-current': 'page' } : {}) }, [el('span', { class: 'nav-symbol', 'aria-hidden': 'true', text: icon }), el('span', { text: label })]);
  nav.append(link('#/', 'Overview', '▦', current.type === 'overview'));
  nav.append(el('div', { class: 'nav-heading', text: 'COVERAGE' }));
  for (const entity of Object.keys(ENTITIES)) nav.append(link(`#/company/${entity}`, entity === 'PREDICTION' ? 'Prediction markets' : entity, entity === 'PREDICTION' ? '◇' : '•', current.entity === entity));
  nav.append(el('div', { class: 'nav-divider' }));
  nav.append(link('#/quality', 'Data quality', '⊙', current.type === 'quality'));
}

async function loadData() {
  if (state.loading) return;
  state.loading = true;
  reloadButton.disabled = true;
  reloadButton.textContent = 'Loading snapshot…';
  try {
    const response = await fetch('/api/snapshot', { cache: 'no-store' });
    if (!response.ok) throw new Error(`The snapshot could not be loaded (HTTP ${response.status}). Validate the external data file before reloading.`);
    const { data, status } = await response.json();
    if (data?.schemaVersion !== 1 || !data.dataset || !Array.isArray(data.metrics) || !Array.isArray(data.observations)) throw new Error('This snapshot has an unsupported structure. Use a valid schema version 1 dataset.');
    if (!status || !['private', 'synthetic'].includes(status.mode)) throw new Error('The data source status could not be verified.');
    state.data = data;
    state.status = status;
    state.error = null;
    document.getElementById('announcement').textContent = 'Snapshot loaded. This action rereads the configured snapshot; it does not retrieve new market data.';
  } catch (error) {
    state.error = error.message || 'The snapshot could not be loaded.';
    state.data = null;
    state.status = null;
  } finally {
    state.loading = false;
    reloadButton.disabled = false;
    reloadButton.replaceChildren(el('span', { 'aria-hidden': 'true', text: '↻' }), document.createTextNode(' Reload snapshot'));
    render();
  }
}
function renderBanner() {
  banner.replaceChildren();
  if (state.error) {
    banner.className = 'snapshot-banner banner-error';
    banner.textContent = 'Snapshot unavailable · resolve the data loading error to continue.';
    return;
  }
  const synthetic = state.status.mode === 'synthetic';
  banner.className = `snapshot-banner ${synthetic ? 'banner-synthetic' : 'banner-private'}`;
  banner.append(el('strong', { text: synthetic ? 'SYNTHETIC EXAMPLE' : 'PRIVATE SNAPSHOT' }), el('span', { text: synthetic ? 'Illustrative data only. These figures do not represent company results.' : 'Manually loaded data. No verified refresh connection.' }), el('span', { class: 'banner-date', text: `Snapshot as of ${dayLabel(state.data.dataset.asOf)}` }));
}
function render() {
  buildNavigation();
  if (state.error) {
    renderBanner();
    main.replaceChildren(el('section', { class: 'error-panel', role: 'alert' }, [el('div', { class: 'eyebrow', text: 'DATA LOADING' }), el('h1', { text: 'The snapshot needs attention.' }), el('p', { text: state.error }), el('p', { text: 'The server accepts a validated JSON snapshot from an external data directory. Run npm run data:validate with the arguments documented in the README, review the external validation report, correct the external file, then reload.' }), el('button', { class: 'button button-primary', text: 'Try loading again', type: 'button', onClick: loadData })]));
    return;
  }
  if (!state.data) return;
  renderBanner();
  const current = route();
  const title = current.type === 'company' ? ENTITIES[current.entity] : current.type === 'quality' ? 'Data quality' : current.type === 'not-found' ? 'Page not found' : 'Overview';
  document.getElementById('route-label').textContent = title;
  document.title = `${title} · Market Structure`;
  try {
    if (current.type === 'company') main.replaceChildren(companyPage(current.entity));
    else if (current.type === 'quality') main.replaceChildren(qualityPage());
    else if (current.type === 'not-found') main.replaceChildren(el('section', { class: 'error-panel' }, [el('h1', { text: 'Page not found' }), el('a', { href: '#/', text: 'Return to the overview' })]));
    else main.replaceChildren(overviewPage());
  } catch {
    main.replaceChildren(el('section', { class: 'error-panel', role: 'alert' }, [el('h1', { text: 'This snapshot cannot be displayed.' }), el('p', { text: 'Check the snapshot against the documented schema and run npm run data:validate as described in the README. The application has stopped rendering to avoid showing misleading calculations.' })]));
  }
}
function heading(eyebrow, title, description, aside) {
  return el('div', { class: 'page-heading' }, [el('div', {}, [el('div', { class: 'eyebrow', text: eyebrow }), el('h1', { text: title }), el('p', { class: 'page-description', text: description })]), aside]);
}
function sourceNote() {
  return el('div', { class: 'snapshot-stamp' }, [el('span', { class: 'stamp-label', text: 'SOURCE SNAPSHOT' }), el('strong', { text: dayLabel(state.data.dataset.asOf) }), el('small', { text: `Loaded ${dayLabel(state.status.loadedAt)}` })]);
}
function coverageStats() {
  let current = 0, stale = 0, missing = 0;
  for (const entity of Object.keys(ENTITIES)) {
    const metric = selectedMetric(entity);
    const summary = summaryFor(entity, metric);
    if (summary?.status === 'ok') current++;
    else if (summary?.status === 'stale') stale++;
    else missing++;
  }
  return { current, stale, missing };
}
function overviewPage() {
  const page = el('div', { class: 'page overview-page' });
  page.append(heading('THE MARKET STRUCTURE MONITOR', 'A clearer view of market activity.', 'Exchanges, electronic trading and the next generation of marketplaces.', sourceNote()));
  const counts = coverageStats();
  page.append(el('div', { class: 'coverage-strip' }, [el('span', {}, [el('strong', { text: '7' }), document.createTextNode(' coverage areas')]), el('span', {}, [el('span', { class: 'status-dot', 'aria-hidden': 'true' }), document.createTextNode(`${counts.current} current primary metrics`)]), el('span', { text: `${counts.stale} stale · ${counts.missing} missing` }), el('a', { href: '#/quality', text: 'Inspect data quality →' })]));
  const cards = el('div', { class: 'coverage-grid' });
  for (const entity of Object.keys(ENTITIES)) cards.append(entityCard(entity));
  page.append(cards);
  const detail = el('div', { class: 'overview-detail' });
  const trend = el('section', { class: 'panel trend-panel' });
  const companySelect = el('select', { id: 'overview-entity', 'aria-label': 'Chart coverage area', onChange: event => { state.dashboardEntity = event.target.value; render(); document.getElementById('overview-entity')?.focus(); } });
  for (const [code, name] of Object.entries(ENTITIES)) companySelect.append(el('option', { value: code, ...(state.dashboardEntity === code ? { selected: '' } : {}), text: code === 'PREDICTION' ? name : `${code} · ${name}` }));
  trend.append(el('div', { class: 'panel-heading' }, [el('div', {}, [el('div', { class: 'eyebrow', text: 'MONTHLY ACTIVITY' }), el('h2', { text: 'The longer view' })]), companySelect]));
  const metric = selectedMetric(state.dashboardEntity);
  if (metric) {
    trend.append(metricSelector(state.dashboardEntity, 'overview-metric'));
    const summary = summaryFor(state.dashboardEntity, metric);
    trend.append(el('div', { class: 'chart-subheading' }, [el('span', { text: metric.label }), badge(summary.status)]));
    trend.append(chartPanel(state.dashboardEntity, metric, false));
    trend.append(el('a', { href: `#/company/${state.dashboardEntity}`, class: 'text-link', text: `Explore ${state.dashboardEntity === 'PREDICTION' ? 'prediction markets' : state.dashboardEntity} →` }));
  } else trend.append(emptyState('No metrics configured for this coverage area.'));
  detail.append(trend, workspaceNotes());
  page.append(detail);
  return page;
}
function entityCard(entity) {
  const metric = selectedMetric(entity);
  const summary = summaryFor(entity, metric);
  const card = el('a', { href: `#/company/${entity}`, class: `entity-card${entity === 'PREDICTION' ? ' prediction-card' : ''}`, 'aria-label': `Open ${ENTITIES[entity]} page` });
  card.append(el('div', { class: 'entity-card-top' }, [el('span', { class: 'entity-code', text: entity === 'PREDICTION' ? 'Prediction' : entity }), el('span', { class: 'card-arrow', 'aria-hidden': 'true', text: '→' })]), el('div', { class: 'entity-category', text: ENTITY_DETAILS[entity].category }));
  card.append(el('div', { class: 'card-value', text: compactLabel(summary?.current?.value, metric?.unit) }), el('div', { class: 'card-metric', text: metric ? `${metric.label} · ${metric.unit}` : 'No metric available' }));
  card.append(el('div', { class: 'card-comparison' }, [el('span', { class: summary?.yoy?.value >= 0 ? 'positive' : 'neutral-change', text: comparisonLabel(summary?.yoy) }), el('span', { text: 'YoY' })]));
  card.append(el('div', { class: 'card-bottom' }, [el('span', { text: summary?.current ? monthLabel(summary.current.period, true) : 'No observation' }), badge(summary?.status)]));
  card.append(el('div', { class: 'card-observed', text: `Observed ${dayLabel(summary?.current?.observedAt)}` }));
  return card;
}
function workspaceNotes() {
  return el('aside', { class: 'panel workspace-notes', 'aria-label': 'About this workspace' }, [el('div', { class: 'eyebrow', text: 'READING THE DATA' }), el('h2', { text: 'Context before conclusions.' }), el('p', { text: 'Monthly observations retain their dates, units and source labels. Missing values stay missing.' }), el('div', { class: 'note-rule' }), el('h3', { text: 'Comparable periods' }), el('p', { text: 'Year-over-year uses the same month one year earlier. Three-month windows require all three months, with aggregation defined for each metric.' }), el('h3', { text: 'Private data, separate files' }), el('p', { text: 'Load your validated snapshot from outside the repository using the documented command. Research files stay in your private storage.' }), el('a', { href: '#/quality', class: 'text-link', text: 'Data sources & methodology →' })]);
}
function metricSelector(entity, id = 'company-metric') {
  const available = metricsFor(entity);
  const active = selectedMetric(entity);
  const select = el('select', { id, 'aria-label': 'Select metric', onChange: event => { state.selected[entity] = event.target.value; render(); document.getElementById(id)?.focus(); } });
  for (const metric of available) select.append(el('option', { value: metric.id, ...(metric.id === active?.id ? { selected: '' } : {}), text: metric.label }));
  return el('div', { class: 'metric-selector' }, [el('label', { for: id, text: 'Metric' }), select]);
}
function statCard(label, value, detail, className = '') {
  return el('div', { class: `stat-card ${className}` }, [el('div', { class: 'stat-label', text: label }), el('div', { class: 'stat-value', text: value }), el('div', { class: 'stat-detail', text: detail })]);
}
function companyPage(entity) {
  const page = el('div', { class: 'page company-page' });
  page.append(heading(ENTITY_DETAILS[entity].category.toUpperCase(), ENTITIES[entity], ENTITY_DETAILS[entity].description, el('span', { class: 'company-monogram', text: entity === 'PREDICTION' ? '◇' : entity })));
  const metric = selectedMetric(entity);
  if (!metric) { page.append(emptyState('No metrics are configured for this coverage area. Load an external snapshot with metrics assigned to this entity.')); return page; }
  const summary = summaryFor(entity, metric);
  page.append(el('div', { class: 'company-toolbar' }, [metricSelector(entity), badge(summary.status), el('span', { class: 'toolbar-date', text: `Assessed ${dayLabel(today())}` })]));
  if (summary.status !== 'ok') page.append(el('div', { class: 'data-notice', role: 'note', text: summary.status === 'missing' ? 'The latest expected observation is missing. Available historical data is shown below; unavailable comparisons are not estimated.' : `This metric is stale under its ${metric.staleAfterDays}-day period-age threshold. Displayed figures are historical snapshots.` }));
  const latest = summary.current;
  const period = latest ? monthLabel(latest.period, true) : 'No observation';
  const aggLabel = metric.aggregation === 'sum' ? 'sum' : metric.aggregation === 'average' ? 'monthly average' : 'period-end value';
  page.append(el('div', { class: 'stats-grid' }, [
    statCard('Latest observation', valueLabel(latest?.value, metric.unit), `${period} · ${metric.unit}`, 'primary-stat'),
    statCard('Year over year', comparisonLabel(summary.yoy), summary.yoy.reason || 'Same month, previous year'),
    statCard('Trailing 3 months', valueLabel(summary.trailing3m.value, metric.unit), summary.trailing3m.reason || `${aggLabel} · ${summary.trailing3m.periods.map(p => monthLabel(p, true)).join(' / ')}`),
    statCard('Trailing 3 months · YoY', comparisonLabel(summary.trailing3mYoY), summary.trailing3mYoY.reason || 'Same three months, previous year'),
  ]));
  const chart = el('section', { class: 'panel company-chart' });
  chart.append(el('div', { class: 'panel-heading' }, [el('div', {}, [el('div', { class: 'eyebrow', text: 'HISTORICAL SERIES' }), el('h2', { text: metric.label })]), el('span', { class: 'unit-pill', text: metric.unit })]));
  chart.append(chartPanel(entity, metric, true));
  page.append(chart);
  const foot = el('div', { class: 'company-foot-grid' });
  foot.append(el('section', { class: 'panel provenance-panel' }, [el('div', { class: 'eyebrow', text: 'PROVENANCE' }), el('h2', { text: 'Behind the latest observation' }), definitionList([['Period', latest ? monthLabel(latest.period) : 'Unavailable'], ['Observed', dayLabel(latest?.observedAt)], ['Source', latest?.source || 'Not supplied'], ['Unit', metric.unit], ['Snapshot date', dayLabel(state.data.dataset.asOf)], ['Freshness threshold', `${metric.staleAfterDays} days after period end`]])]));
  foot.append(el('section', { class: 'panel methodology-panel' }, [el('div', { class: 'eyebrow', text: 'CALCULATION NOTES' }), el('h2', { text: 'What the comparisons mean' }), el('p', { text: `Trailing-three-month values use the ${aggLabel} of three complete calendar months. Windows end at this metric’s latest reported period.` }), el('p', { text: 'YoY and three-month changes are percentage changes, not percentage-point changes. A missing month or zero comparison baseline makes a comparison unavailable.' }), el('p', { class: 'muted', text: `Previous three-month change: ${comparisonLabel(summary.trailing3mChange)}${summary.trailing3mChange.reason ? ` · ${summary.trailing3mChange.reason}` : ''}` }), el('a', { href: '#/quality', class: 'text-link', text: 'Inspect the full snapshot →' })]));
  page.append(foot);
  return page;
}
function definitionList(entries) {
  const list = el('dl', { class: 'definition-list' });
  for (const [key, value] of entries) list.append(el('dt', { text: key }), el('dd', { text: value }));
  return list;
}
function emptyState(message) {
  return el('div', { class: 'empty-state', text: message });
}
function monthlyIndex(period) {
  const [year, month] = period.split('-').map(Number);
  return year * 12 + month - 1;
}
function periodAt(index) {
  return new Date(Date.UTC(Math.floor(index / 12), index % 12 + 1, 0)).toISOString().slice(0, 10);
}
function rowsFor(entity, metric) {
  return state.data.observations.filter(row => row.entity === entity && row.metric === metric.id && row.observedAt <= today() && row.period <= today()).sort((a, b) => a.period.localeCompare(b.period));
}
function chartPanel(entity, metric, showFullTable) {
  const wrapper = el('div', { class: 'chart-wrapper' });
  const rows = rowsFor(entity, metric);
  if (!rows.length) { wrapper.append(emptyState('No dated observations are available for this metric.')); return wrapper; }
  const firstIndex = monthlyIndex(rows[0].period);
  const lastIndex = monthlyIndex(rows.at(-1).period);
  const byPeriod = new Map(rows.map(row => [row.period, row]));
  const slots = [];
  for (let index = firstIndex; index <= lastIndex; index++) {
    const period = periodAt(index);
    slots.push(byPeriod.get(period) || { period, value: null, observedAt: null, source: 'No record', unit: metric.unit });
  }
  const finite = slots.filter(row => Number.isFinite(row.value));
  if (!finite.length) wrapper.append(emptyState('Every observation in this series is missing. No line is drawn.'));
  else {
    const smallChart = window.innerWidth <= 480;
    const width = smallChart ? 440 : window.innerWidth <= 800 ? 620 : 940;
    const height = smallChart ? 270 : 300;
    const margin = { left: smallChart ? 69 : 80, right: 24, top: 25, bottom: 55 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const limits = finite.reduce((result, row) => ({ min: Math.min(result.min, row.value), max: Math.max(result.max, row.value) }), { min: Infinity, max: -Infinity });
    // Normalize before finding the range so even valid extreme finite values
    // cannot overflow the SVG coordinates or axis arithmetic.
    const scale = Math.max(Math.abs(limits.min), Math.abs(limits.max), 1);
    let min = limits.min / scale, max = limits.max / scale;
    const padding = (max - min || Math.abs(max) || 1) * 0.14;
    const finiteLimit = Number.MAX_VALUE / scale;
    min = Math.max(-finiteLimit, min - padding);
    max = Math.min(finiteLimit, max + padding);
    const x = index => margin.left + (slots.length === 1 ? chartWidth / 2 : index / (slots.length - 1) * chartWidth);
    const y = value => margin.top + (max - value / scale) / (max - min) * chartHeight;
    const chart = svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': `${ENTITIES[entity]} ${metric.label}, ${metric.unit}, ${monthLabel(slots[0].period)} to ${monthLabel(slots.at(-1).period)}. Missing months create gaps. Exact values in the data table below.`, class: 'series-chart' });
    chart.append(svg('title', {}, `${metric.label} · ${metric.unit}`));
    for (let index = 0; index <= 4; index++) {
      const value = (min + (max - min) * index / 4) * scale;
      const yPoint = y(value);
      chart.append(svg('line', { x1: margin.left, y1: yPoint, x2: width - margin.right, y2: yPoint, class: 'chart-grid' }));
      chart.append(svg('text', { x: margin.left - 14, y: yPoint + 4, 'text-anchor': 'end', class: 'chart-label' }, compactLabel(value, metric.unit)));
    }
    const tickCount = Math.min(smallChart ? 3 : 6, slots.length);
    const tickIndexes = new Set(Array.from({ length: tickCount }, (_, i) => tickCount === 1 ? 0 : Math.round(i * (slots.length - 1) / (tickCount - 1))));
    for (const index of tickIndexes) chart.append(svg('text', { x: x(index), y: height - 20, 'text-anchor': 'middle', class: 'chart-label' }, monthLabel(slots[index].period, true)));
    const segments = [];
    let segment = [];
    slots.forEach((row, index) => {
      if (Number.isFinite(row.value)) segment.push({ row, index });
      else if (segment.length) { segments.push(segment); segment = []; }
    });
    if (segment.length) segments.push(segment);
    for (const points of segments) {
      if (points.length > 1) chart.append(svg('path', { d: points.map(({ row, index }, i) => `${i ? 'L' : 'M'}${x(index)},${y(row.value)}`).join(' '), class: 'chart-line', fill: 'none' }));
      for (const { row, index } of points) {
        const dot = svg('circle', { cx: x(index), cy: y(row.value), r: slots.length > 50 ? 2.4 : 3.5, class: 'chart-point' });
        dot.append(svg('title', {}, `${monthLabel(row.period)}: ${valueLabel(row.value, metric.unit)} ${metric.unit}. Observed ${dayLabel(row.observedAt)}. Source: ${row.source}`));
        chart.append(dot);
      }
    }
    wrapper.append(chart);
  }
  const gapCount = slots.length - finite.length;
  wrapper.append(el('div', { class: 'chart-caption' }, [el('span', {}, [el('span', { class: 'legend-line', 'aria-hidden': 'true' }), document.createTextNode(`${metric.label} · ${metric.unit}`)]), el('span', { text: `${finite.length} observations${gapCount ? ` · ${gapCount} missing month${gapCount > 1 ? 's' : ''}` : ''}` })]));
  const details = el('details', { class: 'data-table-details' });
  details.append(el('summary', { text: showFullTable ? 'View dated observations & sources' : 'View chart data' }));
  details.append(observationsTable(slots, metric));
  wrapper.append(details);
  return wrapper;
}
function observationsTable(rows, metric) {
  const table = el('table', { class: 'data-table' });
  table.append(el('caption', { class: 'sr-only', text: `${metric.label} historical observations in ${metric.unit}` }));
  const head = el('tr');
  for (const label of ['Period', `Value (${metric.unit})`, 'Observed', 'Source']) head.append(el('th', { scope: 'col', text: label }));
  table.append(el('thead', {}, [head]));
  const body = el('tbody');
  for (const row of [...rows].reverse()) body.append(el('tr', {}, [el('th', { scope: 'row', text: monthLabel(row.period, true) }), el('td', { class: row.value === null ? 'missing-value' : 'numeric', text: row.value === null ? 'Missing' : valueLabel(row.value, metric.unit, true) }), el('td', { text: dayLabel(row.observedAt) }), el('td', { text: row.source || 'Not supplied' })]));
  table.append(body);
  return el('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': `${metric.label} observation table` }, [table]);
}
function qualityPage() {
  const page = el('div', { class: 'page quality-page' });
  page.append(heading('TRANSPARENCY & METHODOLOGY', 'Know what is behind the numbers.', 'Coverage, provenance and validation for the snapshot currently in this workspace.', sourceNote()));
  const errors = state.status.validation?.errors || [];
  const warnings = state.status.validation?.warnings || [];
  const missing = state.data.observations.filter(row => row.value === null).length;
  page.append(el('div', { class: 'stats-grid quality-stats' }, [statCard('Observation records', numeric(state.data.observations.length), `${state.data.metrics.length} metric definitions`), statCard('Validation errors', numeric(errors.length), errors.length ? 'Review the findings below' : 'Snapshot accepted by the validator'), statCard('Validation warnings', numeric(warnings.length), warnings.length ? 'Review the findings below' : 'No warnings reported'), statCard('Explicit missing values', numeric(missing), 'Missing calendar months are listed by metric below')]));
  const source = el('section', { class: 'panel source-panel' });
  source.append(el('div', { class: 'eyebrow', text: 'DATA CONNECTION' }), el('h2', { text: state.status.mode === 'synthetic' ? 'Synthetic example snapshot' : 'Private external snapshot' }), definitionList([['Dataset', state.data.dataset.name], ['Data classification', state.status.mode === 'synthetic' ? 'Synthetic · illustrative, not company results' : 'Private · externally supplied'], ['Snapshot as of', dayLabel(state.data.dataset.asOf)], ['Loaded', dayLabel(state.status.loadedAt)], ['Refresh connection', 'Not connected · no live-data claim'], ['Assessment date', dayLabel(today())]]));
  source.append(el('p', { class: 'muted', text: '“Reload snapshot” rereads the configured file. It does not fetch new company data. A scheduled refresh requires an authenticated data provider, a validated import job and a verified success timestamp.' }));
  page.append(source);
  if (errors.length || warnings.length) {
    const findings = el('section', { class: 'panel findings-panel' }, [el('h2', { text: 'Validation findings' })]);
    for (const [type, items] of [['Error', errors], ['Warning', warnings]]) for (const item of items) findings.append(el('p', { class: type === 'Error' ? 'validation-error' : 'validation-warning', text: `${type}: ${typeof item === 'string' ? item : JSON.stringify(item)}` }));
    page.append(findings);
  }
  const coverage = el('section', { class: 'panel coverage-panel' }, [el('div', { class: 'panel-heading' }, [el('div', {}, [el('div', { class: 'eyebrow', text: 'COVERAGE AUDIT' }), el('h2', { text: 'Every metric, with its dates' })])])]);
  const table = el('table', { class: 'data-table quality-table' });
  const header = el('tr');
  for (const label of ['Coverage', 'Metric / unit', 'Latest period', 'Observed', 'Status', 'Missing months']) header.append(el('th', { scope: 'col', text: label }));
  table.append(el('thead', {}, [header]));
  const body = el('tbody');
  for (const entity of Object.keys(ENTITIES)) {
    const metrics = metricsFor(entity);
    if (!metrics.length) body.append(el('tr', {}, [el('th', { scope: 'row', text: entity }), el('td', { colspan: '5', text: 'No metrics configured · missing data' })]));
    for (const metric of metrics) {
      const summary = summaryFor(entity, metric);
      body.append(el('tr', {}, [el('th', { scope: 'row' }, [el('a', { href: `#/company/${entity}`, text: entity === 'PREDICTION' ? 'Prediction' : entity })]), el('td', {}, [el('div', { text: metric.label }), el('small', { class: 'muted', text: `${metric.unit} · ${metric.aggregation}` })]), el('td', { text: summary.current ? monthLabel(summary.current.period, true) : 'Unavailable' }), el('td', { text: dayLabel(summary.current?.observedAt) }), el('td', {}, [badge(summary.status)]), el('td', { text: summary.missingPeriods.length ? summary.missingPeriods.map(period => monthLabel(period, true)).join(', ') : 'None within series' })]));
    }
  }
  table.append(body);
  coverage.append(el('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': 'Metric coverage audit' }, [table]));
  page.append(coverage);
  page.append(el('div', { class: 'company-foot-grid' }, [el('section', { class: 'panel' }, [el('div', { class: 'eyebrow', text: 'LOAD YOUR DATA' }), el('h2', { text: 'Keep research outside the repository.' }), el('p', { text: 'Provide a schema version 1 JSON snapshot with metric definitions and dated monthly observations. Launch the server with MARKET_STRUCTURE_DATA_DIR pointing to a private directory outside the checkout that contains dataset.json.' }), el('p', { text: 'The README includes validation and launch commands. Preserve the original reports and datasets separately; the portal only reads the configured snapshot.' })]), el('section', { class: 'panel' }, [el('div', { class: 'eyebrow', text: 'CALCULATION POLICY' }), el('h2', { text: 'Explicit dates. Complete windows.' }), el('p', { text: 'Freshness uses the current assessment date and each metric’s period-age threshold. Future-dated observations are excluded. A missing latest expected month is flagged.' }), el('p', { text: 'YoY matches the same calendar month. Trailing-three-month windows apply the metric’s sum, average or last-value rule only when all required months exist. Zero baselines and missing values yield unavailable comparisons.' })])]));
  return page;
}

reloadButton.addEventListener('click', loadData);
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});
window.addEventListener('hashchange', () => { render(); main.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); });
for (const breakpoint of ['(max-width: 480px)', '(max-width: 800px)']) {
  window.matchMedia(breakpoint).addEventListener('change', () => render());
}
loadData();

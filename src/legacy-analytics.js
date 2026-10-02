/** Calendar-aligned calculations for externally supplied legacy series.
 * No source data, report text, trading calendar, or refresh date is embedded here.
 * Ambiguous, incomplete, nonfinite and incomparable inputs yield missing results.
 */
const finite = value => typeof value === 'number' && Number.isFinite(value);
const unfinished = /(?:mtd|partial|prelim|incomplete|provisional|unverified.*cutoff)/i;
const unobserved = /(?:forecast|estimate|carry[\s_-]*forward|assumption|projected)/i;
const monthCache = new Map();

function month(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}(?:-\d{2})?$/.test(date)) return null;
  if (monthCache.has(date)) return monthCache.get(date);
  const normalized = date.length === 7 ? `${date}-01` : date;
  const parsed = new Date(`${normalized}T00:00:00Z`);
  const result = Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === normalized
    && normalized >= '0001-01-01' ? normalized.slice(0, 7) : null;
  // Cache immutable date strings, never mutable observation arrays or selected winners.
  if (monthCache.size >= 12_000) monthCache.clear();
  monthCache.set(date, result);
  return result;
}

function shift(date, months) {
  const start = month(date);
  if (!start || !Number.isSafeInteger(months)) return null;
  const [year, m] = start.split('-').map(Number);
  const ordinal = year * 12 + m - 1 + months;
  const nextYear = Math.floor(ordinal / 12);
  if (nextYear < 1 || nextYear > 9999) return null;
  return `${String(nextYear).padStart(4, '0')}-${String(ordinal % 12 + 1).padStart(2, '0')}`;
}

function complete(point, options = {}) {
  if (!point || !finite(point.value) || !month(point.date)) return false;
  if (unfinished.test(String(point.period_status || '')) || point.complete === false) return false;
  if (unobserved.test(`${point.classification || ''} ${point.period_status || ''}`)) return false;
  const asOf = options.asOf ?? options.as_of;
  if (asOf !== undefined) {
    if (!month(asOf) || asOf.length !== 10) return false;
    const lastMonth = shift(point.date, options.frequency === 'quarterly'
      ? 2 - (Number(point.date.slice(5, 7)) - 1) % 3 : 0);
    const nextMonth = shift(lastMonth, 1);
    // A monthly/quarterly observation is complete only after its final calendar day.
    if (!nextMonth || new Date(`${nextMonth}-01T00:00:00Z`).getTime()
      > new Date(`${asOf}T00:00:00Z`).getTime() + 86_400_000) return false;
  }
  return true;
}

const usable = (point, options = {}) => complete(point, options) && !point.analysis_block;

/** The legacy core addresses monthly periods. A duplicate month has no selected winner. */
function at(rows, date) {
  const target = month(date);
  if (!target || !Array.isArray(rows)) return undefined;
  let found;
  for (const point of rows) {
    if (month(point?.date) !== target) continue;
    if (found !== undefined) return undefined;
    found = point;
  }
  return found;
}

const pointUnitsAgree = (a, b) => !a?.unit || !b?.unit || a.unit === b.unit;
const optionsFor = unit => typeof unit === 'string' ? { unit } : unit || {};
const percentUnit = unit => ['%', 'fraction', 'percent', 'percentage points'].includes(unit);

/** Legacy '%' means a fractional share; percentEncoding:'points' uses 0–100 input. */
function change(a, b, unit) {
  if (!finite(a?.value) || !finite(b?.value) || !pointUnitsAgree(a, b)) return null;
  const def = optionsFor(unit);
  const pp = percentUnit(def.unit);
  const scale = def.percentEncoding === 'points' || ['percent', 'percentage points'].includes(def.unit) ? 1 : 100;
  if (!pp && b.value <= 0) return null;
  const value = pp ? (a.value - b.value) * scale : (a.value / b.value - 1) * 100;
  return finite(value) ? { value, pp } : null;
}

const windowed = def => Number.isInteger(def.window_months) && def.window_months > 1 || def.family === 'RPC';
const stock = def => def.aggregation === 'stock' || def.measure_type === 'stock' || def.frequency === 'point_in_time';
const quarterly = def => def.frequency === 'quarterly';
const monthly = def => !def.frequency || def.frequency === 'monthly';

function aggregate(rows, end, size, def = {}) {
  if (!month(end) || !Number.isInteger(size) || size < 1 || size > 1200
    || windowed(def) || stock(def) || !monthly(def)) return null;
  const points = Array.from({ length: size }, (_, index) => at(rows, shift(end, index - size + 1)));
  if (points.some(point => !usable(point, def))) return null;
  const units = new Set(points.map(point => point.unit).filter(Boolean));
  if (units.size > 1) return null;
  const method = def.aggregation || 'monthly_mean';
  let value, days = null;
  if (method === 'day_weighted') {
    if (points.some(point => !finite(point.days) || point.days <= 0)) return null;
    days = points.reduce((sum, point) => sum + point.days, 0);
    const total = points.reduce((sum, point) => sum + point.value * point.days, 0);
    if (!finite(total) || !finite(days)) return null;
    value = total / days;
  } else if (method === 'sum') {
    value = points.reduce((sum, point) => sum + point.value, 0);
  } else if (['monthly_mean', 'mean', 'average', 'none'].includes(method)) {
    // Legacy share metadata uses 'none'; its supported multi-month display is a mean.
    value = points.reduce((sum, point) => sum + point.value / size, 0);
  } else return null;
  if (!finite(value)) return null;
  return { date: `${month(end)}-01`, value, days, points, method, months: size,
    unit: units.values().next().value || def.unit,
    period_status: 'Calculated from completed months' };
}

function rolling(rows, date, def = {}, size = 3) {
  if (stock(def)) return null;
  if (windowed(def) || quarterly(def)) {
    const point = at(rows, date);
    return usable(point, def) ? point : null;
  }
  return aggregate(rows, date, size, def);
}

function growth(rows, date, def = {}, lag = 12, window = 1) {
  if (!Number.isInteger(lag) || lag < 1 || !Number.isInteger(window) || window < 1) return null;
  const current = window === 1 ? at(rows, date) : rolling(rows, date, def, window);
  const previous = window === 1 ? at(rows, shift(date, -lag)) : rolling(rows, shift(date, -lag), def, window);
  return usable(current, def) && usable(previous, def) ? change(current, previous, def) : null;
}

function transform(rows, def = {}, view) {
  if (!Array.isArray(rows)) return [];
  const validRows = rows.filter(point => month(point?.date) && finite(point.value));
  const output = [];
  for (const point of validRows) {
    const unique = at(rows, point.date) === point;
    if (view === 'level') {
      // This chart is labelled as completed-period history. Raw partial and
      // forecast records remain available in the separate source-data views.
      if (!complete(point, def)) continue;
      output.push({ ...point, raw: point, analysis_method: 'Source observation',
        analysis_excluded: !unique || !usable(point, def), duplicate_period: !unique });
      continue;
    }
    if (!unique || !usable(point, def)) continue;
    let result;
    if (view === 'rolling') result = rolling(rows, point.date, def);
    else if (view === 'yoy') result = growth(rows, point.date, def);
    else if (view === 'mom') result = growth(rows, point.date, def, quarterly(def) ? 3 : 1);
    else if (view === 'rolling_yoy') result = growth(rows, point.date, def, 12, 3);
    else if (view === 'three_on_three') result = growth(rows, point.date, def, 3, 3);
    else if (view === 'ttm_yoy') result = windowed(def) || quarterly(def) || stock(def) ? null
      : growth(rows, point.date, def, 12, 12);
    else if (view === 'cagr' && !percentUnit(def.unit)) {
      const previous = at(rows, shift(point.date, -36));
      if (usable(previous, def) && previous.value > 0 && point.value >= 0 && pointUnitsAgree(point, previous)) {
        const value = (Math.cbrt(point.value / previous.value) - 1) * 100;
        if (finite(value)) result = { value };
      }
    }
    if (result) output.push({ ...point, value: result.value, raw: point, inputs: result.points,
      analysis_method: view, pp: result.pp });
  }
  return output.sort((a, b) => a.date.localeCompare(b.date));
}

function quarter(rows, date, def = {}) {
  const end = month(date);
  if (!end) return null;
  const m = Number(end.slice(5, 7));
  const size = (m - 1) % 3 + 1;
  const current = aggregate(rows, date, size, def);
  const previous = aggregate(rows, shift(date, -12), size, def);
  return current ? { ...current, label: `Q${Math.ceil(m / 3)} ${end.slice(0, 4)}${size < 3 ? ' QTD' : ''}`,
    growth: change(current, previous, def), prior: previous } : null;
}

function quarters(rows, def = {}) {
  if (!Array.isArray(rows)) return [];
  const done = rows.filter(point => usable(point, def) && at(rows, point.date) === point)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (quarterly(def)) return done.map(point => ({ ...point,
    label: `Q${Math.ceil(Number(point.date.slice(5, 7)) / 3)} ${point.date.slice(0, 4)}`,
    growth: growth(rows, point.date, def), months: 3 }));
  const last = done.at(-1);
  return done.filter(point => Number(point.date.slice(5, 7)) % 3 === 0 || point === last)
    .map(point => quarter(rows, point.date, def)).filter(Boolean);
}

export const Analytics = Object.freeze({ at, complete, usable, change, aggregate, rolling, growth,
  transform, quarter, quarters, shift });

/** Quote RFC 4180 cells and neutralize spreadsheet formulas in untrusted text. */
export function safeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  if (typeof value === 'number') return finite(value) ? `"${value}"` : '""';
  let text = String(value);
  if (/^[\s\u0000-\u001f]*[=+\-@]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

/** Pure, browser-compatible data validation and monthly financial comparisons. */
export const ENTITIES = Object.freeze({
  CME: 'CME Group',
  CBOE: 'Cboe Global Markets',
  ICE: 'Intercontinental Exchange',
  HOOD: 'Robinhood',
  NDAQ: 'Nasdaq',
  TW: 'Tradeweb',
  PREDICTION: 'Prediction markets',
});

export const UNITS = Object.freeze([
  'contracts', 'shares', 'USD', 'USD millions', 'USD billions', 'percent',
  'count', 'USD per contract', 'USD per share',
]);

const DAY = 86_400_000;
const TODAY = () => new Date().toISOString().slice(0, 10);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const finite = value => typeof value === 'number' && Number.isFinite(value);
const key = (entity, metric, period) => `${entity}|${metric}|${period}`;

export function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
    && value >= '1900-01-01' && value <= '9999-12-31';
}

const time = date => Date.parse(`${date}T00:00:00Z`);
const monthEnd = (year, month) => new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
const shiftMonth = (period, offset) => {
  const date = new Date(`${period}T00:00:00Z`);
  return monthEnd(date.getUTCFullYear(), date.getUTCMonth() + offset);
};
const isMonthEnd = date => isDate(date) && shiftMonth(date, 0) === date;
const expectedPeriod = asOf => isMonthEnd(asOf) ? asOf : shiftMonth(asOf, -1);
const age = (asOf, period) => Math.round((time(asOf) - time(period)) / DAY);
const windowEnding = (period, size = 3) => Array.from({ length: size }, (_, index) => shiftMonth(period, index - size + 1));

function unknownFields(value, allowed, at, errors) {
  for (const field of Object.keys(value)) {
    if (!allowed.includes(field)) errors.push(`${at}: unknown field ${field}.`);
  }
}

/** Validate the entire snapshot. Errors prevent loading; warnings describe incomplete data. */
export function validateDataset(input, { asOf = TODAY() } = {}) {
  const errors = [];
  const warnings = [];
  if (!isDate(asOf)) return { errors: ['Validation asOf must be a valid YYYY-MM-DD date.'], warnings };
  if (!object(input)) return { errors: ['Dataset must be a JSON object.'], warnings };
  unknownFields(input, ['schemaVersion', 'dataset', 'metrics', 'observations'], 'root', errors);
  if (input.schemaVersion !== 1) errors.push('schemaVersion must be 1.');

  const metadata = input.dataset;
  if (!object(metadata)) errors.push('dataset metadata must be an object.');
  else {
    unknownFields(metadata, ['name', 'kind', 'asOf'], 'dataset', errors);
    if (!nonempty(metadata.name)) errors.push('dataset.name must be a nonempty string.');
    if (!['synthetic', 'private'].includes(metadata.kind)) errors.push('dataset.kind must explicitly be synthetic or private.');
    if (!isDate(metadata.asOf)) errors.push('dataset.asOf must be a valid YYYY-MM-DD date.');
    else if (metadata.asOf > asOf) errors.push(`dataset.asOf ${metadata.asOf} is in the future relative to ${asOf}.`);
  }

  const metrics = new Map();
  if (!Array.isArray(input.metrics) || input.metrics.length === 0) errors.push('metrics must be a nonempty array.');
  else input.metrics.forEach((metric, index) => {
    const at = `metrics[${index}]`;
    if (!object(metric)) { errors.push(`${at} must be an object.`); return; }
    unknownFields(metric, ['id', 'label', 'unit', 'aggregation', 'staleAfterDays', 'entities'], at, errors);
    if (typeof metric.id !== 'string' || !/^[a-z][a-z0-9_]{0,63}$/.test(metric.id)) errors.push(`${at}.id must be a lowercase identifier (letters, digits, underscores; max 64 characters).`);
    else if (metrics.has(metric.id)) errors.push(`${at}.id duplicates metric ${metric.id}.`);
    else metrics.set(metric.id, metric);
    if (!nonempty(metric.label)) errors.push(`${at}.label must be a nonempty string.`);
    if (!UNITS.includes(metric.unit)) errors.push(`${at}.unit is unsupported.`);
    if (!['sum', 'average', 'last'].includes(metric.aggregation)) errors.push(`${at}.aggregation must be sum, average or last.`);
    if (!Number.isInteger(metric.staleAfterDays) || metric.staleAfterDays < 1 || metric.staleAfterDays > 3660) errors.push(`${at}.staleAfterDays must be an integer from 1 to 3660.`);
    if (!Array.isArray(metric.entities) || metric.entities.length === 0) errors.push(`${at}.entities must be a nonempty array.`);
    else {
      const seen = new Set();
      metric.entities.forEach(entity => {
        if (!Object.hasOwn(ENTITIES, entity)) errors.push(`${at}.entities contains unknown entity ${entity}.`);
        if (seen.has(entity)) errors.push(`${at}.entities repeats entity ${entity}.`);
        seen.add(entity);
      });
    }
  });

  const seen = new Set();
  if (!Array.isArray(input.observations)) errors.push('observations must be an array.');
  else input.observations.forEach((row, index) => {
    const at = `observations[${index}]`;
    if (!object(row)) { errors.push(`${at} must be an object.`); return; }
    unknownFields(row, ['entity', 'metric', 'period', 'observedAt', 'value', 'unit', 'source'], at, errors);
    const metric = metrics.get(row.metric);
    if (!Object.hasOwn(ENTITIES, row.entity)) errors.push(`${at}.entity is unknown.`);
    if (!metric) errors.push(`${at}.metric references unknown metric ${row.metric}.`);
    else {
      if (!Array.isArray(metric.entities) || !metric.entities.includes(row.entity)) errors.push(`${at}.entity is not configured for metric ${row.metric}.`);
      if (row.unit !== metric.unit) errors.push(`${at}.unit ${row.unit} does not match metric unit ${metric.unit}; convert explicitly before loading.`);
    }
    if (!UNITS.includes(row.unit)) errors.push(`${at}.unit is unsupported.`);
    if (row.value !== null && !finite(row.value)) errors.push(`${at}.value must be a finite number or explicit null; numeric strings are not accepted.`);
    if (!nonempty(row.source)) errors.push(`${at}.source must be a nonempty provenance string.`);

    const validPeriod = isDate(row.period);
    const validObservedAt = isDate(row.observedAt);
    if (!validPeriod) errors.push(`${at}.period must be a valid YYYY-MM-DD date.`);
    else if (!isMonthEnd(row.period)) errors.push(`${at}.period must be a calendar month-end date.`);
    if (!validObservedAt) errors.push(`${at}.observedAt must be a valid YYYY-MM-DD date.`);
    if (validPeriod && validObservedAt && row.observedAt < row.period) errors.push(`${at}.observedAt precedes the period end.`);
    for (const field of ['period', 'observedAt']) {
      if (!isDate(row[field])) continue;
      if (row[field] > asOf) errors.push(`${at}.${field} ${row[field]} is in the future relative to ${asOf}.`);
      if (isDate(metadata?.asOf) && row[field] > metadata.asOf) errors.push(`${at}.${field} exceeds dataset.asOf ${metadata.asOf}.`);
    }
    const identifier = key(row.entity, row.metric, row.period);
    if (seen.has(identifier)) errors.push(`${at} duplicates entity/metric/period ${identifier}.`);
    seen.add(identifier);
  });

  if (errors.length) return { errors, warnings };
  if (input.observations.length === 0) warnings.push('No observations are present. Missing data will remain unavailable.');
  for (const metric of input.metrics) {
    for (const entity of metric.entities) {
      const summary = summarizeMetric(input, entity, metric.id, asOf);
      const name = `${entity}/${metric.id}`;
      if (!summary.current) warnings.push(`${name}: no observations are available.`);
      else {
        if (summary.current.value === null) warnings.push(`${name}: latest observation ${summary.current.period} is explicitly missing (null).`);
        if (summary.isStale) warnings.push(`${name}: latest period ${summary.current.period} is stale (${summary.ageDays} days old; threshold ${metric.staleAfterDays}).`);
      }
      if (summary.missingPeriods.length) warnings.push(`${name}: ${summary.missingPeriods.length} missing monthly period(s), including ${summary.missingPeriods.slice(-4).join(', ')}.`);
    }
  }
  return { errors, warnings };
}

const unavailable = (reason, periods, baseValue = null) => ({ value: null, reason, baseValue, periods });

function aggregate(byPeriod, periods, aggregation) {
  const absent = periods.filter(period => !byPeriod.has(period) || byPeriod.get(period).value === null);
  if (absent.length) return unavailable(`Missing monthly data: ${absent.join(', ')}.`, periods);
  const values = periods.map(period => byPeriod.get(period).value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const value = aggregation === 'last' ? values.at(-1) : aggregation === 'sum' ? total : total / values.length;
  if (!finite(value)) return unavailable('Calculation exceeds the supported numeric range.', periods);
  return { value, reason: null, baseValue: null, periods };
}

function change(current, previous) {
  const periods = [...previous.periods, ...current.periods];
  if (current.value === null) return unavailable(`Current comparison window unavailable. ${current.reason}`, periods, previous.value);
  if (previous.value === null) return unavailable(`Prior comparison window unavailable. ${previous.reason}`, periods);
  if (previous.value === 0) return unavailable('Percentage change is undefined because the comparison base is zero.', periods, previous.value);
  if (previous.value < 0) return unavailable('Percentage change is not shown when the comparison base is negative.', periods, previous.value);
  const value = ((current.value - previous.value) / previous.value) * 100;
  if (!finite(value)) return unavailable('Calculation exceeds the supported numeric range.', periods, previous.value);
  return { value, reason: null, baseValue: previous.value, periods };
}

/**
 * Summarize a validated monthly series using only observations known by asOf.
 * Percentage results use percentage units: 5 means +5%, not 0.05.
 */
export function summarizeMetric(input, entity, metricId, asOf = TODAY()) {
  if (!isDate(asOf)) throw new TypeError('asOf must be a valid YYYY-MM-DD date.');
  const metric = input.metrics.find(candidate => candidate.id === metricId);
  if (!metric || !metric.entities.includes(entity)) throw new TypeError(`Unknown entity/metric combination ${entity}/${metricId}.`);
  const rows = input.observations
    .filter(row => row.entity === entity && row.metric === metricId && row.period <= asOf && row.observedAt <= asOf)
    .sort((a, b) => a.period.localeCompare(b.period));
  const byPeriod = new Map(rows.map(row => [row.period, row]));
  const latest = rows.at(-1);
  const latestExpectedPeriod = expectedPeriod(asOf);
  const period = latest?.period ?? latestExpectedPeriod;
  const current = latest ? { value: latest.value, period: latest.period, observedAt: latest.observedAt, source: latest.source, unit: latest.unit } : null;
  const ageDays = latest ? age(asOf, latest.period) : null;
  const isStale = ageDays !== null && ageDays > metric.staleAfterDays;
  const isMissing = !latest || latest.value === null || !byPeriod.has(latestExpectedPeriod) || byPeriod.get(latestExpectedPeriod).value === null;
  const status = !latest || latest.value === null ? 'missing' : isStale ? 'stale' : isMissing ? 'missing' : 'ok';
  const missingPeriods = [];
  for (let cursor = rows[0]?.period ?? latestExpectedPeriod; cursor <= latestExpectedPeriod; cursor = shiftMonth(cursor, 1)) {
    if (!byPeriod.has(cursor) || byPeriod.get(cursor).value === null) missingPeriods.push(cursor);
    if (cursor === '9999-12-31') break;
  }

  const currentMonth = aggregate(byPeriod, [period], metric.aggregation);
  const priorYearMonth = aggregate(byPeriod, [shiftMonth(period, -12)], metric.aggregation);
  const trailing3m = aggregate(byPeriod, windowEnding(period), metric.aggregation);
  const priorYear3m = aggregate(byPeriod, windowEnding(shiftMonth(period, -12)), metric.aggregation);
  const previous3m = aggregate(byPeriod, windowEnding(shiftMonth(period, -3)), metric.aggregation);
  return {
    entity, metricId, label: metric.label, unit: metric.unit, aggregation: metric.aggregation,
    asOf, current, latestExpectedPeriod, status, isStale, isMissing, ageDays, missingPeriods,
    yoy: change(currentMonth, priorYearMonth), trailing3m,
    trailing3mYoY: change(trailing3m, priorYear3m), previous3m,
    trailing3mChange: change(trailing3m, previous3m),
  };
}

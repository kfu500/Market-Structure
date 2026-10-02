import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ENTITIES, UNITS, isDate, validateDataset, summarizeMetric } from '../src/domain.js';

const AS_OF = '2026-10-02';
const fixture = JSON.parse(await readFile(new URL('../examples/synthetic.json', import.meta.url), 'utf8'));
const copy = () => structuredClone(fixture);
const ending = (year, month) => new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

function series(aggregation = 'sum') {
  const observations = [];
  for (let offset = 0; offset < 20; offset++) {
    const period = ending(2025, offset + 1);
    observations.push({ entity: 'CME', metric: 'example', period, observedAt: period, value: offset + 10, unit: 'contracts', source: 'Synthetic test' });
  }
  return {
    schemaVersion: 1,
    dataset: { name: 'Synthetic test', kind: 'synthetic', asOf: '2026-08-31' },
    metrics: [{ id: 'example', label: 'Example', unit: 'contracts', aggregation, staleAfterDays: 45, entities: ['CME'] }],
    observations,
  };
}

const summary = input => summarizeMetric(input, 'CME', 'example', '2026-08-31');
const approx = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const fails = (mutate, expected) => {
  const data = copy();
  mutate(data);
  assert.match(validateDataset(data, { asOf: AS_OF }).errors.join('\n'), expected);
};

test('synthetic example covers all portal entities and explicitly identifies invented data', () => {
  const result = validateDataset(fixture, { asOf: AS_OF });
  assert.deepEqual(result.errors, []);
  assert.equal(fixture.dataset.kind, 'synthetic');
  assert.deepEqual(new Set(fixture.observations.map(row => row.entity)), new Set(Object.keys(ENTITIES)));
  assert.ok(fixture.observations.every(row => row.source.includes('Synthetic')));
  assert.ok(result.warnings.some(message => message.includes('missing monthly')));
  assert.ok(result.warnings.some(message => message.includes('explicitly missing')));
  assert.ok(result.warnings.some(message => message.includes('stale')));
  assert.ok(UNITS.includes('USD millions'));
});

test('calendar validation handles leap years, month ends and invalid dates strictly', () => {
  assert.equal(isDate('2024-02-29'), true);
  for (const date of ['2025-02-29', '2025-02-30', '2025-13-01', '2025-1-01', '2025-01-01T00:00:00Z', '', null]) assert.equal(isDate(date), false);
  fails(data => { data.observations[0].period = '2025-01-30'; }, /calendar month-end/);
  fails(data => { data.observations[0].period = '2025-02-30'; }, /valid YYYY-MM-DD/);
  fails(data => { data.observations[0].observedAt = '2025-02-30'; }, /valid YYYY-MM-DD/);
});

test('dates must not look ahead beyond snapshot, observation time or runtime', () => {
  fails(data => { data.observations[0].observedAt = '2025-01-30'; }, /precedes the period/);
  fails(data => { data.observations[0].observedAt = '2026-09-06'; }, /exceeds dataset.asOf/);
  fails(data => { data.observations[0].period = '2026-12-31'; }, /in the future/);
  fails(data => { data.observations[0].observedAt = '2026-12-31'; }, /in the future/);
  fails(data => { data.dataset.asOf = '2026-12-31'; }, /dataset.asOf .*future/);
  assert.match(validateDataset(fixture, { asOf: 'not-a-date' }).errors[0], /Validation asOf/);
});

test('values are finite numbers or explicit null; zero and signed values are retained', () => {
  for (const invalid of ['12', undefined, NaN, Infinity, -Infinity, {}, false]) {
    fails(data => { data.observations[0].value = invalid; }, /finite number or explicit null/);
  }
  for (const valid of [0, -15.25, null]) {
    const data = copy();
    data.observations[0].value = valid;
    assert.deepEqual(validateDataset(data, { asOf: AS_OF }).errors, []);
  }
});

test('rejects mismatched units rather than guessing conversion factors', () => {
  fails(data => { data.observations[0].unit = 'USD billions'; }, /does not match metric unit USD millions/);
  fails(data => { data.metrics[0].unit = 'EUR'; }, /unit is unsupported/);
});

test('rejects duplicate records even when values agree and duplicate definitions', () => {
  fails(data => { data.observations.push({ ...data.observations[0] }); }, /duplicates entity\/metric\/period/);
  fails(data => { data.metrics.push({ ...data.metrics[0] }); }, /duplicates metric/);
  fails(data => { data.metrics[0].entities.push('CME'); }, /repeats entity/);
});

test('validates references, provenance, shape, explicit data kind and unknown fields', () => {
  fails(data => { data.observations[0].entity = 'BAD'; }, /entity is unknown/);
  fails(data => { data.observations[0].metric = 'unknown'; }, /references unknown metric/);
  fails(data => { data.observations[0].entity = 'PREDICTION'; }, /not configured/);
  fails(data => { data.observations[0].source = ' '; }, /nonempty provenance/);
  fails(data => { delete data.dataset.kind; }, /explicitly be synthetic or private/);
  fails(data => { data.proprietaryComment = 'Must not pass validation'; }, /unknown field proprietaryComment/);
  fails(data => { data.schemaVersion = 2; }, /schemaVersion/);
  fails(data => { data.metrics = []; }, /nonempty array/);
  fails(data => { data.observations = {}; }, /observations must be an array/);
  fails(data => { data.metrics[0].aggregation = 'median'; }, /aggregation/);
  fails(data => { data.metrics[0].staleAfterDays = -1; }, /staleAfterDays/);
  fails(data => { data.metrics[0].staleAfterDays = 1.5; }, /staleAfterDays/);
  assert.match(validateDataset(null).errors[0], /JSON object/);
});

test('YoY uses the same calendar month one year earlier', () => {
  const data = series();
  const result = summary(data);
  assert.equal(result.current.value, 29);
  assert.equal(result.current.period, '2026-08-31');
  assert.equal(result.yoy.baseValue, 17);
  approx(result.yoy.value, (29 / 17 - 1) * 100);
  assert.deepEqual(result.yoy.periods, ['2025-08-31', '2026-08-31']);
  data.observations = data.observations.filter(row => row.period !== '2025-08-31');
  assert.equal(summary(data).yoy.value, null);
  assert.match(summary(data).yoy.reason, /2025-08-31/);
});

test('T3M sums three complete calendar months and compares aligned windows', () => {
  const result = summary(series());
  assert.equal(result.trailing3m.value, 27 + 28 + 29);
  assert.deepEqual(result.trailing3m.periods, ['2026-06-30', '2026-07-31', '2026-08-31']);
  assert.equal(result.previous3m.value, 24 + 25 + 26);
  assert.equal(result.trailing3mYoY.baseValue, 15 + 16 + 17);
  approx(result.trailing3mYoY.value, 75);
  approx(result.trailing3mChange.value, 12);
});

test('T3M averages and end-of-period metrics use their declared aggregation', () => {
  const average = summary(series('average'));
  assert.equal(average.trailing3m.value, 28);
  assert.equal(average.previous3m.value, 25);
  const last = summary(series('last'));
  assert.equal(last.trailing3m.value, 29);
  assert.equal(last.previous3m.value, 26);
  assert.equal(last.trailing3mYoY.baseValue, 17);
});

test('all aggregations require three consecutive non-null months, without zero filling', () => {
  for (const aggregation of ['sum', 'average', 'last']) {
    const data = series(aggregation);
    data.observations = data.observations.filter(row => row.period !== '2026-07-31');
    const result = summary(data);
    assert.equal(result.trailing3m.value, null);
    assert.match(result.trailing3m.reason, /2026-07-31/);
    assert.equal(result.trailing3mYoY.value, null);
    assert.ok(result.missingPeriods.includes('2026-07-31'));
    assert.equal(result.yoy.value !== null, true);
  }
});

test('latest explicit null stays missing instead of falling back to older positive values', () => {
  const data = series();
  data.observations.at(-1).value = null;
  const result = summary(data);
  assert.equal(result.current.period, '2026-08-31');
  assert.equal(result.current.value, null);
  assert.equal(result.status, 'missing');
  assert.equal(result.ageDays, 0);
  assert.equal(result.yoy.value, null);
  assert.equal(result.trailing3m.value, null);
});

test('zero levels are valid; zero and negative bases make percent comparisons unavailable', () => {
  const data = series();
  data.observations.at(-1).value = 0;
  assert.equal(summary(data).current.value, 0);
  assert.equal(summary(data).yoy.value, -100);
  data.observations.find(row => row.period === '2025-08-31').value = 0;
  assert.equal(summary(data).yoy.value, null);
  assert.match(summary(data).yoy.reason, /base is zero/);
  data.observations.find(row => row.period === '2025-08-31').value = -2;
  assert.match(summary(data).yoy.reason, /base is negative/);
});

test('overflow produces unavailable calculations rather than Infinity', () => {
  const data = series();
  for (const row of data.observations) row.value = Number.MAX_VALUE;
  assert.equal(summary(data).trailing3m.value, null);
  assert.match(summary(data).trailing3m.reason, /numeric range/);
  data.observations.find(row => row.period === '2025-08-31').value = Number.MIN_VALUE;
  assert.equal(summary(data).yoy.value, null);
});

test('asOf cutoff excludes observations that had not yet been reported', () => {
  const data = series();
  data.observations.at(-1).observedAt = '2026-09-02';
  data.dataset.asOf = '2026-09-02';
  const result = summarizeMetric(data, 'CME', 'example', '2026-08-31');
  assert.equal(result.current.period, '2026-07-31');
  assert.equal(result.latestExpectedPeriod, '2026-08-31');
  assert.equal(result.isMissing, true);
  assert.equal(result.status, 'missing');
  assert.deepEqual(result.trailing3m.periods, ['2026-05-31', '2026-06-30', '2026-07-31']);
  assert.equal(summarizeMetric(data, 'CME', 'example', '2026-09-02').current.period, '2026-08-31');
});

test('freshness uses period end rather than a recent upload date, independent of missingness', () => {
  const data = series();
  data.observations.at(-1).observedAt = '2026-10-02';
  data.dataset.asOf = AS_OF;
  data.metrics[0].staleAfterDays = 30;
  const result = summarizeMetric(data, 'CME', 'example', AS_OF);
  assert.equal(result.ageDays, 32);
  assert.equal(result.isStale, true);
  assert.equal(result.isMissing, true);
  assert.equal(result.status, 'stale');
  assert.equal(result.latestExpectedPeriod, '2026-09-30');
  assert.ok(result.missingPeriods.includes('2026-09-30'));
  data.observations.at(-1).value = null;
  assert.equal(summarizeMetric(data, 'CME', 'example', AS_OF).status, 'missing');
  assert.equal(summarizeMetric(data, 'CME', 'example', AS_OF).isStale, true);
});

test('no observations and dates before series start produce clear unavailability', () => {
  const data = series();
  const result = summarizeMetric(data, 'CME', 'example', '2024-12-15');
  assert.equal(result.current, null);
  assert.equal(result.ageDays, null);
  assert.equal(result.status, 'missing');
  assert.equal(result.latestExpectedPeriod, '2024-11-30');
  assert.equal(result.trailing3m.value, null);
  data.observations = [];
  assert.deepEqual(validateDataset(data, { asOf: AS_OF }).errors, []);
  assert.ok(validateDataset(data, { asOf: AS_OF }).warnings.some(message => message.includes('No observations')));
});

test('summaries neither mutate nor depend on the ordering of source observations', () => {
  const data = series();
  const expected = summary(data);
  data.observations.reverse();
  const before = structuredClone(data);
  assert.deepEqual(summary(data), expected);
  assert.deepEqual(data, before);
});

test('invalid query inputs fail explicitly', () => {
  assert.throws(() => summarizeMetric(series(), 'CME', 'example', '2026-02-30'), /valid YYYY-MM-DD/);
  assert.throws(() => summarizeMetric(series(), 'TW', 'example', AS_OF), /Unknown entity\/metric/);
  assert.throws(() => summarizeMetric(series(), 'CME', 'unknown', AS_OF), /Unknown entity\/metric/);
});

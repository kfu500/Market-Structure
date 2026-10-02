import test from 'node:test';
import assert from 'node:assert/strict';
import { Analytics as A, safeCsvCell } from '../src/legacy-analytics.js';

// All values, dates and labels in this suite are invented fixtures.
const p = (date, value, extra = {}) => ({ date: `${date}-01`, value, ...extra });
const definition = { unit: 'contracts/day', frequency: 'monthly', aggregation: 'day_weighted' };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const range = (start, count, value = 10) => Array.from({ length: count }, (_, i) =>
  p(A.shift(start, i), typeof value === 'function' ? value(i) : value, { days: 20 }));

test('calendar shifts validate exact dates and handle year boundaries', () => {
  assert.equal(A.shift('2020-01-31', -1), '2019-12');
  assert.equal(A.shift('2020-02-29', 12), '2021-02');
  for (const date of ['2021-02-29', '2020-04-31', '2020-13', 'invalid', null]) assert.equal(A.shift(date, 1), null);
  assert.equal(A.shift('2020-02', 0.5), null);
  assert.equal(A.shift('9999-12', 1), null);
});

test('completion excludes missing, nonfinite, preliminary and non-observed records', () => {
  assert.equal(A.complete(p('2020-01', 0)), true);
  for (const value of [null, undefined, NaN, Infinity, true, '4']) assert.equal(A.complete(p('2020-01', value)), false);
  for (const status of ['MTD', 'Partial month', 'Preliminary', 'incomplete', 'provisional', 'forecast', 'carry-forward', 'assumption', 'estimated']) {
    assert.equal(A.complete(p('2020-01', 1, { period_status: status })), false, status);
  }
  assert.equal(A.usable(p('2020-01', 1, { analysis_block: 'Unreconciled definition' })), false);
  assert.equal(A.usable(p('2020-01', 1, { classification: 'Forecast' })), false);
  assert.equal(A.complete({ date: '2020-02-30', value: 1 }), false);
});

test('explicit snapshot cutoff validates completed months and quarters', () => {
  assert.equal(A.complete(p('2020-02', 5), { asOf: '2020-02-28' }), false);
  assert.equal(A.complete(p('2020-02', 5), { asOf: '2020-02-29' }), true);
  assert.equal(A.complete(p('2020-04', 5), { asOf: '2020-03-31' }), false);
  assert.equal(A.complete(p('2020-04', 5), { asOf: '2020-05-31', frequency: 'quarterly' }), false);
  assert.equal(A.complete(p('2020-04', 5), { asOf: '2020-06-30', frequency: 'quarterly' }), true);
  assert.equal(A.complete(p('2020-01', 5), { asOf: '2020-02-30' }), false);
});

test('ADV aggregates supplied trading days rather than averaging monthly readings', () => {
  const rows = [p('2020-01', 10, { days: 10 }), p('2020-02', 20, { days: 20 }), p('2020-03', 30, { days: 30 })];
  const weighted = A.aggregate(rows, '2020-03', 3, definition);
  near(weighted.value, 1400 / 60);
  assert.equal(weighted.days, 60);
  assert.equal(weighted.points.length, 3);
  assert.equal(A.aggregate(rows, '2020-03', 3, { aggregation: 'monthly_mean' }).value, 20);
  assert.equal(A.aggregate(rows, '2020-03', 3, { aggregation: 'sum' }).value, 60);
  assert.equal(A.aggregate(rows.map(row => ({ ...row, days: null })), '2020-03', 3, definition), null);
  assert.equal(A.aggregate(rows, '2020-03', 3, { aggregation: 'unknown' }), null);
});

test('calendar gaps, partial data, duplicates and inconsistent units never select substitutes', () => {
  const rows = range('2020-01', 3);
  assert.equal(A.aggregate([rows[0], rows[2]], '2020-03', 3, definition), null);
  assert.equal(A.aggregate([...rows, { ...rows[1], value: 99 }], '2020-03', 3, definition), null);
  assert.equal(A.at([rows[0], { ...rows[0], date: '2020-01-31' }], '2020-01'), undefined);
  assert.equal(A.aggregate(rows.map((r, i) => i === 1 ? { ...r, period_status: 'MTD' } : r), '2020-03', 3, definition), null);
  assert.equal(A.aggregate(rows.map((r, i) => ({ ...r, unit: i === 1 ? 'shares' : 'contracts' })), '2020-03', 3, definition), null);
  assert.equal(A.growth([p('2019-12', 5), p('2021-01', 10)], '2021-01', definition), null);
});

test('already windowed pricing stays supplied and stocks are never summed or averaged', () => {
  const rows = range('2020-01', 3, i => i + 1);
  for (const def of [{ window_months: 3 }, { family: 'RPC' }, { frequency: 'quarterly' }]) {
    assert.equal(A.rolling(rows, '2020-03', def), rows[2]);
    assert.equal(A.aggregate(rows, '2020-03', 3, def), null);
    assert.deepEqual(A.transform(rows, def, 'ttm_yoy'), []);
  }
  for (const def of [{ aggregation: 'stock' }, { measure_type: 'stock' }, { frequency: 'point_in_time' }]) {
    assert.equal(A.rolling(rows, '2020-03', def), null);
    assert.equal(A.aggregate(rows, '2020-03', 3, def), null);
    assert.deepEqual(A.quarters(rows, def), []);
  }
});

test('YoY and T3M use exact calendar periods and complete comparable windows', () => {
  const rows = [...range('2019-01', 3, 10), ...range('2020-01', 3, i => 20 + i * 10)];
  near(A.growth(rows, '2020-03', definition).value, 300);
  near(A.growth(rows, '2020-03', definition, 12, 3).value, 200);
  near(A.transform(rows, definition, 'rolling_yoy').at(-1).value, 200);
  near(A.transform(rows, definition, 'rolling').at(-1).value, 30);
  const adjacent = [...range('2020-01', 3, 10), ...range('2020-04', 3, 20)];
  near(A.transform(adjacent, definition, 'three_on_three').at(-1).value, 100);
  assert.equal(A.growth(rows.filter(row => row.date !== '2019-02-01'), '2020-03', definition, 12, 3), null);
});

test('fractional shares and explicitly percent-point inputs produce percentage-point differences even from zero', () => {
  near(A.change({ value: 0.2 }, { value: 0.1 }, '%').value, 10);
  near(A.change({ value: 0.2 }, { value: 0 }, '%').value, 20);
  near(A.change({ value: 20 }, { value: 10 }, { unit: '%', percentEncoding: 'points' }).value, 10);
  near(A.change({ value: 20 }, { value: 10 }, 'percent').value, 10);
  assert.equal(A.change({ value: 0 }, { value: 0 }, '%').pp, true);
  assert.equal(A.change({ value: 2 }, { value: 0 }, 'USD'), null);
  assert.equal(A.change({ value: 2 }, { value: -1 }, 'USD'), null);
  near(A.change({ value: -1 }, { value: 2 }, 'USD').value, -150);
  assert.equal(A.change({ value: 2, unit: 'USD' }, { value: 1, unit: 'EUR' }, 'USD'), null);
});

test('QTD compares the same elapsed months and quarterly series uses quarterly sequential lag', () => {
  const rows = [...range('2019-01', 3, 5), ...range('2020-01', 2, 10)];
  const qtd = A.quarter(rows, '2020-02', { aggregation: 'sum' });
  assert.equal(qtd.value, 20);
  assert.equal(qtd.prior.value, 10);
  assert.equal(qtd.months, 2);
  assert.equal(qtd.label, 'Q1 2020 QTD');
  near(qtd.growth.value, 100);
  const quarters = [p('2019-03', 5), p('2019-06', 10), p('2020-03', 15), p('2020-06', 30)];
  near(A.transform(quarters, { frequency: 'quarterly' }, 'mom').at(-1).value, 100);
  near(A.quarters(quarters, { frequency: 'quarterly' }).at(-1).growth.value, 200);
  assert.equal(A.quarters(quarters, { frequency: 'quarterly' }).at(-1).months, 3);
});

test('TTM requires 24 aligned months; CAGR requires its exact endpoint and positive baseline', () => {
  const rows = [...range('2019-01', 12, 5), ...range('2020-01', 12, 10)];
  near(A.transform(rows, { aggregation: 'sum' }, 'ttm_yoy').at(-1).value, 100);
  assert.deepEqual(A.transform(rows.filter(row => row.date !== '2019-07-01'), { aggregation: 'sum' }, 'ttm_yoy'), []);
  near(A.transform([p('2017-01', 10), p('2020-01', 80)], {}, 'cagr').at(-1).value, 100);
  assert.deepEqual(A.transform([p('2017-02', 10), p('2020-01', 80)], {}, 'cagr'), []);
  assert.deepEqual(A.transform([p('2017-01', 0), p('2020-01', 80)], {}, 'cagr'), []);
  assert.deepEqual(A.transform([p('2017-01', 0.1), p('2020-01', 0.2)], { unit: '%' }, 'cagr'), []);
});

test('completed-level charts exclude partial and forecast records while preserving source data', () => {
  const rows = [p('2019-01', 10), p('2020-01', 20, { classification: 'Forecast' }),
    p('2020-02', 30, { period_status: 'partial' }), p('2020-03', 40, { analysis_block: 'Unit scope' })];
  const original = structuredClone(rows);
  const levels = A.transform(rows, {}, 'level');
  assert.equal(levels.length, 2);
  assert.equal(levels[0].analysis_excluded, false);
  assert.equal(levels[1].date, '2020-03-01');
  assert.equal(levels[1].analysis_excluded, true);
  assert.deepEqual(rows, original);
  assert.equal(A.transform(rows, { asOf: '2019-01-31' }, 'level').length, 1);
  assert.deepEqual(A.transform(rows, {}, 'yoy'), []);
  const duplicate = [...rows, { ...rows[0] }];
  assert.equal(A.transform(duplicate, {}, 'level').filter(row => row.duplicate_period).length, 2);
});

test('arithmetic overflow remains missing and input records stay unchanged', () => {
  assert.equal(A.change({ value: Number.MAX_VALUE }, { value: Number.MIN_VALUE }, 'USD'), null);
  assert.equal(A.aggregate(range('2020-01', 3, Number.MAX_VALUE), '2020-03', 3, { aggregation: 'sum' }), null);
  assert.equal(A.aggregate(range('2020-01', 3, Number.MAX_VALUE), '2020-03', 3, definition), null);
  const rows = range('2020-01', 3);
  const original = structuredClone(rows);
  A.transform(rows, definition, 'rolling');
  A.quarters(rows.reverse(), definition);
  assert.deepEqual(rows, original.reverse());
});

test('CSV escaping protects formulas while retaining numeric negatives and missing cells', () => {
  assert.equal(safeCsvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(safeCsvCell('=SUM(A1)'), '"\'=SUM(A1)"');
  assert.equal(safeCsvCell('  @command'), '"\'  @command"');
  assert.equal(safeCsvCell('\tvalue'), '"\'\tvalue"');
  assert.equal(safeCsvCell(-2), '"-2"');
  assert.equal(safeCsvCell(null), '""');
  assert.equal(safeCsvCell(NaN), '""');
});

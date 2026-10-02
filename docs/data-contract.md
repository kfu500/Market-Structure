# Optional normalized monthly snapshot contract

This contract applies to the independent normalized monthly mode and synthetic demonstration using `dataset.json`. The migrated original portal uses external SQLite, a reviewed presentation pack, and `legacy.json`; it retains mixed-frequency history and research under the [full migration workflow](source-migration.md). Do not flatten that archive into this narrower monthly format. Application code and synthetic fixtures belong in Git; actual data, research, originals, and revision archives belong outside every Git checkout. A source label is provenance, not a refresh connection.

The supplied legacy sources have already been inspected and migrated through the SQLite workflow. For a separate JSON dataset, explicitly map source definitions to this contract. The JSON importer does not execute HTML, infer units, or convert other frequencies automatically.

## Schema version 1

All fields below are required. Unknown fields are rejected at every object level to catch misspelled fields and accidental payload additions. Additional business concepts require a reviewed schema change. Dates are ISO `YYYY-MM-DD` calendar dates, between 1900 and 9999, without times or implicit local timezone conversion.

```json
{
  "schemaVersion": 1,
  "dataset": {
    "name": "Synthetic example — invented values",
    "kind": "synthetic",
    "asOf": "2026-09-02"
  },
  "metrics": [{
    "id": "monthly_contracts",
    "label": "Monthly contracts",
    "unit": "contracts",
    "aggregation": "sum",
    "staleAfterDays": 45,
    "entities": ["CME"]
  }],
  "observations": [{
    "entity": "CME",
    "metric": "monthly_contracts",
    "period": "2026-08-31",
    "observedAt": "2026-09-02",
    "value": 100,
    "unit": "contracts",
    "source": "Synthetic example; invented for development"
  }]
}
```

| Field | Meaning and validation |
| --- | --- |
| `dataset.name` | Nonempty display label; keep the label appropriate for the private audience. |
| `dataset.kind` | Explicit `synthetic` or `private`. Actual normalized user data must be marked `private`. |
| `dataset.asOf` | Date through which this snapshot includes information; cannot be in the future. |
| `metrics[].id` | Unique lowercase identifier beginning with a letter, then letters, digits or underscores, at most 64 characters. |
| `metrics[].label` | Nonempty human-readable definition. Explain materially different metric definitions in the private source material. |
| `metrics[].unit` | One of the units listed below. |
| `metrics[].aggregation` | `sum`, `average` or `last`; defines how complete three-month windows are combined. |
| `metrics[].staleAfterDays` | Integer from 1 to 3660; latest period becomes stale when its age is greater than this threshold. Choose a reporting cadence appropriate to the metric. |
| `metrics[].entities` | Nonempty list of unique supported entity codes. The application does not assume every metric applies to every company. |
| `observations[].entity` | Supported entity code configured for the referenced metric. |
| `observations[].metric` | Existing metric identifier. |
| `observations[].period` | Calendar month-end date that the value describes. Non-monthly series do not fit this JSON contract; retain them in the full SQLite workflow or design an explicit contract extension. Never relabel quarterly data as monthly. |
| `observations[].observedAt` | Date this exact value became available, including a later revision date when appropriate. Must be on/after `period` and on/before both `dataset.asOf` and runtime today. Do not replace it with the upload date. |
| `observations[].value` | Finite JSON number or explicit `null`. Numeric strings, booleans, omitted values, `NaN` and infinities are rejected. Zero is a real observation. Signed values are allowed. |
| `observations[].unit` | Must exactly match its metric definition. Conversion is explicit upstream; the portal never guesses thousands versus millions. |
| `observations[].source` | Nonempty provenance label, such as report identifier and page. Rendered as text. Actual proprietary citations remain in external private data. |

Supported entities: `CME`, `CBOE`, `ICE`, `HOOD`, `NDAQ`, `TW`, `PREDICTION`. The last code is a combined prediction-markets page; provider-level detail should use clearly defined distinct metric identifiers until a reviewed provider dimension is added.

Supported units: `contracts`, `shares`, `USD`, `USD millions`, `USD billions`, `percent`, `count`, `USD per contract`, `USD per share`. Percent levels use `5` for 5%, not `0.05`. Cross-unit comparisons are never performed. Sources in other currencies require an explicit, documented conversion before using these units.

The tuple `(entity, metric, period)` is unique, even when duplicated rows have identical values. Resolve revisions deliberately into one canonical row per period before importing. Import archives preserve earlier files outside the repository; the active snapshot is not a complete observation-vintage database.

## Calculations and availability

`validateDataset(dataset, {asOf})` returns `{errors: string[], warnings: string[]}`. The default cutoff is runtime UTC today. Structural, unit, date and duplicate errors prevent loading the entire snapshot. Warnings describe null observations, calendar gaps, absent series and stale periods; warnings do not turn unknown values into zero.

`summarizeMetric(dataset, entity, metricId, asOf)` operates on a validated snapshot and considers only records whose period and observation date are on/before the cutoff. It does not mutate source observations. A revised value with a later observation date is unavailable before that date; the active snapshot cannot reconstruct an earlier value that was superseded. Use preserved prior snapshots for vintage-specific analysis.

The most recent known record anchors the displayed current level and historical comparison windows. An explicit null in that record stays null; an older positive value never substitutes for it. When a newer closed calendar month has no report, the missing-data flag remains visible alongside the older record's dates. A historical three-month window is never relabeled as a current window.

| Output | Calculation |
| --- | --- |
| `current` | Latest known `{value, period, observedAt, source, unit}`, or `null` if no records are known. |
| `yoy` | Same calendar month one year earlier, not the twelfth previous row. |
| `trailing3m` | Anchor month plus the preceding two consecutive calendar months. |
| `previous3m` | The three complete calendar months immediately before `trailing3m`. |
| `trailing3mYoY` | T3M versus the same three calendar months one year earlier. |
| `trailing3mChange` | T3M versus the immediately preceding three calendar months. |

Each calculation returns `{value, reason, baseValue, periods}`. `value: null` indicates unavailability and `reason` explains why. `periods` states the actual contributing month ends; comparisons list prior-window dates followed by current-window dates. For window levels, `baseValue` is null. For comparisons, it is the prior level when known.

All percentage comparisons use `100 × (current − prior) / prior`, returning `5` for +5%. Zero or negative prior levels make percentage comparisons unavailable, with an explicit reason. A current zero against a positive prior value yields −100%. A negative current value against a positive prior value is allowed. Percent-valued metric levels also use relative percentage changes; results are **not percentage-point differences**. Nonfinite calculation results are unavailable rather than rendered as infinity.

For T3M aggregation, `sum` adds all three monthly values, `average` uses their unweighted arithmetic mean, and `last` uses the third month's closing value. **All three modes require all three calendar months to exist with non-null values.** A three-month average of monthly rates is not a volume-weighted rate. True weighted ADV, weighted fee rates, ratios of totals, FX normalization and entity consolidation need upstream definitions and inputs; do not substitute an unweighted average silently.

## Freshness and missing data

Freshness is measured in whole UTC days from `current.period`, independent of a recent import or observation date. `isStale` is true only when age exceeds the metric's threshold. Missing data and stale data can both be true.

- `latestExpectedPeriod` is the most recent completed calendar month at the cutoff (the current month on its last day, otherwise the prior month).
- `missingPeriods` lists absent or null months from the first known record through that expected month. No earlier history is invented.
- `isMissing` is true when no latest value exists, the latest value is null, or the expected complete month is absent/null. An older interior gap is still reported in `missingPeriods` and invalidates any comparison window using it.
- `status` is `missing` for a null/no current record, otherwise `stale` if old, otherwise `missing` if the latest expected month is absent/null, otherwise `ok`. Use both booleans for independent display of freshness and availability.
- `ageDays` is null without a current record and otherwise remains available even when the record's value is null.

This is a conservative monthly schedule, not a source-specific release calendar. A recently closed month may be flagged missing while its publication is still pending. The portal shows snapshot and observation dates so users can distinguish that case from a working refresh feed. Missing source-specific release calendars are not evidence of live data.

## Private loading

First normalize a **copy** of the source data into this contract, retaining the untouched originals and a private mapping of source fields, units and formulas. The original HTML/ZIP can stay in external archival storage; neither belongs in the application checkout.

```sh
npm run data:validate -- --input /absolute/private/normalized.json --report /absolute/private/new-validation-report.json
npm run data:import -- --input /absolute/private/normalized.json --data-dir /absolute/private/market-structure
MARKET_STRUCTURE_DATA_DIR=/absolute/private/market-structure npm start
```

The import validates before replacing the snapshot, preserves a byte-for-byte copy of the input plus prior snapshots, and writes into external private storage. Set `dataset.kind` to `private` for actual data. Environment variables are process configuration; a checked-in `.env.example` contains placeholders only. Never place source values, credential values or internal commentary in environment example files, fixtures or tests.

The checked-in demonstration has 356 invented observations across January 2025–August 2026 and all seven pages. It deliberately includes a missing CME futures-volume month, an older ICE futures-volume series and a null latest Nasdaq options-volume observation. These are data-quality examples, not statements about those businesses.

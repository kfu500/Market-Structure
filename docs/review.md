# Review: private portal migration

This change migrates the supplied portal into a maintainable application with
external private storage. The original company workbenches, research, historical
series, consensus/scenario controls, advanced charts, and prediction tools remain
available across all seven coverage domains. The original source files are
preserved outside Git; repository fixtures and test values are synthetic.

Reviewed presentation code is separated from private literals, shell content,
styles, embedded JSON, observations, and research. SQLite and presentation packs
load from immutable external releases with fingerprint checks and atomic
activation. The original mixed-frequency history is retained. Every typed
observation reconciles with its source component pointer/value, and component
hashes pass validation. Original artifact hashes remain unchanged.

## Verification

- `npm ci --ignore-scripts --no-audit --no-fund --cache /workspace/.npm-market-structure-cache`: passed. Two pinned parser
  development dependencies; no third-party runtime dependencies.
- `npm run check`: 72 Node checks and 12 Python source-safety checks passed;
  the repository privacy gate passed.
- `npm run test:browser`: all eight scenarios passed, including the regression
  check that a throwing migrated module cannot mark the portal ready or expose
  its exception content. The monthly scenarios cover all pages, calculations,
  gaps, accessible charts/tables, imports/reload, error handling, and mobile UI.
- Private runtime browser QA: all 16 scenarios passed against actual private
  data. These cover all operating histories and metric selectors, independent
  YoY/T3M calculations, CSV dates/units/raw and derived values/formula safety,
  company research and consensus/scenarios, advanced company tabs, prediction
  fees with independent decimal calculations and invalid-input handling,
  contextual views, quality/reload, and a narrow mobile viewport. No JavaScript,
  CSP, HTTP, or external-network failures were observed.
- The final private-runtime rerun after bootstrap error-handling hardening also
  passed all 16 scenarios. Original artifacts and the extracted SQLite source
  were verified byte-for-byte against their preserved originals/archive.

Detailed private QA evidence, source identities, dates, counts, and fingerprints
stay outside the repository. The checked-in private browser harness reads
expectations from the configured runtime; it does not embed real source values.

## Behavior and review focus

The portal displays source observation dates and explicit quality warnings.
Unknown units and provisional records with missing cutoffs remain flagged.
Completed-period comparisons exclude partial/forecast/blocked observations,
require aligned usable windows, and avoid relative growth from nonpositive
prior baselines. Research and source roles remain distinct; overlapping sources
are not silently summed. The optional monthly demonstration remains available
when no private runtime is configured.

Review private presentation and generated-code changes together: the pack must
match reviewed module fingerprints. Inspect staged diffs for proprietary
identifiers/prose as well as obvious data and credential files. Automated gates
are defense in depth, not a complete privacy guarantee. See [the migration
workflow](source-migration.md) for immutable imports and source reconciliation.

The private presentation pack also contains snapshot-specific captions, static
values, and research context. Future adapters must reconcile database and
presentation together, or refactor remaining content bindings, before claiming
a coherent refreshed release.

No public hosting, Git push, or verified market-data refresh is included. Private
hosting still needs an authenticated SSO/VPN boundary, TLS, encrypted persistent
storage, backups, and operational testing. Scheduled updates require licensed
source adapters, secure credentials, source-specific validation, atomic imports,
scheduling, and failure monitoring. See [deployment details](private-hosting.md).

Reusable cloud installation/start instructions were saved to the environment
draft. Saving the draft did not publish the portal or verify a future restore.

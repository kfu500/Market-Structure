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

No public hosting or verified market-data refresh is included. Only reviewed
code is delivered through the authorized GitHub branch. Private
hosting still needs an authenticated SSO/VPN boundary, TLS, encrypted persistent
storage, backups, and operational testing. Scheduled updates require licensed
source adapters, secure credentials, source-specific validation, atomic imports,
scheduling, and failure monitoring. See [deployment details](private-hosting.md).

Reusable cloud installation/start instructions were saved to the environment
draft. Saving the draft did not publish the portal or verify a future restore.

## Private access and recovery preparation

The [hosting handoff](hosting-handoff.md) supplies an unprivileged systemd unit,
a required persistent-volume mount, and an SSH account restricted to the user's
key and the portal's loopback port. SSH syntax and effective restrictions were
checked; systemd unit verification passed with the available Node 24 executable.
No destination host, authentication identity, or durable storage was provisioned.
This task had no connected private-preview or ChatGPT Sites deployment tool;
Sites compatibility requires verification against the runtime requirements in
the handoff.

`scripts/backup-private.py` creates a private, no-overwrite archive and performs
bounded hash-verified recovery into a new external directory. Ten synthetic
backup tests pass, bringing the suite to 72 Node and 22 Python tests; repository
privacy checks pass. An actual private archive was created and fully restored,
and the application validated its restored database and matching presentation.
The archive remains local to the sandbox until transferred to an authorized
durable destination; local verification does not establish off-machine durability.

A fresh browser capture was emitted directly as an image for layout review.
Private screenshots, archive manifests, recovery evidence, and original upload
packages remain outside the repository.

## Local-computer package

Native Windows no longer depends on Linux `/proc` for SQLite reads. It copies
the pinned input descriptor to a private process snapshot, verifies source and
copy hashes and source stability, rejects active journals, opens native SQLite
read-only, and removes the copy on close. Linux retains descriptor pinning.
The portable path was exercised against the full private source in Linux;
actual Windows execution remains unverified in this environment.

The local launcher validates the private release, owns an OS-assigned loopback
port, opens the browser only after readiness, and closes its server on shutdown.
The prepared viewer and offline reconstruction require only Node 24. Windows
ACLs, script policy, browser opening and first-run behavior still need validation
on the user's computer. Native Windows CI is configured with synthetic inputs;
its remote result has not been observed.

The recovery format stores duplicate files once and can derive a working
database from a verified member of the byte-identical original ZIP. Each
transport part is 30 MiB or less. The Node-only reconstructor verifies parts,
the complete archive, ZIP CRCs, all file hashes and derived database bytes,
rejects unsafe paths and existing output folders, and leaves inputs unchanged.
No uploaded script is executed. The portable selection omits obsolete releases,
parsed source caches and redundant transport wrappers while retaining the
original archive/HTML and everything required by the active release.

Current core verification: 94 Node tests, 34 Python tests, and repository privacy
checks pass. See [local-computer instructions](local-computer.md); original
private artifacts and recovery downloads remain external to Git.

## Local setup from original uploads

`Setup-From-Originals.cmd` and `scripts/setup-from-originals.js` provide a separate
route when cloud artifact downloads are unavailable. The code-only GitHub ZIP
and the user's own local originals are sufficient. Setup accepts the full HTML
and database ZIP, or the original HTML ZIP and split database-upload ZIPs. It
requires Node 24 and the two pinned npm parsers, without Python, WSL or Docker.

Originals remain unchanged. Extraction is bounded and checks ZIP paths, CRCs,
sizes, source stability and available source-manifest hashes. No uploaded script
is run. Generated modules must match all reviewed application modules exactly,
and HTML components and calculation records reconcile to the validated database.
Empty metric maps with no records are retained in the original HTML; comparison
does not require nonexistent SQLite rows for those containers. Existing private
destinations are never overwritten, and failure removes only owned staging.

Both full-original and split-upload routes were reconstructed in the Linux
environment. Their database and presentation fingerprints match the existing
validated migration, and source checksums remain unchanged. The rebuilt runtime
passed all 16 private browser scenarios with no page, console, HTTP or external
request errors. All eight synthetic browser checks passed. Core verification is
now **109 Node tests, 34 Python tests and the repository privacy gate**. These
include corrupt/unsafe archives, rejected source mismatches, rollback, existing
data preservation, safe CLI error output and Windows directory-sync handling.

The Windows-compatible SQLite reader was exercised against the rebuilt data in
Linux. Native Windows first-run behavior remains unverified here; its CI job
includes the new source-archive, setup and importer tests. This route restores
the portal from original sources; sandbox-only audit evidence remains in the
separate private backup. The cloud attachment delivery issue remains unresolved.

## Browser edition for continued development

The migrated portal now has a single code-only `Open-Market-Structure.html`
build. End users open it in Edge or Chrome and select their private originals;
Node, an installer, a local server, WSL and Docker are unnecessary for this
edition. Development remains in the repository. Rebuilding and distributing
the HTML delivers code changes while original data files remain separate.

The shared parser statically separates source without evaluating it; all source
modules must match reviewed code. Bounded archive parsing verifies CRCs and
available manifest hashes. SQLite WebAssembly uses the same record-validation
core as Node, with bounded inflation and verified zlib checksums. Input WALs
are rejected. HTML/database components and calculation records must match.
The generated application's CSP allows exact reviewed scripts and bundled WASM,
with external connections and assets disabled. Third-party license notices are
included. The privacy gate requires byte-for-byte equality to a fresh code-only
build; arbitrary large HTML does not receive an exception.

Current verification:

- Clean locked dependency installation and deterministic artifact check passed.
- **142 Node checks and 34 Python checks**, plus repository privacy checks,
  passed. Corrupt archives, unknown scripts, altered hashes, invalid dates,
  missing units and duplicate records are covered with synthetic inputs.
- The original server application's eight synthetic browser scenarios passed;
  all 16 private scenarios passed on a freshly started current-code server.
- The final standalone artifact passed **21 actual-source browser scenarios**:
  company pages, history, independent YoY/T3M and fee calculations, research,
  consensus, prediction/context views, quality, CSV, print, decoded PNG export,
  mobile layout, rejected unreviewed input and cleared session state.
- Original HTML ZIP plus all four database wrappers passed six browser checks,
  including loading, PNG export, reset and source preservation.
- Nine synthetic PNG export checks passed, including actual pixel colors,
  gradients, white background, download behavior and absence of network assets.
- Actual source inputs remained byte-identical; no non-document HTTP or
  WebSocket connection, browser error, or persistent browser storage was observed.

The cloud Chromium policy blocks `file://` before application execution. Tests
therefore served the identical self-contained artifact through loopback, with
only the initial/reload HTML document allowed and no backend or asset requests.
Direct local opening on managed Windows is not yet verified. Browser policy
must be respected; no policy workaround is included. Tested source compatibility
applies to the retained original pair, not unseen HTML export versions.

Data is session-only. Reopening requires selecting private files again; backups
remain the user's preserved originals and external recovery archives. PNG/CSV
exports may contain private values and must be saved outside Git. Full-page
printing uses the browser's Print / Save PDF facility. No live refresh,
persistent edits, public hosting, or repair of cloud attachment delivery is
claimed. Private testing evidence stays outside the repository.

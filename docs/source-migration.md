# Source migration and private-data boundary

The supplied HTML and database archive have been inspected and migrated into a
working private application. The original company workbenches cover CME, CBOE,
ICE, HOOD, NDAQ, TW, and prediction markets, including research, consensus and
scenario controls, advanced chart tools, and historical views. Original uploads,
reports, extracted source files, private inventories, and reconciliation evidence
remain outside Git and have not been overwritten.

The migration retains the complete typed observation history and structured
source components in external SQLite. It preserves mixed frequencies, source
roles, and original period/date precision instead of flattening them into the
optional monthly demonstration contract. Source component hashes and every
typed observation's pointer/value were reconciled before activation. Detailed
counts, source names, dates, fingerprints, and reconciliation outputs remain in
private evidence, not this repository.

## Separation of code and private content

| Location | Contents |
| --- | --- |
| Repository | Reviewed application logic, 23 generated presentation modules, documentation, synthetic fixtures/tests |
| Private presentation pack | `ui-content.json` literal pools, `shell.html`, `styles.css`, and source mapping |
| Private source archive | Untouched HTML/ZIP, extracted database, reports, datasets, research, and private audit evidence |
| Private runtime | `legacy.json`, immutable release copies of SQLite and presentation files, prior releases |
| Secret manager | Hosting and future source credentials |

Static parsing moved data-bearing string, numeric, regular-expression, and
template literals out of generated code. Embedded JSON, page text, styles, and
proprietary research are served only from private storage. Remaining executable
logic is reviewed application code. The generated-code checker verifies literal
separation; manual review also checks identifiers, control flow, and accidental
proprietary content. Neither mechanism is a general sandbox for arbitrary HTML.

The server verifies that private presentation metadata matches exact reviewed
module fingerprints and shell/style fingerprints. It rejects unsupported active
content and external resource loading. Browser execution uses same-origin
reviewed modules, not scripts read directly from uploaded HTML. Private pages
can display the preserved research; raw source files and arbitrary filesystem
paths are not served.

## Reproduce or update the private import

Use Node 24 on Linux and install pinned parser dependencies with
`npm ci --ignore-scripts --no-audit --no-fund`. Keep all inputs and staging
outputs outside every Git checkout.

1. Preserve byte-for-byte source originals and private backups. Run the
   non-executing inventory tool for new HTML/ZIP inputs:

   ```sh
   python3 scripts/inspect-sources.py \
     --html /absolute/private/sources/original-portal.html \
     --archive /absolute/private/sources/original-database.zip \
     --output /absolute/private/new-source-inventory
   ```

   Its output parent must exist. It writes a private `0600` inventory in a
   `0700` directory, refuses overwrite, rejects symlink/Git paths, and never
   executes HTML or extracts ZIP members. Metadata flags traversal, absolute
   paths, symlinks, duplicates, encryption, and excessive size/expansion claims.
   Inspect flagged entries before separate bounded extraction into private
   storage. ZIP metadata alone does not establish content integrity.
2. Statically separate a changed portal into new external staging directories:

   ```sh
   npm run data:port-ui -- \
     --source /absolute/private/sources/original-portal.html \
     --private-output /absolute/private/new-presentation \
     --code-output /absolute/private/new-code-review
   ```

   The parser never evaluates source JavaScript. Unsupported dynamic/network
   capabilities and active HTML require separate review. Generated code is
   staged outside Git; it is not installed automatically. Review the source
   mapping, generated module diff, private literal pools, shell, and styles.
   Only reviewed code without proprietary content may replace repository
   `public/legacy/module-*.js`. Retain private mappings and fingerprints outside
   Git. Run synthetic checks after changes; do not bypass hash validation or
   copy an entire generated private pack into the repository.
3. Use the standalone SQLite snapshot from the reviewed archive. The importer
   rejects an active journal/WAL and does not checkpoint or modify the source.
   Keep source inputs separate from the runtime release directory:

   ```sh
   npm run data:import-legacy -- \
     --database /absolute/private/sources/database.sqlite \
     --presentation /absolute/private/new-presentation \
     --data-dir /absolute/private/runtime

   MARKET_STRUCTURE_DATA_DIR=/absolute/private/runtime npm start
   ```

   An existing reviewed presentation pack can be imported directly without
   rerunning the porting step. Imports validate first, copy a new release,
   verify source stability and presentation/code integrity, and atomically
   replace the manifest. Original inputs and previous releases are retained.
   Do not edit active release files in place; import a new release.
4. Run `npm run check`, `npm run test:browser`, and the private runtime check:

   ```sh
   npm run test:legacy-browser -- \
     --url http://127.0.0.1:3000 \
     --report /absolute/private/new-browser-review
   ```

   The generic launch above uses port 3000; the prepared cloud preview uses
   port 3001. The report option is optional. Screenshots, downloads, and
   detailed failures can contain private content and must remain outside Git.
   Review history, calculations, research, charts, exports, and source-quality
   warnings before using an updated source snapshot.

## Validation and interpretation

On Linux the database opens read-only through a pinned file descriptor. Native
Windows uses a hash-verified private temporary copy and read-only Node SQLite;
that copy is removed on normal close. Extension loading is disabled. Checks cover SQLite integrity and foreign keys,
bounded payload decompression, component hashes, pointer/value agreement,
duplicate metric/period/frequency records, finite values, dates, and units.
Source roles may overlap and are not additive.

Missing-date provisional records are retained but quarantined from dated
freshness coverage. Unspecified units remain explicit rather than guessed.
Month-precision observation dates retain that precision. The data-quality panel
shows per-series dates and stale/missing status; an entity's newest observation
does not prove all of its series are current or complete.

Reviewed analytics align calendar periods, require usable complete windows, and
exclude partial, forecast, blocked, and incomparable observations from derived
comparisons. Zero/negative prior baselines make relative growth unavailable;
percentage-point metrics keep their separate convention. No missing observation
is replaced with zero, and source definitions are not combined merely because
their labels look similar. Safe CSV export also neutralizes formula-like text.

The [monthly JSON contract](data-contract.md) remains available for a separate
normalized dataset using `data:validate` and `data:import`. It does not replace
the full mixed-frequency SQLite archive or original research files.

The private presentation pack includes snapshot-specific captions, static values,
and research context as well as harmless labels/constants. A future refresh
must reconcile a coherent database and presentation pack, or refactor those
remaining content bindings. Updating only SQLite could leave dated prose next
to newer observations. The current release preserves the matched source pair.

See [review results](review.md) for tested behavior and [private hosting](private-hosting.md)
for remaining deployment work. Refresh remains `not-connected`; importing or
reloading a snapshot does not establish a live source connection.

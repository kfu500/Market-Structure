# Private hosting and scheduled refreshes

The migrated portal is a read-only private snapshot application. It binds only
to `127.0.0.1`; the Node server supplies neither authentication nor TLS. No
public deployment or verified refresh connection is configured.

## Local or tunneled access

Use Node 24 on Linux: the SQLite runtime requires `/proc`. After importing a
reviewed release as described in [source migration](source-migration.md):

```sh
npm ci --ignore-scripts --no-audit --no-fund
MARKET_STRUCTURE_DATA_DIR=/absolute/private/runtime npm start
```

Open `http://127.0.0.1:3000` on that machine. The directory must be outside every
Git checkout and contain a validated `legacy.json` and its release files.
The prepared cloud preview instead uses `PORT=3001` and the external directory
shown in the [README](../README.md). Without private configuration, the server
shows the synthetic monthly demo. An external `dataset.json` can separately
activate normalized monthly mode. `.env.example` documents process settings;
`.env` files are not loaded automatically.

For an already authorized private host, a local SSH tunnel is an option:

```sh
ssh -N -L 3000:127.0.0.1:3000 private-user@private-host
```

Then open the same loopback URL locally. Adjust both ports if the remote service
uses another port. This does not provision a host. Never open the runtime port
directly or create a publicly accessible cloud preview.

## Shared private hosting

1. Choose a Linux private VM/container host and private DNS/VPN. Block direct
   ingress to the runtime port. Exclude private files from Git, container
   images, static hosting, CI artifacts, and public preview systems.
2. Put authentication in front of **every route**, including legacy bootstrap,
   snapshot, presentation, observations, styles, and modules. Use SSO with an
   explicit user/group allowlist and session expiry, plus a private network/VPN
   where appropriate. The private bootstrap includes research and presentation
   content, so exposing an API route would expose private material.
3. Terminate TLS at an authenticated reverse proxy with a trusted certificate.
   Disable caching; avoid response-body logging and keep request logs private
   with defined retention. Verify unauthorized denial and authorized access
   from another device before allowing shared use.
4. Preserve the server's loopback protections. It accepts only loopback `Host`
   values, checks any `Origin` against that host, and rejects
   `Sec-Fetch-Site: cross-site`. Authenticate and validate the original browser
   host/origin at the proxy **before** rewriting `Host` to the loopback upstream.
   If needed, rewrite/remove `Origin` only after validation. Test the exact
   browser/proxy behavior; do not strip security headers blindly. Reviewed
   legacy widgets need inline styles, but executable inline scripts and
   external network loading remain blocked by the application policy.
5. Run under a dedicated unprivileged account with read access to the active
   runtime. Give a separate import/refresh account the necessary write/source
   access and serialize writers. Keep source credentials out of the portal
   process. Use encrypted persistent storage outside the code checkout.
6. Back up originals, reports, extracted source data, presentation packs, source
   mappings, reconciliation evidence, manifests, and previous releases. Define
   retention and test recovery. Treat active release files as immutable; import
   a new release instead of editing the SQLite database or pack in place.
7. Test restart, reload, authentication expiry, recovery from rejected imports,
   disk capacity, and access revocation. Existing local browser checks do not
   certify a remote proxy, production authentication, or backup restoration.

The portal displays preserved private research and supports private exports.
Its server does not expose unrestricted source files or document paths. Apply
the same access and retention rules to downloaded CSV/JSON, screenshots, and QA
evidence. Additional raw-report delivery requires an authenticated private
document store and appropriate distribution rights.

## Scheduled refresh remains to be implemented

There is no provider adapter or scheduled job. Import and browser reload use
stored snapshots, and the interface correctly reports `not-connected`.

- Select supported, licensed source APIs or private feeds for each metric.
  Confirm definitions, units, publication times, revision policy, coverage,
  quotas, and permitted internal distribution.
- Use the host's secret manager for credentials. Check existing bindings before
  adding secrets; never put values in Git, URLs, screenshots, logs, or chat.
- Write source adapters that preserve original responses privately and produce
  a candidate standalone SQLite snapshot or, for independent monthly mode,
  normalized JSON. Retain retrieval timestamps separately from source
  observation dates. A successful scheduled run must not advance stale dates.
- Reconcile the presentation pack with the database. The pack retains
  snapshot-specific captions, static values, and research context alongside
  labels/constants. A database-only update can leave those items dated. Either
  update the pair coherently or refactor those remaining content bindings before
  claiming the whole portal has refreshed.
- Validate integrity, pointers, units, dates, duplicates, missing observations,
  and source-specific reconciliation/plausible-change rules. Define revision
  handling explicitly. Reject bad candidates and keep the last good release.
- Activate full releases with `data:import-legacy` and a matching reviewed
  presentation pack; use `data:import` only for normalized monthly snapshots.
  Serialize writers, preserve backups, and monitor disk use. Atomic activation
  protects readers from partial imports but does not schedule or lock jobs.
- Choose cadence and timezone from actual provider publication schedules.
  Add timeouts, bounded retries, alerts, holiday/release expectations, and
  source-specific stale thresholds. Keep private values out of notifications.
- Verify a complete licensed-source retrieval, validation, activation, and
  failure-recovery cycle before updating refresh status. Record last successful
  retrieval and accepted release separately. Continue showing actual source
  dates and frequency; a scheduled snapshot is not automatically live data.

Host provisioning, authentication, TLS, persistent storage, operational restore
tests, licensed adapters, and scheduling are the remaining deployment steps.
They do not require publishing the portal publicly.

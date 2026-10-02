# Open the portal without installing software

The browser edition opens directly in Microsoft Edge or Google Chrome. It does
not require Node.js, Python, an installer, a local server, or a hosting account.
Keep the application file and your original private files on your computer.
Company policy can still restrict local HTML files; this edition does not change
or bypass those policies.

## First use

1. Download the `feat/portal-migration` branch from GitHub using **Code → Download
   ZIP**, and use **Extract All** in Windows File Explorer.
2. Open **Open-Market-Structure.html** from the extracted folder in Edge or Chrome.
   The application is a single file; you can keep a copy in a convenient folder.
3. Use the portal HTML picker to select your original
   `Market_Structure_Portal…html` file, or its HTML ZIP.
4. Select the complete database ZIP or SQLite database. If you have the four
   original database ZIP parts instead, use the multiple-parts picker and select
   all four together. Do not select both database routes.
5. Click **Open portal** and wait for local validation to finish.

The browser reads the files you select. It does not upload them. Original files
are not modified, and the application does not write into your GitHub checkout.
Choose a private folder for downloaded CSV files, screenshots, or printed PDFs;
they can contain the same proprietary content as your source files.

**Save chart PNG** downloads the first visible chart in the current view as an
image. Navigate to the company and chart you want before clicking it. **Print /
Save PDF** opens the browser's print workflow; select a PDF destination there to
save a copy of the page. These exports remain private files on your computer.

## Continue iterating

The code on GitHub is separate from your private HTML, database, and research.
After a code update, download the updated application, open its new
**Open-Market-Structure.html**, and select the same private original files again.
There is no need to upload those private files to GitHub or install Node to use
the browser edition.

Source scripts are parsed as data. Only the reviewed application code bundled
with the browser edition executes. Its code fingerprints must match the
selected source, so an unreviewed or differently structured HTML export may be
rejected. Keep the rejected source unchanged and report the visible error; do
not remove fingerprint checks. A source-format update needs a corresponding
reviewed application update.

## Storage and refresh limits

- Data is held in the browser session. Closing or reloading the tab requires
  selecting the private files again. The selected database is not a writable,
  persistent application database.
- Keep the original HTML and complete database ZIP (or all original parts) in
  your normal company-approved backup. A downloaded application file alone
  cannot recover your private history or research.
- The portal shows a historical snapshot. No refresh connection is verified,
  and reopening the same files does not retrieve new market data.
- Observation dates, stale or missing data, units, and calculation restrictions
  remain visible. Year-over-year and trailing-three-month comparisons require
  compatible complete observations.
- Persistent editing, scheduled data refresh, access from several computers,
  and shared use require a separate approved storage or private hosting setup.

## Development and verification

Development tools are needed only when changing or rebuilding the code, not
when opening the generated browser edition. The generated HTML must contain
application code only. Do not inline private source content into it.

After installing the pinned development dependencies, run
`npm run build:browser` to rebuild **Open-Market-Structure.html**. The build
bundles the reviewed application modules, parsers, SQLite engine, and license
notices. End users open the resulting file without running a build command.

`tests/browser_file_smoke.py` opens the actual generated file through `file://`.
It accepts explicit private source paths at runtime, reuses the company-page,
chart, research, independent calculation, and CSV checks from
`tests/legacy_browser.py`, and checks that no HTTP or WebSocket connection is
attempted. Optional evidence is allowed only outside every Git checkout.

Example for a developer with Playwright and Chromium installed:

```sh
python3 tests/browser_file_smoke.py \
  --app /absolute/path/to/Open-Market-Structure.html \
  --portal /private/path/to/original-portal.html \
  --database /private/path/to/complete-database.zip \
  --report /private/path/to/browser-edition-review
```

The test also verifies that selected source files remain byte-identical. Test
results should identify the actual browser and operating system used; Chromium
on Linux does not establish that a managed Windows computer will permit the
file to run.

If an automated test browser forbids all `file://` pages by policy, record that
block rather than disabling its policy. The harness also accepts
`--url http://127.0.0.1:PORT/Open-Market-Structure.html` for a development-only
test that serves the exact same generated file. It verifies the served bytes
against the local artifact and permits only document navigation to that one
URL; all asset requests, APIs, and WebSocket connections remain forbidden.
Passing that fallback verifies local file loading and portal behavior in the
browser, but does not establish a successful direct-file launch on Windows.

The completed integration review used Chromium on Linux. Direct-file navigation
was blocked by that test environment's administrator policy before any portal
code ran. The same generated artifact passed all 21 full integration checks over
document-only loopback transport, using the retained original HTML and complete
database ZIP. A second run passed six focused checks using the original HTML ZIP
and all four numbered database ZIP wrappers. Both runs verified local loading,
nonblank downloaded chart PNGs, reset behavior, no persistent browser storage,
unchanged source-file hashes, and no network requests beyond explicit HTML
document navigation. The full run also covered all company pages, charts,
independent calculations, CSV content, research, source quality, responsive
layout, and the print workflow. Native Windows execution remains unverified.

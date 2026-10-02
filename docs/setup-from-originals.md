# Windows setup using your original files

Use this route if you have the original portal HTML and matching database ZIP
but cannot download a prepared recovery package. GitHub supplies application
code only. Your original files stay on your computer.

1. Install **Node.js 24 for Windows** from <https://nodejs.org/>. Its standard
   installer includes npm. Ask your IT team if installation is restricted.
2. Open the repository's **feat/portal-migration** branch in GitHub. Select
   **Code → Download ZIP**, then **Extract All** into a private local folder.
   Use the ZIP download so that the reviewed code's line endings remain intact.
3. Keep the original HTML and database ZIP **outside the extracted application
   folder**. For example, keep them in your own `Portal Originals` folder.
   Allow at least **3 GB** of free disk space during setup.
4. In the extracted application, double-click **Setup-From-Originals.cmd**.
   It installs two pinned parser packages from the npm registry, with package
   scripts disabled. It then asks for two local paths:
   - The original `.html` file, or the original portal HTML ZIP.
   - The complete database ZIP. If you have split uploads instead, supply the
     folder containing all four `Market_Structure_Database_Part_N_of_4.zip`
     files, retaining their original names.
5. In File Explorer, right-click each original file and select **Copy as path**,
   paste it into the corresponding prompt, and press Enter. Surrounding quotes
   are accepted. For split uploads, copy the folder's path instead.
6. Wait while setup verifies the files and historical records. The portal opens
   in your normal browser after its private-data health check passes. Keep the
   terminal window open; use **Ctrl+C** to stop.

Setup creates a new **private** folder alongside the application folder. To open
the portal again, double-click **Start-Market-Structure.cmd** in the application.
Run setup only once for a given destination. It refuses to overwrite an existing
private folder, including one from an earlier successful setup.

```text
Your local folder/
  Market-Structure-feat-portal-migration/  (downloaded code)
    Setup-From-Originals.cmd
    Start-Market-Structure.cmd
  private/                               (created on your computer)
    sources/
    presentation/
    runtime/
    setup-manifest.json
```

Use the most recent **matching pair** of source files from the migration.
An older HTML file with different application code or a mismatched database
will be rejected. Do not change hashes or weaken validation to make it load.
The HTML is parsed statically; its scripts and any uploaded restore script are
never executed. Generated executable modules must match the reviewed application
exactly. Every source component and stored calculation record is reconciled with
the database before activation. Empty metric containers without calculation
records do not create database rows; the original HTML retains them unchanged.

Original input files are unchanged. The new private folder preserves the complete
HTML and database ZIP, the working database, presentation, source mapping and
local verification manifest. It restores the source data and embedded research;
it does not retrieve sandbox-only audit screenshots or the separate recovery
archive. Keep your originals and the new private folder backed up in protected
storage. Nothing in this setup uploads data, configures a public site, or creates
a live market-data connection.

## Requirements and troubleshooting

- **No Python, WSL, Docker or Git installation is needed.** The initial setup
  needs Node 24, npm and access to `registry.npmjs.org`. Later viewing is offline
  and needs only Node 24 and a browser.
- **Download/extract code first:** running a launcher inside a ZIP viewer will
  not provide the rest of the application files.
- **Existing private folder:** open the existing installation with the normal
  launcher. To create a separate installation, extract code into a different
  parent directory or choose a new external destination with the CLI below.
- **Path rejected:** keep all proprietary files outside the application and
  outside every Git checkout. Use your own local Windows folder, not a public
  sharing folder.
- **npm blocked:** ask IT to permit the two locked parser packages or provision
  them from the lockfile. Do not disable package-integrity checks.
- **Code/data mismatch:** select the matching original uploads. No unsupported
  source version is executed, and an error never substitutes synthetic data.
- **First Windows run:** this route is exercised in the Linux preparation
  environment. Native Windows execution, local access permissions and managed
  device policy still need confirmation on your computer.

For a custom destination, run these commands in the extracted application:

```text
npm ci --ignore-scripts --no-audit --no-fund
node scripts/setup-from-originals.js --html "C:\Portal Originals\portal.html" --database "C:\Portal Originals\database.zip" --output "C:\Portal Storage\private" --launch
```

The output's parent folder must already exist, and the output itself must be new.
For that custom location, reopen with:

```text
node scripts/launch-local.js --data-dir "C:\Portal Storage\private\runtime"
```

On Windows, setup flushes file contents and atomically activates the validated
manifest. Windows does not provide this Node workflow's POSIX directory flush;
there is no equivalent directory durability guarantee. The existing viewer
uses a verified private temporary SQLite copy. See [local-computer guidance](local-computer.md)
for access permissions and cleanup behavior.

# Open the private portal on your Windows computer

If you cannot download the prepared private package but retain the original
HTML and database ZIP, use [setup from originals](setup-from-originals.md).
That route downloads code from GitHub and rebuilds private storage on your PC.

The local package runs on your computer and opens your normal browser. It does
not publish a site, expose a network port, or require a hosting account. You need
**Node.js 24**; running the prepared package does not need npm installation,
Python, Docker, WSL, or administrator access to the application. Installing Node
may require your organization's IT approval.

## Open it

1. Install the Windows build of **Node.js 24** from `https://nodejs.org/` if it
   is not already installed. Reopen any terminal after installation.
2. Fully extract the complete private package into a local folder you control.
   Keep its two folders side by side:

   ```text
   Market-Structure/
     application/
       Start-Market-Structure.cmd
       scripts/
       src/
       public/
     private/
       runtime/
         legacy.json
         releases/
       ...preserved private sources and supporting files...
   ```

   Do not run inside the ZIP or put `private` inside `application`. Keep both
   folders outside Git checkouts. Use a local Windows folder, not a public
   sharing folder or a shared network drive.
3. Double-click **`application\Start-Market-Structure.cmd`**. If the package
   includes `Start-Portal.cmd` in the download folder, that wrapper opens the
   default restored `Market-Structure` folder. The launcher verifies the private snapshot, chooses an available local port,
   and opens the browser after its own health check reports private mode.
4. Keep the terminal window open while using the portal. Press **Ctrl+C** in
   that window to stop. To reopen it later, double-click the launcher again.

The browser address is printed in the terminal, for example
`http://127.0.0.1:54321/`. Its port is chosen automatically and may change each
time. If the browser does not open automatically, copy that printed address.
Do not share it as a remote link: `127.0.0.1` refers to your own computer.

## What stays private

The server binds only to your computer's loopback interface. No Windows firewall
inbound exception is required. Leave external-network access disabled if Windows
or security software asks about permitting it. Other people with access to your
Windows account or local files could still read them; use your own Windows
account, NTFS permissions, and an encrypted disk such as BitLocker where
available. Unix file-permission numbers in development scripts are not Windows
access controls.

On Windows, the reader creates a verified read-only SQLite copy in your user's
temporary directory and removes it on a normal shutdown. An abrupt crash can
leave that temporary copy behind, so the temporary directory needs the same
account and disk protections as the package. The original database is untouched.

The package contains real private data, research, and original files. Keep it out
of GitHub, public cloud shares, email attachments, and shared screenshots.
Browser exports and screenshots are private too. Back up the complete package
to a separate encrypted private destination under your control.

The portal displays a historical snapshot and warns about stale or missing
data. Reload does not retrieve current market data. Keep application code and
private content from the same package together: fingerprint checks reject
mismatched or altered files. Missing private files produce an error rather than
loading synthetic figures.

## Troubleshooting

- **Node is missing or the wrong version:** run `node --version` in a new
  terminal. It must start with `v24.`. The launcher does not install software
  automatically. Ask IT to provide Node 24 if your device is managed.
- **Private runtime missing:** extract the complete package and confirm the
  sibling `private\runtime\legacy.json` file exists. Do not move that manifest
  separately from its `releases` directory.
- **Validation fails:** restore the matching application and private folders
  from the same verified package. Do not edit fingerprints, SQLite files, or
  private presentation files to bypass the checks.
- **Browser did not open:** copy the loopback address printed after “ready.”
  Use the terminal message to distinguish startup failure from an opener issue.
- **Port already in use:** the launcher asks Windows for an available port;
  it does not reuse an existing application's port or open its browser page.
- **Stopping:** Ctrl+C closes the owned HTTP server. Closing the browser alone
  does not stop the terminal process. No background service is installed.

For a private runtime in a different local folder, open a terminal in the
application folder and use an absolute path:

```text
node scripts\launch-local.js --data-dir "C:\YourPrivateFolder\runtime"
```

Add `--no-browser` to print the address without opening a browser automatically.
No application code or private file is changed by the launcher. Data importing,
source porting, and backup tooling are separate maintenance workflows; the
prepared viewer does not require running those tools on Windows.

## Verification boundary

Launcher behavior is checked with synthetic private snapshots on the available
Linux execution environment. Native Windows execution, Windows browser opening,
NTFS permissions, and endpoint-security behavior cannot be verified in that
environment. The first run on the user's Windows computer remains necessary to
confirm those platform-specific details; no native Windows test is claimed.

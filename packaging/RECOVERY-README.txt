MARKET STRUCTURE - PRIVATE LOCAL RECOVERY

These files contain private research and data. Keep every download in a folder
under your own account, outside Git and public/shared storage.

WINDOWS REQUIREMENT
Node.js 24 for Windows, available from https://nodejs.org/ . Ask your IT team
to provide it if software installation or command scripts are restricted.
The prepared viewer needs no npm install, Python, WSL, Docker, or web hosting.
Allow at least 3 GB of free disk space for the downloads, reconstruction and
the temporary database copy, and use a current Edge, Chrome or Firefox browser.

RECOVER
1. Download the starter ZIP and EVERY recovery.part-NNN file.
2. Extract the starter ZIP into the same folder as the part files. The folder
   must contain Restore-Market-Structure.cmd, reconstruct-recovery.mjs,
   recovery-parts.json, this readme, and all the recovery.part-NNN files.
   Do not rename the part files or run scripts from inside a ZIP viewer.
3. Double-click Restore-Market-Structure.cmd. It verifies each part, the joined
   archive, every restored file, and the database rebuilt from the original
   source archive. The input downloads are not changed. An existing output
   folder is never overwritten.
4. When recovery succeeds, double-click Start-Portal.cmd in the download
   folder. The browser opens after private-data checks. You can also open
   Market-Structure/application/Start-Market-Structure.cmd directly.
5. Keep the terminal window open while using the portal. Press Ctrl+C there
   to stop. The printed address is local to your computer and changes ports.

If .cmd files are blocked but Node is permitted, use a terminal in the download
folder: node reconstruct-recovery.mjs --input . --output ./Market-Structure
Then: node Market-Structure/application/scripts/launch-local.js

WHAT IS PRESERVED
The byte-identical original HTML and complete source database ZIP, the active
private runtime and its matching presentation, source mapping, validation and
research provenance, current layout evidence, and the application code. The
original database archive retains its original source files and complete SQLite
history, including embedded research/raw files/revisions. The working database
is rebuilt from that ZIP with its original SHA-256 verified.

WHAT WAS OMITTED FROM THIS PORTABLE PACKAGE
Inactive duplicate runtime releases, rebuildable parsed HTML/JSON/script caches,
older code/presentation staging iterations, duplicate screenshots, development
dependency caches, and redundant multipart transport wrappers. The complete
original reconstructed ZIP/HTML remain byte-identical; original workspace files
and the earlier complete recovery archive were not deleted.

Whole-file deduplication stores each repeated file once. Restoring reconstructs
ordinary independent files, so no hard-link or symlink support is required.

PRIVACY AND VERIFICATION
Use your own Windows account and private NTFS permissions; encrypted storage
such as BitLocker is recommended. Unix 0600/0700 modes are not Windows ACLs.
The Windows reader creates a temporary SQLite copy under your user's temp
directory and removes it on normal shutdown. An abrupt crash may leave that
copy behind. No public server or inbound firewall exception is required.

Native Windows has not been run in the Linux preparation environment. The
portable reader and automatic recovery are tested here, and Windows CI is
configured; check its results or perform the first run on your own computer.
The developer import/port/backup tools are separate from the prepared viewer
and may still require Linux/Python. Historical data is not a live feed.

Keep the verified downloads on a separate protected durable backup destination.
A sandbox copy alone is not an off-machine durable backup.

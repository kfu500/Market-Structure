# Private hosting handoff

This package is ready for a **user-owned Linux host with persistent storage**.
It has not been deployed. No connected ChatGPT Sites, private-preview, hosting,
or remote-storage capability was available to verify in this session, and the
workspace has no demonstrated durable external storage. This does not establish
that those services are globally unavailable. A local workspace copy is not an
off-machine backup or an openable remote website.

The minimal deployment keeps the application on loopback and gives only the
user's SSH public key access to a restricted tunnel. It needs no public web
port, domain, OAuth client, or change to the app's Host/Origin checks. The user
opens a local browser URL while the tunnel is connected. A clickable private
HTTPS address would require a separately configured identity-aware proxy/VPN;
none is assumed or enabled here.

ChatGPT Sites or another private preview must support a persistent Node 24
process with read-only SQLite, an external private persistent mount,
and authentication covering every page, asset, and data API. A static HTML
hosting feature alone cannot run this application. The connected capability's
runtime, identity restrictions, storage persistence, and compatible Host/Origin
proxy behavior must be verified before transferring private content or claiming
that a Sites preview is available.

## Required handoff information

| Requirement | Exact decision/input needed |
| --- | --- |
| Host | Authorized Linux machine, admin connection, Node 24, active systemd, and `/proc` |
| User identity | The user's SSH public key supplied through the authorized host/file workflow; never a private key in chat |
| Storage | Encrypted persistent volume mounted at `/srv/market-structure/private`, with sufficient capacity for sources, releases, and retention |
| Backup | Separate durable encrypted destination, credentials provided securely, retention, and a successful restore test |
| Network | SSH ingress allowed only through the chosen private network or approved source addresses; no web ingress |

No deployment can establish single-user access without that actual identity, or
durable preservation without a real persistent destination and verified backup.

## Files and settings prepared

- [`deploy/market-structure.service`](../deploy/market-structure.service): runs
  as dedicated account `market-structure`, with code at
  `/srv/market-structure/app`, private runtime at
  `/srv/market-structure/private/runtime`, and port `127.0.0.1:3000`.
  Systemd makes the process filesystem read-only and applies an unprivileged
  service sandbox. Import/backup operations use a separate administrator or
  controlled writer, outside this service.
- [`deploy/sshd-market-structure.conf.example`](../deploy/sshd-market-structure.conf.example):
  restricts `market-structure-forward` to public-key authentication and local
  forwarding only to `127.0.0.1:3000`. It disables shell/TTY, remote forwards,
  agent/X11 forwarding, Unix-socket forwarding, and user startup commands.
  It does not change other accounts' SSH access.

The application account and tunnel account are different. The tunnel account
does not need filesystem access to private data. Authorized administrators of
the host remain administrative principals; this is single-user portal access,
not isolation from the host's administrator.

Local preparation checks passed: OpenSSH parsed the example and its effective
Match settings matched the restrictions above. Systemd accepted the unit when
its executable was set to the available Node 24 path. The unit's intended
`/usr/bin/node` does not exist in this workspace, and systemd is not running
here; service startup and end-to-end tunnel access still require the target
host. No SSH or system service configuration was changed during these checks.

## Apply on the authorized host

These are host-administrator steps, not commands already applied to this cloud
workspace. Keep an existing administrator session open during SSH changes.

1. Mount the encrypted persistent volume at
   `/srv/market-structure/private` and configure its boot-time mount using the
   host's supported encryption/key management. Confirm with `findmnt -T` and
   a reboot test. `RequiresMountsFor` orders declared mounts and
   `AssertPathIsMountPoint` refuses startup if the private root is only a
   directory on the host root filesystem. Neither creates a volume nor proves
   encryption, persistence across host replacement, or backup recovery.
2. Install Node 24 at `/usr/bin/node`, or use the verified absolute Node 24 path
   in a systemd override. Place the reviewed code at
   `/srv/market-structure/app`; keep it administrator-owned. Run:

   ```sh
   cd /srv/market-structure/app
   npm ci --ignore-scripts --no-audit --no-fund
   npm run check
   ```

3. Create a non-login `market-structure` service account and a separate
   `market-structure-forward` account using the host's account policy. The
   latter needs a valid account for SSH key authentication; do not enable
   password access. Use `/usr/sbin/nologin` for the service account. The tunnel
   account can have `/bin/sh` as its account shell because its forced command
   prevents shell sessions. Confirm the path to `nologin` exists.
4. Transfer the preserved private source tree over the authorized encrypted
   connection. Verify original hashes at the destination. Keep originals,
   source mappings, reports, and backups outside the application checkout.
   If restoring the complete backup described below, its runtime releases can
   be used directly with the exact matching application code; a fresh import is
   optional. Otherwise import a reviewed database/presentation pair:

   ```sh
   cd /srv/market-structure/app
   npm run data:import-legacy -- \
     --database /srv/market-structure/private/sources/database.sqlite \
     --presentation /srv/market-structure/private/presentation \
     --data-dir /srv/market-structure/private/runtime
   ```

   Give `market-structure` ownership/read access to runtime copies only, with
   private directories `0700` and files `0600`; grant it traversal of the
   private parent directory without granting access to originals. Future
   imports must preserve this ownership. Do not run imports as the read-only
   systemd service or change original source ownership unnecessarily.
5. Install the service and validate it before starting:

   ```sh
   sudo install -m 0644 deploy/market-structure.service /etc/systemd/system/market-structure.service
   sudo systemd-analyze verify /etc/systemd/system/market-structure.service
   sudo systemctl daemon-reload
   sudo systemctl enable --now market-structure.service
   curl --fail http://127.0.0.1:3000/api/health
   ```

   The health response must report private legacy mode and refresh
   `not-connected`. Check `ss -ltn` to confirm the application listens only on
   `127.0.0.1:3000`. If Node is elsewhere, set a unit override with a blank
   `ExecStart=` followed by the actual absolute executable and app path;
   validate the unit again.
6. Create root-owned `/etc/ssh/market-structure/authorized_keys`, readable by
   sshd and not writable by the tunnel account. Include **only** the user's
   approved public key, prefixed with these restrictions:

   ```text
   restrict,port-forwarding,permitopen="127.0.0.1:3000" ssh-ed25519 REPLACE_WITH_PUBLIC_KEY user-device
   ```

   Replace the complete key/type/comment with the supplied public key. The
   placeholder is not a usable key. Configure a root-owned directory and file
   with appropriate public-key permissions, such as `0755` and `0644`; this
   file contains public keys, never private keys.
7. Add the SSH example through the host's existing include mechanism. Preserve
   existing administrators and global SSH policy. Verify effective settings:

   ```sh
   sudo sshd -t
   sudo sshd -T -C user=market-structure-forward,host=localhost,addr=127.0.0.1
   ```

   Confirm the Match settings above actually apply; earlier conflicting rules
   can take precedence. Reload SSH through the host's service manager only
   after validation. Keep the existing admin connection until a second
   connection proves that both administration and the restricted tunnel work.

## Open and verify

On the user's own computer, use the authorized private host address:

```sh
ssh -N -T -o ExitOnForwardFailure=yes \
  -L 127.0.0.1:3000:127.0.0.1:3000 \
  market-structure-forward@PRIVATE_HOST
```

Open **`http://127.0.0.1:3000`** in that computer's browser. The HTTP leg is
loopback; SSH encrypts transport to the host. If local port 3000 is occupied,
use local port 3002 in the `-L` option and browser address. `ssh -N` requests no
shell, so the forced `nologin` command does not prevent its permitted tunnel.
Use a host whose fingerprint has been verified through the authorized channel;
do not disable SSH host-key verification.

Verify that the user's key succeeds, an unapproved key fails, shell requests
are denied, forwarding to any other host/port fails, and the app is unreachable
on the host's network port 3000. Run private browser QA through the tunnel and
save any evidence outside Git:

```sh
npm run test:legacy-browser -- --url http://127.0.0.1:3000
```

Finally reboot the host and verify storage, service restart, and tunnel access.
Restore a backup into a separate private directory and verify original hashes,
database/presentation validation, and browser startup there before treating the
backup as recoverable. Record that evidence privately.

## Create and verify a private backup

The following are commands for the authorized source/target machines; they were
not applied to a hosting destination by this handoff. The backup contains
private material. Place it outside every Git checkout on a separate durable
encrypted destination; a local `.tar.gz` file alone is neither encrypted nor an
off-machine backup. Stop other writers while capturing a coherent source tree.

```sh
python3 scripts/backup-private.py create \
  --source /absolute/private-root \
  --archive /absolute/other/new-backup.tar.gz \
  --runtime /absolute/private-root/runtime

python3 scripts/backup-private.py verify \
  --archive /absolute/other/new-backup.tar.gz \
  --restore /absolute/new-private-root
```

The archive filename must be new. The restore directory must not already exist;
the restored tree's contents are placed directly in that new root. Keep restored
evidence and originals private. A full backup includes the runtime manifest and
release files, so it does not require rebuilding or reimporting them merely to
restore. It does require the exact matching reviewed application modules:
presentation/code hashes remain enforced. Restore the reviewed code separately
and verify those bindings and private browser startup before activation.

On the host, restore first to a new staging directory on the encrypted private
volume, then place the verified tree at the configured storage location while
the service is stopped. Preserve the previous tree, restore the service account's
runtime read permissions, verify the mount assertion, and restart. Record a
successful restore test against the actual durable destination; keeping an
archive in this temporary workspace does not establish durable recovery.

No scheduled refresh is configured by this package. A future licensed adapter
must reconcile both the database and snapshot-specific presentation content,
validate a candidate, and activate it atomically. See
[private hosting and refresh operations](private-hosting.md) for those remaining
operational requirements.

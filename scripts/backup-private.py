#!/usr/bin/env python3
"""Create and verify a portable private archive using only Python's standard library.

Archive and restore paths must be external to all Git checkouts. This utility
never uploads anything: a local archive is not durable off-machine storage.
File names and checksums stay in the private archive; terminal output is counts.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import gzip
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import sqlite3
import stat
import sys
import tarfile
from urllib.parse import quote
import uuid

REPOSITORY = Path(__file__).resolve().parents[1]
CHUNK = 1024 * 1024
MAX_FILE_BYTES = 8 * 1024**3
MAX_TOTAL_BYTES = 32 * 1024**3
MAX_ARCHIVE_BYTES = 40 * 1024**3
MAX_ENTRIES = 100_000
MAX_MANIFEST_BYTES = 64 * 1024**2
FORMAT = "market-structure-private-backup"


class BackupError(Exception):
    """An intentionally non-sensitive error safe for terminal output."""


def within(parent: Path, child: Path) -> bool:
    return child == parent or parent in child.parents


def external_path(raw) -> Path:
    if not raw or not Path(raw).is_absolute():
        raise BackupError("Use absolute external paths for private inputs and outputs.")
    path = Path(os.path.abspath(raw))
    if within(REPOSITORY, path):
        raise BackupError("Private backup paths must remain outside every Git checkout.")
    for part in [path, *path.parents]:
        if part.is_symlink():
            raise BackupError("Symlink paths are not permitted for private backups.")
        git = part / ".git"
        # Cloud mount guards lack HEAD; real checkouts have HEAD or a gitdir file.
        if git.is_symlink() or git.is_file() or (git.is_dir() and (git / "HEAD").exists()):
            raise BackupError("Private backup paths must remain outside every Git checkout.")
    return path


def parent_fd(path: Path) -> int:
    descriptor = os.open("/", os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in path.parent.parts[1:]:
            next_descriptor = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=descriptor)
            os.close(descriptor)
            descriptor = next_descriptor
        return descriptor
    except Exception:
        os.close(descriptor)
        raise


def regular_file(path: Path, maximum=MAX_FILE_BYTES):
    parent = parent_fd(path)
    try:
        fd = os.open(path.name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent)
    finally:
        os.close(parent)
    before = os.fstat(fd)
    if not stat.S_ISREG(before.st_mode) or before.st_size > maximum:
        os.close(fd)
        raise BackupError("A file is nonregular or exceeds the backup size limit.")
    return os.fdopen(fd, "rb"), before


def signature(info):
    return tuple(getattr(info, name) for name in ("st_dev", "st_ino", "st_size", "st_mtime_ns", "st_ctime_ns"))


def unchanged(stream, before):
    if signature(os.fstat(stream.fileno())) != signature(before):
        raise BackupError("A source changed while being read; retry with writers stopped.")


def relative_name(value, *, root=False):
    if root and value == "":
        return value
    if not isinstance(value, str) or not value or len(value.encode("utf-8")) > 4096:
        raise BackupError("Invalid or oversized archive member name.")
    parts = value.split("/")
    if any(part in ("", ".", "..", ".git") for part in parts) or "\\" in value or "\x00" in value or ":" in value:
        raise BackupError("Unsafe or nonportable archive member name.")
    if PurePosixPath(value).is_absolute():
        raise BackupError("Absolute archive member names are not permitted.")
    return value


def scan_tree(root: Path):
    """Inventory exact regular files and directory metadata, without following links."""
    external_path(root)
    if within(root, REPOSITORY):
        raise BackupError("The private source must not contain the application checkout.")
    if not root.is_dir():
        raise BackupError("Private source must be a directory.")
    files, directories = {}, {"": os.lstat(root)}
    total = 0
    def walk_error(_error):
        raise BackupError("A private directory could not be enumerated; no incomplete backup is allowed.")

    for directory, children, names in os.walk(root, followlinks=False, onerror=walk_error):
        for name in sorted(children + names):
            target = Path(directory) / name
            rel = relative_name(target.relative_to(root).as_posix())
            info = os.lstat(target)
            if stat.S_ISDIR(info.st_mode):
                directories[rel] = info
            elif stat.S_ISREG(info.st_mode):
                if info.st_size > MAX_FILE_BYTES:
                    raise BackupError("A source file exceeds the per-file backup size limit.")
                files[rel] = info
                total += info.st_size
            else:
                raise BackupError("Private trees may contain only regular files and directories; no symlinks or special files.")
            if len(files) + len(directories) > MAX_ENTRIES or total > MAX_TOTAL_BYTES:
                raise BackupError("Private tree exceeds the backup count or total-byte limit.")
    return files, directories


def compare_tree(root, before):
    after = scan_tree(root)
    for initial, current in zip(before, after):
        if initial.keys() != current.keys() or any(signature(info) != signature(current[name]) for name, info in initial.items()):
            raise BackupError("Private tree changed during backup; retry with writers stopped.")


def digest_file(path, maximum=MAX_FILE_BYTES):
    stream, before = regular_file(path, maximum)
    digest = hashlib.sha256()
    with stream:
        while chunk := stream.read(CHUNK):
            digest.update(chunk)
        unchanged(stream, before)
    return digest.hexdigest()


def read_json(path, maximum):
    stream, before = regular_file(path, maximum)
    with stream:
        raw = stream.read(maximum + 1)
        unchanged(stream, before)
    if len(raw) > maximum:
        raise BackupError("Private metadata exceeds the size limit.")
    try:
        value = json.loads(raw.decode("utf-8"))
    except (UnicodeError, ValueError):
        raise BackupError("Private metadata is not valid UTF-8 JSON.") from None
    if not isinstance(value, dict):
        raise BackupError("Private metadata must be a JSON object.")
    return value, hashlib.sha256(raw).hexdigest()


def validate_runtime(source, relative):
    """Verify the active immutable release; matching application code is saved separately."""
    runtime = external_path(source / relative_name(relative, root=True))
    config, _ = read_json(runtime / "legacy.json", 64 * 1024)
    if config.get("schemaVersion") != 1 or config.get("format") != "legacy-sqlite":
        raise BackupError("Unsupported private runtime manifest.")
    database = external_path(runtime / relative_name(config.get("database")))
    presentation = external_path(runtime / relative_name(config.get("presentation")))
    if presentation.name != "ui-content.json":
        raise BackupError("Invalid private presentation reference.")
    for suffix in ("-wal", "-journal"):
        journal = Path(str(database) + suffix)
        if journal.is_symlink():
            raise BackupError("Runtime has a journal symlink; stop writers before backup.")
        if journal.exists() and (not journal.is_file() or journal.stat().st_size):
            raise BackupError("Runtime has an active SQLite journal; checkpoint it before backup.")
    if digest_file(database) != config.get("databaseSha256"):
        raise BackupError("Active database hash does not match its private manifest.")
    ui, digest = read_json(presentation, 16 * 1024**2)
    if digest != config.get("presentationSha256") or ui.get("schemaVersion") != 1:
        raise BackupError("Active presentation hash or schema does not match its private manifest.")
    for name, key in (("shell.html", "shellSha256"), ("styles.css", "stylesSha256")):
        artifact = external_path(presentation.parent / name)
        if digest_file(artifact, 16 * 1024**2) != ui.get(key):
            raise BackupError("Active presentation artifact failed its integrity check.")
    stream, before = regular_file(database)
    with stream:
        descriptor_path = Path(f"/proc/self/fd/{stream.fileno()}")
        pinned = descriptor_path if descriptor_path.exists() else database
        try:
            connection = sqlite3.connect(f"file:{quote(str(pinned))}?mode=ro&immutable=1", uri=True)
            try:
                connection.execute("PRAGMA query_only=ON")
                connection.execute("PRAGMA trusted_schema=OFF")
                if connection.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
                    raise BackupError("Active SQLite database failed its integrity check.")
                if connection.execute("PRAGMA foreign_key_check").fetchone() is not None:
                    raise BackupError("Active SQLite database failed its foreign-key check.")
            finally:
                connection.close()
        except sqlite3.Error:
            raise BackupError("Active SQLite database could not be validated read-only.") from None
        unchanged(stream, before)
    return {"databaseHash": "verified", "presentationHashes": "verified", "sqliteIntegrity": "ok", "foreignKeys": "ok"}


class HashingReader:
    def __init__(self, stream):
        self.stream, self.digest = stream, hashlib.sha256()

    def read(self, size):
        chunk = self.stream.read(size)
        self.digest.update(chunk)
        return chunk


class BoundedTarInfo(tarfile.TarInfo):
    def _proc_member(self, archive):
        if self.type == tarfile.GNUTYPE_SPARSE:
            raise BackupError("Sparse archive members are not supported.")
        if self.type in (tarfile.XHDTYPE, tarfile.XGLTYPE, tarfile.GNUTYPE_LONGNAME, tarfile.GNUTYPE_LONGLINK) and self.size > 256 * 1024:
            raise BackupError("Archive extended metadata exceeds the size limit.")
        if self.size > MAX_FILE_BYTES:
            raise BackupError("Archive member exceeds the size limit.")
        return super()._proc_member(archive)


def tar_info(name, size=0, directory=False, mtime=0):
    info = tarfile.TarInfo(name)
    info.mode, info.uid, info.gid = (0o700 if directory else 0o600), 0, 0
    info.uname = info.gname = ""
    info.type = tarfile.DIRTYPE if directory else tarfile.REGTYPE
    info.size, info.mtime = size, mtime
    return info


def create_backup(source, archive, runtime=None):
    source, archive = external_path(source), external_path(archive)
    if within(source, archive):
        raise BackupError("Backup archive must be outside the complete private source tree.")
    if archive.exists():
        raise BackupError("Backup destination already exists; use a new filename.")
    tree = scan_tree(source)
    runtime_relative = None
    runtime_checks = None
    if runtime is not None:
        runtime = external_path(runtime)
        if not within(source, runtime):
            raise BackupError("The active runtime must be included inside the private source tree.")
        runtime_relative = "" if runtime == source else runtime.relative_to(source).as_posix()
        runtime_checks = validate_runtime(source, runtime_relative)
    manifest = {"format": FORMAT, "schemaVersion": 1, "createdAt": datetime.now(timezone.utc).isoformat(),
                "runtime": runtime_relative, "runtimeChecks": runtime_checks, "files": [], "directories": []}
    parent = parent_fd(archive)
    temporary = f".private-backup-{uuid.uuid4().hex}.tmp"
    published = False
    try:
        descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=parent)
        with os.fdopen(descriptor, "wb") as raw:
            with gzip.GzipFile(filename="", fileobj=raw, mode="wb", compresslevel=6, mtime=0) as compressed:
                with tarfile.open(fileobj=compressed, mode="w|", format=tarfile.PAX_FORMAT) as output:
                    for rel, info in sorted(tree[1].items()):
                        output.addfile(tar_info("payload" + (f"/{rel}" if rel else ""), directory=True, mtime=info.st_mtime_ns // 10**9))
                        manifest["directories"].append({"path": rel, "mtimeNs": info.st_mtime_ns})
                    for rel, info in sorted(tree[0].items()):
                        stream, before = regular_file(source / rel)
                        with stream:
                            if signature(before) != signature(info):
                                raise BackupError("A source changed before copying; retry with writers stopped.")
                            reader = HashingReader(stream)
                            output.addfile(tar_info(f"payload/{rel}", info.st_size, mtime=info.st_mtime_ns // 10**9), reader)
                            unchanged(stream, before)
                        manifest["files"].append({"path": rel, "size": info.st_size, "sha256": reader.digest.hexdigest(), "mtimeNs": info.st_mtime_ns})
                    manifest_bytes = json.dumps(manifest, ensure_ascii=True, separators=(",", ":")).encode("utf-8")
                    if len(manifest_bytes) > MAX_MANIFEST_BYTES:
                        raise BackupError("Backup manifest exceeds the size limit.")
                    import io
                    output.addfile(tar_info("backup-manifest.json", len(manifest_bytes)), io.BytesIO(manifest_bytes))
            raw.flush()
            os.fsync(raw.fileno())
        compare_tree(source, tree)
        if runtime_relative is not None:
            validate_runtime(source, runtime_relative)
        temp_path = archive.parent / temporary
        result = verify_backup(temp_path)
        compare_tree(source, tree)
        os.link(temporary, archive.name, src_dir_fd=parent, dst_dir_fd=parent, follow_symlinks=False)
        published = True
        os.unlink(temporary, dir_fd=parent)
        os.fsync(parent)
        return {**result, "archiveSha256": digest_file(archive, MAX_ARCHIVE_BYTES), "runtimeValidated": runtime_relative is not None,
                "durableOffMachine": False}
    except Exception:
        if published:
            raise BackupError("Backup was created, but final durability confirmation failed. Verify the archive before use.") from None
        raise
    finally:
        try:
            os.unlink(temporary, dir_fd=parent)
        except FileNotFoundError:
            pass
        os.close(parent)


def manifest_records(manifest):
    if not isinstance(manifest, dict) or manifest.get("format") != FORMAT or manifest.get("schemaVersion") != 1:
        raise BackupError("Unsupported private backup manifest.")
    files, directories = {}, {}
    for key, target in (("files", files), ("directories", directories)):
        records = manifest.get(key)
        if not isinstance(records, list) or len(records) > MAX_ENTRIES:
            raise BackupError("Invalid backup manifest entries.")
        for item in records:
            if not isinstance(item, dict):
                raise BackupError("Invalid backup manifest record.")
            rel = relative_name(item.get("path"), root=key == "directories")
            if rel in target or not isinstance(item.get("mtimeNs"), int) or item["mtimeNs"] < 0:
                raise BackupError("Duplicate or invalid backup manifest record.")
            if key == "files" and (type(item.get("size")) is not int or not 0 <= item["size"] <= MAX_FILE_BYTES or not re.fullmatch(r"[a-f0-9]{64}", str(item.get("sha256")))):
                raise BackupError("Invalid backup file size or hash.")
            target[rel] = item
    if "" not in directories or files.keys() & directories.keys():
        raise BackupError("Backup manifest has inconsistent paths.")
    if manifest.get("runtime") is not None:
        relative_name(manifest["runtime"], root=True)
    return files, directories


def verify_backup(archive, restore=None):
    archive = external_path(archive)
    restored = external_path(restore) if restore is not None else None
    stream, before = regular_file(archive, MAX_ARCHIVE_BYTES)
    created = False
    total = 0
    files, directories = {}, set()
    manifest = None
    try:
        if restored is not None:
            parent = parent_fd(restored)
            try:
                os.mkdir(restored.name, mode=0o700, dir_fd=parent)
                created = True
            finally:
                os.close(parent)
        with stream:
            with gzip.GzipFile(fileobj=stream, mode="rb") as compressed:
                with tarfile.open(fileobj=compressed, mode="r|", tarinfo=BoundedTarInfo) as content:
                    for member in content:
                        if manifest is not None:
                            raise BackupError("Unexpected archive entry after the final manifest.")
                        if member.sparse is not None or any(key.startswith("GNU.sparse") for key in member.pax_headers):
                            raise BackupError("Sparse archive members are not supported.")
                        if member.name == "backup-manifest.json":
                            if not member.isfile() or member.size > MAX_MANIFEST_BYTES:
                                raise BackupError("Invalid backup manifest member.")
                            try:
                                manifest = json.loads(content.extractfile(member).read().decode("utf-8"))
                            except (UnicodeError, ValueError):
                                raise BackupError("Backup manifest is not valid UTF-8 JSON.") from None
                            continue
                        if member.name != "payload" and not member.name.startswith("payload/"):
                            raise BackupError("Archive member is outside the private payload.")
                        rel = "" if member.name == "payload" else relative_name(member.name[len("payload/"):])
                        if rel in files or rel in directories:
                            raise BackupError("Archive contains duplicate paths.")
                        if len(files) + len(directories) >= MAX_ENTRIES:
                            raise BackupError("Archive exceeds the entry-count limit.")
                        if rel and str(PurePosixPath(rel).parent) not in {".", *directories}:
                            raise BackupError("Archive child appears before its parent directory.")
                        if member.isdir():
                            if member.size:
                                raise BackupError("Archive directory contains unexpected bytes.")
                            directories.add(rel)
                            if restored is not None and rel:
                                target = restored / rel
                                parent = parent_fd(target)
                                try:
                                    os.mkdir(target.name, mode=0o700, dir_fd=parent)
                                finally:
                                    os.close(parent)
                            continue
                        if not member.isfile() or not rel or member.size > MAX_FILE_BYTES:
                            raise BackupError("Archive may contain only bounded regular files and directories.")
                        total += member.size
                        if total > MAX_TOTAL_BYTES:
                            raise BackupError("Archive exceeds the uncompressed-byte limit.")
                        digest = hashlib.sha256()
                        output = None
                        if restored is not None:
                            target = restored / rel
                            parent = parent_fd(target)
                            try:
                                fd = os.open(target.name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=parent)
                            finally:
                                os.close(parent)
                            output = os.fdopen(fd, "wb")
                        try:
                            remaining = member.size
                            extracted = content.extractfile(member)
                            while remaining:
                                chunk = extracted.read(min(CHUNK, remaining))
                                if not chunk:
                                    raise BackupError("Archive member is truncated.")
                                digest.update(chunk)
                                if output is not None:
                                    output.write(chunk)
                                remaining -= len(chunk)
                            if output is not None:
                                output.flush()
                                os.fsync(output.fileno())
                        finally:
                            if output is not None:
                                output.close()
                        files[rel] = {"size": member.size, "sha256": digest.hexdigest()}
                # Consume the gzip trailer: truncated streams/CRC errors must fail
                # even if tar's end marker appeared before the damaged tail.
                tail_bytes = 0
                while chunk := compressed.read(CHUNK):
                    tail_bytes += len(chunk)
                    if any(chunk) or tail_bytes > 1024 * 1024:
                        raise BackupError("Unexpected data follows the tar archive.")
            unchanged(stream, before)
        wanted_files, wanted_dirs = manifest_records(manifest)
        if files.keys() != wanted_files.keys() or directories != wanted_dirs.keys():
            raise BackupError("Archive payload does not match its manifest inventory.")
        for rel, actual in files.items():
            expected = wanted_files[rel]
            if any(actual[key] != expected[key] for key in ("size", "sha256")):
                raise BackupError("Archive payload failed its SHA-256 integrity check.")
            if restored is not None and digest_file(restored / rel) != expected["sha256"]:
                raise BackupError("A restored file failed its SHA-256 integrity check.")
        runtime_validated = False
        if restored is not None:
            if manifest.get("runtime") is not None:
                validate_runtime(restored, manifest["runtime"])
                runtime_validated = True
            for rel, item in wanted_files.items():
                os.utime(restored / rel, ns=(item["mtimeNs"], item["mtimeNs"]), follow_symlinks=False)
            for rel, item in sorted(wanted_dirs.items(), key=lambda pair: pair[0].count("/"), reverse=True):
                os.utime(restored / rel, ns=(item["mtimeNs"], item["mtimeNs"]), follow_symlinks=False)
            for rel in sorted(directories, key=lambda name: name.count("/"), reverse=True):
                descriptor = os.open(restored / rel, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
                try:
                    os.fsync(descriptor)
                finally:
                    os.close(descriptor)
            parent = parent_fd(restored)
            try:
                os.fsync(parent)
            finally:
                os.close(parent)
        return {"files": len(files), "directories": len(directories), "bytes": total,
                "integrity": "sha256-verified", "restored": restored is not None, "runtimeValidated": runtime_validated}
    except Exception:
        if created:
            shutil.rmtree(restored)
        raise
    finally:
        stream.close()


class SafeArgumentParser(argparse.ArgumentParser):
    def error(self, _message):
        raise BackupError("Invalid command arguments; use --help for the supported create and verify options.")


def main(argv=None):
    parser = SafeArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("create", help="Create and verify a new external private tar.gz archive.")
    create.add_argument("--source", required=True)
    create.add_argument("--archive", required=True)
    create.add_argument("--runtime", help="Active runtime directory inside source; verify its pinned SQLite release.")
    verify = commands.add_parser("verify", help="Verify all bytes; optionally restore into a new external directory.")
    verify.add_argument("--archive", required=True)
    verify.add_argument("--restore")
    try:
        args = parser.parse_args(argv)
        result = create_backup(args.source, args.archive, args.runtime) if args.command == "create" else verify_backup(args.archive, args.restore)
        print(json.dumps(result, sort_keys=True))
        if args.command == "create":
            print("Local archive verified. Off-machine durability requires copying it to protected persistent storage and verifying that copy.")
        return 0
    except BackupError as error:
        print(f"Backup failed: {error}", file=sys.stderr)
    except Exception:
        # OS, parser, gzip and SQLite errors can include private paths/content.
        print("Backup failed. Check external paths, source stability, available storage and archive integrity. No private values are printed.", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())

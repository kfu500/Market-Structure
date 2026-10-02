#!/usr/bin/env python3
"""Package an externally curated private tree as deduplicated, verified ZIP parts.

This tool makes no retention decisions. The caller selects the files to keep in
an external staging tree; every staged regular file and directory is preserved.
No upload, deletion of source files, or Git operation is performed.
"""
from __future__ import annotations

import bisect
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import struct
import sys
import unicodedata
import zipfile

_HELPER = importlib.util.spec_from_file_location("private_backup_helpers", Path(__file__).with_name("backup-private.py"))
BACKUP = importlib.util.module_from_spec(_HELPER)
_HELPER.loader.exec_module(BACKUP)

CHUNK = 1024 * 1024
PART_BYTES = 30 * 1024**2
MAX_ARCHIVE_BYTES = 2_000_000_000  # Below Python's conservative ZIP64 threshold.
MAX_UNIQUE_BYTES = MAX_ARCHIVE_BYTES - 64 * 1024**2
MAX_LOGICAL_BYTES = 8 * 1024**3
MAX_ENTRIES = 10_000
MAX_MANIFEST_BYTES = 16 * 1024**2
FORMAT = "market-structure-recovery"
PARTS_FORMAT = "market-structure-recovery-parts"
HASH = re.compile(r"[a-f0-9]{64}\Z")
DEVICES = re.compile(r"(?:CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³]|CONIN\$|CONOUT\$)\Z", re.I)


class PackageError(BACKUP.BackupError):
    """A non-sensitive error message safe for terminal output."""


def folded_name(value):
    return unicodedata.normalize("NFC", value).upper()


def logical_path(value, *, root=False):
    if isinstance(value, str):
        try:
            units = len(value.encode("utf-16-le")) // 2
        except UnicodeError:
            raise PackageError("A logical path contains an unpaired Unicode surrogate.") from None
        if units > 240 or unicodedata.normalize("NFC", value) != value:
            raise PackageError("A logical path exceeds portable limits or is not normalized Unicode.")
    BACKUP.relative_name(value, root=root)
    if root and value == "":
        return value
    for part in value.split("/"):
        device_base = part.split(".")[0].rstrip(" ")
        if folded_name(part) == ".GIT" or part[-1:] in (".", " ") or DEVICES.fullmatch(device_base) or re.search(r'[<>:"\\|?*\x00-\x1f\x7f]', part):
            raise PackageError("A logical path is not safe for Windows recovery.")
        if len(part.encode("utf-8")) > 255:
            raise PackageError("A logical path component exceeds Windows limits.")
    return value


def check_paths(files, directories):
    seen = set()
    for name in [*directories, *files]:
        logical_path(name, root=name in directories)
        folded = folded_name(name)
        if folded in seen:
            raise PackageError("Logical paths collide on a case-insensitive filesystem.")
        seen.add(folded)
    if "" not in directories:
        raise PackageError("Recovery manifest must include its root directory.")
    for name in [*directories, *files]:
        if name:
            parent = str(PurePosixPath(name).parent)
            if ("" if parent == "." else parent) not in directories:
                raise PackageError("A logical path has no declared parent directory.")


def bounded_json(raw):
    if len(raw) > MAX_MANIFEST_BYTES:
        raise PackageError("Recovery metadata exceeds the size limit.")
    try:
        value = json.loads(raw.decode("utf-8"))
    except (ValueError, UnicodeError):
        raise PackageError("Recovery metadata is not valid UTF-8 JSON.") from None
    if not isinstance(value, dict):
        raise PackageError("Recovery metadata must be a JSON object.")
    return value


def canonical_json(value):
    raw = json.dumps(value, ensure_ascii=True, separators=(",", ":")).encode("utf-8")
    if len(raw) > MAX_MANIFEST_BYTES:
        raise PackageError("Recovery metadata exceeds the size limit.")
    return raw


def manifest_files(manifest):
    if manifest.get("format") != FORMAT or manifest.get("schemaVersion") != 1:
        raise PackageError("Unsupported recovery manifest.")
    rows, directory_rows = manifest.get("files"), manifest.get("directories")
    derived_rows = manifest.get("derivedFiles", [])
    if not isinstance(rows, list) or not isinstance(directory_rows, list) or not isinstance(derived_rows, list) or len(rows) + len(derived_rows) + len(directory_rows) > MAX_ENTRIES:
        raise PackageError("Invalid recovery manifest entry count.")
    files, derived, directories, blobs = {}, {}, set(), {}
    for name in directory_rows:
        logical_path(name, root=True)
        if name in directories:
            raise PackageError("Duplicate directory in recovery manifest.")
        directories.add(name)
    total = 0
    for item, is_derived in [(item, False) for item in rows] + [(item, True) for item in derived_rows]:
        if not isinstance(item, dict):
            raise PackageError("Invalid recovery file record.")
        name = logical_path(item.get("path"))
        digest, size, modified = item.get("sha256"), item.get("size"), item.get("mtimeNs")
        if name in files or name in derived or not isinstance(digest, str) or not HASH.fullmatch(digest) or type(size) is not int or not 0 <= size <= MAX_UNIQUE_BYTES:
            raise PackageError("Invalid recovery file identity, size or hash.")
        if not isinstance(modified, str) or not re.fullmatch(r"\d{1,20}", modified):
            raise PackageError("Invalid recovery file timestamp.")
        if is_derived:
            reference = item.get("fromZip")
            if not isinstance(reference, dict) or set(reference) != {"archive", "member"}:
                raise PackageError("Invalid derived-file ZIP reference.")
            logical_path(reference["archive"])
            logical_path(reference["member"])
            derived[name] = item
        else:
            if digest in blobs and blobs[digest] != size:
                raise PackageError("A recovery blob has inconsistent logical sizes.")
            files[name], blobs[digest] = item, size
        total += size
    check_paths({**files, **derived}, directories)
    for item in derived.values():
        if item["fromZip"]["archive"] not in files:
            raise PackageError("Derived files require an ordinary stored archive; chains are not supported.")
    totals = {"files": len(files) + len(derived), "uniqueBlobs": len(blobs), "logicalBytes": total, "uniqueBytes": sum(blobs.values())}
    if total > MAX_LOGICAL_BYTES or totals["uniqueBytes"] > MAX_UNIQUE_BYTES or manifest.get("totals") != totals:
        raise PackageError("Recovery manifest totals or resource limits do not match.")
    return files, directories, blobs, derived


def inspect_source_zip(stream, size):
    """Bound the central directory before ZipFile reads it into memory."""
    if size < 22:
        raise PackageError("A derivation source is not a supported ZIP archive.")
    stream.seek(max(0, size - 65557))
    tail = stream.read(min(size, 65557))
    marker = tail.rfind(b"PK\x05\x06")
    if marker < 0 or marker + 22 > len(tail):
        raise PackageError("A derivation source has no valid ZIP end record.")
    _, disk, central_disk, on_disk, count, central_size, central_offset, comment_size = struct.unpack_from("<4s4H2IH", tail, marker)
    location = max(0, size - 65557) + marker
    if disk or central_disk or on_disk != count or count > MAX_ENTRIES or count == 0xffff or central_size > MAX_MANIFEST_BYTES or central_offset + central_size != location or marker + 22 + comment_size != len(tail):
        raise PackageError("A derivation source uses unsupported ZIP64, multipart or oversized metadata.")
    stream.seek(0)
    archive = zipfile.ZipFile(stream, "r", allowZip64=False)
    try:
        names, folded, total = set(), set(), 0
        if len(archive.infolist()) != count:
            raise PackageError("A derivation source ZIP directory has inconsistent counts.")
        for item in archive.infolist():
            name = logical_path(item.filename[:-1] if item.is_dir() else item.filename)
            if name in names or folded_name(name) in folded:
                raise PackageError("A derivation source ZIP has duplicate or case-colliding members.")
            names.add(name)
            folded.add(folded_name(name))
            if item.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED) or item.flag_bits & ~0x800:
                raise PackageError("A derivation source ZIP uses unsupported compression or flags.")
            kind = stat.S_IFMT(item.external_attr >> 16)
            if kind not in (0, stat.S_IFDIR if item.is_dir() else stat.S_IFREG):
                raise PackageError("A derivation source ZIP contains links or special members.")
            if item.is_dir() and item.file_size:
                raise PackageError("A derivation ZIP directory declares file bytes.")
            total += item.file_size
            if total > MAX_LOGICAL_BYTES or item.compress_size > size or item.file_size > MAX_LOGICAL_BYTES:
                raise PackageError("A derivation source ZIP exceeds bounded content limits.")
            extra = item.extra
            while extra:
                if len(extra) < 4:
                    raise PackageError("Malformed derivation ZIP extended metadata.")
                tag, length = struct.unpack_from("<HH", extra)
                if tag == 1 or len(extra) < 4 + length:
                    raise PackageError("ZIP64 or malformed derivation metadata is unsupported.")
                extra = extra[4 + length:]
        return archive
    except Exception:
        archive.close()
        raise


def verify_derived_members(archive, records):
    for item in records:
        try:
            member = archive.getinfo(item["fromZip"]["member"])
        except KeyError:
            raise PackageError("A requested derivation member is missing from its original ZIP.") from None
        if member.is_dir() or member.file_size != item["size"]:
            raise PackageError("Derived file size does not match its original ZIP member.")
        actual = hashlib.sha256()
        with archive.open(member) as stream:
            while block := stream.read(CHUNK):
                actual.update(block)
        if actual.hexdigest() != item["sha256"]:
            raise PackageError("Derived file SHA-256 does not match its original ZIP member.")


def apply_derivations(source, files, mapping_path):
    if mapping_path is None:
        return files, []
    mapping_path = BACKUP.external_path(mapping_path)
    stream, before = BACKUP.regular_file(mapping_path, MAX_MANIFEST_BYTES)
    with stream:
        mapping = bounded_json(stream.read(MAX_MANIFEST_BYTES + 1))
        BACKUP.unchanged(stream, before)
    available = {item["path"]: item for item in files}
    derived, groups = [], {}
    for target, reference in mapping.items():
        logical_path(target)
        if target not in available or not isinstance(reference, dict) or set(reference) != {"archive", "member"}:
            raise PackageError("A derivation mapping has an unknown target or invalid reference.")
        archive_name = logical_path(reference["archive"])
        logical_path(reference["member"])
        if archive_name not in available or archive_name in mapping:
            raise PackageError("Derivation archives must be stored staged files; chains are not supported.")
        item = {**available[target], "fromZip": reference}
        derived.append(item)
        groups.setdefault(archive_name, []).append(item)
    for archive_name, records in groups.items():
        stream, before = BACKUP.regular_file(source / archive_name, MAX_UNIQUE_BYTES)
        with stream:
            with inspect_source_zip(stream, before.st_size) as archive:
                verify_derived_members(archive, records)
            BACKUP.unchanged(stream, before)
    return [item for item in files if item["path"] not in mapping], sorted(derived, key=lambda item: item["path"])


def write_file(path, content):
    parent = BACKUP.parent_fd(path)
    try:
        descriptor = os.open(path.name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=parent)
    finally:
        os.close(parent)
    with os.fdopen(descriptor, "wb") as stream:
        stream.write(content)
        stream.flush()
        os.fsync(stream.fileno())


def zip_info(name):
    info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.create_system = 3
    info.external_attr = (stat.S_IFREG | 0o600) << 16
    return info


def hash_source(path, expected):
    stream, before = BACKUP.regular_file(path, MAX_UNIQUE_BYTES)
    with stream:
        if BACKUP.signature(before) != BACKUP.signature(expected):
            raise PackageError("A staged source changed before packaging.")
        digest = hashlib.sha256()
        while block := stream.read(CHUNK):
            digest.update(block)
        BACKUP.unchanged(stream, before)
    return digest.hexdigest()


def create_package(source, output_dir, *, part_bytes=PART_BYTES, derive_from_zip=None):
    source, output_dir = BACKUP.external_path(source), BACKUP.external_path(output_dir)
    if type(part_bytes) is not int or not 1 <= part_bytes <= PART_BYTES:
        raise PackageError("Recovery parts must be positive and no larger than 30 MiB.")
    if BACKUP.within(source, output_dir):
        raise PackageError("Recovery output must be outside the curated source tree.")
    tree = BACKUP.scan_tree(source)
    if len(tree[0]) + len(tree[1]) > MAX_ENTRIES:
        raise PackageError("Curated staging tree exceeds the recovery entry-count limit.")
    check_paths(tree[0], tree[1])
    files, blobs, unique_bytes, logical_bytes = [], {}, 0, 0
    for name, info in sorted(tree[0].items()):
        digest = hash_source(source / name, info)
        files.append({"path": name, "size": info.st_size, "sha256": digest, "mtimeNs": str(info.st_mtime_ns)})
        logical_bytes += info.st_size
        if digest not in blobs:
            blobs[digest] = (name, info)
            unique_bytes += info.st_size
        if logical_bytes > MAX_LOGICAL_BYTES:
            raise PackageError("Curated staging tree exceeds the portable recovery byte limits.")
    files, derived = apply_derivations(source, files, derive_from_zip)
    kept_hashes = {item["sha256"] for item in files}
    blobs = {digest: entry for digest, entry in blobs.items() if digest in kept_hashes}
    unique_bytes = sum(info.st_size for _, info in blobs.values())
    manifest = {"format": FORMAT, "schemaVersion": 1, "directories": sorted(tree[1]), "files": files,
                "totals": {"files": len(files) + len(derived), "uniqueBlobs": len(blobs), "logicalBytes": logical_bytes, "uniqueBytes": unique_bytes}}
    if derived:
        manifest["derivedFiles"] = derived
    manifest_files(manifest)
    parent = BACKUP.parent_fd(output_dir)
    created = False
    try:
        os.mkdir(output_dir.name, mode=0o700, dir_fd=parent)
        created = True
        archive_path = output_dir / ".recovery-building.zip"
        descriptor = os.open(archive_path, os.O_RDWR | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        with os.fdopen(descriptor, "w+b") as archive_stream:
            with zipfile.ZipFile(archive_stream, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=False) as archive:
                archive.writestr(zip_info("recovery-manifest.json"), canonical_json(manifest))
                for digest, (name, info) in sorted(blobs.items()):
                    stream, before = BACKUP.regular_file(source / name, MAX_UNIQUE_BYTES)
                    with stream:
                        if BACKUP.signature(before) != BACKUP.signature(info):
                            raise PackageError("A staged source changed before compression.")
                        actual = hashlib.sha256()
                        with archive.open(zip_info(f"blobs/{digest}"), "w", force_zip64=False) as member:
                            while block := stream.read(CHUNK):
                                actual.update(block)
                                member.write(block)
                        BACKUP.unchanged(stream, before)
                        if actual.hexdigest() != digest:
                            raise PackageError("A staged source changed during compression.")
            archive_stream.flush()
            os.fsync(archive_stream.fileno())
        BACKUP.compare_tree(source, tree)
        archive_size = archive_path.stat().st_size
        if archive_size > MAX_ARCHIVE_BYTES:
            raise PackageError("Compressed recovery archive exceeds the non-ZIP64 limit.")
        parts, archive_hash = [], hashlib.sha256()
        stream, before = BACKUP.regular_file(archive_path, MAX_ARCHIVE_BYTES)
        with stream:
            ordinal = 1
            while remaining := min(part_bytes, archive_size - stream.tell()):
                name = f"recovery.part-{ordinal:03}"
                digest = hashlib.sha256()
                descriptor = os.open(output_dir / name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
                part_size = remaining
                with os.fdopen(descriptor, "wb") as part:
                    while remaining:
                        block = stream.read(min(CHUNK, remaining))
                        if not block:
                            raise PackageError("Recovery archive changed during splitting.")
                        digest.update(block)
                        archive_hash.update(block)
                        part.write(block)
                        remaining -= len(block)
                    part.flush()
                    os.fsync(part.fileno())
                parts.append({"file": name, "size": part_size, "sha256": digest.hexdigest()})
                ordinal += 1
            BACKUP.unchanged(stream, before)
        outer = {"format": PARTS_FORMAT, "schemaVersion": 1,
                 "archive": {"file": "recovery.zip", "size": archive_size, "sha256": archive_hash.hexdigest()},
                 "partBytes": part_bytes, "parts": parts}
        write_file(output_dir / "recovery-parts.json", canonical_json(outer))
        result = verify_package(output_dir)
        BACKUP.compare_tree(source, tree)
        archive_path.unlink()
        directory = os.open(output_dir, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        try:
            os.fsync(directory)
        finally:
            os.close(directory)
        os.fsync(parent)
        return {**result, "deduplicatedBytes": logical_bytes - unique_bytes, "originalsUnchanged": True}
    except Exception:
        if created:
            shutil.rmtree(output_dir)
        raise
    finally:
        os.close(parent)


class JoinedParts(io.RawIOBase):
    """Seek across pinned part descriptors without materializing the ZIP in RAM."""
    def __init__(self, streams, sizes):
        super().__init__()
        self.streams, self.starts, total = streams, [], 0
        for size in sizes:
            self.starts.append(total)
            total += size
        self.length, self.position = total, 0

    def readable(self):
        return True

    def seekable(self):
        return True

    def tell(self):
        return self.position

    def seek(self, offset, whence=os.SEEK_SET):
        next_position = offset if whence == os.SEEK_SET else self.position + offset if whence == os.SEEK_CUR else self.length + offset if whence == os.SEEK_END else -1
        if next_position < 0:
            raise PackageError("Invalid recovery archive seek.")
        self.position = next_position
        return self.position

    def read(self, size=-1):
        if size is None or size < 0:
            size = self.length - self.position
        if size > MAX_MANIFEST_BYTES:
            raise PackageError("Recovery archive requests an oversized metadata read.")
        remaining = min(size, max(0, self.length - self.position))
        chunks = []
        while remaining:
            index = bisect.bisect_right(self.starts, self.position) - 1
            stream = self.streams[index]
            stream.seek(self.position - self.starts[index])
            boundary = self.starts[index + 1] if index + 1 < len(self.starts) else self.length
            block = stream.read(min(remaining, boundary - self.position))
            if not block:
                raise PackageError("A recovery part is truncated.")
            chunks.append(block)
            self.position += len(block)
            remaining -= len(block)
        return b"".join(chunks)


def verify_zip(joined):
    with zipfile.ZipFile(joined, "r", allowZip64=False) as archive:
        members = archive.infolist()
        if len(members) > MAX_ENTRIES + 1 or len({item.filename for item in members}) != len(members):
            raise PackageError("Recovery ZIP has duplicate or excessive members.")
        for item in members:
            if item.is_dir() or item.compress_type != zipfile.ZIP_DEFLATED or item.flag_bits & 1 or item.file_size > MAX_UNIQUE_BYTES:
                raise PackageError("Recovery ZIP contains unsupported entries or sizes.")
            if stat.S_IFMT(item.external_attr >> 16) not in (0, stat.S_IFREG):
                raise PackageError("Recovery ZIP contains a link or other special member.")
            if item.extra or item.comment:
                raise PackageError("Recovery ZIP contains unsupported extended metadata.")
        if not members or members[0].filename != "recovery-manifest.json" or members[0].file_size > MAX_MANIFEST_BYTES:
            raise PackageError("Recovery ZIP is missing its bounded manifest.")
        manifest = bounded_json(archive.read(members[0]))
        files, directories, blobs, derived = manifest_files(manifest)
        expected = {"recovery-manifest.json", *(f"blobs/{digest}" for digest in blobs)}
        if {item.filename for item in members} != expected:
            raise PackageError("Recovery ZIP blob inventory differs from its manifest.")
        for digest, size in blobs.items():
            item = archive.getinfo(f"blobs/{digest}")
            if item.file_size != size:
                raise PackageError("Recovery blob size differs from its manifest.")
            actual = hashlib.sha256()
            with archive.open(item) as stream:
                remaining = size
                while remaining:
                    block = stream.read(min(CHUNK, remaining))
                    if not block:
                        raise PackageError("A recovery blob is truncated.")
                    actual.update(block)
                    remaining -= len(block)
                if stream.read(1):
                    raise PackageError("A recovery blob exceeds its declared size.")
            if actual.hexdigest() != digest:
                raise PackageError("Recovery blob failed SHA-256 verification.")
        groups = {}
        for item in derived.values():
            groups.setdefault(item["fromZip"]["archive"], []).append(item)
        for archive_name, records in groups.items():
            original = files[archive_name]
            with archive.open(f"blobs/{original['sha256']}") as stream:
                with inspect_source_zip(stream, original["size"]) as nested:
                    verify_derived_members(nested, records)
    return manifest["totals"]


def verify_package(directory):
    directory = BACKUP.external_path(directory)
    raw, before = BACKUP.regular_file(directory / "recovery-parts.json", MAX_MANIFEST_BYTES)
    with raw:
        outer = bounded_json(raw.read(MAX_MANIFEST_BYTES + 1))
        BACKUP.unchanged(raw, before)
    archive_info, parts, part_bytes = outer.get("archive"), outer.get("parts"), outer.get("partBytes")
    if outer.get("format") != PARTS_FORMAT or outer.get("schemaVersion") != 1 or not isinstance(archive_info, dict) or not isinstance(parts, list) or not parts or len(parts) > MAX_ENTRIES:
        raise PackageError("Unsupported recovery parts manifest.")
    if archive_info.get("file") != "recovery.zip" or type(archive_info.get("size")) is not int or not 0 < archive_info["size"] <= MAX_ARCHIVE_BYTES or not isinstance(archive_info.get("sha256"), str) or not HASH.fullmatch(archive_info["sha256"]):
        raise PackageError("Invalid reconstructed archive identity or limits.")
    if type(part_bytes) is not int or not 1 <= part_bytes <= PART_BYTES:
        raise PackageError("Recovery chunk size exceeds the supported download limit.")
    streams, snapshots, sizes, actual_hash = [], [], [], hashlib.sha256()
    try:
        for ordinal, part in enumerate(parts, 1):
            if not isinstance(part, dict) or part.get("file") != f"recovery.part-{ordinal:03}" or type(part.get("size")) is not int or not 1 <= part["size"] <= part_bytes or not isinstance(part.get("sha256"), str) or not HASH.fullmatch(part["sha256"]):
                raise PackageError("Recovery parts must be ordered, bounded and hash-addressed.")
            if ordinal < len(parts) and part["size"] != part_bytes:
                raise PackageError("Only the final recovery part may be shorter than the chunk size.")
            stream, info = BACKUP.regular_file(directory / part["file"], PART_BYTES)
            streams.append(stream)
            snapshots.append(info)
            if info.st_size != part["size"]:
                raise PackageError("Recovery part length differs from its manifest.")
            digest = hashlib.sha256()
            while block := stream.read(CHUNK):
                digest.update(block)
                actual_hash.update(block)
            BACKUP.unchanged(stream, info)
            if digest.hexdigest() != part["sha256"]:
                raise PackageError("Recovery part failed SHA-256 verification.")
            sizes.append(part["size"])
        if sum(sizes) != archive_info["size"] or actual_hash.hexdigest() != archive_info["sha256"]:
            raise PackageError("Rejoined recovery parts differ from the complete archive fingerprint.")
        totals = verify_zip(JoinedParts(streams, sizes))
        for stream, info in zip(streams, snapshots):
            BACKUP.unchanged(stream, info)
        return {**totals, "parts": len(parts), "archiveBytes": archive_info["size"], "archiveSha256": archive_info["sha256"],
                "integrity": "parts-archive-and-blobs-sha256-verified"}
    finally:
        for stream in streams:
            stream.close()


def main(argv=None):
    parser = BACKUP.SafeArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("create")
    create.add_argument("--source", required=True)
    create.add_argument("--output-dir", required=True)
    create.add_argument("--derive-from-zip", help="External JSON mapping of staged targets to original ZIP members.")
    verify = commands.add_parser("verify")
    verify.add_argument("--directory", required=True)
    try:
        args = parser.parse_args(argv)
        result = create_package(args.source, args.output_dir, derive_from_zip=args.derive_from_zip) if args.command == "create" else verify_package(args.directory)
        print(json.dumps(result, sort_keys=True))
        return 0
    except BACKUP.BackupError as error:
        print(f"Recovery packaging failed: {error}", file=sys.stderr)
    except Exception:
        print("Recovery packaging failed. Check external paths, unchanged sources, storage and package integrity. No private values are printed.", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Inventory external private source files without executing or extracting them.

Only Python's standard library is required. Inventory contents are private: they
include archive filenames and source fingerprints. Never commit the output.
"""

from __future__ import annotations

import argparse
import codecs
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import struct
import sys
import time
import zipfile


REPOSITORY = Path(__file__).resolve().parents[1]
CHUNK = 64 * 1024
MAX_SOURCE_BYTES = 2 * 1024**3
MAX_HTML_BYTES = 512 * 1024**2
MAX_CENTRAL_BYTES = 32 * 1024**2
MAX_ENTRIES = 25_000
MAX_SCRIPTS = 10_000
MAX_TAG_CHARS = 64 * 1024
MAX_DECLARED_ENTRY_BYTES = 10 * 1024**3
MAX_DECLARED_TOTAL_BYTES = 100 * 1024**3


class InspectionError(Exception):
    """A deliberately non-sensitive error suitable for a terminal."""


def external_path(raw: str) -> Path:
    path = Path(os.path.abspath(raw))
    if path == REPOSITORY or REPOSITORY in path.parents:
        raise InspectionError("All source and output paths must be outside the repository.")
    # Lexical checks plus O_NOFOLLOW directory traversal below prevent symlink
    # aliases into the checkout, including symlinked parent directories.
    for part in [path, *path.parents]:
        if part.is_symlink():
            raise InspectionError("Symlink paths are not permitted for sources or output.")
        git = part / ".git"
        # An inert .git directory may be a platform placeholder. A gitdir
        # pointer file or .git/HEAD identifies an actual checkout.
        if git.is_file() or (git.is_dir() and (git / "HEAD").exists()):
            raise InspectionError("Private sources and inventories must be outside every Git checkout.")
    return path


def parent_fd(path: Path) -> int:
    """Open a parent directory without following any symlink component."""
    descriptor = os.open("/", os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in path.parent.parts[1:]:
            next_descriptor = os.open(
                part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=descriptor
            )
            os.close(descriptor)
            descriptor = next_descriptor
        return descriptor
    except Exception:
        os.close(descriptor)
        raise


def source_file(path: Path, limit: int):
    parent = parent_fd(path)
    try:
        descriptor = os.open(path.name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent)
    finally:
        os.close(parent)
    metadata = os.fstat(descriptor)
    if not stat.S_ISREG(metadata.st_mode) or metadata.st_size > limit:
        os.close(descriptor)
        raise InspectionError("A source is not a regular file or exceeds the inspection size limit.")
    return os.fdopen(descriptor, "rb"), metadata


def assert_unchanged(stream, before) -> None:
    after = os.fstat(stream.fileno())
    fields = ("st_dev", "st_ino", "st_size", "st_mtime_ns", "st_ctime_ns")
    if any(getattr(before, field) != getattr(after, field) for field in fields):
        raise InspectionError("A source changed during inspection; no inventory was written.")


class ScriptInventory(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.scripts = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        if tag != "script":
            return
        if len(self.scripts) >= MAX_SCRIPTS:
            raise InspectionError("HTML exceeds the script-count inspection limit.")
        attributes = dict(attrs)
        kind = attributes.get("type") or "text/javascript (default)"
        if len(kind) > 1024:
            raise InspectionError("HTML script type exceeds the metadata inspection limit.")
        self.current = {
            "index": len(self.scripts) + 1,
            "type": kind,
            "external_src": "src" in attributes,
            "body_utf8_bytes": 0,
            "closed": False,
        }
        self.scripts.append(self.current)

    def handle_data(self, data):
        if self.current is not None:
            self.current["body_utf8_bytes"] += len(data.encode("utf-8"))

    def handle_endtag(self, tag):
        if tag == "script" and self.current is not None:
            self.current["closed"] = True
            self.current = None

    def drain(self):
        # HTMLParser otherwise retains a whole script/style body until its end
        # tag. Flush raw text incrementally, retaining a possible partial tag.
        if self.cdata_elem and self.rawdata:
            opening = self.rawdata.rfind("<")
            retain_from = len(self.rawdata) if opening < 0 else opening
            if len(self.rawdata) - retain_from > MAX_TAG_CHARS:
                # A '<' in a large JavaScript literal need not start a tag.
                # Keep only enough text to recognize a genuine closing tag.
                if re.match(r"</\s*(?:script|style)\s*\Z", self.rawdata[opening:], re.I):
                    raise InspectionError("HTML contains an oversized incomplete closing tag.")
                retain_from = len(self.rawdata)
            self.handle_data(self.rawdata[:retain_from])
            self.rawdata = self.rawdata[retain_from:]
        if len(self.rawdata) > MAX_TAG_CHARS:
            raise InspectionError("HTML contains an oversized or incomplete tag.")


class MarkerCounter:
    # Lexical markers only: this does not infer record counts or execute code.
    patterns = {
        "data_uri_markers": re.compile(rb"data:[a-z0-9.+-]{1,64}/", re.I),
        "blob_constructor_markers": re.compile(rb"\bnew\s{1,64}Blob\s{0,64}\(", re.I),
        "create_object_url_markers": re.compile(rb"\bURL\.createObjectURL\s{0,64}\(", re.I),
    }

    def __init__(self):
        self.counts = dict.fromkeys(self.patterns, 0)
        self.tail = b""

    def feed(self, chunk):
        combined = self.tail + chunk
        boundary = len(self.tail)
        for name, pattern in self.patterns.items():
            self.counts[name] += sum(match.end() > boundary for match in pattern.finditer(combined))
        self.tail = combined[-256:]


def inspect_html(path: Path) -> dict:
    stream, before = source_file(path, MAX_HTML_BYTES)
    parser = ScriptInventory()
    markers = MarkerCounter()
    decoder = codecs.getincrementaldecoder("utf-8")(errors="replace")
    digest = hashlib.sha256()
    total = 0
    with stream:
        while chunk := stream.read(CHUNK):
            total += len(chunk)
            if total > MAX_HTML_BYTES:
                raise InspectionError("HTML exceeds the inspection size limit.")
            digest.update(chunk)
            markers.feed(chunk)
            parser.feed(decoder.decode(chunk))
            parser.drain()
        parser.feed(decoder.decode(b"", final=True))
        parser.drain()
        parser.close()
        if parser.cdata_elem and parser.rawdata:
            parser.handle_data(parser.rawdata)
            parser.rawdata = ""
        assert_unchanged(stream, before)
    return {
        "sha256": digest.hexdigest(),
        "bytes": total,
        "scripts": parser.scripts,
        "inline_script_count": sum(not script["external_src"] for script in parser.scripts),
        "json_script_count": sum(script["type"].split(";")[0].strip().lower() in
                                 ("application/json", "application/ld+json") for script in parser.scripts),
        "embedded_markers": markers.counts,
        "notes": [
            "Script body sizes count UTF-8-decoded text re-encoded as UTF-8; invalid bytes are replaced.",
            "Embedded marker counts are lexical hints, not extracted dataset or record counts.",
            "No HTML, JavaScript, external URL, or embedded attachment was executed or opened.",
        ],
    }


def check_zip_bounds(stream, size: int):
    if size < 22:
        raise InspectionError("Archive is not a supported ZIP file.")
    stream.seek(max(0, size - 65_557))
    tail = stream.read(65_557)
    location = tail.rfind(b"PK\x05\x06")
    if location < 0 or location + 22 > len(tail):
        raise InspectionError("Archive has no valid ZIP end record.")
    fields = struct.unpack("<4s4H2LH", tail[location:location + 22])
    _, disk, central_disk, entries_disk, entries, central_bytes, central_offset, comment_bytes = fields
    if location + 22 + comment_bytes != len(tail):
        raise InspectionError("Archive has an inconsistent ZIP end record.")
    if disk or central_disk or entries_disk != entries:
        raise InspectionError("Multipart ZIP archives are not supported.")
    if entries == 0xFFFF or central_bytes == 0xFFFFFFFF or central_offset == 0xFFFFFFFF:
        absolute_location = max(0, size - 65_557) + location
        if absolute_location < 20:
            raise InspectionError("ZIP64 archive is missing its locator.")
        stream.seek(absolute_location - 20)
        signature, locator_disk, offset, disk_count = struct.unpack("<4sLQL", stream.read(20))
        if signature != b"PK\x06\x07" or locator_disk or disk_count != 1 or offset + 56 > size:
            raise InspectionError("ZIP64 archive has an invalid locator.")
        stream.seek(offset)
        record = struct.unpack("<4sQ2H2L4Q", stream.read(56))
        signature, record_bytes, _, _, disk, central_disk, entries_disk, entries, central_bytes, central_offset = record
        if signature != b"PK\x06\x06" or not 44 <= record_bytes <= 1024 or disk or central_disk or entries_disk != entries:
            raise InspectionError("ZIP64 archive has an invalid end record.")
    if entries > MAX_ENTRIES or central_bytes > MAX_CENTRAL_BYTES:
        raise InspectionError("Archive exceeds central-directory inspection limits.")
    if central_offset + central_bytes > size:
        raise InspectionError("Archive declares an out-of-bounds central directory.")
    stream.seek(0)


def inspect_archive(path: Path) -> dict:
    stream, before = source_file(path, MAX_SOURCE_BYTES)
    digest = hashlib.sha256()
    total = 0
    records = []
    names = set()
    expanded_total = 0
    with stream:
        while chunk := stream.read(CHUNK):
            total += len(chunk)
            if total > MAX_SOURCE_BYTES:
                raise InspectionError("Archive exceeds the inspection size limit.")
            digest.update(chunk)
        check_zip_bounds(stream, total)
        with zipfile.ZipFile(stream, "r") as archive:
            entries = archive.infolist()
            if len(entries) > MAX_ENTRIES:
                raise InspectionError("Archive exceeds the entry-count inspection limit.")
            for entry in entries:
                normalized = entry.filename.replace("\\", "/")
                canonical = str(PurePosixPath(normalized))
                flags = []
                if normalized.startswith("/") or re.match(r"^[a-zA-Z]:", normalized):
                    flags.append("absolute_path")
                if ".." in PurePosixPath(normalized).parts:
                    flags.append("parent_traversal")
                if any(ord(character) < 32 or ord(character) == 127 for character in entry.filename):
                    flags.append("control_character_in_name")
                if stat.S_ISLNK(entry.external_attr >> 16):
                    flags.append("symlink")
                if canonical in names:
                    flags.append("duplicate_normalized_name")
                if entry.flag_bits & 1:
                    flags.append("encrypted")
                if entry.file_size > MAX_DECLARED_ENTRY_BYTES:
                    flags.append("large_declared_entry")
                if entry.file_size > 10 * 1024**2 and entry.file_size / max(entry.compress_size, 1) > 1000:
                    flags.append("high_declared_compression_ratio")
                names.add(canonical)
                expanded_total += entry.file_size
                records.append({
                    "name": entry.filename,
                    "compressed_bytes": entry.compress_size,
                    "uncompressed_bytes": entry.file_size,
                    "directory": entry.is_dir(),
                    "compression_method": entry.compress_type,
                    "flags": flags,
                })
        assert_unchanged(stream, before)
    return {
        "sha256": digest.hexdigest(),
        "bytes": total,
        "entry_count": len(records),
        "declared_uncompressed_bytes": expanded_total,
        "flags": ["large_declared_total"] if expanded_total > MAX_DECLARED_TOTAL_BYTES else [],
        "entries": records,
        "notes": ["Central-directory metadata only; archive members were never extracted or decompressed.",
                  "Member contents, CRCs, dates, calculations, and historical records remain unverified."],
    }


def write_private_inventory(path: Path, inventory: dict):
    parent = parent_fd(path)
    directory = None
    try:
        try:
            os.mkdir(path.name, mode=0o700, dir_fd=parent)
        except FileExistsError:
            pass
        directory = os.open(path.name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=parent)
        metadata = os.fstat(directory)
        if stat.S_IMODE(metadata.st_mode) != 0o700 or metadata.st_uid != os.getuid():
            raise InspectionError("Existing output directory must be owned by this user with mode 0700.")
        descriptor = os.open(
            "inventory.json", os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=directory
        )
        try:
            with os.fdopen(descriptor, "w", encoding="utf-8") as output:
                json.dump(inventory, output, indent=2, ensure_ascii=True)
                output.write("\n")
                output.flush()
                os.fsync(output.fileno())
        except Exception:
            os.unlink("inventory.json", dir_fd=directory)
            raise
    finally:
        if directory is not None:
            os.close(directory)
        os.close(parent)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html", help="Original HTML outside the checkout (optional if --archive is supplied)")
    parser.add_argument("--archive", help="Original ZIP outside the checkout (optional if --html is supplied)")
    parser.add_argument("--output", required=True, help="External private output directory; inventory.json must not exist")
    arguments = parser.parse_args(argv)
    if not arguments.html and not arguments.archive:
        parser.error("at least one of --html or --archive is required")
    try:
        output = external_path(arguments.output)
        sources = {}
        if arguments.html:
            sources["html"] = inspect_html(external_path(arguments.html))
        if arguments.archive:
            sources["archive"] = inspect_archive(external_path(arguments.archive))
        inventory = {
            "schema_version": 1,
            "created_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "private": True,
            "status": "inventory_only_not_a_migration",
            "sources": sources,
        }
        write_private_inventory(output, inventory)
    except InspectionError as error:
        print(str(error), file=sys.stderr)
        return 2
    except FileExistsError:
        print("Inventory already exists; choose a new private output directory.", file=sys.stderr)
        return 2
    except Exception:
        # Malformed source metadata must not cause a traceback that could
        # include private paths, filenames, or source content.
        print("Inspection failed: check external file access, path safety, and source format. No source was modified.", file=sys.stderr)
        return 2
    print("Private inventory written. Source files were not modified, extracted, or executed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

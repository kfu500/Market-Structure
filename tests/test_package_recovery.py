"""Synthetic-only content-addressed packaging and transport checks."""
import contextlib
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import shutil
import tempfile
import unittest
from unittest import mock
import zipfile

SPEC = importlib.util.spec_from_file_location("package_recovery", Path(__file__).resolve().parents[1] / "scripts" / "package-recovery.py")
PACKAGE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PACKAGE)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


class RecoveryPackageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="synthetic-recovery-package-", dir="/tmp")
        self.root = Path(self.temp.name)
        self.source = self.root / "source"
        self.source.mkdir(mode=0o700)
        (self.source / "originals").mkdir()
        (self.source / "private").mkdir()
        (self.source / "empty").mkdir()
        payload = b"Synthetic original bytes\x00\xff\n" * 40
        (self.source / "originals" / "source.dat").write_bytes(payload)
        (self.source / "private" / "same-data.dat").write_bytes(payload)
        (self.source / "private" / "invented.json").write_text('{"synthetic":true,"label":"Invented private observation"}\n')
        (self.source / "private" / "empty.dat").write_bytes(b"")
        self.output = self.root / "package"

    def tearDown(self):
        self.temp.cleanup()

    def create(self, part_bytes=256):
        return PACKAGE.create_package(self.source, self.output, part_bytes=part_bytes)

    def joined(self):
        outer = json.loads((self.output / "recovery-parts.json").read_text())
        return b"".join((self.output / item["file"]).read_bytes() for item in outer["parts"])

    def replace_zip(self, change):
        original = self.joined()
        target = io.BytesIO()
        with zipfile.ZipFile(io.BytesIO(original)) as source, zipfile.ZipFile(target, "w") as output:
            for info in source.infolist():
                raw = source.read(info)
                replacement = change(info.filename, raw)
                if replacement is not None:
                    output.writestr(PACKAGE.zip_info(info.filename), replacement)
        raw = target.getvalue()
        outer = json.loads((self.output / "recovery-parts.json").read_text())
        for part in outer["parts"]:
            (self.output / part["file"]).unlink()
        parts = []
        for i, start in enumerate(range(0, len(raw), 256), 1):
            block = raw[start:start + 256]
            name = f"recovery.part-{i:03}"
            (self.output / name).write_bytes(block)
            parts.append({"file": name, "size": len(block), "sha256": sha(block)})
        outer.update({"archive": {"file": "recovery.zip", "size": len(raw), "sha256": sha(raw)}, "partBytes": 256, "parts": parts})
        (self.output / "recovery-parts.json").write_text(json.dumps(outer))

    def test_roundtrip_deduplicates_bytes_preserves_paths_and_verifies_joined_parts(self):
        before = {p.relative_to(self.source).as_posix(): (p.read_bytes(), p.stat().st_mtime_ns) for p in self.source.rglob("*") if p.is_file()}
        result = self.create()
        self.assertTrue(result["originalsUnchanged"])
        self.assertEqual(result["files"], 4)
        self.assertEqual(result["uniqueBlobs"], 3)
        self.assertEqual(result["deduplicatedBytes"], len(before["originals/source.dat"][0]))
        self.assertGreater(result["parts"], 1)
        self.assertEqual(PACKAGE.verify_package(self.output)["archiveSha256"], result["archiveSha256"])
        outer = json.loads((self.output / "recovery-parts.json").read_text())
        for part in outer["parts"]:
            raw = (self.output / part["file"]).read_bytes()
            self.assertLess(len(raw), 32 * 1024**2)
            self.assertEqual(sha(raw), part["sha256"])
        joined = self.joined()
        self.assertEqual(sha(joined), outer["archive"]["sha256"])
        with zipfile.ZipFile(io.BytesIO(joined)) as archive:
            manifest = json.loads(archive.read("recovery-manifest.json"))
            self.assertIn("empty", manifest["directories"])
            self.assertEqual(len(archive.infolist()), 4)
            for item in manifest["files"]:
                data, modified = before[item["path"]]
                self.assertEqual(archive.read(f'blobs/{item["sha256"]}'), data)
                self.assertEqual(item["mtimeNs"], str(modified))
                self.assertEqual((self.source / item["path"]).read_bytes(), data)
                self.assertEqual((self.source / item["path"]).stat().st_mtime_ns, modified)
            for entry in archive.infolist():
                self.assertEqual(entry.compress_type, 8)
                self.assertEqual(entry.flag_bits, 0)
                self.assertEqual(entry.extra, b"")
                self.assertEqual(stat.S_IMODE(entry.external_attr >> 16), 0o600)
        self.assertEqual(stat.S_IMODE(self.output.stat().st_mode), 0o700)
        for file in self.output.iterdir():
            self.assertEqual(stat.S_IMODE(file.stat().st_mode), 0o600)
            self.assertFalse(file.name.endswith(".zip"))

    def test_real_chunk_bound_splits_at_30_mib_with_streaming_verification(self):
        # Incompressible invented bytes exercise the actual download threshold.
        (self.source / "synthetic-random.dat").write_bytes(os.urandom(PACKAGE.PART_BYTES + 1024))
        result = PACKAGE.create_package(self.source, self.output)
        self.assertEqual(result["parts"], 2)
        outer = json.loads((self.output / "recovery-parts.json").read_text())
        self.assertEqual(outer["partBytes"], 30 * 1024**2)
        self.assertEqual(outer["parts"][0]["size"], 30 * 1024**2)
        self.assertLess(outer["parts"][1]["size"], 32 * 1024**2)

    def test_corrupt_missing_reordered_or_forged_transport_parts_fail(self):
        self.create()
        first = self.output / "recovery.part-001"
        original = first.read_bytes()
        first.write_bytes(bytes([original[0] ^ 1]) + original[1:])
        with self.assertRaisesRegex(PACKAGE.PackageError, "SHA-256"):
            PACKAGE.verify_package(self.output)
        first.write_bytes(original)
        outer_path = self.output / "recovery-parts.json"
        valid = outer_path.read_text()
        outer = json.loads(valid)
        outer["parts"].reverse()
        outer_path.write_text(json.dumps(outer))
        with self.assertRaises(PACKAGE.PackageError):
            PACKAGE.verify_package(self.output)
        outer = json.loads(valid)
        outer["archive"]["sha256"] = "0" * 64
        outer_path.write_text(json.dumps(outer))
        with self.assertRaisesRegex(PACKAGE.PackageError, "fingerprint"):
            PACKAGE.verify_package(self.output)
        outer_path.write_text(valid)
        first.unlink()
        with self.assertRaises(FileNotFoundError):
            PACKAGE.verify_package(self.output)

    def test_forged_outer_hashes_cannot_hide_a_changed_blob_or_manifest_inventory(self):
        self.create()
        self.replace_zip(lambda name, raw: b"x" * len(raw) if name.startswith("blobs/") and raw else raw)
        with self.assertRaisesRegex(PACKAGE.PackageError, "blob failed"):
            PACKAGE.verify_package(self.output)
        shutil.rmtree(self.output)
        self.create()
        self.replace_zip(lambda name, raw: None if name.startswith("blobs/") else raw)
        with self.assertRaisesRegex(PACKAGE.PackageError, "inventory"):
            PACKAGE.verify_package(self.output)

    def test_windows_unsafe_names_collisions_and_traversal_are_rejected(self):
        unsafe = ["../escape", "/absolute", "x\\y", ".GIT/config", "CON", "con.txt", "LPT1.log", "COM¹.dat", "NUL", "tail.", "tail ", "bad:name", "a?b", "a\x01b"]
        for name in unsafe:
            with self.subTest(name=name), self.assertRaises(PACKAGE.BACKUP.BackupError):
                PACKAGE.logical_path(name)
        with self.assertRaises(PACKAGE.PackageError):
            PACKAGE.check_paths({"Report.txt": {}, "report.txt": {}}, {""})
        for name in ("CON .txt", "NUL  .json", "LPT1 .log", "CONIN$.txt", "CONOUT$", "private/\ud800.txt", "private/\udfff.txt", "e\u0301.txt", "a" * 241, "é" * 128):
            with self.subTest(name=repr(name)), self.assertRaises(PACKAGE.PackageError):
                PACKAGE.logical_path(name)
        for name in ("private/é.txt", "private/😀.txt", "private/console.txt"):
            self.assertEqual(PACKAGE.logical_path(name), name)
        with self.assertRaises(PACKAGE.PackageError):
            PACKAGE.check_paths({"private/straße.txt": {}, "private/STRASSE.txt": {}}, {"", "private"})
        (self.source / "private" / "Case.txt").write_text("Synthetic case one")
        (self.source / "private" / "case.txt").write_text("Synthetic case two")
        with self.assertRaises(PACKAGE.PackageError):
            self.create()
        self.assertFalse(self.output.exists())

    def test_manifest_unsafe_paths_are_rejected_after_valid_transport_checks(self):
        self.create()
        def unsafe(name, raw):
            if name == "recovery-manifest.json":
                data = json.loads(raw)
                data["files"][0]["path"] = "../escape"
                return json.dumps(data).encode()
            return raw
        self.replace_zip(unsafe)
        with self.assertRaises(PACKAGE.BACKUP.BackupError):
            PACKAGE.verify_package(self.output)

    def test_existing_output_nested_output_git_and_symlink_paths_are_rejected(self):
        self.output.mkdir()
        (self.output / "keep.txt").write_text("Synthetic existing file")
        with self.assertRaises(FileExistsError):
            self.create()
        self.assertEqual((self.output / "keep.txt").read_text(), "Synthetic existing file")
        with self.assertRaises(PACKAGE.BACKUP.BackupError):
            PACKAGE.create_package(self.source, self.source / "nested")
        with self.assertRaises(PACKAGE.BACKUP.BackupError):
            PACKAGE.create_package(self.source, PACKAGE.BACKUP.REPOSITORY / "forbidden-package")
        (self.source / "source-link").symlink_to(self.source / "private" / "invented.json")
        with self.assertRaises(PACKAGE.BACKUP.BackupError):
            PACKAGE.create_package(self.source, self.root / "different-output")

    def test_source_mutation_aborts_without_modifying_source_or_leaving_package(self):
        original_hash = PACKAGE.hash_source
        changed = False
        def changing(path, expected):
            nonlocal changed
            digest = original_hash(path, expected)
            if not changed:
                changed = True
                path.write_bytes(path.read_bytes() + b"Synthetic concurrent revision")
            return digest
        with mock.patch.object(PACKAGE, "hash_source", changing), self.assertRaises(PACKAGE.BACKUP.BackupError):
            self.create()
        self.assertFalse(self.output.exists())

    def derivation_fixture(self, *, unsafe=False, wrong_bytes=False):
        archive_name = "originals/synthetic-source.zip"
        archive_path = self.source / archive_name
        payload = (self.source / "originals" / "source.dat").read_bytes()
        with zipfile.ZipFile(archive_path, "w") as archive:
            archive.comment = b"Synthetic original ZIP comment remains byte-exact"
            archive.writestr("data/", b"")
            info = PACKAGE.zip_info("data/synthetic-source.dat")
            info.extra = b"\xfe\xca\x00\x00"  # Bounded benign original ZIP extra field.
            archive.writestr(info, b"Synthetic wrong content" if wrong_bytes else payload)
            if unsafe:
                archive.writestr("../unsafe", b"Synthetic unsafe member")
        mapping = self.root / "synthetic-derivations.json"
        mapping.write_text(json.dumps({
            "originals/source.dat": {"archive": archive_name, "member": "data/synthetic-source.dat"},
            "private/same-data.dat": {"archive": archive_name, "member": "data/synthetic-source.dat"},
        }))
        return mapping, archive_path, payload

    def test_derived_targets_reuse_original_zip_without_storing_duplicate_database_blob(self):
        mapping, original_zip, payload = self.derivation_fixture()
        original_bytes = original_zip.read_bytes()
        full = PACKAGE.create_package(self.source, self.root / "full-package", part_bytes=256)
        result = PACKAGE.create_package(self.source, self.output, part_bytes=256, derive_from_zip=mapping)
        self.assertEqual(result["files"], full["files"])
        self.assertEqual(result["uniqueBytes"] + len(payload), full["uniqueBytes"])
        self.assertEqual(result["logicalBytes"], full["logicalBytes"])
        with zipfile.ZipFile(io.BytesIO(self.joined())) as archive:
            manifest = json.loads(archive.read("recovery-manifest.json"))
            self.assertEqual(len(manifest["derivedFiles"]), 2)
            self.assertNotIn(f"blobs/{sha(payload)}", archive.namelist())
            original = next(row for row in manifest["files"] if row["path"] == "originals/synthetic-source.zip")
            self.assertEqual(archive.read(f"blobs/{original['sha256']}"), original_bytes)
            for row in manifest["derivedFiles"]:
                self.assertEqual(row["sha256"], sha(payload))
                self.assertEqual(row["size"], len(payload))
        self.assertEqual(PACKAGE.verify_package(self.output)["files"], 5)
        self.assertEqual(original_zip.read_bytes(), original_bytes)

    def test_derived_wrong_bytes_unsafe_member_and_chains_fail_before_publication(self):
        mapping, archive, _ = self.derivation_fixture(wrong_bytes=True)
        with self.assertRaises(PACKAGE.PackageError):
            PACKAGE.create_package(self.source, self.output, derive_from_zip=mapping)
        self.assertFalse(self.output.exists())
        mapping, archive, _ = self.derivation_fixture(unsafe=True)
        with self.assertRaises(PACKAGE.BACKUP.BackupError):
            PACKAGE.create_package(self.source, self.output, derive_from_zip=mapping)
        self.assertFalse(self.output.exists())
        mapping, archive, _ = self.derivation_fixture()
        data = json.loads(mapping.read_text())
        data["originals/synthetic-source.zip"] = {"archive": "originals/source.dat", "member": "data/synthetic-source.dat"}
        mapping.write_text(json.dumps(data))
        with self.assertRaisesRegex(PACKAGE.PackageError, "chains"):
            PACKAGE.create_package(self.source, self.output, derive_from_zip=mapping)
        self.assertFalse(self.output.exists())

    def test_derived_manifest_must_match_original_member_even_after_transport_rehash(self):
        mapping, _, _ = self.derivation_fixture()
        PACKAGE.create_package(self.source, self.output, part_bytes=256, derive_from_zip=mapping)
        def corrupt(name, raw):
            if name == "recovery-manifest.json":
                manifest = json.loads(raw)
                manifest["derivedFiles"][0]["sha256"] = "0" * 64
                return json.dumps(manifest).encode()
            return raw
        self.replace_zip(corrupt)
        with self.assertRaisesRegex(PACKAGE.PackageError, "Derived file SHA-256"):
            PACKAGE.verify_package(self.output)

    def test_metadata_size_limits_and_cli_privacy(self):
        with mock.patch.object(PACKAGE, "MAX_UNIQUE_BYTES", 1), self.assertRaises(PACKAGE.BACKUP.BackupError):
            self.create()
        self.assertFalse(self.output.exists())
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            result = PACKAGE.main(["create", "--source", str(self.source), "--output-dir", str(self.output)])
        self.assertEqual(result, 0, stderr.getvalue())
        self.assertNotIn(str(self.source), stdout.getvalue())
        self.assertNotIn("invented.json", stdout.getvalue())
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            result = PACKAGE.main(["verify", "--directory", str(self.root / "private-missing-directory")])
        self.assertEqual(result, 2)
        self.assertNotIn("private-missing-directory", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()

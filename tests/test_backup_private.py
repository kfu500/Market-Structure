"""Synthetic-only checks for private backups and safe recovery."""
import contextlib
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import sqlite3
import stat
import tarfile
import tempfile
import unittest
from unittest import mock

SPEC = importlib.util.spec_from_file_location("backup_private", Path(__file__).resolve().parents[1] / "scripts" / "backup-private.py")
BACKUP = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BACKUP)


def sha(data):
    return hashlib.sha256(data).hexdigest()


class PrivateBackupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="synthetic-private-backup-", dir="/tmp")
        self.directory = Path(self.temp.name)
        self.source = self.directory / "source"
        self.source.mkdir(mode=0o700)
        (self.source / "originals").mkdir(mode=0o700)
        (self.source / "empty").mkdir(mode=0o700)
        (self.source / "originals" / "synthetic report.txt").write_bytes(b"SYNTHETIC PRIVATE REPORT\n\x00exact bytes")
        (self.source / "synthetic-notes.json").write_text('{"synthetic":true,"comment":"Invented test commentary"}\n')
        self.archive = self.directory / "synthetic-backup.tar.gz"

    def tearDown(self):
        self.temp.cleanup()

    def runtime(self):
        runtime = self.source / "runtime"
        release = runtime / "releases" / "synthetic-release"
        release.mkdir(parents=True)
        database = release / "database.sqlite"
        db = sqlite3.connect(database)
        db.execute("CREATE TABLE synthetic(value TEXT)")
        db.execute("INSERT INTO synthetic VALUES ('Invented value')")
        db.commit()
        db.close()
        shell, css = b"<p>Synthetic private shell</p>", b"p { color: navy; }"
        (release / "shell.html").write_bytes(shell)
        (release / "styles.css").write_bytes(css)
        ui = {"schemaVersion": 1, "modules": [], "shellSha256": sha(shell), "stylesSha256": sha(css)}
        ui_bytes = json.dumps(ui).encode()
        (release / "ui-content.json").write_bytes(ui_bytes)
        manifest = {"schemaVersion": 1, "format": "legacy-sqlite", "database": "releases/synthetic-release/database.sqlite",
                    "presentation": "releases/synthetic-release/ui-content.json", "databaseSha256": sha(database.read_bytes()),
                    "presentationSha256": sha(ui_bytes)}
        (runtime / "legacy.json").write_text(json.dumps(manifest))
        return runtime, database

    def rewrite_archive(self, changes=None, append=None):
        """Create a deliberately damaged synthetic archive without touching originals."""
        target = self.directory / "synthetic-modified.tar.gz"
        with tarfile.open(self.archive, "r:gz") as source, tarfile.open(target, "w:gz") as output:
            for item in source:
                data = source.extractfile(item).read() if item.isfile() else None
                if changes:
                    item, data = changes(item, data)
                if item is not None:
                    output.addfile(item, io.BytesIO(data) if data is not None else None)
            if append:
                append(output)
        return target

    def test_complete_roundtrip_preserves_bytes_originals_hashes_and_empty_directories(self):
        runtime, _ = self.runtime()
        before = {p.relative_to(self.source): (p.read_bytes(), p.stat().st_mtime_ns) for p in self.source.rglob("*") if p.is_file()}
        created = BACKUP.create_backup(self.source, self.archive, runtime)
        self.assertFalse(created["durableOffMachine"])
        self.assertTrue(created["runtimeValidated"])
        self.assertEqual(created["archiveSha256"], sha(self.archive.read_bytes()))
        self.assertEqual(stat.S_IMODE(self.archive.stat().st_mode), 0o600)
        self.assertEqual(BACKUP.verify_backup(self.archive)["integrity"], "sha256-verified")
        restored = self.directory / "restored"
        result = BACKUP.verify_backup(self.archive, restored)
        self.assertTrue(result["runtimeValidated"])
        self.assertEqual(result["files"], len(before))
        self.assertTrue((restored / "empty").is_dir())
        for rel, (data, modified) in before.items():
            self.assertEqual((self.source / rel).read_bytes(), data)
            self.assertEqual((self.source / rel).stat().st_mtime_ns, modified)
            self.assertEqual((restored / rel).read_bytes(), data)
            self.assertEqual((restored / rel).stat().st_mtime_ns, modified)
        for entry in [restored, *restored.rglob("*")]:
            self.assertEqual(stat.S_IMODE(entry.stat().st_mode), 0o700 if entry.is_dir() else 0o600)

    def test_existing_destinations_and_inside_source_archives_are_not_overwritten(self):
        self.archive.write_bytes(b"Synthetic existing archive")
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(self.source, self.archive)
        self.assertEqual(self.archive.read_bytes(), b"Synthetic existing archive")
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(self.source, self.source / "nested.tar.gz")
        self.archive.unlink()
        BACKUP.create_backup(self.source, self.archive)
        restored = self.directory / "existing"
        restored.mkdir()
        (restored / "keep").write_text("Synthetic user file")
        with self.assertRaises(FileExistsError):
            BACKUP.verify_backup(self.archive, restored)
        self.assertEqual((restored / "keep").read_text(), "Synthetic user file")

    def test_repository_inputs_outputs_nested_git_and_symlink_aliases_are_rejected(self):
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(self.source, BACKUP.REPOSITORY / "forbidden.tar.gz")
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(BACKUP.REPOSITORY, self.archive)
        alias = self.directory / "alias"
        alias.symlink_to(self.source, target_is_directory=True)
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(alias, self.archive)
        (self.source / "nested").mkdir()
        (self.source / "nested" / ".git").mkdir()
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(self.source, self.archive)
        other_checkout = self.directory / "other-checkout"
        other_checkout.mkdir()
        (other_checkout / ".git").symlink_to(BACKUP.REPOSITORY / ".git")
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.external_path(other_checkout / "archive.tar.gz")

    def test_symlinks_fifos_and_resource_limits_are_rejected(self):
        bad = self.source / "synthetic-link"
        bad.symlink_to(self.source / "synthetic-notes.json")
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(self.source, self.archive)
        bad.unlink()
        os.mkfifo(bad)
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(self.source, self.archive)
        bad.unlink()
        for name, value in (("MAX_FILE_BYTES", 1), ("MAX_TOTAL_BYTES", 1), ("MAX_ENTRIES", 1)):
            with mock.patch.object(BACKUP, name, value), self.assertRaises(BACKUP.BackupError):
                BACKUP.create_backup(self.source, self.archive)
        self.assertFalse(self.archive.exists())

    def test_mutating_source_or_tree_fails_without_publishing_partial_archive(self):
        original_read = BACKUP.HashingReader.read
        changed = False

        def changing(reader, size):
            nonlocal changed
            data = original_read(reader, size)
            if not changed:
                changed = True
                (self.source / "new-synthetic-file").write_text("Synthetic concurrent writer")
            return data

        with mock.patch.object(BACKUP.HashingReader, "read", changing), self.assertRaisesRegex(BACKUP.BackupError, "changed"):
            BACKUP.create_backup(self.source, self.archive)
        self.assertFalse(self.archive.exists())
        self.assertFalse(list(self.directory.glob(".private-backup-*.tmp")))

    def test_file_mutation_and_unreadable_directory_cannot_make_an_incomplete_backup(self):
        original_read = BACKUP.HashingReader.read
        changed = False

        def changing(reader, size):
            nonlocal changed
            data = original_read(reader, size)
            if not changed:
                changed = True
                target = self.source / "originals" / "synthetic report.txt"
                target.write_bytes(target.read_bytes() + b"synthetic concurrent revision")
            return data

        with mock.patch.object(BACKUP.HashingReader, "read", changing), self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(self.source, self.archive)
        self.assertFalse(self.archive.exists())

        def unreadable(*args, **kwargs):
            kwargs["onerror"](PermissionError("Synthetic private filename must not be printed"))
            return iter(())

        with mock.patch.object(BACKUP.os, "walk", unreadable), self.assertRaisesRegex(BACKUP.BackupError, "enumerated"):
            BACKUP.create_backup(self.source, self.archive)
        self.assertFalse(self.archive.exists())

    def test_hash_damage_is_rejected_and_failed_restore_is_removed(self):
        BACKUP.create_backup(self.source, self.archive)

        def damage(item, data):
            if item.name.endswith("synthetic-notes.json"):
                data = b"x" * len(data)
            return item, data

        corrupted = self.rewrite_archive(damage)
        restored = self.directory / "failed-restore"
        with self.assertRaisesRegex(BACKUP.BackupError, "SHA-256"):
            BACKUP.verify_backup(corrupted, restored)
        self.assertFalse(restored.exists())
        truncated = self.directory / "truncated.tar.gz"
        truncated.write_bytes(self.archive.read_bytes()[:-7])
        with self.assertRaises((EOFError, tarfile.TarError, BACKUP.BackupError)):
            BACKUP.verify_backup(truncated)

    def test_traversal_links_duplicate_paths_and_missing_manifest_are_rejected(self):
        BACKUP.create_backup(self.source, self.archive)
        for unsafe in ("payload/../escape", "/absolute", "payload/a\\escape", "payload/.git/config"):
            def rename(item, data):
                if item.name.endswith("synthetic-notes.json"):
                    item.name = unsafe
                return item, data
            with self.assertRaises(BACKUP.BackupError):
                BACKUP.verify_backup(self.rewrite_archive(rename), self.directory / "never-restored")
            self.assertFalse((self.directory / "never-restored").exists())
        for kind in (tarfile.SYMTYPE, tarfile.LNKTYPE):
            def link(item, data):
                if item.name.endswith("synthetic-notes.json"):
                    item.type, item.linkname, item.size, data = kind, "../../escape", 0, None
                return item, data
            with self.assertRaises(BACKUP.BackupError):
                BACKUP.verify_backup(self.rewrite_archive(link))
        def duplicate(item, data):
            if item.name.endswith("synthetic-notes.json"):
                item.name = "payload/originals/synthetic report.txt"
            return item, data
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.verify_backup(self.rewrite_archive(duplicate))
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.verify_backup(self.rewrite_archive(lambda item, data: (None, None) if item.name == "backup-manifest.json" else (item, data)))

    def test_runtime_validation_rejects_changed_digest_active_wal_and_external_runtime(self):
        runtime, database = self.runtime()
        with self.assertRaises(BACKUP.BackupError):
            BACKUP.create_backup(self.source, self.archive, self.directory)
        db = sqlite3.connect(database)
        try:
            db.execute("PRAGMA journal_mode=WAL")
            db.execute("UPDATE synthetic SET value='Synthetic committed WAL change'")
            db.commit()
            with self.assertRaisesRegex(BACKUP.BackupError, "journal"):
                BACKUP.create_backup(self.source, self.archive, runtime)
        finally:
            db.close()
        with self.assertRaisesRegex(BACKUP.BackupError, "hash"):
            BACKUP.create_backup(self.source, self.archive, runtime)
        self.assertFalse(self.archive.exists())

    def test_cli_reports_only_counts_and_generic_failures(self):
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            result = BACKUP.main(["create", "--source", str(self.source), "--archive", str(self.archive)])
        self.assertEqual(result, 0, stderr.getvalue())
        self.assertNotIn("synthetic report", stdout.getvalue())
        self.assertNotIn(str(self.source), stdout.getvalue())
        self.assertIn("Off-machine durability", stdout.getvalue())
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            result = BACKUP.main(["verify", "--archive", str(self.directory / "private-missing-filename.tar.gz")])
        self.assertEqual(result, 2)
        self.assertNotIn("private-missing-filename", stderr.getvalue())
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            result = BACKUP.main(["verify", "--archive", str(self.archive), "--unexpected", "SYNTHETIC_PRIVATE_ARGUMENT"])
        self.assertEqual(result, 2)
        self.assertNotIn("SYNTHETIC_PRIVATE_ARGUMENT", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()

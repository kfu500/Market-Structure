"""Synthetic-only privacy and resource-boundary tests for source inventory."""

import contextlib
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest import mock
import warnings
import zipfile


SPEC = importlib.util.spec_from_file_location(
    "inspect_sources", Path(__file__).resolve().parents[1] / "scripts" / "inspect-sources.py"
)
INSPECT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(INSPECT)


class SourceInspectionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="synthetic-portal-inventory-", dir="/tmp")
        self.directory = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def run_inspection(self, *args):
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            result = INSPECT.main(list(map(str, args)))
        return result, stdout.getvalue(), stderr.getvalue()

    def test_inventory_preserves_sources_and_never_extracts_or_executes(self):
        html = self.directory / "sensitive-synthetic-source.html"
        payload = ("<!-- <script>not a script</script> -->"
                   "<script type='application/json'>{\"synthetic\": 1}</script>"
                   "<script>throw new Error('do not run'); new Blob(['synthetic']); "
                   "URL.createObjectURL(synthetic); const image='data:image/png;base64,AA==';</script>"
                   "<script src='https://example.invalid/never-request.js'></script>")
        html.write_text(payload)
        archive = self.directory / "sensitive-synthetic-archive.zip"
        with zipfile.ZipFile(archive, "w") as output:
            output.writestr("private/research.txt", "SYNTHETIC TEST CONTENT ONLY")
        original_bytes = {path: path.read_bytes() for path in (html, archive)}
        original_stats = {path: path.stat() for path in (html, archive)}
        target = self.directory / "inventory"
        result, stdout, stderr = self.run_inspection("--html", html, "--archive", archive, "--output", target)
        self.assertEqual(result, 0, stderr)
        self.assertNotIn("sensitive", stdout + stderr)
        self.assertNotIn("research", stdout + stderr)
        self.assertFalse((self.directory / "private").exists())
        inventory = json.loads((target / "inventory.json").read_text())
        self.assertEqual(inventory["status"], "inventory_only_not_a_migration")
        self.assertEqual(stat.S_IMODE(target.stat().st_mode), 0o700)
        self.assertEqual(stat.S_IMODE((target / "inventory.json").stat().st_mode), 0o600)
        sources = inventory["sources"]
        self.assertEqual(sources["html"]["inline_script_count"], 2)
        self.assertEqual(sources["html"]["json_script_count"], 1)
        self.assertEqual(sources["html"]["scripts"][0]["body_utf8_bytes"], len('{"synthetic": 1}'))
        self.assertTrue(all(script["closed"] for script in sources["html"]["scripts"]))
        self.assertEqual(sources["html"]["embedded_markers"], {
            "data_uri_markers": 1, "blob_constructor_markers": 1, "create_object_url_markers": 1,
        })
        self.assertEqual(sources["archive"]["entries"][0]["name"], "private/research.txt")
        for key, path in (("html", html), ("archive", archive)):
            self.assertEqual(path.read_bytes(), original_bytes[path])
            self.assertEqual(path.stat().st_mtime_ns, original_stats[path].st_mtime_ns)
            self.assertEqual(sources[key]["sha256"], hashlib.sha256(original_bytes[path]).hexdigest())

    def test_traversal_symlinks_and_duplicate_archive_entries_are_flagged(self):
        archive = self.directory / "malicious-synthetic.zip"
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(archive, "w") as output:
                for name in ("../escape.txt", "/absolute.txt", "C:\\outside.txt", "duplicate.txt", "./duplicate.txt"):
                    output.writestr(name, "synthetic")
                link = zipfile.ZipInfo("synthetic-link")
                link.create_system = 3
                link.external_attr = (stat.S_IFLNK | 0o777) << 16
                output.writestr(link, "../escape.txt")
        report = INSPECT.inspect_archive(archive)
        entries = {entry["name"]: entry for entry in report["entries"]}
        self.assertIn("parent_traversal", entries["../escape.txt"]["flags"])
        self.assertIn("absolute_path", entries["/absolute.txt"]["flags"])
        self.assertIn("absolute_path", entries["C:\\outside.txt"]["flags"])
        self.assertIn("duplicate_normalized_name", entries["./duplicate.txt"]["flags"])
        self.assertIn("symlink", entries["synthetic-link"]["flags"])
        self.assertEqual(list(self.directory.iterdir()), [archive])

    def test_output_must_be_private_and_existing_inventory_is_preserved(self):
        html = self.directory / "source.html"
        html.write_text("<p>synthetic</p>")
        target = self.directory / "existing"
        target.mkdir(mode=0o755)
        target.chmod(0o755)
        result, _, _ = self.run_inspection("--html", html, "--output", target)
        self.assertEqual(result, 2)
        self.assertFalse((target / "inventory.json").exists())
        target.chmod(0o700)
        existing = target / "inventory.json"
        existing.write_text("preserve existing user file")
        result, _, _ = self.run_inspection("--html", html, "--output", target)
        self.assertEqual(result, 2)
        self.assertEqual(existing.read_text(), "preserve existing user file")

    def test_symlink_sources_parents_and_outputs_are_rejected(self):
        html = self.directory / "source.html"
        html.write_text("synthetic")
        alias = self.directory / "alias.html"
        alias.symlink_to(html)
        result, _, _ = self.run_inspection("--html", alias, "--output", self.directory / "output")
        self.assertEqual(result, 2)
        parent_alias = self.directory / "parent-alias"
        parent_alias.symlink_to(self.directory, target_is_directory=True)
        result, _, _ = self.run_inspection("--html", parent_alias / "source.html", "--output", self.directory / "output")
        self.assertEqual(result, 2)
        result, _, _ = self.run_inspection("--html", html, "--output", parent_alias / "output")
        self.assertEqual(result, 2)
        self.assertFalse((self.directory / "output").exists())

    def test_repository_paths_are_rejected_without_creating_files(self):
        with self.assertRaises(INSPECT.InspectionError):
            INSPECT.external_path(str(INSPECT.REPOSITORY / "never-created-private-file.html"))
        alias = self.directory / "checkout-alias"
        alias.symlink_to(INSPECT.REPOSITORY, target_is_directory=True)
        with self.assertRaises(INSPECT.InspectionError):
            INSPECT.external_path(str(alias / "never-created-private-file.html"))

    def test_other_git_checkouts_are_rejected_but_placeholder_directories_are_allowed(self):
        checkout = self.directory / "other-checkout"
        git = checkout / ".git"
        git.mkdir(parents=True)
        # An inert mount named .git alone does not establish a repository.
        self.assertEqual(INSPECT.external_path(str(checkout / "source.html")), checkout / "source.html")
        (git / "HEAD").write_text("ref: refs/heads/synthetic\n")
        with self.assertRaises(INSPECT.InspectionError):
            INSPECT.external_path(str(checkout / "source.html"))
        with self.assertRaises(INSPECT.InspectionError):
            INSPECT.external_path(str(checkout / "output"))
        pointer_checkout = self.directory / "pointer-checkout"
        pointer_checkout.mkdir()
        (pointer_checkout / ".git").write_text("gitdir: synthetic-placeholder\n")
        with self.assertRaises(INSPECT.InspectionError):
            INSPECT.external_path(str(pointer_checkout / "source.html"))

    def test_nonregular_source_is_rejected_without_blocking(self):
        fifo = self.directory / "synthetic-fifo"
        os.mkfifo(fifo)
        result, _, _ = self.run_inspection("--html", fifo, "--output", self.directory / "output")
        self.assertEqual(result, 2)
        self.assertFalse((self.directory / "output").exists())

    def test_streaming_scripts_and_markers_cross_chunk_boundaries(self):
        html = self.directory / "large-synthetic.html"
        body = "x" * (INSPECT.CHUNK * 4) + " const comparison = 1 < 2; " + "y" * (INSPECT.CHUNK * 2)
        html.write_text("<script>" + body + "</script>")
        inventory = INSPECT.inspect_html(html)
        self.assertEqual(inventory["scripts"][0]["body_utf8_bytes"], len(body))
        self.assertTrue(inventory["scripts"][0]["closed"])
        markers = INSPECT.MarkerCounter()
        for chunk in (b"data:ima", b"ge/png new Bl", b"ob( URL.createObject", b"URL( data:image/png"):
            markers.feed(chunk)
        self.assertEqual(markers.counts, {
            "data_uri_markers": 2, "blob_constructor_markers": 1, "create_object_url_markers": 1,
        })

    def test_unclosed_script_is_marked_and_counted(self):
        html = self.directory / "unclosed.html"
        html.write_text("<script>synthetic < unmatched")
        script = INSPECT.inspect_html(html)["scripts"][0]
        self.assertFalse(script["closed"])
        self.assertEqual(script["body_utf8_bytes"], len("synthetic < unmatched"))

    def test_limits_and_invalid_archive_fail_without_output(self):
        html = self.directory / "oversized.html"
        html.write_text("synthetic")
        with mock.patch.object(INSPECT, "MAX_HTML_BYTES", 4):
            result, _, _ = self.run_inspection("--html", html, "--output", self.directory / "output")
        self.assertEqual(result, 2)
        archive = self.directory / "malformed.zip"
        archive.write_bytes(b"not a ZIP")
        result, stdout, stderr = self.run_inspection("--archive", archive, "--output", self.directory / "output")
        self.assertEqual(result, 2)
        self.assertNotIn("malformed", stdout + stderr)
        self.assertFalse((self.directory / "output").exists())

    def test_central_directory_limits_are_checked_before_zipfile_reads(self):
        archive = self.directory / "bounded.zip"
        with zipfile.ZipFile(archive, "w") as output:
            output.writestr("synthetic.txt", "synthetic")
        with mock.patch.object(INSPECT, "MAX_ENTRIES", 0):
            with self.assertRaises(INSPECT.InspectionError):
                INSPECT.inspect_archive(archive)
        with mock.patch.object(INSPECT, "MAX_CENTRAL_BYTES", 0):
            with self.assertRaises(INSPECT.InspectionError):
                INSPECT.inspect_archive(archive)

    def test_changed_source_fails_instead_of_persisting_mismatched_inventory(self):
        html = self.directory / "source.html"
        html.write_text("synthetic")
        with html.open("rb") as stream:
            before = os.fstat(stream.fileno())
            html.write_text("different synthetic bytes")
            with self.assertRaises(INSPECT.InspectionError):
                INSPECT.assert_unchanged(stream, before)


if __name__ == "__main__":
    unittest.main()

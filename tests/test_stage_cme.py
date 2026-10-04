"""Entirely invented CME-layout fixtures; no real observations are embedded."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

SPEC = importlib.util.spec_from_file_location("stage_cme", Path(__file__).resolve().parents[1] / "scripts" / "stage-cme.py")
CME = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CME)


def synthetic_text(status="PRELIMINARY", day="Fri, Jan 09, 2026"):
    futures = [(100 * i, 1000 * i, -i) for i in range(1, 7)]
    options = [(10 * i, 100 * i, i + 1) for i in range(1, 7)]
    combined = [tuple(a + b for a, b in zip(f, o)) for f, o in zip(futures, options)]
    def row(label, value):
        volume, oi, change = value
        return f"{label} {volume - 1} 1 {volume} {oi} {'-' if change < 0 else '+'} {abs(change)} 8 9"
    def total(values):
        return tuple(sum(value[i] for value in values) for i in range(3))
    lines = ["Synthetic test fixture — all values invented", "CME Group, Inc.",
        "EXCHANGE SUMMARY VOLUME AND OPEN INTEREST", f"PG01 BULLETIN # 6@ {day}", status,
        row("EXCHANGE", total(combined)), row("EXCHANGE FUTURES", total(futures)), row("EXCHANGE OPTIONS", total(options))]
    for heading, values in (("FUTURES & OPTIONS-", combined), ("FUTURES ONLY-", futures), ("OPTIONS ONLY-", options)):
        lines.append(heading)
        lines.extend(row(group, value) for group, value in zip(CME.GROUPS, values))
    lines.append("FORWARD SWAPS ONLY-")
    return "\n".join(lines)


class BulletinTests(unittest.TestCase):
    def parse(self, text=None, **options):
        return CME.parse_bulletin(text or synthetic_text(), expected_trade_date=options.get("day", "2026-01-09"),
            retrieved_at=options.get("time", "2026-01-10T12:00:00Z"))

    def test_complete_source_rows_and_units(self):
        result = self.parse()
        self.assertEqual(len(result["observations"]), 63)
        self.assertEqual(result["exchange"]["futures_and_options"]["volume"], 2310)
        self.assertEqual(result["status"], "preliminary")
        self.assertTrue(all(row["normalized_unit"] == "contracts" for row in result["observations"]))
        self.assertFalse(result["publication"]["portal_updated"])
        self.assertTrue(all(row["calculation"] is None for row in result["observations"]))
        self.assertIn("COMM & ALT INVST", result["categories"]["futures"])

    def test_final_status_and_comma_format(self):
        text = synthetic_text("FINAL").replace(" 2310 ", " 2,310 ")
        self.assertEqual(self.parse(text)["status"], "final")

    def test_group_caption_may_share_exchange_row(self):
        text = synthetic_text().replace("\nEXCHANGE 2309", "\n* CME GROUP TOTALS\x02EXCHANGE 2309", 1)
        result = self.parse(text)
        self.assertEqual(result["exchange"]["futures_and_options"]["volume"], 2310)
        self.assertTrue(result["exchange"]["futures_and_options"]["source_text"].startswith("* CME GROUP TOTALS"))

    def test_wrong_missing_or_conflicting_status_rejected(self):
        for text in (synthetic_text().replace("PRELIMINARY", ""), synthetic_text().replace("PRELIMINARY", "FINAL\nPRELIMINARY")):
            with self.assertRaises(CME.CandidateError):
                self.parse(text)

    def test_stale_unexpected_session_rejected(self):
        with self.assertRaises(CME.CandidateError):
            self.parse(day="2026-01-08")

    def test_current_new_york_session_rejected(self):
        # UTC next day is still the report date in New York.
        with self.assertRaises(CME.CandidateError):
            self.parse(time="2026-01-10T02:00:00Z")

    def test_no_timezone_rejected(self):
        with self.assertRaises(CME.CandidateError):
            self.parse(time="2026-01-10T12:00:00")

    def test_bad_weekday_and_duplicate_date_rejected(self):
        for text in (synthetic_text(day="Thu, Jan 09, 2026"), synthetic_text() + "\nPG01 BULLETIN # 6@ Fri, Jan 09, 2026"):
            with self.assertRaises(CME.CandidateError):
                self.parse(text)

    def test_missing_duplicate_and_unreviewed_categories_rejected(self):
        text = synthetic_text()
        row = next(line for line in text.splitlines() if line.startswith("FX "))
        for changed in (text.replace(row + "\n", "", 1), text.replace(row, row + "\n" + row, 1), text.replace(row, row.replace("FX", "NEW PRODUCT"), 1)):
            with self.assertRaises(CME.CandidateError):
                self.parse(changed)

    def test_channel_total_identity_rejected(self):
        with self.assertRaisesRegex(CME.CandidateError, "channel"):
            self.parse(synthetic_text().replace("EXCHANGE 2309 1 2310", "EXCHANGE 2308 1 2310"))

    def test_category_open_interest_and_change_rejected(self):
        for tail in ("110 1101 + 1", "110 1100 + 2"):
            with self.assertRaisesRegex(CME.CandidateError, "reconcile"):
                self.parse(synthetic_text().replace("110 1100 + 1", tail, 1))

    def test_product_futures_options_reconciliation(self):
        # Reallocate one OI contract between options categories, preserving the
        # options exchange sum. Per-category futures/options still must reconcile.
        text = synthetic_text().replace("10 100 + 2", "10 101 + 2").replace("20 200 + 3", "20 199 + 3")
        with self.assertRaisesRegex(CME.CandidateError, "futures plus options"):
            self.parse(text)

    def test_decimal_and_negative_values_rejected(self):
        for replacement in ("EXCHANGE 2309.0 1 2310", "EXCHANGE -2309 1 2310"):
            with self.assertRaises(CME.CandidateError):
                self.parse(synthetic_text().replace("EXCHANGE 2309 1 2310", replacement))

    def test_staging_is_idempotent_and_preserves_evidence(self):
        with tempfile.TemporaryDirectory() as root:
            evidence = synthetic_text().encode()
            candidate = self.parse()
            first = CME.stage_candidate(candidate, evidence, data_dir=root, evidence_kind="reviewed-text-extract")
            same = CME.stage_candidate(candidate, evidence, data_dir=root, evidence_kind="reviewed-text-extract")
            self.assertEqual(first["result"], "staged")
            self.assertEqual(same["result"], "unchanged")
            stored = json.loads((Path(root) / first["candidate"] / "candidate.json").read_text())
            self.assertIsNone(stored["source_document_sha256"])
            self.assertEqual((Path(root) / first["candidate"] / "source.txt").read_bytes(), evidence)
            self.assertEqual(len(list(Path(root).iterdir())), 1)

    def test_revision_retains_original_and_requires_review(self):
        with tempfile.TemporaryDirectory() as root:
            first = CME.stage_candidate(self.parse(), synthetic_text().encode(), data_dir=root, evidence_kind="reviewed-text-extract")
            revised = synthetic_text("FINAL")
            second = CME.stage_candidate(self.parse(revised), revised.encode(), data_dir=root, evidence_kind="reviewed-text-extract")
            stored = json.loads((Path(root) / second["candidate"] / "candidate.json").read_text())
            self.assertEqual(stored["prior_candidates"], [first["candidate"]])
            self.assertTrue((Path(root) / first["candidate"] / "source.txt").exists())
            self.assertFalse(stored["publication"]["master_database_updated"])

    def test_altered_prior_evidence_is_not_silently_reused(self):
        with tempfile.TemporaryDirectory() as root:
            evidence = synthetic_text().encode()
            result = CME.stage_candidate(self.parse(), evidence, data_dir=root, evidence_kind="reviewed-text-extract")
            (Path(root) / result["candidate"] / "source.txt").write_text("synthetic tampering")
            with self.assertRaisesRegex(CME.CandidateError, "hash"):
                CME.stage_candidate(self.parse(), evidence, data_dir=root, evidence_kind="reviewed-text-extract")

    def test_private_paths_cannot_enter_git(self):
        with tempfile.TemporaryDirectory() as root:
            (Path(root) / ".git").mkdir()
            (Path(root) / ".git" / "HEAD").write_text("ref: refs/heads/synthetic")
            with self.assertRaises(CME._paths.InspectionError):
                CME.stage_candidate(self.parse(), synthetic_text().encode(), data_dir=root, evidence_kind="reviewed-text-extract")

    def test_access_denial_stops_without_retry_or_candidate(self):
        with patch.object(CME.urllib.request, "build_opener") as builder:
            builder.return_value.open.side_effect = urllib.error.HTTPError(CME.SOURCE_URL, 403, "Synthetic denial", {}, None)
            with self.assertRaisesRegex(CME.CandidateError, "HTTP 403"):
                CME.download_bulletin()
            self.assertEqual(builder.return_value.open.call_count, 1)


if __name__ == "__main__":
    unittest.main()

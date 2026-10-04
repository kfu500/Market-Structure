#!/usr/bin/env python3
"""Validate a CME daily bulletin and retain a private, immutable candidate.

This does not modify the master database, activate a portal release, or enable
a schedule. Source access and publication are separate, observable steps.
"""
from __future__ import annotations

import argparse
from datetime import date, datetime, timezone
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from zoneinfo import ZoneInfo

SOURCE_URL = "https://www.cmegroup.com/daily_bulletin/current/Section01_Exchange_Overall_Volume_And_Open_Interest.pdf"
MAX_BYTES = 20 * 1024 * 1024
GROUPS = ("COMM & ALT INVST", "FX", "EQUITY INDEX", "INTEREST RATES", "METALS", "ENERGY")
SCOPES = ("futures_and_options", "futures", "options")
MONTHS = dict(zip("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(), range(1, 13)))
_spec = importlib.util.spec_from_file_location("cme_private_paths", Path(__file__).with_name("inspect-sources.py"))
_paths = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_paths)


class CandidateError(ValueError):
    pass


def utc_timestamp(value):
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, AttributeError) as exc:
        raise CandidateError("Retrieval time must be an ISO timestamp with a timezone.") from exc
    if parsed.tzinfo is None:
        raise CandidateError("Retrieval time must include a timezone.")
    return parsed.astimezone(timezone.utc)


def parse_row(line, label, number):
    tail = line[len(label):].strip()
    tail = re.sub(r"([+-])\s+(?=\d)", r"\1", tail)
    tokens = tail.split()
    if len(tokens) not in (7, 8) or any(not re.fullmatch(r"[+-]?\d+|[+-]?\d{1,3}(?:,\d{3})+", token) for token in tokens):
        raise CandidateError(f"Unsupported numeric layout at source line {number}.")
    values = [int(token.replace(",", "")) for token in tokens]
    channels, total = values[:-5], values[-5:]
    volume, oi, change, prior_volume, prior_oi = total
    if any(value < 0 for value in channels + [volume, oi, prior_volume, prior_oi]):
        raise CandidateError(f"Negative volume or open interest at source line {number}.")
    if any(abs(value) > 2**53 - 1 for value in values):
        raise CandidateError("Reported integer exceeds the safe downstream precision limit.")
    if sum(channels) != volume:
        raise CandidateError(f"Trading-channel volume does not reconcile at source line {number}.")
    return {"volume": volume, "open_interest": oi, "open_interest_change": change,
            "reported_channel_values": channels, "prior_52_week_volume": prior_volume,
            "prior_52_week_open_interest": prior_oi, "source_line": number, "source_text": line}


def parse_bulletin(text, *, expected_trade_date, retrieved_at):
    retrieved = utc_timestamp(retrieved_at)
    try:
        expected = date.fromisoformat(expected_trade_date)
    except (ValueError, TypeError) as exc:
        raise CandidateError("Expected trade date must be an ISO date.") from exc
    if expected.isoformat() != expected_trade_date:
        raise CandidateError("Expected trade date must use YYYY-MM-DD.")
    if not isinstance(text, str) or len(text.encode("utf-8")) > MAX_BYTES:
        raise CandidateError("Source text exceeds the supported size.")
    # PDF extraction can add a control separator between row labels/columns.
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", text)
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    dates = re.findall(r"BULLETIN\s*#\s*\d+@?\s+(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})", text)
    if len(dates) != 1:
        raise CandidateError("Exactly one bulletin trade date must be verifiable.")
    weekday, month, day, year = dates[0]
    try:
        trade_date = date(int(year), MONTHS[month], int(day))
    except ValueError as exc:
        raise CandidateError("Invalid bulletin trade date.") from exc
    if trade_date.strftime("%a") != weekday or trade_date != expected:
        raise CandidateError("Bulletin date does not match the expected completed session.")
    if trade_date >= retrieved.astimezone(ZoneInfo("America/New_York")).date():
        raise CandidateError("Current-session or future daily snapshots are not accepted.")
    labels = {line for line in lines if line in ("PRELIMINARY", "FINAL")}
    if len(labels) != 1 or "CME Group" not in text or "EXCHANGE SUMMARY VOLUME AND OPEN INTEREST" not in text:
        raise CandidateError("CME bulletin identity or preliminary/final status is unverified.")
    status = labels.pop().lower()
    exchange = {}
    categories = {scope: {} for scope in SCOPES}
    section = None
    headings = {"FUTURES & OPTIONS-": SCOPES[0], "FUTURES ONLY-": SCOPES[1], "OPTIONS ONLY-": SCOPES[2]}
    for number, line in enumerate(lines, 1):
        original_line = line
        line = re.sub(r"^\* CME GROUP TOTALS\s+(?=EXCHANGE )", "", line)
        if line in headings:
            if categories[headings[line]]:
                raise CandidateError("Duplicate product-group section.")
            section = headings[line]
            continue
        if line.startswith("FORWARD SWAPS ONLY") or line.startswith("OPTIONS FORWARD SWAPS ONLY"):
            section = None
        for label, scope in (("EXCHANGE FUTURES", "futures"), ("EXCHANGE OPTIONS", "options"), ("EXCHANGE", "futures_and_options")):
            if re.match(re.escape(label) + r"\s+\d", line):
                if scope in exchange:
                    raise CandidateError("Duplicate exchange row.")
                exchange[scope] = parse_row(line, label, number)
                exchange[scope]["source_text"] = original_line
                break
        if section:
            match = next((group for group in GROUPS if line.startswith(group + " ")), None)
            if match:
                if match in categories[section]:
                    raise CandidateError("Duplicate product-group row.")
                categories[section][match] = parse_row(line, match, number)
            elif re.match(r"[A-Z][A-Z &]+\s+\d", line):
                raise CandidateError("An unreviewed product category is present.")
    if set(exchange) != set(SCOPES) or any(set(categories[scope]) != set(GROUPS) for scope in SCOPES):
        raise CandidateError("Required exchange or product-group rows are missing.")
    fields = ("volume", "open_interest", "open_interest_change")
    for scope in SCOPES:
        for field in fields:
            if sum(row[field] for row in categories[scope].values()) != exchange[scope][field]:
                raise CandidateError(f"Product-group {field} does not reconcile for {scope}.")
    for field in fields:
        if exchange["futures"][field] + exchange["options"][field] != exchange["futures_and_options"][field]:
            raise CandidateError(f"Exchange futures plus options {field} does not reconcile.")
        for group in GROUPS:
            if categories["futures"][group][field] + categories["options"][group][field] != categories["futures_and_options"][group][field]:
                raise CandidateError(f"Product-group futures plus options {field} does not reconcile.")
    observations = []
    for scope in SCOPES:
        for group, row in [("EXCHANGE", exchange[scope]), *categories[scope].items()]:
            for field in fields:
                observations.append({"entity": "CME", "scope": scope, "source_category": group,
                    "metric": field, "trade_date": trade_date.isoformat(), "frequency": "daily",
                    "value": row[field], "raw_unit": "contracts", "normalized_unit": "contracts",
                    "measure_type": "stock" if field == "open_interest" else "stock_change" if field == "open_interest_change" else "flow",
                    "reported_or_calculated": "reported", "calculation": None, "status": status,
                    "source_location": f"Section 01, page 1, extracted line {row['source_line']}",
                    "source_text": row["source_text"]})
    return {"schema_version": 1, "adapter": "cme-section01-daily-v1", "source_url": SOURCE_URL,
        "trade_date": trade_date.isoformat(), "retrieved_at": retrieved.isoformat(),
        "publication_timestamp": None, "status": status, "exchange": exchange,
        "categories": categories, "observations": observations,
        "checks": {"required_rows": True, "unique_rows": True, "channel_volume_identity": True,
                   "category_totals": True, "futures_plus_options": True, "completed_session": True},
        "publication": {"state": "staged", "portal_updated": False, "master_database_updated": False},
        "limitations": ["Single-session bulletin does not establish MTD or ADV.",
            "COMM & ALT INVST retains the source category and is not relabeled Agriculture.",
            "No year-over-year comparison is calculated from the bulletin's 52-week reference columns."]}


class SameSourceRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if newurl != SOURCE_URL:
            raise CandidateError("Source redirected; review the destination before retrieving it.")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def download_bulletin():
    try:
        with urllib.request.build_opener(SameSourceRedirect()).open(SOURCE_URL, timeout=30) as response:
            if response.status != 200:
                raise CandidateError("Source retrieval did not return HTTP 200.")
            body = response.read(MAX_BYTES + 1)
    except urllib.error.HTTPError as exc:
        raise CandidateError(f"Source retrieval failed with HTTP {exc.code}; no candidate published.") from exc
    except urllib.error.URLError as exc:
        raise CandidateError("Source connection failed; no candidate published.") from exc
    if len(body) > MAX_BYTES or not body.startswith(b"%PDF-"):
        raise CandidateError("Source is not a bounded PDF document.")
    return body


def read_private(filename):
    path = _paths.external_path(filename)
    stream, before = _paths.source_file(path, MAX_BYTES)
    with stream:
        body = stream.read(MAX_BYTES + 1)
        _paths.assert_unchanged(stream, before)
    if len(body) > MAX_BYTES:
        raise CandidateError("Source exceeds the size limit.")
    return body


def extract_pdf(body):
    if not body.startswith(b"%PDF-"):
        raise CandidateError("Selected source is not a PDF.")
    if shutil.which("pdftotext") is None:
        raise CandidateError("pdftotext is required for PDF extraction.")
    try:
        result = subprocess.run(["pdftotext", "-layout", "-", "-"], input=body,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30, check=True)
    except (subprocess.SubprocessError, OSError) as exc:
        raise CandidateError("PDF text extraction failed.") from exc
    if len(result.stdout) > MAX_BYTES:
        raise CandidateError("Extracted text exceeds the size limit.")
    return result.stdout.decode("utf-8", errors="strict")


def stage_candidate(candidate, evidence, *, data_dir, evidence_kind):
    if evidence_kind not in ("pdf", "reviewed-text-extract"):
        raise CandidateError("Unsupported evidence type.")
    root = _paths.external_path(data_dir)
    if not root.is_dir():
        raise CandidateError("Create the external private staging directory first.")
    root_fd = _paths.parent_fd(root / "child")
    digest = hashlib.sha256(evidence).hexdigest()
    name = f"cme-{candidate['trade_date']}-{candidate['status']}-{digest}"
    candidate = {**candidate, "evidence_kind": evidence_kind, "evidence_sha256": digest,
        "source_document_sha256": digest if evidence_kind == "pdf" else None,
        "replay_evidence_file": "source.pdf" if evidence_kind == "pdf" else "source.txt"}
    candidate["requires_review"] = ["Match the candidate to the current master and coherent presentation before publication."]
    if evidence_kind != "pdf":
        candidate["requires_review"].append("Reviewed text is retained; original PDF bytes were unavailable. Do not describe its hash as a PDF hash.")
    comparable = ("trade_date", "status", "exchange", "categories", "observations", "checks", "evidence_kind", "evidence_sha256")
    def read_existing():
        path = root / name
        raw = read_private(str(path / "candidate.json"))
        existing = json.loads(raw)
        if any(existing.get(key) != candidate.get(key) for key in comparable):
            raise CandidateError("Existing candidate differs; it was not overwritten.")
        if hashlib.sha256(read_private(str(path / candidate["replay_evidence_file"]))).hexdigest() != digest:
            raise CandidateError("Existing candidate evidence failed its hash check.")
        return {"result": "unchanged", "candidate": name, "portal_updated": False}
    temp = None
    try:
        if (root / name).exists():
            return read_existing()
        prior = sorted(p.name for p in root.glob(f"cme-{candidate['trade_date']}-*") if p.is_dir())
        candidate["prior_candidates"] = prior
        if prior:
            candidate["requires_review"].append("Other evidence exists for this trade date; retain and reconcile any revision or conflict.")
        temp = tempfile.mkdtemp(prefix=".candidate-", dir=root)
        os.chmod(temp, 0o700)
        for filename, body in ((candidate["replay_evidence_file"], evidence),
                ("candidate.json", (json.dumps(candidate, indent=2, allow_nan=False) + "\n").encode())):
            fd = os.open(Path(temp) / filename, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
            with os.fdopen(fd, "wb") as handle:
                handle.write(body)
                handle.flush()
                os.fsync(handle.fileno())
        directory_fd = os.open(temp, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
        try:
            os.rename(Path(temp).name, name, src_dir_fd=root_fd, dst_dir_fd=root_fd)
            temp = None
        except OSError:
            if (root / name).is_dir():
                return read_existing()
            raise
        os.fsync(root_fd)
        return {"result": "staged", "candidate": name, "observations": len(candidate["observations"]), "portal_updated": False}
    finally:
        if temp is not None:
            shutil.rmtree(temp)
        os.close(root_fd)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--fetch", action="store_true")
    source.add_argument("--input-pdf")
    source.add_argument("--input-text", help="Reviewed official text extract; never claimed as original PDF bytes")
    parser.add_argument("--expected-trade-date", required=True)
    parser.add_argument("--retrieved-at", help="Required for previously retrieved inputs; omitted only with --fetch")
    parser.add_argument("--data-dir", required=True)
    args = parser.parse_args()
    try:
        if not args.fetch and not args.retrieved_at:
            raise CandidateError("Supply the actual source retrieval timestamp for imported evidence.")
        body = download_bulletin() if args.fetch else read_private(args.input_pdf or args.input_text)
        when = args.retrieved_at or datetime.now(timezone.utc).isoformat()
        kind = "reviewed-text-extract" if args.input_text else "pdf"
        text = body.decode("utf-8") if args.input_text else extract_pdf(body)
        candidate = parse_bulletin(text, expected_trade_date=args.expected_trade_date, retrieved_at=when)
        result = stage_candidate(candidate, body, data_dir=args.data_dir, evidence_kind=kind)
        print(json.dumps(result))
    except (CandidateError, _paths.InspectionError, OSError, UnicodeError) as exc:
        message = str(exc) if isinstance(exc, (CandidateError, _paths.InspectionError)) else "Source or staging operation failed; check private paths and permissions."
        print(message, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

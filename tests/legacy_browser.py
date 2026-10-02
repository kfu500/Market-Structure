"""Read-only QA of a configured private portal; no observations are stored here.

Run against a loopback server. Optional evidence (which may contain private data)
must be written outside every Git checkout. Example:
  python3 tests/legacy_browser.py --url http://127.0.0.1:3001 \
      --report /workspace/market-structure-private/browser-review
Synthetic inputs are used for calculator/scenario changes. Source expectations are
read at runtime from the configured snapshot, never copied into the repository.
"""
import argparse
import csv
from datetime import date
from decimal import Decimal, ROUND_CEILING, ROUND_HALF_EVEN, ROUND_HALF_UP
import io
import json
import math
import os
from pathlib import Path
import re
import shutil
import tempfile
import time
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

COMPANIES = ("CME", "CBOE", "ICE", "NDAQ", "TW", "HOOD")


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def external_directory(value):
    path = Path(value).resolve()
    require(Path(value).is_absolute(), "Evidence directory must be absolute")
    require(not any((parent / ".git").is_file() or (parent / ".git" / "HEAD").is_file()
                    for parent in (path, *path.parents)),
            "Private evidence must be outside every Git checkout")
    path.mkdir(parents=True, exist_ok=True, mode=0o700)
    return path


def shift_month(value, lag):
    year, month = map(int, value[:7].split("-"))
    ordinal = year * 12 + month - 1 + lag
    return f"{ordinal // 12:04d}-{ordinal % 12 + 1:02d}"


class Review:
    def __init__(self, page, base, evidence):
        self.page, self.base, self.evidence = page, base, evidence
        self.errors, self.console_errors, self.external, self.failed_http = [], [], [], []
        self.results = []
        page.on("pageerror", lambda error: self.errors.append(str(error)))
        page.on("console", lambda message: self.console_errors.append(message.text)
                if message.type == "error" else None)
        page.on("request", self.request)
        page.on("response", lambda response: self.failed_http.append(response.url)
                if response.status >= 400 else None)

    def request(self, request):
        parsed = urlparse(request.url)
        if parsed.scheme in ("http", "https") and parsed.netloc != urlparse(self.base).netloc:
            self.external.append(request.url)

    def ready(self):
        self.page.wait_for_selector('#legacy-root[data-ready="true"]', timeout=120000)

    def click(self, selector):
        self.page.locator(selector).first.click()
        self.page.wait_for_timeout(50)

    def company(self, company):
        self.click(f'[data-company="{company}"]')
        require(self.page.evaluate("__MS_GET_STATE().company") == company, "Company navigation state")

    def tab(self, tab):
        target = self.page.locator(f'[data-tab="{tab}"]').first
        if not target.is_visible():
            details = self.page.locator("#moreAnalysis")
            if not details.evaluate("x => x.open"):
                details.locator("summary").first.click()
        target.click()
        self.page.wait_for_timeout(50)
        require(self.page.evaluate("__MS_GET_STATE().tab") == tab, "Tab navigation state")

    def charts(self, scope="document"):
        outcome = self.page.evaluate("""scope => {
          const root = scope === 'document' ? document : document.querySelector(scope);
          const charts = [...root.querySelectorAll('svg')].filter(x => x.checkVisibility());
          return {count: charts.length, drawn: charts.filter(x => x.getBoundingClientRect().width > 0
            && x.getBoundingClientRect().height > 0 && x.querySelector('path,polyline,rect,circle')).length,
            invalid: charts.some(x => [...x.querySelectorAll('path,polyline,circle')].some(n =>
              [...n.attributes].some(a => /NaN|Infinity/.test(a.value))))};
        }""", scope)
        require(outcome["count"] > 0 and outcome["drawn"] == outcome["count"], "Visible charts must have rendered geometry")
        require(not outcome["invalid"], "Charts must not have nonfinite coordinates")

    def screenshot(self, name):
        if self.evidence:
            self.page.screenshot(path=str(self.evidence / (name + ".png")), full_page=True)

    def check(self, name, task):
        start = time.monotonic()
        baseline = (len(self.errors), len(self.console_errors), len(self.external), len(self.failed_http))
        try:
            task()
            require(len(self.errors) == baseline[0], "Uncaught browser error")
            require(len(self.console_errors) == baseline[1], "Browser console/CSP error")
            require(len(self.external) == baseline[2], "Unexpected external network request")
            require(len(self.failed_http) == baseline[3], "Failed application HTTP response")
            result = {"name": name, "passed": True}
        except Exception as error:
            result = {"name": name, "passed": False, "error": str(error), "type": type(error).__name__}
        result["seconds"] = round(time.monotonic() - start, 2)
        self.results.append(result)
        print(f'{"PASS" if result["passed"] else "FAIL"}: {name}', flush=True)

    def bootstrap(self):
        self.page.goto(self.base)
        self.ready()
        require(self.page.locator("#private-snapshot-status").inner_text().count("No verified refresh connection") == 1,
                "Snapshot must disclose refresh status")
        counts = self.page.evaluate("__MARKET_STRUCTURE_SNAPSHOT.manifest.counts")
        require(counts["observations"] > 0 and counts["metrics"] > 0 and counts["research"] > 0,
                "Private observations, definitions and research must load")
        require(self.page.evaluate("__MS_GET_STATE().tab") == "chartDashboard", "Dashboard is initial route")
        for company in COMPANIES:
            require(self.page.locator(f'[data-company="{company}"]').count() == 1, "Required company navigation")
        self.charts()
        self.screenshot("dashboard-desktop")

    def trends(self, company):
        self.company(company)
        self.tab("context")
        self.charts("#companyChartPanel")
        for mode in ("trend", "yoy", "seasonal"):
            self.click(f'#companyChartPanel [data-mc-view="{mode}"]')
            self.charts("#companyChartPanel")
        self.tab("overview")
        options = self.page.locator("#metric option").evaluate_all("nodes => nodes.map(n => n.value)")
        require(len(options) > 0, "Operating metric choices")
        # Test distinct source series, including all metric-selector choices.
        for index, key in enumerate(options):
            self.page.locator("#metric").select_option(key)
            require(self.page.evaluate("__MS_GET_STATE().metric") == key, "Metric selector state")
            require(self.page.locator("#historyTable tbody tr").count() > 0, "History has observations")
            require(self.page.evaluate("Boolean(__MS_GET_SPEC(__MS_GET_STATE().metric).unit)"), "Operating metric has units")
            if index in (0, len(options) - 1):
                self.charts("#workbench")
        self.page.locator("#metric").select_option(options[0])
        for view in ("level", "yoy", "rolling", "rolling_yoy"):
            self.click(f'[data-view="{view}"]')
            require(self.page.evaluate("__MS_GET_STATE().view") == view, "Comparison selector state")
            self.charts("#workbench")
        if not self.page.locator("#historyDetails").evaluate("x => x.open"):
            self.click("#historyDetails > summary")
        require(self.page.locator("#historyTable").is_visible(), "Dated history accordion opens")
        self.independent_calculations()
        if company == "CME":
            self.screenshot("company-comparisons-desktop")

    def independent_calculations(self):
        payload = self.page.evaluate("""() => {
          const key = __MS_GET_STATE().metric, rows = __MS_GET_SERIES(key), def = __MS_GET_SPEC(key);
          return {rows, def, yoy:MarketStructureAnalytics.transform(rows,def,'yoy'),
            rolling:MarketStructureAnalytics.transform(rows,def,'rolling')};
        }""")
        rows, definition = payload["rows"], payload["def"]
        # Runtime metadata selects the declared calculation. Duplicates/incomplete
        # inputs are deliberately excluded rather than finding a nearby period.
        by_month = {}
        for row in rows:
            by_month.setdefault(row["date"][:7], []).append(row)
        def point(month):
            candidates = by_month.get(month, [])
            if len(candidates) != 1:
                return None
            row = candidates[0]
            flags = f'{row.get("period_status", "")} {row.get("classification", "")}'
            if (row.get("analysis_block") or row.get("complete") is False or
                    re.search(r"mtd|partial|prelim|incomplete|provisional|forecast|estimate|carry[\s_-]*forward|assumption|projected", flags, re.I)):
                return None
            if not isinstance(row.get("value"), (int, float)) or not math.isfinite(row["value"]):
                return None
            return row
        checked_yoy = 0
        for result in payload["yoy"]:
            current, previous = point(result["date"][:7]), point(shift_month(result["date"], -12))
            require(current is not None and previous is not None, "YoY requires aligned completed months")
            unit = definition.get("unit")
            if unit in ("%", "fraction", "percent", "percentage points"):
                scale = 1 if definition.get("percentEncoding") == "points" or unit in ("percent", "percentage points") else 100
                expected = (current["value"] - previous["value"]) * scale
            else:
                require(previous["value"] > 0, "Relative comparison positive denominator")
                expected = (current["value"] / previous["value"] - 1) * 100
            require(math.isclose(result["value"], expected, rel_tol=1e-9, abs_tol=1e-8), "YoY independently reconciles")
            checked_yoy += 1
        require(checked_yoy > 0, "At least one complete YoY comparison is tested")
        require(definition.get("frequency", "monthly") == "monthly", "Selected operating series is monthly")
        require(definition.get("window_months", 1) <= 1 and definition.get("family") != "RPC", "Selected series is not already windowed")
        checked_rolling = 0
        for result in payload["rolling"]:
            window = [point(shift_month(result["date"], lag)) for lag in (-2, -1, 0)]
            require(all(window), "T3M uses three completed aligned months")
            method = definition.get("aggregation", "monthly_mean")
            if method == "day_weighted":
                require(all(row.get("days", 0) > 0 for row in window), "Weighted series has positive session counts")
                expected = sum(row["value"] * row["days"] for row in window) / sum(row["days"] for row in window)
            elif method == "sum":
                expected = sum(row["value"] for row in window)
            else:
                require(method in ("monthly_mean", "mean", "average", "none"), "Declared aggregation supported")
                expected = sum(row["value"] for row in window) / 3
            require(math.isclose(result["value"], expected, rel_tol=1e-9, abs_tol=1e-8), "T3M independently reconciles")
            checked_rolling += 1
        require(checked_rolling > 0, "At least one complete T3M comparison is tested")

    def range_and_csv(self):
        self.company("CME")
        self.tab("overview")
        self.click('[data-view="rolling_yoy"]')
        self.click('[data-range="12"]')
        start, end = self.page.locator("#fromDate").input_value(), self.page.locator("#toDate").input_value()
        require(start <= end, "Range button produces chronological bounds")
        self.page.locator("#fromDate").fill(end)
        self.page.locator("#fromDate").dispatch_event("change")
        require(self.page.locator("#historyTable tbody tr").count() == 1, "Month date filter restricts history")
        self.page.locator("#fromDate").fill(shift_month(end, 1))
        self.page.locator("#fromDate").dispatch_event("change")
        require(self.page.locator("#download").is_disabled(), "Invalid date interval blocks export")
        require(bool(self.page.locator("#rangeError").inner_text().strip()), "Invalid interval visible explanation")
        self.click("#resetRange")
        with self.page.expect_download() as download_info:
            self.click("#download")
        with tempfile.TemporaryDirectory(prefix="market-structure-private-csv-") as temp:
            path = Path(temp) / "download.csv"
            download_info.value.save_as(path)
            reader = csv.DictReader(io.StringIO(path.read_text(encoding="utf-8-sig")))
            required = {"company", "metric", "period", "value", "unit", "frequency", "view_value", "view_unit", "as_of"}
            require(required.issubset(reader.fieldnames or []), "Export includes units, dates, views and source cutoff")
            records = list(reader)
        require(len(records) > 12, "All-history CSV retains historical observations")
        payload = self.page.evaluate("""() => {const s=__MS_GET_STATE();return {rows:__MS_GET_SERIES(s.metric),def:__MS_GET_SPEC(s.metric),
          derived:MarketStructureAnalytics.transform(__MS_GET_SERIES(s.metric),__MS_GET_SPEC(s.metric),s.view)}}""")
        observations = {row["date"]: row for row in payload["rows"]}
        derived = {row["date"][:7]: row["value"] for row in payload["derived"]}
        require(len(records) == len(payload["rows"]), "Export preserves source row count")
        for record in records:
            date.fromisoformat(record["period"])
            require(record["unit"] == payload["def"]["unit"], "CSV retains source units")
            require(math.isclose(float(record["value"]), observations[record["period"]]["value"], rel_tol=1e-12), "CSV retains source numeric value")
            expected = derived.get(record["period"][:7])
            if expected is None:
                require(record["view_value"] == "", "Missing comparison remains empty in export")
            else:
                require(math.isclose(float(record["view_value"]), expected, rel_tol=1e-12, abs_tol=1e-8), "Export selected comparison reconciles")
            for value in record.values():
                if re.match(r"^[\s\x00-\x1f]*[=+@-]", value):
                    try:
                        float(value)
                    except ValueError:
                        raise AssertionError("Export contains an unneutralized spreadsheet formula")
        escaped = self.page.evaluate("__MS_SAFE_CSV('=SUM(1,1)')")
        require(next(csv.reader([escaped]))[0].startswith("'="), "Synthetic formula string is neutralized")

    def research(self):
        for company in COMPANIES:
            self.company(company)
            self.tab("recentnotes")
            panel = self.page.locator("#recentNotesPanel")
            require(len(panel.inner_text()) > 100, "Company research records render")
            detail = panel.locator("details").first
            require(detail.count() == 1, "Research uses expandable source records")
            was_open = detail.evaluate("x => x.open")
            detail.locator("summary").first.click()
            require(detail.evaluate("x => x.open") != was_open, "Research accordion responds")
            require(len(detail.inner_text()) > len(detail.locator("summary").inner_text()), "Expanded research has body content")

    def advanced(self):
        self.company("CME")
        for tab in ("rpc", "openinterest", "collateral", "cashmarkets", "micros", "pricing", "drivers", "analysis", "sources"):
            self.tab(tab)
            require(self.page.locator("main").evaluate("x=>x.innerText.trim().length") > 100, "Advanced section is populated")
            if self.page.locator("#workbench").is_visible():
                require(self.page.locator("#metric option").count() > 0, "Advanced section retains metric choices")
                require(self.page.locator("#historyTable tbody tr").count() > 0, "Advanced section retains history")
                self.charts("#workbench")

    def consensus(self):
        for company in COMPANIES:
            self.company(company)
            self.tab("consensus")
            panel = self.page.locator("#consensusPanel")
            require(len(panel.inner_text()) > 100, "Consensus panel renders")
            controls = panel.locator("select")
            require(controls.count() >= 3, "Consensus period, metric and view controls render")
            # Each selector is exercised without hard-coding uploaded period names.
            identifiers = controls.evaluate_all("nodes=>nodes.map(x=>x.id)")
            for identifier in identifiers:
                select = self.page.locator("#" + identifier)
                if select.is_visible() and select.locator("option").count() > 1:
                    selected = select.input_value()
                    alternate = select.locator("option").evaluate_all("(nodes,current)=>nodes.find(n=>n.value!==current).value", selected)
                    select.select_option(alternate)
                    require(self.page.locator("#" + identifier).input_value() == alternate, "Consensus selector updates")
            # Scenario input is a local what-if; never alters imported source data.
            scenario = panel.locator("#csScenario")
            require(scenario.is_visible(), "Scenario input is available")
            before = panel.inner_text()
            scenario.fill("123.45")
            scenario.dispatch_event("input")
            require(panel.inner_text() != before, "Scenario updates its comparison output")
            scenario.fill("")
            scenario.dispatch_event("input")
            self.charts("#consensusPanel")

    def prediction(self):
        self.click("#predictionMarketsNav")
        require(self.page.evaluate("__MS_GET_STATE().tab") == "predictionMarkets", "Prediction navigation state")
        self.charts("#predictionMarketsPanel")
        self.click("#pmEconomics")
        config = self.page.evaluate("PredictionMarkets.data.fees")
        require(len(config) > 0, "Private fee definitions loaded")
        contracts, cents = 137, 37  # Explicitly synthetic calculator inputs.
        self.page.locator("#pmN").fill(str(contracts))
        self.page.locator("#pmP").fill(str(cents))
        self.click("#pmCalc")
        actual = self.page.evaluate("""([n,p])=>PredictionMarkets.data.fees.map(f=>PredictionMarkets.fee(f,n,p))""", [contracts, cents / 100])
        probability = Decimal(cents) / Decimal(100)
        for definition, result in zip(config, actual):
            raw = Decimal(str(definition["coefficient"])) * contracts * probability * (1 - probability)
            method = definition["rounding"]
            if method == "half_even_cent":
                paid = raw.quantize(Decimal(".01"), rounding=ROUND_HALF_EVEN)
            elif method == "half_up_1e5":
                paid = raw.quantize(Decimal(".00001"), rounding=ROUND_HALF_UP)
            else:
                require(method == "ceiling_cent icent", "Known fee rounding contract")
                # The source rule is centicent (one ten-thousandth of a dollar).
                paid = (raw + contracts * probability).quantize(Decimal(".0001"), rounding=ROUND_CEILING) - contracts * probability
            if definition.get("credit_fraction") is not None:
                credit = paid * Decimal(str(definition["credit_fraction"]))
            elif method == "half_even_cent":
                credit = (Decimal(str(definition["maker_credit_coefficient"])) * contracts * probability * (1 - probability)).quantize(Decimal(".01"), rounding=ROUND_HALF_EVEN)
            else:
                credit = Decimal(0)
            for key, value in (("paid", paid), ("credit", credit), ("remaining", paid - credit)):
                require(math.isclose(result[key], float(value), rel_tol=1e-10, abs_tol=1e-8), "Prediction fee independently reconciles")
        # Compare rendered calculator cells with the independently checked result.
        rows = self.page.locator("#pmFees tbody tr")
        require(rows.count() == len(config), "Rendered fee result table exists")
        for index, row in enumerate(rows.all()):
            numbers = [float(text.replace("$", "").replace(",", "")) for text in row.locator("td").all_text_contents()[1:4]]
            require(len(numbers) == 3, "Fee table shows paid, credit and remaining")
            for value, key in zip(numbers, ("paid", "credit", "remaining")):
                require(abs(value - actual[index][key]) <= .00501, "Rendered fee table reconciles to rounding precision")
        self.page.locator("#pmN").fill("-1")
        self.click("#pmCalc")
        require(self.page.locator("#pmFees tbody tr").count() == 0 and bool(self.page.locator("#pmFees").inner_text().strip()), "Invalid fee inputs replace numeric result with explanation")
        self.click("#pmCompanies")
        require(len(self.page.locator("#predictionMarketsPanel").inner_text()) > 100, "Prediction company exposure content renders")
        self.click("#pmVolumes")
        self.screenshot("prediction-desktop")

    def market_data(self):
        self.page.locator(".company-button").filter(has_text=re.compile(r"^Market data$")).click()
        require(self.page.evaluate("__MS_GET_STATE().tab") == "rjMarkets", "Market-data route")
        self.charts("#rjMarketPanel")
        options = self.page.locator("#rjCategory option").evaluate_all("nodes=>nodes.map(x=>x.value)")
        require(len(options) > 1, "Market data categories loaded")
        for value in options:
            self.page.locator("#rjCategory").select_option(value)
            require(len(self.page.locator("#rjMarketPanel").inner_text()) > 100, "Market data category populated")
        self.click('[data-rj-mode="monthly"]')
        self.charts("#rjMarketPanel")
        self.click("#openMarketContext")
        require(self.page.locator("#contextBack").is_visible(), "Autonomous market context opens")
        for identifier in ("contextYears", "contextView"):
            select = self.page.locator("#" + identifier)
            require(select.is_visible(), "Market context controls are visible")
            if select.locator("option").count() > 1:
                select.select_option(index=1)
        for frequency in ("daily", "monthly"):
            self.click(f'[data-context-frequency="{frequency}"]')
            self.charts("#rjMarketPanel")
        self.click("#contextBack")
        require(self.page.locator("#rjCategory").is_visible(), "Market context returns to category data")

    def data_quality(self):
        self.page.locator(".company-button").filter(has_text=re.compile(r"^Data & downloads$")).click()
        require(self.page.evaluate("__MS_GET_STATE().tab") == "unifiedData", "Data-download route")
        require(len(self.page.locator("#unifiedDataPanel").inner_text()) > 100, "Download index is populated")
        for identifier in ("unifiedCsv", "unifiedResearch", "unifiedJson"):
            require(self.page.locator("#" + identifier).is_visible(), "Private export control available")
        self.click("#private-quality-toggle")
        require(self.page.locator("#private-quality").is_visible(), "Data-quality panel opens")
        self.click("#private-quality details > summary")
        expected = self.page.evaluate("Object.keys(__MARKET_STRUCTURE_SNAPSHOT.manifest.seriesCoverage).length")
        require(self.page.locator("#private-quality table tr").count() == expected + 1, "Quality covers every source series")
        text = self.page.locator("#private-quality").inner_text().lower()
        require("stale" in text and "missing" in text, "Quality describes stale and missing observations")
        require("no refresh connection has been verified" in text, "Quality does not promise live refresh")
        self.click("#private-quality-toggle")
        self.click("#private-reload")
        self.ready()
        require(self.page.evaluate("__MARKET_STRUCTURE_SNAPSHOT.manifest.counts.observations") > 0, "Snapshot reload retains private dataset")

    def mobile(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        for selector in ("#chartDashboardNav", '[data-company="CME"]', '[data-company="HOOD"]', "#predictionMarketsNav"):
            self.click(selector)
            require(self.page.evaluate("document.documentElement.scrollWidth") <= 390, "Mobile page fits viewport")
            self.charts()
        self.screenshot("prediction-mobile")
        self.page.set_viewport_size({"width": 1440, "height": 1000})

    def network_clean(self):
        require(not self.errors, "No uncaught browser errors across all checks")
        require(not self.console_errors, "No browser console or CSP errors across all checks")
        require(not self.external, "No external network calls across all checks")
        require(not self.failed_http, "No failed application HTTP responses")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:3001")
    parser.add_argument("--report", help="Optional absolute evidence directory outside every Git checkout")
    args = parser.parse_args()
    parsed = urlparse(args.url)
    require(parsed.scheme == "http" and parsed.hostname in ("127.0.0.1", "localhost", "::1")
            and not parsed.username and not parsed.password, "Private browser QA requires a loopback URL")
    evidence = external_directory(args.report) if args.report else None
    with sync_playwright() as playwright:
        executable = os.environ.get("CHROMIUM_PATH") or shutil.which("chromium")
        browser = playwright.chromium.launch(executable_path=executable, headless=True, args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, accept_downloads=True)
        page = context.new_page()
        page.set_default_timeout(12000)
        review = Review(page, args.url.rstrip("/"), evidence)
        review.check("private snapshot, dashboard and coverage", review.bootstrap)
        if review.results[0]["passed"]:
            for company in COMPANIES:
                review.check(f"{company} trends, metrics, history, YoY and T3M", lambda company=company: review.trends(company))
            for name, task in (
                ("date filters and private CSV integrity", review.range_and_csv),
                ("all company research accordions", review.research),
                ("CME advanced sections", review.advanced),
                ("all company consensus and scenario controls", review.consensus),
                ("prediction views and independent fee calculations", review.prediction),
                ("market data and autonomous context", review.market_data),
                ("data exports, quality and private reload", review.data_quality),
                ("mobile layout and charts", review.mobile),
            ):
                review.check(name, task)
        review.check("browser errors, CSP, HTTP and network isolation", review.network_clean)
        report = {"results": review.results, "pageErrors": review.errors, "consoleErrors": review.console_errors,
                  "externalRequests": review.external, "failedHTTP": review.failed_http,
                  "passed": sum(item["passed"] for item in review.results), "total": len(review.results)}
        if evidence:
            (evidence / "browser-results.json").write_text(json.dumps(report, indent=2))
        context.close()
        browser.close()
    print(f'{report["passed"]}/{report["total"]} completed browser checks passed.')
    if not report["results"][0]["passed"]:
        print("Remaining integration checks were blocked by the snapshot bootstrap failure.")
    return 0 if report["passed"] == report["total"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

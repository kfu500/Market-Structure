"""Browser integration checks. Every input is synthetic, including private-mode tests."""
from contextlib import contextmanager
import copy
import hashlib
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
import unittest
from urllib.request import urlopen

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = json.loads((ROOT / "examples/synthetic.json").read_text())
ENTITIES = {"CME": "CME Group", "CBOE": "Cboe Global Markets", "ICE": "Intercontinental Exchange", "HOOD": "Robinhood", "NDAQ": "Nasdaq", "TW": "Tradeweb", "PREDICTION": "Prediction markets"}


@contextmanager
def portal_server(data_dir=None):
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    environment = dict(os.environ)
    environment.pop("MARKET_STRUCTURE_DATA_DIR", None)
    environment["PORT"] = str(port)
    if data_dir is not None:
        environment["MARKET_STRUCTURE_DATA_DIR"] = str(data_dir)
    process = subprocess.Popen(["node", "src/server.js"], cwd=ROOT, env=environment, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    base = f"http://127.0.0.1:{port}"
    try:
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline:
            if process.poll() is not None:
                raise RuntimeError(f"Test server exited: {process.communicate()[1]}")
            try:
                with urlopen(base + "/api/health", timeout=0.5) as result:
                    if json.load(result)["ok"]:
                        break
            except OSError:
                time.sleep(0.05)
        else:
            raise RuntimeError("Test server did not become ready")
        yield base
    finally:
        process.terminate()
        try:
            process.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.communicate()


class PortalBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        executable = os.environ.get("CHROMIUM_PATH") or shutil.which("chromium")
        cls.browser = cls.playwright.chromium.launch(executable_path=executable, headless=True, args=["--no-sandbox"])
        cls.server_context = portal_server()
        cls.base = cls.server_context.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.server_context.__exit__(None, None, None)
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1440, "height": 1050})
        self.page = self.context.new_page()
        self.errors = []
        self.external = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.page.on("request", lambda request: self.external.append(request.url) if not request.url.startswith(("http://127.0.0.1:", "data:")) else None)

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [], "Uncaught browser errors")
        self.assertEqual(self.external, [], "App must not call external services")

    def open(self, route="/"):
        self.page.goto(self.base + "/#" + route)
        expect(self.page.locator(".snapshot-banner")).to_contain_text("SYNTHETIC EXAMPLE")
        expect(self.page.locator("#main h1")).to_be_visible()

    def test_all_company_pages_metrics_charts_and_observation_tables(self):
        self.open()
        expect(self.page.locator(".entity-card")).to_have_count(7)
        for entity, name in ENTITIES.items():
            self.page.locator(f'nav a[href="#/company/{entity}"]').click()
            expect(self.page.locator("#main h1")).to_have_text(name)
            for metric in (row for row in FIXTURE["metrics"] if entity in row["entities"]):
                self.page.locator("#company-metric").select_option(metric["id"])
                expected = [row for row in FIXTURE["observations"] if row["entity"] == entity and row["metric"] == metric["id"] and row["value"] is not None]
                expect(self.page.locator("svg.series-chart circle")).to_have_count(len(expected))
                expect(self.page.locator("svg.series-chart")).to_have_attribute("role", "img")
                self.assertIn(metric["unit"], self.page.locator("svg.series-chart").get_attribute("aria-label"))
                self.page.get_by_text("View dated observations & sources", exact=True).click()
                expect(self.page.get_by_role("region", name=f'{metric["label"]} observation table', exact=True)).to_be_visible()
                self.assertGreater(self.page.locator(".data-table tbody tr").count(), 0)
                expect(self.page.locator(".provenance-panel")).to_contain_text("Observed")
                expect(self.page.locator(".provenance-panel")).to_contain_text("Synthetic")

    def test_yoy_and_three_month_cards_show_calculated_values_and_units(self):
        self.open("/company/CME")
        self.page.locator("#company-metric").select_option("net_revenue")
        values = {row["period"]: row["value"] for row in FIXTURE["observations"] if row["entity"] == "CME" and row["metric"] == "net_revenue"}
        yoy = (values["2026-08-31"] / values["2025-08-31"] - 1) * 100
        t3m = sum(values[p] for p in ("2026-06-30", "2026-07-31", "2026-08-31"))
        prior = sum(values[p] for p in ("2025-06-30", "2025-07-31", "2025-08-31"))
        def percentage(value):
            return ("+" if value > 0 else "") + f"{value:,.1f}".rstrip("0").rstrip(".") + "%"
        expect(self.page.locator(".stat-card").nth(1).locator(".stat-value")).to_have_text(percentage(yoy))
        self.assertIn(f"{t3m:,.2f}".rstrip("0").rstrip("."), self.page.locator(".stat-card").nth(2).inner_text())
        expect(self.page.locator(".stat-card").nth(2)).to_contain_text("m")
        expect(self.page.locator(".stat-card").nth(3).locator(".stat-value")).to_have_text(percentage((t3m / prior - 1) * 100))

    def test_quality_page_and_snapshot_reload_are_explicit(self):
        self.open("/quality")
        expect(self.page.locator("#main")).to_contain_text("Not connected")
        expect(self.page.locator("#main")).to_contain_text("stale")
        expect(self.page.locator("#main")).to_contain_text("missing")
        expected_series = sum(len(metric["entities"]) for metric in FIXTURE["metrics"])
        expect(self.page.locator(".quality-table tbody tr")).to_have_count(expected_series)
        with self.page.expect_response("**/api/snapshot"):
            self.page.get_by_role("button", name="Reload snapshot").click()
        expect(self.page.locator("#announcement")).to_contain_text("does not retrieve new market data")

    def test_missing_month_breaks_chart_and_empty_series_does_not_invent_values(self):
        with urlopen(self.base + "/api/snapshot") as response:
            snapshot = json.load(response)
        snapshot["data"]["observations"] = [row for row in snapshot["data"]["observations"] if not (row["entity"] == "CME" and row["metric"] == "net_revenue" and row["period"] == "2026-06-30")]
        self.page.route("**/api/snapshot", lambda route: route.fulfill(json=snapshot))
        self.open("/company/CME")
        expect(self.page.locator(".chart-line")).to_have_count(2)
        expect(self.page.locator(".stat-card").nth(2)).to_contain_text("Unavailable")
        self.page.get_by_text("View dated observations & sources", exact=True).click()
        missing_row = self.page.locator(".data-table tbody tr").filter(has_text="Jun 2026")
        expect(missing_row).to_contain_text("Missing")
        snapshot["data"]["observations"] = []
        self.page.get_by_role("button", name="Reload snapshot").click()
        expect(self.page.locator("#main")).to_contain_text("No dated observations")
        expect(self.page.locator("svg.series-chart")).to_have_count(0)
        expect(self.page.locator(".stat-card").first).to_contain_text("Unavailable")

    def test_mobile_and_keyboard_navigation(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.open()
        self.assertLessEqual(self.page.evaluate("document.documentElement.scrollWidth"), 390)
        self.page.locator('nav a[href="#/company/TW"]').click()
        expect(self.page.locator("#main h1")).to_have_text("Tradeweb")
        self.assertLessEqual(self.page.evaluate("document.documentElement.scrollWidth"), 390)
        self.page.locator(".skip-link").focus()
        self.page.keyboard.press("Enter")
        expect(self.page.locator("#main")).to_be_focused()
        expect(self.page.locator("#main h1")).to_have_text("Tradeweb")
        self.page.locator("#company-metric").focus()
        self.page.keyboard.press("ArrowDown")
        self.page.keyboard.press("Enter")
        expect(self.page.locator("#company-metric")).to_be_focused()

    def test_loading_error_and_retry(self):
        self.page.route("**/api/snapshot", lambda route: route.fulfill(status=503, json={"error": "Synthetic test failure"}))
        self.page.goto(self.base + "/")
        expect(self.page.get_by_role("alert")).to_contain_text("could not be loaded")
        expect(self.page.locator(".entity-card")).to_have_count(0)
        self.page.unroute("**/api/snapshot")
        self.page.get_by_role("button", name="Try loading again").click()
        expect(self.page.locator(".entity-card")).to_have_count(7)

    def test_private_module_evaluation_failure_never_marks_portal_ready(self):
        code = "throw new Error('Synthetic sensitive exception detail');"
        shell = (ROOT / "public/legacy.html").read_text()
        content = {"schemaVersion": 1, "modules": [{"id": "module-000", "file": "module-000.js",
                   "sha256": hashlib.sha256(code.encode()).hexdigest()}],
                   "literals": {"module-000": []}, "jsonScripts": []}
        self.page.route(self.base + "/", lambda route: route.fulfill(content_type="text/html", body=shell))
        self.page.route("**/api/legacy/styles.css", lambda route: route.fulfill(content_type="text/css", body=""))
        self.page.route("**/api/legacy/bootstrap", lambda route: route.fulfill(json={
            "snapshot": {"components": {"DB": {}}},
            "presentation": {"content": content, "shell": "<p>Synthetic loading test</p>"}}))
        self.page.route("**/legacy/module-000.js", lambda route: route.fulfill(content_type="text/javascript", body=code))
        self.page.goto(self.base + "/")
        expect(self.page.get_by_role("alert")).to_contain_text("could not be initialized")
        self.assertIsNone(self.page.locator("#legacy-root").get_attribute("data-ready"))
        self.assertNotIn("Synthetic sensitive exception detail", self.page.locator("body").inner_text())

    def test_external_import_reload_safe_text_and_invalid_snapshot(self):
        with tempfile.TemporaryDirectory(prefix="market-structure-browser-") as temp:
            directory = Path(temp)
            source = directory / "synthetic-input.json"
            storage = directory / "private-mode"
            data = copy.deepcopy(FIXTURE)
            data["dataset"]["kind"] = "private"
            data["dataset"]["name"] = "Synthetic external-data integration test"
            latest = next(row for row in data["observations"] if row["entity"] == "CME" and row["metric"] == "net_revenue" and row["period"] == "2026-08-31")
            latest["value"] = 123.45
            latest["source"] = '<img src="https://invalid.example/x" onerror="window.injected=true"> Synthetic label'
            source.write_text(json.dumps(data))
            original = source.read_bytes()
            def run_import():
                subprocess.run(["node", "scripts/import-data.js", "--input", str(source), "--data-dir", str(storage)], cwd=ROOT, check=True, capture_output=True, text=True)
            run_import()
            self.assertEqual(source.read_bytes(), original)
            with portal_server(storage) as private_base:
                self.page.goto(private_base + "/#/company/CME")
                expect(self.page.locator(".snapshot-banner")).to_contain_text("PRIVATE SNAPSHOT")
                expect(self.page.locator(".stat-card").first).to_contain_text("$123.45m")
                expect(self.page.locator(".provenance-panel")).to_contain_text("<img")
                expect(self.page.locator(".provenance-panel img")).to_have_count(0)
                self.assertIsNone(self.page.evaluate("window.injected"))
                latest["value"] = 234.56
                source.write_text(json.dumps(data))
                run_import()
                self.page.get_by_role("button", name="Reload snapshot").click()
                expect(self.page.locator(".stat-card").first).to_contain_text("$234.56m")
                self.assertEqual(len(list((storage / "backups").iterdir())), 1)
                (storage / "dataset.json").write_text("{invalid")
                self.page.get_by_role("button", name="Reload snapshot").click()
                expect(self.page.get_by_role("alert")).to_be_visible()
                expect(self.page.locator(".stat-card")).to_have_count(0)
                expect(self.page.locator(".snapshot-banner")).not_to_contain_text("SYNTHETIC EXAMPLE")


if __name__ == "__main__":
    unittest.main(verbosity=2)

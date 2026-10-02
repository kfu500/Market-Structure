"""Runtime-only QA for the standalone file:// portal; no private fixtures.

Supply source files explicitly. Optional screenshots and reports may contain
private content and must remain outside every Git checkout. Files are hashed
before and after the browser session to verify source preservation.
"""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import shutil
import struct
import tempfile
import time
from urllib.parse import urlparse
from urllib.request import urlopen

from playwright.sync_api import sync_playwright

from legacy_browser import COMPANIES, Review, external_directory, require


def source_file(value):
    path = Path(value).resolve(strict=True)
    require(path.is_file(), "Selected source must be a regular file")
    require(not any((parent / ".git").is_file() or (parent / ".git" / "HEAD").is_file()
                    for parent in path.parents),
            "Private source inputs must stay outside every Git checkout")
    return path


def digest(path):
    result = hashlib.sha256()
    with path.open("rb") as stream:
        while block := stream.read(1024 * 1024):
            result.update(block)
    return result.hexdigest()


class FileReview(Review):
    def __init__(self, page, base, evidence, portal, database, parts):
        super().__init__(page, base, evidence)
        self.portal, self.database, self.parts = portal, database, parts
        self.websockets = []
        self.document_requests = []
        page.on("websocket", lambda socket: self.websockets.append(socket.url))

    def request(self, request):
        if self.allowed_document(request):
            self.document_requests.append(request.url)
            return
        if urlparse(request.url).scheme in ("http", "https", "ws", "wss"):
            self.external.append(request.url)

    def allowed_document(self, request):
        return (urlparse(self.base).scheme == "http" and request.url == self.base
                and request.is_navigation_request() and request.resource_type == "document"
                and request.frame == self.page.main_frame)

    def ready(self):
        self.page.wait_for_function("""() =>
          document.querySelector('#legacy-root[data-ready="true"]') ||
          (document.querySelector('#browser-error')?.checkVisibility() &&
           document.querySelector('#browser-error').textContent.trim())
        """, timeout=600000)
        error = self.page.locator("#browser-error")
        require(not error.is_visible(), "Local source bootstrap failed: " + error.inner_text())

    def landing(self):
        self.page.goto(self.base)
        require(self.page.url == self.base, "Application opens from the requested standalone location")
        for selector in ("#portal-html-input", "#database-input", "#open-portal"):
            require(self.page.locator(selector).is_visible(), "Local input control is available")
        require(self.page.locator("#database-parts-input").count() == 1,
                "Optional numbered-part selector is available")
        require(not self.page.evaluate("Boolean(window.__MARKET_STRUCTURE_SNAPSHOT)"),
                "Application contains no preloaded private snapshot")

    def wrong_source(self):
        self.landing()
        # This is explicitly synthetic untrusted input. Merely selecting an HTML
        # file must never execute its scripts, even when its shape is rejected.
        self.page.locator("#portal-html-input").set_input_files({
            "name": "synthetic-unreviewed-portal.html", "mimeType": "text/html",
            "buffer": b"<!doctype html><title>Synthetic invalid source</title>"
                      b"<script>window.__UNREVIEWED_SOURCE_EXECUTED=true;</script>"
        })
        self.select_database()
        self.page.locator("#open-portal").click()
        self.page.wait_for_function("""() => {
          const node = document.querySelector('#browser-error');
          return node && !node.hidden && node.textContent.trim().length > 0;
        }""", timeout=600000)
        require(not self.page.evaluate("Boolean(window.__UNREVIEWED_SOURCE_EXECUTED)"),
                "Uploaded script must not execute")
        require(self.page.locator('#legacy-root[data-ready="true"]').count() == 0,
                "Unsupported source cannot become a ready portal")

    def select_database(self):
        if self.database:
            self.page.locator("#database-input").set_input_files(str(self.database))
        else:
            self.page.locator("#database-parts-input").locator("xpath=ancestor::details").locator("summary").click()
            self.page.locator("#database-parts-input").set_input_files([str(path) for path in self.parts])

    def bootstrap(self):
        self.landing()
        self.page.locator("#portal-html-input").set_input_files(str(self.portal))
        self.select_database()
        self.page.locator("#open-portal").click()
        self.ready()
        require("No verified refresh connection" in self.page.locator("#private-snapshot-status").inner_text(),
                "Snapshot must disclose refresh status")
        counts = self.page.evaluate("__MARKET_STRUCTURE_SNAPSHOT.manifest.counts")
        require(counts["observations"] > 0 and counts["metrics"] > 0 and counts["research"] > 0,
                "Local observations, definitions and research must load")
        require(self.page.evaluate("__MS_GET_STATE().tab") == "chartDashboard", "Dashboard is initial route")
        for company in COMPANIES:
            require(self.page.locator(f'[data-company="{company}"]').count() == 1,
                    "Required company navigation")
        self.charts()
        self.screenshot("browser-edition-dashboard")

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
        require(self.page.locator("#private-quality table tr").count() == expected + 1,
                "Quality covers every source series")
        content = self.page.locator("#private-quality").inner_text().lower()
        require("stale" in content and "missing" in content, "Quality describes stale and missing observations")
        require("no refresh connection has been verified" in content, "Quality does not promise live refresh")
        self.click("#private-quality-toggle")

    def advanced(self):
        self.company("CME")
        for tab in ("rpc", "openinterest", "collateral", "cashmarkets", "micros", "pricing", "drivers", "analysis", "sources"):
            self.tab(tab)
            require(self.page.locator("#legacy-root main").evaluate("node => node.innerText.trim().length") > 100,
                    "Advanced section is populated")
            if self.page.locator("#workbench").is_visible():
                require(self.page.locator("#metric option").count() > 0, "Advanced section retains metric choices")
                require(self.page.locator("#historyTable tbody tr").count() > 0, "Advanced section retains history")
                self.charts("#workbench")

    def print_export(self):
        self.company("CME")
        self.tab("context")
        self.page.evaluate("() => { window.__PRINT_REQUESTED = 0; window.print = () => { window.__PRINT_REQUESTED += 1; }; }")
        self.click("#browser-print")
        require(self.page.evaluate("window.__PRINT_REQUESTED") == 1, "Print button opens browser print workflow")
        self.page.emulate_media(media="print")
        self.charts("#companyChartPanel")
        self.page.emulate_media(media="screen")
        self.screenshot("browser-edition-print-source")

    def chart_export(self):
        self.company("CME")
        self.tab("context")
        with self.page.expect_download(timeout=60000) as download_info:
            self.click("#browser-export")
        with tempfile.TemporaryDirectory(prefix="market-structure-private-chart-") as directory:
            output = Path(directory) / "chart.png"
            download_info.value.save_as(output)
            payload = output.read_bytes()
        require(payload[:8] == b"\x89PNG\r\n\x1a\n" and payload[12:16] == b"IHDR", "Chart export is a PNG file")
        width, height = struct.unpack(">II", payload[16:24])
        require(width >= 240 and height >= 120, "Exported chart has usable image dimensions")
        drawn = self.page.evaluate("""async encoded => {
          const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
          const bitmap = await createImageBitmap(new Blob([bytes], {type: 'image/png'}));
          const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
          const context = canvas.getContext('2d'); context.drawImage(bitmap, 0, 0); bitmap.close();
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let nonWhite = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] > 0 && (pixels[i] < 245 || pixels[i + 1] < 245 || pixels[i + 2] < 245)) nonWhite++;
          }
          return nonWhite > 100;
        }""", base64.b64encode(payload).decode("ascii"))
        require(drawn, "Downloaded PNG contains drawn chart pixels")
        if self.evidence:
            (self.evidence / "browser-edition-chart-export.png").write_bytes(payload)

    def reset(self):
        retained = self.page.evaluate("""async () => {
          const result = {local: 0, session: 0, databases: 0};
          try { result.local = localStorage.length; } catch { /* unavailable on some file origins */ }
          try { result.session = sessionStorage.length; } catch { /* unavailable on some file origins */ }
          try { result.databases = (await indexedDB.databases()).length; } catch { /* unavailable on some file origins */ }
          return result;
        }""")
        require(not any(retained.values()), "Private snapshot is not saved in browser persistent storage")
        self.click("#private-reload")
        self.page.wait_for_selector("#portal-html-input", state="visible")
        require(not self.page.evaluate("Boolean(window.__MARKET_STRUCTURE_SNAPSHOT)"),
                "Reset clears the in-memory snapshot")
        for selector in ("#portal-html-input", "#database-input", "#database-parts-input"):
            require(self.page.locator(selector).evaluate("input => input.files.length") == 0,
                    "Reset clears private file selection")
        require(self.page.locator('#legacy-root[data-ready="true"]').count() == 0,
                "Reset clears loaded application state")
        self.page.reload()
        require(not self.page.evaluate("Boolean(window.__MARKET_STRUCTURE_SNAPSHOT)"),
                "Reload never restores a private snapshot without user file selection")

    def network_clean(self):
        super().network_clean()
        require(not self.websockets, "No WebSocket connections across all checks")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app", "--artifact", dest="app", default=str(Path(__file__).resolve().parents[1] / "Open-Market-Structure.html"))
    parser.add_argument("--url", help="Optional loopback URL serving this exact artifact, with no backend or APIs")
    parser.add_argument("--portal", required=True, help="Original HTML or HTML ZIP outside Git")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--database", help="Complete database ZIP or SQLite outside Git")
    source.add_argument("--database-parts", nargs="+", help="All original database ZIP parts outside Git")
    parser.add_argument("--load-only", action="store_true", help="Check loading, export and reset without repeating all page scenarios")
    parser.add_argument("--report", help="Optional absolute evidence directory outside every Git checkout")
    args = parser.parse_args()
    application = Path(args.app).resolve(strict=True)
    require(application.is_file(), "Standalone application file must exist")
    artifact_hash = digest(application)
    if args.url:
        parsed = urlparse(args.url)
        require(parsed.scheme == "http" and parsed.hostname in ("127.0.0.1", "localhost", "::1")
                and not parsed.username and not parsed.password and not parsed.fragment,
                "Optional test transport must be an explicit loopback HTTP URL")
        with urlopen(args.url, timeout=15) as response:
            require(response.geturl() == args.url, "Test transport must not redirect")
            served = response.read(application.stat().st_size + 1)
        require(hashlib.sha256(served).hexdigest() == artifact_hash,
                "Loopback test must serve the exact generated standalone artifact")
    location = args.url or application.as_uri()
    portal = source_file(args.portal)
    database = source_file(args.database) if args.database else None
    parts = [source_file(path) for path in (args.database_parts or [])]
    sources = [portal, *([database] if database else parts)]
    original_hashes = {path: digest(path) for path in sources}
    evidence = external_directory(args.report) if args.report else None
    started = time.monotonic()
    with sync_playwright() as playwright:
        executable = os.environ.get("CHROMIUM_PATH") or shutil.which("chromium")
        browser = playwright.chromium.launch(executable_path=executable, headless=True, args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, accept_downloads=True)
        # No private payload may leave even if an implementation regression tries
        # to fetch an external asset. Requests are still recorded as failures.
        page = context.new_page()
        page.set_default_timeout(15000)
        review = FileReview(page, location, evidence, portal, database, parts)
        context.route(re.compile(r"^https?://", re.I),
                      lambda route: route.continue_() if review.allowed_document(route.request) else route.abort())
        def reject_socket(socket):
            review.websockets.append(socket.url)
            socket.close(code=1008, reason="Offline portal QA forbids network connections")
        context.route_web_socket(re.compile(r"^wss?://", re.I), reject_socket)
        review.check("reject unreviewed HTML without executing source scripts", review.wrong_source)
        review.check("standalone application, local source loading and dashboard", review.bootstrap)
        bootstrapped = review.results[-1]["passed"]
        if bootstrapped:
            if not args.load_only:
                for company in COMPANIES:
                    review.check(f"{company} trends, metrics, history, YoY and T3M", lambda company=company: review.trends(company))
            scenarios = [] if args.load_only else [
                    ("date filters and private CSV integrity", review.range_and_csv),
                    ("all company research accordions", review.research),
                    ("CME advanced sections", review.advanced),
                    ("all company consensus and scenario controls", review.consensus),
                    ("prediction views and independent fee calculations", review.prediction),
                    ("market data and autonomous context", review.market_data),
                    ("data exports and source-quality coverage", review.data_quality),
                    ("browser print export", review.print_export),
                    ("mobile layout and charts", review.mobile),
            ]
            scenarios.extend([
                    ("downloaded chart PNG renders", review.chart_export),
                    ("reset and reload clear the private session", review.reset),
            ])
            for name, task in scenarios:
                review.check(name, task)
        review.check("browser errors and no network beyond explicit document navigation", review.network_clean)
        review.check("original files remain byte-identical",
                     lambda: require(all(digest(path) == before for path, before in original_hashes.items()),
                                     "Selected source file changed"))
        report = {
            "results": review.results, "pageErrors": review.errors, "consoleErrors": review.console_errors,
            "externalRequests": review.external, "webSockets": review.websockets,
            "documentRequests": review.document_requests,
            "failedHTTP": review.failed_http, "passed": sum(item["passed"] for item in review.results),
            "total": len(review.results), "browser": browser.version,
            "platform": platform.system(), "transport": "loopback document only" if args.url else "file://",
            "artifactSha256": artifact_hash,
            "seconds": round(time.monotonic() - started, 2),
        }
        if evidence:
            (evidence / "browser-file-results.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        context.close()
        browser.close()
    print(f'{report["passed"]}/{report["total"]} completed browser checks passed.')
    if not bootstrapped:
        print("Remaining integration checks were blocked by local source bootstrap failure.")
    return 0 if report["passed"] == report["total"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

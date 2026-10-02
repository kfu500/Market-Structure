"""Synthetic chart PNG/download checks, using a loopback-only browser fixture."""
import base64
import functools
import hashlib
import http.server
import io
import json
import os
import pathlib
import shutil
import subprocess
import tempfile
import threading

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def main():
    builder = """
      import {build} from 'esbuild';
      const result = await build({stdin:{contents:
        "import {createChartPng,exportVisibleChart} from './browser/export-chart.js'; window.syntheticChartExport={createChartPng,exportVisibleChart};",
        resolveDir:process.cwd(),sourcefile:'synthetic-chart-fixture.js'},
        bundle:true,format:'iife',write:false,logLevel:'silent'});
      process.stdout.write(result.outputFiles[0].text);
    """
    bundle = subprocess.run(['node', '--input-type=module', '-e', builder], cwd=ROOT,
                            text=True, capture_output=True, check=True).stdout
    digest = base64.b64encode(hashlib.sha256(bundle.encode()).digest()).decode()
    policy = ("default-src 'none'; script-src 'sha256-" + digest
              + "'; style-src 'unsafe-inline'; img-src blob:; connect-src 'none';")
    fixture = f"""<!doctype html><meta charset="utf-8">
      <meta http-equiv="Content-Security-Policy" content="{policy}">
      <title>Synthetic chart export</title>
      <style>.synthetic-fill {{ fill: rgb(20, 80, 180); }} .synthetic-label {{ font: 12px sans-serif; fill: black; }}</style>
      <div id="legacy-root">
        <svg width="240" height="120" style="display:none"><rect width="240" height="120" fill="red"/></svg>
        <svg width="20" height="20"><rect width="20" height="20" fill="red"/></svg>
        <svg id="synthetic-chart" xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120">
          <defs><linearGradient id="synthetic-gradient"><stop offset="0" stop-color="lime"/><stop offset="1" stop-color="lime"/></linearGradient></defs>
          <rect class="synthetic-fill" x="10" y="10" width="80" height="40"/>
          <rect x="110" y="10" width="80" height="40" fill="url(#synthetic-gradient)"/>
          <text class="synthetic-label" x="10" y="90">Synthetic chart</text>
        </svg>
      </div><script>{bundle}</script>"""
    with tempfile.TemporaryDirectory(prefix='market-structure-synthetic-chart-') as directory:
        pathlib.Path(directory, 'fixture.html').write_text(fixture)
        handler = functools.partial(QuietHandler, directory=directory)
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            with sync_playwright() as playwright:
                executable = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
                browser = playwright.chromium.launch(headless=True, executable_path=executable, args=['--no-sandbox'])
                page = browser.new_page(accept_downloads=True)
                requests, errors = [], []
                page.on('request', lambda request: requests.append(request.url))
                page.on('pageerror', lambda error: errors.append(str(error)))
                address = f'http://127.0.0.1:{server.server_port}/fixture.html'
                page.goto(address)
                result = page.evaluate("""async () => {
                  const result = await syntheticChartExport.createChartPng();
                  const bytes = new Uint8Array(await result.blob.arrayBuffer());
                  return {width:result.width,height:result.height,type:result.blob.type,
                    bytes:Array.from(bytes)};
                }""")
                assert result['width'] == 480 and result['height'] == 240, result
                assert result['type'] == 'image/png'
                png = bytes(result['bytes'])
                assert png.startswith(b'\x89PNG\r\n\x1a\n')
                decoded = Image.open(io.BytesIO(png)).convert('RGB')
                assert decoded.getpixel((50, 40)) == (20, 80, 180), 'Computed fill was not preserved'
                assert decoded.getpixel((260, 40)) == (0, 255, 0), 'Local SVG paint reference was not preserved'
                assert decoded.getpixel((450, 220)) == (255, 255, 255), 'Background must be white'
                with page.expect_download() as pending:
                    outcome = page.evaluate('syntheticChartExport.exportVisibleChart()')
                download = pending.value
                assert download.suggested_filename == 'Market-Structure-Chart.png'
                assert download.failure() is None
                saved = pathlib.Path(directory, 'synthetic-chart.png')
                download.save_as(saved)
                assert Image.open(saved).size == (480, 240)
                assert outcome['filename'] == download.suggested_filename
                page.locator('#synthetic-chart').evaluate("node => node.style.display = 'none'")
                missing = page.evaluate("""async () => {
                  try {await syntheticChartExport.createChartPng(); return 'unexpected success';}
                  catch(error) {return error.message;}
                }""")
                assert missing.startswith('No visible chart is available.'), missing
                invalid = page.evaluate("""async () => {
                  try {await syntheticChartExport.createChartPng({scale:20}); return 'unexpected success';}
                  catch(error) {return error.message;}
                }""")
                assert 'export scale' in invalid, invalid
                assert not errors, errors
                assert all(url == address or url.startswith('blob:') for url in requests), requests
                browser.close()
                print(json.dumps({'syntheticChartExport': 'passed', 'checks': [
                    'hidden charts and icons skipped', 'computed styles', 'local SVG paint references',
                    'PNG dimensions and pixels', 'white background', 'browser download',
                    'missing chart error', 'scale bounds', 'no network assets']}))
        finally:
            server.shutdown()
            server.server_close()


if __name__ == '__main__':
    main()

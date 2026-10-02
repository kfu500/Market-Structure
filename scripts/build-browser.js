import { build } from 'esbuild';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = text => createHash('sha256').update(text).digest('hex');
const cspHash = text => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

/** Builds exclusively from repository application code and pinned dependencies.
 * Never reads private originals, environment variables or runtime snapshots.
 */
export async function generateBrowserHtml() {
  const names = (await readdir(path.join(root, 'public/legacy'))).filter(name => /^module-\d{3}\.js$/.test(name)).sort();
  const reviewedModules = Object.fromEntries(await Promise.all(names.map(async name => [name, await readFile(path.join(root, 'public/legacy', name), 'utf8')])));
  const source = await readFile(path.join(root, 'public/legacy-hooks.js'), 'utf8');
  const assets = { reviewedModules, hooks: { source, sha256: hash(source) },
    wasmBase64: (await readFile(path.join(root, 'node_modules/sql.js/dist/sql-wasm.wasm'))).toString('base64') };
  const result = await build({
    absWorkingDir: root, entryPoints: ['browser/app.js'], bundle: true, write: false,
    platform: 'browser', format: 'iife', target: ['chrome110', 'edge110'], minify: true,
    legalComments: 'inline', logLevel: 'silent',
    plugins: [{ name: 'reviewed-browser-assets', setup(builder) {
      builder.onResolve({ filter: /^portal:assets$/ }, () => ({ path: 'assets', namespace: 'portal' }));
      builder.onLoad({ filter: /.*/, namespace: 'portal' }, () => ({ contents: Object.entries(assets).map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`).join('\n'), loader: 'js' }));
      // SQL.js includes unreachable Node branches in its universal wrapper.
      // Browser execution has no Node globals; these stubs fail if misused.
      builder.onResolve({ filter: /^(?:fs|path|crypto)$/ }, args => {
        if (!args.importer.includes('/node_modules/sql.js/')) throw new Error('Unexpected Node dependency in browser application.');
        return { path: args.path, namespace: 'node-unavailable' };
      });
      builder.onLoad({ filter: /.*/, namespace: 'node-unavailable' }, () => ({ contents: 'throw new Error("Node APIs are unavailable in the browser edition.");', loader: 'js' }));
    } }],
  });
  const javascript = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const csp = `default-src 'none'; script-src ${[javascript, ...Object.values(reviewedModules), source].map(cspHash).join(' ')} 'wasm-unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`;
  const css = `${await readFile(path.join(root, 'public/legacy-bridge.css'), 'utf8')}\n${await readFile(path.join(root, 'browser/app.css'), 'utf8')}`;
  const template = await readFile(path.join(root, 'browser/shell.html'), 'utf8');
  const notices = (await readFile(path.join(root, 'browser/THIRD_PARTY_NOTICES.txt'), 'utf8')).replace(/-->/g, '-- >');
  // Use callbacks so $ sequences in bundled code remain literal replacement data.
  return template.replace('__BROWSER_CSP__', () => csp).replace('__BROWSER_NOTICES__', () => notices).replace('__BROWSER_CSS__', () => css).replace('__BROWSER_JS__', () => javascript);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const html = await generateBrowserHtml();
  await writeFile(path.join(root, 'Open-Market-Structure.html'), html);
  console.log(`Built code-only Open-Market-Structure.html (${Buffer.byteLength(html).toLocaleString()} bytes).`);
}

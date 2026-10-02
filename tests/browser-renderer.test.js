import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyPresentation } from '../browser/render-portal.js';

const hash = text => createHash('sha256').update(text).digest('hex');

function synthetic() {
  const source = 'const syntheticValue = 1;';
  const hooks = 'window.syntheticHook = true;';
  const shell = '<main id="synthetic-panel">Synthetic example</main>';
  const css = '.synthetic-panel { color: black; }';
  return {
    snapshot: { components: { DB: { synthetic: true }, syntheticData: [] },
      manifest: { counts: { observations: 0, metrics: 0, components: 2, research: 0 }, validation: { warnings: [] } } },
    presentation: { shell, css, content: { schemaVersion: 1,
      modules: [{ id: 'module-000', file: 'module-000.js', sha256: hash(source) }],
      literals: { 'module-000': [] }, jsonScripts: [{ id: 'syntheticData' }],
      shellSha256: hash(shell), stylesSha256: hash(css) } },
    reviewedModules: { 'module-000.js': source }, hooks: { source: hooks, sha256: hash(hooks) },
  };
}

test('browser renderer uses only checked bundled sources', () => {
  const input = synthetic();
  assert.deepEqual(verifyPresentation(input), [{ id: 'module-000', source: input.reviewedModules['module-000.js'] }]);
  input.reviewedModules['module-000.js'] += '\nwindow.unreviewed = true;';
  assert.throws(() => verifyPresentation(input), /does not match/);
});

test('browser renderer rejects missing, added, reordered and duplicate module manifests', () => {
  const added = synthetic();
  added.reviewedModules['module-001.js'] = 'const syntheticSecond = 2;';
  assert.throws(() => verifyPresentation(added), /does not match/);
  added.presentation.content.modules.push({ id: 'module-001', file: 'module-001.js', sha256: hash(added.reviewedModules['module-001.js']) });
  added.presentation.content.literals['module-001'] = [];
  assert.equal(verifyPresentation(added).length, 2);
  added.presentation.content.modules.reverse();
  assert.throws(() => verifyPresentation(added), /manifest/);
  added.presentation.content.modules[0] = added.presentation.content.modules[1];
  assert.throws(() => verifyPresentation(added), /manifest/);
  const missing = synthetic();
  delete missing.reviewedModules['module-000.js'];
  assert.throws(() => verifyPresentation(missing), /does not match/);
});

test('browser renderer validates shell, styles and integration fingerprints', () => {
  for (const key of ['shell', 'css']) {
    const input = synthetic();
    input.presentation[key] += ' ';
    assert.throws(() => verifyPresentation(input), /integrity/);
  }
  const changedHooks = synthetic();
  changedHooks.hooks.source += ' ';
  assert.throws(() => verifyPresentation(changedHooks), /integration.*integrity/);
});

test('browser renderer rejects source active content and external stylesheet resources', () => {
  for (const shell of ['<script>window.synthetic = true;</script>', '<div onclick="alert(1)"></div>',
    '<iframe src="https://invalid.example"></iframe>', '<style>body { color: red }</style>']) {
    const input = synthetic();
    input.presentation.shell = shell;
    input.presentation.content.shellSha256 = hash(shell);
    assert.throws(() => verifyPresentation(input), /active content/);
  }
  for (const css of ['@import "https://invalid.example/test.css";', 'body { background: url(https://invalid.example/image) }']) {
    const input = synthetic();
    input.presentation.css = css;
    input.presentation.content.stylesSha256 = hash(css);
    assert.throws(() => verifyPresentation(input), /active content/);
  }
});

test('browser renderer preserves component boundaries and rejects unknown literal pools', () => {
  const missing = synthetic();
  delete missing.snapshot.components.syntheticData;
  assert.throws(() => verifyPresentation(missing), /component.*unavailable/);
  const duplicate = synthetic();
  duplicate.presentation.content.jsonScripts.push({ id: 'syntheticData' });
  assert.throws(() => verifyPresentation(duplicate), /component.*duplicated/);
  const invalid = synthetic();
  invalid.presentation.content.jsonScripts = [{ id: '../syntheticData' }];
  assert.throws(() => verifyPresentation(invalid), /component/);
  const extra = synthetic();
  extra.presentation.content.literals['module-099'] = [];
  assert.throws(() => verifyPresentation(extra), /unexpected literal pool/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { portHtml, portFiles, transformScript, separateMainDatabase, verifyGeneratedCode } from '../scripts/port-legacy-ui.js';

// All supplied content in this file is deliberately synthetic.
function runSynthetic(sources, components = {}) {
  const globals = { window: {}, String, RegExp, BigInt };
  globals.__MARKET_STRUCTURE_RUNTIME__ = { snapshot: { components }, template: value => `${value}`, RegExp, BigInt };
  const context = vm.createContext(globals);
  const outputs = sources.map((source, index) => transformScript(source, `module-${String(index).padStart(3, '0')}`));
  globals.__MARKET_STRUCTURE_RUNTIME__.literal = (moduleId, index) => outputs[Number(moduleId.split('-')[1])].pool[index];
  for (const output of outputs) vm.runInContext(output.code, context);
  return { context, outputs };
}

test('private strings, numbers, regexes and template fragments stay out of executable assets', () => {
  const source = `// SYNTHETIC_PRIVATE_COMMENT
    const secret = 'SYNTHETIC_PRIVATE_LITERAL';
    const record = { 'SYNTHETIC_PRIVATE_KEY': 918273645, 918273646: 'value' };
    const expression = /SYNTHETIC_PRIVATE_REGEX/gi;
    window.result = \`SYNTHETIC_PRIVATE_TEMPLATE:\${secret}:\${record['SYNTHETIC_PRIVATE_KEY']}\`;
    window.matches = expression.test('synthetic_private_regex');
    window.value = record[918273646];
  `;
  const { context, outputs } = runSynthetic([source]);
  const code = outputs[0].code;
  for (const value of ['SYNTHETIC_PRIVATE', '918273645', '918273646']) assert.equal(code.includes(value), false);
  assert.equal(context.window.result, 'SYNTHETIC_PRIVATE_TEMPLATE:SYNTHETIC_PRIVATE_LITERAL:918273645');
  assert.equal(context.window.matches, true);
  assert.equal(context.window.value, 'value');
});

test('template interpolation preserves string coercion, numeric sequence and evaluation order', () => {
  const { context } = runSynthetic([`
    let counter = 0;
    const object = { toString() { return 'synthetic-object'; }, valueOf() { return 100; } };
    window.result = \`\${++counter}\${++counter}:\${object}:\${null}:\${undefined}\`;
    window.counter = counter;
  `]);
  assert.equal(context.window.result, '12:synthetic-object:null:undefined');
  assert.equal(context.window.counter, 2);
});

test('regular expression flags, property keys, object prototype and BigInt survive rewriting', () => {
  const { context } = runSynthetic([`
    'use strict';
    const object = { '__proto__': { inherited: 'synthetic-parent' }, 'own': 10 };
    class Example { 'method'() { return 12n; } }
    window.result = [object.inherited, object.own, new Example().method(), /a+/gi.test('AAA')];
  `]);
  assert.deepEqual(Array.from(context.window.result), ['synthetic-parent', 10, 12n, true]);
});

test('provider identifiers with numeric IDs remain private data keys', () => {
  const { context, outputs } = runSynthetic(['const metrics = { N_987654321: 42 }; window.result = metrics.N_987654321;']);
  assert.equal(context.window.result, 42);
  assert.equal(outputs[0].code.includes('N_987654321'), false);
});

test('the emitted-code audit rejects literal or template content that escaped separation', () => {
  for (const source of ['window.value="SYNTHETIC_PRIVATE"', 'window.value=987654321', 'window.value=/synthetic/i', 'window.value=`synthetic`']) {
    assert.throws(() => verifyGeneratedCode(source), /Unseparated/);
  }
  assert.throws(() => transformScript('window.value=1e400', 'module-000'), /Non-finite/);
  assert.equal(verifyGeneratedCode(transformScript('window.value="synthetic"', 'module-000').code), true);
});

test('ordered classic scripts retain shared lexical globals and function wrappers', () => {
  const { context } = runSynthetic([
    'const state = { value: 3 }; function total() { return state.value; }',
    'const prior = total; total = () => prior() * 4; window.result = total();',
  ]);
  assert.equal(context.window.result, 12);
});

test('injected helpers are unaffected by local window, RegExp, BigInt or String bindings', () => {
  const { context } = runSynthetic([`
    const output = window;
    function example() {
      const pattern = /synthetic/gi;
      const amount = 123n;
      const value = 'synthetic';
      const window = 1, RegExp = 2, BigInt = 3, String = 4;
      return [pattern.test('SYNTHETIC'), amount, \`\${value}:\${window + RegExp + BigInt + String}\`];
    }
    output.result = example();
  `]);
  assert.deepEqual(Array.from(context.window.result), [true, 123n, 'synthetic:10']);
});

test('source cannot shadow the reserved runtime alias or introduce a dynamic scope', () => {
  assert.throws(() => transformScript('const __MARKET_STRUCTURE_RUNTIME__ = {}', 'module-000'), /reserved runtime alias/);
  assert.throws(() => transformScript('with (window) { value = "synthetic" }', 'module-000'), /with scopes/);
});

test('main JSON is parsed statically, escaped delimiters preserved and shared analytics substituted', () => {
  const source = 'const DB={"private":"SYNTHETIC_PRIVATE_VALUE","nested":{"text":"}\\\"{"}}; const Analytics=(()=>{throw Error("must not run")})(); window.result=DB.private; window.analytics=Analytics;';
  const separated = separateMainDatabase(source);
  assert.equal(separated.database.nested.text, '}"{');
  const transformed = transformScript(source, 'module-000');
  assert.equal(transformed.code.includes('SYNTHETIC_PRIVATE'), false);
  assert.equal(transformed.pool.includes('must not run'), false);
  const globals = {};
  const runtime = { snapshot: { components: { DB: separated.database } }, analytics: { synthetic: true }, literal: (_, index) => transformed.pool[index] };
  vm.runInNewContext(transformed.code, { window: globals, __MARKET_STRUCTURE_RUNTIME__: runtime });
  assert.equal(globals.result, 'SYNTHETIC_PRIVATE_VALUE');
  assert.equal(globals.analytics.synthetic, true);
});

test('HTML separation preserves private markup and CSS while removing all executable and JSON scripts', () => {
  const html = `<html><head><style>.synthetic { color: red; }</style></head><body><p>SYNTHETIC_PRIVATE_MARKUP</p><script type="application/json" id="syntheticData">{"text":"SYNTHETIC_PRIVATE_JSON"}</script><script>window.label='SYNTHETIC_PRIVATE_JS';</script><style>.second { margin: 0; }</style></body></html>`;
  const result = portHtml(html);
  assert.equal(result.codes.size, 1);
  assert.equal(result.content.jsonScripts[0].id, 'syntheticData');
  assert.equal(result.components.syntheticData.text, 'SYNTHETIC_PRIVATE_JSON');
  assert.equal(result.shell.includes('<script'), false);
  assert.equal(result.shell.includes('<style'), false);
  assert.equal(result.shell.includes('SYNTHETIC_PRIVATE_MARKUP'), true);
  assert.match(result.css, /synthetic/);
  assert.equal(result.codes.get('module-000.js').includes('SYNTHETIC_PRIVATE'), false);
  assert.equal(Object.hasOwn(result.content, 'components'), false);
});

test('unsupported executable behavior fails closed without evaluating source', () => {
  for (const source of [
    'fetch("https://synthetic.invalid")', 'window["fetch"]("synthetic")',
    'eval("synthetic")', 'new Function("synthetic")',
    'document.cookie', 'localStorage.getItem("synthetic")',
    'document.createElement("script")', 'setTimeout("synthetic", 10)',
    'tag`synthetic`', 'import("synthetic")',
  ]) assert.throws(() => transformScript(source, 'module-000'), /Unsupported|not supported/);
  assert.throws(() => portHtml('<script src="synthetic.js"></script>'), /External/);
  assert.throws(() => portHtml('<button onclick="synthetic()">Click</button>'), /event handlers/);
  assert.throws(() => portHtml('<iframe src="synthetic"></iframe>'), /embedded/);
});

test('private output remains external, complete and no-overwrite', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'synthetic-legacy-port-'));
  try {
    const source = path.join(directory, 'source.html');
    await writeFile(source, '<html><body><script>window.synthetic="private";</script></body></html>');
    const options = { source, privateOutput: path.join(directory, 'private'), codeOutput: path.join(directory, 'review') };
    const result = await portFiles(options);
    assert.equal(result.modules, 1);
    const content = JSON.parse(await readFile(path.join(options.privateOutput, 'ui-content.json'), 'utf8'));
    assert.equal(content.literals['module-000'][0], 'private');
    await assert.rejects(portFiles(options), /EEXIST/);
    await assert.rejects(portFiles({ ...options, privateOutput: path.resolve('synthetic-private-forbidden') }), /outside the repository/);
    const otherCheckout = path.join(directory, 'other-checkout');
    await mkdir(path.join(otherCheckout, '.git'), { recursive: true });
    await writeFile(path.join(otherCheckout, '.git', 'HEAD'), 'ref: refs/heads/synthetic\n');
    await assert.rejects(portFiles({ ...options, privateOutput: path.join(otherCheckout, 'private') }), /outside every Git checkout/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

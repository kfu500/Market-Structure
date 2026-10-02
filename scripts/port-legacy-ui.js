#!/usr/bin/env node
/**
 * Statically separate a supplied portal's presentation code from private content.
 * Uploaded JavaScript is parsed, never evaluated. Review generated code before use.
 */
import { parse } from 'acorn';
import { generate } from 'astring';
import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_SOURCE_BYTES = 96 * 1024 * 1024;
const RUNTIME_ALIAS = '__MARKET_STRUCTURE_RUNTIME__';
const BLOCKED_IDENTIFIERS = new Set([
  'eval', 'Function', 'AsyncFunction', 'GeneratorFunction', 'fetch',
  'XMLHttpRequest', 'WebSocket', 'EventSource', 'Worker', 'SharedWorker',
  'serviceWorker', 'localStorage', 'sessionStorage', 'indexedDB',
]);
const BLOCKED_PROPERTIES = new Set(['cookie', 'sendBeacon', 'write', 'writeln']);
const hash = value => createHash('sha256').update(value).digest('hex');
const identifier = name => ({ type: 'Identifier', name });
const literal = value => ({ type: 'Literal', value });
const member = (object, property) => ({ type: 'MemberExpression', object, property: identifier(property), computed: false, optional: false });
const call = (callee, args) => ({ type: 'CallExpression', callee, arguments: args, optional: false });

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') continue;
    if (Array.isArray(value)) value.forEach(child => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}

/** Conservative gate, followed by human review; not a general JS sandbox. */
export function inspectProgram(program) {
  walk(program, node => {
    if (node.type === 'Identifier' && node.name === RUNTIME_ALIAS) throw new Error('Source collides with the reserved runtime alias');
    if (node.type === 'WithStatement') throw new Error('Dynamic with scopes are not supported');
    if (node.type === 'TaggedTemplateExpression' || node.type === 'ImportExpression' || node.type.startsWith('Import') || node.type.startsWith('Export')) {
      throw new Error(`Unsupported executable syntax: ${node.type}`);
    }
    if (node.type === 'Identifier' && BLOCKED_IDENTIFIERS.has(node.name)) {
      throw new Error(`Unsupported executable capability: ${node.name}`);
    }
    if (node.type === 'MemberExpression') {
      const property = node.computed && node.property.type === 'Literal' ? node.property.value : node.property.name;
      if (BLOCKED_IDENTIFIERS.has(property) || BLOCKED_PROPERTIES.has(property)) {
        throw new Error(`Unsupported executable property: ${property}`);
      }
    }
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
      const property = node.callee.computed ? node.callee.property.value : node.callee.property.name;
      const tag = node.arguments[0];
      if (property === 'createElement' && (tag?.type !== 'Literal' || /^(script|iframe|object|embed|link|img)$/i.test(String(tag.value)))) {
        throw new Error('Unsupported active element creation');
      }
    }
    if (node.type === 'CallExpression' && ['setTimeout', 'setInterval'].includes(node.callee.name) && node.arguments[0]?.type === 'Literal') {
      throw new Error('String timers are not supported');
    }
  });
}

/** Verify that the only remaining literals are public loader syntax. */
export function verifyGeneratedCode(code) {
  const program = parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
  function visit(node, parent) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'TemplateElement' || (node.type === 'Literal' && node.regex)) throw new Error('Unseparated literal content remains');
    if (node.type === 'Literal' && ![null, true, false].includes(node.value)) {
      const accessor = parent?.type === 'CallExpression'
        && parent.callee.type === 'MemberExpression'
        && parent.callee.object.name === RUNTIME_ALIAS
        && parent.callee.property.name === 'literal';
      const moduleName = accessor && parent.arguments[0] === node && /^module-\d{3}$/.test(node.value);
      const poolIndex = accessor && parent.arguments[1] === node && Number.isSafeInteger(node.value) && node.value >= 0;
      const directive = parent?.type === 'ExpressionStatement' && parent.directive === 'use strict' && node.value === 'use strict';
      if (!moduleName && !poolIndex && !directive) throw new Error('Unseparated literal content remains');
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(child => visit(child, node));
      else if (value && typeof value === 'object') visit(value, node);
    }
  }
  visit(program, null);
  return true;
}

/** Parse the main JSON assignment without evaluating any JavaScript. */
export function separateMainDatabase(source) {
  const match = source.match(/^\s*const\s+DB\s*=\s*\{/);
  if (!match) return { source, database: null };
  const start = match[0].lastIndexOf('{');
  let depth = 0;
  let quoted = false;
  let escaped = false;
  let end = -1;
  for (let index = start; index < source.length; index++) {
    const character = source[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') quoted = true;
    else if (character === '{' || character === '[') depth++;
    else if (character === '}' || character === ']') {
      depth--;
      if (depth === 0) { end = index + 1; break; }
    }
  }
  if (end < 0) throw new Error('Unterminated main database JSON');
  const database = JSON.parse(source.slice(start, end));
  return {
    database,
    source: 'const DB = window.__MARKET_STRUCTURE_SNAPSHOT.components.DB' + source.slice(end),
  };
}

/** All data-bearing literals leave the generated executable asset. */
export function transformScript(source, moduleId) {
  if (!/^module-\d{3}$/.test(moduleId)) throw new Error('Invalid generated module identifier');
  const separated = separateMainDatabase(source);
  const program = parse(separated.source, { ecmaVersion: 'latest', sourceType: 'script' });
  inspectProgram(program);
  const pool = [];
  const reference = value => {
    const index = pool.push(value) - 1;
    return call(member(identifier(RUNTIME_ALIAS), 'literal'), [literal(moduleId), literal(index)]);
  };
  function transform(node) {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node.map(transform);
    if (separated.database && node.type === 'VariableDeclarator' && node.id.name === 'DB') {
      return { type: 'VariableDeclarator', id: identifier('DB'), init: member(member(member(identifier(RUNTIME_ALIAS), 'snapshot'), 'components'), 'DB') };
    }
    if (separated.database && node.type === 'VariableDeclarator' && node.id.name === 'Analytics') {
      return { type: 'VariableDeclarator', id: identifier('Analytics'), init: member(identifier(RUNTIME_ALIAS), 'analytics') };
    }
    if (node.type === 'ExpressionStatement' && node.directive === 'use strict') {
      return { type: 'ExpressionStatement', expression: literal('use strict'), directive: 'use strict' };
    }
    if (node.type === 'Literal') {
      if (node.regex) return { type: 'NewExpression', callee: member(identifier(RUNTIME_ALIAS), 'RegExp'), arguments: [reference(node.regex.pattern), reference(node.regex.flags)] };
      if (node.bigint !== undefined) return call(member(identifier(RUNTIME_ALIAS), 'BigInt'), [reference(node.bigint)]);
      if (typeof node.value === 'number' && !Number.isFinite(node.value)) throw new Error('Non-finite numeric literals are not supported');
      if (typeof node.value === 'string' || typeof node.value === 'number') return reference(node.value);
      return literal(node.value);
    }
    if (node.type === 'TemplateLiteral') {
      // String() uses the string primitive hint, as template interpolation does.
      // Unsupported Symbol interpolation is rejected by the helper expression.
      let result = reference(node.quasis[0].value.cooked);
      for (let index = 0; index < node.expressions.length; index++) {
        const expression = call(member(identifier(RUNTIME_ALIAS), 'template'), [transform(node.expressions[index])]);
        result = { type: 'BinaryExpression', operator: '+', left: result, right: expression };
        result = { type: 'BinaryExpression', operator: '+', left: result, right: reference(node.quasis[index + 1].value.cooked) };
      }
      return result;
    }
    const output = {};
    for (const [key, value] of Object.entries(node)) {
      if (['start', 'end', 'raw', 'loc', 'range'].includes(key)) continue;
      output[key] = transform(value);
    }
    if (node.type === 'Property' && !node.computed && node.key.type === 'Literal') {
      // __proto__ in an object initializer has special setter semantics.
      if (node.key.value === '__proto__' && node.kind === 'init' && !node.method) {
        output.key = identifier('__proto__');
      } else {
        output.computed = true;
      }
    }
    // Provider metric IDs sometimes use legal identifier syntax. They are data
    // keys even when the source omitted quotes, so keep them private as well.
    if (node.type === 'MemberExpression' && !node.computed && /\d{5,}/.test(node.property.name)) {
      output.computed = true;
      output.property = reference(node.property.name);
    }
    if (node.type === 'Property' && !node.computed && node.key.type === 'Identifier' && /\d{5,}/.test(node.key.name)) {
      output.computed = true;
      output.key = reference(node.key.name);
      output.shorthand = false;
    }
    // Class member literal names must also become computed accesses.
    if (['MethodDefinition', 'PropertyDefinition'].includes(node.type) && !node.computed && node.key.type === 'Literal') output.computed = true;
    return output;
  }
  const transformed = transform(program);
  const code = '// Reviewed presentation code; literal content is supplied by private storage.\n' + generate(transformed);
  // A second parse catches generator/transform defects before writing assets.
  verifyGeneratedCode(code);
  const identifiers = new Set();
  walk(program, node => { if (node.type === 'Identifier') identifiers.add(node.name); });
  return { code, pool, database: separated.database, identifiers: [...identifiers].sort() };
}

function attributes(openingTag) {
  const attributes = {};
  const expression = /([^\s=<>"']+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  const body = openingTag.replace(/^<\w+\b/, '').replace(/>$/, '');
  for (const match of body.matchAll(expression)) attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  return attributes;
}

export function portHtml(html) {
  if (Buffer.byteLength(html) > MAX_SOURCE_BYTES) throw new Error('Source exceeds size limit');
  const scriptPattern = /(<script\b(?:[^"'<>]|"[^"]*"|'[^']*')*>)([\s\S]*?)<\/script\s*>/gi;
  const modules = [];
  const literals = {};
  const components = {};
  const jsonScripts = [];
  const codes = new Map();
  const mapping = [];
  let scriptIndex = 0;
  const shellWithStyles = html.replace(scriptPattern, (block, opening, source, offset) => {
    const attrs = attributes(opening);
    const currentIndex = scriptIndex++;
    if ('src' in attrs) throw new Error('External script sources require separate review');
    const scriptType = (attrs.type || '').toLowerCase();
    if (scriptType === 'application/json') {
      if (!attrs.id || Object.hasOwn(components, attrs.id)) throw new Error('JSON script requires a unique identifier');
      components[attrs.id] = JSON.parse(source);
      jsonScripts.push({ id: attrs.id, scriptIndex: currentIndex });
      return '';
    }
    if (scriptType && !['text/javascript', 'application/javascript'].includes(scriptType)) throw new Error('Unsupported script type');
    const id = `module-${String(modules.length).padStart(3, '0')}`;
    const transformed = transformScript(source, id);
    if (transformed.database) {
      if (Object.hasOwn(components, 'DB')) throw new Error('Duplicate main database');
      components.DB = transformed.database;
    }
    const filename = `${id}.js`;
    modules.push({ id, file: filename, sha256: hash(transformed.code) });
    literals[id] = transformed.pool;
    codes.set(filename, transformed.code);
    mapping.push({ id, originalScriptIndex: currentIndex, originalScriptId: attrs.id ?? null, sourceOffset: offset, sourceSha256: hash(source), identifiers: transformed.identifiers });
    return '';
  });
  if (/<script\b/i.test(shellWithStyles)) throw new Error('Unparsed script element remains');
  if (/\bon[a-z]+\s*=/i.test(shellWithStyles)) throw new Error('Inline event handlers require separate review');
  if (/<(?:iframe|object|embed)\b/i.test(shellWithStyles)) throw new Error('Active embedded content requires separate review');
  const styles = [];
  const shell = shellWithStyles.replace(/<style\b(?:[^"'<>]|"[^"]*"|'[^']*')*>([\s\S]*?)<\/style\s*>/gi, (_, css) => {
    styles.push(css);
    return '';
  });
  if (/<style\b/i.test(shell)) throw new Error('Unparsed style element remains');
  const css = styles.join('\n');
  return {
    shell,
    css,
    components,
    codes,
    content: {
      schemaVersion: 1, modules, literals, jsonScripts, stylesStripped: true,
      shellSha256: hash(shell), stylesSha256: hash(css),
      extraComponents: Object.hasOwn(components, 'databaseManifest') ? { databaseManifest: components.databaseManifest } : {},
    },
    mapping: { schemaVersion: 1, sourceSha256: hash(html), modules: mapping, componentIds: Object.keys(components), sourceScriptCount: scriptIndex },
  };
}

async function resolvedTarget(target) {
  const absolute = path.resolve(target);
  try { return await realpath(absolute); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const parent = path.dirname(absolute);
    if (parent === absolute) throw error;
    return path.join(await resolvedTarget(parent), path.basename(absolute));
  }
}

async function requireExternal(target) {
  const resolved = await resolvedTarget(target);
  const relative = path.relative(REPOSITORY, resolved);
  if (relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) throw new Error('Private inputs and outputs must remain outside the repository');
  // A separate checkout is still an inappropriate place for private material.
  for (let directory = resolved; directory !== path.dirname(directory); directory = path.dirname(directory)) {
    try {
      const git = path.join(directory, '.git');
      const info = await stat(git);
      if (info.isFile()) throw new Error('Private inputs and outputs must remain outside every Git checkout');
      // The cloud platform creates inert .git guards at /workspace and /tmp.
      // An actual repository has HEAD; an empty guard is not a checkout.
      await stat(path.join(git, 'HEAD'));
      throw new Error('Private inputs and outputs must remain outside every Git checkout');
    }
    catch (error) { if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error; }
  }
  return resolved;
}

export async function portFiles({ source, privateOutput, codeOutput }) {
  const input = await requireExternal(source);
  const privateDirectory = await requireExternal(privateOutput);
  const codeDirectory = await requireExternal(codeOutput);
  if (privateDirectory === codeDirectory) throw new Error('Use separate private content and reviewed-code staging directories');
  if ((await stat(input)).size > MAX_SOURCE_BYTES) throw new Error('Source exceeds size limit');
  const result = portHtml(await readFile(input, 'utf8'));
  await mkdir(privateDirectory, { recursive: true, mode: 0o700 });
  await mkdir(codeDirectory, { recursive: true, mode: 0o700 });
  const writes = [
    ['ui-content.json', JSON.stringify(result.content)],
    ['shell.html', result.shell],
    ['styles.css', result.css],
    ['source-mapping.json', JSON.stringify(result.mapping, null, 2)],
  ];
  for (const [filename, contents] of writes) await writeFile(path.join(privateDirectory, filename), contents, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  for (const [filename, contents] of result.codes) await writeFile(path.join(codeDirectory, filename), contents, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  return { modules: result.codes.size, components: Object.keys(result.components).length, jsonScripts: result.content.jsonScripts.length, privateDirectory, codeDirectory };
}

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  const names = { '--source': 'source', '--private-output': 'privateOutput', '--code-output': 'codeOutput' };
  for (let index = 0; index < args.length; index += 2) {
    if (!names[args[index]] || !args[index + 1]) throw new Error('Usage: node scripts/port-legacy-ui.js --source EXTERNAL_HTML --private-output EXTERNAL_DIR --code-output EXTERNAL_REVIEW_DIR');
    options[names[args[index]]] = args[index + 1];
  }
  if (!options.source || !options.privateOutput || !options.codeOutput) throw new Error('Missing required source/output arguments');
  process.stdout.write(JSON.stringify(await portFiles(options)) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { process.stderr.write(`Port failed: ${error.message}\n`); process.exitCode = 1; });
}

#!/usr/bin/env node
/**
 * Statically separate a supplied portal's presentation code from private content.
 * Uploaded JavaScript is parsed, never evaluated. Review generated code before use.
 */
import { portHtml as portHtmlCore } from '../src/legacy-port-core.js';
export { inspectProgram, verifyGeneratedCode, separateMainDatabase, transformScript } from '../src/legacy-port-core.js';
import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_SOURCE_BYTES = 96 * 1024 * 1024;
const hash = value => createHash('sha256').update(value).digest('hex');
export const portHtml = html => portHtmlCore(html, { hash });

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

import { execFileSync } from 'node:child_process';
import { readFile, lstat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { REPO_ROOT } from '../src/storage.js';
import { validateDataset } from '../src/domain.js';
import { verifyGeneratedCode } from './port-legacy-ui.js';

// This gate is defense in depth, not a substitute for reviewing every diff.
const tracked = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: REPO_ROOT }).toString().split('\0').filter(Boolean);
const files = [...new Set(tracked)];
const problems = [];
const allowedJson = new Set(['package.json', 'package-lock.json', 'examples/synthetic.json']);
const sensitivePath = /(?:^|\/)(?:private|data|research|uploads|originals|backups)(?:\/|$)|(?:^|\/)\.env(?!\.example$)|\.(?:pdf|zip|gz|xlsx?|csv|sqlite3?|db|pem|key)$/i;
for (const file of files) {
  if (sensitivePath.test(file)) problems.push(`Private-data path or artifact: ${file}`);
  const full = path.join(REPO_ROOT, file);
  const info = await lstat(full);
  if (info.isSymbolicLink()) { problems.push(`Symlinks require explicit review and are not allowed: ${file}`); continue; }
  if (info.size > 500_000) { problems.push(`Unexpected embedded/bulk content: ${file}`); continue; }
  if (file.endsWith('.json') && !allowedJson.has(file)) problems.push(`Unexpected JSON data file: ${file}`);
  if (!info.isFile()) continue;
  const content = await readFile(full, 'utf8');
  if (/^public\/legacy\/module-\d{3}\.js$/.test(file)) {
    try { verifyGeneratedCode(content); }
    catch { problems.push(`Private literal or unsupported code in generated asset: ${file}`); }
  }
  if (file !== 'scripts/check-repository.js') {
    if (/data:[^\s"']+;base64,[A-Za-z\d+/=]{256}/.test(content)) problems.push(`Embedded binary content: ${file}`);
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:gh[pousr]_[A-Za-z\d]{30,}|sk-[A-Za-z\d]{30,})/.test(content)) problems.push(`Possible credential: ${file}`);
  }
}
const examples = await readdir(path.join(REPO_ROOT, 'examples'));
if (examples.some(file => file !== 'synthetic.json')) problems.push('Only the audited synthetic fixture is permitted in examples/.');
const fixture = JSON.parse(await readFile(path.join(REPO_ROOT, 'examples/synthetic.json'), 'utf8'));
if (fixture.dataset?.kind !== 'synthetic' || fixture.observations?.some(row => !/synthetic/i.test(row.source))) problems.push('Example data must be explicitly synthetic throughout.');
const validation = validateDataset(fixture);
if (validation.errors.length) problems.push('Synthetic fixture failed validation.');
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
else console.log(`Repository privacy checks passed for ${files.length} candidate files. Review diffs for proprietary prose and unrecognized credential formats before sharing.`);

import { writeFile } from 'node:fs/promises';
import { validateDataset } from '../src/domain.js';
import { externalPath, readJsonFile } from '../src/storage.js';

const args = process.argv.slice(2);
if (args.length !== 4 || !args.includes('--input') || !args.includes('--report')) {
  console.error('Usage: npm run data:validate -- --input /absolute/external/normalized.json --report /absolute/external/new-validation-report.json');
  process.exitCode = 1;
} else {
  try {
    const input = await externalPath(args[args.indexOf('--input') + 1]);
    const report = await externalPath(args[args.indexOf('--report') + 1]);
    const validation = validateDataset(await readJsonFile(input));
    // Error details may name private series. Store them only outside Git and
    // refuse overwriting an original file or an existing report.
    await writeFile(report, `${JSON.stringify(validation, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    console.log(`Validation: ${validation.errors.length} error(s), ${validation.warnings.length} warning(s). Details saved to the private report.`);
    if (validation.errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(error.code ? 'Could not validate or save the report. Check external paths and use a new report filename.' : error.message);
    process.exitCode = 1;
  }
}

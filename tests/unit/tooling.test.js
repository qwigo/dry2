import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');

// This spec exists to guarantee `npm run lint` is actually runnable.
// Today there is no ESLint config file anywhere in the repo, so ESLint
// exits with "Oops! Something went wrong!" before it even reaches the
// source files - `npm run lint` (and prepublishOnly, which depends on
// it) fails on a fresh checkout with zero code changes.
describe('Project tooling', () => {
  it('runs `eslint src/dry2/button.js` without a configuration error', function () {
    this.timeout(20000);

    let output;
    let exitCode = 0;
    try {
      output = execFileSync(
        'npx',
        ['eslint', 'src/dry2/button.js'],
        { cwd: rootDir, encoding: 'utf8', stdio: 'pipe' }
      );
    } catch (error) {
      exitCode = error.status;
      output = `${error.stdout || ''}${error.stderr || ''}`;
    }

    expect(output).to.not.include('Oops! Something went wrong');
    expect(output).to.not.include("couldn't find a configuration file");
    // exitCode 1 (lint errors found) is acceptable here - we're only
    // proving ESLint can locate a config and evaluate the file at all.
    // A missing-config crash exits 2.
    expect(exitCode, `eslint output:\n${output}`).to.not.equal(2);
  });
});

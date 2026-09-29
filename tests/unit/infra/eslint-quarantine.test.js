/**
 * ESLint Quarantine Allowlist Tests
 *
 * Pins the exact set of files excluded from the lint gate via .eslintignore.
 * Issue #13 quarantined tracked files to reach 0 errors; the review (Major)
 * required that quarantine be split by ownership and made impossible to grow
 * silently. Only the three tests/e2e/mobile-*.spec.js files may stay excluded:
 * the issue #14 workstream is functionally rewriting them and will fix their
 * lint and remove their entries when it lands. Any other path — or a stale
 * entry that outlives its owner — fails here with a named diff.
 */

import chai from 'chai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { expect } = chai;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..', '..', '..');
const eslintignorePath = join(repoRoot, '.eslintignore');

// The only files allowed to be excluded from the lint gate. Temporary: issue
// #14 rewrites these specs and must un-quarantine them when it lands.
const ALLOWED_QUARANTINED_PATHS = [
  'tests/e2e/mobile-button.spec.js',
  'tests/e2e/mobile-card.spec.js',
  'tests/e2e/mobile-tabs.spec.js'
];

/**
 * Parse .eslintignore into its active entries: trimmed, non-empty lines that
 * are not comments.
 * @returns {string[]} Quarantined paths in source order.
 */
const getQuarantinedPaths = () => readFileSync(eslintignorePath, 'utf-8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith('#'));

describe('eslint quarantine allowlist', () => {
  it('quarantines exactly the three issue #14 mobile e2e specs', () => {
    const quarantined = getQuarantinedPaths();
    const unexpected = quarantined.filter(
      (path) => !ALLOWED_QUARANTINED_PATHS.includes(path)
    );
    const missing = ALLOWED_QUARANTINED_PATHS.filter(
      (path) => !quarantined.includes(path)
    );

    expect(
      unexpected,
      `unexpected quarantined paths in .eslintignore: ${JSON.stringify(unexpected)} ` +
        '(the lint-gate quarantine may not grow; fix lint instead of excluding files)'
    ).to.deep.equal([]);
    expect(
      missing,
      `allowlisted paths no longer quarantined: ${JSON.stringify(missing)} ` +
        '(update ALLOWED_QUARANTINED_PATHS once the owner lands its fixes)'
    ).to.deep.equal([]);
    expect(
      quarantined.length,
      'quarantine entries must not repeat'
    ).to.equal(ALLOWED_QUARANTINED_PATHS.length);
  });

  it('keeps every quarantined entry commented with its owning issue', () => {
    const source = readFileSync(eslintignorePath, 'utf-8');
    expect(
      source.includes('issue #14'),
      '.eslintignore must reference issue #14 as the temporary owner of the ' +
        'remaining quarantine entries'
    ).to.equal(true);
  });
});

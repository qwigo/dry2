/**
 * ESLint Quarantine Allowlist Tests
 *
 * Pins the exact set of files excluded from the lint gate via .eslintignore.
 * Issue #13 quarantined tracked files to reach 0 errors and the review
 * required that quarantine be split by ownership and made impossible to grow
 * silently. The quarantine is now retired: the theme files (issue #13) and the
 * three tests/e2e/mobile-*.spec.js specs (issue #14) are all lint-clean. The
 * allowlist is pinned to the empty set so any new exclusion must be added
 * deliberately and fails here with a named diff until this pin is updated in
 * the same change.
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

// The only files allowed to be excluded from the lint gate. Retired: issue
// #14 un-quarantined the mobile e2e specs when it landed; keep this empty.
const ALLOWED_QUARANTINED_PATHS = [];

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
  it('quarantines no paths (allowlist pinned empty)', () => {
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

  it('keeps the retirement note in .eslintignore', () => {
    const source = readFileSync(eslintignorePath, 'utf-8');
    expect(
      source.includes('retired'),
      '.eslintignore must keep the retirement note explaining why the ' +
        'allowlist is empty and pinned'
    ).to.equal(true);
  });
});

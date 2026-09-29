/**
 * Example hx-get Include Resolution Tests
 *
 * Scans every examples/*.html showcase page for hx-get="…" targets ending in
 * .html and asserts each referenced file exists relative to examples/. Broken
 * include paths 404 at runtime: issue #12 found examples/dialog-showcase.html
 * pointing at bare nav.inc.html / footer.inc.html, which only exist under
 * examples/partials/.
 */

import chai from 'chai';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { expect } = chai;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const examplesDir = join(__dirname, '..', '..', '..', 'examples');

const HX_GET_HTML_PATTERN = /hx-get\s*=\s*["']([^"']+\.html)["']/g;

/**
 * List the top-level showcase pages under examples/.
 * @returns {string[]} Sorted file names of examples/*.html pages.
 */
const getExamplePages = () => readdirSync(examplesDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort();

/**
 * Extract every hx-get HTML include target from a showcase page.
 * @param {string} pageName - File name of the page under examples/.
 * @returns {string[]} Include targets ending in .html, in source order.
 */
const getHtmlIncludes = (pageName) => {
  const source = readFileSync(join(examplesDir, pageName), 'utf-8');
  const targets = [];
  for (const match of source.matchAll(HX_GET_HTML_PATTERN)) {
    targets.push(match[1].split(/[?#]/)[0]);
  }
  return targets;
};

describe('examples hx-get include resolution', () => {
  const pages = getExamplePages();

  it('scans every examples/*.html page', () => {
    expect(pages.length, 'expected showcase pages under examples/').to.be.greaterThan(0);
  });

  for (const pageName of pages) {
    for (const target of getHtmlIncludes(pageName)) {
      it(`examples/${pageName} resolves hx-get="${target}"`, () => {
        expect(
          existsSync(join(examplesDir, target)),
          `examples/${pageName} hx-get="${target}" does not resolve: ` +
            `missing examples/${target} (404 at runtime)`
        ).to.equal(true);
      });
    }
  }

  it('examples/dialog-showcase.html canonical include targets exist', () => {
    for (const partial of ['partials/nav.inc.html', 'partials/footer.inc.html']) {
      expect(
        existsSync(join(examplesDir, partial)),
        `missing canonical include target examples/${partial} referenced by ` +
          'examples/dialog-showcase.html'
      ).to.equal(true);
    }
  });
});

/**
 * Example hx-get Include Resolution Tests
 *
 * Scans every root-level *.html page and every examples/*.html showcase page
 * for hx-get="…" targets ending in .html and asserts each referenced file
 * exists relative to the page's directory (root pages resolve against the
 * repo root, examples pages against examples/). Broken include paths 404 at
 * runtime: issue #12 found examples/dialog-showcase.html pointing at bare
 * nav.inc.html / footer.inc.html, which only exist under examples/partials/,
 * and root index.html pointing at examples/footer.inc.html after the partial
 * moved to examples/partials/footer.inc.html.
 */

import chai from 'chai';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { expect } = chai;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..', '..', '..');
const examplesDir = join(repoRoot, 'examples');

const HX_GET_HTML_PATTERN = /hx-get\s*=\s*["']([^"']+)["']/gi;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const ABSOLUTE_TARGET_PATTERN = /^[a-z]+:/i;

// Known floor of live includes across the scanned pages. Guards against the
// scan pattern silently breaking and generating zero per-include tests.
const MIN_EXPECTED_INCLUDES = 35;

/**
 * List the top-level showcase pages under examples/.
 * @returns {string[]} Sorted file names of examples/*.html pages.
 */
const getExamplePages = () => readdirSync(examplesDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort();

/**
 * List the root-level *.html pages at the repo root.
 * @returns {string[]} Sorted file names of root *.html pages.
 */
const getRootPages = () => readdirSync(repoRoot, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort();

/**
 * Extract every live hx-get HTML include target from a page, skipping
 * commented-out markup, absolute URLs, and query/hash suffixes.
 * @param {string} source - Raw HTML of the page.
 * @returns {string[]} Include targets ending in .html, in source order.
 */
const getHtmlIncludes = (source) => {
  const live = source.replace(HTML_COMMENT_PATTERN, '');
  const targets = [];
  for (const match of live.matchAll(HX_GET_HTML_PATTERN)) {
    const target = match[1].split(/[?#]/)[0];
    if (ABSOLUTE_TARGET_PATTERN.test(target)) continue;
    if (target.endsWith('.html')) targets.push(target);
  }
  return targets;
};

/**
 * Build the scan plan: every root page and examples page with its include
 * targets and the directory those targets resolve against.
 * @returns {Array<{pageLabel: string, missingLabel: string, dir: string,
 *   targets: string[]}>} One entry per scanned page.
 */
const getScanPlan = () => {
  const plan = [];
  for (const pageName of getRootPages()) {
    plan.push({
      pageLabel: pageName,
      missingLabel: '',
      dir: repoRoot,
      targets: getHtmlIncludes(readFileSync(join(repoRoot, pageName), 'utf-8'))
    });
  }
  for (const pageName of getExamplePages()) {
    plan.push({
      pageLabel: `examples/${pageName}`,
      missingLabel: 'examples/',
      dir: examplesDir,
      targets: getHtmlIncludes(readFileSync(join(examplesDir, pageName), 'utf-8'))
    });
  }
  return plan;
};

describe('examples hx-get include resolution', () => {
  const pages = getExamplePages();
  const scanPlan = getScanPlan();

  it('scans every examples/*.html page', () => {
    expect(pages.length, 'expected showcase pages under examples/').to.be.greaterThan(0);
  });

  it('scans root-level *.html pages', () => {
    expect(getRootPages().length, 'expected root-level *.html pages').to.be.greaterThan(0);
  });

  it(`extracts at least ${MIN_EXPECTED_INCLUDES} hx-get includes across scanned pages`, () => {
    const totalIncludes = scanPlan.reduce((sum, page) => sum + page.targets.length, 0);
    expect(
      totalIncludes,
      `expected >= ${MIN_EXPECTED_INCLUDES} extracted includes, found ${totalIncludes}: ` +
        'the hx-get scan pattern likely stopped matching'
    ).to.be.greaterThanOrEqual(MIN_EXPECTED_INCLUDES);
  });

  for (const page of scanPlan) {
    for (const target of page.targets) {
      it(`${page.pageLabel} resolves hx-get="${target}"`, () => {
        expect(
          existsSync(join(page.dir, target)),
          `${page.pageLabel} hx-get="${target}" does not resolve: ` +
            `missing ${page.missingLabel}${target} (404 at runtime)`
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

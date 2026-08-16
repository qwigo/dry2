import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');

// Link-checks the flagship demo pages: every local <script src="...">
// must resolve to a real file, and every custom-element-like tag used on
// the page must be registered (via customElements.define) by one of the
// scripts the page actually loads. Both pages used to load a bundle
// (src/dry2/dry2.js, dist/dry2.js) that npm run build produces but is
// never committed, so on a fresh checkout every component tag on both
// pages rendered as plain, unstyled, non-interactive markup.
function getLocalScriptSrcs(html) {
  const srcs = [];
  const re = /<script[^>]+src=["']([^"']+)["']/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    const src = match[1];
    if (!/^https?:\/\//.test(src)) {
      srcs.push(src);
    }
  }
  return srcs;
}

function getCustomElementTags(html) {
  const tags = new Set();
  const re = /<([a-z]+-[a-z-]+)[\s>]/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    tags.add(match[1]);
  }
  return tags;
}

function getDefinedTags(scriptContents) {
  const tags = new Set();
  const re = /customElements\.define\(\s*['"]([a-z0-9-]+)['"]/g;
  scriptContents.forEach((content) => {
    let match;
    while ((match = re.exec(content)) !== null) {
      tags.add(match[1]);
    }
  });
  return tags;
}

['index.html', 'examples/index.html'].forEach((relPath) => {
  describe(`Demo page: ${relPath}`, () => {
    const absPath = join(rootDir, relPath);
    const html = readFileSync(absPath, 'utf8');
    const pageDir = dirname(absPath);

    it('every local <script src> resolves to a file on disk', () => {
      const srcs = getLocalScriptSrcs(html);
      expect(srcs.length, 'expected at least one local script tag').to.be.above(0);

      const missing = srcs.filter((src) => !existsSync(join(pageDir, src)));
      expect(missing, `missing script files:\n${missing.join('\n')}`).to.deep.equal([]);
    });

    it('every custom-element tag used on the page is registered by a loaded script', () => {
      const srcs = getLocalScriptSrcs(html).filter((src) => existsSync(join(pageDir, src)));
      const scriptContents = srcs.map((src) => readFileSync(join(pageDir, src), 'utf8'));
      const definedTags = getDefinedTags(scriptContents);
      const usedTags = getCustomElementTags(html);

      const undefinedTags = [...usedTags].filter((tag) => !definedTags.has(tag));
      expect(
        undefinedTags,
        `tags used but never registered by a loaded script: ${undefinedTags.join(', ')}`
      ).to.deep.equal([]);
    });
  });
});

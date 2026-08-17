import './setup.js';

/**
 * HTML sanitization.
 *
 * The accordion sanitizes user content with a chain of regexes over raw
 * markup. That approach is bypassable in both directions - it misses
 * payloads, and it *assembles* payloads out of harmless input, because
 * deleting a substring can join the surrounding text into something
 * dangerous:
 *
 *   javajavascript:script:alert(1)  -> javascript:alert(1)
 *   <scr<script>ipt>                -> <script>
 *
 * Sanitizing has to happen on parsed DOM, not on text. These specs pin
 * that contract on the shared BaseElement._sanitizeHtml helper, which
 * defers to DOMPurify when the page provides it (it is already an
 * optionalDependency) and otherwise walks an inert parsed document.
 */
describe('BaseElement._sanitizeHtml', () => {
  let el;
  let savedDOMPurify;

  beforeEach(() => {
    cleanupDOM();
    savedDOMPurify = global.window.DOMPurify;
    delete global.window.DOMPurify;
    el = document.createElement('div');
    Object.setPrototypeOf(el, global.window.BaseElement.prototype);
  });

  afterEach(() => {
    if (savedDOMPurify === undefined) {
      delete global.window.DOMPurify;
    } else {
      global.window.DOMPurify = savedDOMPurify;
    }
    cleanupDOM();
  });

  /** Parse sanitized output so we assert on DOM, not on string shape. */
  function parse(html) {
    const host = document.createElement('div');
    host.innerHTML = el._sanitizeHtml(html);
    return host;
  }

  describe('event handlers', () => {
    const HANDLER_PAYLOADS = [
      '<img src=x onerror=alert(1)>',              // unquoted - regex missed this entirely
      '<img src=x onerror=`alert(1)`>',            // backticks - also missed
      '<img src="x" onerror="alert(1)">',          // quoted
      "<img src='x' onerror='alert(1)'>",          // single quoted
      '<img src=x OnErRoR=alert(1)>',              // mixed case
      '<div onclick=alert(1)>text</div>',
      '<svg onload=alert(1)></svg>',
      '<body onload=alert(1)>'
    ];

    it('strips every event handler attribute regardless of quoting', () => {
      HANDLER_PAYLOADS.forEach((payload) => {
        const host = parse(payload);
        host.querySelectorAll('*').forEach((node) => {
          node.getAttributeNames().forEach((name) => {
            expect(
              name.toLowerCase().startsWith('on'),
              `"${payload}" left handler attribute ${name}`
            ).to.be.false;
          });
        });
      });
    });
  });

  describe('dangerous elements', () => {
    it('removes script elements', () => {
      const host = parse('<p>ok</p><script>alert(1)</script>');
      expect(host.querySelector('script')).to.equal(null);
      expect(host.querySelector('p')).to.exist;
    });

    it('does not reassemble a script tag from split input', () => {
      // The regex sanitizer turned this into a working "<script>".
      const out = el._sanitizeHtml('<scr<script>ipt>alert(1)</scr</script>ipt>');
      const host = document.createElement('div');
      host.innerHTML = out;
      expect(host.querySelector('script'), `produced: ${out}`).to.equal(null);
    });

    it('removes iframe, object and embed', () => {
      const host = parse(
        '<iframe src="//evil"></iframe><object data="//evil"></object><embed src="//evil">'
      );
      expect(host.querySelector('iframe')).to.equal(null);
      expect(host.querySelector('object')).to.equal(null);
      expect(host.querySelector('embed')).to.equal(null);
    });
  });

  describe('URL schemes', () => {
    it('drops javascript: URLs', () => {
      const host = parse('<a href="javascript:alert(1)">x</a>');
      expect(host.querySelector('a').getAttribute('href')).to.equal(null);
    });

    it('does not reconstruct a javascript: URL from split input', () => {
      // The regex sanitizer deleted the inner "javascript:" and joined
      // "java" + "script:" back into a live scheme.
      const out = el._sanitizeHtml('<a href="javajavascript:script:alert(1)">x</a>');
      const host = document.createElement('div');
      host.innerHTML = out;
      const href = host.querySelector('a')?.getAttribute('href') || '';
      expect(href.replace(/\s+/g, '').toLowerCase(), `produced: ${out}`)
        .to.not.include('javascript:');
    });

    it('catches schemes obfuscated with control characters and whitespace', () => {
      ['java\tscript:alert(1)', ' javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'vbscript:msgbox(1)']
        .forEach((url) => {
          const host = document.createElement('div');
          host.innerHTML = el._sanitizeHtml(`<a href="${url}">x</a>`);
          expect(host.querySelector('a').getAttribute('href'), `for ${JSON.stringify(url)}`)
            .to.equal(null);
        });
    });

    it('blocks data: URLs that can carry script, allows raster images', () => {
      const svgHost = parse('<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">');
      expect(
        svgHost.querySelector('img').getAttribute('src'),
        'data:image/svg+xml can contain script and must be dropped'
      ).to.equal(null);

      const pngHost = parse('<img src="data:image/png;base64,iVBORw0KGgo=">');
      expect(
        pngHost.querySelector('img').getAttribute('src'),
        'raster data: images are safe and commonly used'
      ).to.include('data:image/png');
    });
  });

  describe('legitimate content is preserved', () => {
    it('keeps ordinary markup, links, and data-* attributes intact', () => {
      const host = parse(
        '<p class="lead">Hello <b>world</b> and <i>others</i></p>' +
        '<a href="/docs/page?a=1&amp;b=2" title="Docs">Docs</a>' +
        '<ul><li data-id="7">one</li></ul>' +
        '<img src="https://example.com/a.png" alt="a">'
      );

      expect(host.querySelector('b')).to.exist;
      expect(host.querySelector('i')).to.exist;
      expect(host.querySelector('p').getAttribute('class')).to.equal('lead');
      expect(host.querySelector('a').getAttribute('href')).to.equal('/docs/page?a=1&b=2');
      expect(host.querySelector('a').getAttribute('title')).to.equal('Docs');
      expect(host.querySelector('li').getAttribute('data-id')).to.equal('7');
      expect(host.querySelector('img').getAttribute('src')).to.equal('https://example.com/a.png');
    });

    it('leaves prose that merely mentions a scheme alone', () => {
      const host = parse('<p>Send the data: values, then run javascript: examples</p>');
      expect(host.querySelector('p').textContent)
        .to.equal('Send the data: values, then run javascript: examples');
    });

    it('handles empty and non-string input without throwing', () => {
      expect(el._sanitizeHtml('')).to.equal('');
      expect(el._sanitizeHtml(null)).to.equal('');
      expect(el._sanitizeHtml(undefined)).to.equal('');
    });
  });

  describe('DOMPurify integration', () => {
    it('delegates to DOMPurify when the page provides it', () => {
      const calls = [];
      global.window.DOMPurify = {
        sanitize(html) {
          calls.push(html);
          return '<p>from dompurify</p>';
        }
      };

      const result = el._sanitizeHtml('<p>original</p>');

      expect(calls, 'DOMPurify.sanitize should be used when available')
        .to.deep.equal(['<p>original</p>']);
      expect(result).to.equal('<p>from dompurify</p>');
    });

    it('falls back to the built-in sanitizer when DOMPurify is absent', () => {
      delete global.window.DOMPurify;
      const host = parse('<img src=x onerror=alert(1)><p>kept</p>');
      expect(host.querySelector('p')).to.exist;
      expect(host.querySelector('img').getAttribute('onerror')).to.equal(null);
    });
  });
});

describe('dry-accordion content sanitization', () => {
  before(async () => {
    await import('../../src/dry2/accordion.js');
  });

  beforeEach(() => cleanupDOM());
  afterEach(() => cleanupDOM());

  async function mountAccordion(itemHtml) {
    const el = document.createElement('dry-accordion');
    el.innerHTML = itemHtml;
    document.body.appendChild(el);
    await new Promise((resolve) => setTimeout(resolve, 250));
    return el;
  }

  // These two payloads are live XSS through the accordion's ordinary
  // path today, verified against the rendered DOM. Note that an
  // unquoted `onerror=alert(1)` is NOT one of them: item content is read
  // via item.innerHTML, so the parser has already re-serialized it with
  // quotes by the time the regex sees it, and the quoted-handler pattern
  // happens to match. The failures below need no such luck.
  it('does not reconstruct a javascript: URL while sanitizing item content', async function () {
    this.timeout(5000);
    const el = await mountAccordion(
      '<accordion-item id="one" title="One">' +
      '<a href="javajavascript:script:alert(1)">click</a>' +
      '</accordion-item>'
    );

    const href = el.querySelector('a')?.getAttribute('href') || '';
    expect(
      href.toLowerCase(),
      'deleting the inner "javascript:" joins the remainder back into a live scheme'
    ).to.not.include('javascript:');
  });

  it('catches a scheme obfuscated with an encoded tab in item content', async function () {
    this.timeout(5000);
    const el = await mountAccordion(
      '<accordion-item id="one" title="One">' +
      '<a href="jav&#9;ascript:alert(1)">click</a>' +
      '</accordion-item>'
    );

    const href = el.querySelector('a')?.getAttribute('href') || '';
    // Browsers ignore the tab when resolving the scheme, so this runs.
    expect(
      href.replace(/[\u0000-\u0020]+/g, '').toLowerCase(),
      'tab-obfuscated javascript: survives a literal /javascript:/ regex'
    ).to.not.include('javascript:');
  });

  it('strips event handlers from item content', async function () {
    this.timeout(5000);
    const el = await mountAccordion(
      '<accordion-item id="one" title="One"><img src=x onerror=alert(1)></accordion-item>'
    );

    el.querySelectorAll('*').forEach((node) => {
      node.getAttributeNames().forEach((name) => {
        expect(name.toLowerCase().startsWith('on'), `left handler ${name}`).to.be.false;
      });
    });
  });

  it('keeps legitimate rich content in item bodies', async function () {
    this.timeout(5000);
    const el = await mountAccordion(
      '<accordion-item id="one" title="One">' +
      '<p>Read the <a href="/guide">guide</a> — <b>important</b></p>' +
      '</accordion-item>'
    );

    expect(el.querySelector('a[href="/guide"]'), 'link should survive').to.exist;
    expect(el.querySelector('b'), 'formatting should survive').to.exist;
  });
});

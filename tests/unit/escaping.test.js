import './setup.js';

/**
 * Escaping contract for BaseElement.
 *
 * Components in this library build HTML with template literals and assign
 * it via innerHTML. Interpolated values land in one of three contexts,
 * each needing different escaping:
 *
 *   1. HTML text     -> <span>${v}</span>          -> _escapeHtml
 *   2. HTML attribute -> <a href="${v}">           -> _escapeAttr
 *   3. A JS string literal *inside* an HTML
 *      attribute -> x-data="{ n: '${v}' }"         -> _escapeAlpineString
 *
 * Context 3 is the dangerous one and by far the most common here. At
 * runtime the HTML parser decodes entities in the attribute value FIRST,
 * and only then does Alpine evaluate the result as JavaScript. Escaping
 * therefore has to be applied in the reverse order (JS layer first, then
 * HTML layer) - doing it the other way round looks correct on inspection
 * but leaves the JS layer exploitable.
 *
 * These specs prove the round-trip end to end: build the markup, let
 * jsdom actually parse it, read the attribute back, evaluate it as JS,
 * and check the value survived intact and inert.
 */
describe('BaseElement escaping utilities', () => {
  let el;

  // Values chosen to break each layer: quote/backslash/newline break the
  // JS string literal, angle brackets and ampersand break HTML, and the
  // payloads are real breakout attempts rather than decorative markup.
  const HOSTILE_VALUES = [
    "O'Brien",
    'Say "hi"',
    'back\\slash',
    "both '\" quotes",
    'tab\tand\nnewline\r\n',
    'Q&A',
    '<script>alert(1)</script>',
    '</script><script>alert(1)</script>',
    "', alert(1), '",
    "'; alert(1); //",
    '" onmouseover="alert(1)',
    '&quot;&gt;&lt;img src=x onerror=alert(1)&gt;',
    'javascript:alert(1)',
    '\u2028\u2029 line separators',
    'plain safe text',
    ''
  ];

  beforeEach(() => {
    cleanupDOM();
    el = document.createElement('div');
    Object.setPrototypeOf(el, global.window.BaseElement.prototype);
  });

  afterEach(() => {
    cleanupDOM();
  });

  describe('_escapeHtml (HTML text context)', () => {
    it('escapes the characters that can open a tag or entity', () => {
      expect(el._escapeHtml('<b>&"\'')).to.equal('&lt;b&gt;&amp;&quot;&#39;');
    });

    it('renders hostile values as inert text, creating no elements', () => {
      HOSTILE_VALUES.forEach((raw) => {
        const host = document.createElement('div');
        host.innerHTML = `<span>${el._escapeHtml(raw)}</span>`;
        const span = host.firstElementChild;

        expect(span.children.length, `"${raw}" should create no child elements`).to.equal(0);
        expect(span.textContent, `"${raw}" should round-trip as text`).to.equal(raw);
      });
    });

    it('coerces non-string input instead of throwing', () => {
      expect(el._escapeHtml(null)).to.equal('');
      expect(el._escapeHtml(undefined)).to.equal('');
      expect(el._escapeHtml(42)).to.equal('42');
      expect(el._escapeHtml(false)).to.equal('false');
    });
  });

  describe('_escapeAttr (HTML attribute context)', () => {
    it('keeps hostile values inside the attribute they belong to', () => {
      HOSTILE_VALUES.forEach((raw) => {
        const host = document.createElement('div');
        host.innerHTML = `<a href="${el._escapeAttr(raw)}" data-probe="safe">x</a>`;
        const a = host.firstElementChild;

        // The value must survive intact...
        expect(a.getAttribute('href'), `href should round-trip for "${raw}"`).to.equal(raw);
        // ...without having injected any additional attribute.
        expect(a.getAttribute('data-probe')).to.equal('safe');
        expect(a.getAttributeNames().sort()).to.deep.equal(['data-probe', 'href']);
        expect(a.getAttribute('onmouseover'), `no handler injected via "${raw}"`).to.equal(null);
      });
    });

    it('works in single-quoted attributes too', () => {
      const host = document.createElement('div');
      const raw = "' onmouseover='alert(1)";
      host.innerHTML = `<a href='${el._escapeAttr(raw)}'>x</a>`;
      const a = host.firstElementChild;

      expect(a.getAttribute('href')).to.equal(raw);
      expect(a.getAttribute('onmouseover')).to.equal(null);
    });
  });

  describe('_escapeJs (JavaScript string literal context)', () => {
    it('produces a literal that evaluates back to the original value', () => {
      HOSTILE_VALUES.forEach((raw) => {
        const singleQuoted = new Function(`return '${el._escapeJs(raw)}'`)();
        expect(singleQuoted, `single-quoted literal for "${raw}"`).to.equal(raw);

        const doubleQuoted = new Function(`return "${el._escapeJs(raw)}"`)();
        expect(doubleQuoted, `double-quoted literal for "${raw}"`).to.equal(raw);
      });
    });

    it('escapes newlines, which are a syntax error in a JS string literal', () => {
      const escaped = el._escapeJs('a\nb');
      expect(escaped).to.not.include('\n');
      expect(new Function(`return '${escaped}'`)()).to.equal('a\nb');
    });

    it('escapes < so the literal cannot close an enclosing script block', () => {
      expect(el._escapeJs('</script>')).to.not.include('<');
    });
  });

  describe('_escapeAlpineString (JS literal nested in an HTML attribute)', () => {
    // This is the end-to-end proof: real HTML parsing, then real JS
    // evaluation, in the same order a browser does it.
    function roundTrip(raw) {
      const host = document.createElement('div');
      host.innerHTML =
        `<div x-data="{ name: '${el._escapeAlpineString(raw)}' }" data-probe="safe"></div>`;
      const node = host.firstElementChild;
      // getAttribute returns the HTML-decoded value - exactly the string
      // Alpine would hand to its expression evaluator.
      const data = new Function(`return ${node.getAttribute('x-data')}`)();
      return { node, data };
    }

    it('survives HTML decoding and JS evaluation with the value intact', () => {
      HOSTILE_VALUES.forEach((raw) => {
        const { data } = roundTrip(raw);
        expect(data.name, `x-data value should round-trip for "${raw}"`).to.equal(raw);
      });
    });

    it('never lets a value escape into a new attribute or element', () => {
      HOSTILE_VALUES.forEach((raw) => {
        const { node } = roundTrip(raw);
        expect(node.getAttributeNames().sort(), `attributes for "${raw}"`)
          .to.deep.equal(['data-probe', 'x-data']);
        expect(node.children.length, `no elements injected by "${raw}"`).to.equal(0);
      });
    });

    it('is not simply _escapeAttr applied to the raw value', () => {
      // Guards against the layers being collapsed or applied backwards:
      // attribute-escaping alone leaves the JS layer wide open, because
      // the parser hands the decoded apostrophe straight to the evaluator.
      const attackerValue = "', alert(1), '";
      const attrOnly = `<div x-data="{ name: '${el._escapeAttr(attackerValue)}' }"></div>`;
      const host = document.createElement('div');
      host.innerHTML = attrOnly;
      const decoded = host.firstElementChild.getAttribute('x-data');
      // Attribute-only escaping decodes back to a broken-out expression...
      expect(decoded).to.include('alert(1)');
      expect(() => new Function(`return ${decoded}`)()).to.throw();

      // ...whereas the real helper keeps it as data.
      const { data } = roundTrip(attackerValue);
      expect(data.name).to.equal(attackerValue);
    });
  });

  describe('_createAlpineDataString', () => {
    it('emits a data object that evaluates correctly through an attribute', () => {
      const dataString = el._createAlpineDataString({
        name: "O'Brien",
        quote: 'He said "hi"',
        path: 'C:\\temp',
        multiline: 'a\nb',
        count: 42,
        enabled: true,
        items: ['a', "b'c"]
      });

      const host = document.createElement('div');
      host.innerHTML = `<div x-data="${el._escapeAttr(dataString)}"></div>`;
      const data = new Function(`return ${host.firstElementChild.getAttribute('x-data')}`)();

      expect(data.name).to.equal("O'Brien");
      expect(data.quote).to.equal('He said "hi"');
      expect(data.path).to.equal('C:\\temp');
      expect(data.multiline).to.equal('a\nb');
      expect(data.count).to.equal(42);
      expect(data.enabled).to.equal(true);
      expect(data.items).to.deep.equal(['a', "b'c"]);
    });

    it('does not let a string value break out into executable code', () => {
      const dataString = el._createAlpineDataString({ name: "', alert(1), '" });
      const host = document.createElement('div');
      host.innerHTML = `<div x-data="${el._escapeAttr(dataString)}"></div>`;
      const data = new Function(`return ${host.firstElementChild.getAttribute('x-data')}`)();

      expect(data.name).to.equal("', alert(1), '");
    });
  });
});

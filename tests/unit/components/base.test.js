import '../setup.js';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..', '..');

// The library used to ship two divergent copies of the BaseElement class
// (src/base.js and src/dry2/base.js), plus a third hand-maintained mock in
// tests/unit/setup.js. src/dry2/base.js is the one every component and the
// build script actually use - this spec pins its full helper API and
// guards against the stale duplicate reappearing.
describe('BaseElement (single source of truth)', () => {
  let RealBaseElement;

  before(async () => {
    await import('../../../src/dry2/base.js');
    RealBaseElement = global.window.BaseElement;
  });

  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  it('does not ship a second, divergent copy at src/base.js', () => {
    expect(existsSync(join(rootDir, 'src', 'base.js'))).to.be.false;
  });

  it('extends HTMLElement', () => {
    expect(RealBaseElement.prototype).to.be.instanceOf(HTMLElement);
  });

  it('exposes the full instance helper API components rely on', () => {
    const instanceMethods = [
      '_waitForAlpineAndInitialize',
      '_waitForChildrenAndInitialize',
      '_ensureAlpineProcessing',
      '_initializeComponent',
      '_getAlpineData',
      '_extractContent',
      '_extractSlotContent',
      '_createAlpineDataString',
      '_setAttribute',
      '_getBooleanAttribute',
      '_setBooleanAttribute',
      '_getAttributeWithDefault',
      '_getNumericAttribute',
      '_setNumericAttribute',
      '_updateComponentData',
      '_refresh',
      '_createClassString',
      '_getSizeClasses',
      '_getVariantClasses',
      '_addEventListeners',
      '_dispatchEvent',
      '_handleAttributeChange',
      'attributeChangedCallback',
      'connectedCallback',
      'disconnectedCallback'
    ];

    instanceMethods.forEach((method) => {
      expect(
        RealBaseElement.prototype[method],
        `BaseElement.prototype.${method} should be a function`
      ).to.be.a('function');
    });
  });

  it('the global BaseElement used by component specs has the same full API', () => {
    // tests/unit/setup.js assigns global.BaseElement for component specs
    // to extend - it must not be a hand-rolled, partial mock.
    expect(global.BaseElement).to.be.a('function');
    expect(
      global.BaseElement.prototype._dispatchEvent,
      'global.BaseElement.prototype._dispatchEvent should be a function'
    ).to.be.a('function');
    expect(
      global.BaseElement.prototype._ensureAlpineProcessing,
      'global.BaseElement.prototype._ensureAlpineProcessing should be a function'
    ).to.be.a('function');
    expect(
      global.BaseElement.prototype._getNumericAttribute,
      'global.BaseElement.prototype._getNumericAttribute should be a function'
    ).to.be.a('function');
  });

  it('_getBooleanAttribute/_setBooleanAttribute round-trip correctly', () => {
    const el = document.createElement('div');
    Object.setPrototypeOf(el, RealBaseElement.prototype);

    expect(el._getBooleanAttribute('flag')).to.be.false;
    el._setBooleanAttribute('flag', true);
    expect(el._getBooleanAttribute('flag')).to.be.true;
    el._setBooleanAttribute('flag', false);
    expect(el._getBooleanAttribute('flag')).to.be.false;
  });

  it('_getNumericAttribute falls back to the default for missing/invalid values', () => {
    const el = document.createElement('div');
    Object.setPrototypeOf(el, RealBaseElement.prototype);

    expect(el._getNumericAttribute('count', 5)).to.equal(5);
    el.setAttribute('count', '42');
    expect(el._getNumericAttribute('count', 5)).to.equal(42);
    el.setAttribute('count', 'not-a-number');
    expect(el._getNumericAttribute('count', 5)).to.equal(5);
  });

  it('_dispatchEvent fires a bubbling CustomEvent with the given detail', (done) => {
    const el = document.createElement('div');
    Object.setPrototypeOf(el, RealBaseElement.prototype);
    document.body.appendChild(el);

    document.body.addEventListener('base:test', (event) => {
      expect(event.detail).to.deep.equal({ ok: true });
      done();
    });

    el._dispatchEvent('base:test', { ok: true });
  });
});

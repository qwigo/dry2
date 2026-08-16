import './setup.js';

// This spec exists to guarantee the mocha suite can boot at all under the
// current Node version. tests/unit/setup.js used to assign global.navigator
// directly, which throws on Node >= 21 because navigator is a getter-only
// global there. When that happens, mocha fails before a single test runs
// and every other spec file is reported as an error, not a failure.
describe('Test harness bootstrap', () => {
  it('loads setup.js without throwing', () => {
    expect(typeof window).to.equal('object');
    expect(typeof document).to.equal('object');
  });

  it('exposes a working navigator global', () => {
    expect(navigator).to.exist;
    expect(navigator.userAgent).to.be.a('string');
  });

  it('exposes BaseElement globally for component specs', () => {
    expect(global.BaseElement).to.be.a('function');
    expect(window.BaseElement).to.equal(global.BaseElement);
  });
});

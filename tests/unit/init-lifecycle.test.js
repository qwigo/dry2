import './setup.js';

/**
 * BaseElement initialization lifecycle.
 *
 * These specs exercise the REAL _waitForChildrenAndInitialize and
 * _waitForAlpineAndInitialize. tests/unit/setup.js deliberately
 * overrides both with synchronous versions so component specs aren't
 * timer-dependent, so we reach past that subclass to the real base
 * class it extends.
 *
 * _waitForChildrenAndInitialize races three independent triggers: a
 * MutationObserver, a 100ms poll, and a nested 500ms fallback. Each one
 * calls through to _initializeComponent, and disconnecting the observer
 * does not cancel the pending timers - so more than one can fire and
 * the component initializes repeatedly, with the later passes capturing
 * already-rendered markup as _originalContent.
 */
const RealBaseElement = Object.getPrototypeOf(global.window.BaseElement);

let probeCounter = 0;

/** Define a fresh probe element using the real base class. */
function defineProbe() {
  const tag = `init-probe-${probeCounter++}`;

  class InitProbe extends RealBaseElement {
    constructor() {
      super();
      this.initCount = 0;
      this.capturedContent = [];
    }

    connectedCallback() {
      if (!this._isInitialized) {
        this._waitForChildrenAndInitialize();
        this._isInitialized = true;
      }
    }

    _initializeComponent() {
      this.initCount++;
      this.capturedContent.push(this._originalContent);
      // Components replace their own markup on init; this is what makes
      // a second initialization pass destructive.
      this.innerHTML = '<div class="rendered">rendered output</div>';
    }
  }

  customElements.define(tag, InitProbe);
  return tag;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('BaseElement initialization lifecycle', () => {
  let savedAlpine;

  beforeEach(() => {
    cleanupDOM();
    savedAlpine = global.window.Alpine;
    // The Alpine wait promise is cached on window and shared by every
    // component, so it has to be cleared between specs.
    delete global.window.alpineLoadPromise;
  });

  afterEach(() => {
    global.window.Alpine = savedAlpine;
    global.Alpine = savedAlpine;
    delete global.window.alpineLoadPromise;
    cleanupDOM();
  });

  describe('_waitForChildrenAndInitialize', () => {
    // Alpine is present for this group so _waitForAlpineAndInitialize
    // completes synchronously and these specs measure only the
    // child-waiting race. (Without it, the unbounded Alpine poll blocks
    // initialization entirely - covered separately below.)
    beforeEach(() => {
      global.window.Alpine = { version: '3.13.0', initTree() {} };
    });

    it('initializes exactly once when children are present up front', async function () {
      this.timeout(5000);
      const tag = defineProbe();

      const host = document.createElement('div');
      host.innerHTML = `<${tag}><span class="child">a</span></${tag}>`;
      document.body.appendChild(host);
      const el = host.firstElementChild;

      // Long enough for the observer, the 100ms poll and the 500ms
      // fallback to all have had their chance.
      await wait(800);
      expect(el.initCount, 'should initialize exactly once').to.equal(1);
    });

    it('initializes exactly once when children arrive after connection', async function () {
      this.timeout(5000);
      const tag = defineProbe();

      const el = document.createElement(tag);
      document.body.appendChild(el);

      // Arrives before the 100ms poll, so the observer wins the race and
      // the poll must not fire a second initialization afterwards.
      await wait(20);
      const child = document.createElement('span');
      child.className = 'child';
      el.appendChild(child);

      await wait(800);
      expect(el.initCount, 'observer and poll must not both initialize').to.equal(1);
    });

    it('initializes exactly once when no children ever arrive', async function () {
      this.timeout(5000);
      const tag = defineProbe();

      const el = document.createElement(tag);
      document.body.appendChild(el);

      await wait(800);
      expect(el.initCount, 'should still initialize, exactly once').to.equal(1);
    });

    it('captures the original markup, never its own rendered output', async function () {
      this.timeout(5000);
      const tag = defineProbe();

      const host = document.createElement('div');
      host.innerHTML = `<${tag}><span class="child">original</span></${tag}>`;
      document.body.appendChild(host);
      const el = host.firstElementChild;

      await wait(800);

      expect(el.capturedContent).to.have.lengthOf(1);
      expect(el.capturedContent[0]).to.include('original');
      expect(
        el.capturedContent[0],
        '_originalContent must not contain the component\'s own rendered output'
      ).to.not.include('rendered output');
    });

    it('stops observing once initialized, so later DOM edits do not re-trigger it', async function () {
      this.timeout(5000);
      const tag = defineProbe();

      const host = document.createElement('div');
      host.innerHTML = `<${tag}><span class="child">a</span></${tag}>`;
      document.body.appendChild(host);
      const el = host.firstElementChild;

      await wait(300);
      const countAfterInit = el.initCount;

      el.appendChild(document.createElement('span'));
      await wait(300);

      expect(el.initCount, 'later child mutations must not re-initialize').to.equal(countAfterInit);
    });
  });

  describe('_waitForAlpineAndInitialize', () => {
    it('initializes immediately when Alpine is already present', async () => {
      const alpine = { version: '3.13.0', initTree() {} };
      global.window.Alpine = alpine;

      let initCount = 0;
      const el = document.createElement('div');
      Object.setPrototypeOf(el, RealBaseElement.prototype);
      el._initializeComponent = () => { initCount++; };

      el._waitForAlpineAndInitialize();
      expect(initCount).to.equal(1);
    });

    it('initializes once Alpine finishes loading', async function () {
      this.timeout(5000);
      global.window.Alpine = undefined;

      let initCount = 0;
      const el = document.createElement('div');
      Object.setPrototypeOf(el, RealBaseElement.prototype);
      el._initializeComponent = () => { initCount++; };

      el._waitForAlpineAndInitialize();
      expect(initCount, 'must not initialize before Alpine appears').to.equal(0);

      global.window.Alpine = { version: '3.13.0', initTree() {} };
      await wait(120);
      expect(initCount, 'should initialize after Alpine loads').to.equal(1);
    });

    it('gives up waiting for Alpine and initializes anyway, rather than polling forever', async function () {
      this.timeout(5000);
      global.window.Alpine = undefined;

      const originalTimeout = RealBaseElement.ALPINE_WAIT_TIMEOUT;
      RealBaseElement.ALPINE_WAIT_TIMEOUT = 60;

      try {
        let initCount = 0;
        const el = document.createElement('div');
        Object.setPrototypeOf(el, RealBaseElement.prototype);
        el._initializeComponent = () => { initCount++; };

        el._waitForAlpineAndInitialize();
        await wait(400);

        // A page without Alpine must still get rendered components,
        // rather than an unbounded 100Hz poll per component forever.
        expect(
          initCount,
          'component should initialize after the Alpine wait times out'
        ).to.equal(1);
      } finally {
        RealBaseElement.ALPINE_WAIT_TIMEOUT = originalTimeout;
      }
    });
  });
});

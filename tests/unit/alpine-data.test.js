import './setup.js';

/**
 * Alpine data access.
 *
 * package.json declares `alpinejs: ^3.0.0` as the peer dependency, but
 * several components read component state through `element.__x.$data`,
 * which is the Alpine *v2* API. Alpine 3 removed `__x` entirely: it
 * exposes the official `Alpine.$data(el)` accessor and, internally,
 * `el._x_dataStack`. Against the declared peer dependency every one of
 * those reads yields undefined, so the affected public APIs
 * (tabs.switchTab, toggle.checked, avatar.setImage, ...) silently do
 * nothing at all.
 *
 * These specs install fake Alpine runtimes shaped like v3 and v2 and
 * assert the accessor resolves against both, and that the component
 * public APIs actually reach the data scope.
 */
describe('Alpine data access', () => {
  let savedAlpine;

  beforeEach(() => {
    cleanupDOM();
    savedAlpine = global.window.Alpine;
  });

  afterEach(() => {
    global.window.Alpine = savedAlpine;
    global.Alpine = savedAlpine;
    cleanupDOM();
  });

  /** Fake Alpine 3: official $data() accessor + _x_dataStack internals. */
  function installAlpine3() {
    const alpine = {
      version: '3.13.0',
      initTree() {},
      $data(el) {
        let node = el;
        while (node) {
          if (node._x_dataStack) return node._x_dataStack[0];
          node = node.parentElement;
        }
        // Alpine 3 returns undefined for an element outside any scope.
        return undefined;
      }
    };
    global.window.Alpine = alpine;
    global.Alpine = alpine;
    return alpine;
  }

  /** Fake Alpine 2: only the legacy __x property, no $data() at all. */
  function installAlpine2() {
    const alpine = { version: '2.8.2', initTree() {} };
    global.window.Alpine = alpine;
    global.Alpine = alpine;
    return alpine;
  }

  function makeBaseElementInstance() {
    const el = document.createElement('div');
    Object.setPrototypeOf(el, global.window.BaseElement.prototype);
    document.body.appendChild(el);
    return el;
  }

  describe('BaseElement._getAlpineData', () => {
    it('resolves the scope under Alpine 3 (via _x_dataStack)', () => {
      installAlpine3();
      const el = makeBaseElementInstance();
      el.innerHTML = '<div x-data="{}"></div>';
      const scope = { checked: true };
      el.querySelector('[x-data]')._x_dataStack = [scope];

      expect(el._getAlpineData()).to.equal(scope);
    });

    it('resolves the scope under Alpine 3 (via the official $data accessor)', () => {
      // Same runtime, but the scope is reachable only through $data() -
      // no _x_dataStack on the element itself, as when Alpine stores the
      // stack on an ancestor.
      const alpine = installAlpine3();
      const el = makeBaseElementInstance();
      el.innerHTML = '<div x-data="{}"></div>';
      const scope = { checked: true };
      const holder = el.querySelector('[x-data]');
      alpine.$data = (node) => (node === holder ? scope : undefined);

      expect(el._getAlpineData()).to.equal(scope);
    });

    it('still resolves the scope under legacy Alpine 2 (via __x)', () => {
      installAlpine2();
      const el = makeBaseElementInstance();
      el.innerHTML = '<div x-data="{}"></div>';
      const scope = { checked: true };
      el.querySelector('[x-data]').__x = { $data: scope };

      expect(el._getAlpineData()).to.equal(scope);
    });

    it('returns null instead of throwing when Alpine has not initialized the element', () => {
      const alpine = installAlpine3();
      // Alpine 3 throws when asked for the scope of an uninitialized element.
      alpine.$data = () => {
        throw new Error('Alpine: element has no data scope');
      };
      const el = makeBaseElementInstance();
      el.innerHTML = '<div x-data="{}"></div>';

      expect(() => el._getAlpineData()).to.not.throw();
      expect(el._getAlpineData()).to.equal(null);
    });

    it('returns null when there is no x-data element at all', () => {
      installAlpine3();
      const el = makeBaseElementInstance();
      el.innerHTML = '<div>no alpine here</div>';

      expect(el._getAlpineData()).to.equal(null);
    });

    it('returns a falsy-but-valid scope rather than falling through', () => {
      // Guards the `a || b || c` pattern: a legitimately empty scope must
      // not cause a fall-through to the next lookup strategy.
      installAlpine3();
      const el = makeBaseElementInstance();
      el.innerHTML = '<div x-data="{}"></div>';
      const scope = {};
      el.querySelector('[x-data]')._x_dataStack = [scope];

      expect(el._getAlpineData()).to.equal(scope);
    });
  });

  describe('component public APIs reach the scope under Alpine 3', () => {
    async function mount(tag, configure) {
      const el = document.createElement(tag);
      if (configure) configure(el);
      document.body.appendChild(el);
      await waitForComponent(el);
      return el;
    }

    /** Attach a fake Alpine 3 scope to the component's rendered root. */
    function attachScope(el, scope) {
      const holder = el.querySelector('[x-data]');
      expect(holder, `${el.tagName} should render an [x-data] root`).to.exist;
      holder._x_dataStack = [scope];
      return scope;
    }

    it('toggle-switch.check()/uncheck() write to the scope', async () => {
      installAlpine3();
      await import('../../src/dry2/toggle-switch.js');
      const el = await mount('toggle-switch', (node) => node.setAttribute('label', 'Notify'));
      const scope = attachScope(el, { checked: false, disabled: false });

      el.check();
      expect(scope.checked, 'check() should set checked on the scope').to.be.true;

      el.uncheck();
      expect(scope.checked, 'uncheck() should clear checked on the scope').to.be.false;
    });

    it('toggle-switch.checked reads from the scope', async () => {
      installAlpine3();
      await import('../../src/dry2/toggle-switch.js');
      const el = await mount('toggle-switch');
      const scope = attachScope(el, { checked: true, disabled: false });

      expect(el.checked).to.be.true;
      scope.checked = false;
      expect(el.checked).to.be.false;
    });

    it('avatar.setImage() writes to the scope', async () => {
      installAlpine3();
      await import('../../src/dry2/avatar.js');
      const el = await mount('dry-avatar', (node) => node.setAttribute('name', 'Ada Lovelace'));
      const scope = attachScope(el, {
        src: '', alt: '', name: '', initials: '', imageError: true, imageLoaded: true
      });

      el.setImage('https://example.com/a.png', 'Ada');

      expect(scope.src).to.equal('https://example.com/a.png');
      expect(scope.alt).to.equal('Ada');
      expect(scope.imageError, 'setImage should reset the error flag').to.be.false;
    });

    it('tabs.switchTab() calls through to the scope', async () => {
      installAlpine3();
      await import('../../src/dry2/tabs.js');
      const el = await mount('dry-tabs', (node) => {
        node.innerHTML =
          '<tab-item id="one" title="One">1</tab-item>' +
          '<tab-item id="two" title="Two">2</tab-item>';
      });

      const calls = [];
      attachScope(el, {
        activeTab: 'one',
        switchTab(id) {
          calls.push(id);
          this.activeTab = id;
        }
      });

      el.switchTab('two');
      expect(calls, 'switchTab should reach the Alpine scope').to.deep.equal(['two']);
    });
  });
});

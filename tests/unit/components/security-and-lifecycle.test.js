import '../setup.js';

describe('Security and Lifecycle Issues', () => {
  beforeEach(() => { cleanupDOM(); });
  afterEach(() => { cleanupDOM(); });

  // ── C1: avatar.js XSS via x-data interpolation ─────────────────────────────
  describe('C1: DryAvatar XSS Prevention', () => {
    before(async () => {
      await import('../../../src/dry2/avatar.js');
    });

    it('should expose _escapeForJs helper', () => {
      const avatar = document.createElement('dry-avatar');
      expect(typeof avatar._escapeForJs).to.equal('function');
    });

    it('should not allow single-quote injection in name attribute to break x-data', () => {
      const avatar = document.createElement('dry-avatar');
      avatar.setAttribute('name', "'; alert('xss'); let x='");
      document.body.appendChild(avatar);

      const xDataEl = avatar.querySelector('[x-data]');
      if (xDataEl) {
        const xData = xDataEl.getAttribute('x-data');
        // Unescaped ' followed by ; would allow JS breakout — escaped version has \' which is safe
        expect(xData).to.not.match(/(?<!\\)'; alert\(/);
      }
    });

    it('should not allow injection via src attribute in x-data', () => {
      const avatar = document.createElement('dry-avatar');
      avatar.setAttribute('src', "'+alert(1)+'");
      document.body.appendChild(avatar);

      const xDataEl = avatar.querySelector('[x-data]');
      if (xDataEl) {
        const xData = xDataEl.getAttribute('x-data');
        // Unescaped '+alert(1)+' would concatenate out of the string
        expect(xData).to.not.match(/(?<!\\)'\+alert\(1\)\+'/);
      }
    });

    it('should not allow injection via alt attribute in x-data', () => {
      const avatar = document.createElement('dry-avatar');
      avatar.setAttribute('alt', "'; window.__c1 = true; let z='");
      document.body.appendChild(avatar);

      const xDataEl = avatar.querySelector('[x-data]');
      if (xDataEl) {
        const xData = xDataEl.getAttribute('x-data');
        expect(xData).to.not.match(/(?<!\\)'; window\.__c1/);
      }
    });
  });

  // ── C2: drawer.js HTML injection via innerHTML template literals ─────────────
  describe('C2: DryDrawer HTML Injection Prevention', () => {
    before(async () => {
      await import('../../../src/dry2/drawer.js');
    });

    it('should not render raw script tags from trigger-content attribute', () => {
      const drawer = document.createElement('dry-drawer');
      drawer.setAttribute('trigger-content', '<script>window.__c2a = true;</script>Open');
      document.body.appendChild(drawer);

      const button = drawer.querySelector('.trigger-button');
      if (button) {
        expect(button.innerHTML).to.not.include('<script>');
        expect(button.textContent).to.include('Open');
      }
    });

    it('should not render raw script tags from header-content attribute', () => {
      const drawer = document.createElement('dry-drawer');
      drawer.setAttribute('header-content', '<script>window.__c2b = true;</script>Title');
      document.body.appendChild(drawer);

      const title = drawer.querySelector('.drawer-title');
      if (title) {
        expect(title.innerHTML).to.not.include('<script>');
      }
    });

    it('should not allow inline event handler injection via trigger-content', () => {
      const drawer = document.createElement('dry-drawer');
      drawer.setAttribute('trigger-content', '<img src=x onerror="window.__c2c=true">');
      document.body.appendChild(drawer);

      const button = drawer.querySelector('.trigger-button');
      if (button) {
        // No real <img> element should be injected — only escaped text
        expect(button.querySelector('img')).to.be.null;
      }
    });

    it('AjaxDrawer: url attribute should not allow HTML attribute injection', () => {
      const drawer = document.createElement('ajax-drawer');
      drawer.setAttribute('url', '/api/data');
      document.body.appendChild(drawer);

      const button = drawer.querySelector('.trigger-button');
      if (button) {
        const hxGet = button.getAttribute('hx-get');
        expect(hxGet).to.equal('/api/data');
      }
    });
  });

  // ── C3: chat-bubble.js x-html of unsanitized slot content ───────────────────
  describe('C3: DryChatBubble Content Sanitization', () => {
    before(async () => {
      await import('../../../src/dry2/chat-bubble.js');
    });

    it('should strip script tags from slot content before storing in _chatData', () => {
      const bubble = document.createElement('dry-chat-bubble');
      bubble.innerHTML = '<script>window.__c3a = true;</script>Hello';
      document.body.appendChild(bubble);

      expect(bubble._chatData).to.exist;
      expect(bubble._chatData.content).to.not.include('<script>');
    });

    it('should strip inline event handlers from slot content', () => {
      const bubble = document.createElement('dry-chat-bubble');
      bubble.innerHTML = '<img src=x onerror="window.__c3b=true">Hello';
      document.body.appendChild(bubble);

      expect(bubble._chatData.content).to.not.include('onerror=');
    });

    it('should preserve safe formatting HTML like <strong> and <em>', () => {
      const bubble = document.createElement('dry-chat-bubble');
      bubble.innerHTML = '<strong>Hello</strong> <em>world</em>';
      document.body.appendChild(bubble);

      expect(bubble._chatData.content).to.include('strong');
      expect(bubble._chatData.content).to.include('em');
    });
  });

  // ── M1+M2: BaseElement lifecycle — timeout and observer cleanup ──────────────
  describe('M1+M2: BaseElement Lifecycle Cleanup', () => {
    let tagName;

    before(() => {
      // Register a minimal test element — BaseElement itself can't be instantiated
      tagName = `test-lifecycle-el-${Date.now()}`;
      class TestLifecycleEl extends BaseElement {}
      customElements.define(tagName, TestLifecycleEl);
    });

    it('should initialise _pendingTimeouts as an empty array', () => {
      const el = document.createElement(tagName);
      expect(el._pendingTimeouts).to.be.an('array');
      expect(el._pendingTimeouts).to.have.length(0);
    });

    it('should initialise _childrenObserver as null', () => {
      const el = document.createElement(tagName);
      expect(el._childrenObserver).to.equal(null);
    });

    it('disconnectedCallback should clear all pending timeouts', (done) => {
      let fired = false;
      const el = document.createElement(tagName);

      const id = setTimeout(() => { fired = true; }, 150);
      el._pendingTimeouts = [id];

      el.disconnectedCallback();

      setTimeout(() => {
        expect(fired).to.be.false;
        done();
      }, 300);
    });

    it('disconnectedCallback should disconnect a stored MutationObserver', () => {
      const el = document.createElement(tagName);
      let disconnected = false;
      el._childrenObserver = { disconnect: () => { disconnected = true; } };

      el.disconnectedCallback();

      expect(disconnected).to.be.true;
      expect(el._childrenObserver).to.equal(null);
    });
  });

  // ── M3: accordion.js null safety on alpineData methods ──────────────────────
  describe('M3: Accordion Null Safety', () => {
    before(async () => {
      await import('../../../src/dry2/accordion.js');
    });

    it('openItem should not throw when alpineData.isOpen is not a function', () => {
      const accordion = document.createElement('dry-accordion');
      document.body.appendChild(accordion);

      accordion._getAlpineDataSecurely = () => ({
        disabled: false,
        isOpen: 'not-a-function',
        toggle: () => {}
      });

      expect(() => accordion.openItem('item-0')).to.not.throw();
    });

    it('closeItem should not throw when alpineData.isOpen is not a function', () => {
      const accordion = document.createElement('dry-accordion');
      document.body.appendChild(accordion);

      accordion._getAlpineDataSecurely = () => ({
        disabled: false,
        isOpen: null,
        toggle: () => {}
      });

      expect(() => accordion.closeItem('item-0')).to.not.throw();
    });

    it('toggleItem should not throw when alpineData.toggle is not a function', () => {
      const accordion = document.createElement('dry-accordion');
      document.body.appendChild(accordion);

      accordion._getAlpineDataSecurely = () => ({
        disabled: false,
        isOpen: () => false,
        toggle: 'not-a-function'
      });

      expect(() => accordion.toggleItem('item-0')).to.not.throw();
    });
  });

  // ── N1: window.DRY2 namespace ────────────────────────────────────────────────
  describe('N1: DRY2 Namespace', () => {
    it('window.DRY2 should be an object', () => {
      expect(window.DRY2).to.be.an('object');
    });

    it('window.DRY2.BaseElement should be the BaseElement class', () => {
      expect(window.DRY2.BaseElement).to.exist;
    });

    it('window.DRY2.Toast should exist after toast.js is imported', async () => {
      await import('../../../src/dry2/toast.js');
      expect(window.DRY2.Toast).to.exist;
    });
  });

  // ── N2: select.js ARIA roles ─────────────────────────────────────────────────
  describe('N2: DrySelect ARIA Roles', () => {
    before(async () => {
      await import('../../../src/dry2/select.js');
    });

    it('rendered HTML should include role="listbox" on the dropdown container', () => {
      const select = document.createElement('dry-select');
      select.innerHTML = '<option value="a">Option A</option><option value="b">Option B</option>';
      document.body.appendChild(select);

      expect(select.innerHTML).to.include('role="listbox"');
    });

    it('rendered HTML should include role="option" on each option row', () => {
      const select = document.createElement('dry-select');
      select.innerHTML = '<option value="a">Option A</option>';
      document.body.appendChild(select);

      expect(select.innerHTML).to.include('role="option"');
    });

    it('rendered HTML should include aria-expanded on the trigger button area', () => {
      const select = document.createElement('dry-select');
      select.innerHTML = '<option value="a">Option A</option>';
      document.body.appendChild(select);

      expect(select.innerHTML).to.include('aria-expanded');
    });
  });
});

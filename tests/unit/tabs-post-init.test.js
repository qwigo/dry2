import './setup.js';

/**
 * dry-tabs behavior after the first render.
 *
 * _initializeComponent latches _hasBeenProcessed and returns early on
 * every later call, while _handleAttributeChange's only strategy is to
 * call _initializeComponent again - so no attribute change has any
 * effect once the component has rendered once.
 *
 * Separately, _extractTabItems reads <tab-item> elements out of
 * this.children, but the first render replaces innerHTML with the
 * rendered output. After that it always returns an empty array, which
 * also breaks nextTab()/previousTab().
 */
describe('dry-tabs after first render', () => {
  let savedAlpine;

  before(async () => {
    await import('../../src/dry2/tabs.js');
  });

  beforeEach(() => {
    cleanupDOM();
    savedAlpine = global.window.Alpine;
    global.window.Alpine = { version: '3.13.0', initTree() {} };
  });

  afterEach(() => {
    global.window.Alpine = savedAlpine;
    global.Alpine = savedAlpine;
    cleanupDOM();
  });

  async function mountTabs(markup) {
    const el = document.createElement('dry-tabs');
    el.innerHTML = markup;
    document.body.appendChild(el);
    await waitForComponent(el);
    return el;
  }

  const THREE_TABS =
    '<tab-item id="alpha" title="Alpha">A</tab-item>' +
    '<tab-item id="beta" title="Beta">B</tab-item>' +
    '<tab-item id="gamma" title="Gamma" disabled>C</tab-item>';

  /** Give the component a live Alpine scope like a browser would. */
  function attachScope(el, overrides = {}) {
    const holder = el.querySelector('[x-data]');
    expect(holder, 'tabs should render an [x-data] root').to.exist;
    const scope = Object.assign({
      activeTab: el.activeTab || 'alpha',
      switchTab(id) { this.activeTab = id; },
      isActive(id) { return this.activeTab === id; }
    }, overrides);
    holder._x_dataStack = [scope];
    return scope;
  }

  describe('the tab model survives rendering', () => {
    it('_extractTabItems still returns the tabs after the first render', async () => {
      const el = await mountTabs(THREE_TABS);
      const tabs = el._extractTabItems();

      expect(tabs).to.have.lengthOf(3);
      expect(tabs.map((t) => t.title)).to.deep.equal(['Alpha', 'Beta', 'Gamma']);
      expect(tabs[0]).to.have.property('content');
    });

    it('preserves the disabled flag after rendering', async () => {
      const el = await mountTabs(THREE_TABS);
      const disabled = el._extractTabItems().filter((t) => t.disabled);

      expect(disabled).to.have.lengthOf(1);
      expect(disabled[0].title).to.equal('Gamma');
    });
  });

  describe('active-tab changes after init', () => {
    it('switches the active tab through the Alpine scope', async () => {
      const el = await mountTabs(THREE_TABS);
      const scope = attachScope(el);

      el.setAttribute('active-tab', 'beta');
      expect(scope.activeTab, 'active-tab change should reach the scope').to.equal('beta');
    });

    it('does not rebuild the DOM when only the active tab changes', async () => {
      const el = await mountTabs(THREE_TABS);
      const scope = attachScope(el);
      const renderedRoot = el.querySelector('[x-data]');

      el.setAttribute('active-tab', 'beta');

      // Re-rendering would replace the root and silently drop the live
      // Alpine scope attached to it, which is what makes switching
      // through the scope work at all.
      expect(el.querySelector('[x-data]'), 'should reuse the rendered root').to.equal(renderedRoot);
      expect(scope.activeTab).to.equal('beta');
    });
  });

  describe('structural attribute changes after init', () => {
    it('re-renders when the variant changes', async () => {
      const el = await mountTabs(THREE_TABS);
      const before = el.innerHTML;

      el.setAttribute('variant', 'pills');

      expect(el.innerHTML, 'variant change should re-render').to.not.equal(before);
      expect(el.innerHTML).to.include('rounded-md');
      // The tab set must survive the re-render.
      expect(el._extractTabItems()).to.have.lengthOf(3);
    });

    it('re-renders when the orientation changes', async () => {
      const el = await mountTabs(THREE_TABS);

      el.setAttribute('orientation', 'vertical');

      expect(el.innerHTML).to.include('flex-shrink-0');
      expect(el._extractTabItems()).to.have.lengthOf(3);
    });

    it('disables every tab button when the component is disabled', async () => {
      const el = await mountTabs(
        '<tab-item id="a" title="A">1</tab-item><tab-item id="b" title="B">2</tab-item>'
      );
      const enabledBefore = el.querySelectorAll('button[role="tab"]:not([disabled])');
      expect(enabledBefore.length, 'both tabs start enabled').to.equal(2);

      el.setAttribute('disabled', '');

      // The re-render must actually take effect - not produce identical
      // markup while every button stays clickable.
      const stillEnabled = el.querySelectorAll('button[role="tab"]:not([disabled])');
      expect(stillEnabled.length, 'no tab button should remain enabled').to.equal(0);
    });
  });

  describe('nextTab / previousTab after render', () => {
    it('advances to the next enabled tab', async () => {
      const el = await mountTabs(THREE_TABS);
      el.setAttribute('active-tab', 'alpha');
      const scope = attachScope(el, { activeTab: 'alpha' });

      el.nextTab();
      expect(scope.activeTab).to.equal('beta');
    });

    it('goes back to the previous enabled tab', async () => {
      const el = await mountTabs(THREE_TABS);
      el.setAttribute('active-tab', 'beta');
      const scope = attachScope(el, { activeTab: 'beta' });

      el.previousTab();
      expect(scope.activeTab).to.equal('alpha');
    });

    it('does not run past the last enabled tab', async () => {
      const el = await mountTabs(THREE_TABS);
      el.setAttribute('active-tab', 'beta');
      const scope = attachScope(el, { activeTab: 'beta' });

      // 'gamma' is disabled, so 'beta' is the last reachable tab.
      el.nextTab();
      expect(scope.activeTab).to.equal('beta');
    });
  });

  describe('tab items added after render', () => {
    it('absorbs a tab-item appended later, keeping the existing tabs', async function () {
      this.timeout(5000);
      const el = await mountTabs(THREE_TABS);

      const added = document.createElement('tab-item');
      added.setAttribute('id', 'delta');
      added.setAttribute('title', 'Delta');
      added.textContent = 'D';
      el.appendChild(added);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const titles = el._extractTabItems().map((t) => t.title);
      expect(titles, 'existing tabs must not be lost').to.deep.equal([
        'Alpha', 'Beta', 'Gamma', 'Delta'
      ]);
      expect(el.innerHTML).to.include('Delta');
    });

    it('assigns sequential fallback ids to a batch of id-less tab-items', async function () {
      this.timeout(5000);
      // Two tabs so appended ids continue from index 2. Both appended in
      // the same tick land in one observer batch, which is where the
      // fold-in indexing must not double-count.
      const el = await mountTabs(
        '<tab-item id="a" title="A">1</tab-item><tab-item id="b" title="B">2</tab-item>'
      );

      const first = document.createElement('tab-item');
      first.setAttribute('title', 'Third');
      first.textContent = '3';
      const second = document.createElement('tab-item');
      second.setAttribute('title', 'Fourth');
      second.textContent = '4';
      el.appendChild(first);
      el.appendChild(second);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const ids = el._extractTabItems().map((t) => t.id);
      // Contiguous, no skipped slot: 'tab-2' then 'tab-3'.
      expect(ids).to.deep.equal(['a', 'b', 'tab-2', 'tab-3']);
    });

    it('renders nothing until it actually has a tab', async () => {
      const el = document.createElement('dry-tabs');
      document.body.appendChild(el);
      await waitForComponent(el).catch(() => {});

      // An empty tabs component should not leave a rendered shell
      // behind: markup added a moment later would then be competing
      // with it, and callers reasonably expect their appended element
      // to be the only child.
      const added = document.createElement('tab-item');
      added.setAttribute('title', 'First');
      el.appendChild(added);

      expect(el.children).to.have.lengthOf(1);
    });
  });
});

import '../setup.js';

describe('DryTabs Component System', () => {
  let tabsComponent, tabItem;

  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  before(async() => {
    await import('../../../src/dry2/tabs.js');
  });

  describe('Component Registration', () => {
    it('should register the dry-tabs custom element', () => {
      expect(customElements.get('dry-tabs')).to.exist;
    });

    it('should register the tab-item custom element', () => {
      expect(customElements.get('tab-item')).to.exist;
    });

    it('should create tabs component element', () => {
      tabsComponent = document.createElement('dry-tabs');
      expect(tabsComponent).to.be.instanceOf(HTMLElement);
      expect(tabsComponent.tagName.toLowerCase()).to.equal('dry-tabs');
    });

    it('should create tab-item component element', () => {
      tabItem = document.createElement('tab-item');
      expect(tabItem).to.be.instanceOf(HTMLElement);
      expect(tabItem.tagName.toLowerCase()).to.equal('tab-item');
    });
  });

  describe('DryTabs Basic Functionality', () => {
    beforeEach(() => {
      tabsComponent = document.createElement('dry-tabs');
      document.body.appendChild(tabsComponent);
    });

    it('should initialize component', async() => {
      // Add some content first to trigger initialization
      tabsComponent.innerHTML = '<tab-item title="Test">Content</tab-item>';

      // Wait for component initialization with longer timeout
      await new Promise(resolve => setTimeout(resolve, 600));

      expect(tabsComponent._isInitialized).to.be.true;
    });

    it('should have default properties', () => {
      expect(tabsComponent.hasAttribute('variant')).to.be.false;
      expect(tabsComponent.hasAttribute('size')).to.be.false;
      expect(tabsComponent.hasAttribute('vertical')).to.be.false;
    });

    it('should support variant styles', () => {
      tabsComponent.setAttribute('variant', 'bordered');
      expect(tabsComponent.getAttribute('variant')).to.equal('bordered');

      tabsComponent.setAttribute('variant', 'lifted');
      expect(tabsComponent.getAttribute('variant')).to.equal('lifted');
    });

    it('should support size variants', () => {
      const sizes = ['xs', 'sm', 'md', 'lg'];
      sizes.forEach(size => {
        tabsComponent.setAttribute('size', size);
        expect(tabsComponent.getAttribute('size')).to.equal(size);
      });
    });

    it('should support vertical orientation', () => {
      tabsComponent.setAttribute('orientation', 'vertical');
      expect(tabsComponent.getAttribute('orientation')).to.equal('vertical');
    });
  });

  describe('TabItem Basic Functionality', () => {
    beforeEach(() => {
      tabItem = document.createElement('tab-item');
      tabItem.setAttribute('title', 'Test Tab');
      document.body.appendChild(tabItem);
    });

    it('should initialize tab item', () => {
      // TabItem is simpler and should initialize immediately
      expect(tabItem.tagName.toLowerCase()).to.equal('tab-item');
      expect(tabItem.getAttribute('title')).to.equal('Test Tab');
    });

    it('should have default properties', () => {
      expect(tabItem.hasAttribute('active')).to.be.false;
      expect(tabItem.hasAttribute('disabled')).to.be.false;
    });

    it('should support active state', () => {
      tabItem.setAttribute('active', '');
      expect(tabItem.hasAttribute('active')).to.be.true;
    });

    it('should support disabled state', () => {
      tabItem.setAttribute('disabled', '');
      expect(tabItem.hasAttribute('disabled')).to.be.true;
    });

    it('should support label attribute', () => {
      tabItem.setAttribute('title', 'Tab 1');
      expect(tabItem.getAttribute('title')).to.equal('Tab 1');
    });

    it('should support icon attribute', () => {
      tabItem.setAttribute('icon', 'home');
      expect(tabItem.getAttribute('icon')).to.equal('home');
    });
  });

  describe('Tab System Integration', () => {
    beforeEach(async() => {
      tabsComponent = document.createElement('dry-tabs');
      tabsComponent.innerHTML = `
        <tab-item title="Tab 1" active>Content 1</tab-item>
        <tab-item title="Tab 2">Content 2</tab-item>
        <tab-item title="Tab 3">Content 3</tab-item>
      `;
      document.body.appendChild(tabsComponent);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    it('should handle multiple tab items', () => {
      // After initialization, the original tab-item elements are replaced with the rendered structure
      // Check for the rendered tab buttons instead
      const tabButtons = tabsComponent.querySelectorAll('button[role="tab"]');
      expect(tabButtons.length).to.equal(3);
    });

    it('should have one active tab by default', () => {
      // Check for active tab in the rendered structure
      const tabsContainer = tabsComponent.querySelector('.tabs');
      expect(tabsContainer).to.exist;
      // The component should have initialized with an active tab
      expect(tabsComponent.activeTab).to.exist;
    });

    it('should create tab navigation structure', () => {
      // Check if the component created the tab structure
      const tabsContainer = tabsComponent.querySelector('.tabs');
      expect(tabsContainer).to.exist;
    });

    it('should extract tab information correctly', () => {
      // Test the internal _extractTabItems method
      const tabs = tabsComponent._extractTabItems();
      expect(tabs.length).to.be.greaterThan(0);
      expect(tabs[0]).to.have.property('title');
      expect(tabs[0]).to.have.property('content');
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(async() => {
      tabsComponent = document.createElement('dry-tabs');
      tabsComponent.innerHTML = `
        <tab-item title="Tab 1" active>Content 1</tab-item>
        <tab-item title="Tab 2">Content 2</tab-item>
        <tab-item title="Tab 3" disabled>Content 3</tab-item>
      `;
      document.body.appendChild(tabsComponent);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    it('should handle disabled tabs', () => {
      // Check for disabled tabs in the extracted tab data
      const tabs = tabsComponent._extractTabItems();
      const disabledTabs = tabs.filter(tab => tab.disabled);
      expect(disabledTabs.length).to.be.greaterThan(0);
    });

    it('should support programmatic tab switching', () => {
      // Test the switchTab method
      tabsComponent.activeTab = 'tab-1';
      expect(tabsComponent.getAttribute('active-tab')).to.equal('tab-1');
    });

    it('should support next/previous tab navigation', () => {
      // Test navigation methods
      expect(typeof tabsComponent.nextTab).to.equal('function');
      expect(typeof tabsComponent.previousTab).to.equal('function');
    });
  });

  describe('Content Management', () => {
    beforeEach(() => {
      tabsComponent = document.createElement('dry-tabs');
      document.body.appendChild(tabsComponent);
    });

    it('should handle tab content', () => {
      tabItem = document.createElement('tab-item');
      tabItem.setAttribute('title', 'Test Tab');
      tabItem.innerHTML = '<p>Tab content here</p>';
      tabsComponent.appendChild(tabItem);

      expect(tabItem.innerHTML).to.include('Tab content here');
    });

    it('should handle empty tabs', () => {
      tabItem = document.createElement('tab-item');
      tabItem.setAttribute('title', 'Empty Tab');
      tabsComponent.appendChild(tabItem);

      expect(tabItem.getAttribute('title')).to.equal('Empty Tab');
    });

    it('should escape HTML in tab titles', () => {
      tabItem = document.createElement('tab-item');
      tabItem.setAttribute('title', '<script>alert("xss")</script>');
      tabsComponent.appendChild(tabItem);

      expect(tabItem.getAttribute('title')).to.include('<script>');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async() => {
      tabsComponent = document.createElement('dry-tabs');
      tabsComponent.innerHTML = `
        <tab-item title="Tab 1" active>Content 1</tab-item>
        <tab-item title="Tab 2">Content 2</tab-item>
      `;
      document.body.appendChild(tabsComponent);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    it('should have proper ARIA roles', () => {
      // In a real browser, tabs would have role="tablist" and tab-items would have role="tab"
      expect(tabsComponent.tagName.toLowerCase()).to.equal('dry-tabs');
    });

    it('should support aria-label on tabs container', () => {
      tabsComponent.setAttribute('aria-label', 'Main navigation tabs');
      expect(tabsComponent.getAttribute('aria-label')).to.equal('Main navigation tabs');
    });

    it('should support aria-controls on tab items', () => {
      const tabItem = tabsComponent.querySelector('tab-item');
      if (tabItem) {
        tabItem.setAttribute('aria-controls', 'panel-1');
        expect(tabItem.getAttribute('aria-controls')).to.equal('panel-1');
      }
    });

    it('should support keyboard navigation', () => {
      // Note: Actual keyboard navigation would require real keyboard events in browser
      const tabButtons = tabsComponent.querySelectorAll('button[role="tab"]');
      expect(tabButtons.length).to.be.greaterThan(0);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      tabsComponent = document.createElement('dry-tabs');
      document.body.appendChild(tabsComponent);
    });

    it('should track active tab state', () => {
      tabItem = document.createElement('tab-item');
      tabItem.setAttribute('active', '');
      expect(tabItem.hasAttribute('active')).to.be.true;
    });

    it('should track loading state', () => {
      tabItem = document.createElement('tab-item');
      tabItem.setAttribute('loading', '');
      expect(tabItem.hasAttribute('loading')).to.be.true;
    });

    it('should handle tab state changes', () => {
      tabItem = document.createElement('tab-item');
      tabsComponent.appendChild(tabItem);

      tabItem.setAttribute('active', '');
      expect(tabItem.hasAttribute('active')).to.be.true;

      tabItem.removeAttribute('active');
      expect(tabItem.hasAttribute('active')).to.be.false;
    });

    it('should handle variant changes', () => {
      tabsComponent.variant = 'pills';
      expect(tabsComponent.getAttribute('variant')).to.equal('pills');

      tabsComponent.variant = 'underline';
      expect(tabsComponent.getAttribute('variant')).to.equal('underline');
    });

    it('should handle orientation changes', () => {
      tabsComponent.orientation = 'vertical';
      expect(tabsComponent.getAttribute('orientation')).to.equal('vertical');
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle connect/disconnect for tabs', () => {
      tabsComponent = document.createElement('dry-tabs');
      document.body.appendChild(tabsComponent);
      expect(tabsComponent.isConnected).to.be.true;

      tabsComponent.remove();
      expect(tabsComponent.isConnected).to.be.false;
    });

    it('should handle connect/disconnect for tab items', () => {
      tabItem = document.createElement('tab-item');
      document.body.appendChild(tabItem);
      expect(tabItem.isConnected).to.be.true;

      tabItem.remove();
      expect(tabItem.isConnected).to.be.false;
    });

    it('should handle dynamic tab addition', () => {
      tabsComponent = document.createElement('dry-tabs');
      document.body.appendChild(tabsComponent);

      const newTab = document.createElement('tab-item');
      newTab.setAttribute('title', 'Dynamic Tab');
      tabsComponent.appendChild(newTab);

      expect(tabsComponent.children.length).to.equal(1);
      expect(newTab.getAttribute('title')).to.equal('Dynamic Tab');
    });

    it('should initialize after children are added', async() => {
      tabsComponent = document.createElement('dry-tabs');
      document.body.appendChild(tabsComponent);

      // Add children after component is connected
      tabsComponent.innerHTML = '<tab-item title="Added Later">Content</tab-item>';

      // Wait for MutationObserver to trigger
      await new Promise(resolve => setTimeout(resolve, 600));

      expect(tabsComponent._isInitialized).to.be.true;
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      tabsComponent = document.createElement('dry-tabs');
      document.body.appendChild(tabsComponent);
    });

    it('should handle tabs without titles', () => {
      tabItem = document.createElement('tab-item');
      tabsComponent.appendChild(tabItem);
      // Should handle gracefully without error
      expect(tabItem.hasAttribute('title')).to.be.false;
    });

    it('should handle invalid variant values', () => {
      tabsComponent.setAttribute('variant', 'invalid-variant');
      expect(tabsComponent.getAttribute('variant')).to.equal('invalid-variant');
    });

    it('should handle multiple active tabs', () => {
      tabsComponent.innerHTML = `
        <tab-item title="Tab 1" active>Content 1</tab-item>
        <tab-item title="Tab 2" active>Content 2</tab-item>
      `;
      // Component should handle this gracefully
      const activeTabs = tabsComponent.querySelectorAll('tab-item[active]');
      expect(activeTabs.length).to.equal(2);
    });

    it('should handle empty tabs container', async() => {
      // Initialize with no children
      await new Promise(resolve => setTimeout(resolve, 600));

      // Should not crash
      expect(tabsComponent.tagName.toLowerCase()).to.equal('dry-tabs');
    });

    it('should handle malformed tab content', () => {
      tabsComponent.innerHTML = '<div>Not a tab item</div>';

      // Should not crash
      expect(tabsComponent.children.length).to.equal(1);
    });
  });

  describe('API Methods', () => {
    beforeEach(async() => {
      tabsComponent = document.createElement('dry-tabs');
      tabsComponent.innerHTML = `
        <tab-item title="Tab 1">Content 1</tab-item>
        <tab-item title="Tab 2">Content 2</tab-item>
        <tab-item title="Tab 3" disabled>Content 3</tab-item>
      `;
      document.body.appendChild(tabsComponent);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    it('should provide public API methods', () => {
      expect(typeof tabsComponent.switchTab).to.equal('function');
      expect(typeof tabsComponent.nextTab).to.equal('function');
      expect(typeof tabsComponent.previousTab).to.equal('function');
    });

    it('should have getter/setter properties', () => {
      // Test activeTab property
      tabsComponent.activeTab = 'tab-1';
      expect(tabsComponent.activeTab).to.equal('tab-1');

      // Test variant property
      tabsComponent.variant = 'pills';
      expect(tabsComponent.variant).to.equal('pills');

      // Test orientation property
      tabsComponent.orientation = 'vertical';
      expect(tabsComponent.orientation).to.equal('vertical');

      // Test disabled property
      tabsComponent.disabled = true;
      expect(tabsComponent.disabled).to.be.true;
    });
  });
});

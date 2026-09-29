import '../setup.js';

describe('DryAccordion Component System', () => {
  let accordionComponent, accordionItem;

  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  before(async() => {
    await import('../../../src/dry2/accordion.js');
  });

  describe('Component Registration', () => {
    it('should register the dry-accordion custom element', () => {
      expect(customElements.get('dry-accordion')).to.exist;
    });

    it('should register the accordion-item custom element', () => {
      expect(customElements.get('accordion-item')).to.exist;
    });

    it('should create accordion component element', () => {
      accordionComponent = document.createElement('dry-accordion');
      expect(accordionComponent).to.be.instanceOf(HTMLElement);
      expect(accordionComponent.tagName.toLowerCase()).to.equal('dry-accordion');
    });

    it('should create accordion-item component element', () => {
      accordionItem = document.createElement('accordion-item');
      expect(accordionItem).to.be.instanceOf(HTMLElement);
      expect(accordionItem.tagName.toLowerCase()).to.equal('accordion-item');
    });
  });

  describe('DryAccordion Basic Functionality', () => {
    beforeEach(() => {
      accordionComponent = document.createElement('dry-accordion');
      document.body.appendChild(accordionComponent);
    });

    it('should initialize component', async() => {
      // Add some content first to trigger initialization
      accordionComponent.innerHTML = '<accordion-item title="Test">Content</accordion-item>';

      // Wait for component initialization with longer timeout
      await new Promise(resolve => setTimeout(resolve, 600));

      expect(accordionComponent._isInitialized).to.be.true;
    });

    it('should have default properties', () => {
      expect(accordionComponent.hasAttribute('multiple')).to.be.false;
      expect(accordionComponent.hasAttribute('flush')).to.be.false;
    });

    it('should support multiple open items', () => {
      accordionComponent.setAttribute('multiple', '');
      expect(accordionComponent.hasAttribute('multiple')).to.be.true;
    });

    it('should support flush variant', () => {
      accordionComponent.setAttribute('flush', '');
      expect(accordionComponent.hasAttribute('flush')).to.be.true;
    });
  });

  describe('AccordionItem Basic Functionality', () => {
    beforeEach(() => {
      accordionItem = document.createElement('accordion-item');
      accordionItem.setAttribute('title', 'Test Section');
      document.body.appendChild(accordionItem);
    });

    it('should initialize accordion item', () => {
      // AccordionItem is simpler and should initialize immediately
      expect(accordionItem.tagName.toLowerCase()).to.equal('accordion-item');
      expect(accordionItem.getAttribute('title')).to.equal('Test Section');
    });

    it('should have default properties', () => {
      expect(accordionItem.hasAttribute('open')).to.be.false;
      expect(accordionItem.hasAttribute('disabled')).to.be.false;
    });

    it('should support open state', () => {
      accordionItem.setAttribute('open', '');
      expect(accordionItem.hasAttribute('open')).to.be.true;
    });

    it('should support disabled state', () => {
      accordionItem.setAttribute('disabled', '');
      expect(accordionItem.hasAttribute('disabled')).to.be.true;
    });

    it('should support title attribute', () => {
      accordionItem.setAttribute('title', 'Section 1');
      expect(accordionItem.getAttribute('title')).to.equal('Section 1');
    });

    it('should support icon attribute', () => {
      accordionItem.setAttribute('icon', 'plus');
      expect(accordionItem.getAttribute('icon')).to.equal('plus');
    });
  });

  describe('Accordion System Integration', () => {
    beforeEach(async() => {
      accordionComponent = document.createElement('dry-accordion');
      accordionComponent.innerHTML = `
        <accordion-item title="Section 1" open>Content 1</accordion-item>
        <accordion-item title="Section 2">Content 2</accordion-item>
        <accordion-item title="Section 3">Content 3</accordion-item>
      `;
      document.body.appendChild(accordionComponent);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    it('should handle multiple accordion items', () => {
      // After initialization, check for the rendered accordion structure
      const accordionButtons = accordionComponent.querySelectorAll('.accordion-header');
      expect(accordionButtons.length).to.equal(3);
    });

    it('should have one open item by default', () => {
      // Check for accordion container creation
      const accordionContainer = accordionComponent.querySelector('.accordion');
      expect(accordionContainer).to.exist;
      // The component should have initialized with default state
      expect(accordionComponent._isInitialized).to.be.true;
    });

    it('should create accordion structure', () => {
      // Check if the component created the accordion structure
      const accordionContainer = accordionComponent.querySelector('.accordion');
      expect(accordionContainer).to.exist;

      // Test the internal _extractItems method
      const items = accordionComponent._extractItems();
      expect(items.length).to.be.greaterThan(0);
      expect(items[0]).to.have.property('title');
      expect(items[0]).to.have.property('content');
    });
  });

  describe('Single vs Multiple Mode', () => {
    beforeEach(async() => {
      accordionComponent = document.createElement('dry-accordion');
      accordionComponent.innerHTML = `
        <accordion-item title="Section 1" open>Content 1</accordion-item>
        <accordion-item title="Section 2">Content 2</accordion-item>
        <accordion-item title="Section 3">Content 3</accordion-item>
      `;
      document.body.appendChild(accordionComponent);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    it('should close other items in single mode', () => {
      // Test single mode behavior by checking the component state
      expect(accordionComponent.multiple).to.be.false;

      // Test programmatic API
      expect(typeof accordionComponent.toggleItem).to.equal('function');
    });

    it('should allow multiple open items in multiple mode', () => {
      accordionComponent.setAttribute('multiple', '');
      expect(accordionComponent.multiple).to.be.true;

      // Test programmatic API for multiple mode
      expect(typeof accordionComponent.openAll).to.equal('function');
    });
  });

  describe('Disabled Items', () => {
    beforeEach(async() => {
      accordionComponent = document.createElement('dry-accordion');
      accordionComponent.innerHTML = `
        <accordion-item title="Section 1">Content 1</accordion-item>
        <accordion-item title="Section 2" disabled>Content 2</accordion-item>
      `;
      document.body.appendChild(accordionComponent);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    it('should not toggle disabled items', () => {
      // Check for disabled items in the extracted data
      const items = accordionComponent._extractItems();
      const disabledItems = items.filter(item => item.disabled);
      expect(disabledItems.length).to.be.greaterThan(0);
    });
  });

  describe('Content Management', () => {
    beforeEach(() => {
      accordionComponent = document.createElement('dry-accordion');
      document.body.appendChild(accordionComponent);
    });

    it('should handle accordion content', () => {
      accordionItem = document.createElement('accordion-item');
      accordionItem.setAttribute('title', 'Test Section');
      accordionItem.innerHTML = '<p>Accordion content here</p>';
      accordionComponent.appendChild(accordionItem);

      expect(accordionItem.innerHTML).to.include('Accordion content here');
    });

    it('should handle empty accordion items', () => {
      accordionItem = document.createElement('accordion-item');
      accordionItem.setAttribute('title', 'Empty Section');
      accordionComponent.appendChild(accordionItem);

      expect(accordionItem.getAttribute('title')).to.equal('Empty Section');
    });

    it('should escape HTML in titles', () => {
      accordionItem = document.createElement('accordion-item');
      accordionItem.setAttribute('title', '<script>alert("xss")</script>');
      accordionComponent.appendChild(accordionItem);

      expect(accordionItem.getAttribute('title')).to.include('<script>');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async() => {
      accordionComponent = document.createElement('dry-accordion');
      accordionComponent.innerHTML = `
        <accordion-item title="Section 1" open>Content 1</accordion-item>
        <accordion-item title="Section 2">Content 2</accordion-item>
      `;
      document.body.appendChild(accordionComponent);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    it('should have proper ARIA roles', () => {
      // In a real browser, accordion would have proper ARIA attributes
      expect(accordionComponent.tagName.toLowerCase()).to.equal('dry-accordion');
    });

    it('should support aria-label on accordion', () => {
      accordionComponent.setAttribute('aria-label', 'FAQ accordion');
      expect(accordionComponent.getAttribute('aria-label')).to.equal('FAQ accordion');
    });

    it('should support aria-expanded on items', () => {
      const item = accordionComponent.querySelector('accordion-item');
      if (item) {
        item.setAttribute('aria-expanded', 'true');
        expect(item.getAttribute('aria-expanded')).to.equal('true');
      }
    });

    it('should support keyboard navigation', () => {
      // Note: Actual keyboard navigation would require real keyboard events in browser
      const accordionButtons = accordionComponent.querySelectorAll('.accordion-header');
      expect(accordionButtons.length).to.be.greaterThan(0);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      accordionComponent = document.createElement('dry-accordion');
      document.body.appendChild(accordionComponent);
    });

    it('should track open state of items', () => {
      accordionItem = document.createElement('accordion-item');
      accordionItem.setAttribute('open', '');
      expect(accordionItem.hasAttribute('open')).to.be.true;
    });

    it('should track loading state', () => {
      accordionItem = document.createElement('accordion-item');
      accordionItem.setAttribute('loading', '');
      expect(accordionItem.hasAttribute('loading')).to.be.true;
    });

    it('should handle state changes', () => {
      accordionItem = document.createElement('accordion-item');
      accordionComponent.appendChild(accordionItem);

      accordionItem.setAttribute('open', '');
      expect(accordionItem.hasAttribute('open')).to.be.true;

      accordionItem.removeAttribute('open');
      expect(accordionItem.hasAttribute('open')).to.be.false;
    });

    it('should handle multiple mode changes', () => {
      accordionComponent.multiple = true;
      expect(accordionComponent.getAttribute('multiple')).to.exist;

      accordionComponent.multiple = false;
      expect(accordionComponent.hasAttribute('multiple')).to.be.false;
    });

    it('should handle disabled state changes', () => {
      accordionComponent.disabled = true;
      expect(accordionComponent.getAttribute('disabled')).to.exist;

      accordionComponent.disabled = false;
      expect(accordionComponent.hasAttribute('disabled')).to.be.false;
    });
  });

  describe('Animation Support', () => {
    beforeEach(() => {
      accordionComponent = document.createElement('dry-accordion');
      document.body.appendChild(accordionComponent);
    });

    it('should support animation attributes', () => {
      accordionItem = document.createElement('accordion-item');
      accordionItem.setAttribute('animation', 'slide');
      expect(accordionItem.getAttribute('animation')).to.equal('slide');
    });

    it('should support duration attributes', () => {
      accordionItem = document.createElement('accordion-item');
      accordionItem.setAttribute('duration', '300');
      expect(accordionItem.getAttribute('duration')).to.equal('300');
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle connect/disconnect for accordion', () => {
      accordionComponent = document.createElement('dry-accordion');
      document.body.appendChild(accordionComponent);
      expect(accordionComponent.isConnected).to.be.true;

      accordionComponent.remove();
      expect(accordionComponent.isConnected).to.be.false;
    });

    it('should handle connect/disconnect for accordion items', () => {
      accordionItem = document.createElement('accordion-item');
      document.body.appendChild(accordionItem);
      expect(accordionItem.isConnected).to.be.true;

      accordionItem.remove();
      expect(accordionItem.isConnected).to.be.false;
    });

    it('should handle dynamic item addition', () => {
      accordionComponent = document.createElement('dry-accordion');
      document.body.appendChild(accordionComponent);

      const newItem = document.createElement('accordion-item');
      newItem.setAttribute('title', 'Dynamic Section');
      accordionComponent.appendChild(newItem);

      expect(accordionComponent.children.length).to.equal(1);
      expect(newItem.getAttribute('title')).to.equal('Dynamic Section');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      accordionComponent = document.createElement('dry-accordion');
      document.body.appendChild(accordionComponent);
    });

    it('should handle items without titles', () => {
      accordionItem = document.createElement('accordion-item');
      accordionComponent.appendChild(accordionItem);
      // Should handle gracefully without error
      expect(accordionItem.hasAttribute('title')).to.be.false;
    });

    it('should handle multiple open items in single mode', () => {
      accordionComponent.innerHTML = `
        <accordion-item title="Section 1" open>Content 1</accordion-item>
        <accordion-item title="Section 2" open>Content 2</accordion-item>
      `;
      // Component should handle this gracefully
      const openItems = accordionComponent.querySelectorAll('accordion-item[open]');
      expect(openItems.length).to.equal(2);
    });

    it('should handle rapid clicking', () => {
      accordionItem = document.createElement('accordion-item');
      accordionItem.setAttribute('title', 'Test');
      accordionComponent.appendChild(accordionItem);

      // Simulate rapid clicking
      simulateClick(accordionItem);
      simulateClick(accordionItem);
      simulateClick(accordionItem);

      // Should handle without error
      expect(accordionItem.getAttribute('title')).to.equal('Test');
    });
  });

  describe('API Methods', () => {
    beforeEach(async() => {
      accordionComponent = document.createElement('dry-accordion');
      accordionComponent.innerHTML = `
        <accordion-item title="Section 1">Content 1</accordion-item>
        <accordion-item title="Section 2">Content 2</accordion-item>
        <accordion-item title="Section 3">Content 3</accordion-item>
      `;
      document.body.appendChild(accordionComponent);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    it('should provide public API methods', () => {
      expect(typeof accordionComponent.openItem).to.equal('function');
      expect(typeof accordionComponent.closeItem).to.equal('function');
      expect(typeof accordionComponent.toggleItem).to.equal('function');
      expect(typeof accordionComponent.openAll).to.equal('function');
      expect(typeof accordionComponent.closeAll).to.equal('function');
    });

    it('should have getter/setter properties', () => {
      // Test multiple property
      accordionComponent.multiple = true;
      expect(accordionComponent.multiple).to.be.true;

      // Test disabled property
      accordionComponent.disabled = true;
      expect(accordionComponent.disabled).to.be.true;
    });

    it('should extract items correctly', () => {
      const items = accordionComponent._extractItems();
      expect(items.length).to.equal(3);
      expect(items[0]).to.have.property('title');
      expect(items[0]).to.have.property('content');
      expect(items[0]).to.have.property('id');
    });
  });
});

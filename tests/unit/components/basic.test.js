import '../setup.js';

describe('DRY2 Basic Tests', () => {
  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  describe('Test Environment', () => {
    it('should have jsdom environment setup', () => {
      expect(document).to.exist;
      expect(window).to.exist;
      expect(customElements).to.exist;
    });

    it('should have helper functions available', () => {
      expect(waitForComponent).to.be.a('function');
      expect(triggerEvent).to.be.a('function');
      expect(simulateClick).to.be.a('function');
      expect(cleanupDOM).to.be.a('function');
    });

    it('should clean DOM between tests', () => {
      document.body.innerHTML = '<div>test content</div>';
      expect(document.body.children.length).to.equal(1);

      cleanupDOM();
      expect(document.body.children.length).to.equal(0);
    });
  });

  describe('Core Infrastructure', () => {
    let BaseWebComponent;

    before(async() => {
      await import('../../../src/dry2/dry2.js');
      BaseWebComponent = global.BaseWebComponent;
    });

    it('should be available after import', () => {
      expect(BaseWebComponent).to.exist;
      expect(BaseWebComponent).to.be.a('function');
    });

    it('should extend HTMLElement', () => {
      expect(BaseWebComponent.prototype).to.be.instanceOf(HTMLElement.constructor);
    });

    it('should provide static escapeHtml method', () => {
      expect(BaseWebComponent.escapeHtml).to.be.a('function');

      const unsafe = '<script>alert("xss")</script>';
      const escaped = BaseWebComponent.escapeHtml(unsafe);

      expect(escaped).to.not.include('<script>');
      expect(escaped).to.include('&lt;script&gt;');
    });
  });

  describe('Component Registration', () => {
    it('should be able to define custom elements', () => {
      class TestComponent extends HTMLElement {
        connectedCallback() {
          this.innerHTML = '<div>Test Component</div>';
        }
      }

      const elementName = `test-element-${Date.now()}`;
      customElements.define(elementName, TestComponent);

      const element = document.createElement(elementName);
      document.body.appendChild(element);

      expect(element).to.be.instanceOf(TestComponent);
      expect(element.innerHTML).to.include('Test Component');
    });
  });

  describe('Event System', () => {
    it('should support custom events', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      let eventFired = false;
      let eventDetail = null;

      element.addEventListener('test:event', (event) => {
        eventFired = true;
        eventDetail = event.detail;
      });

      const customEvent = new CustomEvent('test:event', {
        detail: { test: 'data' },
        bubbles: true
      });

      element.dispatchEvent(customEvent);

      expect(eventFired).to.be.true;
      expect(eventDetail).to.deep.equal({ test: 'data' });
    });
  });

  describe('Component Loading', () => {
    it('should be able to import component files', async() => {
      // Test that component files can be imported without errors
              const componentFiles = [
            '../../../src/dry2/button.js',
            '../../../src/dry2/avatar.js',
        '../../../src/dry2/badge.js'
      ];

      for (const file of componentFiles) {
        try {
          await import(file);
          // If we get here, the import succeeded
          expect(true).to.be.true;
        } catch (error) {
          // If import fails, that's still valuable information
          console.warn(`Failed to import ${file}:`, error.message);
          expect(false).to.be.true; // Fail the test
        }
      }
    });
  });

  describe('Alpine.js Mock', () => {
    it('should have Alpine.js mock available', () => {
      expect(global.Alpine).to.exist;
      expect(global.Alpine.data).to.be.a('function');
      expect(global.Alpine.directive).to.be.a('function');
    });
  });

  describe('Helper Functions', () => {
    it('should provide waitForComponent helper', async() => {
      const element = document.createElement('div');
      element._isInitialized = true;
      document.body.appendChild(element);

      const result = await waitForComponent(element);
      expect(result).to.equal(element);
    });

    it('should provide triggerEvent helper', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      let eventFired = false;
      element.addEventListener('test', () => {
        eventFired = true;
      });

      triggerEvent(element, 'test');
      expect(eventFired).to.be.true;
    });

    it('should provide simulateClick helper', () => {
      const element = document.createElement('button');
      document.body.appendChild(element);

      let clickFired = false;
      element.addEventListener('click', () => {
        clickFired = true;
      });

      simulateClick(element);
      expect(clickFired).to.be.true;
    });
  });
});

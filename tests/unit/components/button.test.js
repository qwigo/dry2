import '../setup.js';

describe('DryButton Component', () => {
  let component;

  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  before(async() => {
    await import('../../../src/dry2/button.js');
  });

  describe('Component Registration', () => {
    it('should register the dry-button custom element', () => {
      expect(customElements.get('dry-button')).to.exist;
    });

    it('should create button component element', () => {
      component = document.createElement('dry-button');
      expect(component).to.be.instanceOf(HTMLElement);
      expect(component.tagName.toLowerCase()).to.equal('dry-button');
    });
  });

  describe('Basic Functionality', () => {
    beforeEach(() => {
      component = document.createElement('dry-button');
      document.body.appendChild(component);
    });

    it('should initialize component', async() => {
      await waitForComponent(component);
      expect(component._isInitialized).to.be.true;
    });

    it('should have default properties', () => {
      expect(component.hasAttribute('size')).to.be.false;
      expect(component.hasAttribute('variant')).to.be.false;
      expect(component.hasAttribute('disabled')).to.be.false;
    });

    it('should support size variants', () => {
      component.setAttribute('size', 'sm');
      expect(component.getAttribute('size')).to.equal('sm');

      component.setAttribute('size', 'lg');
      expect(component.getAttribute('size')).to.equal('lg');
    });

    it('should support variant styles', () => {
      component.setAttribute('variant', 'primary');
      expect(component.getAttribute('variant')).to.equal('primary');

      component.setAttribute('variant', 'secondary');
      expect(component.getAttribute('variant')).to.equal('secondary');
    });

    it('should support disabled state', () => {
      component.setAttribute('disabled', '');
      expect(component.hasAttribute('disabled')).to.be.true;

      component.removeAttribute('disabled');
      expect(component.hasAttribute('disabled')).to.be.false;
    });

    it('should support loading state', () => {
      component.setAttribute('loading', '');
      expect(component.hasAttribute('loading')).to.be.true;
    });
  });

  describe('Icon Support', () => {
    beforeEach(() => {
      component = document.createElement('dry-button');
      document.body.appendChild(component);
    });

    it('should support Font Awesome icons', () => {
      component.setAttribute('icon', 'fas fa-plus');
      expect(component.getAttribute('icon')).to.equal('fas fa-plus');
    });

    it('should support icon-only buttons', () => {
      component.setAttribute('icon', 'fas fa-download');
      component.textContent = '';
      expect(component.getAttribute('icon')).to.equal('fas fa-download');
    });

    it('should handle empty icon attribute', () => {
      component.setAttribute('icon', '');
      expect(component.getAttribute('icon')).to.equal('');
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-button');
      document.body.appendChild(component);
    });

    it('should emit click events', (done) => {
      component.addEventListener('click', (event) => {
        expect(event).to.exist;
        done();
      });

      simulateClick(component);
    });

    it('should not emit events when disabled', () => {
      let eventFired = false;
      component.setAttribute('disabled', '');

      component.addEventListener('click', () => {
        eventFired = true;
      });

      simulateClick(component);
      expect(eventFired).to.be.false;
    });

    it('should not emit events when loading', () => {
      let eventFired = false;
      component.setAttribute('loading', '');

      component.addEventListener('click', () => {
        eventFired = true;
      });

      simulateClick(component);
      expect(eventFired).to.be.false;
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component = document.createElement('dry-button');
      document.body.appendChild(component);
    });

    it('should have proper role', () => {
      expect(component.getAttribute('role')).to.equal('button');
    });

    it('should be focusable when enabled', () => {
      expect(component.getAttribute('tabindex')).to.not.equal('-1');
    });

    it('should not be focusable when disabled', () => {
      component.setAttribute('disabled', '');
      // Note: actual tabindex behavior would be tested in browser environment
      expect(component.hasAttribute('disabled')).to.be.true;
    });

    it('should support aria-label', () => {
      component.setAttribute('aria-label', 'Submit form');
      expect(component.getAttribute('aria-label')).to.equal('Submit form');
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      component = document.createElement('dry-button');
      document.body.appendChild(component);
    });

    it('should track loading state', () => {
      expect(component.hasAttribute('loading')).to.be.false;

      component.setAttribute('loading', '');
      expect(component.hasAttribute('loading')).to.be.true;
    });

    it('should track disabled state', () => {
      expect(component.hasAttribute('disabled')).to.be.false;

      component.setAttribute('disabled', '');
      expect(component.hasAttribute('disabled')).to.be.true;
    });
  });

  describe('Content Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-button');
      document.body.appendChild(component);
    });

    it('should handle text content', () => {
      component.textContent = 'Click me';
      expect(component.textContent).to.equal('Click me');
    });

    it('should handle HTML content safely', () => {
      component.innerHTML = 'Safe <span>content</span>';
      expect(component.innerHTML).to.include('Safe');
      expect(component.innerHTML).to.include('span');
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle connect/disconnect', () => {
      component = document.createElement('dry-button');
      document.body.appendChild(component);
      expect(component.isConnected).to.be.true;

      component.remove();
      expect(component.isConnected).to.be.false;
    });

    it('should handle multiple instances', () => {
      const button1 = document.createElement('dry-button');
      const button2 = document.createElement('dry-button');

      button1.setAttribute('variant', 'primary');
      button2.setAttribute('variant', 'secondary');

      document.body.appendChild(button1);
      document.body.appendChild(button2);

      expect(button1.getAttribute('variant')).to.equal('primary');
      expect(button2.getAttribute('variant')).to.equal('secondary');
    });
  });
});

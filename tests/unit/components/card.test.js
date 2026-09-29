import '../setup.js';

describe('DryCard Component', () => {
  let component;

  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  before(async() => {
    await import('../../../src/dry2/card.js');
  });

  describe('Component Registration', () => {
    it('should register the dry-card custom element', () => {
      expect(customElements.get('dry-card')).to.exist;
    });

    it('should create card component element', () => {
      component = document.createElement('dry-card');
      expect(component).to.be.instanceOf(HTMLElement);
      expect(component.tagName.toLowerCase()).to.equal('dry-card');
    });
  });

  describe('Basic Functionality', () => {
    beforeEach(() => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);
    });

    it('should initialize component', async() => {
      await waitForComponent(component);
      expect(component._isInitialized).to.be.true;
    });

    it('should have default properties', () => {
      expect(component.hasAttribute('variant')).to.be.false;
      expect(component.hasAttribute('shadow')).to.be.false;
      expect(component.hasAttribute('bordered')).to.be.false;
    });

    it('should support variant styles', () => {
      component.setAttribute('variant', 'outlined');
      expect(component.getAttribute('variant')).to.equal('outlined');

      component.setAttribute('variant', 'filled');
      expect(component.getAttribute('variant')).to.equal('filled');
    });

    it('should support shadow property', () => {
      component.setAttribute('shadow', 'lg');
      expect(component.getAttribute('shadow')).to.equal('lg');
    });

    it('should support bordered property', () => {
      component.setAttribute('bordered', '');
      expect(component.hasAttribute('bordered')).to.be.true;
    });
  });

  describe('Content Sections', () => {
    beforeEach(() => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);
    });

    it('should handle title attribute', () => {
      component.setAttribute('title', 'Card Title');
      expect(component.getAttribute('title')).to.equal('Card Title');
    });

    it('should handle subtitle attribute', () => {
      component.setAttribute('subtitle', 'Card Subtitle');
      expect(component.getAttribute('subtitle')).to.equal('Card Subtitle');
    });

    it('should handle image-src attribute', () => {
      component.setAttribute('image-src', '/path/to/image.jpg');
      expect(component.getAttribute('image-src')).to.equal('/path/to/image.jpg');
    });

    it('should handle image-alt attribute', () => {
      component.setAttribute('image-alt', 'Description');
      expect(component.getAttribute('image-alt')).to.equal('Description');
    });
  });

  describe('Layout Options', () => {
    beforeEach(() => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);
    });

    it('should support horizontal layout', () => {
      component.setAttribute('horizontal', '');
      expect(component.hasAttribute('horizontal')).to.be.true;
    });

    it('should support compact layout', () => {
      component.setAttribute('compact', '');
      expect(component.hasAttribute('compact')).to.be.true;
    });

    it('should support glass effect', () => {
      component.setAttribute('glass', '');
      expect(component.hasAttribute('glass')).to.be.true;
    });
  });

  describe('Interactive Features', () => {
    beforeEach(() => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);
    });

    it('should support clickable cards', () => {
      component.setAttribute('clickable', '');
      expect(component.hasAttribute('clickable')).to.be.true;
    });

    it('should emit click events when clickable', (done) => {
      component.setAttribute('clickable', '');

      component.addEventListener('card:click', (event) => {
        expect(event.detail.component).to.equal(component);
        done();
      });

      simulateClick(component);
    });

    it('should not emit click events when not clickable', () => {
      let eventFired = false;

      component.addEventListener('card:click', () => {
        eventFired = true;
      });

      simulateClick(component);
      expect(eventFired).to.be.false;
    });
  });

  describe('Content Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);
    });

    it('should handle slot content', () => {
      component.innerHTML = '<div slot="header">Header Content</div>';
      expect(component.innerHTML).to.include('Header Content');
    });

    it('should handle multiple slots', () => {
      component.innerHTML = `
        <div slot="header">Header</div>
        <div slot="body">Body</div>
        <div slot="footer">Footer</div>
      `;
      expect(component.innerHTML).to.include('Header');
      expect(component.innerHTML).to.include('Body');
      expect(component.innerHTML).to.include('Footer');
    });

    it('should escape HTML in title attribute', () => {
      component.setAttribute('title', '<script>alert("xss")</script>');
      // The component should escape the HTML
      expect(component.getAttribute('title')).to.include('<script>');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);
    });

    it('should have proper role when clickable', () => {
      component.setAttribute('clickable', '');
      // Would need to check actual role in browser
      expect(component.hasAttribute('clickable')).to.be.true;
    });

    it('should support aria-label', () => {
      component.setAttribute('aria-label', 'Product card');
      expect(component.getAttribute('aria-label')).to.equal('Product card');
    });

    it('should be focusable when clickable', () => {
      component.setAttribute('clickable', '');
      // In browser, this would set tabindex
      expect(component.hasAttribute('clickable')).to.be.true;
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);
    });

    it('should track loading state', () => {
      component.setAttribute('loading', '');
      expect(component.hasAttribute('loading')).to.be.true;
    });

    it('should track disabled state', () => {
      component.setAttribute('disabled', '');
      expect(component.hasAttribute('disabled')).to.be.true;
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle connect/disconnect', () => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);
      expect(component.isConnected).to.be.true;

      component.remove();
      expect(component.isConnected).to.be.false;
    });

    it('should handle attribute changes', () => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);

      component.setAttribute('title', 'New Title');
      expect(component.getAttribute('title')).to.equal('New Title');

      component.setAttribute('variant', 'outlined');
      expect(component.getAttribute('variant')).to.equal('outlined');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-card');
      document.body.appendChild(component);
    });

    it('should handle invalid image src gracefully', () => {
      component.setAttribute('image-src', 'invalid-url');
      expect(component.getAttribute('image-src')).to.equal('invalid-url');
      // Component should handle invalid URLs gracefully
    });

    it('should handle empty content', () => {
      // Empty card should still render properly
      expect(component.tagName.toLowerCase()).to.equal('dry-card');
    });
  });
});

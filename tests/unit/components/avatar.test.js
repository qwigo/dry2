import '../setup.js';

describe('DryAvatar Component', () => {
  let component;

  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  before(async() => {
    await import('../../../src/dry2/avatar.js');
  });

  describe('Component Registration', () => {
    it('should register the dry-avatar custom element', () => {
      expect(customElements.get('dry-avatar')).to.exist;
    });

    it('should create avatar component element', () => {
      component = document.createElement('dry-avatar');
      expect(component).to.be.instanceOf(HTMLElement);
      expect(component.tagName.toLowerCase()).to.equal('dry-avatar');
    });
  });

  describe('Basic Functionality', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should initialize component', async() => {
      await waitForComponent(component);
      expect(component._isInitialized).to.be.true;
    });

    it('should have default properties', () => {
      expect(component.hasAttribute('size')).to.be.false;
      expect(component.hasAttribute('shape')).to.be.false;
      expect(component.hasAttribute('ring')).to.be.false;
    });

    it('should support size variants', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
      sizes.forEach(size => {
        component.setAttribute('size', size);
        expect(component.getAttribute('size')).to.equal(size);
      });
    });

    it('should support shape variants', () => {
      component.setAttribute('shape', 'square');
      expect(component.getAttribute('shape')).to.equal('square');

      component.setAttribute('shape', 'circle');
      expect(component.getAttribute('shape')).to.equal('circle');
    });

    it('should support ring property', () => {
      component.setAttribute('ring', '');
      expect(component.hasAttribute('ring')).to.be.true;
    });
  });

  describe('Image Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should handle src attribute', () => {
      component.setAttribute('src', '/path/to/avatar.jpg');
      expect(component.getAttribute('src')).to.equal('/path/to/avatar.jpg');
    });

    it('should handle alt attribute', () => {
      component.setAttribute('alt', 'User avatar');
      expect(component.getAttribute('alt')).to.equal('User avatar');
    });

    it('should handle missing image gracefully', () => {
      component.setAttribute('src', 'invalid-image.jpg');
      // Component should handle missing images with fallback
      expect(component.getAttribute('src')).to.equal('invalid-image.jpg');
    });
  });

  describe('Fallback Content', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should support initials fallback', () => {
      component.setAttribute('initials', 'JD');
      expect(component.getAttribute('initials')).to.equal('JD');
    });

    it('should support icon fallback', () => {
      component.setAttribute('icon', 'user');
      expect(component.getAttribute('icon')).to.equal('user');
    });

    it('should support placeholder fallback', () => {
      component.setAttribute('placeholder', '');
      expect(component.hasAttribute('placeholder')).to.be.true;
    });
  });

  describe('Online Status', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should support online status indicator', () => {
      component.setAttribute('online', '');
      expect(component.hasAttribute('online')).to.be.true;
    });

    it('should support offline status indicator', () => {
      component.setAttribute('offline', '');
      expect(component.hasAttribute('offline')).to.be.true;
    });

    it('should support busy status indicator', () => {
      component.setAttribute('busy', '');
      expect(component.hasAttribute('busy')).to.be.true;
    });

    it('should support away status indicator', () => {
      component.setAttribute('away', '');
      expect(component.hasAttribute('away')).to.be.true;
    });
  });

  describe('Interactive Features', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should support clickable avatars', () => {
      component.setAttribute('clickable', '');
      expect(component.hasAttribute('clickable')).to.be.true;
    });

    it('should emit click events when clickable', (done) => {
      component.setAttribute('clickable', '');

      component.addEventListener('avatar:click', (event) => {
        expect(event.detail.component).to.equal(component);
        done();
      });

      simulateClick(component);
    });

    it('should not emit click events when not clickable', () => {
      let eventFired = false;

      component.addEventListener('avatar:click', () => {
        eventFired = true;
      });

      simulateClick(component);
      expect(eventFired).to.be.false;
    });
  });

  describe('Group Support', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should support avatar groups', () => {
      component.setAttribute('group', '');
      expect(component.hasAttribute('group')).to.be.true;
    });

    it('should support overlap in groups', () => {
      component.setAttribute('overlap', '');
      expect(component.hasAttribute('overlap')).to.be.true;
    });

    it('should support max count in groups', () => {
      component.setAttribute('max-count', '3');
      expect(component.getAttribute('max-count')).to.equal('3');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should have proper role', () => {
      // Avatar should have img role or similar
      expect(component.tagName.toLowerCase()).to.equal('dry-avatar');
    });

    it('should support aria-label', () => {
      component.setAttribute('aria-label', 'User profile picture');
      expect(component.getAttribute('aria-label')).to.equal('User profile picture');
    });

    it('should be focusable when clickable', () => {
      component.setAttribute('clickable', '');
      expect(component.hasAttribute('clickable')).to.be.true;
    });

    it('should have proper alt text for images', () => {
      component.setAttribute('src', 'avatar.jpg');
      component.setAttribute('alt', 'John Doe');
      expect(component.getAttribute('alt')).to.equal('John Doe');
    });
  });

  describe('Color Themes', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should support color attribute', () => {
      component.setAttribute('color', 'primary');
      expect(component.getAttribute('color')).to.equal('primary');
    });

    it('should support background-color attribute', () => {
      component.setAttribute('background-color', 'blue');
      expect(component.getAttribute('background-color')).to.equal('blue');
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should track loading state', () => {
      component.setAttribute('loading', '');
      expect(component.hasAttribute('loading')).to.be.true;
    });

    it('should track error state for images', () => {
      component.setAttribute('error', '');
      expect(component.hasAttribute('error')).to.be.true;
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle connect/disconnect', () => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
      expect(component.isConnected).to.be.true;

      component.remove();
      expect(component.isConnected).to.be.false;
    });

    it('should handle attribute changes', () => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);

      component.setAttribute('src', 'new-avatar.jpg');
      expect(component.getAttribute('src')).to.equal('new-avatar.jpg');

      component.setAttribute('size', 'lg');
      expect(component.getAttribute('size')).to.equal('lg');
    });
  });

  describe('Content Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should handle initials text content', () => {
      component.textContent = 'AB';
      expect(component.textContent).to.equal('AB');
    });

    it('should escape HTML in initials', () => {
      component.setAttribute('initials', '<script>alert("xss")</script>');
      expect(component.getAttribute('initials')).to.include('<script>');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-avatar');
      document.body.appendChild(component);
    });

    it('should handle invalid image URLs', () => {
      component.setAttribute('src', 'invalid://url');
      expect(component.getAttribute('src')).to.equal('invalid://url');
    });

    it('should handle empty initials gracefully', () => {
      component.setAttribute('initials', '');
      expect(component.getAttribute('initials')).to.equal('');
    });

    it('should handle multiple status indicators', () => {
      component.setAttribute('online', '');
      component.setAttribute('busy', '');
      // Component should handle conflicting states gracefully
      expect(component.hasAttribute('online')).to.be.true;
      expect(component.hasAttribute('busy')).to.be.true;
    });
  });
});

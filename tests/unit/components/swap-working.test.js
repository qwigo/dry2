import '../setup.js';

describe('SwapComponent (Working Tests)', () => {
  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  let SwapComponent;

  before(async() => {
    await import('../../../src/dry2/swap.js');
    SwapComponent = customElements.get('swap-component');
  });

  describe('Component Registration', () => {
    it('should register the swap-component custom element', () => {
      expect(SwapComponent).to.exist;
      expect(SwapComponent).to.be.a('function');
    });

    it('should create swap component element', () => {
      const swap = document.createElement('swap-component');
      expect(swap).to.be.instanceOf(SwapComponent);
      expect(swap).to.be.instanceOf(HTMLElement);
    });
  });

  describe('Basic Functionality', () => {
    let swap;

    beforeEach(() => {
      swap = document.createElement('swap-component');
      document.body.appendChild(swap);
    });

    it('should initialize component', async() => {
      await waitForComponent(swap);
      expect(swap._isInitialized).to.be.true;
    });

    it('should start in inactive state by default', () => {
      expect(swap.active).to.be.false;
      expect(swap._active).to.be.false;
    });

    it('should render basic structure', async() => {
      await waitForComponent(swap);

      const component = swap.querySelector('.swap-component');
      expect(component).to.exist;

      const icon = swap.querySelector('.swap-icon');
      expect(icon).to.exist;
    });

    it('should have proper default attributes', async() => {
      await waitForComponent(swap);

      const component = swap.querySelector('.swap-component');
      expect(component.getAttribute('role')).to.equal('button');
      expect(component.getAttribute('tabindex')).to.equal('0');
      expect(component.getAttribute('aria-pressed')).to.equal('false');
    });

    it('should support size variants', () => {
      expect(swap.size).to.equal('medium'); // default

      swap.size = 'small';
      expect(swap.getAttribute('size')).to.equal('small');

      swap.size = 'large';
      expect(swap.getAttribute('size')).to.equal('large');
    });

    it('should support disabled state', () => {
      expect(swap.disabled).to.be.false;

      swap.disabled = true;
      expect(swap.hasAttribute('disabled')).to.be.true;
      expect(swap.disabled).to.be.true;

      swap.disabled = false;
      expect(swap.hasAttribute('disabled')).to.be.false;
      expect(swap.disabled).to.be.false;
    });
  });

  describe('Icon Handling', () => {
    let swap;

    beforeEach(() => {
      swap = document.createElement('swap-component');
      document.body.appendChild(swap);
    });

    it('should have default icons', () => {
      expect(swap.iconOn).to.include('svg');
      expect(swap.iconOff).to.include('svg');
    });

    it('should support custom icons', () => {
      const customIconOn = '<i class="fas fa-check"></i>';
      const customIconOff = '<i class="fas fa-times"></i>';

      swap.setAttribute('icon-on', customIconOn);
      swap.setAttribute('icon-off', customIconOff);

      expect(swap.iconOn).to.equal(customIconOn);
      expect(swap.iconOff).to.equal(customIconOff);
    });
  });

  describe('State Management', () => {
    let swap;

    beforeEach(() => {
      swap = document.createElement('swap-component');
      document.body.appendChild(swap);
    });

    it('should toggle active state', () => {
      expect(swap.active).to.be.false;

      swap.active = true;
      expect(swap.active).to.be.true;
      expect(swap.hasAttribute('active')).to.be.true;

      swap.active = false;
      expect(swap.active).to.be.false;
      expect(swap.hasAttribute('active')).to.be.false;
    });

    it('should provide toggle method', () => {
      expect(swap.active).to.be.false;

      swap.toggle();
      expect(swap.active).to.be.true;

      swap.toggle();
      expect(swap.active).to.be.false;
    });

    it('should not toggle when disabled', () => {
      swap.disabled = true;
      expect(swap.active).to.be.false;

      swap.toggle();
      expect(swap.active).to.be.false;
    });

    it('should emit change event when state changes', (done) => {
      swap.addEventListener('swap:change', (event) => {
        expect(event.detail.active).to.be.true;
        expect(event.detail.component).to.equal(swap);
        done();
      });

      swap.active = true;
    });
  });

  describe('Disabled State', () => {
    let swap;

    beforeEach(() => {
      swap = document.createElement('swap-component');
      swap.disabled = true;
      document.body.appendChild(swap);
    });

    it('should have disabled styling after initialization', async() => {
      await waitForComponent(swap);

      const component = swap.querySelector('.swap-component');
      expect(component.className).to.include('opacity-50');
      expect(component.className).to.include('cursor-not-allowed');
    });

    it('should have tabindex -1 when disabled', async() => {
      await waitForComponent(swap);

      const component = swap.querySelector('.swap-component');
      expect(component.getAttribute('tabindex')).to.equal('-1');
    });
  });

  describe('Accessibility', () => {
    let swap;

    beforeEach(() => {
      swap = document.createElement('swap-component');
      document.body.appendChild(swap);
    });

    it('should have proper ARIA attributes', async() => {
      await waitForComponent(swap);

      const component = swap.querySelector('.swap-component');
      expect(component.getAttribute('role')).to.equal('button');
      expect(component.getAttribute('aria-pressed')).to.equal('false');
      expect(component.getAttribute('tabindex')).to.equal('0');
    });

    it('should update aria-pressed when state changes', async() => {
      await waitForComponent(swap);

      const component = swap.querySelector('.swap-component');
      expect(component.getAttribute('aria-pressed')).to.equal('false');

      swap.active = true;
      // Need to wait for re-render
      await new Promise(resolve => setTimeout(resolve, 50));

      const updatedComponent = swap.querySelector('.swap-component');
      expect(updatedComponent.getAttribute('aria-pressed')).to.equal('true');
    });
  });

  describe('Event Listeners', () => {
    let swap;

    beforeEach(async() => {
      swap = document.createElement('swap-component');
      document.body.appendChild(swap);
      await waitForComponent(swap);
    });

    it('should respond to click events', () => {
      expect(swap.active).to.be.false;

      const component = swap.querySelector('.swap-component');
      simulateClick(component);

      expect(swap.active).to.be.true;
    });

    it('should not respond to click when disabled', async() => {
      swap.disabled = true;
      await new Promise(resolve => setTimeout(resolve, 50)); // Wait for re-render

      expect(swap.active).to.be.false;

      const component = swap.querySelector('.swap-component');
      simulateClick(component);

      expect(swap.active).to.be.false;
    });
  });
});

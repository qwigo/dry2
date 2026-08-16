import { JSDOM } from 'jsdom';
import { expect } from 'chai';

// Setup JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

// Helper to (re)define a global that Node may already own as a read-only
// getter (e.g. `navigator`, built in since Node 21). Direct assignment
// throws "Cannot set property ... which has only a getter" in that case.
function setGlobal(name, value) {
  Object.defineProperty(global, name, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}

// Make DOM available globally
global.window = dom.window;
global.document = dom.window.document;
setGlobal('navigator', dom.window.navigator);
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;
global.MutationObserver = dom.window.MutationObserver;
global.requestAnimationFrame = dom.window.requestAnimationFrame;
global.cancelAnimationFrame = dom.window.cancelAnimationFrame;
global.Node = dom.window.Node;

// Add Proxy support if not available
if (!global.Proxy) {
  global.Proxy = class Proxy {
    constructor(target, handler) {
      return new Proxy(target, handler);
    }
  };
}

// Mock Alpine.js for testing
global.Alpine = {
  data: () => ({}),
  directive: () => {},
  magic: () => {},
  plugin: () => {},
  start: () => {},
  stop: () => {}
};

// Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null
};
global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

// Mock performance API
global.performance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
  getEntriesByName: () => [],
  getEntriesByType: () => []
};

// Add CSS support for testing
const mockCSS = {
  supports: () => true,
  escape: (str) => str
};
global.CSS = mockCSS;

// Helper function to wait for component initialization
global.waitForComponent = (element, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (element._isInitialized || element.shadowRoot || element.innerHTML.trim()) {
        resolve(element);
      } else if (Date.now() - start > timeout) {
        reject(new Error('Component initialization timeout'));
      } else {
        setTimeout(check, 10);
      }
    };
    check();
  });
};

// Helper function to trigger events
global.triggerEvent = (element, eventType, options = {}) => {
  if (!element || typeof element.dispatchEvent !== 'function') {
    console.warn('triggerEvent: Invalid element provided');
    return null;
  }
  const event = new CustomEvent(eventType, {
    bubbles: true,
    cancelable: true,
    ...options
  });
  element.dispatchEvent(event);
  return event;
};

// Helper function to simulate user interactions
global.simulateClick = (element) => {
  if (!element) {
    console.warn('simulateClick: No element provided');
    return;
  }
  triggerEvent(element, 'mousedown');
  triggerEvent(element, 'mouseup');
  triggerEvent(element, 'click');
};

global.simulateKeydown = (element, key, options = {}) => {
  triggerEvent(element, 'keydown', {
    detail: { key, ...options }
  });
};

// Make expect available globally
global.expect = expect;

// Cleanup function for tests
global.cleanupDOM = () => {
  document.body.innerHTML = '';
  // Clear any timers or intervals that might be running
  for (let i = 1; i < 1000; i++) {
    clearTimeout(i);
    clearInterval(i);
  }
};

// Setup BaseElement for component tests
// Create BaseElement before any component imports
class BaseElement extends HTMLElement {
  constructor() {
    super();
    this._isInitialized = false;
    this._componentData = {};
    this._originalContent = null;
  }

  connectedCallback() {
    if (!this._isInitialized) {
      this._waitForAlpineAndInitialize();
      this._isInitialized = true;
    }
  }

  _waitForAlpineAndInitialize() {
    // For testing, skip Alpine.js wait and initialize immediately
    this._initializeComponent();
  }

  _waitForChildrenAndInitialize() {
    // For testing, initialize immediately
    this._initializeComponent();
  }

  _initializeComponent() {
    // To be implemented by child classes
  }

  _extractContent() {
    return this.textContent.trim();
  }

  _getAttribute(name, defaultValue) {
    return this.getAttribute(name) || defaultValue;
  }

  _getAttributeWithDefault(name, defaultValue) {
    return this.getAttribute(name) || defaultValue;
  }

  _setAttribute(name, value) {
    if (value !== null && value !== undefined && value !== '') {
      this.setAttribute(name, value);
    } else {
      this.removeAttribute(name);
    }
  }

  _getBooleanAttribute(name) {
    return this.hasAttribute(name);
  }

  _setBooleanAttribute(name, value) {
    if (value) {
      this.setAttribute(name, '');
    } else {
      this.removeAttribute(name);
    }
  }

  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isInitialized) {
      this._render && this._render();
      this._attachEventListeners && this._attachEventListeners();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this._handleAttributeChange(name, oldValue, newValue);
  }

  _extractSlotContent(selector) {
    // Mock slot content extraction
    if (!selector) {
      return this.innerHTML || '';
    }
    
    const element = this.querySelector(selector);
    return element ? element.innerHTML : '';
  }

  disconnectedCallback() {
    // Cleanup logic
  }
}

// Make BaseElement globally available
global.BaseElement = BaseElement;
global.window.BaseElement = BaseElement;

console.log('Test environment setup complete');
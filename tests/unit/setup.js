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
//
// This used to hand-roll a third, independent copy of BaseElement here
// (in addition to the two that lived under src/), which drifted from the
// real implementation and was missing methods like _dispatchEvent and
// _ensureAlpineProcessing - any component that called them threw under
// test even though they work fine in a browser. Import the real class
// directly instead, so specs always exercise exactly what ships.
//
// Only the Alpine/children waiting methods are overridden below: they are
// asynchronous by design (poll for window.Alpine, wait on a
// MutationObserver), which would make every component test timer- and
// observer-dependent for no benefit in jsdom, where Alpine never actually
// attaches. Every other method - _dispatchEvent, _getNumericAttribute,
// _createAlpineDataString, etc. - runs unmodified from src/dry2/base.js.
await import('../../src/dry2/base.js');
const RealBaseElement = global.window.BaseElement;

class BaseElement extends RealBaseElement {
  _waitForAlpineAndInitialize() {
    // For testing, skip the Alpine.js wait and initialize immediately
    this._initializeComponent();
  }

  _waitForChildrenAndInitialize() {
    // For testing, skip the MutationObserver wait and initialize immediately
    this._initializeComponent();
  }
}

// Make BaseElement globally available
global.BaseElement = BaseElement;
global.window.BaseElement = BaseElement;

console.log('Test environment setup complete');
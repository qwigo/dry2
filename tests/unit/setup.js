/**
 * Test setup for DRY2 Web Components
 * Sets up the testing environment with vanilla JavaScript
 */

import { JSDOM } from 'jsdom';

// Create a JSDOM instance with a proper DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

// Set up global DOM
global.window = dom.window;
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.CustomEvent = window.CustomEvent;
global.MutationObserver = window.MutationObserver;
global.customElements = window.customElements;
global.Node = window.Node;
global.Event = window.Event;
global.MouseEvent = window.MouseEvent;

// Mock CSS classes for testing
global.window.getComputedStyle = () => ({
  getPropertyValue: () => ''
});

// Mock IntersectionObserver for components that might use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver for components that might use it
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia for responsive components
global.window.matchMedia = () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {}
});

// Set up a simple event system for testing
global.document.addEventListener = window.document.addEventListener.bind(window.document);
global.document.removeEventListener = window.document.removeEventListener.bind(window.document);
global.document.dispatchEvent = window.document.dispatchEvent.bind(window.document);

// Mock localStorage for components that might use it
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock sessionStorage for components that might use it
global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Set up console for debugging
global.console = console;

// Helper function to wait for component initialization
global.waitForComponent = async (element, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkInitialized = () => {
      if (element._isInitialized) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Component initialization timeout'));
      } else {
        setTimeout(checkInitialized, 10);
      }
    };
    
    checkInitialized();
  });
};

// Helper function to create a test component
global.createTestComponent = (tagName, attributes = {}, innerHTML = '') => {
  const element = document.createElement(tagName);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      element.setAttribute(key, value);
    }
  });
  
  // Set innerHTML
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  
  // Add to DOM
  document.body.appendChild(element);
  
  return element;
};

// Helper function to clean up test components
global.cleanupTestComponents = () => {
  const testComponents = document.querySelectorAll('[data-test]');
  testComponents.forEach(component => {
    if (component.parentNode) {
      component.parentNode.removeChild(component);
    }
  });
};

// Helper function to reset the document body between tests
global.cleanupDOM = () => {
  if (global.document && global.document.body) {
    global.document.body.innerHTML = '';
  }
};

// Helper function to simulate a click on an element
global.simulateClick = (element) => {
  const event = new global.window.MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: global.window
  });
  element.dispatchEvent(event);
  return event;
};

// Helper function to trigger events
global.triggerEvent = (element, eventType, eventData = {}) => {
  const event = new CustomEvent(eventType, {
    detail: eventData,
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(event);
};

// Helper function to wait for a specific event
global.waitForEvent = (element, eventType, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Event ${eventType} timeout`));
    }, timeout);
    
    const handler = (event) => {
      clearTimeout(timeoutId);
      element.removeEventListener(eventType, handler);
      resolve(event);
    };
    
    element.addEventListener(eventType, handler);
  });
};

// Load BaseElement into the global scope (after DOM globals above are set) so that
// component modules — which extend the ambient `BaseElement` like the browser bundle —
// can be imported in the ESM/mocha environment.
await import('../../src/dry2/base.js');
global.BaseElement = globalThis.BaseElement;

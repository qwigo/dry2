// Test setup for DRY2 Web Components
// Sets up the testing environment with vanilla JavaScript (no Alpine.js)

const { JSDOM } = require('jsdom');

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

// Load the vanilla state management system
require('../../src/dry2/vanilla-state.js');

// Load the base component class
require('../../src/dry2/base.js');

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

// Set up Chai for assertions
const chai = require('chai');
global.expect = chai.expect;

// Export for use in tests
module.exports = {
  setupTestEnvironment: () => {
    // Additional setup if needed
    return {
      window: global.window,
      document: global.document
    };
  }
};

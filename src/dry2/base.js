/**
 * BaseElement - A lightweight base class for custom elements without Shadow DOM
 * Designed for components that need to integrate with page styles and third-party libraries
 */
class BaseElement extends HTMLElement {
  constructor() {
    super();
    this._rendered = false;
    this._rendering = false;
    this._eventListeners = [];
  }

  /**
   * Lifecycle: Called when element is added to the DOM
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      this.beforeRender();
      this.render();
      this.afterRender();
      this.attachEventListeners();
      this.setAttribute('data-rendered', '');
      this._rendered = true;
    } else {
      // Re-attach event listeners if component is moved in DOM
      this.attachEventListeners();
    }
  }

  /**
   * Lifecycle: Called when element is removed from the DOM
   */
  disconnectedCallback() {
    this.removeEventListeners();
    this.cleanup();
  }

  /**
   * Lifecycle: Called when observed attributes change
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this._rendered) {
      this.onAttributeChange(name, oldValue, newValue);
    }
  }

  /**
   * Hook: Called before render (override in subclass)
   */
  beforeRender() {
    // Override in subclass for pre-render logic
  }

  /**
   * Hook: Called after render (override in subclass)
   */
  afterRender() {
    // Override in subclass for post-render logic
  }

  /**
   * Hook: Called when an observed attribute changes (override in subclass)
   */
  onAttributeChange(name, oldValue, newValue) {
    // Override in subclass to handle attribute changes
  }

  /**
   * Main render method - MUST be overridden in subclass
   */
  render() {
    throw new Error('render() must be implemented in subclass');
  }

  /**
   * Attach event listeners - override in subclass
   */
  attachEventListeners() {
    // Override in subclass
  }

  /**
   * Remove event listeners - override in subclass
   */
  removeEventListeners() {
    // Clean up tracked listeners
    this._eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this._eventListeners = [];
  }

  /**
   * Cleanup hook for subclasses
   */
  cleanup() {
    // Override in subclass for additional cleanup
  }

  /**
   * Helper: Add a tracked event listener that will be auto-removed
   */
  addTrackedListener(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this._eventListeners.push({ element, event, handler });
  }

  /**
   * Helper: Get an attribute value with a default fallback
   */
  getAttr(name, defaultValue = '') {
    return this.getAttribute(name) || defaultValue;
  }

  /**
   * Helper: Get an attribute as a boolean
   */
  getBoolAttr(name, defaultValue = false) {
    if (!this.hasAttribute(name)) return defaultValue;
    const value = this.getAttribute(name);
    return value !== 'false' && value !== '0';
  }

  /**
   * Helper: Get an attribute as a number
   */
  getNumberAttr(name, defaultValue = 0) {
    const value = this.getAttribute(name);
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Helper: Query selector within this component
   */
  $(selector) {
    return this.querySelector(selector);
  }

  /**
   * Helper: Query selector all within this component
   */
  $$(selector) {
    return Array.from(this.querySelectorAll(selector));
  }

  /**
   * Helper: Dispatch a custom event from this component
   */
  emit(eventName, detail = {}, options = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
      ...options
    });
    return this.dispatchEvent(event);
  }

  /**
   * Helper: Re-render the component (preserves event listeners)
   */
  reRender() {
    // Prevent infinite loops from attributes changing during render
    if (this._rendering) return;

    this._rendering = true;
    try {
      this.removeEventListeners();
      this.render();
      this.attachEventListeners();
    } finally {
      this._rendering = false;
    }
  }

  /**
   * Helper: Preserve original children for use in templates
   */
  getOriginalContent() {
    return this.innerHTML;
  }
}

/**
 * Export for use in component library
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseElement;
}
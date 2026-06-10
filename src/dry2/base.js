/**
 * BaseElement - Base class for all DRY2 components
 * Provides common functionality including Alpine.js integration
 */
class BaseElement extends HTMLElement {
  constructor() {
    super();
    this._isInitialized = false;
    this._componentData = {};
    this._originalContent = null;
    this._managedListeners = new Map();
  }

  /**
   * Maximum time (ms) to wait for Alpine.js before initializing without it
   */
  static get ALPINE_WAIT_TIMEOUT() {
    return 10000;
  }

  connectedCallback() {
    if (!this._isInitialized) {
      this._waitForAlpineAndInitialize();
      this._isInitialized = true;
    }
  }

  /**
   * Wait for Alpine.js to be ready, then initialize the component.
   * Polling is bounded by ALPINE_WAIT_TIMEOUT so components still
   * initialize (without Alpine) if Alpine never loads.
   */
  _waitForAlpineAndInitialize() {
    if (window.Alpine && window.Alpine.version) {
      // Alpine is loaded, initialize immediately
      this._initializeComponent();
      return;
    }

    // Alpine not loaded yet, share a single polling promise across components
    if (!window.alpineLoadPromise) {
      window.alpineLoadPromise = new Promise(resolve => {
        const startedAt = Date.now();
        const checkAlpine = () => {
          if (window.Alpine && window.Alpine.version) {
            resolve(true);
          } else if (Date.now() - startedAt >= BaseElement.ALPINE_WAIT_TIMEOUT) {
            console.warn('Alpine.js was not detected within the timeout; DRY2 components will initialize without Alpine.');
            resolve(false);
          } else {
            setTimeout(checkAlpine, 10);
          }
        };
        checkAlpine();
      });
    }

    window.alpineLoadPromise.then(() => {
      this._initializeComponent();
    });
  }

  /**
   * Wait for children to be added using MutationObserver
   * Useful for components that need to process child elements
   */
  _waitForChildrenAndInitialize() {
    // Guard so the observer and the timer fallbacks can never
    // initialize the same component twice
    let initialized = false;
    const initialize = () => {
      if (initialized) {
        return;
      }
      initialized = true;
      observer.disconnect();
      this._originalContent = this.innerHTML;
      this._waitForAlpineAndInitialize();
    };

    const observer = new MutationObserver(() => {
      if (this.children.length > 0) {
        initialize();
      }
    });

    observer.observe(this, { childList: true, subtree: true });

    // Fallback: if children are already present, initialize immediately
    setTimeout(() => {
      if (this.children.length > 0) {
        initialize();
      } else {
        // No children found, try again with longer delay
        setTimeout(initialize, 500);
      }
    }, 100);
  }

  /**
   * Force Alpine to process this component
   */
  _ensureAlpineProcessing() {
    if (window.Alpine && typeof window.Alpine.initTree === 'function') {
      // Give Alpine a moment to process, then force init if needed
      setTimeout(() => {
        const alpineRoot = this.querySelector('[x-data]');
        // _x_dataStack is Alpine v3, __x is Alpine v2
        const alreadyProcessed = alpineRoot && (alpineRoot._x_dataStack || alpineRoot.__x);
        if (alpineRoot && !alreadyProcessed) {
          try {
            window.Alpine.initTree(this);
          } catch (e) {
            // Fallback: try again in a moment
            setTimeout(() => {
              try {
                window.Alpine.initTree(this);
              } catch (err) {
                console.warn(`Alpine.js initialization delayed for ${this.tagName.toLowerCase()} component`);
              }
            }, 100);
          }
        }
      }, 50);
    }
  }

  /**
   * Override this method in child classes to implement component initialization
   */
  _initializeComponent() {
    // To be implemented by child classes
    console.warn(`Component ${this.tagName.toLowerCase()} should implement _initializeComponent()`);
  }

  /**
   * Get Alpine.js data from the component
   */
  _getAlpineData() {
    const alpineElement = this.querySelector('[x-data]');
    if (!alpineElement || !window.Alpine) {
      return null;
    }
    try {
      // _x_dataStack is Alpine v3, __x is Alpine v2
      return alpineElement._x_dataStack?.[0] ||
             alpineElement.__x?.$data ||
             (typeof window.Alpine.$data === 'function' ? window.Alpine.$data(alpineElement) : null);
    } catch (e) {
      return null;
    }
  }

  /**
   * Extract text content from the element, preserving structure
   */
  _extractContent() {
    return this.textContent.trim();
  }

  /**
   * Extract slot content for components that use slots
   */
  _extractSlotContent() {
    // Null prototype so slot names like "__proto__" or "constructor"
    // cannot mutate the object's prototype chain
    const slots = Object.create(null);
    const slotElements = this.querySelectorAll('[slot]');

    slotElements.forEach(element => {
      const slotName = element.getAttribute('slot');
      if (!slotName) {
        return;
      }
      slots[slotName] = element.outerHTML;
      element.remove();
    });

    // Default slot is any remaining content
    if (this.innerHTML.trim() && !slots.default) {
      slots.default = this.innerHTML.trim();
    }

    return slots;
  }

  /**
   * Escape a string so it is safe inside a single-quoted JS string literal
   * embedded in an HTML attribute (e.g. x-data="{ key: '...' }").
   * Quotes and angle brackets are unicode-escaped so the value can neither
   * terminate the surrounding attribute nor inject markup or script.
   */
  _escapeJsString(value) {
    return String(value)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\u0022')
      .replace(/</g, '\\u003C')
      .replace(/>/g, '\\u003E')
      .replace(/&/g, '\\u0026')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }

  /**
   * Utility method to create Alpine.js data object string.
   * All keys and string values are escaped so untrusted values cannot
   * break out of the generated expression or the surrounding attribute.
   */
  _createAlpineDataString(dataObject) {
    const entries = Object.entries(dataObject).map(([key, value]) => {
      return `'${this._escapeJsString(key)}': ${this._serializeAlpineValue(value)}`;
    }).join(',\n        ');

    return `{
        ${entries}
      }`;
  }

  /**
   * Serialize a single value for use inside an Alpine.js expression
   */
  _serializeAlpineValue(value, seen = new WeakSet()) {
    if (value === null) {
      return 'null';
    }
    if (value === undefined) {
      return 'undefined';
    }
    const type = typeof value;
    if (type === 'string') {
      return `'${this._escapeJsString(value)}'`;
    }
    if (type === 'boolean' || type === 'number') {
      return String(value);
    }
    if (type === 'function') {
      // Functions are developer-supplied code, serialized verbatim
      return value.toString();
    }
    if (type === 'object') {
      if (seen.has(value)) {
        throw new Error('Cannot serialize circular structure for Alpine data');
      }
      seen.add(value);
      if (Array.isArray(value)) {
        return `[${value.map(item => this._serializeAlpineValue(item, seen)).join(', ')}]`;
      }
      const entries = Object.entries(value).map(([key, item]) => {
        return `'${this._escapeJsString(key)}': ${this._serializeAlpineValue(item, seen)}`;
      });
      return `{ ${entries.join(', ')} }`;
    }
    return 'null';
  }

  /**
   * Utility method to safely set an attribute
   */
  _setAttribute(name, value) {
    if (value !== null && value !== undefined && value !== '') {
      this.setAttribute(name, value);
    } else {
      this.removeAttribute(name);
    }
  }

  /**
   * Utility method to get boolean attribute
   */
  _getBooleanAttribute(name) {
    return this.hasAttribute(name);
  }

  /**
   * Utility method to set boolean attribute
   */
  _setBooleanAttribute(name, value) {
    if (value) {
      this.setAttribute(name, '');
    } else {
      this.removeAttribute(name);
    }
  }

  /**
   * Utility method to get attribute with default value
   */
  _getAttributeWithDefault(name, defaultValue) {
    return this.getAttribute(name) || defaultValue;
  }

  /**
   * Utility method to get numeric attribute with default value
   */
  _getNumericAttribute(name, defaultValue = 0) {
    const value = this.getAttribute(name);
    if (value === null) {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Utility method to set numeric attribute
   */
  _setNumericAttribute(name, value) {
    if (typeof value === 'number' && !isNaN(value)) {
      this.setAttribute(name, value.toString());
    } else {
      this.removeAttribute(name);
    }
  }

  /**
   * Common method to handle attribute changes and update component data
   */
  _updateComponentData(attributeName, newValue) {
    if (this._componentData && Object.prototype.hasOwnProperty.call(this._componentData, attributeName)) {
      this._componentData[attributeName] = newValue;
      this._refresh();
    }
  }

  /**
   * Refresh the component (re-render if needed)
   * Override in child classes for custom refresh behavior
   */
  _refresh() {
    // Default implementation - trigger a re-render if render method exists
    if (typeof this._render === 'function') {
      this._render();
      this._ensureAlpineProcessing();
    }
  }

  /**
   * Utility method to create CSS classes string
   */
  _createClassString(baseClasses, conditionalClasses = {}) {
    let classes = Array.isArray(baseClasses) ? baseClasses.join(' ') : baseClasses;

    Object.entries(conditionalClasses).forEach(([className, condition]) => {
      if (condition) {
        classes += ` ${className}`;
      }
    });

    return classes.trim();
  }

  /**
   * Get size classes based on size attribute
   */
  _getSizeClasses(sizeMap = {}) {
    const size = this._getAttributeWithDefault('size', 'md');
    return sizeMap[size] || sizeMap.md || '';
  }

  /**
   * Get variant classes based on variant attribute
   */
  _getVariantClasses(variantMap = {}) {
    const variant = this._getAttributeWithDefault('variant', 'primary');
    return variantMap[variant] || variantMap.primary || '';
  }

  /**
   * Add event listeners on this element. Repeated calls with the same event
   * name replace the previous handler instead of stacking duplicates.
   * Use _removeEventListeners() for explicit cleanup.
   */
  _addEventListeners(eventMap = {}) {
    if (!this._managedListeners) {
      this._managedListeners = new Map();
    }
    Object.entries(eventMap).forEach(([event, handler]) => {
      const previous = this._managedListeners.get(event);
      if (previous) {
        this.removeEventListener(event, previous);
      }
      const bound = handler.bind(this);
      this._managedListeners.set(event, bound);
      this.addEventListener(event, bound);
    });
  }

  /**
   * Remove all listeners registered through _addEventListeners
   */
  _removeEventListeners() {
    if (!this._managedListeners) {
      return;
    }
    this._managedListeners.forEach((handler, event) => {
      this.removeEventListener(event, handler);
    });
    this._managedListeners.clear();
  }

  /**
   * Dispatch a custom event from this component
   */
  _dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    this.dispatchEvent(event);
  }

  /**
   * Handle common attribute changes
   * Override in child classes for specific handling
   */
  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isInitialized) {
      // Common refresh trigger for most attributes
      this._refresh();
    }
  }

  /**
   * Standard attributeChangedCallback that delegates to _handleAttributeChange
   */
  attributeChangedCallback(name, oldValue, newValue) {
    this._handleAttributeChange(name, oldValue, newValue);
  }

  /**
   * Common cleanup method - override in child classes if needed
   */
  disconnectedCallback() {
    // Cleanup logic can be added here
  }
}

// Make BaseElement globally available
window.BaseElement = BaseElement;

/**
 * Alpine.js Utilities for DRY2 Components
 * Solves the "first component doesn't work" timing issue
 */

// Global Alpine utilities - delegate to BaseElement to avoid duplicating logic
window.DRY2AlpineUtils = {
  _waitForAlpineAndInitialize: BaseElement.prototype._waitForAlpineAndInitialize,
  _ensureAlpineProcessing: BaseElement.prototype._ensureAlpineProcessing,

  // Helper function to apply Alpine mixin to a component class
  withAlpineInit(ComponentClass) {
    // Copy the Alpine methods to the component prototype
    ComponentClass.prototype._waitForAlpineAndInitialize = this._waitForAlpineAndInitialize;
    ComponentClass.prototype._ensureAlpineProcessing = this._ensureAlpineProcessing;

    // Override connectedCallback to use Alpine initialization
    const originalConnectedCallback = ComponentClass.prototype.connectedCallback;
    ComponentClass.prototype.connectedCallback = function() {
      if (!this._isInitialized) {
        this._waitForAlpineAndInitialize();
        this._isInitialized = true;
      }

      // Call original if it exists and has additional logic
      if (originalConnectedCallback && originalConnectedCallback !== this.connectedCallback) {
        originalConnectedCallback.call(this);
      }
    };

    return ComponentClass;
  }
};

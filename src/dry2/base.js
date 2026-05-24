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
    this._pendingTimeouts = [];
    this._childrenObserver = null;
  }

  connectedCallback() {
    if (!this._isInitialized) {
      this._waitForAlpineAndInitialize();
      this._isInitialized = true;
    }
  }

  /**
   * Wait for Alpine.js to be ready, then initialize the component
   */
  _waitForAlpineAndInitialize() {
    // Check if Alpine.js is loaded
    if (window.Alpine && window.Alpine.version) {
      // Alpine is loaded, initialize immediately
      this._initializeComponent();
    } else {
      // Alpine not loaded yet, wait for it
      if (!window.alpineLoadPromise) {
        window.alpineLoadPromise = new Promise(resolve => {
          if (window.Alpine && window.Alpine.version) {
            resolve();
          } else {
            const checkAlpine = () => {
              if (window.Alpine && window.Alpine.version) {
                resolve();
              } else {
                setTimeout(checkAlpine, 10);
              }
            };
            checkAlpine();
          }
        });
      }
      
      window.alpineLoadPromise.then(() => {
        this._initializeComponent();
      });
    }
  }

  /**
   * Wait for children to be added using MutationObserver
   * Useful for components that need to process child elements
   */
  _waitForChildrenAndInitialize() {
    const observer = new MutationObserver((mutations) => {
      const hasChildren = mutations.some(mutation => mutation.addedNodes.length > 0);
      if (hasChildren && this.children.length > 0) {
        observer.disconnect();
        this._childrenObserver = null;
        this._originalContent = this.innerHTML;
        this._waitForAlpineAndInitialize();
      }
    });

    this._childrenObserver = observer;
    observer.observe(this, { childList: true, subtree: true });

    const t1 = setTimeout(() => {
      if (this.children.length > 0) {
        observer.disconnect();
        this._childrenObserver = null;
        this._originalContent = this.innerHTML;
        this._waitForAlpineAndInitialize();
      } else {
        const t2 = setTimeout(() => {
          observer.disconnect();
          this._childrenObserver = null;
          this._originalContent = this.innerHTML;
          this._waitForAlpineAndInitialize();
        }, 500);
        this._pendingTimeouts.push(t2);
      }
    }, 100);
    this._pendingTimeouts.push(t1);
  }

  /**
   * Force Alpine to process this component
   */
  _ensureAlpineProcessing() {
    if (window.Alpine && window.Alpine.initTree) {
      // Give Alpine a moment to process, then force init if needed
      setTimeout(() => {
        const alpineData = this.querySelector('[x-data]');
        if (alpineData && !alpineData.__x) {
          try {
            window.Alpine.initTree(this);
          } catch (e) {
            // Fallback: try again in a moment
            setTimeout(() => {
              try {
                window.Alpine.initTree(this);
              } catch (e) {
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
    if (alpineElement && window.Alpine) {
      // Try multiple ways to access Alpine.js data
      return alpineElement._x_dataStack?.[0] || 
             alpineElement.__x?.$data || 
             window.Alpine.$data(alpineElement);
    }
    return null;
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
    const slots = {};
    const slotElements = this.querySelectorAll('[slot]');
    
    slotElements.forEach(element => {
      const slotName = element.getAttribute('slot');
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
   * Utility method to create Alpine.js data object string
   */
  _createAlpineDataString(dataObject) {
    const entries = Object.entries(dataObject).map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}: '${value.replace(/'/g, "\\'")}'`;
      } else if (typeof value === 'boolean') {
        return `${key}: ${value}`;
      } else if (typeof value === 'number') {
        return `${key}: ${value}`;
      } else if (typeof value === 'function') {
        return `${key}: ${value.toString()}`;
      } else {
        return `${key}: ${JSON.stringify(value)}`;
      }
    }).join(',\n        ');
    
    return `{
        ${entries}
      }`;
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
    return value !== null ? parseInt(value, 10) || defaultValue : defaultValue;
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
    if (this._componentData && this._componentData.hasOwnProperty(attributeName)) {
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
   * Add event listeners with automatic cleanup
   */
  _addEventListeners(eventMap = {}) {
    Object.entries(eventMap).forEach(([event, handler]) => {
      this.addEventListener(event, handler.bind(this));
    });
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

  _escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _escapeForJs(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  disconnectedCallback() {
    this._pendingTimeouts.forEach(id => clearTimeout(id));
    this._pendingTimeouts = [];
    if (this._childrenObserver) {
      this._childrenObserver.disconnect();
      this._childrenObserver = null;
    }
  }
}

// Make BaseElement globally available
window.BaseElement = BaseElement;
window.DRY2 = window.DRY2 || {};
window.DRY2.BaseElement = BaseElement;

/**
 * Alpine.js Utilities for DRY2 Components
 * Solves the "first component doesn't work" timing issue
 */

// Global Alpine utilities - no ES6 modules needed
window.DRY2AlpineUtils = {
  // Alpine initialization methods that get mixed into components
  _waitForAlpineAndInitialize() {
    // Check if Alpine.js is loaded
    if (window.Alpine && window.Alpine.version) {
      // Alpine is loaded, initialize immediately
      this._initializeComponent();
    } else {
      // Alpine not loaded yet, wait for it
      if (!window.alpineLoadPromise) {
        window.alpineLoadPromise = new Promise(resolve => {
          if (window.Alpine && window.Alpine.version) {
            resolve();
          } else {
            const checkAlpine = () => {
              if (window.Alpine && window.Alpine.version) {
                resolve();
              } else {
                setTimeout(checkAlpine, 10);
              }
            };
            checkAlpine();
          }
        });
      }
      
      window.alpineLoadPromise.then(() => {
        this._initializeComponent();
      });
    }
  },

  _ensureAlpineProcessing() {
    // Force Alpine to process this component if it's available
    if (window.Alpine && window.Alpine.initTree) {
      // Give Alpine a moment to process, then force init if needed
      setTimeout(() => {
        const alpineData = this.querySelector('[x-data]');
        if (alpineData && !alpineData.__x) {
          try {
            window.Alpine.initTree(this);
          } catch (e) {
            // Fallback: try again in a moment
            setTimeout(() => {
              try {
                window.Alpine.initTree(this);
              } catch (e) {
                console.warn(`Alpine.js initialization delayed for ${this.tagName.toLowerCase()} component`);
              }
            }, 100);
          }
        }
      }, 50);
    }
  },

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
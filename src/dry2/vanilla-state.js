/**
 * Vanilla JavaScript State Management System
 * Proxy-based reactive state management with pure vanilla JS
 */

class VanillaState {
  constructor(data = {}) {
    this.data = { ...data };
    this.watchers = new Map();
    this._computed = new Map();
    this.effects = [];
    this.isUpdating = false;
    this.updateQueue = [];
  }

  /**
   * Create a reactive proxy for the data object
   */
  createReactive() {
    const self = this;
    return new Proxy(this.data, {
      get(target, property) {
        if (self._computed.has(property)) {
          return self._computed.get(property).call(self.data);
        }
        return target[property];
      },
      set(target, property, value) {
        const oldValue = target[property];
        if (oldValue !== value) {
          target[property] = value;
          self._notifyWatchers(property, value, oldValue);
          self._scheduleUpdate();
        }
        return true;
      }
    });
  }

  /**
   * Watch for changes to specific properties
   */
  watch(property, callback) {
    if (!this.watchers.has(property)) {
      this.watchers.set(property, []);
    }
    this.watchers.get(property).push(callback);
  }

  /**
   * Add computed properties
   */
  computed(name, fn) {
    this._computed.set(name, fn);
  }

  /**
   * Add effect that runs when dependencies change
   */
  effect(fn) {
    this.effects.push(fn);
    fn.call(this.data);
  }

  /**
   * Notify watchers of property changes
   */
  _notifyWatchers(property, newValue, oldValue) {
    const propertyWatchers = this.watchers.get(property);
    if (propertyWatchers) {
      propertyWatchers.forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error(`Error in watcher for ${property}:`, error);
        }
      });
    }
  }

  /**
   * Schedule DOM updates to avoid excessive re-renders
   */
  _scheduleUpdate() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    queueMicrotask(() => {
      this._processUpdateQueue();
      this.isUpdating = false;
    });
  }

  /**
   * Process queued updates
   */
  _processUpdateQueue() {
    // Run all effects
    this.effects.forEach(effect => {
      try {
        effect.call(this.data);
      } catch (error) {
        console.error('Error in effect:', error);
      }
    });
  }

  /**
   * Get current state
   */
  getState() {
    return this.data;
  }

  /**
   * Update multiple properties at once
   */
  setState(newState) {
    Object.assign(this.data, newState);
    Object.keys(newState).forEach(property => {
      this._notifyWatchers(property, newState[property], undefined);
    });
    this._scheduleUpdate();
  }
}

/**
 * Vanilla DOM manipulation utilities
 */
class VanillaDOM {
  /**
   * Show/hide elements with transition support
   */
  static toggle(element, show, options = {}) {
    if (!element) return;

    const { transition = true, duration = 300 } = options;

    if (!transition) {
      element.style.display = show ? '' : 'none';
      return;
    }

    if (show) {
      element.style.display = '';
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease`;
      
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        setTimeout(() => {
          element.style.transition = '';
        }, duration);
      });
    } else {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = '0';
      
      setTimeout(() => {
        element.style.display = 'none';
        element.style.transition = '';
      }, duration);
    }
  }

  /**
   * Add/remove classes based on condition
   */
  static toggleClass(element, className, condition) {
    if (!element) return;
    
    if (condition) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  /**
   * Set text content safely
   */
  static setText(element, text) {
    if (!element) return;
    element.textContent = text || '';
  }

  /**
   * Set HTML content safely (with XSS protection)
   */
  static setHTML(element, html) {
    if (!element) return;
    element.innerHTML = html || '';
  }

  /**
   * Add event listener with automatic cleanup tracking
   */
  static on(element, event, handler, options = {}) {
    if (!element) return;
    
    const wrappedHandler = (event) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    };
    
    element.addEventListener(event, wrappedHandler, options);
    
    // Return cleanup function
    return () => element.removeEventListener(event, wrappedHandler);
  }

  /**
   * Find elements matching selector
   */
  static find(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

  /**
   * Find single element
   */
  static findOne(selector, context = document) {
    return context.querySelector(selector);
  }

  /**
   * Create element with attributes and content
   */
  static create(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.assign(element.dataset, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (content) {
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else if (content instanceof Element) {
        element.appendChild(content);
      }
    }
    
    return element;
  }
}

/**
 * Vanilla transitions and animations
 */
class VanillaTransitions {
  /**
   * Fade transition
   */
  static fade(element, show, options = {}) {
    const { duration = 300, easing = 'ease' } = options;
    
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
      if (show) {
        element.style.display = '';
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ${easing}`;
        
        requestAnimationFrame(() => {
          element.style.opacity = '1';
          setTimeout(() => {
            element.style.transition = '';
            resolve();
          }, duration);
        });
      } else {
        element.style.transition = `opacity ${duration}ms ${easing}`;
        element.style.opacity = '0';
        
        setTimeout(() => {
          element.style.display = 'none';
          element.style.transition = '';
          resolve();
        }, duration);
      }
    });
  }

  /**
   * Slide transition
   */
  static slide(element, show, options = {}) {
    const { duration = 300, direction = 'down' } = options;
    
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
      const isVertical = direction === 'up' || direction === 'down';
      const property = isVertical ? 'height' : 'width';
      const fullValue = isVertical ? element.scrollHeight : element.scrollWidth;
      
      if (show) {
        element.style.display = '';
        element.style[property] = '0';
        element.style.overflow = 'hidden';
        element.style.transition = `${property} ${duration}ms ease`;
        
        requestAnimationFrame(() => {
          element.style[property] = `${fullValue}px`;
          setTimeout(() => {
            element.style[property] = '';
            element.style.overflow = '';
            element.style.transition = '';
            resolve();
          }, duration);
        });
      } else {
        element.style.overflow = 'hidden';
        element.style.transition = `${property} ${duration}ms ease`;
        element.style[property] = `${fullValue}px`;
        
        requestAnimationFrame(() => {
          element.style[property] = '0';
          setTimeout(() => {
            element.style.display = 'none';
            element.style[property] = '';
            element.style.overflow = '';
            element.style.transition = '';
            resolve();
          }, duration);
        });
      }
    });
  }

  /**
   * Scale transition (for badges, modals, etc.)
   */
  static scale(element, show, options = {}) {
    const { duration = 200, scale = 0.75 } = options;
    
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
      if (show) {
        element.style.display = '';
        element.style.transform = `scale(${scale})`;
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
          element.style.transform = 'scale(1)';
          element.style.opacity = '1';
          setTimeout(() => {
            element.style.transition = '';
            resolve();
          }, duration);
        });
      } else {
        element.style.transition = `all ${duration}ms ease-in`;
        element.style.transform = `scale(${scale})`;
        element.style.opacity = '0';
        
        setTimeout(() => {
          element.style.display = 'none';
          element.style.transform = '';
          element.style.opacity = '';
          element.style.transition = '';
          resolve();
        }, duration);
      }
    });
  }
}

/**
 * Template rendering system
 */
class VanillaTemplates {
  /**
   * Render template with data
   */
  static render(template, data) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      try {
        const value = new Function('data', `with(data) { return ${expression.trim()} }`)(data);
        return value != null ? value : '';
      } catch (error) {
        console.error(`Template error in expression "${expression}":`, error);
        return '';
      }
    });
  }

  /**
   * Conditional rendering
   */
  static if(condition, trueTemplate, falseTemplate = '') {
    return condition ? trueTemplate : falseTemplate;
  }

  /**
   * Loop rendering
   */
  static each(array, itemTemplate, emptyTemplate = '') {
    if (!Array.isArray(array) || array.length === 0) {
      return emptyTemplate;
    }
    
    return array.map((item, index) => {
      const context = { ...item, $index: index, $first: index === 0, $last: index === array.length - 1 };
      return typeof itemTemplate === 'function' ? itemTemplate(context) : VanillaTemplates.render(itemTemplate, context);
    }).join('');
  }
}

/**
 * Component state manager
 * Manages state for individual components
 */
class ComponentState {
  constructor(element, initialData = {}) {
    this.element = element;
    this.state = new VanillaState(initialData);
    this.reactive = this.state.createReactive();
    this.cleanupFunctions = [];
    this.isDestroyed = false;
    
    // Auto-cleanup on element removal
    this._setupCleanupObserver();
  }

  /**
   * Setup cleanup observer to detect when element is removed from DOM
   */
  _setupCleanupObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.removedNodes.forEach(node => {
          if (node === this.element || node.contains(this.element)) {
            this.destroy();
            observer.disconnect();
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.cleanupFunctions.push(() => observer.disconnect());
  }

  /**
   * Watch for state changes
   */
  watch(property, callback) {
    this.state.watch(property, callback);
    return this;
  }

  /**
   * Add computed property
   */
  computed(name, fn) {
    this.state.computed(name, fn);
    return this;
  }

  /**
   * Add effect
   */
  effect(fn) {
    this.state.effect(fn);
    return this;
  }

  /**
   * Update state
   */
  setState(newState) {
    this.state.setState(newState);
    return this;
  }

  /**
   * Get current state
   */
  getState() {
    return this.state.getState();
  }

  /**
   * Add cleanup function
   */
  onCleanup(fn) {
    this.cleanupFunctions.push(fn);
  }

  /**
   * Destroy the component state
   */
  destroy() {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Error in cleanup function:', error);
      }
    });
    
    this.cleanupFunctions = [];
  }
}

// Export for use in components
window.VanillaState = VanillaState;
window.VanillaDOM = VanillaDOM;
window.VanillaTransitions = VanillaTransitions;
window.VanillaTemplates = VanillaTemplates;
window.ComponentState = ComponentState;

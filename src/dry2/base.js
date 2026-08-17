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
  }

  connectedCallback() {
    if (!this._isInitialized) {
      this._waitForAlpineAndInitialize();
      this._isInitialized = true;
    }
  }

  /**
   * Wait for Alpine.js to be ready, then initialize the component.
   *
   * The wait is bounded by ALPINE_WAIT_TIMEOUT. If Alpine never arrives
   * (blocked CDN, offline, CSP) the wait resolves anyway and the
   * component initializes without it - degraded, but rendered. The
   * previous unbounded poll gated _initializeComponent forever, so such
   * a page showed no components at all while every instance polled at
   * 100Hz indefinitely.
   */
  _waitForAlpineAndInitialize() {
    // Check if Alpine.js is loaded
    if (window.Alpine && window.Alpine.version) {
      // Alpine is loaded, initialize immediately
      this._initializeComponent();
      return;
    }

    // Alpine not loaded yet, wait for it. The promise is shared by every
    // component on the page, so they all wait on one poll rather than
    // starting one each.
    if (!window.alpineLoadPromise) {
      const timeout = BaseElement.ALPINE_WAIT_TIMEOUT;
      const deadline = Date.now() + timeout;

      window.alpineLoadPromise = new Promise(resolve => {
        const checkAlpine = () => {
          if (window.Alpine && window.Alpine.version) {
            resolve();
          } else if (Date.now() >= deadline) {
            console.warn(
              `DRY2: Alpine.js did not load within ${timeout}ms. Components will ` +
              'render without Alpine bindings; interactive behavior will be unavailable.'
            );
            // Resolve rather than reject: every waiting component should
            // still render its markup.
            resolve();
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
   * Wait for children to be added, then initialize.
   *
   * Three triggers race here: a MutationObserver (children appended by
   * script after upgrade), a short poll (children already parsed before
   * upgrade, so no mutation is ever observed), and a longer fallback
   * (component legitimately has no children). Whichever fires first
   * wins and cancels the other two.
   *
   * That mutual exclusion is the point. Previously each trigger called
   * _initializeComponent independently, and disconnecting the observer
   * did not cancel the pending timers - so a component whose children
   * arrived before the poll initialized twice, the second pass
   * capturing its own rendered output as _originalContent.
   */
  _waitForChildrenAndInitialize() {
    if (this._childWaitStarted) return;
    this._childWaitStarted = true;

    let settled = false;
    let observer = null;
    let pollTimer = null;
    let fallbackTimer = null;

    const settle = () => {
      if (settled) return;
      settled = true;

      if (observer) {
        observer.disconnect();
        observer = null;
      }
      clearTimeout(pollTimer);
      clearTimeout(fallbackTimer);

      // Captured before _initializeComponent replaces the markup.
      this._originalContent = this.innerHTML;
      this._waitForAlpineAndInitialize();
    };

    observer = new MutationObserver((mutations) => {
      const hasAddedNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
      if (hasAddedNodes && this.children.length > 0) {
        settle();
      }
    });
    observer.observe(this, { childList: true, subtree: true });

    pollTimer = setTimeout(() => {
      if (this.children.length > 0) {
        settle();
      } else {
        // Still empty: allow a grace period for slower producers, then
        // initialize empty rather than waiting forever.
        fallbackTimer = setTimeout(settle, BaseElement.CHILD_GRACE_PERIOD);
      }
    }, BaseElement.CHILD_POLL_DELAY);
  }

  /**
   * True when Alpine has already initialized the given element.
   *
   * Covers both runtimes: Alpine 3 marks initialized elements with
   * _x_dataStack, Alpine 2 with __x. Using only the v2 marker (as this
   * did previously) makes the check always report "not initialized" on
   * Alpine 3, so initTree re-runs against an already-live tree on every
   * render.
   */
  _isAlpineInitialized(element) {
    return Boolean(element && (element._x_dataStack || element.__x));
  }

  /**
   * Force Alpine to process this component
   */
  _ensureAlpineProcessing() {
    if (window.Alpine && window.Alpine.initTree) {
      // Give Alpine a moment to process, then force init if needed
      setTimeout(() => {
        const alpineRoot = this.querySelector('[x-data]');
        if (alpineRoot && !this._isAlpineInitialized(alpineRoot)) {
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
   * Get the Alpine data scope for this component's rendered root.
   *
   * Returns null (never throws, never undefined) when the scope cannot
   * be resolved - Alpine absent, component not rendered yet, or Alpine
   * has not initialized the element. Callers guard on the result.
   *
   * Do NOT override this in a subclass to reach for `__x`: that is the
   * Alpine *v2* API and this library's peer dependency is Alpine ^3,
   * where it is always undefined.
   */
  _getAlpineData() {
    const alpineElement = this.querySelector('[x-data]');
    if (!alpineElement || !window.Alpine) return null;

    // Alpine 3 internals. Checked before the public accessor because it
    // is exact - it reads the scope belonging to *this* element, whereas
    // $data() walks up to the nearest scope and could return an
    // ancestor's if this element is not initialized yet.
    const stackScope = alpineElement._x_dataStack?.[0];
    if (stackScope !== undefined && stackScope !== null) return stackScope;

    // Alpine 2 legacy. Harmless to keep - it is simply absent on v3 -
    // and lets the library degrade rather than break if a consumer is
    // still on the older runtime.
    const legacyScope = alpineElement.__x?.$data;
    if (legacyScope !== undefined && legacyScope !== null) return legacyScope;

    // Official Alpine 3 accessor, last because it throws for an element
    // that has no scope rather than returning undefined.
    if (typeof window.Alpine.$data === 'function') {
      try {
        const scope = window.Alpine.$data(alpineElement);
        if (scope !== undefined && scope !== null) return scope;
      } catch (error) {
        // Element not initialized by Alpine yet - not an error condition
        // for callers, who treat a null scope as "not ready".
      }
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
   * Coerce any value to a string for escaping. null/undefined become ''
   * so callers can pass raw getAttribute() results without null checks.
   */
  _toEscapableString(value) {
    if (value === null || value === undefined) return '';
    return typeof value === 'string' ? value : String(value);
  }

  /**
   * Escape a value for use as HTML TEXT content: <span>${v}</span>
   *
   * Carriage returns are emitted as &#13; rather than left raw: the HTML
   * parser normalizes raw CR and CRLF to LF while tokenizing, so a raw CR
   * would silently not survive the round-trip. Character references are
   * decoded after that normalization, so the entity form preserves it
   * exactly. (&amp; is substituted first, so the &#13; introduced here is
   * never double-escaped.)
   */
  _escapeHtml(value) {
    return this._toEscapableString(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\r/g, '&#13;');
  }

  /**
   * Escape a value for use as an HTML ATTRIBUTE value: <a href="${v}">
   *
   * Escapes both quote styles so the result is safe in single- and
   * double-quoted attributes alike.
   */
  _escapeAttr(value) {
    return this._escapeHtml(value);
  }

  /**
   * Escape a value for use inside a JAVASCRIPT STRING LITERAL:
   *   `'${v}'`  or  `"${v}"`
   *
   * Handles both quote styles plus backslashes, line terminators (a raw
   * newline inside a string literal is a syntax error), and '<' (encoded
   * as \x3C so the literal can never close an enclosing </script> block).
   * U+2028/U+2029 are escaped for older engines that treat them as line
   * terminators.
   *
   * NOTE: this escapes the JS layer ONLY. If the literal will sit inside
   * an HTML attribute - which is the usual case in this library - use
   * _escapeAlpineString instead, which layers both.
   */
  _escapeJs(value) {
    return this._toEscapableString(value)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/`/g, '\\`')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/</g, '\\x3C')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }

  /**
   * Sanitize a fragment of HTML that will be inserted as markup.
   *
   * Uses DOMPurify when the page provides it (it is an
   * optionalDependency of this package); otherwise falls back to
   * _sanitizeHtmlFallback below.
   *
   * Sanitizing must operate on parsed DOM, never on raw markup text.
   * Deleting substrings from markup can *create* dangerous output by
   * joining the remainder together - "javajavascript:script:" becomes
   * "javascript:" once the inner match is removed - as well as missing
   * anything the pattern didn't anticipate.
   */
  _sanitizeHtml(html, options = {}) {
    const input = this._toEscapableString(html);
    if (!input.trim()) return '';

    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(input, options.domPurifyConfig || {});
    }

    return this._sanitizeHtmlFallback(input);
  }

  /**
   * Conservative DOM-based sanitizer used when DOMPurify is absent.
   *
   * Parsing happens in an inert document via DOMParser: scripts do not
   * execute, resources are not fetched and handlers do not run, so it is
   * safe to inspect hostile markup here. Working on parsed attributes
   * also makes quoting irrelevant - an unquoted onerror= is just an
   * attribute like any other by this point.
   */
  _sanitizeHtmlFallback(html) {
    const doc = new window.DOMParser().parseFromString(html, 'text/html');

    Array.from(doc.body.querySelectorAll('*')).forEach(element => {
      const tagName = element.tagName.toLowerCase();

      if (BaseElement.FORBIDDEN_ELEMENTS.has(tagName)) {
        element.remove();
        return;
      }

      Array.from(element.attributes).forEach(attribute => {
        const name = attribute.name.toLowerCase();

        // Every event handler, however it was quoted in the source.
        if (name.startsWith('on')) {
          element.removeAttribute(attribute.name);
          return;
        }

        if (BaseElement.URL_ATTRIBUTES.has(name) && !this._isSafeUrl(attribute.value)) {
          element.removeAttribute(attribute.name);
        }
      });
    });

    return doc.body.innerHTML;
  }

  /**
   * Whether a URL is safe to keep in a link or resource attribute.
   *
   * Characters below U+0021 are stripped before testing the scheme
   * because browsers ignore them when resolving one: "jav&#9;ascript:"
   * decodes to a tab inside the scheme and still navigates.
   */
  _isSafeUrl(value) {
    const normalized = this._toEscapableString(value)
      // Matching control characters is precisely the point here:
      // browsers ignore them when resolving a scheme, so "jav\tascript:"
      // still navigates. Stripping them is what makes the scheme test
      // below meaningful.
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0020]+/g, '')
      .toLowerCase();

    if (/^(javascript|vbscript|livescript|mocha):/.test(normalized)) {
      return false;
    }

    if (normalized.startsWith('data:')) {
      // data: can carry executable content - image/svg+xml in
      // particular can contain script - so allow only raster images.
      return /^data:image\/(png|jpe?g|gif|webp|bmp|x-icon);/.test(normalized);
    }

    return true;
  }

  /**
   * Escape a value that will sit inside a JS string literal which is
   * itself inside an HTML attribute - i.e. the Alpine case:
   *
   *   x-data="{ name: '${this._escapeAlpineString(name)}' }"
   *
   * ORDER MATTERS. At runtime the HTML parser decodes entities in the
   * attribute value first, and only then does Alpine evaluate the result
   * as JavaScript. Escaping therefore runs in the reverse order: the JS
   * layer first, then the HTML layer on top of it.
   *
   * Applying only _escapeAttr here would look correct - the markup parses
   * fine - but the parser hands the decoded apostrophe straight to the
   * expression evaluator, leaving the JS layer fully injectable.
   */
  _escapeAlpineString(value) {
    return this._escapeAttr(this._escapeJs(value));
  }

  /**
   * Build an Alpine x-data object literal from a plain object.
   *
   * Strings are serialized with JSON.stringify, which produces a
   * correctly escaped double-quoted JS literal. Functions are emitted
   * as source (callers control those, they are never user input).
   *
   * The returned string still needs _escapeAttr applied by the caller
   * before it is interpolated into an x-data attribute.
   */
  _createAlpineDataString(dataObject) {
    const entries = Object.entries(dataObject).map(([key, value]) => {
      if (typeof value === 'function') {
        return `${key}: ${value.toString()}`;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        return `${key}: ${value}`;
      } else {
        // Covers strings, arrays, plain objects and null. JSON.stringify
        // escapes quotes, backslashes and control characters correctly.
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

  /**
   * Common cleanup method - override in child classes if needed
   */
  disconnectedCallback() {
    // Cleanup logic can be added here
  }
}

/**
 * Initialization timing knobs. Assigned after the class body (rather
 * than as static fields) to keep this file parseable as a plain classic
 * script by the widest range of tooling. Overridable by tests, and by
 * applications with unusually slow-loading Alpine bundles.
 */
/**
 * Elements removed outright by the fallback sanitizer: they execute
 * script, load external documents, or can restyle/redirect the page.
 */
BaseElement.FORBIDDEN_ELEMENTS = new Set([
  'script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed',
  'applet', 'base', 'link', 'meta', 'noscript', 'template'
]);

/**
 * Attributes whose value is a URL, and therefore a possible script
 * vector via the javascript: (and friends) schemes.
 */
BaseElement.URL_ATTRIBUTES = new Set([
  'href', 'src', 'srcset', 'action', 'formaction', 'poster',
  'background', 'data', 'ping', 'xlink:href'
]);

// How long to wait for Alpine before rendering without it.
BaseElement.ALPINE_WAIT_TIMEOUT = 10000;
// How long after connection to check for children parsed before upgrade.
BaseElement.CHILD_POLL_DELAY = 100;
// Extra grace period for children that have still not appeared by then.
BaseElement.CHILD_GRACE_PERIOD = 500;

// Make BaseElement globally available
window.BaseElement = BaseElement;

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
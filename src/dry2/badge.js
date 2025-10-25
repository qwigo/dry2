/**
 * DRY2 Badge Component
 * A customizable badge component for status indicators, counts, or labels
 * Built with vanilla JavaScript using BaseElement
 */

class DryBadge extends BaseElement {
  /**
   * Escape HTML to prevent XSS attacks
   */
  static _escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Observe these attributes for changes
   */
  static get observedAttributes() {
    return ['variant', 'size', 'position', 'dot', 'max', 'visible'];
  }

  constructor() {
    super();
    this._innerElement = null;
    this._originalContent = null;
    this._contentObserver = null;
    this._isCapturingContent = false;
  }

  /**
   * Override connectedCallback to capture content using MutationObserver
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Set display style once on first connection
      if (!this.style.display) {
        this.style.display = 'inline-block';
      }

      // Try to capture content immediately (for dynamically created elements)
      const immediateContent = this.textContent.trim();

      if (immediateContent || this.getBoolAttr('dot', false)) {
        // Content already exists or it's a dot badge, render immediately
        this._originalContent = immediateContent;
        super.connectedCallback();
      } else if (!this._isCapturingContent) {
        // Content not yet available, wait for parser to add it
        this._isCapturingContent = true;

        // Set up MutationObserver to watch for child nodes being added
        this._contentObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              // Child nodes were added by the parser
              const textContent = this.textContent.trim();
              if ((textContent || this.getBoolAttr('dot', false)) && this._originalContent === null) {
                this._originalContent = textContent;
                this._contentObserver.disconnect();
                this._contentObserver = null;

                // Now render the component
                super.connectedCallback();
                break;
              }
            }
          }
        });

        // Start observing - only watch childList changes, not attributes
        this._contentObserver.observe(this, {
          childList: true,
          subtree: true
        });

        // Fallback: If no content is added within 100ms, render with default
        setTimeout(() => {
          if (this._contentObserver && !this.hasAttribute('data-rendered')) {
            this._contentObserver.disconnect();
            this._contentObserver = null;

            if (this._originalContent === null) {
              this._originalContent = this.textContent.trim() || '';
            }

            super.connectedCallback();
          }
        }, 100);
      }
    } else {
      // Already rendered, just reattach listeners
      super.connectedCallback();
    }
  }

  /**
   * Override disconnectedCallback to clean up observer
   */
  disconnectedCallback() {
    // Disconnect the MutationObserver if it exists
    if (this._contentObserver) {
      this._contentObserver.disconnect();
      this._contentObserver = null;
    }

    // Call parent's disconnectedCallback
    super.disconnectedCallback();
  }

  /**
   * Main render method
   */
  render() {
    const variant = this.getAttr('variant', 'primary');
    const size = this.getAttr('size', 'md');
    const position = this.getAttr('position', 'standalone');
    const isDot = this.getBoolAttr('dot', false);
    const max = this.getNumberAttr('max', null);
    const visible = this.getBoolAttr('visible', true);

    // Ensure we have content if not a dot badge
    if (this._originalContent === null && !isDot) {
      this._originalContent = '';
    }

    // If not visible, hide and return
    if (!visible) {
      this.style.display = 'none';
      return;
    } else {
      this.style.display = 'inline-block';
    }

    // Get base classes
    const baseClasses = this._getBaseClasses();
    const variantClasses = this._getVariantClasses(variant);
    const sizeClasses = this._getSizeClasses(size, isDot);
    const positionClasses = this._getPositionClasses(position);

    const allClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${positionClasses}`.trim();

    // Build content - handle numeric max values
    let displayContent = '';
    if (!isDot) {
      if (max && !isNaN(this._originalContent) && parseInt(this._originalContent) > max) {
        displayContent = `${max}+`;
      } else {
        displayContent = DryBadge._escapeHtml(this._originalContent);
      }
    }

    // Render the badge inside the custom element
    // Use replaceChildren() for efficient DOM clearing (or textContent for older browsers)
    if (typeof this.replaceChildren === 'function') {
      this.replaceChildren();
    } else {
      this.textContent = '';
    }

    // Create wrapper and badge span
    const wrapper = document.createElement('div');
    wrapper.className = 'badge-container inline-block';

    const badge = document.createElement('span');
    badge.className = allClasses;
    badge.textContent = displayContent;

    wrapper.appendChild(badge);
    this.appendChild(wrapper);

    // Store reference to inner element
    this._innerElement = badge;
  }

  /**
   * Get base badge classes
   */
  _getBaseClasses() {
    return 'badge inline-flex items-center justify-center font-medium leading-none transition-all duration-200 rounded-full';
  }

  /**
   * Get variant-specific classes
   */
  _getVariantClasses(variant) {
    const variants = {
      primary: 'bg-gray-800 text-white',
      success: 'bg-green-500 text-white',
      danger: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-yellow-900',
      info: 'bg-blue-500 text-white'
    };
    return variants[variant] || variants.primary;
  }

  /**
   * Get size-specific classes
   */
  _getSizeClasses(size, isDot) {
    if (isDot) {
      const dotSizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
      };
      return dotSizes[size] || dotSizes.md;
    }

    const sizes = {
      sm: 'px-1.5 py-0.5 text-xs min-h-[1.125rem]',
      md: 'px-2 py-0.5 text-xs min-h-[1.25rem]',
      lg: 'px-3 py-1 text-sm min-h-[1.75rem]'
    };
    return sizes[size] || sizes.md;
  }

  /**
   * Get position-specific classes
   */
  _getPositionClasses(position) {
    if (position === 'standalone') return '';

    const positions = {
      'top-right': 'absolute z-10 -top-2 -right-2',
      'top-left': 'absolute z-10 -top-2 -left-2',
      'bottom-right': 'absolute z-10 bottom-4 -right-2',
      'bottom-left': 'absolute z-10 bottom-4 -left-2'
    };
    return positions[position] || '';
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    // Re-render on any attribute change
    this.reRender();
  }

  /**
   * Public API: Show badge
   */
  show() {
    this.setAttribute('visible', 'true');
  }

  /**
   * Public API: Hide badge
   */
  hide() {
    this.setAttribute('visible', 'false');
  }

  /**
   * Public API: Toggle visibility
   */
  toggle() {
    const isVisible = this.getBoolAttr('visible', true);
    if (isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Public API: Set badge content
   */
  setContent(content) {
    this._originalContent = content ? content.toString() : '';
    if (this.hasAttribute('data-rendered')) {
      this.reRender();
    }
  }

  /**
   * Get/Set variant property
   */
  get variant() {
    return this.getAttr('variant', 'primary');
  }

  set variant(value) {
    this.setAttribute('variant', value);
  }

  /**
   * Get/Set size property
   */
  get size() {
    return this.getAttr('size', 'md');
  }

  set size(value) {
    this.setAttribute('size', value);
  }

  /**
   * Get/Set position property
   */
  get position() {
    return this.getAttr('position', 'standalone');
  }

  set position(value) {
    this.setAttribute('position', value);
  }

  /**
   * Get/Set dot property
   */
  get dot() {
    return this.getBoolAttr('dot', false);
  }

  set dot(value) {
    if (value) {
      this.setAttribute('dot', '');
    } else {
      this.removeAttribute('dot');
    }
  }

  /**
   * Get/Set max property
   */
  get max() {
    const value = this.getNumberAttr('max', null);
    return value;
  }

  set max(value) {
    if (value !== null && value !== undefined && !isNaN(value)) {
      this.setAttribute('max', value.toString());
    } else {
      this.removeAttribute('max');
    }
  }

  /**
   * Get/Set visible property
   */
  get visible() {
    return this.getBoolAttr('visible', true);
  }

  set visible(value) {
    if (value) {
      this.setAttribute('visible', 'true');
    } else {
      this.setAttribute('visible', 'false');
    }
  }
}

// Register the custom element
customElements.define('dry-badge', DryBadge);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryBadge;
}

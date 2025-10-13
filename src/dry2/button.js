/**
 * DRY2 Button Component
 * A customizable button component with variants, sizes, icons, and loading states
 * Built with vanilla JavaScript using BaseElement
 */

class DryButton extends BaseElement {
  /**
   * Observe these attributes for changes
   */
  static get observedAttributes() {
    return ['variant', 'size', 'icon', 'disabled', 'loading', 'href', 'target', 'type'];
  }

  constructor() {
    super();
    this._innerElement = null;
    this._originalContent = null;
  }

  /**
   * Override connectedCallback to defer rendering until parser finishes
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Use double requestAnimationFrame to ensure parser has completely finished
      // The first RAF runs too early for the first element, so we need a second one
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this._originalContent === null) {
            this._originalContent = this.textContent.trim() || 'Button';
          }

          // Now call parent's connectedCallback which will trigger rendering
          super.connectedCallback();
        });
      });
    } else {
      // Already rendered, just reattach listeners
      super.connectedCallback();
    }
  }

  /**
   * Main render method
   */
  render() {
    const variant = this.getAttr('variant', 'primary');
    const size = this.getAttr('size', 'md');
    const icon = this.getAttr('icon', '');
    const disabled = this.getBoolAttr('disabled', false);
    const loading = this.getBoolAttr('loading', false);
    const href = this.getAttr('href', '');
    const target = this.getAttr('target', '');
    const type = this.getAttr('type', 'button');

    // Ensure we have content
    if (this._originalContent === null) {
      this._originalContent = 'Button';
    }

    // Get base classes
    const baseClasses = this._getBaseClasses();
    const variantClasses = this._getVariantClasses(variant);
    const sizeClasses = this._getSizeClasses(size);
    const stateClasses = this._getStateClasses(disabled, loading);

    const allClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${stateClasses}`.trim();

    // Determine if we should render as link or button
    const isLink = href && !disabled && !loading;
    const tag = isLink ? 'a' : 'button';

    // Build attributes
    const attributes = [];
    if (!isLink) {
      attributes.push(`type="${type}"`);
    }
    if (disabled || loading) {
      attributes.push('disabled');
    }
    if (isLink) {
      attributes.push(`href="${href}"`);
      if (target) {
        attributes.push(`target="${target}"`);
      }
    }
    attributes.push(`class="w-full h-full block ${allClasses}"`);

    // Build content
    let content = '';

    // Add loading spinner
    if (loading) {
      content += this._getSpinnerHTML();
    }

    // Add icon
    if (icon && !loading) {
      content += `<i class="${icon} mr-2"></i>`;
    }

    // Add text content
    content += `<span class="button-text">${this._originalContent}</span>`;

    // Render the button/link inside the custom element
    // CRITICAL: Physically remove ALL child nodes to prevent text duplication
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }

    // Now set the new content
    this.innerHTML = `<${tag} ${attributes.join(' ')}>${content}</${tag}>`;

    // Store reference to inner element
    this._innerElement = this.querySelector(tag);

    // Make the custom element inline
    this.style.display = 'inline-block';
  }

  /**
   * Get base button classes
   */
  _getBaseClasses() {
    return 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  }

  /**
   * Get variant-specific classes
   */
  _getVariantClasses(variant) {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      text: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
    };
    return variants[variant] || variants.primary;
  }

  /**
   * Get size-specific classes
   */
  _getSizeClasses(size) {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    };
    return sizes[size] || sizes.md;
  }

  /**
   * Get state-specific classes
   */
  _getStateClasses(disabled, loading) {
    let classes = [];
    if (disabled || loading) {
      classes.push('opacity-60 cursor-not-allowed');
    } else {
      classes.push('cursor-pointer');
    }
    return classes.join(' ');
  }

  /**
   * Get loading spinner HTML
   */
  _getSpinnerHTML() {
    return `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `;
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    // Re-render on any attribute change
    this.reRender();
  }

  /**
   * Public API: Set loading state
   */
  setLoading(loading) {
    if (loading) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }

  /**
   * Public API: Set disabled state
   */
  setDisabled(disabled) {
    if (disabled) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  /**
   * Public API: Set button text
   */
  setText(text) {
    this._originalContent = text;
    const textElement = this.querySelector('.button-text');
    if (textElement) {
      textElement.textContent = text;
    }
  }

  /**
   * Public API: Set icon
   */
  setIcon(iconClasses) {
    this.setAttribute('icon', iconClasses);
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
   * Get/Set icon property
   */
  get icon() {
    return this.getAttr('icon', '');
  }

  set icon(value) {
    this.setAttribute('icon', value);
  }

  /**
   * Get/Set disabled property
   */
  get disabled() {
    return this.getBoolAttr('disabled', false);
  }

  set disabled(value) {
    this.setDisabled(value);
  }

  /**
   * Get/Set loading property
   */
  get loading() {
    return this.getBoolAttr('loading', false);
  }

  set loading(value) {
    this.setLoading(value);
  }

  /**
   * Get/Set href property
   */
  get href() {
    return this.getAttr('href', '');
  }

  set href(value) {
    if (value) {
      this.setAttribute('href', value);
    } else {
      this.removeAttribute('href');
    }
  }

  /**
   * Get/Set target property
   */
  get target() {
    return this.getAttr('target', '');
  }

  set target(value) {
    if (value) {
      this.setAttribute('target', value);
    } else {
      this.removeAttribute('target');
    }
  }

  /**
   * Get/Set type property
   */
  get type() {
    return this.getAttr('type', 'button');
  }

  set type(value) {
    this.setAttribute('type', value);
  }

  /**
   * Programmatically trigger click
   */
  click() {
    if (this._innerElement && !this.disabled && !this.loading) {
      this._innerElement.click();
    }
  }
}

// Register the custom element
customElements.define('dry-button', DryButton);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryButton;
}
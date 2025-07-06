class DryButton extends BaseElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading', 'type', 'href', 'target', 'icon'];
  }

  _initializeComponent() {
    // Store original content and setup component data
    const originalContent = this._extractContent();

    this._componentData = {
      content: originalContent,
      variant: this.variant,
      size: this.size,
      disabled: this.disabled,
      loading: this.loading,
      icon: this.icon
    };

    // Create the component structure with Alpine.js
    this._render();
    
    // Ensure Alpine processes this component
    this._ensureAlpineProcessing();
  }

  _extractContent() {
    // Extract the text content - escaping will be handled during render
    const content = this.textContent.trim();
    return content;
  }

  _render() {
    const isLink = !!this.href;
    const tagName = isLink ? 'a' : 'button';
    const validatedHref = this._validateUrl(this.href);
    const sanitizedTarget = this._sanitizeAttribute(this.target, 'target');
    const linkProps = isLink ? `href="${validatedHref}" ${sanitizedTarget ? `target="${sanitizedTarget}"` : ''}` : '';
    const buttonProps = !isLink ? `type="${this._escapeHtml(this.type)}"` : '';

    // Get current values
    const content = this._componentData.content;
    const variant = this.variant;
    const size = this.size;
    const disabled = this.disabled;
    const loading = this.loading;
    const icon = this.icon;

    // Create button classes directly
    const buttonClasses = this._getButtonClasses(variant, size, disabled, loading);

    this.innerHTML = `
      <div class="inline-block">
        <${tagName} 
          class="${buttonClasses}"
          ${linkProps}
          ${buttonProps}
          ${disabled || loading ? 'disabled' : ''}
          ${loading ? 'aria-busy="true"' : ''}
          ${disabled || loading ? 'aria-disabled="true"' : ''}>
          
          <!-- Loading Spinner -->
          ${loading ? '<i class="fas fa-spinner fa-spin mr-2"></i>' : ''}
          
          <!-- Icon -->
          ${icon && !loading ? `<i class="${icon}${content ? ' mr-2' : ''}"></i>` : ''}
          
          <!-- Text Content -->
          ${content ? `<span>${this._escapeHtml(content)}</span>` : ''}
          
        </${tagName}>
      </div>
    `;
  }

  _getButtonClasses(variant, size, disabled, loading) {
    let classes = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border ';
    
    // Size classes
    if (size === 'sm') {
      classes += 'px-3 py-1.5 text-xs rounded ';
    } else if (size === 'lg') {
      classes += 'px-6 py-3 text-base rounded-lg ';
    } else if (size === 'xl') {
      classes += 'px-8 py-4 text-lg rounded-lg ';
    } else {
      // md or default
      classes += 'px-4 py-2 text-sm rounded-md ';
    }
    
    // Variant classes
    if (variant === 'secondary') {
      classes += 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500 ';
    } else if (variant === 'outline') {
      classes += 'bg-transparent text-blue-600 dark:text-blue-500 border-blue-600 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 focus:ring-blue-500 ';
    } else if (variant === 'text') {
      classes += 'bg-transparent text-blue-600 dark:text-blue-500 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900 focus:ring-blue-500 ';
    } else if (variant === 'danger') {
      classes += 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500 ';
    } else if (variant === 'success') {
      classes += 'bg-green-600 text-white border-green-600 hover:bg-green-700 focus:ring-green-500 ';
    } else if (variant === 'warning') {
      classes += 'bg-yellow-500 dark:bg-yellow-600 text-yellow-900 dark:text-white border-yellow-500 dark:border-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700 focus:ring-yellow-500 ';
    } else {
      // primary or default
      classes += 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 focus:ring-blue-500 ';
    }
    
    // State classes
    if (disabled || loading) {
      classes += 'opacity-50 cursor-not-allowed ';
    }
    
    return classes.trim();
  }

  // Input validation methods
  _validateSize(size) {
    const allowedSizes = ['sm', 'md', 'lg', 'xl'];
    return allowedSizes.includes(size) ? size : 'md';
  }

  _validateVariant(variant) {
    const allowedVariants = ['primary', 'secondary', 'outline', 'text', 'danger', 'success', 'warning'];
    return allowedVariants.includes(variant) ? variant : 'primary';
  }

  _validateType(type) {
    const allowedTypes = ['button', 'submit', 'reset'];
    return allowedTypes.includes(type) ? type : 'button';
  }

  _validateIcon(icon) {
    if (!icon || typeof icon !== 'string') return '';
    
    // Allow only safe CSS class patterns (letters, numbers, hyphens, spaces)
    // This prevents injection of malicious CSS or JavaScript
    const safeIconPattern = /^[a-zA-Z0-9\s\-_]+$/;
    
    if (safeIconPattern.test(icon)) {
      return icon.trim();
    } else {
      console.warn(`Invalid icon class rejected: ${icon}`);
      return '';
    }
  }

  // Public API methods
  setLoading(loading) {
    this.loading = loading;
  }

  setDisabled(disabled) {
    this.disabled = disabled;
  }

  setText(text) {
    // Validate and sanitize the text input
    const sanitizedText = String(text || '');
    
    if (this._componentData) {
      // Store the sanitized text in component data (will be escaped when rendering)
      this._componentData.content = sanitizedText;
    }
    
    // Set textContent directly - browser handles this safely without escaping
    this.textContent = sanitizedText;
    
    // Trigger a refresh to update the Alpine.js data
    this._refresh();
  }

  click() {
    if (!this.disabled && !this.loading) {
      const button = this.querySelector('button, a');
      if (button) {
        button.click();
      }
    }
  }

  // Getters and setters using base class utilities
  get variant() {
    const value = this._getAttributeWithDefault('variant', 'primary');
    return this._validateVariant(value);
  }

  set variant(value) {
    const validatedValue = this._validateVariant(value);
    this._setAttribute('variant', validatedValue);
  }

  get size() {
    const value = this._getAttributeWithDefault('size', 'md');
    return this._validateSize(value);
  }

  set size(value) {
    const validatedValue = this._validateSize(value);
    this._setAttribute('size', validatedValue);
  }

  get disabled() {
    return this._getBooleanAttribute('disabled');
  }

  set disabled(value) {
    this._setBooleanAttribute('disabled', value);
  }

  get loading() {
    return this._getBooleanAttribute('loading');
  }

  set loading(value) {
    this._setBooleanAttribute('loading', value);
  }

  get type() {
    const value = this._getAttributeWithDefault('type', 'button');
    return this._validateType(value);
  }

  set type(value) {
    const validatedValue = this._validateType(value);
    this._setAttribute('type', validatedValue);
  }

  get href() {
    return this.getAttribute('href') || '';
  }

  set href(value) {
    this._setAttribute('href', value);
  }

  get target() {
    return this.getAttribute('target') || '';
  }

  set target(value) {
    this._setAttribute('target', value);
  }

  get icon() {
    const value = this.getAttribute('icon') || '';
    return this._validateIcon(value);
  }

  set icon(value) {
    const validatedValue = this._validateIcon(value);
    this._setAttribute('icon', validatedValue);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isInitialized) {
      // Update component data if it exists
      if (this._componentData && this._componentData.hasOwnProperty(name)) {
        this._componentData[name] = newValue;
      }
      
      // Single refresh call to update the component
      this._refresh();
    }
  }
}

customElements.define('dry-button', DryButton);

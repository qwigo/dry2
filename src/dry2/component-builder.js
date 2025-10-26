/**
 * DRY2 Component Builder Component
 * A reusable web component for creating interactive component builders
 * Built with vanilla JavaScript using BaseElement (no Alpine.js)
 */

class DryComponentBuilder extends BaseElement {
  /**
   * Escape HTML to prevent XSS attacks
   */
  static _escapeHtml(unsafe) {
    if (!unsafe) return '';
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Sanitize attribute values
   */
  static _sanitizeAttribute(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/[<>"'&]/g, (char) => {
      const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
      return map[char];
    });
  }

  /**
   * Observe these attributes for changes
   */
  static get observedAttributes() {
    return ['component-tag', 'title', 'description'];
  }

  constructor() {
    super();
    this._config = null;
    this._currentValues = {};
    this._configObserver = null;
    this._previewElement = null;
    this._codeElement = null;
    this._copyButton = null;
  }

  /**
   * Override connectedCallback to capture configuration
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Set display style once on first connection
      if (!this.style.display) {
        this.style.display = 'block';
      }

      // Try to get config from script tag
      const configScript = this.querySelector('script[type="application/json"]');
      
      if (configScript) {
        try {
          this._config = JSON.parse(configScript.textContent);
          this._initializeValues();
          super.connectedCallback();
        } catch (error) {
          console.error('DryComponentBuilder: Failed to parse configuration', error);
          this._config = this._getDefaultConfig();
          this._initializeValues();
          super.connectedCallback();
        }
      } else {
        // Wait for configuration to be added
        this._configObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              const script = this.querySelector('script[type="application/json"]');
              if (script) {
                try {
                  this._config = JSON.parse(script.textContent);
                  this._initializeValues();
                  this._configObserver.disconnect();
                  this._configObserver = null;
                  super.connectedCallback();
                  break;
                } catch (error) {
                  console.error('DryComponentBuilder: Failed to parse configuration', error);
                }
              }
            }
          }
        });

        this._configObserver.observe(this, {
          childList: true,
          subtree: true
        });

        // Fallback: render with default config after 100ms
        setTimeout(() => {
          if (this._configObserver && !this.hasAttribute('data-rendered')) {
            this._configObserver.disconnect();
            this._configObserver = null;
            this._config = this._getDefaultConfig();
            this._initializeValues();
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
    if (this._configObserver) {
      this._configObserver.disconnect();
      this._configObserver = null;
    }
    super.disconnectedCallback();
  }

  /**
   * Get default configuration
   */
  _getDefaultConfig() {
    return {
      componentTag: this.getAttr('component-tag', 'dry-button'),
      title: this.getAttr('title', 'Component Builder'),
      description: this.getAttr('description', 'Try changing the component properties dynamically.'),
      properties: {},
      defaults: {}
    };
  }

  /**
   * Initialize current values from defaults
   */
  _initializeValues() {
    if (this._config && this._config.defaults) {
      this._currentValues = { ...this._config.defaults };
    }
  }

  /**
   * Main render method
   */
  render() {
    // Ensure we have a valid config
    if (!this._config) {
      this._config = this._getDefaultConfig();
      this._initializeValues();
    }

    // Clear the component
    this.innerHTML = '';

    // Create section
    const section = document.createElement('section');
    section.className = 'demo-section';

    // Create header
    const header = this._createHeader();
    section.appendChild(header);

    // Create main demo container
    const demoContainer = this._createDemoContainer();
    section.appendChild(demoContainer);

    // Create code block
    const codeBlock = this._createCodeBlock();
    section.appendChild(codeBlock);

    // Append to component
    this.appendChild(section);

    // Cache elements
    this._cacheElements();

    // Update code display
    this._updateCode();
  }

  /**
   * Create header section
   */
  _createHeader() {
    const headerContainer = document.createElement('div');

    const title = document.createElement('h2');
    title.className = 'demo-title';
    title.textContent = this._config.title;
    headerContainer.appendChild(title);

    const description = document.createElement('p');
    description.className = 'demo-description';
    description.textContent = this._config.description;
    headerContainer.appendChild(description);

    return headerContainer;
  }

  /**
   * Create demo container with controls and preview
   */
  _createDemoContainer() {
    const demoContainer = document.createElement('div');
    demoContainer.className = 'demo-container';

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';

    // Controls section
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'space-y-4';
    controlsDiv.appendChild(this._createControls());
    grid.appendChild(controlsDiv);

    // Preview section
    const previewDiv = document.createElement('div');
    previewDiv.className = 'flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg p-4';

    const previewInner = document.createElement('div');
    previewInner.className = 'w-full';
    previewInner.setAttribute('data-preview', '');
    previewInner.innerHTML = this._generatePreview();

    previewDiv.appendChild(previewInner);
    grid.appendChild(previewDiv);

    demoContainer.appendChild(grid);
    return demoContainer;
  }

  /**
   * Create controls section
   */
  _createControls() {
    const fragment = document.createDocumentFragment();

    if (this._config.properties) {
      Object.entries(this._config.properties).forEach(([key, propConfig]) => {
        const controlElement = this._createControl(key, propConfig);
        if (controlElement) {
          fragment.appendChild(controlElement);
        }
      });
    }

    return fragment;
  }

  /**
   * Create individual control
   */
  _createControl(key, propConfig) {
    const value = this._currentValues[key];
    const container = document.createElement('div');

    try {
      if (propConfig.type === 'select') {
        container.appendChild(this._createSelectControl(key, propConfig, value));
      } else if (propConfig.type === 'checkbox') {
        container.appendChild(this._createCheckboxControl(key, propConfig, value));
      } else if (propConfig.type === 'range') {
        container.appendChild(this._createRangeControl(key, propConfig, value));
      } else if (propConfig.type === 'text') {
        container.appendChild(this._createTextControl(key, propConfig, value));
      } else if (propConfig.type === 'color') {
        container.appendChild(this._createColorControl(key, propConfig, value));
      } else {
        console.warn(`DryComponentBuilder: Unknown control type: ${propConfig.type}`);
        return null;
      }
    } catch (error) {
      console.error(`DryComponentBuilder: Failed to create control for ${key}`, error);
      return null;
    }

    return container;
  }

  /**
   * Create select control
   */
  _createSelectControl(key, propConfig, value) {
    const container = document.createElement('div');

    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-gray-700 mb-2';
    label.textContent = propConfig.label || key;
    label.setAttribute('for', `cb-${key}`);
    container.appendChild(label);

    const select = document.createElement('select');
    select.id = `cb-${key}`;
    select.className = 'w-full p-2 border border-gray-300 rounded';
    select.setAttribute('data-property', key);

    if (Array.isArray(propConfig.options)) {
      propConfig.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = DryComponentBuilder._sanitizeAttribute(option.value);
        optionElement.textContent = option.label || option.value;
        if (option.value === value) {
          optionElement.selected = true;
        }
        select.appendChild(optionElement);
      });
    }

    container.appendChild(select);
    return container;
  }

  /**
   * Create checkbox control
   */
  _createCheckboxControl(key, propConfig, value) {
    const container = document.createElement('div');
    container.className = 'space-y-2';

    const label = document.createElement('label');
    label.className = 'flex items-center';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `cb-${key}`;
    checkbox.className = 'mr-2';
    checkbox.setAttribute('data-property', key);
    checkbox.checked = Boolean(value);

    label.appendChild(checkbox);

    const labelText = document.createTextNode(propConfig.label || key);
    label.appendChild(labelText);

    container.appendChild(label);
    return container;
  }

  /**
   * Create range control
   */
  _createRangeControl(key, propConfig, value) {
    const container = document.createElement('div');

    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-gray-700 mb-2';
    label.textContent = propConfig.label || key;
    label.setAttribute('for', `cb-${key}`);
    container.appendChild(label);

    const input = document.createElement('input');
    input.type = 'range';
    input.id = `cb-${key}`;
    input.className = 'w-full';
    input.min = propConfig.min || 0;
    input.max = propConfig.max || 100;
    input.value = value;
    input.setAttribute('data-property', key);
    container.appendChild(input);

    const display = document.createElement('div');
    display.className = 'text-sm text-gray-500 mt-1';
    display.setAttribute('data-range-display', key);
    display.textContent = propConfig.displayFormat ? propConfig.displayFormat(value) : value;
    container.appendChild(display);

    return container;
  }

  /**
   * Create text control
   */
  _createTextControl(key, propConfig, value) {
    const container = document.createElement('div');

    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-gray-700 mb-2';
    label.textContent = propConfig.label || key;
    label.setAttribute('for', `cb-${key}`);
    container.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `cb-${key}`;
    input.className = 'w-full p-2 border border-gray-300 rounded';
    input.value = DryComponentBuilder._sanitizeAttribute(value);
    input.setAttribute('data-property', key);
    container.appendChild(input);

    return container;
  }

  /**
   * Create color control
   */
  _createColorControl(key, propConfig, value) {
    const container = document.createElement('div');

    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-gray-700 mb-2';
    label.textContent = propConfig.label || key;
    label.setAttribute('for', `cb-${key}`);
    container.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'flex items-center space-x-2';

    const input = document.createElement('input');
    input.type = 'color';
    input.id = `cb-${key}`;
    input.className = 'h-10 w-20 border border-gray-300 rounded cursor-pointer';
    input.value = value || '#000000';
    input.setAttribute('data-property', key);
    inputWrapper.appendChild(input);

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'flex-1 p-2 border border-gray-300 rounded font-mono text-sm';
    textInput.value = value || '#000000';
    textInput.setAttribute('data-property-text', key);
    inputWrapper.appendChild(textInput);

    container.appendChild(inputWrapper);
    return container;
  }

  /**
   * Create code block section
   */
  _createCodeBlock() {
    const codeBlock = document.createElement('div');
    codeBlock.className = 'code-block';

    const header = document.createElement('div');
    header.className = 'code-header';

    const language = document.createElement('span');
    language.className = 'code-language';
    language.textContent = 'HTML';
    header.appendChild(language);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.setAttribute('data-copy-btn', '');
    copyButton.setAttribute('aria-label', 'Copy code to clipboard');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('w-3', 'h-3');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3');

    svg.appendChild(path);
    copyButton.appendChild(svg);

    const copyText = document.createTextNode(' Copy');
    copyButton.appendChild(copyText);

    header.appendChild(copyButton);
    codeBlock.appendChild(header);

    const content = document.createElement('div');
    content.className = 'code-content';

    const pre = document.createElement('pre');
    pre.setAttribute('data-code', '');
    content.appendChild(pre);

    codeBlock.appendChild(content);
    return codeBlock;
  }

  /**
   * Cache DOM elements for performance
   */
  _cacheElements() {
    this._previewElement = this.querySelector('[data-preview]');
    this._codeElement = this.querySelector('[data-code]');
    this._copyButton = this.querySelector('[data-copy-btn]');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Handle control changes
    const changeHandler = (e) => {
      const property = e.target.dataset.property;
      if (property) {
        this._updateProperty(property, this._getControlValue(e.target));
        
        // If this is a color picker, update the text input
        if (e.target.type === 'color') {
          const textInput = this.querySelector(`[data-property-text="${property}"]`);
          if (textInput) {
            textInput.value = e.target.value;
          }
        }
      }
    };

    const inputHandler = (e) => {
      const property = e.target.dataset.property;
      if (property && e.target.type === 'range') {
        this._updateProperty(property, this._getControlValue(e.target));
        // Update range display
        const display = this.querySelector(`[data-range-display="${property}"]`);
        if (display) {
          const propConfig = this._config.properties[property];
          display.textContent = propConfig.displayFormat ? propConfig.displayFormat(e.target.value) : e.target.value;
        }
      } else if (property && e.target.type === 'color') {
        this._updateProperty(property, this._getControlValue(e.target));
        // Update text input
        const textInput = this.querySelector(`[data-property-text="${property}"]`);
        if (textInput) {
          textInput.value = e.target.value;
        }
      }
      
      // Handle text input changes for color controls
      const textProperty = e.target.dataset.propertyText;
      if (textProperty) {
        const value = e.target.value;
        // Validate hex color format
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
          this._updateProperty(textProperty, value);
          // Update color picker
          const colorInput = this.querySelector(`[data-property="${textProperty}"]`);
          if (colorInput) {
            colorInput.value = value;
          }
        }
      }
    };

    this.addTrackedListener(this, 'change', changeHandler);
    this.addTrackedListener(this, 'input', inputHandler);

    // Handle copy button
    if (this._copyButton) {
      this.addTrackedListener(this._copyButton, 'click', () => this._copyCode());
    }
  }

  /**
   * Get control value based on type
   */
  _getControlValue(element) {
    if (element.type === 'checkbox') {
      return element.checked;
    } else if (element.type === 'range') {
      return parseInt(element.value);
    } else {
      return element.value;
    }
  }

  /**
   * Update property and refresh preview/code
   */
  _updateProperty(property, value) {
    this._currentValues[property] = value;
    this._updatePreview();
    this._updateCode();
  }

  /**
   * Update preview section
   */
  _updatePreview() {
    if (!this._previewElement) return;

    try {
      this._previewElement.innerHTML = this._generatePreview();
    } catch (error) {
      console.error('DryComponentBuilder: Failed to update preview', error);
    }
  }

  /**
   * Update code section
   */
  _updateCode() {
    if (!this._codeElement) return;

    try {
      // Use textContent to automatically escape HTML
      this._codeElement.textContent = this._generateCode();
    } catch (error) {
      console.error('DryComponentBuilder: Failed to update code', error);
    }
  }

  /**
   * Generate preview HTML
   */
  _generatePreview() {
    const component = this._generateComponent();
    
    // Apply preview wrapper if provided
    if (this._config.previewWrapper && typeof this._config.previewWrapper === 'function') {
      return this._config.previewWrapper(component);
    }
    
    return component;
  }

  /**
   * Generate component HTML
   */
  _generateComponent() {
    const attributes = Object.entries(this._currentValues)
      .filter(([key, value]) => {
        const defaultValue = this._config.defaults[key];
        return value !== defaultValue && value !== false && value !== '';
      })
      .map(([key, value]) => {
        // Handle boolean attributes
        if (typeof value === 'boolean' && value === true) {
          return DryComponentBuilder._escapeHtml(key);
        }
        return `${DryComponentBuilder._escapeHtml(key)}="${DryComponentBuilder._sanitizeAttribute(value)}"`;
      })
      .join(' ');

    let content = '';
    if (this._config.contentGenerator && typeof this._config.contentGenerator === 'function') {
      content = this._config.contentGenerator(this._currentValues);
    } else {
      content = 'Component content';
    }

    return `<${this._config.componentTag}${attributes ? ' ' + attributes : ''}>${content}</${this._config.componentTag}>`;
  }

  /**
   * Generate code display
   */
  _generateCode() {
    if (this._config.codeGenerator && typeof this._config.codeGenerator === 'function') {
      return this._config.codeGenerator(this._currentValues, this._config);
    }

    // Default code generator
    const attributes = Object.entries(this._currentValues)
      .filter(([key, value]) => {
        const defaultValue = this._config.defaults[key];
        return value !== defaultValue && value !== false && value !== '';
      })
      .map(([key, value]) => {
        // Handle boolean attributes
        if (typeof value === 'boolean' && value === true) {
          return key;
        }
        return `${key}="${value}"`;
      })
      .join(' ');

    return `<${this._config.componentTag}${attributes ? ' ' + attributes : ''}>
  Component content goes here...
</${this._config.componentTag}>`;
  }

  /**
   * Copy code to clipboard
   */
  async _copyCode() {
    try {
      const code = this._generateCode();
      await navigator.clipboard.writeText(code);

      // Show success feedback
      if (this._copyButton) {
        const originalText = this._copyButton.lastChild.textContent;
        this._copyButton.lastChild.textContent = ' Copied!';
        this._copyButton.disabled = true;

        setTimeout(() => {
          if (this._copyButton) {
            this._copyButton.lastChild.textContent = originalText;
            this._copyButton.disabled = false;
          }
        }, 2000);
      }
    } catch (error) {
      console.error('DryComponentBuilder: Failed to copy code to clipboard', error);
    }
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    if (name === 'component-tag' || name === 'title' || name === 'description') {
      // Update config and re-render
      if (!this._config) {
        this._config = this._getDefaultConfig();
      }
      
      if (name === 'component-tag') {
        this._config.componentTag = newValue;
      } else if (name === 'title') {
        this._config.title = newValue;
      } else if (name === 'description') {
        this._config.description = newValue;
      }
      
      this.reRender();
    }
  }

  /**
   * Public API: Update a property value
   */
  updateProperty(property, value) {
    if (this._config.properties && this._config.properties[property]) {
      this._updateProperty(property, value);
    } else {
      console.warn(`DryComponentBuilder: Property '${property}' is not defined`);
    }
  }

  /**
   * Public API: Get a property value
   */
  getProperty(property) {
    return this._currentValues[property];
  }

  /**
   * Public API: Get all property values
   */
  getAllProperties() {
    return { ...this._currentValues };
  }

  /**
   * Public API: Set configuration
   */
  setConfig(config) {
    this._config = config;
    this._initializeValues();
    if (this.hasAttribute('data-rendered')) {
      this.reRender();
    }
  }

  /**
   * Get/Set componentTag property
   */
  get componentTag() {
    return this._config?.componentTag || this.getAttr('component-tag', 'dry-button');
  }

  set componentTag(value) {
    this.setAttribute('component-tag', value);
  }

  /**
   * Get/Set title property
   */
  get title() {
    return this._config?.title || this.getAttr('title', 'Component Builder');
  }

  set title(value) {
    this.setAttribute('title', value);
  }

  /**
   * Get/Set description property
   */
  get description() {
    return this._config?.description || this.getAttr('description', '');
  }

  set description(value) {
    this.setAttribute('description', value);
  }
}

// Register the custom element
customElements.define('dry-component-builder', DryComponentBuilder);

/**
 * Global ComponentBuilder factory function for backward compatibility
 * Creates and initializes a dry-component-builder element
 * @param {Object} config - Configuration object
 * @returns {DryComponentBuilder} The initialized component
 */
window.ComponentBuilder = function(config) {
  if (!config || !config.elementId) {
    console.error('ComponentBuilder: elementId is required');
    return null;
  }

  const targetElement = document.getElementById(config.elementId);
  if (!targetElement) {
    console.error(`ComponentBuilder: Element with id "${config.elementId}" not found`);
    return null;
  }

  // Create the custom element
  const builder = document.createElement('dry-component-builder');
  
  // Add configuration as a JSON script tag
  const configScript = document.createElement('script');
  configScript.type = 'application/json';
  configScript.textContent = JSON.stringify(config);
  builder.appendChild(configScript);
  
  // Replace the target element's content with the builder
  targetElement.appendChild(builder);
  
  return builder;
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryComponentBuilder;
}

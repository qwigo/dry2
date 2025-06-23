/**
 * ComponentBuilder - A reusable class for creating interactive component builders
 * across all showcase pages
 */
class ComponentBuilder {
  constructor(config) {
    // Validate configuration
    if (!config || typeof config !== 'object') {
      throw new Error('ComponentBuilder requires a configuration object');
    }
    
    if (!config.componentTag || typeof config.componentTag !== 'string') {
      throw new Error('ComponentBuilder requires a valid componentTag');
    }
    
    this.config = {
      elementId: this._validateId(config.elementId) || 'component-builder',
      componentTag: this._escapeHtml(config.componentTag),
      title: this._escapeHtml(config.title) || 'Component Builder',
      description: this._escapeHtml(config.description) || 'Try changing the component properties dynamically.',
      
      // Property definitions
      properties: config.properties || {},
      
      // Default values
      defaults: config.defaults || {},
      
      // Content generator function
      contentGenerator: this._validateFunction(config.contentGenerator) || this.defaultContentGenerator,
      
      // Custom preview wrapper
      previewWrapper: this._validateFunction(config.previewWrapper) || this.defaultPreviewWrapper,
      
      // Code example generator
      codeGenerator: this._validateFunction(config.codeGenerator) || this.defaultCodeGenerator
    };
    
    this.currentValues = { ...this.config.defaults };
    this._boundHandlers = new Map();
    this._container = null;
    this._cachedElements = {};
    this._isDestroyed = false;
    
    // Generate a unique ID for this instance to avoid global namespace pollution
    this._instanceId = `cb_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.init();
    } catch (error) {
      this._handleError('Failed to initialize ComponentBuilder', error);
    }
  }
  
  _validateId(id) {
    if (!id || typeof id !== 'string') return null;
    // Remove any potentially dangerous characters
    return id.replace(/[^a-zA-Z0-9-_]/g, '');
  }
  
  _validateFunction(fn) {
    return typeof fn === 'function' ? fn : null;
  }
  
  _escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  _sanitizeAttribute(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/[<>"'&]/g, (char) => {
      const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
      return map[char];
    });
  }
  
  init() {
    this._container = document.getElementById(this.config.elementId);
    if (!this._container) {
      throw new Error(`ComponentBuilder: Element with id "${this.config.elementId}" not found`);
    }
    
    this._render();
    this._bindEvents();
    this._updateCode(); // Set initial code content
  }
  
  _render() {
    try {
      // Create container elements safely
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
      
      // Clear and append new content safely
      this._container.innerHTML = '';
      this._container.appendChild(section);
      
      // Cache elements for performance
      this._cacheElements();
    } catch (error) {
      this._handleError('Failed to render ComponentBuilder', error);
    }
  }
  
  _createHeader() {
    const headerContainer = document.createElement('div');
    
    const title = document.createElement('h2');
    title.className = 'demo-title';
    title.textContent = this.config.title;
    headerContainer.appendChild(title);
    
    const description = document.createElement('p');
    description.className = 'demo-description';
    description.textContent = this.config.description;
    headerContainer.appendChild(description);
    
    return headerContainer;
  }
  
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
    previewInner.id = `${this.config.elementId}-preview`;
    previewInner.innerHTML = this._generatePreview();
    
    previewDiv.appendChild(previewInner);
    grid.appendChild(previewDiv);
    
    demoContainer.appendChild(grid);
    return demoContainer;
  }
  
  _createControls() {
    const fragment = document.createDocumentFragment();
    
    Object.entries(this.config.properties).forEach(([key, propConfig]) => {
      const controlElement = this._createControl(key, propConfig);
      if (controlElement) {
        fragment.appendChild(controlElement);
      }
    });
    
    return fragment;
  }
  
  _createControl(key, propConfig) {
    const value = this.currentValues[key];
    const id = `${this.config.elementId}-${key}`;
    const container = document.createElement('div');
    
    try {
      if (propConfig.type === 'select') {
        container.appendChild(this._createSelectControl(key, propConfig, id, value));
      } else if (propConfig.type === 'checkbox') {
        container.appendChild(this._createCheckboxControl(key, propConfig, id, value));
      } else if (propConfig.type === 'range') {
        container.appendChild(this._createRangeControl(key, propConfig, id, value));
      } else if (propConfig.type === 'text') {
        container.appendChild(this._createTextControl(key, propConfig, id, value));
      } else {
        console.warn(`Unknown control type: ${propConfig.type}`);
        return null;
      }
    } catch (error) {
      this._handleError(`Failed to create control for ${key}`, error);
      return null;
    }
    
    return container;
  }
  
  _createSelectControl(key, propConfig, id, value) {
    const container = document.createElement('div');
    
    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-gray-700 mb-2';
    label.textContent = propConfig.label || key;
    label.setAttribute('for', id);
    container.appendChild(label);
    
    const select = document.createElement('select');
    select.id = id;
    select.className = 'w-full p-2 border border-gray-300 rounded';
    select.setAttribute('data-property', key);
    
    if (Array.isArray(propConfig.options)) {
      propConfig.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = this._sanitizeAttribute(option.value);
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
  
  _createCheckboxControl(key, propConfig, id, value) {
    const container = document.createElement('div');
    container.className = 'space-y-2';
    
    const label = document.createElement('label');
    label.className = 'flex items-center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.className = 'mr-2';
    checkbox.setAttribute('data-property', key);
    checkbox.checked = Boolean(value);
    
    label.appendChild(checkbox);
    
    const labelText = document.createTextNode(propConfig.label || key);
    label.appendChild(labelText);
    
    container.appendChild(label);
    return container;
  }
  
  _createRangeControl(key, propConfig, id, value) {
    const container = document.createElement('div');
    
    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-gray-700 mb-2';
    label.textContent = propConfig.label || key;
    label.setAttribute('for', id);
    container.appendChild(label);
    
    const input = document.createElement('input');
    input.type = 'range';
    input.id = id;
    input.className = 'w-full';
    input.min = propConfig.min || 0;
    input.max = propConfig.max || 100;
    input.value = value;
    input.setAttribute('data-property', key);
    container.appendChild(input);
    
    const display = document.createElement('div');
    display.className = 'text-sm text-gray-500 mt-1';
    display.id = `${id}-display`;
    display.textContent = propConfig.displayFormat ? propConfig.displayFormat(value) : value;
    container.appendChild(display);
    
    return container;
  }
  
  _createTextControl(key, propConfig, id, value) {
    const container = document.createElement('div');
    
    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-gray-700 mb-2';
    label.textContent = propConfig.label || key;
    label.setAttribute('for', id);
    container.appendChild(label);
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = id;
    input.className = 'w-full p-2 border border-gray-300 rounded';
    input.value = this._sanitizeAttribute(value);
    input.setAttribute('data-property', key);
    container.appendChild(input);
    
    return container;
  }
  
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
    
    const copyText = document.createTextNode('Copy');
    copyButton.appendChild(copyText);
    
    header.appendChild(copyButton);
    codeBlock.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'code-content';
    
    const pre = document.createElement('pre');
    pre.id = `${this.config.elementId}-code`;
    content.appendChild(pre);
    
    codeBlock.appendChild(content);
    return codeBlock;
  }
  
  _cacheElements() {
    this._cachedElements = {
      preview: document.getElementById(`${this.config.elementId}-preview`),
      code: document.getElementById(`${this.config.elementId}-code`),
      copyBtn: this._container.querySelector('[data-copy-btn]')
    };
  }
  
  _bindEvents() {
    if (this._isDestroyed) return;
    
    // Bind change events to all controls
    const changeHandler = (e) => {
      const property = e.target.dataset.property;
      if (property) {
        this._updateProperty(property, this._getControlValue(e.target));
      }
    };
    
    const inputHandler = (e) => {
      const property = e.target.dataset.property;
      if (property && e.target.type === 'range') {
        this._updateProperty(property, this._getControlValue(e.target));
        // Update range display
        const display = document.getElementById(`${this.config.elementId}-${property}-display`);
        if (display) {
          const propConfig = this.config.properties[property];
          display.textContent = propConfig.displayFormat ? propConfig.displayFormat(e.target.value) : e.target.value;
        }
      }
    };
    
    const copyHandler = () => this._copyCode();
    
    // Store bound handlers for cleanup
    this._boundHandlers.set('change', changeHandler);
    this._boundHandlers.set('input', inputHandler);
    this._boundHandlers.set('copy', copyHandler);
    
    this._container.addEventListener('change', changeHandler);
    this._container.addEventListener('input', inputHandler);
    
    if (this._cachedElements.copyBtn) {
      this._cachedElements.copyBtn.addEventListener('click', copyHandler);
    }
  }
  
  _getControlValue(element) {
    if (element.type === 'checkbox') {
      return element.checked;
    } else if (element.type === 'range') {
      return parseInt(element.value);
    } else {
      return element.value;
    }
  }
  
  _updateProperty(property, value) {
    if (this._isDestroyed) return;
    
    this.currentValues[property] = value;
    this._updatePreview();
    this._updateCode();
  }
  
  _updatePreview() {
    if (!this._cachedElements.preview || this._isDestroyed) return;
    
    try {
      const previewContent = this._generatePreview();
      this._cachedElements.preview.innerHTML = previewContent;
      
      // Ensure custom element is upgraded and interactive
      const countdown = this._cachedElements.preview.querySelector('dry-countdown');
      if (countdown && (countdown.hasAttribute('autostart') || countdown.autostart)) {
        // Use setTimeout to ensure the element is upgraded before calling the method
        setTimeout(() => {
          if (typeof countdown.startCountdown === 'function') {
            countdown.startCountdown();
          }
        }, 0);
      }
    } catch (error) {
      this._handleError('Failed to update preview', error);
    }
  }
  
  _updateCode() {
    if (!this._cachedElements.code || this._isDestroyed) return;
    
    try {
      const rawCode = this._generateCode();
      // Use textContent to automatically escape HTML and prevent browser from rendering custom elements
      this._cachedElements.code.textContent = rawCode;
    } catch (error) {
      this._handleError('Failed to update code', error);
    }
  }
  
  _generatePreview() {
    return this.config.previewWrapper(this._generateComponent());
  }
  
  _generateComponent() {
    const attributes = Object.entries(this.currentValues)
      .filter(([key, value]) => {
        const propConfig = this.config.properties[key];
        const defaultValue = this.config.defaults[key];
        return value !== defaultValue && value !== false && value !== '';
      })
      .map(([key, value]) => {
        // Handle boolean attributes - if true, just include the attribute name
        if (typeof value === 'boolean' && value === true) {
          return this._escapeHtml(key);
        }
        return `${this._escapeHtml(key)}="${this._sanitizeAttribute(value)}"`;
      })
      .join(' ');
    
    const content = this.config.contentGenerator(this.currentValues);
    const safeContent = this._escapeHtml(content);
    
    return `<${this.config.componentTag}${attributes ? ' ' + attributes : ''}>${safeContent}</${this.config.componentTag}>`;
  }
  
  _generateCode() {
    return this.config.codeGenerator(this.currentValues, this.config);
  }
  
  defaultPreviewWrapper(componentHTML) {
    return componentHTML;
  }
  
  defaultContentGenerator(values) {
    return 'Component content';
  }
  
  defaultCodeGenerator(values, config) {
    const attributes = Object.entries(values)
      .filter(([key, value]) => {
        const defaultValue = config.defaults[key];
        return value !== defaultValue && value !== false && value !== '';
      })
      .map(([key, value]) => {
        // Handle boolean attributes - if true, just include the attribute name
        if (typeof value === 'boolean' && value === true) {
          return key;
        }
        return `${key}="${value}"`;
      })
      .join(' ');
    
    return `<${config.componentTag}${attributes ? ' ' + attributes : ''}>
  Component content goes here...
</${config.componentTag}>`;
  }
  
  async _copyCode() {
    if (this._isDestroyed) return;
    
    try {
      const rawCode = this._generateCode();
      await navigator.clipboard.writeText(rawCode);
      
      // Show success feedback
      if (this._cachedElements.copyBtn) {
        const originalText = this._cachedElements.copyBtn.textContent;
        this._cachedElements.copyBtn.textContent = 'Copied!';
        this._cachedElements.copyBtn.disabled = true;
        
        setTimeout(() => {
          if (!this._isDestroyed && this._cachedElements.copyBtn) {
            this._cachedElements.copyBtn.textContent = originalText;
            this._cachedElements.copyBtn.disabled = false;
          }
        }, 2000);
      }
    } catch (error) {
      this._handleError('Failed to copy code to clipboard', error);
    }
  }
  
  _handleError(message, error) {
    console.error(`ComponentBuilder: ${message}`, error);
    
    // Dispatch custom error event
    if (this._container) {
      const errorEvent = new CustomEvent('componentbuilder:error', {
        detail: { message, error: error?.message }
      });
      this._container.dispatchEvent(errorEvent);
    }
  }
  
  // Public API
  destroy() {
    this._isDestroyed = true;
    
    // Remove event listeners
    this._boundHandlers.forEach((handler, eventType) => {
      if (eventType === 'copy' && this._cachedElements.copyBtn) {
        this._cachedElements.copyBtn.removeEventListener('click', handler);
      } else if (this._container) {
        this._container.removeEventListener(eventType, handler);
      }
    });
    
    this._boundHandlers.clear();
    this._cachedElements = {};
    this._container = null;
  }
  
  updateProperty(property, value) {
    if (this._isDestroyed) return;
    
    if (this.config.properties[property]) {
      this._updateProperty(property, value);
    } else {
      console.warn(`Property '${property}' is not defined in the component configuration`);
    }
  }
  
  getProperty(property) {
    return this.currentValues[property];
  }
  
  getAllProperties() {
    return { ...this.currentValues };
  }
}

// Make ComponentBuilder available globally
window.ComponentBuilder = ComponentBuilder; 
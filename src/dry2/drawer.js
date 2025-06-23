// drawer-components.js

class DryDrawer extends BaseElement {
  // Web component for creating a basic drawer interface
  constructor() {
    super();
    this._isOpen = false;
    this._isDestroyed = false;
    this._cachedElements = null;
    this._boundHandlers = new Map();
  }

  _initializeComponent() {
    try {
      if (!this.hasAttribute('data-rendered')) {
        this._render();
        this._attachEventListeners();
        this.setAttribute('data-rendered', '');
      } else {
        this._attachEventListeners();
      }
    } catch (error) {
      this._handleError('Failed to initialize drawer component', error);
    }
  }

  disconnectedCallback() {
    this._cleanup();
    super.disconnectedCallback?.();
  }

  _cleanup() {
    this._isDestroyed = true;
    this._removeEventListeners();
    this._cachedElements = null;
    this._boundHandlers.clear();
  }

  _render() {
    if (this._isDestroyed) return;
    
    try {
      const container = document.createElement('div');
      container.className = 'drawer-container';
      
      // Create trigger button
      const triggerButton = this._createTriggerButton();
      container.appendChild(triggerButton);
      
      // Create drawer wrapper
      const drawerWrapper = this._createDrawerWrapper();
      container.appendChild(drawerWrapper);
      
      // Clear and append safely
      this.innerHTML = '';
      this.appendChild(container);
      
      // Cache elements
      this._cacheElements();
    } catch (error) {
      this._handleError('Failed to render drawer', error);
    }
  }

  _createTriggerButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `trigger-button ${this.buttonClass}`;
    button.textContent = this.triggerContent;
    button.setAttribute('aria-label', 'Open drawer');
    return button;
  }

  _createDrawerWrapper() {
    const wrapper = document.createElement('div');
    wrapper.className = 'drawer-wrapper fixed inset-0 z-50 pointer-events-none';
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = `drawer-backdrop fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out opacity-0 pointer-events-none ${this.backdropClass}`;
    wrapper.appendChild(backdrop);
    
    // Create drawer
    const drawer = this._createDrawer();
    wrapper.appendChild(drawer);
    
    return wrapper;
  }

  _createDrawer() {
    const drawer = document.createElement('div');
    const positionClasses = this.position === 'left' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full';
    drawer.className = `drawer fixed ${positionClasses} top-0 h-full transition-transform duration-300 ease-in-out pointer-events-auto shadow-xl ${this.drawerClass}`;
    
    // Create header
    const header = this._createDrawerHeader();
    drawer.appendChild(header);
    
    // Create content
    const content = this._createDrawerContent();
    drawer.appendChild(content);
    
    return drawer;
  }

  _createDrawerHeader() {
    const header = document.createElement('div');
    header.className = `drawer-header flex items-center justify-between p-4 border-b ${this.headerClass}`;
    
    const title = document.createElement('div');
    title.className = 'drawer-title';
    
    const headerContent = this.querySelector('[slot="header"]')?.textContent || this.headerContent;
    title.textContent = this._escapeHtml(headerContent);
    header.appendChild(title);
    
    // Create close button
    const closeButton = this._createCloseButton();
    header.appendChild(closeButton);
    
    return header;
  }

  _createCloseButton() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'drawer-close cursor-pointer h-6 w-6 text-gray-500 hover:text-gray-700');
    svg.setAttribute('role', 'button');
    svg.setAttribute('aria-label', 'Close drawer');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
    
    svg.appendChild(path);
    return svg;
  }

  _createDrawerContent() {
    const content = document.createElement('div');
    content.className = 'drawer-content p-4';
    
    const contentSlot = this.querySelector('[slot="content"]');
    if (contentSlot) {
      const safeContent = contentSlot.cloneNode(true);
      safeContent.removeAttribute('slot');
      content.appendChild(safeContent);
    }
    
    return content;
  }

  _cacheElements() {
    this._cachedElements = {
      triggerButton: this.querySelector('.trigger-button'),
      drawerElement: this.querySelector('.drawer'),
      backdrop: this.querySelector('.drawer-backdrop'),
      closeButton: this.querySelector('.drawer-close'),
      drawerWrapper: this.querySelector('.drawer-wrapper')
    };
  }

  _attachEventListeners() {
    if (this._isDestroyed || !this._cachedElements) return;
    
    try {
      const { triggerButton, backdrop, closeButton } = this._cachedElements;
      
      // Create bound handlers
      const openHandler = this._open.bind(this);
      const closeHandler = this._close.bind(this);
      const keydownHandler = this._handleKeyDown.bind(this);

      // Store bound handlers
      this._boundHandlers.set('open', openHandler);
      this._boundHandlers.set('close', closeHandler);
      this._boundHandlers.set('keydown', keydownHandler);

      // Attach listeners
      if (triggerButton) {
        triggerButton.addEventListener('click', openHandler);
      }

      if (backdrop) {
        backdrop.addEventListener('click', closeHandler);
      }

      if (closeButton) {
        closeButton.addEventListener('click', closeHandler);
      }

      // Add keyboard listener for ESC key
      document.addEventListener('keydown', keydownHandler);
    } catch (error) {
      this._handleError('Failed to attach event listeners', error);
    }
  }

  _removeEventListeners() {
    if (!this._cachedElements) return;
    
    const { triggerButton, backdrop, closeButton } = this._cachedElements;
    const openHandler = this._boundHandlers.get('open');
    const closeHandler = this._boundHandlers.get('close');
    const keydownHandler = this._boundHandlers.get('keydown');

    if (triggerButton && openHandler) {
      triggerButton.removeEventListener('click', openHandler);
    }

    if (backdrop && closeHandler) {
      backdrop.removeEventListener('click', closeHandler);
    }

    if (closeButton && closeHandler) {
      closeButton.removeEventListener('click', closeHandler);
    }

    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
    }
  }

  _handleKeyDown(event) {
    if (event.key === 'Escape' && this._isOpen && !this._isDestroyed) {
      this._close();
    }
  }

  _open() {
    if (this._isDestroyed || !this._cachedElements) return;
    
    try {
      const { drawerWrapper, backdrop, drawerElement } = this._cachedElements;
      
      this._isOpen = true;
      drawerWrapper.classList.remove('pointer-events-none');
      drawerWrapper.classList.add('pointer-events-auto');
      backdrop.classList.remove('pointer-events-none', 'opacity-0');
      backdrop.classList.add('pointer-events-auto', 'opacity-100');

      if (this.position === 'left') {
        drawerElement.classList.remove('-translate-x-full');
        drawerElement.classList.add('translate-x-0');
      } else {
        drawerElement.classList.remove('translate-x-full');
        drawerElement.classList.add('translate-x-0');
      }

      // Focus management
      const firstFocusable = drawerElement.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }

      this._dispatchEvent('drawer:opened', { drawer: this });
    } catch (error) {
      this._handleError('Failed to open drawer', error);
    }
  }

  _close() {
    if (this._isDestroyed || !this._cachedElements) return;
    
    try {
      const { drawerWrapper, backdrop, drawerElement } = this._cachedElements;
      
      this._isOpen = false;
      drawerWrapper.classList.remove('pointer-events-auto');
      drawerWrapper.classList.add('pointer-events-none');
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');

      if (this.position === 'left') {
        drawerElement.classList.remove('translate-x-0');
        drawerElement.classList.add('-translate-x-full');
      } else {
        drawerElement.classList.remove('translate-x-0');
        drawerElement.classList.add('translate-x-full');
      }

      this._dispatchEvent('drawer:closed', { drawer: this });
    } catch (error) {
      this._handleError('Failed to close drawer', error);
    }
  }

  _handleError(message, error) {
    console.error(`DryDrawer: ${message}`, error);
    this._dispatchEvent('drawer:error', { 
      message, 
      error: error?.message,
      timestamp: new Date()
    });
  }

  // Getters for attributes with defaults and validation
  get position() {
    const pos = this._getAttributeWithDefault('position', 'right');
    return ['left', 'right'].includes(pos) ? pos : 'right';
  }

  set position(value) {
    if (['left', 'right'].includes(value)) {
      this._setAttribute('position', value);
    } else {
      this._handleError(`Invalid position: ${value}. Must be 'left' or 'right'`);
    }
  }

  get drawerClass() {
    return this._escapeHtml(this._getAttributeWithDefault('drawer-class', 'bg-white w-80'));
  }

  get headerClass() {
    return this._escapeHtml(this._getAttributeWithDefault('header-class', ''));
  }

  get backdropClass() {
    return this._escapeHtml(this._getAttributeWithDefault('backdrop-class', ''));
  }

  get buttonClass() {
    return this._escapeHtml(this._getAttributeWithDefault('button-class', 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'));
  }

  get triggerContent() {
    return this._escapeHtml(this._getAttributeWithDefault('trigger-content', 'Open Drawer'));
  }

  get headerContent() {
    return this._escapeHtml(this._getAttributeWithDefault('header-content', 'Drawer'));
  }

  // Public API
  open() {
    this._open();
  }

  close() {
    this._close();
  }

  isOpen() {
    return this._isOpen;
  }
}

customElements.define('dry-drawer', DryDrawer);

class AjaxDrawer extends BaseElement {
  // Web component for creating a drawer that fetches content via AJAX
  constructor() {
    super();
    this._isOpen = false;
    this._isDestroyed = false;
    this._cachedElements = null;
    this._boundHandlers = new Map();
  }

  _initializeComponent() {
    try {
      // For ComponentBuilder-created elements, delay initialization to allow attributes to be set
      if (!this.url && this.closest('[id$="-component-builder"]')) {
        setTimeout(() => {
          if (!this._isDestroyed && this.isConnected) {
            this._initializeComponent();
          }
        }, 100);
        return;
      }

      if (!this._validateConfiguration()) {
        return;
      }

      if (!this.hasAttribute('data-rendered')) {
        this._render();
        this._attachEventListeners();
        this.setAttribute('data-rendered', '');
      } else {
        this._attachEventListeners();
      }
    } catch (error) {
      this._handleError('Failed to initialize ajax drawer component', error);
    }
  }

  disconnectedCallback() {
    this._cleanup();
    super.disconnectedCallback?.();
  }

  _cleanup() {
    this._isDestroyed = true;
    this._removeEventListeners();
    this._cachedElements = null;
    this._boundHandlers.clear();
  }

  _validateConfiguration() {
    const url = this.url;
    
    if (!url) {
      this._handleError('AjaxDrawer requires a URL attribute');
      return false;
    }
    
    if (!this._validateUrl(url)) {
      this._handleError(`Invalid or unsafe URL: ${url}`);
      return false;
    }
    
    return true;
  }

  _validateUrl(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  _render() {
    if (this._isDestroyed) return;
    
    try {
      const container = document.createElement('div');
      container.className = 'drawer-container';
      
      // Create trigger button
      const triggerButton = this._createTriggerButton();
      container.appendChild(triggerButton);
      
      // Create drawer wrapper
      const drawerWrapper = this._createDrawerWrapper();
      container.appendChild(drawerWrapper);
      
      // Clear and append safely
      this.innerHTML = '';
      this.appendChild(container);
      
      // Cache elements
      this._cacheElements();
    } catch (error) {
      this._handleError('Failed to render ajax drawer', error);
    }
  }

  _createTriggerButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `trigger-button ${this.buttonClass}`;
    button.setAttribute('hx-get', this.url);
    button.setAttribute('hx-trigger', this.triggerType);
    button.setAttribute('hx-target', `#${this.contentId}`);
    button.setAttribute('aria-label', 'Load drawer content');
    button.textContent = this.triggerContent;
    return button;
  }

  _createDrawerWrapper() {
    const wrapper = document.createElement('div');
    wrapper.className = 'drawer-wrapper fixed inset-0 z-50 pointer-events-none';
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = `drawer-backdrop fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out opacity-0 pointer-events-none ${this.backdropClass}`;
    wrapper.appendChild(backdrop);
    
    // Create drawer
    const drawer = this._createDrawer();
    wrapper.appendChild(drawer);
    
    return wrapper;
  }

  _createDrawer() {
    const drawer = document.createElement('div');
    const positionClasses = this.position === 'left' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full';
    drawer.className = `drawer fixed ${positionClasses} top-0 h-full transition-transform duration-300 ease-in-out pointer-events-auto shadow-xl ${this.drawerClass}`;
    
    // Create header
    const header = this._createDrawerHeader();
    drawer.appendChild(header);
    
    // Create content area
    const contentArea = this._createDrawerContent();
    drawer.appendChild(contentArea);
    
    return drawer;
  }

  _createDrawerHeader() {
    const header = document.createElement('div');
    header.className = `drawer-header flex items-center justify-between p-4 border-b ${this.headerClass}`;
    
    const title = document.createElement('div');
    title.className = 'drawer-title';
    
    const headerContent = this.querySelector('[slot="header"]')?.textContent || this.headerContent;
    title.textContent = this._escapeHtml(headerContent);
    header.appendChild(title);
    
    // Create close button
    const closeButton = this._createCloseButton();
    header.appendChild(closeButton);
    
    return header;
  }

  _createCloseButton() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'drawer-close cursor-pointer h-6 w-6 text-gray-500 hover:text-gray-700');
    svg.setAttribute('role', 'button');
    svg.setAttribute('aria-label', 'Close drawer');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
    
    svg.appendChild(path);
    return svg;
  }

  _createDrawerContent() {
    const content = document.createElement('div');
    content.className = 'drawer-content p-4';
    
    // Ajax content container
    const ajaxContent = document.createElement('div');
    ajaxContent.id = this.contentId;
    ajaxContent.className = 'drawer-ajax-content';
    content.appendChild(ajaxContent);
    
    // Loading indicator
    const loading = this._createLoadingIndicator();
    content.appendChild(loading);
    
    // Error message
    const error = this._createErrorMessage();
    content.appendChild(error);
    
    return content;
  }

  _createLoadingIndicator() {
    const loading = document.createElement('div');
    loading.className = 'drawer-loading hidden flex justify-center items-center p-8';
    
    const spinner = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    spinner.setAttribute('class', 'animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500');
    spinner.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    spinner.setAttribute('fill', 'none');
    spinner.setAttribute('viewBox', '0 0 24 24');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'opacity-25');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '10');
    circle.setAttribute('stroke', 'currentColor');
    circle.setAttribute('stroke-width', '4');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'opacity-75');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z');
    
    spinner.appendChild(circle);
    spinner.appendChild(path);
    loading.appendChild(spinner);
    
    const text = document.createElement('span');
    text.textContent = 'Loading...';
    loading.appendChild(text);
    
    return loading;
  }

  _createErrorMessage() {
    const error = document.createElement('div');
    error.className = 'drawer-error hidden text-red-500 p-4';
    error.textContent = 'There was an error loading the content. Please try again.';
    return error;
  }

  _cacheElements() {
    this._cachedElements = {
      triggerButton: this.querySelector('.trigger-button'),
      drawerElement: this.querySelector('.drawer'),
      backdrop: this.querySelector('.drawer-backdrop'),
      closeButton: this.querySelector('.drawer-close'),
      drawerWrapper: this.querySelector('.drawer-wrapper'),
      loadingElement: this.querySelector('.drawer-loading'),
      errorElement: this.querySelector('.drawer-error'),
      contentElement: this.querySelector(`#${this.contentId}`)
    };
  }

  _attachEventListeners() {
    if (this._isDestroyed || !this._cachedElements) return;
    
    try {
      const { closeButton, backdrop } = this._cachedElements;
      
      // Create bound handlers
      const closeHandler = this._close.bind(this);
      const keydownHandler = this._handleKeyDown.bind(this);
      const beforeRequestHandler = this._handleBeforeRequest.bind(this);
      const afterRequestHandler = this._handleAfterRequest.bind(this);
      const responseErrorHandler = this._handleResponseError.bind(this);
      const afterOnLoadHandler = this._handleAfterOnLoad.bind(this);

      // Store bound handlers
      this._boundHandlers.set('close', closeHandler);
      this._boundHandlers.set('keydown', keydownHandler);
      this._boundHandlers.set('beforeRequest', beforeRequestHandler);
      this._boundHandlers.set('afterRequest', afterRequestHandler);
      this._boundHandlers.set('responseError', responseErrorHandler);
      this._boundHandlers.set('afterOnLoad', afterOnLoadHandler);

      // Attach listeners
      if (closeButton) {
        closeButton.addEventListener('click', closeHandler);
      }

      if (backdrop) {
        backdrop.addEventListener('click', closeHandler);
      }

      // HTMX event listeners
      document.body.addEventListener('htmx:beforeRequest', beforeRequestHandler);
      document.body.addEventListener('htmx:afterRequest', afterRequestHandler);
      document.body.addEventListener('htmx:responseError', responseErrorHandler);
      document.body.addEventListener('htmx:afterOnLoad', afterOnLoadHandler);

      // Add keyboard listener for ESC key
      document.addEventListener('keydown', keydownHandler);
    } catch (error) {
      this._handleError('Failed to attach event listeners', error);
    }
  }

  _removeEventListeners() {
    if (!this._cachedElements) return;
    
    const { closeButton, backdrop } = this._cachedElements;
    const closeHandler = this._boundHandlers.get('close');
    const keydownHandler = this._boundHandlers.get('keydown');
    const beforeRequestHandler = this._boundHandlers.get('beforeRequest');
    const afterRequestHandler = this._boundHandlers.get('afterRequest');
    const responseErrorHandler = this._boundHandlers.get('responseError');
    const afterOnLoadHandler = this._boundHandlers.get('afterOnLoad');

    if (closeButton && closeHandler) {
      closeButton.removeEventListener('click', closeHandler);
    }

    if (backdrop && closeHandler) {
      backdrop.removeEventListener('click', closeHandler);
    }

    if (beforeRequestHandler) {
      document.body.removeEventListener('htmx:beforeRequest', beforeRequestHandler);
    }

    if (afterRequestHandler) {
      document.body.removeEventListener('htmx:afterRequest', afterRequestHandler);
    }

    if (responseErrorHandler) {
      document.body.removeEventListener('htmx:responseError', responseErrorHandler);
    }

    if (afterOnLoadHandler) {
      document.body.removeEventListener('htmx:afterOnLoad', afterOnLoadHandler);
    }

    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
    }
  }

  _handleKeyDown(event) {
    if (event.key === 'Escape' && this._isOpen && !this._isDestroyed) {
      this._close();
    }
  }

  _handleBeforeRequest(event) {
    if (this._isDestroyed) return;
    
    try {
      // Only handle events for our content element
      if (event.detail?.target?.id === this.contentId) {
        this._open();
        const { contentElement, loadingElement, errorElement } = this._cachedElements;
        contentElement.classList.add('hidden');
        loadingElement.classList.remove('hidden');
        errorElement.classList.add('hidden');
      }
    } catch (error) {
      this._handleError('Error handling before request', error);
    }
  }

  _handleAfterRequest(event) {
    if (this._isDestroyed) return;
    
    try {
      // Only handle events for our content element
      if (event.detail?.target?.id === this.contentId) {
        const { contentElement, loadingElement } = this._cachedElements;
        loadingElement.classList.add('hidden');
        contentElement.classList.remove('hidden');
      }
    } catch (error) {
      this._handleError('Error handling after request', error);
    }
  }

  _handleResponseError(event) {
    if (this._isDestroyed) return;
    
    try {
      // Only handle events for our content element
      if (event.detail?.target?.id === this.contentId) {
        const { loadingElement, errorElement } = this._cachedElements;
        loadingElement.classList.add('hidden');
        errorElement.classList.remove('hidden');
      }
    } catch (error) {
      this._handleError('Error handling response error', error);
    }
  }

  _handleAfterOnLoad(event) {
    if (this._isDestroyed) return;
    
    try {
      // Check if we should close the drawer based on headers
      if (event.detail?.target?.id === this.contentId) {
        if (event.detail?.xhr?.getResponseHeader('HX-CloseDrawer') === 'close') {
          this._close();
        }
      }
    } catch (error) {
      this._handleError('Error handling after on load', error);
    }
  }

  _open() {
    if (this._isDestroyed || !this._cachedElements) return;
    
    try {
      const { drawerWrapper, backdrop, drawerElement } = this._cachedElements;
      
      this._isOpen = true;
      drawerWrapper.classList.remove('pointer-events-none');
      drawerWrapper.classList.add('pointer-events-auto');
      backdrop.classList.remove('pointer-events-none', 'opacity-0');
      backdrop.classList.add('pointer-events-auto', 'opacity-100');

      if (this.position === 'left') {
        drawerElement.classList.remove('-translate-x-full');
        drawerElement.classList.add('translate-x-0');
      } else {
        drawerElement.classList.remove('translate-x-full');
        drawerElement.classList.add('translate-x-0');
      }

      // Focus management
      const firstFocusable = drawerElement.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }

      this._dispatchEvent('drawer:opened', { drawer: this });
    } catch (error) {
      this._handleError('Failed to open drawer', error);
    }
  }

  _close() {
    if (this._isDestroyed || !this._cachedElements) return;
    
    try {
      const { drawerWrapper, backdrop, drawerElement, errorElement, loadingElement } = this._cachedElements;
      
      this._isOpen = false;
      drawerWrapper.classList.remove('pointer-events-auto');
      drawerWrapper.classList.add('pointer-events-none');
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');

      if (this.position === 'left') {
        drawerElement.classList.remove('translate-x-0');
        drawerElement.classList.add('-translate-x-full');
      } else {
        drawerElement.classList.remove('translate-x-0');
        drawerElement.classList.add('translate-x-full');
      }

      // Reset content
      errorElement.classList.add('hidden');
      loadingElement.classList.add('hidden');

      this._dispatchEvent('drawer:closed', { drawer: this });
    } catch (error) {
      this._handleError('Failed to close drawer', error);
    }
  }

  _handleError(message, error) {
    console.error(`AjaxDrawer: ${message}`, error);
    this._dispatchEvent('drawer:error', { 
      message, 
      error: error?.message,
      timestamp: new Date()
    });
  }

  // Getters for attributes with defaults and validation
  get position() {
    const pos = this._getAttributeWithDefault('position', 'right');
    return ['left', 'right'].includes(pos) ? pos : 'right';
  }

  get drawerClass() {
    return this._escapeHtml(this._getAttributeWithDefault('drawer-class', 'bg-white w-80'));
  }

  get headerClass() {
    return this._escapeHtml(this._getAttributeWithDefault('header-class', ''));
  }

  get backdropClass() {
    return this._escapeHtml(this._getAttributeWithDefault('backdrop-class', ''));
  }

  get buttonClass() {
    return this._escapeHtml(this._getAttributeWithDefault('button-class', 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'));
  }

  get triggerContent() {
    return this._escapeHtml(this._getAttributeWithDefault('trigger-content', 'Load Content'));
  }

  get headerContent() {
    return this._escapeHtml(this._getAttributeWithDefault('header-content', 'Drawer'));
  }

  get url() {
    const url = this._getAttributeWithDefault('url', '');
    return this._validateUrl(url) ? url : '';
  }

  set url(value) {
    if (this._validateUrl(value)) {
      this._setAttribute('url', value);
    } else {
      this._handleError(`Invalid URL: ${value}`);
    }
  }

  get triggerType() {
    const type = this._getAttributeWithDefault('trigger-type', 'click');
    const validTypes = ['click', 'mouseenter', 'focus', 'load'];
    return validTypes.includes(type) ? type : 'click';
  }

  get contentId() {
    const id = this._getAttributeWithDefault('content-id', `drawer-content-${Math.floor(Math.random() * 10000)}`);
    // Ensure ID is HTML-safe
    return id.replace(/[^a-zA-Z0-9-_]/g, '');
  }

  // Public API
  open() {
    this._open();
  }

  close() {
    this._close();
  }

  isOpen() {
    return this._isOpen;
  }
}

customElements.define('ajax-drawer', AjaxDrawer);

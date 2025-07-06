class Dialog extends BaseElement {
  // Web component for creating a dialog that fetches content via AJAX

  constructor() {
    super();
    this._cachedElements = null;
    this._boundHandlers = new Map();
    this._isDestroyed = false;
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
        // Use setTimeout to capture content after DOM parsing is complete
        // Also add a longer delay for the first component to ensure scripts are loaded
        const delay = document.readyState === 'loading' ? 100 : 0;
        setTimeout(() => {
          this._originalContent = this._extractAndValidateContent();
          // If content is still empty, try again with a longer delay
          if (!this._originalContent) {
            setTimeout(() => {
              this._originalContent = this._extractAndValidateContent();
              this._render();
              this._attachEventListeners();
              this.setAttribute('data-rendered', '');
            }, 100);
          } else {
            this._render();
            this._attachEventListeners();
            this.setAttribute('data-rendered', '');
          }
        }, delay);
      } else {
        this._attachEventListeners();
      }
    } catch (error) {
      this._handleError('Failed to initialize dialog component', error);
    }
  }

  disconnectedCallback() {
    this._cleanup();
    super.disconnectedCallback?.();
  }

  _cleanup() {
    this._isDestroyed = true;
    
    // Remove all event listeners
    this._boundHandlers.forEach((handler, eventType) => {
      if (eventType === 'htmx:afterRequest') {
        document.body.removeEventListener(eventType, handler);
      }
    });
    
    this._boundHandlers.clear();
    this._cachedElements = null;
  }

  _validateConfiguration() {
    const url = this.url;
    
    if (!url) {
      this._handleError('Dialog requires a URL attribute');
      return false;
    }
    
    if (!this._validateUrl(url)) {
      this._handleError(`Invalid or unsafe URL: ${url}`);
      return false;
    }
    
    const triggerId = this.triggerId;
    if (!triggerId || !this._isValidId(triggerId)) {
      this._handleError(`Invalid trigger ID: ${triggerId}`);
      return false;
    }
    
    const dialogInnerId = this.dialogInnerId;
    if (!dialogInnerId || !this._isValidId(dialogInnerId)) {
      this._handleError(`Invalid dialog inner ID: ${dialogInnerId}`);
      return false;
    }
    
    return true;
  }

  _validateUrl(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      // Only allow http, https protocols
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  _isValidId(id) {
    // Check for valid HTML ID format
    return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id);
  }

  _extractAndValidateContent() {
    const content = this.textContent ? this.textContent.trim() : '';
    return this._escapeHtml(content);
  }

  _render() {
    if (this._isDestroyed) return;
    
    try {
      const container = document.createElement('div');
      container.className = 'relative';
      
      // Create trigger link
      const trigger = this._createTrigger();
      container.appendChild(trigger);
      
      // Create dialog
      const dialog = this._createDialog();
      container.appendChild(dialog);
      
      // Clear and append safely
      this.innerHTML = '';
      this.appendChild(container);
      
      // Cache elements
      this._cacheElements();
    } catch (error) {
      this._handleError('Failed to render dialog', error);
    }
  }

  _createTrigger() {
    const trigger = document.createElement('a');
    trigger.id = this.triggerId;
    trigger.className = this.buttonClass;
    trigger.href = this.url;
    trigger.setAttribute('hx-get', this.url);
    trigger.setAttribute('hx-trigger', this.triggerType);
    trigger.setAttribute('hx-target', `#${this.dialogInnerId}`);
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-label', 'Open dialog');
    trigger.textContent = this._originalContent || 'Open Dialog';
    
    return trigger;
  }

  _createDialog() {
    const dialog = document.createElement('dialog');
    dialog.className = `${this.dialogClass} ajax-modal`;
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('role', 'dialog');
    
    // Create close button
    const closeButton = this._createCloseButton();
    dialog.appendChild(closeButton);
    
    // Create dialog inner content
    const dialogInner = document.createElement('div');
    dialogInner.className = 'dialog-inner pt-2 text-gray-800 dark:text-gray-200';
    dialogInner.id = this.dialogInnerId;
    dialog.appendChild(dialogInner);
    
    return dialog;
  }

  _createCloseButton() {
    const closeButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    closeButton.setAttribute('viewBox', '0 0 100 100');
    closeButton.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    closeButton.id = 'closer';
    closeButton.setAttribute('class', 'cursor-pointer h-6 absolute opacity-30 hover:opacity-80 transition-all duration-75 top-8 right-8 text-gray-700 dark:text-gray-300');
    closeButton.setAttribute('role', 'button');
    closeButton.setAttribute('aria-label', 'Close dialog');
    
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '10');
    line1.setAttribute('y1', '10');
    line1.setAttribute('x2', '90');
    line1.setAttribute('y2', '90');
    line1.setAttribute('stroke', 'black');
    line1.setAttribute('stroke-width', '20');
    
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '90');
    line2.setAttribute('y1', '10');
    line2.setAttribute('x2', '10');
    line2.setAttribute('y2', '90');
    line2.setAttribute('stroke', 'black');
    line2.setAttribute('stroke-width', '20');
    
    closeButton.appendChild(line1);
    closeButton.appendChild(line2);
    
    return closeButton;
  }

  _cacheElements() {
    this._cachedElements = {
      dialog: this.querySelector('dialog'),
      trigger: this.querySelector('a'),
      closer: this.querySelector('svg#closer')
    };
  }

  _attachEventListeners() {
    if (this._isDestroyed || !this._cachedElements) return;
    
    try {
      const { dialog, trigger, closer } = this._cachedElements;
      
      if (!dialog || !trigger || !closer) {
        this._handleError('Required elements not found for event binding');
        return;
      }

      // Create bound handlers
      const triggerHandler = (event) => {
        event.preventDefault();
        this._openDialog();
      };

      const closerHandler = () => {
        this._closeDialog();
      };

      const htmxAfterRequestHandler = (event) => {
        this._handleHtmxAfterRequest(event);
      };

      const escapeHandler = (event) => {
        if (event.key === 'Escape' && dialog.open) {
          this._closeDialog();
        }
      };

      // Store handlers for cleanup
      this._boundHandlers.set('triggerClick', triggerHandler);
      this._boundHandlers.set('closerClick', closerHandler);
      this._boundHandlers.set('htmxAfterRequest', htmxAfterRequestHandler);
      this._boundHandlers.set('keydown', escapeHandler);

      // Attach event listeners
      trigger.addEventListener('click', triggerHandler);
      closer.addEventListener('click', closerHandler);
      document.body.addEventListener('htmx:afterRequest', htmxAfterRequestHandler);
      document.addEventListener('keydown', escapeHandler);

    } catch (error) {
      this._handleError('Failed to attach event listeners', error);
    }
  }

  _openDialog() {
    if (this._isDestroyed || !this._cachedElements?.dialog) return;
    
    try {
      const { dialog, trigger } = this._cachedElements;
      
      dialog.showModal();
      
      // Focus management
      const firstFocusable = dialog.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }

      // Trigger HTMX manually if available
      if (window.htmx) {
        htmx.ajax('GET', this.url, {
          target: `#${this.dialogInnerId}`,
          source: trigger
        });
      }
      
      this._dispatchEvent('dialog:opened', { url: this.url });
    } catch (error) {
      this._handleError('Failed to open dialog', error);
    }
  }

  _closeDialog() {
    if (this._isDestroyed || !this._cachedElements?.dialog) return;
    
    try {
      this._cachedElements.dialog.close();
      this._dispatchEvent('dialog:closed');
    } catch (error) {
      this._handleError('Failed to close dialog', error);
    }
  }

  _handleHtmxAfterRequest(event) {
    if (this._isDestroyed) return;
    
    try {
      // Close dialog if server sends the close header
      if (event.detail?.xhr?.getResponseHeader('HX-CloseDialog') === 'close') {
        this._closeDialog();
      }
    } catch (error) {
      this._handleError('Error handling HTMX after request', error);
    }
  }

  _handleError(message, error) {
    console.error(`Dialog: ${message}`, error);
    this._dispatchEvent('dialog:error', { 
      message, 
      error: error?.message,
      timestamp: new Date()
    });
  }

  // Getters with validation and escaping
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

  get buttonClass() {
    return this._escapeHtml(this._getAttributeWithDefault('button-class', 'bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-800'));
  }

  set buttonClass(value) {
    this._setAttribute('button-class', value);
  }

  get dialogClass() {
    return this._escapeHtml(this._getAttributeWithDefault('dialog-class', 'bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-auto'));
  }

  set dialogClass(value) {
    this._setAttribute('dialog-class', value);
  }

  get dialogInnerId() {
    const id = this._getAttributeWithDefault('dialog-inner-id', 'dialog-inner');
    return this._isValidId(id) ? id : 'dialog-inner';
  }

  set dialogInnerId(value) {
    if (this._isValidId(value)) {
      this._setAttribute('dialog-inner-id', value);
    } else {
      this._handleError(`Invalid dialog inner ID: ${value}`);
    }
  }

  get triggerId() {
    const id = this._getAttributeWithDefault('trigger-id', 'trigger');
    return this._isValidId(id) ? id : 'trigger';
  }

  set triggerId(value) {
    if (this._isValidId(value)) {
      this._setAttribute('trigger-id', value);
    } else {
      this._handleError(`Invalid trigger ID: ${value}`);
    }
  }

  get triggerType() {
    const type = this._getAttributeWithDefault('trigger-type', 'click');
    const validTypes = ['click', 'mouseenter', 'focus', 'load'];
    return validTypes.includes(type) ? type : 'click';
  }

  set triggerType(value) {
    const validTypes = ['click', 'mouseenter', 'focus', 'load'];
    if (validTypes.includes(value)) {
      this._setAttribute('trigger-type', value);
    } else {
      this._handleError(`Invalid trigger type: ${value}. Valid types: ${validTypes.join(', ')}`);
    }
  }

  // Public API
  open() {
    this._openDialog();
  }

  close() {
    this._closeDialog();
  }

  isOpen() {
    return this._cachedElements?.dialog?.open || false;
  }

  setContent(content) {
    if (this._cachedElements) {
      const dialogInner = this.querySelector(`#${this.dialogInnerId}`);
      if (dialogInner) {
        dialogInner.textContent = this._escapeHtml(content);
      }
    }
  }
}

customElements.define('dry-dialog', Dialog);

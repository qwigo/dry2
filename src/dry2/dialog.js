class Dialog extends BaseElement {
  // Web component for creating a dialog that fetches content via AJAX
  // Supports both traditional dialog and drawer modes

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
    
    // Validate drawer direction if in drawer mode
    if (this.mode === 'drawer') {
      const validDirections = ['left', 'right', 'top', 'bottom'];
      if (!validDirections.includes(this.direction)) {
        this._handleError(`Invalid drawer direction: ${this.direction}. Valid directions: ${validDirections.join(', ')}`);
        return false;
      }
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
    if (this.mode === 'drawer') {
      return this._createDrawer();
    } else {
      return this._createTraditionalDialog();
    }
  }

  _createTraditionalDialog() {
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

  _createDrawer() {
    // Create dialog element (same as traditional dialog)
    const dialog = document.createElement('dialog');
    dialog.className = `${this.drawerClass} drawer-container bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 transform`;
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('role', 'dialog');
    
    // Add direction-specific class and data attribute
    dialog.classList.add(`drawer-${this.direction}`);
    dialog.setAttribute('data-direction', this.direction);
    
    // Create comprehensive drawer styles
    const style = document.createElement('style');
    style.textContent = `
      /* Reset all dialog defaults with highest specificity */
      dialog.drawer-container {
        position: fixed !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        max-width: none !important;
        max-height: none !important;
        inset: auto !important;
        left: auto !important;
        right: auto !important;
        top: auto !important;
        bottom: auto !important;
        width: auto !important;
        height: auto !important;
        transform: translateX(100%) !important;
        transition: transform 0.3s ease !important;
      }
      
      /* Direction-specific positioning */
      dialog.drawer-container[data-direction="right"] {
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 480px !important;
        max-width: 90vw !important;
        transform: translateX(100%) !important;
      }
      
      dialog.drawer-container[data-direction="left"] {
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        width: 480px !important;
        max-width: 90vw !important;
        transform: translateX(-100%) !important;
      }
      
      dialog.drawer-container[data-direction="top"] {
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 400px !important;
        max-height: 80vh !important;
        transform: translateY(-100%) !important;
      }
      
      dialog.drawer-container[data-direction="bottom"] {
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 400px !important;
        max-height: 80vh !important;
        transform: translateY(100%) !important;
      }
      
      /* Open state */
      dialog.drawer-container[data-direction="right"][open] {
        transform: translateX(0) !important;
      }
      
      dialog.drawer-container[data-direction="left"][open] {
        transform: translateX(0) !important;
      }
      
      dialog.drawer-container[data-direction="top"][open] {
        transform: translateY(0) !important;
      }
      
      dialog.drawer-container[data-direction="bottom"][open] {
        transform: translateY(0) !important;
      }
      
      /* Closing state */
      dialog.drawer-container.drawer-closing[data-direction="right"] {
        transform: translateX(100%) !important;
      }
      
      dialog.drawer-container.drawer-closing[data-direction="left"] {
        transform: translateX(-100%) !important;
      }
      
      dialog.drawer-container.drawer-closing[data-direction="top"] {
        transform: translateY(-100%) !important;
      }
      
      dialog.drawer-container.drawer-closing[data-direction="bottom"] {
        transform: translateY(100%) !important;
      }
      
      /* Backdrop */
      dialog.drawer-container::backdrop {
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      dialog.drawer-container[open]::backdrop {
        opacity: 1;
      }
    `;
    if (!document.head.querySelector('style[data-drawer-styles]')) {
      style.setAttribute('data-drawer-styles', '');
      document.head.appendChild(style);
    }
    
    // Create close button
    const closeButton = this._createCloseButton();
    dialog.appendChild(closeButton);
    
    // Create drawer inner content
    const drawerInner = document.createElement('div');
    drawerInner.className = 'drawer-inner p-4 text-gray-800 dark:text-gray-200';
    drawerInner.id = this.dialogInnerId;
    dialog.appendChild(drawerInner);
    
    return dialog;
  }

  _getDrawerStyles() {
    const direction = this.direction;
    let position = {};
    let transform = {};
    
    switch (direction) {
      case 'right':
        position = { top: '0', right: '0', bottom: '0', width: '320px', maxWidth: '80vw' };
        transform = { 
          closed: 'translateX(100%)', 
          open: 'translateX(0)' 
        };
        break;
      case 'left':
        position = { top: '0', left: '0', bottom: '0', width: '320px', maxWidth: '80vw' };
        transform = { 
          closed: 'translateX(-100%)', 
          open: 'translateX(0)' 
        };
        break;
      case 'top':
        position = { top: '0', left: '0', right: '0', height: '320px', maxHeight: '80vh' };
        transform = { 
          closed: 'translateY(-100%)', 
          open: 'translateY(0)' 
        };
        break;
      case 'bottom':
        position = { bottom: '0', left: '0', right: '0', height: '320px', maxHeight: '80vh' };
        transform = { 
          closed: 'translateY(100%)', 
          open: 'translateY(0)' 
        };
        break;
      default:
        position = { top: '0', right: '0', bottom: '0', width: '320px', maxWidth: '80vw' };
        transform = { 
          closed: 'translateX(100%)', 
          open: 'translateX(0)' 
        };
    }
    
    return { position, transform };
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
      const { trigger, closer } = this._cachedElements;
      
      if (!trigger || !closer) {
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
        if (event.key === 'Escape' && this.isOpen()) {
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
    if (this._isDestroyed) return;
    
    try {
      const { dialog, trigger } = this._cachedElements;
      
      if (!dialog) return;
      
      // Open the dialog using native showModal
      dialog.showModal();
      
      // For drawer mode, the CSS handles the animation automatically via [open] attribute
      // Force reflow to ensure styles are applied
      if (this.mode === 'drawer') {
        dialog.offsetHeight;
      }
      
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
      
      this._dispatchEvent('dialog:opened', { url: this.url, mode: this.mode });
    } catch (error) {
      this._handleError('Failed to open dialog', error);
    }
  }

  _closeDialog() {
    if (this._isDestroyed) return;
    
    try {
      const { dialog } = this._cachedElements;
      
      if (!dialog) return;
      
      if (this.mode === 'drawer') {
        // Add closing class to trigger animation
        dialog.classList.add('drawer-closing');
        
        // Close dialog after animation completes
        setTimeout(() => {
          if (dialog) {
            dialog.classList.remove('drawer-closing');
            dialog.close();
          }
        }, 300); // Match transition duration
      } else {
        // Close dialog immediately for traditional mode
        dialog.close();
      }
      
      this._dispatchEvent('dialog:closed', { mode: this.mode });
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

  // New getters and setters for drawer functionality
  get mode() {
    const mode = this._getAttributeWithDefault('mode', 'dialog');
    const validModes = ['dialog', 'drawer'];
    return validModes.includes(mode) ? mode : 'dialog';
  }

  set mode(value) {
    const validModes = ['dialog', 'drawer'];
    if (validModes.includes(value)) {
      this._setAttribute('mode', value);
    } else {
      this._handleError(`Invalid mode: ${value}. Valid modes: ${validModes.join(', ')}`);
    }
  }

  get direction() {
    const direction = this._getAttributeWithDefault('direction', 'right');
    const validDirections = ['left', 'right', 'top', 'bottom'];
    return validDirections.includes(direction) ? direction : 'right';
  }

  set direction(value) {
    const validDirections = ['left', 'right', 'top', 'bottom'];
    if (validDirections.includes(value)) {
      this._setAttribute('direction', value);
    } else {
      this._handleError(`Invalid direction: ${value}. Valid directions: ${validDirections.join(', ')}`);
    }
  }

  get drawerClass() {
    return this._escapeHtml(this._getAttributeWithDefault('drawer-class', 'p-6'));
  }

  set drawerClass(value) {
    this._setAttribute('drawer-class', value);
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

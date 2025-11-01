/**
 * DRY2 Dialog Component
 * A customizable dialog/drawer component with HTMX integration
 * Supports both modal dialogs and slide-out drawers
 * Built with vanilla JavaScript using BaseElement
 */

class DryDialog extends BaseElement {
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
    return ['url', 'mode', 'direction', 'button-class', 'dialog-class', 'drawer-class'];
  }

  constructor() {
    super();
    this._triggerButton = null;
    this._dialogElement = null;
    this._backdrop = null;
    this._contentContainer = null;
    this._closeButton = null;
    this._originalContent = null;
    this._isOpen = false;
    this._contentObserver = null;
    this._isCapturingContent = false;
    this._wasMobile = null;
    this._resizeHandler = null;
  }

  /**
   * Override connectedCallback to capture button text content
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Try to capture content immediately
      const immediateContent = this.textContent.trim();

      if (immediateContent && !this._isCapturingContent) {
        this._originalContent = immediateContent;
        super.connectedCallback();
      } else if (!this._isCapturingContent) {
        this._isCapturingContent = true;

        // Set up MutationObserver to watch for child nodes being added
        this._contentObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              const textContent = this.textContent.trim();
              if (textContent && this._originalContent === null) {
                this._originalContent = textContent;
                this._contentObserver.disconnect();
                this._contentObserver = null;
                super.connectedCallback();
                break;
              }
            }
          }
        });

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
              this._originalContent = this.textContent.trim() || 'Open';
            }

            super.connectedCallback();
          }
        }, 100);
      }
    } else {
      super.connectedCallback();
    }
  }

  /**
   * Override disconnectedCallback to clean up observer and resize handler
   */
  disconnectedCallback() {
    if (this._contentObserver) {
      this._contentObserver.disconnect();
      this._contentObserver = null;
    }

    // Remove resize handler
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }

    // Close dialog if open
    if (this._isOpen) {
      this._closeDialog();
    }

    super.disconnectedCallback();
  }

  /**
   * Detect if device is mobile
   */
  _isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  /**
   * Set up resize handler to detect viewport changes
   */
  _setupResizeHandler() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }

    this._resizeHandler = () => {
      const isMobile = this._isMobile();
      
      // Check if mobile state has changed
      if (this._wasMobile !== null && this._wasMobile !== isMobile) {
        // Close any open dialog/drawer before re-rendering
        if (this._isOpen) {
          this._closeDialog();
        }
        
        // Re-render to switch between dialog and drawer
        this.reRender();
      }
      
      this._wasMobile = isMobile;
    };

    window.addEventListener('resize', this._resizeHandler);
  }

  /**
   * Main render method
   */
  render() {
    const requestedMode = this.getAttr('mode', 'dialog');
    // Force dialog mode on mobile devices
    const isMobile = this._isMobile();
    const mode = isMobile ? 'dialog' : requestedMode;
    
    // Store current mobile state
    this._wasMobile = isMobile;
    
    // Set up resize handler if not already done
    if (!this._resizeHandler) {
      this._setupResizeHandler();
    }
    
    const url = this.getAttr('url', '');
    const buttonClass = this.getAttr('button-class', 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded');
    const triggerId = this.getAttr('trigger-id', `trigger-${this._generateId()}`);
    const dialogInnerId = this.getAttr('dialog-inner-id', `dialog-inner-${this._generateId()}`);

    // Ensure we have content
    if (this._originalContent === null) {
      this._originalContent = 'Open';
    }

    // Clear existing content
    if (typeof this.replaceChildren === 'function') {
      this.replaceChildren();
    } else {
      this.textContent = '';
    }

    // Create trigger link (as anchor tag)
    const link = document.createElement('a');
    link.id = triggerId;
    link.className = buttonClass;
    link.textContent = this._originalContent;
    link.href = '#';
    link.setAttribute('role', 'button');
    this.appendChild(link);
    this._triggerButton = link;

    // Create dialog or drawer based on mode (forced to dialog on mobile)
    if (mode === 'drawer') {
      this._renderDrawer(dialogInnerId);
    } else {
      this._renderDialog(dialogInnerId);
    }

    // Set up HTMX if URL is provided
    if (url && typeof htmx !== 'undefined') {
      this._setupHtmx(triggerId, dialogInnerId, url);
    }
  }

  /**
   * Render a modal dialog
   */
  _renderDialog(dialogInnerId) {
    const dialogClass = this.getAttr('dialog-class', 'bg-white rounded-lg shadow-xl max-w-lg w-full p-6');

    const dialog = document.createElement('dialog');
    dialog.className = 'backdrop:bg-black backdrop:opacity-50';
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('role', 'dialog');

    const dialogInner = document.createElement('div');
    dialogInner.className = dialogClass + ' relative';
    dialogInner.id = dialogInnerId;

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10';
    closeButton.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;
    closeButton.setAttribute('aria-label', 'Close dialog');
    this._closeButton = closeButton;

    dialogInner.appendChild(closeButton);
    dialog.appendChild(dialogInner);
    this.appendChild(dialog);

    this._dialogElement = dialog;
    this._contentContainer = dialogInner;
  }

  /**
   * Render a drawer
   */
  _renderDrawer(dialogInnerId) {
    const direction = this.getAttr('direction', 'right');
    
    // Check if dialog-class is provided (overrides drawer-class)
    const customDialogClass = this.getAttribute('dialog-class');
    let drawerClass;
    
    if (customDialogClass) {
      // Use dialog-class if provided (for full customization)
      drawerClass = customDialogClass;
    } else {
      // Use drawer-class or default
      const baseDrawerClass = this.getAttr('drawer-class', 'p-6 bg-white shadow-xl');
      drawerClass = this._getDrawerClasses(direction, baseDrawerClass);
    }
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 hidden transition-opacity duration-300';
    backdrop.setAttribute('data-backdrop', 'true');
    this._backdrop = backdrop;

    // Create drawer container
    const drawer = document.createElement('div');
    drawer.className = drawerClass;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.id = dialogInnerId;

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10';
    closeButton.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;
    closeButton.setAttribute('aria-label', 'Close drawer');
    this._closeButton = closeButton;

    drawer.appendChild(closeButton);

    this.appendChild(backdrop);
    this.appendChild(drawer);

    this._dialogElement = drawer;
    this._contentContainer = drawer;
  }

  /**
   * Check if custom classes contain width/height specifications
   */
  _hasCustomDimension(customClasses) {
    // Check for width classes: w-, w-[, w-1/, w-2/, etc.
    // Check for height classes: h-, h-[, h-1/, h-2/, etc.
    const dimensionPattern = /\b(w-|h-|w-\[|h-\[)/;
    return dimensionPattern.test(customClasses);
  }

  /**
   * Get drawer-specific classes based on direction
   */
  _getDrawerClasses(direction, customClasses) {
    const baseClasses = 'fixed overflow-y-auto transition-transform duration-300 ease-in-out z-50';
    
    // Check if custom classes already include width/height
    const hasCustomDimension = this._hasCustomDimension(customClasses);
    
    let positionClasses = '';
    let transformClass = '';
    let defaultDimension = '';

    switch (direction) {
      case 'left':
        positionClasses = 'left-0 top-0 bottom-0';
        defaultDimension = hasCustomDimension ? '' : 'w-80 max-w-full';
        transformClass = '-translate-x-full';
        break;
      case 'right':
        positionClasses = 'right-0 top-0 bottom-0';
        defaultDimension = hasCustomDimension ? '' : 'w-80 max-w-full';
        transformClass = 'translate-x-full';
        break;
      case 'top':
        positionClasses = 'top-0 left-0 right-0';
        defaultDimension = hasCustomDimension ? '' : 'h-80 max-h-full';
        transformClass = '-translate-y-full';
        break;
      case 'bottom':
        positionClasses = 'bottom-0 left-0 right-0';
        defaultDimension = hasCustomDimension ? '' : 'h-80 max-h-full';
        transformClass = 'translate-y-full';
        break;
      default:
        positionClasses = 'right-0 top-0 bottom-0';
        defaultDimension = hasCustomDimension ? '' : 'w-80 max-w-full';
        transformClass = 'translate-x-full';
    }

    return `${baseClasses} ${positionClasses} ${defaultDimension} ${transformClass} ${customClasses}`.trim();
  }

  /**
   * Set up HTMX integration
   */
  _setupHtmx(triggerId, dialogInnerId, url) {
    const triggerType = this.getAttr('trigger-type', 'click');
    
    if (this._triggerButton && this._contentContainer) {
      this._triggerButton.setAttribute('hx-get', url);
      this._triggerButton.setAttribute('hx-target', `#${dialogInnerId}`);
      this._triggerButton.setAttribute('hx-trigger', triggerType);
      this._triggerButton.setAttribute('hx-swap', 'innerHTML');
      
      // Process with htmx
      if (typeof htmx !== 'undefined' && typeof htmx.process === 'function') {
        htmx.process(this._triggerButton);
      }
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Trigger button click handler - DON'T open dialog here if HTMX is configured
    // HTMX will handle the click and we'll open after content loads
    const url = this.getAttr('url', '');
    if (this._triggerButton && !url) {
      // No URL means no HTMX, open dialog on click
      const handleTriggerClick = (e) => {
        e.preventDefault();
        this._openDialog();
      };
      this.addTrackedListener(this._triggerButton, 'click', handleTriggerClick);
    }
    
    // Prevent default anchor behavior even when HTMX is handling the click
    if (this._triggerButton) {
      const preventDefaultHandler = (e) => {
        e.preventDefault();
      };
      this.addTrackedListener(this._triggerButton, 'click', preventDefaultHandler);
    }

    // Close button click handler
    if (this._closeButton) {
      const handleCloseClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._closeDialog();
      };
      this.addTrackedListener(this._closeButton, 'click', handleCloseClick);
    }

    // Backdrop click handler (for drawers)
    if (this._backdrop) {
      const handleBackdropClick = () => {
        this._closeDialog();
      };
      this.addTrackedListener(this._backdrop, 'click', handleBackdropClick);
    }

    // Dialog backdrop click handler (for modal dialogs)
    if (this._dialogElement && this._dialogElement.tagName === 'DIALOG') {
      const handleDialogClick = (e) => {
        const rect = this._dialogElement.getBoundingClientRect();
        const isInDialog = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
        if (!isInDialog) {
          this._closeDialog();
        }
      };
      this.addTrackedListener(this._dialogElement, 'click', handleDialogClick);
    }

    // ESC key handler
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        this._closeDialog();
      }
    };
    this.addTrackedListener(document, 'keydown', handleEscKey);

    // HTMX events - Open dialog AFTER content is loaded
    const handleHtmxAfterSwap = (e) => {
      if (e.detail.target === this._contentContainer) {
        // Content loaded successfully, now open the dialog
        this._openDialog();
      }
    };
    this.addTrackedListener(document.body, 'htmx:afterSwap', handleHtmxAfterSwap);

    // HTMX after request - check for close header
    const handleHtmxAfterOnLoad = (e) => {
      if (e.detail.target === this._contentContainer) {
        const xhr = e.detail.xhr;
        if (xhr && xhr.getResponseHeader('HX-CloseDialog') === 'close') {
          this._closeDialog();
        }
      }
    };
    this.addTrackedListener(document.body, 'htmx:afterOnLoad', handleHtmxAfterOnLoad);
  }

  /**
   * Open the dialog/drawer
   */
  _openDialog() {
    if (this._isOpen) return;

    const requestedMode = this.getAttr('mode', 'dialog');
    // Force dialog mode on mobile devices
    const mode = this._isMobile() ? 'dialog' : requestedMode;

    if (mode === 'drawer') {
      // Show backdrop
      if (this._backdrop) {
        this._backdrop.classList.remove('hidden');
        // Force reflow for animation
        void this._backdrop.offsetHeight;
        this._backdrop.classList.remove('opacity-0');
        this._backdrop.classList.add('opacity-100');
      }

      // Slide in drawer - remove translate classes to bring into view
      if (this._dialogElement) {
        // Add a small delay to ensure the drawer is rendered before animating
        requestAnimationFrame(() => {
          this._dialogElement.classList.remove(
            'translate-x-full',
            '-translate-x-full',
            'translate-y-full',
            '-translate-y-full'
          );
        });
      }
    } else {
      // Show modal dialog
      if (this._dialogElement && this._dialogElement.tagName === 'DIALOG') {
        this._dialogElement.showModal();
      }
    }

    this._isOpen = true;
    this.emit('dialog:opened', {
      mode,
      url: this.getAttr('url', '')
    });
  }

  /**
   * Close the dialog/drawer
   */
  _closeDialog() {
    if (!this._isOpen) return;

    const requestedMode = this.getAttr('mode', 'dialog');
    // Force dialog mode on mobile devices
    const mode = this._isMobile() ? 'dialog' : requestedMode;

    if (mode === 'drawer') {
      // Slide out drawer
      if (this._dialogElement) {
        const direction = this.getAttr('direction', 'right');
        switch (direction) {
          case 'left':
            this._dialogElement.classList.add('-translate-x-full');
            break;
          case 'right':
            this._dialogElement.classList.add('translate-x-full');
            break;
          case 'top':
            this._dialogElement.classList.add('-translate-y-full');
            break;
          case 'bottom':
            this._dialogElement.classList.add('translate-y-full');
            break;
        }
      }

      // Hide backdrop
      if (this._backdrop) {
        this._backdrop.classList.remove('opacity-100');
        setTimeout(() => {
          if (this._backdrop) {
            this._backdrop.classList.add('hidden');
          }
        }, 300);
      }
    } else {
      // Close modal dialog
      if (this._dialogElement && this._dialogElement.tagName === 'DIALOG') {
        this._dialogElement.close();
      }
    }

    this._isOpen = false;
    this.emit('dialog:closed', { mode });
  }

  /**
   * Generate a unique ID
   */
  _generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    if (this._rendered) {
      this.reRender();
    }
  }

  /**
   * Public API: Open the dialog/drawer
   */
  open() {
    this._openDialog();
  }

  /**
   * Public API: Close the dialog/drawer
   */
  close() {
    this._closeDialog();
  }

  /**
   * Public API: Check if dialog/drawer is open
   */
  isOpen() {
    return this._isOpen;
  }

  /**
   * Public API: Set content directly
   */
  setContent(content) {
    if (this._contentContainer) {
      this._contentContainer.innerHTML = DryDialog._escapeHtml(content);
    }
  }

  /**
   * Get/Set url property
   */
  get url() {
    return this.getAttr('url', '');
  }

  set url(value) {
    if (value) {
      this.setAttribute('url', value);
    } else {
      this.removeAttribute('url');
    }
  }

  /**
   * Get/Set mode property
   */
  get mode() {
    return this.getAttr('mode', 'dialog');
  }

  set mode(value) {
    this.setAttribute('mode', value);
  }

  /**
   * Get/Set direction property
   */
  get direction() {
    return this.getAttr('direction', 'right');
  }

  set direction(value) {
    this.setAttribute('direction', value);
  }
}

// Register the custom element
customElements.define('dry-dialog', DryDialog);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryDialog;
}

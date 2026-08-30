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
    return ['url', 'mode', 'direction', 'button-class', 'dialog-class', 'drawer-class', 'no-mobile-fallback'];
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
    const noMobileFallback = this.hasAttribute('no-mobile-fallback');
    // Force dialog mode on mobile devices (unless opted out)
    const isMobile = !noMobileFallback && this._isMobile();
    const mode = isMobile ? 'dialog' : requestedMode;
    
    // Store current mobile state
    this._wasMobile = isMobile;
    
    // Set up resize handler if not already done (skip when mobile fallback is disabled)
    if (!this._resizeHandler && !noMobileFallback) {
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
   * Inject shared styles for dialog/drawer once per page load
   */
  static _ensureStyles() {
    if (document.getElementById('dry-dialog-styles')) return;
    const style = document.createElement('style');
    style.id = 'dry-dialog-styles';
    style.textContent = `
      dialog.dry-dialog-native {
        border: none;
        padding: 0;
        background: transparent;
        max-width: none;
        margin: auto;
      }
      dialog.dry-dialog-native::backdrop {
        background: rgba(0, 0, 0, 0.48);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }
      @keyframes dry-dialog-in {
        from { opacity: 0; transform: scale(0.96) translateY(-8px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      dialog.dry-dialog-native[open] > * {
        animation: dry-dialog-in 0.2s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
      }
      .dry-dialog-default-panel {
        background: var(--stem-color-bg-surface, #ffffff);
        border-radius: 0.875rem;
        box-shadow: 0 24px 64px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10);
        max-width: 32rem;
        width: calc(100vw - 2rem);
        padding: 1.5rem;
        border: 1px solid var(--stem-color-border-light, rgba(0,0,0,0.08));
      }
      .dry-dialog-close-btn {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.375rem;
        border-radius: 0.375rem;
        color: var(--stem-color-text-muted, #9ca3af);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        line-height: 1;
        transition: background-color 0.15s, color 0.15s;
      }
      .dry-dialog-close-btn:hover {
        background-color: var(--stem-color-bg-secondary, rgba(0,0,0,0.07));
        color: var(--stem-color-text-base, #111827);
      }
      .dry-dialog-close-btn:focus-visible {
        outline: 2px solid var(--stem-color-primary, #6366f1);
        outline-offset: 2px;
      }
      [role="dialog"].dry-drawer-x {
        width: 100%;
      }
      [role="dialog"].dry-drawer-y {
        height: 100%;
      }
      @media (min-width: 1024px) {
        [role="dialog"].dry-drawer-x {
          width: 50%;
          max-width: 100%;
        }
        [role="dialog"].dry-drawer-y {
          height: 50%;
          max-height: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Render a modal dialog
   */
  _renderDialog(dialogInnerId) {
    const dialogClass = this.getAttr('dialog-class', '');

    DryDialog._ensureStyles();

    const dialog = document.createElement('dialog');
    dialog.className = 'dry-dialog-native';
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('role', 'dialog');

    // Outer panel — has dialog-class applied; close button lives here
    // so it persists through HTMX innerHTML swaps on the inner content area
    const panel = document.createElement('div');
    panel.className = dialogClass || 'dry-dialog-default-panel';
    panel.style.position = 'relative';

    // Close button — uses injected CSS, no Tailwind dependency
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'dry-dialog-close-btn';
    closeButton.setAttribute('aria-label', 'Close dialog');
    closeButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="4" x2="4" y2="12"/><line x1="4" y1="4" x2="12" y2="12"/></svg>`;
    this._closeButton = closeButton;

    // Content area — this is the HTMX target; close button is a sibling so it
    // is never removed when HTMX replaces innerHTML here
    const contentArea = document.createElement('div');
    contentArea.id = dialogInnerId;

    panel.appendChild(closeButton);
    panel.appendChild(contentArea);
    dialog.appendChild(panel);
    this.appendChild(dialog);

    this._dialogElement = dialog;
    this._contentContainer = contentArea;
  }

  /**
   * Render a drawer
   */
  _renderDrawer(dialogInnerId) {
    const direction = this.getAttr('direction', 'right');

    DryDialog._ensureStyles();

    // Check if dialog-class is provided (overrides drawer-class)
    const customDialogClass = this.getAttribute('dialog-class');
    let drawerClass;
    
    if (customDialogClass) {
      drawerClass = customDialogClass;
    } else {
      const baseDrawerClass = this.getAttr('drawer-class', '');
      const defaultBase = baseDrawerClass || 'p-6 bg-white shadow-xl';
      drawerClass = this._getDrawerClasses(direction, defaultBase);
    }
    
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.setAttribute('data-backdrop', 'true');
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.48);z-index:40;display:none;transition:opacity 0.3s;';
    this._backdrop = backdrop;

    // Drawer container — position: fixed (from drawerClass) creates a containing
    // block for the absolutely-positioned close button; do NOT set position: relative here
    const drawer = document.createElement('div');
    drawer.className = drawerClass;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    // Keep the closed drawer out of layout. A fixed, full-width panel translated
    // off-screen (translate-*-full) would otherwise extend the scrollable area and
    // cause horizontal scrolling on mobile. It is revealed in _openDialog().
    drawer.style.display = 'none';

    // Close button — uses injected CSS class, no Tailwind dependency
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'dry-dialog-close-btn';
    closeButton.setAttribute('aria-label', 'Close drawer');
    closeButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="4" x2="4" y2="12"/><line x1="4" y1="4" x2="12" y2="12"/></svg>`;
    this._closeButton = closeButton;

    // Content area — HTMX target; close button is a sibling so it persists
    const contentArea = document.createElement('div');
    contentArea.id = dialogInnerId;

    drawer.appendChild(closeButton);
    drawer.appendChild(contentArea);

    this.appendChild(backdrop);
    this.appendChild(drawer);

    this._dialogElement = drawer;
    this._contentContainer = contentArea;
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
    // Axis marker class so the component can own responsive width/height
    // (full-screen on mobile, partial panel on desktop) regardless of the
    // width/height classes passed via drawer-class.
    let axisClass = '';

    switch (direction) {
      case 'left':
        positionClasses = 'left-0 top-0 bottom-0';
        defaultDimension = hasCustomDimension ? '' : 'w-80 max-w-full';
        transformClass = '-translate-x-full';
        axisClass = 'dry-drawer-x';
        break;
      case 'right':
        positionClasses = 'right-0 top-0 bottom-0';
        defaultDimension = hasCustomDimension ? '' : 'w-80 max-w-full';
        transformClass = 'translate-x-full';
        axisClass = 'dry-drawer-x';
        break;
      case 'top':
        positionClasses = 'top-0 left-0 right-0';
        defaultDimension = hasCustomDimension ? '' : 'h-80 max-h-full';
        transformClass = '-translate-y-full';
        axisClass = 'dry-drawer-y';
        break;
      case 'bottom':
        positionClasses = 'bottom-0 left-0 right-0';
        defaultDimension = hasCustomDimension ? '' : 'h-80 max-h-full';
        transformClass = 'translate-y-full';
        axisClass = 'dry-drawer-y';
        break;
      default:
        positionClasses = 'right-0 top-0 bottom-0';
        defaultDimension = hasCustomDimension ? '' : 'w-80 max-w-full';
        transformClass = 'translate-x-full';
        axisClass = 'dry-drawer-x';
    }

    return `${baseClasses} ${positionClasses} ${defaultDimension} ${transformClass} ${axisClass} ${customClasses}`.trim();
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
    const noMobileFallback = this.hasAttribute('no-mobile-fallback');
    const mode = (!noMobileFallback && this._isMobile()) ? 'dialog' : requestedMode;

    if (mode === 'drawer') {
      // Show backdrop
      if (this._backdrop) {
        this._backdrop.style.display = 'block';
        this._backdrop.style.opacity = '0';
        void this._backdrop.offsetHeight; // force reflow for transition
        this._backdrop.style.opacity = '1';
      }

      // Slide in drawer - reveal it (was display:none while closed), commit the
      // off-screen translated position via a reflow, then remove translate classes
      // on the next frame so the transition runs.
      if (this._dialogElement) {
        this._dialogElement.style.display = '';
        void this._dialogElement.offsetHeight; // force reflow at translated position
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
    const noMobileFallback = this.hasAttribute('no-mobile-fallback');
    const mode = (!noMobileFallback && this._isMobile()) ? 'dialog' : requestedMode;

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

        // After the slide-out transition, remove the panel from layout so the
        // off-screen drawer can't extend the page width / cause horizontal scroll.
        const drawerToHide = this._dialogElement;
        setTimeout(() => {
          if (drawerToHide && !this._isOpen) drawerToHide.style.display = 'none';
        }, 300);
      }

      // Hide backdrop
      if (this._backdrop) {
        this._backdrop.style.opacity = '0';
        setTimeout(() => {
          if (this._backdrop) this._backdrop.style.display = 'none';
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

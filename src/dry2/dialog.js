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

  static get observedAttributes() {
    return ['url', 'mode', 'direction', 'dialog-class', 'button-class'];
  }

  constructor() {
    super();
    this._originalContent = null;
    this._contentObserver = null;
    this._isCapturingContent = false;
  }

  /**
   * Override connectedCallback to capture content using MutationObserver
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Try to capture content immediately (for dynamically created elements)
      const immediateContent = this.textContent.trim();

      if (immediateContent && !this._isCapturingContent) {
        // Content already exists, render immediately
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
              if (textContent && this._originalContent === null) {
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
              this._originalContent = this.textContent.trim() || 'Open Dialog';
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

  render() {
    // Ensure we have content
    if (this._originalContent === null) {
      this._originalContent = 'Open Dialog';
    }

    const isDrawer = this.mode === 'drawer';

    // Get dialog/drawer classes
    const containerClass = isDrawer ? this.getDrawerClasses() : this.dialogClass;

    this.innerHTML = `
            <div class="relative">
                <a id="${DryDialog._escapeHtml(this.triggerId)}" 
                   class="${DryDialog._escapeHtml(this.buttonClass)}" 
                   href="${DryDialog._escapeHtml(this.url)}" 
                   hx-get="${DryDialog._escapeHtml(this.url)}" 
                   hx-trigger="${DryDialog._escapeHtml(this.triggerType)}" 
                   hx-target="#${DryDialog._escapeHtml(this.dialogInnerId)}">
                    ${DryDialog._escapeHtml(this._originalContent)}
                </a>
                
                ${isDrawer ? this.renderDrawer(containerClass) : this.renderDialog(containerClass)}
            </div>
        `;
  }

  renderDialog(containerClass) {
    return `
            <dialog class="${DryDialog._escapeHtml(containerClass)}" data-dialog-type="dialog">
                ${this.renderCloseButton()}
                <div class="dialog-inner" id="${DryDialog._escapeHtml(this.dialogInnerId)}"></div>
            </dialog>
        `;
  }

  renderDrawer(containerClass) {
    return `
            <div class="drawer-backdrop ${DryDialog._escapeHtml(this.backdropClass)}" data-dialog-type="drawer" style="display: none;">
                <div class="${DryDialog._escapeHtml(containerClass)}" data-drawer-panel>
                    ${this.renderCloseButton()}
                    <div class="dialog-inner" id="${DryDialog._escapeHtml(this.dialogInnerId)}"></div>
                </div>
            </div>
        `;
  }

  renderCloseButton() {
    return `
            <button 
                id="closer" 
                type="button"
                class="${DryDialog._escapeHtml(this.closerClass)}"
                aria-label="Close dialog">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
  }

  getDrawerClasses() {
    // If user provided custom classes, use those
    if (this.hasAttribute('dialog-class')) {
      return this.getAttr('dialog-class');
    }

    // Default drawer classes based on direction
    const baseClasses = 'bg-white shadow-2xl fixed overflow-y-auto transition-transform duration-300 ease-in-out z-50';

    const directionClasses = {
      'left': 'left-0 top-0 bottom-0 w-80 max-w-full -translate-x-full',
      'right': 'right-0 top-0 bottom-0 w-80 max-w-full translate-x-full',
      'top': 'top-0 left-0 right-0 h-80 max-h-full -translate-y-full',
      'bottom': 'bottom-0 left-0 right-0 h-80 max-h-full translate-y-full'
    };

    return `${baseClasses} ${directionClasses[this.direction] || directionClasses['right']}`;
  }

  attachEventListeners() {
    const container = this.$('[data-dialog-type]');
    const trigger = this.$('a');
    const closer = this.$('#closer');
    const isDrawer = this.mode === 'drawer';

    if (isDrawer) {
      const backdrop = container;
      const panel = this.$('[data-drawer-panel]');

      this.addTrackedListener(trigger, 'click', (e) => {
        e.preventDefault();
        this.openDrawer(backdrop, panel);
      });

      this.addTrackedListener(closer, 'click', () => {
        this.closeDrawer(backdrop, panel);
      });

      this.addTrackedListener(backdrop, 'click', (e) => {
        if (e.target === backdrop) {
          this.closeDrawer(backdrop, panel);
        }
      });

      // ESC key support
      this._escHandler = (e) => {
        if (e.key === 'Escape' && backdrop.style.display !== 'none') {
          this.closeDrawer(backdrop, panel);
        }
      };
      this.addTrackedListener(document, 'keydown', this._escHandler);

      // HTMX events
      this._htmxHandler = (event) => {
        const { finalRequestPath, responsePath } = event.detail.pathInfo;
        if (finalRequestPath !== responsePath ||
            event.detail.xhr.getResponseHeader('HX-CloseDialog') === 'close') {
          this.closeDrawer(backdrop, panel);
        }
      };
      this.addTrackedListener(document.body, 'htmx:afterOnLoad', this._htmxHandler);

    } else {
      const dialog = container;

      this.addTrackedListener(trigger, 'click', (e) => {
        e.preventDefault();
        if (dialog.open) {
          dialog.close();
        } else {
          dialog.showModal();
          // Emit custom event
          this.emit('dialog:opened', { mode: 'dialog' });
        }
      });

      this.addTrackedListener(closer, 'click', () => {
        dialog.close();
        // Emit custom event
        this.emit('dialog:closed', { mode: 'dialog' });
      });

      this._htmxHandler = (event) => {
        const { finalRequestPath, responsePath } = event.detail.pathInfo;
        if (finalRequestPath !== responsePath ||
            event.detail.xhr.getResponseHeader('HX-CloseDialog') === 'close') {
          dialog.close();
          // Emit custom event
          this.emit('dialog:closed', { mode: 'dialog' });
        }
      };
      this.addTrackedListener(document.body, 'htmx:afterOnLoad', this._htmxHandler);
    }
  }

  openDrawer(backdrop, panel) {
    backdrop.style.display = 'flex';
    // Force reflow for transition
    backdrop.offsetHeight;

    backdrop.classList.add('backdrop-active');
    panel.classList.add('drawer-open');

    // Remove transform classes based on direction
    setTimeout(() => {
      panel.classList.remove('-translate-x-full', 'translate-x-full',
          '-translate-y-full', 'translate-y-full');
    }, 10);

    // Emit custom event
    this.emit('dialog:opened', { mode: 'drawer', direction: this.direction });
  }

  closeDrawer(backdrop, panel) {
    // Add transform classes back based on direction
    const directionTransforms = {
      'left': '-translate-x-full',
      'right': 'translate-x-full',
      'top': '-translate-y-full',
      'bottom': 'translate-y-full'
    };

    panel.classList.add(directionTransforms[this.direction] || 'translate-x-full');
    backdrop.classList.remove('backdrop-active');

    setTimeout(() => {
      backdrop.style.display = 'none';
      panel.classList.remove('drawer-open');

      // Emit custom event
      this.emit('dialog:closed', { mode: 'drawer', direction: this.direction });
    }, 300); // Match transition duration
  }

  onAttributeChange(name, oldValue, newValue) {
    // Re-render if key attributes change
    if (['mode', 'direction', 'dialog-class', 'button-class'].includes(name)) {
      this.reRender();
    }
    // Update URL without re-rendering
    if (name === 'url') {
      const trigger = this.$('a');
      if (trigger) {
        trigger.href = newValue;
        trigger.setAttribute('hx-get', newValue);
      }
    }
  }

  cleanup() {
    // Additional cleanup for drawer-specific handlers
    if (this._escHandler) {
      this._escHandler = null;
    }
    if (this._htmxHandler) {
      this._htmxHandler = null;
    }
  }

  // Getters with defaults
  get url() {
    return this.getAttr('url', '');
  }

  get mode() {
    return this.getAttr('mode', 'dialog');
  }

  get direction() {
    return this.getAttr('direction', 'right');
  }

  get buttonClass() {
    return this.getAttr('button-class',
        'inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200');
  }

  get dialogClass() {
    return this.getAttr('dialog-class',
        'bg-white rounded-lg shadow-xl max-w-lg w-full p-6 backdrop:bg-black backdrop:bg-opacity-50');
  }

  get backdropClass() {
    return this.getAttr('backdrop-class',
        'fixed inset-0 bg-black bg-opacity-50 z-40 items-center justify-center');
  }

  get closerClass() {
    return this.getAttr('closer-class',
        'cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-lg hover:bg-gray-100');
  }

  get dialogInnerId() {
    return this.getAttr('dialog-inner-id', 'dialog-inner');
  }

  get triggerId() {
    return this.getAttr('trigger-id', 'trigger');
  }

  get triggerType() {
    return this.getAttr('trigger-type', 'click');
  }

  // Public API methods
  open() {
    const isDrawer = this.mode === 'drawer';
    if (isDrawer) {
      const backdrop = this.$('[data-dialog-type]');
      const panel = this.$('[data-drawer-panel]');
      if (backdrop && panel) {
        this.openDrawer(backdrop, panel);
      }
    } else {
      const dialog = this.$('dialog');
      if (dialog && !dialog.open) {
        dialog.showModal();
        // Emit custom event
        this.emit('dialog:opened', { mode: 'dialog' });
      }
    }
  }

  close() {
    const isDrawer = this.mode === 'drawer';
    if (isDrawer) {
      const backdrop = this.$('[data-dialog-type]');
      const panel = this.$('[data-drawer-panel]');
      if (backdrop && panel) {
        this.closeDrawer(backdrop, panel);
      }
    } else {
      const dialog = this.$('dialog');
      if (dialog && dialog.open) {
        dialog.close();
        // Emit custom event
        this.emit('dialog:closed', { mode: 'dialog' });
      }
    }
  }

  toggle() {
    const isDrawer = this.mode === 'drawer';
    if (isDrawer) {
      const backdrop = this.$('[data-dialog-type]');
      if (backdrop.style.display === 'none') {
        this.open();
      } else {
        this.close();
      }
    } else {
      const dialog = this.$('dialog');
      dialog?.open ? dialog.close() : dialog.showModal();
    }
  }

  /**
   * Public API: Set button text
   */
  setText(text) {
    this._originalContent = text;
    if (this.hasAttribute('data-rendered')) {
      this.reRender();
    }
  }
}

customElements.define('dry-dialog', DryDialog);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryDialog;
}
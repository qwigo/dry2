class DryDialog extends BaseElement {
  static get observedAttributes() {
    return ['url', 'mode', 'direction', 'dialog-class', 'button-class'];
  }

  render() {
    const originalChildren = this.getOriginalContent();
    const isDrawer = this.mode === 'drawer';

    // Get dialog/drawer classes
    const containerClass = isDrawer ? this.getDrawerClasses() : this.dialogClass;

    this.innerHTML = `
            <div class="relative">
                <a id="${this.triggerId}" 
                   class="${this.buttonClass}" 
                   href="${this.url}" 
                   hx-get="${this.url}" 
                   hx-trigger="${this.triggerType}" 
                   hx-target="#${this.dialogInnerId}">
                    ${originalChildren}
                </a>
                
                ${isDrawer ? this.renderDrawer(containerClass) : this.renderDialog(containerClass)}
            </div>
        `;
  }

  renderDialog(containerClass) {
    return `
            <dialog class="${containerClass}" data-dialog-type="dialog">
                ${this.renderCloseButton()}
                <div class="dialog-inner" id="${this.dialogInnerId}"></div>
            </dialog>
        `;
  }

  renderDrawer(containerClass) {
    return `
            <div class="drawer-backdrop ${this.backdropClass}" data-dialog-type="drawer" style="display: none;">
                <div class="${containerClass}" data-drawer-panel>
                    ${this.renderCloseButton()}
                    <div class="dialog-inner" id="${this.dialogInnerId}"></div>
                </div>
            </div>
        `;
  }

  renderCloseButton() {
    return `
            <button 
                id="closer" 
                type="button"
                class="${this.closerClass}"
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

      this.addTrackedListener(trigger, 'click', () => {
        dialog.open ? dialog.close() : dialog.showModal();
      });

      this.addTrackedListener(closer, 'click', () => {
        dialog.close();
      });

      this._htmxHandler = (event) => {
        const { finalRequestPath, responsePath } = event.detail.pathInfo;
        if (finalRequestPath !== responsePath ||
            event.detail.xhr.getResponseHeader('HX-CloseDialog') === 'close') {
          dialog.close();
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
      this.openDrawer(backdrop, panel);
    } else {
      const dialog = this.$('dialog');
      dialog?.showModal();
    }
  }

  close() {
    const isDrawer = this.mode === 'drawer';
    if (isDrawer) {
      const backdrop = this.$('[data-dialog-type]');
      const panel = this.$('[data-drawer-panel]');
      this.closeDrawer(backdrop, panel);
    } else {
      const dialog = this.$('dialog');
      dialog?.close();
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
}

customElements.define('dry-dialog', DryDialog);
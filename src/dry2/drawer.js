// drawer-components.js

class DryDrawer extends BaseElement {
  // Web component for creating a basic drawer interface
  constructor() {
    super();
    this._isOpen = false;
  }

  _initializeComponent() {
    if (!this.hasAttribute('data-rendered')) {
      this.render();
      this.attachEventListeners();
      this.setAttribute('data-rendered', '');
    } else {
      this.attachEventListeners();
    }
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  render() {
    const headerSlotEl = this.querySelector('[slot="header"]');
    const contentSlot = this.querySelector('[slot="content"]')?.outerHTML || '<slot name="content"></slot>';

    this.innerHTML = `
        <div class="drawer-container">
            <button type="button" class="trigger-button ${this.buttonClass}">
                ${this._escapeHtml(this.triggerContent)}
            </button>
            <div class="drawer-wrapper fixed inset-0 z-50 pointer-events-none">
                <div class="drawer-backdrop fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out opacity-0 pointer-events-none ${this.backdropClass}"></div>
                <div class="drawer fixed ${this.position === 'left' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 h-full transition-transform duration-300 ease-in-out pointer-events-auto shadow-xl ${this.drawerClass}">
                    <div class="drawer-header flex items-center justify-between p-4 border-b ${this.headerClass}">
                        <div class="drawer-title"></div>
                        <svg viewBox="0 0 24 24" class="drawer-close cursor-pointer h-6 w-6 text-gray-500 hover:text-gray-700">
                            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                        </svg>
                    </div>
                    <div class="drawer-content p-4">
                        ${contentSlot}
                    </div>
                </div>
            </div>
        </div>
        `;

    // Set header title safely via DOM to avoid HTML injection
    const titleEl = this.querySelector('.drawer-title');
    if (headerSlotEl) {
      titleEl.appendChild(headerSlotEl.cloneNode(true));
    } else {
      titleEl.textContent = this.headerContent;
    }
  }

  attachEventListeners() {
    this.triggerButton = this.querySelector('.trigger-button');
    this.drawerElement = this.querySelector('.drawer');
    this.backdrop = this.querySelector('.drawer-backdrop');
    this.closeButton = this.querySelector('.drawer-close');
    this.drawerWrapper = this.querySelector('.drawer-wrapper');

    // Store bound methods as properties
    this.boundOpen = this.open.bind(this);
    this.boundClose = this.close.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);

    if (this.triggerButton) {
      this.triggerButton.addEventListener('click', this.boundOpen);
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', this.boundClose);
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.boundClose);
    }

    // Add keyboard listener for ESC key
    document.addEventListener('keydown', this._handleKeyDown);
  }

  removeEventListeners() {
    if (this.triggerButton) {
      this.triggerButton.removeEventListener('click', this.boundOpen);
    }

    if (this.backdrop) {
      this.backdrop.removeEventListener('click', this.boundClose);
    }

    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.boundClose);
    }

    document.removeEventListener('keydown', this._handleKeyDown);
  }

  _handleKeyDown(event) {
    if (event.key === 'Escape' && this._isOpen) {
      this.close();
    }
  }

  open() {
    this._isOpen = true;
    this.drawerWrapper.classList.remove('pointer-events-none');
    this.drawerWrapper.classList.add('pointer-events-auto');
    this.backdrop.classList.remove('pointer-events-none', 'opacity-0');
    this.backdrop.classList.add('pointer-events-auto', 'opacity-100');

    if (this.position === 'left') {
      this.drawerElement.classList.remove('-translate-x-full');
      this.drawerElement.classList.add('translate-x-0');
    } else {
      this.drawerElement.classList.remove('translate-x-full');
      this.drawerElement.classList.add('translate-x-0');
    }

    // Dispatch custom event
    this._dispatchEvent('drawer:opened', { drawer: this });
  }

  close() {
    this._isOpen = false;
    this.drawerWrapper.classList.remove('pointer-events-auto');
    this.drawerWrapper.classList.add('pointer-events-none');
    this.backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    this.backdrop.classList.add('opacity-0', 'pointer-events-none');

    if (this.position === 'left') {
      this.drawerElement.classList.remove('translate-x-0');
      this.drawerElement.classList.add('-translate-x-full');
    } else {
      this.drawerElement.classList.remove('translate-x-0');
      this.drawerElement.classList.add('translate-x-full');
    }

    // Dispatch custom event
    this._dispatchEvent('drawer:closed', { drawer: this });
  }

  // Getters for attributes with defaults
  get position() {
    return this._getAttributeWithDefault('position', 'right');
  }

  get drawerClass() {
    return this._getAttributeWithDefault('drawer-class', 'bg-white w-80');
  }

  get headerClass() {
    return this._getAttributeWithDefault('header-class', '');
  }

  get backdropClass() {
    return this._getAttributeWithDefault('backdrop-class', '');
  }

  get buttonClass() {
    return this._getAttributeWithDefault('button-class', 'bg-blue-500 text-white px-4 py-2 rounded');
  }

  get triggerContent() {
    return this._getAttributeWithDefault('trigger-content', 'Open Drawer');
  }

  get headerContent() {
    return this._getAttributeWithDefault('header-content', 'Drawer');
  }
}

customElements.define('dry-drawer', DryDrawer);

class AjaxDrawer extends BaseElement {
  // Web component for creating a drawer that fetches content via AJAX
  constructor() {
    super();
    this._isOpen = false;
  }

  _initializeComponent() {
    if (!this.hasAttribute('data-rendered')) {
      this.render();
      this.attachEventListeners();
      this.setAttribute('data-rendered', '');
    } else {
      this.attachEventListeners();
    }
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  render() {
    const headerSlotEl = this.querySelector('[slot="header"]');
    const contentId = this.contentId;

    this.innerHTML = `
        <div class="drawer-container">
            <button type="button" class="trigger-button ${this.buttonClass}">
                ${this._escapeHtml(this.triggerContent)}
            </button>
            <div class="drawer-wrapper fixed inset-0 z-50 pointer-events-none">
                <div class="drawer-backdrop fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out opacity-0 pointer-events-none ${this.backdropClass}"></div>
                <div class="drawer fixed ${this.position === 'left' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 h-full transition-transform duration-300 ease-in-out pointer-events-auto shadow-xl ${this.drawerClass}">
                    <div class="drawer-header flex items-center justify-between p-4 border-b ${this.headerClass}">
                        <div class="drawer-title"></div>
                        <svg viewBox="0 0 24 24" class="drawer-close cursor-pointer h-6 w-6 text-gray-500 hover:text-gray-700">
                            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                        </svg>
                    </div>
                    <div class="drawer-content p-4">
                        <div class="drawer-ajax-content"></div>
                        <div class="drawer-loading hidden flex justify-center items-center p-8">
                            <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading...</span>
                        </div>
                        <div class="drawer-error hidden text-red-500 p-4">
                            There was an error loading the content. Please try again.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

    // Set attributes via DOM to avoid HTML injection
    const btn = this.querySelector('.trigger-button');
    if (btn) {
      btn.setAttribute('hx-get', this.url);
      btn.setAttribute('hx-trigger', this.triggerType);
      btn.setAttribute('hx-target', `#${contentId}`);
    }
    const ajaxContent = this.querySelector('.drawer-ajax-content');
    if (ajaxContent) {
      ajaxContent.id = contentId;
    }
    const titleEl = this.querySelector('.drawer-title');
    if (titleEl) {
      if (headerSlotEl) {
        titleEl.appendChild(headerSlotEl.cloneNode(true));
      } else {
        titleEl.textContent = this.headerContent;
      }
    }
  }

  attachEventListeners() {
    this.triggerButton = this.querySelector('.trigger-button');
    this.drawerElement = this.querySelector('.drawer');
    this.backdrop = this.querySelector('.drawer-backdrop');
    this.closeButton = this.querySelector('.drawer-close');
    this.drawerWrapper = this.querySelector('.drawer-wrapper');
    this.loadingElement = this.querySelector('.drawer-loading');
    this.errorElement = this.querySelector('.drawer-error');
    this.contentElement = this.querySelector('.drawer-ajax-content');

    // Store bound methods
    this.boundClose = this.close.bind(this);
    this.boundHandleBeforeRequest = this.handleBeforeRequest.bind(this);
    this.boundHandleAfterRequest = this.handleAfterRequest.bind(this);
    this.boundHandleResponseError = this.handleResponseError.bind(this);
    this.boundHandleAfterOnLoad = this.handleAfterOnLoad.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);

    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.boundClose);
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', this.boundClose);
    }

    // HTMX event listeners
    document.body.addEventListener('htmx:beforeRequest', this.boundHandleBeforeRequest);
    document.body.addEventListener('htmx:afterRequest', this.boundHandleAfterRequest);
    document.body.addEventListener('htmx:responseError', this.boundHandleResponseError);
    document.body.addEventListener('htmx:afterOnLoad', this.boundHandleAfterOnLoad);

    // Add keyboard listener for ESC key
    document.addEventListener('keydown', this._handleKeyDown);
  }

  removeEventListeners() {
    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.boundClose);
    }

    if (this.backdrop) {
      this.backdrop.removeEventListener('click', this.boundClose);
    }

    document.body.removeEventListener('htmx:beforeRequest', this.boundHandleBeforeRequest);
    document.body.removeEventListener('htmx:afterRequest', this.boundHandleAfterRequest);
    document.body.removeEventListener('htmx:responseError', this.boundHandleResponseError);
    document.body.removeEventListener('htmx:afterOnLoad', this.boundHandleAfterOnLoad);

    document.removeEventListener('keydown', this._handleKeyDown);
  }

  _handleKeyDown(event) {
    if (event.key === 'Escape' && this._isOpen) {
      this.close();
    }
  }

  handleBeforeRequest(event) {
    // Only handle events for our content element
    if (event.detail.target && event.detail.target.id === this.contentId) {
      this.open();
      this.contentElement.classList.add('hidden');
      this.loadingElement.classList.remove('hidden');
      this.errorElement.classList.add('hidden');
    }
  }

  handleAfterRequest(event) {
    // Only handle events for our content element
    if (event.detail.target && event.detail.target.id === this.contentId) {
      this.loadingElement.classList.add('hidden');
      this.contentElement.classList.remove('hidden');
    }
  }

  handleResponseError(event) {
    // Only handle events for our content element
    if (event.detail.target && event.detail.target.id === this.contentId) {
      this.loadingElement.classList.add('hidden');
      this.errorElement.classList.remove('hidden');
    }
  }

  handleAfterOnLoad(event) {
    // Check if we should close the drawer based on headers
    if (event.detail.target && event.detail.target.id === this.contentId) {
      if (event.detail.xhr.getResponseHeader('HX-CloseDrawer') === 'close') {
        this.close();
      }
    }
  }

  open() {
    this._isOpen = true;
    this.drawerWrapper.classList.remove('pointer-events-none');
    this.drawerWrapper.classList.add('pointer-events-auto');
    this.backdrop.classList.remove('pointer-events-none', 'opacity-0');
    this.backdrop.classList.add('pointer-events-auto', 'opacity-100');

    if (this.position === 'left') {
      this.drawerElement.classList.remove('-translate-x-full');
      this.drawerElement.classList.add('translate-x-0');
    } else {
      this.drawerElement.classList.remove('translate-x-full');
      this.drawerElement.classList.add('translate-x-0');
    }

    // Dispatch custom event
    this._dispatchEvent('drawer:opened', { drawer: this });
  }

  close() {
    this._isOpen = false;
    this.drawerWrapper.classList.remove('pointer-events-auto');
    this.drawerWrapper.classList.add('pointer-events-none');
    this.backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    this.backdrop.classList.add('opacity-0', 'pointer-events-none');

    if (this.position === 'left') {
      this.drawerElement.classList.remove('translate-x-0');
      this.drawerElement.classList.add('-translate-x-full');
    } else {
      this.drawerElement.classList.remove('translate-x-0');
      this.drawerElement.classList.add('translate-x-full');
    }

    // Reset content
    this.errorElement.classList.add('hidden');
    this.loadingElement.classList.add('hidden');

    // Dispatch custom event
    this._dispatchEvent('drawer:closed', { drawer: this });
  }

  // Getters for attributes with defaults
  get position() {
    return this._getAttributeWithDefault('position', 'right');
  }

  get drawerClass() {
    return this._getAttributeWithDefault('drawer-class', 'bg-white w-80');
  }

  get headerClass() {
    return this._getAttributeWithDefault('header-class', '');
  }

  get backdropClass() {
    return this._getAttributeWithDefault('backdrop-class', '');
  }

  get buttonClass() {
    return this._getAttributeWithDefault('button-class', 'bg-blue-500 text-white px-4 py-2 rounded');
  }

  get triggerContent() {
    return this._getAttributeWithDefault('trigger-content', 'Load Content');
  }

  get headerContent() {
    return this._getAttributeWithDefault('header-content', 'Drawer');
  }

  get url() {
    return this._getAttributeWithDefault('url', '');
  }

  get triggerType() {
    return this._getAttributeWithDefault('trigger-type', 'click');
  }

  get contentId() {
    if (!this._contentId) {
      this._contentId = this.getAttribute('content-id') ||
        `drawer-content-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
    }
    return this._contentId;
  }
}

customElements.define('ajax-drawer', AjaxDrawer);

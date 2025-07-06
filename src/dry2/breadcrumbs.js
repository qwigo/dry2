class DryBreadcrumbs extends BaseElement {
  constructor() {
    super();
    this._isRendering = false;
    this._originalContent = null;
  }

  _initializeComponent() {
    this.render();
    this.setupEventListeners();
  }

  static get observedAttributes() {
    return ['separator', 'breadcrumb_class'];
  }

  attributeChangedCallback() {
    if (this.isConnected && !this._isRendering) {
      this.render();
    }
  }

  get separator() {
    return this.getAttribute('separator') || 'chevron';
  }

  set separator(value) {
    this.setAttribute('separator', value);
  }

  get itemCount() {
    return this.getOriginalItems().length;
  }

  get activeIndex() {
    const items = this.getOriginalItems();
    for (let i = 0; i < items.length; i++) {
      if (items[i].hasAttribute('active') || i === items.length - 1) {
        return i;
      }
    }
    return -1;
  }

  getOriginalItems() {
    const hiddenDiv = this.querySelector('div[data-original-items]');
    if (hiddenDiv) {
      return Array.from(hiddenDiv.querySelectorAll('breadcrumb-item'));
    }
    return Array.from(this.querySelectorAll('breadcrumb-item'));
  }

  getSeparatorHTML() {
    const separatorType = this.separator;
    const separators = {
      'chevron': '<svg class="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>',
      'slash': '<span class="text-gray-400 dark:text-gray-500 mx-2">/</span>',
      'bullet': '<span class="text-gray-400 dark:text-gray-500 mx-2">•</span>',
      'arrow': '<span class="text-gray-400 dark:text-gray-500 mx-2">→</span>'
    };

    return separators[separatorType] || `<span class="text-gray-400 dark:text-gray-500 mx-2">${separatorType}</span>`;
  }

  render() {
    if (this._isRendering) return;
    this._isRendering = true;

    const items = this.getOriginalItems();
    const breadcrumbClass = this.getAttribute('breadcrumb_class') || '';

    // Build the breadcrumb HTML
    let breadcrumbHTML = `<nav class="flex items-center ${breadcrumbClass}" aria-label="Breadcrumb">`;

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const href = item.getAttribute('href');
      const icon = item.getAttribute('icon');
      const text = item.textContent.trim();
      const itemClass = item.getAttribute('class') || '';

      // Add separator before item (except first)
      if (index > 0) {
        breadcrumbHTML += this.getSeparatorHTML();
      }

      // Build item HTML
      if (href && !isLast) {
        breadcrumbHTML += `<a href="${href}" class="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors ${itemClass}">`;
      } else {
        breadcrumbHTML += `<span class="flex items-center text-gray-500 dark:text-gray-400 ${itemClass}">`;
      }

      // Add icon if present
      if (icon) {
        breadcrumbHTML += `${icon}<span class="ml-1">`;
      }

      breadcrumbHTML += text;

      if (icon) {
        breadcrumbHTML += '</span>';
      }

      if (href && !isLast) {
        breadcrumbHTML += '</a>';
      } else {
        breadcrumbHTML += '</span>';
      }
    });

    breadcrumbHTML += '</nav>';

    // Preserve original content correctly
    const hiddenDiv = this.querySelector('div[data-original-items]');
    if (!hiddenDiv) {
      // First render - store the original content
      const originalContent = this.innerHTML;
      this.innerHTML = breadcrumbHTML + `<div data-original-items style="display: none;">${originalContent}</div>`;
    } else {
      // Subsequent renders - only replace the nav element
      const nav = this.querySelector('nav');
      if (nav) {
        nav.outerHTML = breadcrumbHTML;
      }
    }

    this._isRendering = false;
  }

  setupEventListeners() {
    // Only observe the hidden container for changes to original items
    const observer = new MutationObserver((mutations) => {
      let shouldRerender = false;
      mutations.forEach(mutation => {
        // Only rerender if changes happened in the hidden container
        if (mutation.target.hasAttribute('data-original-items') ||
                    mutation.target.closest('[data-original-items]')) {
          shouldRerender = true;
        }
      });

      if (shouldRerender && !this._isRendering) {
        this.render();
      }
    });

    observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'icon', 'class', 'active']
    });
  }

  addItem(text, href = null, active = false) {
    const item = document.createElement('breadcrumb-item');
    item.textContent = text;

    if (href) {
      item.setAttribute('href', href);
    }

    if (active) {
      item.setAttribute('active', '');
    }

    // Add to the hidden container if it exists, otherwise to the main element
    const hiddenDiv = this.querySelector('div[data-original-items]');
    if (hiddenDiv) {
      hiddenDiv.appendChild(item);
    } else {
      this.appendChild(item);
    }

    this.render();
    return this;
  }

  setActive(index) {
    const items = this.getOriginalItems();

    // Remove active from all items
    items.forEach(item => item.removeAttribute('active'));

    // Set active on specified item
    if (index >= 0 && index < items.length) {
      items[index].setAttribute('active', '');
    }

    this.render();
    return this;
  }
}

class BreadcrumbItem extends HTMLElement {
  static get observedAttributes() {
    return ['href', 'icon', 'active', 'class'];
  }

  attributeChangedCallback() {
    // Trigger parent re-render when attributes change, but only if not currently rendering
    const parent = this.closest('dry-breadcrumbs');
    if (parent && !parent._isRendering) {
      parent.render();
    }
  }
}

// Register the custom elements
customElements.define('dry-breadcrumbs', DryBreadcrumbs);
customElements.define('breadcrumb-item', BreadcrumbItem);

/**
 * DRY2 Accordion Component
 * A customizable accordion component with smooth animations and accessibility support
 * Built with vanilla JavaScript using BaseElement
 */

/**
 * AccordionItem - Individual accordion section
 */
class AccordionItem extends BaseElement {
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
    return ['title', 'icon', 'open', 'disabled'];
  }

  constructor() {
    super();
    this._originalContent = null;
    this._header = null;
    this._content = null;
    this._contentWrapper = null;
    this._isOpen = false;
  }

  /**
   * Override beforeRender to capture original content
   */
  beforeRender() {
    // Capture the original content before we transform it
    if (!this._originalContent) {
      this._originalContent = this.innerHTML;
    }
  }

  /**
   * Main render method
   */
  render() {
    const title = this.getAttr('title', 'Accordion Item');
    const icon = this.getAttr('icon', '');
    const isOpen = this.getBoolAttr('open', false);
    const disabled = this.getBoolAttr('disabled', false);

    // Store open state
    this._isOpen = isOpen;

    // Generate unique ID if not present
    if (!this.id) {
      this.id = `accordion-item-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Build the accordion structure
    const headerId = `${this.id}-header`;
    const contentId = `${this.id}-content`;

    // Build icon HTML (if provided, it's already HTML)
    const iconHTML = icon ? icon : '';

    // Build header
    const headerHTML = `
      <button 
        id="${headerId}"
        class="accordion-header w-full flex items-center justify-between px-4 py-3 text-left font-medium transition-colors duration-200 ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white hover:bg-gray-50 text-gray-900 cursor-pointer'
        } border-b border-gray-200"
        aria-expanded="${isOpen}"
        aria-controls="${contentId}"
        ${disabled ? 'disabled' : ''}
      >
        <span class="flex items-center gap-2">
          ${iconHTML ? `<span class="accordion-icon">${iconHTML}</span>` : ''}
          <span class="accordion-title">${AccordionItem._escapeHtml(title)}</span>
        </span>
        <svg 
          class="accordion-chevron w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    `;

    // Build content area
    const contentHTML = `
      <div 
        id="${contentId}"
        class="accordion-content-wrapper overflow-hidden transition-all duration-300 ease-in-out"
        style="max-height: ${isOpen ? '1000px' : '0'}; opacity: ${isOpen ? '1' : '0'};"
        role="region"
        aria-labelledby="${headerId}"
      >
        <div class="accordion-content p-4 bg-white border-b border-gray-200">
          ${this._originalContent}
        </div>
      </div>
    `;

    // Clear and rebuild
    this.innerHTML = headerHTML + contentHTML;

    // Store references
    this._header = this.querySelector('.accordion-header');
    this._contentWrapper = this.querySelector('.accordion-content-wrapper');
    this._content = this.querySelector('.accordion-content');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (this._header && !this.getBoolAttr('disabled', false)) {
      this.addTrackedListener(this._header, 'click', this._handleClick.bind(this));
    }
  }

  /**
   * Handle header click
   */
  _handleClick(event) {
    event.preventDefault();
    this.toggle();
  }

  /**
   * Open the accordion item
   */
  open() {
    if (this._isOpen || this.getBoolAttr('disabled', false)) return;

    this._isOpen = true;
    this.setAttribute('open', '');

    // Animate open
    if (this._contentWrapper && this._header) {
      const chevron = this._header.querySelector('.accordion-chevron');
      this._header.setAttribute('aria-expanded', 'true');
      this._contentWrapper.style.maxHeight = `${this._content.scrollHeight + 32}px`;
      this._contentWrapper.style.opacity = '1';
      if (chevron) {
        chevron.classList.add('transform', 'rotate-180');
      }
    }

    // Notify parent accordion
    this._notifyParent('opened');
  }

  /**
   * Close the accordion item
   */
  close() {
    if (!this._isOpen || this.getBoolAttr('disabled', false)) return;

    this._isOpen = false;
    this.removeAttribute('open');

    // Animate close
    if (this._contentWrapper && this._header) {
      const chevron = this._header.querySelector('.accordion-chevron');
      this._header.setAttribute('aria-expanded', 'false');
      this._contentWrapper.style.maxHeight = '0';
      this._contentWrapper.style.opacity = '0';
      if (chevron) {
        chevron.classList.remove('transform', 'rotate-180');
      }
    }

    // Notify parent accordion
    this._notifyParent('closed');
  }

  /**
   * Toggle the accordion item
   */
  toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Notify parent accordion of state change
   */
  _notifyParent(action) {
    const parent = this.closest('dry-accordion');
    if (parent) {
      parent._handleItemChange(this.id, action);
    }
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    if (name === 'open') {
      if (this.getBoolAttr('open', false)) {
        this._isOpen = false; // Reset so open() will work
        this.open();
      } else {
        this._isOpen = true; // Reset so close() will work
        this.close();
      }
    } else if (name === 'disabled') {
      this.reRender();
    } else {
      // Re-render for title or icon changes
      this.reRender();
    }
  }

  /**
   * Get open state
   */
  get isOpen() {
    return this._isOpen;
  }
}

/**
 * DryAccordion - Accordion container component
 */
class DryAccordion extends BaseElement {
  /**
   * Observe these attributes for changes
   */
  static get observedAttributes() {
    return ['multiple', 'disabled'];
  }

  constructor() {
    super();
    this._openItems = new Set();
  }

  /**
   * Main render method
   */
  render() {
    // Just add styling wrapper - children accordion-items are already rendered
    const multiple = this.getBoolAttr('multiple', false);
    const disabled = this.getBoolAttr('disabled', false);

    // Add base styling to accordion container
    if (!this.classList.contains('dry-accordion')) {
      this.classList.add('dry-accordion', 'border', 'border-gray-200', 'rounded-lg', 'overflow-hidden');
    }

    // Apply disabled state to all items
    if (disabled) {
      this.$$('accordion-item').forEach(item => {
        item.setAttribute('disabled', '');
      });
    } else {
      this.$$('accordion-item').forEach(item => {
        item.removeAttribute('disabled');
      });
    }

    // Initialize open items set
    this._updateOpenItems();
  }

  /**
   * Update the set of open items
   */
  _updateOpenItems() {
    this._openItems.clear();
    this.$$('accordion-item').forEach(item => {
      if (item.isOpen) {
        this._openItems.add(item.id);
      }
    });
  }

  /**
   * Handle item state change
   */
  _handleItemChange(itemId, action) {
    const multiple = this.getBoolAttr('multiple', false);

    if (action === 'opened') {
      // If not multiple mode, close other items
      if (!multiple) {
        this.$$('accordion-item').forEach(item => {
          if (item.id !== itemId && item.isOpen) {
            item.close();
          }
        });
      }
      this._openItems.add(itemId);
    } else if (action === 'closed') {
      this._openItems.delete(itemId);
    }

    // Emit change event
    this.emit('accordion:change', {
      itemId,
      isOpen: action === 'opened',
      openItems: Array.from(this._openItems)
    });
  }

  /**
   * Open a specific item
   */
  openItem(itemId) {
    const item = this.querySelector(`#${itemId}`);
    if (item && item.tagName === 'ACCORDION-ITEM') {
      item.open();
    }
  }

  /**
   * Close a specific item
   */
  closeItem(itemId) {
    const item = this.querySelector(`#${itemId}`);
    if (item && item.tagName === 'ACCORDION-ITEM') {
      item.close();
    }
  }

  /**
   * Toggle a specific item
   */
  toggleItem(itemId) {
    const item = this.querySelector(`#${itemId}`);
    if (item && item.tagName === 'ACCORDION-ITEM') {
      item.toggle();
    }
  }

  /**
   * Open all items (only works in multiple mode)
   */
  openAll() {
    const multiple = this.getBoolAttr('multiple', false);
    if (!multiple) {
      console.warn('openAll() only works in multiple mode');
      return;
    }

    this.$$('accordion-item').forEach(item => {
      item.open();
    });
  }

  /**
   * Close all items
   */
  closeAll() {
    this.$$('accordion-item').forEach(item => {
      item.close();
    });
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    if (name === 'multiple') {
      const multiple = this.getBoolAttr('multiple', false);
      // If switching to single mode, close all but the first open item
      if (!multiple) {
        let firstOpenFound = false;
        this.$$('accordion-item').forEach(item => {
          if (item.isOpen) {
            if (firstOpenFound) {
              item.close();
            } else {
              firstOpenFound = true;
            }
          }
        });
      }
    } else if (name === 'disabled') {
      this.reRender();
    }
  }

  /**
   * Get/Set multiple property
   */
  get multiple() {
    return this.getBoolAttr('multiple', false);
  }

  set multiple(value) {
    if (value) {
      this.setAttribute('multiple', '');
    } else {
      this.removeAttribute('multiple');
    }
  }

  /**
   * Get/Set disabled property
   */
  get disabled() {
    return this.getBoolAttr('disabled', false);
  }

  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
}

// Register the custom elements
customElements.define('accordion-item', AccordionItem);
customElements.define('dry-accordion', DryAccordion);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DryAccordion, AccordionItem };
}


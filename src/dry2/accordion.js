/**
 * DryAccordion - Secure and performant accordion component
 * Fixes: XSS vulnerabilities, performance issues, and architectural concerns
 */
class DryAccordion extends BaseElement {
  static get observedAttributes() {
    return ['multiple', 'disabled'];
  }

  constructor() {
    super();
    this._accordionState = null;
    this._accordionEl = null;
    this._itemsCache = null;
    this._errorReported = false;
    this._childObserver = null;
  }

  connectedCallback() {
    if (!this._isInitialized) {
      this._waitForChildrenAndInitialize();
      this._isInitialized = true;
    }
  }

  _initializeComponent() {
    try {
      // Extract accordion items with caching
      const items = this._extractItemsSecurely();

      if (items.length === 0) {
        // Don't treat this as an error immediately - wait for items to be added
        console.info('Accordion initialized with no items - waiting for items to be added');
        this._setupEmptyAccordion();
        return;
      }

      // Initialize accordion state
      this._accordionState = new AccordionState(items, {
        multiple: this.multiple,
        disabled: this.disabled
      });

      // Build DOM efficiently without innerHTML replacement
      this._buildAccordionDOM();

      // Initialize Alpine.js safely
      this._initializeAlpineJS();

      this._dispatchEvent('accordion:initialized', {
        itemCount: items.length,
        openItems: this._accordionState.getOpenItems()
      });

    } catch (error) {
      this._handleError('initialization-failed', error.message, error);
    }
  }

  /**
   * Setup empty accordion that will watch for items to be added
   */
  _setupEmptyAccordion() {
    // Set up a mutation observer to watch for child accordion-item elements
    this._setupChildObserver();
    
    // Create a minimal container for now
    this.innerHTML = '<div class="accordion space-y-2" x-data="{ openItems: [], multiple: false, disabled: false }"></div>';
    this._accordionEl = this.firstElementChild;
  }

  /**
   * Setup mutation observer to watch for child elements being added
   */
  _setupChildObserver() {
    if (this._childObserver) {
      this._childObserver.disconnect();
    }

    this._childObserver = new MutationObserver((mutations) => {
      let hasNewAccordionItems = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              node.tagName && 
              node.tagName.toLowerCase() === 'accordion-item') {
            hasNewAccordionItems = true;
          }
        });
      });

      if (hasNewAccordionItems) {
        // Clear cache and re-initialize
        this._itemsCache = null;
        this._childObserver.disconnect();
        this._childObserver = null;
        
        // Small delay to ensure all items are added
        setTimeout(() => {
          this._initializeComponent();
        }, 50);
      }
    });

    this._childObserver.observe(this, { childList: true, subtree: false });
  }

  /**
   * Securely extract items with proper validation and sanitization
   */
  _extractItemsSecurely() {
    if (this._itemsCache) {
      return this._itemsCache;
    }

    let itemElements = [];

    // Method 1: Direct children with accordion-item tag
    itemElements = Array.from(this.children).filter(child =>
      child.tagName && child.tagName.toLowerCase() === 'accordion-item'
    );

    // Method 2: Elements with title attribute (fallback)
    if (itemElements.length === 0) {
      itemElements = Array.from(this.children).filter(child =>
        child.hasAttribute && child.hasAttribute('title')
      );
    }

    // Method 3: Parse from preserved content (secure fallback)
    if (itemElements.length === 0 && this._originalContent) {
      itemElements = this._parseFromOriginalContent();
    }

    // Validate and sanitize extracted items
    this._itemsCache = itemElements.map((item, index) => {
      const id = this._sanitizeId(item.id || `item-${index}`);
      const title = this._escapeHtml(item.getAttribute('title') || `Item ${index + 1}`);
      const icon = this._sanitizeIcon(item.getAttribute('icon') || '');
      
      return {
        id,
        title,
        icon,
        disabled: item.hasAttribute('disabled'),
        open: item.hasAttribute('open'),
        content: this._sanitizeContent(item.innerHTML || '')
      };
    });

    return this._itemsCache;
  }

  /**
   * Parse items from original content securely
   */
  _parseFromOriginalContent() {
    try {
      // Use DOMParser for secure parsing instead of innerHTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<div>${this._originalContent}</div>`, 
        'text/html'
      );
      
      return Array.from(doc.body.firstChild.children).filter(child =>
        child.tagName && child.tagName.toLowerCase() === 'accordion-item'
      );
    } catch (error) {
      console.warn('Failed to parse original content:', error);
      return [];
    }
  }

  /**
   * Build accordion DOM efficiently using DocumentFragment
   */
  _buildAccordionDOM() {
    // Clear existing content
    this.innerHTML = '';

    // Create container
    const container = document.createElement('div');
    container.className = 'accordion space-y-2';

    // Set Alpine.js data directly on the element
    this._setAlpineData(container);

    // Build items using DocumentFragment for performance
    const fragment = document.createDocumentFragment();
    this._accordionState.items.forEach(item => {
      const itemElement = this._createItemElement(item);
      fragment.appendChild(itemElement);
    });

    container.appendChild(fragment);
    this.appendChild(container);
    this._accordionEl = container;
  }

  /**
   * Set Alpine.js data on container element safely
   */
  /**
   * Set Alpine.js data on container element safely
   */
  /**
   * Set Alpine.js data on container element safely
   */
  /**
   * Set Alpine.js data on container element safely
   */
  _setAlpineData(container) {
    const openItems = this._accordionState.getOpenItems();
    const multiple = this._accordionState.multiple;
    const disabled = this._accordionState.disabled;

    // Create a properly formatted x-data string
    const dataString = `{
      openItems: ${JSON.stringify(openItems)},
      multiple: ${multiple},
      disabled: ${disabled},
      isOpen(itemId) {
        return this.openItems.includes(itemId);
      },
      toggle(itemId) {
        if (this.disabled) return;
        
        if (this.isOpen(itemId)) {
          this.openItems = this.openItems.filter(id => id !== itemId);
        } else {
          if (this.multiple) {
            this.openItems.push(itemId);
          } else {
            this.openItems = [itemId];
          }
        }
        
        this.$dispatch('accordion:change', {
          itemId: itemId,
          isOpen: this.isOpen(itemId),
          openItems: this.openItems
        });
      }
    }`;

    container.setAttribute('x-data', dataString);
  }

  /**
   * Initialize Alpine.js data directly on the element
   */
  _initializeAlpineData(container, dataObj) {
    // Use a simple x-data attribute that Alpine can parse
    container.setAttribute('x-data', '{}');
    
    // Set up the data after Alpine initializes the element
    setTimeout(() => {
      if (window.Alpine && window.Alpine.$data) {
        try {
          const alpineInstance = window.Alpine.$data(container);
          if (alpineInstance) {
            // Copy properties to the Alpine instance
            Object.assign(alpineInstance, dataObj);
          }
        } catch (error) {
          console.warn('Failed to set Alpine data directly, using fallback');
          this._createDataStringFallback(container, dataObj.openItems);
        }
      }
    }, 50);
  }

  /**
   * Fallback method to create a safe data string
   */
  _createDataStringFallback(container, openItems) {
    // Use simple string construction with careful escaping
    const openItemsStr = openItems.map(id => `'${id}'`).join(',');
    
    const dataString = `{
      openItems: [${openItemsStr}],
      multiple: ${this._accordionState.multiple},
      disabled: ${this._accordionState.disabled},
      isOpen(itemId) { return this.openItems.includes(itemId); },
      toggle(itemId) { 
        if (this.disabled) return;
        if (this.isOpen(itemId)) {
          this.openItems = this.openItems.filter(id => id !== itemId);
        } else {
          if (this.multiple) { this.openItems.push(itemId); } 
          else { this.openItems = [itemId]; }
        }
        this.$dispatch('accordion:change', { itemId, isOpen: this.isOpen(itemId), openItems: this.openItems });
      }
    }`;

    container.setAttribute('x-data', dataString);
  }

  /**
   * Create individual accordion item element
   */
  _createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'accordion-item bg-white border border-gray-200 rounded-lg overflow-hidden';

    // Create header button
    const button = this._createItemButton(item);
    itemDiv.appendChild(button);

    // Create content container
    const contentContainer = this._createItemContent(item);
    itemDiv.appendChild(contentContainer);

    return itemDiv;
  }

  /**
   * Create accordion item button with proper security
   */
  _createItemButton(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `accordion-header flex items-center justify-between w-full px-4 py-3 text-left bg-transparent hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
      item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
    }`;
    
    // Set Alpine.js attributes safely using full attribute names
    button.setAttribute('x-on:click', `toggle('${item.id}')`);
    button.setAttribute('x-bind:aria-expanded', `isOpen('${item.id}')`);
    button.setAttribute('aria-controls', `${item.id}-content`);
    
    if (item.disabled) {
      button.disabled = true;
    }

    // Create button content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex items-center';

    // Add icon if present
    if (item.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'mr-2';
      iconSpan.innerHTML = item.icon; // Sanitized icon HTML
      contentDiv.appendChild(iconSpan);
    }

    // Add title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'font-medium text-gray-900';
    titleSpan.textContent = item.title; // Safe text content, already escaped
    contentDiv.appendChild(titleSpan);

    button.appendChild(contentDiv);

    // Add chevron icon
    const chevron = this._createChevronIcon(item.id);
    button.appendChild(chevron);

    return button;
  }

  /**
   * Create chevron icon element
   */
  _createChevronIcon(itemId) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-5 h-5 transition-transform duration-200');
    svg.setAttribute('x-bind:class', `isOpen('${itemId}') ? 'transform rotate-180' : ''`);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('stroke', 'currentColor');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M19 9l-7 7-7-7');

    svg.appendChild(path);
    return svg;
  }

  /**
   * Create accordion item content container
   */
  _createItemContent(item) {
    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('x-show', `isOpen('${item.id}')`);
    contentDiv.setAttribute('x-transition:enter', 'transition-all duration-200 ease-out');
    contentDiv.setAttribute('x-transition:enter-start', 'opacity-0 max-h-0');
    contentDiv.setAttribute('x-transition:enter-end', 'opacity-100 max-h-screen');
    contentDiv.setAttribute('x-transition:leave', 'transition-all duration-150 ease-in');
    contentDiv.setAttribute('x-transition:leave-start', 'opacity-100 max-h-screen');
    contentDiv.setAttribute('x-transition:leave-end', 'opacity-0 max-h-0');
    contentDiv.className = 'accordion-content overflow-hidden';
    contentDiv.id = `${item.id}-content`;

    const innerDiv = document.createElement('div');
    innerDiv.className = 'px-4 py-4 text-gray-700 border-t border-gray-200';
    innerDiv.innerHTML = item.content; // Content is already sanitized

    contentDiv.appendChild(innerDiv);
    return contentDiv;
  }

  /**
   * Initialize Alpine.js with proper error handling
   */
  _initializeAlpineJS() {
    this._ensureAlpineProcessing();
  }

  /**
   * Get the accordion's Alpine data scope.
   *
   * Resolved live on each call rather than cached: _buildAccordionDOM
   * replaces this element's contents, which detaches the element any
   * cached scope belonged to, so a cache silently goes stale on every
   * rebuild. Delegates to BaseElement._getAlpineData, which handles both
   * Alpine runtimes and returns null rather than throwing.
   */
  _getAlpineDataSecurely() {
    return this._getAlpineData();
  }

  /**
   * Get all item IDs efficiently
   */
  _getAllItemIds() {
    return this._accordionState ? this._accordionState.getAllItemIds() : [];
  }

  // Public API Methods with improved error handling
  openItem(itemId) {
    if (!this._validateItemId(itemId)) return;
    
    const alpineData = this._getAlpineDataSecurely();
    if (alpineData && !alpineData.disabled && !alpineData.isOpen(itemId)) {
      alpineData.toggle(itemId);
    }
  }

  closeItem(itemId) {
    if (!this._validateItemId(itemId)) return;
    
    const alpineData = this._getAlpineDataSecurely();
    if (alpineData && alpineData.isOpen(itemId)) {
      alpineData.toggle(itemId);
    }
  }

  toggleItem(itemId) {
    if (!this._validateItemId(itemId)) return;
    
    const alpineData = this._getAlpineDataSecurely();
    if (alpineData && !alpineData.disabled) {
      alpineData.toggle(itemId);
    }
  }

  openAll() {
    const alpineData = this._getAlpineDataSecurely();
    if (alpineData && alpineData.multiple && !alpineData.disabled) {
      alpineData.openItems = this._getAllItemIds();
    }
  }

  closeAll() {
    const alpineData = this._getAlpineDataSecurely();
    if (alpineData && !alpineData.disabled) {
      alpineData.openItems = [];
    }
  }

  // Getters and setters
  get multiple() {
    return this._getBooleanAttribute('multiple');
  }

  set multiple(value) {
    this._setBooleanAttribute('multiple', value);
  }

  get disabled() {
    return this._getBooleanAttribute('disabled');
  }

  set disabled(value) {
    this._setBooleanAttribute('disabled', value);
  }

  /**
   * Handle attribute changes with proper state management
   */
  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isInitialized) {
      const alpineData = this._getAlpineDataSecurely();

      if (alpineData && this._accordionState) {
        if (name === 'multiple') {
          const newMultiple = this.multiple;
          alpineData.multiple = newMultiple;
          this._accordionState.multiple = newMultiple;
          
          // If switching to single mode, keep only first open item
          if (!newMultiple && alpineData.openItems.length > 1) {
            alpineData.openItems = [alpineData.openItems[0]];
          }
        } else if (name === 'disabled') {
          const newDisabled = this.disabled;
          alpineData.disabled = newDisabled;
          this._accordionState.disabled = newDisabled;
        }
      }
    }
  }

  // Security utilities
  _escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  _sanitizeId(id) {
    // Remove dangerous characters and ensure valid ID
    return id.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50) || 'item';
  }

  _sanitizeIcon(icon) {
    // Sanitize icon HTML - only allow SVG elements with safe attributes
    if (typeof icon !== 'string' || !icon.trim()) return '';
    
    // Basic validation: must be an SVG element
    if (!icon.trim().toLowerCase().startsWith('<svg')) {
      console.warn('Icon must be an SVG element');
      return '';
    }
    
    // Remove dangerous attributes and scripts
    return icon
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .trim();
  }

  _sanitizeContent(content) {
    // Basic content sanitization - in production, use a proper sanitizer like DOMPurify
    if (typeof content !== 'string') return '';
    
    // Remove script tags and dangerous attributes
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }

  _validateItemId(itemId) {
    if (!itemId || typeof itemId !== 'string') {
      console.warn('Invalid item ID provided to accordion method');
      return false;
    }
    return true;
  }

  _handleError(type, message, error = null) {
    if (this._errorReported) return; // Prevent spam
    
    console.error(`Accordion Error [${type}]:`, message);
    if (error) console.error(error);
    
    this._dispatchEvent('accordion:error', { type, message, error });
    this._errorReported = true;
  }

  // Cleanup on disconnect
  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    
    // Clean up mutation observer
    if (this._childObserver) {
      this._childObserver.disconnect();
      this._childObserver = null;
    }
    
    this._accordionState = null;
    this._accordionEl = null;
    this._itemsCache = null;
  }
}

/**
 * AccordionState - Manages accordion state separately from DOM
 */
class AccordionState {
  constructor(items, options = {}) {
    this.items = items;
    this.multiple = options.multiple || false;
    this.disabled = options.disabled || false;
    this._openItems = new Set();
    
    // Initialize open items
    this._initializeOpenItems();
  }

  _initializeOpenItems() {
    const initialOpenItems = this.items
      .filter(item => item.open)
      .map(item => item.id);

    if (this.multiple) {
      initialOpenItems.forEach(id => this._openItems.add(id));
    } else if (initialOpenItems.length > 0) {
      this._openItems.add(initialOpenItems[0]);
    }
  }

  getOpenItems() {
    return Array.from(this._openItems);
  }

  getAllItemIds() {
    return this.items.map(item => item.id);
  }

  isOpen(itemId) {
    return this._openItems.has(itemId);
  }

  toggle(itemId) {
    if (this.disabled) return;

    if (this._openItems.has(itemId)) {
      this._openItems.delete(itemId);
    } else {
      if (this.multiple) {
        this._openItems.add(itemId);
      } else {
        this._openItems.clear();
        this._openItems.add(itemId);
      }
    }
  }
}

// Remove the empty AccordionItem class since it serves no purpose
// If needed for styling or other purposes, it can be re-added with actual functionality

customElements.define('dry-accordion', DryAccordion);

class DryCard extends BaseElement {
  static get observedAttributes() {
    return ['variant', 'elevation', 'orientation', 'interactive', 'bordered'];
  }

  constructor() {
    super();
    this._initialized = false;
    this._alpineData = null;
    this._slots = {};
    this._memoizedClasses = new Map();
    
    // Set up immediate script prevention using MutationObserver
    this._setupScriptPrevention();
  }

  _setupScriptPrevention() {
    // Create a MutationObserver to catch and remove scripts immediately
    this._scriptObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check for added nodes
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this._preventScriptExecution(node);
          }
        });
        
        // Check for attribute changes that might introduce dangerous content
        if (mutation.type === 'attributes') {
          this._sanitizeElementAttributes(mutation.target);
        }
      });
    });
    
    // Start observing immediately
    this._scriptObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur']
    });
    
    // Also prevent any existing scripts
    this._preventScriptExecution(this);
  }

  _preventScriptExecution(element) {
    // Remove script tags
    const scripts = element.tagName === 'SCRIPT' ? [element] : element.querySelectorAll('script');
    scripts.forEach(script => {
      script.remove();
    });
    
    // Remove dangerous event handlers
    const elementsToCheck = element.nodeType === Node.ELEMENT_NODE ? [element, ...element.querySelectorAll('*')] : [];
    elementsToCheck.forEach(el => this._sanitizeElementAttributes(el));
  }

  _sanitizeElementAttributes(element) {
    if (element.nodeType !== Node.ELEMENT_NODE) return;
    
    const dangerousAttrs = [
      'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
      'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onabort',
      'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmouseup'
    ];
    
          dangerousAttrs.forEach(attr => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
        }
      });
    
    // Check for javascript: URLs
    ['href', 'src', 'action'].forEach(attr => {
      const value = element.getAttribute(attr);
      if (value && value.toLowerCase().includes('javascript:')) {
        element.removeAttribute(attr);
      }
    });
  }

  connectedCallback() {
    // Ensure all existing content is sanitized immediately
    this._preventScriptExecution(this);
    
    // Call parent's connectedCallback
    super.connectedCallback();
  }

  disconnectedCallback() {
    // Clean up the observer
    if (this._scriptObserver) {
      this._scriptObserver.disconnect();
    }
    super.disconnectedCallback();
  }

  _initializeComponent() {
    try {
      // Extract and sanitize slot content
      this._slots = this._extractAndSanitizeSlotContent();
      
      this._createComponentStructure();
      
      // Try Alpine.js integration if available, but continue if it fails
      if (window.Alpine) {
        this._initializeAlpineIntegration();
      } else {
        // Apply standard classes and interactivity
        this._applyCardClasses();
      }
      
      this._initialized = true;
    } catch (error) {
      console.error('DryCard initialization failed:', error);
      // Fall back to basic functionality
      this._renderFallback();
    }
  }

  _extractAndSanitizeSlotContent() {
    const slots = {
      header: '',
      media: '',
      body: '',
      footer: '',
      default: ''
    };

    // Use base class method safely
    try {
      const baseSlots = super._extractSlotContent();
      Object.assign(slots, baseSlots);
    } catch (error) {
      // Fallback: extract default slot manually
      if (this.innerHTML.trim()) {
        slots.default = this.innerHTML.trim();
      }
    }

    // Extract specific card slots with sanitization
    const slotSelectors = {
      header: '[slot="header"]',
      media: '[slot="media"]',
      footer: '[slot="footer"]',
      body: '[slot="body"]'
    };

    Object.entries(slotSelectors).forEach(([slotName, selector]) => {
      if (!slots[slotName]) {
        const slotElement = this.querySelector(selector);
        if (slotElement) {
          slots[slotName] = this._sanitizeSlotContent(slotElement, slotName);
          slotElement.remove();
        }
      }
    });

    // Handle default content (body)
    if (this.innerHTML.trim() && !slots.body && !slots.default) {
      slots.default = this._sanitizeHTML(this.innerHTML.trim());
    }

    return slots;
  }

  _sanitizeSlotContent(element, slotType) {
    // Get the outer HTML as string first
    const htmlString = element.outerHTML;
    
    // Pre-strip dangerous content from string before any DOM operations
    const preSanitized = this._preStripDangerousContent(htmlString);
    
    // For media slots, preserve images and basic formatting
    if (slotType === 'media') {
      return this._sanitizeMediaContent(element, preSanitized);
    }
    
    // For other slots, return the pre-sanitized HTML
    return preSanitized;
  }

  _sanitizeHTML(html) {
    if (!html) return '';
    
    // Create a temporary DOM element for sanitization
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove dangerous elements and attributes
    this._removeDangerousElements(temp);
    this._sanitizeAttributes(temp);
    
    return temp.innerHTML;
  }

  _sanitizeMediaContent(element, preSanitizedHtml) {
    // Allow images and basic media elements
    const allowedTags = ['img', 'picture', 'source', 'video', 'audio', 'canvas'];
    const tagName = element.tagName.toLowerCase();
    
    if (allowedTags.includes(tagName)) {
      // Use the pre-sanitized HTML for media content too
      return preSanitizedHtml;
    }
    
    return preSanitizedHtml;
  }

  _removeDangerousElements(element) {
    const dangerousTags = [
      'script', 'object', 'embed', 'form', 'input', 'iframe', 'frame', 'frameset',
      'link', 'meta', 'style', 'base', 'applet', 'marquee', 'bgsound'
    ];
    
    dangerousTags.forEach(tag => {
      const elements = element.querySelectorAll(tag);
      elements.forEach(el => {
        el.remove();
      });
    });
  }

  _sanitizeAttributes(element) {
    const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur'];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT);
    
    let node;
    while (node = walker.nextNode()) {
      // Remove dangerous attributes
      dangerousAttrs.forEach(attr => {
        if (node.hasAttribute(attr)) {
          node.removeAttribute(attr);
        }
      });
      
      // Sanitize href and src attributes
      ['href', 'src'].forEach(attr => {
        const value = node.getAttribute(attr);
        if (value && !this._isSafeUrl(value)) {
          node.removeAttribute(attr);
        }
      });
    }
  }

  _isSafeUrl(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      return ['http:', 'https:', 'data:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  _safeInsertHTML(element, htmlContent) {
    if (!htmlContent) return;
    
    // First, strip all script tags from the string BEFORE parsing
    const sanitizedString = this._preStripDangerousContent(htmlContent);
    
    // Use DOMParser to parse without executing scripts
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedString, 'text/html');
    
    // Get the body content (DOMParser wraps content in html/body)
    const parsedContent = doc.body;
    
    // Additional sanitization on the parsed DOM
    this._removeDangerousElements(parsedContent);
    this._sanitizeAttributes(parsedContent);
    this._removeAllScripts(parsedContent);
    
    // Move children from parsed content to target element
    while (parsedContent.firstChild) {
      element.appendChild(parsedContent.firstChild);
    }
  }

  _preStripDangerousContent(htmlString) {
    if (!htmlString) return '';
    
    // Remove script tags and their content using regex (before DOM parsing)
    let sanitized = htmlString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove common XSS patterns
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:text\/html/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');
    
    // Remove dangerous event handlers from the string
    const dangerousEvents = [
      'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
      'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onabort',
      'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmouseup',
      'onmousemove', 'onmouseout', 'onresize', 'onscroll'
    ];
    
    dangerousEvents.forEach(event => {
      const regex = new RegExp(`\\s${event}\\s*=\\s*["\'][^"\']*["\']`, 'gi');
      sanitized = sanitized.replace(regex, '');
      const regex2 = new RegExp(`\\s${event}\\s*=\\s*[^\\s>]+`, 'gi');
      sanitized = sanitized.replace(regex2, '');
    });
    
    return sanitized;
  }

  _removeAllScripts(element) {
    // Remove script tags
    const scripts = element.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove any elements with javascript: in attributes
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.value && attr.value.toLowerCase().includes('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    // Remove dangerous event handlers more comprehensively
    const dangerousAttrs = [
      'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
      'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onabort',
      'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmouseup',
      'onmousemove', 'onmouseout', 'onresize', 'onscroll'
    ];
    
    allElements.forEach(el => {
      dangerousAttrs.forEach(attr => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      });
    });
  }

  _createComponentStructure() {
    // Clear content and create base structure safely
    this.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = `card-container ${this._getCardClasses()}`;
    container.setAttribute('role', 'article');
    
    // Create media section safely if it exists
    if (this._slots.media) {
      const mediaDiv = document.createElement('div');
      mediaDiv.className = `card-media ${this._getSectionClasses('media')}`;
      this._safeInsertHTML(mediaDiv, this._slots.media);
      container.appendChild(mediaDiv);
    }
    
    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = `card-content ${this.orientation === 'horizontal' ? 'flex-1 flex flex-col' : ''}`;
    
    // Create sections safely
    const sections = [
      { name: 'header', content: this._slots.header },
      { name: 'body', content: this._slots.body || this._slots.default },
      { name: 'footer', content: this._slots.footer }
    ];
    
    sections.forEach(section => {
      if (section.content) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = `card-${section.name} ${this._getSectionClasses(section.name)}`;
        this._safeInsertHTML(sectionDiv, section.content);
        contentDiv.appendChild(sectionDiv);
      }
    });
    
    container.appendChild(contentDiv);
    this.appendChild(container);
    
    // Apply interactivity if needed
    if (this.interactive) {
      container.addEventListener('click', this._handleCardClick.bind(this));
    }
  }

  _initializeAlpineIntegration() {
    const container = this.querySelector('.card-container');
    if (!container) return;

    // Only set Alpine.js data attribute safely
    const alpineData = this._createAlpineData();
    
    try {
      container.setAttribute('x-data', JSON.stringify(alpineData));
      
      // Update section classes
      this._updateSectionClasses();
      
      // Initialize Alpine.js if available
      if (window.Alpine) {
        window.Alpine.initTree(container);
      }
    } catch (error) {
      // Fall back to non-Alpine functionality 
      this._applyCardClasses();
    }
  }

  _createAlpineData() {
    const self = this;
    return {
      variant: this.variant,
      elevation: this.elevation,
      orientation: this.orientation,
      interactive: this.interactive,
      bordered: this.bordered,
      
      getCardClasses() {
        return self._getCardClasses();
      },
      
      getHeaderClasses() {
        return self._getSectionClasses('header');
      },
      
      getMediaClasses() {
        return self._getSectionClasses('media');
      },
      
      getBodyClasses() {
        return self._getSectionClasses('body');
      },
      
      getFooterClasses() {
        return self._getSectionClasses('footer');
      },
      
      hasHeader() {
        return !!self._slots.header;
      },
      
      hasMedia() {
        return !!self._slots.media;
      },
      
      hasBody() {
        return !!(self._slots.body || self._slots.default);
      },
      
      hasFooter() {
        return !!self._slots.footer;
      },
      
      handleCardClick(event) {
        return self._handleCardClick(event);
      }
    };
  }

  _getCardClasses() {
    const cacheKey = `${this.variant}-${this.elevation}-${this.orientation}-${this.interactive}-${this.bordered}`;
    
    if (this._memoizedClasses.has(cacheKey)) {
      return this._memoizedClasses.get(cacheKey);
    }
    
    const classes = this._computeCardClasses();
    this._memoizedClasses.set(cacheKey, classes);
    
    // Limit cache size
    if (this._memoizedClasses.size > 20) {
      const firstKey = this._memoizedClasses.keys().next().value;
      this._memoizedClasses.delete(firstKey);
    }
    
    return classes;
  }

  _computeCardClasses() {
    const classes = ['card', 'relative', 'bg-white', 'rounded-lg', 'transition-all', 'duration-200'];
    
    // Elevation classes
    const elevationMap = {
      'none': [],
      'sm': ['shadow-sm'],
      'md': ['shadow-md'],
      'lg': ['shadow-lg'],
      'xl': ['shadow-xl']
    };
    classes.push(...(elevationMap[this.elevation] || elevationMap.md));
    
    // Border
    if (this.bordered) {
      classes.push('border', 'border-gray-200');
    }
    
    // Interactive states
    if (this.interactive) {
      classes.push('cursor-pointer', 'hover:shadow-lg', 'hover:-translate-y-0.5');
    }
    
    // Orientation
    if (this.orientation === 'horizontal') {
      classes.push('flex');
    }
    
    // Variant styles
    if (this.variant === 'outlined') {
      classes.push('bg-transparent', 'border', 'border-gray-300', 'shadow-none');
    } else if (this.variant === 'elevated') {
      classes.push('shadow-xl');
    }
    
    return classes.join(' ');
  }

  _getSectionClasses(section) {
    const baseClasses = [`card-${section}`];
    const isHorizontal = this.orientation === 'horizontal';
    
    const sectionClassMap = {
      header: isHorizontal ? ['p-6'] : ['px-6', 'pt-6', 'pb-0'],
      media: isHorizontal ? ['flex-shrink-0', 'w-48'] : ['w-full'],
      body: isHorizontal ? ['flex-1', 'p-6'] : ['px-6', 'py-4'],
      footer: isHorizontal ? ['p-6', 'pt-0'] : ['px-6', 'pb-6', 'pt-0']
    };
    
    return [...baseClasses, ...(sectionClassMap[section] || [])].join(' ');
  }

  _updateSectionClasses() {
    const sections = ['header', 'media', 'body', 'footer'];
    sections.forEach(section => {
      const element = this.querySelector(`.card-${section}`);
      if (element) {
        element.className = `card-${section} ${this._getSectionClasses(section)}`;
      }
    });
    
    // Update content container
    const contentDiv = this.querySelector('.card-content');
    if (contentDiv) {
      contentDiv.className = `card-content ${this.orientation === 'horizontal' ? 'flex-1 flex flex-col' : ''}`;
    }
    
    // Update main container
    const container = this.querySelector('.card-container');
    if (container) {
      container.className = `card-container ${this._getCardClasses()}`;
    }
  }

  _handleCardClick(event) {
    if (!this.interactive) return;
    
    const cardEvent = new CustomEvent('card:click', {
      bubbles: true,
      cancelable: true,
      detail: {
        originalEvent: event,
        card: this
      }
    });
    
    this.dispatchEvent(cardEvent);
  }

  _renderFallback() {
    // Fallback render without Alpine.js - use safe DOM construction
    this.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = this._getCardClasses();
    container.setAttribute('role', 'article');
    
    // Create media section safely
    if (this._slots.media) {
      const mediaDiv = document.createElement('div');
      mediaDiv.className = this._getSectionClasses('media');
      this._safeInsertHTML(mediaDiv, this._slots.media);
      container.appendChild(mediaDiv);
    }
    
    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = this.orientation === 'horizontal' ? 'flex-1 flex flex-col' : '';
    
    // Create sections safely
    const sections = [
      { name: 'header', content: this._slots.header },
      { name: 'body', content: this._slots.body || this._slots.default },
      { name: 'footer', content: this._slots.footer }
    ];
    
    sections.forEach(section => {
      if (section.content) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = this._getSectionClasses(section.name);
        this._safeInsertHTML(sectionDiv, section.content);
        contentDiv.appendChild(sectionDiv);
      }
    });
    
    container.appendChild(contentDiv);
    this.appendChild(container);
    
    if (this.interactive) {
      this.addEventListener('click', this._handleCardClick.bind(this));
    }
  }

  // Optimized attribute change handling
  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue === newValue || !this._initialized) return;
    
    // Clear memoized classes on relevant changes
    if (['variant', 'elevation', 'orientation', 'interactive', 'bordered'].includes(name)) {
      this._memoizedClasses.clear();
    }
    
    // Targeted updates instead of full re-render
    switch (name) {
      case 'variant':
      case 'elevation':
      case 'bordered':
        this._updateCardClasses();
        break;
      case 'orientation':
        this._updateOrientation();
        break;
      case 'interactive':
        this._updateInteractivity();
        break;
    }
  }

  _updateCardClasses() {
    const container = this.querySelector('.card-container');
    if (container) {
      container.className = 'card-container ' + this._getCardClasses();
    }
  }

  _updateOrientation() {
    this._updateSectionClasses();
    this._updateCardClasses();
  }

  _updateInteractivity() {
    const container = this.querySelector('.card-container');
    if (container) {
      if (this.interactive) {
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = '';
      }
    }
  }

  // Public API methods
  setInteractive(interactive) {
    this.interactive = interactive;
  }

  setElevation(elevation) {
    this.elevation = elevation;
  }

  setVariant(variant) {
    this.variant = variant;
  }

  // Getters and setters with validation
  get variant() {
    return this._getAttributeWithDefault('variant', 'filled');
  }

  set variant(value) {
    const validVariants = ['filled', 'outlined', 'elevated'];
    const sanitizedValue = validVariants.includes(value) ? value : 'filled';
    this._setAttribute('variant', sanitizedValue);
  }

  get elevation() {
    return this._getAttributeWithDefault('elevation', 'md');
  }

  set elevation(value) {
    const validElevations = ['none', 'sm', 'md', 'lg', 'xl'];
    const sanitizedValue = validElevations.includes(value) ? value : 'md';
    this._setAttribute('elevation', sanitizedValue);
  }

  get orientation() {
    return this._getAttributeWithDefault('orientation', 'vertical');
  }

  set orientation(value) {
    const validOrientations = ['vertical', 'horizontal'];
    const sanitizedValue = validOrientations.includes(value) ? value : 'vertical';
    this._setAttribute('orientation', sanitizedValue);
  }

  get interactive() {
    return this._getBooleanAttribute('interactive');
  }

  set interactive(value) {
    this._setBooleanAttribute('interactive', value);
  }

  get bordered() {
    return this._getBooleanAttribute('bordered');
  }

  set bordered(value) {
    this._setBooleanAttribute('bordered', value);
  }

  _applyCardClasses() {
    const container = this.querySelector('.card-container');
    if (container) {
      container.className = `card-container ${this._getCardClasses()}`;
      
      if (this.interactive) {
        container.addEventListener('click', this._handleCardClick.bind(this));
      }
    }
  }
}

customElements.define('dry-card', DryCard);

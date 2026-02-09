/**
 * DRY2 Card Component
 * A flexible container for displaying related content with consistent styling
 * Built with vanilla JavaScript using BaseElement
 */

class DryCard extends BaseElement {
  /**
   * Observe these attributes for changes
   */
  static get observedAttributes() {
    return ['variant', 'elevation', 'orientation', 'interactive', 'bordered'];
  }

  /**
   * Elevation map for dry2.css shadow utilities
   */
  static ELEVATION_MAP = {
    'none': [],
    'sm': ['shadow-sm'],
    'md': ['shadow'],      // dry2.css uses .shadow for medium elevation
    'lg': ['shadow-lg'],
    'xl': ['shadow-xl']
  };

  constructor() {
    super();
    this._slots = {};
    this._clickHandler = null;
    this._contentObserver = null;
  }

  /**
   * Override connectedCallback to capture slot content
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Set display style once on first connection
      if (!this.style.display) {
        this.style.display = 'block';
      }

      // Check if content is already available
      const hasContent = this.querySelector('[slot]') || this.childNodes.length > 0;
      
      if (hasContent) {
        // Capture slot content before rendering
        this._captureSlotContent();
        super.connectedCallback();
      } else {
        // Wait for content to be added by parser
        this._contentObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              // Child nodes were added
              if (this.querySelector('[slot]') || this.childNodes.length > 0) {
                this._contentObserver.disconnect();
                this._contentObserver = null;
                this._captureSlotContent();
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

        // Fallback: render after timeout even if no content
        setTimeout(() => {
          if (this._contentObserver && !this.hasAttribute('data-rendered')) {
            this._contentObserver.disconnect();
            this._contentObserver = null;
            this._captureSlotContent();
            super.connectedCallback();
          }
        }, 100);
      }
    } else {
      // Already rendered, just reattach listeners
      super.connectedCallback();
      this._attachEventListeners();
    }
  }

  /**
   * Capture content from named slots
   */
  _captureSlotContent() {
    this._slots = {
      header: this._extractSlot('header'),
      media: this._extractSlot('media'),
      body: this._extractSlot('body'),
      footer: this._extractSlot('footer')
    };

    // If no body slot is provided, use any remaining content as body
    if (!this._slots.body) {
      const remainingContent = Array.from(this.childNodes)
        .filter(node => {
          // Skip text nodes that are just whitespace
          if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
            return false;
          }
          // Skip elements that have a slot attribute
          if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute && node.getAttribute('slot')) {
            return false;
          }
          return true;
        })
        .map(node => node.cloneNode(true));
      
      if (remainingContent.length > 0) {
        const tempDiv = document.createElement('div');
        remainingContent.forEach(node => tempDiv.appendChild(node));
        this._slots.body = tempDiv.innerHTML;
      }
    }
  }

  /**
   * Extract content from a named slot
   */
  _extractSlot(slotName) {
    const slotElement = this.querySelector(`[slot="${slotName}"]`);
    if (slotElement) {
      const content = slotElement.innerHTML;
      // Don't remove the element here - let render() clear everything
      return content;
    }
    return '';
  }

  /**
   * Main render method
   */
  render() {
    const variant = this.getAttr('variant', 'filled');
    const elevation = this.getAttr('elevation', 'md');
    const orientation = this.getAttr('orientation', 'vertical');
    const interactive = this.getBoolAttr('interactive', false);
    const bordered = this.getBoolAttr('bordered', false);

    // Get card classes
    const cardClasses = this._getCardClasses(variant, elevation, orientation, interactive, bordered);

    // Build the card structure
    const container = document.createElement('div');
    container.className = `card-container ${cardClasses}`;
    container.setAttribute('role', 'article');

    // Create media section if exists
    if (this._slots.media) {
      const mediaDiv = document.createElement('div');
      mediaDiv.className = `card-media ${this._getSectionClasses('media', orientation)}`;
      mediaDiv.innerHTML = this._slots.media;
      container.appendChild(mediaDiv);
    }

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = `card-content ${orientation === 'horizontal' ? 'flex flex-col' : ''}`;

    // Create header section if exists
    if (this._slots.header) {
      const headerDiv = document.createElement('div');
      headerDiv.className = `card-header ${this._getSectionClasses('header', orientation)}`;
      headerDiv.innerHTML = this._slots.header;
      contentDiv.appendChild(headerDiv);
    }

    // Create body section if exists
    if (this._slots.body) {
      const bodyDiv = document.createElement('div');
      bodyDiv.className = `card-body ${this._getSectionClasses('body', orientation)}`;
      bodyDiv.innerHTML = this._slots.body;
      contentDiv.appendChild(bodyDiv);
    }

    // Create footer section if exists
    if (this._slots.footer) {
      const footerDiv = document.createElement('div');
      footerDiv.className = `card-footer ${this._getSectionClasses('footer', orientation)}`;
      footerDiv.innerHTML = this._slots.footer;
      contentDiv.appendChild(footerDiv);
    }

    container.appendChild(contentDiv);

    // Clear and append new content
    if (typeof this.replaceChildren === 'function') {
      this.replaceChildren();
    } else {
      this.textContent = '';
    }
    this.appendChild(container);

    // Attach event listeners
    this._attachEventListeners();
  }

  /**
   * Get card-specific classes using dry2.css utilities
   */
  _getCardClasses(variant, elevation, orientation, interactive, bordered) {
    // Base card class from dry2.css (background, border-radius, default shadow)
    const classes = ['card', 'relative'];

    // Apply elevation using dry2.css shadow utilities
    const elevationClasses = DryCard.ELEVATION_MAP[elevation] || DryCard.ELEVATION_MAP.md;
    classes.push(...elevationClasses);

    // Add border if requested
    if (bordered) {
      classes.push('border');
    }

    // Interactive state (cursor pointer only - hover effects handled via CSS)
    if (interactive) {
      classes.push('cursor-pointer');
    }

    // Horizontal orientation (responsive flex layout)
    if (orientation === 'horizontal') {
      classes.push('flex', 'flex-col');
    }

    // Variant-specific styling
    if (variant === 'outlined') {
      classes.push('border');
    } else if (variant === 'elevated') {
      classes.push('shadow-xl');
    }

    return classes.join(' ');
  }

  /**
   * Get section-specific classes with dry2.css spacing utilities
   *
   * Uses .p-*, .px-*, and .py-* utilities (no .pt-* or .pb-* in dry2.css)
   */
  _getSectionClasses(section, orientation) {
    const isHorizontal = orientation === 'horizontal';

    // Define spacing patterns for each section
    const sectionClassMap = {
      header: isHorizontal ? ['p-lg'] : ['px-lg', 'py-sm'],
      media: isHorizontal ? [] : [],
      body: isHorizontal ? ['p-lg'] : ['px-lg', 'py-md'],
      footer: isHorizontal ? ['p-lg'] : ['px-lg', 'py-sm']
    };

    return (sectionClassMap[section] || []).join(' ');
  }

  /**
   * Attach event listeners
   */
  _attachEventListeners() {
    const container = this.querySelector('.card-container');
    if (!container) return;

    // Remove existing listener if any
    if (this._clickHandler) {
      container.removeEventListener('click', this._clickHandler);
      this._clickHandler = null;
    }

    // Add click handler if interactive
    if (this.getBoolAttr('interactive', false)) {
      this._clickHandler = this._handleCardClick.bind(this);
      container.addEventListener('click', this._clickHandler);
    }
  }

  /**
   * Handle card click
   */
  _handleCardClick(event) {
    const cardEvent = new CustomEvent('card:click', {
      bubbles: true,
      cancelable: true,
      detail: {
        element: this
      }
    });

    this.dispatchEvent(cardEvent);
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    // Re-render on any attribute change
    if (this.hasAttribute('data-rendered')) {
      this.reRender();
    }
  }

  /**
   * Override disconnectedCallback to clean up
   */
  disconnectedCallback() {
    // Disconnect the MutationObserver if it exists
    if (this._contentObserver) {
      this._contentObserver.disconnect();
      this._contentObserver = null;
    }

    // Remove event listener
    const container = this.querySelector('.card-container');
    if (container && this._clickHandler) {
      container.removeEventListener('click', this._clickHandler);
      this._clickHandler = null;
    }

    super.disconnectedCallback();
  }

  /**
   * Public API: Set variant
   */
  setVariant(variant) {
    const validVariants = ['filled', 'outlined', 'elevated'];
    if (validVariants.includes(variant)) {
      this.setAttribute('variant', variant);
    }
  }

  /**
   * Public API: Set elevation
   */
  setElevation(elevation) {
    const validElevations = ['none', 'sm', 'md', 'lg', 'xl'];
    if (validElevations.includes(elevation)) {
      this.setAttribute('elevation', elevation);
    }
  }

  /**
   * Public API: Set orientation
   */
  setOrientation(orientation) {
    const validOrientations = ['vertical', 'horizontal'];
    if (validOrientations.includes(orientation)) {
      this.setAttribute('orientation', orientation);
    }
  }

  /**
   * Public API: Set interactive state
   */
  setInteractive(interactive) {
    if (interactive) {
      this.setAttribute('interactive', '');
    } else {
      this.removeAttribute('interactive');
    }
  }

  /**
   * Public API: Set bordered state
   */
  setBordered(bordered) {
    if (bordered) {
      this.setAttribute('bordered', '');
    } else {
      this.removeAttribute('bordered');
    }
  }

  /**
   * Get/Set variant property
   */
  get variant() {
    return this.getAttr('variant', 'filled');
  }

  set variant(value) {
    this.setVariant(value);
  }

  /**
   * Get/Set elevation property
   */
  get elevation() {
    return this.getAttr('elevation', 'md');
  }

  set elevation(value) {
    this.setElevation(value);
  }

  /**
   * Get/Set orientation property
   */
  get orientation() {
    return this.getAttr('orientation', 'vertical');
  }

  set orientation(value) {
    this.setOrientation(value);
  }

  /**
   * Get/Set interactive property
   */
  get interactive() {
    return this.getBoolAttr('interactive', false);
  }

  set interactive(value) {
    this.setInteractive(value);
  }

  /**
   * Get/Set bordered property
   */
  get bordered() {
    return this.getBoolAttr('bordered', false);
  }

  set bordered(value) {
    this.setBordered(value);
  }
}

// Register the custom element
customElements.define('dry-card', DryCard);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryCard;
}

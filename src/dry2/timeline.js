class Timeline extends BaseElement {
  constructor() {
    super();
    this._childObserver = null;
  }

  render() {
    // Apply simple container styling
    this.className = this.getContainerClasses();
    
    // Initialize all timeline items after a brief delay to ensure they're all in DOM
    setTimeout(() => {
      this._initializeTimelineItems();
    }, 0);
    
    // Set up observer for dynamically added timeline items
    this._setupChildObserver();
  }

  _initializeTimelineItems() {
    const items = this.querySelectorAll('timeline-item');
    items.forEach((item, index) => {
      if (item._initializeWithIndex) {
        item._initializeWithIndex(index, index === items.length - 1);
      }
    });
  }

  _setupChildObserver() {
    if (this._childObserver) {
      this._childObserver.disconnect();
    }
    
    this._childObserver = new MutationObserver((mutations) => {
      let shouldReinitialize = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'TIMELINE-ITEM') {
            shouldReinitialize = true;
          }
        });
      });
      
      if (shouldReinitialize) {
        setTimeout(() => this._initializeTimelineItems(), 0);
      }
    });
    
    this._childObserver.observe(this, { childList: true });
  }

  getContainerClasses() {
    let classes = 'timeline-container space-y-4 ';

    const customClass = this.getAttribute('class');
    if (customClass) {
      classes += customClass + ' ';
    }

    return classes.trim();
  }

  disconnectedCallback() {
    if (this._childObserver) {
      this._childObserver.disconnect();
    }
    super.disconnectedCallback();
  }
}

class TimelineItem extends BaseElement {
  constructor() {
    super();
    this._itemIndex = 0;
    this._isLast = false;
  }

  static get observedAttributes() {
    return ['variant', 'date', 'title', 'icon'];
  }

  render() {
    // Store original content before any modifications
    if (!this._originalContent) {
      this._originalContent = this.innerHTML;
    }
    
    // Don't initialize immediately - wait for parent timeline to call _initializeWithIndex
    const parentTimeline = this.closest('timeline-component');
    if (parentTimeline && parentTimeline._rendered) {
      // Parent is already initialized, we can initialize now
      this._initializeWithParent();
    }
    // Otherwise, parent will call _initializeWithIndex when it's ready
  }

  _initializeWithParent() {
    const parentTimeline = this.closest('timeline-component');
    if (parentTimeline) {
      const allItems = parentTimeline.querySelectorAll('timeline-item');
      this._itemIndex = Array.from(allItems).indexOf(this);
      this._isLast = this._itemIndex === allItems.length - 1;
    }
    
    this._initializeItem();
  }

  _initializeWithIndex(index, isLast) {
    this._itemIndex = index;
    this._isLast = isLast;
    this._initializeItem();
  }

  _initializeItem() {
    const originalContent = this._originalContent || this.innerHTML;
    this.innerHTML = this._createTimelineItemHTML(originalContent);
  }

  _createTimelineItemHTML(originalContent) {
    const variant = this.variant;
    const date = this.date;
    const title = this.title;

    const itemClasses = this._getItemClasses();
    const marker = this._createMarker();

    const dateDisplay = date ? `<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">${this._escapeHtml(date)}</div>` : '';
    const titleDisplay = title ? `<div class="font-semibold text-gray-800 dark:text-gray-200 mb-2">${this._escapeHtml(title)}</div>` : '';

    return `
      <div class="${itemClasses}">
        <div class="flex-shrink-0 mr-4">
          ${marker}
          ${!this._isLast ? '<div class="w-0.5 h-16 bg-gray-300 dark:bg-gray-600 ml-4 mt-2"></div>' : ''}
        </div>
        <div class="flex-grow">
          ${dateDisplay}
          ${titleDisplay}
          <div class="text-gray-600 dark:text-gray-300">${originalContent}</div>
        </div>
      </div>
    `;
  }

  _getItemClasses() {
    let classes = 'timeline-item flex ';

    const customClass = this.getAttribute('class');
    if (customClass) {
      classes += customClass + ' ';
    }

    return classes.trim();
  }

  _createMarker() {
    let markerColorClass;

    if (this.variant === 'success') {
      markerColorClass = 'bg-green-500';
    } else if (this.variant === 'error') {
      markerColorClass = 'bg-red-500';
    } else if (this.variant === 'warning') {
      markerColorClass = 'bg-yellow-500';
    } else if (this.variant === 'info') {
      markerColorClass = 'bg-blue-500';
    } else {
      markerColorClass = 'bg-gray-400';
    }

    if (this.icon) {
      return `<div class="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">${this.icon}</div>`;
    } else {
      return `<div class="w-8 h-8 rounded-full ${markerColorClass} border-2 border-white dark:border-gray-800"></div>`;
    }
  }

  get variant() {
    return this.getAttr('variant', 'default');
  }

  get date() {
    return this.getAttribute('date');
  }

  get title() {
    return this.getAttribute('title');
  }

  get icon() {
    return this.getAttribute('icon');
  }

  _escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  onAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._rendered) {
      this._initializeItem();
    }
  }
}

customElements.define('timeline-component', Timeline);
customElements.define('timeline-item', TimelineItem);

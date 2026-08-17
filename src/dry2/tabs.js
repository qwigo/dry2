class DryTabs extends BaseElement {
  static get observedAttributes() {
    return ['active-tab', 'orientation', 'variant', 'disabled'];
  }

  connectedCallback() {
    if (!this._isInitialized) {
      this._waitForChildrenAndInitialize();
      this._isInitialized = true;
    }
  }

  _initializeComponent() {
    // Prevent multiple initializations
    if (this._hasBeenProcessed) {
      return;
    }
    
    // Extract tab items
    const tabs = this._extractTabItems();

    // Use the extracted tabs
    const finalTabs = tabs;

    // Remove error message - component should work even with 0 tabs

    // Get initial active tab
    const activeTab = this.activeTab || (finalTabs.length > 0 ? finalTabs[0].id : '');

    // Get the variant for styling
    const variant = this.variant || 'boxed';

    // Get the orientation
    const orientation = this.orientation || 'horizontal';

    // Mark as processed before modifying innerHTML
    this._hasBeenProcessed = true;

    // Create clean tabs with variant-specific styling
    this.innerHTML = `
            <div class="tabs w-full ${orientation === 'vertical' ? 'flex' : ''}" 
                 x-data="{
                     activeTab: '${activeTab}',
                     variant: '${variant}',
                     orientation: '${orientation}',
                     
                     isActive(tabId) {
                         return this.activeTab === tabId;
                     },
                     
                     switchTab(tabId) {
                         const previousTab = this.activeTab;
                         this.activeTab = tabId;
                         const tabsElement = this.$el.closest('dry-tabs');
                         tabsElement.setAttribute('active-tab', tabId);
                         
                         // Dispatch change event
                         const event = new CustomEvent('tabs:change', {
                             detail: {
                                 activeTab: tabId,
                                 previousTab: previousTab,
                                 tab: tabsElement
                             }
                         });
                         tabsElement.dispatchEvent(event);
                     }
                 }">
                
                <!-- Tab Navigation -->
                <div class="${orientation === 'vertical' ? 'w-48 flex-shrink-0' : 'w-full'}">
                    <nav class="${this._getNavClasses(variant, orientation)}" role="tablist">
                        ${finalTabs.map(tab => `
                            <button type="button"
                                    class="${this._getBaseTabClasses(variant, orientation)}"
                                    @click="switchTab('${tab.id}')"
                                    :class="isActive('${tab.id}') ? '${this._getActiveTabClasses(variant, orientation)}' : '${this._getInactiveTabClasses(variant, orientation)}'"
                                    :aria-selected="isActive('${tab.id}')"
                                    aria-controls="${tab.id}-panel"
                                    role="tab"
                                    ${tab.disabled ? 'disabled' : ''}>
                                ${tab.icon ? `<span class="mr-2">${tab.icon}</span>` : ''}
                                <span>${tab.title}</span>
                                ${tab.badge ? `<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">${tab.badge}</span>` : ''}
                            </button>
                        `).join('')}
                    </nav>
                </div>
                
                <!-- Tab Content -->
                <div class="${orientation === 'vertical' ? 'flex-1 ml-4' : 'w-full'}">
                    ${finalTabs.map(tab => `
                        <div x-show="isActive('${tab.id}')"
                             x-transition:enter="transition-opacity duration-200"
                             x-transition:enter-start="opacity-0"
                             x-transition:enter-end="opacity-100"
                             class="tab-panel ${this._getContentClasses(variant, orientation)}"
                             id="${tab.id}-panel"
                             role="tabpanel">
                            ${tab.content}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
  }

  _extractTabItems() {
    // Try multiple approaches to find tab content
    let tabElements = [];

    // Method 1: Direct children with tag name tab-item
    tabElements = Array.from(this.children).filter(child =>
      child.tagName && child.tagName.toLowerCase() === 'tab-item'
    );

    // Method 2: All direct children (in case tab-item isn't recognized)
    if (tabElements.length === 0) {
      tabElements = Array.from(this.children).filter(child =>
        child.hasAttribute && child.hasAttribute('title')
      );
    }

    // Method 3: Parse innerHTML if available
    if (tabElements.length === 0 && this._originalContent && this._originalContent.includes('tab-item')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this._originalContent;
      tabElements = Array.from(tempDiv.children).filter(child =>
        child.tagName && child.tagName.toLowerCase() === 'tab-item'
      );
    }

    return tabElements.map((tab, index) => ({
      id: tab.id || `tab-${index}`,
      title: tab.getAttribute('title') || `Tab ${index + 1}`,
      icon: tab.getAttribute('icon') || '',
      disabled: tab.hasAttribute('disabled'),
      badge: tab.getAttribute('badge') || '',
      content: tab.innerHTML
    }));
  }

  _createTabButtonHTML(tab) {
    const iconHTML = tab.icon ? `<span class="mr-2">${tab.icon}</span>` : '';
    const badgeHTML = tab.badge ? `<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">${tab.badge}</span>` : '';

    // Pre-calculate all classes
    const baseClasses = this._getTabClasses(tab);
    const activeClasses = this._getActiveTabClasses();
    const inactiveClasses = this._getInactiveTabClasses();
    const isDisabled = tab.disabled || this.disabled;

    return `
            <button type="button"
                    class="tab-button ${baseClasses}"
                    @click="switchTab('${tab.id}')"
                    :aria-selected="isActive('${tab.id}')"
                    :class="isActive('${tab.id}') ? '${activeClasses}' : '${inactiveClasses}'"
                    aria-controls="${tab.id}-panel"
                    role="tab"
                    ${isDisabled ? 'disabled' : ''}>
                ${iconHTML}
                <span>${tab.title}</span>
                ${badgeHTML}
            </button>
        `;
  }

  _createTabPanelHTML(tab) {
    const contentClasses = this._getContentClasses();

    return `
            <div x-show="isActive('${tab.id}')"
                 x-transition:enter="transition-opacity duration-200"
                 x-transition:enter-start="opacity-0"
                 x-transition:enter-end="opacity-100"
                 x-transition:leave="transition-opacity duration-150"
                 x-transition:leave-start="opacity-100"
                 x-transition:leave-end="opacity-0"
                 class="tab-panel ${contentClasses}"
                 id="${tab.id}-panel"
                 aria-labelledby="${tab.id}"
                 role="tabpanel">
                ${tab.content}
            </div>
        `;
  }

  _getNavClasses(variant, orientation) {
    let baseClasses = '';
    
    if (orientation === 'vertical') {
      baseClasses = 'flex flex-col';
      if (variant === 'pills') {
        baseClasses += ' space-y-1 p-1 bg-gray-100 rounded-lg';
      } else if (variant === 'boxed') {
        baseClasses += ' border-r border-gray-200';
      } else {
        baseClasses += ' space-y-1';
      }
    } else {
      // Horizontal orientation
      if (variant === 'pills') {
        baseClasses = 'flex p-1 bg-gray-100 rounded-lg';
      } else if (variant === 'underline') {
        baseClasses = 'flex border-b border-gray-200';
      } else {
        // boxed or default
        baseClasses = 'flex border-b border-gray-200';
      }
    }
    
    return baseClasses;
  }

  _getBaseTabClasses(variant, orientation) {
    const baseClasses = 'px-4 py-2 text-sm font-medium focus:outline-none transition-colors cursor-pointer';

    if (orientation === 'vertical') {
      if (variant === 'pills') {
        return `${baseClasses} rounded-md w-full text-left flex items-center`;
      } else if (variant === 'underline') {
        return `${baseClasses} border-l-2 border-transparent w-full text-left flex items-center`;
      } else {
        // boxed or default
        return `${baseClasses} rounded-l-md border-l border-t border-b w-full text-left flex items-center`;
      }
    } else {
      // Horizontal orientation
      if (variant === 'pills') {
        return `${baseClasses} rounded-md`;
      } else if (variant === 'underline') {
        return `${baseClasses} border-b-2 border-transparent`;
      } else {
        // boxed or default
        return `${baseClasses} rounded-t-md border-l border-r border-t border-b border-gray-200`;
      }
    }
  }

  _getTabClasses(tab) {
    let classes = 'tab flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ';

    if (tab.disabled || this.disabled) {
      classes += 'cursor-not-allowed opacity-50 ';
    } else {
      classes += 'cursor-pointer ';
    }

    // Add variant-specific base classes
    if (this.variant === 'pills') {
      classes += 'rounded-md ';
    } else if (this.variant === 'underline') {
      classes += 'border-b-2 border-transparent ';
    } else {
      // boxed or default
      classes += 'rounded-t-md border-l border-r border-t border-b border-gray-200 ';
    }

    return classes;
  }

  _getActiveTabClasses(variant, orientation) {
    if (orientation === 'vertical') {
      if (variant === 'pills') {
        return 'bg-white text-blue-600 shadow';
      } else if (variant === 'underline') {
        return 'border-blue-600 text-blue-600 bg-white';
      } else {
        // boxed or default
        return 'bg-white text-blue-600 border-l-blue-600';
      }
    } else {
      if (variant === 'pills') {
        return 'bg-white text-blue-600 shadow';
      } else if (variant === 'underline') {
        return 'border-blue-600 text-blue-600 bg-white';
      } else {
        // boxed or default
        return 'bg-white text-blue-600 border-t-blue-600';
      }
    }
  }

  _getInactiveTabClasses(variant, orientation) {
    if (orientation === 'vertical') {
      if (variant === 'pills') {
        return 'text-gray-600 hover:bg-gray-50';
      } else if (variant === 'underline') {
        return 'border-transparent text-gray-600 hover:bg-gray-50';
      } else {
        // boxed or default
        return 'text-gray-600 border-l-transparent hover:bg-gray-50';
      }
    } else {
      if (variant === 'pills') {
        return 'text-gray-600 hover:bg-gray-50';
      } else if (variant === 'underline') {
        return 'border-transparent text-gray-600 hover:bg-gray-50';
      } else {
        // boxed or default
        return 'text-gray-600 border-t-transparent hover:bg-gray-50';
      }
    }
  }

  _getContentClasses(variant, orientation) {
    if (orientation === 'vertical') {
      if (variant === 'pills') {
        return 'bg-white rounded-lg p-4 shadow';
      } else if (variant === 'underline') {
        return 'bg-white p-4';
      } else {
        // boxed or default
        return 'bg-white border border-gray-200 rounded-lg p-4';
      }
    } else {
      if (variant === 'pills') {
        return 'bg-white rounded-lg p-4 shadow';
      } else if (variant === 'underline') {
        return 'bg-white p-4';
      } else {
        // boxed or default
        return 'bg-white border border-gray-200 rounded-b-lg p-4';
      }
    }
  }

  // Simple public API methods
  switchTab(tabId) {
    const alpineData = this._getAlpineData();
    if (alpineData && typeof alpineData.switchTab === 'function') {
      alpineData.switchTab(tabId);
    }
  }

  nextTab() {
    const tabs = this._extractTabItems();
    const enabledTabs = tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === this.activeTab);

    if (currentIndex < enabledTabs.length - 1) {
      this.switchTab(enabledTabs[currentIndex + 1].id);
    }
  }

  previousTab() {
    const tabs = this._extractTabItems();
    const enabledTabs = tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === this.activeTab);

    if (currentIndex > 0) {
      this.switchTab(enabledTabs[currentIndex - 1].id);
    }
  }

  // Getters and setters
  get activeTab() {
    return this._getAttributeWithDefault('active-tab', '');
  }

  set activeTab(value) {
    this._setAttribute('active-tab', value);
  }

  get orientation() {
    return this._getAttributeWithDefault('orientation', 'horizontal');
  }

  set orientation(value) {
    this._setAttribute('orientation', value);
  }

  get variant() {
    return this._getAttributeWithDefault('variant', 'boxed');
  }

  set variant(value) {
    this._setAttribute('variant', value);
  }

  get disabled() {
    return this._getBooleanAttribute('disabled');
  }

  set disabled(value) {
    this._setBooleanAttribute('disabled', value);
  }

  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isInitialized) {
      if (name === 'active-tab') {
        this.activeTab = newValue;
        this._initializeComponent();
      } else if (name === 'orientation') {
        this.orientation = newValue;
        this._initializeComponent();
      } else if (name === 'variant') {
        this.variant = newValue;
        this._initializeComponent();
      } else if (name === 'disabled') {
        this.disabled = newValue !== null && newValue !== 'false';
        this._initializeComponent();
      }
    }
  }
}

class TabItem extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['title', 'icon', 'disabled', 'badge'];
  }
}

customElements.define('dry-tabs', DryTabs);
customElements.define('tab-item', TabItem);

class DryTabs extends BaseElement {
  static get observedAttributes() {
    return ['active-tab', 'orientation', 'variant', 'disabled'];
  }

  constructor() {
    super();
    // The extracted tab model. Cached because rendering replaces
    // innerHTML, which destroys the <tab-item> elements it was read
    // from - without this, every post-render read returned [].
    this._tabs = null;
    this._childObserver = null;
  }

  connectedCallback() {
    if (!this._isInitialized) {
      this._waitForChildrenAndInitialize();
      this._isInitialized = true;
    }
  }

  _initializeComponent() {
    const tabs = this._extractTabItems();

    // Watch for <tab-item>s appended after this point, so tab sets built
    // up by script still work.
    this._setupChildObserver();

    // With nothing to show, render nothing at all rather than leaving an
    // empty rendered shell behind: markup appended a moment later would
    // otherwise be competing with it in the DOM.
    if (tabs.length === 0) return;

    this._renderTabs();
  }

  /**
   * Render from the cached tab model. Safe to call repeatedly - unlike
   * _initializeComponent, it never re-reads the DOM for tab items.
   */
  _renderTabs() {
    const finalTabs = this._extractTabItems();

    // Get initial active tab
    const activeTab = this.activeTab || (finalTabs.length > 0 ? finalTabs[0].id : '');

    // Get the variant for styling
    const variant = this.variant || 'boxed';

    // Get the orientation
    const orientation = this.orientation || 'horizontal';

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

  /**
   * Build the model for a single <tab-item>.
   */
  _createTabModel(tab, index) {
    return {
      id: tab.id || `tab-${index}`,
      title: tab.getAttribute('title') || `Tab ${index + 1}`,
      icon: tab.getAttribute('icon') || '',
      disabled: tab.hasAttribute('disabled'),
      badge: tab.getAttribute('badge') || '',
      content: tab.innerHTML
    };
  }

  /**
   * Return the tab model, reading it out of the DOM only once.
   *
   * The cache is essential rather than an optimization: rendering
   * replaces innerHTML, so the <tab-item> elements this reads from no
   * longer exist afterwards. Without it every call after the first
   * render returned [], which silently broke nextTab/previousTab and
   * any caller inspecting the tab set.
   */
  _extractTabItems() {
    if (this._tabs) {
      return this._tabs;
    }

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

    this._tabs = tabElements.map((tab, index) => this._createTabModel(tab, index));
    return this._tabs;
  }

  /**
   * Watch for <tab-item> elements appended after the first render and
   * fold them into the existing tab set.
   *
   * Newly added elements are appended to the cached model rather than
   * triggering a re-read of the DOM: after a render the original
   * <tab-item>s are gone, so re-reading would find only the new one and
   * silently drop every existing tab.
   *
   * No feedback loop: the rendered output contains no <tab-item>
   * elements, so this component's own renders never re-trigger it.
   */
  _setupChildObserver() {
    if (this._childObserver) return;

    this._childObserver = new MutationObserver((mutations) => {
      const addedTabItems = [];

      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE &&
              node.tagName &&
              node.tagName.toLowerCase() === 'tab-item') {
            addedTabItems.push(node);
          }
        });
      });

      if (addedTabItems.length === 0) return;

      const existing = this._extractTabItems();
      addedTabItems.forEach((element) => {
        // Index from the current length each iteration; existing grows as
        // we push, so adding `offset` on top would double-count and skip
        // ids/titles for the second and later items in a batch.
        existing.push(this._createTabModel(element, existing.length));
      });

      this._renderTabs();
    });

    this._childObserver.observe(this, { childList: true, subtree: false });
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();

    if (this._childObserver) {
      this._childObserver.disconnect();
      this._childObserver = null;
    }
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

  /**
   * The id of the tab currently shown - preferring the live Alpine
   * scope over the attribute, since clicking a tab updates the scope.
   */
  _currentTabId() {
    const alpineData = this._getAlpineData();
    if (alpineData && alpineData.activeTab) {
      return alpineData.activeTab;
    }
    return this.activeTab;
  }

  nextTab() {
    const enabledTabs = this._extractTabItems().filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === this._currentTabId());

    if (currentIndex !== -1 && currentIndex < enabledTabs.length - 1) {
      this.switchTab(enabledTabs[currentIndex + 1].id);
    }
  }

  previousTab() {
    const enabledTabs = this._extractTabItems().filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === this._currentTabId());

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

  /**
   * Every branch here previously called _initializeComponent(), which
   * latched _hasBeenProcessed on its first run and returned immediately
   * ever after - so no attribute change did anything once rendered.
   *
   * active-tab is now applied to the live Alpine scope, leaving the DOM
   * (and that scope) intact. The structural attributes genuinely change
   * the markup, so they re-render from the cached tab model.
   */
  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue === newValue || !this._isInitialized) return;

    // Nothing has been rendered yet (no tabs); the first render will
    // pick these values up.
    if (!this._tabs || this._tabs.length === 0) return;

    if (name === 'active-tab') {
      const alpineData = this._getAlpineData();
      if (alpineData) {
        alpineData.activeTab = newValue;
      } else {
        // No Alpine to drive the binding - rebuild with the new default.
        this._renderTabs();
      }
      return;
    }

    if (name === 'orientation' || name === 'variant' || name === 'disabled') {
      this._renderTabs();
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

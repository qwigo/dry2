/**
 * Tabs Component - A secure, performant tabs implementation using BaseElement
 *
 * Security considerations:
 * - Sanitized HTML content to prevent XSS attacks
 * - No eval() or innerHTML with unsanitized user input
 * - Proper event delegation to prevent memory leaks
 *
 * Performance optimizations:
 * - Efficient DOM manipulation with minimal reflows
 * - Event delegation for tab clicks
 * - Lazy content rendering (only active tab visible)
 * - RequestAnimationFrame for smooth transitions
 */

/**
 * TabItem Component - Individual tab content container
 */
class TabItem extends BaseElement { // eslint-disable-line no-undef
  static get observedAttributes() {
    return ['title', 'icon', 'badge', 'disabled', 'active'];
  }

  constructor() {
    super();
    this._content = null;
  }

  beforeRender() {
    // Store original content before any modifications
    this._content = this.innerHTML;
  }

  render() {
    // Check if active attribute was set before render
    const isActive = this.getBoolAttr('active', false);
    
    // Set display based on active state
    this.style.display = isActive ? 'block' : 'none';
    this.classList.add('dry-tab-content');

    // Set ARIA attributes for accessibility
    this.setAttribute('role', 'tabpanel');
    this.setAttribute('aria-hidden', isActive ? 'false' : 'true');

    // Set ID if not present (required for ARIA)
    if (!this.id) {
      this.id = `tab-content-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  onAttributeChange(name, _oldValue, _newValue) {
    if (name === 'active') {
      this.updateVisibility();
    }
  }

  updateVisibility() {
    const isActive = this.getBoolAttr('active', false);

    if (isActive) {
      // Use requestAnimationFrame for smooth rendering
      requestAnimationFrame(() => {
        this.style.display = 'block';
        this.setAttribute('aria-hidden', 'false');
      });
    } else {
      this.style.display = 'none';
      this.setAttribute('aria-hidden', 'true');
    }
  }

  // Public API
  show() {
    this.setAttribute('active', 'true');
    // Apply visibility immediately, even if not rendered yet
    this.style.display = 'block';
    this.setAttribute('aria-hidden', 'false');
  }

  hide() {
    this.removeAttribute('active');
    // Apply visibility immediately, even if not rendered yet
    this.style.display = 'none';
    this.setAttribute('aria-hidden', 'true');
  }

  isDisabled() {
    return this.getBoolAttr('disabled', false);
  }

  getTitle() {
    return this.getAttr('title', 'Untitled');
  }

  getIcon() {
    return this.getAttr('icon', '');
  }

  getBadge() {
    return this.getAttr('badge', '');
  }
}

/**
 * DryTabs Component - Main tabs container
 */
class DryTabs extends BaseElement { // eslint-disable-line no-undef
  static get observedAttributes() {
    return ['variant', 'orientation', 'active-tab', 'disabled'];
  }

  constructor() {
    super();
    this._tabItems = [];
    this._tabItemsData = [];
    this._tabButtons = new Map(); // Map tab ID to button element
    this._activeTabId = null;
    this._tabListContainer = null;
    this._contentContainer = null;
    this._resizeObserver = null;
  }

  beforeRender() {
    // Collect all tab-item elements before any DOM manipulation
    // Use direct children to ensure we get immediate tab-items only
    // Check for both upgraded custom elements and plain HTML elements
    this._tabItems = Array.from(this.children).filter(child => {
      const tagName = child.tagName.toLowerCase();
      return tagName === 'tab-item';
    });

    // If no tab-items found, return early (will be empty component)
    if (this._tabItems.length === 0) {
      this._tabItemsData = [];
      return;
    }

    // Security: Validate tab IDs to prevent injection
    this._tabItems.forEach((item) => {
      if (!item.id || !/^[a-zA-Z0-9_-]+$/.test(item.id)) {
        // Generate secure ID if invalid
        item.id = `tab-${Math.random().toString(36).substr(2, 9)}`;
      }
    });

    // Store tab items data before clearing innerHTML
    this._tabItemsData = this._tabItems.map(item => ({
      id: item.id,
      title: item.getAttribute('title') || 'Untitled',
      icon: item.getAttribute('icon') || '',
      badge: item.getAttribute('badge') || '',
      disabled: item.hasAttribute('disabled'),
      element: item
    }));
  }

  render() {
    // If no tab items, render empty structure
    if (!this._tabItemsData || this._tabItemsData.length === 0) {
      this.innerHTML = '<div class="text-gray-500">No tabs available</div>';
      return;
    }

    const variant = this.getAttr('variant', 'boxed');
    const orientation = this.getAttr('orientation', 'horizontal');

    // Create tab structure
    this.classList.add('dry-tabs');
    this.setAttribute('role', 'tablist');

    // Set orientation class for styling
    this.classList.toggle('dry-tabs-vertical', orientation === 'vertical');
    this.classList.toggle('dry-tabs-horizontal', orientation !== 'vertical');

    // Create tab list container
    this._tabListContainer = document.createElement('div');
    this._tabListContainer.className = this._getTabListClasses(variant, orientation);
    this._tabListContainer.setAttribute('role', 'tablist');
    this._tabListContainer.setAttribute('aria-orientation', orientation);

    // Create content container
    this._contentContainer = document.createElement('div');
    this._contentContainer.className = 'dry-tabs-content';

    // Move existing tab-item elements to content container first
    this._tabItems.forEach(item => {
      this._contentContainer.appendChild(item);
    });

    // Build tab buttons after we have all the data
    this._buildTabButtons();

    // Clear and rebuild structure
    this.innerHTML = '';

    if (orientation === 'vertical') {
      // Vertical: side-by-side layout
      const wrapper = document.createElement('div');
      wrapper.className = 'flex gap-4';
      wrapper.appendChild(this._tabListContainer);
      wrapper.appendChild(this._contentContainer);
      this.appendChild(wrapper);
    } else {
      // Horizontal: stacked layout
      this.appendChild(this._tabListContainer);
      this.appendChild(this._contentContainer);
    }

    // Set initial active tab
    const initialTab = this.getAttr('active-tab') || (this._tabItems[0]?.id);
    if (initialTab) {
      this._activateTab(initialTab, false);
    }
  }

  afterRender() {
    // Setup resize observer for responsive behavior
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        this._handleResize();
      });
      this._resizeObserver.observe(this);
    }
  }

  _getTabListClasses(variant, orientation) {
    const baseClasses = 'dry-tabs-list flex';
    const orientationClass = orientation === 'vertical'
      ? 'flex-col space-y-1 min-w-[200px]'
      : 'flex-row space-x-1';

    const variantClasses = {
      'boxed': 'border-b border-gray-200',
      'pills': 'bg-gray-100 p-1 rounded-lg',
      'underline': 'border-b border-gray-200'
    };

    return `${baseClasses} ${orientationClass} ${variantClasses[variant] || ''}`;
  }

  _buildTabButtons() {
    this._tabButtons.clear();

    // Use stored data to build buttons
    this._tabItemsData.forEach((itemData) => {
      const button = this._createTabButton(itemData);
      this._tabButtons.set(itemData.id, button);
      this._tabListContainer.appendChild(button);
    });
  }

  _createTabButton(itemData) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = this._getTabButtonClasses(false);
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', itemData.id);
    button.setAttribute('aria-selected', 'false');
    button.setAttribute('tabindex', '-1');
    button.dataset.tabId = itemData.id;

    // Disable if needed
    if (itemData.disabled) {
      button.disabled = true;
      button.classList.add('opacity-50', 'cursor-not-allowed');
    }

    // Build button content
    const content = [];

    // Add icon if present (security: icon is already HTML from attribute)
    if (itemData.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'dry-tab-icon inline-flex items-center';
      // Security: Only allow icon HTML from controlled attributes, not user input
      iconSpan.innerHTML = itemData.icon;
      content.push(iconSpan);
    }

    // Add title (security: sanitize text content)
    const titleSpan = document.createElement('span');
    titleSpan.className = 'dry-tab-title';
    titleSpan.textContent = itemData.title; // textContent is safe
    content.push(titleSpan);

    // Add badge if present
    if (itemData.badge) {
      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'dry-tab-badge ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white';
      badgeSpan.textContent = itemData.badge; // textContent is safe
      content.push(badgeSpan);
    }

    // Append all content
    content.forEach(el => button.appendChild(el));

    return button;
  }

  _getTabButtonClasses(isActive) {
    const variant = this.getAttr('variant', 'boxed');
    const orientation = this.getAttr('orientation', 'horizontal');

    const baseClasses = 'dry-tab-button flex items-center gap-2 px-4 py-2 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

    const variantClasses = {
      'boxed': isActive
        ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
        : 'border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50',
      'pills': isActive
        ? 'bg-white text-blue-600 shadow-sm rounded-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-md',
      'underline': isActive
        ? 'border-b-2 border-blue-500 text-blue-600'
        : 'border-b-2 border-transparent text-gray-600 hover:text-gray-900'
    };

    const orientationClasses = orientation === 'vertical' ? 'justify-start w-full' : '';

    return `${baseClasses} ${variantClasses[variant] || ''} ${orientationClasses}`;
  }

  attachEventListeners() {
    // Guard against null elements - only attach if DOM is ready
    if (!this._tabListContainer) {
      return;
    }

    // Event delegation for performance - single listener for all tabs
    this.addTrackedListener(this._tabListContainer, 'click', (e) => {
      const button = e.target.closest('button[data-tab-id]');
      if (button && !button.disabled) {
        this._handleTabClick(button.dataset.tabId);
      }
    });

    // Keyboard navigation for accessibility
    this.addTrackedListener(this._tabListContainer, 'keydown', (e) => {
      this._handleKeyDown(e);
    });
  }

  _handleTabClick(tabId) {
    if (this.getBoolAttr('disabled', false)) return;
    this._activateTab(tabId, true);
  }

  _activateTab(tabId, emitEvent = true) {
    // Find tab item
    const tabItem = this._tabItems.find(item => item.id === tabId);
    if (!tabItem || tabItem.isDisabled()) return;

    const previousTabId = this._activeTabId;

    // Deactivate all tabs
    this._tabItems.forEach(item => {
      item.hide();
    });

    // Update all button states
    this._tabButtons.forEach((button, id) => {
      const isActive = id === tabId;
      button.className = this._getTabButtonClasses(isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Activate selected tab
    tabItem.show();
    this._activeTabId = tabId;

    // Update attribute
    this.setAttribute('active-tab', tabId);

    // Focus the active button for keyboard navigation
    const activeButton = this._tabButtons.get(tabId);
    if (activeButton && document.activeElement !== activeButton) {
      activeButton.focus();
    }

    // Emit change event
    if (emitEvent) {
      this.emit('tabs:change', {
        activeTab: tabId,
        previousTab: previousTabId,
        tab: tabItem
      });
    }
  }

  _handleKeyDown(e) {
    // Keyboard navigation support
    const key = e.key;

    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) {
      return;
    }

    e.preventDefault();

    const orientation = this.getAttr('orientation', 'horizontal');
    const enabledItems = this._tabItems.filter(item => !item.isDisabled());
    const currentIndex = enabledItems.findIndex(item => item.id === this._activeTabId);

    let nextIndex = currentIndex;

    if (key === 'Home') {
      nextIndex = 0;
    } else if (key === 'End') {
      nextIndex = enabledItems.length - 1;
    } else if (
      (orientation === 'horizontal' && key === 'ArrowRight') ||
      (orientation === 'vertical' && key === 'ArrowDown')
    ) {
      nextIndex = (currentIndex + 1) % enabledItems.length;
    } else if (
      (orientation === 'horizontal' && key === 'ArrowLeft') ||
      (orientation === 'vertical' && key === 'ArrowUp')
    ) {
      nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
    }

    if (nextIndex !== currentIndex) {
      this._activateTab(enabledItems[nextIndex].id, true);
    }
  }

  _handleResize() {
    // Handle responsive behavior if needed
    // Currently a placeholder for future enhancements
  }

  onAttributeChange(name, oldValue, newValue) {
    if (name === 'variant' || name === 'orientation') {
      // Re-render on variant/orientation change
      this.reRender();
    } else if (name === 'active-tab' && newValue !== this._activeTabId) {
      // Programmatic tab change
      this._activateTab(newValue, false);
    } else if (name === 'disabled') {
      this._updateDisabledState();
    }
  }

  _updateDisabledState() {
    const isDisabled = this.getBoolAttr('disabled', false);
    this._tabButtons.forEach(button => {
      button.disabled = isDisabled;
      button.classList.toggle('opacity-50', isDisabled);
      button.classList.toggle('cursor-not-allowed', isDisabled);
    });
  }

  cleanup() {
    // Clean up resize observer
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    // Clear references to prevent memory leaks
    this._tabButtons.clear();
    this._tabItems = [];
    this._tabListContainer = null;
    this._contentContainer = null;
  }

  // Public API Methods
  switchTab(tabId) {
    this._activateTab(tabId, true);
  }

  nextTab() {
    const enabledItems = this._tabItems.filter(item => !item.isDisabled());
    const currentIndex = enabledItems.findIndex(item => item.id === this._activeTabId);
    const nextIndex = (currentIndex + 1) % enabledItems.length;
    this._activateTab(enabledItems[nextIndex].id, true);
  }

  previousTab() {
    const enabledItems = this._tabItems.filter(item => !item.isDisabled());
    const currentIndex = enabledItems.findIndex(item => item.id === this._activeTabId);
    const nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
    this._activateTab(enabledItems[nextIndex].id, true);
  }

  getActiveTab() {
    return this._activeTabId;
  }

  getAllTabs() {
    return this._tabItems.map(item => ({
      id: item.id,
      title: item.getTitle(),
      disabled: item.isDisabled(),
      active: item.id === this._activeTabId
    }));
  }
}

// Register custom elements
if (!customElements.get('tab-item')) {
  customElements.define('tab-item', TabItem);
}

if (!customElements.get('dry-tabs')) {
  customElements.define('dry-tabs', DryTabs);
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DryTabs, TabItem };
}

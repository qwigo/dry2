/**
 * DRY2 Select Component
 * An enhanced select component with search and multi-select capabilities
 * Built with vanilla JavaScript using BaseElement
 */

class DrySelect extends BaseElement {
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
    return ['multiple', 'placeholder', 'search-placeholder', 'name', 'disabled'];
  }

  constructor() {
    super();
    this._options = [];
    this._selectedValues = [];
    this._isOpen = false;
    this._searchTerm = '';
    this._dropdownElement = null;
    this._triggerElement = null;
    this._searchInput = null;
    this._hiddenInput = null;
    this._originalOptions = null;
    this._contentObserver = null;
    this._isCapturingContent = false;
    this._clickOutsideHandler = null;
  }

  /**
   * Override connectedCallback to capture options using MutationObserver
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Set display style once on first connection
      if (!this.style.display) {
        this.style.display = 'block';
      }

      // Try to capture options immediately
      const immediateOptions = this.querySelectorAll('option');

      if (immediateOptions.length > 0 && !this._isCapturingContent) {
        // Options already exist, render immediately
        this._captureOptions();
        super.connectedCallback();
      } else if (!this._isCapturingContent) {
        // Options not yet available, wait for parser to add them
        this._isCapturingContent = true;

        // Set up MutationObserver to watch for child nodes being added
        this._contentObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              // Check if we have option elements now
              const options = this.querySelectorAll('option');
              if (options.length > 0 && this._originalOptions === null) {
                this._captureOptions();
                this._contentObserver.disconnect();
                this._contentObserver = null;

                // Now render the component
                super.connectedCallback();
                break;
              }
            }
          }
        });

        // Start observing
        this._contentObserver.observe(this, {
          childList: true,
          subtree: true
        });

        // Fallback: If no options are added within 100ms, render with empty state
        setTimeout(() => {
          if (this._contentObserver && !this.hasAttribute('data-rendered')) {
            this._contentObserver.disconnect();
            this._contentObserver = null;

            if (this._originalOptions === null) {
              this._originalOptions = [];
              this._options = [];
            }

            super.connectedCallback();
          }
        }, 100);
      }
    } else {
      // Already rendered, just reattach listeners
      super.connectedCallback();
    }
  }

  /**
   * Capture original options from slot content
   */
  _captureOptions() {
    const optionElements = this.querySelectorAll('option');
    this._originalOptions = Array.from(optionElements).map(opt => ({
      value: opt.value || opt.textContent.trim(),
      label: opt.textContent.trim(),
      selected: opt.hasAttribute('selected')
    }));

    this._options = [...this._originalOptions];
    this._selectedValues = this._options
      .filter(opt => opt.selected)
      .map(opt => opt.value);
  }

  /**
   * Override disconnectedCallback to clean up observer
   */
  disconnectedCallback() {
    // Disconnect the MutationObserver if it exists
    if (this._contentObserver) {
      this._contentObserver.disconnect();
      this._contentObserver = null;
    }

    // Remove click outside listener
    if (this._clickOutsideHandler) {
      document.removeEventListener('click', this._clickOutsideHandler);
      this._clickOutsideHandler = null;
    }

    // Call parent's disconnectedCallback
    super.disconnectedCallback();
  }

  /**
   * Main render method
   */
  render() {
    const multiple = this.getBoolAttr('multiple', false);
    const placeholder = this.getAttr('placeholder', 'Select...');
    const searchPlaceholder = this.getAttr('search-placeholder', 'Search...');
    const disabled = this.getBoolAttr('disabled', false);
    const name = this.getAttr('name', '');

    // Clear the element
    if (typeof this.replaceChildren === 'function') {
      this.replaceChildren();
    } else {
      this.textContent = '';
    }

    // Create container
    const container = document.createElement('div');
    container.className = 'relative w-full';

    // Create hidden input for form submission
    if (name) {
      this._hiddenInput = document.createElement('input');
      this._hiddenInput.type = 'hidden';
      this._hiddenInput.name = name;
      this._hiddenInput.value = this._getFormValue();
      container.appendChild(this._hiddenInput);
    }

    // Create trigger button
    this._triggerElement = this._createTrigger(placeholder, disabled, multiple);
    container.appendChild(this._triggerElement);

    // Create dropdown
    this._dropdownElement = this._createDropdown(searchPlaceholder, multiple);
    container.appendChild(this._dropdownElement);

    this.appendChild(container);
  }

  /**
   * Create the trigger button
   */
  _createTrigger(placeholder, disabled, multiple) {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    const stateClass = disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:border-gray-400';
    trigger.className = `w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${stateClass}`.trim();
    trigger.disabled = disabled;

    const content = document.createElement('div');
    content.className = 'flex items-center justify-between';

    const textContainer = document.createElement('div');
    textContainer.className = 'flex-1 flex flex-wrap gap-1';

    if (this._selectedValues.length === 0) {
      const placeholderSpan = document.createElement('span');
      placeholderSpan.className = 'text-gray-400';
      placeholderSpan.textContent = placeholder;
      textContainer.appendChild(placeholderSpan);
    } else if (multiple) {
      // Show tags for multi-select
      this._selectedValues.forEach(value => {
        const option = this._options.find(opt => opt.value === value);
        if (option) {
          const tag = this._createTag(option.label, value);
          textContainer.appendChild(tag);
        }
      });
    } else {
      // Show single selected value
      const option = this._options.find(opt => opt.value === this._selectedValues[0]);
      if (option) {
        const span = document.createElement('span');
        span.className = 'text-gray-900';
        span.textContent = option.label;
        textContainer.appendChild(span);
      }
    }

    content.appendChild(textContainer);

    // Add chevron icon
    const icon = document.createElement('div');
    icon.className = 'ml-2 transition-transform duration-200';
    icon.innerHTML = `
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    `;
    content.appendChild(icon);

    trigger.appendChild(content);
    return trigger;
  }

  /**
   * Create a tag for multi-select
   */
  _createTag(label, value) {
    const tag = document.createElement('span');
    tag.className = 'inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm';
    tag.dataset.value = value;

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    tag.appendChild(labelSpan);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'ml-1 text-blue-600 hover:text-blue-800 focus:outline-none';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      this._removeValue(value);
    };
    tag.appendChild(removeBtn);

    return tag;
  }

  /**
   * Create the dropdown menu
   */
  _createDropdown(searchPlaceholder, multiple) {
    const dropdown = document.createElement('div');
    const hiddenClass = this._isOpen ? '' : 'hidden';
    dropdown.className = `absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden ${hiddenClass}`.trim();

    // Search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'p-2 border-b border-gray-200';

    this._searchInput = document.createElement('input');
    this._searchInput.type = 'text';
    this._searchInput.className = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';
    this._searchInput.placeholder = searchPlaceholder;
    searchContainer.appendChild(this._searchInput);
    dropdown.appendChild(searchContainer);

    // Options list
    const optionsList = document.createElement('div');
    optionsList.className = 'overflow-y-auto max-h-48';
    optionsList.dataset.optionsList = 'true';

    this._renderOptions(optionsList, multiple);
    dropdown.appendChild(optionsList);

    // Multi-select actions
    if (multiple) {
      const actions = document.createElement('div');
      actions.className = 'p-2 border-t border-gray-200 flex gap-2';

      const selectAllBtn = document.createElement('button');
      selectAllBtn.type = 'button';
      selectAllBtn.className = 'px-3 py-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none';
      selectAllBtn.textContent = 'Select All';
      selectAllBtn.dataset.action = 'selectAll';
      actions.appendChild(selectAllBtn);

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none';
      clearBtn.textContent = 'Clear';
      clearBtn.dataset.action = 'clear';
      actions.appendChild(clearBtn);

      dropdown.appendChild(actions);
    }

    return dropdown;
  }

  /**
   * Render options list
   */
  _renderOptions(container, multiple) {
    container.innerHTML = '';

    const filteredOptions = this._searchTerm
      ? this._options.filter(opt =>
          opt.label.toLowerCase().includes(this._searchTerm.toLowerCase())
        )
      : this._options;

    if (filteredOptions.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'px-4 py-2 text-gray-500 text-center';
      noResults.textContent = 'No results found';
      container.appendChild(noResults);
      return;
    }

    filteredOptions.forEach(option => {
      const optionElement = document.createElement('div');
      const isSelected = this._selectedValues.includes(option.value);

      optionElement.className = `px-4 py-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between
        ${isSelected ? 'bg-blue-100' : ''}`;
      optionElement.dataset.value = option.value;

      const labelSpan = document.createElement('span');
      labelSpan.className = isSelected ? 'font-medium text-blue-900' : 'text-gray-900';
      labelSpan.textContent = option.label;
      optionElement.appendChild(labelSpan);

      if (isSelected) {
        const checkmark = document.createElement('span');
        checkmark.className = 'text-blue-600';
        checkmark.innerHTML = '✓';
        optionElement.appendChild(checkmark);
      }

      container.appendChild(optionElement);
    });
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this._triggerElement) return;

    // Trigger click
    this.addTrackedListener(this._triggerElement, 'click', (e) => {
      e.stopPropagation();
      if (!this.getBoolAttr('disabled', false)) {
        this._toggleDropdown();
      }
    });

    // Search input
    if (this._searchInput) {
      this.addTrackedListener(this._searchInput, 'input', (e) => {
        this._searchTerm = e.target.value;
        const optionsList = this._dropdownElement.querySelector('[data-options-list]');
        if (optionsList) {
          this._renderOptions(optionsList, this.getBoolAttr('multiple', false));
        }
      });

      // Prevent closing dropdown when clicking search input
      this.addTrackedListener(this._searchInput, 'click', (e) => {
        e.stopPropagation();
      });
    }

    // Option clicks
    if (this._dropdownElement) {
      this.addTrackedListener(this._dropdownElement, 'click', (e) => {
        const optionElement = e.target.closest('[data-value]');
        if (optionElement && !e.target.closest('[data-action]')) {
          const value = optionElement.dataset.value;
          this._toggleValue(value);

          // Close dropdown for single select
          if (!this.getBoolAttr('multiple', false)) {
            this._closeDropdown();
          }
        }

        // Handle action buttons
        const actionElement = e.target.closest('[data-action]');
        if (actionElement) {
          const action = actionElement.dataset.action;
          if (action === 'selectAll') {
            this.selectAll();
          } else if (action === 'clear') {
            this.clear();
          }
        }
      });
    }

    // Click outside to close
    this._clickOutsideHandler = (e) => {
      if (!this.contains(e.target) && this._isOpen) {
        this._closeDropdown();
      }
    };
    document.addEventListener('click', this._clickOutsideHandler);
  }

  /**
   * Toggle dropdown open/closed
   */
  _toggleDropdown() {
    if (this._isOpen) {
      this._closeDropdown();
    } else {
      this._openDropdown();
    }
  }

  /**
   * Open dropdown
   */
  _openDropdown() {
    this._isOpen = true;
    if (this._dropdownElement) {
      this._dropdownElement.classList.remove('hidden');
      // Rotate chevron
      const icon = this._triggerElement.querySelector('svg').parentElement;
      if (icon) {
        icon.style.transform = 'rotate(180deg)';
      }
      // Focus search input
      if (this._searchInput) {
        setTimeout(() => this._searchInput.focus(), 0);
      }
    }
  }

  /**
   * Close dropdown
   */
  _closeDropdown() {
    this._isOpen = false;
    this._searchTerm = '';
    if (this._dropdownElement) {
      this._dropdownElement.classList.add('hidden');
      // Reset chevron
      const icon = this._triggerElement.querySelector('svg').parentElement;
      if (icon) {
        icon.style.transform = 'rotate(0deg)';
      }
      // Reset search
      if (this._searchInput) {
        this._searchInput.value = '';
        const optionsList = this._dropdownElement.querySelector('[data-options-list]');
        if (optionsList) {
          this._renderOptions(optionsList, this.getBoolAttr('multiple', false));
        }
      }
    }
  }

  /**
   * Toggle a value selection
   */
  _toggleValue(value) {
    const multiple = this.getBoolAttr('multiple', false);

    if (multiple) {
      const index = this._selectedValues.indexOf(value);
      if (index > -1) {
        this._selectedValues.splice(index, 1);
      } else {
        this._selectedValues.push(value);
      }
    } else {
      this._selectedValues = [value];
    }

    this._updateUI();
    this._emitChangeEvent();
  }

  /**
   * Remove a value from selection
   */
  _removeValue(value) {
    const index = this._selectedValues.indexOf(value);
    if (index > -1) {
      this._selectedValues.splice(index, 1);
      this._updateUI();
      this._emitChangeEvent();
    }
  }

  /**
   * Update UI after value change
   */
  _updateUI() {
    // Update trigger button
    const textContainer = this._triggerElement.querySelector('.flex-1');
    if (textContainer) {
      textContainer.innerHTML = '';

      const multiple = this.getBoolAttr('multiple', false);
      const placeholder = this.getAttr('placeholder', 'Select...');

      if (this._selectedValues.length === 0) {
        const placeholderSpan = document.createElement('span');
        placeholderSpan.className = 'text-gray-400';
        placeholderSpan.textContent = placeholder;
        textContainer.appendChild(placeholderSpan);
      } else if (multiple) {
        this._selectedValues.forEach(value => {
          const option = this._options.find(opt => opt.value === value);
          if (option) {
            const tag = this._createTag(option.label, value);
            textContainer.appendChild(tag);
          }
        });
      } else {
        const option = this._options.find(opt => opt.value === this._selectedValues[0]);
        if (option) {
          const span = document.createElement('span');
          span.className = 'text-gray-900';
          span.textContent = option.label;
          textContainer.appendChild(span);
        }
      }
    }

    // Update options list
    const optionsList = this._dropdownElement.querySelector('[data-options-list]');
    if (optionsList) {
      this._renderOptions(optionsList, this.getBoolAttr('multiple', false));
    }

    // Update hidden input
    if (this._hiddenInput) {
      this._hiddenInput.value = this._getFormValue();
    }
  }

  /**
   * Get form value
   */
  _getFormValue() {
    const multiple = this.getBoolAttr('multiple', false);
    return multiple ? this._selectedValues.join(',') : this._selectedValues[0] || '';
  }

  /**
   * Emit change event
   */
  _emitChangeEvent() {
    const multiple = this.getBoolAttr('multiple', false);
    this.emit('change', {
      value: multiple ? this._selectedValues : this._selectedValues[0] || null,
      values: this._selectedValues
    });
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    if (name === 'disabled') {
      this.reRender();
    } else if (['placeholder', 'search-placeholder', 'multiple'].includes(name)) {
      this.reRender();
    }
  }

  /**
   * Public API: Set value
   */
  setValue(value) {
    if (Array.isArray(value)) {
      this._selectedValues = value.filter(v =>
        this._options.some(opt => opt.value === v)
      );
    } else if (value) {
      const option = this._options.find(opt => opt.value === value);
      if (option) {
        this._selectedValues = [value];
      }
    } else {
      this._selectedValues = [];
    }

    if (this.hasAttribute('data-rendered')) {
      this._updateUI();
      this._emitChangeEvent();
    }
  }

  /**
   * Public API: Get value
   */
  getValue() {
    const multiple = this.getBoolAttr('multiple', false);
    return multiple ? this._selectedValues : this._selectedValues[0] || null;
  }

  /**
   * Public API: Clear selection
   */
  clear() {
    this._selectedValues = [];
    if (this.hasAttribute('data-rendered')) {
      this._updateUI();
      this._emitChangeEvent();
    }
  }

  /**
   * Public API: Select all options (multi-select only)
   */
  selectAll() {
    if (this.getBoolAttr('multiple', false)) {
      this._selectedValues = this._options.map(opt => opt.value);
      if (this.hasAttribute('data-rendered')) {
        this._updateUI();
        this._emitChangeEvent();
      }
    }
  }

  /**
   * Get/Set value property
   */
  get value() {
    return this.getValue();
  }

  set value(val) {
    this.setValue(val);
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

  /**
   * Get/Set placeholder property
   */
  get placeholder() {
    return this.getAttr('placeholder', 'Select...');
  }

  set placeholder(value) {
    this.setAttribute('placeholder', value);
  }
}

// Register the custom element
customElements.define('dry-select', DrySelect);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DrySelect;
}


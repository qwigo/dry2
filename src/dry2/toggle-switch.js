/**
 * DRY2 Toggle Switch Component
 * A customizable toggle switch component for binary states with accessibility support
 * Built with vanilla JavaScript using BaseElement
 */

class ToggleSwitch extends BaseElement {
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
    return [
      'name',
      'checked',
      'disabled',
      'size',
      'label',
      'value',
      'active-bg',
      'inactive-bg',
      'switch-color'
    ];
  }

  constructor() {
    super();
    this._checkbox = null;
    this._label = null;
    this._switchElement = null;
    this._checked = false;
    this._originalSlotContent = null;
  }

  /**
   * Override connectedCallback to set initial state
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Set initial checked state from attribute
      this._checked = this.getBoolAttr('checked', false);
    }
    
    super.connectedCallback();
  }

  /**
   * Called before rendering - capture slot content here after DOM is fully parsed
   */
  beforeRender() {
    // Capture any slot content before rendering (after DOM is fully parsed)
    if (!this._originalSlotContent) {
      this._originalSlotContent = this.innerHTML.trim();
    }
  }

  /**
   * Main render method
   */
  render() {
    const name = this.getAttr('name', '');
    const disabled = this.getBoolAttr('disabled', false);
    const size = this.getAttr('size', 'md');
    const label = this.getAttr('label', '');
    const value = this.getAttr('value', 'true');
    const activeBg = this.getAttr('active-bg', 'bg-blue-500');
    const inactiveBg = this.getAttr('inactive-bg', 'bg-gray-300');
    const switchColor = this.getAttr('switch-color', 'bg-white');

    // Get size classes
    const sizeClasses = this._getSizeClasses(size);

    // Build the toggle switch HTML
    const toggleId = this.id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
    
    // Clear existing content
    if (typeof this.replaceChildren === 'function') {
      this.replaceChildren();
    } else {
      this.textContent = '';
    }

    // Create container
    const container = document.createElement('div');
    container.className = 'toggle-switch-container flex items-center gap-3';

    // Create the toggle switch structure
    const toggleWrapper = document.createElement('div');
    toggleWrapper.className = 'relative inline-block flex-shrink-0';

    // Create hidden checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = toggleId;
    checkbox.name = name;
    checkbox.value = value;
    checkbox.checked = this._checked;
    checkbox.disabled = disabled;
    checkbox.className = 'sr-only toggle-checkbox';
    checkbox.setAttribute('role', 'switch');
    checkbox.setAttribute('aria-checked', this._checked.toString());
    
    if (label) {
      checkbox.setAttribute('aria-label', label);
    }

    // Create label for the toggle (this is the actual switch)
    const toggleLabel = document.createElement('label');
    toggleLabel.htmlFor = toggleId;
    toggleLabel.className = `toggle-switch-label relative flex items-center cursor-pointer rounded-full transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    toggleLabel.style.width = sizeClasses.width;
    toggleLabel.style.height = sizeClasses.height;

    // Create the background track
    const track = document.createElement('span');
    track.className = `toggle-track absolute inset-0 rounded-full transition-colors duration-200 ${this._checked ? activeBg : inactiveBg}`;

    // Create the toggle switch (thumb) - positioned absolutely
    const thumb = document.createElement('span');
    thumb.className = `toggle-thumb absolute rounded-full ${switchColor} shadow-md transition-transform duration-200 ease-in-out`;
    thumb.style.width = sizeClasses.thumbSize;
    thumb.style.height = sizeClasses.thumbSize;
    thumb.style.left = sizeClasses.padding;
    thumb.style.top = '50%';
    thumb.style.transform = this._checked ? `translateY(-50%) ${sizeClasses.translateChecked}` : 'translateY(-50%) translateX(0)';
    thumb.style.transition = 'transform 0.2s ease-in-out';

    // Assemble the toggle
    toggleLabel.appendChild(track);
    toggleLabel.appendChild(thumb);
    toggleWrapper.appendChild(checkbox);
    toggleWrapper.appendChild(toggleLabel);
    container.appendChild(toggleWrapper);

    // Add label text if provided
    if (label) {
      const labelText = document.createElement('label');
      labelText.htmlFor = toggleId;
      labelText.className = 'text-gray-700 cursor-pointer select-none font-medium';
      labelText.textContent = label;
      container.appendChild(labelText);
    }

    // Add slot content if provided
    if (this._originalSlotContent) {
      const slotDiv = document.createElement('div');
      slotDiv.className = 'toggle-slot-content flex-1';
      slotDiv.innerHTML = this._originalSlotContent;
      container.appendChild(slotDiv);
    }

    // Append to the component
    this.appendChild(container);

    // Store references
    this._checkbox = checkbox;
    this._label = toggleLabel;
    this._switchElement = thumb;
    this._track = track;
  }

  /**
   * Get size-specific classes and dimensions
   */
  _getSizeClasses(size) {
    const sizes = {
      sm: {
        width: '36px',
        height: '20px',
        thumbSize: '16px',
        padding: '2px',
        translateChecked: 'translateX(16px)'
      },
      md: {
        width: '48px',
        height: '26px',
        thumbSize: '22px',
        padding: '2px',
        translateChecked: 'translateX(22px)'
      },
      lg: {
        width: '64px',
        height: '34px',
        thumbSize: '30px',
        padding: '2px',
        translateChecked: 'translateX(30px)'
      }
    };
    return sizes[size] || sizes.md;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (this._checkbox) {
      this.addTrackedListener(this._checkbox, 'change', this._handleChange.bind(this));
    }
  }

  /**
   * Handle checkbox change event
   */
  _handleChange(event) {
    this._checked = event.target.checked;
    
    // Update UI
    this._updateUI();

    // Emit custom event
    this.emit('toggle:changed', {
      checked: this._checked,
      value: this._checkbox.value,
      name: this._checkbox.name
    });
  }

  /**
   * Update UI based on checked state
   */
  _updateUI() {
    if (!this._checkbox || !this._switchElement || !this._track) return;

    const activeBg = this.getAttr('active-bg', 'bg-blue-500');
    const inactiveBg = this.getAttr('inactive-bg', 'bg-gray-300');
    const size = this.getAttr('size', 'md');
    const sizeClasses = this._getSizeClasses(size);

    // Update checkbox state
    this._checkbox.checked = this._checked;
    this._checkbox.setAttribute('aria-checked', this._checked.toString());

    // Update track background
    this._track.className = `toggle-track absolute inset-0 rounded-full transition-colors duration-200 ${this._checked ? activeBg : inactiveBg}`;

    // Update thumb position
    this._switchElement.style.transform = this._checked ? `translateY(-50%) ${sizeClasses.translateChecked}` : 'translateY(-50%) translateX(0)';
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    if (name === 'checked') {
      this._checked = this.getBoolAttr('checked', false);
      this._updateUI();
    } else if (name === 'disabled') {
      const disabled = this.getBoolAttr('disabled', false);
      if (this._checkbox) {
        this._checkbox.disabled = disabled;
      }
      if (this._label) {
        if (disabled) {
          this._label.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
          this._label.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      }
    } else {
      // Re-render for other attribute changes
      this.reRender();
    }
  }

  /**
   * Public API: Toggle the switch
   */
  toggle() {
    if (!this.disabled) {
      this._checked = !this._checked;
      this._updateUI();
      
      // Trigger change event
      if (this._checkbox) {
        const event = new Event('change', { bubbles: true });
        this._checkbox.dispatchEvent(event);
      }
    }
  }

  /**
   * Public API: Set switch to checked state
   */
  check() {
    if (!this.disabled && !this._checked) {
      this._checked = true;
      this._updateUI();
      
      if (this._checkbox) {
        const event = new Event('change', { bubbles: true });
        this._checkbox.dispatchEvent(event);
      }
    }
  }

  /**
   * Public API: Set switch to unchecked state
   */
  uncheck() {
    if (!this.disabled && this._checked) {
      this._checked = false;
      this._updateUI();
      
      if (this._checkbox) {
        const event = new Event('change', { bubbles: true });
        this._checkbox.dispatchEvent(event);
      }
    }
  }

  /**
   * Public API: Enable the switch
   */
  enable() {
    this.removeAttribute('disabled');
  }

  /**
   * Public API: Disable the switch
   */
  disable() {
    this.setAttribute('disabled', '');
  }

  /**
   * Get/Set checked property
   */
  get checked() {
    return this._checked;
  }

  set checked(value) {
    const newValue = Boolean(value);
    if (newValue !== this._checked) {
      this._checked = newValue;
      if (this.hasAttribute('data-rendered')) {
        if (newValue) {
          this.setAttribute('checked', '');
        } else {
          this.removeAttribute('checked');
        }
      }
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
   * Get/Set name property
   */
  get name() {
    return this.getAttr('name', '');
  }

  set name(value) {
    this.setAttribute('name', value);
  }

  /**
   * Get/Set value property
   */
  get value() {
    return this.getAttr('value', 'true');
  }

  set value(val) {
    this.setAttribute('value', val);
  }

  /**
   * Get/Set size property
   */
  get size() {
    return this.getAttr('size', 'md');
  }

  set size(value) {
    this.setAttribute('size', value);
  }

  /**
   * Get/Set label property
   */
  get label() {
    return this.getAttr('label', '');
  }

  set label(value) {
    this.setAttribute('label', value);
  }
}

// Register the custom element
customElements.define('toggle-switch', ToggleSwitch);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToggleSwitch;
}



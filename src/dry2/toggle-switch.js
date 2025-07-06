class ToggleSwitch extends BaseElement {
  constructor() {
    super();
    this._hiddenInput = null;
  }

  static get observedAttributes() {
    return ['name', 'checked', 'disabled', 'size', 'label', 'value', 'active-bg', 'inactive-bg', 'switch-color', 'required'];
  }

  _initializeComponent() {
    // Store original content
    const originalContent = this.innerHTML;

    // Create the component structure with Alpine.js
    this._render(originalContent);

    // Create hidden input for form integration
    this._createHiddenInput();
  }

  _render(originalContent) {
    const labelText = this.label;
    const isChecked = this.hasAttribute('checked');
    const isDisabled = this.disabled;
    const size = this.size;
    const activeBg = this.activeBg;
    const inactiveBg = this.inactiveBg;
    const switchColor = this.switchColor;

    this.innerHTML = `
            <div x-data="{
                checked: ${isChecked},
                disabled: ${isDisabled},
                size: '${size}',
                activeBg: '${activeBg}',
                inactiveBg: '${inactiveBg}',
                switchColor: '${switchColor}',
                toggle() {
                    if (!this.disabled) {
                        this.checked = !this.checked;
                        this.$dispatch('toggle:changed', {
                            checked: this.checked,
                            value: this.checked ? '${this.value}' : '',
                            name: '${this.name}',
                            component: this.$el.closest('toggle-switch')
                        });
                        this.$el.closest('toggle-switch')._updateHiddenInput();
                    }
                },
                getSwitchClasses() {
                    let classes = 'relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ';
                    
                    // Size classes
                    if (this.size === 'sm') {
                        classes += 'h-4 w-7 ';
                    } else if (this.size === 'lg') {
                        classes += 'h-8 w-14 ';
                    } else {
                        classes += 'h-6 w-11 ';
                    }
                    
                    // Background color based on state
                    classes += this.checked ? this.activeBg : this.inactiveBg;
                    
                    return classes;
                },
                getThumbClasses() {
                    let classes = 'absolute rounded-full shadow-md transition-all duration-300 ease-in-out ';
                    classes += this.switchColor + ' ';
                    
                    // Size and position classes
                    if (this.size === 'sm') {
                        classes += 'h-3 w-3 ';
                        classes += this.checked ? 'translate-x-3.5' : 'translate-x-0.5';
                    } else if (this.size === 'lg') {
                        classes += 'h-6 w-6 ';
                        classes += this.checked ? 'translate-x-7' : 'translate-x-1';
                    } else {
                        classes += 'h-4 w-4 ';
                        classes += this.checked ? 'translate-x-6' : 'translate-x-1';
                    }
                    
                    return classes;
                }
            }" 
            :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
            class="toggle-switch-container">
                <div class="flex items-center" @click="toggle()">
                    <div 
                        :class="getSwitchClasses()" 
                        role="switch" 
                        :aria-checked="checked" 
                        :tabindex="disabled ? '-1' : '0'"
                        @keydown.enter="toggle()"
                        @keydown.space.prevent="toggle()">
                        <div :class="getThumbClasses()"></div>
                    </div>
                    ${labelText ? `<span class="toggle-label ml-3 text-sm font-medium text-gray-700 dark:text-gray-200">${this._escapeHtml(labelText)}</span>` : ''}
                </div>
                ${originalContent ? `<div class="toggle-content mt-2 text-gray-800 dark:text-gray-200">${originalContent}</div>` : ''}
            </div>
        `;
  }

  _getAlpineData() {
    return this.querySelector('[x-data]')?.__x?.$data;
  }

  _createHiddenInput() {
    // Remove existing hidden input if any
    if (this._hiddenInput && this._hiddenInput.parentNode) {
      this._hiddenInput.parentNode.removeChild(this._hiddenInput);
    }

    if (this.name) {
      this._hiddenInput = document.createElement('input');
      this._hiddenInput.type = 'checkbox';
      this._hiddenInput.name = this.name;
      this._hiddenInput.value = this.value;
      this._hiddenInput.style.position = 'absolute';
      this._hiddenInput.style.opacity = '0';
      this._hiddenInput.style.pointerEvents = 'none';
      this._hiddenInput.style.width = '1px';
      this._hiddenInput.style.height = '1px';

      // Set initial checked state
      this._hiddenInput.checked = this.hasAttribute('checked');

      // Copy required attribute
      if (this.hasAttribute('required')) {
        this._hiddenInput.required = true;
      }

      this.appendChild(this._hiddenInput);

      // Listen for form reset events
      const form = this.closest('form');
      if (form) {
        form.addEventListener('reset', this._handleFormReset.bind(this));
      }
    }
  }

  _updateHiddenInput() {
    if (this._hiddenInput) {
      const alpineData = this._getAlpineData();
      const isChecked = alpineData ? alpineData.checked : this.hasAttribute('checked');
      this._hiddenInput.checked = isChecked;

      // Trigger form change events
      this._hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      this._hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // Form integration methods
  get form() {
    return this._hiddenInput ? this._hiddenInput.form : this.closest('form');
  }

  get validity() {
    return this._hiddenInput ? this._hiddenInput.validity : { valid: true };
  }

  checkValidity() {
    return this._hiddenInput ? this._hiddenInput.checkValidity() : true;
  }

  reportValidity() {
    return this._hiddenInput ? this._hiddenInput.reportValidity() : true;
  }

  setCustomValidity(message) {
    if (this._hiddenInput) {
      this._hiddenInput.setCustomValidity(message);
    }
  }

  _handleFormReset() {
    // Reset to initial checked state on form reset
    setTimeout(() => {
      const initialChecked = this.hasAttribute('checked');
      const alpineData = this._getAlpineData();
      if (alpineData) {
        alpineData.checked = initialChecked;
      }
      if (this._hiddenInput) {
        this._hiddenInput.checked = initialChecked;
      }
    }, 0);
  }

  _escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Public API methods
  toggle() {
    const alpineData = this._getAlpineData();
    if (alpineData && !alpineData.disabled) {
      alpineData.toggle();
    }
  }

  check() {
    const alpineData = this._getAlpineData();
    if (alpineData && !alpineData.disabled) {
      alpineData.checked = true;
      this._updateHiddenInput();
    }
  }

  uncheck() {
    const alpineData = this._getAlpineData();
    if (alpineData && !alpineData.disabled) {
      alpineData.checked = false;
      this._updateHiddenInput();
    }
  }

  enable() {
    this.disabled = false;
  }

  disable() {
    this.disabled = true;
  }

  // Getters and setters
  get name() {
    return this._getAttributeWithDefault('name', '');
  }

  set name(value) {
    this._setAttribute('name', value);
  }

  get checked() {
    const alpineData = this._getAlpineData();
    return alpineData ? alpineData.checked : this._getBooleanAttribute('checked');
  }

  set checked(value) {
    const newValue = Boolean(value);
    const alpineData = this._getAlpineData();

    this._setBooleanAttribute('checked', newValue);

    if (alpineData) {
      alpineData.checked = newValue;
      this._updateHiddenInput();
    }
  }

  get disabled() {
    return this._getBooleanAttribute('disabled');
  }

  set disabled(value) {
    const alpineData = this._getAlpineData();

    this._setBooleanAttribute('disabled', value);

    if (alpineData) {
      alpineData.disabled = Boolean(value);
    }
  }

  get size() {
    return this._getAttributeWithDefault('size', 'md');
  }

  set size(value) {
    this._setAttribute('size', value);
  }

  get label() {
    return this._getAttributeWithDefault('label', '');
  }

  set label(value) {
    this._setAttribute('label', value);
  }

  get value() {
    return this._getAttributeWithDefault('value', 'true');
  }

  set value(value) {
    this._setAttribute('value', value);
  }

  get activeBg() {
    return this._getAttributeWithDefault('active-bg', 'bg-blue-500 dark:bg-blue-700');
  }

  set activeBg(value) {
    this._setAttribute('active-bg', value);
  }

  get inactiveBg() {
    return this._getAttributeWithDefault('inactive-bg', 'bg-gray-300 dark:bg-gray-600');
  }

  set inactiveBg(value) {
    this._setAttribute('inactive-bg', value);
  }

  get switchColor() {
    return this._getAttributeWithDefault('switch-color', 'bg-white dark:bg-gray-50');
  }

  set switchColor(value) {
    this._setAttribute('switch-color', value);
  }

  get required() {
    return this._getBooleanAttribute('required');
  }

  set required(value) {
    this._setBooleanAttribute('required', value);

    if (this._hiddenInput) {
      this._hiddenInput.required = Boolean(value);
    }
  }

  // Additional checkbox-like properties
  get type() {
    return 'checkbox';
  }

  get defaultChecked() {
    return this._getBooleanAttribute('checked');
  }

  set defaultChecked(value) {
    this._setBooleanAttribute('checked', value);
  }

  get indeterminate() {
    return this._hiddenInput ? this._hiddenInput.indeterminate : false;
  }

  set indeterminate(value) {
    if (this._hiddenInput) {
      this._hiddenInput.indeterminate = Boolean(value);
    }
  }

  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isInitialized) {
      if (name === 'checked') {
        this.checked = newValue !== null && newValue !== 'false';
        this._render();
      } else if (name === 'disabled') {
        this.disabled = newValue !== null && newValue !== 'false';
        this._render();
      } else if (name === 'size') {
        this.size = newValue;
        this._render();
      } else if (name === 'on-label') {
        this.onLabel = newValue;
        this._render();
      } else if (name === 'off-label') {
        this.offLabel = newValue;
        this._render();
      }
    }
  }
}

customElements.define('toggle-switch', ToggleSwitch);

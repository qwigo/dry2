class DrySelect extends BaseElement {
  _initializeComponent() {
    // Get original options before we replace innerHTML
    const originalOptions = Array.from(this.querySelectorAll('option')).map(option => ({
      value: option.value,
      text: option.textContent.trim(),
      disabled: option.disabled,
      selected: option.selected
    }));

    // Get attributes
    const isMultiple = this.hasAttribute('multiple');
    const isDisabled = this.hasAttribute('disabled');
    const placeholder = this.getAttribute('placeholder') || 'Select an option';
    const searchPlaceholder = this.getAttribute('search-placeholder') || 'Search options...';
    const buttonClass = this.getAttribute('button-class') ||
        'w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all';
    const dropdownClass = this.getAttribute('dropdown-class') ||
        'absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-auto';
    const maxHeight = this.getAttribute('max-height') || '15rem';
    const name = this.getAttribute('name') || '';

    // Initialize selected values
    const initialSelected = originalOptions
        .filter(option => option.selected)
        .map(option => option.value);

    // Store data in element for Alpine to access
    this._componentData = {
      originalOptions,
      isMultiple,
      isDisabled,
      placeholder,
      searchPlaceholder,
      initialSelected
    };

    // Create the complete template with Alpine directives
    this.innerHTML = `
      <div class="relative" 
           x-data="{
             isOpen: false,
             searchValue: '',
             selectedValues: $el.parentElement._componentData.initialSelected,
             options: $el.parentElement._componentData.originalOptions,
             focusedIndex: -1,
             isMultiple: $el.parentElement._componentData.isMultiple,
             isDisabled: $el.parentElement._componentData.isDisabled,
             placeholder: $el.parentElement._componentData.placeholder,
             searchPlaceholder: $el.parentElement._componentData.searchPlaceholder,
             isClickingButton: false,
             
             get filteredOptions() {
               if (!this.searchValue) return this.options;
               return this.options.filter(option =>
                 option.text.toLowerCase().includes(this.searchValue.toLowerCase())
               );
             },
             
             get availableOptions() {
               return this.filteredOptions.filter(option =>
                 !option.disabled && (!this.isMultiple || !this.selectedValues.includes(option.value))
               );
             },
             
             get inputPlaceholder() {
               if (this.isMultiple) {
                 return this.selectedValues.length > 0 ? this.searchPlaceholder : this.placeholder;
               } else {
                 return this.selectedValues.length > 0 ? '' : this.placeholder;
               }
             },
             
             selectOption(value) {
               const option = this.options.find(opt => opt.value === value);
               if (!option || option.disabled) return;

               if (this.isMultiple) {
                 if (!this.selectedValues.includes(value)) {
                   this.selectedValues.push(value);
                 }
                 this.searchValue = '';
               } else {
                 this.selectedValues = [value];
                 this.searchValue = option.text;
                 this.isOpen = false;
               }

               this.focusedIndex = -1;
               this.dispatchChange();
             },
             
             removeOption(value) {
               this.selectedValues = this.selectedValues.filter(v => v !== value);
               this.dispatchChange();
             },
             
             clearAll() {
               this.selectedValues = [];
               this.searchValue = '';
               this.dispatchChange();
             },
             
             toggle() {
               if (this.isDisabled) return;
               this.isOpen = !this.isOpen;
               if (this.isOpen) {
                 // Focus the input when opening via button click
                 this.$nextTick(() => {
                   this.$refs.searchInput.focus();
                 });
               } else {
                 this.updateSearchDisplay();
               }
             },
             
             updateSearchDisplay() {
               if (!this.isMultiple && this.selectedValues.length > 0) {
                 const option = this.options.find(opt => opt.value === this.selectedValues[0]);
                 this.searchValue = option ? option.text : '';
               } else {
                 this.searchValue = '';  
               }
             },
             
             dispatchChange() {
               const value = this.isMultiple ? [...this.selectedValues] : (this.selectedValues[0] || '');
               this.$el.dispatchEvent(new CustomEvent('change', {
                 bubbles: true,
                 detail: { value }
               }));
             }
           }"
           x-init="updateSearchDisplay()"
           @click.away="isOpen = false; updateSearchDisplay()"
           @keydown.escape="isOpen = false; updateSearchDisplay()">
           
        <!-- Main Button -->
        <div
            role="combobox"
            :aria-expanded="isOpen"
            aria-haspopup="listbox"
            class="${buttonClass} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
            @mousedown="isClickingButton = true"
            @mouseup="setTimeout(() => isClickingButton = false, 10)"
            @click="toggle()"
            :tabindex="isDisabled ? -1 : 0">
            
            <div class="flex-1 flex items-center min-h-[1.5rem]">
                <!-- Multi-select pills -->
                <template x-if="isMultiple && selectedValues.length > 0">
                    <div class="flex flex-wrap gap-1 mr-2">
                        <template x-for="value in selectedValues" :key="value">
                            <div class="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-md">
                                <span x-text="options.find(opt => opt.value === value)?.text || value"></span>
                                <button 
                                    type="button" 
                                    @click.stop="removeOption(value)"
                                    class="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </template>
                    </div>
                </template>
                
                <!-- Search input -->
                <input 
                    type="text"
                    x-ref="searchInput"
                    x-model="searchValue"
                    :placeholder="inputPlaceholder"
                    @focus="!isClickingButton && (isOpen = true)"
                    @click.stop
                    @input="focusedIndex = -1; isOpen = true"
                    :disabled="isDisabled"
                    class="flex-1 border-none outline-none bg-transparent text-gray-700 placeholder-gray-400 min-w-0">
            </div>
            
            <!-- Clear button -->
            <template x-if="selectedValues.length > 0 && !isDisabled">
                <button 
                    type="button" 
                    @click.stop="clearAll()"
                    class="mr-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </template>
            
            <!-- Dropdown arrow -->
            <div class="flex items-center pointer-events-none">
                <svg 
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="{ 'transform rotate-180': isOpen }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>
        </div>
        
        <!-- Dropdown -->
        <div
            x-show="isOpen"
            x-transition:enter="transition ease-out duration-300"
            x-transition:enter-start="transform opacity-0 scale-95"
            x-transition:enter-end="transform opacity-100 scale-100"
            x-transition:leave="transition ease-in duration-200"
            x-transition:leave-start="transform opacity-100 scale-100"
            x-transition:leave-end="transform opacity-0 scale-95"
            role="listbox"
            :aria-label="placeholder"
            class="${dropdownClass}"
            style="max-height: ${maxHeight}">
            
            <template x-if="availableOptions.length === 0">
                <div class="px-3 py-2 text-gray-500 text-sm">
                    <template x-if="searchValue">
                        <span>No options found for "<span x-text="searchValue"></span>"</span>
                    </template>
                    <template x-if="!searchValue && isMultiple && selectedValues.length > 0">
                        <span>All options selected</span>
                    </template>
                    <template x-if="!searchValue && (!isMultiple || selectedValues.length === 0)">
                        <span>No options available</span>
                    </template>
                </div>
            </template>
            
            <template x-for="(option, index) in availableOptions" :key="option.value">
                <div
                    role="option"
                    :aria-selected="selectedValues.includes(option.value)"
                    class="px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 flex items-center justify-between"
                    :class="{
                        'bg-blue-50': index === focusedIndex,
                        'bg-blue-100 text-blue-700': !isMultiple && selectedValues.includes(option.value)
                    }"
                    @click="selectOption(option.value)">
                    
                    <span class="text-gray-700" x-text="option.text"></span>
                    
                    <template x-if="!isMultiple && selectedValues.includes(option.value)">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </template>
                    
                    <template x-if="isMultiple || !selectedValues.includes(option.value)">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </template>
                </div>
            </template>
        </div>
        
        <!-- Hidden inputs for form submission -->
        ${name ? (isMultiple ?
            `<template x-for="value in selectedValues" :key="value">
             <input type="hidden" name="${name}" :value="value">
           </template>` :
            `<input type="hidden" name="${name}" :value="selectedValues[0] || ''">`
    ) : ''}
      </div>
    `;

    // Ensure Alpine processes the new content
    this._ensureAlpineProcessing();
  }

  // Public API methods using Alpine's magic properties
  get value() {
    const alpineData = this._getAlpineDataFromElement();
    if (!alpineData) return this.hasAttribute('multiple') ? [] : '';
    return alpineData.isMultiple ? [...alpineData.selectedValues] : (alpineData.selectedValues[0] || '');
  }

  set value(val) {
    const alpineData = this._getAlpineDataFromElement();
    if (!alpineData) return;

    if (alpineData.isMultiple) {
      alpineData.selectedValues = Array.isArray(val) ? [...val] : [val].filter(Boolean);
    } else {
      alpineData.selectedValues = val ? [val] : [];
    }
    alpineData.updateSearchDisplay();
    alpineData.dispatchChange();
  }

  clear() {
    const alpineData = this._getAlpineDataFromElement();
    if (alpineData) {
      alpineData.clearAll();
    }
  }

  selectAll() {
    const alpineData = this._getAlpineDataFromElement();
    if (!alpineData || !alpineData.isMultiple) return;

    const allValues = alpineData.options
        .filter(option => !option.disabled)
        .map(option => option.value);

    alpineData.selectedValues = [...allValues];
    alpineData.updateSearchDisplay();
    alpineData.dispatchChange();
  }

  // Helper method to get Alpine.js data
  _getAlpineDataFromElement() {
    // Use the BaseElement's Alpine data access method
    return super._getAlpineData();
  }
}

// Register the custom element
customElements.define('dry-select', DrySelect);
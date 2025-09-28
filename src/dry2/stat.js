class DryStat extends BaseElement {
  constructor() {
    super();
  }

  _initializeComponent() {
    this.render();
  }

  static get observedAttributes() {
    return [
      'value', 'label', 'trend', 'trend-value', 'comparison', 'icon',
      'type', 'decimal-places', 'currency', 'percentage-value', 'layout', 'class'
    ];
  }

  _handleAttributeChange(name, oldValue, newValue) {
    if (this.isConnected && oldValue !== newValue) {
      this.render();
    }
  }

  // Getters for component properties
  get value() {
    return this._getAttributeWithDefault('value', '0');
  }

  set value(val) {
    this._setAttribute('value', val);
  }

  get label() {
    return this._getAttributeWithDefault('label', 'Statistic');
  }

  set label(val) {
    this._setAttribute('label', val);
  }

  get trend() {
    return this.getAttribute('trend');
  }

  set trend(val) {
    this._setAttribute('trend', val);
  }

  get trendValue() {
    return this.getAttribute('trend-value');
  }

  set trendValue(val) {
    this._setAttribute('trend-value', val);
  }

  get comparison() {
    return this.getAttribute('comparison');
  }

  set comparison(val) {
    this._setAttribute('comparison', val);
  }

  get icon() {
    return this.getAttribute('icon');
  }

  set icon(val) {
    this._setAttribute('icon', val);
  }

  get type() {
    return this._getAttributeWithDefault('type', 'number');
  }

  set type(val) {
    this._setAttribute('type', val);
  }

  get decimalPlaces() {
    const attr = this.getAttribute('decimal-places');
    if (attr !== null) {
      return parseInt(attr);
    }
    // Default decimal places based on type
    return this.type === 'currency' ? 2 : 0;
  }

  set decimalPlaces(val) {
    this._setNumericAttribute('decimal-places', val);
  }

  get currency() {
    return this._getAttributeWithDefault('currency', 'USD');
  }

  set currency(val) {
    this._setAttribute('currency', val);
  }

  get percentageValue() {
    return this._getBooleanAttribute('percentage-value');
  }

  set percentageValue(val) {
    this._setBooleanAttribute('percentage-value', val);
  }

  get layout() {
    return this._getAttributeWithDefault('layout', 'vertical');
  }

  set layout(val) {
    this._setAttribute('layout', val);
  }

  // Helper methods
  formatValue(value) {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return value; // Return as-is if not a number
    }

    if (this.type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.currency,
        minimumFractionDigits: this.decimalPlaces,
        maximumFractionDigits: this.decimalPlaces
      }).format(numValue);
    } else if (this.type === 'percentage') {
      if (this.percentageValue) {
        // Value is already in percentage format
        return numValue.toFixed(this.decimalPlaces) + '%';
      } else {
        // Convert decimal to percentage
        return (numValue * 100).toFixed(this.decimalPlaces) + '%';
      }
    } else {
      // number or default
      if (this.decimalPlaces > 0) {
        return numValue.toFixed(this.decimalPlaces);
      }
      // Add thousand separators for whole numbers
      return numValue.toLocaleString();
    }
  }

  getTrendIcon() {
    if (this.trend === 'up') {
      return `<svg class="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>`;
    } else if (this.trend === 'down') {
      return `<svg class="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                </svg>`;
    } else if (this.trend === 'neutral') {
      return `<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>`;
    } else {
      return '';
    }
  }

  getTrendColor() {
    if (this.trend === 'up') {
      return 'text-green-600 dark:text-green-400';
    } else if (this.trend === 'down') {
      return 'text-red-600 dark:text-red-400';
    } else if (this.trend === 'neutral') {
      return 'text-gray-600 dark:text-gray-400';
    } else {
      return '';
    }
  }

  // Helper method to process icons
  processIcon(icon) {
    if (!icon) return '';
    
    // Check if it's a FontAwesome class name (starts with common FA prefixes)
    const fontAwesomePattern = /^(fas|far|fab|fal|fad|fat|fass|fasr|fasl|fad|fa-)\s/;
    
    if (fontAwesomePattern.test(icon.trim())) {
      // It's a FontAwesome class, wrap it in an <i> tag
      return `<i class="${icon}"></i>`;
    } else {
      // It's raw HTML (SVG, etc.), return as-is for backward compatibility
      return icon;
    }
  }

  render() {
    const formattedValue = this.formatValue(this.value);
    const trendIcon = this.getTrendIcon();
    const trendColor = this.getTrendColor();
    const isHorizontal = this.layout === 'horizontal';
    const customClass = this.getAttribute('class') || '';
    const processedIcon = this.processIcon(this.icon);

    let html = '';

    if (isHorizontal) {
      // Horizontal layout
      html = `
                <div class="flex items-center justify-between ${customClass}">
                    <div class="flex items-center space-x-3">
                        ${processedIcon ? `<div class="flex-shrink-0">${processedIcon}</div>` : ''}
                        <div>
                            <div class="text-sm font-medium text-gray-600 dark:text-gray-400">${this.label}</div>
                            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">${formattedValue}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        ${this.trend && this.trendValue ? `
                            <div class="flex items-center ${trendColor}">
                                ${trendIcon}
                                <span class="ml-1 text-sm font-medium">${this.trendValue}</span>
                            </div>
                        ` : ''}
                        ${this.comparison ? `
                             <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${this.comparison}</div>
                         ` : ''}
                     </div>
                 </div>
             `;
     } else {
       // Vertical layout (default)
       html = `
                 <div class="${customClass}">
                     ${processedIcon ? `<div class="mb-3">${processedIcon}</div>` : ''}
                     <div class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">${formattedValue}</div>
                     <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">${this.label}</div>
                     ${this.trend && this.trendValue ? `
                         <div class="flex items-center ${trendColor}">
                             ${trendIcon}
                             <span class="ml-1 text-sm font-medium">${this.trendValue}</span>
                         </div>
                     ` : ''}
                     ${this.comparison ? `
                         <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${this.comparison}</div>
                     ` : ''}
                 </div>
             `;
     }
 
     this.innerHTML = html;
   }
 }
 
 // Register the custom element
 customElements.define('dry-stat', DryStat);
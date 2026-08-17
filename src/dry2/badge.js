class DryBadge extends BaseElement {
  static get observedAttributes() {
    return ['variant', 'size', 'position', 'dot', 'max', 'visible', 'class'];
  }

  constructor() {
    super();
    this._isRendering = false;
    this._validVariants = new Set(['primary', 'success', 'danger', 'warning', 'info']);
    this._validSizes = new Set(['sm', 'md', 'lg']);
    this._validPositions = new Set(['standalone', 'top-right', 'top-left', 'bottom-right', 'bottom-left']);
  }

  _initializeComponent() {
    try {
      // Store original content safely
      const originalContent = this._extractAndSanitizeContent();
      
      // Create the component structure with Alpine.js
      this._render(originalContent);
    } catch (error) {
      console.error('DryBadge initialization failed:', error);
      this._renderFallback();
    }
  }

  _extractAndSanitizeContent() {
    const content = this.textContent.trim();
    // Sanitize content to prevent XSS
    return this._escapeHtml(content);
  }

  _escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  _escapeForJs(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  _validateAttribute(name, value) {
    switch (name) {
      case 'variant':
        return this._validVariants.has(value) ? value : 'primary';
      case 'size':
        return this._validSizes.has(value) ? value : 'md';
      case 'position':
        return this._validPositions.has(value) ? value : 'standalone';
      case 'max':
        const maxNum = parseInt(value, 10);
        return !isNaN(maxNum) && maxNum > 0 ? maxNum : null;
      default:
        return value;
    }
  }

  _buildClassString(baseClasses, conditionalClasses) {
    const classes = [baseClasses];
    conditionalClasses.forEach(cls => cls && classes.push(cls));
    return classes.filter(Boolean).join(' ');
  }

  _getSizeClasses(size, isDot) {
    const sizeMap = {
      sm: isDot ? 'w-2 h-2' : 'px-1.5 py-0.5 text-xs min-h-[1.125rem]',
      md: isDot ? 'w-3 h-3' : 'px-2 py-0.5 text-xs min-h-[1.25rem]',
      lg: isDot ? 'w-4 h-4' : 'px-3 py-1 text-sm min-h-[1.75rem]'
    };
    return sizeMap[size] || sizeMap.md;
  }

  _getVariantClasses(variant) {
    const variantMap = {
      success: 'bg-green-500 text-white',
      danger: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-yellow-900',
      info: 'bg-blue-500 text-white',
      primary: 'bg-gray-800 text-white'
    };
    return variantMap[variant] || variantMap.primary;
  }

  _getPositionClasses(position) {
    if (position === 'standalone') return '';
    
    const positionMap = {
      'top-right': 'absolute z-10 -top-2 -right-2',
      'top-left': 'absolute z-10 -top-2 -left-2',
      'bottom-right': 'absolute z-10 bottom-4 -right-2',
      'bottom-left': 'absolute z-10 bottom-4 -left-2'
    };
    return positionMap[position] || '';
  }



  _render(originalContent) {
    if (this._isRendering) return;
    this._isRendering = true;

    try {
      const variant = this._validateAttribute('variant', this.variant);
      const size = this._validateAttribute('size', this.size);
      const position = this._validateAttribute('position', this.position);
      const isDot = this.dot;
      const max = this._validateAttribute('max', this.max);
      const visible = this.visible;

      // Use template element for safer DOM creation
      const template = document.createElement('template');
      template.innerHTML = `
        <div x-data="{
               content: '${this._escapeForJs(originalContent)}',
               variant: '${variant}',
               size: '${size}',
               position: '${position}',
               isDot: ${isDot},
               max: ${max || 'null'},
               visible: ${visible},
               
               getBadgeClasses() {
                 const baseClasses = 'badge inline-flex items-center justify-center font-medium leading-none transition-all duration-200 rounded-full';
                 let sizeClasses = '';
                 let variantClasses = '';
                 let positionClasses = '';
                 
                 // Size classes
                 if (this.isDot) {
                   sizeClasses = this.size === 'sm' ? 'w-2 h-2' : 
                               this.size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
                 } else {
                   sizeClasses = this.size === 'sm' ? 'px-1.5 py-0.5 text-xs min-h-[1.125rem]' :
                               this.size === 'lg' ? 'px-3 py-1 text-sm min-h-[1.75rem]' :
                               'px-2 py-0.5 text-xs min-h-[1.25rem]';
                 }
                 
                 // Variant classes
                 variantClasses = this.variant === 'success' ? 'bg-green-500 text-white' :
                                this.variant === 'danger' ? 'bg-red-500 text-white' :
                                this.variant === 'warning' ? 'bg-yellow-500 text-yellow-900' :
                                this.variant === 'info' ? 'bg-blue-500 text-white' :
                                'bg-gray-800 text-white';
                 
                 // Position classes
                 if (this.position !== 'standalone') {
                   positionClasses = 'absolute z-10 ' + 
                     (this.position === 'top-right' ? '-top-2 -right-2' :
                      this.position === 'top-left' ? '-top-2 -left-2' :
                      this.position === 'bottom-right' ? 'bottom-4 -right-2' :
                      this.position === 'bottom-left' ? 'bottom-4 -left-2' : '');
                 }
                 
                 return [baseClasses, sizeClasses, variantClasses, positionClasses]
                   .filter(cls => cls.length > 0).join(' ');
               },
               
               getContainerClasses() {
                 return 'badge-container inline-block';
               },
               
               getDisplayContent() {
                 if (this.isDot) return '';
                 if (this.max && !isNaN(this.content) && parseInt(this.content) > this.max) {
                   return this.max + '+';
                 }
                 return this.content;
               },
               
               shouldShowBadge() {
                 return this.visible && (this.isDot || this.content.length > 0);
               }
             }"
             :class="getContainerClasses()"
             x-show="visible"
             x-transition:enter="transition-all duration-200 ease-out"
             x-transition:enter-start="opacity-0 scale-75"
             x-transition:enter-end="opacity-100 scale-100"
             x-transition:leave="transition-all duration-150 ease-in"
             x-transition:leave-start="opacity-100 scale-100"
             x-transition:leave-end="opacity-0 scale-75">
          <span :class="getBadgeClasses()"
                x-show="shouldShowBadge()"
                x-text="getDisplayContent()">
          </span>
        </div>
      `;

      // Clear and append new content
      this.innerHTML = '';
      this.appendChild(template.content.cloneNode(true));
    } catch (error) {
      console.error('DryBadge render failed:', error);
      this._renderFallback();
    } finally {
      this._isRendering = false;
    }
  }

  _renderFallback() {
    // Fallback rendering without Alpine.js for critical failures
    const content = this._extractAndSanitizeContent();
    const variant = this._validateAttribute('variant', this.variant);
    const size = this._validateAttribute('size', this.size);
    const isDot = this.dot;
    
    if (!this.visible || (!isDot && !content)) {
      this.style.display = 'none';
      return;
    }

    const badgeClasses = this._buildClassString(
      'badge inline-flex items-center justify-center font-medium leading-none rounded-full',
      [
        this._getSizeClasses(size, isDot),
        this._getVariantClasses(variant),
        this._getPositionClasses(this.position)
      ]
    );

    this.innerHTML = `
      <div class="badge-container inline-block">
        <span class="${badgeClasses}">${isDot ? '' : content}</span>
      </div>
    `;
  }

  _updateAlpineProperty(property, value) {
    // Resolved live rather than cached. The previous implementation
    // cached the scope on a setTimeout via the Alpine *v2* __x API, so
    // against this library's Alpine ^3 peer dependency the reference was
    // permanently null and every "optimized" attribute path below fell
    // through to a full re-render. Caching was also unsafe on its own
    // terms: _render() replaces innerHTML, which detaches the element the
    // cached scope belonged to.
    const alpineData = this._getAlpineData();
    if (alpineData && alpineData[property] !== undefined) {
      try {
        alpineData[property] = value;
        return true;
      } catch (error) {
        console.warn(`Failed to update Alpine.js property ${property}:`, error);
      }
    }
    return false;
  }

  // Optimized attribute change handling - only update what's necessary
  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue === newValue || !this._isInitialized || this._isRendering) return;

    const validatedValue = this._validateAttribute(name, newValue);
    
    try {
      switch (name) {
        case 'variant':
        case 'size': 
        case 'position':
          // These affect styling, try Alpine update first, fallback to re-render
          if (!this._updateAlpineProperty(name, validatedValue)) {
            this._render(this._extractAndSanitizeContent());
          }
          break;
          
        case 'dot':
          const isDot = newValue !== null && newValue !== 'false';
          if (!this._updateAlpineProperty('isDot', isDot)) {
            this._render(this._extractAndSanitizeContent());
          }
          break;
          
        case 'max':
          if (!this._updateAlpineProperty('max', validatedValue)) {
            this._render(this._extractAndSanitizeContent());
          }
          break;
          
        case 'visible':
          const visible = newValue !== null && newValue !== 'false';
          if (!this._updateAlpineProperty('visible', visible)) {
            // Fallback to direct style manipulation
            this.style.display = visible ? '' : 'none';
          }
          break;
          
        case 'class':
          // Full re-render needed for class changes
          this._render(this._extractAndSanitizeContent());
          break;
      }
    } catch (error) {
      console.error(`Error handling attribute change for ${name}:`, error);
      // Fallback to safe re-render
      this._renderFallback();
    }
  }

  // Public API methods with error handling
  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  toggle() {
    this.visible = !this.visible;
  }

  setContent(content) {
    if (content == null) content = '';
    
    const sanitizedContent = this._escapeHtml(content.toString());
    
    if (!this._updateAlpineProperty('content', sanitizedContent)) {
      // Fallback: update text content and re-render
      this.textContent = content;
      this._render(sanitizedContent);
    }
  }

  // Getters and setters with validation
  get variant() {
    return this._getAttributeWithDefault('variant', 'primary');
  }

  set variant(value) {
    const validatedValue = this._validateAttribute('variant', value);
    this._setAttribute('variant', validatedValue);
  }

  get size() {
    return this._getAttributeWithDefault('size', 'md');
  }

  set size(value) {
    const validatedValue = this._validateAttribute('size', value);
    this._setAttribute('size', validatedValue);
  }

  get position() {
    return this._getAttributeWithDefault('position', 'standalone');
  }

  set position(value) {
    const validatedValue = this._validateAttribute('position', value);
    this._setAttribute('position', validatedValue);
  }

  get dot() {
    return this._getBooleanAttribute('dot');
  }

  set dot(value) {
    this._setBooleanAttribute('dot', value);
  }

  get max() {
    return this._getNumericAttribute('max', null);
  }

  set max(value) {
    const validatedValue = this._validateAttribute('max', value);
    this._setNumericAttribute('max', validatedValue);
  }

  get visible() {
    return !this.hasAttribute('hidden') && this.getAttribute('visible') !== 'false';
  }

  set visible(value) {
    if (value) {
      this.removeAttribute('hidden');
      this.setAttribute('visible', 'true');
    } else {
      this.setAttribute('hidden', '');
      this.setAttribute('visible', 'false');
    }
  }
}

customElements.define('dry-badge', DryBadge);

class DryAvatar extends BaseElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['src', 'name', 'initials', 'size', 'shape', 'alt'];
  }

  _initializeComponent() {
    // Store original content (slot content like badges)
    const originalContent = this._extractSlotContent();

    // Create the component structure with Alpine.js
    this._render(originalContent);
  }

  _extractSlotContent() {
    // Simply get innerHTML before we render anything
    return this.innerHTML || '';
  }

  _render(originalContent) {
    const src = this.src;
    const name = this.name;
    const initials = this.initials || this._generateInitials(name);
    const size = this.size;
    const shape = this.shape;
    const alt = this.alt || `Avatar for ${name || 'user'}`;

    this.innerHTML = `
            <div x-data="{
                src: '${src}',
                name: '${name}',
                initials: '${initials}',
                size: '${size}',
                shape: '${shape}',
                alt: '${alt}',
                imageLoaded: false,
                imageError: false,
                
                handleImageLoad() {
                    this.imageLoaded = true;
                    this.imageError = false;
                },
                
                handleImageError() {
                    this.imageLoaded = false;
                    this.imageError = true;
                },
                
                getAvatarClasses() {
                    let classes = 'avatar relative inline-flex items-center justify-center overflow-hidden text-gray-700 select-none transition-all duration-200 ';
                    
                    // Size classes
                    if (this.size === 'xs') {
                        classes += 'w-6 h-6 text-xs ';
                    } else if (this.size === 'sm') {
                        classes += 'w-8 h-8 text-sm ';
                    } else if (this.size === 'lg') {
                        classes += 'w-16 h-16 text-lg ';
                    } else if (this.size === 'xl') {
                        classes += 'w-20 h-20 text-xl ';
                    } else {
                        // md or default
                        classes += 'w-12 h-12 text-base ';
                    }
                    
                    // Shape classes
                    if (this.shape === 'square') {
                        classes += 'rounded-none ';
                    } else if (this.shape === 'rounded') {
                        classes += 'rounded-lg ';
                    } else {
                        // circle or default
                        classes += 'rounded-full ';
                    }
                    
                    // Background color for initials
                    if (!this.src || this.imageError) {
                        classes += this.getInitialsBackground();
                    }
                    
                    return classes;
                },
                
                getInitialsBackground() {
                    // Generate a consistent background color based on initials or name
                    const text = this.initials || this.name || '';
                    const colors = [
                        'bg-red-500 text-white',
                        'bg-blue-500 text-white',
                        'bg-green-500 text-white',
                        'bg-yellow-500 text-gray-800',
                        'bg-purple-500 text-white',
                        'bg-pink-500 text-white',
                        'bg-indigo-500 text-white',
                        'bg-teal-500 text-white',
                        'bg-orange-500 text-white',
                        'bg-cyan-500 text-white'
                    ];
                    
                    let hash = 0;
                    for (let i = 0; i < text.length; i++) {
                        hash = text.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    
                    return colors[Math.abs(hash) % colors.length];
                },
                
                getImageClasses() {
                    return 'w-full h-full object-cover transition-opacity duration-300';
                },
                
                shouldShowImage() {
                    return this.src && !this.imageError;
                },
                
                shouldShowInitials() {
                    return (!this.src || this.imageError) && this.initials;
                },
                
                shouldShowIcon() {
                    return (!this.src || this.imageError) && !this.initials;
                }
            }"
            :class="getAvatarClasses()"
            class="avatar-container">
                
                <!-- Image -->
                <img 
                    x-show="shouldShowImage()" 
                    x-transition:enter="transition-opacity duration-300"
                    x-transition:enter-start="opacity-0"
                    x-transition:enter-end="opacity-100"
                    :src="src" 
                    :alt="alt"
                    :class="getImageClasses()"
                    @load="handleImageLoad()"
                    @error="handleImageError()">
                
                <!-- Initials -->
                <span 
                    x-show="shouldShowInitials()" 
                    x-text="initials"
                    class="font-medium uppercase leading-none">
                </span>
                
                <!-- Default Icon -->
                <svg 
                    x-show="shouldShowIcon()" 
                    class="w-2/3 h-2/3 text-gray-400" 
                    fill="currentColor" 
                    viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                
                <!-- Slot content (badges, etc.) -->
                <div class="avatar-slot-content">
                    ${originalContent}
                </div>
            </div>
        `;
  }

  _generateInitials(name) {
    if (!name) return '';

    const names = name.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  // Public API methods
  setImage(src, alt) {
    this.src = src;
    if (alt) this.alt = alt;
    
    const alpineData = this._getAlpineData();
    if (alpineData) {
      alpineData.src = src;
      if (alt) alpineData.alt = alt;
      alpineData.imageError = false;
      alpineData.imageLoaded = false;
    }
  }

  setName(name) {
    this.name = name;
    
    const alpineData = this._getAlpineData();
    if (alpineData) {
      alpineData.name = name;
      // Auto-generate initials if not explicitly set
      if (!this.hasAttribute('initials')) {
        const newInitials = this._generateInitials(name);
        alpineData.initials = newInitials;
      }
    }
  }

  setInitials(initials) {
    this.initials = initials;
    
    const alpineData = this._getAlpineData();
    if (alpineData) {
      alpineData.initials = initials;
    }
  }

  setSize(size) {
    this.size = size;
    
    const alpineData = this._getAlpineData();
    if (alpineData) {
      alpineData.size = size;
    }
  }

  setShape(shape) {
    this.shape = shape;
    
    const alpineData = this._getAlpineData();
    if (alpineData) {
      alpineData.shape = shape;
    }
  }

  // Attribute getters and setters
  get src() {
    return this.getAttribute('src') || '';
  }

  set src(value) {
    this._setAttribute('src', value);
  }

  get name() {
    return this.getAttribute('name') || '';
  }

  set name(value) {
    this._setAttribute('name', value);
  }

  get initials() {
    return this.getAttribute('initials') || '';
  }

  set initials(value) {
    this._setAttribute('initials', value);
  }

  get size() {
    return this._getAttributeWithDefault('size', 'md');
  }

  set size(value) {
    this._setAttribute('size', value);
  }

  get shape() {
    return this._getAttributeWithDefault('shape', 'circle');
  }

  set shape(value) {
    this._setAttribute('shape', value);
  }

  get alt() {
    return this.getAttribute('alt') || '';
  }

  set alt(value) {
    this._setAttribute('alt', value);
  }

  /**
   * Every observed attribute maps to a same-named property on the Alpine
   * scope, and the whole template is driven by those properties, so an
   * in-place scope update fully refreshes the view. That is preferred
   * over re-rendering because replacing innerHTML tears down the scope
   * (breaking setImage/setName/... which write to it immediately after
   * setting an attribute) and discards any slot content.
   *
   * Without Alpine there is no scope to update, so fall back to a full
   * re-render - via _reRenderWithSlotContent, which carries the slot
   * content across. The previous code called
   * _render(this._extractSlotContent()) here, but _extractSlotContent
   * returns the element's *current* innerHTML, i.e. the already-rendered
   * avatar, so each attribute change nested the whole component inside
   * its own slot container.
   */
  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue === newValue || !this._isInitialized) return;
    if (!DryAvatar.observedAttributes.includes(name)) return;

    const alpineData = this._getAlpineData();
    if (alpineData) {
      alpineData[name] = newValue || '';

      // Initials are derived from the name unless set explicitly.
      if (name === 'name' && !this.hasAttribute('initials')) {
        alpineData.initials = this._generateInitials(newValue || '');
      }
      // A new image gets a fresh chance to load.
      if (name === 'src') {
        alpineData.imageError = false;
        alpineData.imageLoaded = false;
      }
      return;
    }

    this._reRenderWithSlotContent();
  }

  _preserveSlotContent() {
    const slotContainer = this.querySelector('.avatar-slot-content');
    return slotContainer ? slotContainer.innerHTML : '';
  }

  _reRenderWithSlotContent() {
    const slotContent = this._preserveSlotContent();
    this._render(slotContent);
  }
}

customElements.define('dry-avatar', DryAvatar);

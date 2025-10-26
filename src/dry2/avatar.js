class DryAvatar extends BaseElement {
  constructor() {
    super();
    this._componentState = null;
    this._isInitialized = false;
  }

  static get observedAttributes() {
    return ['src', 'name', 'initials', 'size', 'shape', 'alt'];
  }

  connectedCallback() {
    // Skip BaseElement's connectedCallback and do our own initialization
    if (!this._isInitialized) {
      this._isInitialized = true;
      this._initializeComponent();
    }
  }

  render() {
    // This method is required by BaseElement but not used by Avatar
    // Avatar uses _initializeComponent instead
    if (!this._isInitialized) {
      this._isInitialized = true;
      this._initializeComponent();
    }
  }

  _initializeComponent() {
    // Store original content (slot content like badges)
    const originalContent = this._extractSlotContent();

    // Create component state
    this._componentState = this._createComponentState({
      src: this.src,
      name: this.name,
      initials: this.initials || this._generateInitials(this.name),
      size: this.size,
      shape: this.shape,
      alt: this.alt || `Avatar for ${this.name || 'user'}`,
      imageLoaded: false,
      imageError: false
    });

    // Create the component structure with vanilla JS
    this._render(originalContent);
    this._setupEventListeners();
  }

  _createComponentState(initialData) {
    // Create a simple state object with getState and setState methods
    const stateData = { ...initialData };
    const watchers = new Map();
    
    return {
      getState: () => stateData,
      setState: (updates) => {
        Object.keys(updates).forEach(key => {
          const oldValue = stateData[key];
          stateData[key] = updates[key];
          
          // Notify watchers
          if (watchers.has(key)) {
            watchers.get(key).forEach(callback => {
              callback(updates[key], oldValue);
            });
          }
        });
      },
      watch: (key, callback) => {
        if (!watchers.has(key)) {
          watchers.set(key, []);
        }
        watchers.get(key).push(callback);
      }
    };
  }

  _extractSlotContent() {
    // Simply get innerHTML before we render anything
    return this.innerHTML || '';
  }

  _render(originalContent) {
    const state = this._componentState.getState();
    
    this.innerHTML = `
            <div class="avatar-container ${this._getAvatarClasses(state)}">
                
                <!-- Image -->
                <img 
                    class="avatar-image ${this._getImageClasses(state)}"
                    src="${state.src}" 
                    alt="${state.alt}"
                    style="display: ${this._shouldShowImage(state) ? 'block' : 'none'}">
                
                <!-- Initials -->
                <span 
                    class="avatar-initials font-medium uppercase leading-none"
                    style="display: ${this._shouldShowInitials(state) ? 'block' : 'none'}">
                    ${state.initials}
                </span>
                
                <!-- Default Icon -->
                <svg 
                    class="avatar-icon w-2/3 h-2/3 text-gray-400 dark:text-gray-400" 
                    style="display: ${this._shouldShowIcon(state) ? 'block' : 'none'}"
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

    // Setup reactive updates
    this._setupReactiveUpdates();
  }

  _setupEventListeners() {
    const state = this._componentState.getState();
    
    // Image event listeners
    const img = this.querySelector('.avatar-image');
    if (img) {
      img.addEventListener('load', () => {
        this._componentState.setState({
          imageLoaded: true,
          imageError: false
        });
      });
      
      img.addEventListener('error', () => {
        this._componentState.setState({
          imageLoaded: false,
          imageError: true
        });
      });
    }
  }

  _setupReactiveUpdates() {
    const state = this._componentState;
    
    // Watch for state changes and update DOM
    state.watch('src', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this._updateAvatarDisplay();
      }
    });
    
    state.watch('name', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        const newInitials = this.initials || this._generateInitials(newValue);
        state.setState({ initials: newInitials });
        this._updateAvatarDisplay();
      }
    });
    
    state.watch('initials', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this._updateAvatarDisplay();
      }
    });
    
    state.watch('size', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this._updateAvatarClasses();
      }
    });
    
    state.watch('shape', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this._updateAvatarClasses();
      }
    });
    
    state.watch('imageError', (newValue, oldValue) => {
      // Only update if the error state actually changed
      if (newValue !== oldValue) {
        this._updateAvatarDisplay();
      }
    });
    
    state.watch('imageLoaded', (newValue, oldValue) => {
      // Only update if the loaded state actually changed
      if (newValue !== oldValue) {
        this._updateImageOpacity();
      }
    });
  }

  _updateAvatarDisplay() {
    const state = this._componentState.getState();
    
    // Update image visibility and src (only if src changed)
    const img = this.querySelector('.avatar-image');
    if (img) {
      img.style.display = this._shouldShowImage(state) ? 'block' : 'none';
      // Only update src if it's different to avoid reload loops
      if (img.src !== state.src && state.src) {
        img.src = state.src;
      }
      if (img.alt !== state.alt && state.alt) {
        img.alt = state.alt;
      }
    }
    
    // Update initials visibility
    const initials = this.querySelector('.avatar-initials');
    if (initials) {
      initials.style.display = this._shouldShowInitials(state) ? 'block' : 'none';
      initials.textContent = state.initials;
    }
    
    // Update icon visibility
    const icon = this.querySelector('.avatar-icon');
    if (icon) {
      icon.style.display = this._shouldShowIcon(state) ? 'block' : 'none';
    }
    
    // Update avatar classes
    this._updateAvatarClasses();
  }

  _updateAvatarClasses() {
    const state = this._componentState.getState();
    const container = this.querySelector('.avatar-container');
    if (container) {
      container.className = `avatar-container ${this._getAvatarClasses(state)}`;
    }
  }

  _updateImageOpacity() {
    const state = this._componentState.getState();
    const img = this.querySelector('.avatar-image');
    if (img) {
      // Fade in when image loads
      if (state.imageLoaded && !state.imageError) {
        img.style.opacity = '1';
      } else {
        img.style.opacity = '0';
      }
    }
  }

  _getAvatarClasses(state) {
    let classes = 'avatar relative inline-flex items-center justify-center overflow-hidden text-gray-700 dark:text-gray-200 select-none transition-all duration-200 ';
    
    // Size classes
    if (state.size === 'xs') {
      classes += 'w-6 h-6 text-xs ';
    } else if (state.size === 'sm') {
      classes += 'w-8 h-8 text-sm ';
    } else if (state.size === 'lg') {
      classes += 'w-16 h-16 text-lg ';
    } else if (state.size === 'xl') {
      classes += 'w-20 h-20 text-xl ';
    } else {
      // md or default
      classes += 'w-12 h-12 text-base ';
    }
    
    // Shape classes
    if (state.shape === 'square') {
      classes += 'rounded-none ';
    } else if (state.shape === 'rounded') {
      classes += 'rounded-lg ';
    } else {
      // circle or default
      classes += 'rounded-full ';
    }
    
    // Background color for initials
    if (!state.src || state.imageError) {
      classes += this._getInitialsBackground(state);
    }
    
    return classes;
  }

  _getImageClasses(state) {
    return 'w-full h-full object-cover transition-opacity duration-300';
  }

  _getInitialsBackground(state) {
    // Generate a consistent background color based on initials or name
    const text = state.initials || state.name || '';
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
  }

  _shouldShowImage(state) {
    return state.src && !state.imageError;
  }

  _shouldShowInitials(state) {
    return (!state.src || state.imageError) && state.initials;
  }

  _shouldShowIcon(state) {
    return (!state.src || state.imageError) && !state.initials;
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
    
    if (this._componentState) {
      this._componentState.setState({
        src: src,
        alt: alt || `Avatar for ${this._componentState.getState().name || 'user'}`,
        imageError: false,
        imageLoaded: false
      });
    }
  }

  setName(name) {
    this.name = name;
    
    if (this._componentState) {
      const newInitials = this.initials || this._generateInitials(name);
      this._componentState.setState({
        name: name,
        initials: newInitials
      });
    }
  }

  setInitials(initials) {
    this.initials = initials;
    
    if (this._componentState) {
      this._componentState.setState({ initials: initials });
    }
  }

  setSize(size) {
    this.size = size;
    
    if (this._componentState) {
      this._componentState.setState({ size: size });
    }
  }

  setShape(shape) {
    this.shape = shape;
    
    if (this._componentState) {
      this._componentState.setState({ shape: shape });
    }
  }

  // Attribute getters and setters
  get src() {
    return this.getAttribute('src') || '';
  }

  set src(value) {
    this.setAttribute('src', value);
  }

  get name() {
    return this.getAttribute('name') || '';
  }

  set name(value) {
    this.setAttribute('name', value);
  }

  get initials() {
    return this.getAttribute('initials') || '';
  }

  set initials(value) {
    this.setAttribute('initials', value);
  }

  get size() {
    return this.getAttr('size', 'md');
  }

  set size(value) {
    this.setAttribute('size', value);
  }

  get shape() {
    return this.getAttr('shape', 'circle');
  }

  set shape(value) {
    this.setAttribute('shape', value);
  }

  get alt() {
    return this.getAttribute('alt') || '';
  }

  set alt(value) {
    this.setAttribute('alt', value);
  }

  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isInitialized) {
      if (name === 'src') {
        this.src = newValue;
        if (this._componentState) {
          this._componentState.setState({
            src: newValue,
            imageError: false,
            imageLoaded: false
          });
        }
      } else if (name === 'name') {
        this.name = newValue;
        if (this._componentState) {
          const newInitials = this.initials || this._generateInitials(newValue);
          this._componentState.setState({
            name: newValue,
            initials: newInitials
          });
        }
      } else if (name === 'initials') {
        this.initials = newValue;
        if (this._componentState) {
          this._componentState.setState({ initials: newValue });
        }
      } else if (name === 'size') {
        this.size = newValue;
        if (this._componentState) {
          this._componentState.setState({ size: newValue });
        }
      } else if (name === 'shape') {
        this.shape = newValue;
        if (this._componentState) {
          this._componentState.setState({ shape: newValue });
        }
      } else if (name === 'alt') {
        this.alt = newValue;
        if (this._componentState) {
          const state = this._componentState.getState();
          this._componentState.setState({ 
            alt: newValue || `Avatar for ${state.name || 'user'}` 
          });
        }
      }
    }
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

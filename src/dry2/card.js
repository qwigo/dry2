class DryCard extends BaseElement {
  static get observedAttributes() {
    return ['variant', 'elevation', 'orientation', 'interactive', 'bordered'];
  }

  _initializeComponent() {
    // Store original content (slots)
    const originalContent = this._extractSlotContent();

    // Create the component structure with Alpine.js
    this._render(originalContent);
  }

  _extractSlotContent() {
    const slots = {
      header: '',
      media: '',
      body: '',
      footer: '',
      default: ''
    };

    // Use the base class method and extend it with card-specific slots
    const baseSlots = super._extractSlotContent();
    Object.assign(slots, baseSlots);

    // Ensure we have the specific slots cards need
    if (!slots.header) {
      const headerSlot = this.querySelector('[slot="header"]');
      if (headerSlot) {
        slots.header = headerSlot.outerHTML;
        headerSlot.remove();
      }
    }

    if (!slots.media) {
      const mediaSlot = this.querySelector('[slot="media"]');
      if (mediaSlot) {
        slots.media = mediaSlot.outerHTML;
        mediaSlot.remove();
      }
    }

    if (!slots.footer) {
      const footerSlot = this.querySelector('[slot="footer"]');
      if (footerSlot) {
        slots.footer = footerSlot.outerHTML;
        footerSlot.remove();
      }
    }

    if (!slots.body) {
      const bodySlot = this.querySelector('[slot="body"]');
      if (bodySlot) {
        slots.body = bodySlot.outerHTML;
        bodySlot.remove();
      }
    }

    // Everything else goes into default slot (body)
    if (this.innerHTML.trim() && !slots.body && !slots.default) {
      slots.default = this.innerHTML.trim();
    }

    return slots;
  }

  _render(slots) {
    const variant = this.variant;
    const elevation = this.elevation;
    const orientation = this.orientation;
    const interactive = this.interactive;
    const bordered = this.bordered;

    this.innerHTML = `
            <div x-data="{
                variant: '${variant}',
                elevation: '${elevation}',
                orientation: '${orientation}',
                interactive: ${interactive},
                bordered: ${bordered},
                
                getCardClasses() {
                    let classes = 'card relative bg-white rounded-lg transition-all duration-200 ';
                    
                    // Elevation/shadow classes
                    if (this.elevation === 'none') {
                        classes += '';
                    } else if (this.elevation === 'sm') {
                        classes += 'shadow-sm ';
                    } else if (this.elevation === 'lg') {
                        classes += 'shadow-lg ';
                    } else if (this.elevation === 'xl') {
                        classes += 'shadow-xl ';
                    } else {
                        // md or default
                        classes += 'shadow-md ';
                    }
                    
                    // Border
                    if (this.bordered) {
                        classes += 'border border-gray-200 ';
                    }
                    
                    // Interactive states
                    if (this.interactive) {
                        classes += 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ';
                    }
                    
                    // Orientation
                    if (this.orientation === 'horizontal') {
                        classes += 'flex ';
                    }
                    
                    // Variant styles
                    if (this.variant === 'outlined') {
                        classes += 'bg-transparent border border-gray-300 shadow-none ';
                    } else if (this.variant === 'elevated') {
                        classes += 'shadow-xl ';
                    }
                    // filled or default - no additional classes needed
                    
                    return classes.trim();
                },
                
                getHeaderClasses() {
                    let classes = 'card-header ';
                    if (this.orientation === 'horizontal') {
                        classes += 'p-6 ';
                    } else {
                        classes += 'px-6 pt-6 pb-0 ';
                    }
                    return classes;
                },
                
                getMediaClasses() {
                    let classes = 'card-media ';
                    if (this.orientation === 'horizontal') {
                        classes += 'flex-shrink-0 w-48 ';
                    } else {
                        classes += 'w-full ';
                    }
                    return classes;
                },
                
                getBodyClasses() {
                    let classes = 'card-body ';
                    if (this.orientation === 'horizontal') {
                        classes += 'flex-1 p-6 ';
                    } else {
                        classes += 'px-6 py-4 ';
                    }
                    return classes;
                },
                
                getFooterClasses() {
                    let classes = 'card-footer ';
                    if (this.orientation === 'horizontal') {
                        classes += 'p-6 pt-0 ';
                    } else {
                        classes += 'px-6 pb-6 pt-0 ';
                    }
                    return classes;
                },
                
                hasHeader() {
                    return ${!!slots.header};
                },
                
                hasMedia() {
                    return ${!!slots.media};
                },
                
                hasBody() {
                    return ${!!(slots.body || slots.default)};
                },
                
                hasFooter() {
                    return ${!!slots.footer};
                },
                
                handleCardClick(event) {
                    if (this.interactive) {
                        const cardEvent = new CustomEvent('card:click', {
                            bubbles: true,
                            cancelable: true,
                            detail: {
                                originalEvent: event,
                                card: this.$el.closest('dry-card')
                            }
                        });
                        this.$el.dispatchEvent(cardEvent);
                    }
                }
            }"
            :class="getCardClasses()"
            @click="handleCardClick($event)"
            class="card-container">
                
                <!-- Media Section -->
                <div 
                    x-show="hasMedia()" 
                    :class="getMediaClasses()">
                    ${slots.media}
                </div>
                
                <!-- Content Container for Horizontal Layout -->
                <div class="${orientation === 'horizontal' ? 'flex-1 flex flex-col' : ''}">
                    
                    <!-- Header Section -->
                    <div 
                        x-show="hasHeader()" 
                        :class="getHeaderClasses()">
                        ${slots.header}
                    </div>
                    
                    <!-- Body Section -->
                    <div 
                        x-show="hasBody()" 
                        :class="getBodyClasses()">
                        ${slots.body || slots.default}
                    </div>
                    
                    <!-- Footer Section -->
                    <div 
                        x-show="hasFooter()" 
                        :class="getFooterClasses()">
                        ${slots.footer}
                    </div>
                    
                </div>
                
            </div>
        `;
  }

  // Public API methods
  setInteractive(interactive) {
    this.interactive = interactive;
  }

  setElevation(elevation) {
    this.elevation = elevation;
  }

  setVariant(variant) {
    this.variant = variant;
  }

  // Getters and setters
  get variant() {
    return this._getAttributeWithDefault('variant', 'filled');
  }

  set variant(value) {
    this._setAttribute('variant', value || 'filled');
  }

  get elevation() {
    return this._getAttributeWithDefault('elevation', 'md');
  }

  set elevation(value) {
    this._setAttribute('elevation', value || 'md');
  }

  get orientation() {
    return this._getAttributeWithDefault('orientation', 'vertical');
  }

  set orientation(value) {
    this._setAttribute('orientation', value || 'vertical');
  }

  get interactive() {
    return this._getBooleanAttribute('interactive');
  }

  set interactive(value) {
    this._setBooleanAttribute('interactive', value);
  }

  get bordered() {
    return this._getBooleanAttribute('bordered');
  }

  set bordered(value) {
    this._setBooleanAttribute('bordered', value);
  }

  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isInitialized) {
      if (name === 'elevation') {
        this.elevation = newValue;
        this._render();
      } else if (name === 'variant') {
        this.variant = newValue;
        this._render();
      } else if (name === 'interactive') {
        this.interactive = newValue !== null && newValue !== 'false';
        this._render();
      }
    }
  }
}

customElements.define('dry-card', DryCard);

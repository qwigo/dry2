class DryChatBubble extends BaseElement {
  constructor() {
    super();
    this._isRendering = false;
  }

  static get observedAttributes() {
    return ['type', 'avatar', 'name', 'timestamp', 'status', 'group-start', 'group-end'];
  }



  /**
   * Validate and sanitize avatar URL
   * @param {string} url - Avatar URL
   * @returns {string} - Safe URL or empty string
   */
  _validateAvatarURL(url) {
    if (!url || typeof url !== 'string') return '';
    
    try {
      const urlObj = new URL(url, window.location.href);
      
      // Only allow http, https, and data URLs for images
      if (!['http:', 'https:', 'data:'].includes(urlObj.protocol)) {
        console.warn('DryChatBubble: Invalid avatar URL protocol:', urlObj.protocol);
        return '';
      }
      
      // If it's a data URL, make sure it's an image
      if (urlObj.protocol === 'data:' && !url.toLowerCase().startsWith('data:image/')) {
        console.warn('DryChatBubble: Data URL must be an image');
        return '';
      }
      
      return url;
    } catch (e) {
      console.warn('DryChatBubble: Invalid avatar URL:', url, e.message);
      return '';
    }
  }

  /**
   * Validate input values to prevent injection
   */
  _validateInputs() {
    const type = this.getAttribute('type') || 'received';
    if (!['sent', 'received'].includes(type)) {
      console.warn('DryChatBubble: Invalid type, defaulting to "received"');
      this.setAttribute('type', 'received');
    }
    
    // Validate status
    const status = this.getAttribute('status') || '';
    if (status && !['sent', 'delivered', 'read', 'failed'].includes(status)) {
      console.warn('DryChatBubble: Invalid status, clearing');
      this.setAttribute('status', '');
    }
  }

  _initializeComponent() {
    this._validateInputs();
    
    // Store original content as text only (no HTML for security)
    this._originalContent = this._extractContent();

    // Create the component structure with Alpine.js
    this._render();
  }

  _extractContent() {
    // Extract text content only, no HTML to prevent XSS
    return this.textContent.trim();
  }



  _render() {
    if (this._isRendering) return;
    this._isRendering = true;

    try {
      this.innerHTML = `
        <div x-data="{
                type: '${this.type}',
                avatar: '${this._validateAvatarURL(this.avatar)}',
                name: '${this.name.replace(/'/g, "\\'")}',
                timestamp: '${this.timestamp}',
                status: '${this.status}',
                groupStart: ${this.groupStart},
                groupEnd: ${this.groupEnd},
                content: '${this._originalContent.replace(/'/g, "\\'")}',
                
                getContainerClasses() {
                    let classes = 'chat-bubble-container flex w-full ';
                    if (this.groupEnd) classes += 'mb-4 '; else classes += 'mb-1 ';
                    if (this.type === 'sent') classes += 'justify-end '; else classes += 'justify-start ';
                    return classes;
                },
                
                getBubbleClasses() {
                    let classes = 'chat-bubble max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ';
                    if (this.type === 'sent') {
                        classes += 'bg-blue-600 dark:bg-blue-700 text-white ';
                        if (!this.groupEnd) classes += 'rounded-br-sm ';
                    } else {
                        classes += 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 ';
                        if (!this.groupEnd) classes += 'rounded-bl-sm ';
                    }
                    return classes;
                },
                
                shouldShowAvatar() { return this.type === 'received' && this.avatar && this.groupEnd; },
                shouldShowName() { return this.type === 'received' && this.name && this.groupStart; },
                shouldShowTimestamp() { return this.timestamp && this.groupEnd; },
                shouldShowStatus() { return this.status && this.type === 'sent' && this.groupEnd; },
                
                getStatusIcon() {
                    switch (this.status) {
                        case 'sent': return '✓';
                        case 'delivered': return '✓✓';
                        case 'read': return '✓✓';
                        case 'failed': return '✗';
                        default: return '';
                    }
                },
                
                formatTimestamp() {
                    if (!this.timestamp) return '';
                    try {
                        const date = new Date(this.timestamp);
                        if (isNaN(date.getTime())) return this.timestamp;
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        if (diffMs < 0) return date.toLocaleDateString();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);
                        if (diffMins < 1) return 'now';
                        if (diffMins < 60) return diffMins + 'm';
                        if (diffHours < 24) return diffHours + 'h';
                        if (diffDays < 7) return diffDays + 'd';
                        return date.toLocaleDateString();
                    } catch (e) {
                        return this.timestamp;
                    }
                }
            }"
             :class="getContainerClasses()"
             class="chat-bubble-wrapper">
            
            <!-- Received Message Layout -->
            <template x-if="type === 'received'">
                <div class="flex items-end gap-2 max-w-full">
                    
                    <!-- Avatar -->
                    <div x-show="shouldShowAvatar()" class="flex-shrink-0">
                        <img x-show="avatar" 
                             :src="avatar" 
                             :alt="name"
                             class="w-8 h-8 rounded-full object-cover"
                             loading="lazy"
                             onerror="this.style.display='none'">
                    </div>
                    
                    <!-- Spacer when no avatar -->
                    <div x-show="!shouldShowAvatar() && !groupEnd" class="w-10 flex-shrink-0"></div>
                    
                    <!-- Message Content -->
                    <div class="flex-1 min-w-0">
                        
                        <!-- Name -->
                        <div x-show="shouldShowName()" 
                             class="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium"
                             x-text="name"></div>
                        
                        <!-- Bubble -->
                        <div :class="getBubbleClasses()">
                            <div class="break-words" x-text="content"></div>
                        </div>
                        
                        <!-- Timestamp -->
                        <div x-show="shouldShowTimestamp()" 
                             class="text-xs mt-1 text-gray-500 dark:text-gray-400"
                             x-text="formatTimestamp()"></div>
                        
                    </div>
                    
                </div>
            </template>
            
            <!-- Sent Message Layout -->
            <template x-if="type === 'sent'">
                <div class="flex items-end justify-end max-w-full">
                    
                    <!-- Message Content -->
                    <div class="flex-1 min-w-0 flex flex-col items-end">
                        
                        <!-- Bubble -->
                        <div :class="getBubbleClasses()">
                            <div class="break-words" x-text="content"></div>
                        </div>
                        
                        <!-- Timestamp and Status -->
                        <div x-show="shouldShowTimestamp() || shouldShowStatus()" 
                             class="flex items-center gap-2 mt-1">
                            
                            <!-- Timestamp -->
                            <div x-show="shouldShowTimestamp()" 
                                 class="text-xs text-blue-200 dark:text-blue-300"
                                 x-text="formatTimestamp()"></div>
                            
                            <!-- Status -->
                            <div x-show="shouldShowStatus()" 
                                 class="text-xs text-blue-200 dark:text-blue-300"
                                 x-text="getStatusIcon()"></div>
                            
                        </div>
                        
                    </div>
                    
                </div>
            </template>
            
        </div>
      `;

      // Data is now embedded directly in the x-data attribute
    } finally {
      this._isRendering = false;
    }
  }

  /**
   * Optimized update - only re-render if necessary
   */
  _triggerUpdate() {
    if (this._isInitialized && !this._isRendering) {
      this._validateInputs();
      
      // Check if we actually need to update
      const newContent = this._extractContent();
      const needsUpdate = (
        newContent !== this._originalContent ||
        this._lastType !== this.type ||
        this._lastAvatar !== this.avatar ||
        this._lastName !== this.name ||
        this._lastTimestamp !== this.timestamp ||
        this._lastStatus !== this.status ||
        this._lastGroupStart !== this.groupStart ||
        this._lastGroupEnd !== this.groupEnd
      );
      
      if (needsUpdate) {
        this._originalContent = newContent;
        // Update cached values for next comparison
        this._lastType = this.type;
        this._lastAvatar = this.avatar;
        this._lastName = this.name;
        this._lastTimestamp = this.timestamp;
        this._lastStatus = this.status;
        this._lastGroupStart = this.groupStart;
        this._lastGroupEnd = this.groupEnd;
        this._render();
      }
    }
  }

  // Getters and setters with validation
  get type() {
    const type = this._getAttributeWithDefault('type', 'received');
    return ['sent', 'received'].includes(type) ? type : 'received';
  }

  set type(value) {
    if (['sent', 'received'].includes(value)) {
      this._setAttribute('type', value);
      this._triggerUpdate();
    } else {
      console.warn('DryChatBubble: Invalid type value:', value);
    }
  }

  get avatar() {
    return this._getAttributeWithDefault('avatar', '');
  }

  set avatar(value) {
    this._setAttribute('avatar', value);
    this._triggerUpdate();
  }

  get name() {
    const name = this._getAttributeWithDefault('name', '');
    // Basic XSS prevention for name attribute
    return name.replace(/<[^>]*>/g, '').trim();
  }

  set name(value) {
    this._setAttribute('name', value);
    this._triggerUpdate();
  }

  get timestamp() {
    return this._getAttributeWithDefault('timestamp', '');
  }

  set timestamp(value) {
    this._setAttribute('timestamp', value);
    this._triggerUpdate();
  }

  get status() {
    const status = this._getAttributeWithDefault('status', '');
    return ['sent', 'delivered', 'read', 'failed'].includes(status) ? status : '';
  }

  set status(value) {
    if (!value || ['sent', 'delivered', 'read', 'failed'].includes(value)) {
      this._setAttribute('status', value);
      this._triggerUpdate();
    } else {
      console.warn('DryChatBubble: Invalid status value:', value);
    }
  }

  get groupStart() {
    return this._getBooleanAttribute('group-start');
  }

  set groupStart(value) {
    this._setBooleanAttribute('group-start', value);
    this._triggerUpdate();
  }

  get groupEnd() {
    return this._getBooleanAttribute('group-end');
  }

  set groupEnd(value) {
    this._setBooleanAttribute('group-end', value);
    this._triggerUpdate();
  }

  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isInitialized) {
      this._triggerUpdate();
    }
  }
}

customElements.define('dry-chat-bubble', DryChatBubble);

class DryChatBubble extends BaseElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['type', 'avatar', 'name', 'timestamp', 'status', 'group-start', 'group-end'];
  }

  _initializeComponent() {
    // Store original content
    this._originalContent = this._extractContent();

    // Store data on element for Alpine to access
    this._chatData = {
      type: this.type,
      avatar: this.avatar,
      name: this.name,
      timestamp: this.timestamp,
      status: this.status,
      groupStart: this.groupStart,
      groupEnd: this.groupEnd,
      content: this._originalContent
    };

    // Create the component structure with Alpine.js
    this._render();
  }

  /**
   * Message bodies are rendered with x-html, i.e. as live markup, and
   * chat messages are the archetypal untrusted content - so sanitize
   * rather than trust. Ordinary formatting (links, emphasis, images,
   * line breaks) is preserved; scripts, event handlers and script-
   * bearing URL schemes are not.
   */
  _extractContent() {
    return this._sanitizeHtml(this.innerHTML.trim());
  }

  _render() {
    this.innerHTML = `
            <div x-data="{
                get chatData() { 
                    const component = this.$el.closest('dry-chat-bubble');
                    return component && component._chatData ? component._chatData : {
                        type: 'received',
                        avatar: '',
                        name: '',
                        timestamp: '',
                        status: '',
                        groupStart: false,
                        groupEnd: false,
                        content: ''
                    };
                },
                
                getContainerClasses() {
                    let classes = 'chat-bubble-container flex w-full ';
                    
                    if (this.chatData.groupEnd) {
                        classes += 'mb-4 ';
                    } else {
                        classes += 'mb-1 ';
                    }
                    
                    if (this.chatData.type === 'sent') {
                        classes += 'justify-end ';
                    } else {
                        classes += 'justify-start ';
                    }
                    
                    return classes;
                },
                
                getBubbleClasses() {
                    let classes = 'chat-bubble max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ';
                    
                    if (this.chatData.type === 'sent') {
                        classes += 'bg-blue-600 text-white ';
                        if (!this.chatData.groupEnd) {
                            classes += 'rounded-br-sm ';
                        }
                    } else {
                        classes += 'bg-gray-200 text-gray-900 ';
                        if (!this.chatData.groupEnd) {
                            classes += 'rounded-bl-sm ';
                        }
                    }
                    
                    return classes;
                },
                
                shouldShowAvatar() {
                    return this.chatData.type === 'received' && this.chatData.avatar && this.chatData.groupEnd;
                },
                
                shouldShowName() {
                    return this.chatData.type === 'received' && this.chatData.name && this.chatData.groupStart;
                },
                
                shouldShowTimestamp() {
                    return this.chatData.timestamp && this.chatData.groupEnd;
                },
                
                shouldShowStatus() {
                    return this.chatData.status && this.chatData.type === 'sent' && this.chatData.groupEnd;
                },
                
                getStatusIcon() {
                    if (this.chatData.status === 'sent') {
                        return '✓';
                    } else if (this.chatData.status === 'delivered') {
                        return '✓✓';
                    } else if (this.chatData.status === 'read') {
                        return '✓✓';
                    } else if (this.chatData.status === 'failed') {
                        return '✗';
                    }
                    return '';
                },
                
                formatTimestamp() {
                    if (!this.chatData.timestamp) return '';
                    
                    try {
                        const date = new Date(this.chatData.timestamp);
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        
                        if (diffMins < 1) return 'now';
                        if (diffMins < 60) return diffMins + 'm';
                        if (diffHours < 24) return diffHours + 'h';
                        return date.toLocaleDateString();
                    } catch (e) {
                        return this.chatData.timestamp;
                    }
                }
            }"
            :class="getContainerClasses()"
            class="chat-bubble-wrapper">
                
                <!-- Received Message Layout -->
                <template x-if="chatData.type === 'received'">
                    <div class="flex items-end gap-2 max-w-full">
                        
                        <!-- Avatar -->
                        <div x-show="shouldShowAvatar()" class="flex-shrink-0">
                            <img :src="chatData.avatar" :alt="chatData.name"
                                 class="w-8 h-8 rounded-full"
                                 onerror="this.style.display='none'">
                        </div>
                        
                        <!-- Spacer when no avatar -->
                        <div x-show="!shouldShowAvatar() && !chatData.groupEnd" class="w-10 flex-shrink-0"></div>
                        
                        <!-- Message Content -->
                        <div class="flex-1 min-w-0">
                            
                            <!-- Name -->
                            <div x-show="shouldShowName()" 
                                 class="text-xs text-gray-500 mb-1 font-medium"
                                 x-text="chatData.name"></div>
                            
                            <!-- Bubble -->
                            <div :class="getBubbleClasses()">
                                <div x-html="chatData.content" class="break-words"></div>
                            </div>
                            
                            <!-- Timestamp -->
                            <div x-show="shouldShowTimestamp()" 
                                 class="text-xs mt-1 text-gray-500"
                                 x-text="formatTimestamp()"></div>
                            
                        </div>
                        
                    </div>
                </template>
                
                <!-- Sent Message Layout -->
                <template x-if="chatData.type === 'sent'">
                    <div class="flex items-end justify-end max-w-full">
                        
                        <!-- Message Content -->
                        <div class="flex-1 min-w-0 flex flex-col items-end">
                            
                            <!-- Bubble -->
                            <div :class="getBubbleClasses()">
                                <div x-html="chatData.content" class="break-words"></div>
                            </div>
                            
                            <!-- Timestamp and Status -->
                            <div class="flex items-center gap-2 mt-1">
                                
                                <!-- Timestamp -->
                                <div x-show="shouldShowTimestamp()" 
                                     class="text-xs text-blue-200"
                                     x-text="formatTimestamp()"></div>
                                
                                <!-- Status -->
                                <div x-show="shouldShowStatus()" 
                                     class="text-xs text-blue-200"
                                     x-text="getStatusIcon()"></div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                </template>
                
            </div>
        `;
  }

  _updateChatData() {
    if (this._chatData) {
      this._chatData.type = this.type;
      this._chatData.avatar = this.avatar;
      this._chatData.name = this.name;
      this._chatData.timestamp = this.timestamp;
      this._chatData.status = this.status;
      this._chatData.groupStart = this.groupStart;
      this._chatData.groupEnd = this.groupEnd;
    }
  }

  _triggerUpdate() {
    if (this._isInitialized) {
      this._chatData = {
        type: this.type,
        avatar: this.avatar,
        name: this.name,
        timestamp: this.timestamp,
        status: this.status,
        groupStart: this.groupStart,
        groupEnd: this.groupEnd,
        content: this._originalContent
      };
      this._render();
    }
  }

  // Getters and setters
  get type() {
    return this._getAttributeWithDefault('type', 'received');
  }

  set type(value) {
    this._setAttribute('type', value);
    this._triggerUpdate();
  }

  get avatar() {
    return this._getAttributeWithDefault('avatar', '');
  }

  set avatar(value) {
    this._setAttribute('avatar', value);
    this._triggerUpdate();
  }

  get name() {
    return this._getAttributeWithDefault('name', '');
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
    return this._getAttributeWithDefault('status', '');
  }

  set status(value) {
    this._setAttribute('status', value);
    this._triggerUpdate();
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
      // Re-render the entire component when attributes change
      this._chatData = {
        type: this.type,
        avatar: this.avatar,
        name: this.name,
        timestamp: this.timestamp,
        status: this.status,
        groupStart: this.groupStart,
        groupEnd: this.groupEnd,
        content: this._originalContent
      };
      this._render();
    }
  }
}

customElements.define('dry-chat-bubble', DryChatBubble);

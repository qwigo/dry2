/**
 * DRY2 Chat Bubble Component
 * A customizable chat bubble component for conversation interfaces
 * Supports sent/received messages, avatars, timestamps, grouping, and delivery status
 * Built with vanilla JavaScript using BaseElement
 */

class DryChatBubble extends BaseElement {
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
    return ['type', 'name', 'avatar', 'status', 'timestamp', 'group-start', 'group-end'];
  }

  constructor() {
    super();
    this._originalContent = null;
    this._contentObserver = null;
    this._isCapturingContent = false;
  }

  /**
   * Override connectedCallback to capture content using MutationObserver
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Set display style once on first connection
      if (!this.style.display) {
        this.style.display = 'block';
      }

      // Try to capture content immediately (for dynamically created elements)
      const immediateContent = this.innerHTML.trim();

      if (immediateContent && !this._isCapturingContent) {
        // Content already exists, render immediately
        this._originalContent = immediateContent;
        super.connectedCallback();
      } else if (!this._isCapturingContent) {
        // Content not yet available, wait for parser to add it
        this._isCapturingContent = true;

        // Set up MutationObserver to watch for child nodes being added
        this._contentObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              // Child nodes were added by the parser
              const htmlContent = this.innerHTML.trim();
              if (htmlContent && this._originalContent === null) {
                this._originalContent = htmlContent;
                this._contentObserver.disconnect();
                this._contentObserver = null;

                // Now render the component
                super.connectedCallback();
                break;
              }
            }
          }
        });

        // Start observing - only watch childList changes, not attributes
        this._contentObserver.observe(this, {
          childList: true,
          subtree: true
        });

        // Fallback: If no content is added within 100ms, render with default
        setTimeout(() => {
          if (this._contentObserver && !this.hasAttribute('data-rendered')) {
            this._contentObserver.disconnect();
            this._contentObserver = null;

            if (this._originalContent === null) {
              this._originalContent = this.innerHTML.trim() || 'Message';
            }

            super.connectedCallback();
          }
        }, 100);
      }
    } else {
      // Already rendered, just reattach listeners
      super.connectedCallback();
    }
  }

  /**
   * Override disconnectedCallback to clean up observer
   */
  disconnectedCallback() {
    // Disconnect the MutationObserver if it exists
    if (this._contentObserver) {
      this._contentObserver.disconnect();
      this._contentObserver = null;
    }

    // Call parent's disconnectedCallback
    super.disconnectedCallback();
  }

  /**
   * Main render method
   */
  render() {
    const type = this.getAttr('type', 'sent');
    const name = this.getAttr('name', '');
    const avatar = this.getAttr('avatar', '');
    const status = this.getAttr('status', '');
    const timestamp = this.getAttr('timestamp', '');
    const groupStart = this.getBoolAttr('group-start', false);
    const groupEnd = this.getBoolAttr('group-end', false);

    // Ensure we have content
    if (this._originalContent === null) {
      this._originalContent = 'Message';
    }

    // Build the message container
    const containerClasses = this._getContainerClasses(type);
    const bubbleClasses = this._getBubbleClasses(type, groupStart, groupEnd);

    // Build the HTML structure
    let html = `<div class="${containerClasses}">`;

    // Add avatar for received messages
    if (type === 'received' && groupEnd) {
      html += this._getAvatarHTML(avatar, name);
    } else if (type === 'received') {
      html += '<div class="w-8 h-8 flex-shrink-0"></div>';
    }

    // Message bubble container
    html += `<div class="flex flex-col ${type === 'sent' ? 'items-end' : 'items-start'} flex-1">`;

    // Add name for received messages at group start
    if (type === 'received' && groupStart && name) {
      html += `<div class="text-xs text-gray-600 mb-1 px-1">${DryChatBubble._escapeHtml(name)}</div>`;
    }

    // Message bubble
    html += `<div class="${bubbleClasses}">`;
    html += this._originalContent; // Allow rich HTML content
    html += '</div>';

    // Add timestamp and status for group end
    if (groupEnd) {
      html += this._getMetadataHTML(type, timestamp, status);
    }

    html += '</div>'; // Close flex-col

    html += '</div>'; // Close container

    // Render the chat bubble
    if (typeof this.replaceChildren === 'function') {
      this.replaceChildren();
    } else {
      this.textContent = '';
    }

    this.innerHTML = html;
  }

  /**
   * Get container classes based on message type
   */
  _getContainerClasses(type) {
    const baseClasses = 'flex items-end gap-2 mb-1';
    if (type === 'sent') {
      return `${baseClasses} justify-end`;
    }
    return `${baseClasses} justify-start`;
  }

  /**
   * Get bubble classes based on type and grouping
   */
  _getBubbleClasses(type, groupStart, groupEnd) {
    let classes = ['px-4', 'py-2', 'max-w-md', 'break-words'];

    // Type-specific colors
    if (type === 'sent') {
      classes.push('bg-blue-600', 'text-white');
    } else {
      classes.push('bg-gray-200', 'text-gray-900');
    }

    // Rounded corners based on grouping and type
    if (type === 'sent') {
      // Sent messages (right side)
      if (groupStart && groupEnd) {
        classes.push('rounded-2xl');
      } else if (groupStart) {
        classes.push('rounded-2xl', 'rounded-br-md');
      } else if (groupEnd) {
        classes.push('rounded-2xl', 'rounded-tr-md');
      } else {
        classes.push('rounded-2xl', 'rounded-tr-md', 'rounded-br-md');
      }
    } else {
      // Received messages (left side)
      if (groupStart && groupEnd) {
        classes.push('rounded-2xl');
      } else if (groupStart) {
        classes.push('rounded-2xl', 'rounded-bl-md');
      } else if (groupEnd) {
        classes.push('rounded-2xl', 'rounded-tl-md');
      } else {
        classes.push('rounded-2xl', 'rounded-tl-md', 'rounded-bl-md');
      }
    }

    return classes.join(' ');
  }

  /**
   * Get avatar HTML for received messages
   */
  _getAvatarHTML(avatar, name) {
    if (avatar) {
      const escapedAvatar = DryChatBubble._escapeHtml(avatar);
      const escapedName = DryChatBubble._escapeHtml(name);
      return `<img src="${escapedAvatar}" alt="${escapedName}" class="w-8 h-8 rounded-full flex-shrink-0 object-cover">`;
    }
    return '<div class="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-medium">' +
           (name ? DryChatBubble._escapeHtml(name.charAt(0).toUpperCase()) : '?') +
           '</div>';
  }

  /**
   * Get metadata HTML (timestamp and status)
   */
  _getMetadataHTML(type, timestamp, status) {
    let html = '<div class="flex items-center gap-1 mt-1 px-1">';

    // Add timestamp if provided
    if (timestamp) {
      const formattedTime = this._formatTimestamp(timestamp);
      html += `<span class="text-xs text-gray-500">${DryChatBubble._escapeHtml(formattedTime)}</span>`;
    }

    // Add status indicator for sent messages
    if (type === 'sent' && status) {
      html += this._getStatusIconHTML(status);
    }

    html += '</div>';
    return html;
  }

  /**
   * Format timestamp for display
   */
  _formatTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        // Format as date
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      return '';
    }
  }

  /**
   * Get status icon HTML
   */
  _getStatusIconHTML(status) {
    const icons = {
      sent: '<svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>',
      delivered: '<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      read: '<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      failed: '<svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
    };
    return icons[status] || '';
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    // Re-render on any attribute change
    this.reRender();
  }

  /**
   * Public API: Set message type
   */
  setType(type) {
    this.setAttribute('type', type);
  }

  /**
   * Public API: Set sender name
   */
  setName(name) {
    this.setAttribute('name', name);
  }

  /**
   * Public API: Set avatar URL
   */
  setAvatar(avatar) {
    this.setAttribute('avatar', avatar);
  }

  /**
   * Public API: Set status
   */
  setStatus(status) {
    this.setAttribute('status', status);
  }

  /**
   * Public API: Set timestamp
   */
  setTimestamp(timestamp) {
    this.setAttribute('timestamp', timestamp);
  }

  /**
   * Public API: Set message content
   */
  setContent(content) {
    this._originalContent = content;
    if (this.hasAttribute('data-rendered')) {
      this.reRender();
    }
  }

  /**
   * Get/Set type property
   */
  get type() {
    return this.getAttr('type', 'sent');
  }

  set type(value) {
    this.setType(value);
  }

  /**
   * Get/Set name property
   */
  get name() {
    return this.getAttr('name', '');
  }

  set name(value) {
    this.setName(value);
  }

  /**
   * Get/Set avatar property
   */
  get avatar() {
    return this.getAttr('avatar', '');
  }

  set avatar(value) {
    this.setAvatar(value);
  }

  /**
   * Get/Set status property
   */
  get status() {
    return this.getAttr('status', '');
  }

  set status(value) {
    this.setStatus(value);
  }

  /**
   * Get/Set timestamp property
   */
  get timestamp() {
    return this.getAttr('timestamp', '');
  }

  set timestamp(value) {
    this.setTimestamp(value);
  }

  /**
   * Get/Set group-start property
   */
  get groupStart() {
    return this.getBoolAttr('group-start', false);
  }

  set groupStart(value) {
    if (value) {
      this.setAttribute('group-start', '');
    } else {
      this.removeAttribute('group-start');
    }
  }

  /**
   * Get/Set group-end property
   */
  get groupEnd() {
    return this.getBoolAttr('group-end', false);
  }

  set groupEnd(value) {
    if (value) {
      this.setAttribute('group-end', '');
    } else {
      this.removeAttribute('group-end');
    }
  }
}

// Register the custom element
customElements.define('dry-chat-bubble', DryChatBubble);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryChatBubble;
}


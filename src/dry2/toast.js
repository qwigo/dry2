class DryToast extends BaseElement {
  constructor() {
    super();
    this._isVisible = false;
    this._timer = null;
    this._container = null;
  }

  static get observedAttributes() {
    return ['message', 'type', 'position', 'duration', 'auto-show', 'container-class', 'toast-class'];
  }

  disconnectedCallback() {
    this._clearTimer();
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
  }

  _initializeComponent() {
    // Hide the original element
    this.style.display = 'none';

    // Auto-show if specified
    if (this._getBooleanAttribute('auto-show')) {
      setTimeout(() => this.show(), 100);
    }
  }

  show() {
    if (this._isVisible) return;

    this._createToastContainer();
    this._isVisible = true;

    // Trigger show animation
    setTimeout(() => {
      this._container.classList.add('show');
    }, 10);

    // Set auto-hide timer
    const duration = this.duration;
    if (duration > 0) {
      this._timer = setTimeout(() => this.hide(), duration);
    }

    this._dispatchToastEvent('toast:show');
  }

  hide() {
    if (!this._isVisible || !this._container) return;

    this._clearTimer();
    this._container.classList.remove('show');
    this._container.classList.add('hide');

    // Remove after animation
    setTimeout(() => {
      if (this._container && this._container.parentNode) {
        this._container.parentNode.removeChild(this._container);
      }
      this._container = null;
      this._isVisible = false;
      this._dispatchToastEvent('toast:hide');
    }, 300);
  }

  _createToastContainer() {
    if (this._container) {
      this._container.parentNode.removeChild(this._container);
    }

    this._container = document.createElement('div');
    this._container.className = this._getContainerClasses();

    const toast = document.createElement('div');
    toast.className = this._getToastClasses();
    toast.innerHTML = this._getToastContent();

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'toast-close ml-4 text-lg font-bold opacity-70 hover:opacity-100 transition-opacity';
    closeBtn.onclick = () => this.hide();

    toast.appendChild(closeBtn);
    this._container.appendChild(toast);

    // Add to document body
    document.body.appendChild(this._container);
  }

  _getContainerClasses() {
    const customClass = this.getAttribute('container-class');
    if (customClass) return customClass;

    let classes = 'toast-container fixed z-50 pointer-events-none transition-all duration-300 ';

    const position = this.position;
    if (position === 'top-left') {
      classes += 'top-4 left-4 ';
    } else if (position === 'top-center') {
      classes += 'top-4 left-1/2 transform -translate-x-1/2 ';
    } else if (position === 'top-right') {
      classes += 'top-4 right-4 ';
    } else if (position === 'bottom-left') {
      classes += 'bottom-4 left-4 ';
    } else if (position === 'bottom-center') {
      classes += 'bottom-4 left-1/2 transform -translate-x-1/2 ';
    } else {
      // bottom-right or default
      classes += 'bottom-4 right-4 ';
    }

    return classes.trim();
  }

  _getToastClasses() {
    const customClass = this.getAttribute('toast-class');
    if (customClass) return customClass;

    let classes = 'toast pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300 max-w-sm ';

    const type = this.type;
    if (type === 'success') {
      classes += 'bg-green-500 text-white ';
    } else if (type === 'warning') {
      classes += 'bg-yellow-500 text-gray-800 ';
    } else if (type === 'error') {
      classes += 'bg-red-500 text-white ';
    } else {
      // info or default
      classes += 'bg-blue-500 text-white ';
    }

    return classes.trim();
  }

  _getToastContent() {
    const message = this.message || '';
    const type = this.type;

    let icon = '';
    if (type === 'success') {
      icon = '<svg class="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
    } else if (type === 'warning') {
      icon = '<svg class="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
    } else if (type === 'error') {
      icon = '<svg class="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
    } else {
      // info or default
      icon = '<svg class="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
    }

    return `
            <div class="flex items-center">
                ${icon}
                <div class="toast-message">${this._escapeHtml(message)}</div>
            </div>
        `;
  }

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _dispatchToastEvent(eventName) {
    this._dispatchEvent(eventName, {
      toast: this,
      type: this.type,
      message: this.message
    });
  }

  _escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Getters and setters
  get message() {
    return this._getAttributeWithDefault('message', '');
  }

  set message(value) {
    this._setAttribute('message', value);
  }

  get type() {
    return this._getAttributeWithDefault('type', 'info');
  }

  set type(value) {
    this._setAttribute('type', value);
  }

  get position() {
    return this._getAttributeWithDefault('position', 'bottom-right');
  }

  set position(value) {
    this._setAttribute('position', value);
  }

  get duration() {
    return this._getNumericAttribute('duration', 3000);
  }

  set duration(value) {
    this._setNumericAttribute('duration', value);
  }

  _handleAttributeChange(name, oldValue, newValue) {
    if (oldValue !== newValue && this._isVisible) {
      // Re-render the toast if it's currently visible
      this.hide();
      setTimeout(() => this.show(), 100);
    }
  }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .toast-container.show .toast {
        transform: translateY(0);
        opacity: 1;
    }
    
    .toast-container.hide .toast {
        transform: translateY(100%);
        opacity: 0;
    }
    
    .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);

// Static methods for convenience
class Toast {
  static info(message, options = {}) {
    return Toast._create('info', message, options);
  }

  static success(message, options = {}) {
    return Toast._create('success', message, options);
  }

  static warning(message, options = {}) {
    return Toast._create('warning', message, options);
  }

  static error(message, options = {}) {
    return Toast._create('error', message, options);
  }

  static _create(type, message, options = {}) {
    const toast = document.createElement('dry-toast');
    toast.setAttribute('message', message);
    toast.setAttribute('type', type);

    if (options.position) toast.setAttribute('position', options.position);
    if (options.duration !== undefined) toast.setAttribute('duration', options.duration.toString());
    if (options.containerClass) toast.setAttribute('container-class', options.containerClass);
    if (options.toastClass) toast.setAttribute('toast-class', options.toastClass);

    document.body.appendChild(toast);

    setTimeout(() => toast.show(), 10);

    return toast;
  }
}

// Make Toast available globally
window.Toast = Toast;
window.DRY2 = window.DRY2 || {};
window.DRY2.Toast = Toast;

customElements.define('dry-toast', DryToast);

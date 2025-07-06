class DryCountdown extends BaseElement {
  constructor() {
    super();
    this.interval = null;
    this.isPaused = false;
    this.remainingTime = 0;
    this.initialTime = 0;
    this.pausedTime = 0;
    this._isDestroyed = false;
    this._cachedElements = null;
  }

  _initializeComponent() {
    try {
      if (this._validateConfiguration()) {
        this._calculateInitialTime();
        this._render();
        if (this._getBooleanAttribute('autostart')) {
          this._startCountdown();
        }
      }
    } catch (error) {
      this._handleError('Failed to initialize countdown component', error);
    }
  }

  disconnectedCallback() {
    this._cleanup();
    super.disconnectedCallback?.();
  }

  _cleanup() {
    this._isDestroyed = true;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  _validateConfiguration() {
    const targetDate = this.targetDate;
    const duration = this.duration;
    
    // Must have either target date or duration
    if (!targetDate && !duration) {
      this._handleError('Countdown requires either target-date or duration attribute');
      return false;
    }
    
    // Validate target date if provided
    if (targetDate && !this._validateDate(targetDate)) {
      this._handleError(`Invalid target date: ${targetDate}`);
      return false;
    }
    
    // Validate duration if provided
    if (duration && (isNaN(duration) || duration < 0)) {
      this._handleError(`Invalid duration: ${duration}. Must be a positive number`);
      return false;
    }
    
    return true;
  }
  
  _validateDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date > new Date();
  }

  static get observedAttributes() {
    return [
      'target-date', 'duration', 'format', 'autostart', 'expiry-text',
      'leading-zeros', 'show-zeros', 'unit-class',
      'days-label', 'hours-label', 'minutes-label', 'seconds-label'
    ];
  }

  _handleAttributeChange(name, oldValue, newValue) {
    if (this.isConnected && oldValue !== newValue && !this._isDestroyed) {
      try {
        if (name === 'target-date' || name === 'duration') {
          if (this._validateConfiguration()) {
            this._calculateInitialTime();
          } else {
            return; // Don't render if validation fails
          }
        }
        this._render();
      } catch (error) {
        this._handleError(`Failed to handle attribute change for ${name}`, error);
      }
    }
  }

  get targetDate() {
    const date = this.getAttribute('target-date');
    return date ? this._escapeHtml(date) : null;
  }

  set targetDate(value) {
    if (value && this._validateDate(value)) {
      this._setAttribute('target-date', value);
    } else {
      this._handleError(`Invalid target date: ${value}`);
    }
  }

  get duration() {
    return this._getNumericAttribute('duration', 0);
  }

  set duration(value) {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
      this._setNumericAttribute('duration', numValue);
    } else {
      this._handleError(`Invalid duration: ${value}. Must be a positive number`);
    }
  }

  get format() {
    const format = this._getAttributeWithDefault('format', 'days,hours,minutes,seconds');
    return this._validateFormat(format);
  }
  
  _validateFormat(format) {
    const validUnits = ['days', 'hours', 'minutes', 'seconds'];
    const units = format.split(',').map(u => u.trim()).filter(u => validUnits.includes(u));
    return units.length > 0 ? units.join(',') : 'days,hours,minutes,seconds';
  }

  get unitClass() {
    return this._getAttributeWithDefault('unit-class', 'mx-2');
  }

  get leadingZeros() {
    return this._getBooleanAttribute('leading-zeros');
  }

  get showZeros() {
    return this._getBooleanAttribute('show-zeros');
  }

  get expiryText() {
    const text = this._getAttributeWithDefault('expiry-text', '');
    return this._escapeHtml(text);
  }

  getLabel(unit, value) {
    const labelAttr = this.getAttribute(`${unit}-label`);
    const defaultLabels = {
      days: 'Day|Days',
      hours: 'Hour|Hours',
      minutes: 'Minute|Minutes',
      seconds: 'Second|Seconds'
    };

    const label = labelAttr || defaultLabels[unit];
    const [singular, plural] = label.split('|');
    return this._escapeHtml(value === 1 ? singular : plural);
  }

  _calculateInitialTime() {
    try {
      if (this.targetDate) {
        const target = new Date(this.targetDate);
        const now = new Date();
        this.initialTime = Math.max(0, Math.floor((target - now) / 1000));
      } else if (this.duration) {
        this.initialTime = Math.max(0, this.duration);
      } else {
        this.initialTime = 0;
      }
      this.remainingTime = this.initialTime;
    } catch (error) {
      this._handleError('Failed to calculate initial time', error);
      this.initialTime = 0;
      this.remainingTime = 0;
    }
  }

  _formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return { days, hours, minutes, seconds: secs };
  }

  _formatValue(value) {
    const numValue = Math.max(0, Math.floor(value));
    return this.leadingZeros ? numValue.toString().padStart(2, '0') : numValue.toString();
  }

  _shouldShowUnit(unit, value) {
    if (this.showZeros) return true;
    return value > 0;
  }

  _render() {
    if (this._isDestroyed) return;
    
    try {
      // Check for expiry first
      if (this.remainingTime <= 0 && this.expiryText) {
        const expiredDiv = document.createElement('div');
        expiredDiv.className = 'text-center';
        expiredDiv.textContent = this.expiryText;
        
        this.innerHTML = '';
        this.appendChild(expiredDiv);
        return;
      }

      if (this.remainingTime <= 0) {
        const expiredSlot = this.querySelector('[slot="expired"]');
        if (expiredSlot) {
          const expiredContent = expiredSlot.cloneNode(true);
          expiredContent.removeAttribute('slot');
          
          this.innerHTML = '';
          this.appendChild(expiredContent);
          return;
        }
      }

      const timeUnits = this._formatTime(this.remainingTime);
      const formatUnits = this.format.split(',').map(u => u.trim());
      const unitClass = this.unitClass;

      const container = document.createElement('div');
      container.className = 'flex items-center justify-center';

      formatUnits.forEach((unit) => {
        const value = timeUnits[unit];
        if (this._shouldShowUnit(unit, value) || formatUnits.length === 1) {
          const unitDiv = document.createElement('div');
          unitDiv.className = unitClass;
          
          const innerDiv = document.createElement('div');
          innerDiv.className = 'text-center';
          
          const valueDiv = document.createElement('div');
          valueDiv.className = 'text-2xl font-bold text-gray-900 dark:text-gray-100';
          valueDiv.textContent = this._formatValue(value);
          
          const labelDiv = document.createElement('div');
          labelDiv.className = 'text-sm text-gray-600 dark:text-gray-400';
          labelDiv.textContent = this.getLabel(unit, value);
          
          innerDiv.appendChild(valueDiv);
          innerDiv.appendChild(labelDiv);
          unitDiv.appendChild(innerDiv);
          container.appendChild(unitDiv);
        }
      });

      this.innerHTML = '';
      this.appendChild(container);
      
    } catch (error) {
      this._handleError('Failed to render countdown', error);
    }
  }

  _startCountdown() {
    if (this._isDestroyed) return;
    
    try {
      if (this.interval) {
        clearInterval(this.interval);
      }

      // Only recalculate initial time if not already running
      if (this.remainingTime === 0) {
        this._calculateInitialTime();
      }

      this.isPaused = false;

      this.interval = setInterval(() => {
        if (this.isPaused || this._isDestroyed) return;

        try {
          if (this.targetDate) {
            // For target dates, always recalculate from current time
            const target = new Date(this.targetDate);
            const now = new Date();
            this.remainingTime = Math.max(0, Math.floor((target - now) / 1000));
          } else {
            // For duration-based, just decrement
            this.remainingTime = Math.max(0, this.remainingTime - 1);
          }

          this._render();

          if (this.remainingTime <= 0) {
            this._complete();
          }
        } catch (error) {
          this._handleError('Error in countdown interval', error);
          this._complete();
        }
      }, 1000);

      this._dispatchEvent('countdown:started', { remainingTime: this.remainingTime });
    } catch (error) {
      this._handleError('Failed to start countdown', error);
    }
  }

  _pause() {
    if (this._isDestroyed) return;
    
    this.isPaused = true;
    this._dispatchEvent('countdown:paused', { remainingTime: this.remainingTime });
  }

  _resume() {
    if (this._isDestroyed) return;
    
    this.isPaused = false;
    this._dispatchEvent('countdown:resumed', { remainingTime: this.remainingTime });
  }

  _reset() {
    if (this._isDestroyed) return;
    
    try {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }

      this.isPaused = false;
      this._calculateInitialTime();
      this._render();

      if (this._getBooleanAttribute('autostart')) {
        this._startCountdown();
      }

      this._dispatchEvent('countdown:reset', { remainingTime: this.remainingTime });
    } catch (error) {
      this._handleError('Failed to reset countdown', error);
    }
  }

  _complete() {
    if (this._isDestroyed) return;
    
    try {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }

      this._render();
      this._dispatchEvent('countdown:completed', { completedAt: new Date() });
    } catch (error) {
      this._handleError('Error in countdown completion', error);
    }
  }
  
  _handleError(message, error) {
    console.error(`DryCountdown: ${message}`, error);
    this._dispatchEvent('countdown:error', { 
      message, 
      error: error?.message,
      timestamp: new Date()
    });
  }

  // Public API with validation
  startCountdown() {
    if (this._validateConfiguration()) {
      this._startCountdown();
    }
  }

  pause() {
    this._pause();
  }

  resume() {
    this._resume();
  }

  reset() {
    this._reset();
  }

  getRemainingTime() {
    return {
      total: this.remainingTime,
      formatted: this._formatTime(this.remainingTime)
    };
  }

  isRunning() {
    return this.interval !== null && !this.isPaused;
  }

  isPausedState() {
    return this.isPaused;
  }

  isCompleted() {
    return this.remainingTime <= 0;
  }

  // Enhanced attributeChangedCallback with better error handling
  attributeChangedCallback(name, oldValue, newValue) {
    if (this._isInitialized && oldValue !== newValue) {
      this._handleAttributeChange(name, oldValue, newValue);
    }
  }
}

// Register the custom element
customElements.define('dry-countdown', DryCountdown);

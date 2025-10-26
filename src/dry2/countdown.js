/**
 * DRY2 Countdown Component
 * A countdown timer component with flexible formatting options and support for target dates or durations
 * Built with vanilla JavaScript using BaseElement
 */

class DryCountdown extends BaseElement {
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
    return [
      'target-date',
      'duration',
      'format',
      'autostart',
      'leading-zeros',
      'show-zeros',
      'expiry-text',
      'days-label',
      'hours-label',
      'minutes-label',
      'seconds-label',
      'unit-class'
    ];
  }

  constructor() {
    super();
    this._intervalId = null;
    this._isPaused = false;
    this._remainingTime = 0;
    this._initialDuration = 0;
    this._expiredSlot = null;
    this._countdownContainer = null;
  }

  /**
   * Override connectedCallback to capture expired slot content
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Set display style once on first connection
      if (!this.style.display) {
        this.style.display = 'block';
      }

      // Check if there's expired slot content
      const expiredSlot = this.querySelector('[slot="expired"]');
      const hasExpiredSlot = !!expiredSlot;
      
      if (expiredSlot) {
        this._expiredSlot = expiredSlot.cloneNode(true);
      }

      // If we have slotted content or no content at all, we can render immediately
      if (!hasExpiredSlot || this.childNodes.length <= 1) {
        // Remove the expired slot if it exists so it doesn't interfere with rendering
        if (expiredSlot) {
          expiredSlot.remove();
        }
        super.connectedCallback();
      } else {
        // Wait for all slotted content to be fully parsed
        setTimeout(() => {
          if (this.isConnected && !this.hasAttribute('data-rendered')) {
            const slot = this.querySelector('[slot="expired"]');
            if (slot) {
              this._expiredSlot = slot.cloneNode(true);
              slot.remove();
            }
            super.connectedCallback();
          }
        }, 50);
      }
    } else {
      // Already rendered, just reattach listeners
      super.connectedCallback();
    }
  }

  /**
   * Before render hook - initialize countdown values
   */
  beforeRender() {
    const targetDate = this.getAttr('target-date', '');
    const duration = this.getNumberAttr('duration', 0);

    if (targetDate) {
      const target = new Date(targetDate);
      const now = new Date();
      this._remainingTime = Math.max(0, Math.floor((target - now) / 1000));
      this._initialDuration = this._remainingTime;
    } else if (duration > 0) {
      this._remainingTime = duration;
      this._initialDuration = duration;
    } else {
      this._remainingTime = 0;
      this._initialDuration = 0;
    }
  }

  /**
   * Main render method
   */
  render() {
    const format = this.getAttr('format', 'days,hours,minutes,seconds');
    const showZeros = this.getBoolAttr('show-zeros', false);
    const unitClass = this.getAttr('unit-class', '');
    const expiryText = this.getAttr('expiry-text', "Time's up!");

    // Clear existing content
    if (typeof this.replaceChildren === 'function') {
      this.replaceChildren();
    } else {
      this.textContent = '';
    }

    // Create countdown container
    this._countdownContainer = document.createElement('div');
    this._countdownContainer.className = 'countdown-display flex gap-4';
    this.appendChild(this._countdownContainer);

    // Check if expired
    if (this._remainingTime <= 0) {
      this._renderExpired(expiryText);
      return;
    }

    // Render time units
    this._renderTimeUnits(format, showZeros, unitClass);
  }

  /**
   * After render hook - start countdown if autostart is enabled
   */
  afterRender() {
    const autostart = this.getBoolAttr('autostart', false);
    if (autostart && this._remainingTime > 0) {
      this.startCountdown();
    }
  }

  /**
   * Render time units based on format
   */
  _renderTimeUnits(format, showZeros, unitClass) {
    const units = format.split(',').map(u => u.trim());
    const timeValues = this._calculateTimeValues();

    units.forEach(unit => {
      const value = timeValues[unit];
      if (value !== undefined && (showZeros || value > 0)) {
        const unitElement = this._createUnitElement(unit, value, unitClass);
        this._countdownContainer.appendChild(unitElement);
      }
    });
  }

  /**
   * Calculate time values for all units
   */
  _calculateTimeValues() {
    const total = this._remainingTime;
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    return { days, hours, minutes, seconds };
  }

  /**
   * Create a single time unit element
   */
  _createUnitElement(unit, value, unitClass) {
    const leadingZeros = this.getBoolAttr('leading-zeros', false);
    const formattedValue = leadingZeros ? String(value).padStart(2, '0') : String(value);
    const label = this._getUnitLabel(unit, value);

    const unitElement = document.createElement('div');
    // Always include countdown-unit class, then add custom classes if provided
    const baseClass = 'countdown-unit flex flex-col items-center';
    unitElement.className = unitClass ? `${baseClass} ${unitClass}` : baseClass;
    unitElement.setAttribute('data-unit', unit);

    const valueElement = document.createElement('span');
    valueElement.className = 'countdown-value text-4xl font-bold';
    valueElement.textContent = formattedValue;

    const labelElement = document.createElement('span');
    labelElement.className = 'countdown-label text-sm text-gray-600';
    labelElement.textContent = label;

    unitElement.appendChild(valueElement);
    unitElement.appendChild(labelElement);

    return unitElement;
  }

  /**
   * Get label for a time unit (handles singular/plural)
   */
  _getUnitLabel(unit, value) {
    const labelAttr = this.getAttr(`${unit}-label`, '');
    
    if (labelAttr) {
      const [singular, plural] = labelAttr.split('|');
      return value === 1 ? singular : (plural || singular);
    }

    // Default labels
    const defaults = {
      days: value === 1 ? 'Day' : 'Days',
      hours: value === 1 ? 'Hour' : 'Hours',
      minutes: value === 1 ? 'Minute' : 'Minutes',
      seconds: value === 1 ? 'Second' : 'Seconds'
    };

    return defaults[unit] || unit;
  }

  /**
   * Render expired state
   */
  _renderExpired(expiryText) {
    if (this._expiredSlot) {
      this._countdownContainer.innerHTML = '';
      this._countdownContainer.appendChild(this._expiredSlot.cloneNode(true));
    } else {
      this._countdownContainer.innerHTML = `<div class="countdown-expired text-xl font-semibold">${DryCountdown._escapeHtml(expiryText)}</div>`;
    }
  }

  /**
   * Update the countdown display
   */
  _updateDisplay() {
    const format = this.getAttr('format', 'days,hours,minutes,seconds');
    const showZeros = this.getBoolAttr('show-zeros', false);
    const leadingZeros = this.getBoolAttr('leading-zeros', false);

    const timeValues = this._calculateTimeValues();
    const units = format.split(',').map(u => u.trim());

    units.forEach(unit => {
      const value = timeValues[unit];
      if (value !== undefined && (showZeros || value > 0)) {
        const unitElement = this._countdownContainer.querySelector(`[data-unit="${unit}"]`);
        if (unitElement) {
          const valueElement = unitElement.querySelector('.countdown-value');
          const labelElement = unitElement.querySelector('.countdown-label');
          
          if (valueElement) {
            const formattedValue = leadingZeros ? String(value).padStart(2, '0') : String(value);
            valueElement.textContent = formattedValue;
          }
          
          if (labelElement) {
            labelElement.textContent = this._getUnitLabel(unit, value);
          }
        }
      }
    });
  }

  /**
   * Start the countdown
   */
  startCountdown() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }

    this._isPaused = false;

    this._intervalId = setInterval(() => {
      if (!this._isPaused) {
        this._remainingTime--;

        if (this._remainingTime <= 0) {
          this._remainingTime = 0;
          this._handleExpiry();
        } else {
          this._updateDisplay();
        }
      }
    }, 1000);
  }

  /**
   * Handle countdown expiry
   */
  _handleExpiry() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    const expiryText = this.getAttr('expiry-text', "Time's up!");
    this._renderExpired(expiryText);
    this.emit('countdown:completed', { timestamp: new Date() });
  }

  /**
   * Pause the countdown
   */
  pause() {
    if (!this._isPaused && this._intervalId) {
      this._isPaused = true;
      this.emit('countdown:paused', { remainingTime: this._remainingTime });
    }
  }

  /**
   * Resume the countdown
   */
  resume() {
    if (this._isPaused) {
      this._isPaused = false;
      this.emit('countdown:resumed', { remainingTime: this._remainingTime });
    }
  }

  /**
   * Reset the countdown
   */
  reset() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    this._isPaused = false;
    
    // Recalculate remaining time based on target-date or duration
    const targetDate = this.getAttr('target-date', '');
    if (targetDate) {
      const target = new Date(targetDate);
      const now = new Date();
      this._remainingTime = Math.max(0, Math.floor((target - now) / 1000));
      this._initialDuration = this._remainingTime;
    } else {
      this._remainingTime = this._initialDuration;
    }

    this.reRender();
    this.emit('countdown:reset', { remainingTime: this._remainingTime });

    // Auto-start if enabled
    const autostart = this.getBoolAttr('autostart', false);
    if (autostart && this._remainingTime > 0) {
      this.startCountdown();
    }
  }

  /**
   * Cleanup - clear interval
   */
  cleanup() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    // For dynamic changes, reset and re-render
    if (['target-date', 'duration', 'format'].includes(name)) {
      this.reset();
    } else {
      this.reRender();
    }
  }

  /**
   * Get/Set target-date property
   */
  get targetDate() {
    return this.getAttr('target-date', '');
  }

  set targetDate(value) {
    if (value) {
      this.setAttribute('target-date', value);
    } else {
      this.removeAttribute('target-date');
    }
  }

  /**
   * Get/Set duration property
   */
  get duration() {
    return this.getNumberAttr('duration', 0);
  }

  set duration(value) {
    this.setAttribute('duration', String(value));
  }

  /**
   * Get/Set format property
   */
  get format() {
    return this.getAttr('format', 'days,hours,minutes,seconds');
  }

  set format(value) {
    this.setAttribute('format', value);
  }

  /**
   * Get/Set autostart property
   */
  get autostart() {
    return this.getBoolAttr('autostart', false);
  }

  set autostart(value) {
    if (value) {
      this.setAttribute('autostart', '');
    } else {
      this.removeAttribute('autostart');
    }
  }

  /**
   * Get remaining time in seconds
   */
  get remainingTime() {
    return this._remainingTime;
  }

  /**
   * Check if countdown is paused
   */
  get isPaused() {
    return this._isPaused;
  }

  /**
   * Check if countdown is running
   */
  get isRunning() {
    return this._intervalId !== null && !this._isPaused;
  }
}

// Register the custom element
customElements.define('dry-countdown', DryCountdown);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryCountdown;
}


/**
 * DryThemeToggle (`dry-theme-toggle`)
 *
 * A light/dark theme switcher web component. It toggles an explicit theme by
 * setting `.dark` or `.light` on the document root (<html>), which dry2.css
 * uses to override the OS `prefers-color-scheme` default. The choice is
 * persisted to localStorage so it survives reloads.
 *
 * Resolution order on load:
 *   1. Stored preference ('light' | 'dark'), if present.
 *   2. Otherwise follow the OS setting (no class is forced).
 *
 * Attributes:
 *   - storage-key: localStorage key for the saved preference (default 'dry-theme').
 *
 * Events:
 *   - theme:change → detail { theme: 'light' | 'dark' }
 *
 * Usage:
 *   <dry-theme-toggle></dry-theme-toggle>
 */
class DryThemeToggle extends BaseElement {
  static get observedAttributes() {
    return ['storage-key'];
  }

  get storageKey() {
    return this.getAttr('storage-key', 'dry-theme');
  }

  /**
   * Apply the stored theme as early as possible to reduce flash, then let
   * BaseElement schedule the (deferred) render of the button UI.
   */
  connectedCallback() {
    this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._systemListener = () => {
      if (!this._getStoredTheme()) this.reRender();
    };
    this._mediaQuery.addEventListener('change', this._systemListener);

    const stored = this._getStoredTheme();
    if (stored) this._applyTheme(stored, false);

    super.connectedCallback();
  }

  cleanup() {
    if (this._mediaQuery && this._systemListener) {
      this._mediaQuery.removeEventListener('change', this._systemListener);
    }
  }

  /**
   * Read a persisted preference, tolerating environments without localStorage.
   */
  _getStoredTheme() {
    try {
      const value = window.localStorage.getItem(this.storageKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null;
    }
  }

  _setStoredTheme(theme) {
    try {
      window.localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      // Ignore storage failures (private mode, disabled cookies, etc.)
    }
  }

  /**
   * The currently active theme, resolving the OS preference when no explicit
   * choice has been made.
   */
  get currentTheme() {
    const stored = this._getStoredTheme();
    if (stored) return stored;
    return this._mediaQuery && this._mediaQuery.matches ? 'dark' : 'light';
  }

  /**
   * Apply a theme by toggling the root classes dry2.css keys off of.
   */
  _applyTheme(theme, persist = true) {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    if (persist) this._setStoredTheme(theme);
  }

  /**
   * Public API: switch to the opposite of the active theme.
   */
  toggle() {
    const next = this.currentTheme === 'dark' ? 'light' : 'dark';
    this._applyTheme(next, true);
    this.reRender();
    this.emit('theme:change', { theme: next });
    return next;
  }

  /**
   * Public API: set a specific theme.
   */
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    this._applyTheme(theme, true);
    this.reRender();
    this.emit('theme:change', { theme });
  }

  _iconFor(theme) {
    if (theme === 'dark') {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>';
  }

  render() {
    const theme = this.currentTheme;
    const next = theme === 'dark' ? 'light' : 'dark';
    const label = `Switch to ${next} theme`;
    const buttonStyle = [
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'width:2.25rem',
      'height:2.25rem',
      'padding:0',
      'border-radius:0.5rem',
      'border:1px solid var(--stem-color-border-light)',
      'background:var(--stem-color-bg-surface)',
      'color:var(--stem-color-text-base)',
      'cursor:pointer',
      'transition:background 0.15s, color 0.15s, border-color 0.15s'
    ].join(';');

    this.innerHTML =
      `<button type="button" class="dry-theme-toggle__btn" aria-label="${label}" ` +
      `title="${label}" aria-pressed="${theme === 'dark'}" style="${buttonStyle}">` +
      `${this._iconFor(theme)}</button>`;
  }

  attachEventListeners() {
    const button = this.$('.dry-theme-toggle__btn');
    if (button) {
      this.addTrackedListener(button, 'click', () => this.toggle());
    }
  }
}

customElements.define('dry-theme-toggle', DryThemeToggle);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryThemeToggle;
}

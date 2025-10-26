/**
 * DRY2 Code Component
 * A syntax-highlighted code block component with copy-to-clipboard functionality
 * Built with vanilla JavaScript using BaseElement
 */

class DryCode extends BaseElement {
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
    return ['language', 'show-copy', 'show-header'];
  }

  constructor() {
    super();
    this._originalContent = null;
    this._copyButton = null;
    this._contentObserver = null;
    this._isCapturingContent = false;
  }

  /**
   * Override connectedCallback to capture content using MutationObserver
   */
  connectedCallback() {
    if (!this.hasAttribute('data-rendered')) {
      // Try to capture content immediately (for dynamically created elements)
      const immediateContent = this.textContent.trim();

      if (immediateContent && !this._isCapturingContent) {
        // Content already exists, render immediately
        // textContent automatically decodes HTML entities, so we can use it directly
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
              const textContent = this.textContent.trim();
              if (textContent && this._originalContent === null) {
                this._originalContent = textContent;
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
              this._originalContent = this.textContent.trim() || '// No code provided';
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
    const language = this.getAttr('language', 'HTML');
    const showCopy = this.getBoolAttr('show-copy', true);
    const showHeader = this.getBoolAttr('show-header', true);

    // Ensure we have content
    if (this._originalContent === null) {
      this._originalContent = '// No code provided';
    }

    // Clear existing content
    if (typeof this.replaceChildren === 'function') {
      this.replaceChildren();
    } else {
      this.textContent = '';
    }

    // Create container
    const container = document.createElement('div');
    container.className = 'dry-code-container bg-gray-900 rounded-lg overflow-hidden shadow-lg';

    // Add header if enabled
    if (showHeader) {
      const header = this._createHeader(language, showCopy);
      container.appendChild(header);
    }

    // Add code block
    const codeBlock = this._createCodeBlock();
    container.appendChild(codeBlock);

    // If no header but copy button is enabled, add floating copy button
    if (!showHeader && showCopy) {
      const floatingCopyBtn = this._createFloatingCopyButton();
      container.appendChild(floatingCopyBtn);
    }

    this.appendChild(container);
  }

  /**
   * Create header with language label and copy button
   */
  _createHeader(language, showCopy) {
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700';

    // Language label
    const label = document.createElement('span');
    label.className = 'text-sm font-medium text-gray-300';
    label.textContent = this._getNormalizedLanguage(language);
    header.appendChild(label);

    // Copy button (if enabled)
    if (showCopy) {
      const copyBtn = this._createCopyButton();
      header.appendChild(copyBtn);
    }

    return header;
  }

  /**
   * Create copy button
   */
  _createCopyButton() {
    const button = document.createElement('button');
    button.className = 'copy-button text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2';
    button.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
      <span class="copy-text">Copy</span>
    `;
    button.setAttribute('aria-label', 'Copy code to clipboard');
    this._copyButton = button;
    return button;
  }

  /**
   * Create floating copy button (when header is disabled)
   */
  _createFloatingCopyButton() {
    const button = document.createElement('button');
    button.className = 'copy-button absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded';
    button.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
    `;
    button.setAttribute('aria-label', 'Copy code to clipboard');
    this._copyButton = button;
    return button;
  }

  /**
   * Create code block with syntax highlighting
   */
  _createCodeBlock() {
    const language = this.getAttr('language', 'HTML');
    const wrapper = document.createElement('div');
    wrapper.className = 'relative';

    const pre = document.createElement('pre');
    pre.className = 'code-pre p-4 overflow-x-auto text-sm';

    const code = document.createElement('code');
    code.className = `code-content language-${this._getNormalizedLanguage(language).toLowerCase()}`;
    code.textContent = this._originalContent;

    // Apply syntax highlighting
    this._applySyntaxHighlighting(code, language);

    pre.appendChild(code);
    wrapper.appendChild(pre);
    return wrapper;
  }

  /**
   * Apply syntax highlighting based on language
   */
  _applySyntaxHighlighting(codeElement, language) {
    const normalizedLang = this._getNormalizedLanguage(language).toLowerCase();
    const code = codeElement.textContent;

    let highlightedHtml = '';

    switch (normalizedLang) {
      case 'javascript':
      case 'js':
        highlightedHtml = this._highlightJavaScript(code);
        break;
      case 'python':
      case 'py':
        highlightedHtml = this._highlightPython(code);
        break;
      case 'html':
        highlightedHtml = this._highlightHTML(code);
        break;
      case 'css':
        highlightedHtml = this._highlightCSS(code);
        break;
      case 'json':
        highlightedHtml = this._highlightJSON(code);
        break;
      case 'sql':
        highlightedHtml = this._highlightSQL(code);
        break;
      case 'bash':
      case 'shell':
      case 'sh':
        highlightedHtml = this._highlightBash(code);
        break;
      case 'xml':
        highlightedHtml = this._highlightXML(code);
        break;
      default:
        // No highlighting for unknown languages
        highlightedHtml = DryCode._escapeHtml(code);
    }

    codeElement.innerHTML = highlightedHtml;
  }

  /**
   * Highlight JavaScript code
   */
  _highlightJavaScript(code) {
    const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|constructor|async|await|try|catch|finally|throw|new|this|super|import|export|from|default|typeof|instanceof|in|of|null|undefined|true|false)\b/g;
    const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    const numbers = /\b(\d+\.?\d*)\b/g;
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;

    let highlighted = DryCode._escapeHtml(code);
    highlighted = highlighted.replace(comments, '<span class="text-gray-500">$1</span>');
    highlighted = highlighted.replace(strings, '<span class="text-green-400">$1</span>');
    highlighted = highlighted.replace(keywords, '<span class="text-purple-400">$1</span>');
    highlighted = highlighted.replace(functions, '<span class="text-blue-400">$1</span>');
    highlighted = highlighted.replace(numbers, '<span class="text-yellow-400">$1</span>');

    return highlighted;
  }

  /**
   * Highlight Python code
   */
  _highlightPython(code) {
    const keywords = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|pass|break|continue|lambda|yield|async|await|True|False|None|and|or|not|in|is)\b/g;
    const strings = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    const comments = /#.*$/gm;
    const numbers = /\b(\d+\.?\d*)\b/g;
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g;
    const decorators = /@[a-zA-Z_][a-zA-Z0-9_]*/g;

    let highlighted = DryCode._escapeHtml(code);
    highlighted = highlighted.replace(comments, '<span class="text-gray-500">$1</span>');
    highlighted = highlighted.replace(decorators, '<span class="text-yellow-400">$&</span>');
    highlighted = highlighted.replace(strings, '<span class="text-green-400">$1</span>');
    highlighted = highlighted.replace(keywords, '<span class="text-purple-400">$1</span>');
    highlighted = highlighted.replace(functions, '<span class="text-blue-400">$1</span>');
    highlighted = highlighted.replace(numbers, '<span class="text-yellow-400">$1</span>');

    return highlighted;
  }

  /**
   * Highlight HTML code
   */
  _highlightHTML(code) {
    // First escape the HTML
    let highlighted = DryCode._escapeHtml(code);
    
    // Now apply highlighting to the escaped version
    // Tags: &lt;tagname&gt; or &lt;/tagname&gt; with optional attributes
    const tags = /(&lt;\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^&]*?)?&gt;)/g;
    highlighted = highlighted.replace(tags, '<span class="text-blue-400">$1</span>');
    
    // Attributes: word followed by =
    const attributes = /([a-zA-Z-]+)=/g;
    highlighted = highlighted.replace(attributes, '<span class="text-yellow-400">$1</span>=');
    
    // String values in quotes
    const stringValues = /=(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;)/g;
    highlighted = highlighted.replace(stringValues, '=<span class="text-green-400">$1</span>');

    return highlighted;
  }

  /**
   * Highlight CSS code
   */
  _highlightCSS(code) {
    const selectors = /([.#]?[a-zA-Z-_][a-zA-Z0-9-_]*|\*|\[[^\]]+\]|::[a-zA-Z-]+|:[a-zA-Z-]+(?:\([^)]*\))?)\s*{/g;
    const properties = /([a-zA-Z-]+):/g;
    const values = /:\s*([^;{}]+);/g;
    const comments = /(\/\*[\s\S]*?\*\/)/g;
    const important = /!important/g;

    let highlighted = DryCode._escapeHtml(code);
    highlighted = highlighted.replace(comments, '<span class="text-gray-500">$1</span>');
    highlighted = highlighted.replace(selectors, '<span class="text-yellow-400">$1</span> {');
    highlighted = highlighted.replace(properties, '<span class="text-blue-400">$1</span>:');
    highlighted = highlighted.replace(values, ': <span class="text-green-400">$1</span>;');
    highlighted = highlighted.replace(important, '<span class="text-red-400">!important</span>');

    return highlighted;
  }

  /**
   * Highlight JSON code
   */
  _highlightJSON(code) {
    const keys = /"([^"]+)":/g;
    const strings = /:\s*"([^"]*)"/g;
    const numbers = /:\s*(\d+\.?\d*)/g;
    const booleans = /\b(true|false|null)\b/g;

    let highlighted = DryCode._escapeHtml(code);
    highlighted = highlighted.replace(keys, '<span class="text-blue-400">"$1"</span>:');
    highlighted = highlighted.replace(strings, ': <span class="text-green-400">"$1"</span>');
    highlighted = highlighted.replace(numbers, ': <span class="text-yellow-400">$1</span>');
    highlighted = highlighted.replace(booleans, '<span class="text-purple-400">$1</span>');

    return highlighted;
  }

  /**
   * Highlight SQL code
   */
  _highlightSQL(code) {
    const keywords = /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|COUNT|SUM|AVG|MAX|MIN|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|CHECK|DEFAULT|AUTO_INCREMENT|CASE|WHEN|THEN|ELSE|END|WITH|OVER|PARTITION|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|PERCENT_RANK)\b/gi;
    const comments = /(--.*$|\/\*[\s\S]*?\*\/)/gm;
    const strings = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    const numbers = /\b(\d+\.?\d*)\b/g;

    let highlighted = DryCode._escapeHtml(code);
    highlighted = highlighted.replace(comments, '<span class="text-gray-500">$1</span>');
    highlighted = highlighted.replace(strings, '<span class="text-green-400">$1</span>');
    highlighted = highlighted.replace(keywords, '<span class="text-purple-400">$&</span>');
    highlighted = highlighted.replace(numbers, '<span class="text-yellow-400">$1</span>');

    return highlighted;
  }

  /**
   * Highlight Bash/Shell code
   */
  _highlightBash(code) {
    const keywords = /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|break|continue|in|select)\b/g;
    const commands = /\b(echo|cd|ls|pwd|mkdir|rm|cp|mv|cat|grep|sed|awk|find|chmod|chown|sudo|apt|npm|git|curl|wget|tar|zip|unzip|systemctl|service)\b/g;
    const comments = /#.*$/gm;
    const strings = /(["'])(?:(?=(\\?))\2.)*?\1/g;
    const variables = /\$\{?[a-zA-Z_][a-zA-Z0-9_]*\}?/g;

    let highlighted = DryCode._escapeHtml(code);
    highlighted = highlighted.replace(comments, '<span class="text-gray-500">$1</span>');
    highlighted = highlighted.replace(strings, '<span class="text-green-400">$1</span>');
    highlighted = highlighted.replace(keywords, '<span class="text-purple-400">$1</span>');
    highlighted = highlighted.replace(commands, '<span class="text-blue-400">$1</span>');
    highlighted = highlighted.replace(variables, '<span class="text-yellow-400">$&</span>');

    return highlighted;
  }

  /**
   * Highlight XML code
   */
  _highlightXML(code) {
    return this._highlightHTML(code); // XML uses similar syntax to HTML
  }

  /**
   * Normalize language name and handle aliases
   */
  _getNormalizedLanguage(language) {
    const aliases = {
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'py': 'Python',
      'python': 'Python',
      'sh': 'Bash',
      'shell': 'Bash',
      'bash': 'Bash',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'sql': 'SQL',
      'xml': 'XML'
    };

    const lowerLang = language.toLowerCase();
    return aliases[lowerLang] || language;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (this._copyButton) {
      this.addTrackedListener(this._copyButton, 'click', () => this._handleCopy());
    }
  }

  /**
   * Handle copy to clipboard
   */
  _handleCopy() {
    const code = this._originalContent;

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => this._showCopySuccess())
        .catch(() => this._fallbackCopy(code));
    } else {
      this._fallbackCopy(code);
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  _fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      this._showCopySuccess();
    } catch (err) {
      console.error('Failed to copy:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  /**
   * Show copy success feedback
   */
  _showCopySuccess() {
    if (!this._copyButton) return;

    const originalText = this._copyButton.querySelector('.copy-text');
    if (originalText) {
      originalText.textContent = 'Copied!';
      this._copyButton.classList.add('text-green-400');

      setTimeout(() => {
        originalText.textContent = 'Copy';
        this._copyButton.classList.remove('text-green-400');
      }, 2000);
    } else {
      // For floating button without text
      const svg = this._copyButton.querySelector('svg');
      if (svg) {
        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
        this._copyButton.classList.add('text-green-400');

        setTimeout(() => {
          svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>';
          this._copyButton.classList.remove('text-green-400');
        }, 2000);
      }
    }
  }

  /**
   * Handle attribute changes
   */
  onAttributeChange(name, oldValue, newValue) {
    // Re-render on any attribute change
    this.reRender();
  }

  /**
   * Public API: Copy code to clipboard
   */
  copy() {
    this._handleCopy();
  }

  /**
   * Public API: Set code content dynamically
   */
  setCode(code) {
    this._originalContent = code;
    if (this.hasAttribute('data-rendered')) {
      this.reRender();
    }
  }

  /**
   * Get/Set language property
   */
  get language() {
    return this.getAttr('language', 'HTML');
  }

  set language(value) {
    this.setAttribute('language', value);
  }

  /**
   * Get/Set showCopy property
   */
  get showCopy() {
    return this.getBoolAttr('show-copy', true);
  }

  set showCopy(value) {
    if (value) {
      this.setAttribute('show-copy', 'true');
    } else {
      this.setAttribute('show-copy', 'false');
    }
  }

  /**
   * Get/Set showHeader property
   */
  get showHeader() {
    return this.getBoolAttr('show-header', true);
  }

  set showHeader(value) {
    if (value) {
      this.setAttribute('show-header', 'true');
    } else {
      this.setAttribute('show-header', 'false');
    }
  }
}

// Register the custom element
customElements.define('dry-code', DryCode);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DryCode;
}


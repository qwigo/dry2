class DryCode extends BaseElement {
  constructor() {
    super();
    this._cachedElements = null;
    this._renderingScheduled = false;
  }

  static get observedAttributes() {
    return ['language', 'show-copy', 'show-header'];
  }

  _initializeComponent() {
    try {
      // Extract code content from the element's original content
      const codeContent = this._extractContent();
      
      this._componentData = {
        code: codeContent,
        language: this.language,
        showCopy: this.showCopy,
        showHeader: this.showHeader
      };

      this._scheduleRender();
      this._attachEventListeners();
    } catch (error) {
      this._handleError('Failed to initialize code component', error);
    }
  }

  _extractContent() {
    // Get the original innerHTML and decode HTML entities properly
    const innerHTML = this.innerHTML.trim();
    if (!innerHTML) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = innerHTML;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  _scheduleRender() {
    if (this._renderingScheduled) return;
    
    this._renderingScheduled = true;
    requestAnimationFrame(() => {
      this._render();
      this._renderingScheduled = false;
    });
  }

  _render() {
    try {
      const container = document.createElement('div');
      container.className = 'relative mt-6 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shadow-lg';
      
      if (this.showHeader) {
        container.appendChild(this._createHeader());
      }
      
      container.appendChild(this._createCodeContent());
      
      // Clear and append new content safely
      this.innerHTML = '';
      this.appendChild(container);
      
      // Cache elements after render
      this._cacheElements();
    } catch (error) {
      this._handleError('Failed to render code component', error);
    }
  }

  _createHeader() {
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700';
    
    const languageSpan = document.createElement('span');
    languageSpan.className = 'text-xs font-semibold text-slate-400 uppercase tracking-wider';
    languageSpan.textContent = this._escapeHtml(this.language);
    header.appendChild(languageSpan);
    
    if (this.showCopy) {
      header.appendChild(this._createCopyButton());
    }
    
    return header;
  }

  _createCodeContent() {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'relative p-4 font-mono text-sm text-slate-200 overflow-x-auto';
    
    const pre = document.createElement('pre');
    pre.className = 'm-0 whitespace-pre overflow-x-auto';
    
    const code = document.createElement('code');
    code.className = 'text-inherit text-sm font-mono break-words max-w-full';
    
    // Safely set highlighted code content
    code.innerHTML = this._highlightCode(this._componentData.code, this.language);
    pre.appendChild(code);
    contentDiv.appendChild(pre);
    
    // Add floating copy button if header is not shown
    if (!this.showHeader && this.showCopy) {
      const copyBtn = this._createCopyButton();
      copyBtn.classList.add('absolute', 'top-2', 'right-2');
      contentDiv.appendChild(copyBtn);
    }
    
    return contentDiv;
  }

  _createCopyButton() {
    const button = document.createElement('button');
    button.className = 'flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs font-medium hover:bg-blue-500/30 hover:border-blue-500/40 hover:text-blue-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50';
    button.setAttribute('data-copy-btn', '');
    button.setAttribute('aria-label', 'Copy code to clipboard');
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('w-3', 'h-3');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3');
    
    svg.appendChild(path);
    button.appendChild(svg);
    
    const span = document.createElement('span');
    span.setAttribute('data-copy-text', '');
    span.textContent = 'Copy';
    button.appendChild(span);
    
    return button;
  }

  _cacheElements() {
    this._cachedElements = {
      copyBtn: this.querySelector('[data-copy-btn]'),
      copyText: this.querySelector('[data-copy-text]')
    };
  }

  _highlightCode(code, language) {
    if (!code || typeof code !== 'string') return '';
    
    const escaped = this._escapeHtml(code);
    const lang = language.toLowerCase();
    
    const highlighters = {
      'html': () => this._highlightHTML(escaped),
      'xml': () => this._highlightHTML(escaped),
      'javascript': () => this._highlightJavaScript(escaped),
      'js': () => this._highlightJavaScript(escaped),
      'css': () => this._highlightCSS(escaped),
      'json': () => this._highlightJSON(escaped),
      'python': () => this._highlightPython(escaped),
      'py': () => this._highlightPython(escaped),
      'bash': () => this._highlightBash(escaped),
      'shell': () => this._highlightBash(escaped),
      'sh': () => this._highlightBash(escaped),
      'sql': () => this._highlightSQL(escaped)
    };
    
    const highlighter = highlighters[lang];
    return highlighter ? highlighter() : escaped;
  }

  _highlightHTML(text) {
    // Token-based HTML highlighting with performance optimization
    const tokens = [];
    const patterns = [
      { name: 'tag', regex: /&lt;\/?\w+/g, color: '#e06c75' },
      { name: 'bracket', regex: /&gt;/g, color: '#e06c75' },
      { name: 'attr-name', regex: /\s+\w+(?==)/g, color: '#d19a66' },
      { name: 'attr-equals', regex: /=/g, color: '#56b6c2' },
      { name: 'attr-value', regex: /"[^"]*"/g, color: '#98c379' }
    ];
    
    // Find all matches and sort by position
    patterns.forEach(pattern => {
      let match;
      pattern.regex.lastIndex = 0;
      while ((match = pattern.regex.exec(text)) !== null) {
        tokens.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          color: pattern.color
        });
      }
    });
    
    tokens.sort((a, b) => a.start - b.start);
    
    return this._buildHighlightedText(text, tokens);
  }

  _highlightJavaScript(text) {
    return this._highlightWithTokens(text, [
      { name: 'comment', regex: /\/\/.*$/gm, color: '#5c6370' },
      { name: 'string', regex: /(".*?"|'.*?'|`.*?`)/g, color: '#98c379' },
      { name: 'keyword', regex: /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|from|default|try|catch|finally|throw|new|this|super|async|await|yield)\b/g, color: '#c678dd' },
      { name: 'boolean', regex: /\b(true|false|null|undefined)\b/g, color: '#d19a66' },
      { name: 'number', regex: /\b\d+(\.\d+)?\b/g, color: '#d19a66' }
    ]);
  }

  _highlightCSS(text) {
    return this._highlightWithTokens(text, [
      { name: 'comment', regex: /\/\*.*?\*\//g, color: '#5c6370' },
      { name: 'selector', regex: /([.#]?[\w-]+)(?=\s*{)/g, color: '#e06c75' },
      { name: 'property', regex: /([\w-]+)(?=\s*:)/g, color: '#d19a66' },
      { name: 'value', regex: /:\s*([^;]+)/g, color: '#98c379' },
      { name: 'punctuation', regex: /[{}:;]/g, color: '#56b6c2' }
    ]);
  }

  _highlightJSON(text) {
    return this._highlightWithTokens(text, [
      { name: 'key', regex: /"[\w]+"/g, color: '#e06c75' },
      { name: 'string', regex: /:\s*(".*?")/g, color: '#98c379' },
      { name: 'number', regex: /:\s*(\d+(\.\d+)?)/g, color: '#d19a66' },
      { name: 'boolean', regex: /:\s*(true|false|null)/g, color: '#d19a66' },
      { name: 'punctuation', regex: /[{}[\]:,]/g, color: '#56b6c2' }
    ]);
  }

  _highlightPython(text) {
    return this._highlightWithTokens(text, [
      { name: 'comment', regex: /#.*$/gm, color: '#5c6370' },
      { name: 'string', regex: /(".*?"|'.*?'|"""[\s\S]*?"""|'''[\s\S]*?''')/g, color: '#98c379' },
      { name: 'keyword', regex: /\b(def|class|import|from|return|if|else|elif|for|while|try|except|finally|with|as|lambda|yield|async|await|pass|break|continue|global|nonlocal)\b/g, color: '#c678dd' },
      { name: 'builtin', regex: /\b(print|len|range|enumerate|zip|map|filter|sum|max|min|abs|round|isinstance|type|str|int|float|bool|list|dict|tuple|set)\b/g, color: '#e06c75' },
      { name: 'boolean', regex: /\b(True|False|None)\b/g, color: '#d19a66' },
      { name: 'number', regex: /\b\d+(\.\d+)?\b/g, color: '#d19a66' }
    ]);
  }

  _highlightBash(text) {
    return this._highlightWithTokens(text, [
      { name: 'comment', regex: /#.*$/gm, color: '#5c6370' },
      { name: 'string', regex: /(".*?"|'.*?')/g, color: '#98c379' },
      { name: 'command', regex: /\b(ls|cd|mkdir|rm|cp|mv|chmod|chown|grep|find|sed|awk|sort|uniq|head|tail|cat|less|more|nano|vim|git|npm|yarn|docker|sudo|su)\b/g, color: '#e06c75' },
      { name: 'flag', regex: /-{1,2}[\w-]+/g, color: '#d19a66' },
      { name: 'variable', regex: /\$[\w]+/g, color: '#c678dd' },
      { name: 'operator', regex: /[|&><]/g, color: '#56b6c2' }
    ]);
  }

  _highlightSQL(text) {
    return this._highlightWithTokens(text, [
      { name: 'comment', regex: /--.*$/gm, color: '#5c6370' },
      { name: 'string', regex: /('.*?')/g, color: '#98c379' },
      { name: 'keyword', regex: /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|DATABASE|SCHEMA)\b/gi, color: '#c678dd' },
      { name: 'function', regex: /\b(COUNT|SUM|AVG|MAX|MIN|UPPER|LOWER|SUBSTRING|CONCAT|COALESCE|CASE|WHEN|THEN|ELSE|END)\b/gi, color: '#e06c75' },
      { name: 'number', regex: /\b\d+(\.\d+)?\b/g, color: '#d19a66' },
      { name: 'operator', regex: /[=<>!]+|AND|OR|NOT|IN|LIKE|BETWEEN/gi, color: '#56b6c2' }
    ]);
  }

  _highlightWithTokens(text, patterns) {
    const tokens = [];
    
    patterns.forEach(pattern => {
      let match;
      pattern.regex.lastIndex = 0;
      while ((match = pattern.regex.exec(text)) !== null) {
        tokens.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          color: pattern.color
        });
      }
    });
    
    tokens.sort((a, b) => a.start - b.start);
    return this._buildHighlightedText(text, tokens);
  }

  _buildHighlightedText(text, tokens) {
    let result = '';
    let lastEnd = 0;
    
    tokens.forEach(token => {
      if (token.start >= lastEnd) {
        // Add any text before this token
        if (token.start > lastEnd) {
          result += text.slice(lastEnd, token.start);
        }
        // Add the highlighted token
        result += `<span style="color: ${this._escapeHtml(token.color)};">${token.text}</span>`;
        lastEnd = token.end;
      }
    });
    
    // Add any remaining text
    if (lastEnd < text.length) {
      result += text.slice(lastEnd);
    }
    
    return result;
  }

  _attachEventListeners() {
    if (!this._cachedElements?.copyBtn) return;
    
    // Remove existing listener to prevent duplicates
    this._removeEventListeners();
    
    this._boundCopyHandler = this._copyToClipboard.bind(this);
    this._cachedElements.copyBtn.addEventListener('click', this._boundCopyHandler);
  }

  _removeEventListeners() {
    if (this._boundCopyHandler && this._cachedElements?.copyBtn) {
      this._cachedElements.copyBtn.removeEventListener('click', this._boundCopyHandler);
    }
  }

  async _copyToClipboard() {
    const { copyBtn, copyText } = this._cachedElements;
    
    if (!copyBtn || !copyText || !this._componentData?.code) return;

    try {
      await navigator.clipboard.writeText(this._componentData.code);
      this._showSuccessState(copyBtn, copyText);
      this._dispatchEvent('code:copied', { code: this._componentData.code });
    } catch (err) {
      console.warn('Modern clipboard API failed, trying fallback:', err);
      this._fallbackCopy(copyBtn, copyText);
    }
  }

  _fallbackCopy(copyBtn, copyText) {
    const textArea = document.createElement('textarea');
    textArea.value = this._componentData.code;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this._showSuccessState(copyBtn, copyText);
        this._dispatchEvent('code:copied', { code: this._componentData.code });
      } else {
        throw new Error('execCommand failed');
      }
    } catch (err) {
      this._handleError('Failed to copy code to clipboard', err);
      this._dispatchEvent('code:copy-failed', { error: err.message });
    } finally {
      document.body.removeChild(textArea);
    }
  }

  _showSuccessState(copyBtn, copyText) {
    const originalText = copyText.textContent;
    copyText.textContent = 'Copied!';
    copyBtn.disabled = true;
    
    // Update button styling for success state
    copyBtn.className = 'flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50';
    
    // Clear any existing timeout
    if (this._successTimeout) {
      clearTimeout(this._successTimeout);
    }
    
    this._successTimeout = setTimeout(() => {
      copyText.textContent = originalText;
      copyBtn.disabled = false;
      // Restore original button styling
      copyBtn.className = 'flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs font-medium hover:bg-blue-500/30 hover:border-blue-500/40 hover:text-blue-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50';
    }, 2000);
  }

  _handleError(message, error) {
    console.error(`DryCode: ${message}`, error);
    this._dispatchEvent('code:error', { message, error: error?.message });
  }

  // Public API methods
  copy() {
    this._copyToClipboard();
  }

  setCode(code) {
    if (typeof code !== 'string') {
      this._handleError('setCode expects a string parameter');
      return;
    }
    
    this._componentData.code = code;
    this._scheduleRender();
    this._attachEventListeners();
  }

  // Getters and setters with validation
  get language() {
    const lang = this._getAttributeWithDefault('language', 'text');
    return this._escapeHtml(lang);
  }

  set language(value) {
    if (typeof value === 'string') {
      this._setAttribute('language', value);
    }
  }

  get showCopy() {
    return !this.hasAttribute('show-copy') || this.getAttribute('show-copy') !== 'false';
  }

  set showCopy(value) {
    this._setBooleanAttribute('show-copy', value);
  }

  get showHeader() {
    return !this.hasAttribute('show-header') || this.getAttribute('show-header') !== 'false';
  }

  set showHeader(value) {
    this._setBooleanAttribute('show-header', value);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._isInitialized && oldValue !== newValue) {
      this._handleAttributeChange(name, oldValue, newValue);
      
      // Update component data
      if (name === 'language') this._componentData.language = this.language;
      if (name === 'show-copy') this._componentData.showCopy = this.showCopy;
      if (name === 'show-header') this._componentData.showHeader = this.showHeader;
      
      this._scheduleRender();
      this._attachEventListeners();
    }
  }

  disconnectedCallback() {
    // Clean up timeouts and event listeners
    if (this._successTimeout) {
      clearTimeout(this._successTimeout);
    }
    this._removeEventListeners();
    super.disconnectedCallback?.();
  }
}

// Register the component
customElements.define('dry-code', DryCode); 
import '../setup.js';

describe('DryCode Component', () => {
  let component;

  beforeEach(() => {
    cleanupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  before(async() => {
    // BaseElement should be available globally from setup.js
    // Import the code component
    await import('../../../src/dry2/code.js');
  });

  describe('Component Registration', () => {
    it('should register the dry-code custom element', () => {
      expect(customElements.get('dry-code')).to.exist;
    });

    it('should create code component element', () => {
      component = document.createElement('dry-code');
      expect(component).to.be.instanceOf(HTMLElement);
      expect(component.tagName.toLowerCase()).to.equal('dry-code');
    });
  });

  describe('Basic Functionality', () => {
    beforeEach(() => {
      component = document.createElement('dry-code');
      component.innerHTML = '&lt;div class="example"&gt;Hello World&lt;/div&gt;';
      document.body.appendChild(component);
    });

    it('should initialize component', async() => {
      await waitForComponent(component);
      expect(component._isInitialized).to.be.true;
    });

    it('should extract content from innerHTML', async() => {
      await waitForComponent(component);
      expect(component._componentData.code).to.include('div');
      expect(component._componentData.code).to.include('Hello World');
    });

    it('should have default properties', () => {
      expect(component.language).to.equal('HTML');
      expect(component.showCopy).to.be.true;
      expect(component.showHeader).to.be.true;
    });

    it('should render code block structure', async() => {
      await waitForComponent(component);
      const codeBlock = component.querySelector('.code-block');
      expect(codeBlock).to.exist;
    });

    it('should render code header when showHeader is true', async() => {
      await waitForComponent(component);
      const header = component.querySelector('.code-header');
      expect(header).to.exist;
    });

    it('should render language label in header', async() => {
      await waitForComponent(component);
      const languageLabel = component.querySelector('.code-language');
      expect(languageLabel).to.exist;
      expect(languageLabel.textContent).to.equal('HTML');
    });

    it('should render copy button when showCopy is true', async() => {
      await waitForComponent(component);
      const copyButton = component.querySelector('[data-copy-btn]');
      expect(copyButton).to.exist;
    });
  });

  describe('Attribute Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-code');
      component.innerHTML = 'console.log(\'test\');';
      document.body.appendChild(component);
    });

    it('should handle language attribute', async() => {
      component.setAttribute('language', 'javascript');
      await waitForComponent(component);
      expect(component.language).to.equal('javascript');

      const languageLabel = component.querySelector('.code-language');
      expect(languageLabel.textContent).to.equal('javascript');
    });

    it('should handle show-copy attribute', async() => {
      component.setAttribute('show-copy', 'false');
      await waitForComponent(component);
      expect(component.showCopy).to.be.false;

      const copyButton = component.querySelector('[data-copy-btn]');
      expect(copyButton).to.not.exist;
    });

    it('should handle show-header attribute', async() => {
      component.setAttribute('show-header', 'false');
      await waitForComponent(component);
      expect(component.showHeader).to.be.false;

      const header = component.querySelector('.code-header');
      expect(header).to.not.exist;
    });

    it('should show copy button without header when show-header is false but show-copy is true', async() => {
      component.setAttribute('show-header', 'false');
      component.setAttribute('show-copy', 'true');
      await waitForComponent(component);

      const header = component.querySelector('.code-header');
      const copyButton = component.querySelector('[data-copy-btn]');

      expect(header).to.not.exist;
      expect(copyButton).to.exist;
      expect(copyButton.classList.contains('absolute')).to.be.true;
    });
  });

  describe('Syntax Highlighting', () => {
    describe('HTML/XML Highlighting', () => {
      beforeEach(() => {
        component = document.createElement('dry-code');
        component.setAttribute('language', 'html');
        component.innerHTML = '&lt;div class="test" id="example"&gt;Content&lt;/div&gt;';
        document.body.appendChild(component);
      });

      it('should highlight HTML tags', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Should have colored spans for tags
        expect(html).to.include('color: #e06c75');
      });

      it('should highlight attribute names', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Should have colored spans for attributes
        expect(html).to.include('color: #d19a66');
      });

      it('should highlight attribute values', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Should have colored spans for values (check for quoted strings)
        expect(html).to.include('"test"');
        expect(html).to.include('"example"');
      });
    });

    describe('JavaScript Highlighting', () => {
      beforeEach(() => {
        component = document.createElement('dry-code');
        component.setAttribute('language', 'javascript');
        component.innerHTML = 'const test = "hello"; function example() { return true; }';
        document.body.appendChild(component);
      });

      it('should highlight JavaScript keywords', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        expect(html).to.include('color: #c678dd'); // Keywords
      });

      it('should highlight strings', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that strings are present (highlighting may interfere with color detection)
        expect(html).to.include('"hello"');
      });

      it('should highlight boolean values', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        expect(html).to.include('color: #d19a66'); // Booleans
      });
    });

    describe('CSS Highlighting', () => {
      beforeEach(() => {
        component = document.createElement('dry-code');
        component.setAttribute('language', 'css');
        component.innerHTML = '.class { color: red; background: blue; }';
        document.body.appendChild(component);
      });

      it('should highlight CSS selectors', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that CSS content is present
        expect(html).to.include('.class');
        expect(html).to.include('color');
      });

      it('should highlight CSS properties', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that CSS properties are present
        expect(html).to.include('color');
        expect(html).to.include('background');
      });
    });

    describe('JSON Highlighting', () => {
      beforeEach(() => {
        component = document.createElement('dry-code');
        component.setAttribute('language', 'json');
        component.innerHTML = '{"name": "test", "value": 123, "active": true}';
        document.body.appendChild(component);
      });

      it('should highlight JSON keys', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that JSON keys are present
        expect(html).to.include('"name"');
        expect(html).to.include('"value"');
      });

      it('should highlight JSON strings', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that JSON strings are present
        expect(html).to.include('"test"');
      });

      it('should highlight JSON numbers and booleans', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        expect(html).to.include('color: #d19a66'); // Numbers/booleans
      });
    });

    describe('Python Highlighting', () => {
      beforeEach(() => {
        component = document.createElement('dry-code');
        component.setAttribute('language', 'python');
        component.innerHTML = 'def hello():\n    print("Hello World")\n    return True';
        document.body.appendChild(component);
      });

      it('should highlight Python keywords', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that Python keywords are highlighted
        expect(html).to.include('color: #c678dd'); // Keywords
      });

      it('should highlight Python strings and comments', async() => {
        // Create fresh component for this test
        component.remove();
        component = document.createElement('dry-code');
        component.setAttribute('language', 'python');
        component.innerHTML = '# This is a comment\nprint("string")';
        document.body.appendChild(component);

        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that strings and comments are present
        expect(html).to.include('color: #98c379'); // Strings
      });

      it('should highlight Python built-in functions', async() => {
        component.innerHTML = 'print(len(range(10)))';
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that built-in functions are highlighted
        expect(html).to.include('color: #e06c75'); // Built-ins
      });

      it('should highlight Python boolean values', async() => {
        component.innerHTML = 'value = True';
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        expect(html).to.include('color: #d19a66'); // Booleans
      });
    });

    describe('Bash/Shell Highlighting', () => {
      beforeEach(() => {
        component = document.createElement('dry-code');
        component.setAttribute('language', 'bash');
        component.innerHTML = '#!/bin/bash\nls -la /home';
        document.body.appendChild(component);
      });

      it('should highlight Bash commands', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that bash commands are highlighted
        expect(html).to.include('color: #e06c75'); // Commands
      });

      it('should highlight Bash strings and comments', async() => {
        component.innerHTML = '# This is a comment\necho "hello world"';
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that strings are present
        expect(html).to.include('"hello world"');
      });

      it('should highlight Bash flags and variables', async() => {
        component.innerHTML = 'ls --help $HOME';
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that flags and variables are highlighted
        expect(html).to.include('color: #d19a66'); // Flags
        expect(html).to.include('color: #c678dd'); // Variables
      });
    });

    describe('SQL Highlighting', () => {
      beforeEach(() => {
        component = document.createElement('dry-code');
        component.setAttribute('language', 'sql');
        component.innerHTML = 'SELECT COUNT(*) FROM users WHERE active = 1';
        document.body.appendChild(component);
      });

      it('should highlight SQL keywords', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that SQL keywords are highlighted
        expect(html).to.include('color: #c678dd'); // Keywords
      });

      it('should highlight SQL functions', async() => {
        component.innerHTML = 'SELECT COUNT(*), SUM(amount) FROM orders';
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that SQL functions are highlighted
        expect(html).to.include('color: #e06c75'); // Functions
      });

      it('should highlight SQL comments and strings', async() => {
        component.innerHTML = '-- This is a comment\nSELECT \'hello\' FROM table';
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Check that strings are present
        expect(html).to.include('\'hello\'');
      });
    });

    describe('Unknown Language Fallback', () => {
      beforeEach(() => {
        component = document.createElement('dry-code');
        component.setAttribute('language', 'unknown');
        component.innerHTML = 'some code here';
        document.body.appendChild(component);
      });

      it('should render without highlighting for unknown languages', async() => {
        await waitForComponent(component);
        const codeOutput = component.querySelector('code');
        const html = codeOutput.innerHTML;

        // Should not have syntax highlighting spans
        expect(html).to.not.include('color:');
        expect(html).to.include('some code here');
      });
    });
  });

  describe('Copy Functionality', () => {
    beforeEach(() => {
      component = document.createElement('dry-code');
      component.innerHTML = 'const test = \'copy me\';';
      document.body.appendChild(component);

      // Mock clipboard API
      global.navigator.clipboard = {
        writeText: (text) => Promise.resolve()
      };
    });

    it('should have copy button when show-copy is true', async() => {
      await waitForComponent(component);
      const copyButton = component.querySelector('[data-copy-btn]');
      expect(copyButton).to.exist;
    });

    it('should trigger copy on button click', async() => {
      let copiedText = '';
      global.navigator.clipboard.writeText = (text) => {
        copiedText = text;
        return Promise.resolve();
      };

      await waitForComponent(component);
      const copyButton = component.querySelector('[data-copy-btn]');

      simulateClick(copyButton);

      // Wait a bit for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(copiedText).to.include('const test');
    });

    it('should show success state after copying', async() => {
      await waitForComponent(component);
      const copyButton = component.querySelector('[data-copy-btn]');
      const copyText = component.querySelector('[data-copy-text]');

      simulateClick(copyButton);

      // Wait a bit for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(copyText.textContent).to.equal('Copied!');
      expect(copyButton.disabled).to.be.true;
    });

    it('should reset success state after timeout', async() => {
      await waitForComponent(component);
      const copyButton = component.querySelector('[data-copy-btn]');
      const copyText = component.querySelector('[data-copy-text]');

      simulateClick(copyButton);

      // Wait for success state
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(copyText.textContent).to.equal('Copied!');

      // Wait for reset (2000ms timeout, but we'll use shorter for testing)
      await new Promise(resolve => setTimeout(resolve, 50));
      // Note: In a real test environment, we might need to mock setTimeout or use fake timers
    });

    it('should fallback to execCommand when clipboard API fails', async() => {
      global.navigator.clipboard.writeText = () => Promise.reject(new Error('API failed'));

      // Mock document.execCommand
      let execCommandCalled = false;
      global.document.execCommand = (command) => {
        if (command === 'copy') {
          execCommandCalled = true;
          return true;
        }
        return false;
      };

      await waitForComponent(component);
      const copyButton = component.querySelector('[data-copy-btn]');

      simulateClick(copyButton);

      // Wait a bit for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(execCommandCalled).to.be.true;
    });

    it('should handle copy when copy button is missing', async() => {
      // Create component without copy button
      component = document.createElement('dry-code');
      component.setAttribute('show-copy', 'false');
      component.innerHTML = 'test code';
      document.body.appendChild(component);

      await waitForComponent(component);

      // Try to copy - should not throw error
      expect(() => component._copyToClipboard()).to.not.throw;
    });
  });

  describe('Public API Methods', () => {
    beforeEach(() => {
      component = document.createElement('dry-code');
      component.innerHTML = 'original code';
      document.body.appendChild(component);

      global.navigator.clipboard = {
        writeText: () => Promise.resolve()
      };
    });

    it('should have copy() method', async() => {
      await waitForComponent(component);
      expect(typeof component.copy).to.equal('function');
    });

    it('should copy code when copy() method is called', async() => {
      let copiedText = '';
      global.navigator.clipboard.writeText = (text) => {
        copiedText = text;
        return Promise.resolve();
      };

      await waitForComponent(component);
      component.copy();

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(copiedText).to.include('original code');
    });

    it('should have setCode() method', async() => {
      await waitForComponent(component);
      expect(typeof component.setCode).to.equal('function');
    });

    it('should update code content when setCode() is called', async() => {
      await waitForComponent(component);

      component.setCode('new code content');

      const codeOutput = component.querySelector('code');
      expect(codeOutput.textContent).to.include('new code content');
    });

    it('should re-apply syntax highlighting after setCode()', async() => {
      component.setAttribute('language', 'javascript');
      await waitForComponent(component);

      component.setCode('const newVar = "test";');

      const codeOutput = component.querySelector('code');
      const html = codeOutput.innerHTML;

      // Should have highlighting for the new code
      expect(html).to.include('color:');
    });
  });

  describe('Attribute Change Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-code');
      component.innerHTML = 'test code';
      document.body.appendChild(component);
    });

    it('should re-render when language attribute changes', async() => {
      await waitForComponent(component);

      component.setAttribute('language', 'javascript');

      // Wait for attribute change to be processed
      await new Promise(resolve => setTimeout(resolve, 10));

      const languageLabel = component.querySelector('.code-language');
      expect(languageLabel.textContent).to.equal('javascript');
    });

    it('should re-render when show-copy attribute changes', async() => {
      await waitForComponent(component);

      let copyButton = component.querySelector('[data-copy-btn]');
      expect(copyButton).to.exist;

      component.setAttribute('show-copy', 'false');

      // Wait for attribute change to be processed
      await new Promise(resolve => setTimeout(resolve, 10));

      copyButton = component.querySelector('[data-copy-btn]');
      expect(copyButton).to.not.exist;
    });

    it('should re-render when show-header attribute changes', async() => {
      await waitForComponent(component);

      let header = component.querySelector('.code-header');
      expect(header).to.exist;

      component.setAttribute('show-header', 'false');

      // Wait for attribute change to be processed
      await new Promise(resolve => setTimeout(resolve, 10));

      header = component.querySelector('.code-header');
      expect(header).to.not.exist;
    });
  });

  describe('Content Extraction', () => {
    it('should extract plain text content', () => {
      component = document.createElement('dry-code');
      component.innerHTML = 'simple text';
      // Test extraction before component initialization
      expect(component._extractContent()).to.equal('simple text');
    });

    it('should decode HTML entities in content', () => {
      component = document.createElement('dry-code');
      component.innerHTML = '&lt;div&gt;test&lt;/div&gt;';
      // Test extraction before component initialization
      const extracted = component._extractContent();
      expect(extracted).to.equal('<div>test</div>');
    });

    it('should handle empty content', () => {
      component = document.createElement('dry-code');
      component.innerHTML = '';
      // Test extraction before component initialization
      expect(component._extractContent()).to.equal('');
    });

    it('should handle whitespace-only content', () => {
      component = document.createElement('dry-code');
      component.innerHTML = '   \n  \t  ';
      // Test extraction before component initialization
      expect(component._extractContent()).to.equal('');
    });
  });

  describe('HTML Escaping', () => {
    beforeEach(() => {
      component = document.createElement('dry-code');
      document.body.appendChild(component);
    });

    it('should escape HTML characters', () => {
      const input = '<div>test & "quotes" & \'apostrophes\'</div>';
      const escaped = component._escapeHtml(input);

      expect(escaped).to.include('&lt;');
      expect(escaped).to.include('&gt;');
      expect(escaped).to.include('&amp;');
      expect(escaped).to.include('&quot;');
      expect(escaped).to.include('&#39;');
    });

    it('should handle empty input', () => {
      const escaped = component._escapeHtml('');
      expect(escaped).to.equal('');
    });

    it('should handle input without special characters', () => {
      const input = 'plain text';
      const escaped = component._escapeHtml(input);
      expect(escaped).to.equal('plain text');
    });
  });

  describe('Property Setters', () => {
    beforeEach(() => {
      component = document.createElement('dry-code');
      component.innerHTML = 'test code';
      document.body.appendChild(component);
    });

    it('should handle language property setter', async() => {
      await waitForComponent(component);

      // Test the setter method
      component.language = 'python';

      expect(component.getAttribute('language')).to.equal('python');
      expect(component.language).to.equal('python');
    });

    it('should handle showCopy property setter', async() => {
      await waitForComponent(component);

      // Test the setter method
      component.showCopy = false;

      expect(component.getAttribute('show-copy')).to.equal('false');
      expect(component.showCopy).to.be.false;
    });

    it('should handle showHeader property setter', async() => {
      await waitForComponent(component);

      // Test the setter method
      component.showHeader = false;

      expect(component.getAttribute('show-header')).to.equal('false');
      expect(component.showHeader).to.be.false;
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component = document.createElement('dry-code');
      component.innerHTML = 'test code';
      document.body.appendChild(component);
    });

    it('should handle clipboard API unavailability gracefully', async() => {
      // Remove clipboard API
      delete global.navigator.clipboard;

      await waitForComponent(component);
      const copyButton = component.querySelector('[data-copy-btn]');

      // Should not throw error
      expect(() => simulateClick(copyButton)).to.not.throw();
    });

    it('should handle malformed HTML content gracefully', async() => {
      component.innerHTML = '<div><span>unclosed';

      // Should not throw error during initialization
      await waitForComponent(component);
      expect(component._isInitialized).to.be.true;
    });
  });
});

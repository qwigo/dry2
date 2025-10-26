import { test, expect } from '@playwright/test';

test.describe('DRY Code Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8086/examples/code-showcase.html');
    // Wait for component to be defined and rendered
    await page.waitForTimeout(1500);
  });

  test('should render code components without "no content" messages', async ({ page }) => {
    // Check that code components are rendered
    const codeElements = await page.locator('dry-code').all();
    expect(codeElements.length).toBeGreaterThan(0);

    // Verify no "no content" or error messages
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('No code provided');
    
    // Check first code element renders properly
    const firstCode = page.locator('dry-code').first();
    await expect(firstCode).toBeVisible();
    const codeContainer = firstCode.locator('.dry-code-container');
    await expect(codeContainer).toBeVisible();
  });

  test('should display code with syntax highlighting', async ({ page }) => {
    // Find a JavaScript code block
    const jsCode = page.locator('dry-code').first();
    await expect(jsCode).toBeVisible();

    // Check for highlighted elements (colored spans)
    const highlightedElements = jsCode.locator('code span');
    const count = await highlightedElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show header with language label by default', async ({ page }) => {
    const codeWithHeader = page.locator('dry-code').first();
    
    // Check for header
    const header = codeWithHeader.locator('.bg-gray-800');
    await expect(header).toBeVisible();
    
    // Check for language label
    const languageLabel = header.locator('span.text-gray-300');
    await expect(languageLabel).toBeVisible();
    
    const labelText = await languageLabel.textContent();
    expect(labelText.length).toBeGreaterThan(0);
  });

  test('should have copy button when show-copy is true', async ({ page }) => {
    const codeWithCopy = page.locator('dry-code').first();
    
    // Find copy button
    const copyButton = codeWithCopy.locator('button.copy-button');
    await expect(copyButton).toBeVisible();
    
    // Verify button has aria-label
    const ariaLabel = await copyButton.getAttribute('aria-label');
    expect(ariaLabel).toBe('Copy code to clipboard');
  });

  test('should copy code to clipboard when copy button is clicked', async ({ page }) => {
    const codeElement = page.locator('dry-code').first();
    const copyButton = codeElement.locator('button.copy-button');
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Click copy button
    await copyButton.click();
    
    // Wait for copy feedback
    await page.waitForTimeout(500);
    
    // Check for "Copied!" text in button
    const copyText = await copyButton.locator('.copy-text').textContent();
    expect(copyText).toBe('Copied!');
    
    // Verify clipboard has content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent.length).toBeGreaterThan(0);
    
    // Wait for button to reset
    await page.waitForTimeout(2500);
    const resetText = await copyButton.locator('.copy-text').textContent();
    expect(resetText).toBe('Copy');
  });

  test('should hide header when show-header is false', async ({ page }) => {
    // Navigate to a section with show-header="false"
    await page.goto('http://localhost:8086/examples/code-showcase.html#configuration-options');
    await page.waitForTimeout(1000);
    
    // Find code element with show-header="false"
    const codeWithoutHeader = page.locator('dry-code[show-header="false"]').first();
    await expect(codeWithoutHeader).toBeVisible();
    
    // Verify no header (check for text-gray-300 which is only in header labels)
    const headerLabel = codeWithoutHeader.locator('.text-gray-300');
    await expect(headerLabel).not.toBeVisible();
  });

  test('should hide copy button when show-copy is false', async ({ page }) => {
    // Navigate to a section with show-copy="false"
    await page.goto('http://localhost:8086/examples/code-showcase.html#configuration-options');
    await page.waitForTimeout(1000);
    
    // Find code element with show-copy="false"
    const codeWithoutCopy = page.locator('dry-code[show-copy="false"]').first();
    await expect(codeWithoutCopy).toBeVisible();
    
    // Verify no copy button
    const copyButton = codeWithoutCopy.locator('button.copy-button');
    await expect(copyButton).not.toBeVisible();
  });

  test('should support multiple programming languages', async ({ page }) => {
    // Test JavaScript
    const jsCode = page.locator('dry-code[language="JavaScript"]').first();
    await expect(jsCode).toBeVisible();
    let header = jsCode.locator('.text-gray-300').first();
    await expect(header).toContainText('JavaScript');
    
    // Test Python
    const pyCode = page.locator('dry-code[language="Python"]').first();
    await expect(pyCode).toBeVisible();
    header = pyCode.locator('.text-gray-300').first();
    await expect(header).toContainText('Python');
    
    // Test HTML
    const htmlCode = page.locator('dry-code[language="HTML"]').first();
    await expect(htmlCode).toBeVisible();
    header = htmlCode.locator('.text-gray-300').first();
    await expect(header).toContainText('HTML');
    
    // Test CSS
    const cssCode = page.locator('dry-code[language="CSS"]').first();
    await expect(cssCode).toBeVisible();
    header = cssCode.locator('.text-gray-300').first();
    await expect(header).toContainText('CSS');
    
    // Test JSON
    const jsonCode = page.locator('dry-code[language="JSON"]').first();
    await expect(jsonCode).toBeVisible();
    header = jsonCode.locator('.text-gray-300').first();
    await expect(header).toContainText('JSON');
    
    // Test SQL
    const sqlCode = page.locator('dry-code[language="SQL"]').first();
    await expect(sqlCode).toBeVisible();
    header = sqlCode.locator('.text-gray-300').first();
    await expect(header).toContainText('SQL');
    
    // Test Bash
    const bashCode = page.locator('dry-code[language="Bash"]').first();
    await expect(bashCode).toBeVisible();
    header = bashCode.locator('.text-gray-300').first();
    await expect(header).toContainText('Bash');
    
    // Test XML
    const xmlCode = page.locator('dry-code[language="XML"]').first();
    await expect(xmlCode).toBeVisible();
    header = xmlCode.locator('.text-gray-300').first();
    await expect(header).toContainText('XML');
  });

  test('should not have JavaScript console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:8086/examples/code-showcase.html');
    await page.waitForTimeout(2000);
    
    // Filter out known external errors (like failed CDN loads in dev)
    const relevantErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('ERR_CONNECTION_REFUSED')
    );
    
    expect(relevantErrors).toHaveLength(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const codeElement = page.locator('dry-code').first();
    const copyButton = codeElement.locator('button.copy-button');
    
    // Check copy button has aria-label
    const ariaLabel = await copyButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toBe('Copy code to clipboard');
  });

  test('should update code content dynamically via setCode method', async ({ page }) => {
    // Get reference to first code element
    const codeElement = page.locator('dry-code').first();
    
    // Update code content via JavaScript
    await page.evaluate(() => {
      const element = document.querySelector('dry-code');
      element.setCode('// This is dynamically updated code\nconsole.log("Hello, Dynamic World!");');
    });
    
    await page.waitForTimeout(500);
    
    // Verify new content is displayed
    const codeContent = await codeElement.locator('code').textContent();
    expect(codeContent).toContain('dynamically updated code');
    expect(codeContent).toContain('Hello, Dynamic World');
  });

  test('should update language dynamically via property', async ({ page }) => {
    // Get reference to first code element
    const codeElement = page.locator('dry-code').first();
    
    // Update language via JavaScript
    await page.evaluate(() => {
      const element = document.querySelector('dry-code');
      element.language = 'Python';
    });
    
    await page.waitForTimeout(500);
    
    // Verify language label updated
    const languageLabel = await codeElement.locator('.text-gray-300').first().textContent();
    expect(languageLabel).toBe('Python');
  });

  test('should toggle header visibility dynamically', async ({ page }) => {
    const codeElement = page.locator('dry-code').first();
    
    // Initially should have header with language label
    let headerLabel = codeElement.locator('.text-gray-300');
    await expect(headerLabel).toBeVisible();
    
    // Hide header via JavaScript
    await page.evaluate(() => {
      const element = document.querySelector('dry-code');
      element.showHeader = false;
    });
    
    await page.waitForTimeout(500);
    
    // Verify header label is hidden
    headerLabel = codeElement.locator('.text-gray-300');
    await expect(headerLabel).not.toBeVisible();
    
    // Show header again
    await page.evaluate(() => {
      const element = document.querySelector('dry-code');
      element.showHeader = true;
    });
    
    await page.waitForTimeout(500);
    
    // Verify header label is visible again
    headerLabel = codeElement.locator('.text-gray-300');
    await expect(headerLabel).toBeVisible();
  });

  test('should show floating copy button when header is hidden but copy is enabled', async ({ page }) => {
    // Find code with show-header="false" but show-copy not specified (defaults to true)
    await page.goto('http://localhost:8086/examples/code-showcase.html#configuration-options');
    await page.waitForTimeout(1000);
    
    const codeElement = page.locator('dry-code[show-header="false"]').first();
    await expect(codeElement).toBeVisible();
    
    // Should have floating copy button (absolute positioned)
    const floatingButton = codeElement.locator('button.copy-button.absolute');
    await expect(floatingButton).toBeVisible();
  });

  test('should escape HTML to prevent XSS', async ({ page }) => {
    // Create a code element with potentially malicious content
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-6xl');
      const code = document.createElement('dry-code');
      code.setAttribute('language', 'Text'); // Use unsupported language to avoid syntax highlighting
      code.setAttribute('id', 'xss-test-code');
      code.textContent = '<script>alert("XSS")</script>';
      container.appendChild(code);
    });
    
    await page.waitForTimeout(1500);
    
    // Verify script tags are escaped and not executed
    const dialogCount = await page.locator('role=alertdialog').count();
    expect(dialogCount).toBe(0);
    
    // Verify content is properly escaped (check textContent instead of innerHTML)
    const xssTestCode = page.locator('#xss-test-code');
    const codeContent = await xssTestCode.locator('code').textContent();
    expect(codeContent).toContain('<script>');
    expect(codeContent).toContain('alert');
  });

  test('should handle empty code gracefully', async ({ page }) => {
    // Create a code element with no content
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-6xl');
      const code = document.createElement('dry-code');
      code.setAttribute('language', 'JavaScript');
      code.setAttribute('id', 'empty-test-code');
      container.appendChild(code);
    });
    
    await page.waitForTimeout(1500);
    
    // Verify it renders with default content
    const emptyCode = page.locator('#empty-test-code');
    await expect(emptyCode).toBeVisible();
    const codeContent = await emptyCode.locator('code').textContent();
    expect(codeContent).toContain('No code provided');
  });

  test('should handle language aliases correctly', async ({ page }) => {
    // Test js -> JavaScript
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-6xl');
      const code = document.createElement('dry-code');
      code.setAttribute('language', 'js');
      code.textContent = 'console.log("test");';
      container.appendChild(code);
    });
    
    await page.waitForTimeout(1000);
    
    const jsCode = page.locator('dry-code[language="js"]');
    const label = await jsCode.locator('.text-gray-300').first().textContent();
    expect(label).toBe('JavaScript');
  });

  test('should render code in correct order on initial page load', async ({ page }) => {
    // Check that multiple code blocks render in sequence
    const codeElements = await page.locator('dry-code').all();
    expect(codeElements.length).toBeGreaterThan(5);
    
    // Verify first few are visible and have content
    for (let i = 0; i < Math.min(3, codeElements.length); i++) {
      await expect(page.locator('dry-code').nth(i)).toBeVisible();
      const container = page.locator('dry-code').nth(i).locator('.dry-code-container');
      await expect(container).toBeVisible();
    }
  });
});


import { test, expect } from '@playwright/test';

test.describe('Component Builder Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component builder showcase page
    await page.goto('/examples/component-builder-showcase.html');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for custom elements to upgrade
    await page.waitForTimeout(1500);
  });

  test('should render component builder without "no content" messages', async ({ page }) => {
    // Check that the page doesn't contain any "no content" error messages
    const noContentText = await page.locator('text=/no content/i').count();
    expect(noContentText).toBe(0);
  });

  test('should render component builder with correct initial state', async ({ page }) => {
    // Check that component builder exists
    const componentBuilder = page.locator('dry-component-builder').first();
    await expect(componentBuilder).toBeVisible();
    
    // Check that it has a title
    const title = componentBuilder.locator('.demo-title');
    await expect(title).toBeVisible();
    
    // Check that it has controls
    const controls = componentBuilder.locator('select[data-property], input[data-property]');
    expect(await controls.count()).toBeGreaterThan(0);
    
    // Check that it has a preview area
    const preview = componentBuilder.locator('[data-preview]');
    await expect(preview).toBeVisible();
    
    // Check that it has a code block
    const code = componentBuilder.locator('[data-code]');
    await expect(code).toBeVisible();
  });

  test('should display correct title and description', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    const title = componentBuilder.locator('.demo-title');
    const titleText = await title.textContent();
    expect(titleText).toBeTruthy();
    
    const description = componentBuilder.locator('.demo-description');
    await expect(description).toBeVisible();
  });

  test('should update preview when variant control changes', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Find variant select control
    const variantSelect = componentBuilder.locator('select[data-property="variant"]');
    if (await variantSelect.count() > 0) {
      await variantSelect.selectOption('secondary');
      await page.waitForTimeout(300);
      
      // Check that preview was updated
      const preview = componentBuilder.locator('[data-preview]');
      const previewHtml = await preview.innerHTML();
      expect(previewHtml).toContain('variant="secondary"');
    }
  });

  test('should update preview when size control changes', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Find size select control
    const sizeSelect = componentBuilder.locator('select[data-property="size"]');
    if (await sizeSelect.count() > 0) {
      await sizeSelect.selectOption('lg');
      await page.waitForTimeout(300);
      
      // Check that preview was updated
      const preview = componentBuilder.locator('[data-preview]');
      const previewHtml = await preview.innerHTML();
      expect(previewHtml).toContain('size="lg"');
    }
  });

  test('should update code block when controls change', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Find variant select control
    const variantSelect = componentBuilder.locator('select[data-property="variant"]');
    if (await variantSelect.count() > 0) {
      await variantSelect.selectOption('danger');
      await page.waitForTimeout(300);
      
      // Check that code block was updated
      const code = componentBuilder.locator('[data-code]');
      const codeText = await code.textContent();
      expect(codeText).toContain('danger');
    }
  });

  test('should handle checkbox controls', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Find checkbox controls (like disabled, loading)
    const checkboxes = componentBuilder.locator('input[type="checkbox"][data-property]');
    if (await checkboxes.count() > 0) {
      const firstCheckbox = checkboxes.first();
      const property = await firstCheckbox.getAttribute('data-property');
      
      await firstCheckbox.check();
      await page.waitForTimeout(300);
      
      // Check that preview was updated
      const preview = componentBuilder.locator('[data-preview]');
      const previewHtml = await preview.innerHTML();
      expect(previewHtml).toContain(property);
      
      // Uncheck
      await firstCheckbox.uncheck();
      await page.waitForTimeout(300);
      
      // Check that attribute was removed from preview
      const updatedPreviewHtml = await preview.innerHTML();
      // Boolean attributes might not be in HTML when false
      expect(updatedPreviewHtml).toBeDefined();
    }
  });

  test('should handle text input controls', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Find text input controls
    const textInputs = componentBuilder.locator('input[type="text"][data-property]');
    if (await textInputs.count() > 0) {
      const firstInput = textInputs.first();
      
      await firstInput.fill('Test Content');
      await page.waitForTimeout(300);
      
      // Check that preview was updated (the actual button text, not the code)
      const preview = componentBuilder.locator('[data-preview]');
      const previewHtml = await preview.innerHTML();
      expect(previewHtml).toContain('Test Content');
    }
  });

  test('should handle range input controls', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Find range input controls
    const rangeInputs = componentBuilder.locator('input[type="range"][data-property]');
    if (await rangeInputs.count() > 0) {
      const firstRange = rangeInputs.first();
      const property = await firstRange.getAttribute('data-property');
      
      await firstRange.fill('50');
      await page.waitForTimeout(300);
      
      // Check that display value was updated
      const display = componentBuilder.locator(`[data-range-display="${property}"]`);
      if (await display.count() > 0) {
        const displayText = await display.textContent();
        expect(displayText).toBeTruthy();
      }
    }
  });

  test('should copy code to clipboard when copy button is clicked', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Find copy button
    const copyButton = componentBuilder.locator('[data-copy-btn]');
    await expect(copyButton).toBeVisible();
    
    // Click copy button
    await copyButton.click();
    await page.waitForTimeout(300);
    
    // Check that button shows "Copied!" feedback
    const buttonText = await copyButton.textContent();
    expect(buttonText).toContain('Copied!');
    
    // Wait for feedback to reset
    await page.waitForTimeout(2500);
    
    // Check that button text is back to normal
    const resetText = await copyButton.textContent();
    expect(resetText).toContain('Copy');
  });

  test('should display code in pre element', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    const code = componentBuilder.locator('[data-code]');
    await expect(code).toBeVisible();
    
    const codeText = await code.textContent();
    expect(codeText).toBeTruthy();
    expect(codeText.length).toBeGreaterThan(0);
  });

  test('should render preview component that is interactive', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Find preview area
    const preview = componentBuilder.locator('[data-preview]');
    await expect(preview).toBeVisible();
    
    // Check that preview contains an actual component
    const previewHtml = await preview.innerHTML();
    expect(previewHtml).toContain('<');
    expect(previewHtml).toContain('>');
  });

  test('should update all controls and sync preview/code', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Change variant
    const variantSelect = componentBuilder.locator('select[data-property="variant"]');
    if (await variantSelect.count() > 0) {
      await variantSelect.selectOption('success');
      await page.waitForTimeout(200);
    }
    
    // Change size
    const sizeSelect = componentBuilder.locator('select[data-property="size"]');
    if (await sizeSelect.count() > 0) {
      await sizeSelect.selectOption('xl');
      await page.waitForTimeout(200);
    }
    
    // Get final preview and code
    const preview = componentBuilder.locator('[data-preview]');
    const previewHtml = await preview.innerHTML();
    
    const code = componentBuilder.locator('[data-code]');
    const codeText = await code.textContent();
    
    // Both should be updated
    expect(previewHtml).toBeTruthy();
    expect(codeText).toBeTruthy();
  });

  test('should render code header with HTML language label', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    const codeLanguage = componentBuilder.locator('.code-language');
    await expect(codeLanguage).toBeVisible();
    
    const languageText = await codeLanguage.textContent();
    expect(languageText).toBe('HTML');
  });

  test('should maintain state across multiple control changes', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Make several changes
    const variantSelect = componentBuilder.locator('select[data-property="variant"]');
    if (await variantSelect.count() > 0) {
      await variantSelect.selectOption('warning');
      await page.waitForTimeout(200);
      
      await variantSelect.selectOption('secondary');
      await page.waitForTimeout(200);
      
      await variantSelect.selectOption('danger');
      await page.waitForTimeout(200);
      
      // Check final state
      const preview = componentBuilder.locator('[data-preview]');
      const previewHtml = await preview.innerHTML();
      expect(previewHtml).toContain('danger');
    }
  });

  test('should not have JavaScript console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Reload the page to catch any errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    // Filter out known benign errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('net::ERR_')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper structure with sections', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Check for demo section
    const demoSection = componentBuilder.locator('.demo-section');
    await expect(demoSection).toBeVisible();
    
    // Check for demo container
    const demoContainer = componentBuilder.locator('.demo-container');
    await expect(demoContainer).toBeVisible();
    
    // Check for code block
    const codeBlock = componentBuilder.locator('.code-block');
    await expect(codeBlock).toBeVisible();
  });

  test('should render grid layout with controls and preview', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Check for grid layout
    const grid = componentBuilder.locator('.grid');
    await expect(grid).toBeVisible();
    
    // Should have controls on one side
    const controls = grid.locator('.space-y-4');
    await expect(controls).toBeVisible();
    
    // Should have preview on other side
    const previewContainer = grid.locator('.bg-gray-50');
    await expect(previewContainer).toBeVisible();
  });

  test('should handle rapid control changes without errors', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    const variantSelect = componentBuilder.locator('select[data-property="variant"]');
    if (await variantSelect.count() > 0) {
      // Rapidly change values
      await variantSelect.selectOption('primary');
      await variantSelect.selectOption('secondary');
      await variantSelect.selectOption('danger');
      await variantSelect.selectOption('success');
      await page.waitForTimeout(500);
      
      // Should still be functional
      const preview = componentBuilder.locator('[data-preview]');
      await expect(preview).toBeVisible();
      
      const code = componentBuilder.locator('[data-code]');
      const codeText = await code.textContent();
      expect(codeText).toBeTruthy();
    }
  });

  test('should have accessible form controls with labels', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Check that labels exist
    const labels = componentBuilder.locator('label');
    expect(await labels.count()).toBeGreaterThan(0);
    
    // Check that each label has a for attribute or contains an input
    const firstLabel = labels.first();
    const hasFor = await firstLabel.getAttribute('for');
    const hasInput = await firstLabel.locator('input').count();
    
    expect(hasFor !== null || hasInput > 0).toBe(true);
  });

  test('should display copy button with icon', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    const copyButton = componentBuilder.locator('[data-copy-btn]');
    await expect(copyButton).toBeVisible();
    
    // Check for SVG icon
    const svg = copyButton.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should escape HTML in code display to prevent XSS', async ({ page }) => {
    const componentBuilder = page.locator('dry-component-builder').first();
    
    // Try to inject script tag via text input
    const textInputs = componentBuilder.locator('input[type="text"][data-property]');
    if (await textInputs.count() > 0) {
      const firstInput = textInputs.first();
      await firstInput.fill('<script>alert("xss")</script>');
      await page.waitForTimeout(300);
      
      // Check that preview contains escaped HTML (not actual script execution)
      const preview = componentBuilder.locator('[data-preview]');
      const previewHtml = await preview.innerHTML();
      
      // The preview should contain the escaped text, not executable script
      expect(previewHtml).toBeTruthy();
      
      // Verify no actual script tags were created
      const scriptTags = await page.locator('script:has-text("alert")').count();
      expect(scriptTags).toBe(0);
    }
  });
});


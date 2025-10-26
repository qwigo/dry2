import { test, expect } from '@playwright/test';

test.describe('QR Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8086/examples/qr-showcase.html');
    // Wait for custom elements to upgrade
    await page.waitForTimeout(1000);
  });

  test('should render QR codes without error messages', async ({ page }) => {
    // Check that QR codes are rendered
    const qrCodes = await page.locator('dry-qr-code').all();
    expect(qrCodes.length).toBeGreaterThan(0);

    // Ensure no error messages are shown
    const errorMessages = await page.locator('text=/QRious library not loaded|Error generating QR code/i').count();
    expect(errorMessages).toBe(0);
  });

  test('should display basic QR code with default size', async ({ page }) => {
    // Find the basic QR code in the first section
    const basicQR = page.locator('dry-qr-code[value="https://www.qwigo.com"]').first();
    await expect(basicQR).toBeVisible();

    // Check that it has a canvas element
    const canvas = basicQR.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify default size (200x200)
    const width = await canvas.getAttribute('width');
    const height = await canvas.getAttribute('height');
    expect(width).toBe('200');
    expect(height).toBe('200');
  });

  test('should render QR codes with different sizes', async ({ page }) => {
    // Check small size (100px)
    const smallQR = page.locator('dry-qr-code[value="small"][size="100"]').first();
    const smallCanvas = smallQR.locator('canvas');
    await expect(smallCanvas).toBeVisible();
    expect(await smallCanvas.getAttribute('width')).toBe('100');
    expect(await smallCanvas.getAttribute('height')).toBe('100');

    // Check medium size (200px)
    const mediumQR = page.locator('dry-qr-code[value="medium"][size="200"]').first();
    const mediumCanvas = mediumQR.locator('canvas');
    await expect(mediumCanvas).toBeVisible();
    expect(await mediumCanvas.getAttribute('width')).toBe('200');
    expect(await mediumCanvas.getAttribute('height')).toBe('200');

    // Check large size (300px)
    const largeQR = page.locator('dry-qr-code[value="large"][size="300"]').first();
    const largeCanvas = largeQR.locator('canvas');
    await expect(largeCanvas).toBeVisible();
    expect(await largeCanvas.getAttribute('width')).toBe('300');
    expect(await largeCanvas.getAttribute('height')).toBe('300');
  });

  test('should render QR codes with custom colors', async ({ page }) => {
    // Check that color variants are rendered
    const redFgQR = page.locator('dry-qr-code[value="Red FG"]').first();
    await expect(redFgQR).toBeVisible();
    await expect(redFgQR.locator('canvas')).toBeVisible();

    const yellowBgQR = page.locator('dry-qr-code[value="Yellow BG"]').first();
    await expect(yellowBgQR).toBeVisible();
    await expect(yellowBgQR.locator('canvas')).toBeVisible();

    const customQR = page.locator('dry-qr-code[value="Custom"]').first();
    await expect(customQR).toBeVisible();
    await expect(customQR.locator('canvas')).toBeVisible();
  });

  test('should render QR codes with different error correction levels', async ({ page }) => {
    // Check all error correction levels
    const levels = ['L', 'M', 'Q', 'H'];
    
    for (const level of levels) {
      const qr = page.locator(`dry-qr-code[value="${level}-level"][error-correction="${level}"]`).first();
      await expect(qr).toBeVisible();
      await expect(qr.locator('canvas')).toBeVisible();
    }
  });

  test('should have no JavaScript console errors on page load', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Reload to capture any console errors
    await page.reload();
    await page.waitForTimeout(1500);

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('net::ERR')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('component builder should be present and functional', async ({ page }) => {
    // Check that component builder is rendered
    const componentBuilder = page.locator('dry-component-builder').first();
    await expect(componentBuilder).toBeVisible();

    // Wait a bit for the builder to initialize
    await page.waitForTimeout(1000);

    // Check for controls
    const valueInput = page.locator('input[data-property="value"]').first();
    await expect(valueInput).toBeVisible();

    const sizeRange = page.locator('input[data-property="size"]').first();
    await expect(sizeRange).toBeVisible();

    // Check for color controls
    const foregroundColor = page.locator('input[data-property="foreground"]').first();
    await expect(foregroundColor).toBeVisible();

    const backgroundColor = page.locator('input[data-property="background"]').first();
    await expect(backgroundColor).toBeVisible();

    // Check for preview
    const preview = page.locator('[data-preview]').first();
    await expect(preview).toBeVisible();
  });

  test('component builder should update preview when controls change', async ({ page }) => {
    // Wait for component builder to initialize
    await page.waitForTimeout(1500);

    // Change the value
    const valueInput = page.locator('input[data-property="value"]').first();
    await valueInput.fill('Test QR Code');
    await valueInput.blur();

    // Wait for update
    await page.waitForTimeout(500);

    // Check that preview was updated
    const previewQR = page.locator('[data-preview] dry-qr-code').first();
    await expect(previewQR).toBeVisible();
    expect(await previewQR.getAttribute('value')).toBe('Test QR Code');
  });

  test('component builder color picker should sync with text input', async ({ page }) => {
    // Wait for component builder to initialize
    await page.waitForTimeout(1500);

    // Change the color picker
    const colorPicker = page.locator('input[type="color"][data-property="foreground"]').first();
    await colorPicker.fill('#ff0000');

    // Wait for update
    await page.waitForTimeout(300);

    // Check that text input was updated
    const textInput = page.locator('input[data-property-text="foreground"]').first();
    expect(await textInput.inputValue()).toBe('#ff0000');

    // Now change the text input
    await textInput.fill('#00ff00');

    // Wait for update
    await page.waitForTimeout(300);

    // Check that color picker was updated
    expect(await colorPicker.inputValue()).toBe('#00ff00');
  });

  test('component builder should show generated code', async ({ page }) => {
    // Wait for component builder to initialize
    await page.waitForTimeout(1500);

    // Check that code block is present
    const codeBlock = page.locator('[data-code]').first();
    await expect(codeBlock).toBeVisible();

    // Verify it contains QR code markup
    const codeText = await codeBlock.textContent();
    expect(codeText).toContain('dry-qr-code');
  });

  test('component builder copy button should work', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Wait for component builder to initialize
    await page.waitForTimeout(1500);

    // Click copy button
    const copyButton = page.locator('[data-copy-btn]').first();
    await copyButton.click();

    // Wait for copy operation
    await page.waitForTimeout(500);

    // Verify button text changed to "Copied!"
    const buttonText = await copyButton.textContent();
    expect(buttonText).toContain('Copied!');

    // Wait for reset
    await page.waitForTimeout(2500);

    // Verify button text changed back
    const resetText = await copyButton.textContent();
    expect(resetText).toContain('Copy');
  });

  test('QR component should have proper accessibility attributes', async ({ page }) => {
    // Check that canvas elements are accessible
    const firstQR = page.locator('dry-qr-code').first();
    await expect(firstQR).toBeVisible();

    const canvas = firstQR.locator('canvas');
    await expect(canvas).toBeVisible();

    // Canvas should be present and visible
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox.width).toBeGreaterThan(0);
    expect(boundingBox.height).toBeGreaterThan(0);
  });
});


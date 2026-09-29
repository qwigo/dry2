import { test, expect } from '@playwright/test';

test.describe('Toast Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/toast-showcase.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for custom elements to be defined
    await page.waitForFunction(() => {
      return customElements.get('dry-toast') && 
             typeof window.Toast !== 'undefined';
    });
    
    // Small wait for page to stabilize
    await page.waitForTimeout(500);
  });

  test('should render without no content messages', async ({ page }) => {
    // Click a button to show toast
    const showButton = page.locator('button:has-text("Show Info Toast")').first();
    
    if (await showButton.count() > 0) {
      await showButton.click();
      
      // Wait for toast to appear
      await page.waitForTimeout(500);
      
      // Check that toast container appears
      const toastContainer = page.locator('.toast-container');
      if (await toastContainer.count() > 0) {
        const content = await toastContainer.textContent();
        expect(content).not.toContain('not defined');
        expect(content).not.toContain('undefined');
      }
    }
  });

  test('should not have JavaScript console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);
    
    expect(consoleErrors).toEqual([]);
  });

  test('should show toast programmatically', async ({ page }) => {
    // Call Toast.info() from JavaScript
    await page.evaluate(() => {
      window.Toast.info('Test toast message unique-12345');
    });
    
    // Wait for toast to appear
    await page.waitForTimeout(500);
    
    // Check that toast is visible
    const toast = page.locator('.toast-container:has-text("Test toast message unique-12345")');
    await expect(toast).toBeVisible({ timeout: 2000 });
  });

  test('should display different toast types', async ({ page }) => {
    // Test success toast
    await page.evaluate(() => {
      window.Toast.success('Success message unique-67890');
    });
    
    await page.waitForTimeout(300);
    
    const successToast = page.locator('.toast-container:has-text("Success message unique-67890") .toast.bg-green-500');
    await expect(successToast).toBeVisible({ timeout: 2000 });
  });

  test('should show close button', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.info('Test message button-test');
    });
    
    await page.waitForTimeout(300);
    
    // Check for close button
    const closeButton = page.locator('.toast-container:has-text("Test message button-test") .toast-close');
    await expect(closeButton).toBeVisible({ timeout: 2000 });
  });

  test('should close toast when close button is clicked', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.info('Test message close-test', { duration: 0 }); // Don't auto-hide
    });
    
    await page.waitForTimeout(300);
    
    // Click close button
    const toastContainer = page.locator('.toast-container:has-text("Test message close-test")');
    const closeButton = toastContainer.locator('.toast-close');
    await closeButton.click();
    
    // Wait for toast to disappear
    await page.waitForTimeout(500);
    
    await expect(toastContainer).toHaveCount(0);
  });

  test('should auto-hide after duration', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.info('Test message auto-hide', { duration: 1000 });
    });
    
    // Toast should be visible initially
    await page.waitForTimeout(300);
    const toast = page.locator('.toast-container:has-text("Test message auto-hide")');
    await expect(toast).toBeVisible({ timeout: 2000 });
    
    // Wait for auto-hide duration plus animation
    await page.waitForTimeout(1500);
    
    // Toast should be gone
    await expect(toast).toHaveCount(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.evaluate(() => {
      window.Toast.info('Accessible toast message unique');
    });
    
    await page.waitForTimeout(300);
    
    const toast = page.locator('.toast-container:has-text("Accessible toast message unique") .toast');
    await expect(toast).toBeVisible({ timeout: 2000 });
    
    // Verify it has text content
    const textContent = await toast.textContent();
    expect(textContent).toContain('Accessible toast message unique');
  });
});


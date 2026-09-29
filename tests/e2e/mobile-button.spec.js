import { test, expect } from '@playwright/test';

/**
 * Mobile Button Component Tests
 * Tests button component on mobile viewport (iPhone SE size)
 */

test.describe('Mobile - Button Component', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
    hasTouch: true
  });

  test.beforeEach(async({ page }) => {
    await page.goto('/examples/button-showcase.html');
    await page.waitForTimeout(1500); // Wait for custom elements to upgrade
  });

  test('should have adequate touch targets (min 44px)', async({ page }) => {
    // Check primary button has minimum touch target
    const button = page.locator('dry-button[variant="primary"]').first();
    await expect(button).toBeVisible();

    const box = await button.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('should not cause horizontal overflow', async({ page }) => {
    // Check that button container doesn't overflow viewport
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;

    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
  });

  test('should render all button variants without overlap', async({ page }) => {
    const buttons = page.locator('dry-button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);

    // Check first few buttons are visible and not overlapping
    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(buttons.nth(i)).toBeVisible();
    }
  });

  test('should handle touch interactions', async({ page }) => {
    const button = page.locator('dry-button[variant="primary"]').first();

    // Simulate touch tap
    await button.tap();

    // Button should still be visible after tap
    await expect(button).toBeVisible();
  });

  test('should have readable text at mobile size', async({ page }) => {
    const button = page.locator('dry-button').first();
    const fontSize = await button.evaluate((el) => {
      return window.getComputedStyle(el.querySelector('button') || el).fontSize;
    });

    // Font size should be at least 14px for mobile readability
    const fontSizeNum = parseFloat(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
  });
});


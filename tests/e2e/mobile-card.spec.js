import { test, expect } from '@playwright/test';

/**
 * Mobile Card Component Tests
 * Tests card component responsiveness on mobile viewport
 */

test.describe('Mobile - Card Component', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
    hasTouch: true
  });

  test.beforeEach(async({ page }) => {
    await page.goto('/examples/card-showcase.html');
    await page.waitForTimeout(1500);
  });

  test('horizontal cards should stack on mobile', async({ page }) => {
    // Find a horizontal card
    const horizontalCard = page.locator('dry-card[orientation="horizontal"]').first();

    if (await horizontalCard.count() > 0) {
      await expect(horizontalCard).toBeVisible();

      // Check if flex direction is column (stacked)
      const flexDirection = await horizontalCard.evaluate((el) => {
        const container = el.querySelector('.card-container');
        return window.getComputedStyle(container).flexDirection;
      });

      // On mobile, should be column
      expect(flexDirection).toBe('column');
    }
  });

  test('cards should not overflow viewport', async({ page }) => {
    const cards = page.locator('dry-card');
    const count = await cards.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = cards.nth(i);
      const box = await card.boundingBox();

      // Card width should not exceed viewport (with some padding)
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  test('card content should be readable', async({ page }) => {
    const card = page.locator('dry-card').first();
    await expect(card).toBeVisible();

    // Check padding exists
    const padding = await card.evaluate((el) => {
      const container = el.querySelector('.card-container');
      return window.getComputedStyle(container).padding;
    });

    expect(padding).toBeTruthy();
  });

  test('interactive cards should have adequate touch targets', async({ page }) => {
    const interactiveCard = page.locator('dry-card[interactive]').first();

    if (await interactiveCard.count() > 0) {
      const box = await interactiveCard.boundingBox();

      // Height should be adequate for touch
      expect(box.height).toBeGreaterThan(44);
    }
  });
});


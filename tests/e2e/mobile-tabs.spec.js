import { test, expect } from '@playwright/test';

/**
 * Mobile Tabs Component Tests
 * Tests tabs component horizontal scrolling and touch targets on mobile
 */

test.describe('Mobile - Tabs Component', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8086/examples/tabs-showcase.html');
    await page.waitForTimeout(1500);
  });

  test('tab buttons should have adequate touch targets', async ({ page }) => {
    const tabButtons = page.locator('dry-tabs button[role="tab"]');
    const count = await tabButtons.count();
    
    if (count > 0) {
      const button = tabButtons.first();
      const box = await button.boundingBox();
      
      // Height should be at least 44px for touch
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('horizontal tabs should not overflow without scroll', async ({ page }) => {
    const tabList = page.locator('.dry-tabs-list').first();
    
    if (await tabList.count() > 0) {
      // Check if overflow is handled
      const overflowX = await tabList.evaluate((el) => {
        return window.getComputedStyle(el).overflowX;
      });
      
      // Should have auto or scroll to handle overflow
      expect(['auto', 'scroll'].includes(overflowX)).toBe(true);
    }
  });

  test('tab content should be visible when active', async ({ page }) => {
    const tabs = page.locator('dry-tabs').first();
    await expect(tabs).toBeVisible();
    
    // Find active tab content
    const activeContent = tabs.locator('tab-item[active]');
    
    if (await activeContent.count() > 0) {
      await expect(activeContent).toBeVisible();
      
      const display = await activeContent.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });
      
      expect(display).not.toBe('none');
    }
  });

  test('switching tabs should work with touch', async ({ page }) => {
    const tabButtons = page.locator('dry-tabs button[role="tab"]');
    const count = await tabButtons.count();
    
    if (count > 1) {
      const secondTab = tabButtons.nth(1);
      
      // Tap the second tab
      await secondTab.tap();
      await page.waitForTimeout(500);
      
      // Check if it became active
      const ariaSelected = await secondTab.getAttribute('aria-selected');
      expect(ariaSelected).toBe('true');
    }
  });

  test('tabs should not cause horizontal page overflow', async ({ page }) => {
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    
    // Allow small tolerance for rounding
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });
});


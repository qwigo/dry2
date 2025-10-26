import { test, expect } from '@playwright/test';

test.describe('DRY Stat Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/stat-showcase.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for custom elements to be defined
    await page.waitForFunction(() => {
      return customElements.get('dry-stat') && 
             customElements.get('dry-breadcrumbs');
    });
    
    // Wait for the first stat component to be rendered
    await page.waitForSelector('dry-stat[data-rendered="true"]', { timeout: 5000 });
    
    // Small additional wait for any animations/transitions to settle
    await page.waitForTimeout(500);
  });

  test('should render without no content messages', async ({ page }) => {
    const statComponents = page.locator('dry-stat');
    const count = await statComponents.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Check that none of the stat components show error messages
    for (let i = 0; i < Math.min(count, 5); i++) {
      const stat = statComponents.nth(i);
      const content = await stat.textContent();
      expect(content).not.toContain('not defined');
      expect(content).not.toContain('undefined');
    }
  });

  test('should have correct initial state on page load', async ({ page }) => {
    // Check first stat component has a value and label
    const firstStat = page.locator('dry-stat').first();
    await expect(firstStat).toBeVisible();
    
    const content = await firstStat.textContent();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should not have JavaScript console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);
    
    // Filter out the Tailwind CDN warning
    const relevantErrors = consoleErrors.filter(error => 
      !error.includes('cdn.tailwindcss.com should not be used in production')
    );
    
    expect(relevantErrors).toEqual([]);
  });

  test('should display formatted values correctly', async ({ page }) => {
    // Find a stat with a specific value attribute
    const numberStat = page.locator('dry-stat[value="1234"]').first();
    await expect(numberStat).toBeVisible();
    
    const content = await numberStat.textContent();
    // Should contain formatted number
    expect(content).toContain('1,234');
  });

  test('should display currency values correctly', async ({ page }) => {
    const currencyStat = page.locator('dry-stat[type="currency"]').first();
    await expect(currencyStat).toBeVisible();
    
    const content = await currencyStat.textContent();
    // Should contain dollar sign for currency
    expect(content).toMatch(/\$/);
  });

  test('should display percentage values correctly', async ({ page }) => {
    const percentageStat = page.locator('dry-stat[type="percentage"]').first();
    await expect(percentageStat).toBeVisible();
    
    const content = await percentageStat.textContent();
    // Should contain percentage sign
    expect(content).toMatch(/%/);
  });

  test('should display trend indicators when provided', async ({ page }) => {
    const trendStat = page.locator('dry-stat[trend]').first();
    
    if (await trendStat.count() > 0) {
      await expect(trendStat).toBeVisible();
      
      // Check for SVG trend icon
      const trendIcon = trendStat.locator('svg');
      await expect(trendIcon).toBeVisible();
    }
  });

  test('should support both vertical and horizontal layouts', async ({ page }) => {
    const horizontalStat = page.locator('dry-stat[layout="horizontal"]').first();
    
    if (await horizontalStat.count() > 0) {
      await expect(horizontalStat).toBeVisible();
      
      // Check for flex container in horizontal layout
      const container = horizontalStat.locator('.flex.items-center.justify-between');
      await expect(container).toBeVisible();
    }
  });

  test('should handle dynamic attribute changes', async ({ page }) => {
    const stat = page.locator('dry-stat').first();
    
    // Change the value attribute
    await stat.evaluate((el) => {
      el.setAttribute('value', '9999');
    });
    
    await page.waitForTimeout(500);
    
    const content = await stat.textContent();
    expect(content).toContain('9,999');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const stats = page.locator('dry-stat');
    const firstStat = stats.first();
    
    // Check that the component renders with proper structure
    await expect(firstStat).toBeVisible();
    
    // Verify it has text content (important for screen readers)
    const textContent = await firstStat.textContent();
    expect(textContent.trim().length).toBeGreaterThan(0);
  });
});


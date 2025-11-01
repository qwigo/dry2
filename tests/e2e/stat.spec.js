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

  test('should render with correct colors on light backgrounds', async ({ page }) => {
    // Navigate to a specific stat with light background
    const lightBgStat = page.locator('.stat-card.bg-white dry-stat').first();
    await expect(lightBgStat).toBeVisible();
    
    // Check that value text has dark color classes
    const valueElement = lightBgStat.locator('.text-2xl');
    await expect(valueElement).toBeVisible();
    
    const classes = await valueElement.getAttribute('class');
    // Should contain gray-900 for dark text on light background
    expect(classes).toContain('text-gray-900');
  });

  test('should render with correct colors on dark backgrounds', async ({ page }) => {
    // Find a stat with text-white class (for dark backgrounds)
    const darkBgStat = page.locator('dry-stat[class*="text-white"]').first();
    
    if (await darkBgStat.count() > 0) {
      await expect(darkBgStat).toBeVisible();
      
      // Check that value text has inherit or light color classes
      const valueElement = darkBgStat.locator('.text-2xl');
      await expect(valueElement).toBeVisible();
      
      const classes = await valueElement.getAttribute('class');
      // Should contain text-inherit for light text on dark background
      expect(classes).toContain('text-inherit');
    }
  });

  test('should detect light theme and apply correct text colors', async ({ page }) => {
    // Create a test stat with text-white class
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.className = 'p-6 bg-gray-900 rounded-lg';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.id = 'test-dark-stat';
      
      const stat = document.createElement('dry-stat');
      stat.setAttribute('value', '12345');
      stat.setAttribute('label', 'Test Stat');
      stat.setAttribute('class', 'text-white');
      
      container.appendChild(stat);
      document.body.appendChild(container);
    });
    
    await page.waitForTimeout(500);
    
    const testStat = page.locator('#test-dark-stat dry-stat');
    await expect(testStat).toBeVisible();
    
    // Check that the inner value element has text-inherit class
    const valueElement = testStat.locator('.text-2xl');
    const classes = await valueElement.getAttribute('class');
    expect(classes).toContain('text-inherit');
    
    // Cleanup
    await page.evaluate(() => {
      document.getElementById('test-dark-stat')?.remove();
    });
  });

  test('should handle color theme switching dynamically', async ({ page }) => {
    const stat = page.locator('dry-stat').first();
    
    // Initially check default classes
    let valueElement = stat.locator('.text-2xl');
    let initialClasses = await valueElement.getAttribute('class');
    
    // Add text-white class to trigger light theme
    await stat.evaluate((el) => {
      el.setAttribute('class', 'text-white');
    });
    
    await page.waitForTimeout(500);
    
    // Check that classes changed
    valueElement = stat.locator('.text-2xl');
    const newClasses = await valueElement.getAttribute('class');
    expect(newClasses).toContain('text-inherit');
    
    // Remove text-white class
    await stat.evaluate((el) => {
      el.removeAttribute('class');
    });
    
    await page.waitForTimeout(500);
    
    // Check that it reverted to default dark text
    valueElement = stat.locator('.text-2xl');
    const revertedClasses = await valueElement.getAttribute('class');
    expect(revertedClasses).toContain('text-gray-900');
  });

  test('should display trend colors correctly on both light and dark backgrounds', async ({ page }) => {
    // Check trend on light background
    const lightTrendStat = page.locator('dry-stat[trend="up"]').first();
    if (await lightTrendStat.count() > 0) {
      const trendElement = lightTrendStat.locator('.text-green-600, .text-green-400').first();
      await expect(trendElement).toBeVisible();
    }
    
    // Check trend on dark background (if exists)
    const darkTrendStat = page.locator('dry-stat[class*="text-white"][trend="up"]').first();
    if (await darkTrendStat.count() > 0) {
      const trendElement = darkTrendStat.locator('.text-green-600, .text-green-400').first();
      await expect(trendElement).toBeVisible();
    }
  });
});


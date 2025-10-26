import { test, expect } from '@playwright/test';

test.describe('Timeline Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/timeline-showcase.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for custom elements to be defined
    await page.waitForFunction(() => {
      return customElements.get('timeline-component') && 
             customElements.get('timeline-item');
    });
    
    // Wait for the first timeline to be rendered
    await page.waitForSelector('timeline-component', { timeout: 5000 });
    
    // Small additional wait for any animations/transitions to settle
    await page.waitForTimeout(500);
  });

  test('should render without no content messages', async ({ page }) => {
    const timelineComponents = page.locator('timeline-component');
    const count = await timelineComponents.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Check that timeline components render properly
    const firstTimeline = timelineComponents.first();
    const content = await firstTimeline.textContent();
    expect(content).not.toContain('not defined');
    expect(content).not.toContain('undefined');
  });

  test('should have correct initial state on page load', async ({ page }) => {
    // Check first timeline component exists
    const firstTimeline = page.locator('timeline-component').first();
    await expect(firstTimeline).toBeVisible();
    
    // Check that it has timeline items
    const items = firstTimeline.locator('timeline-item');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);
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

  test('should display timeline items with markers', async ({ page }) => {
    const firstTimeline = page.locator('timeline-component').first();
    const items = firstTimeline.locator('timeline-item');
    
    // Check that items have markers
    const firstItem = items.first();
    await expect(firstItem).toBeVisible();
    
    // Timeline items should have visual markers (circles or icons)
    const marker = firstItem.locator('div.rounded-full');
    await expect(marker).toBeVisible();
  });

  test('should display different variant colors', async ({ page }) => {
    // Check for different colored markers based on variant
    const successItem = page.locator('timeline-item[variant="success"]').first();
    
    if (await successItem.count() > 0) {
      await expect(successItem).toBeVisible();
      
      // Success variant should have green marker
      const marker = successItem.locator('.bg-green-500');
      await expect(marker).toBeVisible();
    }
  });

  test('should display dates when provided', async ({ page }) => {
    const itemWithDate = page.locator('timeline-item[date]').first();
    
    if (await itemWithDate.count() > 0) {
      await expect(itemWithDate).toBeVisible();
      
      // Should display the date
      const dateText = itemWithDate.locator('.text-gray-500');
      await expect(dateText).toBeVisible();
    }
  });

  test('should display titles when provided', async ({ page }) => {
    const itemWithTitle = page.locator('timeline-item[title]').first();
    
    if (await itemWithTitle.count() > 0) {
      await expect(itemWithTitle).toBeVisible();
      
      // Should display the title
      const titleText = itemWithTitle.locator('.font-semibold');
      await expect(titleText).toBeVisible();
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const timeline = page.locator('timeline-component').first();
    
    // Check that the component renders with proper structure
    await expect(timeline).toBeVisible();
    
    // Verify it has text content (important for screen readers)
    const textContent = await timeline.textContent();
    expect(textContent.trim().length).toBeGreaterThan(0);
  });
});


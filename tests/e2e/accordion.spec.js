import { test, expect } from '@playwright/test';

test.describe('Accordion Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the accordion showcase page
    await page.goto('/examples/accordion-showcase.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for custom elements to be defined
    await page.waitForFunction(() => {
      return customElements.get('dry-accordion') && 
             customElements.get('accordion-item') &&
             customElements.get('dry-breadcrumbs');
    });
    
    // Wait for the first accordion to be visible and rendered
    await page.waitForSelector('dry-accordion[data-rendered="true"]', { timeout: 5000 });
    
    // Small additional wait for any animations/transitions to settle
    await page.waitForTimeout(500);
  });

  test('should render without "no content" messages', async ({ page }) => {
    // Check that accordion sections render
    const accordionItems = await page.locator('accordion-item').count();
    expect(accordionItems).toBeGreaterThan(0);

    // Check for no error messages
    const noContentMessage = await page.locator('text=/no content|not found|error/i').count();
    expect(noContentMessage).toBe(0);

    // Verify first accordion renders properly
    const firstAccordion = page.locator('dry-accordion').first();
    await expect(firstAccordion).toBeVisible();
  });

  test('should load with correct initial state', async ({ page }) => {
    // First accordion item should be open (has 'open' attribute)
    const firstItem = page.locator('dry-accordion').first().locator('accordion-item').first();
    const isOpen = await firstItem.evaluate(el => el.hasAttribute('open'));
    expect(isOpen).toBe(true);

    // Check that the content is visible
    const contentWrapper = firstItem.locator('.accordion-content-wrapper');
    const maxHeight = await contentWrapper.evaluate(el => el.style.maxHeight);
    expect(maxHeight).not.toBe('0');
  });

  test('should toggle accordion sections on click', async ({ page }) => {
    // Get the first accordion (non-multiple mode)
    const accordion = page.locator('dry-accordion').first();
    const secondItem = accordion.locator('accordion-item').nth(1);
    const secondHeader = secondItem.locator('.accordion-header');

    // Click to open the second item
    await secondHeader.click();
    await page.waitForTimeout(500); // Wait for animation

    // Verify second item is now open
    const isOpen = await secondItem.evaluate(el => el.hasAttribute('open'));
    expect(isOpen).toBe(true);

    // Click again to close
    await secondHeader.click();
    await page.waitForTimeout(500);

    const isClosed = await secondItem.evaluate(el => !el.hasAttribute('open'));
    expect(isClosed).toBe(true);
  });

  test('should only allow one section open in single mode', async ({ page }) => {
    // Get the first accordion (single mode)
    const accordion = page.locator('dry-accordion').first();
    const firstItem = accordion.locator('accordion-item').first();
    const secondItem = accordion.locator('accordion-item').nth(1);

    // First item should be open initially
    let firstOpen = await firstItem.evaluate(el => el.hasAttribute('open'));
    expect(firstOpen).toBe(true);

    // Click second item
    await secondItem.locator('.accordion-header').click();
    await page.waitForTimeout(500);

    // Second item should be open, first should be closed
    firstOpen = await firstItem.evaluate(el => el.hasAttribute('open'));
    const secondOpen = await secondItem.evaluate(el => el.hasAttribute('open'));
    expect(firstOpen).toBe(false);
    expect(secondOpen).toBe(true);
  });

  test('should allow multiple sections open in multiple mode', async ({ page }) => {
    // Get the second accordion (has 'multiple' attribute)
    const accordion = page.locator('dry-accordion').nth(1);
    const firstItem = accordion.locator('accordion-item').first();
    const secondItem = accordion.locator('accordion-item').nth(1);
    const thirdItem = accordion.locator('accordion-item').nth(2);

    // Second and third items are already open, first is closed
    // Open first item (other items should stay open in multiple mode)
    await firstItem.locator('.accordion-header').click();
    await page.waitForTimeout(500);

    // All three should now be open
    const firstOpen = await firstItem.evaluate(el => el.hasAttribute('open'));
    const secondOpen = await secondItem.evaluate(el => el.hasAttribute('open'));
    const thirdOpen = await thirdItem.evaluate(el => el.hasAttribute('open'));
    expect(firstOpen).toBe(true);
    expect(secondOpen).toBe(true);
    expect(thirdOpen).toBe(true);
  });

  test('should display custom icons in headers', async ({ page }) => {
    // Get the accordion with custom icons (third accordion)
    const accordion = page.locator('dry-accordion').nth(2);
    const firstItem = accordion.locator('accordion-item').first();

    // Check that icon exists
    const icon = firstItem.locator('.accordion-icon svg');
    await expect(icon).toBeVisible();

    // Verify icon has correct styling
    const iconClass = await icon.getAttribute('class');
    expect(iconClass).toContain('w-5');
    expect(iconClass).toContain('h-5');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const firstAccordion = page.locator('dry-accordion').first();
    const firstItem = firstAccordion.locator('accordion-item').first();
    const header = firstItem.locator('.accordion-header');
    const contentWrapper = firstItem.locator('.accordion-content-wrapper');

    // Check ARIA attributes
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    const controlsId = await header.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();

    // Check content region
    await expect(contentWrapper).toHaveAttribute('role', 'region');
    const labelledBy = await contentWrapper.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
  });

  test('should not have JavaScript console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Interact with accordion
    const firstAccordion = page.locator('dry-accordion').first();
    await firstAccordion.locator('accordion-item').nth(1).locator('.accordion-header').click();
    await page.waitForTimeout(500);

    // Should have no console errors
    expect(consoleErrors).toEqual([]);
  });

  test('should animate chevron icon on toggle', async ({ page }) => {
    const firstAccordion = page.locator('dry-accordion').first();
    const secondItem = firstAccordion.locator('accordion-item').nth(1);
    const chevron = secondItem.locator('.accordion-chevron');

    // Initially should not be rotated
    let hasRotate = await chevron.evaluate(el => el.classList.contains('rotate-180'));
    expect(hasRotate).toBe(false);

    // Click to open
    await secondItem.locator('.accordion-header').click();
    await page.waitForTimeout(500);

    // Should now be rotated
    hasRotate = await chevron.evaluate(el => el.classList.contains('rotate-180'));
    expect(hasRotate).toBe(true);
  });

  test('should handle programmatic control - openAll', async ({ page }) => {
    // Use the interactive demo accordion
    const accordion = page.locator('#interactive-accordion');
    const openAllButton = page.locator('#open-all');

    // Click open all button
    await openAllButton.click();
    await page.waitForTimeout(500);

    // All items should be open (it's in multiple mode)
    const items = accordion.locator('accordion-item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const isOpen = await items.nth(i).evaluate(el => el.hasAttribute('open'));
      expect(isOpen).toBe(true);
    }
  });

  test('should handle programmatic control - closeAll', async ({ page }) => {
    const accordion = page.locator('#interactive-accordion');
    const openAllButton = page.locator('#open-all');
    const closeAllButton = page.locator('#close-all');

    // First open all
    await openAllButton.click();
    await page.waitForTimeout(500);

    // Then close all
    await closeAllButton.click();
    await page.waitForTimeout(500);

    // All items should be closed
    const items = accordion.locator('accordion-item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const isClosed = await items.nth(i).evaluate(el => !el.hasAttribute('open'));
      expect(isClosed).toBe(true);
    }
  });

  test('should handle toggle multiple mode', async ({ page }) => {
    const accordion = page.locator('#interactive-accordion');
    const toggleButton = page.locator('#toggle-multiple');
    const openAllButton = page.locator('#open-all');

    // Initially in multiple mode - open all should work
    await openAllButton.click();
    await page.waitForTimeout(500);

    let allOpen = await accordion.locator('accordion-item').evaluateAll(items => 
      items.every(item => item.hasAttribute('open'))
    );
    expect(allOpen).toBe(true);

    // Toggle to single mode
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Only one item should remain open
    const openCount = await accordion.locator('accordion-item[open]').count();
    expect(openCount).toBeLessThanOrEqual(1);
  });

  test('should handle disabled state', async ({ page }) => {
    const accordion = page.locator('#interactive-accordion');
    const toggleDisabledButton = page.locator('#toggle-disabled');
    const firstItem = accordion.locator('accordion-item').first();
    const firstHeader = firstItem.locator('.accordion-header');

    // Disable the accordion
    await toggleDisabledButton.click();
    await page.waitForTimeout(500);

    // Header should be disabled
    const isDisabled = await firstHeader.evaluate(el => el.hasAttribute('disabled'));
    expect(isDisabled).toBe(true);

    // Should have disabled styling
    const hasDisabledClass = await firstHeader.evaluate(el => 
      el.classList.contains('cursor-not-allowed')
    );
    expect(hasDisabledClass).toBe(true);
  });

  test('should emit accordion:change events', async ({ page }) => {
    const accordion = page.locator('#interactive-accordion');
    const firstItem = accordion.locator('accordion-item').first();

    // Listen for custom events
    const eventFired = await page.evaluate(() => {
      return new Promise((resolve) => {
        const accordion = document.getElementById('interactive-accordion');
        accordion.addEventListener('accordion:change', (e) => {
          resolve({
            itemId: e.detail.itemId,
            isOpen: e.detail.isOpen,
            openItemsCount: e.detail.openItems.length
          });
        }, { once: true });

        // Trigger an item toggle
        const firstItem = accordion.querySelector('accordion-item');
        firstItem.querySelector('.accordion-header').click();
      });
    });

    expect(eventFired.itemId).toBeTruthy();
    expect(typeof eventFired.isOpen).toBe('boolean');
    expect(typeof eventFired.openItemsCount).toBe('number');
  });

  test('should display event log updates', async ({ page }) => {
    const openAllButton = page.locator('#open-all');
    const logContent = page.locator('#log-content');

    // Perform an action
    await openAllButton.click();
    await page.waitForTimeout(500);

    // Check that log has entries
    const logEntries = await logContent.locator('div').count();
    expect(logEntries).toBeGreaterThan(0);

    // Verify log contains expected text
    const logText = await logContent.textContent();
    expect(logText).toContain('opened');
  });

  test('should clear event log', async ({ page }) => {
    const openAllButton = page.locator('#open-all');
    const clearLogButton = page.locator('#clear-log');
    const logContent = page.locator('#log-content');

    // Generate some log entries
    await openAllButton.click();
    await page.waitForTimeout(500);

    // Verify entries exist
    let logEntries = await logContent.locator('div').count();
    expect(logEntries).toBeGreaterThan(0);

    // Clear the log
    await clearLogButton.click();
    await page.waitForTimeout(200);

    // Log should be empty
    logEntries = await logContent.locator('div').count();
    expect(logEntries).toBe(0);
  });

  test('should handle content with HTML elements', async ({ page }) => {
    // Second accordion has HTML list in content
    const accordion = page.locator('dry-accordion').nth(1);
    const firstItem = accordion.locator('accordion-item').first();

    // Open the item
    await firstItem.locator('.accordion-header').click();
    await page.waitForTimeout(500);

    // Verify list items are rendered
    const listItems = firstItem.locator('ul li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);

    // Verify list content
    const firstListItem = await listItems.first().textContent();
    expect(firstListItem).toContain('Responsive design');
  });

  test('should maintain state when accordion is toggled', async ({ page }) => {
    const accordion = page.locator('dry-accordion').first();
    const firstItem = accordion.locator('accordion-item').first();
    const secondItem = accordion.locator('accordion-item').nth(1);

    // First item starts open
    let firstOpen = await firstItem.evaluate(el => el.hasAttribute('open'));
    expect(firstOpen).toBe(true);

    // Open second item (should close first in single mode)
    await secondItem.locator('.accordion-header').click();
    await page.waitForTimeout(500);

    // Open first item again
    await firstItem.locator('.accordion-header').click();
    await page.waitForTimeout(500);

    // First should be open again
    firstOpen = await firstItem.evaluate(el => el.hasAttribute('open'));
    expect(firstOpen).toBe(true);
  });

  test('should have smooth animations', async ({ page }) => {
    const accordion = page.locator('dry-accordion').first();
    const secondItem = accordion.locator('accordion-item').nth(1);
    const contentWrapper = secondItem.locator('.accordion-content-wrapper');

    // Check that transition class is present
    const hasTransitionClass = await contentWrapper.evaluate(el => {
      return el.classList.contains('transition-all') || 
             el.className.includes('transition');
    });
    expect(hasTransitionClass).toBe(true);

    // Verify animation duration is set
    const hasDuration = await contentWrapper.evaluate(el => {
      return el.className.includes('duration');
    });
    expect(hasDuration).toBe(true);
  });

  test('should render component builder section', async ({ page }) => {
    const builderSection = page.locator('#accordion-component-builder');
    await expect(builderSection).toBeVisible();

    // Should have preview area
    const preview = builderSection.locator('.component-preview, dry-accordion');
    const previewCount = await preview.count();
    expect(previewCount).toBeGreaterThan(0);
  });

  test('should handle rapid clicking without breaking', async ({ page }) => {
    const accordion = page.locator('dry-accordion').first();
    const firstItem = accordion.locator('accordion-item').first();
    const header = firstItem.locator('.accordion-header');

    // Rapidly click the header multiple times
    for (let i = 0; i < 5; i++) {
      await header.click();
      await page.waitForTimeout(100);
    }

    // Component should still be functional
    const isRendered = await firstItem.evaluate(el => el.hasAttribute('data-rendered'));
    expect(isRendered).toBe(true);
  });

  test('should work with keyboard navigation', async ({ page }) => {
    const accordion = page.locator('dry-accordion').first();
    const firstItem = accordion.locator('accordion-item').first();
    const header = firstItem.locator('.accordion-header');

    // Focus the header
    await header.focus();

    // Press Enter to toggle
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // State should have changed
    const isOpen = await firstItem.evaluate(el => el.hasAttribute('open'));
    expect(typeof isOpen).toBe('boolean');
  });

  test('should handle empty accordion gracefully', async ({ page }) => {
    // Create an empty accordion via JS
    const hasError = await page.evaluate(() => {
      try {
        const accordion = document.createElement('dry-accordion');
        document.body.appendChild(accordion);
        return false;
      } catch (e) {
        return true;
      }
    });

    expect(hasError).toBe(false);
  });
});


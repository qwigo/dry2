/**
 * Playwright E2E Tests for Dialog Component
 * Tests both modal dialog and drawer modes
 */

import { test, expect } from '@playwright/test';

test.describe('Dialog Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dialog showcase page
    await page.goto('/examples/dialog-showcase.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for custom elements to be defined
    await page.waitForFunction(() => {
      return customElements.get('dry-dialog');
    });
    
    // Wait for custom elements to be upgraded and HTMX to be ready
    await page.waitForTimeout(1500);
  });

  test('should render without no-content messages', async ({ page }) => {
    // Check that there are no "no content" or error messages
    const noContentText = await page.locator('text=/no content|not found|error loading/i').count();
    expect(noContentText).toBe(0);

    // Verify dry-dialog elements are present
    const dialogComponents = await page.locator('dry-dialog').count();
    expect(dialogComponents).toBeGreaterThan(0);

    // Verify specific expected links are visible with text
    await expect(page.locator('dry-dialog a:has-text("Open Basic Dialog")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Right Drawer")')).toBeVisible();
    
    // Count visible links with text content
    const visibleLinksWithText = await page.locator('dry-dialog a:visible:not(:empty)').count();
    expect(visibleLinksWithText).toBeGreaterThan(5);
  });

  test('should have correct initial state on page load', async ({ page }) => {
    // All dialogs should be closed initially
    const visibleDialogs = await page.locator('dialog[open]').count();
    expect(visibleDialogs).toBe(0);

    // All drawer backdrops should be hidden initially
    const visibleBackdrops = await page.locator('[data-backdrop="true"]:not(.hidden)').count();
    expect(visibleBackdrops).toBe(0);

    // Verify links have correct classes
    const firstLink = page.locator('dry-dialog a').first();
    const hasLinkClasses = await firstLink.evaluate((el) => {
      return el.className.includes('bg-') || el.className.includes('px-') || el.className.includes('py-');
    });
    expect(hasLinkClasses).toBe(true);
  });

  test('should open and close modal dialog', async ({ page }) => {
    // Find the first basic dialog trigger (exclude hidden buttons)
    const triggerButton = page.locator('dry-dialog a:not(.hidden)').first();
    
    // Click to open dialog
    await triggerButton.click();
    
    // Wait for dialog to open
    await page.waitForTimeout(1000);
    
    // Verify dialog is open
    const openDialog = page.locator('dialog[open]').first();
    await expect(openDialog).toBeVisible();
    
    // Verify dialog has content container with ID
    const dialogInner = openDialog.locator('div[id*="dialog"]');
    await expect(dialogInner).toBeAttached();
    
    // Close dialog using ESC key (we know this works from other tests)
    await page.keyboard.press('Escape');
    
    // Wait for dialog to close
    await page.waitForTimeout(500);
    
    // Verify dialog is closed
    const closedDialogs = await page.locator('dialog[open]').count();
    expect(closedDialogs).toBe(0);
  });

  test('should open and close drawer', async ({ page }) => {
    // Find a drawer trigger (right drawer)
    const drawerTrigger = page.locator('dry-dialog a:has-text("Open Right Drawer")').first();
    
    // Click to open drawer
    await drawerTrigger.click();
    
    // Wait for drawer animation
    await page.waitForTimeout(500);
    
    // Verify backdrop is visible
    const backdrop = page.locator('[data-backdrop="true"]:not(.hidden)').first();
    await expect(backdrop).toBeVisible();
    
    // Verify drawer is visible (look for div with role="dialog", not dialog element)
    const drawer = page.locator('dry-dialog div[role="dialog"][id*="drawer"]').first();
    await expect(drawer).toBeAttached();
    
    const hasTranslateClass = await drawer.evaluate((el) => {
      return el.classList.contains('translate-x-full') || 
             el.classList.contains('-translate-x-full') ||
             el.classList.contains('translate-y-full') || 
             el.classList.contains('-translate-y-full');
    });
    expect(hasTranslateClass).toBe(false);
    
    // Close drawer using ESC key (we know this works from other tests)
    await page.keyboard.press('Escape');
    
    // Wait for drawer animation
    await page.waitForTimeout(500);
    
    // Verify drawer is hidden (translated off-screen)
    const isHidden = await drawer.evaluate((el) => {
      return el.classList.contains('translate-x-full') || 
             el.classList.contains('-translate-x-full');
    });
    expect(isHidden).toBe(true);
  });

  test('should close dialog when clicking backdrop', async ({ page }) => {
    // Open modal dialog
    const triggerButton = page.locator('dry-dialog a').first();
    await triggerButton.click();
    await page.waitForTimeout(500);
    
    // Verify dialog is open
    await expect(page.locator('dialog[open]').first()).toBeVisible();
    
    // Click on dialog backdrop (outside dialog content)
    const dialog = page.locator('dialog[open]').first();
    const dialogBox = await dialog.boundingBox();
    
    // Click outside the dialog content area
    await page.mouse.click(dialogBox.x - 10, dialogBox.y + 10);
    
    // Wait for close
    await page.waitForTimeout(500);
    
    // Verify dialog is closed
    const openDialogs = await page.locator('dialog[open]').count();
    expect(openDialogs).toBe(0);
  });

  test('should close drawer when clicking backdrop', async ({ page }) => {
    // Open drawer
    const drawerTrigger = page.locator('dry-dialog a:has-text("Open Right Drawer")').first();
    await drawerTrigger.click();
    await page.waitForTimeout(500);
    
    // Click backdrop
    const backdrop = page.locator('[data-backdrop="true"]:not(.hidden)').first();
    await backdrop.click();
    
    // Wait for drawer animation
    await page.waitForTimeout(500);
    
    // Verify drawer is closed (look for div with role="dialog")
    const drawer = page.locator('dry-dialog div[role="dialog"][id*="drawer"]').first();
    const isHidden = await drawer.evaluate((el) => {
      return el.classList.contains('translate-x-full');
    });
    expect(isHidden).toBe(true);
  });

  test('should close dialog when pressing ESC key', async ({ page }) => {
    // Open modal dialog
    const triggerButton = page.locator('dry-dialog a').first();
    await triggerButton.click();
    await page.waitForTimeout(500);
    
    // Verify dialog is open
    await expect(page.locator('dialog[open]').first()).toBeVisible();
    
    // Press ESC key
    await page.keyboard.press('Escape');
    
    // Wait for close
    await page.waitForTimeout(500);
    
    // Verify dialog is closed
    const openDialogs = await page.locator('dialog[open]').count();
    expect(openDialogs).toBe(0);
  });

  test('should test different drawer directions', async ({ page }) => {
    // Test left drawer
    await page.locator('dry-dialog a:has-text("Open Left Drawer")').first().click();
    await page.waitForTimeout(500);
    
    let drawer = page.locator('dry-dialog [role="dialog"]:has-text("Drawer Content")').first();
    let hasLeftPosition = await drawer.evaluate(el => el.classList.contains('left-0'));
    expect(hasLeftPosition).toBe(true);
    
    // Close it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test top drawer
    await page.locator('dry-dialog a:has-text("Open Top Drawer")').first().click();
    await page.waitForTimeout(500);
    
    drawer = page.locator('dry-dialog [role="dialog"]:has-text("Drawer Content")').first();
    let hasTopPosition = await drawer.evaluate(el => el.classList.contains('top-0'));
    expect(hasTopPosition).toBe(true);
    
    // Close it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test bottom drawer
    await page.locator('dry-dialog a:has-text("Open Bottom Drawer")').first().click();
    await page.waitForTimeout(500);
    
    drawer = page.locator('dry-dialog [role="dialog"]:has-text("Drawer Content")').first();
    let hasBottomPosition = await drawer.evaluate(el => el.classList.contains('bottom-0'));
    expect(hasBottomPosition).toBe(true);
  });

  test('should work with programmatic API', async ({ page }) => {
    // Test programmatic open
    await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) dialog.open();
    });
    
    await page.waitForTimeout(500);
    
    // Verify dialog is open
    await expect(page.locator('dialog[open]').first()).toBeVisible();
    
    // Test programmatic close
    await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) dialog.close();
    });
    
    await page.waitForTimeout(500);
    
    // Verify dialog is closed
    const openDialogs = await page.locator('dialog[open]').count();
    expect(openDialogs).toBe(0);
  });

  test('should emit custom events', async ({ page }) => {
    // Set up event listeners
    await page.evaluate(() => {
      window.dialogEvents = [];
      document.addEventListener('dialog:opened', (e) => {
        window.dialogEvents.push({ type: 'opened', detail: e.detail });
      });
      document.addEventListener('dialog:closed', (e) => {
        window.dialogEvents.push({ type: 'closed', detail: e.detail });
      });
    });
    
    // Open dialog
    const triggerButton = page.locator('dry-dialog a').first();
    await triggerButton.click();
    await page.waitForTimeout(500);
    
    // Check opened event was fired
    let events = await page.evaluate(() => window.dialogEvents);
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].type).toBe('opened');
    
    // Close dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Check closed event was fired
    events = await page.evaluate(() => window.dialogEvents);
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events[events.length - 1].type).toBe('closed');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Open a modal dialog
    const triggerButton = page.locator('dry-dialog a:not(.hidden)').first();
    await triggerButton.click();
    await page.waitForTimeout(1000);
    
    // Check dialog has aria-modal
    const dialog = page.locator('dialog[open]').first();
    const ariaModal = await dialog.getAttribute('aria-modal');
    expect(ariaModal).toBe('true');
    
    const role = await dialog.getAttribute('role');
    expect(role).toBe('dialog');
    
    // Verify dialog content is visible
    const dialogInner = dialog.locator('div[id*="dialog"]');
    await expect(dialogInner).toBeVisible();
  });

  test('should load HTMX content into dialog', async ({ page }) => {
    // Click to open a dialog that loads content via HTMX
    const triggerButton = page.locator('dry-dialog a:has-text("Open Basic Dialog")').first();
    await triggerButton.click();
    
    // Wait for HTMX to load and dialog to open
    await page.waitForTimeout(2000);
    
    // Verify dialog is open
    const dialog = page.locator('dialog[open]').first();
    await expect(dialog).toBeVisible();
    
    // Verify HTMX content was loaded (check for specific text from dialog-content-example.html)
    const content = await dialog.textContent();
    expect(content).toContain('Dialog Content Example');
    expect(content).toContain('This content was dynamically loaded');
    
    // Close dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should load HTMX content into drawer', async ({ page }) => {
    // Click to open a drawer that loads content via HTMX
    const drawerButton = page.locator('dry-dialog a:has-text("Open Right Drawer")').first();
    await drawerButton.click();
    
    // Wait for HTMX to load and drawer to open
    await page.waitForTimeout(2000);
    
    // Verify drawer content was loaded (check for specific text from drawer-example-content.html)
    const drawer = page.locator('dry-dialog div[role="dialog"]').first();
    const content = await drawer.textContent();
    expect(content).toContain('Drawer Content Example');
    expect(content).toContain('Dynamic content loading');
    
    // Close drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should have no JavaScript console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Interact with dialogs
    const triggerButton = page.locator('dry-dialog a').first();
    await triggerButton.click();
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Open drawer
    const drawerTrigger = page.locator('dry-dialog a:has-text("Open Right Drawer")').first();
    await drawerTrigger.click();
    await page.waitForTimeout(500);
    
    const backdrop = page.locator('[data-backdrop="true"]').first();
    await backdrop.click();
    await page.waitForTimeout(500);
    
    // Check for errors
    expect(consoleErrors.length).toBe(0);
  });

  test('should support custom styling', async ({ page }) => {
    // Find custom styled dialog
    const customButton = page.locator('dry-dialog a:has-text("🎨 Custom Styled Drawer")').first();
    
    // Verify button has custom classes
    const buttonClass = await customButton.getAttribute('class');
    expect(buttonClass).toContain('gradient');
    
    await customButton.click();
    await page.waitForTimeout(500);
    
    // Verify drawer has custom classes
    const drawer = page.locator('dry-dialog [role="dialog"]:has-text("Drawer Content")').first();
    const drawerClass = await drawer.getAttribute('class');
    expect(drawerClass).toContain('gradient');
  });

  test('should handle multiple dialogs on same page', async ({ page }) => {
    // Open first dialog
    const firstButton = page.locator('dry-dialog a').first();
    await firstButton.click();
    await page.waitForTimeout(500);
    
    // Verify only one dialog is open
    let openDialogs = await page.locator('dialog[open]').count();
    expect(openDialogs).toBe(1);
    
    // Close first dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Open a drawer
    const drawerButton = page.locator('dry-dialog a:has-text("Open Right Drawer")').first();
    await drawerButton.click();
    await page.waitForTimeout(500);
    
    // Verify drawer is open
    const backdrop = page.locator('[data-backdrop="true"]:not(.hidden)').first();
    await expect(backdrop).toBeVisible();
    
    // Close drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should maintain button text content', async ({ page }) => {
    // Check various button texts are visible and have correct content
    await expect(page.locator('dry-dialog a:has-text("Open Basic Dialog")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Contact Form")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Right Drawer")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Left Drawer")')).toBeVisible();
    
    // Verify visible buttons have meaningful text
    const visibleButtons = await page.locator('dry-dialog a:visible').all();
    expect(visibleButtons.length).toBeGreaterThan(5);
    
    // Check a few sample buttons for proper text
    const firstButtonText = await page.locator('dry-dialog a:visible').first().textContent();
    expect(firstButtonText.trim().length).toBeGreaterThan(0);
    expect(firstButtonText).not.toContain('undefined');
    expect(firstButtonText).not.toContain('null');
  });

  test('should support custom dialog widths', async ({ page }) => {
    // Test small dialog (max-w-sm)
    const smallDialogButton = page.locator('dry-dialog a:has-text("Open Small Dialog")');
    await expect(smallDialogButton).toBeVisible();
    await smallDialogButton.click();
    await page.waitForTimeout(1000);
    
    let dialog = page.locator('dialog[open]').first();
    await expect(dialog).toBeVisible();
    
    // Check that dialog has max-w-sm class
    const dialogInner = dialog.locator('div[id*="dialog"]').first();
    let hasSmallWidth = await dialogInner.evaluate(el => el.classList.contains('max-w-sm'));
    expect(hasSmallWidth).toBe(true);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test extra large dialog (max-w-6xl)
    const xlDialogButton = page.locator('dry-dialog a:has-text("Open Extra Large Dialog")');
    await xlDialogButton.click();
    await page.waitForTimeout(1000);
    
    dialog = page.locator('dialog[open]').first();
    await expect(dialog).toBeVisible();
    
    // Check that dialog has max-w-6xl class
    const xlDialogInner = dialog.locator('div[id*="dialog"]').first();
    let hasXlWidth = await xlDialogInner.evaluate(el => el.classList.contains('max-w-6xl'));
    expect(hasXlWidth).toBe(true);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test custom width dialog (w-[600px])
    const customWidthButton = page.locator('dry-dialog a:has-text("Open Custom Width Dialog")');
    await customWidthButton.click();
    await page.waitForTimeout(1000);
    
    dialog = page.locator('dialog[open]').first();
    await expect(dialog).toBeVisible();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should support custom drawer widths', async ({ page }) => {
    // Test narrow drawer (w-64)
    const narrowDrawerButton = page.locator('dry-dialog a:has-text("Open Narrow Drawer")');
    await expect(narrowDrawerButton).toBeVisible();
    await narrowDrawerButton.click();
    await page.waitForTimeout(500);
    
    let drawer = page.locator('dry-dialog div[role="dialog"]').first();
    await expect(drawer).toBeAttached();
    
    // Check that drawer has w-64 class
    let hasNarrowWidth = await drawer.evaluate(el => el.classList.contains('w-64'));
    expect(hasNarrowWidth).toBe(true);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test wide drawer (w-96)
    const wideDrawerButton = page.locator('dry-dialog a:has-text("Open Wide Drawer")');
    await wideDrawerButton.click();
    await page.waitForTimeout(500);
    
    drawer = page.locator('dry-dialog div[role="dialog"]').first();
    await expect(drawer).toBeAttached();
    
    // Check that drawer has w-96 class
    let hasWideWidth = await drawer.evaluate(el => el.classList.contains('w-96'));
    expect(hasWideWidth).toBe(true);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test extra wide drawer (w-[32rem])
    const extraWideDrawerButton = page.locator('dry-dialog a:has-text("Open Extra Wide Drawer")');
    await extraWideDrawerButton.click();
    await page.waitForTimeout(500);
    
    drawer = page.locator('dry-dialog div[role="dialog"]').first();
    await expect(drawer).toBeAttached();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test half screen drawer (w-1/2)
    const halfScreenDrawerButton = page.locator('dry-dialog a:has-text("Open Half Screen Drawer")');
    await halfScreenDrawerButton.click();
    await page.waitForTimeout(500);
    
    drawer = page.locator('dry-dialog div[role="dialog"]').first();
    await expect(drawer).toBeAttached();
    
    // Check that drawer has w-1/2 class
    let hasHalfWidth = await drawer.evaluate(el => el.classList.contains('w-1/2'));
    expect(hasHalfWidth).toBe(true);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should verify custom width components render correctly', async ({ page }) => {
    // Check all custom width buttons are visible
    await expect(page.locator('dry-dialog a:has-text("Open Small Dialog")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Extra Large Dialog")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Custom Width Dialog")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Full Width Dialog")')).toBeVisible();
    
    // Check all custom drawer width buttons are visible
    await expect(page.locator('dry-dialog a:has-text("Open Narrow Drawer")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Wide Drawer")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Extra Wide Drawer")')).toBeVisible();
    await expect(page.locator('dry-dialog a:has-text("Open Half Screen Drawer")')).toBeVisible();
    
    // Count all visible dialog/drawer buttons - should be significantly more than 5 now
    const allVisibleButtons = await page.locator('dry-dialog a:visible').count();
    expect(allVisibleButtons).toBeGreaterThan(15);
  });
});

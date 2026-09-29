import { test, expect } from '@playwright/test';

test.describe('Dialog Component', () => {
  test.beforeEach(async({ page }) => {
    await page.goto('/examples/dialog-showcase.html');
    await page.waitForLoadState('networkidle');
  });

  test('should render dialog and drawer components on load', async({ page }) => {
    const dialogs = await page.locator('dry-dialog').count();
    expect(dialogs).toBeGreaterThan(0);

    // Modal variant renders a native <dialog>; drawer variant renders a div[role=dialog]
    await expect(page.locator('dry-dialog dialog.dry-dialog-native').first()).toBeAttached();
    await expect(page.locator('dry-dialog div[role="dialog"]').first()).toBeAttached();
  });

  test('should open modal dialog and load HTMX content', async({ page }) => {
    await page.locator('dry-dialog a:has-text("Open Dialog")').first().click();

    const dialog = page.locator('dry-dialog dialog[open]').first();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Dialog Content Example');
  });

  test('should close modal dialog with ESC key', async({ page }) => {
    await page.locator('dry-dialog a:has-text("Open Dialog")').first().click();
    await expect(page.locator('dry-dialog dialog[open]').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);
  });

  test('should close modal dialog with close button', async({ page }) => {
    await page.locator('dry-dialog a:has-text("Open Dialog")').first().click();
    const dialog = page.locator('dry-dialog dialog[open]').first();
    await expect(dialog).toBeVisible();

    await dialog.locator('button.dry-dialog-close-btn').click();
    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);
  });

  test('should open drawer and load HTMX content', async({ page }) => {
    await page.locator('dry-dialog a:has-text("Open Drawer")').first().click();

    const drawer = page.locator('dry-dialog div[role="dialog"]:visible').first();
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('Drawer Content Example');
  });

  test('should close drawer with close button', async({ page }) => {
    await page.locator('dry-dialog a:has-text("Open Drawer")').first().click();
    const drawer = page.locator('dry-dialog div[role="dialog"]:visible').first();
    await expect(drawer).toBeVisible();

    await drawer.locator('button[aria-label="Close drawer"]').click();
    await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(0);
  });

  test('should close drawer with backdrop click', async({ page }) => {
    await page.locator('dry-dialog a:has-text("Open Drawer")').first().click();
    await expect(page.locator('dry-dialog div[role="dialog"]:visible').first()).toBeVisible();

    const backdrop = page.locator('dry-dialog div[data-backdrop="true"]').first();
    await expect(backdrop).toBeVisible();
    await backdrop.click({ position: { x: 5, y: 5 } });
    await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(0);
  });

  test('should close drawer with ESC key', async({ page }) => {
    await page.locator('dry-dialog a:has-text("Open Drawer")').first().click();
    await expect(page.locator('dry-dialog div[role="dialog"]:visible').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(0);
  });

  test('should position drawers by direction', async({ page }) => {
    const cases = [
      { trigger: 'Right Drawer →', position: 'right-0', axis: 'dry-drawer-x' },
      { trigger: '← Left Drawer', position: 'left-0', axis: 'dry-drawer-x' },
      { trigger: '↑ Top Drawer', position: 'top-0', axis: 'dry-drawer-y' },
      { trigger: '↓ Bottom Drawer', position: 'bottom-0', axis: 'dry-drawer-y' }
    ];

    for (const c of cases) {
      await page.locator(`dry-dialog a:has-text("${c.trigger}")`).first().click();

      // Exactly one drawer is visible at a time, and it is the one just opened.
      const drawer = page.locator('dry-dialog div[role="dialog"]:visible').first();
      await expect(drawer).toBeVisible();

      const hasPosition = await drawer.evaluate((el, cls) => el.classList.contains(cls), c.position);
      expect(hasPosition).toBe(true);

      const hasAxis = await drawer.evaluate((el, cls) => el.classList.contains(cls), c.axis);
      expect(hasAxis).toBe(true);

      // Slide-in animation completes by removing the off-screen translate class
      const translated = await drawer.evaluate((el) => {
        return el.classList.contains('translate-x-full') ||
               el.classList.contains('-translate-x-full') ||
               el.classList.contains('translate-y-full') ||
               el.classList.contains('-translate-y-full');
      });
      expect(translated).toBe(false);

      await page.keyboard.press('Escape');
      await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(0);
    }
  });

  test('should work with programmatic API', async({ page }) => {
    // Programmatic usage sets content before opening (open() alone leaves the
    // panel empty and shrink-to-fit, so it would not be meaningfully visible).
    await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) {
        dialog.setContent('<p>Programmatic dialog content</p>');
        dialog.open();
      }
    });

    const dialog = page.locator('dry-dialog dialog[open]').first();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Programmatic dialog content');

    await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) dialog.close();
    });

    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);
  });

  test('should emit custom events', async({ page }) => {
    await page.evaluate(() => {
      window.dialogEvents = [];
      document.addEventListener('dialog:opened', (e) => {
        window.dialogEvents.push({ type: 'opened', detail: e.detail });
      });
      document.addEventListener('dialog:closed', (e) => {
        window.dialogEvents.push({ type: 'closed', detail: e.detail });
      });
    });

    await page.locator('dry-dialog a:has-text("Open Dialog")').first().click();
    await expect(page.locator('dry-dialog dialog[open]').first()).toBeVisible();

    const openedEvents = await page.evaluate(() => window.dialogEvents);
    expect(openedEvents.length).toBeGreaterThanOrEqual(1);
    expect(openedEvents[0].type).toBe('opened');

    await page.keyboard.press('Escape');
    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);

    const closedEvents = await page.evaluate(() => window.dialogEvents);
    expect(closedEvents.length).toBeGreaterThanOrEqual(2);
    expect(closedEvents[closedEvents.length - 1].type).toBe('closed');
  });

  test('should have proper accessibility attributes', async({ page }) => {
    await page.locator('dry-dialog a:has-text("Open Dialog")').first().click();
    const dialog = page.locator('dry-dialog dialog[open]').first();
    await expect(dialog).toBeVisible();

    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('role', 'dialog');

    await page.keyboard.press('Escape');
    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);

    // Drawer exposes the same dialog semantics
    await page.locator('dry-dialog a:has-text("Open Drawer")').first().click();
    const drawer = page.locator('dry-dialog div[role="dialog"]:visible').first();
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await expect(drawer).toHaveAttribute('role', 'dialog');
  });

  test('should have correct initial state on page load', async({ page }) => {
    // All dialogs and drawers start closed with their backdrops hidden
    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);
    await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(0);
    await expect(page.locator('dry-dialog div[data-backdrop="true"]:visible')).toHaveCount(0);
  });

  test('should close modal dialog when clicking outside the panel', async({ page }) => {
    await page.locator('#quick-start-trigger').click();

    const dialog = page.locator('dry-dialog dialog[open]').first();
    await expect(dialog).toBeVisible();

    // Click on the native ::backdrop, just outside the dialog element's box.
    // The click retargets to the dialog element, which closes the modal.
    const box = await dialog.boundingBox();
    await page.mouse.click(Math.max(box.x - 10, 2), box.y + box.height / 2);

    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);
  });

  test('should have no JavaScript console errors', async({ page }) => {
    const consoleErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Open and close a modal dialog
    await page.locator('#quick-start-trigger').click();
    await expect(page.locator('dry-dialog dialog[open]').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);

    // Open a drawer and close it via its backdrop
    await page.locator('#quick-start-drawer-trigger').click();
    const drawer = page.locator('dry-dialog div[role="dialog"]:visible').first();
    await expect(drawer).toBeVisible();

    const backdrop = page.locator('dry-dialog:has(#quick-start-drawer-trigger) div[data-backdrop="true"]');
    await expect(backdrop).toBeVisible();
    await backdrop.click({ position: { x: 5, y: 5 } });
    await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(0);

    expect(consoleErrors).toEqual([]);
  });

  test('should pass custom dialog styling through to the panel', async({ page }) => {
    // button-class lands on the generated trigger link
    const trigger = page.locator('#styled-dialog-trigger');
    await expect(trigger).toHaveClass(/bg-gradient-to-r/);
    await expect(trigger).toHaveClass(/rounded-full/);

    await trigger.click();
    await expect(page.locator('dry-dialog dialog[open]').first()).toBeVisible();

    // dialog-class lands on the id-less panel wrapper inside the native dialog
    const panel = page.locator('dry-dialog dialog[open] > div');
    await expect(panel).toHaveClass(/bg-gradient-to-br/);
    await expect(panel).toHaveClass(/rounded-xl/);
    await expect(panel).toHaveClass(/max-w-2xl/);
  });

  test('should pass custom drawer styling through to the panel', async({ page }) => {
    await page.locator('#custom-drawer-trigger').click();

    const drawer = page.locator('dry-dialog div[role="dialog"]:visible').first();
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveClass(/bg-gradient-to-br/);
    await expect(drawer).toHaveClass(/border-l-4/);
    await expect(drawer).toHaveClass(/border-blue-500/);
  });

  test('should handle multiple dialogs on same page', async({ page }) => {
    // Modal and drawer panels coexist but only one surface is open at a time
    await page.locator('#small-dialog-trigger').click();
    await expect(page.locator('dry-dialog dialog[open]').first()).toBeVisible();
    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(1);
    await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);

    await page.locator('#narrow-drawer-trigger').click();
    await expect(page.locator('dry-dialog div[role="dialog"]:visible').first()).toBeVisible();
    await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(1);
    await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(0);
  });

  test('should support custom dialog widths', async({ page }) => {
    const cases = [
      { trigger: '#small-dialog-trigger', widthClass: 'max-w-sm' },
      { trigger: '#xl-dialog-trigger', widthClass: 'max-w-6xl' },
      { trigger: '#custom-width-dialog-trigger', widthClass: 'w-[600px]' },
      { trigger: '#full-width-dialog-trigger', widthClass: 'max-w-full' }
    ];

    for (const c of cases) {
      await page.locator(c.trigger).click();

      // dialog-class lands on the id-less panel wrapper inside the native dialog
      const panel = page.locator('dry-dialog dialog[open] > div');
      await expect(panel).toBeVisible();

      const hasWidth = await panel.evaluate((el, cls) => el.classList.contains(cls), c.widthClass);
      expect(hasWidth).toBe(true);

      await page.keyboard.press('Escape');
      await expect(page.locator('dry-dialog dialog[open]')).toHaveCount(0);
    }
  });

  test('should support custom drawer widths', async({ page }) => {
    const cases = [
      { trigger: '#narrow-drawer-trigger', widthClass: 'w-64' },
      { trigger: '#wide-drawer-trigger', widthClass: 'w-96' },
      { trigger: '#extra-wide-drawer-trigger', widthClass: 'w-[32rem]' },
      { trigger: '#half-screen-drawer-trigger', widthClass: 'w-1/2' }
    ];

    for (const c of cases) {
      await page.locator(c.trigger).click();

      // drawer widths land on the div[role="dialog"] panel itself
      const drawer = page.locator('dry-dialog div[role="dialog"]:visible').first();
      await expect(drawer).toBeVisible();

      const hasWidth = await drawer.evaluate((el, cls) => el.classList.contains(cls), c.widthClass);
      expect(hasWidth).toBe(true);

      await page.keyboard.press('Escape');
      await expect(page.locator('dry-dialog div[role="dialog"]:visible')).toHaveCount(0);
    }
  });
});

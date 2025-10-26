import { test, expect } from '@playwright/test';

test.describe('Dialog Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/dialog-showcase.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for custom elements to be defined
    await page.waitForFunction(() => {
      return customElements.get('dry-dialog');
    });
    
    // Small wait for page to stabilize
    await page.waitForTimeout(500);
  });

  test('should render without no content messages', async ({ page }) => {
    // Check that dialog components are present
    const dialogComponents = page.locator('dry-dialog');
    await expect(dialogComponents.first()).toBeVisible();
    
    // Check that no "not defined" or "undefined" messages appear
    const bodyContent = await page.textContent('body');
    expect(bodyContent).not.toContain('not defined');
    expect(bodyContent).not.toContain('undefined');
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

  test('should display button text correctly', async ({ page }) => {
    // Check basic dialog button
    const basicDialogButton = page.locator('dry-dialog a:has-text("Open Basic Dialog")');
    await expect(basicDialogButton).toBeVisible();
    
    // Check form dialog button
    const formDialogButton = page.locator('dry-dialog a:has-text("Open Contact Form")');
    await expect(formDialogButton).toBeVisible();
  });

  test('should close dialog when close button is clicked', async ({ page }) => {
    // Open dialog programmatically
    await page.evaluate(() => {
      const dialog = document.querySelector('dry-dialog');
      if (dialog) dialog.open();
    });
    
    await page.waitForTimeout(500);
    
    // Verify dialog is open
    const dialog = page.locator('dialog[data-dialog-type="dialog"]').first();
    let isOpen = await dialog.evaluate((el) => el.open);
    expect(isOpen).toBe(true);
    
    // Click close button
    const closeButton = dialog.locator('#closer');
    await closeButton.click();
    
    await page.waitForTimeout(300);
    
    // Dialog should be closed
    isOpen = await dialog.evaluate((el) => el.open);
    expect(isOpen).toBe(false);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const trigger = page.locator('dry-dialog').first().locator('a');
    await trigger.click();
    
    await page.waitForTimeout(500);
    
    // Check close button has aria-label
    const closeButton = page.locator('dialog #closer').first();
    const ariaLabel = await closeButton.getAttribute('aria-label');
    expect(ariaLabel).toBe('Close dialog');
  });

  test('should support programmatic open/close', async ({ page }) => {
    // Get reference to programmatic dialog
    const dialogOpened = await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) {
        dialog.open();
        return true;
      }
      return false;
    });
    
    expect(dialogOpened).toBe(true);
    
    await page.waitForTimeout(500);
    
    // Check that dialog is open
    const dialog = page.locator('#programmatic-dialog dialog[data-dialog-type="dialog"]');
    const isOpen = await dialog.evaluate((el) => el.open);
    expect(isOpen).toBe(true);
    
    // Close programmatically
    await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) {
        dialog.close();
      }
    });
    
    await page.waitForTimeout(300);
    
    // Check that dialog is closed
    const isClosed = await dialog.evaluate((el) => !el.open);
    expect(isClosed).toBe(true);
  });

  test('should emit custom events on open', async ({ page }) => {
    // Set up event listener
    await page.evaluate(() => {
      window.dialogOpenedEvent = null;
      document.addEventListener('dialog:opened', (e) => {
        window.dialogOpenedEvent = e.detail;
      });
    });
    
    // Open dialog programmatically
    await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) {
        dialog.open();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check event was fired
    const eventDetail = await page.evaluate(() => window.dialogOpenedEvent);
    expect(eventDetail).toBeTruthy();
  });
});

test.describe('Drawer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/dialog-showcase.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for custom elements to be defined
    await page.waitForFunction(() => {
      return customElements.get('dry-dialog');
    });
    
    // Small wait for page to stabilize
    await page.waitForTimeout(500);
  });

  test('should render drawer trigger buttons', async ({ page }) => {
    // Check right drawer button
    const rightDrawerButton = page.locator('dry-dialog a:has-text("Open Right Drawer")');
    await expect(rightDrawerButton).toBeVisible();
    
    // Check left drawer button
    const leftDrawerButton = page.locator('dry-dialog a:has-text("Open Left Drawer")');
    await expect(leftDrawerButton).toBeVisible();
  });

  test('should close drawer when close button is clicked', async ({ page }) => {
    // Open drawer programmatically
    await page.evaluate(() => {
      const drawer = document.querySelector('dry-dialog[mode="drawer"]');
      if (drawer) drawer.open();
    });
    
    await page.waitForTimeout(500);
    
    // Verify drawer is open
    const backdrop = page.locator('.drawer-backdrop[data-dialog-type="drawer"]').first();
    let isVisible = await backdrop.evaluate((el) => el.style.display !== 'none');
    expect(isVisible).toBe(true);
    
    // Click close button
    const closeButton = backdrop.locator('#closer');
    await closeButton.click();
    
    // Wait for drawer animation
    await page.waitForTimeout(500);
    
    // Drawer backdrop should be hidden
    const isHidden = await backdrop.evaluate((el) => el.style.display === 'none');
    expect(isHidden).toBe(true);
  });

  test('should close drawer when backdrop is clicked', async ({ page }) => {
    // Open drawer programmatically
    await page.evaluate(() => {
      const drawer = document.querySelector('dry-dialog[mode="drawer"]');
      if (drawer) drawer.open();
    });
    
    await page.waitForTimeout(500);
    
    // Verify drawer is open
    const backdrop = page.locator('.drawer-backdrop[data-dialog-type="drawer"]').first();
    let isVisible = await backdrop.evaluate((el) => el.style.display !== 'none');
    expect(isVisible).toBe(true);
    
    // Click backdrop (directly on backdrop element, not on panel)
    await backdrop.evaluate((el) => {
      const event = new MouseEvent('click', { bubbles: true });
      // Simulate click directly on backdrop
      Object.defineProperty(event, 'target', { value: el, enumerable: true });
      el.dispatchEvent(event);
    });
    
    // Wait for drawer animation
    await page.waitForTimeout(500);
    
    // Drawer should be hidden
    const isHidden = await backdrop.evaluate((el) => el.style.display === 'none');
    expect(isHidden).toBe(true);
  });

  test('should close drawer when ESC key is pressed', async ({ page }) => {
    // Open drawer
    const trigger = page.locator('dry-dialog a:has-text("Open Right Drawer")');
    await trigger.click();
    
    await page.waitForTimeout(500);
    
    // Press ESC key
    await page.keyboard.press('Escape');
    
    // Wait for drawer animation
    await page.waitForTimeout(500);
    
    // Drawer should be hidden
    const backdrop = page.locator('.drawer-backdrop[data-dialog-type="drawer"]').first();
    const isHidden = await backdrop.evaluate((el) => el.style.display === 'none');
    expect(isHidden).toBe(true);
  });

  test('should support different drawer directions', async ({ page }) => {
    // Test left drawer
    const leftTrigger = page.locator('dry-dialog a:has-text("Open Left Drawer")');
    await leftTrigger.click();
    await page.waitForTimeout(500);
    
    const leftPanel = page.locator('.drawer-backdrop[data-dialog-type="drawer"]').nth(1).locator('[data-drawer-panel]');
    const hasLeftClass = await leftPanel.evaluate((el) => el.classList.contains('left-0'));
    expect(hasLeftClass).toBe(true);
    
    // Close left drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test top drawer
    const topTrigger = page.locator('dry-dialog a:has-text("Open Top Drawer")');
    await topTrigger.click();
    await page.waitForTimeout(500);
    
    const topPanel = page.locator('.drawer-backdrop[data-dialog-type="drawer"]').nth(2).locator('[data-drawer-panel]');
    const hasTopClass = await topPanel.evaluate((el) => el.classList.contains('top-0'));
    expect(hasTopClass).toBe(true);
  });

  test('should support programmatic drawer open/close', async ({ page }) => {
    // Get reference to programmatic drawer
    const drawerOpened = await page.evaluate(() => {
      const drawer = document.getElementById('programmatic-drawer');
      if (drawer) {
        drawer.open();
        return true;
      }
      return false;
    });
    
    expect(drawerOpened).toBe(true);
    
    await page.waitForTimeout(500);
    
    // Check that drawer is open
    const backdrop = page.locator('#programmatic-drawer .drawer-backdrop[data-dialog-type="drawer"]');
    await expect(backdrop).toBeVisible();
    
    // Close programmatically
    await page.evaluate(() => {
      const drawer = document.getElementById('programmatic-drawer');
      if (drawer) {
        drawer.close();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check that drawer is closed
    const isHidden = await backdrop.evaluate((el) => el.style.display === 'none');
    expect(isHidden).toBe(true);
  });

  test('should emit custom events on drawer open/close', async ({ page }) => {
    // Set up event listeners
    await page.evaluate(() => {
      window.drawerOpenedEvent = null;
      window.drawerClosedEvent = null;
      
      document.addEventListener('dialog:opened', (e) => {
        if (e.detail.mode === 'drawer') {
          window.drawerOpenedEvent = e.detail;
        }
      });
      
      document.addEventListener('dialog:closed', (e) => {
        if (e.detail.mode === 'drawer') {
          window.drawerClosedEvent = e.detail;
        }
      });
    });
    
    // Open drawer programmatically
    await page.evaluate(() => {
      const drawer = document.getElementById('programmatic-drawer');
      if (drawer) {
        drawer.open();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check open event was fired
    const openEvent = await page.evaluate(() => window.drawerOpenedEvent);
    expect(openEvent).toBeTruthy();
    expect(openEvent.mode).toBe('drawer');
    
    // Close drawer
    await page.evaluate(() => {
      const drawer = document.getElementById('programmatic-drawer');
      if (drawer) {
        drawer.close();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check close event was fired
    const closeEvent = await page.evaluate(() => window.drawerClosedEvent);
    expect(closeEvent).toBeTruthy();
    expect(closeEvent.mode).toBe('drawer');
  });
});

test.describe('Dialog Component - API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/dialog-showcase.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for custom elements to be defined
    await page.waitForFunction(() => {
      return customElements.get('dry-dialog');
    });
    
    await page.waitForTimeout(500);
  });

  test('should support setText API', async ({ page }) => {
    // Change button text programmatically
    await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) {
        dialog.setText('New Button Text');
      }
    });
    
    await page.waitForTimeout(300);
    
    // Check that button text was updated
    const buttonText = await page.locator('#programmatic-dialog a').textContent();
    expect(buttonText).toContain('New Button Text');
  });

  test('should support toggle API', async ({ page }) => {
    // Toggle dialog open
    await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) {
        dialog.toggle();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check that dialog is open
    const dialog = page.locator('#programmatic-dialog dialog[data-dialog-type="dialog"]');
    let isOpen = await dialog.evaluate((el) => el.open);
    expect(isOpen).toBe(true);
    
    // Toggle again to close
    await page.evaluate(() => {
      const dialog = document.getElementById('programmatic-dialog');
      if (dialog) {
        dialog.toggle();
      }
    });
    
    await page.waitForTimeout(300);
    
    // Check that dialog is closed
    isOpen = await dialog.evaluate((el) => el.open);
    expect(isOpen).toBe(false);
  });

  test('should have working getter properties', async ({ page }) => {
    // Get property values
    const properties = await page.evaluate(() => {
      const dialog = document.querySelector('dry-dialog');
      if (dialog) {
        return {
          url: dialog.url,
          mode: dialog.mode,
          direction: dialog.direction,
          buttonClass: dialog.buttonClass,
          dialogClass: dialog.dialogClass
        };
      }
      return null;
    });
    
    expect(properties).toBeTruthy();
    expect(properties.url).toBeTruthy();
    expect(properties.mode).toBeTruthy();
    expect(properties.buttonClass).toBeTruthy();
  });
});


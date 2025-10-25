/**
 * Playwright E2E Tests for Toggle Switch Component
 * Tests verify component rendering, interaction, and state management
 */

import { test, expect } from '@playwright/test';

test.describe('Toggle Switch Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the toggle switch showcase page
    await page.goto('/examples/toggle-switch-showcase.html');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for custom elements to upgrade (important for web components)
    await page.waitForTimeout(1000);
  });

  test.describe('Basic Rendering', () => {
    test('should render toggle switches without "no content" messages', async ({ page }) => {
      // Check that the page doesn't contain error messages
      const noContentMessages = await page.locator('text=no content').count();
      expect(noContentMessages).toBe(0);
      
      // Verify toggle switches are rendered
      const toggleSwitches = await page.locator('toggle-switch').count();
      expect(toggleSwitches).toBeGreaterThan(0);
    });

    test('should render basic toggle switches with correct initial states', async ({ page }) => {
      // Get the basic toggle section
      const basicSection = page.locator('section').filter({ hasText: 'Basic Toggle Switches' }).first();
      
      // Check unchecked toggle
      const uncheckedToggle = basicSection.locator('toggle-switch[name="basic-off"]');
      await expect(uncheckedToggle).toBeVisible();
      
      const uncheckedCheckbox = uncheckedToggle.locator('input[type="checkbox"]');
      await expect(uncheckedCheckbox).not.toBeChecked();
      
      // Check checked toggle
      const checkedToggle = basicSection.locator('toggle-switch[name="basic-on"]');
      await expect(checkedToggle).toBeVisible();
      
      const checkedCheckbox = checkedToggle.locator('input[type="checkbox"]');
      await expect(checkedCheckbox).toBeChecked();
      
      // Check disabled toggle
      const disabledToggle = basicSection.locator('toggle-switch[name="basic-disabled"]');
      await expect(disabledToggle).toBeVisible();
      
      const disabledCheckbox = disabledToggle.locator('input[type="checkbox"]');
      await expect(disabledCheckbox).toBeDisabled();
      
      // Check disabled & checked toggle
      const disabledCheckedToggle = basicSection.locator('toggle-switch[name="basic-disabled-checked"]');
      await expect(disabledCheckedToggle).toBeVisible();
      
      const disabledCheckedCheckbox = disabledCheckedToggle.locator('input[type="checkbox"]');
      await expect(disabledCheckedCheckbox).toBeDisabled();
      await expect(disabledCheckedCheckbox).toBeChecked();
    });

    test('should render toggles with different sizes', async ({ page }) => {
      const sizesSection = page.locator('section').filter({ hasText: 'Toggle Switch Sizes' }).first();
      
      // Check small toggle
      const smallToggle = sizesSection.locator('toggle-switch[size="sm"]');
      await expect(smallToggle).toBeVisible();
      await expect(smallToggle).toHaveAttribute('size', 'sm');
      
      // Check medium toggle
      const mediumToggle = sizesSection.locator('toggle-switch[size="md"]');
      await expect(mediumToggle).toBeVisible();
      await expect(mediumToggle).toHaveAttribute('size', 'md');
      
      // Check large toggle
      const largeToggle = sizesSection.locator('toggle-switch[size="lg"]');
      await expect(largeToggle).toBeVisible();
      await expect(largeToggle).toHaveAttribute('size', 'lg');
    });

    test('should render toggles with custom colors', async ({ page }) => {
      const colorsSection = page.locator('section').filter({ hasText: 'Custom Colors' }).first();
      
      // Check blue toggle (default)
      const blueToggle = colorsSection.locator('toggle-switch[name="color-blue"]');
      await expect(blueToggle).toBeVisible();
      await expect(blueToggle).toHaveAttribute('active-bg', 'bg-blue-500');
      
      // Check green toggle
      const greenToggle = colorsSection.locator('toggle-switch[name="color-green"]');
      await expect(greenToggle).toBeVisible();
      await expect(greenToggle).toHaveAttribute('active-bg', 'bg-green-500');
      
      // Check purple toggle
      const purpleToggle = colorsSection.locator('toggle-switch[name="color-purple"]');
      await expect(purpleToggle).toBeVisible();
      await expect(purpleToggle).toHaveAttribute('active-bg', 'bg-purple-500');
      
      // Check gradient toggle
      const gradientToggle = colorsSection.locator('toggle-switch[name="color-custom"]');
      await expect(gradientToggle).toBeVisible();
      await expect(gradientToggle).toHaveAttribute('active-bg', 'bg-gradient-to-r from-pink-500 to-yellow-500');
    });

    test('should render toggles with labels', async ({ page }) => {
      const labelsSection = page.locator('section').filter({ hasText: 'Toggle Switches with Labels' }).first();
      
      // Check toggle with label
      const notificationsToggle = labelsSection.locator('toggle-switch[name="notifications"]');
      await expect(notificationsToggle).toBeVisible();
      await expect(notificationsToggle).toHaveAttribute('label', 'Email Notifications');
      
      // Verify label text is displayed
      const labelText = notificationsToggle.locator('label:has-text("Email Notifications")');
      await expect(labelText).toBeVisible();
    });

    test('should render toggles with custom slot content', async ({ page }) => {
      const slotSection = page.locator('section').filter({ hasText: 'Toggle Switches with Custom Content' }).first();
      
      // Scroll to the section to ensure it's loaded
      await slotSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Check toggle with slot content
      const premiumToggle = slotSection.locator('toggle-switch[name="premium"]');
      await expect(premiumToggle).toBeVisible();
      
      // Verify the toggle contains the slot content text (it should be visible in the component)
      await expect(premiumToggle).toContainText('Premium Features');
      await expect(premiumToggle).toContainText('Unlock advanced functionality');
    });
  });

  test.describe('Interactive Behavior', () => {
    test('should toggle state when clicked', async ({ page }) => {
      const basicSection = page.locator('section').filter({ hasText: 'Basic Toggle Switches' }).first();
      const uncheckedToggle = basicSection.locator('toggle-switch[name="basic-off"]');
      const checkbox = uncheckedToggle.locator('input[type="checkbox"]');
      const toggleLabel = uncheckedToggle.locator('label.toggle-switch-label');
      
      // Initially unchecked
      await expect(checkbox).not.toBeChecked();
      
      // Click the label to toggle
      await toggleLabel.click();
      
      // Wait a bit for animation and state update
      await page.waitForTimeout(300);
      
      // Should now be checked
      await expect(checkbox).toBeChecked();
      
      // Click again to toggle back
      await toggleLabel.click();
      await page.waitForTimeout(300);
      
      // Should be unchecked again
      await expect(checkbox).not.toBeChecked();
    });

    test('should not toggle when disabled', async ({ page }) => {
      const basicSection = page.locator('section').filter({ hasText: 'Basic Toggle Switches' }).first();
      const disabledToggle = basicSection.locator('toggle-switch[name="basic-disabled"]');
      const checkbox = disabledToggle.locator('input[type="checkbox"]');
      const toggleLabel = disabledToggle.locator('label.toggle-switch-label');
      
      // Initially unchecked and disabled
      await expect(checkbox).not.toBeChecked();
      await expect(checkbox).toBeDisabled();
      
      // Try to click (should not work)
      await toggleLabel.click({ force: true });
      await page.waitForTimeout(300);
      
      // Should still be unchecked
      await expect(checkbox).not.toBeChecked();
    });

    test('should emit toggle:changed event', async ({ page }) => {
      // Set up event listener before interaction
      await page.evaluate(() => {
        window.toggleEvents = [];
        document.addEventListener('toggle:changed', (event) => {
          window.toggleEvents.push({
            name: event.detail.name,
            checked: event.detail.checked,
            value: event.detail.value
          });
        });
      });
      
      const basicSection = page.locator('section').filter({ hasText: 'Basic Toggle Switches' }).first();
      const uncheckedToggle = basicSection.locator('toggle-switch[name="basic-off"]');
      const toggleLabel = uncheckedToggle.locator('label.toggle-switch-label');
      
      // Click to toggle
      await toggleLabel.click();
      await page.waitForTimeout(300);
      
      // Check that event was fired
      const events = await page.evaluate(() => window.toggleEvents);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].name).toBe('basic-off');
      expect(events[0].checked).toBe(true);
    });

    test('should update event log in interactive demo', async ({ page }) => {
      const interactiveSection = page.locator('section').filter({ hasText: 'Interactive Demo' }).first();
      
      // Scroll to the section
      await interactiveSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      const demo1Toggle = interactiveSection.locator('toggle-switch#demo-toggle-1');
      const eventLog = page.locator('#event-log');
      
      // Count initial entries
      const initialCount = await eventLog.locator('div.text-xs').count();
      
      // Click the checkbox directly (more reliable than clicking label)
      const checkbox = demo1Toggle.locator('input[type="checkbox"]');
      await checkbox.click({ force: true });
      
      // Wait for event to be processed
      await page.waitForTimeout(1000);
      
      // Count new entries
      const newCount = await eventLog.locator('div.text-xs').count();
      
      // Verify new entry was added
      expect(newCount).toBeGreaterThan(initialCount);
    });

    test('should clear event log when clear button is clicked', async ({ page }) => {
      const interactiveSection = page.locator('section').filter({ hasText: 'Interactive Demo' }).first();
      const demo1Toggle = interactiveSection.locator('toggle-switch#demo-toggle-1');
      const toggleLabel = demo1Toggle.locator('label.toggle-switch-label');
      const eventLog = page.locator('#event-log');
      const clearButton = page.locator('#clear-log');
      
      // Add some events
      await toggleLabel.click();
      await page.waitForTimeout(300);
      await toggleLabel.click();
      await page.waitForTimeout(300);
      
      // Verify log has entries
      const entriesBeforeClear = await eventLog.locator('div').count();
      expect(entriesBeforeClear).toBeGreaterThan(0);
      
      // Click clear button
      await clearButton.click();
      await page.waitForTimeout(200);
      
      // Verify log is empty
      const entriesAfterClear = await eventLog.locator('div').count();
      expect(entriesAfterClear).toBe(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      const basicSection = page.locator('section').filter({ hasText: 'Basic Toggle Switches' }).first();
      
      // Check unchecked toggle
      const uncheckedToggle = basicSection.locator('toggle-switch[name="basic-off"]');
      const uncheckedCheckbox = uncheckedToggle.locator('input[type="checkbox"]');
      
      await expect(uncheckedCheckbox).toHaveAttribute('role', 'switch');
      await expect(uncheckedCheckbox).toHaveAttribute('aria-checked', 'false');
      
      // Check checked toggle
      const checkedToggle = basicSection.locator('toggle-switch[name="basic-on"]');
      const checkedCheckbox = checkedToggle.locator('input[type="checkbox"]');
      
      await expect(checkedCheckbox).toHaveAttribute('role', 'switch');
      await expect(checkedCheckbox).toHaveAttribute('aria-checked', 'true');
    });

    test('should update aria-checked when toggled', async ({ page }) => {
      const basicSection = page.locator('section').filter({ hasText: 'Basic Toggle Switches' }).first();
      const uncheckedToggle = basicSection.locator('toggle-switch[name="basic-off"]');
      const checkbox = uncheckedToggle.locator('input[type="checkbox"]');
      const toggleLabel = uncheckedToggle.locator('label.toggle-switch-label');
      
      // Initially aria-checked should be false
      await expect(checkbox).toHaveAttribute('aria-checked', 'false');
      
      // Click to toggle
      await toggleLabel.click();
      await page.waitForTimeout(300);
      
      // aria-checked should now be true
      await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    test('should have aria-label when label attribute is provided', async ({ page }) => {
      const labelsSection = page.locator('section').filter({ hasText: 'Toggle Switches with Labels' }).first();
      const notificationsToggle = labelsSection.locator('toggle-switch[name="notifications"]');
      const checkbox = notificationsToggle.locator('input[type="checkbox"]');
      
      await expect(checkbox).toHaveAttribute('aria-label', 'Email Notifications');
    });
  });

  test.describe('JavaScript Console', () => {
    test('should not have JavaScript console errors', async ({ page }) => {
      const consoleErrors = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Interact with various toggles
      const basicSection = page.locator('section').filter({ hasText: 'Basic Toggle Switches' }).first();
      const toggle = basicSection.locator('toggle-switch[name="basic-off"]');
      const toggleLabel = toggle.locator('label.toggle-switch-label');
      
      await toggleLabel.click();
      await page.waitForTimeout(500);
      
      // Check for console errors
      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Component Builder Integration', () => {
    test('should render component builder section', async ({ page }) => {
      const builderSection = page.locator('#toggle-switch-component-builder');
      await expect(builderSection).toBeVisible();
      
      // Check for builder elements (assuming ComponentBuilder creates specific structure)
      const builderHeading = page.locator('text=Toggle Switch Component Builder');
      await expect(builderHeading).toBeVisible();
    });
  });

  test.describe('Form Integration', () => {
    test('should have correct form field name and value', async ({ page }) => {
      const basicSection = page.locator('section').filter({ hasText: 'Basic Toggle Switches' }).first();
      const checkedToggle = basicSection.locator('toggle-switch[name="basic-on"]');
      const checkbox = checkedToggle.locator('input[type="checkbox"]');
      
      // Check name attribute
      await expect(checkbox).toHaveAttribute('name', 'basic-on');
      
      // Check value attribute (default should be 'true')
      const value = await checkbox.getAttribute('value');
      expect(value).toBeTruthy();
    });

    test('should update checkbox state for form submission', async ({ page }) => {
      const basicSection = page.locator('section').filter({ hasText: 'Basic Toggle Switches' }).first();
      const uncheckedToggle = basicSection.locator('toggle-switch[name="basic-off"]');
      const checkbox = uncheckedToggle.locator('input[type="checkbox"]');
      const toggleLabel = uncheckedToggle.locator('label.toggle-switch-label');
      
      // Initially unchecked
      const initialChecked = await checkbox.isChecked();
      expect(initialChecked).toBe(false);
      
      // Toggle on
      await toggleLabel.click();
      await page.waitForTimeout(300);
      
      // Should be checked for form submission
      const afterToggleChecked = await checkbox.isChecked();
      expect(afterToggleChecked).toBe(true);
    });
  });
});


import { test, expect } from '@playwright/test';

test.describe('Select Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/select-showcase.html');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for custom elements to upgrade (important for web components)
    await page.waitForTimeout(1500);
  });

  test('should render select components without "no content" messages', async ({ page }) => {
    // Check that no "no content" or similar error messages appear
    const noContentText = await page.locator('text=/no content|not found|error/i').count();
    expect(noContentText).toBe(0);

    // Verify select components are present
    const selectComponents = await page.locator('dry-select').count();
    expect(selectComponents).toBeGreaterThan(0);
  });

  test('should render basic select with correct initial state', async ({ page }) => {
    // Find the first basic select (fruit selector)
    const select = page.locator('dry-select[name="fruit"]').first();
    await expect(select).toBeVisible();

    // Check placeholder is shown
    const trigger = select.locator('button');
    await expect(trigger).toContainText('Select a fruit...');

    // Dropdown should be hidden initially
    const dropdown = select.locator('.absolute.z-50');
    await expect(dropdown).toHaveClass(/hidden/);
  });

  test('should open dropdown when trigger is clicked', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button[type="button"]').first();
    const dropdown = select.locator('.absolute.z-50');

    // Initially closed - check classList
    const hasHiddenInitially = await dropdown.evaluate(el => el.classList.contains('hidden'));
    expect(hasHiddenInitially).toBe(true);

    // Click to open
    await trigger.click();
    await page.waitForTimeout(300);

    // Should be open now (hidden class removed)
    const hasHiddenAfterClick = await dropdown.evaluate(el => el.classList.contains('hidden'));
    expect(hasHiddenAfterClick).toBe(false);

    // Dropdown should be visible
    await expect(dropdown).toBeVisible();

    // Should show options
    const options = dropdown.locator('[data-value]');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);
  });

  test('should select an option in single-select mode', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button');

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(200);

    // Click an option (e.g., "Banana")
    const dropdown = select.locator('.absolute.z-50');
    const bananaOption = dropdown.locator('[data-value="banana"]');
    await bananaOption.click();
    await page.waitForTimeout(200);

    // Dropdown should close
    await expect(dropdown).toHaveClass(/hidden/);

    // Trigger should show selected value
    await expect(trigger).toContainText('Banana');
  });

  test('should handle search functionality', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button');

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(200);

    const dropdown = select.locator('.absolute.z-50');
    const searchInput = dropdown.locator('input[type="text"]');

    // Type search term
    await searchInput.fill('ap');
    await page.waitForTimeout(200);

    // Should filter options
    const visibleOptions = dropdown.locator('[data-value]');
    const optionTexts = await visibleOptions.allTextContents();
    
    // Should only show options containing "ap" (Apple, Grape)
    expect(optionTexts.some(text => text.includes('Apple'))).toBe(true);
    expect(optionTexts.some(text => text.includes('Banana'))).toBe(false);
  });

  test('should handle multi-select mode', async ({ page }) => {
    const select = page.locator('dry-select[name="languages"]').first();
    const trigger = select.locator('button[type="button"]').first();

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(300);

    const dropdown = select.locator('.absolute.z-50');

    // Select multiple options using direct component API
    await page.evaluate(() => {
      const selectEl = document.querySelector('dry-select[name="languages"]');
      // Use the component's internal method to toggle values
      selectEl._toggleValue('javascript');
      selectEl._toggleValue('python');
    });
    await page.waitForTimeout(300);

    // Should show tags for selected items
    const tags = select.locator('span.bg-blue-100');
    expect(await tags.count()).toBeGreaterThanOrEqual(2);

    await expect(select).toContainText('JavaScript');
    await expect(select).toContainText('Python');
    
    // Verify the values are selected
    const selectedValues = await page.evaluate(() => {
      const selectEl = document.querySelector('dry-select[name="languages"]');
      return selectEl.getValue();
    });
    expect(selectedValues).toContain('javascript');
    expect(selectedValues).toContain('python');
  });

  test('should remove tag when X button is clicked', async ({ page }) => {
    const select = page.locator('dry-select[name="languages"]').first();
    const trigger = select.locator('button[type="button"]').first();

    // Open and select options
    await trigger.click();
    await page.waitForTimeout(300);

    const dropdown = select.locator('.absolute.z-50');
    await dropdown.locator('[data-value="javascript"]').click({ force: true });
    await page.waitForTimeout(200);

    // Should have one tag in the trigger
    let tags = trigger.locator('span.bg-blue-100');
    expect(await tags.count()).toBe(1);

    // Click remove button on tag
    const removeBtn = tags.first().locator('button');
    await removeBtn.click();
    await page.waitForTimeout(200);

    // Tag should be removed
    tags = trigger.locator('span.bg-blue-100');
    expect(await tags.count()).toBe(0);
  });

  test('should handle pre-selected options', async ({ page }) => {
    // Find the colors select which has pre-selected options
    const select = page.locator('dry-select[name="colors"]').first();
    const trigger = select.locator('button[type="button"]').first();

    // Should show pre-selected tags (Blue and Green)
    await expect(select).toContainText('Blue');
    await expect(select).toContainText('Green');

    // Count tags only in the trigger button
    const tags = trigger.locator('span.bg-blue-100');
    expect(await tags.count()).toBe(2);
  });

  test('should select all options when "Select All" is clicked', async ({ page }) => {
    const select = page.locator('dry-select[name="languages"]').first();
    const trigger = select.locator('button[type="button"]').first();

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(200);

    const dropdown = select.locator('.absolute.z-50');

    // Click "Select All" button
    const selectAllBtn = dropdown.locator('button:has-text("Select All")');
    await selectAllBtn.click();
    await page.waitForTimeout(300);

    // Should have tags for all options
    const tags = select.locator('.bg-blue-100');
    const tagCount = await tags.count();
    expect(tagCount).toBeGreaterThan(5); // Should have many tags
  });

  test('should clear all selections when "Clear" is clicked', async ({ page }) => {
    const select = page.locator('dry-select[name="colors"]').first();
    const trigger = select.locator('button[type="button"]').first();

    // Has pre-selected options
    let tags = select.locator('.bg-blue-100');
    expect(await tags.count()).toBeGreaterThan(0);

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(200);

    const dropdown = select.locator('.absolute.z-50');

    // Click "Clear" button
    const clearBtn = dropdown.locator('button:has-text("Clear")');
    await clearBtn.click();
    await page.waitForTimeout(200);

    // Should have no tags
    tags = select.locator('.bg-blue-100');
    expect(await tags.count()).toBe(0);

    // Should show placeholder
    await expect(select).toContainText('Choose colors...');
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button[type="button"]').first();

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(300);

    const dropdown = select.locator('.absolute.z-50');
    let hasHidden = await dropdown.evaluate(el => el.classList.contains('hidden'));
    expect(hasHidden).toBe(false);

    // Click outside
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);

    // Dropdown should close
    hasHidden = await dropdown.evaluate(el => el.classList.contains('hidden'));
    expect(hasHidden).toBe(true);
  });

  test('should not open when disabled', async ({ page }) => {
    // First, we need to add a disabled select to the page
    await page.evaluate(() => {
      const select = document.createElement('dry-select');
      select.setAttribute('name', 'test-disabled');
      select.setAttribute('disabled', '');
      select.setAttribute('placeholder', 'Disabled select');
      select.innerHTML = `
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      `;
      document.body.appendChild(select);
    });

    await page.waitForTimeout(1500);

    const select = page.locator('dry-select[name="test-disabled"]');
    const trigger = select.locator('button');

    // Button should be disabled
    await expect(trigger).toBeDisabled();

    // Try to click (should not open)
    await trigger.click({ force: true });
    await page.waitForTimeout(200);

    const dropdown = select.locator('.absolute.z-50');
    await expect(dropdown).toHaveClass(/hidden/);
  });

  test('should show "No results found" when search has no matches', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button');

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(200);

    const dropdown = select.locator('.absolute.z-50');
    const searchInput = dropdown.locator('input[type="text"]');

    // Type search term with no matches
    await searchInput.fill('xyz123');
    await page.waitForTimeout(200);

    // Should show "No results found"
    await expect(dropdown).toContainText('No results found');
  });

  test('should emit change event when selection changes', async ({ page }) => {
    // Set up event listener
    await page.evaluate(() => {
      window.selectChangeEvents = [];
      const select = document.querySelector('dry-select[name="fruit"]');
      select.addEventListener('change', (e) => {
        window.selectChangeEvents.push(e.detail);
      });
    });

    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button');

    // Open and select option
    await trigger.click();
    await page.waitForTimeout(200);

    const dropdown = select.locator('.absolute.z-50');
    await dropdown.locator('[data-value="apple"]').click();
    await page.waitForTimeout(200);

    // Check event was emitted
    const events = await page.evaluate(() => window.selectChangeEvents);
    expect(events.length).toBe(1);
    expect(events[0].value).toBe('apple');
  });

  test('should have no JavaScript console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Interact with various select components
    const select1 = page.locator('dry-select[name="fruit"]').first();
    await select1.locator('button[type="button"]').first().click();
    await page.waitForTimeout(200);
    await select1.locator('[data-value="apple"]').click();
    await page.waitForTimeout(200);

    const select2 = page.locator('dry-select[name="languages"]').first();
    await select2.locator('button[type="button"]').first().click();
    await page.waitForTimeout(200);
    await select2.locator('[data-value="python"]').click();
    await page.waitForTimeout(200);

    expect(errors).toEqual([]);
  });

  test('should render component builder section', async ({ page }) => {
    const builderSection = page.locator('#select-component-builder');
    await expect(builderSection).toBeVisible();

    // Should have title
    await expect(page.locator('text=/Select Component Builder/i')).toBeVisible();
  });

  test('should handle programmatic setValue API', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    
    // Set value programmatically
    await page.evaluate(() => {
      const selectElement = document.querySelector('dry-select[name="fruit"]');
      selectElement.setValue('cherry');
    });

    await page.waitForTimeout(200);

    // Should show selected value
    const trigger = select.locator('button');
    await expect(trigger).toContainText('Cherry');
  });

  test('should handle programmatic getValue API', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button');

    // Select a value
    await trigger.click();
    await page.waitForTimeout(200);
    await select.locator('[data-value="banana"]').click();
    await page.waitForTimeout(200);

    // Get value programmatically
    const value = await page.evaluate(() => {
      const selectElement = document.querySelector('dry-select[name="fruit"]');
      return selectElement.getValue();
    });

    expect(value).toBe('banana');
  });

  test('should handle programmatic clear API', async ({ page }) => {
    const select = page.locator('dry-select[name="colors"]').first();
    const trigger = select.locator('button');

    // Has pre-selected options
    let tags = trigger.locator('.bg-blue-100');
    expect(await tags.count()).toBeGreaterThan(0);

    // Clear programmatically
    await page.evaluate(() => {
      const selectElement = document.querySelector('dry-select[name="colors"]');
      selectElement.clear();
    });

    await page.waitForTimeout(200);

    // Should have no tags
    tags = trigger.locator('.bg-blue-100');
    expect(await tags.count()).toBe(0);
  });

  test('should handle programmatic selectAll API', async ({ page }) => {
    const select = page.locator('dry-select[name="languages"]').first();
    const trigger = select.locator('button');

    // Select all programmatically
    await page.evaluate(() => {
      const selectElement = document.querySelector('dry-select[name="languages"]');
      selectElement.selectAll();
    });

    await page.waitForTimeout(200);

    // Should have many tags
    const tags = trigger.locator('.bg-blue-100');
    const tagCount = await tags.count();
    expect(tagCount).toBeGreaterThan(5);
  });

  test('should handle dynamic option updates', async ({ page }) => {
    // Create a new select with options immediately
    await page.evaluate(() => {
      const select = document.createElement('dry-select');
      select.setAttribute('name', 'dynamic-test');
      select.setAttribute('placeholder', 'Dynamic select');
      select.innerHTML = `
        <option value="opt1">Option 1</option>
        <option value="opt2">Option 2</option>
        <option value="opt3">Option 3</option>
      `;
      document.body.appendChild(select);
    });

    // Wait for component to render
    await page.waitForTimeout(2000);

    const select = page.locator('dry-select[name="dynamic-test"]');
    
    // Verify component rendered
    const hasRendered = await select.evaluate(el => el.hasAttribute('data-rendered'));
    expect(hasRendered).toBe(true);
    
    const trigger = select.locator('button[type="button"]').first();

    // Should be able to open and select
    await trigger.click();
    await page.waitForTimeout(300);

    const dropdown = select.locator('.absolute.z-50');
    const hasHidden = await dropdown.evaluate(el => el.classList.contains('hidden'));
    expect(hasHidden).toBe(false);

    const options = dropdown.locator('[data-value]');
    expect(await options.count()).toBe(3);
  });

  test('should display selected option with checkmark', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button');

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(200);

    const dropdown = select.locator('.absolute.z-50');

    // Select an option
    await dropdown.locator('[data-value="apple"]').click();
    await page.waitForTimeout(200);

    // Re-open dropdown
    await trigger.click();
    await page.waitForTimeout(200);

    // Apple option should have checkmark and be highlighted
    const appleOption = dropdown.locator('[data-value="apple"]');
    await expect(appleOption).toHaveClass(/bg-blue-100/);
    await expect(appleOption).toContainText('✓');
  });

  test('should focus search input when dropdown opens', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button');

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(300);

    // Search input should be focused
    const searchInput = select.locator('input[type="text"]');
    await expect(searchInput).toBeFocused();
  });

  test('should reset search when dropdown closes', async ({ page }) => {
    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button');

    // Open dropdown
    await trigger.click();
    await page.waitForTimeout(200);

    const dropdown = select.locator('.absolute.z-50');
    const searchInput = dropdown.locator('input[type="text"]');

    // Type search term
    await searchInput.fill('apple');
    await page.waitForTimeout(200);

    // Close dropdown by selecting
    await dropdown.locator('[data-value="apple"]').click();
    await page.waitForTimeout(200);

    // Re-open dropdown
    await trigger.click();
    await page.waitForTimeout(200);

    // Search should be cleared and all options visible
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('');

    const options = dropdown.locator('[data-value]');
    expect(await options.count()).toBeGreaterThan(1);
  });
});

test.describe('Select stacking', () => {
  test('should portal dropdown to body with fixed position when open', async ({ page }) => {
    await page.goto('http://localhost:3000/examples/select-showcase.html');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => customElements.get('dry-select'));

    const select = page.locator('dry-select[name="fruit"]').first();
    const trigger = select.locator('button[type="button"]').first();

    await trigger.click();
    await page.waitForTimeout(200);

    const dropdownState = await page.evaluate(() => {
      const selectEl = document.querySelector('dry-select[name="fruit"]');
      const dropdown = selectEl?.querySelector('.absolute.z-50')
        || document.querySelector('body > .absolute.z-50');
      if (!dropdown) {
        return null;
      }

      return {
        parentTag: dropdown.parentElement?.tagName,
        position: dropdown.style.position,
        zIndex: dropdown.style.zIndex,
        isHidden: dropdown.classList.contains('hidden')
      };
    });

    expect(dropdownState).not.toBeNull();
    expect(dropdownState.parentTag).toBe('BODY');
    expect(dropdownState.position).toBe('fixed');
    expect(dropdownState.zIndex).toBe('100');
    expect(dropdownState.isHidden).toBe(false);

    await trigger.click();
    await page.waitForTimeout(200);

    const closedParent = await page.evaluate(() => {
      const selectEl = document.querySelector('dry-select[name="fruit"]');
      const dropdown = selectEl?.querySelector('.absolute.z-50');
      return dropdown?.parentElement?.className || null;
    });
    expect(closedParent).toContain('relative');
  });
});


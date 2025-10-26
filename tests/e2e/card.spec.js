import { test, expect } from '@playwright/test';

test.describe('Card Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/card-showcase.html');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for custom elements to upgrade
    await page.waitForTimeout(1500);
  });

  test('should render cards without "no content" messages', async ({ page }) => {
    // Check that no "no content" message appears
    const noContent = await page.locator('text=/no content/i').count();
    expect(noContent).toBe(0);

    // Verify cards are visible
    const cards = await page.locator('dry-card').count();
    expect(cards).toBeGreaterThan(0);
  });

  test('should load with correct initial state', async ({ page }) => {
    // Check basic examples section cards
    const simpleCard = page.locator('dry-card').first();
    await expect(simpleCard).toBeVisible();

    // Verify card has rendered content
    const cardContainer = simpleCard.locator('.card-container');
    await expect(cardContainer).toBeVisible();
  });

  test('should display basic card structure', async ({ page }) => {
    // Find a card with header, body, and footer
    const completeCard = page.locator('dry-card').nth(2);
    await expect(completeCard).toBeVisible();

    // Check for header
    const header = completeCard.locator('.card-header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Complete Card');

    // Check for body
    const body = completeCard.locator('.card-body');
    await expect(body).toBeVisible();

    // Check for footer
    const footer = completeCard.locator('.card-footer');
    await expect(footer).toBeVisible();
  });

  test('should display different variants correctly', async ({ page }) => {
    // Navigate to variants section
    const variantsSection = page.locator('section').filter({ hasText: 'Variants' });
    await expect(variantsSection).toBeVisible();

    // Check filled variant
    const filledCard = variantsSection.locator('dry-card[variant="filled"]');
    await expect(filledCard).toBeVisible();
    const filledContainer = filledCard.locator('.card-container');
    await expect(filledContainer).toHaveClass(/bg-white/);

    // Check outlined variant
    const outlinedCard = variantsSection.locator('dry-card[variant="outlined"]');
    await expect(outlinedCard).toBeVisible();
    const outlinedContainer = outlinedCard.locator('.card-container');
    await expect(outlinedContainer).toHaveClass(/border/);

    // Check elevated variant
    const elevatedCard = variantsSection.locator('dry-card[variant="elevated"]');
    await expect(elevatedCard).toBeVisible();
    const elevatedContainer = elevatedCard.locator('.card-container');
    await expect(elevatedContainer).toHaveClass(/shadow-xl/);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const card = page.locator('dry-card').first();
    const cardContainer = card.locator('.card-container');
    
    // Check for role attribute
    await expect(cardContainer).toHaveAttribute('role', 'article');
  });

  test('should have no JavaScript console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate and wait for page to load
    await page.goto('/examples/card-showcase.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check for errors
    expect(errors.length).toBe(0);
  });

  test('should handle variant changes in interactive demo', async ({ page }) => {
    const interactiveCard = page.locator('#interactive-card');
    const variantSelect = page.locator('#variant-select');

    // Wait for elements to be ready
    await expect(interactiveCard).toBeVisible();
    await expect(variantSelect).toBeVisible();

    // Change to outlined variant
    await variantSelect.selectOption('outlined');
    await page.waitForTimeout(500);

    // Check that variant changed
    await expect(interactiveCard).toHaveAttribute('variant', 'outlined');
    const container = interactiveCard.locator('.card-container');
    await expect(container).toHaveClass(/border/);

    // Change to elevated variant
    await variantSelect.selectOption('elevated');
    await page.waitForTimeout(500);

    await expect(interactiveCard).toHaveAttribute('variant', 'elevated');
    await expect(container).toHaveClass(/shadow-xl/);
  });

  test('should handle elevation changes in interactive demo', async ({ page }) => {
    const interactiveCard = page.locator('#interactive-card');
    const elevationSelect = page.locator('#elevation-select');
    const container = interactiveCard.locator('.card-container');

    await expect(interactiveCard).toBeVisible();
    await expect(elevationSelect).toBeVisible();

    // Change to small elevation
    await elevationSelect.selectOption('sm');
    await page.waitForTimeout(500);

    await expect(interactiveCard).toHaveAttribute('elevation', 'sm');
    await expect(container).toHaveClass(/shadow-sm/);

    // Change to large elevation
    await elevationSelect.selectOption('lg');
    await page.waitForTimeout(500);

    await expect(interactiveCard).toHaveAttribute('elevation', 'lg');
    await expect(container).toHaveClass(/shadow-lg/);

    // Change to none
    await elevationSelect.selectOption('none');
    await page.waitForTimeout(500);

    await expect(interactiveCard).toHaveAttribute('elevation', 'none');
  });

  test('should handle orientation changes in interactive demo', async ({ page }) => {
    const interactiveCard = page.locator('#interactive-card');
    const orientationSelect = page.locator('#orientation-select');
    const container = interactiveCard.locator('.card-container');

    await expect(interactiveCard).toBeVisible();
    await expect(orientationSelect).toBeVisible();

    // Initial state should be vertical
    await expect(interactiveCard).toHaveAttribute('orientation', 'vertical');

    // Change to horizontal
    await orientationSelect.selectOption('horizontal');
    await page.waitForTimeout(500);

    await expect(interactiveCard).toHaveAttribute('orientation', 'horizontal');
    await expect(container).toHaveClass(/flex/);

    // Change back to vertical
    await orientationSelect.selectOption('vertical');
    await page.waitForTimeout(500);

    await expect(interactiveCard).toHaveAttribute('orientation', 'vertical');
  });

  test('should toggle interactive state', async ({ page }) => {
    const interactiveCard = page.locator('#interactive-card');
    const interactiveCheckbox = page.locator('#interactive-checkbox');
    const container = interactiveCard.locator('.card-container');

    await expect(interactiveCard).toBeVisible();
    await expect(interactiveCheckbox).toBeVisible();

    // Should be checked initially
    await expect(interactiveCheckbox).toBeChecked();
    await expect(container).toHaveClass(/cursor-pointer/);

    // Uncheck interactive
    await interactiveCheckbox.uncheck();
    await page.waitForTimeout(500);

    await expect(interactiveCard).not.toHaveAttribute('interactive');

    // Check interactive again
    await interactiveCheckbox.check();
    await page.waitForTimeout(500);

    await expect(interactiveCard).toHaveAttribute('interactive');
    await expect(container).toHaveClass(/cursor-pointer/);
  });

  test('should toggle bordered state', async ({ page }) => {
    const interactiveCard = page.locator('#interactive-card');
    const borderedCheckbox = page.locator('#bordered-checkbox');
    const container = interactiveCard.locator('.card-container');

    await expect(interactiveCard).toBeVisible();
    await expect(borderedCheckbox).toBeVisible();

    // Should not be checked initially
    await expect(borderedCheckbox).not.toBeChecked();

    // Check bordered
    await borderedCheckbox.check();
    await page.waitForTimeout(500);

    await expect(interactiveCard).toHaveAttribute('bordered');
    await expect(container).toHaveClass(/border/);

    // Uncheck bordered
    await borderedCheckbox.uncheck();
    await page.waitForTimeout(500);

    await expect(interactiveCard).not.toHaveAttribute('bordered');
  });

  test('should fire card:click event when interactive card is clicked', async ({ page }) => {
    const interactiveCard = page.locator('#interactive-card');
    
    await expect(interactiveCard).toBeVisible();

    // Set up event listener
    const eventFired = await page.evaluate(() => {
      return new Promise((resolve) => {
        const card = document.getElementById('interactive-card');
        let fired = false;
        
        card.addEventListener('card:click', (e) => {
          fired = true;
        });
        
        card.querySelector('.card-container').click();
        
        setTimeout(() => resolve(fired), 100);
      });
    });

    expect(eventFired).toBe(true);
  });

  test('should update code example when properties change', async ({ page }) => {
    const variantSelect = page.locator('#variant-select');
    const interactiveCode = page.locator('#interactive-code');

    await expect(variantSelect).toBeVisible();
    await expect(interactiveCode).toBeVisible();

    // Change variant
    await variantSelect.selectOption('outlined');
    await page.waitForTimeout(500);

    // Check that code was updated
    const codeText = await interactiveCode.textContent();
    expect(codeText).toContain('variant="outlined"');
  });

  test('should display component builder section', async ({ page }) => {
    const componentBuilder = page.locator('#card-component-builder');
    await expect(componentBuilder).toBeVisible();

    // Check that it has content
    const builderContent = await componentBuilder.textContent();
    expect(builderContent.length).toBeGreaterThan(0);
  });

  test('should handle all variant changes in component builder', async ({ page }) => {
    // Wait for component builder to load
    await page.waitForTimeout(2000);

    const builderSection = page.locator('#card-component-builder');
    await expect(builderSection).toBeVisible();

    // Find the preview card in the component builder
    const previewCard = builderSection.locator('dry-card').first();
    if (await previewCard.count() > 0) {
      await expect(previewCard).toBeVisible();
      
      // Find variant select in builder
      const variantSelect = builderSection.locator('select').first();
      if (await variantSelect.count() > 0) {
        await variantSelect.selectOption('outlined');
        await page.waitForTimeout(500);
        
        // Verify the change
        const container = previewCard.locator('.card-container');
        await expect(container).toHaveClass(/border/);
      }
    }
  });

  test('should render card with only body content', async ({ page }) => {
    // Find the "Body Only" card
    const bodyOnlyCard = page.locator('dry-card').nth(1);
    await expect(bodyOnlyCard).toBeVisible();

    const body = bodyOnlyCard.locator('.card-body');
    await expect(body).toBeVisible();
    await expect(body).toContainText('Body Only');

    const footer = bodyOnlyCard.locator('.card-footer');
    await expect(footer).toBeVisible();
  });

  test('should apply correct elevation classes', async ({ page }) => {
    const variantsSection = page.locator('section').filter({ hasText: 'Variants' });
    
    // Check filled card has shadow-md (default)
    const filledCard = variantsSection.locator('dry-card[variant="filled"]').first();
    const filledContainer = filledCard.locator('.card-container');
    await expect(filledContainer).toHaveClass(/shadow-md/);

    // Check elevated card has shadow-xl
    const elevatedCard = variantsSection.locator('dry-card[variant="elevated"]');
    const elevatedContainer = elevatedCard.locator('.card-container');
    await expect(elevatedContainer).toHaveClass(/shadow-xl/);
  });

  test('should handle rapid property changes without errors', async ({ page }) => {
    const interactiveCard = page.locator('#interactive-card');
    const variantSelect = page.locator('#variant-select');
    const elevationSelect = page.locator('#elevation-select');

    await expect(interactiveCard).toBeVisible();

    // Rapidly change properties
    await variantSelect.selectOption('outlined');
    await elevationSelect.selectOption('sm');
    await variantSelect.selectOption('elevated');
    await elevationSelect.selectOption('xl');
    await variantSelect.selectOption('filled');
    await elevationSelect.selectOption('lg');

    await page.waitForTimeout(500);

    // Card should still be visible and functional
    await expect(interactiveCard).toBeVisible();
    const container = interactiveCard.locator('.card-container');
    await expect(container).toBeVisible();
  });

  test('should maintain content integrity after re-rendering', async ({ page }) => {
    const interactiveCard = page.locator('#interactive-card');
    const variantSelect = page.locator('#variant-select');

    // Get initial content
    const initialContent = await interactiveCard.locator('.card-header').textContent();
    expect(initialContent).toContain('Interactive Card');

    // Change variant multiple times
    await variantSelect.selectOption('outlined');
    await page.waitForTimeout(300);
    await variantSelect.selectOption('elevated');
    await page.waitForTimeout(300);
    await variantSelect.selectOption('filled');
    await page.waitForTimeout(300);

    // Content should remain the same
    const finalContent = await interactiveCard.locator('.card-header').textContent();
    expect(finalContent).toContain('Interactive Card');
  });
});


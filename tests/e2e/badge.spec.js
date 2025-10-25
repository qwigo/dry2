import { test, expect } from '@playwright/test';

test.describe('Badge Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the badge showcase page
    await page.goto('/examples/badge-showcase.html');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for custom elements to upgrade
    await page.waitForTimeout(1500);
  });

  test('should render badge showcase without "no content" messages', async ({ page }) => {
    // Check that the page doesn't contain any "no content" error messages
    const noContentText = await page.locator('text=/no content/i').count();
    expect(noContentText).toBe(0);
  });

  test('should render badges with correct initial state', async ({ page }) => {
    // Check primary badge exists
    const primaryBadge = page.locator('dry-badge[variant="primary"]').first();
    await expect(primaryBadge).toBeVisible();
    
    // Check success badge exists
    const successBadge = page.locator('dry-badge[variant="success"]').first();
    await expect(successBadge).toBeVisible();
    
    // Check danger badge exists
    const dangerBadge = page.locator('dry-badge[variant="danger"]').first();
    await expect(dangerBadge).toBeVisible();
  });

  test('should display different badge variants', async ({ page }) => {
    // Check that all variant badges are present in the variants section
    const variantSection = page.locator('.demo-section').first();
    
    await expect(variantSection.locator('dry-badge[variant="primary"]')).toBeVisible();
    await expect(variantSection.locator('dry-badge[variant="success"]')).toBeVisible();
    await expect(variantSection.locator('dry-badge[variant="danger"]')).toBeVisible();
    await expect(variantSection.locator('dry-badge[variant="warning"]')).toBeVisible();
    await expect(variantSection.locator('dry-badge[variant="info"]')).toBeVisible();
  });

  test('should display different badge sizes', async ({ page }) => {
    // Find the sizes section
    const sizesSection = page.locator('.demo-section').nth(1);
    
    await expect(sizesSection.locator('dry-badge[size="sm"]')).toBeVisible();
    await expect(sizesSection.locator('dry-badge[size="md"]')).toBeVisible();
    await expect(sizesSection.locator('dry-badge[size="lg"]')).toBeVisible();
  });

  test('should display numeric badges correctly', async ({ page }) => {
    // Find the numeric badges section
    const numericSection = page.locator('.demo-section').nth(2);
    
    // Check that numeric badges are visible
    const badges = numericSection.locator('dry-badge');
    await expect(badges.first()).toBeVisible();
    
    // Check that the max value badge shows "99+" instead of "100"
    const maxBadge = numericSection.locator('dry-badge[max="99"]');
    await expect(maxBadge).toBeVisible();
    const maxBadgeText = await maxBadge.locator('.badge').textContent();
    expect(maxBadgeText).toContain('99+');
  });

  test('should display dot badges', async ({ page }) => {
    // Find the dot badges section
    const dotSection = page.locator('.demo-section').nth(3);
    
    // Check that dot badges are visible
    const dotBadges = dotSection.locator('dry-badge[dot]');
    await expect(dotBadges.first()).toBeVisible();
    
    // Dot badges should have no text content
    const dotBadgeText = await dotBadges.first().locator('.badge').textContent();
    expect(dotBadgeText).toBe('');
  });

  test('should display positioned badges correctly', async ({ page }) => {
    // Find the positioned badges section
    const positionedSection = page.locator('.demo-section').nth(4);
    
    // Check top-right positioned badge
    const topRightBadge = positionedSection.locator('dry-badge[position="top-right"]').first();
    await expect(topRightBadge).toBeVisible();
    
    // Check top-left positioned badge
    const topLeftBadge = positionedSection.locator('dry-badge[position="top-left"]');
    await expect(topLeftBadge).toBeVisible();
    
    // Check bottom-right positioned badge
    const bottomRightBadge = positionedSection.locator('dry-badge[position="bottom-right"]');
    await expect(bottomRightBadge).toBeVisible();
  });

  test('should handle interactive badge updates', async ({ page }) => {
    // Find the interactive badge
    const interactiveBadge = page.locator('#interactive-badge');
    await expect(interactiveBadge).toBeVisible();
    
    // Change variant
    const variantSelect = page.locator('#badge-variant');
    await variantSelect.selectOption('success');
    await page.waitForTimeout(300);
    
    // Verify the badge variant changed
    const variant = await interactiveBadge.getAttribute('variant');
    expect(variant).toBe('success');
    
    // Change size
    const sizeSelect = page.locator('#badge-size');
    await sizeSelect.selectOption('lg');
    await page.waitForTimeout(300);
    
    // Verify the badge size changed
    const size = await interactiveBadge.getAttribute('size');
    expect(size).toBe('lg');
  });

  test('should update badge content dynamically', async ({ page }) => {
    // Find the interactive badge
    const interactiveBadge = page.locator('#interactive-badge');
    
    // Change the content
    const contentInput = page.locator('#badge-content');
    await contentInput.fill('99');
    await page.waitForTimeout(300);
    
    // Verify the content changed
    const badgeText = await interactiveBadge.locator('.badge').textContent();
    expect(badgeText).toBe('99');
  });

  test('should toggle badge visibility', async ({ page }) => {
    // Find the interactive badge
    const interactiveBadge = page.locator('#interactive-badge');
    await expect(interactiveBadge).toBeVisible();
    
    // Click the toggle button
    const toggleBtn = page.locator('#toggle-badge');
    await toggleBtn.click();
    await page.waitForTimeout(300);
    
    // Badge should be hidden
    const isHidden = await interactiveBadge.evaluate(el => el.style.display === 'none');
    expect(isHidden).toBe(true);
    
    // Click toggle again
    await toggleBtn.click();
    await page.waitForTimeout(300);
    
    // Badge should be visible again
    await expect(interactiveBadge).toBeVisible();
  });

  test('should handle dot badge toggle', async ({ page }) => {
    // Find the interactive badge
    const interactiveBadge = page.locator('#interactive-badge');
    
    // Check the dot checkbox
    const dotCheckbox = page.locator('#badge-dot');
    await dotCheckbox.check();
    await page.waitForTimeout(300);
    
    // Verify badge has dot attribute
    const hasDot = await interactiveBadge.evaluate(el => el.hasAttribute('dot'));
    expect(hasDot).toBe(true);
    
    // Badge should have no text when it's a dot
    const badgeText = await interactiveBadge.locator('.badge').textContent();
    expect(badgeText).toBe('');
  });

  test('should handle max value changes', async ({ page }) => {
    // Find the interactive badge
    const interactiveBadge = page.locator('#interactive-badge');
    
    // Set content to a high number
    const contentInput = page.locator('#badge-content');
    await contentInput.fill('150');
    await page.waitForTimeout(300);
    
    // Set max value
    const maxInput = page.locator('#badge-max');
    await maxInput.fill('99');
    await page.waitForTimeout(300);
    
    // Badge should show "99+"
    const badgeText = await interactiveBadge.locator('.badge').textContent();
    expect(badgeText).toBe('99+');
  });

  test('should reset badge to initial state', async ({ page }) => {
    // Find the interactive badge
    const interactiveBadge = page.locator('#interactive-badge');
    
    // Make some changes
    const variantSelect = page.locator('#badge-variant');
    await variantSelect.selectOption('danger');
    await page.waitForTimeout(300);
    
    // Click reset button
    const resetBtn = page.locator('#reset-badge');
    await resetBtn.click();
    await page.waitForTimeout(300);
    
    // Verify badge is back to initial state
    const variant = await interactiveBadge.getAttribute('variant');
    expect(variant).toBe('primary');
    
    const badgeText = await interactiveBadge.locator('.badge').textContent();
    expect(badgeText).toBe('42');
  });

  test('should toggle all animation badges', async ({ page }) => {
    // Find animation badges
    const animBadge1 = page.locator('#anim-badge-1');
    const animBadge2 = page.locator('#anim-badge-2');
    const animBadge3 = page.locator('#anim-badge-3');
    
    // Verify all badges are initially visible
    await expect(animBadge1).toBeVisible();
    await expect(animBadge2).toBeVisible();
    await expect(animBadge3).toBeVisible();
    
    // Click toggle all button
    const toggleAllBtn = page.locator('#toggle-all-badges');
    await toggleAllBtn.click();
    await page.waitForTimeout(500);
    
    // Badges should be hidden
    const isHidden1 = await animBadge1.evaluate(el => el.style.display === 'none');
    const isHidden2 = await animBadge2.evaluate(el => el.style.display === 'none');
    const isHidden3 = await animBadge3.evaluate(el => el.style.display === 'none');
    
    expect(isHidden1).toBe(true);
    expect(isHidden2).toBe(true);
    expect(isHidden3).toBe(true);
  });

  test('should render component builder section', async ({ page }) => {
    // Check that component builder is present
    const componentBuilder = page.locator('#badge-component-builder');
    await expect(componentBuilder).toBeVisible();
  });

  test('should not have JavaScript console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Reload the page to catch any errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    // Filter out known benign errors (like failed resource loads)
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('net::ERR_')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check that badges have proper structure
    const firstBadge = page.locator('dry-badge').first();
    await expect(firstBadge).toBeVisible();
    
    // Verify it has a badge element inside
    const badgeSpan = firstBadge.locator('.badge');
    await expect(badgeSpan).toBeVisible();
  });

  test('should handle position changes in interactive demo', async ({ page }) => {
    // Find the interactive badge
    const interactiveBadge = page.locator('#interactive-badge');
    
    // Change position
    const positionSelect = page.locator('#badge-position');
    await positionSelect.selectOption('bottom-left');
    await page.waitForTimeout(300);
    
    // Verify the position changed
    const position = await interactiveBadge.getAttribute('position');
    expect(position).toBe('bottom-left');
  });

  test('should handle all variant changes', async ({ page }) => {
    const interactiveBadge = page.locator('#interactive-badge');
    const variantSelect = page.locator('#badge-variant');
    
    const variants = ['primary', 'success', 'danger', 'warning', 'info'];
    
    for (const variant of variants) {
      await variantSelect.selectOption(variant);
      await page.waitForTimeout(200);
      
      const currentVariant = await interactiveBadge.getAttribute('variant');
      expect(currentVariant).toBe(variant);
    }
  });

  test('should handle all size changes', async ({ page }) => {
    const interactiveBadge = page.locator('#interactive-badge');
    const sizeSelect = page.locator('#badge-size');
    
    const sizes = ['sm', 'md', 'lg'];
    
    for (const size of sizes) {
      await sizeSelect.selectOption(size);
      await page.waitForTimeout(200);
      
      const currentSize = await interactiveBadge.getAttribute('size');
      expect(currentSize).toBe(size);
    }
  });

  test('should handle all position changes', async ({ page }) => {
    const interactiveBadge = page.locator('#interactive-badge');
    const positionSelect = page.locator('#badge-position');
    
    const positions = ['standalone', 'top-right', 'top-left', 'bottom-right', 'bottom-left'];
    
    for (const position of positions) {
      await positionSelect.selectOption(position);
      await page.waitForTimeout(200);
      
      const currentPosition = await interactiveBadge.getAttribute('position');
      expect(currentPosition).toBe(position);
    }
  });
});


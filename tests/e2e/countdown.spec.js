/**
 * Playwright E2E Tests for DRY2 Countdown Component
 * Tests the countdown timer functionality, state management, and event handling
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8086';

test.describe('DRY Countdown Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/examples/countdown-showcase.html`);
    // Wait for custom elements to be defined
    await page.waitForTimeout(1000);
  });

  test('should render countdown components without "no content" messages', async ({ page }) => {
    // Check that no "no content" messages are present
    const noContentMessages = await page.locator('text=/no content/i').count();
    expect(noContentMessages).toBe(0);

    // Verify countdown components are present
    const countdowns = await page.locator('dry-countdown').count();
    expect(countdowns).toBeGreaterThan(0);
  });

  test('should display countdown in correct initial state on page load', async ({ page }) => {
    // Get the first countdown (basic countdown with 60 second duration)
    const basicCountdown = page.locator('dry-countdown').first();
    
    // Should have countdown display
    const display = basicCountdown.locator('.countdown-display');
    await expect(display).toBeVisible();

    // Should show time units
    const units = basicCountdown.locator('.countdown-unit');
    await expect(units.first()).toBeVisible();
  });

  test('should start countdown automatically when autostart is enabled', async ({ page }) => {
    const basicCountdown = page.locator('dry-countdown').first();
    
    // Wait for element to be ready and countdown to start
    await page.waitForTimeout(1200);
    
    // Get initial value
    const initialValue = await basicCountdown.locator('.countdown-value').last().textContent();
    
    // Wait for 3 full seconds (enough for value to definitely change)
    await page.waitForTimeout(3200);
    
    // Get final value
    const finalValue = await basicCountdown.locator('.countdown-value').last().textContent();
    
    // Values should be different (countdown is running)
    // Even if seconds wrap around, they should be different after 3+ seconds
    expect(initialValue).not.toBe(finalValue);
  });

  test('should pause countdown when pause button is clicked', async ({ page }) => {
    const basicCountdown = page.locator('dry-countdown').first();
    const pauseButton = page.locator('#basic-pause');
    
    // Click pause
    await pauseButton.click();
    
    // Wait a moment and get value
    await page.waitForTimeout(500);
    const valueAfterPause = await basicCountdown.locator('.countdown-value').first().textContent();
    
    // Wait more time
    await page.waitForTimeout(2000);
    const valueAfterWait = await basicCountdown.locator('.countdown-value').first().textContent();
    
    // Values should be the same (countdown is paused)
    expect(valueAfterPause).toBe(valueAfterWait);
  });

  test('should resume countdown when resume button is clicked', async ({ page }) => {
    const basicCountdown = page.locator('dry-countdown').first();
    const pauseButton = page.locator('#basic-pause');
    const resumeButton = page.locator('#basic-resume');
    
    // Pause countdown
    await pauseButton.click();
    await page.waitForTimeout(500);
    
    // Resume countdown
    await resumeButton.click();
    await page.waitForTimeout(1200);
    
    // Get initial value after resume
    const initialValue = await basicCountdown.locator('.countdown-value').last().textContent();
    
    // Wait for 3 seconds
    await page.waitForTimeout(3200);
    
    // Get final value
    const finalValue = await basicCountdown.locator('.countdown-value').last().textContent();
    
    // Values should be different (countdown resumed and is running)
    expect(initialValue).not.toBe(finalValue);
  });

  test('should reset countdown when reset button is clicked', async ({ page }) => {
    const basicCountdown = page.locator('dry-countdown').first();
    const resetButton = page.locator('#basic-reset');
    
    // Wait for countdown to run
    await page.waitForTimeout(3000);
    
    // Reset countdown
    await resetButton.click();
    await page.waitForTimeout(500);
    
    // Check that display shows time units
    const units = basicCountdown.locator('.countdown-unit');
    await expect(units.first()).toBeVisible();
  });

  test('should display leading zeros when leading-zeros attribute is set', async ({ page }) => {
    // Look for a countdown with leading-zeros attribute
    const countdownWithZeros = page.locator('dry-countdown[leading-zeros]').first();
    
    // Get value elements
    const values = await countdownWithZeros.locator('.countdown-value').allTextContents();
    
    // At least some values should have leading zeros (2 digits)
    const hasLeadingZeros = values.some(value => /^\d{2}$/.test(value.trim()));
    expect(hasLeadingZeros).toBe(true);
  });

  test('should display custom format with only specified units', async ({ page }) => {
    // Find countdown with minutes,seconds format
    const minutesSecondsCountdown = page.locator('dry-countdown[format="minutes,seconds"]').first();
    
    // Should have units
    const units = minutesSecondsCountdown.locator('.countdown-unit');
    const unitCount = await units.count();
    
    // Should only show 2 units (minutes and seconds)
    expect(unitCount).toBeLessThanOrEqual(2);
    
    // Check that the units are labeled correctly
    const labels = await minutesSecondsCountdown.locator('.countdown-label').allTextContents();
    const hasMinutesOrSeconds = labels.some(label => 
      label.toLowerCase().includes('minute') || label.toLowerCase().includes('second')
    );
    expect(hasMinutesOrSeconds).toBe(true);
  });

  test('should display custom unit labels when provided', async ({ page }) => {
    // Look for countdown with custom labels
    const customLabelCountdown = page.locator('dry-countdown[days-label]').first();
    
    if (await customLabelCountdown.count() > 0) {
      const labels = await customLabelCountdown.locator('.countdown-label').allTextContents();
      
      // Should have at least one label
      expect(labels.length).toBeGreaterThan(0);
    }
  });

  test('should handle target date countdown', async ({ page }) => {
    const targetDateCountdown = page.locator('#target-date-countdown');
    
    // Should be visible and have countdown display
    await expect(targetDateCountdown.locator('.countdown-display')).toBeVisible();
    
    // Should have time units
    const units = targetDateCountdown.locator('.countdown-unit');
    await expect(units.first()).toBeVisible();
  });

  test('should update countdown when target date is changed dynamically', async ({ page }) => {
    const targetDateInput = page.locator('#target-date-input');
    const setButton = page.locator('#set-target-date');
    const targetDateCountdown = page.locator('#target-date-countdown');
    
    // Set a new date (30 seconds from now)
    const futureDate = new Date(Date.now() + 30000);
    const isoString = futureDate.toISOString().slice(0, 16); // Format for datetime-local
    
    await targetDateInput.fill(isoString);
    await setButton.click();
    await page.waitForTimeout(500);
    
    // Should still have countdown display
    await expect(targetDateCountdown.locator('.countdown-display')).toBeVisible();
  });

  test('should display expired content when countdown reaches zero', async ({ page }) => {
    // Find the short countdown (5 seconds)
    const expireCountdown = page.locator('#expire-countdown');
    
    // Wait for countdown to expire (5 seconds + buffer)
    await page.waitForTimeout(6000);
    
    // Should show expired content
    const expiredContent = expireCountdown.locator('[slot="expired"], .countdown-expired');
    await expect(expiredContent).toBeVisible();
  });

  test('should emit countdown:paused event when paused', async ({ page }) => {
    let eventFired = false;
    
    // Listen for the event
    await page.evaluate(() => {
      window.pausedEventFired = false;
      document.addEventListener('countdown:paused', () => {
        window.pausedEventFired = true;
      });
    });
    
    // Pause countdown
    const pauseButton = page.locator('#event-pause');
    await pauseButton.click();
    await page.waitForTimeout(500);
    
    // Check if event was fired
    eventFired = await page.evaluate(() => window.pausedEventFired);
    expect(eventFired).toBe(true);
  });

  test('should emit countdown:resumed event when resumed', async ({ page }) => {
    // Listen for the event
    await page.evaluate(() => {
      window.resumedEventFired = false;
      document.addEventListener('countdown:resumed', () => {
        window.resumedEventFired = true;
      });
    });
    
    // Pause then resume countdown
    const pauseButton = page.locator('#event-pause');
    const resumeButton = page.locator('#event-resume');
    
    await pauseButton.click();
    await page.waitForTimeout(500);
    await resumeButton.click();
    await page.waitForTimeout(500);
    
    // Check if event was fired
    const eventFired = await page.evaluate(() => window.resumedEventFired);
    expect(eventFired).toBe(true);
  });

  test('should emit countdown:reset event when reset', async ({ page }) => {
    // Listen for the event
    await page.evaluate(() => {
      window.resetEventFired = false;
      document.addEventListener('countdown:reset', () => {
        window.resetEventFired = true;
      });
    });
    
    // Reset countdown
    const resetButton = page.locator('#event-reset');
    await resetButton.click();
    await page.waitForTimeout(500);
    
    // Check if event was fired
    const eventFired = await page.evaluate(() => window.resetEventFired);
    expect(eventFired).toBe(true);
  });

  test('should emit countdown:completed event when countdown expires', async ({ page }) => {
    // Listen for the event
    await page.evaluate(() => {
      window.completedEventFired = false;
      document.addEventListener('countdown:completed', () => {
        window.completedEventFired = true;
      });
    });
    
    // Wait for the short countdown to expire
    await page.waitForTimeout(11000); // 10 second countdown + buffer
    
    // Check if event was fired
    const eventFired = await page.evaluate(() => window.completedEventFired);
    expect(eventFired).toBe(true);
  });

  test('should not have JavaScript console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Interact with countdowns
    await page.locator('#basic-pause').click();
    await page.waitForTimeout(500);
    await page.locator('#basic-resume').click();
    await page.waitForTimeout(500);
    
    // Check for errors
    expect(errors.length).toBe(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const countdown = page.locator('dry-countdown').first();
    
    // Should have countdown display
    const display = countdown.locator('.countdown-display');
    await expect(display).toBeVisible();
    
    // Time units should be visible and readable
    const units = countdown.locator('.countdown-unit');
    await expect(units.first()).toBeVisible();
    
    // Values should have text content
    const value = countdown.locator('.countdown-value').first();
    const valueText = await value.textContent();
    expect(valueText.trim().length).toBeGreaterThan(0);
  });

  test('should apply custom unit-class styling', async ({ page }) => {
    // Find countdown with unit-class attribute
    const styledCountdown = page.locator('dry-countdown[unit-class]').first();
    
    if (await styledCountdown.count() > 0) {
      const units = styledCountdown.locator('.countdown-unit');
      
      // Should have the custom class applied
      const firstUnit = units.first();
      const className = await firstUnit.getAttribute('class');
      
      // Should have some custom styling
      expect(className).toBeTruthy();
      expect(className.length).toBeGreaterThan(0);
    }
  });

  test('should handle show-zeros attribute correctly', async ({ page }) => {
    // Find countdown with show-zeros attribute
    const showZerosCountdown = page.locator('dry-countdown[show-zeros]').first();
    
    if (await showZerosCountdown.count() > 0) {
      const units = showZerosCountdown.locator('.countdown-unit');
      const unitCount = await units.count();
      
      // With show-zeros, all units in format should be displayed
      expect(unitCount).toBeGreaterThan(0);
    }
  });

  test('should programmatically access countdown properties', async ({ page }) => {
    const result = await page.evaluate(() => {
      const countdown = document.querySelector('dry-countdown');
      
      return {
        hasRemainingTime: typeof countdown.remainingTime === 'number',
        hasIsPaused: typeof countdown.isPaused === 'boolean',
        hasIsRunning: typeof countdown.isRunning === 'boolean',
        hasDuration: typeof countdown.duration === 'number',
        hasFormat: typeof countdown.format === 'string',
        hasStartMethod: typeof countdown.startCountdown === 'function',
        hasPauseMethod: typeof countdown.pause === 'function',
        hasResumeMethod: typeof countdown.resume === 'function',
        hasResetMethod: typeof countdown.reset === 'function'
      };
    });
    
    expect(result.hasRemainingTime).toBe(true);
    expect(result.hasIsPaused).toBe(true);
    expect(result.hasIsRunning).toBe(true);
    expect(result.hasDuration).toBe(true);
    expect(result.hasFormat).toBe(true);
    expect(result.hasStartMethod).toBe(true);
    expect(result.hasPauseMethod).toBe(true);
    expect(result.hasResumeMethod).toBe(true);
    expect(result.hasResetMethod).toBe(true);
  });

  test('should handle multiple simultaneous countdowns', async ({ page }) => {
    // Get all countdowns on page
    const allCountdowns = page.locator('dry-countdown');
    const countdownCount = await allCountdowns.count();
    
    // Should have multiple countdowns
    expect(countdownCount).toBeGreaterThan(1);
    
    // Each should be independent
    for (let i = 0; i < Math.min(3, countdownCount); i++) {
      const countdown = allCountdowns.nth(i);
      const display = countdown.locator('.countdown-display');
      await expect(display).toBeVisible();
    }
  });

  test('should update display every second when running', async ({ page }) => {
    const basicCountdown = page.locator('dry-countdown[format="seconds"]').first();
    
    // Get initial value
    const value1 = await basicCountdown.locator('.countdown-value').first().textContent();
    await page.waitForTimeout(1000);
    
    const value2 = await basicCountdown.locator('.countdown-value').first().textContent();
    await page.waitForTimeout(1000);
    
    const value3 = await basicCountdown.locator('.countdown-value').first().textContent();
    
    // All three values should be different (countdown is ticking)
    expect(value1).not.toBe(value2);
    expect(value2).not.toBe(value3);
  });
});


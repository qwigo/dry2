import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for DRY2.css Components
 * Tests visual consistency of components styled with dry2.css across themes and breakpoints
 */

test.describe('DRY2.css Visual Regression', () => {
    // Test button component
    test.describe('Button Component', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('http://localhost:8086/test-button-dry2css-manual.html');
            await page.waitForTimeout(500);
        });

        test('should match snapshot in light theme', async ({ page }) => {
            // Remove dark mode class to ensure light theme
            await page.evaluate(() => {
                document.documentElement.classList.remove('dark');
            });
            await page.waitForTimeout(100);

            // Capture screenshot of page body
            await expect(page.locator('body')).toHaveScreenshot('button-light.png', {
                fullPage: true
            });
        });

        test('should match snapshot in dark theme', async ({ page }) => {
            // Add dark mode class
            await page.evaluate(() => {
                document.documentElement.classList.add('dark');
            });
            await page.waitForTimeout(100);

            // Capture screenshot of page body
            await expect(page.locator('body')).toHaveScreenshot('button-dark.png', {
                fullPage: true
            });
        });
    });

    // Test card component
    test.describe('Card Component', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('http://localhost:8086/test-card-dry2css-manual.html');
            await page.waitForTimeout(500);
        });

        test('should match snapshot in light theme', async ({ page }) => {
            await page.evaluate(() => {
                document.documentElement.classList.remove('dark');
            });
            await page.waitForTimeout(100);

            await expect(page.locator('body')).toHaveScreenshot('card-light.png', {
                fullPage: true
            });
        });

        test('should match snapshot in dark theme', async ({ page }) => {
            await page.evaluate(() => {
                document.documentElement.classList.add('dark');
            });
            await page.waitForTimeout(100);

            await expect(page.locator('body')).toHaveScreenshot('card-dark.png', {
                fullPage: true
            });
        });
    });

    // Test badge component
    test.describe('Badge Component', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('http://localhost:8086/test-badge-dry2css-manual.html');
            await page.waitForTimeout(500);
        });

        test('should match snapshot in light theme', async ({ page }) => {
            await page.evaluate(() => {
                document.documentElement.classList.remove('dark');
            });
            await page.waitForTimeout(100);

            await expect(page.locator('body')).toHaveScreenshot('badge-light.png', {
                fullPage: true
            });
        });

        test('should match snapshot in dark theme', async ({ page }) => {
            await page.evaluate(() => {
                document.documentElement.classList.add('dark');
            });
            await page.waitForTimeout(100);

            await expect(page.locator('body')).toHaveScreenshot('badge-dark.png', {
                fullPage: true
            });
        });
    });

    // Test responsive breakpoints
    test.describe('Responsive Breakpoints', () => {
        test('button should match snapshot on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('http://localhost:8086/test-button-dry2css-manual.html');
            await page.waitForTimeout(500);

            await expect(page.locator('body')).toHaveScreenshot('button-mobile.png', {
                fullPage: true
            });
        });

        test('button should match snapshot on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('http://localhost:8086/test-button-dry2css-manual.html');
            await page.waitForTimeout(500);

            await expect(page.locator('body')).toHaveScreenshot('button-tablet.png', {
                fullPage: true
            });
        });

        test('button should match snapshot on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('http://localhost:8086/test-button-dry2css-manual.html');
            await page.waitForTimeout(500);

            await expect(page.locator('body')).toHaveScreenshot('button-desktop.png', {
                fullPage: true
            });
        });
    });
});

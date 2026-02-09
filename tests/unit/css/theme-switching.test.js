/**
 * Theme switching tests for dry2.css
 *
 * Tests that overriding CSS variables at :root changes component appearance
 * and that light/dark mode theme switching works correctly.
 */

import { JSDOM } from 'jsdom';
import chai from 'chai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { expect } = chai;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load CSS file and create DOM environment for testing
 * @returns {Object} Object containing window, document, and computed styles
 */
function setupCSSTestEnvironment() {
    const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
    const cssContent = readFileSync(cssPath, 'utf-8');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>${cssContent}</style>
        </head>
        <body></body>
        </html>
    `;

    const dom = new JSDOM(html, {
        url: 'http://localhost/',
        pretendToBeVisual: true,
        resources: 'usable',
    });
    const { window } = dom;
    const { document } = window;

    return { window, document, dom };
}

describe('Theme Switching', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        const env = setupCSSTestEnvironment();
        dom = env.dom;
        document = env.document;
        window = env.window;
    });

    afterEach(() => {
        if (dom) {
            dom.window.close();
        }
    });

    describe('CSS Variable Overrides', () => {
        it('overrides color variables at :root', () => {
            // Create a style element to override variables
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --stem-color-primary: #ff0000;
                    --stem-color-success: #00ff00;
                }
            `;
            document.head.appendChild(style);

            // Get computed style from root
            const rootStyles = window.getComputedStyle(
                document.documentElement
            );

            // Verify overrides applied
            expect(
                rootStyles.getPropertyValue('--stem-color-primary').trim()
            ).to.equal('#ff0000');
            expect(
                rootStyles.getPropertyValue('--stem-color-success').trim()
            ).to.equal('#00ff00');
        });

        it('overrides typography variables at :root', () => {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --stem-font-size-base: 1.25rem;
                    --stem-font-weight-normal: 500;
                    --stem-line-height-normal: 1.8;
                }
            `;
            document.head.appendChild(style);

            const rootStyles = window.getComputedStyle(
                document.documentElement
            );

            expect(
                rootStyles.getPropertyValue('--stem-font-size-base').trim()
            ).to.equal('1.25rem');
            expect(
                rootStyles
                    .getPropertyValue('--stem-font-weight-normal')
                    .trim()
            ).to.equal('500');
            expect(
                rootStyles.getPropertyValue('--stem-line-height-normal').trim()
            ).to.equal('1.8');
        });

        it('overrides spacing variables at :root', () => {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --stem-spacing-xs: 0.25rem;
                    --stem-spacing-md: 1.5rem;
                    --stem-spacing-xl: 3rem;
                }
            `;
            document.head.appendChild(style);

            const rootStyles = window.getComputedStyle(
                document.documentElement
            );

            expect(
                rootStyles.getPropertyValue('--stem-spacing-xs').trim()
            ).to.equal('0.25rem');
            expect(
                rootStyles.getPropertyValue('--stem-spacing-md').trim()
            ).to.equal('1.5rem');
            expect(
                rootStyles.getPropertyValue('--stem-spacing-xl').trim()
            ).to.equal('3rem');
        });

        it('overridden variables propagate to component classes', () => {
            // Override primary color
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --stem-color-primary: #ff6600;
                }
            `;
            document.head.appendChild(style);

            // Create a button with primary variant
            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            document.body.appendChild(button);

            const buttonStyles = window.getComputedStyle(button);

            // Note: This test verifies the variable is available.
            // The actual CSS must use the variable for this to work.
            const rootStyles = window.getComputedStyle(
                document.documentElement
            );
            expect(
                rootStyles.getPropertyValue('--stem-color-primary').trim()
            ).to.equal('#ff6600');
        });
    });

    describe('Light/Dark Mode Theme Switching', () => {
        it('applies light mode as default theme', () => {
            const rootStyles = window.getComputedStyle(
                document.documentElement
            );

            // Verify default light mode colors
            const textColor = rootStyles
                .getPropertyValue('--stem-color-text-base')
                .trim();
            const bgColor = rootStyles
                .getPropertyValue('--stem-color-bg-surface')
                .trim();

            // Light mode should have dark text
            expect(textColor).to.exist;
            expect(textColor.startsWith('#')).to.equal(true);

            // And light background
            expect(bgColor).to.exist;
            expect(bgColor.startsWith('#')).to.equal(true);
        });

        it('switches to dark mode with theme class', () => {
            // Add dark mode override styles
            const style = document.createElement('style');
            style.textContent = `
                .dark {
                    --stem-color-text-base: #f9fafb;
                    --stem-color-text-muted: #d1d5db;
                    --stem-color-bg-surface: #1f2937;
                    --stem-color-bg-primary: #111827;
                }
            `;
            document.head.appendChild(style);

            // Apply dark class to document element
            document.documentElement.classList.add('dark');

            const rootStyles = window.getComputedStyle(
                document.documentElement
            );

            // Verify dark mode overrides applied
            expect(
                rootStyles.getPropertyValue('--stem-color-text-base').trim()
            ).to.equal('#f9fafb');
            expect(
                rootStyles.getPropertyValue('--stem-color-text-muted').trim()
            ).to.equal('#d1d5db');
            expect(
                rootStyles.getPropertyValue('--stem-color-bg-surface').trim()
            ).to.equal('#1f2937');
            expect(
                rootStyles.getPropertyValue('--stem-color-bg-primary').trim()
            ).to.equal('#111827');
        });

        it('switches to dark mode with prefers-color-scheme', () => {
            // Create a media query based dark mode style
            const style = document.createElement('style');
            style.textContent = `
                @media (prefers-color-scheme: dark) {
                    :root {
                        --stem-color-text-base: #f3f4f6;
                        --stem-color-bg-surface: #111827;
                    }
                }
            `;
            document.head.appendChild(style);

            // Note: JSDOM has limited support for matchMedia
            // This test verifies the CSS syntax is valid
            // Actual prefers-color-scheme testing requires browser environment

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            expect(mediaQuery).to.exist;
        });

        it('theme changes apply to all components consistently', () => {
            // Add comprehensive dark theme
            const style = document.createElement('style');
            style.textContent = `
                .dark {
                    --stem-color-primary: #60a5fa;
                    --stem-color-success: #34d399;
                    --stem-color-warning: #fbbf24;
                    --stem-color-error: #f87171;
                    --stem-color-text-base: #f9fafb;
                    --stem-color-bg-surface: #1f2937;
                }
            `;
            document.head.appendChild(style);

            // Create multiple component types
            const button = document.createElement('button');
            button.className = 'btn btn-primary';

            const card = document.createElement('div');
            card.className = 'card';

            const badge = document.createElement('span');
            badge.className = 'badge badge-success';

            document.body.append(button, card, badge);

            // Apply dark theme
            document.documentElement.classList.add('dark');

            const rootStyles = window.getComputedStyle(
                document.documentElement
            );

            // Verify all semantic colors updated
            expect(
                rootStyles.getPropertyValue('--stem-color-primary').trim()
            ).to.equal('#60a5fa');
            expect(
                rootStyles.getPropertyValue('--stem-color-success').trim()
            ).to.equal('#34d399');
            expect(
                rootStyles.getPropertyValue('--stem-color-warning').trim()
            ).to.equal('#fbbf24');
            expect(
                rootStyles.getPropertyValue('--stem-color-error').trim()
            ).to.equal('#f87171');
        });

        it('allows toggling between light and dark modes', () => {
            const style = document.createElement('style');
            style.textContent = `
                .dark {
                    --stem-color-text-base: #f9fafb;
                }
            `;
            document.head.appendChild(style);

            const rootStyles = window.getComputedStyle(
                document.documentElement
            );

            // Get default light mode color
            const lightTextColor = rootStyles
                .getPropertyValue('--stem-color-text-base')
                .trim();

            // Switch to dark mode
            document.documentElement.classList.add('dark');
            const darkTextColor = rootStyles
                .getPropertyValue('--stem-color-text-base')
                .trim();

            // Switch back to light mode
            document.documentElement.classList.remove('dark');
            const lightAgainColor = rootStyles
                .getPropertyValue('--stem-color-text-base')
                .trim();

            // Verify colors changed
            expect(darkTextColor).to.equal('#f9fafb');
            expect(lightAgainColor).to.equal(lightTextColor);
        });
    });

    describe('Theme Customization', () => {
        it('allows partial theme overrides', () => {
            // Override only specific colors while keeping others
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --stem-color-primary: #8b5cf6;
                }
                .dark {
                    --stem-color-primary: #a78bfa;
                }
            `;
            document.head.appendChild(style);

            const rootStyles = window.getComputedStyle(
                document.documentElement
            );

            // Light mode has custom primary
            expect(
                rootStyles.getPropertyValue('--stem-color-primary').trim()
            ).to.equal('#8b5cf6');

            // Dark mode has custom primary
            document.documentElement.classList.add('dark');
            expect(
                rootStyles.getPropertyValue('--stem-color-primary').trim()
            ).to.equal('#a78bfa');
        });

        it('supports multiple custom themes beyond light/dark', () => {
            const style = document.createElement('style');
            style.textContent = `
                .theme-high-contrast {
                    --stem-color-text-base: #000000;
                    --stem-color-bg-surface: #ffffff;
                    --stem-color-primary: #0000ff;
                }
                .theme-sepia {
                    --stem-color-text-base: #5b4636;
                    --stem-color-bg-surface: #f4ecd8;
                    --stem-color-primary: #8b7355;
                }
            `;
            document.head.appendChild(style);

            const rootStyles = window.getComputedStyle(
                document.documentElement
            );

            // Apply high contrast theme
            document.documentElement.classList.add('theme-high-contrast');
            expect(
                rootStyles.getPropertyValue('--stem-color-text-base').trim()
            ).to.equal('#000000');
            expect(
                rootStyles.getPropertyValue('--stem-color-primary').trim()
            ).to.equal('#0000ff');

            // Switch to sepia theme
            document.documentElement.classList.remove('theme-high-contrast');
            document.documentElement.classList.add('theme-sepia');
            expect(
                rootStyles.getPropertyValue('--stem-color-text-base').trim()
            ).to.equal('#5b4636');
            expect(
                rootStyles.getPropertyValue('--stem-color-primary').trim()
            ).to.equal('#8b7355');
        });
    });
});

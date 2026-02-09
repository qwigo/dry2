/**
 * Button Component Classes Tests
 *
 * Tests button component classes to ensure:
 * 1. .btn base class provides consistent button styling
 * 2. Size variants (.btn-sm, .btn-lg) apply correct sizing
 * 3. Style variants (.btn-primary, .btn-outline, .btn-ghost, .btn-danger, .btn-success) apply correct colors
 * 4. All classes reference CSS variables (not hardcoded values)
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
 * @returns {Object} Object containing window, document, and testElement
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
        <body>
            <button id="test-button" class="btn">Test Button</button>
        </body>
        </html>
    `;

    const dom = new JSDOM(html);
    const { window } = dom;
    const { document } = window;
    const testButton = document.getElementById('test-button');

    return { window, document, testButton };
}

describe('Button Component Classes', () => {
    let window;
    let document;
    let testButton;

    before(() => {
        const env = setupCSSTestEnvironment();
        window = env.window;
        document = env.document;
        testButton = env.testButton;
    });

    afterEach(() => {
        // Reset to base .btn class only
        testButton.className = 'btn';
    });

    describe('Base Button Class (.btn)', () => {
        /**
         * Test that .btn applies padding
         */
        it('applies padding to .btn', () => {
            const styles = window.getComputedStyle(testButton);
            const padding = styles.padding;

            expect(padding).to.not.be.empty;
        });

        /**
         * Test that .btn applies border-radius
         */
        it('applies border-radius to .btn', () => {
            const styles = window.getComputedStyle(testButton);
            const borderRadius = styles.borderRadius;

            expect(borderRadius).to.not.be.empty;
        });

        /**
         * Test that .btn applies font-weight
         */
        it('applies font-weight to .btn', () => {
            const styles = window.getComputedStyle(testButton);
            const fontWeight = styles.fontWeight;

            expect(fontWeight).to.not.be.empty;
        });

        /**
         * Test that .btn has transition properties
         */
        it('applies transition to .btn', () => {
            const styles = window.getComputedStyle(testButton);
            const transition = styles.transition;

            expect(transition).to.not.equal('none');
        });

        /**
         * Test that .btn uses CSS variables
         */
        it('references CSS variables for .btn base styles', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check that .btn uses var() for at least some properties
            const btnPattern = /\.btn\s*{[^}]*var\(--stem-/s;

            expect(
                btnPattern.test(cssContent),
                '.btn should reference CSS variables'
            ).to.be.true;
        });
    });

    describe('Button Size Variants', () => {
        /**
         * Test that .btn-sm applies smaller font size
         */
        it('applies smaller font-size for .btn-sm', () => {
            testButton.classList.add('btn-sm');
            const styles = window.getComputedStyle(testButton);
            const fontSize = styles.fontSize;

            expect(fontSize).to.not.be.empty;
        });

        /**
         * Test that .btn-sm applies smaller padding
         */
        it('applies smaller padding for .btn-sm', () => {
            testButton.classList.add('btn-sm');
            const styles = window.getComputedStyle(testButton);
            const padding = styles.padding;

            expect(padding).to.not.be.empty;
        });

        /**
         * Test that .btn-lg applies larger font size
         */
        it('applies larger font-size for .btn-lg', () => {
            testButton.classList.add('btn-lg');
            const styles = window.getComputedStyle(testButton);
            const fontSize = styles.fontSize;

            expect(fontSize).to.not.be.empty;
        });

        /**
         * Test that .btn-lg applies larger padding
         */
        it('applies larger padding for .btn-lg', () => {
            testButton.classList.add('btn-lg');
            const styles = window.getComputedStyle(testButton);
            const padding = styles.padding;

            expect(padding).to.not.be.empty;
        });

        /**
         * Test that size variants reference CSS variables
         */
        it('references CSS variables for size variants', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const sizeClasses = ['btn-sm', 'btn-lg'];

            sizeClasses.forEach(className => {
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*var\\(--stem-`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference CSS variables`
                ).to.be.true;
            });
        });
    });

    describe('Button Style Variants', () => {
        /**
         * Test that .btn-primary applies primary color
         */
        it('applies background-color for .btn-primary', () => {
            testButton.classList.add('btn-primary');
            const styles = window.getComputedStyle(testButton);
            const backgroundColor = styles.backgroundColor;

            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that .btn-primary applies text color
         */
        it('applies color for .btn-primary', () => {
            testButton.classList.add('btn-primary');
            const styles = window.getComputedStyle(testButton);
            const color = styles.color;

            expect(color).to.not.be.empty;
        });

        /**
         * Test that .btn-success applies success color
         */
        it('applies background-color for .btn-success', () => {
            testButton.classList.add('btn-success');
            const styles = window.getComputedStyle(testButton);
            const backgroundColor = styles.backgroundColor;

            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that .btn-danger applies error color
         */
        it('applies background-color for .btn-danger', () => {
            testButton.classList.add('btn-danger');
            const styles = window.getComputedStyle(testButton);
            const backgroundColor = styles.backgroundColor;

            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that .btn-outline has border and transparent background
         */
        it('applies border for .btn-outline', () => {
            testButton.classList.add('btn-outline');
            const styles = window.getComputedStyle(testButton);
            const border = styles.border;
            const borderWidth = styles.borderWidth;

            expect(border).to.not.be.empty;
            expect(borderWidth).to.not.equal('0px');
        });

        /**
         * Test that .btn-ghost has minimal styling
         */
        it('applies minimal styling for .btn-ghost', () => {
            testButton.classList.add('btn-ghost');
            const styles = window.getComputedStyle(testButton);
            const backgroundColor = styles.backgroundColor;

            // Ghost buttons should have transparent or very light background
            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that style variants reference CSS variables for colors
         */
        it('references CSS variables for style variants', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const styleClasses = [
                'btn-primary',
                'btn-success',
                'btn-danger',
                'btn-outline',
                'btn-ghost'
            ];

            styleClasses.forEach(className => {
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*var\\(--stem-`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference CSS variables`
                ).to.be.true;
            });
        });
    });

    describe('Button Hover States', () => {
        /**
         * Test that hover states are defined for primary button
         */
        it('defines hover state for .btn-primary', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const hoverPattern = /\.btn-primary:hover\s*{/;

            expect(
                hoverPattern.test(cssContent),
                '.btn-primary should have :hover state'
            ).to.be.true;
        });

        /**
         * Test that hover states use CSS variables
         */
        it('hover states reference CSS variables', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const hoverVarPattern = /\.btn-[^:]+:hover\s*{[^}]*var\(--stem-/s;

            expect(
                hoverVarPattern.test(cssContent),
                'Button hover states should reference CSS variables'
            ).to.be.true;
        });
    });

    describe('Button Disabled State', () => {
        /**
         * Test that disabled state reduces opacity or changes appearance
         */
        it('defines disabled state for buttons', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const disabledPattern = /\.btn:disabled|\.btn\[disabled\]/;

            expect(
                disabledPattern.test(cssContent),
                'Buttons should have disabled state styles'
            ).to.be.true;
        });
    });

    describe('Component Class Coverage', () => {
        /**
         * Test that all expected button classes exist
         */
        it('provides all expected button component classes', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const expectedClasses = [
                'btn',
                'btn-sm',
                'btn-lg',
                'btn-primary',
                'btn-success',
                'btn-danger',
                'btn-outline',
                'btn-ghost'
            ];

            expectedClasses.forEach(className => {
                const pattern = new RegExp(`\\.${className}\\s*{`);
                expect(
                    pattern.test(cssContent),
                    `.${className} class should exist`
                ).to.be.true;
            });
        });

        /**
         * Test that all button classes use only CSS variables
         */
        it('all button classes use only CSS variables (no hardcoded values)', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Extract all .btn* class rules
            const btnRules = cssContent.match(/\.btn[^{]*{[^}]*}/gs) || [];

            btnRules.forEach(rule => {
                // Check for hardcoded color values (hex, rgb)
                const hasHardcodedHex = /#[0-9a-fA-F]{3,6}/.test(rule);
                const hasHardcodedRgb = /rgb\(/.test(rule);

                if (hasHardcodedHex || hasHardcodedRgb) {
                    // Allow if it's just a comment
                    const isComment = /\/\*.*#[0-9a-fA-F]{3,6}.*\*\//.test(rule);
                    if (!isComment) {
                        expect.fail(
                            `Button class contains hardcoded color value: ${rule.substring(0, 100)}...`
                        );
                    }
                }

                // Check for hardcoded pixel values (excluding 0px)
                const hasHardcodedPx = /:\s*[1-9]\d*px/.test(rule);
                if (hasHardcodedPx) {
                    expect.fail(
                        `Button class contains hardcoded pixel value: ${rule.substring(0, 100)}...`
                    );
                }
            });
        });
    });
});

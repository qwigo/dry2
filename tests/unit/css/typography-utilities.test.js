/**
 * Typography Utilities Test Suite
 *
 * Tests utility classes for font sizes and font weights to ensure:
 * 1. Classes apply correct CSS values
 * 2. Classes reference CSS variables (not hardcoded values)
 * 3. All size and weight variants are properly implemented
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
            <div id="test-element"></div>
        </body>
        </html>
    `;

    const dom = new JSDOM(html);
    const { window } = dom;
    const { document } = window;
    const testElement = document.getElementById('test-element');

    return { window, document, testElement };
}

describe('Typography Utilities', () => {
    let window;
    let document;
    let testElement;
    let rootStyles;

    before(() => {
        const env = setupCSSTestEnvironment();
        window = env.window;
        document = env.document;
        testElement = env.testElement;
        rootStyles = window.getComputedStyle(document.documentElement);
    });

    afterEach(() => {
        // Clear classes after each test
        testElement.className = '';
    });

    describe('Font Size Utilities', () => {
        /**
         * Test that .text-xs applies the correct font size
         */
        it('applies correct font-size for .text-xs', () => {
            testElement.classList.add('text-xs');
            const styles = window.getComputedStyle(testElement);
            const fontSize = styles.fontSize;

            // Check that font-size is set (JSDOM returns var() reference)
            expect(fontSize).to.equal('var(--stem-font-size-xs)', '.text-xs should use --stem-font-size-xs variable');
        });

        /**
         * Test that .text-sm applies the correct font size
         */
        it('applies correct font-size for .text-sm', () => {
            testElement.classList.add('text-sm');
            const styles = window.getComputedStyle(testElement);
            const fontSize = styles.fontSize;

            expect(fontSize).to.equal('var(--stem-font-size-sm)', '.text-sm should use --stem-font-size-sm variable');
        });

        /**
         * Test that .text-base applies the correct font size
         */
        it('applies correct font-size for .text-base', () => {
            testElement.classList.add('text-base');
            const styles = window.getComputedStyle(testElement);
            const fontSize = styles.fontSize;

            expect(fontSize).to.equal('var(--stem-font-size-base)', '.text-base should use --stem-font-size-base variable');
        });

        /**
         * Test that .text-md applies the correct font size
         */
        it('applies correct font-size for .text-md', () => {
            testElement.classList.add('text-md');
            const styles = window.getComputedStyle(testElement);
            const fontSize = styles.fontSize;

            expect(fontSize).to.equal('var(--stem-font-size-md)', '.text-md should use --stem-font-size-md variable');
        });

        /**
         * Test that .text-lg applies the correct font size
         */
        it('applies correct font-size for .text-lg', () => {
            testElement.classList.add('text-lg');
            const styles = window.getComputedStyle(testElement);
            const fontSize = styles.fontSize;

            expect(fontSize).to.equal('var(--stem-font-size-lg)', '.text-lg should use --stem-font-size-lg variable');
        });

        /**
         * Test that .text-xl applies the correct font size
         */
        it('applies correct font-size for .text-xl', () => {
            testElement.classList.add('text-xl');
            const styles = window.getComputedStyle(testElement);
            const fontSize = styles.fontSize;

            expect(fontSize).to.equal('var(--stem-font-size-xl)', '.text-xl should use --stem-font-size-xl variable');
        });

        /**
         * Test that .text-2xl applies the correct font size
         */
        it('applies correct font-size for .text-2xl', () => {
            testElement.classList.add('text-2xl');
            const styles = window.getComputedStyle(testElement);
            const fontSize = styles.fontSize;

            expect(fontSize).to.equal('var(--stem-font-size-2xl)', '.text-2xl should use --stem-font-size-2xl variable');
        });

        /**
         * Test that .text-3xl applies the correct font size
         */
        it('applies correct font-size for .text-3xl', () => {
            testElement.classList.add('text-3xl');
            const styles = window.getComputedStyle(testElement);
            const fontSize = styles.fontSize;

            expect(fontSize).to.equal('var(--stem-font-size-3xl)', '.text-3xl should use --stem-font-size-3xl variable');
        });

        /**
         * Test that font size classes reference CSS variables
         */
        it('references CSS variables for font-size values', () => {
            // Read the CSS file to verify variable usage
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check that .text-* classes use var(--stem-font-size-*)
            const sizeClasses = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl'];

            sizeClasses.forEach((size) => {
                const className = size === 'base' ? `.text-base` : `.text-${size}`;
                const varName = `--stem-font-size-${size}`;

                // Check if the CSS contains the class with variable reference
                const classPattern = new RegExp(
                    `\\.text-${size}\\s*{[^}]*font-size:\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    classPattern.test(cssContent),
                    `${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });

    describe('Font Weight Utilities', () => {
        /**
         * Test that .font-normal applies the correct font weight
         */
        it('applies correct font-weight for .font-normal', () => {
            testElement.classList.add('font-normal');
            const styles = window.getComputedStyle(testElement);
            const fontWeight = styles.fontWeight;

            expect(fontWeight).to.equal('var(--stem-font-weight-normal)', '.font-normal should use --stem-font-weight-normal variable');
        });

        /**
         * Test that .font-medium applies the correct font weight
         */
        it('applies correct font-weight for .font-medium', () => {
            testElement.classList.add('font-medium');
            const styles = window.getComputedStyle(testElement);
            const fontWeight = styles.fontWeight;

            expect(fontWeight).to.equal('var(--stem-font-weight-medium)', '.font-medium should use --stem-font-weight-medium variable');
        });

        /**
         * Test that .font-semibold applies the correct font weight
         */
        it('applies correct font-weight for .font-semibold', () => {
            testElement.classList.add('font-semibold');
            const styles = window.getComputedStyle(testElement);
            const fontWeight = styles.fontWeight;

            expect(fontWeight).to.equal('var(--stem-font-weight-semibold)', '.font-semibold should use --stem-font-weight-semibold variable');
        });

        /**
         * Test that .font-bold applies the correct font weight
         */
        it('applies correct font-weight for .font-bold', () => {
            testElement.classList.add('font-bold');
            const styles = window.getComputedStyle(testElement);
            const fontWeight = styles.fontWeight;

            expect(fontWeight).to.equal('var(--stem-font-weight-bold)', '.font-bold should use --stem-font-weight-bold variable');
        });

        /**
         * Test that font weight classes reference CSS variables
         */
        it('references CSS variables for font-weight values', () => {
            // Read the CSS file to verify variable usage
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check that .font-* classes use var(--stem-font-weight-*)
            const weightClasses = ['normal', 'medium', 'semibold', 'bold'];

            weightClasses.forEach((weight) => {
                const className = `.font-${weight}`;
                const varName = `--stem-font-weight-${weight}`;

                // Check if the CSS contains the class with variable reference
                const classPattern = new RegExp(
                    `\\.font-${weight}\\s*{[^}]*font-weight:\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    classPattern.test(cssContent),
                    `${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });
});

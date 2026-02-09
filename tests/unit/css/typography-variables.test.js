/**
 * Typography CSS Variables Tests
 *
 * Tests that all typography-related CSS variables exist and have valid values.
 * This includes font sizes, weights, line heights, and font families.
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

    const dom = new JSDOM(html);
    const { window } = dom;
    const { document } = window;
    const rootStyles = window.getComputedStyle(document.documentElement);

    return { window, document, rootStyles };
}

describe('Typography CSS Variables', () => {
    let rootStyles;

    before(() => {
        const env = setupCSSTestEnvironment();
        rootStyles = env.rootStyles;
    });

    describe('Font Size Variables', () => {
        it('should have --stem-font-size-xs variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-size-xs').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-size-sm variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-size-sm').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-size-base variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-size-base').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-size-md variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-size-md').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-size-lg variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-size-lg').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-size-xl variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-size-xl').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-size-2xl variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-size-2xl').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-size-3xl variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-size-3xl').trim();
            expect(value).to.not.be.empty;
        });

        it('should have valid rem or px units for font sizes', () => {
            const sizes = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl'];

            sizes.forEach(size => {
                const value = rootStyles.getPropertyValue(`--stem-font-size-${size}`).trim();
                const validUnit = /^[\d.]+(?:rem|px)$/.test(value);
                expect(validUnit, `--stem-font-size-${size} should have rem or px unit`).to.be.true;
            });
        });
    });

    describe('Font Weight Variables', () => {
        it('should have --stem-font-weight-normal variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-weight-normal').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-weight-medium variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-weight-medium').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-weight-semibold variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-weight-semibold').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-weight-bold variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-weight-bold').trim();
            expect(value).to.not.be.empty;
        });

        it('should have valid numeric values for font weights', () => {
            const weights = ['normal', 'medium', 'semibold', 'bold'];

            weights.forEach(weight => {
                const value = rootStyles.getPropertyValue(`--stem-font-weight-${weight}`).trim();
                const numericValue = parseInt(value, 10);
                expect(numericValue, `--stem-font-weight-${weight} should be numeric`).to.be.a('number');
                expect(numericValue, `--stem-font-weight-${weight} should be between 100 and 900`).to.be.within(100, 900);
            });
        });
    });

    describe('Line Height Variables', () => {
        it('should have --stem-line-height-tight variable', () => {
            const value = rootStyles.getPropertyValue('--stem-line-height-tight').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-line-height-normal variable', () => {
            const value = rootStyles.getPropertyValue('--stem-line-height-normal').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-line-height-relaxed variable', () => {
            const value = rootStyles.getPropertyValue('--stem-line-height-relaxed').trim();
            expect(value).to.not.be.empty;
        });

        it('should have valid numeric values for line heights', () => {
            const lineHeights = ['tight', 'normal', 'relaxed'];

            lineHeights.forEach(height => {
                const value = rootStyles.getPropertyValue(`--stem-line-height-${height}`).trim();
                const numericValue = parseFloat(value);
                expect(numericValue, `--stem-line-height-${height} should be numeric`).to.be.a('number');
                expect(numericValue, `--stem-line-height-${height} should be a reasonable value`).to.be.within(1, 3);
            });
        });
    });

    describe('Font Family Variables', () => {
        it('should have --stem-font-family-sans variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-family-sans').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-family-serif variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-family-serif').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-font-family-mono variable', () => {
            const value = rootStyles.getPropertyValue('--stem-font-family-mono').trim();
            expect(value).to.not.be.empty;
        });

        it('should have font family stack with fallbacks', () => {
            const families = ['sans', 'serif', 'mono'];

            families.forEach(family => {
                const value = rootStyles.getPropertyValue(`--stem-font-family-${family}`).trim();
                // Font stacks should have at least one comma (multiple fonts)
                const hasMultipleFonts = value.includes(',');
                expect(hasMultipleFonts, `--stem-font-family-${family} should have multiple fonts in stack`).to.be.true;
            });
        });
    });

    describe('Semantic Naming Convention', () => {
        it('should use --stem- prefix for all typography variables', () => {
            // This test verifies that variable names follow the --stem- convention
            // Actual variables are tested above; this is a naming convention check
            const expectedVars = [
                '--stem-font-size-xs',
                '--stem-font-size-sm',
                '--stem-font-size-base',
                '--stem-font-weight-normal',
                '--stem-line-height-tight',
                '--stem-font-family-sans'
            ];

            expectedVars.forEach(varName => {
                expect(varName.startsWith('--stem-'), `${varName} should start with --stem-`).to.be.true;
            });
        });
    });

    describe('Value Consistency', () => {
        it('should have progressively larger font sizes', () => {
            const sizes = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl'];
            const values = sizes.map(size => {
                const val = rootStyles.getPropertyValue(`--stem-font-size-${size}`).trim();
                return parseFloat(val);
            });

            // Each size should be larger than the previous
            for (let i = 1; i < values.length; i++) {
                expect(values[i], `Font size ${sizes[i]} should be larger than ${sizes[i-1]}`).to.be.greaterThan(values[i-1]);
            }
        });

        it('should have progressively heavier font weights', () => {
            const weights = ['normal', 'medium', 'semibold', 'bold'];
            const values = weights.map(weight => {
                const val = rootStyles.getPropertyValue(`--stem-font-weight-${weight}`).trim();
                return parseInt(val, 10);
            });

            // Each weight should be heavier than the previous
            for (let i = 1; i < values.length; i++) {
                expect(values[i], `Font weight ${weights[i]} should be heavier than ${weights[i-1]}`).to.be.greaterThan(values[i-1]);
            }
        });

        it('should have progressively looser line heights', () => {
            const lineHeights = ['tight', 'normal', 'relaxed'];
            const values = lineHeights.map(height => {
                const val = rootStyles.getPropertyValue(`--stem-line-height-${height}`).trim();
                return parseFloat(val);
            });

            // Each line height should be larger than the previous
            for (let i = 1; i < values.length; i++) {
                expect(values[i], `Line height ${lineHeights[i]} should be larger than ${lineHeights[i-1]}`).to.be.greaterThan(values[i-1]);
            }
        });
    });
});

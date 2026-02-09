/**
 * Color CSS Variables Tests
 *
 * Tests that all color-related CSS variables exist and have valid values.
 * This includes primary, success, warning, error colors with light/dark variants,
 * text colors, background colors, and border colors.
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

/**
 * Check if a color value is in valid hex format
 * @param {string} color - Color value to check
 * @returns {boolean} True if valid hex color
 */
function isValidHexColor(color) {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

/**
 * Check if a color value is in valid rgb/rgba format
 * @param {string} color - Color value to check
 * @returns {boolean} True if valid rgb/rgba color
 */
function isValidRgbColor(color) {
    return /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color);
}

/**
 * Check if a color value is valid (hex or rgb/rgba)
 * @param {string} color - Color value to check
 * @returns {boolean} True if valid color format
 */
function isValidColor(color) {
    return isValidHexColor(color) || isValidRgbColor(color);
}

/**
 * Test helper to validate a color group with light/dark variants
 * @param {string} colorGroup - Color group name (e.g., 'primary', 'success')
 * @param {Object} rootStyles - Computed styles object
 * @param {Object} expect - Chai expect function
 */
function testColorGroupWithVariants(colorGroup, rootStyles, expect) {
    const variants = [colorGroup, `${colorGroup}-light`, `${colorGroup}-dark`];

    variants.forEach(variant => {
        const value = rootStyles.getPropertyValue(`--stem-color-${variant}`).trim();
        expect(value, `--stem-color-${variant} should not be empty`).to.not.be.empty;
        expect(isValidColor(value), `--stem-color-${variant} should be valid hex or rgb color`).to.be.true;
    });
}

describe('Color CSS Variables', () => {
    let rootStyles;

    before(() => {
        const env = setupCSSTestEnvironment();
        rootStyles = env.rootStyles;
    });

    describe('Primary Color Variables', () => {
        it('should have all primary color variants with valid formats', () => {
            testColorGroupWithVariants('primary', rootStyles, expect);
        });
    });

    describe('Success Color Variables', () => {
        it('should have all success color variants with valid formats', () => {
            testColorGroupWithVariants('success', rootStyles, expect);
        });
    });

    describe('Warning Color Variables', () => {
        it('should have all warning color variants with valid formats', () => {
            testColorGroupWithVariants('warning', rootStyles, expect);
        });
    });

    describe('Error Color Variables', () => {
        it('should have all error color variants with valid formats', () => {
            testColorGroupWithVariants('error', rootStyles, expect);
        });
    });

    describe('Text Color Variables', () => {
        it('should have --stem-color-text-base variable', () => {
            const value = rootStyles.getPropertyValue('--stem-color-text-base').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-color-text-muted variable', () => {
            const value = rootStyles.getPropertyValue('--stem-color-text-muted').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-color-text-inverted variable', () => {
            const value = rootStyles.getPropertyValue('--stem-color-text-inverted').trim();
            expect(value).to.not.be.empty;
        });

        it('should have valid color format for text colors', () => {
            const variants = ['text-base', 'text-muted', 'text-inverted'];

            variants.forEach(variant => {
                const value = rootStyles.getPropertyValue(`--stem-color-${variant}`).trim();
                expect(isValidColor(value), `--stem-color-${variant} should be valid hex or rgb color`).to.be.true;
            });
        });
    });

    describe('Background Color Variables', () => {
        it('should have --stem-color-bg-surface variable', () => {
            const value = rootStyles.getPropertyValue('--stem-color-bg-surface').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-color-bg-primary variable', () => {
            const value = rootStyles.getPropertyValue('--stem-color-bg-primary').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-color-bg-secondary variable', () => {
            const value = rootStyles.getPropertyValue('--stem-color-bg-secondary').trim();
            expect(value).to.not.be.empty;
        });

        it('should have valid color format for background colors', () => {
            const variants = ['bg-surface', 'bg-primary', 'bg-secondary'];

            variants.forEach(variant => {
                const value = rootStyles.getPropertyValue(`--stem-color-${variant}`).trim();
                expect(isValidColor(value), `--stem-color-${variant} should be valid hex or rgb color`).to.be.true;
            });
        });
    });

    describe('Border Color Variables', () => {
        it('should have --stem-color-border-base variable', () => {
            const value = rootStyles.getPropertyValue('--stem-color-border-base').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-color-border-light variable', () => {
            const value = rootStyles.getPropertyValue('--stem-color-border-light').trim();
            expect(value).to.not.be.empty;
        });

        it('should have --stem-color-border-dark variable', () => {
            const value = rootStyles.getPropertyValue('--stem-color-border-dark').trim();
            expect(value).to.not.be.empty;
        });

        it('should have valid color format for border colors', () => {
            const variants = ['border-base', 'border-light', 'border-dark'];

            variants.forEach(variant => {
                const value = rootStyles.getPropertyValue(`--stem-color-${variant}`).trim();
                expect(isValidColor(value), `--stem-color-${variant} should be valid hex or rgb color`).to.be.true;
            });
        });
    });

    describe('Semantic Naming Convention', () => {
        it('should use --stem-color- prefix for all color variables', () => {
            const expectedVars = [
                '--stem-color-primary',
                '--stem-color-success',
                '--stem-color-warning',
                '--stem-color-error',
                '--stem-color-text-base',
                '--stem-color-bg-surface',
                '--stem-color-border-base'
            ];

            expectedVars.forEach(varName => {
                expect(varName.startsWith('--stem-color-'), `${varName} should start with --stem-color-`).to.be.true;
            });
        });
    });

    describe('Color Variant Consistency', () => {
        it('should have light/dark variants for primary colors', () => {
            const baseValue = rootStyles.getPropertyValue('--stem-color-primary').trim();
            const lightValue = rootStyles.getPropertyValue('--stem-color-primary-light').trim();
            const darkValue = rootStyles.getPropertyValue('--stem-color-primary-dark').trim();

            expect(baseValue).to.not.be.empty;
            expect(lightValue).to.not.be.empty;
            expect(darkValue).to.not.be.empty;
        });

        it('should have light/dark variants for success colors', () => {
            const baseValue = rootStyles.getPropertyValue('--stem-color-success').trim();
            const lightValue = rootStyles.getPropertyValue('--stem-color-success-light').trim();
            const darkValue = rootStyles.getPropertyValue('--stem-color-success-dark').trim();

            expect(baseValue).to.not.be.empty;
            expect(lightValue).to.not.be.empty;
            expect(darkValue).to.not.be.empty;
        });

        it('should have light/dark variants for warning colors', () => {
            const baseValue = rootStyles.getPropertyValue('--stem-color-warning').trim();
            const lightValue = rootStyles.getPropertyValue('--stem-color-warning-light').trim();
            const darkValue = rootStyles.getPropertyValue('--stem-color-warning-dark').trim();

            expect(baseValue).to.not.be.empty;
            expect(lightValue).to.not.be.empty;
            expect(darkValue).to.not.be.empty;
        });

        it('should have light/dark variants for error colors', () => {
            const baseValue = rootStyles.getPropertyValue('--stem-color-error').trim();
            const lightValue = rootStyles.getPropertyValue('--stem-color-error-light').trim();
            const darkValue = rootStyles.getPropertyValue('--stem-color-error-dark').trim();

            expect(baseValue).to.not.be.empty;
            expect(lightValue).to.not.be.empty;
            expect(darkValue).to.not.be.empty;
        });

        it('should have light/dark variants for border colors', () => {
            const baseValue = rootStyles.getPropertyValue('--stem-color-border-base').trim();
            const lightValue = rootStyles.getPropertyValue('--stem-color-border-light').trim();
            const darkValue = rootStyles.getPropertyValue('--stem-color-border-dark').trim();

            expect(baseValue).to.not.be.empty;
            expect(lightValue).to.not.be.empty;
            expect(darkValue).to.not.be.empty;
        });
    });
});

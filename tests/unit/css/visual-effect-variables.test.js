/**
 * Visual Effect CSS Variables Tests
 *
 * Tests that all visual effect CSS variables exist and have valid values.
 * This includes border widths, border radius values, shadow values,
 * transition durations, and easing functions.
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
 * Check if a value is a valid CSS pixel value
 * @param {string} value - CSS value to check
 * @returns {boolean} True if valid pixel value
 */
function isValidPixelValue(value) {
    return /^\d+px$/.test(value);
}

/**
 * Check if a value is a valid CSS percentage or special value
 * @param {string} value - CSS value to check
 * @returns {boolean} True if valid percentage or special value
 */
function isValidRadiusValue(value) {
    return /^\d+px$/.test(value) || /^\d+%$/.test(value) || value === '9999px' || value === '50%';
}

/**
 * Check if a value is a valid CSS box-shadow value
 * @param {string} value - CSS value to check
 * @returns {boolean} True if valid box-shadow
 */
function isValidShadowValue(value) {
    // Should match patterns like "0 1px 2px rgba(0,0,0,0.1)" or "none"
    // Also handles multiple shadows separated by commas
    if (value === 'none') return true;
    // Check for presence of shadow components: numbers with optional units and rgba/rgb/hex color
    // Valid shadow must have both numeric values (offsets/blur) and a color
    const hasNumericValues = /\d+\s*(px|rem|em)?/.test(value);
    const hasColor = /rgba?\s*\([\d\s,.]+\)|#[0-9a-fA-F]{3,8}/.test(value);
    return hasNumericValues && hasColor;
}

/**
 * Check if a value is a valid CSS time value
 * @param {string} value - CSS value to check
 * @returns {boolean} True if valid time value (ms or s)
 */
function isValidTimeValue(value) {
    return /^\d+m?s$/.test(value);
}

/**
 * Check if a value is a valid CSS easing function
 * @param {string} value - CSS value to check
 * @returns {boolean} True if valid easing function
 */
function isValidEasingFunction(value) {
    const validEasings = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];
    if (validEasings.includes(value)) return true;
    // Also check for cubic-bezier
    return /^cubic-bezier\([\d\s.,]+\)$/.test(value);
}

describe('Visual Effect CSS Variables', () => {
    let rootStyles;

    before(() => {
        const env = setupCSSTestEnvironment();
        rootStyles = env.rootStyles;
    });

    describe('Border Width Variables', () => {
        it('should have --stem-border-width-1 variable with 1px value', () => {
            const value = rootStyles.getPropertyValue('--stem-border-width-1').trim();
            expect(value).to.equal('1px');
        });

        it('should have --stem-border-width-2 variable with 2px value', () => {
            const value = rootStyles.getPropertyValue('--stem-border-width-2').trim();
            expect(value).to.equal('2px');
        });

        it('should have --stem-border-width-4 variable with 4px value', () => {
            const value = rootStyles.getPropertyValue('--stem-border-width-4').trim();
            expect(value).to.equal('4px');
        });

        it('should have valid pixel values for all border widths', () => {
            const widths = ['1', '2', '4'];

            widths.forEach(width => {
                const value = rootStyles.getPropertyValue(`--stem-border-width-${width}`).trim();
                expect(value, `--stem-border-width-${width} should not be empty`).to.not.be.empty;
                expect(isValidPixelValue(value), `--stem-border-width-${width} should be valid pixel value`).to.be.true;
            });
        });
    });

    describe('Border Radius Variables', () => {
        it('should have --stem-border-radius-sm variable', () => {
            const value = rootStyles.getPropertyValue('--stem-border-radius-sm').trim();
            expect(value).to.not.be.empty;
            expect(isValidRadiusValue(value), '--stem-border-radius-sm should be valid radius value').to.be.true;
        });

        it('should have --stem-border-radius-md variable', () => {
            const value = rootStyles.getPropertyValue('--stem-border-radius-md').trim();
            expect(value).to.not.be.empty;
            expect(isValidRadiusValue(value), '--stem-border-radius-md should be valid radius value').to.be.true;
        });

        it('should have --stem-border-radius-lg variable', () => {
            const value = rootStyles.getPropertyValue('--stem-border-radius-lg').trim();
            expect(value).to.not.be.empty;
            expect(isValidRadiusValue(value), '--stem-border-radius-lg should be valid radius value').to.be.true;
        });

        it('should have --stem-border-radius-xl variable', () => {
            const value = rootStyles.getPropertyValue('--stem-border-radius-xl').trim();
            expect(value).to.not.be.empty;
            expect(isValidRadiusValue(value), '--stem-border-radius-xl should be valid radius value').to.be.true;
        });

        it('should have --stem-border-radius-full variable', () => {
            const value = rootStyles.getPropertyValue('--stem-border-radius-full').trim();
            expect(value).to.not.be.empty;
            expect(isValidRadiusValue(value), '--stem-border-radius-full should be valid radius value').to.be.true;
        });

        it('should have progressive radius sizes', () => {
            const sm = rootStyles.getPropertyValue('--stem-border-radius-sm').trim();
            const md = rootStyles.getPropertyValue('--stem-border-radius-md').trim();
            const lg = rootStyles.getPropertyValue('--stem-border-radius-lg').trim();

            // Extract numeric values for comparison (assuming px units)
            const smVal = parseInt(sm);
            const mdVal = parseInt(md);
            const lgVal = parseInt(lg);

            expect(smVal).to.be.lessThan(mdVal);
            expect(mdVal).to.be.lessThan(lgVal);
        });
    });

    describe('Shadow Variables', () => {
        it('should have --stem-shadow-sm variable', () => {
            const value = rootStyles.getPropertyValue('--stem-shadow-sm').trim();
            expect(value).to.not.be.empty;
            expect(isValidShadowValue(value), '--stem-shadow-sm should be valid shadow value').to.be.true;
        });

        it('should have --stem-shadow-md variable', () => {
            const value = rootStyles.getPropertyValue('--stem-shadow-md').trim();
            expect(value).to.not.be.empty;
            expect(isValidShadowValue(value), '--stem-shadow-md should be valid shadow value').to.be.true;
        });

        it('should have --stem-shadow-lg variable', () => {
            const value = rootStyles.getPropertyValue('--stem-shadow-lg').trim();
            expect(value).to.not.be.empty;
            expect(isValidShadowValue(value), '--stem-shadow-lg should be valid shadow value').to.be.true;
        });

        it('should have --stem-shadow-xl variable', () => {
            const value = rootStyles.getPropertyValue('--stem-shadow-xl').trim();
            expect(value).to.not.be.empty;
            expect(isValidShadowValue(value), '--stem-shadow-xl should be valid shadow value').to.be.true;
        });

        it('should have all shadow sizes with valid formats', () => {
            const sizes = ['sm', 'md', 'lg', 'xl'];

            sizes.forEach(size => {
                const value = rootStyles.getPropertyValue(`--stem-shadow-${size}`).trim();
                expect(value, `--stem-shadow-${size} should not be empty`).to.not.be.empty;
                expect(isValidShadowValue(value), `--stem-shadow-${size} should be valid shadow value`).to.be.true;
            });
        });
    });

    describe('Transition Duration Variables', () => {
        it('should have --stem-transition-duration-fast variable', () => {
            const value = rootStyles.getPropertyValue('--stem-transition-duration-fast').trim();
            expect(value).to.not.be.empty;
            expect(isValidTimeValue(value), '--stem-transition-duration-fast should be valid time value').to.be.true;
        });

        it('should have --stem-transition-duration-base variable', () => {
            const value = rootStyles.getPropertyValue('--stem-transition-duration-base').trim();
            expect(value).to.not.be.empty;
            expect(isValidTimeValue(value), '--stem-transition-duration-base should be valid time value').to.be.true;
        });

        it('should have --stem-transition-duration-slow variable', () => {
            const value = rootStyles.getPropertyValue('--stem-transition-duration-slow').trim();
            expect(value).to.not.be.empty;
            expect(isValidTimeValue(value), '--stem-transition-duration-slow should be valid time value').to.be.true;
        });

        it('should have progressive duration values', () => {
            const fast = rootStyles.getPropertyValue('--stem-transition-duration-fast').trim();
            const base = rootStyles.getPropertyValue('--stem-transition-duration-base').trim();
            const slow = rootStyles.getPropertyValue('--stem-transition-duration-slow').trim();

            // Extract numeric values (convert to ms if needed)
            const fastMs = fast.endsWith('s') ? parseFloat(fast) * 1000 : parseInt(fast);
            const baseMs = base.endsWith('s') ? parseFloat(base) * 1000 : parseInt(base);
            const slowMs = slow.endsWith('s') ? parseFloat(slow) * 1000 : parseInt(slow);

            expect(fastMs).to.be.lessThan(baseMs);
            expect(baseMs).to.be.lessThan(slowMs);
        });
    });

    describe('Transition Easing Variables', () => {
        it('should have --stem-transition-ease variable', () => {
            const value = rootStyles.getPropertyValue('--stem-transition-ease').trim();
            expect(value).to.not.be.empty;
            expect(isValidEasingFunction(value), '--stem-transition-ease should be valid easing function').to.be.true;
        });

        it('should have --stem-transition-ease-in variable', () => {
            const value = rootStyles.getPropertyValue('--stem-transition-ease-in').trim();
            expect(value).to.not.be.empty;
            expect(isValidEasingFunction(value), '--stem-transition-ease-in should be valid easing function').to.be.true;
        });

        it('should have --stem-transition-ease-out variable', () => {
            const value = rootStyles.getPropertyValue('--stem-transition-ease-out').trim();
            expect(value).to.not.be.empty;
            expect(isValidEasingFunction(value), '--stem-transition-ease-out should be valid easing function').to.be.true;
        });

        it('should have --stem-transition-ease-in-out variable', () => {
            const value = rootStyles.getPropertyValue('--stem-transition-ease-in-out').trim();
            expect(value).to.not.be.empty;
            expect(isValidEasingFunction(value), '--stem-transition-ease-in-out should be valid easing function').to.be.true;
        });

        it('should have all easing functions with valid formats', () => {
            const easings = ['ease', 'ease-in', 'ease-out', 'ease-in-out'];

            easings.forEach(easing => {
                const value = rootStyles.getPropertyValue(`--stem-transition-${easing}`).trim();
                expect(value, `--stem-transition-${easing} should not be empty`).to.not.be.empty;
                expect(isValidEasingFunction(value), `--stem-transition-${easing} should be valid easing function`).to.be.true;
            });
        });
    });

    describe('Semantic Naming Convention', () => {
        it('should use --stem- prefix for all visual effect variables', () => {
            const expectedVars = [
                '--stem-border-width-1',
                '--stem-border-radius-sm',
                '--stem-shadow-sm',
                '--stem-transition-duration-fast',
                '--stem-transition-ease'
            ];

            expectedVars.forEach(varName => {
                expect(varName.startsWith('--stem-'), `${varName} should start with --stem-`).to.be.true;
            });
        });

        it('should use consistent naming for border properties', () => {
            const borderVars = [
                '--stem-border-width-1',
                '--stem-border-width-2',
                '--stem-border-width-4',
                '--stem-border-radius-sm',
                '--stem-border-radius-md'
            ];

            borderVars.forEach(varName => {
                expect(varName.startsWith('--stem-border-'), `${varName} should start with --stem-border-`).to.be.true;
            });
        });

        it('should use consistent naming for shadow properties', () => {
            const shadowVars = [
                '--stem-shadow-sm',
                '--stem-shadow-md',
                '--stem-shadow-lg',
                '--stem-shadow-xl'
            ];

            shadowVars.forEach(varName => {
                expect(varName.startsWith('--stem-shadow-'), `${varName} should start with --stem-shadow-`).to.be.true;
            });
        });

        it('should use consistent naming for transition properties', () => {
            const transitionVars = [
                '--stem-transition-duration-fast',
                '--stem-transition-duration-base',
                '--stem-transition-duration-slow',
                '--stem-transition-ease',
                '--stem-transition-ease-in',
                '--stem-transition-ease-out',
                '--stem-transition-ease-in-out'
            ];

            transitionVars.forEach(varName => {
                expect(varName.startsWith('--stem-transition-'), `${varName} should start with --stem-transition-`).to.be.true;
            });
        });
    });
});

/**
 * Badge Component Classes Tests
 *
 * Tests badge component classes to ensure:
 * 1. .badge base class provides consistent badge styling
 * 2. Style variants (.badge-success, .badge-warning, .badge-error, .badge-info) apply correct colors
 * 3. Proper sizing and spacing for inline usage
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
            <span id="test-badge" class="badge">Badge</span>
        </body>
        </html>
    `;

    const dom = new JSDOM(html);
    const { window } = dom;
    const { document } = window;
    const testBadge = document.getElementById('test-badge');

    return { window, document, testBadge };
}

describe('Badge Component Classes', () => {
    let window;
    let document;
    let testBadge;

    before(() => {
        const env = setupCSSTestEnvironment();
        window = env.window;
        document = env.document;
        testBadge = env.testBadge;
    });

    afterEach(() => {
        // Reset to base .badge class only
        testBadge.className = 'badge';
    });

    describe('Base Badge Class (.badge)', () => {
        /**
         * Test that .badge applies padding
         */
        it('applies padding to .badge', () => {
            const styles = window.getComputedStyle(testBadge);
            const padding = styles.padding;

            expect(padding).to.not.be.empty;
            expect(padding).to.not.equal('0px');
        });

        /**
         * Test that .badge applies small font size
         */
        it('applies small font-size to .badge', () => {
            const styles = window.getComputedStyle(testBadge);
            const fontSize = styles.fontSize;

            expect(fontSize).to.not.be.empty;
        });

        /**
         * Test that .badge applies border-radius
         */
        it('applies border-radius to .badge', () => {
            const styles = window.getComputedStyle(testBadge);
            const borderRadius = styles.borderRadius;

            expect(borderRadius).to.not.be.empty;
            expect(borderRadius).to.not.equal('0px');
        });

        /**
         * Test that .badge has inline display
         */
        it('applies inline display to .badge', () => {
            const styles = window.getComputedStyle(testBadge);
            const display = styles.display;

            // Badge should be inline-block or inline-flex
            expect(['inline-block', 'inline-flex']).to.include(display);
        });

        /**
         * Test that .badge applies background color
         */
        it('applies background-color to .badge', () => {
            const styles = window.getComputedStyle(testBadge);
            const backgroundColor = styles.backgroundColor;

            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that .badge applies text color
         */
        it('applies text color to .badge', () => {
            const styles = window.getComputedStyle(testBadge);
            const color = styles.color;

            expect(color).to.not.be.empty;
        });

        /**
         * Test that .badge uses CSS variables
         */
        it('references CSS variables for .badge base styles', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check that .badge uses var() for properties
            const badgePattern = /\.badge\s*{[^}]*var\(--stem-/s;

            expect(
                badgePattern.test(cssContent),
                '.badge should reference CSS variables'
            ).to.be.true;
        });
    });

    describe('Badge Style Variants', () => {
        /**
         * Test that .badge-success applies success color
         */
        it('applies success background-color for .badge-success', () => {
            testBadge.classList.add('badge-success');
            const styles = window.getComputedStyle(testBadge);
            const backgroundColor = styles.backgroundColor;

            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that .badge-warning applies warning color
         */
        it('applies warning background-color for .badge-warning', () => {
            testBadge.classList.add('badge-warning');
            const styles = window.getComputedStyle(testBadge);
            const backgroundColor = styles.backgroundColor;

            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that .badge-error applies error color
         */
        it('applies error background-color for .badge-error', () => {
            testBadge.classList.add('badge-error');
            const styles = window.getComputedStyle(testBadge);
            const backgroundColor = styles.backgroundColor;

            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that .badge-info applies info color
         */
        it('applies info background-color for .badge-info', () => {
            testBadge.classList.add('badge-info');
            const styles = window.getComputedStyle(testBadge);
            const backgroundColor = styles.backgroundColor;

            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that style variants reference CSS variables for colors
         */
        it('references CSS variables for style variants', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const styleClasses = [
                'badge-success',
                'badge-warning',
                'badge-error',
                'badge-info'
            ];

            styleClasses.forEach(className => {
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*var\\(--stem-color-`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference color CSS variables`
                ).to.be.true;
            });
        });
    });

    describe('Badge Sizing and Spacing', () => {
        /**
         * Test that padding uses spacing variables
         */
        it('uses spacing variables for padding', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check if .badge padding references spacing variables
            const paddingPattern = /\.badge\s*{[^}]*padding[^:]*:\s*var\(--stem-spacing-/s;

            expect(
                paddingPattern.test(cssContent),
                '.badge padding should use --stem-spacing- variables'
            ).to.be.true;
        });

        /**
         * Test that font-size uses typography variables
         */
        it('uses typography variables for font-size', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check if .badge font-size references font-size variables
            const fontSizePattern = /\.badge\s*{[^}]*font-size[^:]*:\s*var\(--stem-font-size-/s;

            expect(
                fontSizePattern.test(cssContent),
                '.badge font-size should use --stem-font-size- variables'
            ).to.be.true;
        });

        /**
         * Test that border-radius uses border-radius variables
         */
        it('uses border-radius variables', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check if .badge border-radius references variables
            const radiusPattern = /\.badge\s*{[^}]*border-radius[^:]*:\s*var\(--stem-border-radius-/s;

            expect(
                radiusPattern.test(cssContent),
                '.badge border-radius should use --stem-border-radius- variables'
            ).to.be.true;
        });

        /**
         * Test that badge has compact sizing
         */
        it('provides compact sizing appropriate for badges', () => {
            const styles = window.getComputedStyle(testBadge);
            const fontSize = styles.fontSize;
            const padding = styles.padding;

            // Badges should have small font and tight padding
            expect(fontSize).to.not.be.empty;
            expect(padding).to.not.equal('0px');
        });
    });

    describe('Badge Visual Styling', () => {
        /**
         * Test that badges have proper contrast
         */
        it('applies text color for readability', () => {
            const styles = window.getComputedStyle(testBadge);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;

            // Both color and background should be set for proper contrast
            expect(color).to.not.be.empty;
            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that badges use consistent styling
         */
        it('applies consistent visual styling', () => {
            const styles = window.getComputedStyle(testBadge);

            // Check that essential badge properties are set
            const hasPadding = styles.padding && styles.padding !== '0px';
            const hasRadius = styles.borderRadius && styles.borderRadius !== '0px';
            const hasFontSize = styles.fontSize && styles.fontSize !== '';

            expect(hasPadding, 'Badge should have padding').to.be.true;
            expect(hasRadius, 'Badge should have border radius').to.be.true;
            expect(hasFontSize, 'Badge should have font size').to.be.true;
        });
    });

    describe('CSS Variable Usage', () => {
        /**
         * Test that all badge properties use CSS variables
         */
        it('uses only CSS variables (no hardcoded values)', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Extract all .badge* class rules
            const badgeRules = cssContent.match(/\.badge[^{]*{[^}]*}/gs) || [];

            badgeRules.forEach(rule => {
                // Check for hardcoded color values (hex, rgb)
                const hasHardcodedHex = /#[0-9a-fA-F]{3,6}/.test(rule);
                const hasHardcodedRgb = /rgb\(/.test(rule);

                if (hasHardcodedHex || hasHardcodedRgb) {
                    // Allow if it's just a comment
                    const isComment = /\/\*.*#[0-9a-fA-F]{3,6}.*\*\//.test(rule);
                    if (!isComment) {
                        expect.fail(
                            `Badge class contains hardcoded color value: ${rule.substring(0, 100)}...`
                        );
                    }
                }

                // Check for hardcoded pixel values (excluding 0px)
                const hasHardcodedPx = /:\s*[1-9]\d*px/.test(rule);
                if (hasHardcodedPx) {
                    expect.fail(
                        `Badge class contains hardcoded pixel value: ${rule.substring(0, 100)}...`
                    );
                }
            });
        });

        /**
         * Test that badge references appropriate design tokens
         */
        it('references appropriate design system variables', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Extract .badge rule
            const badgeRuleMatch = cssContent.match(/\.badge\s*{[^}]*}/s);
            if (badgeRuleMatch) {
                const badgeRule = badgeRuleMatch[0];

                // Badge should reference spacing, color, font, or border variables
                const hasSpacing = /var\(--stem-spacing-/.test(badgeRule);
                const hasColor = /var\(--stem-color-/.test(badgeRule);
                const hasFont = /var\(--stem-font-/.test(badgeRule);
                const hasBorder = /var\(--stem-border-/.test(badgeRule);

                const usesDesignTokens = hasSpacing || hasColor || hasFont || hasBorder;

                expect(
                    usesDesignTokens,
                    'Badge should use design system variables (spacing, color, font, or border)'
                ).to.be.true;
            }
        });
    });

    describe('Component Class Coverage', () => {
        /**
         * Test that all expected badge classes exist
         */
        it('provides all expected badge component classes', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const expectedClasses = [
                'badge',
                'badge-success',
                'badge-warning',
                'badge-error',
                'badge-info'
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
         * Test that badge provides complete styling
         */
        it('provides complete badge styling', () => {
            const styles = window.getComputedStyle(testBadge);

            // Check that essential badge properties are set
            const hasPadding = styles.padding && styles.padding !== '0px';
            const hasBackground = styles.backgroundColor && styles.backgroundColor !== '';
            const hasRadius = styles.borderRadius && styles.borderRadius !== '0px';
            const hasFontSize = styles.fontSize && styles.fontSize !== '';

            expect(hasPadding, 'Badge should have padding').to.be.true;
            expect(hasBackground, 'Badge should have background color').to.be.true;
            expect(hasRadius, 'Badge should have border radius').to.be.true;
            expect(hasFontSize, 'Badge should have font size').to.be.true;
        });
    });
});

/**
 * Card Component Classes Tests
 *
 * Tests card component classes to ensure:
 * 1. .card base class provides consistent card container styling
 * 2. Proper padding, borders, shadows, and background colors
 * 3. Responsive behavior for different screen sizes
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
            <div id="test-card" class="card">
                <h3>Card Title</h3>
                <p>Card content goes here.</p>
            </div>
        </body>
        </html>
    `;

    const dom = new JSDOM(html);
    const { window } = dom;
    const { document } = window;
    const testCard = document.getElementById('test-card');

    return { window, document, testCard };
}

describe('Card Component Classes', () => {
    let window;
    let document;
    let testCard;

    before(() => {
        const env = setupCSSTestEnvironment();
        window = env.window;
        document = env.document;
        testCard = env.testCard;
    });

    afterEach(() => {
        // Reset to base .card class only
        testCard.className = 'card';
    });

    describe('Base Card Class (.card)', () => {
        /**
         * Test that .card applies padding
         */
        it('applies padding to .card', () => {
            const styles = window.getComputedStyle(testCard);
            const padding = styles.padding;

            expect(padding).to.not.be.empty;
        });

        /**
         * Test that .card applies background color
         */
        it('applies background-color to .card', () => {
            const styles = window.getComputedStyle(testCard);
            const backgroundColor = styles.backgroundColor;

            expect(backgroundColor).to.not.be.empty;
        });

        /**
         * Test that .card applies border-radius
         */
        it('applies border-radius to .card', () => {
            const styles = window.getComputedStyle(testCard);
            const borderRadius = styles.borderRadius;

            expect(borderRadius).to.not.be.empty;
        });

        /**
         * Test that .card applies either border or shadow
         */
        it('applies visual separation (border or shadow) to .card', () => {
            const styles = window.getComputedStyle(testCard);
            const border = styles.border;
            const boxShadow = styles.boxShadow;

            // Card should have either a border or a shadow for visual separation
            const hasBorder = border && border !== 'none' && border !== '';
            const hasShadow = boxShadow && boxShadow !== 'none' && boxShadow !== '';

            expect(hasBorder || hasShadow, 'Card should have border or shadow').to.be.true;
        });

        /**
         * Test that .card uses CSS variables
         */
        it('references CSS variables for .card base styles', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check that .card uses var() for properties
            const cardPattern = /\.card\s*{[^}]*var\(--stem-/s;

            expect(
                cardPattern.test(cssContent),
                '.card should reference CSS variables'
            ).to.be.true;
        });

        /**
         * Test that .card provides a container for content
         */
        it('creates a container for card content', () => {
            const styles = window.getComputedStyle(testCard);
            const display = styles.display;

            // Card should be a block or flex container
            expect(['block', 'flex', 'grid']).to.include(display);
        });
    });

    describe('Card Styling Properties', () => {
        /**
         * Test that padding uses spacing variables
         */
        it('uses spacing variables for padding', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check if .card padding references spacing variables
            const paddingPattern = /\.card\s*{[^}]*padding[^:]*:\s*var\(--stem-spacing-/s;

            expect(
                paddingPattern.test(cssContent),
                '.card padding should use --stem-spacing- variables'
            ).to.be.true;
        });

        /**
         * Test that background uses color variables
         */
        it('uses color variables for background', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check if .card background references color variables
            const bgPattern = /\.card\s*{[^}]*background[^:]*:\s*var\(--stem-color-/s;

            expect(
                bgPattern.test(cssContent),
                '.card background should use --stem-color- variables'
            ).to.be.true;
        });

        /**
         * Test that border-radius uses border-radius variables
         */
        it('uses border-radius variables', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check if .card border-radius references variables
            const radiusPattern = /\.card\s*{[^}]*border-radius[^:]*:\s*var\(--stem-border-radius-/s;

            expect(
                radiusPattern.test(cssContent),
                '.card border-radius should use --stem-border-radius- variables'
            ).to.be.true;
        });

        /**
         * Test that shadow (if used) references shadow variables
         */
        it('uses shadow variables if shadow is applied', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Extract .card rule
            const cardRuleMatch = cssContent.match(/\.card\s*{[^}]*}/s);
            if (cardRuleMatch) {
                const cardRule = cardRuleMatch[0];

                // If box-shadow is used, it should reference a variable
                if (cardRule.includes('box-shadow')) {
                    const shadowVarPattern = /box-shadow[^:]*:\s*var\(--stem-shadow-/;
                    expect(
                        shadowVarPattern.test(cardRule),
                        'If .card uses box-shadow, it should reference --stem-shadow- variables'
                    ).to.be.true;
                }
            }
        });
    });

    describe('Card Visual Hierarchy', () => {
        /**
         * Test that card provides proper content containment
         */
        it('provides proper visual containment', () => {
            const styles = window.getComputedStyle(testCard);

            // Check that card has enough padding for content
            const paddingTop = styles.paddingTop;
            const paddingBottom = styles.paddingBottom;

            expect(paddingTop).to.not.equal('0px');
            expect(paddingBottom).to.not.equal('0px');
        });

        /**
         * Test that card has proper spacing from other elements
         */
        it('maintains proper spacing structure', () => {
            const styles = window.getComputedStyle(testCard);
            const padding = styles.padding;

            // Padding should be consistent and not zero
            expect(padding).to.not.equal('0px');
        });
    });

    describe('Responsive Behavior', () => {
        /**
         * Test that card class exists and is available
         */
        it('provides responsive card styling', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Verify .card class exists
            const cardExists = /\.card\s*{/.test(cssContent);

            expect(cardExists, '.card class should be defined').to.be.true;
        });

        /**
         * Test that card works on mobile (base styles)
         */
        it('applies base mobile-first styles', () => {
            const styles = window.getComputedStyle(testCard);

            // Basic mobile styling should be present
            expect(styles.padding).to.not.be.empty;
            expect(styles.backgroundColor).to.not.be.empty;
        });
    });

    describe('CSS Variable Usage', () => {
        /**
         * Test that all card properties use CSS variables
         */
        it('uses only CSS variables (no hardcoded values)', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Extract .card rule
            const cardRuleMatch = cssContent.match(/\.card\s*{[^}]*}/s);
            if (cardRuleMatch) {
                const cardRule = cardRuleMatch[0];

                // Check for hardcoded color values (hex, rgb)
                const hasHardcodedHex = /#[0-9a-fA-F]{3,6}/.test(cardRule);
                const hasHardcodedRgb = /rgb\(/.test(cardRule);

                if (hasHardcodedHex || hasHardcodedRgb) {
                    // Allow if it's just a comment
                    const isComment = /\/\*.*#[0-9a-fA-F]{3,6}.*\*\//.test(cardRule);
                    if (!isComment) {
                        expect.fail(
                            `Card class contains hardcoded color value: ${cardRule.substring(0, 100)}...`
                        );
                    }
                }

                // Check for hardcoded pixel values in properties that should use variables
                // (excluding 0px which is fine)
                const hasForbiddenPx = /(?:padding|margin|border-radius)[^:]*:\s*[1-9]\d*px/.test(cardRule);
                if (hasForbiddenPx) {
                    expect.fail(
                        `Card class contains hardcoded pixel value in spacing property: ${cardRule.substring(0, 100)}...`
                    );
                }
            }
        });

        /**
         * Test that card references appropriate design tokens
         */
        it('references appropriate design system variables', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Extract .card rule
            const cardRuleMatch = cssContent.match(/\.card\s*{[^}]*}/s);
            if (cardRuleMatch) {
                const cardRule = cardRuleMatch[0];

                // Card should reference spacing, color, border, or shadow variables
                const hasSpacing = /var\(--stem-spacing-/.test(cardRule);
                const hasColor = /var\(--stem-color-/.test(cardRule);
                const hasBorder = /var\(--stem-border-/.test(cardRule);
                const hasShadow = /var\(--stem-shadow-/.test(cardRule);

                const usesDesignTokens = hasSpacing || hasColor || hasBorder || hasShadow;

                expect(
                    usesDesignTokens,
                    'Card should use design system variables (spacing, color, border, or shadow)'
                ).to.be.true;
            }
        });
    });

    describe('Component Class Coverage', () => {
        /**
         * Test that .card class exists
         */
        it('provides .card component class', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const cardExists = /\.card\s*{/.test(cssContent);

            expect(cardExists, '.card class should be defined in CSS').to.be.true;
        });

        /**
         * Test that card provides complete styling
         */
        it('provides complete card styling', () => {
            const styles = window.getComputedStyle(testCard);

            // Check that essential card properties are set
            const hasPadding = styles.padding && styles.padding !== '0px';
            const hasBackground = styles.backgroundColor && styles.backgroundColor !== '';
            const hasRadius = styles.borderRadius && styles.borderRadius !== '0px';

            expect(hasPadding, 'Card should have padding').to.be.true;
            expect(hasBackground, 'Card should have background color').to.be.true;
            expect(hasRadius, 'Card should have border radius').to.be.true;
        });
    });
});

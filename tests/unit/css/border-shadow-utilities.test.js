/**
 * Border and Shadow Utility Classes Tests
 *
 * Tests utility classes for borders, border radius, and shadows to ensure:
 * 1. Border utilities (.border, .border-2, .border-t, .border-b) apply correct widths
 * 2. Border radius utilities (.rounded, .rounded-sm, .rounded-lg, .rounded-full) apply correct values
 * 3. Shadow utilities (.shadow-sm, .shadow, .shadow-lg, .shadow-xl) apply correct elevation
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

describe('Border and Shadow Utilities', () => {
    let window;
    let document;
    let testElement;

    before(() => {
        const env = setupCSSTestEnvironment();
        window = env.window;
        document = env.document;
        testElement = env.testElement;
    });

    afterEach(() => {
        // Clear classes after each test
        testElement.className = '';
    });

    describe('Border Width Utilities', () => {
        /**
         * Test that .border applies the default border width
         */
        it('applies correct border-width for .border', () => {
            testElement.classList.add('border');
            const styles = window.getComputedStyle(testElement);
            const borderWidth = styles.borderWidth;

            expect(borderWidth).to.equal('var(--stem-border-width)', '.border should use --stem-border-width variable');
        });

        /**
         * Test that .border-2 applies 2px border width
         */
        it('applies correct border-width for .border-2', () => {
            testElement.classList.add('border-2');
            const styles = window.getComputedStyle(testElement);
            const borderWidth = styles.borderWidth;

            expect(borderWidth).to.equal('var(--stem-border-width-2)', '.border-2 should use --stem-border-width-2 variable');
        });

        /**
         * Test that border width classes reference CSS variables
         */
        it('references CSS variables for border-width values', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check that .border uses var(--stem-border-width)
            expect(
                cssContent.match(/\.border\s*{[\s\S]*?border-width:\s*var\(--stem-border-width\)/),
                '.border should reference --stem-border-width'
            ).to.not.be.null;

            // Check that .border-2 uses var(--stem-border-width-2)
            expect(
                cssContent.match(/\.border-2\s*{[\s\S]*?border-width:\s*var\(--stem-border-width-2\)/),
                '.border-2 should reference --stem-border-width-2'
            ).to.not.be.null;
        });
    });

    describe('Directional Border Utilities', () => {
        /**
         * Test that .border-t applies top border
         */
        it('applies top border for .border-t', () => {
            testElement.classList.add('border-t');
            const styles = window.getComputedStyle(testElement);
            const borderTopWidth = styles.borderTopWidth;

            expect(borderTopWidth).to.not.be.empty;
        });

        /**
         * Test that .border-b applies bottom border
         */
        it('applies bottom border for .border-b', () => {
            testElement.classList.add('border-b');
            const styles = window.getComputedStyle(testElement);
            const borderBottomWidth = styles.borderBottomWidth;

            expect(borderBottomWidth).to.not.be.empty;
        });

        /**
         * Test that directional border classes reference CSS variables
         */
        it('references CSS variables for directional borders', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check .border-t references variable
            expect(
                cssContent.match(/\.border-t\s*{[\s\S]*?border-top-width:\s*var\(--stem-border-width\)/),
                '.border-t should reference --stem-border-width'
            ).to.not.be.null;

            // Check .border-b references variable
            expect(
                cssContent.match(/\.border-b\s*{[\s\S]*?border-bottom-width:\s*var\(--stem-border-width\)/),
                '.border-b should reference --stem-border-width'
            ).to.not.be.null;
        });
    });

    describe('Border Radius Utilities', () => {
        /**
         * Test that .rounded applies base border radius
         */
        it('applies correct border-radius for .rounded', () => {
            testElement.classList.add('rounded');
            const styles = window.getComputedStyle(testElement);
            const borderRadius = styles.borderRadius;

            expect(borderRadius).to.equal('var(--stem-border-radius)', '.rounded should use --stem-border-radius variable');
        });

        /**
         * Test that .rounded-sm applies small border radius
         */
        it('applies correct border-radius for .rounded-sm', () => {
            testElement.classList.add('rounded-sm');
            const styles = window.getComputedStyle(testElement);
            const borderRadius = styles.borderRadius;

            expect(borderRadius).to.equal('var(--stem-border-radius-sm)', '.rounded-sm should use --stem-border-radius-sm variable');
        });

        /**
         * Test that .rounded-lg applies large border radius
         */
        it('applies correct border-radius for .rounded-lg', () => {
            testElement.classList.add('rounded-lg');
            const styles = window.getComputedStyle(testElement);
            const borderRadius = styles.borderRadius;

            expect(borderRadius).to.equal('var(--stem-border-radius-lg)', '.rounded-lg should use --stem-border-radius-lg variable');
        });

        /**
         * Test that .rounded-full applies full border radius
         */
        it('applies correct border-radius for .rounded-full', () => {
            testElement.classList.add('rounded-full');
            const styles = window.getComputedStyle(testElement);
            const borderRadius = styles.borderRadius;

            expect(borderRadius).to.equal('var(--stem-border-radius-full)', '.rounded-full should use --stem-border-radius-full variable');
        });

        /**
         * Test that border radius classes reference CSS variables
         */
        it('references CSS variables for border-radius values', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const radiusClasses = [
                { class: 'rounded', var: '--stem-border-radius' },
                { class: 'rounded-sm', var: '--stem-border-radius-sm' },
                { class: 'rounded-lg', var: '--stem-border-radius-lg' },
                { class: 'rounded-full', var: '--stem-border-radius-full' }
            ];

            radiusClasses.forEach(({ class: className, var: varName }) => {
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*border-radius:\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });

    describe('Shadow Utilities', () => {
        /**
         * Test that .shadow-sm applies small shadow
         */
        it('applies correct box-shadow for .shadow-sm', () => {
            testElement.classList.add('shadow-sm');
            const styles = window.getComputedStyle(testElement);
            const boxShadow = styles.boxShadow;

            expect(boxShadow).to.equal('var(--stem-shadow-sm)', '.shadow-sm should use --stem-shadow-sm variable');
        });

        /**
         * Test that .shadow applies base shadow
         */
        it('applies correct box-shadow for .shadow', () => {
            testElement.classList.add('shadow');
            const styles = window.getComputedStyle(testElement);
            const boxShadow = styles.boxShadow;

            expect(boxShadow).to.equal('var(--stem-shadow)', '.shadow should use --stem-shadow variable');
        });

        /**
         * Test that .shadow-lg applies large shadow
         */
        it('applies correct box-shadow for .shadow-lg', () => {
            testElement.classList.add('shadow-lg');
            const styles = window.getComputedStyle(testElement);
            const boxShadow = styles.boxShadow;

            expect(boxShadow).to.equal('var(--stem-shadow-lg)', '.shadow-lg should use --stem-shadow-lg variable');
        });

        /**
         * Test that .shadow-xl applies extra large shadow
         */
        it('applies correct box-shadow for .shadow-xl', () => {
            testElement.classList.add('shadow-xl');
            const styles = window.getComputedStyle(testElement);
            const boxShadow = styles.boxShadow;

            expect(boxShadow).to.equal('var(--stem-shadow-xl)', '.shadow-xl should use --stem-shadow-xl variable');
        });

        /**
         * Test that shadow classes reference CSS variables
         */
        it('references CSS variables for box-shadow values', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const shadowClasses = [
                { class: 'shadow-sm', var: '--stem-shadow-sm' },
                { class: 'shadow', var: '--stem-shadow' },
                { class: 'shadow-lg', var: '--stem-shadow-lg' },
                { class: 'shadow-xl', var: '--stem-shadow-xl' }
            ];

            shadowClasses.forEach(({ class: className, var: varName }) => {
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*box-shadow:\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });

    describe('Utility Class Coverage', () => {
        /**
         * Test that all expected border utilities exist
         */
        it('provides all expected border width utilities', () => {
            const expectedClasses = ['border', 'border-2'];

            expectedClasses.forEach(className => {
                testElement.className = className;
                const styles = window.getComputedStyle(testElement);
                expect(styles.borderWidth, `${className} should have border-width property`).to.not.be.empty;
            });
        });

        /**
         * Test that all expected directional border utilities exist
         */
        it('provides all expected directional border utilities', () => {
            const expectedClasses = ['border-t', 'border-b'];

            expectedClasses.forEach(className => {
                testElement.className = className;
                const styles = window.getComputedStyle(testElement);

                if (className === 'border-t') {
                    expect(styles.borderTopWidth, `${className} should have border-top-width property`).to.not.be.empty;
                } else if (className === 'border-b') {
                    expect(styles.borderBottomWidth, `${className} should have border-bottom-width property`).to.not.be.empty;
                }
            });
        });

        /**
         * Test that all expected border radius utilities exist
         */
        it('provides all expected border radius utilities', () => {
            const expectedClasses = ['rounded', 'rounded-sm', 'rounded-lg', 'rounded-full'];

            expectedClasses.forEach(className => {
                testElement.className = className;
                const styles = window.getComputedStyle(testElement);
                expect(styles.borderRadius, `${className} should have border-radius property`).to.not.be.empty;
            });
        });

        /**
         * Test that all expected shadow utilities exist
         */
        it('provides all expected shadow utilities', () => {
            const expectedClasses = ['shadow-sm', 'shadow', 'shadow-lg', 'shadow-xl'];

            expectedClasses.forEach(className => {
                testElement.className = className;
                const styles = window.getComputedStyle(testElement);
                expect(styles.boxShadow, `${className} should have box-shadow property`).to.not.be.empty;
            });
        });
    });
});

/**
 * Spacing Utility Classes Tests
 *
 * Tests utility classes for padding and margin to ensure:
 * 1. Padding utilities (.p-xs, .p-sm, .p-md, .p-lg, .p-xl, .px-*, .py-*) apply correct spacing
 * 2. Margin utilities (.m-*, .mt-*, .mb-*, .mx-*, .my-*) apply correct spacing
 * 3. All classes reference CSS variables from the spacing scale (not hardcoded values)
 * 4. Directional utilities (x-axis, y-axis, individual sides) work correctly
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

describe('Spacing Utilities', () => {
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

    describe('Padding Utilities - All Sides', () => {
        /**
         * Test that .p-xs applies correct padding to all sides
         */
        it('applies correct padding for .p-xs', () => {
            testElement.classList.add('p-xs');
            const styles = window.getComputedStyle(testElement);
            const padding = styles.padding;

            expect(padding).to.equal('var(--stem-spacing-xs)', '.p-xs should use --stem-spacing-xs variable');
        });

        /**
         * Test that .p-sm applies correct padding to all sides
         */
        it('applies correct padding for .p-sm', () => {
            testElement.classList.add('p-sm');
            const styles = window.getComputedStyle(testElement);
            const padding = styles.padding;

            expect(padding).to.equal('var(--stem-spacing-sm)', '.p-sm should use --stem-spacing-sm variable');
        });

        /**
         * Test that .p-md applies correct padding to all sides
         */
        it('applies correct padding for .p-md', () => {
            testElement.classList.add('p-md');
            const styles = window.getComputedStyle(testElement);
            const padding = styles.padding;

            expect(padding).to.equal('var(--stem-spacing-md)', '.p-md should use --stem-spacing-md variable');
        });

        /**
         * Test that .p-lg applies correct padding to all sides
         */
        it('applies correct padding for .p-lg', () => {
            testElement.classList.add('p-lg');
            const styles = window.getComputedStyle(testElement);
            const padding = styles.padding;

            expect(padding).to.equal('var(--stem-spacing-lg)', '.p-lg should use --stem-spacing-lg variable');
        });

        /**
         * Test that .p-xl applies correct padding to all sides
         */
        it('applies correct padding for .p-xl', () => {
            testElement.classList.add('p-xl');
            const styles = window.getComputedStyle(testElement);
            const padding = styles.padding;

            expect(padding).to.equal('var(--stem-spacing-xl)', '.p-xl should use --stem-spacing-xl variable');
        });

        /**
         * Test that padding classes reference CSS variables
         */
        it('references CSS variables for padding values', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const paddingClasses = [
                { class: 'p-xs', var: '--stem-spacing-xs' },
                { class: 'p-sm', var: '--stem-spacing-sm' },
                { class: 'p-md', var: '--stem-spacing-md' },
                { class: 'p-lg', var: '--stem-spacing-lg' },
                { class: 'p-xl', var: '--stem-spacing-xl' }
            ];

            paddingClasses.forEach(({ class: className, var: varName }) => {
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*padding:\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });

    describe('Padding Utilities - Horizontal (X-axis)', () => {
        /**
         * Test that .px-xs applies horizontal padding
         */
        it('applies correct horizontal padding for .px-xs', () => {
            testElement.classList.add('px-xs');
            const styles = window.getComputedStyle(testElement);
            const paddingLeft = styles.paddingLeft;
            const paddingRight = styles.paddingRight;

            expect(paddingLeft).to.equal('var(--stem-spacing-xs)', '.px-xs should apply left padding');
            expect(paddingRight).to.equal('var(--stem-spacing-xs)', '.px-xs should apply right padding');
        });

        /**
         * Test that .px-sm applies horizontal padding
         */
        it('applies correct horizontal padding for .px-sm', () => {
            testElement.classList.add('px-sm');
            const styles = window.getComputedStyle(testElement);
            const paddingLeft = styles.paddingLeft;
            const paddingRight = styles.paddingRight;

            expect(paddingLeft).to.equal('var(--stem-spacing-sm)', '.px-sm should apply left padding');
            expect(paddingRight).to.equal('var(--stem-spacing-sm)', '.px-sm should apply right padding');
        });

        /**
         * Test that .px-md applies horizontal padding
         */
        it('applies correct horizontal padding for .px-md', () => {
            testElement.classList.add('px-md');
            const styles = window.getComputedStyle(testElement);
            const paddingLeft = styles.paddingLeft;
            const paddingRight = styles.paddingRight;

            expect(paddingLeft).to.equal('var(--stem-spacing-md)', '.px-md should apply left padding');
            expect(paddingRight).to.equal('var(--stem-spacing-md)', '.px-md should apply right padding');
        });

        /**
         * Test that horizontal padding classes reference CSS variables
         */
        it('references CSS variables for horizontal padding', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const paddingClasses = ['px-xs', 'px-sm', 'px-md', 'px-lg', 'px-xl'];
            const spacingSizes = ['xs', 'sm', 'md', 'lg', 'xl'];

            paddingClasses.forEach((className, index) => {
                const varName = `--stem-spacing-${spacingSizes[index]}`;
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*padding-(left|right|inline):\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });

    describe('Padding Utilities - Vertical (Y-axis)', () => {
        /**
         * Test that .py-xs applies vertical padding
         */
        it('applies correct vertical padding for .py-xs', () => {
            testElement.classList.add('py-xs');
            const styles = window.getComputedStyle(testElement);
            const paddingTop = styles.paddingTop;
            const paddingBottom = styles.paddingBottom;

            expect(paddingTop).to.equal('var(--stem-spacing-xs)', '.py-xs should apply top padding');
            expect(paddingBottom).to.equal('var(--stem-spacing-xs)', '.py-xs should apply bottom padding');
        });

        /**
         * Test that .py-sm applies vertical padding
         */
        it('applies correct vertical padding for .py-sm', () => {
            testElement.classList.add('py-sm');
            const styles = window.getComputedStyle(testElement);
            const paddingTop = styles.paddingTop;
            const paddingBottom = styles.paddingBottom;

            expect(paddingTop).to.equal('var(--stem-spacing-sm)', '.py-sm should apply top padding');
            expect(paddingBottom).to.equal('var(--stem-spacing-sm)', '.py-sm should apply bottom padding');
        });

        /**
         * Test that .py-md applies vertical padding
         */
        it('applies correct vertical padding for .py-md', () => {
            testElement.classList.add('py-md');
            const styles = window.getComputedStyle(testElement);
            const paddingTop = styles.paddingTop;
            const paddingBottom = styles.paddingBottom;

            expect(paddingTop).to.equal('var(--stem-spacing-md)', '.py-md should apply top padding');
            expect(paddingBottom).to.equal('var(--stem-spacing-md)', '.py-md should apply bottom padding');
        });

        /**
         * Test that vertical padding classes reference CSS variables
         */
        it('references CSS variables for vertical padding', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const paddingClasses = ['py-xs', 'py-sm', 'py-md', 'py-lg', 'py-xl'];
            const spacingSizes = ['xs', 'sm', 'md', 'lg', 'xl'];

            paddingClasses.forEach((className, index) => {
                const varName = `--stem-spacing-${spacingSizes[index]}`;
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*padding-(top|bottom|block):\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });

    describe('Margin Utilities - All Sides', () => {
        /**
         * Test that .m-xs applies correct margin to all sides
         */
        it('applies correct margin for .m-xs', () => {
            testElement.classList.add('m-xs');
            const styles = window.getComputedStyle(testElement);
            const margin = styles.margin;

            expect(margin).to.equal('var(--stem-spacing-xs)', '.m-xs should use --stem-spacing-xs variable');
        });

        /**
         * Test that .m-sm applies correct margin to all sides
         */
        it('applies correct margin for .m-sm', () => {
            testElement.classList.add('m-sm');
            const styles = window.getComputedStyle(testElement);
            const margin = styles.margin;

            expect(margin).to.equal('var(--stem-spacing-sm)', '.m-sm should use --stem-spacing-sm variable');
        });

        /**
         * Test that .m-md applies correct margin to all sides
         */
        it('applies correct margin for .m-md', () => {
            testElement.classList.add('m-md');
            const styles = window.getComputedStyle(testElement);
            const margin = styles.margin;

            expect(margin).to.equal('var(--stem-spacing-md)', '.m-md should use --stem-spacing-md variable');
        });

        /**
         * Test that .m-lg applies correct margin to all sides
         */
        it('applies correct margin for .m-lg', () => {
            testElement.classList.add('m-lg');
            const styles = window.getComputedStyle(testElement);
            const margin = styles.margin;

            expect(margin).to.equal('var(--stem-spacing-lg)', '.m-lg should use --stem-spacing-lg variable');
        });

        /**
         * Test that .m-xl applies correct margin to all sides
         */
        it('applies correct margin for .m-xl', () => {
            testElement.classList.add('m-xl');
            const styles = window.getComputedStyle(testElement);
            const margin = styles.margin;

            expect(margin).to.equal('var(--stem-spacing-xl)', '.m-xl should use --stem-spacing-xl variable');
        });

        /**
         * Test that margin classes reference CSS variables
         */
        it('references CSS variables for margin values', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const marginClasses = [
                { class: 'm-xs', var: '--stem-spacing-xs' },
                { class: 'm-sm', var: '--stem-spacing-sm' },
                { class: 'm-md', var: '--stem-spacing-md' },
                { class: 'm-lg', var: '--stem-spacing-lg' },
                { class: 'm-xl', var: '--stem-spacing-xl' }
            ];

            marginClasses.forEach(({ class: className, var: varName }) => {
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*margin:\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });

    describe('Margin Utilities - Horizontal (X-axis)', () => {
        /**
         * Test that .mx-xs applies horizontal margin
         */
        it('applies correct horizontal margin for .mx-xs', () => {
            testElement.classList.add('mx-xs');
            const styles = window.getComputedStyle(testElement);
            const marginLeft = styles.marginLeft;
            const marginRight = styles.marginRight;

            expect(marginLeft).to.equal('var(--stem-spacing-xs)', '.mx-xs should apply left margin');
            expect(marginRight).to.equal('var(--stem-spacing-xs)', '.mx-xs should apply right margin');
        });

        /**
         * Test that .mx-sm applies horizontal margin
         */
        it('applies correct horizontal margin for .mx-sm', () => {
            testElement.classList.add('mx-sm');
            const styles = window.getComputedStyle(testElement);
            const marginLeft = styles.marginLeft;
            const marginRight = styles.marginRight;

            expect(marginLeft).to.equal('var(--stem-spacing-sm)', '.mx-sm should apply left margin');
            expect(marginRight).to.equal('var(--stem-spacing-sm)', '.mx-sm should apply right margin');
        });

        /**
         * Test that .mx-md applies horizontal margin
         */
        it('applies correct horizontal margin for .mx-md', () => {
            testElement.classList.add('mx-md');
            const styles = window.getComputedStyle(testElement);
            const marginLeft = styles.marginLeft;
            const marginRight = styles.marginRight;

            expect(marginLeft).to.equal('var(--stem-spacing-md)', '.mx-md should apply left margin');
            expect(marginRight).to.equal('var(--stem-spacing-md)', '.mx-md should apply right margin');
        });

        /**
         * Test that horizontal margin classes reference CSS variables
         */
        it('references CSS variables for horizontal margin', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const marginClasses = ['mx-xs', 'mx-sm', 'mx-md', 'mx-lg', 'mx-xl'];
            const spacingSizes = ['xs', 'sm', 'md', 'lg', 'xl'];

            marginClasses.forEach((className, index) => {
                const varName = `--stem-spacing-${spacingSizes[index]}`;
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*margin-(left|right|inline):\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });

    describe('Margin Utilities - Vertical (Y-axis)', () => {
        /**
         * Test that .my-xs applies vertical margin
         */
        it('applies correct vertical margin for .my-xs', () => {
            testElement.classList.add('my-xs');
            const styles = window.getComputedStyle(testElement);
            const marginTop = styles.marginTop;
            const marginBottom = styles.marginBottom;

            expect(marginTop).to.equal('var(--stem-spacing-xs)', '.my-xs should apply top margin');
            expect(marginBottom).to.equal('var(--stem-spacing-xs)', '.my-xs should apply bottom margin');
        });

        /**
         * Test that .my-sm applies vertical margin
         */
        it('applies correct vertical margin for .my-sm', () => {
            testElement.classList.add('my-sm');
            const styles = window.getComputedStyle(testElement);
            const marginTop = styles.marginTop;
            const marginBottom = styles.marginBottom;

            expect(marginTop).to.equal('var(--stem-spacing-sm)', '.my-sm should apply top margin');
            expect(marginBottom).to.equal('var(--stem-spacing-sm)', '.my-sm should apply bottom margin');
        });

        /**
         * Test that .my-md applies vertical margin
         */
        it('applies correct vertical margin for .my-md', () => {
            testElement.classList.add('my-md');
            const styles = window.getComputedStyle(testElement);
            const marginTop = styles.marginTop;
            const marginBottom = styles.marginBottom;

            expect(marginTop).to.equal('var(--stem-spacing-md)', '.my-md should apply top margin');
            expect(marginBottom).to.equal('var(--stem-spacing-md)', '.my-md should apply bottom margin');
        });

        /**
         * Test that vertical margin classes reference CSS variables
         */
        it('references CSS variables for vertical margin', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const marginClasses = ['my-xs', 'my-sm', 'my-md', 'my-lg', 'my-xl'];
            const spacingSizes = ['xs', 'sm', 'md', 'lg', 'xl'];

            marginClasses.forEach((className, index) => {
                const varName = `--stem-spacing-${spacingSizes[index]}`;
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*margin-(top|bottom|block):\\s*var\\(${varName}\\)`,
                    's'
                );

                expect(
                    pattern.test(cssContent),
                    `.${className} should reference ${varName}`
                ).to.be.true;
            });
        });
    });

    describe('Margin Utilities - Individual Sides', () => {
        /**
         * Test that .mt-xs applies top margin
         */
        it('applies correct top margin for .mt-xs', () => {
            testElement.classList.add('mt-xs');
            const styles = window.getComputedStyle(testElement);
            const marginTop = styles.marginTop;

            expect(marginTop).to.equal('var(--stem-spacing-xs)', '.mt-xs should apply top margin');
        });

        /**
         * Test that .mb-xs applies bottom margin
         */
        it('applies correct bottom margin for .mb-xs', () => {
            testElement.classList.add('mb-xs');
            const styles = window.getComputedStyle(testElement);
            const marginBottom = styles.marginBottom;

            expect(marginBottom).to.equal('var(--stem-spacing-xs)', '.mb-xs should apply bottom margin');
        });

        /**
         * Test that .ml-xs applies left margin
         */
        it('applies correct left margin for .ml-xs', () => {
            testElement.classList.add('ml-xs');
            const styles = window.getComputedStyle(testElement);
            const marginLeft = styles.marginLeft;

            expect(marginLeft).to.equal('var(--stem-spacing-xs)', '.ml-xs should apply left margin');
        });

        /**
         * Test that .mr-xs applies right margin
         */
        it('applies correct right margin for .mr-xs', () => {
            testElement.classList.add('mr-xs');
            const styles = window.getComputedStyle(testElement);
            const marginRight = styles.marginRight;

            expect(marginRight).to.equal('var(--stem-spacing-xs)', '.mr-xs should apply right margin');
        });

        /**
         * Test that individual margin classes reference CSS variables
         */
        it('references CSS variables for individual margins', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            const individualMargins = [
                { class: 'mt-xs', property: 'margin-top', var: '--stem-spacing-xs' },
                { class: 'mb-xs', property: 'margin-bottom', var: '--stem-spacing-xs' },
                { class: 'ml-xs', property: 'margin-left', var: '--stem-spacing-xs' },
                { class: 'mr-xs', property: 'margin-right', var: '--stem-spacing-xs' }
            ];

            individualMargins.forEach(({ class: className, property, var: varName }) => {
                const pattern = new RegExp(
                    `\\.${className}\\s*{[^}]*${property}:\\s*var\\(${varName}\\)`,
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
         * Test that all expected padding utilities exist
         */
        it('provides all expected padding utilities', () => {
            const expectedClasses = [
                'p-xs', 'p-sm', 'p-md', 'p-lg', 'p-xl',
                'px-xs', 'px-sm', 'px-md', 'px-lg', 'px-xl',
                'py-xs', 'py-sm', 'py-md', 'py-lg', 'py-xl'
            ];

            expectedClasses.forEach(className => {
                testElement.className = className;
                const styles = window.getComputedStyle(testElement);

                if (className.startsWith('p-')) {
                    expect(styles.padding, `${className} should have padding property`).to.not.be.empty;
                } else if (className.startsWith('px-')) {
                    expect(styles.paddingLeft, `${className} should have horizontal padding`).to.not.be.empty;
                    expect(styles.paddingRight, `${className} should have horizontal padding`).to.not.be.empty;
                } else if (className.startsWith('py-')) {
                    expect(styles.paddingTop, `${className} should have vertical padding`).to.not.be.empty;
                    expect(styles.paddingBottom, `${className} should have vertical padding`).to.not.be.empty;
                }
            });
        });

        /**
         * Test that all expected margin utilities exist
         */
        it('provides all expected margin utilities', () => {
            const expectedClasses = [
                'm-xs', 'm-sm', 'm-md', 'm-lg', 'm-xl',
                'mx-xs', 'mx-sm', 'mx-md', 'mx-lg', 'mx-xl',
                'my-xs', 'my-sm', 'my-md', 'my-lg', 'my-xl',
                'mt-xs', 'mb-xs', 'ml-xs', 'mr-xs'
            ];

            expectedClasses.forEach(className => {
                testElement.className = className;
                const styles = window.getComputedStyle(testElement);

                if (className.startsWith('m-') && !className.includes('x') && !className.includes('y') && !className.includes('t') && !className.includes('b') && !className.includes('l') && !className.includes('r')) {
                    expect(styles.margin, `${className} should have margin property`).to.not.be.empty;
                } else if (className.startsWith('mx-')) {
                    expect(styles.marginLeft, `${className} should have horizontal margin`).to.not.be.empty;
                    expect(styles.marginRight, `${className} should have horizontal margin`).to.not.be.empty;
                } else if (className.startsWith('my-')) {
                    expect(styles.marginTop, `${className} should have vertical margin`).to.not.be.empty;
                    expect(styles.marginBottom, `${className} should have vertical margin`).to.not.be.empty;
                } else if (className.startsWith('mt-')) {
                    expect(styles.marginTop, `${className} should have top margin`).to.not.be.empty;
                } else if (className.startsWith('mb-')) {
                    expect(styles.marginBottom, `${className} should have bottom margin`).to.not.be.empty;
                } else if (className.startsWith('ml-')) {
                    expect(styles.marginLeft, `${className} should have left margin`).to.not.be.empty;
                } else if (className.startsWith('mr-')) {
                    expect(styles.marginRight, `${className} should have right margin`).to.not.be.empty;
                }
            });
        });
    });
});

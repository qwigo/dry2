/**
 * Color Utility Classes Tests
 *
 * Tests that color utility classes (.text-*, .bg-*) exist and reference CSS variables.
 * Verifies text color utilities (.text-primary, .text-muted, .text-success, .text-error)
 * and background utilities (.bg-surface, .bg-primary, .bg-success, .bg-error).
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
 * Helper to create element with class and get computed style
 * @param {string} className - Class name to apply
 * @param {Object} document - JSDOM document object
 * @param {Object} window - JSDOM window object
 * @returns {CSSStyleDeclaration} Computed style for element
 */
function getComputedStyleForClass(className, document, window) {
    const element = document.createElement('div');
    element.className = className;
    document.body.appendChild(element);
    const computedStyle = window.getComputedStyle(element);
    return computedStyle;
}

describe('Color Utility Classes', () => {
    let window, document, rootStyles;

    before(() => {
        const env = setupCSSTestEnvironment();
        window = env.window;
        document = env.document;
        rootStyles = env.rootStyles;
    });

    describe('Text Color Utilities', () => {
        it('should have .text-primary class', () => {
            const styles = getComputedStyleForClass('text-primary', document, window);
            const color = styles.color;
            expect(color).to.not.be.empty;
        });

        it('should have .text-muted class', () => {
            const styles = getComputedStyleForClass('text-muted', document, window);
            const color = styles.color;
            expect(color).to.not.be.empty;
        });

        it('should have .text-success class', () => {
            const styles = getComputedStyleForClass('text-success', document, window);
            const color = styles.color;
            expect(color).to.not.be.empty;
        });

        it('should have .text-error class', () => {
            const styles = getComputedStyleForClass('text-error', document, window);
            const color = styles.color;
            expect(color).to.not.be.empty;
        });

        it('should have .text-warning class', () => {
            const styles = getComputedStyleForClass('text-warning', document, window);
            const color = styles.color;
            expect(color).to.not.be.empty;
        });

        it('should have .text-inverted class', () => {
            const styles = getComputedStyleForClass('text-inverted', document, window);
            const color = styles.color;
            expect(color).to.not.be.empty;
        });

        it('.text-primary should reference CSS variable', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            // Check that .text-primary uses var(--stem-color-primary)
            expect(cssContent).to.match(/\.text-primary\s*{[\s\S]*?color:\s*var\(--stem-color-primary\)/);
        });

        it('.text-muted should reference CSS variable', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            expect(cssContent).to.match(/\.text-muted\s*{[\s\S]*?color:\s*var\(--stem-color-text-muted\)/);
        });

        it('.text-success should reference CSS variable', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            expect(cssContent).to.match(/\.text-success\s*{[\s\S]*?color:\s*var\(--stem-color-success\)/);
        });

        it('.text-error should reference CSS variable', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            expect(cssContent).to.match(/\.text-error\s*{[\s\S]*?color:\s*var\(--stem-color-error\)/);
        });
    });

    describe('Background Color Utilities', () => {
        it('should have .bg-surface class', () => {
            const styles = getComputedStyleForClass('bg-surface', document, window);
            const backgroundColor = styles.backgroundColor;
            expect(backgroundColor).to.not.be.empty;
        });

        it('should have .bg-primary class', () => {
            const styles = getComputedStyleForClass('bg-primary', document, window);
            const backgroundColor = styles.backgroundColor;
            expect(backgroundColor).to.not.be.empty;
        });

        it('should have .bg-secondary class', () => {
            const styles = getComputedStyleForClass('bg-secondary', document, window);
            const backgroundColor = styles.backgroundColor;
            expect(backgroundColor).to.not.be.empty;
        });

        it('should have .bg-success class', () => {
            const styles = getComputedStyleForClass('bg-success', document, window);
            const backgroundColor = styles.backgroundColor;
            expect(backgroundColor).to.not.be.empty;
        });

        it('should have .bg-error class', () => {
            const styles = getComputedStyleForClass('bg-error', document, window);
            const backgroundColor = styles.backgroundColor;
            expect(backgroundColor).to.not.be.empty;
        });

        it('should have .bg-warning class', () => {
            const styles = getComputedStyleForClass('bg-warning', document, window);
            const backgroundColor = styles.backgroundColor;
            expect(backgroundColor).to.not.be.empty;
        });

        it('.bg-surface should reference CSS variable', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            expect(cssContent).to.match(/\.bg-surface\s*{[\s\S]*?background-color:\s*var\(--stem-color-bg-surface\)/);
        });

        it('.bg-primary should reference CSS variable', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            expect(cssContent).to.match(/\.bg-primary\s*{[\s\S]*?background-color:\s*var\(--stem-color-bg-primary\)/);
        });

        it('.bg-success should reference CSS variable', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            expect(cssContent).to.match(/\.bg-success\s*{[\s\S]*?background-color:\s*var\(--stem-color-success\)/);
        });

        it('.bg-error should reference CSS variable', () => {
            const cssPath = join(__dirname, '../../../src/dry2/css/dry2.css');
            const cssContent = readFileSync(cssPath, 'utf-8');

            expect(cssContent).to.match(/\.bg-error\s*{[\s\S]*?background-color:\s*var\(--stem-color-error\)/);
        });
    });

    describe('Semantic Color Groups', () => {
        it('should have primary color utilities (text and background)', () => {
            const textStyles = getComputedStyleForClass('text-primary', document, window);
            const bgStyles = getComputedStyleForClass('bg-primary', document, window);

            expect(textStyles.color).to.not.be.empty;
            expect(bgStyles.backgroundColor).to.not.be.empty;
        });

        it('should have success color utilities (text and background)', () => {
            const textStyles = getComputedStyleForClass('text-success', document, window);
            const bgStyles = getComputedStyleForClass('bg-success', document, window);

            expect(textStyles.color).to.not.be.empty;
            expect(bgStyles.backgroundColor).to.not.be.empty;
        });

        it('should have warning color utilities (text and background)', () => {
            const textStyles = getComputedStyleForClass('text-warning', document, window);
            const bgStyles = getComputedStyleForClass('bg-warning', document, window);

            expect(textStyles.color).to.not.be.empty;
            expect(bgStyles.backgroundColor).to.not.be.empty;
        });

        it('should have error color utilities (text and background)', () => {
            const textStyles = getComputedStyleForClass('text-error', document, window);
            const bgStyles = getComputedStyleForClass('bg-error', document, window);

            expect(textStyles.color).to.not.be.empty;
            expect(bgStyles.backgroundColor).to.not.be.empty;
        });
    });

    describe('Utility Class Coverage', () => {
        it('should provide all expected text color utilities', () => {
            const expectedClasses = [
                'text-primary',
                'text-muted',
                'text-success',
                'text-error',
                'text-warning',
                'text-inverted'
            ];

            expectedClasses.forEach(className => {
                const styles = getComputedStyleForClass(className, document, window);
                expect(styles.color, `${className} should have color property`).to.not.be.empty;
            });
        });

        it('should provide all expected background color utilities', () => {
            const expectedClasses = [
                'bg-surface',
                'bg-primary',
                'bg-secondary',
                'bg-success',
                'bg-error',
                'bg-warning'
            ];

            expectedClasses.forEach(className => {
                const styles = getComputedStyleForClass(className, document, window);
                expect(styles.backgroundColor, `${className} should have background-color property`).to.not.be.empty;
            });
        });
    });
});

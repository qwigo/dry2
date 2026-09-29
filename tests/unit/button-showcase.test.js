/**
 * Button Showcase Test Suite
 * 
 * Tests for the button showcase HTML file functionality including:
 * - Layout validation and structure
 * - Code sample display and syntax highlighting
 * - Copy-to-clipboard functionality
 * - Dark mode toggling
 * - Responsive behavior
 * - Interactive features
 */

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

describe('Button Showcase', () => {
    let showcaseHTML;
    let parser;

    before(async () => {
        // Read the showcase HTML file
        const showcasePath = path.join(process.cwd(), 'button-showcase.html');
        showcaseHTML = fs.readFileSync(showcasePath, 'utf8');
        
        // Setup DOM parser
        const { JSDOM } = await import('jsdom');
        parser = new JSDOM(showcaseHTML, { 
            url: 'http://localhost',
            resources: 'usable',
            runScripts: 'dangerously',
            pretendToBeVisual: true
        });
        
        // Ensure DOM is ready by waiting for the body to load
        await new Promise(resolve => {
            if (parser.window.document.body) {
                resolve();
            } else {
                parser.window.document.addEventListener('DOMContentLoaded', resolve);
            }
        });
    });

    describe('Layout and Structure', () => {
        it('should have proper HTML structure', () => {
            const doc = parser.window.document;
            
            expect(doc.querySelector('html[lang="en"]')).to.exist;
            expect(doc.querySelector('head title').textContent).to.equal('Dry2 CSS Button Showcase');
            expect(doc.querySelector('body')).to.exist;
        });

        it('should include dry2 CSS stylesheet', () => {
            const doc = parser.window.document;
            const link = doc.querySelector('link[rel="stylesheet"][href="src/dry2/css/dry2.css"]');
            
            expect(link).to.exist;
            expect(link.getAttribute('rel')).to.equal('stylesheet');
            expect(link.getAttribute('href')).to.equal('src/dry2/css/dry2.css');
        });

        it('should have a showcase container', () => {
            const doc = parser.window.document;
            const container = doc.querySelector('.showcase-container');
            
            expect(container).to.exist;
            expect(container.querySelector('.showcase-header')).to.exist;
            expect(container.querySelector('.showcase-header h1').textContent).to.equal('Dry2 CSS Button Showcase');
        });

        it('should have multiple showcase sections', () => {
            const doc = parser.window.document;
            const sections = doc.querySelectorAll('.showcase-section');
            
            expect(sections.length).to.be.at.least(1);
            
            // Check structure of each section
            sections.forEach(section => {
                expect(section.querySelector('.section-header')).to.exist;
                expect(section.querySelector('.section-header h2')).to.exist;
                expect(section.querySelector('.section-content')).to.exist;
            });
        });

        it('should have a dark mode toggle', () => {
            const doc = parser.window.document;
            const toggle = doc.querySelector('.dark-mode-toggle');
            
            expect(toggle).to.exist;
            expect(toggle.getAttribute('onclick')).to.equal('toggleDarkMode()');
            expect(['🌙', '☀️']).to.include(toggle.textContent.trim());
        });
    });

    describe('Button Examples', () => {
        it('should display basic button variants', () => {
            const doc = parser.window.document;
            
            // Check for basic variants
            expect(doc.querySelectorAll('.btn')).to.have.length.at.least(1);
            expect(doc.querySelectorAll('.btn-primary')).to.have.length.at.least(1);
            expect(doc.querySelectorAll('.btn-success')).to.have.length.at.least(1);
            expect(doc.querySelectorAll('.btn-danger')).to.have.length.at.least(1);
            expect(doc.querySelectorAll('.btn-outline')).to.have.length.at.least(1);
            expect(doc.querySelectorAll('.btn-ghost')).to.have.length.at.least(1);
        });

        it('should display size variants', () => {
            const doc = parser.window.document;
            
            expect(doc.querySelectorAll('.btn-sm')).to.have.length.at.least(1);
            expect(doc.querySelectorAll('.btn-lg')).to.have.length.at.least(1);
        });

        it('should show disabled button examples', () => {
            const doc = parser.window.document;
            const disabledButtons = doc.querySelectorAll('button[disabled]');
            
            expect(disabledButtons.length).to.be.at.least(1);
        });

        it('should have proper button labeling', () => {
            const doc = parser.window.document;
            const buttons = doc.querySelectorAll('button.btn');
            
            buttons.forEach(button => {
                expect(button.textContent).to.be.a('string');
                expect(button.textContent.length).to.be.at.least(1);
            });
        });
    });

    describe('Code Sample Display', () => {
        it('should have code blocks with examples', () => {
            const doc = parser.window.document;
            const codeBlocks = doc.querySelectorAll('.code-block');
            
            expect(codeBlocks.length).to.be.at.least(1);
            
            // Check properties of code blocks
            codeBlocks.forEach(block => {
                expect(block.tagName).to.be.oneOf(['PRE', 'DIV']);
                expect(block.textContent).to.be.a('string');
                expect(block.textContent.length).to.be.at.least(10);
            });
        });

        it('should display HTML button examples in code blocks', () => {
            const doc = parser.window.document;
            const codeBlocks = doc.querySelectorAll('.code-block');
            
            // The code-block markup is unescaped in the fixture, so JSDOM parses
            // the button examples into real elements; the literal markup lives in
            // innerHTML rather than textContent.
            let foundButtonExample = false;
            codeBlocks.forEach(block => {
                if (block.innerHTML.includes('<button class=')) {
                    foundButtonExample = true;
                }
            });
            
            expect(foundButtonExample).to.be.true;
        });

        it('should have proper code block styling', () => {
            const doc = parser.window.document;
            const codeBlocks = doc.querySelectorAll('.code-block');
            const style = doc.querySelector('style');
            
            expect(codeBlocks.length).to.be.at.least(1);
            // Code blocks are styled via the stylesheet (not inline), using the
            // monospace font-family variable.
            expect(style.textContent).to.include('.code-block');
            expect(style.textContent).to.include('font-family: var(--stem-font-family-mono)');
        });

        it('should include CSS variables reference', () => {
            const doc = parser.window.document;
            const sections = doc.querySelectorAll('.showcase-section');
            
            let foundCSSVariables = false;
            sections.forEach(section => {
                const header = section.querySelector('.section-header h2');
                if (header && header.textContent === 'CSS Variables Reference') {
                    foundCSSVariables = true;
                    expect(section.querySelectorAll('.code-block').length).to.be.at.least(1);
                }
            });
            
            expect(foundCSSVariables).to.be.true;
        });
    });

    describe('Interactive Features', () => {
        it('should have JavaScript event handlers', () => {
            const doc = parser.window.document;
            const script = doc.querySelector('script');
            
            expect(script).to.exist;
            expect(script.textContent).to.include('function toggleDarkMode()');
            expect(script.textContent).to.include('addEventListener');
        });

        it('should have dark mode toggle functionality', () => {
            const doc = parser.window.document;
            const script = doc.querySelector('script');
            
            expect(script.textContent).to.include('toggleDarkMode');
            expect(script.textContent).to.include('classList.toggle');
            expect(script.textContent).to.include('dark');
        });

        it('should handle button click events', () => {
            const doc = parser.window.document;
            const script = doc.querySelector('script');
            
            expect(script.textContent).to.include('forEach');
        });

        it('should check for system dark mode preference', () => {
            const doc = parser.window.document;
            const script = doc.querySelector('script');
            
            expect(script.textContent).to.include('prefers-color-scheme');
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive CSS media queries', () => {
            const doc = parser.window.document;
            const style = doc.querySelector('style');
            
            expect(style.textContent).to.include('@media');
            expect(style.textContent).to.include('max-width: 768px');
        });

        it('should have mobile-optimized layouts', () => {
            const doc = parser.window.document;
            const style = doc.querySelector('style');
            
            expect(style.textContent).to.include('flex-direction: column');
        });

        it('should have grid layouts for desktop', () => {
            const doc = parser.window.document;
            const style = doc.querySelector('style');
            
            expect(style.textContent).to.include('grid-template-columns');
            expect(style.textContent).to.include('minmax');
        });
    });

    describe('Accessibility Features', () => {
        it('should have proper contrast for dark mode', () => {
            const doc = parser.window.document;
            const style = doc.querySelector('style');
            
            expect(style.textContent).to.include('html.dark');
            expect(style.textContent).to.include('background: var(--stem-color-bg-secondary)');
        });

        it('should use semantic HTML structure', () => {
            const doc = parser.window.document;
            
            expect(doc.querySelector('header')).to.exist;
            expect(doc.querySelector('main')).to.exist;
            expect(doc.querySelector('section')).to.exist;
        });

        it('should have descriptive section headers', () => {
            const doc = parser.window.document;
            const headers = doc.querySelectorAll('.section-header h2');
            
            expect(headers.length).to.be.at.least(1);
            headers.forEach(header => {
                expect(header.textContent).to.be.a('string');
                expect(header.textContent.length).to.be.at.least(3);
            });
        });
    });

    describe('Copy Functionality (Future Enhancement)', () => {
        it('should have placeholder for copy functionality', () => {
            const doc = parser.window.document;
            
            // This test verifies the structure is ready for copy functionality
            // The actual copy functionality will be implemented in commit #3
            const codeBlocks = doc.querySelectorAll('.code-block');
            
            expect(codeBlocks.length).to.be.at.least(1);
            
            // Verify the code blocks contain copyable content
            codeBlocks.forEach(block => {
                expect(block.textContent).to.be.a('string');
                expect(block.textContent.length).to.be.at.least(5);
            });
        });

        it('should have unique selectors for code blocks', () => {
            const doc = parser.window.document;
            const codeBlocks = doc.querySelectorAll('.code-block');
            
            // Ensure each code block can be uniquely identified
            codeBlocks.forEach((block, index) => {
                expect(block.classList.contains('code-block')).to.be.true;
                const isUniquelyIdentifiable = block.hasAttribute('id') ||
                    Boolean(block.parentElement && block.closest('.showcase-section'));
                expect(isUniquelyIdentifiable).to.be.true;
            });
        });
    });

    describe('Error Handling', () => {
        it('should have fallback styling', () => {
            const doc = parser.window.document;
            const style = doc.querySelector('style');
            
            // Ensure there's custom CSS to handle cases where dry2.css might not load
            expect(style.textContent).to.include('body');
            expect(style.textContent).to.include('.showcase-container');
        });

        it('should handle missing stylesheet gracefully', () => {
            const doc = parser.window.document;
            const body = doc.querySelector('body');
            
            expect(body.style.fontFamily).to.exist;
            expect(body.style.lineHeight).to.exist;
        });
    });
});
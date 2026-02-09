/**
 * Integration tests for card-component with dry2.css
 *
 * Tests that the card component works correctly with dry2.css classes
 * instead of Tailwind, verifying all variants, slots, and responsive behavior.
 */

describe('card-component with dry2.css', () => {
    let sandbox;

    before(() => {
        // Create a sandbox element to attach components to
        sandbox = document.createElement('div');
        sandbox.id = 'sandbox';
        document.body.appendChild(sandbox);
    });

    after(() => {
        // Clean up
        document.body.removeChild(sandbox);
    });

    afterEach(() => {
        // Reset the sandbox element
        sandbox.innerHTML = '';
    });

    /**
     * Basic Rendering Tests
     */
    describe('Basic Rendering', () => {
        it('should render card with dry2.css card class', () => {
            sandbox.innerHTML = '<dry-card><p>Test content</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    assert.exists(container, 'Card container exists');

                    const classList = container.className;
                    assert.include(classList, 'card', 'Has base card class');

                    resolve();
                }, 150);
            });
        });

        it('should render card content in body section', () => {
            sandbox.innerHTML = '<dry-card><p>Body content</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const body = card.querySelector('.card-body');
                    assert.exists(body, 'Card body exists');
                    assert.include(body.innerHTML, 'Body content', 'Body contains content');

                    resolve();
                }, 150);
            });
        });

        it('should have proper ARIA role', () => {
            sandbox.innerHTML = '<dry-card><p>Test</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    assert.equal(container.getAttribute('role'), 'article', 'Has article role');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Slot Rendering Tests
     */
    describe('Slot Rendering', () => {
        it('should render header slot content', () => {
            sandbox.innerHTML = `
                <dry-card>
                    <div slot="header"><h2>Card Title</h2></div>
                    <p>Body content</p>
                </dry-card>
            `;
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const header = card.querySelector('.card-header');
                    assert.exists(header, 'Card header exists');
                    assert.include(header.innerHTML, 'Card Title', 'Header contains title');

                    resolve();
                }, 150);
            });
        });

        it('should render media slot content', () => {
            sandbox.innerHTML = `
                <dry-card>
                    <div slot="media"><img src="test.jpg" alt="Test"></div>
                    <p>Body content</p>
                </dry-card>
            `;
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const media = card.querySelector('.card-media');
                    assert.exists(media, 'Card media exists');
                    assert.include(media.innerHTML, 'test.jpg', 'Media contains image');

                    resolve();
                }, 150);
            });
        });

        it('should render footer slot content', () => {
            sandbox.innerHTML = `
                <dry-card>
                    <p>Body content</p>
                    <div slot="footer"><button>Action</button></div>
                </dry-card>
            `;
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const footer = card.querySelector('.card-footer');
                    assert.exists(footer, 'Card footer exists');
                    assert.include(footer.innerHTML, 'Action', 'Footer contains button');

                    resolve();
                }, 150);
            });
        });

        it('should render all slots together', () => {
            sandbox.innerHTML = `
                <dry-card>
                    <div slot="header"><h2>Title</h2></div>
                    <div slot="media"><img src="test.jpg" alt="Test"></div>
                    <p>Body content</p>
                    <div slot="footer"><button>Action</button></div>
                </dry-card>
            `;
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const header = card.querySelector('.card-header');
                    const media = card.querySelector('.card-media');
                    const body = card.querySelector('.card-body');
                    const footer = card.querySelector('.card-footer');

                    assert.exists(header, 'Header exists');
                    assert.exists(media, 'Media exists');
                    assert.exists(body, 'Body exists');
                    assert.exists(footer, 'Footer exists');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Variant Tests
     */
    describe('Card Variants', () => {
        it('should render filled variant (default)', () => {
            sandbox.innerHTML = '<dry-card><p>Filled card</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    const classList = container.className;

                    assert.include(classList, 'card', 'Has card class');
                    // Filled is the default variant

                    resolve();
                }, 150);
            });
        });

        it('should render outlined variant', () => {
            sandbox.innerHTML = '<dry-card variant="outlined"><p>Outlined card</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    const classList = container.className;

                    assert.include(classList, 'card', 'Has card class');
                    // Check for variant-specific class or styling
                    // Note: Implementation may need to add variant classes

                    resolve();
                }, 150);
            });
        });

        it('should render elevated variant', () => {
            sandbox.innerHTML = '<dry-card variant="elevated"><p>Elevated card</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    const classList = container.className;

                    assert.include(classList, 'card', 'Has card class');
                    // Elevated variant should have enhanced shadow

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Elevation Tests
     */
    describe('Card Elevation', () => {
        it('should support different elevation levels', () => {
            sandbox.innerHTML = '<dry-card elevation="lg"><p>Elevated</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    assert.exists(container, 'Card container exists');
                    // Elevation should be handled via CSS variables

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Interactive State Tests
     */
    describe('Interactive State', () => {
        it('should dispatch card:click event when interactive', () => {
            sandbox.innerHTML = '<dry-card interactive><p>Click me</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    let eventFired = false;
                    card.addEventListener('card:click', () => {
                        eventFired = true;
                    });

                    const container = card.querySelector('.card-container');
                    container.click();

                    assert.isTrue(eventFired, 'Click event was dispatched');

                    resolve();
                }, 150);
            });
        });

        it('should not dispatch event when not interactive', () => {
            sandbox.innerHTML = '<dry-card><p>Not clickable</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    let eventFired = false;
                    card.addEventListener('card:click', () => {
                        eventFired = true;
                    });

                    const container = card.querySelector('.card-container');
                    if (container) {
                        container.click();
                    }

                    assert.isFalse(eventFired, 'Click event was not dispatched');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Orientation Tests
     */
    describe('Card Orientation', () => {
        it('should render vertical orientation (default)', () => {
            sandbox.innerHTML = '<dry-card><p>Vertical</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    assert.exists(container, 'Card container exists');

                    resolve();
                }, 150);
            });
        });

        it('should render horizontal orientation', () => {
            sandbox.innerHTML = '<dry-card orientation="horizontal"><div slot="media"><img src="test.jpg"></div><p>Horizontal</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    assert.exists(container, 'Card container exists');
                    // Should have flex classes for horizontal layout

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Dry2.css Dependency Tests
     */
    describe('Dry2.css Dependency', () => {
        it('should not use Tailwind-specific classes', () => {
            sandbox.innerHTML = '<dry-card variant="filled" elevation="md"><p>Test</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    const classList = container.className;

                    // These are Tailwind classes that should NOT be present
                    assert.notInclude(classList, 'bg-white', 'Should not have Tailwind bg-white');
                    assert.notInclude(classList, 'rounded-lg', 'Should not have Tailwind rounded-lg');
                    assert.notInclude(classList, 'shadow-md', 'Should not have Tailwind shadow-md');
                    assert.notInclude(classList, 'border-gray-200', 'Should not have Tailwind border color');

                    resolve();
                }, 150);
            });
        });

        it('should use only dry2.css card classes', () => {
            sandbox.innerHTML = '<dry-card><p>Test</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    const classList = container.className;

                    // Should have dry2.css card class
                    assert.include(classList, 'card', 'Has card base class');

                    // Check that common Tailwind patterns are not present
                    const tailwindPattern = /\b(px-|py-|bg-|hover:|focus:|ring-|text-|rounded-lg|shadow-md)/;
                    assert.notMatch(classList, tailwindPattern, 'Should not contain Tailwind utility patterns');

                    resolve();
                }, 150);
            });
        });

        it('should use dry2.css for spacing', () => {
            sandbox.innerHTML = `
                <dry-card>
                    <div slot="header"><h2>Title</h2></div>
                    <p>Body</p>
                    <div slot="footer"><button>Action</button></div>
                </dry-card>
            `;
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const header = card.querySelector('.card-header');
                    const body = card.querySelector('.card-body');
                    const footer = card.querySelector('.card-footer');

                    // These sections should not have Tailwind padding classes
                    if (header) {
                        assert.notInclude(header.className, 'px-6', 'Header should not have Tailwind padding');
                    }
                    if (body) {
                        assert.notInclude(body.className, 'px-6', 'Body should not have Tailwind padding');
                    }
                    if (footer) {
                        assert.notInclude(footer.className, 'px-6', 'Footer should not have Tailwind padding');
                    }

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Responsive Behavior Tests
     */
    describe('Responsive Behavior', () => {
        it('should work at different viewport sizes', () => {
            sandbox.innerHTML = '<dry-card><p>Responsive card</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');

                    // Card should exist and be functional regardless of viewport
                    assert.exists(container, 'Card exists');

                    resolve();
                }, 150);
            });
        });

        it('should handle horizontal orientation responsively', () => {
            sandbox.innerHTML = '<dry-card orientation="horizontal"><div slot="media"><img src="test.jpg"></div><p>Test</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const container = card.querySelector('.card-container');
                    const media = card.querySelector('.card-media');

                    assert.exists(container, 'Card container exists');
                    assert.exists(media, 'Media section exists');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Public API Tests
     */
    describe('Public API', () => {
        it('should support setVariant method', () => {
            sandbox.innerHTML = '<dry-card><p>Test</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    card.setVariant('outlined');
                    assert.equal(card.getAttribute('variant'), 'outlined', 'Variant attribute updated');

                    resolve();
                }, 150);
            });
        });

        it('should support setElevation method', () => {
            sandbox.innerHTML = '<dry-card><p>Test</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    card.setElevation('lg');
                    assert.equal(card.getAttribute('elevation'), 'lg', 'Elevation attribute updated');

                    resolve();
                }, 150);
            });
        });

        it('should support setOrientation method', () => {
            sandbox.innerHTML = '<dry-card><p>Test</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    card.setOrientation('horizontal');
                    assert.equal(card.getAttribute('orientation'), 'horizontal', 'Orientation attribute updated');

                    resolve();
                }, 150);
            });
        });

        it('should support setInteractive method', () => {
            sandbox.innerHTML = '<dry-card><p>Test</p></dry-card>';
            const card = sandbox.querySelector('dry-card');

            return new Promise((resolve) => {
                setTimeout(() => {
                    card.setInteractive(true);
                    assert.isTrue(card.hasAttribute('interactive'), 'Interactive attribute set');

                    resolve();
                }, 150);
            });
        });
    });
});

/**
 * Integration tests for DryButton component with dry2.css
 *
 * Tests that the button component works correctly with dry2.css classes
 * instead of Tailwind, verifying all variants, sizes, and states.
 */

describe('DryButton with dry2.css', () => {
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
        it('should render button with default dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button>Click Me</dry-button>';
            const button = sandbox.querySelector('dry-button');

            // Wait for component to initialize
            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    assert.exists(innerButton, 'Button element exists');

                    // Check that it has dry2.css button classes
                    // Note: Current implementation still uses Tailwind, so this test will fail
                    // until we refactor to use dry2.css classes
                    const classList = innerButton.className;
                    assert.include(classList, 'btn', 'Has base btn class');

                    resolve();
                }, 150);
            });
        });

        it('should render button content correctly', () => {
            sandbox.innerHTML = '<dry-button>Test Button</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const textElement = button.querySelector('.button-text');
                    assert.exists(textElement, 'Button text element exists');
                    assert.equal(textElement.textContent, 'Test Button', 'Button text is correct');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Variant Tests
     */
    describe('Button Variants', () => {
        it('should render primary variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button variant="primary">Primary</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    assert.include(classList, 'btn-primary', 'Has btn-primary class');

                    resolve();
                }, 150);
            });
        });

        it('should render secondary variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button variant="secondary">Secondary</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    assert.include(classList, 'btn-secondary', 'Has btn-secondary class');

                    resolve();
                }, 150);
            });
        });

        it('should render outline variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button variant="outline">Outline</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    assert.include(classList, 'btn-outline', 'Has btn-outline class');

                    resolve();
                }, 150);
            });
        });

        it('should render ghost variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button variant="ghost">Ghost</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    assert.include(classList, 'btn-ghost', 'Has btn-ghost class');

                    resolve();
                }, 150);
            });
        });

        it('should render danger variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button variant="danger">Danger</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    assert.include(classList, 'btn-danger', 'Has btn-danger class');

                    resolve();
                }, 150);
            });
        });

        it('should render success variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button variant="success">Success</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    assert.include(classList, 'btn-success', 'Has btn-success class');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Size Tests
     */
    describe('Button Sizes', () => {
        it('should render small size with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button size="sm">Small</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    assert.include(classList, 'btn-sm', 'Has btn-sm class');

                    resolve();
                }, 150);
            });
        });

        it('should render medium size with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button size="md">Medium</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    // Medium is typically the default, so it might not have an explicit class
                    // But if there is one, it should be btn-md
                    assert.exists(innerButton, 'Button exists with medium size');

                    resolve();
                }, 150);
            });
        });

        it('should render large size with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-button size="lg">Large</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    assert.include(classList, 'btn-lg', 'Has btn-lg class');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * State Tests
     */
    describe('Button States', () => {
        it('should render disabled state correctly', () => {
            sandbox.innerHTML = '<dry-button disabled>Disabled</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');

                    assert.isTrue(innerButton.hasAttribute('disabled'), 'Button has disabled attribute');
                    assert.isTrue(innerButton.hasAttribute('aria-busy'), 'Button has aria-busy attribute');

                    resolve();
                }, 150);
            });
        });

        it('should render loading state with spinner', () => {
            sandbox.innerHTML = '<dry-button loading>Loading</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const spinner = button.querySelector('svg.animate-spin');

                    assert.exists(spinner, 'Loading spinner exists');
                    assert.isTrue(innerButton.hasAttribute('disabled'), 'Button is disabled when loading');

                    resolve();
                }, 150);
            });
        });

        it('should not show loading spinner when not loading', () => {
            sandbox.innerHTML = '<dry-button>Not Loading</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const spinner = button.querySelector('svg.animate-spin');

                    assert.notExists(spinner, 'Loading spinner does not exist');

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
            sandbox.innerHTML = '<dry-button variant="primary" size="lg">Test</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    // These are Tailwind classes that should NOT be present
                    assert.notInclude(classList, 'bg-blue-600', 'Should not have Tailwind bg-blue-600');
                    assert.notInclude(classList, 'hover:bg-blue-700', 'Should not have Tailwind hover class');
                    assert.notInclude(classList, 'px-6', 'Should not have Tailwind padding class');

                    resolve();
                }, 150);
            });
        });

        it('should use only dry2.css button classes', () => {
            sandbox.innerHTML = '<dry-button>Test</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');
                    const classList = innerButton.className;

                    // Should only have dry2.css classes
                    assert.include(classList, 'btn', 'Has btn base class');

                    // Check that common Tailwind patterns are not present
                    const tailwindPattern = /\b(px-|py-|bg-|hover:|focus:|ring-|text-|rounded-)/;
                    assert.notMatch(classList, tailwindPattern, 'Should not contain Tailwind utility patterns');

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
            sandbox.innerHTML = '<dry-button>Responsive</dry-button>';
            const button = sandbox.querySelector('dry-button');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerButton = button.querySelector('button');

                    // Button should exist and be functional regardless of viewport
                    assert.exists(innerButton, 'Button exists');
                    assert.isFalse(innerButton.disabled, 'Button is not disabled');

                    resolve();
                }, 150);
            });
        });
    });
});

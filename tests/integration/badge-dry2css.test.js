/**
 * Integration tests for dry-badge component with dry2.css
 *
 * Tests that the badge component works correctly with dry2.css classes
 * instead of Tailwind, verifying color variants, positioning, and overflow behavior.
 */

describe('dry-badge with dry2.css', () => {
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
        it('should render badge with dry2.css badge class', () => {
            sandbox.innerHTML = '<dry-badge>New</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.exists(innerBadge, 'Badge element exists');

                    const classList = innerBadge.className;
                    assert.include(classList, 'badge', 'Has base badge class');

                    resolve();
                }, 150);
            });
        });

        it('should render badge content correctly', () => {
            sandbox.innerHTML = '<dry-badge>42</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.exists(innerBadge, 'Badge element exists');
                    assert.equal(innerBadge.textContent, '42', 'Badge content is correct');

                    resolve();
                }, 150);
            });
        });

        it('should escape HTML content to prevent XSS', () => {
            sandbox.innerHTML = '<dry-badge>&lt;script&gt;alert("xss")&lt;/script&gt;</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.exists(innerBadge, 'Badge element exists');
                    assert.notInclude(innerBadge.innerHTML, '<script>', 'HTML is escaped');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Variant Tests
     */
    describe('Badge Variants', () => {
        it('should render primary variant (default)', () => {
            sandbox.innerHTML = '<dry-badge variant="primary">Primary</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    const classList = innerBadge.className;

                    assert.include(classList, 'badge', 'Has badge base class');
                    // Primary is default, may not have explicit variant class

                    resolve();
                }, 150);
            });
        });

        it('should render success variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-badge variant="success">Success</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    const classList = innerBadge.className;

                    assert.include(classList, 'badge-success', 'Has badge-success class');

                    resolve();
                }, 150);
            });
        });

        it('should render warning variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-badge variant="warning">Warning</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    const classList = innerBadge.className;

                    assert.include(classList, 'badge-warning', 'Has badge-warning class');

                    resolve();
                }, 150);
            });
        });

        it('should render error variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-badge variant="danger">Error</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    const classList = innerBadge.className;

                    assert.include(classList, 'badge-error', 'Has badge-error class');

                    resolve();
                }, 150);
            });
        });

        it('should render info variant with dry2.css classes', () => {
            sandbox.innerHTML = '<dry-badge variant="info">Info</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    const classList = innerBadge.className;

                    assert.include(classList, 'badge-info', 'Has badge-info class');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Size Tests
     */
    describe('Badge Sizes', () => {
        it('should render small size', () => {
            sandbox.innerHTML = '<dry-badge size="sm">Small</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.exists(innerBadge, 'Badge exists with small size');

                    resolve();
                }, 150);
            });
        });

        it('should render medium size (default)', () => {
            sandbox.innerHTML = '<dry-badge size="md">Medium</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.exists(innerBadge, 'Badge exists with medium size');

                    resolve();
                }, 150);
            });
        });

        it('should render large size', () => {
            sandbox.innerHTML = '<dry-badge size="lg">Large</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.exists(innerBadge, 'Badge exists with large size');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Position Tests
     */
    describe('Badge Positioning', () => {
        it('should render standalone position (default)', () => {
            sandbox.innerHTML = '<dry-badge position="standalone">5</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const style = window.getComputedStyle(badge);
                    assert.equal(style.display, 'inline-block', 'Standalone badge is inline-block');

                    resolve();
                }, 150);
            });
        });

        it('should render top-right position', () => {
            sandbox.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <button>Button</button>
                    <dry-badge position="top-right">3</dry-badge>
                </div>
            `;
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const style = window.getComputedStyle(badge);
                    assert.equal(style.position, 'absolute', 'Badge is absolutely positioned');

                    resolve();
                }, 150);
            });
        });

        it('should render top-left position', () => {
            sandbox.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <button>Button</button>
                    <dry-badge position="top-left">7</dry-badge>
                </div>
            `;
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const style = window.getComputedStyle(badge);
                    assert.equal(style.position, 'absolute', 'Badge is absolutely positioned');

                    resolve();
                }, 150);
            });
        });

        it('should render bottom-right position', () => {
            sandbox.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <button>Button</button>
                    <dry-badge position="bottom-right">2</dry-badge>
                </div>
            `;
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const style = window.getComputedStyle(badge);
                    assert.equal(style.position, 'absolute', 'Badge is absolutely positioned');

                    resolve();
                }, 150);
            });
        });

        it('should render bottom-left position', () => {
            sandbox.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <button>Button</button>
                    <dry-badge position="bottom-left">9</dry-badge>
                </div>
            `;
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const style = window.getComputedStyle(badge);
                    assert.equal(style.position, 'absolute', 'Badge is absolutely positioned');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Dot Mode Tests
     */
    describe('Dot Mode', () => {
        it('should render as dot without text', () => {
            sandbox.innerHTML = '<dry-badge dot variant="success"></dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.exists(innerBadge, 'Badge element exists');
                    assert.equal(innerBadge.textContent.trim(), '', 'Dot badge has no text');

                    resolve();
                }, 150);
            });
        });

        it('should render dot with correct size', () => {
            sandbox.innerHTML = '<dry-badge dot size="sm" variant="danger"></dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.exists(innerBadge, 'Badge element exists');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Overflow Tests
     */
    describe('Overflow Handling', () => {
        it('should display number normally when under max', () => {
            sandbox.innerHTML = '<dry-badge max="99">50</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.equal(innerBadge.textContent, '50', 'Number displayed normally');

                    resolve();
                }, 150);
            });
        });

        it('should display max+ when over max', () => {
            sandbox.innerHTML = '<dry-badge max="99">150</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.equal(innerBadge.textContent, '99+', 'Displays max+ notation');

                    resolve();
                }, 150);
            });
        });

        it('should display exact max value when equal', () => {
            sandbox.innerHTML = '<dry-badge max="99">99</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.equal(innerBadge.textContent, '99', 'Displays exact max value');

                    resolve();
                }, 150);
            });
        });

        it('should not apply max to non-numeric content', () => {
            sandbox.innerHTML = '<dry-badge max="99">New</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    assert.equal(innerBadge.textContent, 'New', 'Text content displayed unchanged');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Visibility Tests
     */
    describe('Visibility', () => {
        it('should be visible by default', () => {
            sandbox.innerHTML = '<dry-badge>Visible</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const style = window.getComputedStyle(badge);
                    assert.notEqual(style.display, 'none', 'Badge is visible');

                    resolve();
                }, 150);
            });
        });

        it('should hide when visible="false"', () => {
            sandbox.innerHTML = '<dry-badge visible="false">Hidden</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const style = window.getComputedStyle(badge);
                    assert.equal(style.display, 'none', 'Badge is hidden');

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
            sandbox.innerHTML = '<dry-badge variant="success" size="lg">Test</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    const classList = innerBadge.className;

                    // These are Tailwind classes that should NOT be present
                    assert.notInclude(classList, 'bg-green-500', 'Should not have Tailwind bg-green-500');
                    assert.notInclude(classList, 'text-white', 'Should not have Tailwind text-white');
                    assert.notInclude(classList, 'px-3', 'Should not have Tailwind px-3');
                    assert.notInclude(classList, 'rounded-full', 'Should not have Tailwind rounded-full');

                    resolve();
                }, 150);
            });
        });

        it('should use only dry2.css badge classes', () => {
            sandbox.innerHTML = '<dry-badge variant="warning">Test</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    const innerBadge = badge.querySelector('.badge');
                    const classList = innerBadge.className;

                    // Should have dry2.css classes
                    assert.include(classList, 'badge', 'Has badge base class');

                    // Check that common Tailwind patterns are not present
                    const tailwindPattern = /\b(px-|py-|bg-|text-white|rounded-full|min-h-)/;
                    assert.notMatch(classList, tailwindPattern, 'Should not contain Tailwind utility patterns');

                    resolve();
                }, 150);
            });
        });
    });

    /**
     * Public API Tests
     */
    describe('Public API', () => {
        it('should support show() method', () => {
            sandbox.innerHTML = '<dry-badge visible="false">Test</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    badge.show();

                    setTimeout(() => {
                        const style = window.getComputedStyle(badge);
                        assert.notEqual(style.display, 'none', 'Badge is shown');

                        resolve();
                    }, 50);
                }, 150);
            });
        });

        it('should support hide() method', () => {
            sandbox.innerHTML = '<dry-badge>Test</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    badge.hide();

                    setTimeout(() => {
                        const style = window.getComputedStyle(badge);
                        assert.equal(style.display, 'none', 'Badge is hidden');

                        resolve();
                    }, 50);
                }, 150);
            });
        });

        it('should support toggle() method', () => {
            sandbox.innerHTML = '<dry-badge>Test</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    // Toggle to hide
                    badge.toggle();

                    setTimeout(() => {
                        let style = window.getComputedStyle(badge);
                        assert.equal(style.display, 'none', 'Badge is hidden after toggle');

                        // Toggle to show
                        badge.toggle();

                        setTimeout(() => {
                            style = window.getComputedStyle(badge);
                            assert.notEqual(style.display, 'none', 'Badge is shown after toggle');

                            resolve();
                        }, 50);
                    }, 50);
                }, 150);
            });
        });

        it('should support setContent() method', () => {
            sandbox.innerHTML = '<dry-badge>Old</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    badge.setContent('New');

                    setTimeout(() => {
                        const innerBadge = badge.querySelector('.badge');
                        assert.equal(innerBadge.textContent, 'New', 'Content updated');

                        resolve();
                    }, 50);
                }, 150);
            });
        });

        it('should support variant property getter/setter', () => {
            sandbox.innerHTML = '<dry-badge variant="success">Test</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    assert.equal(badge.variant, 'success', 'Variant getter works');

                    badge.variant = 'danger';
                    assert.equal(badge.getAttribute('variant'), 'danger', 'Variant setter works');

                    resolve();
                }, 150);
            });
        });

        it('should support position property getter/setter', () => {
            sandbox.innerHTML = '<dry-badge position="standalone">Test</dry-badge>';
            const badge = sandbox.querySelector('dry-badge');

            return new Promise((resolve) => {
                setTimeout(() => {
                    assert.equal(badge.position, 'standalone', 'Position getter works');

                    badge.position = 'top-right';
                    assert.equal(badge.getAttribute('position'), 'top-right', 'Position setter works');

                    resolve();
                }, 150);
            });
        });
    });
});

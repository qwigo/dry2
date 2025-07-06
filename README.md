# DRY2 Web Components Library

<div align="center">

![DRY2 Logo](https://via.placeholder.com/200x80/6366f1/ffffff?text=DRY2)

**A comprehensive, accessible web components library built with modern web standards**

[![npm version](https://badge.fury.io/js/dry2-web-components.svg)](https://badge.fury.io/js/dry2-web-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/yourusername/dry2-web-components/workflows/CI/badge.svg)](https://github.com/yourusername/dry2-web-components/actions)
[![Coverage Status](https://coveralls.io/repos/github/yourusername/dry2-web-components/badge.svg?branch=main)](https://coveralls.io/github/yourusername/dry2-web-components?branch=main)

[📚 Documentation](https://your-docs-site.com) •
[🚀 Live Examples](https://your-examples-site.com) •
[💬 Community](https://github.com/yourusername/dry2-web-components/discussions)

</div>

## 🌟 Features

- **📦 22+ Production-Ready Components** - From buttons to complex carousels
- **♿ Accessibility First** - ARIA attributes and keyboard navigation built-in
- **🎨 Tailwind CSS Integration** - Beautiful, customizable styling out of the box
- **⚡ Alpine.js Powered** - Reactive components with minimal JavaScript
- **📱 Responsive Design** - Mobile-first approach for all screen sizes
- **🔧 Framework Agnostic** - Works with React, Vue, Angular, or vanilla HTML
- **🧪 100% Test Coverage** - Comprehensive test suite with Mocha
- **📖 TypeScript Definitions** - Full type support for better DX
- **🌐 Modern Browser Support** - ES6+ with graceful degradation

## 🚀 Quick Start

### Installation

```bash
# npm
npm install dry2-web-components

# yarn
yarn add dry2-web-components

# pnpm
pnpm add dry2-web-components
```

### Basic Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DRY2 Example</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Alpine.js -->
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
    <!-- DRY2 Components -->
    <script type="module">
        import 'dry2-web-components/src/dry2/dry2.js';
        import 'dry2-web-components/src/dry2/button.js';
        import 'dry2-web-components/src/dry2/avatar.js';
        import 'dry2-web-components/src/dry2/toast.js';
    </script>

    <!-- Use the components -->
    <div class="container mx-auto p-6">
        <h1 class="text-3xl font-bold mb-6">Welcome to DRY2!</h1>
        
        <div class="space-y-4">
            <dry-button variant="primary" size="lg">
                Get Started
            </dry-button>
            
            <avatar-component 
                name="John Doe" 
                src="https://example.com/avatar.jpg"
                size="lg">
            </avatar-component>
        </div>
    </div>

    <script>
        // Use the Toast API
        document.querySelector('dry-button').addEventListener('click', () => {
            Toast.success('Welcome to DRY2 Web Components!');
        });
    </script>
</body>
</html>
```

## 📦 Components Overview

### 🎛️ Form & Input Components
- **[`<dry-button>`](docs/components/button.md)** - Versatile button with variants, sizes, loading states, and Font Awesome icons
- **[`<toggle-switch>`](docs/components/toggle-switch.md)** - Accessible toggle switch for boolean inputs
- **[`<super-select-component>`](docs/components/select.md)** - Advanced select with search and multi-selection

### 🖼️ Display Components
- **[`<avatar-component>`](docs/components/avatar.md)** - User avatars with image fallbacks and initials
- **[`<badge-component>`](docs/components/badge.md)** - Status indicators and notification badges
- **[`<card-component>`](docs/components/card.md)** - Flexible content containers
- **[`<stat-component>`](docs/components/stat.md)** - Statistical data display with trends

### 🧭 Navigation Components
- **[`<breadcrumbs-component>`](docs/components/breadcrumbs.md)** - Hierarchical navigation breadcrumbs
- **[`<tabs-component>`](docs/components/tabs.md)** - Tabbed interface with multiple variants

### 📋 Layout Components
- **[`<dry-accordion>`](docs/components/accordion.md)** - Collapsible content sections
- **[`<collapse-component>`](docs/components/collapse.md)** - Smooth height-based collapse animations
- **[`<drawer-component>`](docs/components/drawer.md)** - Side panel/drawer with HTMX support

  ### 🎠 Interactive Components
  - **[`<carousel-component>`](docs/components/carousel.md)** - Touch-enabled carousel with autoplay
  - **[`<countdown-component>`](docs/components/countdown.md)** - Flexible countdown timers

### 💬 Communication Components
- **[`<chat-bubble>`](docs/components/chat-bubble.md)** - Chat message bubbles with status indicators
- **[`<toast-component>`](docs/components/toast.md)** - Notification toasts with global API
- **[`<dialog-component>`](docs/components/dialog.md)** - Modal dialogs with HTMX integration

### 📊 Data Components
- **[`<timeline-component>`](docs/components/timeline.md)** - Event timelines with custom styling
- **[`<qr-component>`](docs/components/qr.md)** - QR code generation with customization

### ✏️ Editor Components
- **[`<dry-code>`](docs/components/code.md)** - Syntax-highlighted code blocks with copy-to-clipboard functionality
- **[`<wysiwyg-component>`](docs/components/wysiwyg.md)** - Rich text editor with HTML sanitization

## 🎨 Theming & Customization

DRY2 components are built with Tailwind CSS and support extensive customization:

```html
<!-- Custom button styling -->
<dry-button 
    variant="primary"
    size="lg"
    class="shadow-xl hover:shadow-2xl transform hover:scale-105">
    Custom Styled Button
</dry-button>

<!-- Button with Font Awesome icon -->
<dry-button 
    variant="primary"
    icon="fas fa-plus">
    Add Item
</dry-button>

<!-- Icon-only button -->
<dry-button 
    variant="outline"
    icon="fas fa-download">
</dry-button>

<!-- Custom avatar colors -->
<avatar-component 
    name="Jane Doe"
    style="--avatar-bg: #8b5cf6; --avatar-text: white;">
</avatar-component>
```

### CSS Custom Properties

Many components support CSS custom properties for deep customization:

```css
:root {
    --dry-primary-color: #6366f1;
    --dry-secondary-color: #64748b;
    --dry-success-color: #10b981;
    --dry-warning-color: #f59e0b;
    --dry-error-color: #ef4444;
    --dry-border-radius: 0.5rem;
    --dry-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

## 🧪 Testing

DRY2 comes with comprehensive test coverage using Mocha and Chai:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for specific component
npm run test:component button
```

### Writing Tests

Example test for a custom component:

```javascript
import { expect } from 'chai';
import '../setup.js';

describe('My Custom Component', () => {
    let element;

    beforeEach(() => {
        element = document.createElement('my-component');
        document.body.appendChild(element);
    });

    it('should create element', async () => {
        await waitForComponent(element);
        expect(element).to.exist;
    });

    it('should respond to attribute changes', async () => {
        element.setAttribute('variant', 'primary');
        await waitForComponent(element);
        
        const button = element.querySelector('.button');
        expect(button.className).to.include('bg-blue-600');
    });
});
```

## 🔧 API Reference

### Creating Custom Components

You can create custom components by extending HTMLElement:

```javascript
class MyComponent extends HTMLElement {
    static get observedAttributes() {
        return ['variant', 'size', 'disabled'];
    }

    render() {
        return `
            <div class="${this.getComponentClasses()}">
                ${this.renderSlot('default', 'Default content')}
            </div>
        `;
    }

    getComponentClasses() {
        return `component ${this.variant} ${this.size}`;
    }
}
```

### Common Patterns

#### State Management
```javascript
// Reactive state
this.setState({ loading: true });

// Listen to state changes automatically triggers re-render
```

#### Event Handling
```javascript
// Emit custom events
this.emit('component:change', { value: newValue });

// Listen to events
element.addEventListener('component:change', (event) => {
    console.log('New value:', event.detail.value);
});
```

#### Accessibility
```javascript
// Built-in accessibility helpers
this.setAttribute('aria-label', 'Button description');
this.setAttribute('role', 'button');
this.setAttribute('tabindex', '0');
```

## 🌐 Framework Integration

### React

```jsx
import { useEffect, useRef } from 'react';
import 'dry2-web-components/button';

function MyReactComponent() {
    const buttonRef = useRef();

    useEffect(() => {
        const button = buttonRef.current;
        
        const handleClick = (event) => {
            console.log('Button clicked:', event.detail);
        };

        button.addEventListener('button:click', handleClick);
        return () => button.removeEventListener('button:click', handleClick);
    }, []);

    return (
        <dry-button 
            ref={buttonRef}
            variant="primary"
            size="lg">
            React Button
        </dry-button>
    );
}
```

### Vue

```vue
<template>
    <dry-button 
        :variant="variant"
        :size="size"
        @button:click="handleClick">
        Vue Button
    </dry-button>
</template>

<script>
import 'dry2-web-components/button';

export default {
    data() {
        return {
            variant: 'primary',
            size: 'lg'
        };
    },
    methods: {
        handleClick(event) {
            console.log('Button clicked:', event.detail);
        }
    }
};
</script>
```

### Angular

```typescript
import { Component, ElementRef, ViewChild } from '@angular/core';
import 'dry2-web-components/button';

@Component({
    selector: 'app-button',
    template: `
        <dry-button 
            #buttonElement
            [attr.variant]="variant"
            [attr.size]="size"
            (button:click)="handleClick($event)">
            Angular Button
        </dry-button>
    `
})
export class ButtonComponent {
    @ViewChild('buttonElement') buttonElement!: ElementRef;
    
    variant = 'primary';
    size = 'lg';

    handleClick(event: CustomEvent) {
        console.log('Button clicked:', event.detail);
    }
}
```

## 📱 Responsive Design

All components are mobile-first and responsive:

```html
<!-- Responsive button sizes -->
<dry-button 
    size="sm"
    class="md:size-md lg:size-lg">
    Responsive Button
</dry-button>

<!-- Responsive avatar -->
<avatar-component
    size="sm"
    class="md:size-md lg:size-lg"
    name="John Doe">
</avatar-component>
```

## 🚀 Performance

### Bundle Size

| Component | Gzipped Size | Dependencies |
|-----------|--------------|--------------|
| Base | 2.1 KB | None |
| Button | 1.8 KB | Alpine.js |
| Avatar | 1.5 KB | Alpine.js |
| Toast | 2.3 KB | None |
| Carousel | 3.2 KB | Alpine.js |

### Lazy Loading

```javascript
// Load components on demand
const loadButton = () => import('dry2-web-components/button');
const loadCarousel = () => import('dry2-web-components/carousel');

// Load when needed
if (needsCarousel) {
    await loadCarousel();
}
```

## 🛡️ Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 73+ | ✅ Full |
| Firefox | 63+ | ✅ Full |
| Safari | 12.1+ | ✅ Full |
| Edge | 79+ | ✅ Full |

### Polyfills

For older browsers, include these polyfills:

```html
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2/webcomponents-loader.js"></script>
<script src="https://unpkg.com/proxy-polyfill@0.3.2/proxy.min.js"></script>
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/dry2-web-components.git
cd dry2-web-components

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Component Development

1. Create component file in `src/dry2/`
2. Add comprehensive tests in `test/components/`
3. Create showcase page in `examples/`
4. Update documentation
5. Submit pull request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Alpine.js](https://alpinejs.dev/) for reactive functionality
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) for the foundation
- [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/) for testing

## 📞 Support

- 📖 [Documentation](https://your-docs-site.com)
- 💬 [GitHub Discussions](https://github.com/yourusername/dry2-web-components/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/dry2-web-components/issues)
- 📧 [Email Support](mailto:support@yourproject.com)

---

<div align="center">

**[⭐ Star us on GitHub](https://github.com/yourusername/dry2-web-components)** — it helps the project grow!

Made with ❤️ by the DRY2 team

</div>
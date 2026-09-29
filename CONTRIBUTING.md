# Contributing to DRY2 Web Components

Thank you for your interest in contributing to DRY2! This guide will help you get started with contributing to our web components library.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Component Development](#component-development)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Code Style Guide](#code-style-guide)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@yourproject.com](mailto:conduct@yourproject.com).

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Git
- A modern web browser

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/dry2-web-components.git
   cd dry2-web-components
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Open the component browser**
   ```
   http://localhost:3000
   ```

## Development Workflow

### Branch Strategy

- `main` - Stable production code
- `develop` - Integration branch for features
- `feature/component-name` - New component development
- `fix/issue-description` - Bug fixes
- `docs/topic` - Documentation updates

### Workflow Steps

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-new-component
   ```

2. **Make your changes**
   - Write code following our style guide
   - Add comprehensive tests
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add new component with accessibility features"
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feature/my-new-component
   ```

## Component Development

### Creating a New Component

1. **Create the component file**
   ```bash
   # Create in src/dry2/
   touch src/dry2/my-component.js
   ```

2. **Follow the component template**
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
       return `my-component ${this.variant} ${this.size}`;
     }
   }

   customElements.define('my-component', MyComponent);
   ```

3. **Create a test file**
   ```bash
   touch test/components/my-component.test.js
   ```

4. **Create a showcase page**
   ```bash
   touch examples/my-component-showcase.html
   ```

### Component Guidelines

#### Architecture
- **Extend HTMLElement**: Always extend from `HTMLElement`
- **Use Web Standards**: Leverage native web APIs and standards
- **VanillaState**: Use VanillaState for complex reactivity
- **Responsive Design**: Mobile-first approach with dry2.css

#### Accessibility
- **ARIA Attributes**: Include proper ARIA labels and roles
- **Keyboard Navigation**: Support Tab, Enter, Space, and arrow keys
- **Focus Management**: Proper focus indicators and focus trapping
- **Screen Reader Support**: Meaningful content for assistive technologies

#### Performance
- **Lazy Loading**: Support on-demand component loading
- **Minimal Dependencies**: Keep external dependencies to a minimum
- **Efficient Rendering**: Use requestAnimationFrame for smooth animations
- **Small Bundle Size**: Optimize for minimal impact on bundle size

### Required Component Features

Every component must include:

1. **Proper Documentation**
   - JSDoc comments for all public methods
   - Usage examples in showcase page
   - API documentation

2. **Comprehensive Testing**
   - Unit tests for all functionality
   - Accessibility tests
   - Integration tests

3. **Accessibility Features**
   - ARIA attributes
   - Keyboard navigation
   - Focus management
   - High contrast support

4. **Responsive Design**
   - Mobile-first CSS
   - Flexible layouts
   - Touch-friendly interactions

## Testing Guidelines

### Test Structure

```javascript
import '../setup.js';

describe('MyComponent', () => {
  let component;

  beforeEach(() => {
    component = document.createElement('my-component');
    document.body.appendChild(component);
  });

  describe('Basic Functionality', () => {
    it('should create component', async () => {
      await waitForComponent(component);
      expect(component).to.be.instanceOf(MyComponent);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      await waitForComponent(component);
      expect(component.getAttribute('role')).to.exist;
    });
  });
});
```

### Testing Requirements

- **Coverage**: Minimum 90% code coverage
- **Accessibility**: Test ARIA attributes and keyboard navigation
- **Browser Compatibility**: Test in all supported browsers
- **Responsive**: Test different viewport sizes
- **Error Handling**: Test error conditions and edge cases

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific component tests
npm run test:component my-component

# Run tests for specific browser
npm run test:browser chrome
```

## Documentation

### Required Documentation

1. **README Updates**: Add component to main README
2. **Component Documentation**: Create detailed component docs
3. **API Reference**: Document all public methods and properties
4. **Examples**: Working examples in showcase pages
5. **Migration Guide**: If introducing breaking changes

### Documentation Standards

- **Clear and Concise**: Easy to understand for all skill levels
- **Code Examples**: Include working code samples
- **Visual Examples**: Screenshots or live demos when helpful
- **API Documentation**: Complete method signatures and parameters

## Pull Request Process

### Before Submitting

1. **Run the full test suite**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

2. **Update documentation**
   - README if needed
   - Component documentation
   - CHANGELOG.md

3. **Test manually**
   - Use the development server
   - Test in multiple browsers
   - Verify accessibility

### PR Requirements

- **Descriptive Title**: Clear description of the change
- **Detailed Description**: What, why, and how of the change
- **Test Coverage**: All new code must be tested
- **Documentation**: Updated docs for any API changes
- **Screenshots**: For UI changes, include before/after screenshots

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

## Code Style Guide

### JavaScript Standards

```javascript
// Use modern ES6+ features
const myFunction = (param) => {
  return param.map(item => item.value);
};

// Use descriptive variable names
const componentElement = document.querySelector('.my-component');

// Use JSDoc for documentation
/**
 * Renders the component with given options
 * @param {Object} options - Configuration options
 * @param {string} options.variant - Component variant
 * @returns {string} Rendered HTML
 */
render(options = {}) {
  // Implementation
}
```

### CSS/dry2.css Standards

```html
<!-- Use consistent class naming -->
<div class="component-container flex items-center space-x-4">
  <button class="btn btn-primary hover:btn-primary-hover">
    Click me
  </button>
</div>
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent`)
- **Files**: kebab-case (`my-component.js`)
- **CSS Classes**: kebab-case (`component-container`)
- **Variables**: camelCase (`componentElement`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_TIMEOUT`)

### Linting

We use ESLint for code quality:

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## Release Process

### Version Numbers

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update version**
   ```bash
   npm version patch|minor|major
   ```

2. **Update CHANGELOG.md**
   - Document all changes
   - Follow Keep a Changelog format

3. **Create release PR**
   - Include version bump
   - Updated CHANGELOG
   - Updated documentation

4. **After merge**
   - Tag release on GitHub
   - Publish to npm
   - Deploy documentation

## Getting Help

### Resources

- **Documentation**: [https://your-docs-site.com](https://your-docs-site.com)
- **GitHub Discussions**: [Project discussions](https://github.com/yourusername/dry2-web-components/discussions)
- **Discord**: [Community chat](https://discord.gg/your-server)
- **Stack Overflow**: Tag with `dry2-components`

### Reporting Issues

When reporting bugs, please include:

1. **Environment details** (browser, OS, Node.js version)
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **Code samples** that demonstrate the issue
5. **Error messages** and stack traces if applicable

### Suggesting Features

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Provide use cases** and motivation
3. **Consider backward compatibility**
4. **Offer to contribute** the implementation

## Recognition

All contributors will be recognized in:

- **CONTRIBUTORS.md** file
- **GitHub contributors section**
- **Release notes** for significant contributions
- **Project README** for major contributions

Thank you for contributing to DRY2! Your efforts help make web development more accessible and enjoyable for everyone. 🎉
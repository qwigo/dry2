# Changelog

All notable changes to the DRY2 Web Components Library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Button Component**: Simplified icon system - replaced `icon-start` and `icon-end` attributes with single `icon` attribute that accepts Font Awesome CSS classes
- **Button Component**: Updated examples and documentation to use Font Awesome icons
- **Button Component**: Streamlined vanilla JavaScript implementation for better performance

### Added
- Initial release preparation
- Comprehensive test suite with Mocha
- Development server with hot reload
- Build scripts for npm publication
- TypeScript definitions
- Complete documentation
- **DryCode Component Integration**: Added dry-code component to documentation, examples showcase, API reference, and test runner
  - Updated examples index with Code Component card featuring syntax highlighting capabilities
  - Added comprehensive API documentation with attributes, methods, and usage examples
  - Integrated component into docs navigation and component listings
  - Updated README.md to include dry-code in the Editor Components section
  - Component automatically included in build system and test runner

## [1.0.0] - 2024-01-XX

### Added
- **Core Components Library**: 22 production-ready web components
- **Component Foundation**: Standard HTMLElement-based architecture with reactive state management
- **Button Component** (`dry-button`): Versatile button with variants, sizes, and loading states
- **Avatar Component** (`avatar-component`): User avatars with image fallbacks and initials  
- **Badge Component** (`badge-component`): Status indicators and notification badges
- **Accordion Component** (`dry-accordion`): Collapsible content sections
- **Card Component** (`card-component`): Flexible content containers
- **Carousel Component** (`carousel-component`): Touch-enabled carousel with autoplay
- **Chat Bubble Component** (`chat-bubble`): Chat message bubbles with status indicators
- **Collapse Component** (`collapse-component`): Smooth height-based collapse animations
- **Countdown Component** (`countdown-component`): Flexible countdown timers
- **Toast Component** (`toast-component`): Notification toasts with global API
- **Timeline Component** (`timeline-component`): Event timelines with custom styling
- **Breadcrumbs Component** (`breadcrumbs-component`): Hierarchical navigation breadcrumbs

- **Stat Component** (`stat-component`): Statistical data display with trends
- **Tabs Component** (`tabs-component`): Tabbed interface with multiple variants
- **Toggle Switch Component** (`toggle-switch`): Accessible toggle switch for boolean inputs
- **Select Component** (`super-select-component`): Advanced select with search and multi-selection
- **QR Component** (`qr-component`): QR code generation with customization
- **Dialog Component** (`dialog-component`): Modal dialogs with HTMX integration
- **Drawer Component** (`drawer-component`): Side panel/drawer with HTMX support
- **WYSIWYG Component** (`wysiwyg-component`): Rich text editor with HTML sanitization

### Features
- **Accessibility First**: All components include ARIA attributes and keyboard navigation
- **VanillaState Reactivity**: Reactive components with minimal JavaScript overhead
- **dry2.css Styling**: Beautiful, customizable styling out of the box
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Framework Agnostic**: Works with React, Vue, Angular, or vanilla HTML
- **TypeScript Support**: Full type definitions for better developer experience
- **Comprehensive Testing**: 100% test coverage with Mocha and Chai
- **Development Tools**: Hot reload development server and component browser
- **Theme Customization**: CSS custom properties for deep customization
- **Performance Optimized**: Small bundle sizes and lazy loading support

### Technical
- **Browser Support**: Chrome 73+, Firefox 63+, Safari 12.1+, Edge 79+
- **ES Module Support**: Modern JavaScript module system
- **Web Components Standard**: Built on native Custom Elements API
- **Proxy-based Reactivity**: Efficient state management
- **Slot System**: Flexible content projection
- **Event System**: Custom events for component integration
- **Error Handling**: Graceful error handling and development feedback

### Developer Experience
- **Component Browser**: Interactive development interface
- **Hot Reload**: Automatic page refresh on file changes
- **Test Runner**: Integrated testing with watch mode
- **Build System**: Automated building and optimization
- **Documentation**: Comprehensive README and API docs
- **Examples**: Complete showcase pages for all components
- **ESLint Configuration**: Code quality and consistency
- **NPM Ready**: Prepared for npm publication

### Documentation
- Comprehensive README with quick start guide
- Individual component documentation pages
- Framework integration examples (React, Vue, Angular)
- Performance optimization guides
- Accessibility best practices
- Theming and customization guides
- Contributing guidelines
- API reference documentation

---

## Release Notes Template

### [X.Y.Z] - YYYY-MM-DD

#### Added
- New features and components

#### Changed
- Changes to existing functionality

#### Deprecated
- Features that will be removed in future versions

#### Removed
- Features that have been removed

#### Fixed
- Bug fixes

#### Security
- Security improvements

---

## Migration Guides

### Migrating from 0.x to 1.0

This is the initial stable release. No migration needed.

### Breaking Changes

#### Version 1.0.0
- Initial release - no breaking changes

---

## Support and Compatibility

### Supported Browsers
- Chrome 73+
- Firefox 63+
- Safari 12.1+
- Edge 79+

### Node.js Compatibility
- Node.js 16.0.0+
- npm 8.0.0+

### Framework Compatibility
- React 16.8+
- Vue 3.0+
- Angular 12+
- Vanilla JavaScript/HTML

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# DRY2 Web Components Test Suite

This directory contains the testing infrastructure for DRY2 Web Components, organized into two distinct testing approaches:

## Directory Structure

```
tests/
├── unit/           # Node.js-based unit tests (JSDOM)
│   ├── components/ # Individual component unit tests
│   ├── setup.js    # Test environment setup
│   └── test-runner.js # Custom test runner
└── integration/    # Browser-based integration tests (Karma)
    ├── *.test.js   # Integration test files
    ├── karma.conf.js # Karma configuration
    └── components-test.html # HTML test page
```

## Unit Tests (`tests/unit/`)

**Purpose**: Fast, isolated testing of individual components
**Environment**: Node.js with JSDOM simulation
**Framework**: Mocha + Chai
**Features**:
- Fast feedback during development
- Comprehensive mocking capabilities
- Coverage reporting
- Watch mode
- Component-specific testing

### Running Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit:coverage

# Run specific component
npm run test:unit:component -- button

# Watch mode
npm run test:unit:watch
```

## Integration Tests (`tests/integration/`)

**Purpose**: End-to-end testing in real browser environment
**Environment**: Real browser (Chrome/ChromeHeadless)
**Framework**: Karma + Mocha + Chai + Sinon
**Features**:
- Tests actual browser behavior
- Validates HTMX integration
- Catches browser-specific issues
- CI/CD ready

### Running Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run in headless mode (CI)
npm run test:integration:ci
```

## Running All Tests

```bash
# Run both unit and integration tests
npm run test
```

## Test Development Guidelines

### Unit Tests
- Focus on component logic and API
- Mock external dependencies
- Test edge cases and error conditions
- Keep tests fast and isolated

### Integration Tests
- Test component interactions
- Validate real browser behavior
- Test HTMX integration
- Focus on user workflows

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- Unit test coverage: `coverage/unit/`
- Integration test coverage: `coverage/integration/` 
/**
 * ESLint configuration for DRY2 Web Components.
 *
 * src/**\/*.js files are loaded as classic <script> tags (no bundler,
 * no import/export) and rely on globals defined by sibling script tags
 * (BaseElement from base.js, Alpine/QRious/htmx from CDN scripts), so
 * they use sourceType "script" plus an explicit globals list instead of
 * cross-file static analysis.
 *
 * tests/**\/*.js files run under Node via mocha with native ESM
 * ("type": "module" in package.json) and rely on globals injected by
 * tests/unit/setup.js (expect, waitForComponent, BaseElement, ...).
 */
module.exports = {
  root: true,
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2022
  },
  overrides: [
    {
      files: ['src/**/*.js'],
      env: {
        browser: true,
        es2021: true
      },
      parserOptions: {
        sourceType: 'script'
      },
      globals: {
        BaseElement: 'writable',
        DRY2AlpineUtils: 'writable',
        ComponentBuilder: 'writable',
        Alpine: 'readonly',
        QRious: 'readonly',
        htmx: 'readonly'
      },
      rules: {
        // Several components intentionally declare `const`/functions
        // inside unbraced `switch` cases (see badge.js#_validateAttribute).
        'no-case-declarations': 'off',
        // Fallback/defensive catch blocks that don't use the error
        // object are a deliberate pattern throughout the components.
        'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
        'no-empty': ['error', { allowEmptyCatch: true }],
        // hasOwnProperty is called directly on plain internal data objects
        // throughout the components; flagged for follow-up, not blocking.
        'no-prototype-builtins': 'warn'
      }
    },
    {
      // base.js/component-builder.js are what *define* the BaseElement and
      // ComponentBuilder globals declared above - linting them with those
      // globals in scope would flag their own class declarations as
      // redeclaring a "built-in".
      files: ['src/**/base.js', 'src/**/component-builder.js'],
      rules: {
        'no-redeclare': 'off'
      }
    },
    {
      files: ['tests/**/*.js'],
      env: {
        browser: true,
        node: true,
        mocha: true,
        es2021: true
      },
      parserOptions: {
        sourceType: 'module'
      },
      globals: {
        expect: 'readonly',
        waitForComponent: 'readonly',
        triggerEvent: 'readonly',
        simulateClick: 'readonly',
        simulateKeydown: 'readonly',
        cleanupDOM: 'readonly',
        Alpine: 'writable',
        BaseElement: 'writable'
      },
      rules: {
        'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }]
      }
    },
    {
      // Karma injects `assert`/`sinon` globals via the karma-chai and
      // karma-sinon frameworks configured in tests/integration/karma.conf.js.
      files: ['tests/integration/**/*.js'],
      globals: {
        assert: 'readonly',
        sinon: 'readonly'
      }
    },
    {
      // This suite's karma.conf.js points at src/dry2/drawer-components.js,
      // web-components.js and avatar-component.js, none of which exist
      // (components now live at drawer.js/avatar.js; web-components.js and
      // its DatePicker component were apparently removed entirely). The
      // whole integration suite is orphaned/non-runnable pending a separate
      // cleanup - silencing no-undef here just avoids lint fighting a
      // suite that already can't execute, without pretending DatePicker
      // is real.
      files: ['tests/integration/web-components.test.js'],
      rules: {
        'no-undef': 'off'
      }
    }
  ]
};

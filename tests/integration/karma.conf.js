// karma.conf.js
module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    frameworks: ['mocha', 'chai', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      // Dependencies
      { pattern: 'https://unpkg.com/htmx.org@2.0.4', type: 'js' },

      // Components to test
      '../../src/dry2/dry2.js',
      '../../src/dry2/avatar.js', // Added avatar component

      // Test files
      'web-components.test.js',
      'avatar-component.test.js' // Added avatar component test
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    preprocessors: {
      '../../src/dry2/web-components.js': ['coverage'],
      '../../src/dry2/avatar-component.js': ['coverage'] // Added coverage for avatar component
    },

    // test results reporter to use
    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // Configure custom launchers for CI environments
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },

    // Add specific configuration for CI environments
    client: {
      mocha: {
        timeout: 5000 // Set timeout to 5 seconds
      }
    }
  });

  // Additional configuration for CI environment
  if (process.env.CI) {
    config.browsers = ['ChromeHeadlessCI'];
    config.singleRun = true;
    config.autoWatch = false;
  }
};

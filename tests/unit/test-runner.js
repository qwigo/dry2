/**
 * Test Runner for DRY2 Web Components
 * 
 * This file provides a utility to run unit tests and generate coverage reports.
 * It can be used both in development and CI/CD environments.
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestRunner {
  constructor() {
    this.testDir = __dirname;
    this.rootDir = join(__dirname, '../..');
    this.components = [
              'base',
        'button',
        'accordion',
      'avatar',
      'badge',
      'breadcrumbs',
      'card',
      'carousel',
      'chat-bubble',
      'collapse',
              'countdown',
        'dialog',
        'drawer',
      'qr',
      'select',
      'stat',
      'tabs',
      'timeline',
      'toast',
      'toggle-switch',
      'wysiwyg'
    ];
  }

  /**
   * Run all unit tests
   */
  async runAllTests() {
    console.log('🧪 Running DRY2 Web Components Unit Test Suite\n');

    const startTime = Date.now();
    
    try {
      const result = await this.runMocha([
        'tests/unit/**/*.test.js',
        '--require', 'tests/unit/setup.js',
        '--timeout', '5000',
        '--reporter', 'spec'
      ]);

      const duration = Date.now() - startTime;
      console.log(`\n✅ All unit tests completed in ${duration}ms`);
      
      return result;
    } catch (error) {
      console.error('❌ Unit test suite failed:', error.message);
      throw error;
    }
  }

  /**
   * Run tests with coverage
   */
  async runWithCoverage() {
    console.log('📊 Running unit tests with coverage analysis\n');

    try {
      const result = await this.runCommand('c8', [
        '--reporter=text',
        '--reporter=html',
        '--reporter=json',
        'mocha',
        'tests/unit/**/*.test.js',
        '--require', 'tests/unit/setup.js'
      ]);

      console.log('\n📈 Coverage report generated in coverage/ directory');
      return result;
    } catch (error) {
      console.error('❌ Coverage analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Run tests for specific component
   */
  async runComponentTests(componentName) {
    if (!this.components.includes(componentName)) {
      throw new Error(`Unknown component: ${componentName}. Available: ${this.components.join(', ')}`);
    }

    console.log(`🔬 Running unit tests for ${componentName} component\n`);

    try {
      const result = await this.runMocha([
        `tests/unit/components/${componentName}.test.js`,
        '--require', 'tests/unit/setup.js',
        '--timeout', '5000',
        '--reporter', 'spec'
      ]);

      console.log(`\n✅ ${componentName} unit tests completed`);
      return result;
    } catch (error) {
      console.error(`❌ ${componentName} unit tests failed:`, error.message);
      throw error;
    }
  }

  /**
   * Run tests in watch mode
   */
  async runWatchMode() {
    console.log('👀 Running unit tests in watch mode\n');
    console.log('Press Ctrl+C to stop watching\n');

    try {
      return await this.runMocha([
        'tests/unit/**/*.test.js',
        '--require', 'tests/unit/setup.js',
        '--timeout', '5000',
        '--reporter', 'spec',
        '--watch'
      ], { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Watch mode failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate test report
   */
  async generateReport() {
    console.log('📋 Generating test report\n');

    try {
      // Run tests with JSON reporter
      await this.runMocha([
        'tests/unit/**/*.test.js',
        '--require', 'tests/unit/setup.js',
        '--reporter', 'json',
        '--reporter-options', 'output=test-results.json'
      ]);

      // Read and process results
      const results = JSON.parse(readFileSync('test-results.json', 'utf8'));
      
      const report = this.formatTestReport(results);
      writeFileSync('test-report.md', report);

      console.log('📄 Test report generated: test-report.md');
      return report;
    } catch (error) {
      console.error('❌ Report generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Format test results into markdown report
   */
  formatTestReport(results) {
    const { stats, tests } = results;
    
    let report = `# DRY2 Web Components Test Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Tests**: ${stats.tests}
- **Passed**: ${stats.passes}
- **Failed**: ${stats.failures}
- **Pending**: ${stats.pending}
- **Duration**: ${stats.duration}ms

## Test Results by Component

`;

    const componentResults = this.groupTestsByComponent(tests);
    
    for (const [component, componentTests] of Object.entries(componentResults)) {
      const passed = componentTests.filter(t => t.state === 'passed').length;
      const failed = componentTests.filter(t => t.state === 'failed').length;
      const status = failed > 0 ? '❌' : '✅';
      
      report += `### ${status} ${component}

- Passed: ${passed}
- Failed: ${failed}
- Total: ${componentTests.length}

`;

      if (failed > 0) {
        report += '#### Failed Tests:\n\n';
        componentTests
          .filter(t => t.state === 'failed')
          .forEach(test => {
            report += `- **${test.title}**: ${test.err?.message || 'Unknown error'}\n`;
          });
        report += '\n';
      }
    }

    return report;
  }

  /**
   * Group tests by component name
   */
  groupTestsByComponent(tests) {
    const grouped = {};
    
    tests.forEach(test => {
      const component = test.fullTitle.split(' ')[0];
      if (!grouped[component]) {
        grouped[component] = [];
      }
      grouped[component].push(test);
    });
    
    return grouped;
  }

  /**
   * Run mocha with given arguments
   */
  async runMocha(args, options = {}) {
    return this.runCommand('mocha', args, options);
  }

  /**
   * Run a command with given arguments
   */
  async runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: this.rootDir,
        stdio: options.stdio || 'pipe',
        ...options
      });

      let stdout = '';
      let stderr = '';

      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
          if (!options.stdio) {
            process.stdout.write(data);
          }
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data.toString();
          if (!options.stdio) {
            process.stderr.write(data);
          }
        });
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Command failed with code ${code}\n${stderr}`));
        }
      });

      child.on('error', reject);
    });
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  const command = process.argv[2];
  const arg = process.argv[3];

  (async () => {
    try {
      switch (command) {
        case 'all':
          await runner.runAllTests();
          break;
        case 'coverage':
          await runner.runWithCoverage();
          break;
        case 'watch':
          await runner.runWatchMode();
          break;
        case 'component':
          if (!arg) {
            console.error('Component name required. Usage: node test-runner.js component <name>');
            process.exit(1);
          }
          await runner.runComponentTests(arg);
          break;
        case 'report':
          await runner.generateReport();
          break;
        default:
          console.log(`
DRY2 Test Runner

Usage:
  node test-runner.js all        Run all tests
  node test-runner.js coverage   Run tests with coverage
  node test-runner.js watch      Run tests in watch mode
  node test-runner.js component <name>  Run tests for specific component
  node test-runner.js report     Generate test report

Available components: ${runner.components.join(', ')}
`);
      }
    } catch (error) {
      console.error('Test runner error:', error.message);
      process.exit(1);
    }
  })();
}

export default TestRunner;
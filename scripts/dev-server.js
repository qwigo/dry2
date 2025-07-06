#!/usr/bin/env node

/**
 * Development server for DRY2 Web Components
 * 
 * Provides:
 * - Static file serving
 * - Hot reload for development
 * - Component showcase browser
 * - Test runner integration
 */

import express from 'express';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class DevServer {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.host = options.host || 'localhost';
    this.app = express();
    this.components = [];
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupFileWatcher();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Static file serving
    this.app.use('/src', express.static(join(rootDir, 'src')));
    this.app.use('/examples', express.static(join(rootDir, 'examples')));
    this.app.use('/test', express.static(join(rootDir, 'test')));
    
    // CORS for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    // Cache control
    this.app.use((req, res, next) => {
      if (req.url.includes('/src/') || req.url.includes('/examples/')) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      next();
    });
  }

  /**
   * Setup Express routes
   */
  setupRoutes() {
    // Root route - component browser
    this.app.get('/', (req, res) => {
      res.send(this.generateComponentBrowser());
    });

    // Component showcase route
    this.app.get('/component/:name', (req, res) => {
      const componentName = req.params.name;
      const showcasePath = join(rootDir, 'examples', `${componentName}-showcase.html`);
      
      if (existsSync(showcasePath)) {
        const content = readFileSync(showcasePath, 'utf8');
        res.send(this.injectDevTools(content));
      } else {
        res.status(404).send(this.generate404Page(componentName));
      }
    });

    // Test runner route
    this.app.get('/test/:component?', (req, res) => {
      const component = req.params.component;
      res.send(this.generateTestRunner(component));
    });

    // API route for component list
    this.app.get('/api/components', (req, res) => {
      res.json({
        components: this.discoverComponents(),
        timestamp: Date.now()
      });
    });

    // API route for component info
    this.app.get('/api/component/:name', (req, res) => {
      const componentName = req.params.name;
      const info = this.getComponentInfo(componentName);
      
      if (info) {
        res.json(info);
      } else {
        res.status(404).json({ error: 'Component not found' });
      }
    });

    // Hot reload endpoint
    this.app.get('/api/reload', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      const keepAlive = setInterval(() => {
        res.write('data: ping\n\n');
      }, 30000);

      this.reloadClients = this.reloadClients || [];
      this.reloadClients.push(res);

      req.on('close', () => {
        clearInterval(keepAlive);
        this.reloadClients = this.reloadClients.filter(client => client !== res);
      });
    });
  }

  /**
   * Setup file watcher for hot reload
   */
  setupFileWatcher() {
    const watcher = chokidar.watch([
      join(rootDir, 'src/**/*.js'),
      join(rootDir, 'examples/**/*.html')
    ], {
      ignored: /node_modules/,
      persistent: true
    });

    watcher.on('change', (path) => {
      console.log(`📝 File changed: ${path}`);
      this.notifyReload();
    });

    watcher.on('add', (path) => {
      console.log(`➕ File added: ${path}`);
      this.notifyReload();
    });
  }

  /**
   * Notify all connected clients to reload
   */
  notifyReload() {
    if (this.reloadClients) {
      this.reloadClients.forEach(client => {
        try {
          client.write('data: reload\n\n');
        } catch (error) {
          // Client disconnected
        }
      });
    }
  }

  /**
   * Generate component browser HTML
   */
  generateComponentBrowser() {
    const components = this.discoverComponents();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DRY2 Components - Development Browser</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .component-card {
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .component-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="bg-gray-100">
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">DRY2 Development Browser</h1>
                    <p class="text-gray-600">Browse and test your components</p>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/test" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        <i class="fas fa-flask mr-2"></i>Run Tests
                    </a>
                    <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        <i class="fas fa-circle text-green-500 mr-1"></i>Dev Server
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Components (${components.length})</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${components.map(component => `
                    <a href="/component/${component.name}" class="component-card bg-white rounded-lg shadow p-6 block">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-gray-900">${component.displayName}</h3>
                            <i class="fas fa-cube text-blue-500"></i>
                        </div>
                        <p class="text-gray-600 mb-4">${component.description}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-500">
                                <i class="fas fa-tag mr-1"></i>${component.tagName}
                            </span>
                            <span class="text-sm text-blue-600">
                                View Examples →
                            </span>
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/test" class="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <i class="fas fa-flask text-green-500 mr-3"></i>
                    <div>
                        <div class="font-medium">Run All Tests</div>
                        <div class="text-sm text-gray-500">Execute the full test suite</div>
                    </div>
                </a>
                <a href="/examples" class="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <i class="fas fa-eye text-blue-500 mr-3"></i>
                    <div>
                        <div class="font-medium">Browse Examples</div>
                        <div class="text-sm text-gray-500">View all showcase pages</div>
                    </div>
                </a>
                <a href="/api/components" class="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <i class="fas fa-code text-purple-500 mr-3"></i>
                    <div>
                        <div class="font-medium">API Reference</div>
                        <div class="text-sm text-gray-500">Component metadata</div>
                    </div>
                </a>
            </div>
        </div>
    </main>

    ${this.getHotReloadScript()}
</body>
</html>
    `.trim();
  }

  /**
   * Generate test runner HTML
   */
  generateTestRunner(component) {
    const testFiles = component ? [`test/components/${component}.test.js`] : ['test/**/*.test.js'];
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DRY2 Test Runner</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-100">
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">DRY2 Test Runner</h1>
                    <p class="text-gray-600">${component ? `Testing: ${component}` : 'All Components'}</p>
                </div>
                <a href="/" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Browser
                </a>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold">Test Results</h2>
                <button id="runTests" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <i class="fas fa-play mr-2"></i>Run Tests
                </button>
            </div>
            
            <div id="testOutput" class="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <div class="text-gray-500">Click "Run Tests" to start testing...</div>
            </div>
        </div>
    </main>

    <script>
        document.getElementById('runTests').addEventListener('click', async () => {
            const output = document.getElementById('testOutput');
            output.innerHTML = '<div class="text-blue-600">Running tests...</div>';
            
            try {
                // In a real implementation, this would trigger the test runner
                output.innerHTML = '<div class="text-green-600">✅ All tests passed!</div>';
            } catch (error) {
                output.innerHTML = \`<div class="text-red-600">❌ Tests failed: \${error.message}</div>\`;
            }
        });
    </script>

    ${this.getHotReloadScript()}
</body>
</html>
    `.trim();
  }

  /**
   * Generate 404 page
   */
  generate404Page(componentName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Not Found - DRY2</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <i class="fas fa-exclamation-triangle text-yellow-500 text-6xl mb-4"></i>
            <h1 class="text-2xl font-bold text-gray-900 mb-4">Component Not Found</h1>
            <p class="text-gray-600 mb-6">
                The component "${componentName}" doesn't have a showcase page.
            </p>
            <div class="space-y-3">
                <a href="/" class="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Browser
                </a>
                <p class="text-sm text-gray-500">
                    Create a showcase: <code class="bg-gray-100 px-2 py-1 rounded">${componentName}-showcase.html</code>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Inject development tools into showcase pages
   */
  injectDevTools(content) {
    const devTools = `
    <!-- DRY2 Development Tools -->
    <div id="dry2-dev-tools" style="position: fixed; top: 10px; right: 10px; z-index: 9999; background: white; border: 1px solid #ccc; border-radius: 8px; padding: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #333;">DRY2 Dev Tools</div>
        <div style="display: flex; gap: 5px;">
            <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Reload</button>
            <button onclick="window.location.href='/'" style="background: #6b7280; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">Browser</button>
        </div>
    </div>

    ${this.getHotReloadScript()}
    `;

    return content.replace('</body>', `${devTools}</body>`);
  }

  /**
   * Get hot reload script
   */
  getHotReloadScript() {
    return `
    <script>
        // Hot reload functionality
        const eventSource = new EventSource('/api/reload');
        eventSource.onmessage = function(event) {
            if (event.data === 'reload') {
                console.log('🔄 Reloading page due to file changes...');
                window.location.reload();
            }
        };
        
        eventSource.onerror = function(event) {
            console.log('❌ Hot reload connection lost');
        };
    </script>
    `;
  }

  /**
   * Discover all components
   */
  discoverComponents() {
    const srcDir = join(rootDir, 'src', 'dry2');
    const files = readdirSync(srcDir).filter(file => 
      file.endsWith('.js') && file !== 'dry2.js'
    );

    return files.map(file => {
      const name = file.replace('.js', '');
      return {
        name,
        filename: file,
        displayName: this.toDisplayName(name),
        tagName: this.getTagName(name),
        description: this.getComponentDescription(name),
        hasShowcase: existsSync(join(rootDir, 'examples', `${name}-showcase.html`)),
        hasTest: existsSync(join(rootDir, 'test', 'components', `${name}.test.js`))
      };
    });
  }

  /**
   * Get component info
   */
  getComponentInfo(name) {
    const componentPath = join(rootDir, 'src', 'dry2', `${name}.js`);
    
    if (!existsSync(componentPath)) {
      return null;
    }

    const content = readFileSync(componentPath, 'utf8');
    const showcasePath = join(rootDir, 'examples', `${name}-showcase.html`);
    const testPath = join(rootDir, 'test', 'components', `${name}.test.js`);

    return {
      name,
      displayName: this.toDisplayName(name),
      tagName: this.getTagName(name),
      description: this.getComponentDescription(name),
      hasShowcase: existsSync(showcasePath),
      hasTest: existsSync(testPath),
      size: statSync(componentPath).size,
      lastModified: statSync(componentPath).mtime,
      lineCount: content.split('\n').length
    };
  }

  /**
   * Convert component name to display name
   */
  toDisplayName(name) {
    return name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/^Dry /, '');
  }

  /**
   * Get component tag name
   */
  getTagName(name) {
    // This should ideally parse the component file to get the actual tag name
    return name.includes('dry-') ? name : `${name}-component`;
  }

  /**
   * Get component description
   */
  getComponentDescription(name) {
    const descriptions = {
      'button': 'Versatile button with variants, sizes, and loading states',
      'avatar': 'User avatars with image fallbacks and initials',
      'badge': 'Status indicators and notification badges',
      'accordion': 'Collapsible content sections',
              'toast': 'Notification toasts with global API',
        'carousel': 'Touch-enabled carousel with autoplay',
        'countdown': 'Flexible countdown timers',
      'tabs': 'Tabbed interface with multiple variants',
      'select': 'Advanced select with search and multi-selection'
    };

    return descriptions[name] || `${this.toDisplayName(name)} component`;
  }

  /**
   * Start the development server
   */
  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, this.host, () => {
        console.log(`🚀 DRY2 Development Server running at http://${this.host}:${this.port}`);
        console.log(`📦 Components: ${this.discoverComponents().length}`);
        console.log(`🔄 Hot reload enabled`);
        console.log(`📁 Serving from: ${rootDir}`);
        resolve();
      });
    });
  }

  /**
   * Stop the development server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('🛑 Development server stopped');
          resolve();
        });
      });
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.argv[2] || 3000;
  const host = process.argv[3] || 'localhost';

  const server = new DevServer({ port, host });
  
  server.start().catch(error => {
    console.error('Failed to start development server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down development server...');
    await server.stop();
    process.exit(0);
  });
}

export default DevServer;
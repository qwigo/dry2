/**
 * Dev Server Static Asset Smoke Tests
 *
 * Boots the DevServer on an ephemeral port and asserts that the paths covered
 * by the QE curl smoke are served, while repo-internal paths stay hidden.
 *
 * The /dist bundle and root showcase page cases document the issue #11
 * regression: they fail against the current routing and turn green once the
 * dev server mounts /dist and serves root-level showcase HTML.
 */

import chai from 'chai';
import { existsSync, readdirSync, renameSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import DevServer from '../../../scripts/dev-server.js';

const { expect } = chai;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..', '..');

const HOST = '127.0.0.1';

let devServer;
let baseUrl;

/**
 * Discover the root-level showcase HTML pages present in the repo.
 * @returns {string[]} File names of root-level *.html pages.
 */
const getRootShowcasePages = () => readdirSync(rootDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name);

/**
 * Fetch a path from the dev server under test.
 * @param {string} path - Request path starting with a slash.
 * @returns {Promise<Response>} The fetch response for the path.
 */
const get = (path) => fetch(`${baseUrl}${path}`);

/**
 * Shut a DevServer down defensively so teardown never masks the real error
 * when startup failed part-way through.
 * @param {DevServer|undefined} server - The server instance to stop, if any.
 * @returns {Promise<void>} Resolves once the server is fully stopped.
 */
const stopServer = async(server) => {
  if (server?.server) {
    server.server.closeAllConnections();
  }
  await server?.stop();
};

describe('DevServer static asset serving', () => {
  before(async() => {
    devServer = new DevServer({ port: 0, host: HOST });
    await devServer.start();
    const { port } = devServer.server.address();
    baseUrl = `http://${HOST}:${port}`;
  });

  after(async() => {
    await stopServer(devServer);
  });

  it('serves /dist/dry2.js with a JavaScript content type', async() => {
    const response = await get('/dist/dry2.js');

    expect(response.status).to.equal(200);
    expect(response.headers.get('content-type')).to.match(/javascript/);
  });

  it('serves every root-level showcase HTML page', async() => {
    const pages = getRootShowcasePages();

    expect(pages).to.include.members([
      'all-components-showcase.html',
      'button-showcase.html',
      'index.html'
    ]);

    for (const page of pages) {
      const response = await get(`/${page}`);

      expect(response.status, `GET /${page}`).to.equal(200);
    }
  });

  it('serves /examples/index.html', async() => {
    const response = await get('/examples/index.html');

    expect(response.status).to.equal(200);
    expect(response.headers.get('content-type')).to.match(/html/);
  });

  it('serves the dist bundle referenced by /examples/index.html', async() => {
    const pageResponse = await get('/examples/index.html');
    const html = await pageResponse.text();
    const scriptTag = html.match(/<script[^>]*\ssrc="([^"]*dist\/dry2\.js)"/);

    expect(scriptTag, 'examples/index.html must reference dist/dry2.js').to.not.equal(null);

    const bundlePath = new URL(scriptTag[1], `${baseUrl}/examples/index.html`).pathname;
    const bundleResponse = await get(bundlePath);

    expect(bundleResponse.status, `GET ${bundlePath}`).to.equal(200);
    expect(bundleResponse.headers.get('content-type')).to.match(/javascript/);
  });

  it('serves the component browser at /', async() => {
    const response = await get('/');

    expect(response.status).to.equal(200);
    expect(response.headers.get('content-type')).to.match(/html/);
  });

  it('does not serve repo-internal files', async() => {
    const privatePaths = [
      '/.git/config',
      '/node_modules/express/package.json',
      // Encoded traversal and hidden-file probes: each would pass the root-HTML
      // route regex if its allowlist ever regressed.
      '/..%2fpackage.json',
      '/%2e%2e%2fsecrets.html',
      '/.hidden.html',
      '/sub%2findex.html'
    ];

    for (const path of privatePaths) {
      const response = await get(path);

      expect(response.status, `GET ${path}`).to.equal(404);
    }
  });
});

describe('DevServer dist bundle bootstrap and shutdown', () => {
  const bundlePath = join(rootDir, 'dist', 'dry2.js');
  const bundleBackupPath = join(rootDir, 'dist', 'dry2.js.test-backup');
  const buildScriptPath = join(rootDir, 'scripts', 'build.js');
  const buildBackupPath = join(rootDir, 'scripts', 'build.js.test-backup');

  /**
   * Move a file aside for the duration of a test.
   * @param {string} filePath - Path of the file to move.
   * @param {string} backupPath - Temporary path to move it to.
   */
  const stashFile = (filePath, backupPath) => {
    if (existsSync(filePath)) {
      renameSync(filePath, backupPath);
    }
  };

  /**
   * Restore a file previously moved aside by stashFile.
   * @param {string} filePath - Original path of the file.
   * @param {string} backupPath - Temporary path it was moved to.
   */
  const restoreFile = (filePath, backupPath) => {
    if (existsSync(backupPath)) {
      if (existsSync(filePath)) {
        rmSync(filePath);
      }
      renameSync(backupPath, filePath);
    }
  };

  it('builds dist/dry2.js at startup when the bundle is missing', async() => {
    let server;

    expect(existsSync(bundlePath), 'precondition: dist/dry2.js exists').to.equal(true);
    stashFile(bundlePath, bundleBackupPath);

    try {
      server = new DevServer({ port: 0, host: HOST });
      await server.start();

      expect(existsSync(bundlePath), 'startup must rebuild the missing bundle').to.equal(true);

      const { port } = server.server.address();
      const response = await fetch(`http://${HOST}:${port}/dist/dry2.js`);

      expect(response.status).to.equal(200);
      expect(response.headers.get('content-type')).to.match(/javascript/);
    } finally {
      await stopServer(server);
      restoreFile(bundlePath, bundleBackupPath);
    }
  });

  it('fails startup with a clear, path-free message when the build fails', async() => {
    let server = null;
    let thrown = null;

    stashFile(bundlePath, bundleBackupPath);
    stashFile(buildScriptPath, buildBackupPath);

    try {
      server = new DevServer({ port: 0, host: HOST });

      try {
        await server.start();
      } catch (error) {
        thrown = error;
      }

      expect(thrown, 'start() must reject when the build fails').to.be.an('error');
      expect(thrown.message).to.include('dist/dry2.js is missing');
      expect(thrown.message).to.include('Run "npm run build" manually');
      expect(thrown.message, 'error message must not leak absolute paths').to.not.include(rootDir);
    } finally {
      await stopServer(server);
      restoreFile(buildScriptPath, buildBackupPath);
      restoreFile(bundlePath, bundleBackupPath);
    }
  });

  it('stop() closes the file watcher so the process can exit', async() => {
    const server = new DevServer({ port: 0, host: HOST });

    await server.start();
    expect(server.watcher, 'startup must attach a file watcher').to.not.equal(null);

    try {
      await server.stop();
      expect(server.watcher, 'stop() must close and release the watcher').to.equal(null);
    } finally {
      await stopServer(server);
    }
  });
});

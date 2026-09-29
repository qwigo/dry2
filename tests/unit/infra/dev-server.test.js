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
import { readdirSync } from 'fs';
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

describe('DevServer static asset serving', () => {
  before(async() => {
    devServer = new DevServer({ port: 0, host: HOST });
    await devServer.start();
    const { port } = devServer.server.address();
    baseUrl = `http://${HOST}:${port}`;
  });

  after(async() => {
    if (devServer.watcher) {
      await devServer.watcher.close();
    }
    devServer.server.closeAllConnections();
    await devServer.stop();
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
    const privatePaths = ['/.git/config', '/node_modules/express/package.json'];

    for (const path of privatePaths) {
      const response = await get(path);

      expect(response.status, `GET ${path}`).to.equal(404);
    }
  });
});

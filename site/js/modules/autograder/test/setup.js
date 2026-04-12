import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream/web';

import * as Common from '../common/index.js';
import * as Core from '../core.js';
import * as Testdata from './testdata.js';
import * as Util from '../util/index.js'

const DEFAULT_ID_EMAIL = 'server-admin@test.edulinq.org';
const DEFAULT_ID_NAME = 'server-admin';
const DEFAULT_ID_TOKEN_ID = 'test-token-id';

// Replace JSDOM objects with Node versions (Jest makes these replacements).
global.DecompressionStream = stream.DecompressionStream;

global.alert = function(message) {
    console.log(`ALERT: ${message}`);
}

// Mock fetch to use our test data.
global.fetch = function(url, options = {}) {
    let endpoint = url.replace(/^\//, '');
    let content = JSON.parse(options.body.get('content'));

    // Overwrite some args for testing.
    content['source'] = 'testing';
    content['source-version'] = '0.0.0';

    // Overrite password (token) with the known password in the test data.
    content['user-pass'] = Util.sha256(content['user-email'].replace('@test.edulinq.org', ''));

    // Sort arg keys.
    let sortedArgs = {};
    for (const key of Object.keys(content).sort()) {
        sortedArgs[key] = content[key];
    }

    // Extract files from response body object,
    // keys (other than reponse content) are file names.
    let files = [];
    for (const key of options?.body.keys()) {
        if (key === "content") {
            continue;
        }

        // Format file name to match test data format.
        files.push(`__DATA_DIR__(${key})`);
    }

    let keyData = {
        'arguments': sortedArgs,
        'endpoint': endpoint,
        'files': files,
    };
    let key = JSON.stringify(keyData);

    let response = Testdata.testAPIResponses[key];
    if (!response) {
        console.error(keyData);
        throw new Error(`Unknown API key: '${key}'.`);
    }

    return Promise.resolve({
        json: function() {
            return Promise.resolve(response);
        },
        text: function() {
            return Promise.resolve(response.message);
        },
    });
}

// Load the cached test responses.
function loadAPITestData() {
    Testdata.loadCache();
}

// Load the site's HTML into the DOM.
function loadHTML() {
    const html = fs.readFileSync(path.join('site', 'index.html'), 'utf8');
    document.documentElement.innerHTML = html;
}

// Load the default testing identity.
function loadAPITestIdentity() {
    Core.setCredentials(DEFAULT_ID_EMAIL, DEFAULT_ID_TOKEN_ID, DEFAULT_ID_NAME);
}

beforeAll(function() {
    loadAPITestData();
    loadAPITestIdentity();
    loadHTML();
});

import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream/web';

import * as Common from '../common/index.js';
import * as Core from '../core.js';
import * as Testdata from './testdata.js';

const DEFAULT_ID_EMAIL = 'server-admin@test.edulinq.org';
const DEFAULT_ID_CLEARTEXT = 'server-admin';

// Ignore these keys when looking up test requests.
const SKIP_LOOKUP_KEYS = [
    'source',
    'source-version',
];

// Replace JSDOM objects with Node versions (Jest makes these replacements).
global.DecompressionStream = stream.DecompressionStream;

global.alert = function(message) {
    console.log(`ALERT: ${message}`);
}

// Mock fetch to use our test data.
global.fetch = function(url, options = {}) {
    let endpoint = url.replace(/^\/api\/v\d+\//, '');
    let content = JSON.parse(options.body.get('content'));

    // Create arguments by lexicographically traversing the content.
    let args = {};
    for (const key of Object.keys(content).sort()) {
        if (SKIP_LOOKUP_KEYS.includes(key)) {
            continue
        }

        args[key] = content[key];

        // Lower case Course ID to match test data format.
        if (key === 'course-id') {
            args[key] = args[key].toLowerCase();
        }
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
        'arguments': args,
        'endpoint': endpoint,
        'files': files,
    };
    let key = JSON.stringify(keyData);

    let responseContent = Testdata.testAPIResponses[key];
    if (!responseContent) {
        console.error(keyData);
        throw new Error(`Unknown API key: '${key}'.`);
    }

    let response = {
        'id': '00000000-0000-0000-0000-000000000000',
        'locator': '',
        'server-version': '0.0.0',
        'start-timestamp': Common.getTimestampNow(),
        'end-timestamp': Common.getTimestampNow(),
        'status': 200,
        'success': true,
        'message': responseContent.message ?? '',
        'content': responseContent.output,
    };

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
    Core.setCredentials(DEFAULT_ID_EMAIL, '<TOKEN_ID>', DEFAULT_ID_CLEARTEXT);
}

beforeAll(function() {
    loadAPITestData();
    loadAPITestIdentity();
    loadHTML();
});

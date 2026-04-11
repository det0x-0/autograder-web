import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import * as Util from '../util/index.js';

const TEMP_DIR = path.join(os.tmpdir(), 'ag-web');
const RESPONSES_PATH = path.join(TEMP_DIR, 'testdata-exchanges.json');

let testAPIResponses = {};

// Load the test data from the autograder-testdata submoule, compile it into one object, and write it out to `RESPONSES_PATH`.
// Note that this Jest global setup does not share memory with running tests, so we will write it to a file and load it as necessary.
async function globalSetupLoadData() {
    fs.mkdirSync(TEMP_DIR, {recursive: true});

    const text = fs.readFileSync(path.join('site', 'js', 'modules', 'autograder', 'test', 'api_test_data.json'), 'utf8');
    let exchanges = JSON.parse(text);

    for (const [key, value] of Object.entries(exchanges)) {
        let keyData = JSON.parse(key);
        if (keyData.endpoint === 'users/tokens/create') {
            let userEmail = keyData['arguments']['user-email'];
            let displayName = userEmail.split('@')[0];

            cleanTokensCreateTestData(exchanges, key, displayName, value);
            createTokensDeleteTestData(exchanges, userEmail, displayName, value.output['token-cleartext']);
            createTokensDeleteTestData(exchanges, userEmail, displayName);
        }
    }

    const responseText = JSON.stringify(exchanges);
    fs.writeFileSync(RESPONSES_PATH, responseText);
}

// Update the users/tokens/create testdata to return a token that matches the test user's name.
// This token is hashed and used as part of the lookup key for subsequent API calls.
// The test data expects the user's pass to match their name (not a token).
function cleanTokensCreateTestData(exchanges, key, displayName, value) {
    value.output['token-cleartext'] = displayName;
    exchanges[key] = value;
}

// Generate test data for users/tokens/delete for the user and cleartext combination.
function createTokensDeleteTestData(exchanges, userEmail, cleartext, tokenId = '<TOKEN_ID>') {
    let endpoint = 'users/tokens/delete';
    let args = {
        'token-id': tokenId,
        'user-email': userEmail,
        'user-pass': Util.sha256(cleartext),
    };

    let keyData = {
        'arguments': args,
        'endpoint': endpoint,
        'files': [],
    };
    let key = JSON.stringify(keyData);

    exchanges[key] = {
        'endpoint': endpoint,
        'module_name': 'autograder.api.users.tokens.delete',
        'arguments': {
            'token-id': tokenId,
        },
        'output': {
            'found': true,
        },
    };
}

// Load the cached test responses.
function loadCache() {
    const text = fs.readFileSync(RESPONSES_PATH, 'utf8');
    testAPIResponses = JSON.parse(text);
}

export {
    globalSetupLoadData as default,

    loadCache,

    testAPIResponses,
}

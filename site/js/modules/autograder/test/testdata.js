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

    const dirents = fs.readdirSync(path.join('testdata', 'autograder-testdata', 'testdata', 'http'), {withFileTypes: true, recursive: true});

    let responses = {};
    for (const dirent of dirents) {
        if (!dirent.isFile()) {
            continue;
        }

        const direntPath = path.join(dirent.parentPath, dirent.name);
        const text = fs.readFileSync(direntPath, 'utf8');
        let data = JSON.parse(text);

        let args = JSON.parse(data.parameters.content);

        let endpoint = data.url_path;

        let files = [];
        for (const fileInfo of data?.files) {
            files.push(`__DATA_DIR__(${fileInfo.name})`);
        }

        // If this is a token delete, modify it to target only test tokens.
        if (endpoint == 'api/v03/users/tokens/delete') {
            args['token-id'] = 'test-token-id';
        }

        let keyData = {
            'arguments': args,
            'endpoint': endpoint,
            'files': files,
        };
        let key = JSON.stringify(keyData);

        responses[key] = JSON.parse(data.response_body);
    }

    const responseText = JSON.stringify(responses);
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
function createTokensDeleteTestData(exchanges, userEmail, cleartext, tokenID = '<TOKEN_ID>') {
    let endpoint = 'users/tokens/delete';
    let args = {
        'token-id': tokenID,
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
            'token-id': tokenID,
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

import fs from 'node:fs';
import path from 'node:path';

import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';
import * as Test from '../../../test/index.js';

test('Proxy Submit, Success', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_PROXY_SUBMIT,
            {[Core.Routing.PARAM_COURSE]: 'course-languages', [Core.Routing.PARAM_ASSIGNMENT]: 'bash'},
    );

    Test.checkPageBasics('bash', 'assignment proxy submit');

    const fileContent = fs.readFileSync(
        path.join('testdata', 'autograder-testdata', 'autograder-server', 'testdata', 'course-languages', 'bash', 'test-submissions', 'solution', 'assignment.sh'),
        'utf8'
    );
    const fileObj = new File([fileContent], 'assignment.sh');

    document.querySelector('.input-field[data-name="files"] input')[Render.TEST_FILES_KEY] = [fileObj];
    document.querySelector('.input-field #email').value = 'course-student@test.edulinq.org';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('course-student@test.edulinq.org');
    expect(results).toContain('Score');
});

test('Proxy Submit, User Not Found', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_PROXY_SUBMIT,
            {[Core.Routing.PARAM_COURSE]: 'course-languages', [Core.Routing.PARAM_ASSIGNMENT]: 'bash'},
    );

    Test.checkPageBasics('bash', 'assignment proxy submit');

    const fileContent = fs.readFileSync(
        path.join('testdata', 'autograder-testdata', 'autograder-server', 'testdata', 'course-languages', 'bash', 'test-submissions', 'solution', 'assignment.sh'),
        'utf8'
    );
    const fileObj = new File([fileContent], 'assignment.sh');

    document.querySelector('.input-field[data-name="files"] input')[Render.TEST_FILES_KEY] = [fileObj];
    document.querySelector('.input-field #email').value = 'ZZZ@test.edulinq.org';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('Grading Failed');
    expect(results).toContain('User not found.');
});

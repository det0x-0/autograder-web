import fs from 'node:fs';
import path from 'node:path';

import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';
import * as Test from '../../../test/index.js';

test('Proxy Submit, Success', async function () {
    await Test.loginUser('course-admin');
    await Test.navigate(
        Core.Routing.PATH_PROXY_SUBMIT,
        { [Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0' },
    );

    Test.checkPageBasics('hw0', 'assignment proxy submit');

    const fileContent = fs.readFileSync(
        path.join('site', 'js', 'modules', 'autograder', 'test', 'data', 'hw0_solution.py'),
        'utf8'
    );
    const fileObj = new File([fileContent], 'hw0_solution.py');

    document.querySelector('.input-field[data-name="files"] input')[Render.TEST_FILES_KEY] = [fileObj];

    
    document.querySelector('.input-field #email').value = 'course-student@test.edulinq.org';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('course-student@test.edulinq.org');
    expect(results).toContain('Score');
});

test('Proxy Submit, User Not Found', async function () {
    await Test.loginUser('course-admin');
    await Test.navigate(
        Core.Routing.PATH_PROXY_SUBMIT,
        { [Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0' },
    );

    Test.checkPageBasics('hw0', 'assignment proxy submit');

    const fileContent = fs.readFileSync(
        path.join('site', 'js', 'modules', 'autograder', 'test', 'data', 'hw0_solution.py'),
        'utf8'
    );
    const fileObj = new File([fileContent], 'hw0_solution.py');

    document.querySelector('.input-field[data-name="files"] input')[Render.TEST_FILES_KEY] = [fileObj];

    document.querySelector('.input-field #email').value = 'zzz@test.edulinq.org';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('Grading Failed');
    expect(results).toContain('User not found.');
});


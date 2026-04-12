import * as Core from '../../../core/index.js';
import * as Test from '../../../test/index.js';

test('Proxy Regrade', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_PROXY_REGRADE,
            {[Core.Routing.PARAM_COURSE]: 'course-languages', [Core.Routing.PARAM_ASSIGNMENT]: 'bash'},
    );

    Test.checkPageBasics('bash', 'assignment proxy regrade');

    document.querySelector('.input-field #users').value = JSON.stringify([
            "student",
    ]);

    await Test.submitTemplate();

    let results = document.querySelector('.results-area code').innerHTML;
    let output = JSON.parse(results);
    expect(output['resolved-users'].length).toEqual(1);
});

import * as Core from '../../../../core.js';

function submit(course, assignment, files, proxyEmail, proxyTime = undefined, message = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/proxy/submit',
        files: files,
        payload: {
            'course-id': course,
            'assignment-id': assignment,
            'proxy-email': proxyEmail,
            'proxy-time': proxyTime,
            'message': message,
        },
    });
}

export {
    submit,
}

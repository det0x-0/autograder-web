import * as Core from '../core.js';

function scores(course, assignmentLMSID, scores) {
    return Core.sendRequest({
        endpoint: 'lms/upload/scores',
        payload: {
            'course-id': course,
            'assignment-lms-id': assignmentLMSID,
            'scores': scores,
        },
    });
}

export {
    scores,
};

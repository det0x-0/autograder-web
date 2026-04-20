import * as Autograder from '../../../../autograder/index.js';
import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_COURSE_LMS_UPLOAD_SCORES, handlerUploadScores, 'Upload LMS Scores', Core.Routing.NAV_COURSES, {course: true});
}

function handlerUploadScores(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    let inputFields = [
        new Render.FieldType(context, 'assignment-lms-id', 'Assignment LMS ID', {
            type: Render.INPUT_TYPE_STRING,
            required: true,
        }),
        new Render.FieldType(context, 'scores', 'Scores (Email <tab> Score)', {
            type: Render.INPUT_TYPE_TEXTAREA,
            required: true,
            placeholder: 'user@test.com\t100\n...',
            extractInputFunc: function(input) {
                let rawValue = input.value.trim();
                if (rawValue === '') {
                    return [];
                }

                let lines = rawValue.split('\n');
                let scores = [];

                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i].trim();
                    if (line === '') {
                        continue;
                    }

                    let parts = line.split('\t');
                    if (parts.length < 2) {
                        parts = line.split(/\s+/);
                    }

                    if (parts.length < 2) {
                        continue;
                    }

                    scores.push({
                        'email': parts[0].trim(),
                        'score': parseFloat(parts[1].trim()),
                    });
                }

                return scores;
            }
        }),
    ];

    Render.makePage(
            params, context, container, uploadScores,
            {
                header: 'Upload LMS Scores',
                description: 'Upload scores for an assignment to the LMS. Paste tab-separated values (email and score) below.',
                inputs: inputFields,
                buttonName: 'Upload',
                iconName: Render.ICON_NAME_SUBMIT,
            },
        )
    ;
}

function uploadScores(params, context, container, inputParams) {
    let courseID = params[Core.Routing.PARAM_COURSE];

    return Autograder.LMS.Upload.scores(courseID, inputParams['assignment-lms-id'], inputParams['scores'])
        .then(function(result) {
            return Render.codeBlockJSON(result);
        })
        .catch(function(message) {
            console.error(message);
            return Render.autograderError(message);
        })
    ;
}

init();

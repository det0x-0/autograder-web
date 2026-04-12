import * as Autograder from '../../../autograder/index.js';
import * as Core from '../../core/index.js';
import * as Render from '../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_COURSE_UPDATE, handlerUpdate, 'Update Course', Core.Routing.NAV_COURSES, {course: true});
}

function handlerUpdate(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    let inputFields = [
        new Render.FieldType(context, 'skipSourceSync', 'Skip SourceSync', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'skipLMSSync', 'Skip LMS Sync', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'skipBuildImages', 'Skip Build Images', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'skipTemplateFiles', 'Skip Template Files', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'skipEmails', 'Skip Emails', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'dryRun', 'Dry Run', {
            type: Render.INPUT_TYPE_BOOL,
        }),
    ];

    Render.makePage(
            params, context, container, updateCourse,
            {
                header: 'Update Course',
                description: 'Update an existing course.',
                inputs: inputFields,
                buttonName: 'Update',
            },
        )
    ;
}

function updateCourse(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];

    return Autograder.Courses.Admin.update(
            course.id,
            inputParams.skipSourceSync,
            inputParams.skipLMSSync,
            inputParams.skipBuildImages,
            inputParams.skipTemplateFiles,
            inputParams.skipEmails,
            inputParams.dryRun,
        )
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

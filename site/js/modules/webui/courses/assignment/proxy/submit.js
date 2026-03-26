import * as Autograder from '../../../../autograder/index.js';
import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';
import * as Submit from '../submit.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_PROXY_SUBMIT, handlerProxySubmit, 'Assignment Proxy Submit', Core.Routing.NAV_COURSES, { assignment: true });
}

function handlerProxySubmit(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'files', 'Files', {
            type: Render.INPUT_TYPE_FILE,
            required: true,
            placeholder: 'Submission Files',
            additionalAttributes: ' multiple="true"',
        }),
        new Render.FieldType(context, 'email', 'Target User', {
            type: Render.INPUT_TYPE_EMAIL,
            required: true,
            placeholder: 'Email',
        }),
        new Render.FieldType(context, 'time', 'Proxy Time', {
            type: Render.INPUT_TYPE_INT,
        }),
        new Render.FieldType(context, 'message', 'Message', {
            type: Render.INPUT_TYPE_STRING,
        }),
    ];

    Render.makePage(
        params, context, container, proxySubmit,
        {
            header: 'Proxy Submit',
            description: 'Proxy submit an assignment submission to the autograder.',
            inputs: inputFields,
            buttonName: 'Submit',
            iconName: Render.ICON_NAME_PROXY_SUBMIT,
        });
}

function proxySubmit(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    return Autograder.Courses.Assignments.Submissions.Proxy.submit(
        course.id, assignment.id,
        inputParams.files, inputParams.email, inputParams.time, inputParams.message,
    )
        .then(function (result) {
            return Submit.getSubmissionResultHTML(course, assignment, result);
        })
        .catch(function (message) {
            console.error(message);
            return message;
        });
}

init();

import * as Autograder from '../../../../autograder/index.js';
import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_LMS_UPLOAD_SCORES, handlerUploadScores, 'LMS Score Upload', Core.Routing.NAV_COURSES, {course: true});
}

function handlerUploadScores(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    let inputFields = [
        new Render.FieldType(context, 'assignment-lms-id', 'Assignment LMS ID', {
            type: Render.INPUT_TYPE_STRING,
            required: true,
            placeholder: 'LMS ID for the assignment',
        }),
        new Render.FieldType(context, 'file', 'Scores File (TSV)', {
            type: Render.INPUT_TYPE_FILE,
            required: true,
            placeholder: 'TSV file with email and score',
        }),
    ];

    let description = `
        Upload scores from a tab-separated file to the course's LMS.
        The file should not have headers, and should have two columns: email and score.
    `;

    Render.makePage(
        params, context, container, uploadScores,
        {
            header: 'LMS Score Upload',
            description: description,
            inputs: inputFields,
            buttonName: 'Upload Scores',
            iconName: Render.ICON_NAME_SUBMIT,
        }
    );
}

async function uploadScores(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]].id;

    if (inputParams.file.length === 0) {
        return '<p class="error-color">No file selected.</p>';
    }

    let file = inputParams.file[0];
    let text = await file.text();
    let scores = [];
    let lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '') {
            continue;
        }

        let parts = line.split(/\t/);
        if (parts.length < 2) {
            // Try space if no tab.
            parts = line.split(/\s+/);
        }

        if (parts.length < 2) {
            console.warn(`Invalid line ${i + 1}: ${line}`);
            continue;
        }

        let email = parts[0].trim();
        let score = parseFloat(parts[1].trim());

        if (isNaN(score)) {
            console.warn(`Invalid score on line ${i + 1}: ${parts[1]}`);
            continue;
        }

        scores.push({
            email: email,
            score: score,
        });
    }

    if (scores.length === 0) {
        return '<p class="error-color">No valid scores found in file.</p>';
    }

    return Autograder.LMS.Upload.scores(course, inputParams['assignment-lms-id'], scores)
        .then(function(result) {
            return displayResult(result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        });
}

function displayResult(result) {
    let html = `
        <div class="upload-scores-result">
            <p>Uploaded <strong>${result.count}</strong> scores successfully.</p>
            <p>Found <strong>${result['error-count']}</strong> errors.</p>
    `;

    if (result['unrecognized-users'] && result['unrecognized-users'].length > 0) {
        html += `
            <div class="result-section">
                <h3>Unrecognized Users</h3>
                <ul>
                    ${result['unrecognized-users'].map(entry => `<li>Row ${entry.row + 1}: ${entry.entry}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (result['no-lms-id-users'] && result['no-lms-id-users'].length > 0) {
        html += `
            <div class="result-section">
                <h3>Users with no LMS ID</h3>
                <ul>
                    ${result['no-lms-id-users'].map(entry => `<li>Row ${entry.row + 1}: ${entry.entry}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    html += `</div>`;
    return html;
}

init();

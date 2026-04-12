import * as Core from '../../core.js';

function update(course, skipSourceSync, skipLMSSync, skipBuildImages, skipTemplateFiles, skipEmails, dryRun) {
    return Core.sendRequest({
        endpoint: 'courses/admin/update',
        payload: {
            'course-id': course,
            'skip-source-sync': skipSourceSync,
            'skip-lms-sync': skipLMSSync,
            'skip-build-images': skipBuildImages,
            'skip-template-files': skipTemplateFiles,
            'skip-emails': skipEmails,
            'dry-run': dryRun,
        },
    });
}

export {
    update,
};

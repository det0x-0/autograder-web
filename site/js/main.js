import * as WebUI from './modules/webui/index.js';

window.EDQ_VERSION = '0.0.1';

function main() {
    WebUI.init();
}

document.addEventListener("DOMContentLoaded", main);

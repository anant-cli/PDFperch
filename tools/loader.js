(function() {
    'use strict';

    function showToolError(container, message) {
        const warn = document.createElement('div');
        warn.className = 'warning';
        warn.setAttribute('role', 'alert');
        warn.textContent = message;
        container.replaceChildren(warn);
    }

    function getToolNameFromPath() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        const toolMap = {
            'md2pdf': 'rendermd2pdf',
            'docx2pdf': 'renderdocx2pdf',
            'pdf2word': 'renderpdf2word',
            'img2pdf': 'renderimg2pdf',
            'img2png': 'renderimg2png',
            'mergepdf': 'rendermergepdf',
            'splitpdf': 'rendersplitpdf',
            'rotatepdf': 'renderrotatepdf',
            'watermarkpdf': 'renderwatermarkpdf',
            'pagenumbers': 'renderpagenumbers',
            'compresspdf': 'rendercompresspdf',
            'signpdf': 'rendersignpdf',
            'pdf2jpg': 'renderpdf2jpg',
            'pdfencrypt': 'renderpdfencrypt',
            'qrmaker': 'renderqrmaker',
            'txt2docx': 'rendertxt2docx',
            'web2pdf': 'renderweb2pdf',
            'imgcompress': 'renderimgcompress',
            'organizepdf': 'renderorganizepdf',
            'ocrtool': 'renderocrtool'
        };
        return toolMap[filename] || null;
    }

    function initTool() {
        const container = document.getElementById('toolContainer');
        if (!container) return;

        const renderFuncName = getToolNameFromPath();
        if (!renderFuncName) {
            showToolError(container, 'This tool is not available from the current page.');
            return;
        }

        const renderFunc = window[renderFuncName];
        if (typeof renderFunc === 'function') {
            container.innerHTML = `
                <div class="loading-state" role="status" aria-live="polite">
                    <div class="spinner"></div>
                    <p>Loading tool...</p>
                </div>
            `;
            Promise.resolve(renderFunc(container)).catch(function () {
                showToolError(container, 'This tool failed to start. Please refresh the page and try again.');
            });
        } else {
            showToolError(container, 'This tool did not load correctly. Please refresh the page and try again.');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTool);
    } else {
        initTool();
    }
})();

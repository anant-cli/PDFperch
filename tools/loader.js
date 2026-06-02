(function() {
 'use strict';
 const LOAD_TIMEOUT_MS = 20000;

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
 'pptx2pdf': 'renderpptx2pdf',
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
 if (typeof renderFunc !== 'function') {
 showToolError(container, 'This tool did not load correctly. Please refresh the page and try again.');
 return;
 }

 let isRendering = false;
 function renderActiveTool(showLoading) {
 if (isRendering) return Promise.resolve();
 isRendering = true;

 if (showLoading !== false) {
 container.innerHTML =
 '<div class="loading-state" role="status" aria-live="polite">' +
 ' <div class="spinner"></div>' +
 ' <p>Loading tool\u2026</p>' +
 '</div>';
 }

 return Promise.resolve(renderFunc(container)).then(function() {
 if (typeof window.enhanceToolUX === 'function') {
 window.enhanceToolUX(container, {
 onClear: function() {
 renderActiveTool(true).then(function() {
 if (typeof window.showToast === 'function') {
 window.showToast('Selections cleared.', 'info');
 }
 });
 }
 });
 }
 if (typeof window.ensureCanvasAccessibility === 'function') {
 window.ensureCanvasAccessibility(container);
 }
 }).finally(function() {
 isRendering = false;
 });
 }

 window.reloadCurrentTool = function() {
 return renderActiveTool(true);
 };
 let timeoutId;
 const timeoutPromise = new Promise(function(_, reject) {
 timeoutId = setTimeout(function() {
 reject(new Error('Tool load timed out after ' + (LOAD_TIMEOUT_MS / 1000) + 's'));
 }, LOAD_TIMEOUT_MS);
 });

 Promise.race([
 renderActiveTool(true),
 timeoutPromise
 ]).then(function() {
 clearTimeout(timeoutId);
 }).catch(function(err) {
 clearTimeout(timeoutId);
 const stillLoading = container.querySelector('.loading-state');
 if (stillLoading || !container.hasChildNodes()) {
 const isTimeout = err && err.message && err.message.includes('timed out');
 showToolError(
 container,
 isTimeout
 ? 'This tool took too long to load. Check your connection and refresh.'
 : 'This tool failed to start. Please refresh the page and try again.'
 );
 }
 if (typeof DEBUG !== 'undefined' && DEBUG) console.error('[loader]', err);
 });
 }

 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', initTool);
 } else {
 initTool();
 }
})();




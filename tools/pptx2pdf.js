async function renderpptx2pdf(container) {
 const PPTX_PREVIEW_URL = 'https://esm.sh/pptx-preview@1.0.7/es2022/pptx-preview.bundle.mjs';
 const HTML2CANVAS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
 const PDFLIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

 try {
 await Promise.all([
 loadScript(HTML2CANVAS_URL),
 loadScript(PDFLIB_URL)
 ]);

 const pptxPreviewModule = await import(PPTX_PREVIEW_URL);
 const initPreviewer = pptxPreviewModule.init || (pptxPreviewModule.default && pptxPreviewModule.default.init);
 if (typeof initPreviewer !== 'function') {
 throw new Error('PPTX renderer did not expose an init method.');
 }

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription('Convert PPTX presentations to PDF in your browser. Render slides as images and place them on A4 or Letter pages with handout layout options.');
 updatePageTitle('PPTX to PDF Converter');

 area.innerHTML = `
 <h3>PPTX to PDF</h3>
 <p class="tool-description">
 Convert PowerPoint PPTX slides into a PDF locally in your browser. Each slide is rendered as an image, then placed on A4 or Letter pages.
 </p>

 <div class="faq-section">
 <h4>Before you start</h4>
 <details open>
 <summary>What is supported?</summary>
 <p>PPTX files are supported. Legacy .ppt files, animations, audio, video, and some complex PowerPoint effects may not render exactly like Microsoft PowerPoint.</p>
 </details>
 </div>

 <div id="pptxDropZone" class="drop-zone" tabindex="0" role="button" aria-label="Upload PPTX file">
 <div class="drop-zone-icon" aria-hidden="true">PPTX</div>
 <p>Drag and drop a PPTX file here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="pptxInput" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" aria-label="PPTX file" class="sr-only-input">
 </div>

 <div class="orientation-selector">
 <label>Paper
 <select id="pptxPageSize">
 <option value="a4" selected>A4</option>
 <option value="letter">Letter</option>
 </select>
 </label>
 <label>Orientation
 <select id="pptxOrientation">
 <option value="landscape" selected>Landscape</option>
 <option value="portrait">Portrait</option>
 </select>
 </label>
 <label>Slides per page
 <select id="pptxSlidesPerPage">
 <option value="1" selected>1 slide</option>
 <option value="2">2 slides</option>
 <option value="4">4 slides</option>
 <option value="6">6 slides</option>
 </select>
 </label>
 <label>Margin
 <select id="pptxMargin">
 <option value="18">Small</option>
 <option value="36" selected>Normal</option>
 <option value="54">Large</option>
 </select>
 </label>
 <label>Quality
 <select id="pptxQuality">
 <option value="2" selected>High</option>
 <option value="1.5">Balanced</option>
 <option value="1">Fast</option>
 </select>
 </label>
 </div>

 <div id="pptxStatus" role="status" aria-live="polite" class="status-msg hidden"></div>
 <div id="pptxProgressContainer" class="progress-bar-bg hidden" style="margin-bottom:1rem;">
 <div id="pptxProgressBar" class="progress-bar-fill" style="width:0%;"></div>
 </div>

 <div id="pptxPreviewShell" class="preview-box hidden" style="padding:1rem; margin-bottom:1rem; overflow:auto;">
 <div id="pptxPreviewHost" style="width:960px; min-height:540px; transform-origin:top left;"></div>
 </div>

 <div class="tool-action-row">
 <button id="pptxConvertBtn" class="primary" type="button" disabled>Generate PDF</button>
 <button id="pptxDownloadBtn" class="download-btn" type="button" disabled>Download PDF</button>
 <button id="pptxResetBtn" class="secondary" type="button" disabled>Reset</button>
 </div>
 `;

 const dropZone = document.getElementById('pptxDropZone');
 const input = document.getElementById('pptxInput');
 const sizeSel = document.getElementById('pptxPageSize');
 const orientSel = document.getElementById('pptxOrientation');
 const perPageSel = document.getElementById('pptxSlidesPerPage');
 const marginSel = document.getElementById('pptxMargin');
 const qualitySel = document.getElementById('pptxQuality');
 const status = document.getElementById('pptxStatus');
 const progressWrap = document.getElementById('pptxProgressContainer');
 const progressBar = document.getElementById('pptxProgressBar');
 const previewShell = document.getElementById('pptxPreviewShell');
 const previewHost = document.getElementById('pptxPreviewHost');
 const convertBtn = document.getElementById('pptxConvertBtn');
 const downloadBtn = document.getElementById('pptxDownloadBtn');
 const resetBtn = document.getElementById('pptxResetBtn');

 let currentFile = null;
 let currentPdfBlob = null;
 let currentPdfUrl = null;

 function setStatus(message) {
 status.textContent = message;
 status.classList.toggle('hidden', !message);
 }

 function setProgress(value) {
 const percent = Math.max(0, Math.min(100, Math.round(value)));
 progressBar.style.width = `${percent}%`;
 }

 function resetState() {
 currentFile = null;
 currentPdfBlob = null;
 if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
 currentPdfUrl = null;
 input.value = '';
 previewHost.innerHTML = '';
 previewShell.classList.add('hidden');
 progressWrap.classList.add('hidden');
 setProgress(0);
 setStatus('');
 convertBtn.disabled = true;
 downloadBtn.disabled = true;
 resetBtn.disabled = true;
 dropZone.classList.remove('hidden');
 if (window.resetDropZone) resetDropZone('pptxDropZone', 'Drag and drop a PPTX file here');
 }

 function validatePptx(file) {
 if (!file) return { valid: false, message: 'Please select a PPTX file.' };
 if (/\.ppt$/i.test(file.name)) {
 return { valid: false, message: 'Legacy .ppt files are not supported yet. Please save the file as .pptx first.' };
 }
 if (!/\.pptx$/i.test(file.name)) {
 return { valid: false, message: 'Please select a .pptx presentation.' };
 }
 if (typeof validateFile === 'function') {
 return validateFile(file, {
 extensions: ['.pptx'],
 mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
 maxSize: 75 * 1024 * 1024,
 label: 'PPTX'
 });
 }
 return { valid: true };
 }

 async function loadPresentation(file) {
 const validation = validatePptx(file);
 if (!validation.valid) {
 if (window.showToast) showToast(validation.message, 'error');
 setStatus(validation.message);
 input.value = '';
 return;
 }

 currentFile = file;
 currentPdfBlob = null;
 downloadBtn.disabled = true;
 resetBtn.disabled = false;
 convertBtn.disabled = true;
 dropZone.classList.add('hidden');
 previewShell.classList.remove('hidden');
 previewHost.innerHTML = '';
 setStatus('Rendering slides locally...');
 progressWrap.classList.remove('hidden');
 setProgress(15);

 try {
 const buffer = await file.arrayBuffer();
 const previewer = initPreviewer(previewHost, {
 width: 960,
 height: 540,
 mode: 'list'
 });
 await previewer.preview(buffer);
 await waitForSlideAssets(previewHost);
 const slides = findSlideElements();

 if (slides.length === 0) {
 throw new Error('No rendered slides were found.');
 }

 slides.forEach((slide, index) => {
 slide.setAttribute('data-convertpdf-slide', String(index + 1));
 slide.style.backgroundColor = slide.style.backgroundColor || '#ffffff';
 slide.style.margin = '0 0 18px 0';
 });

 setProgress(100);
 setStatus(`${slides.length} slide${slides.length !== 1 ? 's' : ''} ready. Choose layout and generate the PDF.`);
 convertBtn.disabled = false;
 } catch (error) {
 console.error('PPTX render error:', error);
 setStatus('Could not render this PPTX. Try a simpler deck or save it again as PPTX.');
 if (window.showToast) showToast('Could not render this PPTX: ' + error.message, 'error');
 convertBtn.disabled = true;
 } finally {
 setTimeout(() => {
 progressWrap.classList.add('hidden');
 setProgress(0);
 }, 800);
 }
 }

 function findSlideElements() {
 const selectors = [
 '[data-convertpdf-slide]',
 '.pptx-slide',
 '.pptx-preview-slide',
 '.slide',
 '.slide-container',
 '.page',
 '[data-slide]'
 ];
 let slides = Array.from(previewHost.querySelectorAll(selectors.join(',')))
 .filter(isRenderableSlide);

 if (slides.length === 0) {
 slides = Array.from(previewHost.children).filter(isRenderableSlide);
 }

 if (slides.length === 1) {
 const nested = Array.from(slides[0].children).filter(isRenderableSlide);
 if (nested.length > 1) slides = nested;
 }

 return slides;
 }

 function isRenderableSlide(element) {
 if (!(element instanceof HTMLElement)) return false;
 const rect = element.getBoundingClientRect();
 return rect.width >= 240 && rect.height >= 130;
 }

 function waitForSlideAssets(root) {
 const images = Array.from(root.querySelectorAll('img'));
 const imagePromises = images.map(img => {
 if (img.complete) return Promise.resolve();
 return new Promise(resolve => {
 img.onload = resolve;
 img.onerror = resolve;
 });
 });

 const fontPromise = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => { }) : Promise.resolve();
 return Promise.all([fontPromise, ...imagePromises, new Promise(resolve => setTimeout(resolve, 250))]);
 }

 function getPageSize() {
 const sizes = {
 a4: [595.28, 841.89],
 letter: [612, 792]
 };
 let [w, h] = sizes[sizeSel.value] || sizes.a4;
 if (orientSel.value === 'landscape' && w < h) [w, h] = [h, w];
 if (orientSel.value === 'portrait' && w > h) [w, h] = [h, w];
 return [w, h];
 }

 function getGrid(slidesPerPage) {
 if (slidesPerPage === 2) return { cols: 1, rows: 2 };
 if (slidesPerPage === 4) return { cols: 2, rows: 2 };
 if (slidesPerPage === 6) return { cols: 2, rows: 3 };
 return { cols: 1, rows: 1 };
 }

 function canvasToBlob(canvas, type, quality) {
 return new Promise((resolve, reject) => {
 canvas.toBlob(blob => {
 if (blob) resolve(blob);
 else reject(new Error('Could not capture slide image.'));
 }, type, quality);
 });
 }

 async function generatePdf() {
 const slides = findSlideElements();
 if (slides.length === 0) {
 if (window.showToast) showToast('No slides are ready yet.', 'warning');
 return;
 }

 convertBtn.disabled = true;
 downloadBtn.disabled = true;
 progressWrap.classList.remove('hidden');
 setProgress(0);
 setStatus('Capturing slides...');
 if (window.showSpinner) showSpinner('Generating PDF...');

 try {
 const { PDFDocument } = PDFLib;
 const pdfDoc = await PDFDocument.create();
 const [pageW, pageH] = getPageSize();
 const margin = parseInt(marginSel.value, 10);
 const slidesPerPage = parseInt(perPageSel.value, 10);
 const grid = getGrid(slidesPerPage);
 const gap = margin * 0.55;
 const slotW = (pageW - margin * 2 - gap * (grid.cols - 1)) / grid.cols;
 const slotH = (pageH - margin * 2 - gap * (grid.rows - 1)) / grid.rows;
 const scale = parseFloat(qualitySel.value);
 let page = null;

 for (let i = 0; i < slides.length; i++) {
 if (i % slidesPerPage === 0) {
 page = pdfDoc.addPage([pageW, pageH]);
 }

 setStatus(`Capturing slide ${i + 1} of ${slides.length}...`);
 setProgress((i / slides.length) * 80);

 const canvas = await html2canvas(slides[i], {
 backgroundColor: '#ffffff',
 scale,
 useCORS: true,
 logging: false
 });
 const blob = await canvasToBlob(canvas, 'image/jpeg', 0.94);
 const bytes = await blob.arrayBuffer();
 const image = await pdfDoc.embedJpg(bytes);
 const dims = image.scale(1);

 const position = i % slidesPerPage;
 const col = position % grid.cols;
 const row = Math.floor(position / grid.cols);
 const x = margin + col * (slotW + gap);
 const yTop = pageH - margin - row * (slotH + gap);
 const ratio = Math.min(slotW / dims.width, slotH / dims.height);
 const drawW = dims.width * ratio;
 const drawH = dims.height * ratio;

 page.drawImage(image, {
 x: x + (slotW - drawW) / 2,
 y: yTop - slotH + (slotH - drawH) / 2,
 width: drawW,
 height: drawH
 });

 if (typeof releaseCanvas === 'function') releaseCanvas(canvas);
 }

 setStatus('Saving PDF...');
 setProgress(92);
 const pdfBytes = await pdfDoc.save();
 currentPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
 if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
 currentPdfUrl = URL.createObjectURL(currentPdfBlob);
 downloadBtn.disabled = false;
 setProgress(100);
 setStatus(`PDF ready: ${slides.length} slide${slides.length !== 1 ? 's' : ''} converted.`);
 if (window.showToast) showToast('PPTX converted to PDF successfully.');
 } catch (error) {
 console.error('PPTX to PDF error:', error);
 setStatus('Failed to generate the PDF. Try Balanced or Fast quality, or use a smaller deck.');
 if (window.showToast) showToast('Failed to generate PDF: ' + error.message, 'error');
 } finally {
 convertBtn.disabled = false;
 if (window.hideSpinner) hideSpinner();
 setTimeout(() => {
 progressWrap.classList.add('hidden');
 setProgress(0);
 }, 1000);
 }
 }

 dropZone.addEventListener('click', () => input.click());
 dropZone.addEventListener('keydown', event => {
 if (event.key === 'Enter' || event.key === ' ') {
 event.preventDefault();
 input.click();
 }
 });

 if (typeof setupDropZone === 'function') {
 setupDropZone('pptxDropZone', 'pptxInput');
 }

 input.addEventListener('change', () => {
 if (input.files && input.files[0]) loadPresentation(input.files[0]);
 });

 convertBtn.addEventListener('click', generatePdf);
 resetBtn.addEventListener('click', resetState);
 downloadBtn.addEventListener('click', () => {
 if (!currentPdfBlob) return;
 const baseName = currentFile ? currentFile.name.replace(/\.pptx$/i, '') : 'presentation';
 downloadBlob(currentPdfBlob, `${baseName}.pdf`);
 });
 } catch (error) {
 console.error('renderpptx2pdf error:', error);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = 'PPTX to PDF failed to load. Please check your connection and refresh.';
 container.replaceChildren(warn);
 }
}




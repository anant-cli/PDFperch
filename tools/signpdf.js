async function rendersignpdf(container) {
 try {
 const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
 const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 const PDFLIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

 await Promise.all([loadScript(PDFLIB_URL), loadScript(PDFJS_URL)]);
 pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Sign PDF documents digitally with drag-and-resize signature placement. 100% private, no uploads, works on touch screen devices.");
 updatePageTitle("Visual PDF Signer");

 area.innerHTML = `
 <h3> Visual Sign PDF</h3>
 <p class="tool-description">
 Add signatures to your PDF with pixel-perfect drag-and-resize placement.
 Type your name, draw a freehand signature, or upload a signature image, then position it visually on the document.
 </p>

 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my file uploaded to a server?</summary>
 <p>No! Everything runs locally in your browser. Your files never leave your computer or phone.</p>
 </details>
 <details>
 <summary>Does this work on mobile touch devices?</summary>
 <p>Yes! Drag-and-resize handles are fully optimized for touch events on smartphones and tablets.</p>
 </details>
 </div>

 <div id="signPdfDropZone" class="drop-zone">
 <div class="drop-zone-icon"></div>
 <p>Drag and drop a .pdf file here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="signPdfInput" accept=".pdf" class="sr-only-input">
 </div>

 <div id="signOptions" class="sign-options hidden">
 <div class="sign-options-grid">
 <div class="input-group">
 <label for="signatureType">Signature Type</label>
 <select id="signatureType">
 <option value="text">Type Name</option>
 <option value="draw">Draw Signature</option>
 <option value="image">Upload Image</option>
 </select>
 </div>
 <div class="input-group">
 <label for="signatureColor">Ink Color</label>
 <select id="signatureColor">
 <option value="black"> Black</option>
 <option value="blue"> Blue</option>
 <option value="red"> Red</option>
 </select>
 </div>
 </div>

 
 <div id="textSignatureGroup" class="input-group">
 <label for="signatureText">Your Name</label>
 <input type="text" id="signatureText" placeholder="Enter your full name" maxlength="60" value="John Doe">
 <div class="sign-font-row">
 <label for="signatureFont" style="font-size:0.85rem; color: var(--text-muted);">Font Style</label>
 <select id="signatureFont">
 <option value="Helvetica">Helvetica - Clean &amp; Modern</option>
 <option value="TimesRoman">Times Roman - Formal &amp; Traditional</option>
 <option value="Courier">Courier - Typewriter Style</option>
 </select>
 </div>
 </div>

 
 <div id="drawSignatureGroup" class="input-group hidden">
 <label>Draw your signature below</label>
 <div class="pen-size-row">
 <label class="pen-size-label">
 <input type="range" id="penSize" min="1" max="8" value="2" style="flex: 1;">
 <span>Pen: <span id="penSizeValue">2</span>px</span>
 </label>
 </div>
 <canvas id="signatureCanvas" width="500" height="150" class="sig-canvas"></canvas>
 <div class="tool-btn-row">
 <button id="clearSignature" class="secondary sig-action-btn" type="button"> Clear</button>
 <button id="undoSignature" class="secondary sig-action-btn" type="button"> Undo</button>
 <button id="redoSignature" class="secondary sig-action-btn" type="button"> Redo</button>
 </div>
 </div>

 
 <div id="imageSignatureGroup" class="input-group hidden">
 <label>Upload Signature Image (PNG/JPG)</label>
 <input type="file" id="sigImgInput" accept="image/png,image/jpeg,image/webp" style="margin-top:0.5rem;">
 <canvas id="sigImgPreview" width="500" height="150" class="sig-canvas sig-canvas-preview hidden"></canvas>
 </div>

 <div class="sign-page-row">
 <div class="input-group">
 <label for="signaturePage">Apply to Page(s)</label>
 <select id="signaturePage">
 <option value="first">First Page Only</option>
 <option value="last">Last Page Only</option>
 <option value="all">All Pages</option>
 </select>
 <p class="note" id="pageInfo" style="margin-top:0.25rem;"></p>
 </div>
 </div>

 
 <div id="placementHelper" class="preview-box placement-viewer">
 <div class="placement-header">
 <span> Signature Placement (Drag &amp; Resize)</span>
 <span id="placementPageLabel" class="placement-page-label">No PDF loaded</span>
 </div>

 <div id="visualPlacementWrapper" class="visual-placement-wrap hidden">
 <div id="pdfPlacementViewer" class="pdf-placement-viewer">
 <div id="pagePreviewContainer" class="page-preview-container">
 <canvas id="pdfPageCanvas" class="pdf-page-canvas"></canvas>
 <div id="floatingSignature" class="floating-sig">
 <div id="floatingSigContent" class="floating-sig-content">
 <span class="floating-sig-text">John Doe</span>
 </div>
 <div class="sig-resize-handle"></div>
 </div>
 </div>
 </div>
 <p class="note" style="text-align:center; margin-top:0.25rem;">Drag signature to move, drag bottom-right blue handle to resize.</p>
 </div>

 <div id="placementPlaceholder" class="placement-placeholder">
 Drag or select a PDF above to position your signature interactively
 </div>
 </div>

 <div class="sign-button-row">
 <button id="signPdfBtn" class="primary sign-btn" type="button">Sign PDF</button>
 <button id="downloadSignBtn" class="download-btn sign-btn" type="button" disabled>Download Signed PDF</button>
 </div>

 <div id="signProgressContainer" class="sign-progress hidden">
 <div id="signProgressText" class="sign-progress-text">Signing...</div>
 <div class="progress-bar-bg">
 <div id="signProgressBar" class="progress-bar-fill" style="width: 0%;"></div>
 </div>
 </div>
 </div>
 `;
 const dropZone = document.getElementById('signPdfDropZone');
 const inp = document.getElementById('signPdfInput');
 const options = document.getElementById('signOptions');
 const sigTypeSel = document.getElementById('signatureType');
 const sigColorSel = document.getElementById('signatureColor');
 const sigFontSel = document.getElementById('signatureFont');
 const textSigGroup = document.getElementById('textSignatureGroup');
 const drawSigGroup = document.getElementById('drawSignatureGroup');
 const imgSigGroup = document.getElementById('imageSignatureGroup');
 const sigImgInput = document.getElementById('sigImgInput');
 const sigImgPreview = document.getElementById('sigImgPreview');
 const textInput = document.getElementById('signatureText');
 const drawCanvas = document.getElementById('signatureCanvas');
 const clearBtn = document.getElementById('clearSignature');
 const pageSel = document.getElementById('signaturePage');
 const penSizeInput = document.getElementById('penSize');
 const penSizeValue = document.getElementById('penSizeValue');
 const undoBtn = document.getElementById('undoSignature');
 const redoBtn = document.getElementById('redoSignature');
 const pageInfo = document.getElementById('pageInfo');
 const signBtn = document.getElementById('signPdfBtn');
 const downloadBtn = document.getElementById('downloadSignBtn');
 const progressCon = document.getElementById('signProgressContainer');
 const progressBar = document.getElementById('signProgressBar');
 const progressText = document.getElementById('signProgressText');
 const placementWrap = document.getElementById('visualPlacementWrapper');
 const placementPlace = document.getElementById('placementPlaceholder');
 const placementPageLabel= document.getElementById('placementPageLabel');
 const pdfPageCanvas = document.getElementById('pdfPageCanvas');
 const previewContainer = document.getElementById('pagePreviewContainer');
 const sigEl = document.getElementById('floatingSignature');
 const sigContent = document.getElementById('floatingSigContent');
 const resizeHandle = sigEl.querySelector('.sig-resize-handle');
 let currentFile = null;
 let originalBuffer = null;
 let pdfjsDoc = null;
 let isDrawing = false;
 let uploadedSigImage = null;
 let drawingHistory = [];
 let historyIndex = -1;
 const dCtx = drawCanvas.getContext('2d');
 let displayW = 0, displayH = 0;
 let pdfW = 0, pdfH = 0;
 let sigAspectRatio = 2.5;
 function getDrawColor() {
 const map = { black: '#000000', blue: '#093ba6', red: '#cc1111' };
 return map[sigColorSel.value] || '#000000';
 }

 function setupDrawContext() {
 dCtx.strokeStyle = getDrawColor();
 dCtx.lineWidth = penSizeInput.value;
 dCtx.lineCap = 'round';
 dCtx.lineJoin = 'round';
 }

 setupDrawContext();
 sigColorSel.addEventListener('change', () => {
 setupDrawContext();
 updateVisualSigPreview();
 });
 penSizeInput.addEventListener('input', (e) => {
 setupDrawContext();
 penSizeValue.textContent = e.target.value;
 });
 function getPos(e) {
 const rect = drawCanvas.getBoundingClientRect();
 const sx = drawCanvas.width / rect.width;
 const sy = drawCanvas.height / rect.height;
 return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
 }

 drawCanvas.addEventListener('mousedown', e => {
 isDrawing = true;
 setupDrawContext();
 dCtx.beginPath();
 const p = getPos(e);
 dCtx.moveTo(p.x, p.y);
 if (historyIndex < 0) saveDrawingState();
 });

 drawCanvas.addEventListener('mousemove', e => {
 if (!isDrawing) return;
 const p = getPos(e);
 dCtx.lineTo(p.x, p.y);
 dCtx.stroke();
 updateVisualSigPreview();
 });

 drawCanvas.addEventListener('mouseup', () => {
 if (isDrawing) {
 isDrawing = false;
 saveDrawingState();
 updateVisualSigPreview();
 }
 });
 drawCanvas.addEventListener('mouseleave', () => isDrawing = false);
 drawCanvas.addEventListener('touchstart', e => {
 e.preventDefault();
 isDrawing = true;
 setupDrawContext();
 dCtx.beginPath();
 const rect = drawCanvas.getBoundingClientRect();
 const sx = drawCanvas.width / rect.width;
 const sy = drawCanvas.height / rect.height;
 const t = e.touches[0];
 dCtx.moveTo((t.clientX - rect.left) * sx, (t.clientY - rect.top) * sy);
 }, { passive: false });

 drawCanvas.addEventListener('touchmove', e => {
 e.preventDefault();
 if (!isDrawing) return;
 const rect = drawCanvas.getBoundingClientRect();
 const sx = drawCanvas.width / rect.width;
 const sy = drawCanvas.height / rect.height;
 const t = e.touches[0];
 dCtx.lineTo((t.clientX - rect.left) * sx, (t.clientY - rect.top) * sy);
 dCtx.stroke();
 updateVisualSigPreview();
 }, { passive: false });

 drawCanvas.addEventListener('touchend', () => {
 if (isDrawing) {
 isDrawing = false;
 saveDrawingState();
 updateVisualSigPreview();
 }
 });
 function saveDrawingState() {
 historyIndex++;
 if (historyIndex < drawingHistory.length) {
 drawingHistory = drawingHistory.slice(0, historyIndex);
 }
 drawingHistory.push(drawCanvas.toDataURL());
 updateHistoryButtons();
 }

 function updateHistoryButtons() {
 undoBtn.disabled = historyIndex <= 0;
 redoBtn.disabled = historyIndex >= drawingHistory.length - 1;
 }

 undoBtn.addEventListener('click', () => {
 if (historyIndex > 0) {
 historyIndex--;
 const img = new Image();
 img.src = drawingHistory[historyIndex];
 img.onload = () => {
 dCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
 dCtx.drawImage(img, 0, 0);
 updateHistoryButtons();
 updateVisualSigPreview();
 };
 }
 });

 redoBtn.addEventListener('click', () => {
 if (historyIndex < drawingHistory.length - 1) {
 historyIndex++;
 const img = new Image();
 img.src = drawingHistory[historyIndex];
 img.onload = () => {
 dCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
 dCtx.drawImage(img, 0, 0);
 updateHistoryButtons();
 updateVisualSigPreview();
 };
 }
 });

 clearBtn.addEventListener('click', () => {
 dCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
 drawingHistory = [];
 historyIndex = -1;
 updateHistoryButtons();
 updateVisualSigPreview();
 });
 dropZone.addEventListener('click', () => inp.click());
 if (typeof setupDropZone === 'function') setupDropZone('signPdfDropZone', 'signPdfInput');

 inp.addEventListener('change', async () => {
 const file = inp.files[0];
 if (!file) return;
 if (typeof validateFile === 'function') {
 if (!validateFile(file).valid) return;
 }

 currentFile = file;
 if (window.showFileOnDropZone) showFileOnDropZone('signPdfDropZone', file);

 try {
 if (window.showSpinner) showSpinner('Reading document');
 originalBuffer = await file.arrayBuffer();
 const dataArray = new Uint8Array(originalBuffer);
 pdfjsDoc = await pdfjsLib.getDocument({ data: dataArray }).promise;

 options.classList.remove('hidden');
 placementPlace.style.display = 'none';
 placementWrap.classList.remove('hidden');
 downloadBtn.disabled = true;

 updatePageSelectorInfo();
 await renderPagePreview();
 updateVisualSigPreview();

 if (window.showToast) showToast(`Loaded: ${file.name}`);
 } catch (e) {
 if (window.showToast) showToast('Failed to parse PDF: ' + e.message, 'error');
 console.error(e);
 } finally {
 if (window.hideSpinner) hideSpinner();
 }
 });

 pageSel.addEventListener('change', () => {
 updatePageSelectorInfo();
 renderPagePreview();
 });

 function updatePageSelectorInfo() {
 if (!pdfjsDoc) return;
 const total = pdfjsDoc.numPages;
 let targetText = 'last page';
 if (pageSel.value === 'first') targetText = 'first page';
 else if (pageSel.value === 'all') targetText = `all ${total} pages`;
 pageInfo.textContent = ` Signature will be placed on ${targetText}.`;
 }
 async function renderPagePreview() {
 if (!pdfjsDoc) return;

 try {
 const total = pdfjsDoc.numPages;
 const pageNum = pageSel.value === 'first' ? 1 : total;

 placementPageLabel.textContent = `Rendering page preview (${pageNum}/${total})`;

 const page = await pdfjsDoc.getPage(pageNum);
 const viewerW = document.getElementById('pdfPlacementViewer').clientWidth;
 const maxDisplayW = Math.min(480, viewerW - 48);
 const originalViewport = page.getViewport({ scale: 1.0 });
 const scale = maxDisplayW / originalViewport.width;
 const viewport = page.getViewport({ scale });

 pdfPageCanvas.width = Math.round(viewport.width);
 pdfPageCanvas.height = Math.round(viewport.height);

 const renderCtx = pdfPageCanvas.getContext('2d');
 renderCtx.fillStyle = '#ffffff';
 renderCtx.fillRect(0, 0, pdfPageCanvas.width, pdfPageCanvas.height);

 await page.render({ canvasContext: renderCtx, viewport }).promise;
 displayW = pdfPageCanvas.width;
 displayH = pdfPageCanvas.height;
 pdfW = originalViewport.width;
 pdfH = originalViewport.height;

 placementPageLabel.textContent = `Page ${pageNum} of ${total}`;
 previewContainer.style.width = displayW + 'px';
 previewContainer.style.height = displayH + 'px';
 } catch (e) {
 console.error('Failed rendering placement page preview:', e);
 placementPageLabel.textContent = 'Preview error';
 }
 }
 let isMoving = false;
 let isResizing = false;
 let startMouseX = 0, startMouseY = 0;
 let startLeft = 0, startTop = 0;
 let startW = 0, startH = 0;

 function getMouseCoordinates(e) {
 if (e.touches && e.touches.length > 0) {
 return { x: e.touches[0].clientX, y: e.touches[0].clientY };
 }
 return { x: e.clientX, y: e.clientY };
 }

 function onInteractionStart(e) {
 const isTouch = e.type.startsWith('touch');
 const pos = getMouseCoordinates(e);
 startMouseX = pos.x;
 startMouseY = pos.y;

 startLeft = sigEl.offsetLeft;
 startTop = sigEl.offsetTop;
 startW = sigEl.clientWidth;
 startH = sigEl.clientHeight;

 if (e.target === resizeHandle) {
 isResizing = true;
 isMoving = false;
 } else {
 isMoving = true;
 isResizing = false;
 }

 if (isTouch) {
 window.addEventListener('touchmove', onInteractionMove, { passive: false });
 window.addEventListener('touchend', onInteractionEnd);
 } else {
 window.addEventListener('mousemove', onInteractionMove);
 window.addEventListener('mouseup', onInteractionEnd);
 }
 e.preventDefault();
 }

 function onInteractionMove(e) {
 if (!isMoving && !isResizing) return;
 const pos = getMouseCoordinates(e);
 const dx = pos.x - startMouseX;
 const dy = pos.y - startMouseY;

 if (isMoving) {
 let left = startLeft + dx;
 let top = startTop + dy;
 left = Math.max(0, Math.min(left, displayW - sigEl.clientWidth));
 top = Math.max(0, Math.min(top, displayH - sigEl.clientHeight));
 sigEl.style.left = left + 'px';
 sigEl.style.top = top + 'px';
 } else if (isResizing) {
 let w = startW + dx;
 w = Math.max(50, Math.min(w, displayW - startLeft));
 let h = w / sigAspectRatio;
 if (startTop + h > displayH) {
 h = displayH - startTop;
 w = h * sigAspectRatio;
 }
 sigEl.style.width = w + 'px';
 sigEl.style.height = h + 'px';
 }
 e.preventDefault();
 }

 function onInteractionEnd() {
 isMoving = false;
 isResizing = false;
 window.removeEventListener('mousemove', onInteractionMove);
 window.removeEventListener('mouseup', onInteractionEnd);
 window.removeEventListener('touchmove', onInteractionMove, { passive: false });
 window.removeEventListener('touchend', onInteractionEnd);
 }

 sigEl.addEventListener('mousedown', onInteractionStart);
 sigEl.addEventListener('touchstart', onInteractionStart, { passive: false });
 function updateVisualSigPreview() {
 const type = sigTypeSel.value;
 const colorMap = { black: '#000000', blue: '#093ba6', red: '#cc1111' };
 const color = colorMap[sigColorSel.value] || '#000000';

 if (type === 'text') {
 const text = textInput.value.trim() || 'Sign Here';
 const font = sigFontSel.value;
 let family = 'sans-serif';
 if (font === 'TimesRoman') family = 'Georgia, serif';
 else if (font === 'Courier') family = 'monospace';

 sigContent.innerHTML = `<span style="color:${color}; font-family:${family}; font-size:1.15rem; font-weight:700; white-space:nowrap; text-align:center; pointer-events:none;">${text}</span>`;
 sigAspectRatio = 2.5;
 } else if (type === 'draw') {
 sigContent.innerHTML = `<img src="${drawCanvas.toDataURL('image/png')}" style="max-width:100%; max-height:100%; object-fit:contain; pointer-events:none; filter:${sigColorSel.value === 'red' ? 'hue-rotate(140deg)' : sigColorSel.value === 'blue' ? 'hue-rotate(220deg)' : 'none'};">`;
 sigAspectRatio = drawCanvas.width / drawCanvas.height;
 } else if (type === 'image') {
 if (uploadedSigImage) {
 sigContent.innerHTML = `<img src="${uploadedSigImage.src}" style="max-width:100%; max-height:100%; object-fit:contain; pointer-events:none;">`;
 sigAspectRatio = uploadedSigImage.width / uploadedSigImage.height;
 } else {
 sigContent.innerHTML = `<span style="color:var(--accent); font-size:0.8rem; font-weight:500; text-align:center;"> Upload Signature</span>`;
 sigAspectRatio = 2.5;
 }
 }
 const currentW = sigEl.clientWidth;
 sigEl.style.height = Math.round(currentW / sigAspectRatio) + 'px';
 }
 textInput.addEventListener('input', updateVisualSigPreview);
 sigTypeSel.addEventListener('change', () => {
 const val = sigTypeSel.value;
 textSigGroup.classList.toggle('hidden', val !== 'text');
 drawSigGroup.classList.toggle('hidden', val !== 'draw');
 imgSigGroup.classList.toggle('hidden', val !== 'image');
 updateVisualSigPreview();
 });
 sigFontSel.addEventListener('change', updateVisualSigPreview);
 sigImgInput.addEventListener('change', () => {
 const file = sigImgInput.files[0];
 if (!file) return;
 const reader = new FileReader();
 reader.onload = (e) => {
 const img = new Image();
 img.onload = () => {
 uploadedSigImage = img;
 const maxW = 500, maxH = 150;
 const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
 sigImgPreview.width = Math.round(img.width * ratio);
 sigImgPreview.height = Math.round(img.height * ratio);
 sigImgPreview.classList.remove('hidden');
 const ctx = sigImgPreview.getContext('2d');
 ctx.clearRect(0, 0, sigImgPreview.width, sigImgPreview.height);
 ctx.drawImage(img, 0, 0, sigImgPreview.width, sigImgPreview.height);
 updateVisualSigPreview();
 };
 img.src = e.target.result;
 };
 reader.readAsDataURL(file);
 });
 signBtn.addEventListener('click', async () => {
 if (!currentFile || !pdfjsDoc) return;
 if (sigTypeSel.value === 'text' && !textInput.value.trim()) {
 if (window.showToast) showToast('Please enter your name', 'error');
 return;
 }
 if (sigTypeSel.value === 'draw') {
 const imgData = dCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
 if (!imgData.data.some(v => v !== 0)) {
 if (window.showToast) showToast(' Please draw a signature first', 'error');
 return;
 }
 }
 if (sigTypeSel.value === 'image' && !uploadedSigImage) {
 if (window.showToast) showToast('Please upload a signature image first', 'error');
 return;
 }

 signBtn.disabled = true;
 signBtn.innerHTML = ' Signing';
 progressCon.classList.remove('hidden');
 progressBar.style.width = '0%';
 progressText.textContent = 'Reading original PDF';
 downloadBtn.disabled = true;

 try {
 const arrayBuf = await currentFile.arrayBuffer();
 const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf);
 const { StandardFonts } = PDFLib;
 progressBar.style.width = '30%';

 const pdfColorMap = {
 black: PDFLib.rgb(0, 0, 0),
 blue: PDFLib.rgb(0.03, 0.23, 0.65),
 red: PDFLib.rgb(0.8, 0.05, 0.05)
 };
 const sigColor = pdfColorMap[sigColorSel.value] || pdfColorMap.black;

 const allPages = pdfDoc.getPages();
 let targetPages;
 if (pageSel.value === 'first') targetPages = [allPages[0]];
 else if (pageSel.value === 'all') targetPages = allPages;
 else targetPages = [allPages[allPages.length - 1]];

 progressBar.style.width = '60%';
 progressText.textContent = 'Positioning signature precisely';
 const scaleX = pdfW / displayW;
 const scaleY = pdfH / displayH;
 const finalW = sigEl.clientWidth * scaleX;
 const finalH = sigEl.clientHeight * scaleY;
 const finalX = sigEl.offsetLeft * scaleX;

 for (let idx = 0; idx < targetPages.length; idx++) {
 const page = targetPages[idx];
 const { width: pWidth, height: pHeight } = page.getSize();
 const finalY = pHeight - (sigEl.offsetTop * scaleY) - finalH;

 if (sigTypeSel.value === 'text') {
 const text = textInput.value.trim();
 const fontMap = {
 'Helvetica': StandardFonts.HelveticaBold,
 'TimesRoman': StandardFonts.TimesRomanBold,
 'Courier': StandardFonts.CourierBold
 };
 const font = await pdfDoc.embedFont(fontMap[sigFontSel.value] || StandardFonts.Helvetica);
 const fontSz = Math.round(finalH * 0.45);
 page.drawText(text, {
 x: finalX,
 y: finalY + (finalH * 0.28),
 size: fontSz,
 font,
 color: sigColor
 });
 } else if (sigTypeSel.value === 'image') {
 const imgCanvas = document.createElement('canvas');
 imgCanvas.width = uploadedSigImage.width;
 imgCanvas.height = uploadedSigImage.height;
 const imgCtx = imgCanvas.getContext('2d');
 imgCtx.drawImage(uploadedSigImage, 0, 0);
 const dataUrl = imgCanvas.toDataURL('image/png');
 const sigBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
 const sigEmbed = await pdfDoc.embedPng(sigBytes);
 releaseCanvas(imgCanvas);

 page.drawImage(sigEmbed, {
 x: finalX,
 y: finalY,
 width: finalW,
 height: finalH
 });
 } else {
 const dataUrl = drawCanvas.toDataURL('image/png');
 const sigBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
 const sigEmbed = await pdfDoc.embedPng(sigBytes);

 page.drawImage(sigEmbed, {
 x: finalX,
 y: finalY,
 width: finalW,
 height: finalH
 });
 }
 if (idx % 3 === 0) await new Promise(r => setTimeout(r, 0));
 }

 progressBar.style.width = '90%';
 progressText.textContent = 'Saving PDF';

 const signedBytes = await pdfDoc.save();
 const blob = new Blob([signedBytes], { type: 'application/pdf' });
 if (window.MemoryManager) window.MemoryManager.registerObjectUrl(URL.createObjectURL(blob));

 progressBar.style.width = '100%';
 progressText.textContent = 'Signing completed successfully!';
 downloadBtn.disabled = false;

 const base = currentFile.name.replace(/\.pdf$/i, '') || 'document';
 downloadBtn.onclick = () => {
 downloadBlob(blob, `${base}-signed.pdf`);
 if (window.triggerSuccessConfetti) window.triggerSuccessConfetti();
 };

 if (window.showToast) showToast(' PDF signed successfully!', 'success');

 setTimeout(() => {
 progressCon.classList.add('hidden');
 progressBar.style.width = '0%';
 }, 3000);

 } catch (e) {
 progressText.textContent = ` Error: ${e.message}`;
 if (window.showToast) showToast(' Signing failed: ' + e.message, 'error');
 console.error(e);
 } finally {
 signBtn.disabled = false;
 signBtn.innerHTML = 'Sign PDF';
 }
 });

 } catch (___err) {
 console.error('rendersignpdf error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




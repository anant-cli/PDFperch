async function renderorganizepdf(container) {
 try {
 const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
 const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 const PDFLIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

 await Promise.all([loadScript(PDFJS_URL), loadScript(PDFLIB_URL)]);
 pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription('Reorder, rotate, and delete PDF pages with a visual drag-and-drop editor. 100% private, fully responsive on mobile touchscreens.');
 updatePageTitle('Organize PDF Pages');

 area.innerHTML = `
 <h3>Organize PDF</h3>
 <p class="tool-description">
 Reorder, rotate, and delete individual pages in a PDF using a visual editor.
 Use drag and drop, the visible move buttons, or the keyboard. Everything runs in your browser.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my PDF uploaded to a server?</summary>
 <p>No. All processing happens in your browser. Your files never leave your device.</p>
 </details>
 <details>
 <summary>How do I reorder pages on mobile?</summary>
 <p>Use the Left and Right buttons below each page thumbnail.</p>
 </details>
 </div>

 <div id="orgDropZone" class="drop-zone" tabindex="0" role="button" aria-label="Upload PDF file">
 <div aria-hidden="true" style="font-size: 2.5rem; margin-bottom: 0.5rem;">PDF</div>
 <p>Drag and drop a PDF file here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="orgPdfInput" accept=".pdf,application/pdf" aria-label="PDF file" style="display: none;">
 </div>

 <div id="orgStatus" role="status" aria-live="polite" style="display:none; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.75rem;"></div>
 <p id="orgKeyboardHelp" class="sr-only">
 In the page grid, use Left and Right arrows to reorder the focused page, R to rotate it, Delete to remove it, and Control Z to undo.
 </p>

 <div id="orgProgressContainer" class="progress-bar-bg" style="display:none; margin-bottom: 1rem;">
 <div id="orgProgressBar" class="progress-bar-fill" style="width:0%;"></div>
 </div>

 <div id="orgControls" class="organize-controls" style="display:none;">
 <div class="organize-zoom">
 <label for="orgZoomSlider">Thumbnail size</label>
 <input type="range" id="orgZoomSlider" min="96" max="180" value="124">
 <span id="orgZoomValue">124px</span>
 </div>
 <div class="organize-actions">
 <button id="orgUndoBtn" class="secondary" type="button" disabled>Undo</button>
 <button id="orgRotateAllBtn" class="secondary" type="button">Rotate All</button>
 <button id="orgDeleteAllBtn" class="secondary danger-soft" type="button">Delete All</button>
 </div>
 </div>

 <div id="orgThumbGrid" class="organize-grid" role="list" aria-describedby="orgKeyboardHelp"></div>

 <div class="tool-action-row">
 <button id="orgSaveBtn" class="primary" type="button" disabled>Save Organised PDF</button>
 <button id="orgResetBtn" class="secondary" type="button" disabled>Reset</button>
 <button id="orgReloadBtn" class="download-btn" type="button" style="display:none;">Load New File</button>
 </div>
 `;

 const dropZone = document.getElementById('orgDropZone');
 const input = document.getElementById('orgPdfInput');
 const statusDiv = document.getElementById('orgStatus');
 const progressWrap = document.getElementById('orgProgressContainer');
 const progressBar = document.getElementById('orgProgressBar');
 const thumbGrid = document.getElementById('orgThumbGrid');
 const saveBtn = document.getElementById('orgSaveBtn');
 const resetBtn = document.getElementById('orgResetBtn');
 const reloadBtn = document.getElementById('orgReloadBtn');
 const controls = document.getElementById('orgControls');
 const zoomSlider = document.getElementById('orgZoomSlider');
 const zoomValue = document.getElementById('orgZoomValue');
 const undoBtn = document.getElementById('orgUndoBtn');
 const rotateAllBtn = document.getElementById('orgRotateAllBtn');
 const deleteAllBtn = document.getElementById('orgDeleteAllBtn');

 let pages = [];
 let originalPages = [];
 let originalBuffer = null;
 let originalName = '';
 let pdfjsDoc = null;
 let draggedIndex = null;
 let undoStack = [];
 const MAX_UNDO = 25;

 function snapshotPages() {
 return pages.map(page => ({ pageIndex: page.pageIndex, rotation: page.rotation }));
 }

 function pushUndo() {
 undoStack.push(snapshotPages());
 if (undoStack.length > MAX_UNDO) undoStack.shift();
 updateUndoButton();
 }

 function updateUndoButton() {
 undoBtn.disabled = undoStack.length === 0;
 }

 async function undoLastChange() {
 const previous = undoStack.pop();
 if (!previous) return;
 pages = previous.map(page => ({ ...page }));
 updateUndoButton();
 await renderAllThumbnails();
 if (window.showToast) showToast('Last change undone.', 'info');
 }

 function setProgress(value) {
 const percent = Math.max(0, Math.min(100, Math.round(value)));
 progressBar.style.width = `${percent}%`;
 progressBar.setAttribute('aria-valuenow', String(percent));
 }

 function setLoadedState(isLoaded) {
 dropZone.style.display = isLoaded ? 'none' : 'block';
 controls.style.display = isLoaded ? 'flex' : 'none';
 reloadBtn.style.display = isLoaded ? 'inline-flex' : 'none';
 resetBtn.disabled = !isLoaded;
 saveBtn.disabled = !isLoaded || pages.length === 0;
 }

 function clearState() {
 pages = [];
 originalPages = [];
 originalBuffer = null;
 originalName = '';
 pdfjsDoc = null;
 draggedIndex = null;
 undoStack = [];
 input.value = '';
 thumbGrid.innerHTML = '';
 statusDiv.style.display = 'none';
 progressWrap.style.display = 'none';
 setProgress(0);
 updateUndoButton();
 setLoadedState(false);
 if (window.resetDropZone) resetDropZone('orgDropZone', 'Drag and drop a PDF file here');
 }

 function syncAfterChange(message) {
 saveBtn.disabled = pages.length === 0;
 statusDiv.textContent = message || `${pages.length} page${pages.length !== 1 ? 's' : ''} ready`;
 statusDiv.style.display = 'block';
 updateUndoButton();
 }

 zoomSlider.addEventListener('input', () => {
 const value = zoomSlider.value;
 zoomValue.textContent = `${value}px`;
 thumbGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${value}px, 1fr))`;
 });

 dropZone.addEventListener('click', () => input.click());
 dropZone.addEventListener('keydown', event => {
 if (event.key === 'Enter' || event.key === ' ') {
 event.preventDefault();
 input.click();
 }
 });

 if (typeof setupDropZone === 'function') {
 setupDropZone('orgDropZone', 'orgPdfInput');
 }

 input.addEventListener('change', () => {
 if (input.files && input.files[0]) handleFile(input.files[0]);
 });

 reloadBtn.addEventListener('click', clearState);

 resetBtn.addEventListener('click', async () => {
 if (!originalPages.length) return;
 pushUndo();
 pages = originalPages.map(page => ({ ...page }));
 await renderAllThumbnails();
 if (window.showToast) showToast('Page order reset.', 'info');
 });

 undoBtn.addEventListener('click', undoLastChange);

 rotateAllBtn.addEventListener('click', async () => {
 if (pages.length === 0) return;
 pushUndo();
 pages.forEach(page => {
 page.rotation = (page.rotation + 90) % 360;
 });
 await renderAllThumbnails();
 });

 deleteAllBtn.addEventListener('click', async () => {
 if (pages.length === 0) return;
 if (!confirm('Remove all pages from the working copy?')) return;
 pushUndo();
 pages = [];
 await renderAllThumbnails();
 if (window.showToast) showToast('All pages removed.', 'warning');
 });

 async function handleFile(file) {
 const validation = typeof validateFile === 'function'
 ? validateFile(file, { extensions: ['.pdf'], mimeTypes: ['application/pdf'], label: 'PDF' })
 : { valid: file && /\.pdf$/i.test(file.name) };

 if (!validation.valid) {
 if (window.showToast) showToast(validation.message || 'Please select a valid PDF.', 'error');
 input.value = '';
 return;
 }

 clearState();
 originalName = file.name;
 if (window.showFileOnDropZone) showFileOnDropZone('orgDropZone', file);

 try {
 if (window.showSpinner) showSpinner('Reading PDF...');
 statusDiv.textContent = 'Reading PDF...';
 statusDiv.style.display = 'block';

 originalBuffer = await file.arrayBuffer();
 const pdfData = new Uint8Array(originalBuffer);
 pdfjsDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

 pages = Array.from({ length: pdfjsDoc.numPages }, (_, index) => ({ pageIndex: index, rotation: 0 }));
 originalPages = snapshotPages();
 undoStack = [];
 updateUndoButton();
 setLoadedState(true);

 await renderAllThumbnails();
 } catch (error) {
 console.error(error);
 clearState();
 if (window.showToast) showToast('Failed to load PDF: ' + error.message, 'error');
 } finally {
 if (window.hideSpinner) hideSpinner();
 }
 }

 async function renderAllThumbnails() {
 thumbGrid.innerHTML = '';
 setLoadedState(Boolean(pdfjsDoc));
 progressWrap.style.display = pages.length > 0 ? 'block' : 'none';
 setProgress(0);

 for (let index = 0; index < pages.length; index++) {
 setProgress(((index + 1) / pages.length) * 100);
 statusDiv.textContent = `Rendering thumbnail ${index + 1} of ${pages.length}...`;
 statusDiv.style.display = 'block';
 await renderThumbCard(index);
 if (index % 4 === 0 && window.yieldToMainThread) await yieldToMainThread();
 }

 progressWrap.style.display = 'none';
 setProgress(0);
 syncAfterChange(`${pages.length} page${pages.length !== 1 ? 's' : ''} - drag, use buttons, or use keyboard arrows to reorder`);
 attachDragHandlers();
 if (window.ensureCanvasAccessibility) window.ensureCanvasAccessibility(thumbGrid);
 }

 async function renderThumbCard(gridIndex) {
 const entry = pages[gridIndex];
 const pdfPage = await pdfjsDoc.getPage(entry.pageIndex + 1);
 const viewport = pdfPage.getViewport({ scale: 0.25 });

 const canvas = document.createElement('canvas');
 canvas.width = Math.round(viewport.width);
 canvas.height = Math.round(viewport.height);
 canvas.setAttribute('role', 'img');
 canvas.setAttribute('aria-label', `Page ${entry.pageIndex + 1} preview`);

 const ctx = canvas.getContext('2d');
 ctx.fillStyle = '#ffffff';
 ctx.fillRect(0, 0, canvas.width, canvas.height);
 await pdfPage.render({ canvasContext: ctx, viewport }).promise;
 canvas.style.transform = `rotate(${entry.rotation}deg)`;

 const card = document.createElement('div');
 card.className = 'page-thumb';
 card.dataset.gridIndex = String(gridIndex);
 card.dataset.pageNumber = String(entry.pageIndex + 1);
 card.draggable = true;
 card.tabIndex = 0;
 card.setAttribute('role', 'listitem');
 card.setAttribute('aria-label', `Page ${entry.pageIndex + 1}. Position ${gridIndex + 1} of ${pages.length}. Use arrow keys to reorder, R to rotate, Delete to remove.`);

 const handle = document.createElement('div');
 handle.className = 'page-drag-handle';
 handle.textContent = 'Drag';
 handle.setAttribute('aria-hidden', 'true');

 const preview = document.createElement('div');
 preview.className = 'page-preview-frame';
 preview.appendChild(canvas);

 const label = document.createElement('div');
 label.className = 'page-thumb-label';
 label.textContent = `Page ${entry.pageIndex + 1}`;

 const actions = document.createElement('div');
 actions.className = 'page-thumb-actions';

 const leftBtn = makeThumbButton('Left', `Move page ${entry.pageIndex + 1} left`, () => movePage(gridIndex, gridIndex - 1));
 const rotateBtn = makeThumbButton('Rotate', `Rotate page ${entry.pageIndex + 1}`, () => rotatePage(gridIndex));
 const rightBtn = makeThumbButton('Right', `Move page ${entry.pageIndex + 1} right`, () => movePage(gridIndex, gridIndex + 1));
 const removeBtn = makeThumbButton('Remove', `Remove page ${entry.pageIndex + 1}`, () => removePage(gridIndex), 'danger');

 leftBtn.disabled = gridIndex === 0;
 rightBtn.disabled = gridIndex === pages.length - 1;

 actions.append(leftBtn, rotateBtn, rightBtn, removeBtn);
 card.append(handle, preview, label, actions);

 card.addEventListener('keydown', event => handleCardKeydown(event, gridIndex));
 thumbGrid.appendChild(card);
 }

 function makeThumbButton(text, label, onClick, variant) {
 const button = document.createElement('button');
 button.type = 'button';
 button.className = variant === 'danger' ? 'secondary danger page-action-btn' : 'secondary page-action-btn';
 button.textContent = text;
 button.setAttribute('aria-label', label);
 button.addEventListener('click', event => {
 event.stopPropagation();
 onClick();
 });
 return button;
 }

 async function handleCardKeydown(event, index) {
 if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
 event.preventDefault();
 await undoLastChange();
 return;
 }
 if (event.key === 'ArrowLeft') {
 event.preventDefault();
 await movePage(index, index - 1);
 return;
 }
 if (event.key === 'ArrowRight') {
 event.preventDefault();
 await movePage(index, index + 1);
 return;
 }
 if (event.key.toLowerCase() === 'r') {
 event.preventDefault();
 await rotatePage(index);
 return;
 }
 if (event.key === 'Delete' || event.key === 'Backspace') {
 event.preventDefault();
 await removePage(index);
 }
 }

 async function movePage(from, to) {
 if (to < 0 || to >= pages.length || from === to) return;
 pushUndo();
 const [moved] = pages.splice(from, 1);
 pages.splice(to, 0, moved);
 await renderAllThumbnails();
 focusThumb(to);
 }

 async function rotatePage(index) {
 if (!pages[index]) return;
 pushUndo();
 pages[index].rotation = (pages[index].rotation + 90) % 360;
 await renderAllThumbnails();
 focusThumb(index);
 }

 async function removePage(index) {
 if (!pages[index]) return;
 pushUndo();
 pages.splice(index, 1);
 await renderAllThumbnails();
 focusThumb(Math.min(index, pages.length - 1));
 }

 function focusThumb(index) {
 if (index < 0) return;
 requestAnimationFrame(() => {
 const target = thumbGrid.querySelector(`.page-thumb[data-grid-index="${index}"]`);
 if (target) target.focus();
 });
 }

 function attachDragHandlers() {
 if (thumbGrid.dataset.dragReady === 'true') return;
 thumbGrid.dataset.dragReady = 'true';

 thumbGrid.addEventListener('dragstart', event => {
 const card = event.target.closest('.page-thumb');
 if (!card) return;
 draggedIndex = Number(card.dataset.gridIndex);
 event.dataTransfer.effectAllowed = 'move';
 event.dataTransfer.setData('text/plain', String(draggedIndex));
 card.classList.add('dragging');
 });

 thumbGrid.addEventListener('dragover', event => {
 const card = event.target.closest('.page-thumb');
 if (!card) return;
 event.preventDefault();
 event.dataTransfer.dropEffect = 'move';
 card.classList.add('drag-over');
 });

 thumbGrid.addEventListener('dragleave', event => {
 const card = event.target.closest('.page-thumb');
 if (card) card.classList.remove('drag-over');
 });

 thumbGrid.addEventListener('drop', async event => {
 const card = event.target.closest('.page-thumb');
 if (!card) return;
 event.preventDefault();
 card.classList.remove('drag-over');

 const from = Number.isFinite(draggedIndex) ? draggedIndex : Number(event.dataTransfer.getData('text/plain'));
 const to = Number(card.dataset.gridIndex);
 draggedIndex = null;
 await movePage(from, to);
 });

 thumbGrid.addEventListener('dragend', () => {
 thumbGrid.querySelectorAll('.page-thumb').forEach(card => {
 card.classList.remove('dragging', 'drag-over');
 });
 draggedIndex = null;
 });
 }

 saveBtn.addEventListener('click', async () => {
 if (pages.length === 0 || !originalBuffer) {
 if (window.showToast) showToast('Add at least one page before saving.', 'warning');
 return;
 }

 saveBtn.disabled = true;
 saveBtn.textContent = 'Saving...';
 if (window.showSpinner) showSpinner('Building organised PDF...');

 try {
 const newDoc = await PDFLib.PDFDocument.create();
 const sourceDoc = await PDFLib.PDFDocument.load(originalBuffer);
 const copiedPages = await newDoc.copyPages(sourceDoc, pages.map(page => page.pageIndex));

 for (let index = 0; index < copiedPages.length; index++) {
 copiedPages[index].setRotation(PDFLib.degrees(pages[index].rotation));
 newDoc.addPage(copiedPages[index]);
 if (index % 6 === 0 && window.yieldToMainThread) await yieldToMainThread();
 }

 const bytes = await newDoc.save();
 const baseName = originalName.replace(/\.pdf$/i, '') || 'document';
 downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `organised-${baseName}.pdf`);

 if (window.showToast) showToast(`Saved ${pages.length} page${pages.length !== 1 ? 's' : ''}.`);
 if (window.triggerSuccessConfetti) window.triggerSuccessConfetti();
 } catch (error) {
 console.error(error);
 if (window.showToast) showToast('Export failed: ' + error.message, 'error');
 } finally {
 saveBtn.disabled = pages.length === 0;
 saveBtn.textContent = 'Save Organised PDF';
 if (window.hideSpinner) hideSpinner();
 }
 });
 } catch (error) {
 console.error('renderorganizepdf error:', error);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.setAttribute('role', 'alert');
 warn.textContent = 'Tool failed to load: ' + error.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




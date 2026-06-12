async function renderrotatepdf(container) {
 try {
 await Promise.all([
 loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
 loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js')
 ]);

 pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Rotate PDF pages by 90, 180, or 270. Select individual pages to rotate. 100% private, no uploads.");
 updatePageTitle("PDF Page Rotator");

 area.innerHTML = `
 <h3> PDF Rotate</h3>
 <p class="tool-description">
 Rotate individual pages in a PDF by 90, 180, or 270. Select which pages to rotate and preview the changes.
 Perfect for fixing scanned documents or adjusting page orientation. After rotating, you can also <a href="/pages/mergepdf.html" target="_self">merge PDFs</a>.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my file uploaded to a server?</summary>
 <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
 </details>
 </div>
 <div id="rotatePdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
 <div style="font-size: 2rem; margin-bottom: 1rem;"></div>
 <p>Drag and drop a .pdf file here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="rotatePdfInput" accept=".pdf" style="display: none;">
 </div>

 <div id="rotateControls" style="display: none; margin: 1rem 0;">
 <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem;">
 <button id="selectAllRotate" class="secondary">Select All</button>
 <button id="deselectAllRotate" class="secondary">Deselect All</button>
 <button id="rotateCWAll" class="secondary" title="Rotate all pages 90 clockwise"> Rotate All CW</button>
 <button id="rotateCCWAll" class="secondary" title="Rotate all pages 90 counter-clockwise"> Rotate All CCW</button>
 <select id="rotationAngle" style="padding: 0.5rem; border-radius: 4px; background: var(--bg-input); color: var(--text); border: 1px solid var(--border); margin-left: auto;">
 <option value="90">90 Clockwise</option>
 <option value="180">180 (Upside Down)</option>
 <option value="270">270 Counter-Clockwise</option>
 </select>
 </div>
 <p class="note" style="margin-bottom:0.5rem;">Click a page to toggle selection. Rotation preview updates instantly.</p>
 <div id="rotateThumbnails" class="file-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; margin-top: 0.5rem;"></div>
 </div>

 <button id="rotatePdfBtn" class="primary" disabled>Rotate Selected Pages</button>

 <div id="rotateProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
 <div id="rotateProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
 </div>

 <div class="preview-box" id="rotateProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>

 <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
 <button id="downloadRotateBtn" class="download-btn" disabled> Download Rotated PDF</button>
 </div>
 `;

 const inp = document.getElementById('rotatePdfInput');
 const dropZone = document.getElementById('rotatePdfDropZone');
 const controls = document.getElementById('rotateControls');
 const thumbnailsDiv = document.getElementById('rotateThumbnails');
 const btn = document.getElementById('rotatePdfBtn');
 const progressDiv = document.getElementById('rotateProgress');
 const progressContainer = document.getElementById('rotateProgressContainer');
 const progressBar = document.getElementById('rotateProgressBar');
 const downloadBtn = document.getElementById('downloadRotateBtn');
 const selectAllBtn = document.getElementById('selectAllRotate');
 const deselectAllBtn = document.getElementById('deselectAllRotate');
 const angleSelect = document.getElementById('rotationAngle');

 let currentPdf = null;
 let selectedPages = new Set();
 const pageAngles = new Map();
 function getPageAngle(pageNum) {
 return pageAngles.get(pageNum) || 0;
 }

 function applyThumbTransform(pageNum) {
 const card = thumbnailsDiv.querySelector(`[data-page-num="${pageNum}"]`);
 if (!card) return;
 const canvas = card.querySelector('canvas');
 if (canvas) canvas.style.transform = `rotate(${getPageAngle(pageNum)}deg)`;
 const badge = card.querySelector('.angle-badge');
 const angle = getPageAngle(pageNum);
 if (badge) badge.textContent = angle ? `${angle}` : '';
 }
 dropZone.addEventListener('click', () => inp.click());
 if (typeof setupDropZone === 'function') {
 setupDropZone('rotatePdfDropZone', 'rotatePdfInput');
 }

 function renderThumbnails(pdf, totalPages) {
 thumbnailsDiv.innerHTML = '';
 selectedPages.clear();
 pageAngles.clear();

 for (let i = 1; i <= totalPages; i++) {
 const pageDiv = document.createElement('div');
 pageDiv.className = 'preview-box';
 pageDiv.style.cssText = 'position:relative; cursor:pointer; border:2px solid transparent; transition:border-color 0.2s; padding:0.5rem;';
 pageDiv.dataset.pageNum = i;

 const canvas = document.createElement('canvas');
 canvas.width = 130;
 canvas.height = 180;
 canvas.style.cssText = 'width:100%; height:auto; transition:transform 0.3s ease; display:block;';

 const badge = document.createElement('div');
 badge.className = 'angle-badge';
 badge.style.cssText = 'position:absolute; top:6px; left:6px; background:var(--accent); color:#fff; font-size:0.7rem; padding:1px 5px; border-radius:4px; font-weight:700;';

 const label = document.createElement('div');
 label.textContent = `Page ${i}`;
 label.style.cssText = 'text-align:center; margin-top:0.4rem; font-size:0.85rem;';

 const checkbox = document.createElement('input');
 checkbox.type = 'checkbox';
 checkbox.style.cssText = 'position:absolute; top:8px; right:8px;';
 checkbox.dataset.page = i;

 checkbox.addEventListener('change', () => {
 if (checkbox.checked) {
 selectedPages.add(i);
 pageAngles.set(i, parseInt(angleSelect.value));
 applyThumbTransform(i);
 pageDiv.style.borderColor = 'var(--accent)';
 } else {
 selectedPages.delete(i);
 pageAngles.delete(i);
 applyThumbTransform(i);
 pageDiv.style.borderColor = 'transparent';
 }
 updateButtonState();
 });

 pageDiv.addEventListener('click', (e) => {
 if (e.target !== checkbox) {
 checkbox.checked = !checkbox.checked;
 checkbox.dispatchEvent(new Event('change'));
 }
 });

 pageDiv.appendChild(canvas);
 pageDiv.appendChild(badge);
 pageDiv.appendChild(label);
 pageDiv.appendChild(checkbox);
 thumbnailsDiv.appendChild(pageDiv);
 pdf.getPage(i).then(page => {
 const viewport = page.getViewport({ scale: 0.25 });
 const ctx = canvas.getContext('2d');
 canvas.width = viewport.width;
 canvas.height = viewport.height;
 page.render({ canvasContext: ctx, viewport }).promise.catch(err => {
 console.error('Thumbnail error page', i, err);
 });
 });
 }
 }

 function updateButtonState() {
 btn.disabled = selectedPages.size === 0;
 }

 selectAllBtn.addEventListener('click', () => {
 thumbnailsDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => {
 cb.checked = true;
 cb.dispatchEvent(new Event('change'));
 });
 });

 deselectAllBtn.addEventListener('click', () => {
 thumbnailsDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => {
 cb.checked = false;
 cb.dispatchEvent(new Event('change'));
 });
 });
 document.getElementById('rotateCWAll').addEventListener('click', () => {
 const pages = thumbnailsDiv.querySelectorAll('[data-page-num]');
 pages.forEach(card => {
 const pn = parseInt(card.dataset.pageNum);
 pageAngles.set(pn, (getPageAngle(pn) + 90) % 360);
 applyThumbTransform(pn);
 const cb = card.querySelector('input[type="checkbox"]');
 if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change')); }
 });
 });

 document.getElementById('rotateCCWAll').addEventListener('click', () => {
 const pages = thumbnailsDiv.querySelectorAll('[data-page-num]');
 pages.forEach(card => {
 const pn = parseInt(card.dataset.pageNum);
 pageAngles.set(pn, (getPageAngle(pn) + 270) % 360);
 applyThumbTransform(pn);
 const cb = card.querySelector('input[type="checkbox"]');
 if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change')); }
 });
 });
 angleSelect.addEventListener('change', () => {
 selectedPages.forEach(pn => {
 pageAngles.set(pn, parseInt(angleSelect.value));
 applyThumbTransform(pn);
 });
 });

 inp.addEventListener('change', async () => {
 const file = inp.files[0];
 if (!file) return;

 if (window.showFileOnDropZone) showFileOnDropZone('rotatePdfDropZone', file);
 currentPdf = null;
 controls.style.display = 'none';
 btn.disabled = true;
 downloadBtn.disabled = true;

 try {
 const arrayBuf = await file.arrayBuffer();
 const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
 const totalPages = pdf.numPages;

 const arrayBuf2 = await file.arrayBuffer();
 currentPdf = await PDFLib.PDFDocument.load(arrayBuf2);

 renderThumbnails(pdf, totalPages);
 controls.style.display = 'block';
 updateButtonState();

 if (window.showToast) showToast(`Loaded PDF with ${totalPages} pages`);
 } catch (e) {
 if (window.showToast) showToast('Failed to load PDF: ' + e.message, 'error');
 console.error(e);
 }
 });

 btn.addEventListener('click', async () => {
 const file = inp.files[0];
 if (!file || selectedPages.size === 0) return;

 btn.disabled = true;
 btn.innerHTML = ' Rotating...';
 progressDiv.style.display = 'block';
 progressDiv.innerHTML = 'Applying rotations...';
 progressContainer.style.display = 'block';
 progressBar.style.width = '0%';
 downloadBtn.disabled = true;

 try {
 const angle = parseInt(angleSelect.value);
 const arrayBuf = await file.arrayBuffer();
 const pdfToRotate = await PDFLib.PDFDocument.load(arrayBuf);
 const pages = pdfToRotate.getPages();

 let processed = 0;
 for (const pageNum of selectedPages) {
 const pageIndex = pageNum - 1;
 const appliedAngle = pageAngles.has(pageNum) ? pageAngles.get(pageNum) : angle;
 const existingAngle = pages[pageIndex].getRotation().angle || 0;
 pages[pageIndex].setRotation(PDFLib.degrees((existingAngle + appliedAngle) % 360));
 processed++;
 progressBar.style.width = `${(processed / selectedPages.size) * 100}%`;
 }

 progressBar.style.width = '100%';
 progressDiv.innerHTML = 'Saving PDF...';

 const pdfBytes = await pdfToRotate.save();
 const blob = new Blob([pdfBytes], { type: 'application/pdf' });

 progressDiv.innerHTML = 'Done!';
 downloadBtn.disabled = false;

 const baseName = file.name.replace(/\.pdf$/i, '') || 'document';
 downloadBtn.onclick = () => downloadBlob(blob, `${baseName}-rotated.pdf`);

 if (window.showToast) showToast(`Successfully rotated ${selectedPages.size} pages`);

 setTimeout(() => {
 progressContainer.style.display = 'none';
 progressBar.style.width = '0%';
 progressDiv.style.display = 'none';
 }, 2000);

 } catch (e) {
 progressDiv.textContent = `Error: ${e.message}`;
 if (window.showToast) showToast('Failed to rotate PDF: ' + e.message, 'error');
 console.error(e);
 } finally {
 btn.disabled = false;
 btn.innerHTML = 'Rotate Selected Pages';
 }
 });
 } catch (___err) {
 console.error('renderrotatepdf error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




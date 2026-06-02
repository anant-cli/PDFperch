async function rendersplitpdf(container) {
 try {
 await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription('Split a PDF into individual pages or a custom page range locally in your browser.');
 updatePageTitle('Split PDF Online');

 area.innerHTML = `
 <h3> Split PDF</h3>
 <p class="tool-description">
 Upload a PDF and split it into separate pages or extract a custom page range. Everything happens locally in your browser, so your file stays private.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my file uploaded to a server?</summary>
 <p>No. All processing happens locally in your browser. Your file never leaves your device.</p>
 </details>
 </div>

 <div id="splitPdfDropZone" class="drop-zone">
 <div style="font-size: 2rem; margin-bottom: 1rem;"></div>
 <p>Drag and drop your PDF here</p>
 <p class="note">or click to browse</p>
 <input type="file" id="splitPdfInput" accept=".pdf" style="display: none;">
 </div>

 <div id="splitStats" style="display:none; text-align:right; margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem;">
 File: <span id="splitFileName">-</span> | Size: <span id="splitSize">0 Bytes</span> | Pages: <span id="splitTotalPages">0</span>
 </div>

 <div class="orientation-selector">
 <label><input type="radio" id="splitModeAll" name="splitMode" value="all" checked> Split every page</label>
 <label style="margin-left: 1rem;"><input type="radio" id="splitModeCustom" name="splitMode" value="custom"> Custom range</label>
 <label style="margin-left: 1rem;"><input type="radio" id="splitModeChunks" name="splitMode" value="chunks"> Chunks of N pages</label>
 </div>

 <div id="customRangeGroup" style="display:none;">
 <div class="input-group">
 <label for="splitPageRange">Page range</label>
 <input id="splitPageRange" type="text" placeholder="1-3,5">
 <p class="note" id="rangeValidation">Enter ranges like 1-3,5.</p>
 </div>
 </div>

 <div id="chunksGroup" style="display:none;">
 <div class="input-group">
 <label for="splitChunkSize">Pages per chunk</label>
 <input id="splitChunkSize" type="number" min="1" value="2" placeholder="e.g. 3">
 <p class="note">Splits the PDF into separate files of N pages each, downloaded as a ZIP.</p>
 </div>
 </div>

 <div id="splitProgressContainer" style="display:none; margin-bottom: 1rem;" class="progress-bar-bg">
 <div id="splitProgressBar" class="progress-bar-fill" style="width: 0%;"></div>
 </div>

 <div id="splitSummary" class="preview-box" style="display:none; margin-bottom:1rem;"></div>

 <button id="splitPdfBtn" disabled> Split &amp; download</button>
 `;

 const splitInput = document.getElementById('splitPdfInput');
 const splitDropZone = document.getElementById('splitPdfDropZone');
 const splitStats = document.getElementById('splitStats');
 const fileNameSpan = document.getElementById('splitFileName');
 const sizeSpan = document.getElementById('splitSize');
 const pageCountSpan = document.getElementById('splitTotalPages');
 const splitBtn = document.getElementById('splitPdfBtn');
 const progressContainer = document.getElementById('splitProgressContainer');
 const progressBar = document.getElementById('splitProgressBar');
 const allPagesRadio = document.getElementById('splitModeAll');
 const customRangeRadio = document.getElementById('splitModeCustom');
 const chunksRadio = document.getElementById('splitModeChunks');
 const rangeInput = document.getElementById('splitPageRange');
 const rangeValidation = document.getElementById('rangeValidation');
 const chunkSizeInput = document.getElementById('splitChunkSize');
 const customRangeGroup = document.getElementById('customRangeGroup');
 const chunksGroup = document.getElementById('chunksGroup');
 const splitSummary = document.getElementById('splitSummary');

 let currentFile = null;
 let currentTotalPages = 0;

 function parsePageRange(str, totalPages) {
 if (!str) return [];
 const parts = str.split(',');
 const pages = new Set();
 for (let part of parts) {
 part = part.trim();
 if (part.includes('-')) {
 let [start, end] = part.split('-').map(Number);
 if (isNaN(start) || isNaN(end)) continue;
 start = Math.max(1, Math.min(start, totalPages));
 end = Math.max(1, Math.min(end, totalPages));
 for (let i = start; i <= end; i++) pages.add(i);
 } else {
 const p = Number(part);
 if (!isNaN(p) && p >= 1 && p <= totalPages) pages.add(p);
 }
 }
 return Array.from(pages).sort((a, b) => a - b);
 }

 function validateRangeInput() {
 if (!customRangeRadio.checked) {
 rangeValidation.textContent = 'Enter ranges like 1-3,5.';
 rangeValidation.style.color = '';
 return true;
 }
 const value = rangeInput.value.trim();
 const pages = parsePageRange(value, currentTotalPages);
 if (!value) {
 rangeValidation.textContent = 'Enter a page range before splitting.';
 rangeValidation.style.color = '#f59e0b';
 return false;
 }
 if (pages.length === 0) {
 rangeValidation.textContent = `No valid pages found. Use page numbers from 1 to ${currentTotalPages || '?'}.`;
 rangeValidation.style.color = '#f87171';
 return false;
 }
 rangeValidation.textContent = `Valid range: ${pages.length} page${pages.length === 1 ? '' : 's'} selected.`;
 rangeValidation.style.color = '#22c55e';
 return true;
 }

 function updateModeUI() {
 customRangeGroup.style.display = customRangeRadio.checked ? 'block' : 'none';
 chunksGroup.style.display = chunksRadio.checked ? 'block' : 'none';
 rangeInput.disabled = !customRangeRadio.checked;
 chunkSizeInput.disabled = !chunksRadio.checked;
 splitSummary.style.display = 'none';
 splitBtn.disabled = !currentFile || (customRangeRadio.checked && !validateRangeInput());
 }

 function updateStats(file, totalPages) {
 if (file) {
 splitStats.style.display = 'block';
 fileNameSpan.textContent = file.name;
 sizeSpan.textContent = typeof formatFileSize === 'function' ? formatFileSize(file.size) : file.size + ' bytes';
 pageCountSpan.textContent = totalPages;
 splitBtn.disabled = false;
 } else {
 splitStats.style.display = 'none';
 splitBtn.disabled = true;
 }
 }

 splitDropZone.addEventListener('click', () => splitInput.click());
 if (typeof setupDropZone === 'function') {
 setupDropZone('splitPdfDropZone', 'splitPdfInput');
 }

 splitInput.addEventListener('change', async () => {
 const file = splitInput.files[0];
 if (!file) return;

 if (window.showFileOnDropZone) showFileOnDropZone('splitPdfDropZone', file);
 currentFile = file;
 try {
 const arrayBuf = await file.arrayBuffer();
 const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf, { ignoreEncryption: true });
 currentTotalPages = pdfDoc.getPageCount();
 updateStats(file, currentTotalPages);
 updateModeUI();
 } catch (err) {
 currentFile = null;
 currentTotalPages = 0;
 updateStats(null, 0);
 if (window.showToast) showToast('Unable to read PDF: ' + err.message, 'error');
 else alert('Unable to read PDF: ' + err.message);
 console.error(err);
 }
 });

 allPagesRadio.addEventListener('change', () => {
 updateModeUI();
 });

 customRangeRadio.addEventListener('change', () => {
 updateModeUI();
 rangeInput.focus();
 });
 chunksRadio.addEventListener('change', updateModeUI);
 rangeInput.addEventListener('input', () => {
 validateRangeInput();
 splitBtn.disabled = !currentFile || !validateRangeInput();
 });
 chunkSizeInput.addEventListener('input', () => {
 splitSummary.style.display = 'none';
 splitBtn.disabled = !currentFile || Math.max(1, parseInt(chunkSizeInput.value) || 0) < 1;
 });
 updateModeUI();

 splitBtn.addEventListener('click', async () => {
 if (!currentFile) {
 if (window.showToast) showToast('Please upload a PDF file first.', 'warning');
 else alert('Please upload a PDF file first.');
 return;
 }

 splitBtn.disabled = true;
 splitBtn.innerHTML = ' Processing...';
 progressContainer.style.display = 'block';
 progressBar.style.width = '0%';

 try {
 const arrayBuf = await currentFile.arrayBuffer();
 const srcPdf = await PDFLib.PDFDocument.load(arrayBuf, { ignoreEncryption: true });
 const totalPages = srcPdf.getPageCount();
 const baseName = currentFile.name.replace(/\.[^/.]+$/, '') || 'split-document';

 if (chunksRadio.checked) {
 const chunkSize = Math.max(1, parseInt(chunkSizeInput.value) || 2);
 const totalPages = srcPdf.getPageCount();
 const numChunks = Math.ceil(totalPages / chunkSize);
 if (numChunks === 1) {
 const outputBytes = await srcPdf.save({ useObjectStreams: true });
 downloadBlob(new Blob([outputBytes], { type: 'application/pdf' }), `${baseName}-part-1.pdf`);
 splitSummary.style.display = 'block';
 splitSummary.innerHTML = `<strong>Split summary</strong><br>1 chunk created from ${totalPages} page${totalPages === 1 ? '' : 's'}.`;
 if (window.showToast) showToast('Only one chunk needed - downloaded as single file.');
 } else {
 if (typeof JSZip === 'undefined') await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
 const zip = new JSZip();
 for (let chunk = 0; chunk < numChunks; chunk++) {
 const start = chunk * chunkSize;
 const end = Math.min(start + chunkSize, totalPages);
 splitBtn.innerHTML = ` Creating part ${chunk + 1} of ${numChunks}...`;
 const chunkDoc = await PDFLib.PDFDocument.create();
 const indices = Array.from({ length: end - start }, (_, j) => start + j);
 const copied = await chunkDoc.copyPages(srcPdf, indices);
 copied.forEach(p => chunkDoc.addPage(p));
 const chunkBytes = await chunkDoc.save({ useObjectStreams: true });
 zip.file(`${baseName}-part-${chunk + 1}.pdf`, chunkBytes);
 progressBar.style.width = `${((chunk + 1) / numChunks) * 100}%`;
 }
 splitBtn.innerHTML = ' Creating ZIP...';
 const zipBlob = await zip.generateAsync({ type: 'blob' }, meta => {
 progressBar.style.width = `${Math.round(meta.percent)}%`;
 });
 downloadBlob(zipBlob, `${baseName}-chunks.zip`);
 splitSummary.style.display = 'block';
 splitSummary.innerHTML = `<strong>Split summary</strong><br>${numChunks} PDF chunks created, up to ${chunkSize} page${chunkSize === 1 ? '' : 's'} each.`;
 if (window.showToast) showToast(`Split into ${numChunks} chunks of up to ${chunkSize} pages.`);
 }
 } else if (customRangeRadio.checked) {
 const rawRange = rangeInput.value.trim();
 const selectedPages = parsePageRange(rawRange, totalPages);
 if (selectedPages.length === 0) {
 if (window.showToast) showToast('Please enter a valid page range.', 'warning');
 else alert('Please enter a valid page range.');
 return;
 }

 splitBtn.innerHTML = ' Building PDF...';
 const newDoc = await PDFLib.PDFDocument.create();
 const copied = await newDoc.copyPages(srcPdf, selectedPages.map(p => p - 1));
 copied.forEach(page => newDoc.addPage(page));
 progressBar.style.width = '60%';

 const outputBytes = await newDoc.save({ useObjectStreams: true });
 progressBar.style.width = '100%';
 downloadBlob(new Blob([outputBytes], { type: 'application/pdf' }), `${baseName}-pages.pdf`);
 splitSummary.style.display = 'block';
 splitSummary.innerHTML = `<strong>Split summary</strong><br>Created one PDF with ${selectedPages.length} selected page${selectedPages.length === 1 ? '' : 's'}: ${selectedPages.join(', ')}.`;
 if (window.showToast) showToast(`Successfully created ${selectedPages.length} page${selectedPages.length === 1 ? '' : 's'} from your selection.`);
 } else {
 if (totalPages === 1) {
 splitBtn.innerHTML = ' Saving page...';
 const singleDoc = await PDFLib.PDFDocument.create();
 const [page] = await singleDoc.copyPages(srcPdf, [0]);
 singleDoc.addPage(page);
 const outputBytes = await singleDoc.save({ useObjectStreams: true });
 progressBar.style.width = '100%';
 downloadBlob(new Blob([outputBytes], { type: 'application/pdf' }), `${baseName}-page-1.pdf`);
 splitSummary.style.display = 'block';
 splitSummary.innerHTML = '<strong>Split summary</strong><br>Created 1 single-page PDF.';
 if (window.showToast) showToast('Successfully extracted the one page PDF.');
 } else {
 if (typeof JSZip === 'undefined') {
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
 }
 const zip = new JSZip();
 for (let i = 0; i < totalPages; i++) {
 splitBtn.innerHTML = ` Creating page ${i + 1} of ${totalPages}...`;
 const pageDoc = await PDFLib.PDFDocument.create();
 const [page] = await pageDoc.copyPages(srcPdf, [i]);
 pageDoc.addPage(page);
 const pageBytes = await pageDoc.save({ useObjectStreams: true });
 zip.file(`${baseName}-page-${i + 1}.pdf`, pageBytes);
 progressBar.style.width = `${Math.round(((i + 1) / totalPages) * 100)}%`;
 }
 splitBtn.innerHTML = ' Creating ZIP...';
 const zipBlob = await zip.generateAsync({ type: 'blob' }, meta => {
 progressBar.style.width = `${Math.round(meta.percent)}%`;
 });
 downloadBlob(zipBlob, `${baseName}-pages.zip`);
 splitSummary.style.display = 'block';
 splitSummary.innerHTML = `<strong>Split summary</strong><br>Created ${totalPages} single-page PDFs in a ZIP file.`;
 if (window.showToast) showToast(`Successfully split ${totalPages} pages into ZIP.`);
 }
 }
 } catch (err) {
 if (window.showToast) showToast('Split failed: ' + err.message, 'error');
 else alert('Split failed: ' + err.message);
 console.error(err);
 } finally {
 splitBtn.disabled = !currentFile;
 splitBtn.innerHTML = ' Split & download';
 setTimeout(() => {
 progressContainer.style.display = 'none';
 progressBar.style.width = '0%';
 }, 1200);
 }
 });
 } catch (___err) {
 console.error('rendersplitpdf error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




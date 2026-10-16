async function renderocrtool(container) {
 try {
 await loadScript('/vendor/tesseract/tesseract.min.js');
 if (typeof Tesseract === 'undefined') {
 throw new Error('OCR engine failed to load. Check your internet connection and try again.');
 }

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription('Extract text from images and scanned PDFs using OCR. Supports 12 languages. 100% private, runs in your browser.');
 updatePageTitle('OCR - Extract Text from Images');

 area.innerHTML = `
 <h3> OCR - Image to Text</h3>
 <p class="tool-description">
 Extract text from images and scanned PDFs using Tesseract OCR - entirely in your browser.
 Supports JPG, PNG, WebP, BMP, TIFF images and PDF files. 12 languages available.
 Your files never leave your device.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Why does OCR take a while on first use?</summary>
 <p>Tesseract.js downloads a ~7 MB WebAssembly bundle on first use. Subsequent recognitions on the same page are faster because the engine stays cached.</p>
 </details>
 <details>
 <summary>Which languages are supported?</summary>
 <p>English, French, German, Spanish, Italian, Portuguese, Dutch, Russian, Chinese (Simplified), Japanese, Arabic, and Hindi. Select the matching language before running OCR for best accuracy.</p>
 </details>
 <details>
 <summary>What image quality gives best results?</summary>
 <p>Use high-contrast scans at 300 DPI or higher. Tilted or blurry text reduces accuracy. For PDFs, the tool renders each page at 2 scale before processing.</p>
 </details>
 </div>

 <div id="ocrDropZone" class="drop-zone">
 <div class="drop-zone-icon"></div>
 <p>Drag and drop an image or PDF here</p>
 <p class="note">or click to browse - JPG, PNG, WebP, BMP, TIFF, PDF</p>
 <input type="file" id="ocrInput" accept="image/*,.pdf" class="sr-only-input">
 </div>

 <div class="input-group">
 <label for="ocrLang">Recognition language</label>
 <select id="ocrLang">
 <option value="eng" selected>English</option>
 <option value="fra">French</option>
 <option value="deu">German</option>
 <option value="spa">Spanish</option>
 <option value="ita">Italian</option>
 <option value="por">Portuguese</option>
 <option value="nld">Dutch</option>
 <option value="rus">Russian</option>
 <option value="chi_sim">Chinese (Simplified)</option>
 <option value="jpn">Japanese</option>
 <option value="ara">Arabic</option>
 <option value="hin">Hindi</option>
 </select>
 </div>

 <button id="ocrRunBtn" class="primary" disabled>Extract Text</button>

 <div id="ocrProgressWrapper" class="ocr-progress-wrap hidden">
 <div id="ocrProgressLabel" class="ocr-progress-label">Loading OCR engine</div>
 <div class="ocr-progress-track">
 <div id="ocrProgressBar" class="ocr-progress-fill"></div>
 </div>
 </div>

 <div id="ocrOutputSection" class="ocr-output-section hidden">
 <div class="ocr-output-header">
 <span class="ocr-output-meta" id="ocrWordCount"></span>
 <span class="ocr-output-meta" id="ocrTimeLabel"></span>
 </div>
 <textarea id="ocrOutput" class="ocr-textarea" readonly
 placeholder="Extracted text will appear here"></textarea>
 <div class="tool-btn-row">
 <button id="ocrCopyBtn" class="primary"> Copy Text</button>
 <button id="ocrDownloadBtn" class="download-btn"> Download .txt</button>
 </div>
 </div>
 `;
 const dropZone = document.getElementById('ocrDropZone');
 // Engine, WebAssembly core and language models are all self-hosted under
 // /vendor/tesseract (see /vendor/README.md), so OCR makes no third-party
 // requests. Absolute URLs because the worker resolves paths itself.
 // workerBlobURL:false loads the worker straight from our origin, so no
 // blob: script source is needed in the CSP.
 const TESSERACT_PATHS = {
 workerPath: new URL('/vendor/tesseract/worker.min.js', location.href).href,
 corePath: new URL('/vendor/tesseract/core', location.href).href,
 langPath: null, // set per language below
 workerBlobURL: false
 };
 // Tesseract appends "/<lang>.traineddata.gz" to langPath; one model folder
 // per language keeps the layout identical to the npm data packages.
 const langPathFor = lang => new URL(`/vendor/tesseract/lang/${lang}/4.0.0_best_int`, location.href).href;
 const inp = document.getElementById('ocrInput');
 const langSel = document.getElementById('ocrLang');
 const runBtn = document.getElementById('ocrRunBtn');
 const progressWrap = document.getElementById('ocrProgressWrapper');
 const progressLabel = document.getElementById('ocrProgressLabel');
 const progressBar = document.getElementById('ocrProgressBar');
 const outputSection = document.getElementById('ocrOutputSection');
 const ocrOutput = document.getElementById('ocrOutput');
 const wordCountEl = document.getElementById('ocrWordCount');
 const timeLabelEl = document.getElementById('ocrTimeLabel');
 const copyBtn = document.getElementById('ocrCopyBtn');
 const dlBtn = document.getElementById('ocrDownloadBtn');

 let currentFile = null;
 let lastText = '';
 let baseName = '';
 // Click must always be wired: the input is visually hidden with
 // pointer-events:none, and setupDropZone only handles drag-and-drop.
 dropZone.addEventListener('click', () => inp.click());
 dropZone.setAttribute('tabindex', '0');
 dropZone.setAttribute('role', 'button');
 dropZone.addEventListener('keydown', event => {
 if (event.key === 'Enter' || event.key === ' ') {
 event.preventDefault();
 inp.click();
 }
 });
 if (typeof setupDropZone === 'function') {
 setupDropZone('ocrDropZone', 'ocrInput');
 }
 inp.addEventListener('change', () => {
 if (inp.files[0]) handleFile(inp.files[0]);
 });

 function handleFile(file) {
 if (!file) return;
 const isImage = file.type.startsWith('image/');
 const isPdf = file.name.toLowerCase().endsWith('.pdf');
 if (!isImage && !isPdf) {
 if (window.showToast) showToast('Please select an image or PDF file.', 'error');
 return;
 }
 if (isImage) {
 const tempImg = new Image();
 const url = URL.createObjectURL(file);
 tempImg.onload = () => {
 if (tempImg.naturalWidth > 5000 || tempImg.naturalHeight > 5000) {
 if (window.showToast) showToast('Image is very large (>5000 px) - OCR may be slow.', 'warning');
 }
 URL.revokeObjectURL(url);
 };
 tempImg.src = url;
 }
 currentFile = file;
 baseName = file.name.replace(/\.[^.]+$/, '') || 'ocr-output';
 if (window.showFileOnDropZone) showFileOnDropZone('ocrDropZone', file);
 runBtn.disabled = false;
 outputSection.classList.add('hidden');
 lastText = '';
 }
 runBtn.addEventListener('click', async () => {
 if (!currentFile) return;

 runBtn.disabled = true;
 runBtn.textContent = ' Recognising';
 progressWrap.classList.remove('hidden');
 progressBar.style.width = '0%';
 progressLabel.textContent = 'Loading OCR engine (first use may take ~10 s)';
 outputSection.classList.add('hidden');
 lastText = '';

 const langCode = langSel.value;
 const langName = langSel.options[langSel.selectedIndex].text;
 const startTime = Date.now();
 const logger = (m) => {
 if (m.status === 'loading tesseract core') {
 progressLabel.textContent = 'Loading OCR engine';
 }
 if (m.status === 'loading language traineddata') {
 progressLabel.textContent = `Downloading ${langName} language data`;
 }
 if (m.status === 'initializing api') {
 progressLabel.textContent = 'Initialising OCR';
 }
 if (m.status === 'recognizing text') {
 const pct = Math.round((m.progress || 0) * 100);
 progressBar.style.width = `${pct}%`;
 progressLabel.textContent = `Recognising text ${pct}%`;
 }
 };

 try {
 const isPdf = currentFile.name.toLowerCase().endsWith('.pdf');
 let fullText = '';
 let pageCount = 0;

 if (isPdf) {
 await loadScript('/vendor/pdfjs/pdf.min.js');
 pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';

 const buf = await currentFile.arrayBuffer();
 const pdfjsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
 const total = pdfjsDoc.numPages;
 pageCount = total;
 const worker = await Tesseract.createWorker(langCode, 1, { logger, ...TESSERACT_PATHS, langPath: langPathFor(langCode) });

 try {
 for (let pageNum = 1; pageNum <= total; pageNum++) {
 progressLabel.textContent = `OCR: page ${pageNum} of ${total}`;
 progressBar.style.width = `${Math.round(((pageNum - 1) / total) * 100)}%`;

 const pdfPage = await pdfjsDoc.getPage(pageNum);
 const viewport = pdfPage.getViewport({ scale: 2.0 });
 const canvas = document.createElement('canvas');
 canvas.width = Math.round(viewport.width);
 canvas.height = Math.round(viewport.height);
 const ctx = canvas.getContext('2d');
 ctx.fillStyle = '#ffffff';
 ctx.fillRect(0, 0, canvas.width, canvas.height);
 await pdfPage.render({ canvasContext: ctx, viewport }).promise;

 // Pass the canvas itself: Tesseract reads it directly, with no URL fetch
 // (data:/blob: fetches are blocked by connect-src) and no PNG round-trip.
 const { data: { text } } = await worker.recognize(canvas);
 releaseCanvas(canvas);
 if (pageNum === 1) fullText += `--- Page 1 ---\n\n`;
 else fullText += `\n\n--- Page ${pageNum} ---\n\n`;
 fullText += text;

 if (typeof yieldToMainThread === 'function') await yieldToMainThread();
 }
 } finally {
 await worker.terminate();
 pdfjsDoc.destroy();
 }
 progressBar.style.width = '100%';

 } else {
 progressLabel.textContent = 'Initialising OCR engine';
 const worker = await Tesseract.createWorker(langCode, 1, { logger, ...TESSERACT_PATHS, langPath: langPathFor(langCode) });
 try {
 // Pass the File directly: Tesseract reads it with FileReader. A blob: URL
 // made Tesseract fetch() it, which the CSP's connect-src blocks.
 const { data: { text } } = await worker.recognize(currentFile);
 fullText = text;
 } finally {
 await worker.terminate();
 }
 progressBar.style.width = '100%';
 }

 const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
 lastText = fullText.trim();

 if (!lastText) {
 ocrOutput.value = '';
 ocrOutput.placeholder = 'No text detected. Try a higher-resolution image.';
 if (window.showToast) showToast('No text detected. Try a higher-resolution image.', 'warning');
 } else {
 ocrOutput.value = lastText;
 const words = lastText.split(/\s+/).filter(Boolean).length;
 const chars = lastText.length;
 wordCountEl.textContent = `${words.toLocaleString()} words, ${chars.toLocaleString()} characters`;
 timeLabelEl.textContent = isPdf
 ? `OCR complete - ${pageCount} page${pageCount !== 1 ? 's' : ''} in ${elapsed} s`
 : `OCR complete in ${elapsed} s`;
 }

 outputSection.classList.remove('hidden');

 } catch (e) {
 const msg = e.message || String(e);
 if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('load')) {
 if (window.showToast) showToast('OCR engine failed to load. Check your internet connection and try again.', 'error');
 } else {
 if (window.showToast) showToast('OCR failed: ' + msg, 'error');
 }
 console.error(e);
 } finally {
 runBtn.disabled = false;
 runBtn.textContent = 'Extract Text';
 progressWrap.classList.add('hidden');
 progressBar.style.width = '0%';
 }
 });
 copyBtn.addEventListener('click', async () => {
 if (!lastText) return;
 try {
 await navigator.clipboard.writeText(lastText);
 if (window.showToast) showToast('Copied to clipboard!');
 } catch (e) {
 if (window.showToast) showToast('Copy failed - try selecting and copying manually.', 'error');
 }
 });
 dlBtn.addEventListener('click', () => {
 if (!lastText) return;
 const blob = new Blob([lastText], { type: 'text/plain' });
 downloadBlob(blob, baseName + '.txt');
 });

 } catch (___err) {
 console.error('renderocrtool error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' OCR engine failed to load: ' + ___err.message + '. Check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




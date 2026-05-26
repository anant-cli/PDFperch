// ocrtool.js — OCR (Optical Character Recognition) Tool
// Uses Tesseract.js v4 (WASM) for images and pdf.js to render PDF pages before OCR
// TODO: Add SRI hash for tesseract.js CDN script
async function renderocrtool(container) {
    try {
        // Load Tesseract.js — actual worker/WASM downloads happen lazily on first recognition
        await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@4.1.4/dist/tesseract.min.js');
        if (typeof Tesseract === 'undefined') {
            throw new Error('OCR engine failed to load. Check your internet connection and try again.');
        }

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription('Extract text from images and scanned PDFs using OCR. Supports 12 languages. 100% private, runs in your browser.');
        updatePageTitle('OCR — Extract Text from Images');

        area.innerHTML = `
        <h3>🔍 OCR — Image to Text</h3>
        <p class="tool-description">
            Extract text from images and scanned PDFs using Tesseract OCR — entirely in your browser.
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
                <p>Use high-contrast scans at 300 DPI or higher. Tilted or blurry text reduces accuracy. For PDFs, the tool renders each page at 2× scale before processing.</p>
            </details>
        </div>

        <div id="ocrDropZone" class="drop-zone">
            <div class="drop-zone-icon">🖼️🔤</div>
            <p>Drag and drop an image or PDF here</p>
            <p class="note">or click to browse — JPG, PNG, WebP, BMP, TIFF, PDF</p>
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
            <div id="ocrProgressLabel" class="ocr-progress-label">Loading OCR engine…</div>
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
                placeholder="Extracted text will appear here…"></textarea>
            <div class="tool-btn-row">
                <button id="ocrCopyBtn" class="primary">📋 Copy Text</button>
                <button id="ocrDownloadBtn" class="download-btn">⬇ Download .txt</button>
            </div>
        </div>
        `;

        // ── DOM refs ──────────────────────────────────────────────────────────
        const dropZone      = document.getElementById('ocrDropZone');
        const inp           = document.getElementById('ocrInput');
        const langSel       = document.getElementById('ocrLang');
        const runBtn        = document.getElementById('ocrRunBtn');
        const progressWrap  = document.getElementById('ocrProgressWrapper');
        const progressLabel = document.getElementById('ocrProgressLabel');
        const progressBar   = document.getElementById('ocrProgressBar');
        const outputSection = document.getElementById('ocrOutputSection');
        const ocrOutput     = document.getElementById('ocrOutput');
        const wordCountEl   = document.getElementById('ocrWordCount');
        const timeLabelEl   = document.getElementById('ocrTimeLabel');
        const copyBtn       = document.getElementById('ocrCopyBtn');
        const dlBtn         = document.getElementById('ocrDownloadBtn');

        let currentFile = null;
        let lastText    = '';
        let baseName    = '';

        // ── Drop zone ─────────────────────────────────────────────────────────
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('ocrDropZone', 'ocrInput', handleFile);
        }
        inp.addEventListener('change', () => {
            if (inp.files[0]) handleFile(inp.files[0]);
        });

        function handleFile(file) {
            if (!file) return;
            const isImage = file.type.startsWith('image/');
            const isPdf   = file.name.toLowerCase().endsWith('.pdf');
            if (!isImage && !isPdf) {
                if (window.showToast) showToast('Please select an image or PDF file.', 'error');
                return;
            }
            // Warn on huge images
            if (isImage) {
                const tempImg = new Image();
                const url = URL.createObjectURL(file);
                tempImg.onload = () => {
                    if (tempImg.naturalWidth > 5000) {
                        if (window.showToast) showToast('Image is very large (>5000 px wide) — OCR may be slow.', 'warning');
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

        // ── OCR execution ─────────────────────────────────────────────────────
        runBtn.addEventListener('click', async () => {
            if (!currentFile) return;

            runBtn.disabled = true;
            runBtn.textContent = '⏳ Recognising…';
            progressWrap.classList.remove('hidden');
            progressBar.style.width = '0%';
            progressLabel.textContent = 'Loading OCR engine (first use may take ~10 s)…';
            outputSection.classList.add('hidden');
            lastText = '';

            const langCode    = langSel.value;
            const langName    = langSel.options[langSel.selectedIndex].text;
            const startTime   = Date.now();

            // Tesseract logger callback
            const logger = (m) => {
                if (m.status === 'loading tesseract core') {
                    progressLabel.textContent = 'Loading OCR engine…';
                    if (window.showToast) showToast('Loading OCR engine…');
                }
                if (m.status === 'loading language traineddata') {
                    progressLabel.textContent = `Downloading ${langName} language data…`;
                    if (window.showToast) showToast(`Downloading ${langName} language data…`);
                }
                if (m.status === 'initializing api') {
                    progressLabel.textContent = 'Initialising OCR…';
                }
                if (m.status === 'recognizing text') {
                    const pct = Math.round((m.progress || 0) * 100);
                    progressBar.style.width = `${pct}%`;
                    progressLabel.textContent = `Recognising text… ${pct}%`;
                }
            };

            try {
                const isPdf  = currentFile.name.toLowerCase().endsWith('.pdf');
                let fullText = '';

                if (isPdf) {
                    // Lazy-load pdf.js for PDF rendering
                    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                    const buf    = await currentFile.arrayBuffer();
                    const pdfjsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
                    const total  = pdfjsDoc.numPages;

                    // Create one Tesseract worker for all pages
                    const worker = await Tesseract.createWorker(langCode, 1, { logger });

                    for (let pageNum = 1; pageNum <= total; pageNum++) {
                        progressLabel.textContent = `OCR: page ${pageNum} of ${total}…`;
                        progressBar.style.width = `${Math.round(((pageNum - 1) / total) * 100)}%`;

                        const pdfPage  = await pdfjsDoc.getPage(pageNum);
                        const viewport = pdfPage.getViewport({ scale: 2.0 }); // 2× for OCR accuracy
                        const canvas   = document.createElement('canvas');
                        canvas.width   = Math.round(viewport.width);
                        canvas.height  = Math.round(viewport.height);
                        const ctx      = canvas.getContext('2d');
                        ctx.fillStyle  = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        await pdfPage.render({ canvasContext: ctx, viewport }).promise;

                        const { data: { text } } = await worker.recognize(canvas);
                        releaseCanvas(canvas);
                        if (pageNum > 1) fullText += `\n\n--- Page ${pageNum} ---\n\n`;
                        fullText += text;
                    }

                    await worker.terminate();
                    progressBar.style.width = '100%';

                } else {
                    // Single image
                    progressLabel.textContent = 'Initialising OCR engine…';
                    const worker = await Tesseract.createWorker(langCode, 1, { logger });
                    const { data: { text } } = await worker.recognize(currentFile);
                    await worker.terminate();
                    fullText = text;
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
                    const words  = lastText.split(/\s+/).filter(Boolean).length;
                    const chars  = lastText.length;
                    const isPdf  = currentFile.name.toLowerCase().endsWith('.pdf');
                    wordCountEl.textContent = `${words.toLocaleString()} words, ${chars.toLocaleString()} characters`;
                    timeLabelEl.textContent = isPdf
                        ? `OCR complete — ${currentFile && 'all pages'} in ${elapsed} s`
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

        // ── Copy ──────────────────────────────────────────────────────────────
        copyBtn.addEventListener('click', async () => {
            if (!lastText) return;
            try {
                await navigator.clipboard.writeText(lastText);
                if (window.showToast) showToast('Copied to clipboard!');
            } catch (e) {
                if (window.showToast) showToast('Copy failed — try selecting and copying manually.', 'error');
            }
        });

        // ── Download ──────────────────────────────────────────────────────────
        dlBtn.addEventListener('click', () => {
            if (!lastText) return;
            const blob = new Blob([lastText], { type: 'text/plain' });
            downloadBlob(blob, baseName + '.txt');
        });

    } catch (___err) {
        console.error('renderocrtool error:', ___err);
        const warn = document.createElement('div');
        warn.className = 'warning';
        warn.textContent = '⚠️ OCR engine failed to load: ' + ___err.message + '. Check your internet connection and refresh.';
        container.replaceChildren(warn);
    }
}

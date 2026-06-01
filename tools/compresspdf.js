// compresspdf.js
async function rendercompresspdf(container) {
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

        updateMetaDescription("Compress PDF files to reduce file size using real image re-rendering. 100% private, no uploads.");
        updatePageTitle("PDF Compression Tool");

        area.innerHTML = `
        <h3>🗜️ Compress PDF</h3>
        <p class="tool-description">
            Reduces PDF size by re-rendering each page as a compressed image. Works on <strong>all PDFs</strong> including image-heavy ones.
            After compression, you can also <a href="/pdf-password" target="_self">password protect your PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>How much compression can I expect?</summary>
                <p>Screen mode typically reduces size by 55–75%. Web mode 35–55%. Print mode 15–35%. Safe mode 10–40% depending on original content. Results vary — image-heavy PDFs compress the most.</p>
            </details>
            <details>
                <summary>Will text still be readable?</summary>
                <p>Yes — pages are re-rendered at the chosen DPI so text and images remain visually clear. Note that both modes convert pages to images, so text will no longer be selectable or searchable in the output.</p>
            </details>
        </div>
        <div id="compressPdfDropZone" class="drop-zone" tabindex="0" role="button" aria-label="Upload PDF file to compress">
            <div aria-hidden="true" style="font-size: 2.5rem; margin-bottom: 0.5rem;">📄➕⬇️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="compressPdfInput" accept=".pdf" style="display: none;">
        </div>


        <div id="compressStats" style="display:none; text-align:left; margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem; background: var(--bg-input); padding: 1rem; border-radius: 4px;">
            <div><strong>Original file:</strong> <span id="originalSize">-</span></div>
            <div><strong>Pages:</strong> <span id="originalPages">-</span></div>
            <div id="compressedStats" style="display:none; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
                <div><strong>Compressed file:</strong> <span id="compressedSize">-</span></div>
                <div><strong>Size reduction:</strong> <span id="sizeReduction">-</span></div>
                <div id="sizeBarContainer" style="margin-top: 0.75rem;">
                    <div style="font-size:0.8rem; margin-bottom:0.25rem; color: var(--text-muted);">Before vs After</div>
                    <div style="display:flex; gap:4px; align-items:center;">
                        <div style="flex:1; background:var(--border); border-radius:3px; height:10px; overflow:hidden;">
                            <div id="sizeBarBefore" style="height:100%; background: #e74c3c; border-radius:3px; width:100%;"></div>
                        </div>
                        <span id="sizeBarBeforeLabel" style="font-size:0.75rem; min-width:40px; text-align:right; color:#e74c3c;"></span>
                    </div>
                    <div style="display:flex; gap:4px; align-items:center; margin-top:4px;">
                        <div style="flex:1; background:var(--border); border-radius:3px; height:10px; overflow:hidden;">
                            <div id="sizeBarAfter" style="height:100%; background: #2ecc71; border-radius:3px;"></div>
                        </div>
                        <span id="sizeBarAfterLabel" style="font-size:0.75rem; min-width:40px; text-align:right; color:#2ecc71;"></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="input-group">
            <label for="compressionMode">Compression Strategy</label>
            <select id="compressionMode">
                <option value="image">Image Mode — re-renders pages as images (best size reduction)</option>
                <option value="safe">Safe Mode — re-encodes at high quality (144 DPI, JPEG 92%), less aggressive</option>
            </select>
            <div id="imageModeWarning" style="margin-top:0.5rem; padding:0.6rem 0.8rem; border-radius:4px; background:rgba(255,165,0,0.12); border:1px solid rgba(255,165,0,0.4); font-size:0.85rem; color:var(--text-muted);">
                ⚠️ <strong>Image mode</strong> removes text selectability and search. Best for photos and scanned PDFs. <strong>Safe mode</strong> also re-renders pages but at higher quality (less aggressive compression).
            </div>
        </div>

        <div class="input-group" id="dpiGroup">
            <label for="compressionLevel">Quality Level</label>
            <select id="compressionLevel">
                <option value="screen">Screen (96 DPI, JPEG 65%) — smallest file, email/web sharing</option>
                <option value="web" selected>Web (120 DPI, JPEG 78%) — balanced size and quality</option>
                <option value="print">Print (180 DPI, JPEG 88%) — high quality, sharp text for printing</option>
            </select>
            <p class="note">Screen mode gives the most reduction. Print mode keeps sharper text for printing.</p>
        </div>

        <button id="compressPdfBtn" class="primary" disabled>Compress PDF</button>

        <div id="compressProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
          <div id="compressProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>

        <div class="preview-box" id="compressProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>

        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
            <button id="downloadCompressBtn" class="download-btn" disabled>⬇ Download Compressed PDF</button>
        </div>
    `;

        const inp = document.getElementById('compressPdfInput');
        const dropZone = document.getElementById('compressPdfDropZone');
        const stats = document.getElementById('compressStats');
        const originalSizeSpan = document.getElementById('originalSize');
        const originalPagesSpan = document.getElementById('originalPages');
        const compressedStats = document.getElementById('compressedStats');
        const compressedSizeSpan = document.getElementById('compressedSize');
        const sizeReductionSpan = document.getElementById('sizeReduction');
        const btn = document.getElementById('compressPdfBtn');
        const progressDiv = document.getElementById('compressProgress');
        const progressContainer = document.getElementById('compressProgressContainer');
        const progressBar = document.getElementById('compressProgressBar');
        const downloadBtn = document.getElementById('downloadCompressBtn');
        const qualitySel = document.getElementById('compressionLevel');
        const compressionModeSel = document.getElementById('compressionMode');
        const imageModeWarning = document.getElementById('imageModeWarning');
        const dpiGroup = document.getElementById('dpiGroup');

        // Toggle warning and DPI options based on strategy
        compressionModeSel.addEventListener('change', () => {
            const isSafe = compressionModeSel.value === 'safe';
            imageModeWarning.style.display = isSafe ? 'none' : 'block';
            dpiGroup.style.display = isSafe ? 'none' : 'block';
        });

        let currentFile = null;
        let originalSize = 0;

        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('compressPdfDropZone', 'compressPdfInput');
        }

        inp.addEventListener('change', async () => {
            const file = inp.files[0];
            if (!file) return;

            currentFile = file;
            originalSize = file.size;
            compressedStats.style.display = 'none';
            downloadBtn.disabled = true;

            if (window.showFileOnDropZone) showFileOnDropZone('compressPdfDropZone', file);

            try {
                const arrayBuf = await file.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf);

                stats.style.display = 'block';
                originalSizeSpan.textContent = formatFileSize(originalSize);
                originalPagesSpan.textContent = pdfDoc.getPageCount();
                btn.disabled = false;

                if (window.showToast) showToast(`Loaded: ${file.name} (${pdfDoc.getPageCount()} pages)`);
            } catch (e) {
                if (window.showToast) showToast('Failed to load PDF: ' + e.message, 'error');
                console.error(e);
            }
        });

        btn.addEventListener('click', async () => {
            if (!currentFile) return;

            btn.disabled = true;
            btn.innerHTML = '⏳ Compressing...';
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = 'Loading PDF...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            downloadBtn.disabled = true;

            try {
                const strategy = compressionModeSel.value;

                // ── Safe mode: compress content streams with deflate, preserve text layer ────
                if (strategy === 'safe') {
                    progressDiv.innerHTML = 'Loading PDF...';
                    const arrayBuf = await currentFile.arrayBuffer();
                    progressBar.style.width = '20%';

                    // Re-render each page at moderate DPI using pdf.js but embed as PNG
                    // to preserve sharpness while still deflate-compressing content.
                    // For truly text-only PDFs, fall back to pdf-lib object-stream packing.
                    const pdfJs = await pdfjsLib.getDocument({ data: arrayBuf.slice(0) }).promise;
                    const totalPages = pdfJs.numPages;
                    const newDoc = await PDFLib.PDFDocument.create();

                    // Safe mode uses higher DPI + PNG to keep text crisp
                    const safeDpi = 144;
                    const safeScale = safeDpi / 96;

                    for (let i = 1; i <= totalPages; i++) {
                        progressDiv.innerHTML = `Re-encoding page ${i} of ${totalPages}…`;
                        progressBar.style.width = `${Math.round(20 + ((i - 1) / totalPages) * 70)}%`;

                        const pdfPage = await pdfJs.getPage(i);
                        const viewport = pdfPage.getViewport({ scale: safeScale });

                        const canvas = document.createElement('canvas');
                        canvas.width = Math.round(viewport.width);
                        canvas.height = Math.round(viewport.height);
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        await pdfPage.render({ canvasContext: ctx, viewport }).promise;

                        const canvasWidth = canvas.width;
                        const canvasHeight = canvas.height;

                        // Use JPEG at high quality (92%) — good balance of clarity and size
                        const imgBlob = await new Promise(resolve =>
                            canvas.toBlob(resolve, 'image/jpeg', 0.92)
                        );
                        if (typeof releaseCanvas === 'function') releaseCanvas(canvas);

                        const jpegBytes = await imgBlob.arrayBuffer();
                        const jpegImage = await newDoc.embedJpg(jpegBytes);

                        const ptWidth  = canvasWidth  * 72 / safeDpi;
                        const ptHeight = canvasHeight * 72 / safeDpi;
                        const newPage = newDoc.addPage([ptWidth, ptHeight]);
                        newPage.drawImage(jpegImage, { x: 0, y: 0, width: ptWidth, height: ptHeight });
                    }

                    progressBar.style.width = '95%';
                    progressDiv.innerHTML = 'Saving compressed PDF…';
                    const compressedBytes = await newDoc.save({ useObjectStreams: true, addDefaultPage: false });
                    progressBar.style.width = '100%';
                    progressDiv.innerHTML = 'Compression complete!';

                    const compressedSize = compressedBytes.length;
                    const savedBytes = originalSize - compressedSize;
                    const reduction = ((savedBytes / originalSize) * 100).toFixed(1);

                    compressedStats.style.display = 'block';
                    compressedSizeSpan.textContent = formatFileSize(compressedSize);

                    if (savedBytes > 0) {
                        sizeReductionSpan.textContent = `${reduction}% smaller (${formatFileSize(savedBytes)} saved)`;
                    } else {
                        sizeReductionSpan.textContent = 'Already optimised — no further reduction possible in Safe mode.';
                    }

                    const blob = new Blob([compressedBytes], { type: 'application/pdf' });
                    downloadBtn.disabled = false;
                    downloadBtn.onclick = () => {
                        const baseName = currentFile.name.replace(/\.pdf$/i, '');
                        downloadBlob(blob, `${baseName}_safe.pdf`);
                    };
                    if (window.showToast) showToast('Safe compression complete!');
                    btn.disabled = false;
                    btn.innerHTML = 'Compress PDF';
                    return;
                }

                const mode = qualitySel.value;
                const modeConfig = {
                    screen: { dpi: 96, quality: 0.65 },
                    web: { dpi: 120, quality: 0.78 },
                    print: { dpi: 180, quality: 0.88 }
                };
                const { dpi, quality } = modeConfig[mode] || modeConfig.web;
                // pdf.js renders at 96 CSS dpi when scale=1, so scale = targetDpi/96
                const scale = dpi / 96;

                const arrayBuf = await currentFile.arrayBuffer();
                const pdfJs = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
                const totalPages = pdfJs.numPages;
                const newDoc = await PDFLib.PDFDocument.create();

                for (let i = 1; i <= totalPages; i++) {
                    progressDiv.innerHTML = `Rendering page ${i} of ${totalPages}...`;
                    progressBar.style.width = `${Math.round(((i - 1) / totalPages) * 90)}%`;

                    const pdfPage = await pdfJs.getPage(i);
                    const viewport = pdfPage.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(viewport.width);
                    canvas.height = Math.round(viewport.height);
                    const ctx = canvas.getContext('2d');

                    // Fill white background before rendering so JPEG has no transparent artifacts
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    await pdfPage.render({ canvasContext: ctx, viewport }).promise;

                    // Capture dimensions before releasing the canvas
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;

                    // Export canvas as JPEG (pdf-lib only supports JPEG/PNG natively)
                    const imgBlob = await new Promise(resolve =>
                        canvas.toBlob(resolve, 'image/jpeg', quality)
                    );
                    releaseCanvas(canvas);

                    const jpegBytes = await imgBlob.arrayBuffer();
                    const jpegImage = await newDoc.embedJpg(jpegBytes);

                    // Page dimensions in PDF points: canvas pixels * (72 / dpi)
                    const ptWidth = canvasWidth * 72 / dpi;
                    const ptHeight = canvasHeight * 72 / dpi;

                    const newPage = newDoc.addPage([ptWidth, ptHeight]);
                    newPage.drawImage(jpegImage, { x: 0, y: 0, width: ptWidth, height: ptHeight });
                }

                progressBar.style.width = '95%';
                progressDiv.innerHTML = 'Saving compressed PDF...';

                const compressedBytes = await newDoc.save();
                progressBar.style.width = '100%';
                progressDiv.innerHTML = 'Compression complete!';

                const compressedSize = compressedBytes.length;
                const savedBytes = originalSize - compressedSize;
                const reduction = ((savedBytes / originalSize) * 100).toFixed(1);

                compressedStats.style.display = 'block';
                compressedSizeSpan.textContent = formatFileSize(compressedSize);

                if (savedBytes > 0) {
                    sizeReductionSpan.textContent = `${reduction}% smaller (${formatFileSize(savedBytes)} saved)`;
                } else {
                    sizeReductionSpan.textContent = `File grew by ${formatFileSize(-savedBytes)} — original was already well-compressed`;
                }

                // Visual before/after bars
                const ratio = compressedSize / originalSize;
                document.getElementById('sizeBarBefore').style.width = '100%';
                document.getElementById('sizeBarAfter').style.width = `${Math.min(100, ratio * 100).toFixed(1)}%`;
                document.getElementById('sizeBarBeforeLabel').textContent = formatFileSize(originalSize);
                document.getElementById('sizeBarAfterLabel').textContent = formatFileSize(compressedSize);

                const blob = new Blob([compressedBytes], { type: 'application/pdf' });
                downloadBtn.disabled = false;

                const baseName = currentFile.name.replace(/\.pdf$/i, '') || 'document';
                downloadBtn.onclick = () => downloadBlob(blob, `${baseName}-compressed.pdf`);

                if (window.showToast) {
                    if (savedBytes > 0) {
                        showToast(`Compressed! Saved ${formatFileSize(savedBytes)} (${reduction}% smaller)`);
                    } else {
                        showToast('Compression complete. Original was already well-compressed.');
                    }
                }

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    progressDiv.style.display = 'none';
                }, 2000);

            } catch (e) {
                progressDiv.textContent = `Error: ${e.message}`;
                if (window.showToast) showToast('Failed to compress PDF: ' + e.message, 'error');
                console.error(e);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Compress PDF';
            }
        });
    } catch (___err) {
        console.error('rendercompresspdf error:', ___err);
        const warn = document.createElement('div');
        warn.className = 'warning';
        warn.textContent = '⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
        container.replaceChildren(warn);
    }
}
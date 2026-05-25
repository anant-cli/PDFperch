// pdf2jpg.js
async function renderpdf2jpg(container) {
    try {
        await Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
        ]);
        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Extract images from PDF pages. Choose first page, all pages, or a custom range. Download as ZIP. 100% private, no uploads.");
        updatePageTitle("PDF to JPG Converter");

        area.innerHTML = `
        <h3>📸 PDF → JPG</h3>
        <p class="tool-description">
            Extract images from PDF pages. Choose first page, all pages, or a custom range.
            Download individual images or a ZIP file. Perfect for presentations or social media.
            After extraction, you can also <a href="img2png.html" target="_self">convert images to PNG</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <div id="pdfJpgDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕⬇️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="pdf2jpgInput" accept=".pdf" style="display: none;">
        </div>
        <div style="margin:1rem 0;">
            <label><input type="radio" name="pageRange" value="first" checked> First page only</label><br>
            <label><input type="radio" name="pageRange" value="all"> All pages</label><br>
            <label><input type="radio" name="pageRange" value="custom"> Custom range (e.g., 1-3,5,7-9)</label>
            <input type="text" id="customRange" placeholder="1-3,5,7-9" style="margin-top:0.5rem; width:100%; max-width:300px;">
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top: 1rem; margin-bottom: 1.5rem;">
            <div class="input-group">
                <label for="jpgQuality">🖼️ Image Quality</label>
                <select id="jpgQuality">
                    <option value="1.0">Standard (1x) — smaller files</option>
                    <option value="2.0" selected>High (2x) — balanced</option>
                    <option value="3.0">Ultra (3x) — max quality</option>
                </select>
            </div>
            <div class="input-group">
                <label for="outputFormat">📁 Output Format</label>
                <select id="outputFormat">
                    <option value="jpeg">JPEG (smaller, photos)</option>
                    <option value="png">PNG (lossless, text/diagrams)</option>
                </select>
            </div>
        </div>

        <button id="pdf2jpgBtn" class="primary">Convert to JPEG</button>
        
        <div id="jpgProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
          <div id="jpgProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>
        
        <div class="preview-box" id="jpgProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>
        
        <div id="jpgImagePreviews" class="file-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1.5rem;"></div>
        
        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
            <button id="downloadJpgBtn" class="download-btn" disabled>⬇ Download JPG(s)</button>
        </div>
    `;

        const inp = document.getElementById('pdf2jpgInput');
        const dropZone = document.getElementById('pdfJpgDropZone');
        const btn = document.getElementById('pdf2jpgBtn');
        const progressDiv = document.getElementById('jpgProgress');
        const progressContainer = document.getElementById('jpgProgressContainer');
        const progressBar = document.getElementById('jpgProgressBar');
        const previewsDiv = document.getElementById('jpgImagePreviews');
        const qualitySel = document.getElementById('jpgQuality');
        const formatSel  = document.getElementById('outputFormat');
        const downloadBtn = document.getElementById('downloadJpgBtn');
        const firstRadio = document.querySelector('input[name="pageRange"][value="first"]');
        const allRadio = document.querySelector('input[name="pageRange"][value="all"]');
        const customRadio = document.querySelector('input[name="pageRange"][value="custom"]');
        const customInput = document.getElementById('customRange');
        let generatedBlobs = [];

        function updateFormatLabels() {
            const fmt = formatSel.value === 'png' ? 'PNG' : 'JPEG';
            btn.textContent = `Convert to ${fmt}`;
            downloadBtn.textContent = `⬇ Download ${fmt}${generatedBlobs.length > 1 ? 's' : ''}`;
        }
        formatSel.addEventListener('change', updateFormatLabels);
        updateFormatLabels();

        // Setup drag and drop
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('pdfJpgDropZone', 'pdf2jpgInput');
        }

        btn.disabled = true;
        inp.addEventListener("change", () => {
            const file = inp.files[0];
            if (!file) return;
            if (window.showFileOnDropZone) showFileOnDropZone("pdfJpgDropZone", file);
            btn.disabled = false;
        });

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
                    let p = Number(part);
                    if (!isNaN(p) && p >= 1 && p <= totalPages) pages.add(p);
                }
            }
            return Array.from(pages).sort((a, b) => a - b);
        }

        btn.addEventListener('click', async () => {
            const file = inp.files[0];
            if (!file) {
                if (window.showToast) showToast('Please select a PDF file first.', 'warning');
                else alert('Please select a PDF file first.');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '⏳ Loading PDF...';
            if (window.showSpinner) showSpinner('Converting PDF to JPG...');
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = 'Loading PDF...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            previewsDiv.innerHTML = '';
            generatedBlobs = [];
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
                const totalPages = pdf.numPages;
                let pagesToExtract = [];

                if (firstRadio.checked) {
                    pagesToExtract = [1];
                } else if (allRadio.checked) {
                    pagesToExtract = Array.from({ length: totalPages }, (_, i) => i + 1);
                } else if (customRadio.checked) {
                    pagesToExtract = parsePageRange(customInput.value, totalPages);
                    if (pagesToExtract.length === 0) {
                        alert('No valid pages in range, using first page.');
                        pagesToExtract = [1];
                    }
                }

                progressDiv.innerHTML = `Extracting ${pagesToExtract.length} page${pagesToExtract.length === 1 ? '' : 's'}...`;
                const scaleMultiplier = parseFloat(qualitySel.value) || 2.0;
                const fmt = formatSel.value; // 'jpeg' or 'png'
                // Link scale to JPEG quality
                const jpegQualityMap = { '1.0': 0.70, '2.0': 0.85, '3.0': 0.95 };
                const jpegQuality = jpegQualityMap[qualitySel.value] || 0.85;

                for (let i = 0; i < pagesToExtract.length; i++) {
                    const pageNum = pagesToExtract[i];
                    btn.innerHTML = `⏳ Rendering page ${pageNum} (${i + 1}/${pagesToExtract.length})`;
                    progressBar.style.width = `${(i / pagesToExtract.length) * 100}%`;

                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: scaleMultiplier });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d');
                    // White background for JPEG (PNG can be transparent)
                    if (fmt === 'jpeg') {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    const mimeType = fmt === 'png' ? 'image/png' : 'image/jpeg';
                    const blob = await new Promise(r => canvas.toBlob(r, mimeType, fmt === 'jpeg' ? jpegQuality : undefined));
                    const pixelDims = `${canvas.width}×${canvas.height}px`;
                    releaseCanvas(canvas);
                    generatedBlobs.push({ blob, pageNum, pixelDims, fmt });

                    // Add to preview area
                    const previewImg = document.createElement('img');
                    previewImg.src = URL.createObjectURL(blob);
                    previewImg.className = 'preview-box';
                    previewImg.style.width = '100%';
                    previewImg.style.height = 'auto';
                    previewImg.style.margin = '0';
                    previewImg.style.padding = '0.5rem';
                    previewImg.style.display = 'block';
                    previewImg.title = `Page ${pageNum}`;

                    const card = document.createElement('div');
                    card.style.cssText = 'position:relative; display:flex; flex-direction:column; gap:4px;';

                    const label = document.createElement('div');
                    label.textContent = `Page ${pageNum} · ${pixelDims}`;
                    label.style.cssText = 'position:absolute; bottom:34px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.6); color:white; padding:2px 8px; border-radius:12px; font-size:0.75rem; white-space:nowrap;';

                    const ext = fmt === 'png' ? 'png' : 'jpg';
                    const pdfBase2 = inp.files[0] ? inp.files[0].name.replace(/\.pdf$/i,'') : 'page';
                    const dlBtn = document.createElement('button');
                    dlBtn.className = 'secondary';
                    dlBtn.style.cssText = 'font-size:0.75rem; padding:3px 8px; margin:0;';
                    dlBtn.textContent = `⬇ page-${pageNum}.${ext}`;
                    dlBtn.onclick = () => downloadBlob(blob, `${pdfBase2}-page-${pageNum}.${ext}`);

                    card.appendChild(previewImg);
                    card.appendChild(label);
                    card.appendChild(dlBtn);
                    previewsDiv.appendChild(card);
                }

                progressBar.style.width = '100%';
                progressDiv.innerHTML = 'Done!';
                downloadBtn.disabled = false;

                if (window.showToast) showToast(`Successfully extracted ${pagesToExtract.length} pages`);

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    progressDiv.style.display = 'none';
                }, 2000);

            } catch (e) {
                progressDiv.textContent = `Error: ${e.message}`;
                if (window.showToast) showToast('Failed to extract images: ' + e.message, 'error');
                console.error(e);
            } finally {
                btn.disabled = false;
                updateFormatLabels();
                if (window.hideSpinner) hideSpinner();
            }
        });

        downloadBtn.addEventListener('click', async () => {
            if (generatedBlobs.length === 0) return;
            const fmt2 = formatSel.value;
            const ext = fmt2 === 'png' ? 'png' : 'jpg';
            const pdfBase = inp.files[0] ? inp.files[0].name.replace(/\.pdf$/i, '') : 'page';
            if (generatedBlobs.length === 1) {
                downloadBlob(generatedBlobs[0].blob, `${pdfBase}-page-${generatedBlobs[0].pageNum}.${ext}`);
            } else {
                const zip = new JSZip();
                generatedBlobs.forEach(({ blob, pageNum }) => zip.file(`page-${pageNum}.${ext}`, blob));
                const content = await zip.generateAsync({ type: 'blob' });
                downloadBlob(content, `${pdfBase}-pages.zip`);
            }
        });
    } catch (___err) {
        console.error('renderpdf2jpg error:', ___err);
        const warn = document.createElement('div');
        warn.className = 'warning';
        warn.textContent = '⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
        container.replaceChildren(warn);
    }
}

// signpdf.js
async function rendersignpdf(container) {
    try {
        await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Sign PDF documents digitally with text or drawn signatures. Choose ink color and font style. 100% private, no uploads.");
        updatePageTitle("PDF Signing Tool");

        area.innerHTML = `
        <h3>✍️ Sign PDF</h3>
        <p class="tool-description">
            Add digital signatures to your PDF. Type your name in 3 font styles, or draw a freehand signature.
            Choose ink color and placement. All processing happens locally — your file never leaves your device.
            After signing, you can also <a href="pdfencrypt.html" target="_self">password protect your PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>What signature types are available?</summary>
                <p>Type your name (in Helvetica, Times Roman, or Courier) or draw a freehand signature with mouse or touch.</p>
            </details>
            <details>
                <summary>Are these legally binding signatures?</summary>
                <p>These are visual signatures for informal use. For legally binding e-signatures use certified services.</p>
            </details>
        </div>
        <div id="signPdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕✍️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="signPdfInput" accept=".pdf" style="display: none;">
        </div>

        <div id="signOptions" style="display:none; margin-bottom: 1rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
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
                        <option value="black">⬛ Black</option>
                        <option value="blue">🔵 Blue (Ink)</option>
                        <option value="red">🔴 Red</option>
                    </select>
                </div>
            </div>

            <div id="textSignatureGroup" class="input-group">
                <label for="signatureText">Your Name</label>
                <input type="text" id="signatureText" placeholder="Enter your full name" maxlength="60">
                <div style="margin-top: 0.5rem;">
                    <label for="signatureFont" style="font-size:0.85rem; color: var(--text-muted);">Font Style</label>
                    <select id="signatureFont" style="margin-top:0.25rem;">
                        <option value="Helvetica">Helvetica — Clean &amp; Modern</option>
                        <option value="TimesRoman">Times Roman — Formal &amp; Traditional</option>
                        <option value="Courier">Courier — Typewriter Style</option>
                    </select>
                </div>
            </div>

            <div id="drawSignatureGroup" class="input-group" style="display:none;">
                <label>Draw your signature below</label>
                <div style="margin-bottom: 0.75rem; display: flex; gap: 0.5rem;">
                    <label style="font-size:0.85rem; color: var(--text-muted); flex: 1; display: flex; align-items: center;">
                        <input type="range" id="penSize" min="1" max="8" value="2" style="flex: 1;">
                        Pen Size: <span id="penSizeValue">2</span>px
                    </label>
                </div>
                <canvas id="signatureCanvas" width="500" height="150"
                    style="border: 2px solid var(--accent); border-radius: 4px; cursor: crosshair; max-width: 100%; display: block; touch-action: none; background: var(--surface-strong);"></canvas>
                <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                    <button id="clearSignature" class="secondary" type="button">🗑️ Clear</button>
                    <button id="undoSignature" class="secondary" type="button">↶ Undo</button>
                    <button id="redoSignature" class="secondary" type="button">↷ Redo</button>
                </div>
            </div>

            <div id="imageSignatureGroup" class="input-group" style="display:none;">
                <label>Upload Signature Image (PNG/JPG with transparent or white background)</label>
                <input type="file" id="sigImgInput" accept="image/png,image/jpeg,image/gif,image/webp" style="margin-top:0.5rem;">
                <canvas id="sigImgPreview" width="500" height="150"
                    style="display:none; border: 2px solid var(--accent); border-radius: 4px; max-width: 100%; margin-top:0.5rem; background: var(--surface-strong);"></canvas>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <div class="input-group">
                    <label for="signaturePosition">Position on Page</label>
                    <select id="signaturePosition">
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="signaturePage">Pages to Sign</label>
                    <select id="signaturePage">
                        <option value="last">Last Page Only</option>
                        <option value="first">First Page Only</option>
                        <option value="all">All Pages</option>
                    </select>
                    <p class="note" id="pageInfo"></p>
                </div>
            </div>
            <div class="input-group" style="margin-top: 1rem;">
                <label for="signatureScale">Signature Size</label>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <input type="range" id="signatureScale" min="0.5" max="2" step="0.1" value="1" style="flex: 1;">
                    <span id="scaleValue" style="min-width: 50px; text-align: right;">100%</span>
                </div>
            </div>
                <div id="placementHelper" class="preview-box" style="padding: 1rem; margin-top:1rem;">
                    <div style="font-weight:700; margin-bottom:0.75rem;">Signature placement preview</div>
                    <div style="display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:0.5rem;">
                        <div class="placement-cell" data-position="top-left" style="border:1px solid var(--border-subtle); border-radius:0.75rem; padding:0.75rem; text-align:center;">Top Left</div>
                        <div class="placement-cell" data-position="top-right" style="border:1px solid var(--border-subtle); border-radius:0.75rem; padding:0.75rem; text-align:center;">Top Right</div>
                        <div class="placement-cell" data-position="bottom-left" style="border:1px solid var(--border-subtle); border-radius:0.75rem; padding:0.75rem; text-align:center;">Bottom Left</div>
                        <div class="placement-cell" data-position="bottom-right" style="border:1px solid var(--border-subtle); border-radius:0.75rem; padding:0.75rem; text-align:center;">Bottom Right</div>
                    </div>
                    <p class="note" style="margin-top:0.75rem;">The signature will be placed in the selected corner on the chosen page(s).</p>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; margin-top:1.5rem;">
                    <button id="signPdfBtn" class="primary" type="button">Sign PDF</button>
                    <button id="downloadSignBtn" class="secondary" type="button" disabled>Download Signed PDF</button>
                </div>
                <div id="signProgressContainer" style="display:none; margin-top:1rem;">
                    <div id="signProgressText" style="margin-bottom:0.5rem; color: var(--text-muted);">Ready to sign your PDF.</div>
                    <div style="background: var(--surface-strong); border-radius: 999px; overflow:hidden; height: 0.75rem;">
                        <div id="signProgressBar" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.25s ease;"></div>
                    </div>
                </div>
            `;
        const progressContainer = document.getElementById('signProgressContainer');
        const progressBar = document.getElementById('signProgressBar');
        const progressDiv = document.getElementById('signProgressText');
        const downloadBtn = document.getElementById('downloadSignBtn');
        const btn = document.getElementById('signPdfBtn');
        const sigTypeSel = document.getElementById('signatureType');
        const sigColorSel = document.getElementById('signatureColor');
        const sigFontSel = document.getElementById('signatureFont');
        const textSigGroup = document.getElementById('textSignatureGroup');
        const drawSigGroup = document.getElementById('drawSignatureGroup');
        const imgSigGroup = document.getElementById('imageSignatureGroup');
        const sigImgInput = document.getElementById('sigImgInput');
        const sigImgPreview = document.getElementById('sigImgPreview');
        let uploadedSigImage = null; // stores HTMLImageElement for the uploaded signature
        const textInput = document.getElementById('signatureText');
        const canvas = document.getElementById('signatureCanvas');
        const clearBtn = document.getElementById('clearSignature');
        const positionSel = document.getElementById('signaturePosition');
        const pageSel = document.getElementById('signaturePage');
        const dropZone = document.getElementById('signPdfDropZone');
        const inp = document.getElementById('signPdfInput');
        const options = document.getElementById('signOptions');
        const penSizeInput = document.getElementById('penSize');
        const penSizeValue = document.getElementById('penSizeValue');
        const undoBtn = document.getElementById('undoSignature');
        const redoBtn = document.getElementById('redoSignature');
        const scaleSel = document.getElementById('signatureScale');
        const scaleValue = document.getElementById('scaleValue');
        const pageInfo = document.getElementById('pageInfo');

        let currentFile = null;
        let isDrawing = false;
        const ctx = canvas.getContext('2d');

        // Canvas color helper
        function getDrawColor() {
            const map = { black: '#000000', blue: '#00008B', red: '#CC0000' };
            return map[sigColorSel.value] || '#000000';
        }

        function setupCtx() {
            ctx.strokeStyle = getDrawColor();
            ctx.lineWidth = penSizeInput.value;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        setupCtx();
        sigColorSel.addEventListener('change', setupCtx);
        penSizeInput.addEventListener('input', setupCtx);

        const placementCells = Array.from(document.querySelectorAll('#placementHelper .placement-cell'));
        
        // Undo/Redo system for drawn signatures
        let drawingHistory = [];
        let historyIndex = -1;
        
        function saveDrawingState() {
            historyIndex++;
            if (historyIndex < drawingHistory.length) {
                drawingHistory = drawingHistory.slice(0, historyIndex);
            }
            drawingHistory.push(canvas.toDataURL());
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
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    updateHistoryButtons();
                };
            }
        });
        
        redoBtn.addEventListener('click', () => {
            if (historyIndex < drawingHistory.length - 1) {
                historyIndex++;
                const img = new Image();
                img.src = drawingHistory[historyIndex];
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    updateHistoryButtons();
                };
            }
        });
        
        function updatePlacementPreview() {
            placementCells.forEach(cell => {
                const active = cell.dataset.position === positionSel.value;
                cell.style.background = active ? 'rgba(255,255,255,0.08)' : 'transparent';
                cell.style.borderColor = active ? 'var(--accent)' : 'var(--border-subtle)';
                cell.style.cursor = 'pointer';
            });
        }
        
        function updatePageInfo() {
            if (!currentFile) return;
            if (pageSel.value === 'all') {
                pageInfo.textContent = '✓ All pages will be signed';
            } else if (pageSel.value === 'first') {
                pageInfo.textContent = '✓ First page will be signed';
            } else {
                pageInfo.textContent = '✓ Last page will be signed';
            }
        }
        
        placementCells.forEach(cell => {
            cell.addEventListener('click', () => {
                positionSel.value = cell.dataset.position;
                updatePlacementPreview();
            });
        });
        positionSel.addEventListener('change', updatePlacementPreview);
        pageSel.addEventListener('change', updatePageInfo);
        
        penSizeInput.addEventListener('change', (e) => {
            ctx.lineWidth = e.target.value;
            penSizeValue.textContent = e.target.value;
        });
        
        scaleSel.addEventListener('change', (e) => {
            scaleValue.textContent = Math.round(e.target.value * 100) + '%';
        });
        
        updatePlacementPreview();

        // Mouse drawing (corrected for canvas scaling)
        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const sx = canvas.width / rect.width;
            const sy = canvas.height / rect.height;
            return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
        }

        canvas.addEventListener('mousedown', e => {
            isDrawing = true;
            setupCtx();
            ctx.beginPath();
            const p = getPos(e);
            ctx.moveTo(p.x, p.y);
            // Save state when starting to draw
            if (historyIndex < 0) {
                saveDrawingState();
            }
        });
        canvas.addEventListener('mousemove', e => {
            if (!isDrawing) return;
            const p = getPos(e);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        });
        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
            saveDrawingState();
        });
        canvas.addEventListener('mouseleave', () => isDrawing = false);

        // Touch drawing
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            isDrawing = true;
            setupCtx();
            ctx.beginPath();
            const rect = canvas.getBoundingClientRect();
            const sx = canvas.width / rect.width;
            const sy = canvas.height / rect.height;
            const t = e.touches[0];
            ctx.moveTo((t.clientX - rect.left) * sx, (t.clientY - rect.top) * sy);
        }, { passive: false });
        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const sx = canvas.width / rect.width;
            const sy = canvas.height / rect.height;
            const t = e.touches[0];
            ctx.lineTo((t.clientX - rect.left) * sx, (t.clientY - rect.top) * sy);
            ctx.stroke();
        }, { passive: false });
        canvas.addEventListener('touchend', () => {
            isDrawing = false;
            saveDrawingState();
        });

        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawingHistory = [];
            historyIndex = -1;
            updateHistoryButtons();
        });

        // Drop zone
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') setupDropZone('signPdfDropZone', 'signPdfInput');

        // Signature type toggle
        sigTypeSel.addEventListener('change', () => {
            const val = sigTypeSel.value;
            textSigGroup.style.display = val === 'text' ? 'block' : 'none';
            drawSigGroup.style.display = val === 'draw' ? 'block' : 'none';
            imgSigGroup.style.display  = val === 'image' ? 'block' : 'none';
        });

        // Image signature upload preview
        sigImgInput.addEventListener('change', () => {
            const file = sigImgInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    uploadedSigImage = img;
                    // Draw preview on canvas
                    const maxW = 500, maxH = 150;
                    const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
                    sigImgPreview.width = Math.round(img.width * ratio);
                    sigImgPreview.height = Math.round(img.height * ratio);
                    sigImgPreview.style.display = 'block';
                    const ctx = sigImgPreview.getContext('2d');
                    ctx.clearRect(0, 0, sigImgPreview.width, sigImgPreview.height);
                    ctx.drawImage(img, 0, 0, sigImgPreview.width, sigImgPreview.height);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        // File loaded
        inp.addEventListener('change', async () => {
            const file = inp.files[0];
            if (!file) return;
            currentFile = file;
            if (window.showFileOnDropZone) showFileOnDropZone('signPdfDropZone', file);
            options.style.display = 'block';
            downloadBtn.disabled = true;
            btn.disabled = false;
            
            // Load PDF to get page count
            try {
                const arrayBuf = await file.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf);
                const pageCount = pdfDoc.getPageCount();
                pageInfo.textContent = `✓ PDF has ${pageCount} page${pageCount !== 1 ? 's' : ''} • ${pageSel.value === 'all' ? 'All pages' : pageSel.value === 'first' ? 'First page' : 'Last page'} will be signed`;
            } catch (e) {
                pageInfo.textContent = '✓ PDF loaded';
            }
            
            if (window.showToast) showToast(`Loaded: ${file.name}`);
        });

        // Sign button
        btn.addEventListener('click', async () => {
            if (!currentFile) return;

            // Validate
            if (sigTypeSel.value === 'text' && !textInput.value.trim()) {
                if (window.showToast) showToast('Please enter your name', 'error');
                return;
            }
            if (sigTypeSel.value === 'draw') {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                if (!imgData.data.some(v => v !== 0)) {
                    if (window.showToast) showToast('✏️ Please draw a signature first', 'error');
                    return;
                }
            }
            if (sigTypeSel.value === 'image' && !uploadedSigImage) {
                if (window.showToast) showToast('Please upload a signature image first', 'error');
                return;
            }
            
            if (sigTypeSel.value === 'text' && sigColorSel.value === 'red') {
                if (window.showToast) showToast('ℹ️ Red signatures are often used to indicate rejection or revision');
            }

            btn.disabled = true;
            btn.innerHTML = '⏳ Signing...';
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = 'Loading PDF...';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await currentFile.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf);
                const { StandardFonts } = PDFLib;
                progressBar.style.width = '30%';

                const pdfColorMap = {
                    black: PDFLib.rgb(0, 0, 0),
                    blue:  PDFLib.rgb(0, 0, 0.55),
                    red:   PDFLib.rgb(0.8, 0, 0)
                };
                const sigColor = pdfColorMap[sigColorSel.value] || pdfColorMap.black;

                const allPages = pdfDoc.getPages();
                let targetPages;
                if (pageSel.value === 'first') targetPages = [allPages[0]];
                else if (pageSel.value === 'all') targetPages = allPages;
                else targetPages = [allPages[allPages.length - 1]];

                progressBar.style.width = '50%';
                progressDiv.innerHTML = 'Embedding signature...';

                const margin = 40;
                const fontSize = 22;

                for (const page of targetPages) {
                    const { width, height } = page.getSize();

                    if (sigTypeSel.value === 'text') {
                        const text = textInput.value.trim();
                        const fontMap = {
                            'Helvetica':  StandardFonts.Helvetica,
                            'TimesRoman': StandardFonts.TimesRoman,
                            'Courier':    StandardFonts.Courier
                        };
                        const font = await pdfDoc.embedFont(fontMap[sigFontSel.value] || StandardFonts.Helvetica);
                        const textWidth  = font.widthOfTextAtSize(text, fontSize);
                        const textHeight = font.heightAtSize(fontSize);

                        let x, y;
                        switch (positionSel.value) {
                            case 'bottom-right': x = width - textWidth - margin;  y = margin; break;
                            case 'bottom-left':  x = margin;                       y = margin; break;
                            case 'top-right':    x = width - textWidth - margin;  y = height - textHeight - margin; break;
                            case 'top-left':     x = margin;                       y = height - textHeight - margin; break;
                            default:             x = margin;                       y = margin;
                        }
                        page.drawText(text, { x, y, size: fontSize, font, color: sigColor });

                    } else if (sigTypeSel.value === 'image') {
                        // Uploaded image signature
                        const imgCanvas = document.createElement('canvas');
                        imgCanvas.width = uploadedSigImage.width;
                        imgCanvas.height = uploadedSigImage.height;
                        const imgCtx = imgCanvas.getContext('2d');
                        imgCtx.drawImage(uploadedSigImage, 0, 0);
                        const dataUrl = imgCanvas.toDataURL('image/png');
                        const sigBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
                        const sigEmbed = await pdfDoc.embedPng(sigBytes);

                        let sigW = Math.min(200, width / 3);
                        sigW = sigW * parseFloat(scaleSel.value);
                        const sigH = (sigEmbed.height / sigEmbed.width) * sigW;

                        let x, y;
                        switch (positionSel.value) {
                            case 'bottom-right': x = width - sigW - margin;  y = margin; break;
                            case 'bottom-left':  x = margin;                  y = margin; break;
                            case 'top-right':    x = width - sigW - margin;  y = height - sigH - margin; break;
                            case 'top-left':     x = margin;                  y = height - sigH - margin; break;
                            default:             x = margin;                  y = margin;
                        }
                        page.drawImage(sigEmbed, { x, y, width: sigW, height: sigH });

                    } else {
                        const dataUrl = canvas.toDataURL('image/png');
                        const sigBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
                        const sigEmbed = await pdfDoc.embedPng(sigBytes);

                        let sigW = Math.min(200, width / 3);
                        sigW = sigW * parseFloat(scaleSel.value);
                        const sigH = (sigEmbed.height / sigEmbed.width) * sigW;

                        let x, y;
                        switch (positionSel.value) {
                            case 'bottom-right': x = width - sigW - margin;  y = margin; break;
                            case 'bottom-left':  x = margin;                  y = margin; break;
                            case 'top-right':    x = width - sigW - margin;  y = height - sigH - margin; break;
                            case 'top-left':     x = margin;                  y = height - sigH - margin; break;
                            default:             x = margin;                  y = margin;
                        }
                        page.drawImage(sigEmbed, { x, y, width: sigW, height: sigH });
                    }
                }

                progressBar.style.width = '90%';
                progressDiv.innerHTML = 'Saving...';
                const signedBytes = await pdfDoc.save();
                const blob = new Blob([signedBytes], { type: 'application/pdf' });

                progressBar.style.width = '100%';
                progressDiv.innerHTML = 'Signing complete!';
                downloadBtn.disabled = false;

                const signBase = currentFile.name.replace(/\.pdf$/i, '') || 'document';
                downloadBtn.onclick = () => downloadBlob(blob, `${signBase}-signed.pdf`);

                if (window.showToast) showToast('✅ PDF signed successfully!', 'success');
                downloadBtn.style.animation = 'pulse 0.5s ease 2';

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    progressDiv.style.display = 'none';
                }, 2500);

            } catch (e) {
                progressDiv.innerHTML = `❌ Error: ${e.message}`;
                if (window.showToast) showToast('❌ Failed to sign PDF: ' + e.message, 'error');
                console.error(e);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Sign PDF';
            }
        });

    } catch (___err) {
        console.error('rendersignpdf error:', ___err);
        const warn = document.createElement('div');
        warn.className = 'warning';
        warn.textContent = '⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
        container.replaceChildren(warn);
    }
}
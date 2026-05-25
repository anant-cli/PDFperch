// signpdf.js — Visual Drag-and-Resize PDF Signature Editor
async function rendersignpdf(container) {
    try {
        const PDFJS_URL    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const PDFLIB_URL   = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

        await Promise.all([loadScript(PDFLIB_URL), loadScript(PDFJS_URL)]);
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription("Sign PDF documents digitally with drag-and-resize signature placement. 100% private, no uploads, works on touch screen devices.");
        updatePageTitle("Visual PDF Signer");

        area.innerHTML = `
        <h3>✍️ Visual Sign PDF</h3>
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

        <div id="signPdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📄✍️</div>
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
                        <option value="blue">🔵 Blue</option>
                        <option value="red">🔴 Red</option>
                    </select>
                </div>
            </div>

            <!-- TYPE NAME GROUP -->
            <div id="textSignatureGroup" class="input-group">
                <label for="signatureText">Your Name</label>
                <input type="text" id="signatureText" placeholder="Enter your full name" maxlength="60" value="John Doe">
                <div style="margin-top: 0.5rem;">
                    <label for="signatureFont" style="font-size:0.85rem; color: var(--text-muted);">Font Style</label>
                    <select id="signatureFont" style="margin-top:0.25rem;">
                        <option value="Helvetica">Helvetica — Clean &amp; Modern</option>
                        <option value="TimesRoman">Times Roman — Formal &amp; Traditional</option>
                        <option value="Courier">Courier — Typewriter Style</option>
                    </select>
                </div>
            </div>

            <!-- DRAW SIGNATURE GROUP -->
            <div id="drawSignatureGroup" class="input-group" style="display:none;">
                <label>Draw your signature below</label>
                <div style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center;">
                    <label style="font-size:0.85rem; color: var(--text-muted); flex: 1; display: flex; align-items: center; gap: 0.5rem;">
                        <input type="range" id="penSize" min="1" max="8" value="2" style="flex: 1;">
                        <span>Pen: <span id="penSizeValue">2</span>px</span>
                    </label>
                </div>
                <canvas id="signatureCanvas" width="500" height="150"
                    style="border: 2px solid var(--accent); border-radius: 6px; cursor: crosshair; max-width: 100%; display: block; touch-action: none; background: #0f1623;"></canvas>
                <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                    <button id="clearSignature" class="secondary" type="button" style="min-width:unset; padding:0.5rem 1rem;">🗑️ Clear</button>
                    <button id="undoSignature" class="secondary" type="button" style="min-width:unset; padding:0.5rem 1rem;">↶ Undo</button>
                    <button id="redoSignature" class="secondary" type="button" style="min-width:unset; padding:0.5rem 1rem;">↷ Redo</button>
                </div>
            </div>

            <!-- UPLOAD IMAGE GROUP -->
            <div id="imageSignatureGroup" class="input-group" style="display:none;">
                <label>Upload Signature Image (PNG/JPG)</label>
                <input type="file" id="sigImgInput" accept="image/png,image/jpeg,image/webp" style="margin-top:0.5rem;">
                <canvas id="sigImgPreview" width="500" height="150"
                    style="display:none; border: 2px solid var(--accent); border-radius: 6px; max-width: 100%; margin-top:0.5rem; background: #0f1623;"></canvas>
            </div>

            <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-top: 1rem;">
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

            <!-- INTERACTIVE PLACEMENT VIEWER -->
            <div id="placementHelper" class="preview-box" style="padding: 1.25rem; margin-top:1.5rem; background: var(--bg-card);">
                <div style="font-weight:700; margin-bottom:0.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap:wrap; gap: 0.5rem;">
                    <span>📍 Signature Placement (Drag &amp; Resize)</span>
                    <span id="placementPageLabel" style="font-size:0.8rem; color:var(--text-muted); font-weight:500;">No PDF loaded</span>
                </div>
                
                <div id="visualPlacementWrapper" style="display:none; flex-direction:column; align-items:center; gap:0.5rem; width:100%;">
                    <div id="pdfPlacementViewer" style="position:relative; max-width:100%; border:1px solid var(--border-subtle); border-radius:var(--r-md); background:var(--bg-input); padding: 1.5rem; display:flex; justify-content:center; overflow:auto; max-height:480px; width:100%;">
                        <div id="pagePreviewContainer" style="position:relative; box-shadow:var(--shadow-lg); border-radius:4px; display:inline-block; user-select:none;">
                            <canvas id="pdfPageCanvas" style="display:block; max-width:100%; border-radius:4px; background:#ffffff;"></canvas>
                            <div id="floatingSignature" style="position:absolute; left:40px; top:40px; width:150px; height:60px; border:2px dashed var(--accent); background:rgba(79, 158, 255, 0.15); cursor:move; user-select:none; box-sizing:border-box; display:flex; align-items:center; justify-content:center; touch-action:none; transform-origin: top left;">
                                <div id="floatingSigContent" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; pointer-events:none; padding:4px; box-sizing:border-box;">
                                    <span style="color:var(--accent); font-size:0.9rem; font-weight:bold;">John Doe</span>
                                </div>
                                <div class="sig-resize-handle" style="position:absolute; right:-5px; bottom:-5px; width:12px; height:12px; background:var(--accent); border-radius:50%; cursor:se-resize; touch-action:none; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>
                            </div>
                        </div>
                    </div>
                    <p class="note" style="text-align:center; margin-top:0.25rem;">Drag signature to move, drag bottom-right blue handle to resize.</p>
                </div>
                
                <div id="placementPlaceholder" style="text-align:center; padding:3rem 1rem; color:var(--text-muted); font-size:0.9rem;">
                    📄 Drag or select a PDF above to position your signature interactively
                </div>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; margin-top:1.5rem;">
                <button id="signPdfBtn" class="primary" type="button" style="flex:1;">Sign PDF</button>
                <button id="downloadSignBtn" class="download-btn" type="button" style="flex:1;" disabled>Download Signed PDF</button>
            </div>

            <div id="signProgressContainer" style="display:none; margin-top:1rem;">
                <div id="signProgressText" style="margin-bottom:0.5rem; color: var(--text-muted); font-size:0.875rem;">Signing...</div>
                <div style="background: var(--bg-input); border-radius: 999px; overflow:hidden; height: 6px; border:1px solid var(--border-subtle);">
                    <div id="signProgressBar" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.25s ease;"></div>
                </div>
            </div>
        </div>
        `;

        // ── DOM refs ──────────────────────────────────────────────────────────
        const dropZone          = document.getElementById('signPdfDropZone');
        const inp               = document.getElementById('signPdfInput');
        const options           = document.getElementById('signOptions');
        const sigTypeSel        = document.getElementById('signatureType');
        const sigColorSel       = document.getElementById('signatureColor');
        const sigFontSel        = document.getElementById('signatureFont');
        const textSigGroup      = document.getElementById('textSignatureGroup');
        const drawSigGroup      = document.getElementById('drawSignatureGroup');
        const imgSigGroup       = document.getElementById('imageSignatureGroup');
        const sigImgInput       = document.getElementById('sigImgInput');
        const sigImgPreview     = document.getElementById('sigImgPreview');
        const textInput         = document.getElementById('signatureText');
        const drawCanvas        = document.getElementById('signatureCanvas');
        const clearBtn          = document.getElementById('clearSignature');
        const pageSel           = document.getElementById('signaturePage');
        const penSizeInput      = document.getElementById('penSize');
        const penSizeValue      = document.getElementById('penSizeValue');
        const undoBtn           = document.getElementById('undoSignature');
        const redoBtn           = document.getElementById('redoSignature');
        const pageInfo          = document.getElementById('pageInfo');
        const signBtn           = document.getElementById('signPdfBtn');
        const downloadBtn       = document.getElementById('downloadSignBtn');
        const progressCon       = document.getElementById('signProgressContainer');
        const progressBar       = document.getElementById('signProgressBar');
        const progressText      = document.getElementById('signProgressText');
        const placementWrap     = document.getElementById('visualPlacementWrapper');
        const placementPlace    = document.getElementById('placementPlaceholder');
        const placementPageLabel= document.getElementById('placementPageLabel');
        const pdfPageCanvas     = document.getElementById('pdfPageCanvas');
        const previewContainer  = document.getElementById('pagePreviewContainer');
        const sigEl             = document.getElementById('floatingSignature');
        const sigContent        = document.getElementById('floatingSigContent');
        const resizeHandle      = sigEl.querySelector('.sig-resize-handle');

        // State
        let currentFile         = null;
        let originalBuffer      = null;
        let pdfjsDoc            = null;
        let isDrawing           = false;
        let uploadedSigImage    = null;
        let drawingHistory      = [];
        let historyIndex        = -1;
        const dCtx              = drawCanvas.getContext('2d');

        // Dimensions for placement calculations
        let displayW = 0, displayH = 0;
        let pdfW = 0, pdfH = 0;
        let sigAspectRatio = 2.5;

        // ── Drawing Setup ─────────────────────────────────────────────────────
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

        // Drawing events (mouse)
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

        // Drawing events (touch)
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

        // Undo / Redo / Clear
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

        // ── Drop zone / Load File ─────────────────────────────────────────────
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') setupDropZone('signPdfDropZone', 'signPdfInput');

        inp.addEventListener('change', async () => {
            const file = inp.files[0];
            if (!file) return;

            // Validate size
            if (typeof validateFile === 'function') {
                if (!validateFile(file).valid) return;
            }

            currentFile = file;
            if (window.showFileOnDropZone) showFileOnDropZone('signPdfDropZone', file);
            
            try {
                if (window.showSpinner) showSpinner('Reading document…');
                originalBuffer = await file.arrayBuffer();
                
                // Set up PDFJS
                const dataArray = new Uint8Array(originalBuffer);
                pdfjsDoc = await pdfjsLib.getDocument({ data: dataArray }).promise;
                
                options.style.display = 'block';
                placementPlace.style.display = 'none';
                placementWrap.style.display = 'flex';
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
            pageInfo.textContent = `✓ Signature will be placed on ${targetText}.`;
        }

        // ── Render Placement Canvas ───────────────────────────────────────────
        async function renderPagePreview() {
            if (!pdfjsDoc) return;
            
            try {
                // Determine which page to render visually
                const total = pdfjsDoc.numPages;
                const pageNum = pageSel.value === 'first' ? 1 : total;

                placementPageLabel.textContent = `Rendering page preview (${pageNum}/${total})…`;

                const page = await pdfjsDoc.getPage(pageNum);
                
                // Size placement box responsively
                const viewerW = document.getElementById('pdfPlacementViewer').clientWidth;
                const maxDisplayW = Math.min(480, viewerW - 48); // accounting for paddings
                const originalViewport = page.getViewport({ scale: 1.0 });
                const scale = maxDisplayW / originalViewport.width;
                const viewport = page.getViewport({ scale });

                pdfPageCanvas.width = Math.round(viewport.width);
                pdfPageCanvas.height = Math.round(viewport.height);

                const renderCtx = pdfPageCanvas.getContext('2d');
                renderCtx.fillStyle = '#ffffff';
                renderCtx.fillRect(0, 0, pdfPageCanvas.width, pdfPageCanvas.height);

                await page.render({ canvasContext: renderCtx, viewport }).promise;

                // Cache dimensions
                displayW = pdfPageCanvas.width;
                displayH = pdfPageCanvas.height;
                pdfW = originalViewport.width;
                pdfH = originalViewport.height;

                placementPageLabel.textContent = `Page ${pageNum} of ${total}`;

                // Set container sizes
                previewContainer.style.width = displayW + 'px';
                previewContainer.style.height = displayH + 'px';
            } catch (e) {
                console.error('Failed rendering placement page preview:', e);
                placementPageLabel.textContent = 'Preview error';
            }
        }

        // ── Drag & Resize Sign Block Logic ────────────────────────────────────
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
            // Do not fire if dragging target is an action button
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
                // Constraints
                left = Math.max(0, Math.min(left, displayW - sigEl.clientWidth));
                top = Math.max(0, Math.min(top, displayH - sigEl.clientHeight));
                sigEl.style.left = left + 'px';
                sigEl.style.top = top + 'px';
            } else if (isResizing) {
                let w = startW + dx;
                // Min/Max widths
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

        // ── Real-time signature visual preview update ─────────────────────────
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
                    sigContent.innerHTML = `<span style="color:var(--accent); font-size:0.8rem; font-weight:500; text-align:center;">📄 Upload Signature</span>`;
                    sigAspectRatio = 2.5;
                }
            }

            // Adjust box aspect ratio
            const currentW = sigEl.clientWidth;
            sigEl.style.height = Math.round(currentW / sigAspectRatio) + 'px';
        }

        // Listeners for visual signature inputs
        textInput.addEventListener('input', updateVisualSigPreview);
        sigTypeSel.addEventListener('change', () => {
            const val = sigTypeSel.value;
            textSigGroup.style.display = val === 'text' ? 'block' : 'none';
            drawSigGroup.style.display = val === 'draw' ? 'block' : 'none';
            imgSigGroup.style.display  = val === 'image' ? 'block' : 'none';
            updateVisualSigPreview();
        });
        sigFontSel.addEventListener('change', updateVisualSigPreview);

        // Upload custom image
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
                    sigImgPreview.style.display = 'block';
                    const ctx = sigImgPreview.getContext('2d');
                    ctx.clearRect(0, 0, sigImgPreview.width, sigImgPreview.height);
                    ctx.drawImage(img, 0, 0, sigImgPreview.width, sigImgPreview.height);
                    updateVisualSigPreview();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        // ── Sign and Render compilation ───────────────────────────────────────
        signBtn.addEventListener('click', async () => {
            if (!currentFile || !pdfjsDoc) return;

            // Validations
            if (sigTypeSel.value === 'text' && !textInput.value.trim()) {
                if (window.showToast) showToast('Please enter your name', 'error');
                return;
            }
            if (sigTypeSel.value === 'draw') {
                const imgData = dCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
                if (!imgData.data.some(v => v !== 0)) {
                    if (window.showToast) showToast('✏️ Please draw a signature first', 'error');
                    return;
                }
            }
            if (sigTypeSel.value === 'image' && !uploadedSigImage) {
                if (window.showToast) showToast('Please upload a signature image first', 'error');
                return;
            }

            signBtn.disabled = true;
            signBtn.innerHTML = '⏳ Signing…';
            progressCon.style.display = 'block';
            progressBar.style.width = '0%';
            progressText.textContent = 'Reading original PDF…';
            downloadBtn.disabled = true;

            try {
                const arrayBuf = await currentFile.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf);
                const { StandardFonts } = PDFLib;
                progressBar.style.width = '30%';

                const pdfColorMap = {
                    black: PDFLib.rgb(0, 0, 0),
                    blue:  PDFLib.rgb(0.03, 0.23, 0.65),
                    red:   PDFLib.rgb(0.8, 0.05, 0.05)
                };
                const sigColor = pdfColorMap[sigColorSel.value] || pdfColorMap.black;

                const allPages = pdfDoc.getPages();
                let targetPages;
                if (pageSel.value === 'first') targetPages = [allPages[0]];
                else if (pageSel.value === 'all') targetPages = allPages;
                else targetPages = [allPages[allPages.length - 1]];

                progressBar.style.width = '60%';
                progressText.textContent = 'Positioning signature precisely…';

                // Calculate visual ratios
                const scaleX = pdfW / displayW;
                const scaleY = pdfH / displayH;

                // Absolute positions in pdf-lib coordinate units
                const finalW = sigEl.clientWidth * scaleX;
                const finalH = sigEl.clientHeight * scaleY;
                const finalX = sigEl.offsetLeft * scaleX;

                for (let idx = 0; idx < targetPages.length; idx++) {
                    const page = targetPages[idx];
                    const { width: pWidth, height: pHeight } = page.getSize();

                    // Adjust final y placement taking Cartesian bottom-left coordinate origin
                    const finalY = pHeight - (sigEl.offsetTop * scaleY) - finalH;

                    if (sigTypeSel.value === 'text') {
                        const text = textInput.value.trim();
                        const fontMap = {
                            'Helvetica':  StandardFonts.HelveticaBold,
                            'TimesRoman': StandardFonts.TimesRomanBold,
                            'Courier':    StandardFonts.CourierBold
                        };
                        const font = await pdfDoc.embedFont(fontMap[sigFontSel.value] || StandardFonts.Helvetica);
                        
                        // Scale font size based on target height
                        const fontSz = Math.round(finalH * 0.45);
                        page.drawText(text, {
                            x: finalX,
                            y: finalY + (finalH * 0.28), // visual offset centering
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
                        // Drawing signature
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
                    
                    // Yield execution to preserve performance on large files
                    if (idx % 3 === 0) await new Promise(r => setTimeout(r, 0));
                }

                progressBar.style.width = '90%';
                progressText.textContent = 'Saving PDF…';
                
                const signedBytes = await pdfDoc.save();
                const blob = new Blob([signedBytes], { type: 'application/pdf' });
                
                // Track Blob in MemoryManager
                if (window.MemoryManager) window.MemoryManager.registerObjectUrl(URL.createObjectURL(blob));

                progressBar.style.width = '100%';
                progressText.textContent = 'Signing completed successfully!';
                downloadBtn.disabled = false;

                const base = currentFile.name.replace(/\.pdf$/i, '') || 'document';
                downloadBtn.onclick = () => {
                    downloadBlob(blob, `${base}-signed.pdf`);
                    if (window.triggerSuccessConfetti) window.triggerSuccessConfetti();
                };

                if (window.showToast) showToast('✅ PDF signed successfully!', 'success');

                setTimeout(() => {
                    progressCon.style.display = 'none';
                    progressBar.style.width = '0%';
                }, 3000);

            } catch (e) {
                progressText.textContent = `❌ Error: ${e.message}`;
                if (window.showToast) showToast('❌ Signing failed: ' + e.message, 'error');
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
        warn.textContent = '⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
        container.replaceChildren(warn);
    }
}
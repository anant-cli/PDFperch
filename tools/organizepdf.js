// organizepdf.js — PDF Page Organizer (Drag-to-reorder, rotate, delete, touch & zoom optimized)
async function renderorganizepdf(container) {
    try {
        const PDFJS_URL    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const PDFLIB_URL   = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

        await Promise.all([loadScript(PDFJS_URL), loadScript(PDFLIB_URL)]);
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription('Reorder, rotate, and delete PDF pages with a visual drag-and-drop editor. 100% private, fully responsive on mobile touchscreens.');
        updatePageTitle('Organize PDF Pages');

        area.innerHTML = `
        <h3>🗂️ Organize PDF</h3>
        <p class="tool-description">
            Reorder, rotate, and delete individual pages in a PDF using a visual drag-and-drop interface.
            Touchscreen-enabled with explicit arrows for mobile compatibility. Works completely in your browser.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my PDF uploaded to a server?</summary>
                <p>No. All processing happens in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>How do I reorder pages on mobile?</summary>
                <p>Use the left (←) and right (→) buttons below each thumbnail card to reorder pages seamlessly on mobile screens.</p>
            </details>
        </div>

        <div id="orgDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📄🔀</div>
            <p>Drag and drop a PDF file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="orgPdfInput" accept=".pdf" style="display: none;">
        </div>

        <div id="orgStatus" style="display:none; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.75rem;"></div>

        <div id="orgProgressContainer" style="display:none; width:100%; background: var(--bg-input); border-radius: 4px; margin-bottom: 1rem; border:1px solid var(--border-subtle);">
            <div id="orgProgressBar" style="width:0%; height:6px; background: var(--accent); border-radius:4px; transition: width 0.2s;"></div>
        </div>

        <!-- ORG CONTROL BAR -->
        <div id="orgControls" style="display:none; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem; padding:0.75rem 1rem; border:1px solid var(--border-subtle); border-radius:var(--r-md); background:var(--bg-input);">
            <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--text-secondary);">
                <span>🔍 Thumbnail Size:</span>
                <input type="range" id="orgZoomSlider" min="90" max="180" value="120" style="width:100px; cursor:pointer;">
                <span id="orgZoomValue">120px</span>
            </div>
            <div style="display:flex; gap:0.5rem;">
                <button id="orgRotateAllBtn" class="secondary" style="font-size:0.75rem; padding:0.4rem 0.8rem; min-width:unset; height:auto; border-radius:var(--r-sm);">↻ Rotate All</button>
                <button id="orgDeleteAllBtn" class="secondary" style="font-size:0.75rem; padding:0.4rem 0.8rem; min-width:unset; height:auto; border-radius:var(--r-sm); color:#f87171; border-color:rgba(248,113,113,0.25);">🗑️ Delete All</button>
            </div>
        </div>

        <div id="orgThumbGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-bottom: 1.5rem;"></div>

        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
            <button id="orgSaveBtn" class="primary" disabled>💾 Save Organised PDF</button>
            <button id="orgResetBtn" class="secondary" disabled>↺ Reset</button>
            <button id="orgReloadBtn" class="download-btn" style="display:none; min-width:unset; padding:0 1.25rem;">↺ Load New File</button>
        </div>
        `;

        // ── DOM refs ──────────────────────────────────────────────────────────
        const dropZone   = document.getElementById('orgDropZone');
        const inp        = document.getElementById('orgPdfInput');
        const statusDiv  = document.getElementById('orgStatus');
        const progCon    = document.getElementById('orgProgressContainer');
        const progBar    = document.getElementById('orgProgressBar');
        const thumbGrid  = document.getElementById('orgThumbGrid');
        const saveBtn    = document.getElementById('orgSaveBtn');
        const resetBtn   = document.getElementById('orgResetBtn');
        const reloadBtn  = document.getElementById('orgReloadBtn');
        const orgControls = document.getElementById('orgControls');
        const zoomSlider = document.getElementById('orgZoomSlider');
        const zoomValue  = document.getElementById('orgZoomValue');
        const rotAllBtn  = document.getElementById('orgRotateAllBtn');
        const delAllBtn  = document.getElementById('orgDeleteAllBtn');

        // State
        let pages = [];               // [{ pageIndex, rotation }]
        let originalBuffer = null;
        let originalName   = '';
        let pdfjsDoc       = null;

        // ── Controls Setup ───────────────────────────────────────────────────
        zoomSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            zoomValue.textContent = val + 'px';
            thumbGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${val}px, 1fr))`;
        });

        rotAllBtn.addEventListener('click', () => {
            pages.forEach(p => p.rotation = (p.rotation + 90) % 360);
            renderAllThumbnails();
        });

        delAllBtn.addEventListener('click', () => {
            if (confirm('🗑️ Are you sure you want to remove all pages?')) {
                pages = [];
                renderAllThumbnails();
            }
        });

        // ── Drop zone ─────────────────────────────────────────────────────────
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('orgDropZone', 'orgPdfInput');
        }

        inp.addEventListener('change', () => {
            if (inp.files[0]) handleFile(inp.files[0]);
        });

        reloadBtn.addEventListener('click', () => {
            pages = []; originalBuffer = null; pdfjsDoc = null; originalName = '';
            thumbGrid.innerHTML = '';
            saveBtn.disabled = true;
            reloadBtn.style.display = 'none';
            statusDiv.style.display = 'none';
            orgControls.style.display = 'none';
            dropZone.style.display = 'block';
        });

        // ── File load ─────────────────────────────────────────────────────────
        async function handleFile(file) {
            if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
                if (window.showToast) showToast('Please select a .pdf file.', 'error');
                return;
            }

            if (typeof validateFile === 'function') {
                if (!validateFile(file).valid) return;
            }

            originalName = file.name;
            if (window.showFileOnDropZone) showFileOnDropZone('orgDropZone', file);
            dropZone.style.display = 'none';

            try {
                if (window.showSpinner) showSpinner('Reading PDF…');
                originalBuffer = await file.arrayBuffer();
                const pdfData  = new Uint8Array(originalBuffer);
                pdfjsDoc       = await pdfjsLib.getDocument({ data: pdfData }).promise;

                const total = pdfjsDoc.numPages;
                if (total > 50) {
                    if (window.showToast) showToast('Large document — generating thumbnails…', 'warning');
                }

                pages = Array.from({ length: total }, (_, i) => ({ pageIndex: i, rotation: 0 }));
                const originalPages = pages.map(p => ({ ...p })); // snapshot for reset

                statusDiv.textContent = `Loaded: ${file.name} · ${total} pages`;
                statusDiv.style.display = 'block';
                orgControls.style.display = 'flex';
                reloadBtn.style.display = 'inline-block';
                saveBtn.disabled = false;
                resetBtn.disabled = false;

                resetBtn.onclick = async () => {
                    pages = originalPages.map(p => ({ ...p }));
                    await renderAllThumbnails();
                    if (window.showToast) showToast('Page order reset.');
                };

                if (window.hideSpinner) hideSpinner();
                await renderAllThumbnails();

            } catch (e) {
                if (window.hideSpinner) hideSpinner();
                if (window.showToast) showToast('Failed to load PDF: ' + e.message, 'error');
                console.error(e);
                dropZone.style.display = 'block';
            }
        }

        // ── Render thumbnails ─────────────────────────────────────────────────
        async function renderAllThumbnails() {
            thumbGrid.innerHTML = '';
            progCon.style.display = 'block';
            progBar.style.width = '0%';

            const total = pages.length;
            for (let i = 0; i < total; i++) {
                progBar.style.width = `${Math.round(((i + 1) / total) * 100)}%`;
                statusDiv.textContent = `Rendering page thumbnail ${i + 1} of ${total}…`;
                await renderThumbCard(i);
                // Yield thread to keep UI fluid and responsive
                if (i % 5 === 0) await yieldToMainThread();
            }

            progCon.style.display = 'none';
            progBar.style.width = '0%';
            statusDiv.textContent = `${total} page${total !== 1 ? 's' : ''} — drag or use arrows to reorder`;
            saveBtn.disabled = (pages.length === 0);
            attachDragHandlers();
        }

        async function renderThumbCard(gridIdx) {
            const entry    = pages[gridIdx];
            const pdfPage  = await pdfjsDoc.getPage(entry.pageIndex + 1);
            const viewport = pdfPage.getViewport({ scale: 0.25 });

            const canvas   = document.createElement('canvas');
            canvas.width   = Math.round(viewport.width);
            canvas.height  = Math.round(viewport.height);
            const ctx      = canvas.getContext('2d');
            ctx.fillStyle  = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await pdfPage.render({ canvasContext: ctx, viewport }).promise;

            // Apply rotation via CSS
            canvas.style.transform = `rotate(${entry.rotation}deg)`;
            canvas.style.transition = 'transform 0.3s ease';

            const card = document.createElement('div');
            card.className = 'page-thumb';
            card.dataset.gridIndex = String(gridIdx);
            card.draggable = true;
            card.style.cssText = `
                position: relative;
                background: var(--bg-card);
                border-radius: var(--r-md);
                padding: 10px;
                text-align: center;
                border: 1px solid var(--border-subtle);
                cursor: grab;
                transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
                user-select: none;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 6px;
            `;

            const overflow = document.createElement('div');
            overflow.style.cssText = 'overflow:hidden; display:flex; align-items:center; justify-content:center; min-height:80px; flex: 1;';
            overflow.appendChild(canvas);

            const label = document.createElement('div');
            label.textContent = `Page ${entry.pageIndex + 1}`;
            label.style.cssText = 'font-size:0.75rem; font-weight:600; color: var(--text-secondary);';

            const btnRow = document.createElement('div');
            btnRow.style.cssText = 'display:flex; justify-content:center; gap:4px; flex-wrap:wrap;';

            // Rotate button
            const rotBtn = document.createElement('button');
            rotBtn.className = 'secondary';
            rotBtn.title = 'Rotate 90°';
            rotBtn.textContent = '↻';
            rotBtn.style.cssText = 'font-size:0.8rem; padding:2px 6px; min-width:unset; height:24px; border-radius:4px; cursor:pointer;';
            rotBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(card.dataset.gridIndex);
                pages[idx].rotation = (pages[idx].rotation + 90) % 360;
                canvas.style.transform = `rotate(${pages[idx].rotation}deg)`;
            });

            // Move Left Button (Mobile reorder)
            const leftBtn = document.createElement('button');
            leftBtn.className = 'secondary';
            leftBtn.title = 'Move Left';
            leftBtn.textContent = '←';
            leftBtn.style.cssText = 'font-size:0.8rem; padding:2px 6px; min-width:unset; height:24px; border-radius:4px; cursor:pointer;';
            if (gridIdx === 0) leftBtn.style.visibility = 'hidden';
            leftBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(card.dataset.gridIndex);
                if (idx > 0) {
                    [pages[idx - 1], pages[idx]] = [pages[idx], pages[idx - 1]];
                    renderAllThumbnails();
                }
            });

            // Move Right Button (Mobile reorder)
            const rightBtn = document.createElement('button');
            rightBtn.className = 'secondary';
            rightBtn.title = 'Move Right';
            rightBtn.textContent = '→';
            rightBtn.style.cssText = 'font-size:0.8rem; padding:2px 6px; min-width:unset; height:24px; border-radius:4px; cursor:pointer;';
            if (gridIdx === pages.length - 1) rightBtn.style.visibility = 'hidden';
            rightBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(card.dataset.gridIndex);
                if (idx < pages.length - 1) {
                    [pages[idx], pages[idx + 1]] = [pages[idx + 1], pages[idx]];
                    renderAllThumbnails();
                }
            });

            // Delete Button
            const delBtn = document.createElement('button');
            delBtn.className = 'secondary';
            delBtn.title = 'Remove page';
            delBtn.textContent = '✕';
            delBtn.style.cssText = 'font-size:0.8rem; padding:2px 6px; min-width:unset; height:24px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer;';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(card.dataset.gridIndex);
                pages.splice(idx, 1);
                card.remove();
                
                // Re-index remaining cards
                [...thumbGrid.querySelectorAll('.page-thumb')].forEach((c, i) => {
                    c.dataset.gridIndex = String(i);
                });
                saveBtn.disabled = (pages.length === 0);
                if (pages.length === 0 && window.showToast) {
                    showToast('All pages removed.', 'warning');
                }
                renderAllThumbnails();
            });

            btnRow.appendChild(leftBtn);
            btnRow.appendChild(rotBtn);
            btnRow.appendChild(rightBtn);
            btnRow.appendChild(delBtn);

            card.appendChild(overflow);
            card.appendChild(label);
            card.appendChild(btnRow);
            thumbGrid.appendChild(card);
        }

        // ── Drag-and-drop reorder ─────────────────────────────────────────────
        let draggedGridIdx = null;

        function attachDragHandlers() {
            thumbGrid.addEventListener('dragstart', onDragStart);
            thumbGrid.addEventListener('dragover',  onDragOver);
            thumbGrid.addEventListener('dragleave', onDragLeave);
            thumbGrid.addEventListener('drop',      onDrop);
            thumbGrid.addEventListener('dragend',   onDragEnd);
        }

        function onDragStart(e) {
            const card = e.target.closest('.page-thumb');
            if (!card) return;
            draggedGridIdx = parseInt(card.dataset.gridIndex);
            card.style.opacity = '0.45';
            e.dataTransfer.effectAllowed = 'move';
        }

        function onDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const card = e.target.closest('.page-thumb');
            if (card) card.style.outline = '2px dashed var(--accent)';
        }

        function onDragLeave(e) {
            const card = e.target.closest('.page-thumb');
            if (card) card.style.outline = '';
        }

        function onDrop(e) {
            e.preventDefault();
            const targetCard = e.target.closest('.page-thumb');
            if (!targetCard || draggedGridIdx === null) return;
            const targetIdx = parseInt(targetCard.dataset.gridIndex);
            targetCard.style.outline = '';
            if (draggedGridIdx === targetIdx) return;

            const [moved] = pages.splice(draggedGridIdx, 1);
            pages.splice(targetIdx, 0, moved);

            renderAllThumbnails();
        }

        function onDragEnd(e) {
            [...thumbGrid.querySelectorAll('.page-thumb')].forEach(c => {
                c.style.opacity = '';
                c.style.outline = '';
            });
            draggedGridIdx = null;
        }

        // ── Save / Export ─────────────────────────────────────────────────────
        saveBtn.addEventListener('click', async () => {
            if (pages.length === 0) {
                if (window.showToast) showToast('Add at least one page before saving.', 'warning');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = '⏳ Saving…';
            if (window.showSpinner) showSpinner('Building organised PDF…');

            try {
                const newDoc   = await PDFLib.PDFDocument.create();
                const srcDoc   = await PDFLib.PDFDocument.load(originalBuffer);
                const indices  = pages.map(p => p.pageIndex);
                const copied   = await newDoc.copyPages(srcDoc, indices);

                for (let i = 0; i < copied.length; i++) {
                    const page = copied[i];
                    page.setRotation(PDFLib.degrees(pages[i].rotation));
                    newDoc.addPage(page);
                    if (i % 5 === 0) await yieldToMainThread();
                }

                const bytes    = await newDoc.save();
                const blob     = new Blob([bytes], { type: 'application/pdf' });
                
                // Track in MemoryManager
                if (window.MemoryManager) window.MemoryManager.registerObjectUrl(URL.createObjectURL(blob));

                const base     = originalName.replace(/\.pdf$/i, '') || 'document';
                downloadBlob(blob, `organised-${base}.pdf`);
                
                if (window.showToast) showToast(`Saved — ${pages.length} pages in output PDF`);
                if (window.triggerSuccessConfetti) window.triggerSuccessConfetti();
            } catch (e) {
                if (window.showToast) showToast('Export failed: ' + e.message, 'error');
                console.error(e);
            } finally {
                saveBtn.disabled = (pages.length === 0);
                saveBtn.textContent = '💾 Save Organised PDF';
                if (window.hideSpinner) hideSpinner();
            }
        });

    } catch (___err) {
        console.error('renderorganizepdf error:', ___err);
        const warn = document.createElement('div');
        warn.className = 'warning';
        warn.textContent = '⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
        container.replaceChildren(warn);
    }
}

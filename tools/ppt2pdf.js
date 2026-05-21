// ppt2pdf.js — PowerPoint (PPTX) to PDF Converter
// Strategy: JSZip to unzip .pptx → parse slide XML → html2canvas → pdf-lib
// LIMITATION: Handles text, solid backgrounds, and embedded images.
// Not supported: animations, video, embedded charts, SmartArt, custom fonts.
async function renderppt2pdf(container) {
    try {
        const JSZIP_URL    = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        const PDFLIB_URL   = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
        const H2C_URL      = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';

        await Promise.all([loadScript(JSZIP_URL), loadScript(PDFLIB_URL)]);

        // html2canvas is optional — try to load, use text fallback if unavailable
        let useHtml2Canvas = false;
        try {
            await loadScript(H2C_URL);
            // html2pdf.js bundle exposes html2canvas as window.html2canvas
            if (typeof window.html2canvas === 'function') useHtml2Canvas = true;
        } catch (e) {
            console.warn('[ppt2pdf] html2canvas unavailable, using text-only fallback:', e);
        }

        container.innerHTML = '';
        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        updateMetaDescription('Convert PowerPoint PPTX files to PDF in your browser. Basic text and image slides. 100% private, no uploads.');
        updatePageTitle('PPT to PDF — PowerPoint Converter');

        area.innerHTML = `
        <h3>📊 PPT to PDF</h3>
        <p class="tool-description">
            Convert PowerPoint PPTX files to PDF directly in your browser.
            Supports text content, solid background colours, and embedded images.
            No file is uploaded — everything runs locally.
        </p>

        <div class="warning" style="margin-bottom:1rem;">
            ⚠️ <strong>Scope notice:</strong> This tool renders common slide elements only.
            <strong>Not supported:</strong> animations, video, embedded charts, SmartArt, custom fonts (substituted with system sans-serif), and complex gradients.
            Always review the output before sharing.
        </div>

        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Why does my slide look different in the PDF?</summary>
                <p>Full PPTX rendering requires a full Office runtime. This tool parses slide XML and reconstructs slides using HTML/CSS, so complex layouts, custom fonts, and graphical effects may differ from the original.</p>
            </details>
            <details>
                <summary>Can I convert .ppt (older format) files?</summary>
                <p>No. Only .pptx files are supported. .ppt is a binary format that requires a native Office library. Save your file as .pptx in PowerPoint and re-upload.</p>
            </details>
            <details>
                <summary>How many slides can I convert?</summary>
                <p>There is no hard limit, but larger decks take more time. Decks with many embedded images may be slow depending on your device's memory.</p>
            </details>
        </div>

        <div id="pptDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📊➡️📄</div>
            <p>Drag and drop a .pptx file here</p>
            <p class="note">or click to browse files — PPTX only</p>
            <input type="file" id="pptInput" accept=".pptx" style="display: none;">
        </div>

        <div id="pptFileInfo" style="display:none; background:var(--bg-input); padding:1rem; border-radius:var(--r-md); margin-bottom:1rem; font-size:0.9rem; color:var(--text-muted);">
            <div><strong id="pptFileName">—</strong></div>
            <div id="pptSlideCount" style="margin-top:4px;"></div>
        </div>

        <div class="input-group" style="margin-bottom:1rem;">
            <label for="pptSlideRange">Convert slides</label>
            <select id="pptSlideRange">
                <option value="all" selected>All slides</option>
                <option value="custom">Custom range (e.g. 1-3,5)</option>
            </select>
        </div>
        <div id="pptRangeInputRow" style="display:none; margin-bottom:1rem;">
            <div class="input-group">
                <label for="pptRangeText">Slide range</label>
                <input type="text" id="pptRangeText" placeholder="e.g. 1-3,5,7-9" style="width:100%;">
            </div>
        </div>

        <button id="pptConvertBtn" class="primary" disabled>Convert to PDF</button>

        <div id="pptProgressContainer" style="display:none; margin-top:1rem;">
            <div id="pptProgressLabel" style="font-size:0.85rem; color:var(--text-muted); margin-bottom:4px;">Processing…</div>
            <div style="width:100%; background:var(--bg-input); border-radius:4px;">
                <div id="pptProgressBar" style="width:0%; height:6px; background:var(--accent); border-radius:4px; transition:width 0.2s;"></div>
            </div>
        </div>

        <button id="pptDownloadBtn" class="download-btn" disabled style="margin-top:1rem;">⬇ Download PDF</button>
        `;

        // ── DOM refs ──────────────────────────────────────────────────────────
        const dropZone     = document.getElementById('pptDropZone');
        const inp          = document.getElementById('pptInput');
        const fileInfo     = document.getElementById('pptFileInfo');
        const fileNameEl   = document.getElementById('pptFileName');
        const slideCountEl = document.getElementById('pptSlideCount');
        const rangeSelect  = document.getElementById('pptSlideRange');
        const rangeRow     = document.getElementById('pptRangeInputRow');
        const rangeText    = document.getElementById('pptRangeText');
        const convertBtn   = document.getElementById('pptConvertBtn');
        const progCon      = document.getElementById('pptProgressContainer');
        const progLabel    = document.getElementById('pptProgressLabel');
        const progBar      = document.getElementById('pptProgressBar');
        const dlBtn        = document.getElementById('pptDownloadBtn');

        let zipObj        = null;
        let slideFiles    = [];
        let originalName  = '';
        let pdfBlob       = null;

        // EMU scale constants
        const SLIDE_W_EMU = 9144000;
        const SLIDE_H_EMU = 5143500;
        const CANVAS_W    = 960;
        const CANVAS_H    = 540;
        const SCALE_X     = CANVAS_W / SLIDE_W_EMU;
        const SCALE_Y     = CANVAS_H / SLIDE_H_EMU;

        // ── Range picker ──────────────────────────────────────────────────────
        rangeSelect.addEventListener('change', () => {
            rangeRow.style.display = rangeSelect.value === 'custom' ? 'block' : 'none';
        });

        // ── Drop zone ─────────────────────────────────────────────────────────
        dropZone.addEventListener('click', () => inp.click());
        if (typeof setupDropZone === 'function') {
            setupDropZone('pptDropZone', 'pptInput', handleFile);
        }
        inp.addEventListener('change', () => {
            if (inp.files[0]) handleFile(inp.files[0]);
        });

        async function handleFile(file) {
            if (!file) return;
            const name = file.name.toLowerCase();
            if (name.endsWith('.ppt') && !name.endsWith('.pptx')) {
                if (window.showToast) showToast('Only .pptx files are supported. Please save your file as PPTX and try again.', 'error');
                return;
            }
            if (!name.endsWith('.pptx')) {
                if (window.showToast) showToast('Please select a .pptx file.', 'error');
                return;
            }

            originalName = file.name;
            if (window.showFileOnDropZone) showFileOnDropZone('pptDropZone', file);

            try {
                if (window.showSpinner) showSpinner('Parsing PPTX…');
                const buf   = await file.arrayBuffer();
                const zip   = await JSZip.loadAsync(buf);
                zipObj      = zip;
                slideFiles  = parsePptxSlideList(zip);

                fileNameEl.textContent  = file.name;
                slideCountEl.textContent = `Found ${slideFiles.length} slide${slideFiles.length !== 1 ? 's' : ''}. Click Convert to generate PDF.`;
                fileInfo.style.display  = 'block';
                convertBtn.disabled     = false;
                dlBtn.disabled          = true;
                pdfBlob                 = null;

                if (window.showToast) showToast(`Loaded: ${slideFiles.length} slides`);
            } catch (e) {
                if (window.showToast) showToast('Failed to parse PPTX: ' + e.message, 'error');
                console.error(e);
            } finally {
                if (window.hideSpinner) hideSpinner();
            }
        }

        function parsePptxSlideList(zip) {
            return Object.keys(zip.files)
                .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
                .sort((a, b) => {
                    const na = parseInt(a.match(/\d+/)[0]);
                    const nb = parseInt(b.match(/\d+/)[0]);
                    return na - nb;
                });
        }

        // ── Convert ───────────────────────────────────────────────────────────
        convertBtn.addEventListener('click', async () => {
            if (!zipObj || slideFiles.length === 0) return;

            // Determine selected slides
            let selectedSlides = slideFiles;
            if (rangeSelect.value === 'custom') {
                const parsed = parseRange(rangeText.value.trim(), slideFiles.length);
                if (!parsed || parsed.length === 0) {
                    if (window.showToast) showToast('Invalid range. Use format: 1-3,5,7', 'error');
                    return;
                }
                selectedSlides = parsed.map(i => slideFiles[i - 1]).filter(Boolean);
            }

            convertBtn.disabled = true;
            convertBtn.textContent = '⏳ Converting…';
            dlBtn.disabled = true;
            pdfBlob = null;
            progCon.style.display = 'block';
            progBar.style.width = '0%';
            if (window.showSpinner) showSpinner('Converting slides to PDF…');

            try {
                const pdfDoc = await PDFLib.PDFDocument.create();
                const total  = selectedSlides.length;

                for (let i = 0; i < total; i++) {
                    const slideFile = selectedSlides[i];
                    progLabel.textContent = `Converting slide ${i + 1} of ${total}…`;
                    progBar.style.width = `${Math.round((i / total) * 90)}%`;

                    await addSlideToDoc(pdfDoc, zipObj, slideFile, i + 1);
                    await new Promise(r => setTimeout(r, 0)); // yield
                }

                progBar.style.width = '95%';
                progLabel.textContent = 'Saving PDF…';
                const bytes = await pdfDoc.save();
                pdfBlob = new Blob([bytes], { type: 'application/pdf' });
                progBar.style.width = '100%';
                dlBtn.disabled = false;
                if (window.showToast) showToast(`Converted ${total} slide${total !== 1 ? 's' : ''} to PDF`);

            } catch (e) {
                if (window.showToast) showToast('Conversion failed: ' + e.message, 'error');
                console.error(e);
            } finally {
                convertBtn.disabled = false;
                convertBtn.textContent = 'Convert to PDF';
                progCon.style.display = 'none';
                if (window.hideSpinner) hideSpinner();
            }
        });

        // ── Add one slide as a page ───────────────────────────────────────────
        async function addSlideToDoc(pdfDoc, zip, slideFile, slideNum) {
            const xmlStr  = await zip.file(slideFile).async('string');
            const doc     = new DOMParser().parseFromString(xmlStr, 'text/xml');

            const bgColor = extractBgColor(doc);
            const texts   = extractTexts(doc);

            // Load image blobs from .rels
            const relsPath  = slideFile.replace('slides/slide', 'slides/_rels/slide').replace('.xml', '.xml.rels');
            const imgMap    = await loadSlideImages(zip, relsPath);

            if (useHtml2Canvas) {
                await addSlideViaCanvas(pdfDoc, doc, bgColor, texts, imgMap);
            } else {
                await addSlideViaText(pdfDoc, bgColor, texts);
            }
        }

        // ── Canvas render path ────────────────────────────────────────────────
        async function addSlideViaCanvas(pdfDoc, doc, bgColor, texts, imgMap) {
            const slideDiv = document.createElement('div');
            slideDiv.style.cssText = `
                position: fixed; left: -9999px; top: 0;
                width: ${CANVAS_W}px; height: ${CANVAS_H}px;
                background: #${bgColor}; font-family: sans-serif;
                overflow: hidden; box-sizing: border-box;
            `;

            // Add text shapes
            extractShapePositions(doc).forEach(shape => {
                if (!shape.text) return;
                const el = document.createElement('div');
                el.style.cssText = `
                    position: absolute;
                    left: ${shape.x}px; top: ${shape.y}px;
                    width: ${shape.w > 0 ? shape.w + 'px' : 'auto'};
                    font-size: ${shape.fontSize || 16}px;
                    color: #${shape.color || '000000'};
                    white-space: pre-wrap; word-wrap: break-word;
                    overflow: hidden;
                `;
                el.textContent = shape.text;
                slideDiv.appendChild(el);
            });

            // Add images
            for (const [rId, url] of Object.entries(imgMap)) {
                const picData = findPicPosition(doc, rId);
                if (!picData) continue;
                const img = document.createElement('img');
                img.src = url;
                img.style.cssText = `
                    position: absolute;
                    left: ${picData.x}px; top: ${picData.y}px;
                    width: ${picData.w}px; height: ${picData.h}px;
                    object-fit: contain;
                `;
                slideDiv.appendChild(img);
                await new Promise(r => { img.onload = r; img.onerror = r; });
            }

            document.body.appendChild(slideDiv);
            try {
                const canvas = await html2canvas(slideDiv, {
                    scale: 1, width: CANVAS_W, height: CANVAS_H,
                    useCORS: true, windowWidth: CANVAS_W, windowHeight: CANVAS_H,
                    logging: false
                });
                const jpgBlob  = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
                const jpgBytes = await jpgBlob.arrayBuffer();
                const jpgImg   = await pdfDoc.embedJpg(jpgBytes);
                const page     = pdfDoc.addPage([CANVAS_W, CANVAS_H]);
                page.drawImage(jpgImg, { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H });
            } finally {
                document.body.removeChild(slideDiv);
            }
        }

        // ── Text-only fallback path ───────────────────────────────────────────
        async function addSlideViaText(pdfDoc, bgColor, texts) {
            const page = pdfDoc.addPage([CANVAS_W, CANVAS_H]);
            // Fill background
            const r = parseInt(bgColor.substring(0,2), 16) / 255;
            const g = parseInt(bgColor.substring(2,4), 16) / 255;
            const b = parseInt(bgColor.substring(4,6), 16) / 255;
            page.drawRectangle({ x:0, y:0, width:CANVAS_W, height:CANVAS_H, color: PDFLib.rgb(r, g, b) });

            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            let yPos = CANVAS_H - 40;
            texts.forEach(line => {
                if (yPos < 20) return;
                const clean = (line || '').replace(/[^\x00-\x7F]/g, '?');
                if (!clean.trim()) return;
                try {
                    page.drawText(clean.substring(0, 120), { x: 30, y: yPos, size: 14, font, color: PDFLib.rgb(0,0,0) });
                } catch(_) {}
                yPos -= 22;
            });
        }

        // ── XML helpers ───────────────────────────────────────────────────────
        function extractBgColor(doc) {
            // Try solid fill on slide background
            const srgb = doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'srgbClr')[0];
            if (srgb) return srgb.getAttribute('val') || 'FFFFFF';
            return 'FFFFFF';
        }

        function extractTexts(doc) {
            const tNS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
            const tEls = doc.getElementsByTagNameNS(tNS, 't');
            const lines = [];
            for (const t of tEls) {
                const txt = (t.textContent || '').trim();
                if (txt) lines.push(txt);
            }
            return lines;
        }

        function extractShapePositions(doc) {
            const spNS   = 'http://schemas.openxmlformats.org/presentationml/2006/main';
            const dmlNS  = 'http://schemas.openxmlformats.org/drawingml/2006/main';
            const shapes = [];

            const spEls = doc.getElementsByTagNameNS(spNS, 'sp');
            for (const sp of spEls) {
                // Position
                const off  = sp.getElementsByTagNameNS(dmlNS, 'off')[0];
                const ext  = sp.getElementsByTagNameNS(dmlNS, 'ext')[0];
                const x    = off ? Math.round(parseInt(off.getAttribute('x') || '0') * SCALE_X) : 30;
                const y    = off ? Math.round(parseInt(off.getAttribute('y') || '0') * SCALE_Y) : 30;
                const w    = ext ? Math.round(parseInt(ext.getAttribute('cx') || '0') * SCALE_X) : 200;

                // Text
                const tEls = sp.getElementsByTagNameNS(dmlNS, 't');
                const text = Array.from(tEls).map(t => t.textContent).join(' ').trim();

                // Font size (in hundredths of a point)
                const szEl = sp.getElementsByTagNameNS(dmlNS, 'rPr')[0];
                const szVal = szEl ? parseInt(szEl.getAttribute('sz') || '1800') : 1800;
                const fontSize = Math.max(8, Math.min(48, Math.round(szVal / 100 * 0.75)));

                // Font color
                const clrEl = sp.getElementsByTagNameNS(dmlNS, 'srgbClr')[0];
                const color  = clrEl ? clrEl.getAttribute('val') : '222222';

                if (text) shapes.push({ x, y, w, fontSize, color, text });
            }
            return shapes;
        }

        function findPicPosition(doc, rId) {
            const spNS  = 'http://schemas.openxmlformats.org/presentationml/2006/main';
            const dmlNS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
            const rNS   = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

            const pics = doc.getElementsByTagNameNS(spNS, 'pic');
            for (const pic of pics) {
                const blip = pic.getElementsByTagNameNS(dmlNS, 'blip')[0];
                if (!blip) continue;
                const embed = blip.getAttributeNS(rNS, 'embed');
                if (embed !== rId) continue;
                const off = pic.getElementsByTagNameNS(dmlNS, 'off')[0];
                const ext = pic.getElementsByTagNameNS(dmlNS, 'ext')[0];
                return {
                    x: off ? Math.round(parseInt(off.getAttribute('x') || '0') * SCALE_X) : 0,
                    y: off ? Math.round(parseInt(off.getAttribute('y') || '0') * SCALE_Y) : 0,
                    w: ext ? Math.round(parseInt(ext.getAttribute('cx') || '0') * SCALE_X) : 100,
                    h: ext ? Math.round(parseInt(ext.getAttribute('cy') || '0') * SCALE_Y) : 100,
                };
            }
            return null;
        }

        async function loadSlideImages(zip, relsPath) {
            const map = {};
            const relsFile = zip.file(relsPath);
            if (!relsFile) return map;
            try {
                const relsXml = await relsFile.async('string');
                const relsDoc = new DOMParser().parseFromString(relsXml, 'text/xml');
                const rels    = relsDoc.querySelectorAll('Relationship');
                for (const rel of rels) {
                    const type   = rel.getAttribute('Type') || '';
                    const target = rel.getAttribute('Target') || '';
                    const rId    = rel.getAttribute('Id') || '';
                    if (!type.includes('image')) continue;
                    const mediaPath = 'ppt/media/' + target.split('/').pop();
                    const mediaFile = zip.file(mediaPath);
                    if (!mediaFile) continue;
                    const blob    = await mediaFile.async('blob');
                    map[rId]      = URL.createObjectURL(blob);
                }
            } catch(e) {
                console.warn('[ppt2pdf] Could not load slide images:', e);
            }
            return map;
        }

        // ── Download ──────────────────────────────────────────────────────────
        dlBtn.addEventListener('click', () => {
            if (!pdfBlob) return;
            const base = originalName.replace(/\.pptx$/i, '') || 'presentation';
            downloadBlob(pdfBlob, base + '.pdf');
        });

        // ── Range parser ──────────────────────────────────────────────────────
        function parseRange(str, max) {
            const result = new Set();
            const parts  = str.split(',');
            for (const part of parts) {
                const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
                if (!m) return null;
                const from = parseInt(m[1]);
                const to   = m[2] ? parseInt(m[2]) : from;
                if (from < 1 || to > max || from > to) return null;
                for (let i = from; i <= to; i++) result.add(i);
            }
            return [...result].sort((a, b) => a - b);
        }

    } catch (___err) {
        console.error('renderppt2pdf error:', ___err);
        const warn = document.createElement('div');
        warn.className = 'warning';
        warn.textContent = '⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
        container.replaceChildren(warn);
    }
}

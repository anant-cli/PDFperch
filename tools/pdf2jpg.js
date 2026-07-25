async function renderpdf2jpg(container) {
 try {
 await Promise.all([
 loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
 loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
 ]);
 pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Extract pages from PDF as JPEGs or PNGs. Memory optimized to prevent browser crashes on large files. 100% private.");
 updatePageTitle("PDF to JPG Converter");

 area.innerHTML = `
 <h3> PDF JPG</h3>
 <p class="tool-description">
 Extract pages from PDF as individual high-quality JPG or PNG images.
 This tool is memory-optimized to prevent tab crashes on huge files or mobile devices.
 </p>

 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my document uploaded to a server?</summary>
 <p>No! All conversions occur directly in your browser. Your private files never leave your computer or phone.</p>
 </details>
 <details>
 <summary>How does memory protection work?</summary>
 <p>For PDFs with more than 12 pages, the tool limits standard graphic image previews inside the browser DOM, saving massive amounts of RAM and preventing browser tab crashes (especially on iPhones and tablets).</p>
 </details>
 </div>

 <div id="pdfJpgDropZone" class="drop-zone" style="border: 2px dashed var(--border-subtle); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
 <div style="font-size: 2.5rem; margin-bottom: 0.5rem;"></div>
 <p>Drag and drop a .pdf file here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="pdf2jpgInput" accept=".pdf" style="display: none;">
 </div>

 <div id="jpgOptions" style="display:none; margin-bottom:1rem;">
 <div style="margin:1rem 0;">
 <label><input type="radio" name="pageRange" value="first" checked> First page only</label><br>
 <label><input type="radio" name="pageRange" value="all"> All pages</label><br>
 <label><input type="radio" name="pageRange" value="custom"> Custom page range</label>
 <input type="text" id="customRange" placeholder="e.g. 1-3, 5, 8-12" style="margin-top:0.25rem; width:100%; max-width:300px; display:none;">
 </div>

 <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top: 1rem; margin-bottom: 1.5rem;">
 <div class="input-group">
 <label for="jpgQuality"> Image Quality</label>
 <select id="jpgQuality">
 <option value="1.5" selected>Standard (1.5x) - balanced</option>
 <option value="2.0">High (2.0x) - crisp text</option>
 <option value="3.0">Ultra (3.0x) - extreme detail</option>
 </select>
 </div>
 <div class="input-group">
 <label for="outputFormat"> Output Format</label>
 <select id="outputFormat">
 <option value="jpeg">JPEG (smaller size)</option>
 <option value="png">PNG (lossless text)</option>
 </select>
 </div>
 </div>

 <button id="pdf2jpgBtn" class="primary" style="width:100%;">Convert to JPEG</button>

 <div id="jpgProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0; border:1px solid var(--border-subtle);">
 <div id="jpgProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
 </div>

 <div class="preview-box" id="jpgProgress" style="min-height:40px; display: none; text-align: center; margin-top: 1rem; font-size:0.875rem;"></div>

 <div id="jpgImagePreviews" class="file-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; margin-top: 1.5rem;"></div>

 <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
 <button id="downloadJpgBtn" class="download-btn" style="width:100%;" disabled> Download Images</button>
 </div>
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
 const formatSel = document.getElementById('outputFormat');
 const downloadBtn = document.getElementById('downloadJpgBtn');
 const firstRadio = document.querySelector('input[name="pageRange"][value="first"]');
 const allRadio = document.querySelector('input[name="pageRange"][value="all"]');
 const customRadio = document.querySelector('input[name="pageRange"][value="custom"]');
 const customInput = document.getElementById('customRange');
 const jpgOptions = document.getElementById('jpgOptions');
 let generatedBlobs = [];
 let localCreatedUrls = [];

 function cleanLocalObjectUrls() {
 localCreatedUrls.forEach(url => {
 try { URL.revokeObjectURL(url); } catch(e) {}
 });
 localCreatedUrls = [];
 }

 function updateFormatLabels() {
 const fmt = formatSel.value === 'png' ? 'PNG' : 'JPEG';
 btn.textContent = `Convert to ${fmt}`;
 downloadBtn.textContent = ` Download ${fmt}${generatedBlobs.length > 1 ? 's (ZIP)' : ''}`;
 }
 formatSel.addEventListener('change', updateFormatLabels);
 document.querySelectorAll('input[name="pageRange"]').forEach(radio => {
 radio.addEventListener('change', () => {
 customInput.style.display = customRadio.checked ? 'block' : 'none';
 });
 });
 dropZone.addEventListener('click', () => inp.click());
 if (typeof setupDropZone === 'function') {
 setupDropZone('pdfJpgDropZone', 'pdf2jpgInput');
 }

 inp.addEventListener("change", () => {
 const file = inp.files[0];
 if (!file) return;
 if (window.showFileOnDropZone) showFileOnDropZone("pdfJpgDropZone", file);
 jpgOptions.style.display = 'block';
 btn.disabled = false;
 cleanLocalObjectUrls();
 previewsDiv.innerHTML = '';
 generatedBlobs = [];
 downloadBtn.disabled = true;
 updateFormatLabels();
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
 if (!file) return;

 btn.disabled = true;
 btn.innerHTML = ' Loading PDF...';
 if (window.showSpinner) showSpinner('Extracting pages');
 progressDiv.style.display = 'block';
 progressDiv.innerHTML = 'Analyzing PDF structures';
 progressContainer.style.display = 'block';
 progressBar.style.width = '0%';
 cleanLocalObjectUrls();
 previewsDiv.innerHTML = '';
 generatedBlobs = [];
 downloadBtn.disabled = true;

 let pdfDoc = null;
 try {
 const arrayBuf = await file.arrayBuffer();
 pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf) }).promise;
 const totalPages = pdfDoc.numPages;
 let pagesToExtract = [];

 if (firstRadio.checked) {
 pagesToExtract = [1];
 } else if (allRadio.checked) {
 pagesToExtract = Array.from({ length: totalPages }, (_, i) => i + 1);
 } else if (customRadio.checked) {
 pagesToExtract = parsePageRange(customInput.value, totalPages);
 if (pagesToExtract.length === 0) {
 if (window.showToast) showToast('Invalid range. Defaulting to first page.', 'warning');
 pagesToExtract = [1];
 }
 }

 progressDiv.innerHTML = `Extracting ${pagesToExtract.length} pages`;
 const scaleMultiplier = parseFloat(qualitySel.value) || 1.5;
 const fmt = formatSel.value;
 const jpegQualityMap = { '1.5': 0.80, '2.0': 0.88, '3.0': 0.94 };
 const jpegQuality = jpegQualityMap[qualitySel.value] || 0.85;

 for (let i = 0; i < pagesToExtract.length; i++) {
 const pageNum = pagesToExtract[i];
 btn.innerHTML = ` Rendering page ${pageNum} (${i + 1}/${pagesToExtract.length})`;
 progressBar.style.width = `${Math.round((i / pagesToExtract.length) * 100)}%`;

 const page = await pdfDoc.getPage(pageNum);
 const viewport = page.getViewport({ scale: scaleMultiplier });
 const canvas = document.createElement('canvas');
 canvas.width = Math.round(viewport.width);
 canvas.height = Math.round(viewport.height);
 const ctx = canvas.getContext('2d');

 if (fmt === 'jpeg') {
 ctx.fillStyle = '#ffffff';
 ctx.fillRect(0, 0, canvas.width, canvas.height);
 }

 await page.render({ canvasContext: ctx, viewport }).promise;

 const mimeType = fmt === 'png' ? 'image/png' : 'image/jpeg';
 const blob = await new Promise(r => canvas.toBlob(r, mimeType, fmt === 'jpeg' ? jpegQuality : undefined));

 const pixelDims = `${canvas.width}${canvas.height}px`;
 releaseCanvas(canvas);

 generatedBlobs.push({ blob, pageNum, pixelDims, fmt });

 const card = document.createElement('div');
 card.style.cssText = 'position:relative; display:flex; flex-direction:column; gap:4px; background:var(--bg-card); padding:8px; border-radius:var(--r-md); border:1px solid var(--border-subtle);';
 const shouldRenderVisual = (i < 12);
 if (shouldRenderVisual) {
 const blobUrl = URL.createObjectURL(blob);
 localCreatedUrls.push(blobUrl);

 const previewImg = document.createElement('img');
 previewImg.src = blobUrl;
 previewImg.className = 'img-thumbnail';
 previewImg.style.cssText = 'width:100%; height:130px; object-fit:contain; border-radius:4px; margin-bottom:4px; background:var(--bg-input);';
 previewImg.title = `Page ${pageNum}`;
 card.appendChild(previewImg);
 } else {
 const placeholder = document.createElement('div');
 placeholder.style.cssText = 'width:100%; height:130px; border-radius:4px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--bg-input); margin-bottom:4px; border:1px dashed var(--border-subtle);';
 placeholder.innerHTML = `<span style="font-size:1.8rem; margin-bottom:4px;"></span><span style="font-size:0.7rem; color:var(--text-muted);">Memory Saved</span>`;
 card.appendChild(placeholder);
 }

 const info = document.createElement('div');
 info.textContent = `Page ${pageNum} ${pixelDims}`;
 info.style.cssText = 'font-size:0.75rem; text-align:center; font-weight:600; color:var(--text-secondary); margin-bottom:4px;';

 const ext = fmt === 'png' ? 'png' : 'jpg';
 const pdfBase = file.name.replace(/\.pdf$/i,'') || 'page';

 const dlBtn = document.createElement('button');
 dlBtn.className = 'secondary';
 dlBtn.style.cssText = 'font-size:0.75rem; padding:3px 8px; margin:0; height:28px; min-width:unset; width:100%;';
 dlBtn.textContent = `Download`;
 dlBtn.onclick = () => downloadBlob(blob, `${pdfBase}-page-${pageNum}.${ext}`);

 card.appendChild(info);
 card.appendChild(dlBtn);
 previewsDiv.appendChild(card);
 if (i % 3 === 0) await yieldToMainThread();
 }

 progressBar.style.width = '100%';
 progressDiv.innerHTML = `Conversions complete. Extracted ${pagesToExtract.length} pages.`;
 downloadBtn.disabled = false;

 if (window.showToast) showToast(`Extracted ${pagesToExtract.length} pages successfully!`);
 if (window.triggerSuccessConfetti) window.triggerSuccessConfetti();

 setTimeout(() => {
 progressContainer.style.display = 'none';
 progressBar.style.width = '0%';
 }, 3000);

 } catch (e) {
 progressDiv.textContent = `Error: ${e.message}`;
 if (window.showToast) showToast('Extraction failed: ' + e.message, 'error');
 console.error(e);
 } finally {
 btn.disabled = false;
 updateFormatLabels();
 if (pdfDoc) {
 try { pdfDoc.destroy(); } catch(err) {}
 }
 if (window.hideSpinner) hideSpinner();
 }
 });

 downloadBtn.addEventListener('click', async () => {
 if (generatedBlobs.length === 0) return;

 const file = inp.files[0];
 const fmt2 = formatSel.value;
 const ext = fmt2 === 'png' ? 'png' : 'jpg';
 const pdfBase = file ? file.name.replace(/\.pdf$/i, '') : 'document';

 if (generatedBlobs.length === 1) {
 downloadBlob(generatedBlobs[0].blob, `${pdfBase}-page-${generatedBlobs[0].pageNum}.${ext}`);
 } else {
 if (window.showSpinner) showSpinner('Bundling ZIP archive');
 const zip = new JSZip();
 generatedBlobs.forEach(({ blob, pageNum }) => zip.file(`page-${pageNum}.${ext}`, blob));
 const content = await zip.generateAsync({ type: 'blob' });
 downloadBlob(content, `${pdfBase}-extracted-images.zip`);
 if (window.hideSpinner) hideSpinner();
 }
 });

 } catch (___err) {
 console.error('renderpdf2jpg error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




function renderimg2png(container) {
 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Convert images between PNG, JPEG, and WebP formats. Quality slider, background color picker, batch download. 100% private, no uploads.");
 updatePageTitle("Image Format Converter");

 area.innerHTML = `
 <h3> Image Format Converter</h3>
 <p class="tool-description">
 Convert any image to PNG, JPEG, or WebP. Control quality, background color for transparent images,
 and resize on the fly. Everything happens locally - no uploads, no servers.
 After conversion, you can also <a href="/pages/img2pdf.html" target="_self">combine images into a PDF</a>.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my file uploaded to a server?</summary>
 <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
 </details>
 <details>
 <summary>When should I use PNG vs JPEG vs WebP?</summary>
 <p>PNG: lossless, best for logos and text. JPEG: smaller files, best for photos. WebP: modern format, best compression - ideal for websites.</p>
 </details>
 <details>
 <summary>Why does JPEG look different from my transparent PNG?</summary>
 <p>JPEG doesn't support transparency. Use the Background Color picker to fill transparent areas with a color of your choice.</p>
 </details>
 </div>

 <div id="imgPngDropZone" class="drop-zone" style="border: 2px dashed var(--border-subtle); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
 <div style="font-size: 2rem; margin-bottom: 1rem;"></div>
 <p>Drag and drop any image (JPG, PNG, WebP, GIF, BMP)</p>
 <p class="note">or click to browse - select multiple files for batch conversion</p>
 <input type="file" id="anyImgInput" accept="image/*" multiple style="display: none;">
 </div>

 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
 <div class="input-group">
 <label for="outputFormatImg">Output Format</label>
 <select id="outputFormatImg">
 <option value="png">PNG - Lossless, supports transparency</option>
 <option value="jpeg" selected>JPEG - Smaller, best for photos</option>
 <option value="webp">WebP - Best compression, modern browsers</option>
 </select>
 </div>
 <div class="input-group">
 <label for="pngMaxWidth">Max Width</label>
 <select id="pngMaxWidth">
 <option value="none" selected>Original size</option>
 <option value="1920">1920px (1080p)</option>
 <option value="1280">1280px (720p)</option>
 <option value="800">800px</option>
 <option value="500">500px</option>
 </select>
 </div>
 </div>

 <div id="qualityRow" style="margin-bottom: 1rem;">
 <div class="input-group">
 <label for="imgQualitySlider">Quality: <span id="qualityLabel">85</span>% <span style="font-size:0.8rem; color:var(--text-muted);" id="qualitySizeEst"></span></label>
 <input type="range" id="imgQualitySlider" min="10" max="100" value="85" style="width:100%;">
 </div>
 </div>

 <div id="bgColorRow" style="margin-bottom: 1.5rem; display:none;">
 <div class="input-group">
 <label for="imgBgColor">Background Color <span style="font-size:0.8rem; color:var(--text-muted);">(fills transparent areas before JPEG/WebP export)</span></label>
 <input type="color" id="imgBgColor" value="#ffffff">
 </div>
 </div>

 <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:1rem; color:var(--text-muted); font-size:0.9rem;" id="imgStats">
 <span id="imgOrigSize">No file selected</span>
 </div>

 <button id="toPngBtn" class="primary" disabled>Convert Image</button>

 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
 <div class="preview-box" style="margin: 0;">
 <div class="preview-title">Original</div>
 <div style="text-align:center;">
 <img id="origPreview" style="max-width:100%; max-height:250px; display:none; margin:0 auto;">
 <div id="origPlaceholder" style="padding:2rem; color:var(--text-muted);">Original image appears here</div>
 </div>
 </div>
 <div class="preview-box" style="margin: 0;">
 <div class="preview-title" style="display:flex; justify-content:space-between;">
 <span id="outputFormatLabel">Converted</span>
 <span id="pngNewSize" style="font-weight:normal; font-size:0.85em; color:var(--text-muted);"></span>
 </div>
 <div style="text-align:center;">
 <img id="pngPreview" style="max-width:100%; max-height:250px; display:none; margin:0 auto;">
 <div id="pngPlaceholder" style="padding:2rem; color:var(--text-muted);">Converted image appears here</div>
 </div>
 </div>
 </div>

 <button id="downloadPngBtn" class="download-btn" disabled style="margin-top:1rem;"> Download Converted Image</button>
 <button id="downloadAllZipBtn" class="download-btn" disabled style="margin-top:1rem; display:none;"> Download All as ZIP</button>
 `;

 const inp = document.getElementById('anyImgInput');
 const dropZone = document.getElementById('imgPngDropZone');
 const conv = document.getElementById('toPngBtn');
 const origPrev = document.getElementById('origPreview');
 const origHolder = document.getElementById('origPlaceholder');
 const imgPrev = document.getElementById('pngPreview');
 const placeholder = document.getElementById('pngPlaceholder');
 const dPng = document.getElementById('downloadPngBtn');
 let convertedExt = 'png';
 const dZip = document.getElementById('downloadAllZipBtn');
 const maxWidthSel = document.getElementById('pngMaxWidth');
 const formatSel = document.getElementById('outputFormatImg');
 const qualitySlider= document.getElementById('imgQualitySlider');
 const qualityLabel = document.getElementById('qualityLabel');
 const qualitySizeEst = document.getElementById('qualitySizeEst');
 const origSizeSpan = document.getElementById('imgOrigSize');
 const newSizeSpan = document.getElementById('pngNewSize');
 const bgColorInput = document.getElementById('imgBgColor');
 const bgColorRow = document.getElementById('bgColorRow');
 const qualityRow = document.getElementById('qualityRow');
 const formatLabel = document.getElementById('outputFormatLabel');

 let convertedBlob = null;
 let originalFile = null;
 let currentImage = null;
 let batchBlobs = [];
 let batchFiles = null; // set when several files are selected
 let loadToken = 0; // guards against an older image finishing load late

 inp.addEventListener('change', () => {
 const files = Array.from(inp.files);
 if (!files.length) return;
 batchBlobs = [];
 dPng.disabled = true;
 dZip.style.display = 'none';
 dZip.disabled = true;
 convertedBlob = null;

 if (files.length > 1) {
 originalFile = files[0];
 origPrev.style.display = 'none';
 origHolder.textContent = `${files.length} files selected`;
 origHolder.style.display = 'block';
 imgPrev.style.display = 'none';
 placeholder.textContent = `Converted images appear here`;
 placeholder.style.display = 'block';
 origSizeSpan.textContent = `${files.length} files selected`;
 conv.disabled = false;

 batchFiles = files;
 currentImage = null;
 return;
 }
 originalFile = files[0];
 const fmtTag = (files[0].type.split('/')[1] || 'image').toUpperCase();
 origSizeSpan.textContent = `Original: ${formatFileSize(files[0].size)} (${fmtTag})`;
 if (window.showFileOnDropZone) showFileOnDropZone('imgPngDropZone', files[0]);

 const url = URL.createObjectURL(files[0]);
 origPrev.src = url;
 origPrev.style.display = 'block';
 origHolder.style.display = 'none';

 batchFiles = null;
 currentImage = null;
 conv.disabled = true; // enabled once the new image has decoded
 const token = ++loadToken;
 const imgEl = new Image();
 imgEl.onload = () => {
 if (token !== loadToken) return;
 currentImage = imgEl;
 conv.disabled = false;
 };
 imgEl.onerror = () => {
 if (token !== loadToken) return;
 if (window.showToast) showToast('This image format cannot be read by your browser.', 'error');
 };
 imgEl.src = url;

 dZip.style.display = 'none';
 imgPrev.style.display = 'none';
 placeholder.style.display = 'block';
 newSizeSpan.textContent = '';
 dPng.disabled = true;
 convertedBlob = null;
 });

 // This header was missing: its closing brace ended renderimg2png() early,
 // so everything below ran at page load, threw "formatSel is not defined",
 // and the Convert/Download/ZIP buttons and upload click were never wired.
 function updateFormatUI() {
 const fmt = formatSel.value;
 qualityRow.style.display = fmt === 'png' ? 'none' : 'block';
 bgColorRow.style.display = fmt === 'png' ? 'none' : 'block';
 formatLabel.textContent = fmt.toUpperCase() + ' Output';
 }
 formatSel.addEventListener('change', updateFormatUI);
 updateFormatUI();

 qualitySlider.addEventListener('input', () => {
 qualityLabel.textContent = qualitySlider.value;
 qualitySizeEst.textContent = '';
 });

 dropZone.addEventListener('click', () => inp.click());
 if (typeof setupDropZone === 'function') setupDropZone('imgPngDropZone', 'anyImgInput');

 // Decodes one file to an <img>; rejects instead of hanging if it can't load.
 function loadImageFile(file) {
 return new Promise((resolve, reject) => {
 const url = URL.createObjectURL(file);
 const img = new Image();
 img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
 img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Could not read "${file.name}"`)); };
 img.src = url;
 });
 }

 function renderToBlob(img, fmt, quality, maxW) {
 let tW = img.naturalWidth, tH = img.naturalHeight;
 if (maxW && tW > maxW) { tH = Math.round(tH * maxW / tW); tW = maxW; }
 const mimeType = fmt === 'jpeg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png';
 const c = document.createElement('canvas');
 c.width = tW; c.height = tH;
 const cx = c.getContext('2d');
 if (fmt !== 'png') { cx.fillStyle = bgColorInput.value; cx.fillRect(0, 0, tW, tH); }
 cx.drawImage(img, 0, 0, tW, tH);
 return new Promise((resolve, reject) => {
 c.toBlob(blob => {
 releaseCanvas(c);
 blob ? resolve(blob) : reject(new Error('Image is too large to convert in this browser.'));
 }, mimeType, fmt !== 'png' ? quality : undefined);
 });
 }

 async function convertBatch(files) {
 conv.disabled = true;
 conv.textContent = 'Converting...';
 batchBlobs = [];
 const fmt = formatSel.value;
 const quality = parseInt(qualitySlider.value, 10) / 100;
 const maxW = maxWidthSel.value !== 'none' ? parseInt(maxWidthSel.value, 10) : null;
 const usedNames = new Set();
 const failed = [];
 // Sequential: decoding every file at once as data URLs spiked memory,
 // and one unreadable file left the old counter-based version stuck forever.
 for (const file of files) {
 try {
 const img = await loadImageFile(file);
 const blob = await renderToBlob(img, fmt, quality, maxW);
 const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
 const ext = extensionForBlob(blob);
 let name = `${base}.${ext}`;
 for (let n = 2; usedNames.has(name.toLowerCase()); n++) name = `${base} (${n}).${ext}`;
 usedNames.add(name.toLowerCase());
 batchBlobs.push({ name, blob });
 } catch (err) {
 failed.push(file.name);
 }
 }
 conv.disabled = false;
 conv.textContent = 'Convert Images';
 placeholder.textContent = `${batchBlobs.length} images converted`;
 if (batchBlobs.length) {
 dZip.style.display = 'inline-block';
 dZip.disabled = false;
 }
 if (window.showToast) {
 if (failed.length) showToast(`Converted ${batchBlobs.length}; could not read: ${failed.join(', ')}`, 'warning');
 else showToast(`Converted ${batchBlobs.length} images. Download the ZIP.`);
 }
 }

 // One click handler for both modes. Previously batch mode set conv.onclick
 // while this listener also fired, re-converting a stale single image.
 conv.addEventListener('click', () => {
 if (batchFiles) { convertBatch(batchFiles); return; }
 if (!originalFile || !currentImage) return;

 conv.disabled = true;
 conv.innerHTML = ' Converting...';
 if (window.showSpinner) showSpinner('Converting image...');

 setTimeout(() => {
 try {
 const fmt = formatSel.value;
 const mimeType = fmt === 'jpeg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png';
 const quality = parseInt(qualitySlider.value) / 100;

 let targetW = currentImage.naturalWidth;
 let targetH = currentImage.naturalHeight;

 const maxW = maxWidthSel.value !== 'none' ? parseInt(maxWidthSel.value) : null;
 if (maxW && targetW > maxW) {
 targetH = Math.round(targetH * (maxW / targetW));
 targetW = maxW;
 }

 const canvas = document.createElement('canvas');
 canvas.width = targetW;
 canvas.height = targetH;
 const ctx = canvas.getContext('2d');
 if (fmt !== 'png') {
 ctx.fillStyle = bgColorInput.value;
 ctx.fillRect(0, 0, targetW, targetH);
 } else {
 ctx.clearRect(0, 0, targetW, targetH);
 }
 ctx.drawImage(currentImage, 0, 0, targetW, targetH);

 canvas.toBlob(blob => {
 if (!blob) {
 conv.disabled = false;
 conv.innerHTML = 'Convert Image';
 if (window.hideSpinner) hideSpinner();
 if (window.showToast) showToast('Image is too large to convert in this browser.', 'error');
 return;
 }
 convertedBlob = blob;
 convertedExt = extensionForBlob(blob);
 dPng.disabled = false;
 if (fmt === 'webp' && convertedExt !== 'webp' && window.showToast) {
 showToast('This browser cannot create WebP files, so PNG was produced instead.', 'warning');
 }

 // Preview the actual output blob instead of encoding a second time.
 if (imgPrev.dataset.objectUrl) URL.revokeObjectURL(imgPrev.dataset.objectUrl);
 const dataUrl = URL.createObjectURL(blob);
 imgPrev.dataset.objectUrl = dataUrl;
 imgPrev.src = dataUrl;
 imgPrev.style.display = 'block';
 placeholder.style.display = 'none';

 const sizeStr = formatFileSize(blob.size);
 const savings = ((1 - blob.size / originalFile.size) * 100).toFixed(1);
 newSizeSpan.textContent = `${sizeStr}`;
 qualitySizeEst.textContent = savings > 0 ? `(${savings}% smaller)` : `(${Math.abs(savings)}% larger)`;

 conv.disabled = false;
 conv.innerHTML = 'Convert Image';
 if (window.hideSpinner) hideSpinner();
 if (window.showToast) showToast(`Converted to ${fmt.toUpperCase()} - ${sizeStr}`);
 }, mimeType, fmt !== 'png' ? quality : undefined);

 } catch (e) {
 conv.disabled = false;
 conv.innerHTML = 'Convert Image';
 if (window.hideSpinner) hideSpinner();
 if (window.showToast) showToast('Conversion failed: ' + e.message, 'error');
 console.error(e);
 }
 }, 50);
 });

 dPng.addEventListener('click', () => {
 if (!convertedBlob || !originalFile) return;
 const ext = convertedExt; // matches the bytes actually produced
 const base = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name;
 downloadBlob(convertedBlob, `${base}.${ext}`);
 });
 dZip.addEventListener('click', async () => {
 if (!batchBlobs.length) return;
 dZip.disabled = true;
 dZip.innerHTML = ' Creating ZIP...';
 try {
 await loadScript('/vendor/jszip/jszip.min.js');
 const zip = new JSZip();
 batchBlobs.forEach(({ name, blob }) => zip.file(name, blob));
 const zipBlob = await zip.generateAsync({ type: 'blob' });
 downloadBlob(zipBlob, 'converted-images.zip');
 if (window.showToast) showToast('ZIP downloaded!');
 } catch (e) {
 if (window.showToast) showToast('ZIP creation failed: ' + e.message, 'error');
 console.error(e);
 }
 dZip.disabled = false;
 dZip.innerHTML = ' Download All as ZIP';
 });
}

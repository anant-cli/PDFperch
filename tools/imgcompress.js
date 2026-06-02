async function renderimgcompress(container) {
 try {
 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription('Compress images online - reduce JPG, PNG, WebP file size with quality and resize controls. 100% private, no uploads.');
 updatePageTitle('Image Compression Tool');

 area.innerHTML = `
 <h3> Image Compression</h3>
 <p class="tool-description">
 Reduce image file size with fine-grained quality and resize controls. Supports JPG, PNG, WebP, GIF, and AVIF.
 Everything happens in your browser - your images never leave your device.
 You can also <a href="/image-converter" target="_self">convert image formats</a> after compressing.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my image uploaded anywhere?</summary>
 <p>No. All compression happens locally in your browser using JavaScript. Your files never leave your device.</p>
 </details>
 <details>
 <summary>How much can I compress an image?</summary>
 <p>A JPEG at quality 80 is visually near-identical to quality 100 but typically 3 - 5 smaller. PNG savings depend on the image content - photos compress best as JPEG or WebP.</p>
 </details>
 <details>
 <summary>Why is the compressed file sometimes larger?</summary>
 <p>Already-optimised images (e.g. photos saved by a phone) can't be made smaller without visible quality loss. The tool will warn you and still let you download the result.</p>
 </details>
 </div>

 <div id="imgCompressDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
 <div style="font-size: 2rem; margin-bottom: 1rem;"></div>
 <p>Drag and drop an image here</p>
 <p class="note">or click to browse files - JPG, PNG, WebP, GIF, AVIF</p>
 <input type="file" id="imgCompressInput" accept="image/*" style="display: none;">
 </div>

 <div id="imgCompressFileInfo" style="display:none; background: var(--bg-input); border-radius: var(--r-md); padding: 1rem; margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-muted);">
 <div style="display:flex; flex-wrap:wrap; gap:1rem;">
 <span> <strong id="icFileName"> - </strong></span>
 <span> <strong id="icDimensions"> - </strong></span>
 <span> <strong id="icOrigSize"> - </strong></span>
 </div>
 </div>

 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
 <div class="input-group">
 <label for="icMaxWidth">Max Width</label>
 <select id="icMaxWidth">
 <option value="none" selected>Original size</option>
 <option value="1920">1920 px (1080p)</option>
 <option value="1280">1280 px (720p)</option>
 <option value="800">800 px</option>
 <option value="500">500 px</option>
 <option value="320">320 px</option>
 </select>
 </div>
 <div class="input-group">
 <label for="icFormat">Output Format</label>
 <select id="icFormat">
 <option value="same" selected>Same as input</option>
 <option value="image/jpeg">JPEG (photos, smallest)</option>
 <option value="image/png">PNG (lossless, transparency)</option>
 <option value="image/webp">WebP (best ratio, modern)</option>
 </select>
 </div>
 </div>

 <div class="input-group" style="margin-bottom: 1.5rem;">
 <label for="icQuality">Quality: <span id="icQualityLabel">82</span>%
 <span style="font-size:0.8em; color:var(--text-muted); margin-left:0.5rem;">
 (JPEG/WebP: 80 - 85% is near-lossless; PNG ignores quality)
 </span>
 </label>
 <input type="range" id="icQuality" min="10" max="100" value="82" style="width: 100%;">
 </div>

 <button id="icCompressBtn" class="primary" disabled>Compress Image</button>

 <div id="icProgressContainer" style="display:none; width:100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
 <div id="icProgressBar" style="width:0%; height:6px; background: var(--accent); border-radius:4px; transition: width 0.3s;"></div>
 </div>

 <div id="icStats" style="display:none; margin-top: 1.5rem; background: var(--bg-input); padding: 1rem; border-radius: var(--r-md); font-size: 0.9rem;">
 <div style="display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:0.75rem;">
 <div><strong>Original:</strong> <span id="icStatOrig"> - </span></div>
 <div><strong>Compressed:</strong> <span id="icStatComp"> - </span></div>
 <div><strong>Savings:</strong> <span id="icStatSavings"> - </span></div>
 </div>
 <div style="font-size:0.8rem; margin-bottom:0.25rem; color: var(--text-muted);">Before vs After</div>
 <div style="display:flex; gap:4px; align-items:center;">
 <div style="flex:1; background:var(--border); border-radius:3px; height:10px; overflow:hidden;">
 <div id="icBarBefore" style="height:100%; background:#e74c3c; border-radius:3px; width:100%;"></div>
 </div>
 <span id="icBarBeforeLabel" style="font-size:0.75rem; min-width:50px; text-align:right; color:#e74c3c;"></span>
 </div>
 <div style="display:flex; gap:4px; align-items:center; margin-top:4px;">
 <div style="flex:1; background:var(--border); border-radius:3px; height:10px; overflow:hidden;">
 <div id="icBarAfter" style="height:100%; background:#2ecc71; border-radius:3px; width:50%;"></div>
 </div>
 <span id="icBarAfterLabel" style="font-size:0.75rem; min-width:50px; text-align:right; color:#2ecc71;"></span>
 </div>
 </div>

 <button id="icDownloadBtn" class="download-btn" disabled style="margin-top:1rem;"> Download Compressed Image</button>
 `;
 const dropZone = document.getElementById('imgCompressDropZone');
 const inp = document.getElementById('imgCompressInput');
 const fileInfo = document.getElementById('imgCompressFileInfo');
 const icFileName = document.getElementById('icFileName');
 const icDims = document.getElementById('icDimensions');
 const icOrigSize = document.getElementById('icOrigSize');
 const maxWidthSel = document.getElementById('icMaxWidth');
 const formatSel = document.getElementById('icFormat');
 const qualSlider = document.getElementById('icQuality');
 const qualLabel = document.getElementById('icQualityLabel');
 const compBtn = document.getElementById('icCompressBtn');
 const progressCon = document.getElementById('icProgressContainer');
 const progressBar = document.getElementById('icProgressBar');
 const stats = document.getElementById('icStats');
 const statOrig = document.getElementById('icStatOrig');
 const statComp = document.getElementById('icStatComp');
 const statSavings = document.getElementById('icStatSavings');
 const dlBtn = document.getElementById('icDownloadBtn');

 let originalFile = null;
 let compressedBlob = null;
 let originalName = '';
 qualSlider.addEventListener('input', () => {
 qualLabel.textContent = qualSlider.value;
 });
 dropZone.addEventListener('click', () => inp.click());
 if (typeof setupDropZone === 'function') {
 setupDropZone('imgCompressDropZone', 'imgCompressInput', handleFile);
 }

 inp.addEventListener('change', () => {
 if (inp.files[0]) handleFile(inp.files[0]);
 });

 function handleFile(file) {
 if (!file || !file.type.startsWith('image/')) {
 if (window.showToast) showToast('Please select a valid image file.', 'error');
 return;
 }

 originalFile = file;
 originalName = file.name;
 compressedBlob = null;
 dlBtn.disabled = true;
 stats.style.display = 'none';

 if (window.showFileOnDropZone) showFileOnDropZone('imgCompressDropZone', file);

 icFileName.textContent = file.name;
 icOrigSize.textContent = formatFileSize(file.size);
 fileInfo.style.display = 'block';
 const url = URL.createObjectURL(file);
 const img = new Image();
 img.onload = () => {
 icDims.textContent = `${img.naturalWidth} ${img.naturalHeight} px`;
 URL.revokeObjectURL(url);
 };
 img.src = url;

 compBtn.disabled = false;
 }
 compBtn.addEventListener('click', async () => {
 if (!originalFile) return;

 compBtn.disabled = true;
 compBtn.textContent = ' Compressing';
 dlBtn.disabled = true;
 stats.style.display = 'none';
 progressCon.style.display = 'block';
 progressBar.style.width = '10%';
 if (window.showSpinner) showSpinner('Compressing image');

 try {
 const quality = parseInt(qualSlider.value) / 100;
 const maxWVal = maxWidthSel.value;
 const maxW = maxWVal === 'none' ? null : parseInt(maxWVal);
 const fmtVal = formatSel.value;
 const outputMime = fmtVal === 'same' ? originalFile.type : fmtVal;
 const safeMime = ['image/jpeg', 'image/png', 'image/webp'].includes(outputMime)
 ? outputMime : 'image/png';

 progressBar.style.width = '50%';
 const blob = await canvasFallbackCompress(originalFile, safeMime, quality, maxW);
 progressBar.style.width = '90%';

 progressBar.style.width = '100%';
 compressedBlob = blob;
 const origBytes = originalFile.size;
 const compBytes = blob.size;
 const savedBytes = origBytes - compBytes;
 const reduction = ((savedBytes / origBytes) * 100).toFixed(1);
 const ratio = compBytes / origBytes;

 statOrig.textContent = formatFileSize(origBytes);
 statComp.textContent = formatFileSize(compBytes);
 statSavings.textContent = savedBytes > 0
 ? `${reduction}% smaller (${formatFileSize(savedBytes)} saved)`
 : `File grew by ${formatFileSize(-savedBytes)} - image was already well-optimised`;

 document.getElementById('icBarBefore').style.width = '100%';
 document.getElementById('icBarAfter').style.width = `${Math.min(100, ratio * 100).toFixed(1)}%`;
 document.getElementById('icBarBeforeLabel').textContent = formatFileSize(origBytes);
 document.getElementById('icBarAfterLabel').textContent = formatFileSize(compBytes);
 stats.style.display = 'block';

 dlBtn.disabled = false;

 if (savedBytes < 0) {
 if (window.showToast) showToast('Image is already optimised - no size reduction possible. You can still download the result.', 'warning');
 } else {
 if (window.showToast) showToast(`Compressed! Saved ${formatFileSize(savedBytes)} (${reduction}% smaller)`);
 }

 } catch (e) {
 if (window.showToast) showToast('Compression failed: ' + e.message, 'error');
 console.error(e);
 } finally {
 compBtn.disabled = false;
 compBtn.textContent = 'Compress Image';
 progressCon.style.display = 'none';
 progressBar.style.width = '0%';
 if (window.hideSpinner) hideSpinner();
 }
 });
 dlBtn.addEventListener('click', () => {
 if (!compressedBlob || !originalName) return;
 const fmtVal = formatSel.value;
 const mime = fmtVal === 'same' ? originalFile.type : fmtVal;
 const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
 const ext = extMap[mime] || 'png';
 const base = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
 downloadBlob(compressedBlob, `compressed-${base}.${ext}`);
 });
 function canvasFallbackCompress(file, mime, quality, maxW) {
 return new Promise((resolve, reject) => {
 const url = URL.createObjectURL(file);
 const img = new Image();
 img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
 img.onload = () => {
 URL.revokeObjectURL(url);
 let w = img.naturalWidth;
 let h = img.naturalHeight;
 if (maxW && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }

 const canvas = document.createElement('canvas');
 canvas.width = w; canvas.height = h;
 const ctx = canvas.getContext('2d');
 if (mime !== 'image/png') {
 ctx.fillStyle = '#ffffff';
 ctx.fillRect(0, 0, w, h);
 }
 ctx.imageSmoothingEnabled = true;
 ctx.imageSmoothingQuality = 'high';
 ctx.drawImage(img, 0, 0, w, h);
 canvas.toBlob(blob => {
 if (blob) resolve(blob);
 else reject(new Error('Canvas toBlob returned null'));
 }, mime, mime !== 'image/png' ? quality : undefined);
 };
 img.src = url;
 });
 }

 } catch (___err) {
 console.error('renderimgcompress error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}



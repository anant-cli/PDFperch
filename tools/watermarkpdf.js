async function renderwatermarkpdf(container) {
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

 updateMetaDescription("Add text or image watermarks to PDF pages. Tile mode, opacity control, color picker. 100% private, no uploads.");
 updatePageTitle("PDF Watermark Tool");

 area.innerHTML = `
 <h3> PDF Watermark</h3>
 <p class="tool-description">
 Add text or image watermarks to your PDF pages. Control position, opacity, color, and use tile mode
 for full-page coverage. Preview changes before applying.
 After watermarking, you can also <a href="/pages/pdfencrypt.html" target="_self">password protect your PDF</a>.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my file uploaded to a server?</summary>
 <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
 </details>
 <details>
 <summary>What is Tile mode?</summary>
 <p>Tile mode repeats the watermark text in a grid across the entire page - ideal for confidential documents.</p>
 </details>
 </div>

 <div id="watermarkPdfDropZone" class="drop-zone" style="border: 2px dashed var(--border-subtle); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
 <div style="font-size: 2rem; margin-bottom: 1rem;"></div>
 <p>Drag and drop a .pdf file here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="watermarkPdfInput" accept=".pdf" style="display: none;">
 </div>

 <div id="watermarkControls" style="display: none; margin: 1rem 0;">

 <div class="input-group" style="margin-bottom:1rem;">
 <label for="watermarkMode">Watermark Type</label>
 <select id="watermarkMode">
 <option value="text">Text Watermark</option>
 <option value="image">Image Watermark (PNG)</option>
 </select>
 </div>

 
 <div id="textWatermarkOptions">
 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
 <div class="input-group">
 <label for="watermarkText">Watermark Text</label>
 <input id="watermarkText" type="text" placeholder="CONFIDENTIAL" value="CONFIDENTIAL">
 </div>
 <div class="input-group">
 <label for="watermarkPosition">Position</label>
 <select id="watermarkPosition">
 <option value="center">Center Diagonal</option>
 <option value="tile">Tile (Full Page Grid)</option>
 <option value="top-left">Top Left</option>
 <option value="top-right">Top Right</option>
 <option value="bottom-left">Bottom Left</option>
 <option value="bottom-right">Bottom Right</option>
 </select>
 </div>
 </div>
 <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
 <div class="input-group">
 <label for="watermarkFontSize">Font Size: <span id="fontSizeValue">48</span></label>
 <input id="watermarkFontSize" type="range" min="12" max="120" value="48">
 </div>
 <div class="input-group">
 <label for="watermarkOpacity">Opacity: <span id="opacityValue">50</span>%</label>
 <input id="watermarkOpacity" type="range" min="10" max="100" value="50">
 </div>
 <div class="input-group">
 <label for="watermarkColor">Color</label>
 <input id="watermarkColor" type="color" value="#ff0000">
 </div>
 </div>
 </div>

 
 <div id="imageWatermarkOptions" style="display:none;">
 <div class="input-group" style="margin-bottom:1rem;">
 <label for="watermarkImageInput">Upload PNG Logo/Image</label>
 <input type="file" id="watermarkImageInput" accept=".png,image/png" style="color: var(--text-primary);">
 <p class="note">PNG with transparency works best. The image will be centered on each page.</p>
 </div>
 <div class="input-group">
 <label for="imageOpacity">Image Opacity: <span id="imageOpacityValue">50</span>%</label>
 <input id="imageOpacity" type="range" min="10" max="100" value="50">
 </div>
 </div>

 <div style="margin-bottom: 1rem;">
 <label><input type="checkbox" id="watermarkAllPages" checked> Apply to all pages</label>
 </div>

 <div id="watermarkPreview" style="border: 1px solid var(--border); padding: 1rem; margin-bottom: 1rem; display: none; border-radius: 6px;">
 <h4 style="margin-bottom:0.5rem; font-size:0.9rem;">Preview (First Page)</h4>
 <canvas id="previewCanvas" style="max-width: 100%; border: 1px solid var(--border); border-radius:4px;"></canvas>
 </div>
 </div>

 <button id="watermarkPdfBtn" class="primary" disabled>Apply Watermark</button>

 <div id="watermarkProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
 <div id="watermarkProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
 </div>

 <div class="preview-box" id="watermarkProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>

 <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
 <button id="downloadWatermarkBtn" class="download-btn" disabled> Download Watermarked PDF</button>
 </div>
 `;

 const inp = document.getElementById('watermarkPdfInput');
 const dropZone = document.getElementById('watermarkPdfDropZone');
 const controls = document.getElementById('watermarkControls');
 const btn = document.getElementById('watermarkPdfBtn');
 const progressDiv = document.getElementById('watermarkProgress');
 const progressContainer = document.getElementById('watermarkProgressContainer');
 const progressBar = document.getElementById('watermarkProgressBar');
 const downloadBtn = document.getElementById('downloadWatermarkBtn');
 const previewCanvas = document.getElementById('previewCanvas');
 const previewDiv = document.getElementById('watermarkPreview');
 const modeSel = document.getElementById('watermarkMode');
 const textOpts = document.getElementById('textWatermarkOptions');
 const imageOpts = document.getElementById('imageWatermarkOptions');
 const imageInput = document.getElementById('watermarkImageInput');

 let currentPdf = null;
 let currentPdfJs = null;
 let currentFileName = 'document';
 let watermarkImageBytes = null;
 modeSel.addEventListener('change', () => {
 const isImage = modeSel.value === 'image';
 textOpts.style.display = isImage ? 'none' : 'block';
 imageOpts.style.display = isImage ? 'block' : 'none';
 updatePreview();
 });
 imageInput.addEventListener('change', async () => {
 const f = imageInput.files[0];
 if (!f) return;
 watermarkImageBytes = await f.arrayBuffer();
 updatePreview();
 });

 document.getElementById('imageOpacity').addEventListener('input', e => {
 document.getElementById('imageOpacityValue').textContent = e.target.value;
 updatePreview();
 });
 document.getElementById('watermarkFontSize').addEventListener('input', e => {
 document.getElementById('fontSizeValue').textContent = e.target.value;
 updatePreview();
 });
 document.getElementById('watermarkOpacity').addEventListener('input', e => {
 document.getElementById('opacityValue').textContent = e.target.value;
 updatePreview();
 });
 document.getElementById('watermarkText').addEventListener('input', updatePreview);
 document.getElementById('watermarkPosition').addEventListener('change', updatePreview);
 document.getElementById('watermarkColor').addEventListener('input', updatePreview);
 async function updatePreview() {
 if (!currentPdfJs) return;
 const canvas = previewCanvas;
 const ctx = canvas.getContext('2d');

 try {
 const page = await currentPdfJs.getPage(1);
 const viewport = page.getViewport({ scale: 0.5 });
 canvas.width = viewport.width;
 canvas.height = viewport.height;
 await page.render({ canvasContext: ctx, viewport }).promise;

 if (modeSel.value === 'image' && watermarkImageBytes) {
 const blob = new Blob([watermarkImageBytes], { type: 'image/png' });
 const url = URL.createObjectURL(blob);
 const img = await new Promise((res, rej) => {
 const i = new Image();
 i.onload = () => res(i);
 i.onerror = rej;
 i.src = url;
 });
 const opacity = parseInt(document.getElementById('imageOpacity').value) / 100;
 const scale = Math.min(canvas.width * 0.5 / img.width, canvas.height * 0.5 / img.height);
 const w = img.width * scale;
 const h = img.height * scale;
 ctx.save();
 ctx.globalAlpha = opacity;
 ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
 ctx.restore();
 URL.revokeObjectURL(url);
 } else {
 const text = document.getElementById('watermarkText').value || 'CONFIDENTIAL';
 const fontSize = parseInt(document.getElementById('watermarkFontSize').value) * 0.5;
 const opacity = parseInt(document.getElementById('watermarkOpacity').value) / 100;
 const color = document.getElementById('watermarkColor').value;
 const position = document.getElementById('watermarkPosition').value;

 ctx.save();
 ctx.globalAlpha = opacity;
 ctx.fillStyle = color;
 ctx.font = `${fontSize}px Arial`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';

 if (position === 'center') {
 ctx.save();
 ctx.translate(canvas.width / 2, canvas.height / 2);
 ctx.rotate(-Math.PI / 4);
 ctx.fillText(text, 0, 0);
 ctx.restore();
 } else if (position === 'tile') {
 const stepX = Math.max(canvas.width / 3, 80);
 const stepY = Math.max(canvas.height / 4, 60);
 for (let tx = stepX / 2; tx < canvas.width; tx += stepX) {
 for (let ty = stepY / 2; ty < canvas.height; ty += stepY) {
 ctx.save();
 ctx.translate(tx, ty);
 ctx.rotate(-Math.PI / 6);
 ctx.fillText(text, 0, 0);
 ctx.restore();
 }
 }
 } else {
 let x, y;
 const pad = fontSize;
 switch (position) {
 case 'top-left': x = pad; y = pad; break;
 case 'top-right': x = canvas.width - pad; y = pad; break;
 case 'bottom-left': x = pad; y = canvas.height - pad; break;
 case 'bottom-right': x = canvas.width - pad; y = canvas.height - pad; break;
 }
 ctx.fillText(text, x, y);
 }
 ctx.restore();
 }

 previewDiv.style.display = 'block';
 } catch (e) {
 console.error('Preview error:', e);
 }
 }
 dropZone.addEventListener('click', () => inp.click());
 if (typeof setupDropZone === 'function') setupDropZone('watermarkPdfDropZone', 'watermarkPdfInput');

 inp.addEventListener('change', async () => {
 const file = inp.files[0];
 if (!file) return;

 currentPdf = null;
 currentPdfJs = null;
 controls.style.display = 'none';
 previewDiv.style.display = 'none';
 btn.disabled = true;
 downloadBtn.disabled = true;

 if (window.showFileOnDropZone) showFileOnDropZone('watermarkPdfDropZone', file);
 currentFileName = file.name;

 try {
 const arrayBuf = await file.arrayBuffer();
 currentPdf = await PDFLib.PDFDocument.load(arrayBuf);
 currentPdfJs = await pdfjsLib.getDocument({ data: arrayBuf }).promise;

 controls.style.display = 'block';
 btn.disabled = false;
 updatePreview();

 if (window.showToast) showToast(`Loaded PDF with ${currentPdf.getPageCount()} pages`);
 } catch (e) {
 if (window.showToast) showToast('Failed to load PDF: ' + e.message, 'error');
 console.error(e);
 }
 });

 btn.addEventListener('click', async () => {
 if (!currentPdf) return;

 btn.disabled = true;
 btn.innerHTML = ' Applying watermark...';
 progressDiv.style.display = 'block';
 progressDiv.innerHTML = 'Adding watermarks...';
 progressContainer.style.display = 'block';
 progressBar.style.width = '0%';
 downloadBtn.disabled = true;

 try {
 const allPagesChk = document.getElementById('watermarkAllPages').checked;
 const pages = currentPdf.getPages();
 const pagesToProcess = allPagesChk ? pages : [pages[0]];

 if (modeSel.value === 'image') {
 if (!watermarkImageBytes) throw new Error('Please upload a PNG image first.');
 const opacity = parseInt(document.getElementById('imageOpacity').value) / 100;
 const pngImage = await currentPdf.embedPng(watermarkImageBytes);

 for (let i = 0; i < pagesToProcess.length; i++) {
 const page = pagesToProcess[i];
 const { width, height } = page.getSize();
 const scale = Math.min((width * 0.5) / pngImage.width, (height * 0.5) / pngImage.height);
 const imgW = pngImage.width * scale;
 const imgH = pngImage.height * scale;
 page.drawImage(pngImage, {
 x: (width - imgW) / 2,
 y: (height - imgH) / 2,
 width: imgW,
 height: imgH,
 opacity
 });
 progressBar.style.width = `${((i + 1) / pagesToProcess.length) * 100}%`;
 if (typeof yieldToMainThread === 'function') await yieldToMainThread();
 }
 } else {
 const text = document.getElementById('watermarkText').value || 'CONFIDENTIAL';
 const fontSize = parseInt(document.getElementById('watermarkFontSize').value);
 const opacity = parseInt(document.getElementById('watermarkOpacity').value) / 100;
 const colorHex = document.getElementById('watermarkColor').value;
 const position = document.getElementById('watermarkPosition').value;

 const r = parseInt(colorHex.slice(1, 3), 16) / 255;
 const g = parseInt(colorHex.slice(3, 5), 16) / 255;
 const b = parseInt(colorHex.slice(5, 7), 16) / 255;
 const color = PDFLib.rgb(r, g, b);

 const font = await currentPdf.embedFont(PDFLib.StandardFonts.Helvetica);

 for (let i = 0; i < pagesToProcess.length; i++) {
 const page = pagesToProcess[i];
 const { width, height } = page.getSize();

 if (position === 'tile') {
 const textWidth = font.widthOfTextAtSize(text, fontSize);
 const cols = Math.ceil(width / (textWidth + 40)) + 1;
 const rows = Math.ceil(height / (fontSize + 60)) + 1;
 const stepX = (width + 40) / cols;
 const stepY = (height + 60) / rows;

 for (let col = 0; col < cols; col++) {
 for (let row = 0; row < rows; row++) {
 page.drawText(text, {
 x: col * stepX,
 y: row * stepY,
 size: fontSize,
 font,
 color,
 opacity,
 rotate: PDFLib.degrees(-30)
 });
 }
 }
 if (typeof yieldToMainThread === 'function') await yieldToMainThread();
 } else {
 let x, y, rotate = PDFLib.degrees(0);
 const textWidth = font.widthOfTextAtSize(text, fontSize);
 const pad = fontSize;

 switch (position) {
 case 'center':
 x = (width - textWidth) / 2;
 y = (height - fontSize) / 2;
 rotate = PDFLib.degrees(45);
 break;
 case 'top-left': x = pad; y = height - pad - fontSize; break;
 case 'top-right': x = width - textWidth - pad; y = height - pad - fontSize; break;
 case 'bottom-left': x = pad; y = pad; break;
 case 'bottom-right': x = width - textWidth - pad; y = pad; break;
 default: x = (width - textWidth) / 2; y = (height - fontSize) / 2;
 }

 page.drawText(text, { x, y, size: fontSize, font, color, opacity, rotate });
 }

 progressBar.style.width = `${((i + 1) / pagesToProcess.length) * 100}%`;
 if (typeof yieldToMainThread === 'function') await yieldToMainThread();
 }
 }

 progressDiv.innerHTML = 'Saving PDF...';
 const pdfBytes = await currentPdf.save();
 const blob = new Blob([pdfBytes], { type: 'application/pdf' });

 progressBar.style.width = '100%';
 progressDiv.innerHTML = 'Done!';
 downloadBtn.disabled = false;

 const wmBase = currentFileName.replace(/\.pdf$/i, '') || 'document';
 downloadBtn.onclick = () => downloadBlob(blob, `${wmBase}-watermarked.pdf`);

 if (window.showToast) showToast(`Watermark applied to ${pagesToProcess.length} page(s)`);

 setTimeout(() => {
 progressContainer.style.display = 'none';
 progressBar.style.width = '0%';
 progressDiv.style.display = 'none';
 }, 2000);

 } catch (e) {
 progressDiv.textContent = `Error: ${e.message}`;
 if (window.showToast) showToast('Failed to add watermark: ' + e.message, 'error');
 console.error(e);
 } finally {
 btn.disabled = false;
 btn.innerHTML = 'Apply Watermark';
 }
 });

 } catch (___err) {
 console.error('renderwatermarkpdf error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




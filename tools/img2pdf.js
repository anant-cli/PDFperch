async function renderimg2pdf(container) {
 try {
 await loadScript('/vendor/pdf-lib/pdf-lib.min.js');

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Combine multiple JPG/PNG images into a single PDF. Autoorientation and page size control. 100% private, no uploads.");
 updatePageTitle("Images to PDF Converter");

 area.innerHTML = `
 <h3> Image to PDF</h3>
 <p class="tool-description">
 Convert JPG, PNG, WebP, and other images to a single PDF. Drag or use buttons to reorder your images before generating.
 </p>

 <div id="imgPdfDropZone" class="drop-zone">
 <div style="font-size: 2.5rem; margin-bottom: 0.5rem;"></div>
 <p>Drag & drop images or <strong>Click to browse</strong></p>
 <input type="file" id="imgFiles" accept="image/*" multiple style="display: none;">
 </div>

 <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap;">
 <div class="orientation-selector" style="margin: 0;">
 <label> <select id="imgPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
 <label> <select id="imgOrientation"><option value="auto">Auto</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
 <label> <select id="imgMargin"><option value="0">0px</option><option value="20">20px</option><option value="50">50px</option></select></label>
 <label>Fit <select id="imgFitMode"><option value="fit" selected>Fit to page</option><option value="fill">Fill page</option><option value="original">Original size</option></select></label>
 </div>
 <button id="clearAllBtn" class="secondary" style="min-width: unset; padding: 0.5rem 1rem; margin-left: auto;"> Clear All</button>
 </div>

 <div id="imagePreviewList" class="file-list" style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.6rem;"></div>

 <div id="imgProgressContainer" style="display:none; width: 100%; margin-bottom: 1.5rem;">
 <div class="progress-bar-bg" style="height: 6px;">
 <div id="imgProgressBar" class="progress-bar-fill" style="width: 0%;"></div>
 </div>
 </div>

 <button id="convertImgBtn" class="primary" style="width: 100%;" disabled> Generate PDF</button>

 <div class="preview-box" id="imgPreviewBox" style="display:none; margin-top: 1.5rem; padding: 0; border: 1px solid var(--border-subtle); overflow: hidden;">
 <div id="imgPreviewPlaceholder"></div>
 </div>

 <button id="downloadImgPdf" class="download-btn" style="width: 100%; margin-top: 1rem;" disabled> Download PDF</button>
 `;

 const input = document.getElementById('imgFiles');
 const dropZone = document.getElementById('imgPdfDropZone');
 const previewList = document.getElementById('imagePreviewList');
 const sizeSel = document.getElementById('imgPageSize');
 const orientSel = document.getElementById('imgOrientation');
 const marginSel = document.getElementById('imgMargin');
 const fitModeSel = document.getElementById('imgFitMode');
 const convertBtn = document.getElementById('convertImgBtn');
 const down = document.getElementById('downloadImgPdf');
 const previewBox = document.getElementById('imgPreviewBox');
 const previewPlaceholder = document.getElementById('imgPreviewPlaceholder');
 const progressContainer = document.getElementById('imgProgressContainer');
 const progressBar = document.getElementById('imgProgressBar');
 const clearAllBtn = document.getElementById('clearAllBtn');
 let filesArray = [];
 let previewObjectUrl = null;
 const isDataTransferSupported = typeof DataTransfer === 'function';

 clearAllBtn.addEventListener('click', () => {
 filesArray.forEach(f => { if (f.thumbUrl) URL.revokeObjectURL(f.thumbUrl); });
 filesArray = [];
 if (previewObjectUrl) {
 URL.revokeObjectURL(previewObjectUrl);
 previewObjectUrl = null;
 }
 renderPreviewList();
 previewBox.style.display = 'none';
 down.disabled = true;
 input.value = '';
 });
 dropZone.addEventListener('click', () => input.click());
 if (typeof setupDropZone === 'function') {
 setupDropZone('imgPdfDropZone', 'imgFiles');
 }

 function renderPreviewList() {
 previewList.innerHTML = '';
 filesArray.forEach((file, index) => {
 const item = document.createElement('div');
 item.className = 'file-item';
 item.style.padding = '0.75rem';
 item.draggable = isDataTransferSupported;
 item.dataset.index = index;

 if (!file.thumbUrl) {
 file.thumbUrl = URL.createObjectURL(file);
 }
 item.innerHTML = `
 <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
 <img src="${file.thumbUrl}" class="img-thumbnail" style="width: 50px; height: 50px; border-radius: 8px;">
 <div style="overflow: hidden;">
 <div style="font-weight: 600; font-size: 0.9rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${escapeHtml(file.name)}</div>
 <div style="font-size: 0.85rem; color: var(--text-muted);">${formatFileSize(file.size)}</div>
 </div>
 </div>
 <div class="file-actions" style="gap: 0.4rem;">
 ${isDataTransferSupported ? `
 <button class="secondary ${index === 0 ? 'hidden' : ''}" style="min-width: unset; padding: 0.4rem; font-size: 0.8rem;">Up</button>
 <button class="secondary ${index === filesArray.length - 1 ? 'hidden' : ''}" style="min-width: unset; padding: 0.4rem; font-size: 0.8rem;">Down</button>
 ` : ''}
 <button class="secondary" style="min-width: unset; padding: 0.4rem; font-size: 0.8rem; color: #f87171;">Remove</button>
 </div>
 `;

 const buttons = item.querySelectorAll('button');
 const upBtn = isDataTransferSupported ? buttons[0] : null;
 const downBtn = isDataTransferSupported ? buttons[1] : null;
 const delBtn = isDataTransferSupported ? buttons[2] : buttons[0];

 if (isDataTransferSupported) {
 item.addEventListener('dragstart', e => {
 e.dataTransfer.setData('text/plain', String(index));
 item.style.opacity = '0.6';
 });
 item.addEventListener('dragend', () => {
 item.style.opacity = '';
 });
 item.addEventListener('dragover', e => {
 e.preventDefault();
 item.style.borderColor = 'var(--accent)';
 });
 item.addEventListener('dragleave', () => {
 item.style.borderColor = '';
 });
 item.addEventListener('drop', e => {
 e.preventDefault();
 item.style.borderColor = '';
 const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
 if (Number.isNaN(from) || from === index) return;
 const [moved] = filesArray.splice(from, 1);
 filesArray.splice(index, 0, moved);
 renderPreviewList();
 });

 if (upBtn) upBtn.addEventListener('click', () => {
 [filesArray[index - 1], filesArray[index]] = [filesArray[index], filesArray[index - 1]];
 renderPreviewList();
 });

 if (downBtn) downBtn.addEventListener('click', () => {
 [filesArray[index], filesArray[index + 1]] = [filesArray[index + 1], filesArray[index]];
 renderPreviewList();
 });
 }

 delBtn.addEventListener('click', () => {
 if (filesArray[index].thumbUrl) {
 URL.revokeObjectURL(filesArray[index].thumbUrl);
 }
 filesArray.splice(index, 1);
 renderPreviewList();
 if (isDataTransferSupported) {
 const dt = new DataTransfer();
 filesArray.forEach(f => dt.items.add(f));
 input.files = dt.files;
 } else {
 input.value = '';
 }
 });

 previewList.appendChild(item);
 });
 convertBtn.disabled = filesArray.length === 0;
 }

 input.addEventListener('change', () => {
 if (input.files.length > 0) {
 if (!isDataTransferSupported && filesArray.length === 0) {
 if (window.showToast) showToast('File reordering is not supported in this browser — files will be merged in selection order.', 'info');
 }
 const newFiles = Array.from(input.files);
 filesArray = [...filesArray, ...newFiles];
 renderPreviewList();
 previewBox.style.display = 'none';
 down.disabled = true;
 }
 });
 // Returns the EXIF orientation (1-8) of a JPEG, or 1 if absent/unreadable.
 function getJpegOrientation(buffer) {
 try {
 const view = new DataView(buffer);
 if (view.getUint16(0) !== 0xFFD8) return 1;
 let offset = 2;
 while (offset + 4 <= view.byteLength) {
 const marker = view.getUint16(offset);
 const size = view.getUint16(offset + 2);
 if (marker === 0xFFE1 && view.getUint32(offset + 4) === 0x45786966) { // "Exif"
 const tiff = offset + 10;
 const little = view.getUint16(tiff) === 0x4949;
 const ifd0 = tiff + view.getUint32(tiff + 4, little);
 const entries = view.getUint16(ifd0, little);
 for (let i = 0; i < entries; i++) {
 const entry = ifd0 + 2 + i * 12;
 if (view.getUint16(entry, little) === 0x0112) {
 const value = view.getUint16(entry + 8, little);
 return value >= 1 && value <= 8 ? value : 1;
 }
 }
 return 1;
 }
 if ((marker & 0xFF00) !== 0xFF00 || marker === 0xFFDA) break; // start of scan
 offset += 2 + size;
 }
 } catch (e) { /* malformed EXIF: treat as upright */ }
 return 1;
 }

 // Draws the image through a canvas. Browsers apply EXIF orientation when
 // drawing an <img>, so the result is upright. Used for formats pdf-lib can't
 // embed and for rotated phone photos (raw JPEG bytes would come out sideways).
 function reencodeViaCanvas(file, mime, quality) {
 return new Promise((resolve, reject) => {
 const img = new Image();
 const url = URL.createObjectURL(file);
 img.onload = () => {
 const canvas = document.createElement('canvas');
 canvas.width = img.naturalWidth;
 canvas.height = img.naturalHeight;
 const ctx = canvas.getContext('2d');
 if (mime === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
 ctx.drawImage(img, 0, 0);
 canvas.toBlob(blob => {
 URL.revokeObjectURL(url);
 releaseCanvas(canvas);
 if (!blob) { reject(new Error(`"${file.name}" is too large to process in this browser.`)); return; }
 blob.arrayBuffer().then(resolve).catch(reject);
 }, mime, quality);
 };
 img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Could not read "${file.name}".`)); };
 img.src = url;
 });
 }

 convertBtn.addEventListener('click', async () => {
 if (filesArray.length === 0) {
 if (window.showToast) showToast('Please select at least one image.', 'warning');
 else alert('Please select at least one image.');
 return;
 }
 convertBtn.disabled = true;
 convertBtn.innerHTML = ' Generating PDF...';
 if (window.showSpinner) showSpinner('Generating PDF...');
 progressContainer.style.display = 'block';
 progressBar.style.width = '0%';
 previewBox.style.display = 'block';
 previewPlaceholder.innerHTML = 'Converting images...';

 try {
 const { PDFDocument } = PDFLib;
 const pdfDoc = await PDFDocument.create();
 const margin = parseInt(marginSel.value, 10);

 for (let i = 0; i < filesArray.length; i++) {
 const file = filesArray[i];
 convertBtn.innerHTML = ` Processing image ${i + 1} of ${filesArray.length}...`;
 progressBar.style.width = `${(i / filesArray.length) * 100}%`;

 let imgBytes;
 let image;
 if (file.type === 'image/png') {
 imgBytes = await file.arrayBuffer();
 image = await pdfDoc.embedPng(imgBytes);
 } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
 imgBytes = await file.arrayBuffer();
 if (getJpegOrientation(imgBytes) !== 1) {
 // Rotated phone photo: bake the orientation into the pixels.
 imgBytes = await reencodeViaCanvas(file, 'image/jpeg', 0.92);
 }
 image = await pdfDoc.embedJpg(imgBytes);
 } else {
 // WebP, GIF, BMP, unknown type: convert to PNG first.
 imgBytes = await reencodeViaCanvas(file, 'image/png');
 image = await pdfDoc.embedPng(imgBytes);
 }
 const dims = image.scale(1);
 let orientation = orientSel.value;
 if (orientation === 'auto') {
 orientation = dims.width > dims.height ? 'landscape' : 'portrait';
 }
 const stdSizes = { a4: [595, 842], letter: [612, 792] };
 let [stdW, stdH] = stdSizes[sizeSel.value];
 if (orientation === 'landscape' && stdW < stdH) [stdW, stdH] = [stdH, stdW];
 if (orientation === 'portrait' && stdW > stdH) [stdW, stdH] = [stdH, stdW];

 const page = pdfDoc.addPage([stdW, stdH]);
 const contentW = stdW - (margin * 2);
 const contentH = stdH - (margin * 2);

 let scaled;
 if (fitModeSel.value === 'fill') {
 const fillScale = Math.max(contentW / dims.width, contentH / dims.height);
 scaled = { width: dims.width * fillScale, height: dims.height * fillScale };
 } else if (fitModeSel.value === 'original') {
 const ratio = Math.min(1, contentW / dims.width, contentH / dims.height);
 scaled = { width: dims.width * ratio, height: dims.height * ratio };
 } else {
 scaled = image.scaleToFit(contentW, contentH);
 }
 page.drawImage(image, {
 x: margin + (contentW - scaled.width) / 2,
 y: margin + (contentH - scaled.height) / 2,
 width: scaled.width,
 height: scaled.height,
 });
 }

 progressBar.style.width = '100%';
 convertBtn.innerHTML = ' Saving...';

 const pdfBytes = await pdfDoc.save();
 const blob = new Blob([pdfBytes], { type: 'application/pdf' });
 window.currentPdfBlob = blob;
 down.disabled = false;
 if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
 previewObjectUrl = URL.createObjectURL(blob);
 previewPlaceholder.innerHTML = `<iframe src="${previewObjectUrl}" style="width:100%; height:400px;" frameborder="0"></iframe>`;

 convertBtn.disabled = false;
 convertBtn.innerHTML = ' Generate PDF';
 setTimeout(() => {
 progressContainer.style.display = 'none';
 progressBar.style.width = '0%';
 }, 2000);

 if (window.showToast) showToast('PDF generated successfully!');
 } catch (error) {
 console.error('PDF generation error:', error);
 if (window.showToast) showToast('Failed to generate PDF: ' + error.message, 'error');
 else alert('Failed to generate PDF: ' + error.message);
 previewPlaceholder.innerHTML = 'Error generating PDF.';
 convertBtn.disabled = false;
 convertBtn.innerHTML = ' Generate PDF';
 progressContainer.style.display = 'none';
 } finally {
 if (window.hideSpinner) hideSpinner();
 }
 });

 down.addEventListener('click', () => {
 if (window.currentPdfBlob) {
 downloadBlob(window.currentPdfBlob, 'combined-images.pdf');
 }
 });
 } catch (___err) {
 console.error('renderimg2pdf error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




async function renderpagenumbers(container) {
 try {
 await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Add page numbers to PDF documents. Customize position, format, color, and skip cover pages. 100% private, no uploads.");
 updatePageTitle("PDF Page Numbering Tool");

 area.innerHTML = `
 <h3> Add Page Numbers</h3>
 <p class="tool-description">
 Add page numbers to your PDF documents. Customize position, format, color, font size, and skip cover pages.
 Perfect for professional documents, reports, and presentations.
 After adding page numbers, you can also <a href="/pdf-password" target="_self">password protect your PDF</a>.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my file uploaded to a server?</summary>
 <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
 </details>
 <details>
 <summary>What does "Skip first N pages" do?</summary>
 <p>Skips the first N pages (e.g. cover, table of contents). Numbering starts from page N+1 but the counter starts at your chosen start number.</p>
 </details>
 <details>
 <summary>Why are my center-aligned numbers off-center?</summary>
 <p>We use precise font metrics to calculate exact text width, so numbers are always perfectly centered.</p>
 </details>
 </div>

 <div id="pageNumbersPdfDropZone" class="drop-zone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
 <div style="font-size: 2rem; margin-bottom: 1rem;"></div>
 <p>Drag and drop a .pdf file here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="pageNumbersPdfInput" accept=".pdf" style="display: none;">
 </div>

 <div id="pageNumbersControls" style="display: none; margin: 1rem 0;">
 <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
 <div class="input-group">
 <label for="pageNumberPosition">Position</label>
 <select id="pageNumberPosition">
 <option value="bottom-center">Bottom Center</option>
 <option value="bottom-right">Bottom Right</option>
 <option value="bottom-left">Bottom Left</option>
 <option value="top-center">Top Center</option>
 <option value="top-right">Top Right</option>
 <option value="top-left">Top Left</option>
 </select>
 </div>
 <div class="input-group">
 <label for="pageNumberStart">Start Number</label>
 <input id="pageNumberStart" type="number" min="1" value="1">
 </div>
 <div class="input-group">
 <label for="pageNumberFormat">Format</label>
 <select id="pageNumberFormat">
 <option value="number">1</option>
 <option value="page">Page 1</option>
 <option value="total">1 of N</option>
 <option value="pageTotal">Page 1 of N</option>
 </select>
 </div>
 </div>
 <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
 <div class="input-group">
 <label for="pageNumberSize">Font Size</label>
 <select id="pageNumberSize">
 <option value="small">Small (10pt)</option>
 <option value="medium" selected>Medium (12pt)</option>
 <option value="large">Large (16pt)</option>
 </select>
 </div>
 <div class="input-group">
 <label for="pageNumberColor">Number Color</label>
 <select id="pageNumberColor">
 <option value="grey">Grey (default)</option>
 <option value="black">Black</option>
 <option value="blue">Blue</option>
 <option value="red">Red</option>
 </select>
 </div>
 <div class="input-group">
 <label for="pageNumberSkip">Skip First N Pages</label>
 <input id="pageNumberSkip" type="number" min="0" value="0" placeholder="0 = none">
 <p class="note">Skip cover/TOC pages</p>
 </div>
 </div>
 <div class="input-group">
 <label for="pageNumberMargin">Margin from Edge (pt)</label>
 <input id="pageNumberMargin" type="number" min="5" max="80" value="25">
 <p class="note">Distance from the page edge in PDF points (1pt 0.35mm). Default 25.</p>
 </div>
 </div>

 <button id="pageNumbersPdfBtn" class="primary" disabled>Add Page Numbers</button>

 <div id="pageNumbersProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
 <div id="pageNumbersProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
 </div>

 <div class="preview-box" id="pageNumbersProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>

 <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
 <button id="downloadPageNumbersBtn" class="download-btn" disabled> Download Numbered PDF</button>
 </div>
 `;

 const inp = document.getElementById('pageNumbersPdfInput');
 const dropZone = document.getElementById('pageNumbersPdfDropZone');
 const controls = document.getElementById('pageNumbersControls');
 const btn = document.getElementById('pageNumbersPdfBtn');
 const progressDiv = document.getElementById('pageNumbersProgress');
 const progressContainer = document.getElementById('pageNumbersProgressContainer');
 const progressBar = document.getElementById('pageNumbersProgressBar');
 const downloadBtn = document.getElementById('downloadPageNumbersBtn');

 let currentPdf = null;
 let currentFileName = 'document';
 dropZone.addEventListener('click', () => inp.click());
 if (typeof setupDropZone === 'function') {
 setupDropZone('pageNumbersPdfDropZone', 'pageNumbersPdfInput');
 }

 inp.addEventListener('change', async () => {
 const file = inp.files[0];
 if (!file) return;

 currentPdf = null;
 controls.style.display = 'none';
 btn.disabled = true;
 downloadBtn.disabled = true;

 if (window.showFileOnDropZone) showFileOnDropZone('pageNumbersPdfDropZone', file);
 currentFileName = file.name;

 try {
 const arrayBuf = await file.arrayBuffer();
 currentPdf = await PDFLib.PDFDocument.load(arrayBuf);

 controls.style.display = 'block';
 btn.disabled = false;

 if (window.showToast) showToast(`Loaded PDF with ${currentPdf.getPageCount()} pages`);
 } catch (e) {
 if (window.showToast) showToast('Failed to load PDF: ' + e.message, 'error');
 console.error(e);
 }
 });

 btn.addEventListener('click', async () => {
 if (!currentPdf) return;

 btn.disabled = true;
 btn.innerHTML = ' Adding page numbers...';
 progressDiv.style.display = 'block';
 progressDiv.innerHTML = 'Embedding font...';
 progressContainer.style.display = 'block';
 progressBar.style.width = '0%';
 downloadBtn.disabled = true;

 try {
 const position = document.getElementById('pageNumberPosition').value;
 const startNum = Math.max(1, parseInt(document.getElementById('pageNumberStart').value) || 1);
 const format = document.getElementById('pageNumberFormat').value;
 const size = document.getElementById('pageNumberSize').value;
 const colorKey = document.getElementById('pageNumberColor').value;
 const skipN = Math.max(0, parseInt(document.getElementById('pageNumberSkip').value) || 0);
 const margin = Math.max(5, parseInt(document.getElementById('pageNumberMargin').value) || 25);

 const fontSize = size === 'small' ? 10 : size === 'large' ? 16 : 12;

 const colorMap = {
 grey: PDFLib.rgb(0.4, 0.4, 0.4),
 black: PDFLib.rgb(0, 0, 0),
 blue: PDFLib.rgb(0, 0, 0.7),
 red: PDFLib.rgb(0.8, 0, 0)
 };
 const color = colorMap[colorKey] || colorMap.grey;
 const font = await currentPdf.embedFont(PDFLib.StandardFonts.Helvetica);
 progressBar.style.width = '10%';
 progressDiv.innerHTML = 'Adding page numbers...';

 const pages = currentPdf.getPages();
 const total = pages.length;
 let counter = startNum;

 for (let i = 0; i < pages.length; i++) {
 if (i < skipN) {
 progressBar.style.width = `${((i + 1) / pages.length) * 100}%`;
 continue;
 }

 const page = pages[i];
 const { width, height } = page.getSize();

 let label;
 switch (format) {
 case 'page': label = `Page ${counter}`; break;
 case 'total': label = `${counter} of ${total - skipN}`; break;
 case 'pageTotal': label = `Page ${counter} of ${total - skipN}`; break;
 default: label = `${counter}`;
 }
 const textWidth = font.widthOfTextAtSize(label, fontSize);

 let x, y;
 switch (position) {
 case 'bottom-center': x = (width - textWidth) / 2; y = margin; break;
 case 'bottom-right': x = width - textWidth - margin; y = margin; break;
 case 'bottom-left': x = margin; y = margin; break;
 case 'top-center': x = (width - textWidth) / 2; y = height - margin; break;
 case 'top-right': x = width - textWidth - margin; y = height - margin; break;
 case 'top-left': x = margin; y = height - margin; break;
 default: x = (width - textWidth) / 2; y = margin;
 }

 page.drawText(label, { x, y, size: fontSize, font, color });

 counter++;
 progressBar.style.width = `${((i + 1) / pages.length) * 100}%`;
 }

 progressDiv.innerHTML = 'Saving PDF...';
 const pdfBytes = await currentPdf.save();
 const blob = new Blob([pdfBytes], { type: 'application/pdf' });

 progressBar.style.width = '100%';
 progressDiv.innerHTML = 'Done!';
 downloadBtn.disabled = false;

 const pnBase = currentFileName.replace(/\.pdf$/i, '') || 'document';
 downloadBtn.onclick = () => downloadBlob(blob, `${pnBase}-numbered.pdf`);

 if (window.showToast) showToast(`Successfully added page numbers to ${total - skipN} pages`);

 setTimeout(() => {
 progressContainer.style.display = 'none';
 progressBar.style.width = '0%';
 progressDiv.style.display = 'none';
 }, 2000);

 } catch (e) {
 progressDiv.textContent = `Error: ${e.message}`;
 if (window.showToast) showToast('Failed to add page numbers: ' + e.message, 'error');
 console.error(e);
 } finally {
 btn.disabled = false;
 btn.innerHTML = 'Add Page Numbers';
 }
 });

 } catch (___err) {
 console.error('renderpagenumbers error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}



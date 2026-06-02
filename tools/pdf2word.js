async function renderpdf2word(container) {
 try {
 await Promise.all([
 loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
 loadScript('https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.min.js')
 ]);

 pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription('Convert PDF text to an editable Word DOCX file in your browser. Free, private, and no uploads.');
 updatePageTitle('PDF to Word Converter');

 area.innerHTML = `
 <h3>PDF to Word</h3>
 <p class="tool-description">Extract selectable PDF text into an editable DOCX file. Scanned PDFs need OCR first.</p>

 <div id="pdfWordDropZone" class="drop-zone" style="border:2px dashed rgba(255,255,255,0.1);padding:2rem;text-align:center;border-radius:var(--r-md);background:var(--bg-input);cursor:pointer;margin-bottom:1rem;">
 <div style="font-size:2rem;margin-bottom:1rem;">PDF -> DOCX</div>
 <p>Drag and drop a PDF file here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="pdfWordInput" accept=".pdf,application/pdf" style="display:none;">
 </div>

 <div class="input-group" style="margin-bottom:1rem;">
 <label for="pdfWordMode">Output layout</label>
 <select id="pdfWordMode">
 <option value="paragraphs" selected>Paragraphs by page</option>
 <option value="lines">Preserve line breaks</option>
 </select>
 </div>

 <label style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
 <input type="checkbox" id="pdfWordPageHeadings" checked>
 Add page headings
 </label>

 <button id="pdfWordConvertBtn" class="primary" disabled>Convert to DOCX</button>

 <div id="pdfWordProgressContainer" style="display:none;margin-top:1rem;">
 <div id="pdfWordProgressLabel" style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">Processing...</div>
 <div style="width:100%;background:var(--bg-input);border-radius:4px;">
 <div id="pdfWordProgressBar" style="width:0%;height:6px;background:var(--accent);border-radius:4px;transition:width 0.2s;"></div>
 </div>
 </div>

 <button id="pdfWordDownloadBtn" class="download-btn" disabled style="margin-top:1rem;">Download DOCX</button>
 `;

 const dropZone = document.getElementById('pdfWordDropZone');
 const input = document.getElementById('pdfWordInput');
 const mode = document.getElementById('pdfWordMode');
 const pageHeadings = document.getElementById('pdfWordPageHeadings');
 const convertBtn = document.getElementById('pdfWordConvertBtn');
 const downloadBtn = document.getElementById('pdfWordDownloadBtn');
 const progressContainer = document.getElementById('pdfWordProgressContainer');
 const progressLabel = document.getElementById('pdfWordProgressLabel');
 const progressBar = document.getElementById('pdfWordProgressBar');

 let currentFile = null;
 let docxBlob = null;

 dropZone.addEventListener('click', () => input.click());
 if (typeof setupDropZone === 'function') setupDropZone('pdfWordDropZone', 'pdfWordInput');

 input.addEventListener('change', () => {
 const file = input.files && input.files[0];
 if (!file) return;

 const validation = validateFile(file, {
 extensions: ['.pdf'],
 mimeTypes: ['application/pdf'],
 maxSize: 100 * 1024 * 1024,
 label: 'PDF'
 });
 if (!validation.valid) {
 showToast(validation.message, 'error');
 input.value = '';
 return;
 }

 currentFile = file;
 docxBlob = null;
 convertBtn.disabled = false;
 downloadBtn.disabled = true;
 if (window.showFileOnDropZone) showFileOnDropZone('pdfWordDropZone', file);
 });

 convertBtn.addEventListener('click', async () => {
 if (!currentFile) return;

 convertBtn.disabled = true;
 downloadBtn.disabled = true;
 progressContainer.style.display = 'block';
 progressBar.style.width = '0%';
 if (window.showSpinner) showSpinner('Reading PDF text...');

 try {
 const buffer = await currentFile.arrayBuffer();
 const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
 const pages = [];

 for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
 progressLabel.textContent = `Reading page ${pageNum} of ${pdf.numPages}...`;
 progressBar.style.width = `${Math.round((pageNum - 1) / pdf.numPages * 80)}%`;

 const page = await pdf.getPage(pageNum);
 const textContent = await page.getTextContent();
 const lines = groupTextItems(textContent.items || []);
 pages.push({ pageNum, lines });
 await new Promise(resolve => setTimeout(resolve, 0));
 }

 progressLabel.textContent = 'Building DOCX...';
 progressBar.style.width = '90%';
 docxBlob = await buildDocx(pages, mode.value, pageHeadings.checked);
 progressBar.style.width = '100%';
 downloadBtn.disabled = false;
 showToast('DOCX is ready.');
 } catch (err) {
 console.error('renderpdf2word conversion error:', err);
 showToast('Conversion failed: ' + err.message, 'error');
 } finally {
 convertBtn.disabled = false;
 progressContainer.style.display = 'none';
 if (window.hideSpinner) hideSpinner();
 }
 });

 downloadBtn.addEventListener('click', () => {
 if (!docxBlob || !currentFile) return;
 const base = currentFile.name.replace(/\.pdf$/i, '') || 'converted';
 downloadBlob(docxBlob, base + '.docx');
 });

 function groupTextItems(items) {
 const rows = new Map();
 items.forEach(item => {
 const text = (item.str || '').trim();
 if (!text) return;
 const y = Math.round((item.transform && item.transform[5] ? item.transform[5] : 0) / 4) * 4;
 if (!rows.has(y)) rows.set(y, []);
 rows.get(y).push({ text, x: item.transform && item.transform[4] ? item.transform[4] : 0 });
 });

 return Array.from(rows.entries())
 .sort((a, b) => b[0] - a[0])
 .map(([, row]) => row.sort((a, b) => a.x - b.x).map(part => part.text).join(' '))
 .filter(Boolean);
 }

 async function buildDocx(pages, outputMode, includePageHeadings) {
 const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
 const children = [];

 pages.forEach((page, index) => {
 if (includePageHeadings) {
 children.push(new Paragraph({
 text: `Page ${page.pageNum}`,
 heading: HeadingLevel.HEADING_2,
 spacing: { before: index === 0 ? 0 : 300, after: 120 }
 }));
 }

 if (page.lines.length === 0) {
 children.push(new Paragraph({
 children: [new TextRun({ text: '[No selectable text found on this page]', italics: true })],
 spacing: { after: 160 }
 }));
 return;
 }

 if (outputMode === 'lines') {
 page.lines.forEach(line => {
 children.push(new Paragraph({
 children: [new TextRun({ text: line })],
 spacing: { after: 80 }
 }));
 });
 } else {
 children.push(new Paragraph({
 children: [new TextRun({ text: page.lines.join(' ') })],
 spacing: { after: 220 }
 }));
 }
 });

 const document = new Document({
 sections: [{
 properties: {},
 children
 }]
 });
 return Packer.toBlob(document);
 }
 } catch (err) {
 console.error('renderpdf2word error:', err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = 'Tool failed to load: ' + err.message + '. Please check your connection and refresh.';
 container.replaceChildren(warn);
 }
}




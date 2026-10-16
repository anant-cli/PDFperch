async function rendertxt2docx(container) {
 try {
 await loadScript('/vendor/docx/index.js');

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Convert plain text to formatted Word documents with custom fonts, size, and line spacing. 100% private, no uploads.");
 updatePageTitle("TXT to DOCX Converter");

 area.innerHTML = `
 <h3> Upload .txt file</h3>
 <p class="tool-description">
 Convert plain text to a formatted Word document. Choose font, size, and line spacing.
 Great for preparing drafts or converting code comments to documentation.
 After conversion, you can also <a href="/pages/web2pdf.html" target="_self">turn it into PDF</a>.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my file uploaded to a server?</summary>
 <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
 </details>
 </div>
 <div id="txtDocxDropZone" class="drop-zone" style="border: 2px dashed var(--border-subtle); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
 <div style="font-size: 2rem; margin-bottom: 1rem;"></div>
 <p>Drag and drop a .txt file here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="txtFile" accept=".txt" style="display: none;">
 </div>

 <div id="txtStats" style="display:flex; justify-content: space-between; margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem;">
 <span id="txtWordCount">0 words | 0 chars</span>
 <span id="txtSize">0 Bytes</span>
 </div>
 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
 <div style="display: flex; flex-direction: column;">
 <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Text Editor</div>
 <textarea id="txtEditor" spellcheck="false" placeholder="Type or paste plain text here..." style="flex: 1; min-height: 300px; resize: vertical; padding: 1rem; font-family: monospace; border: 1px solid var(--border-subtle); border-radius: var(--r-md); background: var(--bg-input);"></textarea>
 </div>
 <div style="display: flex; flex-direction: column;">
 <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Formatting Options</div>
 <div class="formatting-controls" style="flex: 1; margin: 0; display: flex; flex-direction: column; gap: 1rem;">
 <div>
 <label style="display: block; margin-bottom: 0.3rem;">Font Family:</label>
 <select id="txtFont" style="width: 100%;">
 <option value="Arial">Arial</option>
 <option value="Times New Roman">Times New Roman</option>
 <option value="Calibri" selected>Calibri</option>
 <option value="Courier New">Courier New</option>
 </select>
 </div>
 <div>
 <label style="display: block; margin-bottom: 0.3rem;">Font Size:</label>
 <select id="txtFontSize" style="width: 100%;">
 <option value="10">10pt</option>
 <option value="11" selected>11pt</option>
 <option value="12">12pt</option>
 <option value="14">14pt</option>
 </select>
 </div>
 <div>
 <label style="display: block; margin-bottom: 0.3rem;">Line Spacing:</label>
 <select id="txtLineSpacing" style="width: 100%;">
 <option value="1.0">Single</option>
 <option value="1.15">1.15</option>
 <option value="1.5">1.5</option>
 <option value="2.0">Double</option>
 </select>
 </div>
 <label style="display: flex; align-items: center; gap: 0.5rem; margin-top: auto; cursor: pointer;">
 <input type="checkbox" id="txtDetectHeadings" checked> <span>Detect <code>#</code> style headings</span>
 </label>
 <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
 <input type="checkbox" id="txtDetectMarkdown" checked> <span>Detect bold, italic, and lists</span>
 </label>
 </div>
 </div>
 </div>
 <div class="preview-box" style="margin-bottom:1.5rem;">
 <div class="preview-title">Live Preview</div>
 <div id="txtLivePreview" style="background:#fff; color:#222; border-radius:6px; padding:1rem; min-height:120px; max-height:300px; overflow:auto;"></div>
 </div>
 <button id="convertTxtBtn" class="primary"> Convert to DOCX</button>
 <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
 <button id="downloadDocxBtn" class="download-btn" disabled> Download DOCX</button>
 </div>
 `;

 const txtFile = document.getElementById('txtFile');
 const txtDropZone = document.getElementById('txtDocxDropZone');
 const txtEditor = document.getElementById('txtEditor');
 const txtWordCount = document.getElementById('txtWordCount');
 const txtSize = document.getElementById('txtSize');
 const txtFont = document.getElementById('txtFont');
 const txtFontSize = document.getElementById('txtFontSize');
 const txtLineSpacing = document.getElementById('txtLineSpacing');
 const txtDetectHeadings = document.getElementById('txtDetectHeadings');
 const txtDetectMarkdown = document.getElementById('txtDetectMarkdown');
 const livePreview = document.getElementById('txtLivePreview');
 const convertBtn = document.getElementById('convertTxtBtn');
 const downloadBtn = document.getElementById('downloadDocxBtn');
 let currentDocxBlob = null;

 // Any change to the text or options makes an already-built DOCX outdated;
 // previously Download kept returning the old document after edits.
 function invalidateDocx() {
 if (!currentDocxBlob) return;
 currentDocxBlob = null;
 downloadBtn.disabled = true;
 }
 txtDropZone.addEventListener('click', () => txtFile.click());
 if (typeof setupDropZone === 'function') {
 setupDropZone('txtDocxDropZone', 'txtFile');
 }

 function updateStats() {
 const text = txtEditor.value;
 const chars = text.length;
 const words = text.trim() ? text.trim().split(/\s+/).length : 0;
 txtWordCount.textContent = `${words.toLocaleString()} words | ${chars.toLocaleString()} chars`;
 convertBtn.disabled = chars === 0;
 }

 function escapeHtml(value) {
 return value.replace(/[&<>"']/g, ch => ({
 '&': '&amp;',
 '<': '&lt;',
 '>': '&gt;',
 '"': '&quot;',
 "'": '&#39;'
 }[ch]));
 }

 function renderInlineMarkdown(text) {
 return escapeHtml(text)
 .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
 .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
 }

 function updatePreview() {
 const lines = txtEditor.value.split('\n');
 if (!txtEditor.value.trim()) {
 livePreview.innerHTML = '<p style="color:#666;">Preview appears here as you type.</p>';
 return;
 }

 const html = [];
 let listOpen = null;
 function closeList() {
 if (listOpen) {
 html.push(`</${listOpen}>`);
 listOpen = null;
 }
 }

 lines.forEach(raw => {
 const line = raw.trim();
 if (!line) {
 closeList();
 return;
 }
 if (txtDetectHeadings.checked) {
 const heading = line.match(/^(#{1,6})\s+(.*)$/);
 if (heading) {
 closeList();
 const level = Math.min(heading[1].length, 3);
 html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
 return;
 }
 }
 if (txtDetectMarkdown.checked) {
 const bullet = line.match(/^[-*]\s+(.*)$/);
 const numbered = line.match(/^\d+[.)]\s+(.*)$/);
 if (bullet || numbered) {
 const tag = bullet ? 'ul' : 'ol';
 if (listOpen !== tag) {
 closeList();
 html.push(`<${tag}>`);
 listOpen = tag;
 }
 html.push(`<li>${renderInlineMarkdown((bullet || numbered)[1])}</li>`);
 return;
 }
 }
 closeList();
 html.push(`<p>${txtDetectMarkdown.checked ? renderInlineMarkdown(line) : escapeHtml(line)}</p>`);
 });
 closeList();
 livePreview.innerHTML = html.join('');
 }

 // withSize=false lets headings keep their heading-style size.
 function makeRunsFromMarkdown(text, withSize = true) {
 const base = { font: txtFont.value };
 if (withSize) base.size = parseInt(txtFontSize.value, 10) * 2;
 const runs = [];
 const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
 let last = 0;
 let match;
 while ((match = regex.exec(text)) !== null) {
 if (match.index > last) runs.push(new docx.TextRun({ ...base, text: text.slice(last, match.index) }));
 const token = match[0];
 if (token.startsWith('**')) runs.push(new docx.TextRun({ ...base, text: token.slice(2, -2), bold: true }));
 else runs.push(new docx.TextRun({ ...base, text: token.slice(1, -1), italics: true }));
 last = regex.lastIndex;
 }
 if (last < text.length) runs.push(new docx.TextRun({ ...base, text: text.slice(last) }));
 return runs.length ? runs : [new docx.TextRun({ ...base, text })];
 }

 txtEditor.addEventListener('input', () => {
 invalidateDocx();
 updateStats();
 updatePreview();
 if (!txtFile.files || txtFile.files.length === 0) {
 txtSize.textContent = '';
 }
 });
 [txtFont, txtFontSize, txtLineSpacing, txtDetectHeadings, txtDetectMarkdown].forEach(control => {
 control.addEventListener('change', () => { invalidateDocx(); updatePreview(); });
 });

 txtFile.addEventListener('change', async () => {
 const file = txtFile.files[0];
 if (!file) return;

 txtSize.textContent = typeof formatFileSize === 'function' ? formatFileSize(file.size) : file.size + " bytes";
 if (window.showFileOnDropZone) showFileOnDropZone("txtDocxDropZone", file);

 try {
 const text = await file.text();
 invalidateDocx();
 txtEditor.value = text;
 updateStats();
 updatePreview();
 } catch (e) {
 if (window.showToast) showToast('Failed to read file: ' + e.message, 'error');
 console.error(e);
 }
 });
 updateStats();
 updatePreview();

 convertBtn.addEventListener('click', async () => {
 const textToConvert = txtEditor.value;
 if (!textToConvert.trim()) {
 if (window.showToast) showToast('Enter text or a upload a text file.', 'warning');
 else alert('Select a text file');
 return;
 }
 convertBtn.disabled = true; convertBtn.innerHTML = ' Converting...';
 if (window.showSpinner) showSpinner('Converting text to DOCX...');
 try {
 const { Document, Packer, Paragraph, HeadingLevel } = docx;
 const lines = textToConvert.split('\n');
 const children = [];
 // Each separate numbered list gets its own numbering instance so it
 // restarts at 1 (all lists used to share one counter: 1,2,3 ... 4,5).
 let numberingInstance = 0;
 let inNumberedList = false;
 for (let line of lines) {
 line = line.trim();
 if (!line) { inNumberedList = false; continue; }
 if (txtDetectHeadings.checked) {
 const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
 if (headingMatch) {
 const level = headingMatch[1].length;
 const headingText = headingMatch[2];
 let heading;
 switch (level) {
 case 1: heading = HeadingLevel.HEADING_1; break;
 case 2: heading = HeadingLevel.HEADING_2; break;
 case 3: heading = HeadingLevel.HEADING_3; break;
 case 4: heading = HeadingLevel.HEADING_4; break;
 case 5: heading = HeadingLevel.HEADING_5; break;
 case 6: heading = HeadingLevel.HEADING_6; break;
 default: heading = HeadingLevel.HEADING_1;
 }
 // Runs (instead of plain `text`) so headings use the chosen font
 // and **bold**/*italic* markers are formatted, not shown literally.
 children.push(new Paragraph({
 children: txtDetectMarkdown.checked
 ? makeRunsFromMarkdown(headingText, false)
 : [new docx.TextRun({ text: headingText, font: txtFont.value })],
 heading: heading,
 spacing: { after: 200 }
 }));
 inNumberedList = false;
 continue;
 }
 }
 if (txtDetectMarkdown.checked) {
 const bulletMatch = line.match(/^[-*]\s+(.*)$/);
 const numberedMatch = line.match(/^\d+[.)]\s+(.*)$/);
 if (bulletMatch || numberedMatch) {
 if (numberedMatch && !inNumberedList) numberingInstance++;
 inNumberedList = Boolean(numberedMatch);
 children.push(new Paragraph({
 children: makeRunsFromMarkdown((bulletMatch || numberedMatch)[1]),
 bullet: bulletMatch ? { level: 0 } : undefined,
 numbering: numberedMatch ? { reference: 'numbered-list', level: 0, instance: numberingInstance } : undefined,
 spacing: { line: Math.round(parseFloat(txtLineSpacing.value) * 240), after: 80 }
 }));
 continue;
 }
 }
 inNumberedList = false;
 children.push(new Paragraph({
 children: txtDetectMarkdown.checked
 ? makeRunsFromMarkdown(line)
 : [new docx.TextRun({ text: line, font: txtFont.value, size: parseInt(txtFontSize.value) * 2 })],
 spacing: { line: Math.round(parseFloat(txtLineSpacing.value) * 240), after: 120 }
 }));
 }
 const doc = new Document({
 numbering: {
 config: [{
 reference: 'numbered-list',
 levels: [{
 level: 0,
 format: 'decimal',
 text: '%1.',
 alignment: 'left'
 }]
 }]
 },
 sections: [{ children }]
 });
 currentDocxBlob = await Packer.toBlob(doc);
 downloadBtn.disabled = false;

 if (window.showToast) showToast('Successfully converted text to DOCX!');
 } catch (e) {
 if (window.showToast) showToast('Conversion failed: ' + e.message, 'error');
 else alert('Conversion failed: ' + e.message);
 console.error(e);
 } finally {
 convertBtn.disabled = false; convertBtn.innerHTML = ' Convert to DOCX';
 if (window.hideSpinner) hideSpinner();
 }
 });

 downloadBtn.addEventListener('click', () => {
 if (!currentDocxBlob) return;
 const txtBase = txtFile.files[0] ? txtFile.files[0].name.replace(/\.[^.]+$/, '') : 'converted';
 downloadBlob(currentDocxBlob, `${txtBase}.docx`);
 });
 } catch (___err) {
 console.error('rendertxt2docx error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




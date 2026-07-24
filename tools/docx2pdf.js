
async function renderdocx2pdf(container) {
 try {
 await Promise.all([
 loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.12.0/mammoth.browser.min.js'),
 loadScript('https://cdn.jsdelivr.net/npm/dompurify@3.4.12/dist/purify.min.js'),
 loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
 ]);

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Convert Word documents to PDF with perfect formatting - preserves tables, images, and headings. 100% private, no uploads.");
 updatePageTitle("DOCX to PDF Converter");

 area.innerHTML = `
 <div style="display: flex; flex-direction: column; gap: 1.5rem;">
 <div>
 <h3>Word / DOCX to PDF</h3>
 <p class="tool-description">
 Convert Word documents to PDF while preserving formatting, tables, and images.
 Ideal for sharing resumes, reports, and contracts securely.
 </p>
 </div>

 <div style="background: var(--bg-input); border-radius: var(--r-md); padding: 1rem; font-size: 0.9rem; color: var(--text-muted);">
 <strong style="color: var(--text-primary);">How it works in 3 steps:</strong>
 <ol style="margin: 0.5rem 0 0 1.2rem; line-height: 1.8;">
 <li>Upload your <code>.docx</code> file below</li>
 <li>Check the preview &ndash; adjust page size if needed</li>
 <li>Click <strong>Generate PDF</strong> &rarr; browser print dialog opens &rarr; choose <strong>"Save as PDF"</strong></li>
 </ol>
 <p style="margin: 0.5rem 0 0; font-size: 0.82rem;">&#128274; No file is sent to any server. Everything runs in your browser.</p>
 </div>

 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my file uploaded to a server?</summary>
 <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
 </details>
 <details>
 <summary>Will my formatting be preserved?</summary>
 <p>We use Mammoth.js to preserve tables, images, and headings as closely as possible. Complex macros or tracked changes are not supported.</p>
 </details>
 <details>
 <summary>Why does it open a print dialog instead of downloading directly?</summary>
 <p>Browsers restrict direct PDF creation for security reasons. The print-to-PDF method is the most reliable cross-browser approach. In the dialog, choose <strong>Save as PDF</strong> (or <strong>Microsoft Print to PDF</strong> on Windows).</p>
 </details>
 </div>

 <div id="docxDropZone" class="drop-zone" tabindex="0" role="button" aria-label="Upload DOCX file" style="min-height: 180px;">
 <div style="font-size: 1.25rem; margin-bottom: 0.25rem;">&#128196; File</div>
 <p style="font-size: 1.05rem; font-weight: 500;">Drag &amp; drop your Word document here</p>
 <p class="note">or click to browse &nbsp;&middot;&nbsp; Accepts <code>.docx</code> up to 50 MB</p>
 <input type="file" id="docxFile" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-label="DOCX file" style="display: none;">
 </div>

 <div id="docxStats" style="display:none; margin-bottom: 0.25rem; color: var(--text-muted); font-size: 0.9rem;">
 &#128206; File: <strong id="docxFileName"></strong> &nbsp;&middot;&nbsp; Size: <span id="docxSize">0 Bytes</span>
 </div>

 <div style="display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap; background: var(--bg-input); padding: 1rem; border-radius: var(--r-md);">
 <div class="orientation-selector" style="margin:0; gap:1rem;">
 <label>&#128208; Page size: <select id="docxPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
 <label>&#128260; Orientation: <select id="docxOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
 </div>
 <label style="display: flex; align-items: center; gap:0.6rem; cursor:pointer;">
 <input type="checkbox" id="detectHeadings" checked> &#128270; Convert # headings
 </label>
 </div>

 <div>
 <div class="preview-title" style="margin-bottom:0.5rem;">&#128203; Document Preview</div>
 <div class="preview-box" style="min-height: 300px; padding: 1.5rem; background: #ffffff; color: #1a1a1a;">
 <div id="docxPreview" style="color: var(--text-muted); text-align: center; padding: 4rem 1rem;">
 Upload a <code>.docx</code> file to see a preview here
 </div>
 </div>
 </div>

 <button id="printDocxBtn" class="primary" style="width:100%; font-size:1.1rem;" disabled>
 &#128424; Generate PDF (opens print dialog)
 </button>
 <p class="note" style="text-align:center; margin-top:-0.75rem;">In the print dialog, choose <strong>Save as PDF</strong> (or <em>Microsoft Print to PDF</em> on Windows).</p>

 <button id="docxFloatingDownload" class="download-btn floating-action" type="button" style="display:none;">
 &#128424; Generate PDF
 </button>
 </div>`;

 const fileIn = document.getElementById('docxFile');
 const docxDropZone = document.getElementById('docxDropZone');
 const docxStats = document.getElementById('docxStats');
 const docxFileName = document.getElementById('docxFileName');
 const docxSize = document.getElementById('docxSize');
 const previewDiv = document.getElementById('docxPreview');
 const sizeSel = document.getElementById('docxPageSize');
 const orientSel = document.getElementById('docxOrientation');
 const detectHeadings = document.getElementById('detectHeadings');
 const printBtn = document.getElementById('printDocxBtn');
 const docxFloatingBtn = document.getElementById('docxFloatingDownload');

 docxDropZone.addEventListener('click', () => fileIn.click());
 if (typeof setupDropZone === 'function') setupDropZone('docxDropZone', 'docxFile');

 const docxPrintStyles = `
 <style>
 * { margin: 0; padding: 0; box-sizing: border-box; }
 body { font-family: 'Calibri', 'Georgia', 'Segoe UI', Roboto, sans-serif; font-size: 12pt; line-height: 1.8; color: #1a1a2e; background: white; padding: 0; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
 .docx-body { width: 100%; max-width: 100%; }
 .docx-body h1 { font-size: 30px; font-weight: 700; color: #0d1b3e; border-bottom: 2.5px solid #2563eb; padding-bottom: 12px; margin-top: 36px; margin-bottom: 22px; page-break-after: avoid; letter-spacing: -0.01em; }
 .docx-body h2 { font-size: 24px; font-weight: 600; color: #1e2b4f; border-bottom: 1px solid #d0d7de; padding-bottom: 9px; margin-top: 30px; margin-bottom: 18px; page-break-after: avoid; }
 .docx-body h3 { font-size: 20px; font-weight: 600; color: #2c3e50; margin-top: 24px; margin-bottom: 12px; page-break-after: avoid; }
 .docx-body h4 { font-size: 17px; font-weight: 600; color: #34495e; margin-top: 18px; margin-bottom: 10px; page-break-after: avoid; }
 .docx-body p { margin: 0 0 1.2rem; orphans: 3; widows: 3; font-size: 12pt; }
 .docx-body li { margin-bottom: 0.5rem; font-size: 12pt; }
 .docx-body ul, .docx-body ol { margin: 0 0 1.2rem 1.8rem; }
 .docx-body code,.docx-body pre { font-family: 'Cascadia Code', 'SF Mono', 'Consolas', monospace; background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 4px; font-size: 10pt; }
 .docx-body pre { padding: 16px; overflow-x: auto; page-break-inside: avoid; margin-bottom: 1.2rem; }
 .docx-body code { padding: 2px 6px; }
 .docx-body table { border-collapse: collapse; width: 100%; margin: 22px 0; page-break-inside: avoid; font-size: 11pt; }
 .docx-body th { background: #2563eb; color: white; padding: 13px 14px; border: 1px solid #1d4ed8; font-weight: 600; }
 .docx-body td { padding: 11px 14px; border: 1px solid #d0d7de; }
 .docx-body tr:nth-child(even) { background: #f8fafc; }
 .docx-body blockquote { margin: 1.2rem 0; padding: 0.8rem 1.2rem; color: #57606a; border-left: 4px solid #2563eb; background: rgba(37,99,235,0.05); border-radius: 0 4px 4px 0; }
 .docx-body img { max-width: 100%; height: auto; page-break-inside: avoid; display:block; margin: 1rem auto; }
 @media print { .page-break { page-break-before: always; } body { font-size: 11pt; } }
 </style>`;
 const docxPreviewStyles = docxPrintStyles
 .replace(/\* \{/, '.docx-body * {')
 .replace(/\n\s*body \{/, '\n .docx-body {')
 .replace(/@media print\s*\{\s*body \{/, '@media print { .docx-body {')
 .replace(/\.page-break/g, '.docx-body .page-break');

 function enhanceHeadings(html) {
 if (!detectHeadings.checked) return html;
 return html.replace(/<p>(#{1,6})\s+(.*?)<\/p>/g, (m, h, c) => `<h${h.length}>${c}</h${h.length}>`);
 }
 function escapeHtml(str) {
 return String(str)
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;')
 .replace(/'/g, '&#039;');
 }

 function updateDocxFloatingBtn() {
 if (!docxFloatingBtn) return;
 docxFloatingBtn.style.display = window.currentDocxHtml ? 'inline-flex' : 'none';
 }

 fileIn.addEventListener('change', async () => {
 const f = fileIn.files[0];
 if (!f) return;
 const validation = validateFile(f, {
 extensions: ['.docx'],
 mimeTypes: [
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/octet-stream'
 ],
 maxSize: 50 * 1024 * 1024,
 label: 'Word document'
 });
 if (!validation.valid) {
 fileIn.value = '';
 if (window.showToast) showToast(validation.message, 'error');
 return;
 }

 if (window.showFileOnDropZone) showFileOnDropZone('docxDropZone', f);
 docxStats.style.display = 'block';
 docxFileName.textContent = f.name;
 docxSize.textContent = typeof formatFileSize === 'function' ? formatFileSize(f.size) : f.size + ' bytes';

 previewDiv.innerHTML = '<div style="text-align:center; padding: 2rem;"><span style="font-size: 2rem;">&#8987;</span><br>Converting DOCX for preview&hellip;</div>';
 if (window.showSpinner) showSpinner('Converting DOCX preview');

 try {
 const buf = await f.arrayBuffer();
 const result = await mammoth.convertToHtml({ arrayBuffer: buf });
 let html = enhanceHeadings(result.value);
 if (window.DOMPurify) {
 html = DOMPurify.sanitize(html, {
 ALLOWED_TAGS: ['p','h1','h2','h3','h4','h5','h6','strong','em','u','s',
 'ul','ol','li','table','thead','tbody','tr','th','td',
 'blockquote','pre','code','br','hr','img','a','span','div'],
 ALLOWED_ATTR: ['href','src','alt','title','style','class','colspan','rowspan','target','rel']
 });
 }
 previewDiv.innerHTML = docxPreviewStyles + `<div class="docx-body">${html}</div>`;
 window.currentDocxHtml = html;
 printBtn.disabled = false;
 updateDocxFloatingBtn();

 if (result.messages && result.messages.length > 0) {
 const warnings = result.messages.filter(m => m.type === 'warning').length;
 if (warnings > 0 && window.showToast) {
 showToast(`Preview ready. ${warnings} formatting warning(s) - complex styles may differ.`, 'info');
 }
 } else if (window.showToast) {
 showToast('Preview ready! Check it, then click Generate PDF.', 'success');
 }
 if (window.trackEvent) trackEvent('Tool', 'file_loaded', 'docx2pdf');
 } catch (e) {
 previewDiv.innerHTML = `<div style="color:#e74c3c;padding:1rem;">&#10060; Error: ${escapeHtml(e.message)}</div>`;
 if (window.showToast) showToast('Failed to read DOCX file. Make sure it is a valid .docx.', 'error');
 } finally {
 if (window.hideSpinner) hideSpinner();
 }
 });

 async function generatePdf() {
 if (!window.currentDocxHtml) {
 if (window.showToast) showToast('Please select and preview a DOCX file first.', 'warning');
 return;
 }
 if (window.rateLimiter && !rateLimiter.canProceed('docx2pdf', 2000)) {
 if (window.showToast) showToast('Please wait a moment before generating another PDF.', 'warning');
 return;
 }

 printBtn.disabled = true;
 if (docxFloatingBtn) docxFloatingBtn.disabled = true;
 const originalText = printBtn.innerHTML;
 printBtn.innerHTML = '&#8987; Preparing PDF&hellip;';
 if (window.showSpinner) showSpinner('Preparing document for PDF');

 try {
 const file = fileIn.files[0];
 const rawName = file ? file.name.replace(/\.docx$/i, '') : 'document';
 const docTitle = escapeHtml(rawName);
 const pageSize = sizeSel.value;
 const orientation = orientSel.value;

 const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <title>${docTitle} \u2013 ConvertPDF</title>
 ${docxPrintStyles}
 <style>@page { size: ${pageSize} ${orientation}; margin: 2.5cm 3cm; }</style>
</head>
<body>
 <div class="docx-body">${window.currentDocxHtml}</div>
 <script>
 window.onload = function () {
 setTimeout(function () {
 window.print();
 setTimeout(function () { window.close(); }, 1500);
 }, 600);
 };
 <\/script>
</body>
</html>`;

 const printWindow = window.open('', '_blank');
 if (!printWindow) {
 throw new Error('Pop-up blocked. Please allow pop-ups for this site, then try again.');
 }
 printWindow.document.write(fullHtml);
 printWindow.document.close();

 if (window.trackEvent) trackEvent('Tool', 'convert', 'docx2pdf');
 if (window.showToast) showToast('&#128424; Print dialog opened \u2013 choose \u201cSave as PDF\u201d to download.', 'info');
 } catch (err) {
 console.error(err);
 if (window.showToast) showToast('Failed to open print dialog: ' + err.message, 'error');
 } finally {
 printBtn.disabled = false;
 if (docxFloatingBtn) docxFloatingBtn.disabled = false;
 printBtn.innerHTML = originalText;
 if (window.hideSpinner) hideSpinner();
 updateDocxFloatingBtn();
 }
 }

 printBtn.addEventListener('click', generatePdf);
 if (docxFloatingBtn) docxFloatingBtn.addEventListener('click', generatePdf);

 } catch (___err) {
 console.error('renderdocx2pdf error:', ___err);
 container.innerHTML = `<div class="warning">&#9888;&#65039; Tool failed to load: ${escapeHtml(___err.message)}</div>`;
 }
}



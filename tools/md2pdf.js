
async function rendermd2pdf(container) {
 try {
 container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading Markdown converter...</p></div>`;

 await Promise.all([
 loadScript('https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js'),
 loadScript('https://cdn.jsdelivr.net/npm/dompurify@3.2.5/dist/purify.min.js'),
 loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js'),
 loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js'),
 loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js'),
 loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
 ]);
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js');
 if (window.Prism && Prism.plugins?.autoloader) {
 Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
 }
 await loadStylesheet('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css');
 await loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Convert Markdown to PDF with LaTeX math, syntax highlighting, and custom page breaks. 100% private, no uploads.");
 updatePageTitle("Markdown to PDF Converter");

 area.innerHTML = `
 <div style="display: flex; flex-direction: column; gap: 1.5rem;">
 <div>
 <h3>Markdown to PDF</h3>
 <p class="tool-description">
 Convert Markdown into professional PDF documents. Supports LaTeX math ($E=mc^2$), syntax highlighting, and custom page breaks.
 </p>
 </div>

 <div id="mdPdfDropZone" class="drop-zone" tabindex="0" role="button" aria-label="Upload Markdown file" style="min-height: 180px;">
 <div style="font-size: 1.25rem; margin-bottom: 0.25rem;">File</div>
 <p style="font-size: 1.05rem; font-weight: 500;">Drag & drop your Markdown file</p>
 <p class="note">or click to browse</p>
 <input type="file" id="mdFile" accept=".md,.markdown" aria-label="Markdown file" style="display: none;">
 </div>

 <div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; background: var(--bg-input); padding: 1rem; border-radius: var(--r-md);">
 <div class="orientation-selector" style="margin:0; gap:1rem;">
 <label><select id="mdPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
 <label><select id="mdOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
 </div>
 <button id="loadSampleBtn" class="secondary">Load sample</button>
 <label style="margin-left: auto; display: flex; align-items: center; gap:0.6rem;">
 <input type="checkbox" id="toggleEditor"> Advanced editor
 </label>
 </div>

 <div id="editorSection" style="display: none;">
 <div class="preview-title">Markdown source</div>
 <textarea id="mdEditor" spellcheck="false" placeholder="Type or paste Markdown here..." style="width:100%; min-height:350px; font-family: monospace;"></textarea>
 </div>

 <div>
 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
 <div class="preview-title">Live preview</div>
 
 </div>
 <div class="preview-box" id="mdPreviewBox" style="min-height: 600px; overflow-y: auto; background: #ffffff; color: #1a1a1a;">
 <div id="mdRendered"></div>
 </div>
 </div>

 <button id="printMdBtn" class="primary" style="width:100%; font-size:1.1rem;">Generate PDF</button>
 <button id="mdFloatingDownload" class="download-btn floating-action" type="button">Download PDF</button>
 </div>`;

 const mdFile = document.getElementById('mdFile');
 const mdDropZone = document.getElementById('mdPdfDropZone');
 const mdEditor = document.getElementById('mdEditor');
 const mdRendered = document.getElementById('mdRendered');
 const mdPreviewBox = document.getElementById('mdPreviewBox');
 const toggleEditor = document.getElementById('toggleEditor');
 const editorSection = document.getElementById('editorSection');
 const loadSampleBtn = document.getElementById('loadSampleBtn');
 const sizeSelect = document.getElementById('mdPageSize');
 const orientSelect = document.getElementById('mdOrientation');
 const printBtn = document.getElementById('printMdBtn');
 const mdFloatingBtn = document.getElementById('mdFloatingDownload');

 const sampleMd = `# Sample Document\n\nThis is a sample **Markdown** document.\n\n## Math Support\n\nInline math: $E = mc^2$\n\nDisplay math:\n$$\\int_a^b f(x)dx = F(b) - F(a)$$\n\n## Syntax Highlighting\n\n\`\`\`javascript\nfunction hello() {\n
\n}\n\`\`\`\n\n## Page Breaks\nUse \\newpage or <!-- pagebreak --> to force a new page.`;

 toggleEditor.addEventListener('change', () => {
 editorSection.style.display = toggleEditor.checked ? 'block' : 'none';
 });

 loadSampleBtn.addEventListener('click', () => {
 window.currentMarkdown = sampleMd;
 mdEditor.value = sampleMd;
 renderPreview();
 if (window.showToast) showToast('Sample loaded!');
 });

 mdDropZone.addEventListener('click', () => mdFile.click());
 if (typeof setupDropZone === 'function') setupDropZone('mdPdfDropZone', 'mdFile');

 function getPrintStyles(theme = 'light', pageSize = 'a4', orientation = 'portrait') {
 return `
 <style>
 * { margin: 0; padding: 0; box-sizing: border-box; }
 body {
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
 line-height: 1.6;
 color: ${theme === 'dark' ? '#c9d1d9' : '#24292e'};
 background: ${theme === 'dark' ? '#0d1117' : 'white'};
 padding: 0;
 margin: 0;
 -webkit-print-color-adjust: exact;
 print-color-adjust: exact;
 }
 .markdown-body { width: 100%; max-width: 100%; }
 h1, h2, h3, h4, h5, h6 {
 margin-top: 1.5rem;
 margin-bottom: 1rem;
 font-weight: 600;
 page-break-after: avoid;
 }
 h1 { font-size: 2em; border-bottom: 1px solid ${theme === 'dark' ? '#21262d' : '#eaecef'}; padding-bottom: 0.3rem; }
 h2 { font-size: 1.5em; border-bottom: 1px solid ${theme === 'dark' ? '#21262d' : '#eaecef'}; padding-bottom: 0.3rem; }
 p { margin: 0 0 1rem; orphans: 3; widows: 3; }
 code, pre { font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 0.9rem; border-radius: 3px; }
 code { padding: 0.2rem 0.4rem; background: ${theme === 'dark' ? 'rgba(110,118,129,0.4)' : '#f6f8fa'}; }
 pre { padding: 1rem; overflow: auto; background: ${theme === 'dark' ? '#161b22' : '#f6f8fa'}; border-radius: 6px; page-break-inside: avoid; }
 pre code { background: none; padding: 0; }
 table { border-collapse: collapse; width: 100%; margin: 1rem 0; page-break-inside: avoid; }
 th, td { border: 1px solid ${theme === 'dark' ? '#30363d' : '#dfe2e5'}; padding: 0.6rem 1rem; text-align: left; }
 th { background: ${theme === 'dark' ? '#21262d' : '#f6f8fa'}; }
 blockquote { margin: 0; padding: 0 1rem; color: ${theme === 'dark' ? '#8b949e' : '#6a737d'}; border-left: 0.25rem solid ${theme === 'dark' ? '#30363d' : '#dfe2e5'}; }
 img { max-width: 100%; page-break-inside: avoid; display:block; margin: 0.5rem auto; }
 .page-break { page-break-before: always; height: 0; }
 hr { border: none; border-top: 1px solid ${theme === 'dark' ? '#21262d' : '#e1e4e8'}; margin: 1.25rem 0; }
 @media print {
 code, pre { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
 }
 </style>
 <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css">
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
 `;
 }

 function preprocessMarkdown(text) {
 text = text.replace(/\\newpage/g, '<div class="page-break"></div>');
 text = text.replace(/<!--\s*pagebreak\s*-->/g, '<div class="page-break"></div>');
 return text;
 }

 marked.setOptions({ gfm: true, breaks: true });

 function renderPreview() {
 const text = window.currentMarkdown || '';
 if (!text) {
 mdRendered.innerHTML = `<div style="color:var(--text-muted); padding:4rem; text-align:center;">Upload a Markdown file or click "Load Sample"</div>`;
 return;
 }
 const processed = preprocessMarkdown(text);
 const rawHtml = DOMPurify.sanitize(marked.parse(processed));
 const theme = 'light';
 mdPreviewBox.style.background = '#ffffff';
    mdPreviewBox.style.color = '#1a1a1a';
 mdRendered.innerHTML = `<div class="markdown-body" style="padding:1rem;">${rawHtml}</div>`;
 if (window.renderMathInElement) {
 renderMathInElement(mdRendered, {
 delimiters: [
 { left: '$$', right: '$$', display: true },
 { left: '$', right: '$', display: false },
 { left: '\\(', right: '\\)', display: false },
 { left: '\\[', right: '\\]', display: true }
 ],
 throwOnError: false
 });
 }
 if (window.Prism) Prism.highlightAllUnder(mdRendered);
 updateMdFloatingBtn();
 }

 mdEditor.addEventListener('input', debounce(() => {
 window.currentMarkdown = mdEditor.value;
 renderPreview();
 }, 300));

 mdFile.addEventListener('change', async () => {
 const file = mdFile.files[0];
 if (!file) return;
 const validation = validateFile(file, {
 extensions: ['.md', '.markdown'],
 mimeTypes: ['text/markdown', 'text/plain'],
 maxSize: 10 * 1024 * 1024,
 label: 'Markdown file'
 });
 if (!validation.valid) {
 mdFile.value = '';
 if (window.showToast) showToast(validation.message, 'error');
 return;
 }
 try {
 if (window.showFileOnDropZone) showFileOnDropZone("mdPdfDropZone", file);
 const text = await file.text();
 window.currentMarkdown = text;
 mdEditor.value = text;
 renderPreview();
 if (window.trackEvent) trackEvent('Tool', 'file_loaded', 'md2pdf');
 } catch (err) {
 if (window.showToast) showToast('Unable to read file.', 'error');
 }
 });

 function updateMdFloatingBtn() {
 if (!mdFloatingBtn) return;
 mdFloatingBtn.style.display = (window.currentMarkdown && window.currentMarkdown.trim()) ? 'inline-flex' : 'none';
 }
 async function generateMdPdf() {
 const text = window.currentMarkdown;
 if (!text || !text.trim()) {
 if (window.showToast) showToast('Please upload or enter Markdown content first.', 'warning');
 return;
 }
 if (window.rateLimiter && !rateLimiter.canProceed('md2pdf', 2000)) {
 if (window.showToast) showToast('Please wait before generating another PDF.', 'warning');
 return;
 }

 printBtn.disabled = true;
 if (mdFloatingBtn) mdFloatingBtn.disabled = true;
 const originalText = printBtn.innerHTML;
 printBtn.innerHTML = ' Preparing PDF...';
 if (window.showSpinner) showSpinner('Rendering Markdown with math and syntax highlighting...');

 try {
 const processed = preprocessMarkdown(text);
 const rawHtml = DOMPurify.sanitize(marked.parse(processed));
 const theme = 'light';
 const pageSize = sizeSelect.value;
 const orientation = orientSelect.value;

 const fullHtml = `<!DOCTYPE html>
 <html>
 <head>
 <meta charset="UTF-8">
 <title>Markdown Document - ConvertPDF</title>
 ${getPrintStyles(theme, pageSize, orientation)}
 <style>
 @page {
 size: ${pageSize} ${orientation};
 margin: 2.5cm 3cm;
 }
 </style>
 <script src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"><\/script>
 <script src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js"><\/script>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"><\/script>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"><\/script>
 </head>
 <body>
 <div class="markdown-body">${rawHtml}</div>
 <script>
 window.addEventListener('load', function() {
 if (window.renderMathInElement) {
 renderMathInElement(document.body, {
 delimiters: [
 {left:'$$',right:'$$',display:true},
 {left:'$',right:'$',display:false},
 {left:'\\\\[',right:'\\\\]',display:true},
 {left:'\\\\(',right:'\\\\)',display:false}
 ],
 throwOnError: false
 });
 }
 if (window.Prism) Prism.highlightAll();
 setTimeout(() => {
 window.print();
 setTimeout(() => window.close(), 1000);
 }, 500);
 });
 <\/script>
 </body>
 </html>`;

 const printWindow = window.open('', '_blank');
 if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
 if (window.showPopupBlockedWarning) {
 showPopupBlockedWarning('Markdown to PDF');
 }
 throw new Error('Popup blocked. Please allow pop-ups for this site.');
 }
 printWindow.document.write(fullHtml);
 printWindow.document.close();

 if (window.trackEvent) trackEvent('Tool', 'convert', 'md2pdf');
 if (window.showToast) showToast(' Print dialog opened - choose "Save as PDF".', 'info');
 } catch (err) {
 console.error(err);
 if (window.showToast) showToast('Failed to generate PDF: ' + err.message, 'error');
 } finally {
 printBtn.disabled = false;
 if (mdFloatingBtn) mdFloatingBtn.disabled = false;
 printBtn.innerHTML = originalText;
 if (window.hideSpinner) hideSpinner();
 }
 }

 printBtn.addEventListener('click', generateMdPdf);
 if (mdFloatingBtn) mdFloatingBtn.addEventListener('click', generateMdPdf);

 } catch (err) {
 console.error('rendermd2pdf error:', err);
 container.innerHTML = `<div class="warning"> Tool failed to load: ${err.message}</div>`;
 }
}



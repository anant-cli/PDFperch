async function renderweb2pdf(container) {
 await loadScript('https://cdn.jsdelivr.net/npm/dompurify@3.2.5/dist/purify.min.js');

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Turn HTML code into a printable PDF with full CSS support. 100% private, no uploads.");
 updatePageTitle("HTML to PDF Converter");

 area.innerHTML = `
 <div style="display: flex; flex-direction: column; gap: 1.5rem;">
 <div>
 <h3> HTML to PDF</h3>
 <p class="tool-description">
 Convert HTML and CSS code into high-quality PDFs. Choice from pre-designed templates or build your own custom design.
 </p>
 </div>

 <div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; background: var(--bg-input); padding: 1.2rem; border-radius: var(--r-lg); border: 1px solid var(--border-subtle); flex-wrap: wrap;">
 <div class="orientation-selector" style="margin: 0; gap: 1rem;">
 <label style="font-weight: 600;"> Template:
 <select id="htmlTemplate" style="max-width: 150px;">
 <option value="blank">Blank</option>
 <option value="invoice">Formal Invoice</option>
 <option value="receipt">Simple Receipt</option>
 <option value="certificate">Certificate</option>
 </select>
 </label>
 </div>
 <label style="margin-left: auto; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.95rem; font-weight: 500; color: var(--text-muted);">
 <input type="checkbox" id="toggleHtmlEditor" style="width: auto; height: auto;" checked> HTML/CSS Editor
 </label>
 </div>

 <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;padding:0.85rem 1rem;background:var(--bg-input);border-radius:var(--r-md);border:1px solid var(--border-subtle);">
   <span style="font-weight:600;font-size:0.9rem;color:var(--text-secondary);">Upload files:</span>
   <label style="cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 0.85rem;background:var(--bg-accent-softer);border:1px solid var(--border-subtle);border-radius:var(--r-full);font-size:0.875rem;color:var(--text-secondary);white-space:nowrap;">
     Load .html <input type="file" id="htmlFileInput" accept=".html,.htm" style="position:absolute;left:-9999px;opacity:0;">
   </label>
   <label style="cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 0.85rem;background:var(--bg-accent-softer);border:1px solid var(--border-subtle);border-radius:var(--r-full);font-size:0.875rem;color:var(--text-secondary);white-space:nowrap;">
     Load .css <input type="file" id="cssFileInput" accept=".css" style="position:absolute;left:-9999px;opacity:0;">
   </label>
   <span id="htmlCssFileNames" style="font-size:0.8rem;color:var(--text-muted);"></span>
 </div>

 <div id="htmlEditorSection" style="display: block; animation: slideDown 0.3s ease-out;">
 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; --html-grid: 1fr 1fr;" class="html-editor-grid">
 <div>
 <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary); font-size: 0.85rem; text-transform: uppercase;">HTML</div>
 <textarea id="htmlSnippet" spellcheck="false" placeholder="<h1>Hello World</h1>" style="width: 100%; height: 350px; resize: vertical; padding: 1.2rem; font-family: 'Fira Code', monospace; font-size: 0.9rem; border: 1px solid var(--border-subtle); border-radius: var(--r-md); background: var(--bg-input); line-height: 1.5;"></textarea>
 </div>
 <div>
 <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary); font-size: 0.85rem; text-transform: uppercase;">CSS</div>
 <textarea id="cssSnippet" spellcheck="false" placeholder="body { font-family: sans-serif; }" style="width: 100%; height: 350px; resize: vertical; padding: 1.2rem; font-family: 'Fira Code', monospace; font-size: 0.9rem; border: 1px solid var(--border-subtle); border-radius: var(--r-md); background: var(--bg-input); line-height: 1.5;"></textarea>
 </div>
 </div>
 </div>

 <div>
 <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">Live Preview</div>
 <div class="preview-box" id="htmlPreviewBox" style="width: 100%; min-height: 600px; padding: 0; border: 1px solid var(--border-subtle); overflow: hidden; box-shadow: var(--shadow-sm); background: #fff;">
 <iframe id="htmlRenderPreview" sandbox="" referrerpolicy="no-referrer" style="width: 100%; height: 100%; min-height: 600px; border: none;"></iframe>
 </div>
 </div>

 <div style="display: flex; gap: 1.5rem; align-items: center; background: var(--bg-input); padding: 1.2rem; border-radius: var(--r-lg); border: 1px solid var(--border-subtle);">
 <label style="font-weight:600;display:flex;align-items:center;gap:0.4rem;">Page: <select id="htmlPageSize" style="min-width:80px;"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
 <label style="font-weight:600;display:flex;align-items:center;gap:0.4rem;">Orientation: <select id="htmlOrientation" style="min-width:110px;"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
 <button id="printHtmlBtn" class="primary" style="flex: 1; height: 50px; font-size: 1rem; min-width: 160px; white-space: nowrap; overflow: visible;"> Generate PDF</button>
 </div>
 </div>

 <style>
 @keyframes slideDown {
 from { opacity: 0; transform: translateY(-10px); }
 to { opacity: 1; transform: translateY(0); }
 }
 </style>
 `;

 const htmlTemplate = document.getElementById('htmlTemplate');
 const toggleHtmlEditor = document.getElementById('toggleHtmlEditor');
 const htmlEditorSection = document.getElementById('htmlEditorSection');
 const htmlSnippet = document.getElementById('htmlSnippet');
 const cssSnippet = document.getElementById('cssSnippet');
 const previewIframe = document.getElementById('htmlRenderPreview');
 const sizeSel = document.getElementById('htmlPageSize');
 const orientSel = document.getElementById('htmlOrientation');
 const printBtn = document.getElementById('printHtmlBtn');
 let previewObjectUrl = null;
 toggleHtmlEditor.addEventListener('change', () => {
 htmlEditorSection.style.display = toggleHtmlEditor.checked ? 'block' : 'none';
 });

 // File upload handlers
 const htmlFileInput = document.getElementById('htmlFileInput');
 const cssFileInput = document.getElementById('cssFileInput');
 const htmlCssFileNames = document.getElementById('htmlCssFileNames');
 if (htmlFileInput) htmlFileInput.addEventListener('change', () => {
   const file = htmlFileInput.files[0]; if (!file) return;
   const reader = new FileReader();
   reader.onload = e => {
     let html = e.target.result;
     const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
     if (bodyMatch) html = bodyMatch[1].trim();
     const styleMatch = e.target.result.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
     if (styleMatch && !cssFileInput.files[0]) cssSnippet.value = styleMatch[1].trim();
     htmlSnippet.value = html;
     if (!toggleHtmlEditor.checked) { toggleHtmlEditor.checked = true; htmlEditorSection.style.display = 'block'; }
     if (htmlCssFileNames) htmlCssFileNames.textContent = 'Loaded: ' + file.name;
     updatePreview();
   }; reader.readAsText(file);
 });
 if (cssFileInput) cssFileInput.addEventListener('change', () => {
   const file = cssFileInput.files[0]; if (!file) return;
   const reader = new FileReader();
   reader.onload = e => {
     cssSnippet.value = e.target.result;
     if (!toggleHtmlEditor.checked) { toggleHtmlEditor.checked = true; htmlEditorSection.style.display = 'block'; }
     if (htmlCssFileNames) htmlCssFileNames.textContent = (htmlCssFileNames.textContent || '') + ' + ' + file.name;
     updatePreview();
   }; reader.readAsText(file);
 });

 const templates = {
 blank: {
 html: `<h1>Hello World</h1>\n<p>Type HTML here</p>`,
 css: `body {\n font-family: sans-serif;\n line-height: 1.6;\n color: #333;\n}`
 },
 invoice: {
 html: `<div class="invoice-box">\n <table cellpadding="0" cellspacing="0">\n <tr class="top">\n <td colspan="2">\n <table>\n <tr>\n <td class="title">\n <h2>INVOICE</h2>\n </td>\n <td>\n Invoice #: 123<br>\n Created: January 1, 2026<br>\n Due: February 1, 2026\n </td>\n </tr>\n </table>\n </td>\n </tr>\n <tr class="heading">\n <td>Item</td>\n <td>Price</td>\n </tr>\n <tr class="item">\n <td>Website design</td>\n <td>$300.00</td>\n </tr>\n <tr class="item">\n <td>Hosting (3 months)</td>\n <td>$75.00</td>\n </tr>\n <tr class="item last">\n <td>Domain name (1 year)</td>\n <td>$10.00</td>\n </tr>\n <tr class="total">\n <td></td>\n <td>Total: $385.00</td>\n </tr>\n </table>\n</div>`,
 css: `.invoice-box {\n max-width: 800px;\n margin: auto;\n padding: 30px;\n border: 1px solid #eee;\n box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);\n font-size: 16px;\n line-height: 24px;\n font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;\n color: #555;\n}\n.invoice-box table {\n width: 100%;\n line-height: inherit;\n text-align: left;\n}\n.invoice-box table td {\n padding: 5px;\n vertical-align: top;\n}\n.invoice-box table tr td:nth-child(2) {\n text-align: right;\n}\n.invoice-box table tr.top table td {\n padding-bottom: 20px;\n}\n.invoice-box table tr.top table td.title {\n font-size: 45px;\n line-height: 45px;\n color: #333;\n}\n.invoice-box table tr.heading td {\n background: #eee;\n border-bottom: 1px solid #ddd;\n font-weight: bold;\n}\n.invoice-box table tr.item td {\n border-bottom: 1px solid #eee;\n}\n.invoice-box table tr.item.last td {\n border-bottom: none;\n}\n.invoice-box table tr.total td:nth-child(2) {\n border-top: 2px solid #eee;\n font-weight: bold;\n}`
 },
 receipt: {
 html: `<div class="receipt">\n <div class="header">\n <h2>Store Name</h2>\n <p>123 Store Address, City, State ZIP</p>\n <p>Phone: (123) 456-7890</p>\n </div>\n <hr>\n <div class="details">\n <p>Date: 2026-03-04 14:30:00</p>\n <p>Receipt #: 000123456</p>\n <p>Cashier: John Doe</p>\n </div>\n <hr>\n <table class="items">\n <tr>\n <th>Qty</th>\n <th>Item</th>\n <th>Price</th>\n <th>Total</th>\n </tr>\n <tr>\n <td>1</td>\n <td>Widget A</td>\n <td>$10.00</td>\n <td>$10.00</td>\n </tr>\n <tr>\n <td>2</td>\n <td>Widget B</td>\n <td>$15.00</td>\n <td>$30.00</td>\n </tr>\n </table>\n <hr>\n <div class="totals">\n <p>Subtotal: $40.00</p>\n <p>Tax (8%): $3.20</p>\n <h3>Total: $43.20</h3>\n </div>\n <div class="footer">\n <p>Thank you for shopping with us!</p>\n </div>\n</div>`,
 css: `.receipt {\n width: 300px;\n margin: 0 auto;\n padding: 20px;\n border: 1px dashed #333;\n font-family: 'Courier New', Courier, monospace;\n font-size: 14px;\n}\n.header, .footer {\n text-align: center;\n}\n.header h2 {\n margin: 0 0 10px 0;\n}\n.header p, .details p, .footer p {\n margin: 2px 0;\n}\nhr {\n border-top: 1px dashed #333;\n margin: 10px 0;\n}\n.items {\n width: 100%;\n text-align: left;\n}\n.items th {\n border-bottom: 1px solid #333;\n}\n.items td {\n padding: 4px 0;\n}\n.totals {\n text-align: right;\n}\n.totals p {\n margin: 4px 0;\n}\n.totals h3 {\n margin: 10px 0 0 0;\n}`
 },
 certificate: {
 html: `<div class="certificate">\n <div class="border">\n <div class="content">\n <h2>CERTIFICATE OF ACHIEVEMENT</h2>\n <p>This certificate is proudly presented to</p>\n <h1>Jane Doe</h1>\n <p>For outstanding performance and dedication in completing the</p>\n <h3>Advanced Web Development Course</h3>\n <div class="signatures">\n <div class="sig-block">\n <div class="sig-line"></div>\n <p>Instructor</p>\n </div>\n <div class="date-block">\n <p>March 4, 2026</p>\n </div>\n <div class="sig-block">\n <div class="sig-line"></div>\n <p>Director</p>\n </div>\n </div>\n </div>\n </div>\n</div>`,
 css: `.certificate {\n width: 800px;\n height: 600px;\n padding: 20px;\n background-color: #f9f9f9;\n color: #333;\n font-family: 'Georgia', serif;\n text-align: center;\n margin: 0 auto;\n}\n.border {\n border: 10px solid #2c3e50;\n padding: 5px;\n height: calc(100% - 30px);\n}\n.content {\n border: 2px solid #2c3e50;\n height: calc(100% - 4px);\n display: flex;\n flex-direction: column;\n justify-content: center;\n align-items: center;\n background-color: white;\n}\n.content h2 {\n font-size: 36px;\n color: #2980b9;\n letter-spacing: 2px;\n margin-bottom: 20px;\n}\n.content h1 {\n font-size: 48px;\n font-style: italic;\n margin: 20px 0;\n color: #1e2b4f;\n border-bottom: 1px solid #ccc;\n padding-bottom: 10px;\n display: inline-block;\n}\n.content h3 {\n font-size: 24px;\n font-weight: normal;\n margin: 30px 0;\n}\n.content p {\n font-size: 18px;\n color: #555;\n}\n.signatures {\n display: flex;\n justify-content: space-between;\n width: 80%;\n margin-top: 60px;\n}\n.sig-block {\n width: 200px;\n}\n.sig-line {\n border-bottom: 1px solid #333;\n height: 30px;\n margin-bottom: 5px;\n}\n.date-block {\n padding-top: 10px;\n font-weight: bold;\n}`
 }
 };

 function updatePreview() {
 const html = window.sanitizeHtmlForTool(htmlSnippet.value);
 const css = window.sanitizeCssForTool(cssSnippet.value);

 const content = `
 <!DOCTYPE html>
 <html>
 <head>
 <style>
 body { margin: 0; padding: 20px; box-sizing: border-box; }
 ${css}
 </style>
 </head>
 <body>
 ${html}
 </body>
 </html>
 `;

 const blob = new Blob([content], { type: 'text/html' });
 if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
 previewObjectUrl = URL.createObjectURL(blob);
 previewIframe.src = previewObjectUrl;
 }

 htmlTemplate.addEventListener('change', () => {
 const tmpl = templates[htmlTemplate.value];
 if (tmpl) {
 htmlSnippet.value = tmpl.html;
 cssSnippet.value = tmpl.css;
 updatePreview();
 }
 });

 htmlSnippet.addEventListener('input', debounce(updatePreview, 300));
 cssSnippet.addEventListener('input', debounce(updatePreview, 300));
 htmlSnippet.value = templates.blank.html;
 cssSnippet.value = templates.blank.css;
 updatePreview();

 printBtn.addEventListener('click', async () => {
 const html = window.sanitizeHtmlForTool(htmlSnippet.value);
 const css = window.sanitizeCssForTool(cssSnippet.value);

 printBtn.disabled = true; printBtn.innerHTML = ' Preparing...';
 if (window.showSpinner) showSpinner('Preparing PDF...');

 let exportNode = null;
 try {
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
 exportNode = document.createElement('div');
 exportNode.style.background = '#ffffff';
 exportNode.style.color = '#111111';
 exportNode.style.padding = '0.75in';
 exportNode.style.width = sizeSel.value === 'letter' ? '8.5in' : '8.27in';
 const styleNode = document.createElement('style');
 styleNode.textContent = css;
 exportNode.appendChild(styleNode);
 const contentNode = document.createElement('div');
 contentNode.innerHTML = html;
 exportNode.appendChild(contentNode);
 document.body.appendChild(exportNode);
 await html2pdf().set({
 margin: 0,
 filename: 'html-document.pdf',
 image: { type: 'jpeg', quality: 0.95 },
 html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
 jsPDF: { unit: 'in', format: sizeSel.value, orientation: orientSel.value },
 pagebreak: { mode: ['css', 'legacy'] }
 }).from(exportNode).save();
 exportNode.remove();
 if (window.showToast) showToast('PDF downloaded successfully.');
 printBtn.disabled = false;
 printBtn.innerHTML = ' Generate PDF';
 if (window.hideSpinner) hideSpinner();
 return;
 } catch (exportErr) {
 if (exportNode) exportNode.remove();
 console.warn('html2pdf export failed, falling back to print:', exportErr);
 if (window.showToast) showToast('Direct PDF export failed. Opening print fallback.', 'warning');
 }

 const fullHtml = `<!DOCTYPE html><html><head><title>ConvertPDF - HTML Document</title>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>
@page { size: ${sizeSel.value} ${orientSel.value}; margin: 2.54cm; }
@media print { body { margin: 2.54cm; } }
${css}
</style></head><body>${html}
<script>setTimeout(()=>window.print(),500);<\/script></body></html>`;

 const win = window.open('', '_blank');
 if (!win || win.closed || typeof win.closed === 'undefined') {
 if (window.showPopupBlockedWarning) {
 showPopupBlockedWarning('HTML to PDF');
 }
 if (window.showToast) showToast('Popup blocked by browser.', 'error');
 else alert('Popup blocked');
 printBtn.disabled = false; printBtn.innerHTML = ' Generate PDF';
 if (window.hideSpinner) hideSpinner();
 return;
 }
 win.document.write(fullHtml); win.document.close();
 setTimeout(() => { printBtn.disabled = false; printBtn.innerHTML = ' Generate PDF'; if (window.hideSpinner) hideSpinner(); }, 2000);
 });
}




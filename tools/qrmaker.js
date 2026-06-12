async function renderqrmaker(container) {
 try {
 await loadScript('https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js');

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription("Create custom QR codes with colors, error correction, and optional logo. Download as PNG or SVG. 100% private, no uploads.");
 updatePageTitle("QR Code Generator");

 area.innerHTML = `
 <h3> Professional QR Code Generator</h3>
 <p class="tool-description">
 Create custom QR codes with your own colors, logo, and error correction level.
 Download as PNG for web or SVG for print. Great for marketing, business cards, and links.
 After generating, you can also <a href="/pages/img2png.html" target="_self">convert the QR to PNG</a> (if needed).
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my data uploaded to a server?</summary>
 <p>No! All processing happens locally in your browser. Your data never leaves your device.</p>
 </details>
 </div>
 <div class="qr-controls">
 <div class="qr-options-grid" style="margin-bottom:1rem;">
 <div class="qr-option"><label>QR Type:</label><select id="qrType"><option value="text">Text / URL</option><option value="email">Email</option><option value="phone">Phone</option><option value="sms">SMS</option><option value="wifi">WiFi</option><option value="vcard">vCard</option></select></div>
 <div class="qr-option qr-dynamic" data-type="email" style="display:none;"><label>Email subject:</label><input type="text" id="qrEmailSubject" placeholder="Optional subject"></div>
 <div class="qr-option qr-dynamic" data-type="sms" style="display:none;"><label>SMS message:</label><input type="text" id="qrSmsBody" placeholder="Optional message"></div>
 <div class="qr-option qr-dynamic" data-type="wifi" style="display:none;"><label>Security:</label><select id="qrWifiSecurity"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">No password</option></select></div>
 </div>
 <textarea id="qrText" placeholder="Enter text or URL (one per line for batch generation)" style="width: 100%; min-height: 80px; padding: 0.8rem; border-radius: var(--r-md); border: 1px solid rgba(255,255,255,0.1); margin-bottom: 1rem; font-family: inherit;">https://convertpdf.pages.dev</textarea>

 <div class="qr-options-grid">
 <div class="qr-option"><label>Size:</label><select id="qrSize"><option value="200">Small</option><option value="300" selected>Medium</option><option value="500">Large</option><option value="1024">Print</option></select></div>
 <div class="qr-option"><label>Error Correction:</label><select id="qrErrorLevel"><option value="L">Low</option><option value="M" selected>Medium</option><option value="Q">Quartile</option><option value="H">High</option></select></div>
 <div class="qr-option"><label>Margin/Padding:</label><select id="qrMargin"><option value="0">None</option><option value="1">Small</option><option value="2" selected>Medium</option><option value="4">Large</option></select></div>
 <div class="qr-option"><label>Foreground:</label><input type="color" id="qrDarkColor" value="#000000"></div>
 <div class="qr-option"><label>Background:</label><input type="color" id="qrLightColor" value="#ffffff"></div>
 <div class="qr-option" style="display:flex;flex-direction:column;gap:0.35rem;">
   <label for="qrLogo" style="font-weight:500;color:var(--text-secondary);font-size:0.875rem;">Logo (optional)</label>
   <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
     <label for="qrLogo" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;background:var(--bg-accent-softer);border:1px solid var(--border-subtle);border-radius:var(--r-full);cursor:pointer;font-size:0.875rem;color:var(--text-secondary);white-space:nowrap;min-height:36px;">
       &#128247; Choose image
     </label>
     <span id="qrLogoName" style="font-size:0.8rem;color:var(--text-muted);">No file chosen</span>
   </div>
   <input type="file" id="qrLogo" accept="image/*" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;width:1px;height:1px;">
 </div>
 <div class="qr-option"><label>Format:</label><select id="qrFormat"><option value="png">PNG</option><option value="svg">SVG</option></select></div>
 </div>

 <label style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; cursor: pointer;">
 <input type="checkbox" id="qrBatchMode"> Batch Mode (Generate multiple from lines)
 </label>
 </div>

 <div id="qrBatchProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin-top: 1rem;">
 <div id="qrBatchProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
 </div>

 <div class="preview-box">
 <div class="preview-title" id="qrPreviewTitle">Preview</div>
 <div id="qrPreview" style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; align-items: center; min-height: 200px;"></div>
 </div>

 <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
 <button id="downloadQrBtn" class="download-btn" disabled> Download QR Code</button>
 </div>
 `;

 const qrText = document.getElementById('qrText');
 const qrType = document.getElementById('qrType');
 const qrEmailSubject = document.getElementById('qrEmailSubject');
 const qrSmsBody = document.getElementById('qrSmsBody');
 const qrWifiSecurity = document.getElementById('qrWifiSecurity');
 const qrSize = document.getElementById('qrSize');
 const qrErrorLevel = document.getElementById('qrErrorLevel');
 const qrMargin = document.getElementById('qrMargin');
 const qrDarkColor = document.getElementById('qrDarkColor');
 const qrLightColor = document.getElementById('qrLightColor');
 const qrLogo = document.getElementById('qrLogo');
 const qrFormat = document.getElementById('qrFormat');
 const qrBatchMode = document.getElementById('qrBatchMode');
 const qrPreview = document.getElementById('qrPreview');
 const qrPreviewTitle = document.getElementById('qrPreviewTitle');
 const downloadBtn = document.getElementById('downloadQrBtn');
 const progressContainer = document.getElementById('qrBatchProgressContainer');
 const progressBar = document.getElementById('qrBatchProgressBar');

 let currentQrDataUrl = null;
 let currentSvgString = null;
 let batchDataUrls = [];
 let batchSvgStrings = [];

 function svgToDataUrl(svg) {
 return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
 }

 function updateTypeFields() {
 document.querySelectorAll('.qr-dynamic').forEach(el => {
 el.style.display = el.dataset.type === qrType.value ? 'block' : 'none';
 });
 const placeholders = {
 text: 'Enter text or URL (one per line for batch generation)',
 email: 'name@example.com',
 phone: '+15551234567',
 sms: '+15551234567',
 wifi: 'Network name|password',
 vcard: 'Full Name|Company|Phone|Email|Website'
 };
 qrText.placeholder = placeholders[qrType.value] || placeholders.text;
 }

 function escapeWifi(value) {
 return value.replace(/([\\;,":])/g, '\\$1');
 }

 function formatQrPayload(raw) {
 const value = raw.trim();
 switch (qrType.value) {
 case 'email': {
 const subject = qrEmailSubject.value.trim();
 return `mailto:${value}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
 }
 case 'phone':
 return `tel:${value}`;
 case 'sms': {
 const body = qrSmsBody.value.trim();
 return `sms:${value}${body ? `?body=${encodeURIComponent(body)}` : ''}`;
 }
 case 'wifi': {
 const [ssid = value, password = ''] = value.split('|');
 const security = qrWifiSecurity.value;
 return `WIFI:T:${security};S:${escapeWifi(ssid.trim())};P:${security === 'nopass' ? '' : escapeWifi(password.trim())};;`;
 }
 case 'vcard': {
 const [name = value, company = '', phone = '', email = '', website = ''] = value.split('|').map(part => part.trim());
 return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${company}\nTEL:${phone}\nEMAIL:${email}\nURL:${website}\nEND:VCARD`;
 }
 default:
 return value;
 }
 }
 let timeoutId;
 function debounce(func, delay) {
 return function () {
 clearTimeout(timeoutId);
 timeoutId = setTimeout(() => func.apply(this, arguments), delay);
 };
 }
 function loadImage(file) {
 return new Promise((resolve, reject) => {
 const img = new Image();
 img.onload = () => resolve(img);
 img.onerror = reject;
 img.src = URL.createObjectURL(file);
 });
 }

 async function generateQRCodes() {
 const textValue = qrText.value.trim();
 if (!textValue) {
 qrPreview.innerHTML = '<div style="color: var(--text-muted);">Enter text to generate QR code</div>';
 downloadBtn.disabled = true;
 return;
 }

 qrPreview.innerHTML = '<span style="color: var(--text-muted);">Generating...</span>';
 currentQrDataUrl = null;
 currentSvgString = null;
 batchDataUrls = [];
 batchSvgStrings = [];

 const isBatch = qrBatchMode.checked;
 const lines = isBatch ? textValue.split('\n').map(l => l.trim()).filter(l => l) : [textValue];

 if (lines.length === 0) return;
 const shouldShowSpinner = lines.length > 1 || Boolean(qrLogo.files[0]);
 if (shouldShowSpinner && window.showSpinner) showSpinner('Generating QR codes...');

 if (isBatch && lines.length > 1) {
 qrPreviewTitle.textContent = `Preview (${lines.length} codes)`;
 progressContainer.style.display = 'block';
 progressBar.style.width = '0%';
 downloadBtn.textContent = ` Download ${lines.length} QR Codes (ZIP)`;
 } else {
 qrPreviewTitle.textContent = 'Preview';
 progressContainer.style.display = 'none';
 downloadBtn.textContent = ' Download QR Code';
 }

 qrPreview.innerHTML = '';

 try {
 let logoImg = null;
 if (qrLogo.files[0] && qrFormat.value !== 'svg') {
 logoImg = await loadImage(qrLogo.files[0]);
 }

 const margin = parseInt(qrMargin.value);

 for (let i = 0; i < lines.length; i++) {
 const text = formatQrPayload(lines[i]);
 if (isBatch) {
 progressBar.style.width = `${(i / lines.length) * 100}%`;
 }

 if (qrFormat.value === 'svg') {
 const svg = await new Promise((resolve, reject) => {
 QRCode.toString(text, {
 type: 'svg',
 width: parseInt(qrSize.value),
 margin: margin,
 color: { dark: qrDarkColor.value, light: qrLightColor.value },
 errorCorrectionLevel: qrErrorLevel.value
 }, (err, svg) => {
 if (err) reject(err);
 else resolve(svg);
 });
 });

 if (!isBatch) currentSvgString = svg;
 batchSvgStrings.push({ text: lines[i], svg });

 if (!isBatch || i < 10) {
 const previewWrapper = document.createElement('div');
 previewWrapper.style.display = 'flex';
 previewWrapper.style.flexDirection = 'column';
 previewWrapper.style.alignItems = 'center';
 previewWrapper.style.gap = '0.5rem';

 const previewDiv = document.createElement('div');
 previewDiv.style.width = isBatch ? '100px' : 'auto';
 const previewImg = document.createElement('img');
 previewImg.src = svgToDataUrl(svg);
 previewImg.alt = 'QR code preview';
 previewImg.style.maxWidth = isBatch ? '100px' : '300px';
 previewImg.style.height = 'auto';
 previewImg.style.display = 'block';
 previewDiv.appendChild(previewImg);

 previewWrapper.appendChild(previewDiv);

 if (isBatch) {
 const lbl = document.createElement('span');
 lbl.textContent = lines[i].length > 15 ? lines[i].substring(0, 15) + '...' : lines[i];
 lbl.style.fontSize = '0.8rem';
 lbl.style.color = 'var(--text-muted)';
 previewWrapper.appendChild(lbl);
 }

 qrPreview.appendChild(previewWrapper);
 }
 } else {
 const canvas = document.createElement('canvas');
 const size = parseInt(qrSize.value);
 canvas.width = size; canvas.height = size;

 await QRCode.toCanvas(canvas, text, {
 width: size,
 margin: margin,
 color: { dark: qrDarkColor.value, light: qrLightColor.value },
 errorCorrectionLevel: qrErrorLevel.value
 });

 if (logoImg) {
 const ctx = canvas.getContext('2d');
 const logoSize = size * 0.2;
 ctx.fillStyle = qrLightColor.value;
 const bgSize = logoSize + (size * 0.02);
 ctx.fillRect((size - bgSize) / 2, (size - bgSize) / 2, bgSize, bgSize);

 ctx.drawImage(logoImg, (size - logoSize) / 2, (size - logoSize) / 2, logoSize, logoSize);
 }

 const dataUrl = canvas.toDataURL('image/png');
 if (!isBatch) currentQrDataUrl = dataUrl;
 batchDataUrls.push({ text: lines[i], dataUrl });

 if (!isBatch || i < 10) {
 const previewWrapper = document.createElement('div');
 previewWrapper.style.display = 'flex';
 previewWrapper.style.flexDirection = 'column';
 previewWrapper.style.alignItems = 'center';
 previewWrapper.style.gap = '0.5rem';

 const previewImg = document.createElement('img');
 previewImg.src = dataUrl;
 previewImg.style.maxWidth = isBatch ? '100px' : '300px';
 previewImg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
 previewImg.style.borderRadius = '8px';

 previewWrapper.appendChild(previewImg);

 if (isBatch) {
 const lbl = document.createElement('span');
 lbl.textContent = lines[i].length > 15 ? lines[i].substring(0, 15) + '...' : lines[i];
 lbl.style.fontSize = '0.8rem';
 lbl.style.color = 'var(--text-muted)';
 previewWrapper.appendChild(lbl);
 }

 qrPreview.appendChild(previewWrapper);
 }
 }
 }

 if (isBatch && lines.length > 10) {
 const moreLabel = document.createElement('div');
 moreLabel.textContent = `+ ${lines.length - 10} more...`;
 moreLabel.style.alignSelf = 'center';
 moreLabel.style.color = 'var(--text-muted)';
 qrPreview.appendChild(moreLabel);
 }

 if (isBatch) {
 progressBar.style.width = '100%';
 setTimeout(() => { progressContainer.style.display = 'none'; }, 1000);
 }

 downloadBtn.disabled = false;
 } catch (e) {
 qrPreview.textContent = `Error: ${e.message}`;
 if (window.showToast) showToast('QR generation failed: ' + e.message, 'error');
 console.error(e);
 } finally {
 if (shouldShowSpinner && window.hideSpinner) hideSpinner();
 }
 }
 const debouncedGenerate = debounce(generateQRCodes, 300);

 qrType.addEventListener('change', () => {
 updateTypeFields();
 generateQRCodes();
 });
 [qrEmailSubject, qrSmsBody, qrWifiSecurity].forEach(el => {
 el.addEventListener('input', debouncedGenerate);
 el.addEventListener('change', debouncedGenerate);
 });
 qrText.addEventListener('input', debouncedGenerate);
  // Wire up the custom logo button to trigger the hidden file input
  const qrLogoLabel = document.querySelector('label[for="qrLogo"]');
  if (qrLogoLabel) qrLogoLabel.addEventListener('click', (e) => { e.preventDefault(); qrLogo.click(); });
 qrSize.addEventListener('change', generateQRCodes);
 qrErrorLevel.addEventListener('change', generateQRCodes);
 qrMargin.addEventListener('change', generateQRCodes);
 qrDarkColor.addEventListener('input', debouncedGenerate);
 qrLightColor.addEventListener('input', debouncedGenerate);
 qrLogo.addEventListener('change', function() {
    const nameEl = document.getElementById('qrLogoName');
    if (nameEl) nameEl.textContent = qrLogo.files[0] ? qrLogo.files[0].name : 'No file chosen';
    generateQRCodes();
  });
 qrFormat.addEventListener('change', generateQRCodes);
 qrBatchMode.addEventListener('change', generateQRCodes);

 updateTypeFields();
 generateQRCodes();

 downloadBtn.addEventListener('click', async () => {
 const isBatch = qrBatchMode.checked;
 const lines = qrText.value.trim().split('\n').filter(l => l.trim().length > 0);

 if (isBatch && lines.length > 1) {
 try {
 if (typeof JSZip === 'undefined') {
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
 }

 downloadBtn.disabled = true;
 const prevText = downloadBtn.textContent;
 downloadBtn.textContent = ' Creating ZIP...';
 if (window.showSpinner) showSpinner('Creating QR ZIP...');

 const zip = new JSZip();

 if (qrFormat.value === 'svg') {
 batchSvgStrings.forEach((item, i) => {
 const safeName = item.text.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || `qr_${i}`;
 zip.file(`${safeName}_${i + 1}.svg`, item.svg);
 });
 } else {
 batchDataUrls.forEach((item, i) => {
 const safeName = item.text.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || `qr_${i}`;
 const dataUrlParts = item.dataUrl.split(',');
 const mime = dataUrlParts[0].match(/:(.*?);/)[1];
 const bstr = atob(dataUrlParts[1]);
 let n = bstr.length;
 const u8arr = new Uint8Array(n);
 while (n--) { u8arr[n] = bstr.charCodeAt(n); }
 const blob = new Blob([u8arr], { type: mime });

 zip.file(`${safeName}_${i + 1}.png`, blob);
 });
 }

 const content = await zip.generateAsync({ type: 'blob' });
 downloadBlob(content, 'qrcodes_batch.zip');

 downloadBtn.textContent = prevText;
 downloadBtn.disabled = false;
 if (window.showToast) showToast(`Downloaded ${lines.length} QR codes inside ZIP!`);

 } catch (err) {
 console.error("ZIP creation failed", err);
 if (window.showToast) showToast('Failed to create ZIP: ' + err.message, 'error');
 downloadBtn.disabled = false;
 } finally {
 if (window.hideSpinner) hideSpinner();
 }
 } else {
 if (qrFormat.value === 'svg' && currentSvgString) {
 const blob = new Blob([currentSvgString], { type: 'image/svg+xml' });
 downloadBlob(blob, 'qrcode.svg');
 } else if (currentQrDataUrl) {
 const link = document.createElement('a');
 link.download = 'custom-qrcode.png';
 link.href = currentQrDataUrl;
 link.click();
 }
 }
 });
 } catch (___err) {
 console.error('renderqrmaker error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = ' Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




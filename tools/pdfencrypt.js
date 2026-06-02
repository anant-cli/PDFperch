async function renderpdfencrypt(container) {
 try {
 await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib-with-encrypt@1.2.1/dist/pdf-lib.min.js');

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription('Protect PDFs with a password or remove a known PDF password. All processing stays in your browser.');
 updatePageTitle('PDF Password Tool');

 area.innerHTML = `
 <h3>PDF Password Tool</h3>
 <p class="tool-description">
 Add password protection to a PDF or remove a password when you know it. Your files and passwords stay in your browser.
 </p>

 <div style="display:flex; gap:0.5rem; border-bottom:1px solid var(--border-subtle); margin-bottom:1rem;">
 <button id="tabEncrypt" class="secondary" type="button" style="border-bottom:2px solid var(--accent); color:var(--accent);">Protect PDF</button>
 <button id="tabDecrypt" class="secondary" type="button" style="border-bottom:2px solid transparent;">Remove Password</button>
 </div>

 <div id="encryptPanel" style="display:flex; flex-direction:column; gap:1.2rem; max-width:560px; margin:0 auto; padding:1rem; border:1px solid var(--border-subtle); border-radius:var(--r-lg); background:var(--bg-surface);">
 <div id="pdfDropZone" class="drop-zone" style="padding:1.5rem; border-width:1px;">
 <div style="font-size:1.5rem; margin-bottom:0.5rem;">PDF</div>
 <p style="font-size:0.9rem;">Select PDF to protect</p>
 <label class="sr-only" for="pdfToEncrypt">Select PDF to protect</label>
 <input type="file" id="pdfToEncrypt" accept=".pdf" style="display:none;">
 </div>

 <div class="input-group">
 <label for="pdfPassword">User Password</label>
 <div style="display:flex; gap:0.5rem;">
 <input type="password" id="pdfPassword" placeholder="Required to open the PDF" style="max-width:100%;">
 <button id="togglePwd" class="secondary" type="button" aria-label="Show or hide password">Show</button>
 </div>
 <div class="progress-bar-bg" style="height:4px; margin-top:0.5rem;">
 <div id="pwdStrengthBar" class="progress-bar-fill" style="width:0%;"></div>
 </div>
 <div id="pwdStrengthText" style="font-size:0.75rem; margin-top:0.2rem; font-weight:600; text-align:right;"></div>
 </div>

 <div class="input-group">
 <label for="pdfConfirmPassword">Confirm Password</label>
 <div style="display:flex; gap:0.5rem;">
 <input type="password" id="pdfConfirmPassword" placeholder="Repeat user password" style="max-width:100%;">
 <button id="toggleConfirm" class="secondary" type="button" aria-label="Show or hide confirmation password">Show</button>
 </div>
 </div>

 <div class="faq-section" style="margin:0; padding:0.5rem; background:var(--bg-input);">
 <details>
 <summary style="font-size:0.85rem; padding:0.5rem;">Advanced permissions</summary>
 <div style="padding:0.5rem; display:flex; flex-direction:column; gap:0.5rem;">
 <label for="pdfOwnerPassword">Owner Password (optional)</label>
 <div style="display:flex; gap:0.5rem;">
 <input type="password" id="pdfOwnerPassword" placeholder="Defaults to user password" style="max-width:100%; font-size:0.85rem;">
 <button id="toggleOwner" class="secondary" type="button" aria-label="Show or hide owner password">Show</button>
 </div>
 <div class="permissions-grid" style="font-size:0.85rem;">
 <label><input type="checkbox" id="permPrint" checked> Print</label>
 <label><input type="checkbox" id="permCopy" checked> Copy</label>
 <label><input type="checkbox" id="permModify"> Modify</label>
 </div>
 </div>
 </details>
 </div>

 <button id="encryptPdfBtn" class="primary" type="button" style="width:100%;">Encrypt & Download</button>
 <div id="permSummary" class="preview-box" style="display:none; margin:0;"></div>
 </div>

 <div id="decryptPanel" style="display:none; flex-direction:column; gap:1.2rem; max-width:560px; margin:0 auto; padding:1rem; border:1px solid var(--border-subtle); border-radius:var(--r-lg); background:var(--bg-surface);">
 <div id="pdfDecryptDropZone" class="drop-zone" style="padding:1.5rem; border-width:1px;">
 <div style="font-size:1.5rem; margin-bottom:0.5rem;">Unlock</div>
 <p style="font-size:0.9rem;">Select password-protected PDF</p>
 <label class="sr-only" for="pdfToDecrypt">Select password-protected PDF</label>
 <input type="file" id="pdfToDecrypt" accept=".pdf" style="display:none;">
 </div>
 <div class="input-group">
 <label for="pdfDecryptPassword">PDF Password</label>
 <div style="display:flex; gap:0.5rem;">
 <input type="password" id="pdfDecryptPassword" placeholder="Password used to open the PDF" style="max-width:100%;">
 <button id="toggleDecryptPwd" class="secondary" type="button" aria-label="Show or hide unlock password">Show</button>
 </div>
 </div>
 <button id="decryptPdfBtn" class="primary" type="button" style="width:100%;">Remove Password & Download</button>
 </div>
 `;

 const encryptPanel = document.getElementById('encryptPanel');
 const decryptPanel = document.getElementById('decryptPanel');
 const tabEncrypt = document.getElementById('tabEncrypt');
 const tabDecrypt = document.getElementById('tabDecrypt');
 const pdfFile = document.getElementById('pdfToEncrypt');
 const pdfDropZone = document.getElementById('pdfDropZone');
 const pdfPassword = document.getElementById('pdfPassword');
 const pdfConfirm = document.getElementById('pdfConfirmPassword');
 const pdfOwnerPassword = document.getElementById('pdfOwnerPassword');
 const permPrint = document.getElementById('permPrint');
 const permCopy = document.getElementById('permCopy');
 const permModify = document.getElementById('permModify');
 const encryptBtn = document.getElementById('encryptPdfBtn');
 const permSummary = document.getElementById('permSummary');
 const pdfDecryptDropZone = document.getElementById('pdfDecryptDropZone');
 const pdfToDecrypt = document.getElementById('pdfToDecrypt');

 function setMode(mode) {
 const encrypting = mode === 'encrypt';
 encryptPanel.style.display = encrypting ? 'flex' : 'none';
 decryptPanel.style.display = encrypting ? 'none' : 'flex';
 tabEncrypt.style.borderBottomColor = encrypting ? 'var(--accent)' : 'transparent';
 tabEncrypt.style.color = encrypting ? 'var(--accent)' : 'var(--text-muted)';
 tabDecrypt.style.borderBottomColor = encrypting ? 'transparent' : 'var(--accent)';
 tabDecrypt.style.color = encrypting ? 'var(--text-muted)' : 'var(--accent)';
 }

 function makeToggle(btnId, inputId) {
 const btn = document.getElementById(btnId);
 const inp = document.getElementById(inputId);
 if (!btn || !inp) return;
 btn.addEventListener('click', () => {
 const showing = inp.type === 'password';
 inp.type = showing ? 'text' : 'password';
 btn.textContent = showing ? 'Hide' : 'Show';
 });
 }

 tabEncrypt.addEventListener('click', () => setMode('encrypt'));
 tabDecrypt.addEventListener('click', () => setMode('decrypt'));
 makeToggle('togglePwd', 'pdfPassword');
 makeToggle('toggleConfirm', 'pdfConfirmPassword');
 makeToggle('toggleOwner', 'pdfOwnerPassword');
 makeToggle('toggleDecryptPwd', 'pdfDecryptPassword');

 pdfDropZone.addEventListener('click', () => pdfFile.click());
 pdfFile.addEventListener('change', () => {
 if (pdfFile.files[0] && window.showFileOnDropZone) showFileOnDropZone('pdfDropZone', pdfFile.files[0]);
 permSummary.style.display = 'none';
 });
 if (typeof setupDropZone === 'function') setupDropZone('pdfDropZone', 'pdfToEncrypt');

 pdfDecryptDropZone.addEventListener('click', () => pdfToDecrypt.click());
 pdfToDecrypt.addEventListener('change', () => {
 if (pdfToDecrypt.files[0] && window.showFileOnDropZone) showFileOnDropZone('pdfDecryptDropZone', pdfToDecrypt.files[0]);
 });
 if (typeof setupDropZone === 'function') setupDropZone('pdfDecryptDropZone', 'pdfToDecrypt');

 pdfPassword.addEventListener('input', () => {
 if (window.updatePasswordStrengthMeter) updatePasswordStrengthMeter(pdfPassword.value, 'pwdStrengthBar', 'pwdStrengthText');
 });

 document.getElementById('decryptPdfBtn').addEventListener('click', async () => {
 const file = pdfToDecrypt.files[0];
 const pwd = document.getElementById('pdfDecryptPassword').value;
 if (!file) { showToast('Please select a PDF file.', 'warning'); return; }
 if (!pwd) { showToast('Please enter the PDF password.', 'warning'); return; }

 const decBtn = document.getElementById('decryptPdfBtn');
 decBtn.disabled = true;
 decBtn.textContent = 'Unlocking...';
 if (window.showSpinner) showSpinner('Removing password...');

 try {
 const buf = await file.arrayBuffer();
 const pdfDoc = await PDFLib.PDFDocument.load(buf, { password: pwd });
 const unlockedBytes = await pdfDoc.save();
 const base = file.name.replace(/\.pdf$/i, '') || 'document';
 downloadBlob(new Blob([unlockedBytes], { type: 'application/pdf' }), `${base}-unlocked.pdf`);
 if (window.showToast) showToast('Password removed successfully.');
 } catch (e) {
 const msg = e.message && e.message.toLowerCase().includes('password')
 ? 'Wrong password. Could not unlock this PDF.'
 : 'Unlock failed: ' + e.message;
 if (window.showToast) showToast(msg, 'error');
 console.error(e);
 } finally {
 decBtn.disabled = false;
 decBtn.textContent = 'Remove Password & Download';
 if (window.hideSpinner) hideSpinner();
 }
 });

 encryptBtn.addEventListener('click', async () => {
 const file = pdfFile.files[0];
 const pwd = pdfPassword.value;
 const confirm = pdfConfirm.value;
 const ownerPwd = pdfOwnerPassword.value || pwd;

 if (!file) { showToast('Please select a PDF file.', 'warning'); return; }
 const validation = validateFile(file, {
 extensions: ['.pdf'],
 mimeTypes: ['application/pdf'],
 maxSize: 100 * 1024 * 1024,
 label: 'PDF file'
 });
 if (!validation.valid) { showToast(validation.message, 'error'); return; }
 if (!pwd) { showToast('Please enter a user password.', 'warning'); return; }
 if (pwd !== confirm) { showToast('User passwords do not match.', 'error'); return; }
 if (pwd.length < 8) { showToast('User password must be at least 8 characters.', 'error'); return; }

 if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
 if (!window.sessionStorage.getItem('passwordStrengthTipShown')) {
 showToast('Tip: stronger passwords use uppercase, lowercase, and numbers.', 'warning');
 window.sessionStorage.setItem('passwordStrengthTipShown', 'true');
 }
 }

 if (window.rateLimiter && !rateLimiter.canProceed('pdfencrypt', 2000)) {
 showToast('Please wait a moment before encrypting again.', 'warning');
 return;
 }

 encryptBtn.disabled = true;
 encryptBtn.textContent = 'Encrypting...';
 if (window.showSpinner) showSpinner('Encrypting PDF...');

 try {
 const { PDFDocument } = PDFLib;
 const arrayBuf = await file.arrayBuffer();
 let pdfDoc;
 try {
 pdfDoc = await PDFDocument.load(arrayBuf, { ignoreEncryption: true });
 } catch (loadErr) {
 if (loadErr.message && loadErr.message.toLowerCase().includes('password')) {
 throw new Error('This PDF is already encrypted. Use Remove Password first.');
 }
 throw new Error('Unable to read PDF file. Please ensure it is valid.');
 }

 const newPdf = await PDFDocument.create();
 const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
 copiedPages.forEach(page => newPdf.addPage(page));

 if (typeof newPdf.encrypt !== 'function') {
 throw new Error('PDF encryption is not available. Please refresh and try again.');
 }

 await newPdf.encrypt({
 userPassword: pwd,
 ownerPassword: ownerPwd,
 permissions: {
 printing: permPrint.checked ? 'highResolution' : 'none',
 modifying: permModify.checked,
 copying: permCopy.checked,
 annotating: false,
 fillingForms: false,
 contentAccessibility: true,
 documentAssembly: false
 }
 });

 const encryptedBytes = await newPdf.save();
 const encBase = file.name.replace(/\.pdf$/i, '') || 'document';
 downloadBlob(new Blob([encryptedBytes], { type: 'application/pdf' }), `${encBase}-protected.pdf`);
 if (window.trackEvent) trackEvent('Tool', 'encrypt', 'pdfencrypt');

 permSummary.style.display = 'block';
 permSummary.innerHTML = `<strong>Protected successfully</strong><br>
 Password protected &middot;
 ${permPrint.checked ? 'Print allowed' : 'Print blocked'} &middot;
 ${permCopy.checked ? 'Copy allowed' : 'Copy blocked'} &middot;
 ${permModify.checked ? 'Modify allowed' : 'Modify blocked'}`;

 if (window.showToast) showToast('PDF encrypted successfully.');
 } catch (error) {
 console.error('Encryption error:', error);
 if (window.showToast) showToast('Encryption failed: ' + error.message, 'error');
 } finally {
 encryptBtn.disabled = false;
 encryptBtn.textContent = 'Encrypt & Download';
 if (window.hideSpinner) hideSpinner();
 }
 });
 } catch (___err) {
 console.error('renderpdfencrypt error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = 'Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




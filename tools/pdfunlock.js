// pdfunlock.js – Remove password from PDF entirely in the browser
// Uses pdf-lib-with-encrypt (already loaded for pdfencrypt.js)
async function renderpdfunlock(container) {
    if (typeof updateTitle === 'function') updateTitle('Remove PDF Password | ConvertPDF');
    if (typeof updateMetaDescription === 'function')
        updateMetaDescription('Remove password protection from a PDF in your browser. No upload. Free.');

    container.innerHTML = `
        <h3>&#128274; Remove PDF Password</h3>
        <p style="color:var(--text-muted); margin-bottom:1rem;">
            Enter the current password to unlock and re-save the PDF without protection.
            Everything runs in your browser — your file is never uploaded.
        </p>

        <details style="margin-bottom:1rem;">
            <summary>Is this legal?</summary>
            <p>Only remove passwords from PDFs you own or have permission to unlock. This tool is for recovering access to your own files.</p>
            <summary style="margin-top:0.5rem;">Is my file uploaded?</summary>
            <p>No. All processing happens in your browser using pdf-lib. Your file never leaves your device.</p>
        </details>

        <div class="drop-zone" id="unlockDropZone" style="border: 2px dashed rgba(255,255,255,0.1); padding: 2rem; text-align: center; border-radius: var(--r-md); background: var(--bg-input); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div>&#128274; Drop a password-protected PDF here, or click to select</div>
            <input type="file" id="unlockPdfInput" accept=".pdf" style="display: none;">
        </div>

        <div id="unlockFileInfo" style="display:none; margin-bottom:1rem; padding:0.75rem; background:var(--bg-input); border-radius:4px; font-size:0.9rem; color:var(--text-muted);">
            <strong>File:</strong> <span id="unlockFileName">-</span>
        </div>

        <div class="input-group">
            <label for="unlockPassword">Current PDF Password</label>
            <input type="password" id="unlockPassword" placeholder="Enter the password to unlock the PDF" autocomplete="off">
        </div>

        <button id="unlockPdfBtn" class="primary" disabled>&#128275; Remove Password</button>

        <div id="unlockProgressContainer" style="display:none; width: 100%; background: var(--bg-input); border-radius: 4px; margin: 1rem 0;">
            <div id="unlockProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>
        <div id="unlockProgress" class="preview-box" style="min-height:40px; display:none; text-align:center; margin-top:0.5rem;"></div>

        <div style="margin-top:1.5rem;">
            <button id="downloadUnlockBtn" class="download-btn" disabled>&#11015; Download Unlocked PDF</button>
        </div>
    `;

    // Load pdf-lib-with-encrypt if not already loaded
    if (typeof PDFLib === 'undefined' || typeof PDFLib.encryptPdf === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib-with-encrypt@1.2.1/dist/pdf-lib.min.js');
    }

    const dropZone = document.getElementById('unlockDropZone');
    const inp = document.getElementById('unlockPdfInput');
    const fileInfo = document.getElementById('unlockFileInfo');
    const fileNameSpan = document.getElementById('unlockFileName');
    const pwInput = document.getElementById('unlockPassword');
    const btn = document.getElementById('unlockPdfBtn');
    const progressDiv = document.getElementById('unlockProgress');
    const progressContainer = document.getElementById('unlockProgressContainer');
    const progressBar = document.getElementById('unlockProgressBar');
    const downloadBtn = document.getElementById('downloadUnlockBtn');

    let currentFile = null;

    dropZone.addEventListener('click', () => inp.click());
    if (typeof setupDropZone === 'function') setupDropZone('unlockDropZone', 'unlockPdfInput');

    inp.addEventListener('change', () => {
        const file = inp.files[0];
        if (!file) return;
        currentFile = file;
        fileNameSpan.textContent = file.name;
        fileInfo.style.display = 'block';
        downloadBtn.disabled = true;
        btn.disabled = false;
        if (window.showFileOnDropZone) showFileOnDropZone('unlockDropZone', file);
        if (window.showToast) showToast(`Loaded: ${file.name}`);
    });

    btn.addEventListener('click', async () => {
        if (!currentFile) return;
        const password = pwInput.value;
        if (!password) {
            if (window.showToast) showToast('Please enter the current password', 'error');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '⏳ Unlocking...';
        progressDiv.style.display = 'block';
        progressDiv.innerHTML = 'Loading encrypted PDF...';
        progressContainer.style.display = 'block';
        progressBar.style.width = '20%';
        downloadBtn.disabled = true;

        try {
            const arrayBuf = await currentFile.arrayBuffer();
            progressBar.style.width = '50%';
            progressDiv.innerHTML = 'Decrypting...';

            // Load with password — pdf-lib-with-encrypt decrypts on load
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuf, {
                password: password,
                ignoreEncryption: false
            });

            progressBar.style.width = '80%';
            progressDiv.innerHTML = 'Saving unlocked PDF...';

            // Save without encryption
            const unlockedBytes = await pdfDoc.save();
            progressBar.style.width = '100%';
            progressDiv.innerHTML = 'Done! Password removed.';

            const blob = new Blob([unlockedBytes], { type: 'application/pdf' });
            downloadBtn.disabled = false;
            downloadBtn.onclick = () => {
                const baseName = currentFile.name.replace(/\.pdf$/i, '');
                downloadBlob(blob, `${baseName}_unlocked.pdf`);
            };

            if (window.showToast) showToast('Password removed successfully!');
        } catch (e) {
            progressDiv.innerHTML = '';
            progressContainer.style.display = 'none';
            const msg = e.message && e.message.includes('password')
                ? 'Incorrect password. Please check and try again.'
                : 'Failed to unlock PDF: ' + e.message;
            if (window.showToast) showToast(msg, 'error');
            console.error('pdfunlock error:', e);
        }

        btn.disabled = false;
        btn.innerHTML = '🔓 Remove Password';
    });
}

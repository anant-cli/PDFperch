async function rendermergepdf(container) {
 try {
 await Promise.all([
 loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'),
 loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
 ]);
 pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

 container.innerHTML = '';
 const area = document.createElement('div');
 area.className = 'area';
 container.appendChild(area);

 updateMetaDescription('Combine multiple PDF files into one with thumbnails, page counts, and drag-to-reorder. 100% private, no uploads.');
 updatePageTitle('Merge PDFs Online');

 area.innerHTML = `
 <h3>Select multiple PDFs</h3>
 <p class="tool-description">
 Combine multiple PDF files into one. Drag files into the order you need before merging.
 After merging, you can also <a href="/pages/pdfencrypt.html" target="_self">password-protect</a> the result.
 </p>
 <div class="faq-section">
 <h4>Frequently Asked Questions</h4>
 <details>
 <summary>Is my file uploaded to a server?</summary>
 <p>No. All processing happens locally in your browser. Your files never leave your device.</p>
 </details>
 </div>

 <div id="pdfMergeDropZone" class="drop-zone">
 <div style="margin-bottom:1rem;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="drop-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
 <p>Drag and drop PDF files here</p>
 <p class="note">or click to browse files</p>
 <input type="file" id="pdfMergeInput" accept=".pdf" multiple style="display: none;">
 </div>

 <ul id="mergeFileList" class="file-list"></ul>

 <div id="mergeStats" style="display:none; text-align:right; margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem;">
 Total Files: <span id="mergeTotalFiles">0</span> | Pages: <span id="mergeTotalPages">0</span> | Est. Size: <span id="mergeTotalSize">0 Bytes</span>
 </div>

 <div id="mergeProgressContainer" style="display:none; margin-bottom: 1rem;" class="progress-bar-bg">
 <div id="mergeProgressBar" class="progress-bar-fill" style="width: 0%;"></div>
 </div>

 <button id="mergePdfBtn" disabled>Merge & download</button>
 `;

 const mergeInp = document.getElementById('pdfMergeInput');
 const mergeDropZone = document.getElementById('pdfMergeDropZone');
 const fileList = document.getElementById('mergeFileList');
 const mergeBtn = document.getElementById('mergePdfBtn');
 const mergeStats = document.getElementById('mergeStats');
 const mergeTotalFiles = document.getElementById('mergeTotalFiles');
 const mergeTotalPages = document.getElementById('mergeTotalPages');
 const mergeTotalSize = document.getElementById('mergeTotalSize');
 const progressContainer = document.getElementById('mergeProgressContainer');
 const progressBar = document.getElementById('mergeProgressBar');

 let filesArray = [];
 const fileMeta = new Map();
 const isDataTransferSupported = typeof DataTransfer === 'function';

 mergeDropZone.addEventListener('click', () => mergeInp.click());
 if (typeof setupDropZone === 'function') setupDropZone('pdfMergeDropZone', 'pdfMergeInput');

 function syncFileInput() {
 if (!isDataTransferSupported) {
 mergeInp.value = '';
 return;
 }
 const dt = new DataTransfer();
 filesArray.forEach(file => dt.items.add(file));
 mergeInp.files = dt.files;
 }

 function moveFile(index, direction) {
 if (!isDataTransferSupported) return;
 const target = direction === 'up' ? index - 1 : index + 1;
 if (target < 0 || target >= filesArray.length) return;
 [filesArray[index], filesArray[target]] = [filesArray[target], filesArray[index]];
 syncFileInput();
 renderFileList();
 }

 function updateStats() {
 if (filesArray.length > 0) {
 mergeStats.style.display = 'block';
 mergeTotalFiles.textContent = filesArray.length;
 mergeTotalPages.textContent = filesArray.reduce((total, file) => total + (fileMeta.get(file)?.pages || 0), 0);
 const totalBytes = filesArray.reduce((acc, file) => acc + file.size, 0);
 mergeTotalSize.textContent = typeof formatFileSize === 'function' ? formatFileSize(totalBytes) : totalBytes + ' bytes';
 mergeBtn.disabled = filesArray.length < 2;
 } else {
 mergeStats.style.display = 'none';
 mergeBtn.disabled = true;
 }
 }

 async function loadFileMeta(file) {
 if (fileMeta.has(file)) return fileMeta.get(file);
 const meta = { pages: 0, thumbUrl: '' };
 fileMeta.set(file, meta);
 try {
 const buf = await file.arrayBuffer();
 const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
 meta.pages = pdf.numPages;
 const page = await pdf.getPage(1);
 const viewport = page.getViewport({ scale: 0.18 });
 const canvas = document.createElement('canvas');
 canvas.width = viewport.width;
 canvas.height = viewport.height;
 await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
 meta.thumbUrl = canvas.toDataURL('image/png');
 releaseCanvas(canvas);
 } catch (err) {
 console.warn('Unable to render merge thumbnail:', err);
 }
 return meta;
 }

  function renderFileList() {
  fileList.innerHTML = '';
  filesArray.forEach((file, index) => {
  const meta = fileMeta.get(file) || {};
  const li = document.createElement('li');
  li.className = 'file-item';
  li.draggable = isDataTransferSupported;
  li.dataset.index = index;
  li.style.gap = '0.75rem';

  const fileSize = typeof formatFileSize === 'function' ? formatFileSize(file.size) : Math.round(file.size / 1024) + ' KB';
  li.innerHTML = `
  <img src="${meta.thumbUrl || ''}" alt="" style="width:48px;height:64px;object-fit:contain;background:var(--bg-input);border:1px solid var(--border-subtle);border-radius:4px;${meta.thumbUrl ? '' : 'visibility:hidden;'}">
  <span class="file-name" style="flex:1;">${escapeHtml(file.name)} <small class="file-meta">(${fileSize}${meta.pages ? `, ${meta.pages} pages` : ''})</small></span>
  <div class="file-actions">
  ${isDataTransferSupported ? `
  <button class="move-file" data-dir="up" title="Move up" aria-label="Move ${escapeHtml(file.name)} up">Up</button>
  <button class="move-file" data-dir="down" title="Move down" aria-label="Move ${escapeHtml(file.name)} down">Down</button>
  ` : ''}
  <button class="remove-file" style="color:#e74c3c; border-color:rgba(248,113,113,0.25); background:rgba(248,113,113,0.08);" title="Remove" aria-label="Remove ${escapeHtml(file.name)}">Remove</button>
  </div>
  `;

  if (isDataTransferSupported) {
  li.addEventListener('dragstart', e => {
  e.dataTransfer.setData('text/plain', String(index));
  li.style.opacity = '0.6';
  });
  li.addEventListener('dragend', () => {
  li.style.opacity = '';
  });
  li.addEventListener('dragover', e => {
  e.preventDefault();
  li.style.borderColor = 'var(--accent)';
  });
  li.addEventListener('dragleave', () => {
  li.style.borderColor = '';
  });
  li.addEventListener('drop', e => {
  e.preventDefault();
  li.style.borderColor = '';
  const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
  if (Number.isNaN(from) || from === index) return;
  const [moved] = filesArray.splice(from, 1);
  filesArray.splice(index, 0, moved);
  syncFileInput();
  renderFileList();
  });
  }
  li.querySelector('.remove-file').addEventListener('click', e => {
  e.stopPropagation();
  filesArray.splice(index, 1);
  syncFileInput();
  renderFileList();
  });

  if (isDataTransferSupported) {
  li.querySelectorAll('.move-file').forEach(button => {
  button.addEventListener('click', e => {
  e.stopPropagation();
  const direction = button.dataset.dir;
  moveFile(index, direction);
  });
  });
  }

  fileList.appendChild(li);
  });
  updateStats();
  }

  mergeInp.addEventListener('change', async () => {
  if (mergeInp.files.length === 0) return;
  
  if (!isDataTransferSupported && filesArray.length === 0) {
  if (window.showToast) showToast('File reordering is not supported in this browser — files will be merged in selection order.', 'info');
  }

  filesArray = [...filesArray, ...Array.from(mergeInp.files)];

  const seen = new Set();
  filesArray = filesArray.filter(file => {
  const id = `${file.name}-${file.lastModified}-${file.size}`;
  if (seen.has(id)) return false;
  seen.add(id);
  return true;
  });

  if (filesArray.length > 0) {
  const p = mergeDropZone.querySelector('p');
  if (p) p.innerHTML = `<strong>${filesArray.length} file${filesArray.length > 1 ? 's' : ''} selected</strong>`;
  mergeDropZone.style.borderColor = 'var(--accent)';
  mergeDropZone.style.background = 'rgba(99,102,241,0.07)';
  }

  renderFileList();
  await Promise.all(filesArray.map(loadFileMeta));
  renderFileList();
  });

 mergeBtn.addEventListener('click', async () => {
 if (filesArray.length < 2) {
 if (window.showToast) showToast('Select at least two PDFs to merge', 'warning');
 return;
 }

 mergeBtn.disabled = true;
 mergeBtn.textContent = 'Merging...';
 progressContainer.style.display = 'block';
 progressBar.style.width = '0%';
 if (window.showSpinner) showSpinner('Merging PDFs...');

 try {
 const { PDFDocument } = PDFLib;
 const merged = await PDFDocument.create();
 let totalPages = 0;

 for (let i = 0; i < filesArray.length; i++) {
 const file = filesArray[i];
 mergeBtn.textContent = `Merging (${i + 1}/${filesArray.length})...`;
 progressBar.style.width = `${(i / filesArray.length) * 100}%`;

 const buf = await file.arrayBuffer();
 const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
 if (pdf.isEncrypted && window.showToast) {
   showToast(`File "${file.name}" was encrypted. Encryption was removed during merge.`, 'info');
 }
 const copied = await merged.copyPages(pdf, pdf.getPageIndices());
 copied.forEach(page => merged.addPage(page));
 totalPages += pdf.getPageCount();
 }

 progressBar.style.width = '100%';
 mergeBtn.textContent = 'Saving...';

 const mergedBytes = await merged.save();
 const resultSize = typeof formatFileSize === 'function' ? formatFileSize(mergedBytes.byteLength) : mergedBytes.byteLength + ' bytes';
 downloadBlob(new Blob([mergedBytes], { type: 'application/pdf' }), 'merged-document.pdf');
 if (window.showToast) showToast(`Merged ${totalPages} pages (${resultSize}).`);
 } catch (e) {
 if (window.showToast) showToast('Merge failed: ' + e.message, 'error');
 if (typeof DEBUG !== 'undefined' && DEBUG) console.error(e);
 } finally {
 mergeBtn.disabled = filesArray.length < 2;
 mergeBtn.textContent = 'Merge & download';
 if (window.hideSpinner) hideSpinner();
 setTimeout(() => {
 progressContainer.style.display = 'none';
 progressBar.style.width = '0%';
 }, 2000);
 }
 });
 } catch (___err) {
 console.error('rendermergepdf error:', ___err);
 const warn = document.createElement('div');
 warn.className = 'warning';
 warn.textContent = 'Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.';
 container.replaceChildren(warn);
 }
}




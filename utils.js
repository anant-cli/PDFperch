const DEBUG = ['localhost', '127.0.0.1'].includes(window.location.hostname);

const CONSTANTS = {
 MAX_FILE_SIZE: 50 * 1024 * 1024,
 DEBOUNCE_DELAY: 300,
 TOAST_DURATION: 4000,
 TOAST_FADE_DURATION: 300,
 RATE_LIMIT_COOLDOWN: 1000,
 MEMORY_CLEANUP_DELAY: 100,
};

// All libraries are self-hosted under /vendor (see /vendor/README.md), so
// PDFperch makes no third-party requests. Same-origin scripts need no SRI
// hashes or CDN mirrors; these maps stay (empty) so callers can still pass an
// integrity value or fallback explicitly if a library is ever loaded from
// elsewhere.
const CDN_INTEGRITY = {};
const CDN_FALLBACKS = {};

function downloadBlob(blob, filename) {
 if (!blob || !(blob instanceof Blob)) {
 console.error('Invalid blob provided to downloadBlob');
 return;
 }

 const link = document.createElement('a');
 const objectUrl = URL.createObjectURL(blob);

 link.href = objectUrl;
 link.download = sanitizeFilename(filename);
 link.style.display = 'none';
 document.body.appendChild(link);

 try {
 link.click();
 } catch (e) {
 console.error('Download failed:', e);
 showToast('Download failed. Please try again.', 'error');
 } finally {
 // Revoking after 100 ms could cancel large downloads in Safari/Firefox
 // before the browser had read the blob; a minute is safely long enough.
 setTimeout(() => link.remove(), CONSTANTS.MEMORY_CLEANUP_DELAY);
 setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
 }
}

const _ESCAPE_HTML_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(str) {
 if (typeof str !== 'string') return '';
 return str.replace(/[&<>"']/g, ch => _ESCAPE_HTML_MAP[ch]);
}

function sanitizeFilename(filename) {
 if (typeof filename !== 'string') return 'download';
 return filename
 .replace(/[\/\\]/g, '')
 .replace(/[<>:"|?*\x00-\x1f]/g, '')
 .replace(/^\.+/, '')
 .trim() || 'download';
}

function validateFile(file, options = {}) {
 if (!file || !(file instanceof File)) {
 return { valid: false, message: 'Please select a valid file.' };
 }

 const {
 extensions = [],
 mimeTypes = [],
 maxSize = CONSTANTS.MAX_FILE_SIZE,
 minSize = 0,
 label = 'file'
 } = options;

 const name = (file.name || '').toLowerCase();
 const type = (file.type || '').toLowerCase();
 const validExtension = extensions.length === 0 ||
 extensions.some(ext => name.endsWith(ext.toLowerCase()));
 const validMime = mimeTypes.length === 0 ||
 mimeTypes.some(mime => type === mime.toLowerCase());

 if (!validExtension && !validMime) {
 const expectedExts = extensions.length > 0 ? extensions.join(', ') : 'supported formats';
 return {
 valid: false,
 message: `Please select a valid ${label} (${expectedExts}).`
 };
 }
 if (file.size > maxSize) {
 return {
 valid: false,
 message: `${label} is too large. Maximum size is ${formatFileSize(maxSize)}.`
 };
 }

 if (file.size < minSize) {
 return {
 valid: false,
 message: `${label} is too small. Minimum size is ${formatFileSize(minSize)}.`
 };
 }

 if (file.size > 20 * 1024 * 1024) {
 showToast('Large file detected — processing may be slow on mobile devices.', 'warning');
 }

 return { valid: true };
}

function fileMatchesAccept(file, accept) {
 if (!accept || !file) return true;

 const tokens = accept.split(',')
 .map(token => token.trim().toLowerCase())
 .filter(Boolean);

 if (tokens.length === 0) return true;

 const name = (file.name || '').toLowerCase();
 const type = (file.type || '').toLowerCase();

 return tokens.some(token => {
 if (token.startsWith('.')) {
 return name.endsWith(token);
 }
 if (token.endsWith('/*')) {
 const baseType = token.slice(0, -1);
 return type.startsWith(baseType);
 }
 return type === token;
 });
}
document.addEventListener('change', (event) => {
 const input = event.target;
 if (!input || input.type !== 'file' || !input.files || input.files.length === 0) {
 return;
 }

 const accept = input.getAttribute('accept');
 if (!accept) return;

 const invalidFile = Array.from(input.files).find(file => !fileMatchesAccept(file, accept));
 if (!invalidFile) return;

 input.value = '';
 showToast('Please select a supported file type.', 'error');
 event.stopImmediatePropagation();
}, true);

function debounce(func, wait = CONSTANTS.DEBOUNCE_DELAY) {
 let timeout;
 return function executedFunction(...args) {
 const later = () => {
 clearTimeout(timeout);
 func.apply(this, args);
 };
 clearTimeout(timeout);
 timeout = setTimeout(later, wait);
 };
}

function throttle(func, limit = CONSTANTS.DEBOUNCE_DELAY) {
 let inThrottle;
 return function(...args) {
 if (!inThrottle) {
 func.apply(this, args);
 inThrottle = true;
 setTimeout(() => inThrottle = false, limit);
 }
 };
}

const _loadingScripts = new Map();
const _loadingStyles = new Map();

function isMobileDevice() {
 return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
 (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
}

const rateLimiter = {
 lastAction: new Map(),

 canProceed(action, cooldownMs = CONSTANTS.RATE_LIMIT_COOLDOWN) {
 const now = Date.now();
 const last = this.lastAction.get(action) || 0;

 if (now - last < cooldownMs) {
 return false;
 }

 this.lastAction.set(action, now);
 return true;
 },

 reset(action) {
 this.lastAction.delete(action);
 },

 clearAll() {
 this.lastAction.clear();
 }
};

window.rateLimiter = rateLimiter;
window.isMobileDevice = isMobileDevice;

function trackEvent(category, action, label, value = 0) {
 // Intentionally a no-op: PDFperch ships no analytics or tracking of any
 // kind (see privacy.html). This function exists only so tool code can call
 // trackEvent(...) without needing to feature-detect it, in case a future,
 // explicitly opt-in, privacy-respecting analytics integration is added.
}

window.trackEvent = trackEvent;

function updatePageTitle(title) {
 if (typeof title !== 'string' || !title.trim()) return;
 document.title = title.trim() + ' | PDFperch';
}

window.updatePageTitle = updatePageTitle;

function updateMetaDescription(description) {
 if (typeof description !== 'string' || !description.trim()) return;
 let meta = document.querySelector('meta[name="description"]');
 if (!meta) {
 meta = document.createElement('meta');
 meta.setAttribute('name', 'description');
 document.head.appendChild(meta);
 }
 meta.setAttribute('content', description.trim());
}

window.updateMetaDescription = updateMetaDescription;

function loadScript(src, integrity, fallbackSrc) {
 if (!src) return Promise.reject(new Error('Script URL is required.'));

 const existing = document.querySelector(`script[src="${src}"][data-loaded="1"]`);
 if (existing) return Promise.resolve();
 if (_loadingScripts.has(src)) return _loadingScripts.get(src);

 const promise = new Promise((resolve, reject) => {
 const stale = document.querySelector(`script[src="${src}"]:not([data-loaded])`);
 if (stale) stale.remove();

 const script = document.createElement('script');
 script.src = src;
 script.crossOrigin = 'anonymous';

 const sri = integrity || CDN_INTEGRITY[src];
 if (sri) script.integrity = sri;

 script.onload = () => {
 script.setAttribute('data-loaded', '1');
 _loadingScripts.delete(src);
 resolve();
 };

 script.onerror = () => {
 script.remove();
 _loadingScripts.delete(src);
 const fallback = fallbackSrc || CDN_FALLBACKS[src];
 if (fallback && fallback !== src) {
 // Same file, same bytes: the primary's hash still guarantees integrity.
 const fallbackIntegrity = CDN_INTEGRITY[fallback] || sri;
 if (DEBUG) console.warn(`[loadScript] ${src} failed, trying fallback: ${fallback}`);
 loadScript(fallback, fallbackIntegrity, null).then(resolve).catch(reject);
 } else {
 reject(new Error(`Failed to load script: ${src}`));
 }
 };

 document.head.appendChild(script);
 });

 _loadingScripts.set(src, promise);
 return promise;
}

window.loadScript = loadScript;

function loadStylesheet(href, integrity) {
 if (!href) return Promise.reject(new Error('Stylesheet URL is required.'));

 const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"][data-loaded="1"]`);
 if (existing) return Promise.resolve();

 if (_loadingStyles.has(href)) return _loadingStyles.get(href);

 const promise = new Promise((resolve, reject) => {
 const stale = document.querySelector(`link[rel="stylesheet"][href="${href}"]:not([data-loaded])`);
 if (stale) stale.remove();

 const link = document.createElement('link');
 link.rel = 'stylesheet';
 link.href = href;
 link.crossOrigin = 'anonymous';

 const sri = integrity || CDN_INTEGRITY[href];
 if (sri) link.integrity = sri;

 link.onload = () => {
 link.setAttribute('data-loaded', '1');
 _loadingStyles.delete(href);
 resolve();
 };
 link.onerror = () => {
 link.remove();
 _loadingStyles.delete(href);
 reject(new Error(`Failed to load stylesheet: ${href}`));
 };

 document.head.appendChild(link);
 });

 _loadingStyles.set(href, promise);
 return promise;
}

window.loadStylesheet = loadStylesheet;

// (loadModuleWithIntegrity removed: it only served the esm.sh PPTX module,
// which is now a self-hosted bundle loaded with loadScript.)

function sanitizeHtmlForTool(html) {
 if (typeof html !== 'string') return '';

 if (window.DOMPurify && typeof DOMPurify.sanitize === 'function') {
 return DOMPurify.sanitize(html, {
 FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'base', 'link', 'meta'],
 FORBID_ATTR: ['srcdoc'],
 ALLOW_DATA_ATTR: false
 });
 }

 const doc = new DOMParser().parseFromString(html, 'text/html');
 doc.querySelectorAll('script, iframe, object, embed, base, link, meta').forEach(node => node.remove());
 doc.querySelectorAll('*').forEach(node => {
 Array.from(node.attributes).forEach(attr => {
 const name = attr.name.toLowerCase();
 const value = attr.value.toLowerCase();
 if (name.startsWith('on') || name === 'srcdoc' || value.includes('javascript:')) {
 node.removeAttribute(attr.name);
 }
 });
 });
 return doc.body.innerHTML;
}

function sanitizeCssForTool(css) {
 if (typeof css !== 'string') return '';
 return css
 .replace(/@import\b[^;]+;?/gi, '')
 .replace(/javascript\s*:/gi, '')
 .replace(/expression\s*\(/gi, '')
 .replace(/url\s*\(\s*(['"]?)\s*(?!data:image\/|blob:|#)[^)]+\)/gi, 'url("")');
}

window.sanitizeHtmlForTool = sanitizeHtmlForTool;
window.sanitizeCssForTool = sanitizeCssForTool;

function releaseCanvas(canvas) {
 if (!canvas) return;
 canvas.width = 0;
 canvas.height = 0;
 canvas.remove();
}

function showSpinner(message = 'Processing...') {
 let spinner = document.getElementById('global-processing-spinner');

 if (!spinner) {
 spinner = document.createElement('div');
 spinner.id = 'global-processing-spinner';
 spinner.className = 'processing-spinner-overlay';
 spinner.setAttribute('role', 'status');
 spinner.setAttribute('aria-live', 'polite');
 spinner.innerHTML = `
 <div class="processing-spinner-box">
 <div class="spinner"></div>
 <p></p>
 </div>
 `;
 document.body.appendChild(spinner);
 }

 const label = spinner.querySelector('p');
 if (label) {
 label.textContent = message;
 }

 spinner.hidden = false;
}

function hideSpinner() {
 const spinner = document.getElementById('global-processing-spinner');
 if (spinner) {
 spinner.hidden = true;
 }
}

function showToast(message, type = 'success') {
 if (typeof message !== 'string') return;

 let container = document.getElementById('toast-container');
 if (!container) {
 container = document.createElement('div');
 container.id = 'toast-container';
 container.className = 'toast-container';
 container.setAttribute('aria-live', 'polite');
 document.body.appendChild(container);
 }

 const icons = {
 success: '',
 error: '',
 warning: '',
 info: ''
 };

 const toast = document.createElement('div');
 toast.className = `toast ${type}`;
 toast.setAttribute('role', 'alert');
 toast.tabIndex = -1;
 const sanitizedMessage = document.createTextNode(message);
 const messageSpan = document.createElement('span');
 messageSpan.appendChild(sanitizedMessage);

 const iconSpan = document.createElement('span');
 iconSpan.className = 'toast-icon';
 iconSpan.textContent = icons[type] || icons.success;

 toast.appendChild(iconSpan);
 toast.appendChild(messageSpan);
 container.appendChild(toast);
 requestAnimationFrame(() => {
 toast.classList.add('show');
 });
 setTimeout(() => {
 toast.classList.add('removing');
 setTimeout(() => toast.remove(), CONSTANTS.TOAST_FADE_DURATION);
 }, CONSTANTS.TOAST_DURATION);
}

function updatePasswordStrengthMeter(password, meterBarId, textId) {
 const bar = document.getElementById(meterBarId);
 const text = document.getElementById(textId);

 if (!bar) return;

 let strength = 0;

 if (password && password.length > 0) {
 if (password.length >= 8) strength++;
 if (/[a-z]/.test(password)) strength++;
 if (/[A-Z]/.test(password)) strength++;
 if (/[0-9]/.test(password)) strength++;
 if (/[^a-zA-Z0-9]/.test(password)) strength++;
 }

 const config = [
 { width: '0%', color: '#e74c3c', label: '' },
 { width: '20%', color: '#e74c3c', label: 'Very Weak' },
 { width: '40%', color: '#e67e22', label: 'Weak' },
 { width: '60%', color: '#f1c40f', label: 'Fair' },
 { width: '80%', color: '#2ecc71', label: 'Good' },
 { width: '100%', color: '#27ae60', label: 'Strong' }
 ];

 strength = Math.min(strength, 5);
 const { width, color, label } = config[strength];

 bar.style.width = width;
 bar.style.background = color;

 if (text) {
 text.textContent = label;
 text.style.color = color;
 }
}

function updateProgressBar(progressPercent, barId) {
 const bar = document.getElementById(barId);
 if (bar) {
 const percent = Math.max(0, Math.min(100, progressPercent));
 bar.style.width = `${percent}%`;
 bar.setAttribute('aria-valuenow', percent);
 }
}

function formatFileSize(bytes) {
 const n = Number(bytes);

 if (!Number.isFinite(n) || n < 0) return '0 Bytes';
 if (n === 0) return '0 Bytes';

 const k = 1024;
 const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
 const i = Math.max(0, Math.min(sizes.length - 1, Math.floor(Math.log(n) / Math.log(k))));

 return parseFloat((n / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function setupDropZone(dropZoneId, fileInputId) {
 const dropZone = document.getElementById(dropZoneId);
 const fileInput = document.getElementById(fileInputId);

 if (!dropZone || !fileInput) {
 if (DEBUG) console.warn(`setupDropZone: Missing elements (${dropZoneId}, ${fileInputId})`);
 return;
 }
 if (isMobileDevice()) {
 const primaryText = dropZone.querySelector('p');
 if (primaryText && /drag/i.test(primaryText.textContent)) {
 primaryText.textContent = 'Tap to select your file';
 }
 }

 const preventDefaults = (e) => {
 e.preventDefault();
 e.stopPropagation();
 };

 const highlight = () => dropZone.classList.add('dragover');
 const unhighlight = () => dropZone.classList.remove('dragover');
 ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
 dropZone.addEventListener(eventName, preventDefaults, false);
 });
 ['dragenter', 'dragover'].forEach(eventName => {
 dropZone.addEventListener(eventName, highlight, false);
 });
 ['dragleave', 'drop'].forEach(eventName => {
 dropZone.addEventListener(eventName, unhighlight, false);
 });
 dropZone.addEventListener('drop', (e) => {
 const dt = e.dataTransfer;
 const files = dt.files;

 if (files.length > 0) {
 fileInput.files = files;
 fileInput.dispatchEvent(new Event('change', { bubbles: true }));
 }
 }, false);
}

function showFileOnDropZone(dropZoneId, file) {
 const dropZone = document.getElementById(dropZoneId);
 if (!dropZone || !file) return;

 const p = dropZone.querySelector('p');
 if (p) {
 const strong = document.createElement('strong');
 strong.textContent = ` ${file.name}`;

 const span = document.createElement('span');
 span.style.color = 'var(--text-muted)';
 span.style.fontSize = '0.85em';
 span.textContent = ` (${formatFileSize(file.size)})`;

 p.innerHTML = '';
 p.appendChild(strong);
 p.appendChild(span);
 }

 dropZone.classList.add('drop-zone--selected');
}

function resetDropZone(dropZoneId, defaultText = 'Drag and drop a file here') {
 const dropZone = document.getElementById(dropZoneId);
 if (!dropZone) return;

 const p = dropZone.querySelector('p');
 if (p) {
 p.textContent = defaultText;
 }

 dropZone.classList.remove('drop-zone--selected');
 dropZone.classList.remove('dragover');
}

function enhanceToolUX(root, options = {}) {
 if (!root || !(root instanceof HTMLElement)) return;

 ensureCanvasAccessibility(root);

 const dropZones = Array.from(root.querySelectorAll('.drop-zone'));
 if (dropZones.length === 0 || root.querySelector('[data-clear-tool-files]')) return;

 const clearWrap = document.createElement('div');
 clearWrap.className = 'tool-reset-row';

 const clearBtn = document.createElement('button');
 clearBtn.type = 'button';
 clearBtn.className = 'secondary tool-clear-btn';
 clearBtn.dataset.clearToolFiles = 'true';
 clearBtn.textContent = 'Clear all';
 clearBtn.setAttribute('aria-label', 'Clear selected files and reset this tool');

 clearBtn.addEventListener('click', () => {
 root.dispatchEvent(new CustomEvent('pdfperch:clear', { bubbles: true }));

 if (typeof options.onClear === 'function') {
 options.onClear();
 return;
 }

 root.querySelectorAll('input[type="file"]').forEach(input => {
 input.value = '';
 });
 root.querySelectorAll('.file-list').forEach(list => {
 list.innerHTML = '';
 });
 root.querySelectorAll('.preview-box').forEach(box => {
 box.innerHTML = '<p class="text-muted">Preview cleared.</p>';
 });
 dropZones.forEach(zone => {
 const firstText = zone.querySelector('p');
 resetDropZone(zone.id, firstText ? firstText.textContent || 'Drag and drop a file here' : 'Drag and drop a file here');
 zone.style.display = '';
 });
 root.querySelectorAll('button').forEach(button => {
 if (button !== clearBtn && /download|merge|save|convert|compress|split|rotate|protect/i.test(button.textContent || '')) {
 button.disabled = true;
 }
 });
 if (window.showToast) showToast('Selections cleared.', 'info');
 });

 clearWrap.appendChild(clearBtn);
 const target = dropZones[dropZones.length - 1];
 target.insertAdjacentElement('afterend', clearWrap);
}

function ensureCanvasAccessibility(root = document) {
 root.querySelectorAll('canvas').forEach((canvas, index) => {
 if (!canvas.getAttribute('role')) {
 canvas.setAttribute('role', 'img');
 }
 if (!canvas.getAttribute('aria-label')) {
 const pageCard = canvas.closest('[data-page-number], .page-thumb');
 const pageLabel = pageCard && (pageCard.getAttribute('data-page-number') || pageCard.textContent.match(/Page\s+\d+/i)?.[0]);
 canvas.setAttribute('aria-label', pageLabel ? `${pageLabel} preview` : `Document preview ${index + 1}`);
 }
 if (!canvas.nextElementSibling || !canvas.nextElementSibling.classList.contains('canvas-fallback-text')) {
 const fallback = document.createElement('span');
 fallback.className = 'sr-only canvas-fallback-text';
 fallback.textContent = canvas.getAttribute('aria-label');
 canvas.insertAdjacentElement('afterend', fallback);
 }
 });
}

const MemoryManager = {
 objectUrls: new Set(),

 registerObjectUrl(url) {
 if (typeof url === 'string' && url.startsWith('blob:')) {
 this.objectUrls.add(url);
 }
 },

 revokeObjectUrl(url) {
 if (this.objectUrls.has(url)) {
 URL.revokeObjectURL(url);
 this.objectUrls.delete(url);
 }
 },

 cleanup() {
 this.objectUrls.forEach(url => {
 try {
 URL.revokeObjectURL(url);
 } catch (e) {
 if (DEBUG) console.warn('Failed to revoke object URL:', e);
 }
 });
 this.objectUrls.clear();
 }
};
window.addEventListener('beforeunload', () => {
 MemoryManager.cleanup();
});
window.MemoryManager = MemoryManager;
window.enhanceToolUX = enhanceToolUX;
window.ensureCanvasAccessibility = ensureCanvasAccessibility;

function yieldToMainThread() {
 return new Promise(resolve => {
 if (typeof requestAnimationFrame === 'function') {
 requestAnimationFrame(() => setTimeout(resolve, 0));
 } else {
 setTimeout(resolve, 0);
 }
 });
}
window.yieldToMainThread = yieldToMainThread;

function showPopupBlockedWarning(toolName) {
 let container = document.getElementById('toast-container')
 || document.querySelector('.toast-container');
 if (!container) {
 // Previously returned silently, so the warning never appeared.
 container = document.createElement('div');
 container.id = 'toast-container';
 container.className = 'toast-container';
 container.setAttribute('aria-live', 'polite');
 document.body.appendChild(container);
 }

 const toast = document.createElement('div');
 toast.className = 'toast warning popup-blocked-toast';
 toast.setAttribute('role', 'alert');

 const icon = document.createElement('span');
 icon.className = 'toast-icon';
 icon.textContent = '';

 const msg = document.createElement('span');
 const strong = document.createElement('strong');
 strong.textContent = 'Pop-up blocked! ';
 const detail = document.createTextNode(
 `Your browser blocked the ${toolName} window. Please allow pop-ups for this site in your browser's address bar, then click again.`
 );
 msg.appendChild(strong);
 msg.appendChild(detail);

 const closeBtn = document.createElement('button');
 closeBtn.className = 'toast-close';
 closeBtn.setAttribute('aria-label', 'Dismiss');
 closeBtn.textContent = '\u00d7';
 closeBtn.onclick = () => toast.remove();

 toast.appendChild(icon);
 toast.appendChild(msg);
 toast.appendChild(closeBtn);
 container.appendChild(toast);
}
window.showPopupBlockedWarning = showPopupBlockedWarning;


/**
 * Helpers for drawing on a PDF page in *visual* coordinates, i.e. as the page
 * appears on screen after its /Rotate and CropBox are applied. pdf-lib's
 * getSize() returns the unrotated MediaBox, so stamping at (x, y) from it puts
 * text on the wrong edge (and sideways) of rotated pages, and ignores CropBox
 * offsets.
 *
 * getVisualPageBox(page) -> { width, height } as displayed.
 * toPdfCoords(page, vx, vy) -> { x, y, rotate } where (vx, vy) is measured from
 * the visual bottom-left corner and `rotate` (degrees, CCW) keeps text upright.
 */
function _pageGeometry(page) {
 const box = typeof page.getCropBox === 'function' ? page.getCropBox() : { x: 0, y: 0, ...page.getSize() };
 const r = (((page.getRotation().angle || 0) % 360) + 360) % 360;
 return { cx: box.x, cy: box.y, W: box.width, H: box.height, r };
}

function getVisualPageBox(page) {
 const { W, H, r } = _pageGeometry(page);
 return (r === 90 || r === 270) ? { width: H, height: W } : { width: W, height: H };
}

function toPdfCoords(page, vx, vy) {
 const { cx, cy, W, H, r } = _pageGeometry(page);
 switch (r) {
 case 90: return { x: cx + W - vy, y: cy + vx, rotate: 90 };
 case 180: return { x: cx + W - vx, y: cy + H - vy, rotate: 180 };
 case 270: return { x: cx + vy, y: cy + H - vx, rotate: 270 };
 default: return { x: cx + vx, y: cy + vy, rotate: 0 };
 }
}
window.getVisualPageBox = getVisualPageBox;
window.toPdfCoords = toPdfCoords;

/**
 * Strict page-range parser shared by Split PDF and PDF to JPG.
 * Accepts "1-3, 5, 8-" (open end = last page). Returns
 * { pages: number[] (sorted, unique, 1-based), error: string|null }.
 * Out-of-range, reversed, decimal or malformed parts are reported instead of
 * being silently clamped (previously "10-20" on a 5-page file returned page 5
 * and "2.5" crashed pdf-lib).
 */
function parsePageRanges(input, totalPages) {
 const text = String(input || '').trim();
 if (!text) return { pages: [], error: 'Enter a page range, e.g. 1-3, 5.' };
 const pages = new Set();
 for (const rawPart of text.split(',')) {
 const part = rawPart.trim();
 if (!part) continue;
 const m = part.match(/^(\d+)\s*(?:-\s*(\d*))?$/);
 if (!m) return { pages: [], error: `"${part}" is not a valid page or range.` };
 const start = parseInt(m[1], 10);
 const end = m[2] === undefined ? start : (m[2] === '' ? totalPages : parseInt(m[2], 10));
 if (start < 1 || end < 1) return { pages: [], error: 'Page numbers start at 1.' };
 if (start > end) return { pages: [], error: `"${part}" is reversed. Write it as ${end}-${start}.` };
 if (end > totalPages) return { pages: [], error: `"${part}" goes past the last page (${totalPages}).` };
 for (let i = start; i <= end; i++) pages.add(i);
 }
 if (pages.size === 0) return { pages: [], error: 'Enter a page range, e.g. 1-3, 5.' };
 return { pages: Array.from(pages).sort((a, b) => a - b), error: null };
}
window.parsePageRanges = parsePageRanges;

/**
 * canvas.toBlob() silently falls back to PNG for formats the browser cannot
 * encode (e.g. WebP in Safari). Returns the extension matching the blob that
 * was actually produced, so files are never mislabelled.
 */
function extensionForBlob(blob, fallbackMime) {
 const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
 return map[(blob && blob.type) || fallbackMime] || 'png';
}
window.extensionForBlob = extensionForBlob;

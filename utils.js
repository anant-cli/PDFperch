// ==================== DEBUG FLAG ====================
const DEBUG = ['localhost', '127.0.0.1'].includes(window.location.hostname);

// ==================== CONSTANTS ====================

const CONSTANTS = {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 4000,
    TOAST_FADE_DURATION: 300,
    RATE_LIMIT_COOLDOWN: 1000,
    MEMORY_CLEANUP_DELAY: 100,
};

const CDN_INTEGRITY = {
    'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js': 
        'sha384-nFoSjZIoH3CCp8W639jJyQkuPHinJ2NHe7on1xvlUA7SuGfJAfvMldrsoAVm6ECz',
    'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js': 
        'sha384-weMABwrltA6jWR8DDe9Jp5blk+tZQh7ugpCsF3JwSA53WZM9/14PjS5LAJNHNjAI',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js': 
        'sha384-QsSpx6a0USazT7nK7w8qXDgpSAPhFsb2XtpoLFQ5+X2yFN6hvCKnwEzN8M5FWaJb',
    'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js': 
        'sha384-hIoBPJpTUs74ddyc4bFZSM1TVlQDA60VBbJS0oA934VSz82sBx1X7kSx2ATBDIyd',
    'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js': 
        'sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js': 
        'sha384-06z5D//U/xpvxZHuUz92xBvq3DqBBFi7Up53HRrbV7Jlv7Yvh/MZ7oenfUe9iCEt',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js': 
        'sha384-Uq05+JLko69eOiPr39ta9bh7kld5PKZoU+fF7g0EXTAriEollhZ+DrN8Q/Oi8J2Q',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js': 
        'sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js': 
        'sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG',
    'https://cdn.jsdelivr.net/npm/pdf-lib-with-encrypt@1.2.1/dist/pdf-lib.min.js': 
        'sha384-kLfN3L+t+5ynoVlyBQoP7H06PdFmJ8uhHL/EmxEwqVyjkRHhqbHhufd16fN9Wm81',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js': 
        'sha384-HGmnkDZJy7mRkoARekrrj0VjEFSh9a0Z8qxGri/kTTAJkgR8hqD1lHsYSh3JdzRi',
    'https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.min.js': 
        'sha384-WWGzNJbUWCKFUEexCVTZSZUJ64uYV7FqYVMG855l1ammDY4SH6oLEFuNF6exFtIl',
    'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/dist/purify.min.js': 
        'sha384-qSFej5dZNviyoPgYJ5+Xk4bEbX8AYddxAHPuzs1aSgRiXxJ3qmyWNaPsRkpv/+x5',
    'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css': 
        'sha384-wcIxkf4k558AjM3Yz3BBFQUbk/zgIYC2R0QpeeYb+TwlBVMrlgLqwRjRtGZiK7ww',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css': 
        'sha384-wFjoQjtV1y5jVHbt0p35Ui8aV8GVpEZkyF99OXWqP/eNJDU93D3Ugxkoyh6Y2I4A',
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js': 
        'sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==',
    'https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js':
        'sha384-dHP9fwqd9BAiDh9uJ0p10khgbbcFMh34bVEiCnJ1Ah/AT2T2k4t572VEo3WXzxXp',
    'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.4/dist/tesseract.min.js':
        'sha384-+56qagDlzJ3YYkDcyAXRdhrP7/+ai8qJcS6HpjACl2idDoCyCqRf5VVi7E/XkGae'
};

const CDN_FALLBACKS = {
    'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js': 
        'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
    'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js': 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js': 
        'https://cdn.jsdelivr.net/npm/marked@4.3.0/marked.min.js',
    'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/dist/purify.min.js': 
        'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.2.5/purify.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js': 
        'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js': 
        'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js': 
        'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js'
};

// ==================== FILE OPERATIONS ====================

/**
 * Downloads a blob as a file with proper memory cleanup
 * @param {Blob} blob - The blob to download
 * @param {string} filename - Desired filename
 */
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
        // Clean up with a small delay to ensure download started
        setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
            link.remove();
        }, CONSTANTS.MEMORY_CLEANUP_DELAY);
    }
}

/**
 * Sanitizes filename to prevent path traversal and invalid characters
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
    if (typeof filename !== 'string') return 'download';
    
    // Remove path components and invalid characters
    return filename
        .replace(/[\/\\]/g, '') // Remove slashes
        .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid chars
        .replace(/^\.+/, '') // Remove leading dots
        .trim() || 'download';
}

/**
 * Validates file against specified criteria
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with valid boolean and message
 */
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

    // Validate extensions
    const validExtension = extensions.length === 0 || 
        extensions.some(ext => name.endsWith(ext.toLowerCase()));
    
    // Validate MIME types
    const validMime = mimeTypes.length === 0 || 
        mimeTypes.some(mime => type === mime.toLowerCase());

    if (!validExtension && !validMime) {
        const expectedExts = extensions.length > 0 ? extensions.join(', ') : 'supported formats';
        return { 
            valid: false, 
            message: `Please select a valid ${label} (${expectedExts}).` 
        };
    }

    // Validate file size
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

    return { valid: true };
}

/**
 * Checks if a file matches the accept attribute pattern
 * @param {File} file - File to check
 * @param {string} accept - Accept attribute value
 * @returns {boolean} Whether file matches
 */
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
            const prefix = token.slice(0, -1);
            return type.startsWith(prefix);
        }
        return type === token;
    });
}

/**
 * Global file input validation
 */
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

// ==================== TIMING & UTILITY FUNCTIONS ====================

/**
 * Debounces function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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

/**
 * Throttles function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
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

/**
 * Detects if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
}

/**
 * Rate limiter for preventing abuse
 */
const rateLimiter = {
    lastAction: new Map(),
    
    /**
     * Checks if action can proceed
     * @param {string} action - Action identifier
     * @param {number} cooldownMs - Cooldown period in milliseconds
     * @returns {boolean} Whether action can proceed
     */
    canProceed(action, cooldownMs = CONSTANTS.RATE_LIMIT_COOLDOWN) {
        const now = Date.now();
        const last = this.lastAction.get(action) || 0;
        
        if (now - last < cooldownMs) {
            return false;
        }
        
        this.lastAction.set(action, now);
        return true;
    },
    
    /**
     * Resets rate limit for specific action
     * @param {string} action - Action identifier
     */
    reset(action) {
        this.lastAction.delete(action);
    },
    
    /**
     * Clears all rate limits
     */
    clearAll() {
        this.lastAction.clear();
    }
};

window.rateLimiter = rateLimiter;

// ==================== ANALYTICS ====================

/**
 * trackEvent - no-op stub (analytics removed)
 * Retained for compatibility with tool scripts that call trackEvent().
 */
function trackEvent(category, action, label, value = 0) {
    // Analytics removed — this function is intentionally a no-op.
}

// ==================== SEO HELPERS ====================

/**
 * Updates meta description
 * @param {string} desc - New description
 */
function updateMetaDescription(desc) {
    if (typeof desc !== 'string') return;
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
}

/**
 * Updates page title
 * @param {string} title - New title
 */
function updatePageTitle(title) {
    if (typeof title !== 'string') return;
    document.title = `${title} – ConvertPDF`;
}

// ==================== IMAGE LOADING ====================

/**
 * Loads an image from a file with proper error handling
 * @param {File} file - Image file
 * @returns {Promise<HTMLImageElement>} Loaded image
 */
function loadImage(file) {
    return new Promise((resolve, reject) => {
        if (!file || !(file instanceof File)) {
            reject(new Error('Invalid file provided'));
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Clean up object URL if used
                if (img.src.startsWith('blob:')) {
                    URL.revokeObjectURL(img.src);
                }
                resolve(img);
            };
            
            img.onerror = () => {
                if (img.src.startsWith('blob:')) {
                    URL.revokeObjectURL(img.src);
                }
                reject(new Error('Failed to load image'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// ==================== DYNAMIC RESOURCE LOADING ====================

// In-flight load promises — prevents race conditions when the same URL is
// requested concurrently before its <script> tag fires onload.
const _loadingScripts = new Map();
const _loadingStyles  = new Map();

/**
 * Loads external script with fallback support.
 * Deduplicates concurrent calls for the same URL so the script is only
 * injected once even when multiple tools request it simultaneously.
 * @param {string} src - Script URL
 * @param {string|null} integrity - SRI integrity hash (overrides CDN_INTEGRITY lookup)
 * @param {string|null} fallbackSrc - Fallback URL if primary fails
 * @returns {Promise<void>}
 */
function loadScript(src, integrity, fallbackSrc) {
    // Already finished loading — script tag is present and onload has fired.
    // We track this via a data attribute so we don't resolve prematurely on a
    // still-loading tag (the old bug: existing script found → resolve() called
    // before the global the caller needs is actually defined).
    const existing = document.querySelector(`script[src="${src}"][data-loaded="1"]`);
    if (existing) return Promise.resolve();

    // In-flight: reuse the same promise so we don't inject a duplicate tag.
    if (_loadingScripts.has(src)) return _loadingScripts.get(src);

    const promise = new Promise((resolve, reject) => {
        // Another tab / earlier page load may have added a tag that never
        // finished (e.g. network error). Remove it so we start fresh.
        const stale = document.querySelector(`script[src="${src}"]:not([data-loaded])`);
        if (stale) stale.remove();

        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous'; // always set; needed for SRI and CORS caching

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
                if (DEBUG) console.warn(`[loadScript] ${src} failed, trying fallback: ${fallback}`);
                loadScript(fallback, null, null).then(resolve).catch(reject);
            } else {
                reject(new Error(`Failed to load script: ${src}`));
            }
        };

        document.head.appendChild(script);
    });

    _loadingScripts.set(src, promise);
    return promise;
}

/**
 * Loads external stylesheet with SRI support.
 * Deduplicates concurrent calls the same way as loadScript.
 * @param {string} href - Stylesheet URL
 * @param {string|null} integrity - SRI integrity hash
 * @returns {Promise<void>}
 */
function loadStylesheet(href, integrity) {
    const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"][data-loaded="1"]`);
    if (existing) return Promise.resolve();

    if (_loadingStyles.has(href)) return _loadingStyles.get(href);

    const promise = new Promise((resolve, reject) => {
        const stale = document.querySelector(`link[rel="stylesheet"][href="${href}"]:not([data-loaded])`);
        if (stale) stale.remove();

        const link = document.createElement('link');
        link.rel  = 'stylesheet';
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

/**
 * Frees a canvas element's GPU/memory backing immediately.
 * Call this after toDataURL() / toBlob() once you no longer need the canvas.
 * @param {HTMLCanvasElement} canvas
 */
function releaseCanvas(canvas) {
    if (!canvas) return;
    canvas.width  = 0;
    canvas.height = 0;
    canvas.remove();
}

// ==================== UI COMPONENTS ====================

/**
 * Shows processing spinner
 * @param {string} message - Loading message
 */
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

/**
 * Hides processing spinner
 */
function hideSpinner() {
    const spinner = document.getElementById('global-processing-spinner');
    if (spinner) {
        spinner.hidden = true;
    }
}

/**
 * Shows toast notification
 * @param {string} message - Notification message
 * @param {string} type - Type: success, error, warning, info
 */
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
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.tabIndex = -1;
    
    // Sanitize message to prevent XSS
    const sanitizedMessage = document.createTextNode(message);
    const messageSpan = document.createElement('span');
    messageSpan.appendChild(sanitizedMessage);
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'toast-icon';
    iconSpan.textContent = icons[type] || icons.success;
    
    toast.appendChild(iconSpan);
    toast.appendChild(messageSpan);
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto-remove
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), CONSTANTS.TOAST_FADE_DURATION);
    }, CONSTANTS.TOAST_DURATION);
}

// ==================== VISUAL HELPERS ====================

/**
 * Updates password strength meter
 * @param {string} password - Password to check
 * @param {string} meterBarId - Progress bar element ID
 * @param {string} textId - Text label element ID
 */
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

/**
 * Updates progress bar
 * @param {number} progressPercent - Progress percentage (0-100)
 * @param {string} barId - Progress bar element ID
 */
function updateProgressBar(progressPercent, barId) {
    const bar = document.getElementById(barId);
    if (bar) {
        const percent = Math.max(0, Math.min(100, progressPercent));
        bar.style.width = `${percent}%`;
        bar.setAttribute('aria-valuenow', percent);
    }
}

/**
 * Formats file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    const n = Number(bytes);
    
    if (!Number.isFinite(n) || n < 0) return '0 Bytes';
    if (n === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(n) / Math.log(k)));
    
    return parseFloat((n / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ==================== DRAG AND DROP ====================

/**
 * Sets up drag and drop functionality
 * @param {string} dropZoneId - Drop zone element ID
 * @param {string} fileInputId - File input element ID
 */
function setupDropZone(dropZoneId, fileInputId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);

    if (!dropZone || !fileInput) {
        if (DEBUG) console.warn(`setupDropZone: Missing elements (${dropZoneId}, ${fileInputId})`);
        return;
    }

    // Update text for mobile devices
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

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight on drag over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    // Remove highlight on drag leave or drop
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, false);
}

/**
 * Shows filename on drop zone after file selection
 * @param {string} dropZoneId - Drop zone element ID
 * @param {File} file - Selected file
 */
function showFileOnDropZone(dropZoneId, file) {
    const dropZone = document.getElementById(dropZoneId);
    if (!dropZone || !file) return;

    const p = dropZone.querySelector('p');
    if (p) {
        // Create safe HTML content
        const strong = document.createElement('strong');
        strong.textContent = `📄 ${file.name}`;
        
        const span = document.createElement('span');
        span.style.color = 'var(--text-muted)';
        span.style.fontSize = '0.85em';
        span.textContent = ` (${formatFileSize(file.size)})`;
        
        p.innerHTML = '';
        p.appendChild(strong);
        p.appendChild(span);
    }

    dropZone.style.borderColor = 'var(--accent)';
    dropZone.style.background = 'rgba(99,102,241,0.07)';
}

/**
 * Resets drop zone to default state
 * @param {string} dropZoneId - Drop zone element ID
 * @param {string} defaultText - Default text to display
 */
function resetDropZone(dropZoneId, defaultText = 'Drag and drop a file here') {
    const dropZone = document.getElementById(dropZoneId);
    if (!dropZone) return;

    const p = dropZone.querySelector('p');
    if (p) {
        p.textContent = defaultText;
    }

    dropZone.style.borderColor = '';
    dropZone.style.background = '';
    dropZone.classList.remove('dragover');
}

/**
 * Adds a consistent Clear all control to rendered tools.
 * The loader can pass a full tool reset callback so internal tool state is also cleared.
 * @param {HTMLElement} root
 * @param {Object} options
 */
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
        root.dispatchEvent(new CustomEvent('convertpdf:clear', { bubbles: true }));

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

/**
 * Gives canvas previews a readable fallback for assistive technology.
 * @param {HTMLElement} root
 */
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

// ==================== MEMORY MANAGEMENT ====================

/**
 * Cleanup utility for memory management
 */
const MemoryManager = {
    objectUrls: new Set(),
    
    /**
     * Registers an object URL for cleanup
     * @param {string} url - Object URL
     */
    registerObjectUrl(url) {
        if (typeof url === 'string' && url.startsWith('blob:')) {
            this.objectUrls.add(url);
        }
    },
    
    /**
     * Revokes and removes an object URL
     * @param {string} url - Object URL
     */
    revokeObjectUrl(url) {
        if (this.objectUrls.has(url)) {
            URL.revokeObjectURL(url);
            this.objectUrls.delete(url);
        }
    },
    
    /**
     * Cleans up all registered object URLs
     */
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

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    MemoryManager.cleanup();
});

// Export for global use
window.MemoryManager = MemoryManager;
window.enhanceToolUX = enhanceToolUX;
window.ensureCanvasAccessibility = ensureCanvasAccessibility;

/**
 * Yields execution to the browser main thread to prevent blocking and allow garbage collection
 * @returns {Promise<void>}
 */
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

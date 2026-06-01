(function () {
    'use strict';

    // ==================== CONSTANTS ====================

    const CONSTANTS = {
        ANIMATION_DELAY: 500,
        INTERSECTION_THRESHOLD: 0.1,
        TILT_SENSITIVITY: 10,
        MAGNETIC_SENSITIVITY: 0.3,
    };

    // ==================== MOBILE NAVIGATION ====================

    /**
     * Sets up hamburger menu for mobile navigation
     */
    function setupHamburger() {
        const nav = document.querySelector('.main-nav');
        const headerContainer = document.querySelector('.header-container');
        
        if (!nav || !headerContainer) return;

        // Create toggle button
        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Toggle navigation menu');
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'main-nav-list');
        toggle.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';

        headerContainer.insertBefore(toggle, nav);

        // Create backdrop overlay
        const backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdrop);

        // Set ID for aria-controls
        const ul = nav.querySelector('ul');
        if (ul) {
            ul.id = 'main-nav-list';
        }

        function openMenu() {
            nav.classList.add('open');
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            backdrop.classList.add('visible');
            document.body.style.overflow = 'hidden';
            trapFocus(nav);
        }

        function closeMenu() {
            nav.classList.remove('open');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            backdrop.classList.remove('visible');
            document.body.style.overflow = '';
        }

        // Toggle handler
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (nav.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close on backdrop click
        backdrop.addEventListener('click', closeMenu);

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (!headerContainer.contains(e.target) && nav.classList.contains('open')) {
                closeMenu();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                closeMenu();
                toggle.focus();
            }
        });

        // Close nav when a link is clicked (SPA-style navigation)
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });

        // Close nav on resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 800 && nav.classList.contains('open')) {
                closeMenu();
            }
        });

        // Focus trap for accessibility
        function trapFocus(element) {
            const focusableElements = element.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
            );
            
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            element.addEventListener('keydown', function (e) {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }



    // ==================== NAVIGATION HELPERS ====================

    /**
     * Sets active class on current navigation link
     */
    function setActiveNavLink() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || '/';

        document.querySelectorAll('.main-nav a').forEach(function (link) {
            link.classList.remove('active');
            
            const href = (link.getAttribute('href') || '').split('/').pop();
            const isActive = (
                href === filename ||
                (filename === '' && href === '/') ||
                (filename === '/' && href === '/')
            );
            
            if (isActive) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    // ==================== ACCESSIBILITY ENHANCEMENTS ====================

    /**
     * Ensures main content has proper ID for skip link
     */
    function ensureMainId() {
        const existingTarget = document.getElementById('main-content');
        if (existingTarget) return;

        const main = document.querySelector('main');
        if (main) {
            main.id = 'main-content';
            main.setAttribute('tabindex', '-1'); // Allow programmatic focus
        }
    }

    /**
     * Adds skip-to-content link for keyboard navigation
     */
    function ensureSkipLink() {
        ensureMainId();
        
        if (document.querySelector('.skip-link')) return;
        if (!document.body) return;

        const skip = document.createElement('a');
        skip.className = 'skip-link';
        skip.href = '#main-content';
        skip.textContent = 'Skip to main content';
        
        skip.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.getElementById('main-content');
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        document.body.insertBefore(skip, document.body.firstChild);
    }

    // ==================== UI NORMALIZATION ====================

    /**
     * Normalizes navigation labels with consistent icons
     */
    function normalizeGlobalLabels() {
        const navMap = {
            '/blog/': 'Blog',
            'blog/': 'Blog',
            '/': 'Home',
            '/all-tools': 'All Tools',
            '/about': 'About',
            '/contact': 'Contact',
            '/privacy': 'Privacy',
            '/terms': 'Terms'
        };

        document.querySelectorAll('.main-nav a').forEach(function (a) {
            const href = a.getAttribute('href') || '';
            const lower = href.toLowerCase();

            for (const [key, value] of Object.entries(navMap)) {
                if (lower.endsWith(key) || lower.includes(key)) {
                    a.textContent = value;
                    break;
                }
            }
        });

        // Update logo
        const logo = document.querySelector('.logo a');
        if (logo) {
            logo.textContent = 'ConvertPDF';
            if (!logo.getAttribute('title')) {
                logo.setAttribute('title', 'ConvertPDF - Home');
            }
            if (!logo.getAttribute('aria-label')) {
                logo.setAttribute('aria-label', 'ConvertPDF Home');
            }
        }

        // Normalize back buttons
        document.querySelectorAll('.back-btn').forEach(function (btn) {
            if (/back to home/i.test(btn.textContent)) {
                btn.textContent = 'Back to Home';
            }
        });

        // Normalize social links
        document.querySelectorAll('.social-links a').forEach(function (a) {
            const title = (a.getAttribute('title') || '').toLowerCase();
            
            if (title.includes('github')) {
                a.textContent = 'GitHub';
                a.setAttribute('aria-label', 'GitHub');
            } else if (title.includes('email')) {
                a.textContent = 'Email';
                a.setAttribute('aria-label', 'Email');
            } else if (title.includes('twitter')) {
                a.textContent = 'Twitter';
                a.setAttribute('aria-label', 'Twitter (coming soon)');
            }
        });
    }

    /**
     * Normalizes footer with dynamic year and consistent icons
     */
    function normalizeFooterDetails() {
        document.querySelectorAll('.site-footer h4').forEach(function (heading) {
            if (heading.textContent.trim() === 'Tools') {
                heading.textContent = 'Tools';
            }
        });

        // Update copyright year
        const currentYear = new Date().getFullYear();
        document.querySelectorAll('.footer-bottom p').forEach(function (p) {
            p.innerHTML = p.innerHTML.replace(/(&copy;|©)\s*\d{4}/, '&copy; ' + currentYear);
        });
    }

    // ==================== PREMIUM UI ENHANCEMENTS ====================

    /**
     * Initializes premium UI features (animations, 3D effects)
     */
    function initPremiumUI() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isDesktop = window.matchMedia('(pointer: fine)').matches;

        // 1. Scroll reveals with Intersection Observer
        initScrollReveals();

        // 2. Custom cursor (desktop only, respects motion preferences)
        if (isDesktop && !prefersReducedMotion) {
            initCustomCursor();
        }

        // 3. 3D tilt and spotlight effects for cards
        if (!prefersReducedMotion) {
            setTimeout(() => {
                init3DTiltEffects();
                initMagneticButtons();
            }, CONSTANTS.ANIMATION_DELAY);
        }
    }

    /**
     * Initializes scroll-reveal animations.
     * Skips animation entirely when user prefers reduced motion.
     */
    function initScrollReveals() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Immediately show all reveals if user prefers reduced motion
        if (prefersReducedMotion) {
            document.querySelectorAll('.reveal').forEach(function (el) {
                el.classList.add('active');
            });
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target); // Only animate once
                    }
                });
            },
            {
                threshold: CONSTANTS.INTERSECTION_THRESHOLD,
                rootMargin: '50px'
            }
        );

        document.querySelectorAll('.reveal').forEach(function (el) {
            observer.observe(el);
        });
    }

    /**
     * Initializes custom cursor effect
     */
    function initCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        // Smooth cursor movement
        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        function animateCursor() {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            
            cursorX += dx * 0.14;
            cursorY += dy * 0.14;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        
        animateCursor();

        // Hover effects
        const addHover = () => cursor.classList.add('hover');
        const removeHover = () => cursor.classList.remove('hover');

        setTimeout(function () {
            document.querySelectorAll('a, button, .tool-card').forEach(function (el) {
                el.addEventListener('mouseenter', addHover);
                el.addEventListener('mouseleave', removeHover);
            });
        }, CONSTANTS.ANIMATION_DELAY);
    }

    /**
     * Initializes 3D tilt effects on tool cards
     */
    function init3DTiltEffects() {
        document.querySelectorAll('.tool-card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Update CSS variables for spotlight effect
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');

                // Calculate tilt
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -CONSTANTS.TILT_SENSITIVITY;
                const rotateY = ((x - centerX) / centerX) * CONSTANTS.TILT_SENSITIVITY;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    /**
     * Initializes magnetic button effects
     */
    function initMagneticButtons() {
        document.querySelectorAll('.button, .download-btn').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * CONSTANTS.MAGNETIC_SENSITIVITY;
                const y = (e.clientY - rect.top - rect.height / 2) * CONSTANTS.MAGNETIC_SENSITIVITY;
                
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
            });
        });
    }

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Ensures toast container exists
     */
    function ensureToastContainer() {
        if (document.getElementById('toast-container')) return;
        
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('role', 'status');
        document.body.appendChild(container);
    }

    /**
     * Adds a hidden aria-live region for assertive announcements
     * (e.g. conversion errors) that screen readers catch immediately.
     */
    function ensureAriaAnnouncer() {
        if (document.getElementById('aria-announcer')) return;
        const el = document.createElement('div');
        el.id = 'aria-announcer';
        el.setAttribute('aria-live', 'assertive');
        el.setAttribute('aria-atomic', 'true');
        el.className = 'sr-only';
        document.body.appendChild(el);

        // Expose globally so tool scripts can announce errors
        window.__announce = function (msg) {
            el.textContent = '';
            // Double rAF forces screen readers to pick up the change
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    el.textContent = msg;
                });
            });
        };
    }

    /**
     * Ensures PWA support with service worker
     */
    function ensurePwaSupport() {
        // Add manifest link if missing
        if (!document.querySelector('link[rel="manifest"]')) {
            const manifest = document.createElement('link');
            manifest.rel = 'manifest';
            manifest.href = '/manifest.json';
            document.head.appendChild(manifest);
        }

        // Register service worker for offline support
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js')
                    .then(function (registration) {
                        // SW registered
                    })
                    .catch(function (err) {
                        console.warn('ServiceWorker registration failed:', err);
                    });
            });
        }
    }

    /**
     * Set up premium theme toggle (Dark / Light mode)
     */
    function setupThemeToggle() {
        const headerContainer = document.querySelector('.header-container');
        if (!headerContainer) return;

        if (document.querySelector('.theme-toggle-btn')) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle-btn';
        
        const storedTheme = localStorage.getItem('cpdf_theme');
        let currentTheme = 'dark'; 
        if (storedTheme) {
            currentTheme = storedTheme;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            currentTheme = 'light';
        }
        
        applyTheme(currentTheme, toggleBtn);

        toggleBtn.addEventListener('click', function () {
            document.documentElement.style.setProperty('--theme-transition', '0.3s');
            const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            localStorage.setItem('cpdf_theme', nextTheme);
            applyTheme(nextTheme, toggleBtn);
            if (window.showToast) {
                showToast(`Switched to ${nextTheme} mode!`, 'info');
            }
        });

        const nav = headerContainer.querySelector('.main-nav');
        if (nav) {
            headerContainer.insertBefore(toggleBtn, nav);
        } else {
            headerContainer.appendChild(toggleBtn);
        }
    }

    function applyTheme(theme, toggleBtn) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeMeta(theme);
        if (toggleBtn) {
            updateToggleIcon(toggleBtn, theme);
        }
    }

    function updateThemeMeta(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0b0f1a');
        }
    }

    function updateToggleIcon(btn, theme) {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        btn.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
        btn.setAttribute('title', `Switch to ${nextTheme} theme`);
        if (theme === 'light') {
            btn.innerHTML = '<span aria-hidden="true">D</span><span class="sr-only">Switch to dark theme</span>';
        } else {
            btn.innerHTML = '<span aria-hidden="true">L</span><span class="sr-only">Switch to light theme</span>';
        }
    }

    function clearLegacyStorage() {
        try {
            localStorage.removeItem('convertpdf_consent_v1');
        } catch (e) { /* ignore */ }
    }

    // ==================== INITIALIZATION ====================

    /**
     * Main initialization function
     */
    function init() {
        // Core functionality
        clearLegacyStorage();
        ensureSkipLink();
        ensureAriaAnnouncer();
        normalizeGlobalLabels();
        normalizeFooterDetails();
        ensurePwaSupport();
        setupHamburger();
        setActiveNavLink();
        ensureToastContainer();
        setupThemeToggle();

        // Premium UI features
        initPremiumUI();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// -- Related Tools Component --------------------------------------------------
const RELATED_TOOLS_MAP = {
    'mergepdf':     ['splitpdf','organizepdf','compresspdf','signpdf'],
    'splitpdf':     ['mergepdf','organizepdf','compresspdf','pagenumbers'],
    'compresspdf':  ['mergepdf','pdfencrypt','watermarkpdf','pdf2jpg'],
    'pdfencrypt':   ['signpdf','compresspdf','mergepdf','watermarkpdf'],
    'signpdf':      ['pdfencrypt','watermarkpdf','mergepdf','compresspdf'],
    'watermarkpdf': ['signpdf','pdfencrypt','mergepdf','compresspdf'],
    'rotatepdf':    ['organizepdf','mergepdf','splitpdf','pagenumbers'],
    'organizepdf':  ['mergepdf','splitpdf','rotatepdf','pagenumbers'],
    'pagenumbers':  ['organizepdf','mergepdf','watermarkpdf','compresspdf'],
    'pdf2jpg':      ['img2pdf','compresspdf','splitpdf','ocrtool'],
    'img2pdf':      ['pdf2jpg','mergepdf','compresspdf','docx2pdf'],
    'docx2pdf':     ['pdf2word','img2pdf','mergepdf','compresspdf'],
    'pdf2word':     ['docx2pdf','ocrtool','pdf2jpg','txt2docx'],
    'pptx2pdf':     ['docx2pdf','img2pdf','compresspdf','mergepdf'],
    'md2pdf':       ['docx2pdf','img2pdf','pagenumbers','compresspdf'],
    'web2pdf':      ['md2pdf','docx2pdf','compresspdf','mergepdf'],
    'txt2docx':     ['docx2pdf','md2pdf','mergepdf','compresspdf'],
    'ocrtool':      ['pdf2jpg','img2pdf','compresspdf','splitpdf'],
    'img2png':      ['imgcompress','img2pdf','pdf2jpg','compresspdf'],
    'imgcompress':  ['img2png','img2pdf','compresspdf','pdf2jpg'],
    'qrmaker':      ['img2pdf','pdfencrypt','watermarkpdf','signpdf'],
};

const TOOL_META = {
    'mergepdf':     { name:'Merge PDF',          icon:'JOIN', url:'/merge-pdf' },
    'splitpdf':     { name:'Split PDF',          icon:'CUT',  url:'/split-pdf' },
    'compresspdf':  { name:'Compress PDF',       icon:'ZIP', url:'/compress-pdf' },
    'pdfencrypt':   { name:'Password Protect',   icon:'LOCK', url:'/pdf-password' },
    'signpdf':      { name:'Sign PDF',           icon:'SIGN', url:'/sign-pdf' },
    'watermarkpdf': { name:'Watermark PDF',      icon:'MARK', url:'/watermark-pdf' },
    'rotatepdf':    { name:'Rotate PDF',         icon:'90', url:'/rotate-pdf' },
    'organizepdf':  { name:'Organize PDF',       icon:'ORG', url:'/organize-pdf' },
    'pagenumbers':  { name:'Page Numbers',       icon:'#', url:'/page-numbers' },
    'pdf2jpg':      { name:'PDF to JPG',         icon:'JPG', url:'/pdf-to-jpg' },
    'img2pdf':      { name:'Images to PDF',      icon:'IMG', url:'/jpg-to-pdf' },
    'docx2pdf':     { name:'Word to PDF',        icon:'DOCX', url:'/word-to-pdf' },
    'pdf2word':     { name:'PDF to Word',        icon:'DOC', url:'/pdf-to-word' },
    'pptx2pdf':     { name:'PPTX to PDF',        icon:'PPT', url:'/pptx-to-pdf' },
    'md2pdf':       { name:'Markdown to PDF',    icon:'MD', url:'/markdown-to-pdf' },
    'web2pdf':      { name:'HTML to PDF',        icon:'HTML', url:'/html-to-pdf' },
    'txt2docx':     { name:'TXT to Word',        icon:'TXT', url:'/txt-to-word' },
    'ocrtool':      { name:'OCR Text Extract',   icon:'OCR', url:'/ocr' },
    'img2png':      { name:'Image Converter',    icon:'IMG', url:'/image-converter' },
    'imgcompress':  { name:'Compress Images',    icon:'IMG', url:'/compress-images' },
    'qrmaker':      { name:'QR Code Generator',  icon:'QR', url:'/qr-code-generator' },
};

function renderRelatedTools() {
    const path = window.location.pathname;
    const toolId = path.split('/').pop().replace('.html','');
    const related = RELATED_TOOLS_MAP[toolId];
    if (!related) return;

    const existing = document.getElementById('relatedToolsSection');
    if (existing) return;

    const section = document.createElement('div');
    section.id = 'relatedToolsSection';
    section.className = 'related-tools-section';

    const heading = document.createElement('h3');
    heading.textContent = 'You might also need';
    heading.className = 'related-tools-heading';
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'related-tools-grid';

    related.forEach(id => {
        const meta = TOOL_META[id];
        if (!meta) return;
        const a = document.createElement('a');
        a.href = meta.url;
        a.className = 'related-tool-link';
        a.innerHTML = `<span class="related-tool-icon">${meta.icon}</span><span>${meta.name}</span>`;
        grid.appendChild(a);
    });

    section.appendChild(grid);

    // Inject after toolContainer
    const container = document.getElementById('toolContainer');
    if (container && container.parentNode) {
        container.parentNode.insertBefore(section, container.nextSibling);
    }
}

// Auto-run when DOM is ready and again after tool renders
function scheduleRelatedTools() {
    const timerId = setTimeout(() => {
        if (document.body) renderRelatedTools();
    }, 800);
    // Cancel if the page is being unloaded before the timer fires
    window.addEventListener('pagehide', () => clearTimeout(timerId), { once: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleRelatedTools);
} else {
    scheduleRelatedTools();
}

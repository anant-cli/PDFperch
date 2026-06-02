(function () {
 'use strict';

 const CONSTANTS = {
 ANIMATION_DELAY: 500,
 INTERSECTION_THRESHOLD: 0.1,
 TILT_SENSITIVITY: 10,
 MAGNETIC_SENSITIVITY: 0.3,
 };

 function setupHamburger() {
 const nav = document.querySelector('.main-nav');
 const headerContainer = document.querySelector('.header-container');

 if (!nav || !headerContainer) return;
 const toggle = document.createElement('button');
 toggle.className = 'nav-toggle';
 toggle.setAttribute('aria-label', 'Toggle navigation menu');
 toggle.setAttribute('role', 'button');
 toggle.setAttribute('aria-expanded', 'false');
 toggle.setAttribute('aria-controls', 'main-nav-list');
 toggle.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';

 headerContainer.insertBefore(toggle, nav);
 const backdrop = document.createElement('div');
 backdrop.className = 'nav-backdrop';
 backdrop.setAttribute('aria-hidden', 'true');
 document.body.appendChild(backdrop);
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
 toggle.addEventListener('click', function (e) {
 e.stopPropagation();
 if (nav.classList.contains('open')) {
 closeMenu();
 } else {
 openMenu();
 }
 });
 backdrop.addEventListener('click', closeMenu);
 document.addEventListener('click', function (e) {
 if (!headerContainer.contains(e.target) && nav.classList.contains('open')) {
 closeMenu();
 }
 });
 document.addEventListener('keydown', function (e) {
 if (e.key === 'Escape' && nav.classList.contains('open')) {
 closeMenu();
 toggle.focus();
 }
 });
 nav.querySelectorAll('a').forEach(function(link) {
 link.addEventListener('click', function() {
 closeMenu();
 });
 });
 window.addEventListener('resize', function() {
 if (window.innerWidth > 800 && nav.classList.contains('open')) {
 closeMenu();
 }
 });
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

function getNormalizedNavPath(href) {
 const cleanHref = (href || '').split('#')[0].split('?')[0].trim().toLowerCase();
 if (!cleanHref) return '';

 let path = cleanHref;
 if (/^https?:\/\//.test(cleanHref)) {
 try {
 path = new URL(cleanHref).pathname;
 } catch (e) {
 return '';
 }
 } else if (!cleanHref.startsWith('/')) {
 path = '/' + cleanHref.replace(/^(\.\/)+/, '');
 }

 path = path.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '');
 if (path.length > 1) {
 path = path.replace(/\/+$/, '');
 }
 return path || '/';
}

function getCurrentPagePath() {
 if (window.location.protocol === 'file:') {
 const filename = window.location.pathname.split('/').pop().toLowerCase();
 if (!filename || filename === 'index.html') return '/';
 if (filename === 'blog_index.html') return '/blog';
 return '/' + filename.replace(/\.html$/, '');
 }
 const path = window.location.pathname;
 const normalized = path.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '');
 return (normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized) || '/';
}

function rewriteLocalFileLinks() {
 if (window.location.protocol !== 'file:') return;
 const localPathMap = {
 '/': 'index.html',
 '/all-tools': 'all-tools.html',
 '/blog': 'blog/blog_index.html',
 '/about': 'about.html',
 '/contact': 'contact.html',
 '/privacy': 'privacy.html',
 '/terms': 'terms.html'
 };

 document.querySelectorAll('a[href^="/"]').forEach(function (anchor) {
 const currentHref = anchor.getAttribute('href') || '';
 const normalizedHref = getNormalizedNavPath(currentHref);
 const mapped = localPathMap[normalizedHref];
 if (mapped) {
 anchor.setAttribute('href', mapped);
 }
 });
}

function setActiveNavLink() {
 const currentPath = getCurrentPagePath();
 document.querySelectorAll('.main-nav a').forEach(function (link) {
 link.classList.remove('active');

 const href = getNormalizedNavPath(link.getAttribute('href') || '');
 const isActive = currentPath === href;
 if (isActive) {
 link.classList.add('active');
 link.setAttribute('aria-current', 'page');
 } else {
 link.removeAttribute('aria-current');
 }
 });
 }

 function ensureMainId() {
 const existingTarget = document.getElementById('main-content');
 if (existingTarget) return;

 const main = document.querySelector('main');
 if (main) {
 main.id = 'main-content';
 main.setAttribute('tabindex', '-1');
 }
 }

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

 function normalizeGlobalLabels() {
 const navMap = {
 '/': 'Home',
 '/blog': 'Blog',
 '/all-tools': 'All Tools',
 '/about': 'About',
 '/contact': 'Contact',
 '/privacy': 'Privacy',
 '/terms': 'Terms'
 };

 function normalizeNavPath(href) {
 const cleanHref = (href || '').split('#')[0].split('?')[0].trim().toLowerCase();
 if (!cleanHref) return '';

 let path = cleanHref;
 if (/^https?:\/\//.test(cleanHref)) {
 try {
 path = new URL(cleanHref).pathname;
 } catch (e) {
 return '';
 }
 } else if (!cleanHref.startsWith('/')) {
 path = '/' + cleanHref.replace(/^(\.\/)+/, '');
 }

 path = path.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '');
 if (path.length > 1) {
 path = path.replace(/\/+$/, '');
 }

 return path || '/';
 }

 document.querySelectorAll('.main-nav a').forEach(function (a) {
 const href = a.getAttribute('href') || '';
 const label = navMap[normalizeNavPath(href)];
 if (label) {
 a.textContent = label;
 }
 });
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
 document.querySelectorAll('.back-btn').forEach(function (btn) {
 if (/back to home/i.test(btn.textContent)) {
 btn.textContent = 'Back to Home';
 }
 });
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

 function normalizeFooterDetails() {
 document.querySelectorAll('.site-footer h4').forEach(function (heading) {
 if (heading.textContent.trim() === 'Tools') {
 heading.textContent = 'Tools';
 }
 });
 const currentYear = new Date().getFullYear();
 document.querySelectorAll('.footer-bottom p').forEach(function (p) {
 p.innerHTML = p.innerHTML.replace(/(&copy;|&copy;)\s*\d{4}/, '&copy; ' + currentYear);
 });
 }

 function initPremiumUI() {
 const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const isDesktop = window.matchMedia('(pointer: fine)').matches;
 initScrollReveals();
 if (isDesktop && !prefersReducedMotion) {
 initCustomCursor();
 }
 if (!prefersReducedMotion) {
 setTimeout(() => {
 init3DTiltEffects();
 initMagneticButtons();
 }, CONSTANTS.ANIMATION_DELAY);
 }
 }

 function initScrollReveals() {
 const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
 observer.unobserve(entry.target);
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

 function initCustomCursor() {
 const cursor = document.createElement('div');
 cursor.className = 'custom-cursor';
 document.body.appendChild(cursor);

 let mouseX = 0;
 let mouseY = 0;
 let cursorX = 0;
 let cursorY = 0;
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
 const addHover = () => cursor.classList.add('hover');
 const removeHover = () => cursor.classList.remove('hover');

 setTimeout(function () {
 document.querySelectorAll('a, button, .tool-card').forEach(function (el) {
 el.addEventListener('mouseenter', addHover);
 el.addEventListener('mouseleave', removeHover);
 });
 }, CONSTANTS.ANIMATION_DELAY);
 }

 function init3DTiltEffects() {
 document.querySelectorAll('.tool-card').forEach(function (card) {
 card.addEventListener('mousemove', function (e) {
 const rect = card.getBoundingClientRect();
 const x = e.clientX - rect.left;
 const y = e.clientY - rect.top;
 card.style.setProperty('--mouse-x', x + 'px');
 card.style.setProperty('--mouse-y', y + 'px');
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

 function ensureToastContainer() {
 if (document.getElementById('toast-container')) return;

 const container = document.createElement('div');
 container.id = 'toast-container';
 container.className = 'toast-container';
 container.setAttribute('aria-live', 'polite');
 container.setAttribute('role', 'status');
 document.body.appendChild(container);
 }

 function ensureAriaAnnouncer() {
 if (document.getElementById('aria-announcer')) return;
 const el = document.createElement('div');
 el.id = 'aria-announcer';
 el.setAttribute('aria-live', 'assertive');
 el.setAttribute('aria-atomic', 'true');
 el.className = 'sr-only';
 document.body.appendChild(el);
 window.__announce = function (msg) {
 el.textContent = '';
 requestAnimationFrame(function () {
 requestAnimationFrame(function () {
 el.textContent = msg;
 });
 });
 };
 }

 function ensurePwaSupport() {
 if (!document.querySelector('link[rel="manifest"]')) {
 const manifest = document.createElement('link');
 manifest.rel = 'manifest';
 manifest.href = '/manifest.json';
 document.head.appendChild(manifest);
 }
 if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
 window.addEventListener('load', function () {
 navigator.serviceWorker.register('/sw.js')
 .then(function (registration) {
 })
 .catch(function (err) {
 console.warn('ServiceWorker registration failed:', err);
 });
 });
 }
 }

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
 } catch (e) { }
 }

 function init() {
 clearLegacyStorage();
 ensureSkipLink();
 ensureAriaAnnouncer();
 normalizeGlobalLabels();
 rewriteLocalFileLinks();
 normalizeFooterDetails();
 ensurePwaSupport();
 setupHamburger();
 setActiveNavLink();
 ensureToastContainer();
 setupThemeToggle();
 initPremiumUI();
 }
 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', init);
 } else {
 init();
 }
})();
const RELATED_TOOLS_MAP = {
 'mergepdf': ['splitpdf','organizepdf','compresspdf','signpdf'],
 'splitpdf': ['mergepdf','organizepdf','compresspdf','pagenumbers'],
 'compresspdf': ['mergepdf','pdfencrypt','watermarkpdf','pdf2jpg'],
 'pdfencrypt': ['signpdf','compresspdf','mergepdf','watermarkpdf'],
 'signpdf': ['pdfencrypt','watermarkpdf','mergepdf','compresspdf'],
 'watermarkpdf': ['signpdf','pdfencrypt','mergepdf','compresspdf'],
 'rotatepdf': ['organizepdf','mergepdf','splitpdf','pagenumbers'],
 'organizepdf': ['mergepdf','splitpdf','rotatepdf','pagenumbers'],
 'pagenumbers': ['organizepdf','mergepdf','watermarkpdf','compresspdf'],
 'pdf2jpg': ['img2pdf','compresspdf','splitpdf','ocrtool'],
 'img2pdf': ['pdf2jpg','mergepdf','compresspdf','docx2pdf'],
 'docx2pdf': ['pdf2word','img2pdf','mergepdf','compresspdf'],
 'pdf2word': ['docx2pdf','ocrtool','pdf2jpg','txt2docx'],
 'pptx2pdf': ['docx2pdf','img2pdf','compresspdf','mergepdf'],
 'md2pdf': ['docx2pdf','img2pdf','pagenumbers','compresspdf'],
 'web2pdf': ['md2pdf','docx2pdf','compresspdf','mergepdf'],
 'txt2docx': ['docx2pdf','md2pdf','mergepdf','compresspdf'],
 'ocrtool': ['pdf2jpg','img2pdf','compresspdf','splitpdf'],
 'img2png': ['imgcompress','img2pdf','pdf2jpg','compresspdf'],
 'imgcompress': ['img2png','img2pdf','compresspdf','pdf2jpg'],
 'qrmaker': ['img2pdf','pdfencrypt','watermarkpdf','signpdf'],
};

const TOOL_META = {
 'mergepdf': { name:'Merge PDF', icon:'JOIN', url:'/merge-pdf' },
 'splitpdf': { name:'Split PDF', icon:'CUT', url:'/split-pdf' },
 'compresspdf': { name:'Compress PDF', icon:'ZIP', url:'/compress-pdf' },
 'pdfencrypt': { name:'Password Protect', icon:'LOCK', url:'/pdf-password' },
 'signpdf': { name:'Sign PDF', icon:'SIGN', url:'/sign-pdf' },
 'watermarkpdf': { name:'Watermark PDF', icon:'MARK', url:'/watermark-pdf' },
 'rotatepdf': { name:'Rotate PDF', icon:'90', url:'/rotate-pdf' },
 'organizepdf': { name:'Organize PDF', icon:'ORG', url:'/organize-pdf' },
 'pagenumbers': { name:'Page Numbers', icon:'#', url:'/page-numbers' },
 'pdf2jpg': { name:'PDF to JPG', icon:'JPG', url:'/pdf-to-jpg' },
 'img2pdf': { name:'Images to PDF', icon:'IMG', url:'/jpg-to-pdf' },
 'docx2pdf': { name:'Word to PDF', icon:'DOCX', url:'/word-to-pdf' },
 'pdf2word': { name:'PDF to Word', icon:'DOC', url:'/pdf-to-word' },
 'pptx2pdf': { name:'PPTX to PDF', icon:'PPT', url:'/pptx-to-pdf' },
 'md2pdf': { name:'Markdown to PDF', icon:'MD', url:'/markdown-to-pdf' },
 'web2pdf': { name:'HTML to PDF', icon:'HTML', url:'/html-to-pdf' },
 'txt2docx': { name:'TXT to Word', icon:'TXT', url:'/txt-to-word' },
 'ocrtool': { name:'OCR Text Extract', icon:'OCR', url:'/ocr' },
 'img2png': { name:'Image Converter', icon:'IMG', url:'/image-converter' },
 'imgcompress': { name:'Compress Images', icon:'IMG', url:'/compress-images' },
 'qrmaker': { name:'QR Code Generator', icon:'QR', url:'/qr-code-generator' },
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
 const container = document.getElementById('toolContainer');
 if (container && container.parentNode) {
 container.parentNode.insertBefore(section, container.nextSibling);
 }
}
function scheduleRelatedTools() {
 const timerId = setTimeout(() => {
 if (document.body) renderRelatedTools();
 }, 800);
 window.addEventListener('pagehide', () => clearTimeout(timerId), { once: true });
}

if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', scheduleRelatedTools);
} else {
 scheduleRelatedTools();
}




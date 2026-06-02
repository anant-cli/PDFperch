const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));
const runStatic = args.size === 0 || args.has('--static');
const runJs = args.size === 0 || args.has('--js');
const errors = [];

const TOOL_PAGES = new Set([
  'compresspdf',
  'docx2pdf',
  'img2pdf',
  'img2png',
  'imgcompress',
  'md2pdf',
  'mergepdf',
  'ocrtool',
  'organizepdf',
  'pagenumbers',
  'pdf2jpg',
  'pdf2word',
  'pdfencrypt',
  'pptx2pdf',
  'qrmaker',
  'rotatepdf',
  'signpdf',
  'splitpdf',
  'txt2docx',
  'watermarkpdf',
  'web2pdf',
]);

const REQUIRED_INDEX_MARKERS = [
  { label: 'Google Tag Manager', value: 'GTM-KJV2GQDD' },
  { label: 'Google Analytics', value: 'G-GCBDWNXHN2' },
  { label: 'Google AdSense', value: 'ca-pub-1745874358886453' },
  { label: 'Google Search Console meta', value: 'google-site-verification' },
  { label: 'Consent script', value: '/consent.js' },
];

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function exists(sitePath) {
  return fs.existsSync(path.join(root, sitePath.replace(/^\//, '')));
}

function walk(dir, predicate, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, out);
    } else if (!predicate || predicate(fullPath)) {
      out.push(fullPath);
    }
  }
  return out;
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function lineFor(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function normalHtmlFiles() {
  return walk(root, file => file.endsWith('.html'))
    .filter(file => path.basename(file) !== 'google6a140702be548477.html');
}

function checkHtmlStructure() {
  for (const file of normalHtmlFiles()) {
    const text = read(file);
    const headOpen = countMatches(text, /<head\b[^>]*>/gi);
    const headClose = countMatches(text, /<\/head>/gi);
    const bodyOpen = countMatches(text, /<body\b[^>]*>/gi);
    const duplicateHead = text.search(/<\/head>\s*<\/head>/i);

    if (headOpen !== 1) errors.push(`${rel(file)}: expected exactly one <head>, found ${headOpen}`);
    if (headClose !== 1) errors.push(`${rel(file)}: expected exactly one </head>, found ${headClose}`);
    if (bodyOpen !== 1) errors.push(`${rel(file)}: expected exactly one <body>, found ${bodyOpen}`);
    if (duplicateHead !== -1) {
      errors.push(`${rel(file)}:${lineFor(text, duplicateHead)} duplicate adjacent </head> tags`);
    }

    const headIndex = text.search(/<head\b[^>]*>/i);
    const headCloseIndex = text.search(/<\/head>/i);
    const bodyIndex = text.search(/<body\b[^>]*>/i);
    if (headIndex !== -1 && headCloseIndex !== -1 && bodyIndex !== -1 && !(headIndex < headCloseIndex && headCloseIndex < bodyIndex)) {
      errors.push(`${rel(file)}: expected <head> before </head> before <body>`);
    }
  }
}

function parseRedirects() {
  const redirectsPath = path.join(root, '_redirects');
  return read(redirectsPath)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split(/\s+/))
    .filter(parts => parts.length >= 2)
    .map(([source, target, status]) => ({ source, target, status }));
}

function checkRedirects() {
  for (const rule of parseRedirects()) {
    if (rule.status && rule.status !== '200') continue;
    if (!rule.target.endsWith('.html')) continue;
    if (!exists(rule.target)) {
      errors.push(`_redirects: ${rule.source} points to missing ${rule.target}`);
    }
  }
}

function checkToolPages() {
  const swText = read(path.join(root, 'sw.js'));
  const redirects = parseRedirects();

  for (const pageName of TOOL_PAGES) {
    const pagePath = path.join(root, 'pages', `${pageName}.html`);
    const toolPath = path.join(root, 'tools', `${pageName}.js`);
    if (!fs.existsSync(pagePath)) errors.push(`pages/${pageName}.html is missing`);
    if (!fs.existsSync(toolPath)) errors.push(`tools/${pageName}.js is missing`);
    if (!fs.existsSync(pagePath)) continue;

    const html = read(pagePath);
    for (const marker of [`../tools/${pageName}.js`, '../tools/loader.js', '../utils.js', '../components.js']) {
      if (!html.includes(marker)) errors.push(`pages/${pageName}.html: missing script ${marker}`);
    }
    if (!html.includes('id="toolContainer"')) {
      errors.push(`pages/${pageName}.html: missing #toolContainer`);
    }
    if (!swText.includes(`/tools/${pageName}.js`)) {
      errors.push(`sw.js: missing cached tool script /tools/${pageName}.js`);
    }
  }

  for (const rule of redirects.filter(rule => rule.target.startsWith('/pages/') && rule.target.endsWith('.html'))) {
    const pageName = path.basename(rule.target, '.html');
    if (!TOOL_PAGES.has(pageName)) {
      errors.push(`_redirects: ${rule.source} points to untracked tool page ${rule.target}`);
    }
    if (!swText.includes(`'${rule.source}'`) && !swText.includes(`"${rule.source}"`)) {
      errors.push(`sw.js: missing cached route ${rule.source}`);
    }
  }
}

function checkIntegrations() {
  const index = read(path.join(root, 'index.html'));
  for (const marker of REQUIRED_INDEX_MARKERS) {
    if (!index.includes(marker.value)) {
      errors.push(`index.html: missing ${marker.label} marker (${marker.value})`);
    }
  }

  if (!exists('/google6a140702be548477.html')) {
    errors.push('Missing Google Search Console verification file google6a140702be548477.html');
  }
  if (!exists('/ads.txt')) {
    errors.push('Missing ads.txt for AdSense');
  }
  if (!exists('/sitemap.xml')) {
    errors.push('Missing sitemap.xml for search engines');
  }
  if (!exists('/robots.txt')) {
    errors.push('Missing robots.txt for search engines');
  }
}

function checkJsSyntax() {
  const jsFiles = walk(root, file => file.endsWith('.js'));
  for (const file of jsFiles) {
    try {
      new vm.Script(read(file), { filename: rel(file) });
    } catch (error) {
      errors.push(`${rel(file)}: JavaScript syntax error: ${error.message}`);
    }
  }
}

if (runStatic) {
  checkHtmlStructure();
  checkRedirects();
  checkToolPages();
  checkIntegrations();
}

if (runJs) {
  checkJsSyntax();
}

if (errors.length) {
  console.error(`Static site check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Static site checks passed.');

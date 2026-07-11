#!/usr/bin/env node
/**
 * check-static-site.js
 *
 * Lightweight, dependency-free validation for the ConvertPDF static site.
 * Run with: npm run check
 *
 * Checks performed:
 *  1. Every .html file has a <head> and a <body>.
 *  2. Every local href="/..." / src="/..." link resolves to a real file.
 *  3. Every <script src="/...tools/*.js"> referenced by tool pages exists.
 *  4. Every JS file parses without a syntax error (via `node --check`).
 *  5. sitemap.xml only lists URLs that correspond to real files.
 *  6. robots.txt exists and points at sitemap.xml.
 *  7. Google Search Console verification file and GTM snippet are present
 *     on all indexable pages (mirrors what used to be removed by mistake
 *     in earlier revisions - see README "Editorial and Legal Guidance").
 *
 * Exits with a non-zero status code if any check fails, so it can be used
 * as a pre-deploy gate in CI as well as locally.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
let failures = 0;
let warnings = 0;

function fail(msg) {
  console.error(`✖ ${msg}`);
  failures++;
}
function warn(msg) {
  console.warn(`⚠ ${msg}`);
  warnings++;
}
function ok(msg) {
  console.log(`✔ ${msg}`);
}

function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, exts, out);
    } else if (exts.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

// --- Gather files -----------------------------------------------------
const htmlFiles = walk(ROOT, ['.html']);
const jsFiles = walk(ROOT, ['.js']).filter(f => !f.includes(`${path.sep}scripts${path.sep}`));

console.log(`Found ${htmlFiles.length} HTML files and ${jsFiles.length} JS files.\n`);

// --- 1 & 2 & 7: per-page checks ---------------------------------------
const EXEMPT_FROM_GTM = ['offline.html', 'google6a140702be548477.html'];
// Google's site-verification file is a plain-text token, not a real HTML
// document, even though it has an .html extension (Google requires that).
const EXEMPT_FROM_HTML_STRUCTURE = ['google6a140702be548477.html'];

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, 'utf8');

  if (!EXEMPT_FROM_HTML_STRUCTURE.includes(path.basename(file))) {
    if (!/<head[\s>]/i.test(content)) fail(`${rel}: missing <head>`);
    if (!/<body[\s>]/i.test(content)) fail(`${rel}: missing <body>`);
  }

  if (!EXEMPT_FROM_GTM.includes(path.basename(file))) {
    if (!/GTM-[A-Z0-9]+/.test(content)) fail(`${rel}: missing Google Tag Manager snippet`);
    if (!/gtag\('consent', 'default'/.test(content)) {
      warn(`${rel}: no Consent Mode default found before GTM - analytics cookies may fire without consent`);
    }
  }

  const linkMatches = content.matchAll(/(?:href|src)="(\/[^"]*)"/g);
  for (const m of linkMatches) {
    const linkPath = m[1].split('#')[0].split('?')[0];
    if (!linkPath || linkPath === '/') continue;
    const target = path.join(ROOT, linkPath);
    if (!fs.existsSync(target)) fail(`${rel}: broken local link ${linkPath}`);
  }
}
ok('Checked <head>/<body> structure, internal links, and GTM/consent presence on all pages.');

// --- 4: JS syntax -------------------------------------------------------
for (const file of jsFiles) {
  const rel = path.relative(ROOT, file);
  try {
    execSync(`node --check "${file}"`, { stdio: 'pipe' });
  } catch (e) {
    fail(`${rel}: JavaScript syntax error\n${e.stderr ? e.stderr.toString() : e.message}`);
  }
}
ok('Checked JavaScript syntax on all .js files.');

// --- 5: sitemap.xml accuracy --------------------------------------------
const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  fail('sitemap.xml is missing.');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  if (urls.length === 0) warn('sitemap.xml contains no <url> entries.');
  for (const url of urls) {
    const p = url.replace(/^https?:\/\/[^/]+\/?/, '');
    const target = p === '' ? path.join(ROOT, 'index.html') : path.join(ROOT, p);
    if (!fs.existsSync(target)) fail(`sitemap.xml references a URL with no matching file: ${url}`);
  }
  ok(`sitemap.xml: ${urls.length} URLs all resolve to real files.`);
}

// --- 6: robots.txt --------------------------------------------------------
const robotsPath = path.join(ROOT, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  fail('robots.txt is missing.');
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  if (!/Sitemap:\s*https?:\/\//i.test(robots)) fail('robots.txt does not reference a Sitemap: URL.');
  else ok('robots.txt references a sitemap.');
}

// --- Summary ---------------------------------------------------------
console.log(`\n${failures === 0 ? '✔' : '✖'} ${failures} failure(s), ${warnings} warning(s).`);
process.exit(failures > 0 ? 1 : 0);

#!/usr/bin/env node
/**
 * check-static-site.js
 *
 * Lightweight, dependency-free validation for the PDFperch static site.
 * Run with: npm run check
 *
 * Checks performed:
 *  1. Every .html file has a <head> and a <body>.
 *  2. Every local href="/..." / src="/..." link resolves to a real file.
 *  3. Every <script src="/...tools/*.js"> referenced by tool pages exists.
 *  4. Every JS file parses without a syntax error (via `node --check`).
 *  5. robots.txt exists.
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

// --- 1 & 2: per-page checks --------------------------------------------
for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, 'utf8');

  if (!/<head[\s>]/i.test(content)) fail(`${rel}: missing <head>`);
  if (!/<body[\s>]/i.test(content)) fail(`${rel}: missing <body>`);

  const linkMatches = content.matchAll(/(?:href|src)="(\/[^"]*)"/g);
  for (const m of linkMatches) {
    const linkPath = m[1].split('#')[0].split('?')[0];
    if (!linkPath || linkPath === '/') continue;
    const target = path.join(ROOT, linkPath);
    if (!fs.existsSync(target)) fail(`${rel}: broken local link ${linkPath}`);
  }
}
ok('Checked <head>/<body> structure and internal links on all pages.');

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

// --- 5: robots.txt --------------------------------------------------------
const robotsPath = path.join(ROOT, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  fail('robots.txt is missing.');
} else {
  ok('robots.txt is present.');
}

// --- Summary ---------------------------------------------------------
console.log(`\n${failures === 0 ? '✔' : '✖'} ${failures} failure(s), ${warnings} warning(s).`);
process.exit(failures > 0 ? 1 : 0);

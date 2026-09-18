const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
const newCacheName = `pdfperch-v${dateStr}`;

// --- 1. Bump the service worker's cache name (forces a clean cache on deploy) ---
const swPath = path.join(ROOT, 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
swContent = swContent.replace(/const CACHE_NAME = 'pdfperch-v[^']+';/, `const CACHE_NAME = '${newCacheName}';`);
fs.writeFileSync(swPath, swContent, 'utf8');
console.log(`Bumped CACHE_NAME to ${newCacheName} in sw.js`);

// --- 2. Stamp a version query string onto shared asset references in every ---
//        HTML file, so browsers can cache them for a full year (see _headers)
//        without ever serving a stale copy after a deploy. Re-running this
//        script is safe: any existing ?v=... on these assets is replaced,
//        not stacked.
const BUILD_ID = dateStr;
const VERSIONED_ASSETS = [
  { attr: 'href', file: 'styles.css' },
  { attr: 'src', file: 'utils.js' },
  { attr: 'src', file: 'components.js' },
  { attr: 'src', file: 'script.js' },
];

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const htmlFiles = walkHtml(ROOT);
let filesTouched = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const { attr, file: assetFile } of VERSIONED_ASSETS) {
    // Matches href="/styles.css" or href="/styles.css?v=OLDID", tool pages
    // and root pages alike (asset is always referenced from site root).
    const re = new RegExp(`${attr}="(/${assetFile})(?:\\?v=[^"]*)?"`, 'g');
    const next = html.replace(re, `${attr}="$1?v=${BUILD_ID}"`);
    if (next !== html) changed = true;
    html = next;
  }

  // Tool-page scripts: src="/tools/mergepdf.js" -> .../mergepdf.js?v=BUILD_ID
  const toolRe = /src="(\/tools\/[a-z0-9]+\.js)(?:\?v=[^"]*)?"/g;
  const nextTool = html.replace(toolRe, `src="$1?v=${BUILD_ID}"`);
  if (nextTool !== html) changed = true;
  html = nextTool;

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
    filesTouched++;
  }
}

console.log(`Stamped ?v=${BUILD_ID} onto shared asset links in ${filesTouched} HTML file(s).`);

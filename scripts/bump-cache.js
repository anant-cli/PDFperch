const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '../sw.js');
let content = fs.readFileSync(swPath, 'utf8');

const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
const newCacheName = `convertpdf-v${dateStr}`;

content = content.replace(/const CACHE_NAME = 'convertpdf-v[^']+';/, `const CACHE_NAME = '${newCacheName}';`);

fs.writeFileSync(swPath, content, 'utf8');
console.log(`Bumped CACHE_NAME to ${newCacheName} in sw.js`);

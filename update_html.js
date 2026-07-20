const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['pages', 'blog'];

const replacements = [
  {
    regex: /&#128196;\s*ConvertPDF/g,
    replacement: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.2em;height:1.2em;vertical-align:text-bottom;margin-right:0.25rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15l2 2 4-4"></path></svg> ConvertPDF'
  },
  {
    regex: /<h4>&#128196; ConvertPDF<\/h4>/g,
    replacement: '<h4><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:text-bottom;margin-right:0.25rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15l2 2 4-4"></path></svg> ConvertPDF</h4>'
  },
  {
    regex: /<nav class="main-nav">/g,
    replacement: '<nav class="main-nav" aria-label="Main navigation">'
  },
  {
    regex: /<main>/g,
    replacement: '<main id="main-content">'
  },
  {
    regex: /<nav aria-label="Breadcrumb" style="[^"]+">/g,
    replacement: '<nav class="breadcrumb" aria-label="Breadcrumb">'
  },
  {
    regex: /&#128231;<\/a>/g,
    replacement: '&#128231; <span class="social-label">Email</span></a>'
  },
  {
    regex: /&#128172;<\/a>/g,
    replacement: '&#128172; <span class="social-label">Reddit</span></a>'
  },
  {
    regex: /&#(128173|128247);<\/a>/g,
    replacement: '&#128247; <span class="social-label">Instagram</span></a>'
  }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  replacements.forEach(rule => {
    content = content.replace(rule.regex, rule.replacement);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

DIRECTORIES.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) return;
  const files = fs.readdirSync(fullPath);
  files.forEach(file => {
    if (file.endsWith('.html')) {
      processFile(path.join(fullPath, file));
    }
  });
});

console.log('Update script completed.');

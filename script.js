const TOOL_SVGS = {
 md2pdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="6" y="4" width="22" height="28" rx="3" fill="currentColor" opacity="0.15"/>
 <rect x="6" y="4" width="22" height="28" rx="3" stroke="currentColor" stroke-width="1.5"/>
 <path d="M11 14h12M11 19h8M11 24h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
 <rect x="22" y="22" width="12" height="14" rx="2" fill="var(--bg-root,#0b0f1a)"/>
 <text x="28" y="32" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor" font-family="monospace">PDF</text>
 <path d="M30 18l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
 </svg>`,

 docx2pdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="5" y="4" width="20" height="26" rx="3" fill="currentColor" opacity="0.15"/>
 <rect x="5" y="4" width="20" height="26" rx="3" stroke="currentColor" stroke-width="1.5"/>
 <path d="M10 12h10M10 17h8M10 22h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
 <path d="M24 17l5 0M26 14l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="28" y="22" width="7" height="9" rx="1.5" fill="currentColor" opacity="0.9"/>
 <text x="31.5" y="29" text-anchor="middle" font-size="4.5" font-weight="700" fill="var(--bg-root,#0b0f1a)" font-family="monospace">PDF</text>
 </svg>`,

 pdf2word: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="5" y="4" width="16" height="20" rx="2.5" fill="currentColor" opacity="0.2"/>
 <text x="13" y="18" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor" font-family="monospace">PDF</text>
 <path d="M22 14l4 0M23 11l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="26" y="6" width="9" height="12" rx="1.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.2"/>
 <path d="M28 10l1.5 5 1.5-3.5 1.5 3.5 1.5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="4" y="26" width="32" height="10" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1"/>
 <path d="M8 31h4M14 31h4M20 31h4M26 31h4M8 34h8M20 34h6" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
 </svg>`,

 pptx2pdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="5" y="5" width="18" height="24" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <rect x="9" y="10" width="10" height="6" rx="1.2" fill="currentColor" opacity="0.35"/>
 <path d="M9 20h10M9 24h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.65"/>
 <path d="M23 17h5M25 14l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="27" y="22" width="9" height="12" rx="1.6" fill="currentColor" opacity="0.9"/>
 <text x="31.5" y="30.5" text-anchor="middle" font-size="4.8" font-weight="700" fill="var(--bg-root,#0b0f1a)" font-family="monospace">PDF</text>
 </svg>`,

 img2pdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="4" y="8" width="22" height="18" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <circle cx="11" cy="15" r="3" fill="currentColor" opacity="0.5"/>
 <path d="M4 22l6-5 5 4 4-3 7 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="24" y="24" width="12" height="12" rx="2" fill="var(--bg-root,#0b0f1a)"/>
 <text x="30" y="33" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor" font-family="monospace">PDF</text>
 <path d="M28 20l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
 </svg>`,

 pdfencrypt: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="8" y="18" width="24" height="17" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
 <path d="M14 18v-6a6 6 0 0112 0v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
 <circle cx="20" cy="27" r="3" fill="currentColor"/>
 <path d="M20 30v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
 </svg>`,

 mergepdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="3" y="5" width="14" height="18" rx="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <rect x="23" y="5" width="14" height="18" rx="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <path d="M17 14h6M20 11l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="12" y="26" width="16" height="10" rx="2.5" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/>
 <path d="M7 23l13 3M33 23l-13 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>
 </svg>`,

 splitpdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="13" y="4" width="14" height="18" rx="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <path d="M13 13H5M27 13h8M10 10l-3 3 3 3M30 10l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M20 22v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2"/>
 <rect x="4" y="28" width="13" height="9" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.3"/>
 <rect x="23" y="28" width="13" height="9" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.3"/>
 </svg>`,

 rotatepdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="11" y="10" width="18" height="22" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <path d="M16 15h8M16 20h6M16 25h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
 <path d="M31 8a13 13 0 010 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
 <path d="M31 8l-3 4h5V8l-2 0" stroke="currentColor" stroke-width="1.3" fill="currentColor" opacity="0.7"/>
 </svg>`,

 watermarkpdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="5" y="5" width="30" height="30" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/>
 <text x="20" y="24" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor" opacity="0.25" font-family="sans-serif" transform="rotate(-20,20,20)">WM</text>
 <path d="M9 10h8M9 15h5M9 20h6M9 25h4M9 30h7" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
 </svg>`,

 pagenumbers: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="6" y="4" width="28" height="28" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/>
 <path d="M11 10h18M11 15h14M11 20h16M11 25h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>
 <rect x="10" y="31" width="20" height="7" rx="2" fill="currentColor" opacity="0.15"/>
 <text x="20" y="37" text-anchor="middle" font-size="5.5" font-weight="700" fill="currentColor" font-family="monospace">1 / 4</text>
 </svg>`,

 compresspdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="6" y="4" width="20" height="26" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <path d="M11 10h10M11 15h8M11 20h6M11 25h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>
 <path d="M28 16l6 0M28 24l6 0M31 10v18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
 <path d="M29 14l2-4 2 4M29 26l2 4 2-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`,

 signpdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="5" y="4" width="24" height="28" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/>
 <path d="M10 10h14M10 15h10M10 20h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.5"/>
 <path d="M10 28 Q14 24 18 28 Q22 32 26 26" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
 <path d="M28 10l6-6M28 10l2 6-6-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" opacity="0.5"/>
 </svg>`,

 txt2docx: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="4" y="6" width="14" height="18" rx="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <path d="M7 11h8M7 15h6M7 19h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
 <path d="M18 15h4M19 12l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="22" y="6" width="14" height="18" rx="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <path d="M25 11l1.5 5 1.5-3.5 1.5 3.5 1.5-5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M4 28h32" stroke="currentColor" stroke-width="1" opacity="0.3" stroke-dasharray="3 2"/>
 <path d="M8 32h10M20 32h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
 </svg>`,

 pdf2jpg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="4" y="6" width="16" height="10" rx="2" fill="currentColor" opacity="0.2"/>
 <text x="12" y="14" text-anchor="middle" font-size="5.5" font-weight="700" fill="currentColor" font-family="monospace">PDF</text>
 <path d="M21 11h4M22 8l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="26" y="5" width="10" height="10" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.2"/>
 <circle cx="29" cy="8.5" r="1.5" fill="currentColor" opacity="0.5"/>
 <path d="M26 12l3-2.5 2 2 2-3 3 3.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="4" y="20" width="32" height="16" rx="3" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="1.2"/>
 <rect x="7" y="23" width="10" height="10" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1"/>
 <rect x="19" y="23" width="10" height="10" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1"/>
 </svg>`,

 img2png: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="4" y="8" width="16" height="14" rx="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <circle cx="10" cy="14" r="2.5" fill="currentColor" opacity="0.4"/>
 <path d="M4 19l5-4 4 4 3-2.5 4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M22 15h4M23 12l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="28" y="8" width="9" height="14" rx="2.5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <text x="32.5" y="18" text-anchor="middle" font-size="5" font-weight="700" fill="currentColor" font-family="monospace">PNG</text>
 <path d="M4 30h32" stroke="currentColor" stroke-width="1" opacity="0.2" stroke-dasharray="3 2"/>
 <text x="20" y="37" text-anchor="middle" font-size="6" fill="currentColor" opacity="0.5" font-family="monospace">JPGPNGWEBP</text>
 </svg>`,

 web2pdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="4" y="6" width="24" height="20" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/>
 <rect x="4" y="6" width="24" height="6" rx="3" fill="currentColor" opacity="0.2"/>
 <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.6"/>
 <circle cx="14" cy="9" r="1.5" fill="currentColor" opacity="0.4"/>
 <circle cx="19" cy="9" r="1.5" fill="currentColor" opacity="0.2"/>
 <path d="M9 16h12M9 20h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>
 <rect x="24" y="22" width="12" height="14" rx="2" fill="var(--bg-root,#0b0f1a)"/>
 <text x="30" y="32" text-anchor="middle" font-size="6" font-weight="700" fill="currentColor" font-family="monospace">PDF</text>
 </svg>`,

 qrmaker: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="4" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" opacity="0.1"/>
 <rect x="7" y="7" width="8" height="8" rx="1" fill="currentColor" opacity="0.4"/>
 <rect x="22" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" opacity="0.1"/>
 <rect x="25" y="7" width="8" height="8" rx="1" fill="currentColor" opacity="0.4"/>
 <rect x="4" y="22" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" opacity="0.1"/>
 <rect x="7" y="25" width="8" height="8" rx="1" fill="currentColor" opacity="0.4"/>
 <path d="M22 22h4v4h-4zM26 26h4v4h-4zM30 22h6v4M22 30h4v6M30 30h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`,

 imgcompress: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="4" y="8" width="22" height="18" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
 <circle cx="11" cy="15" r="3" fill="currentColor" opacity="0.4"/>
 <path d="M4 22l6-5 5 4 4-3 7 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M30 14v12M26 18l4-4 4 4M26 22l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`,

 organizepdf: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="4" y="4" width="10" height="14" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.3"/>
 <rect x="15" y="4" width="10" height="14" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.3"/>
 <rect x="26" y="4" width="10" height="14" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.3"/>
 <path d="M9 22v14M9 22l-4 4M9 22l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M20 36V22M20 22l-4 4M20 22l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M31 22v14M31 36l-4-4M31 36l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`,

 ocrtool: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <rect x="4" y="8" width="22" height="18" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/>
 <rect x="8" y="12" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/>
 <path d="M17 14h6M17 19h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
 <path d="M28 18l6-8M28 18l4 1-1-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" opacity="0.5"/>
 <rect x="4" y="28" width="32" height="9" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1"/>
 <path d="M8 32h8M18 32h6M26 32h3M8 35h5M15 35h8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.6"/>
 </svg>`
};

const tools = [
 { id: 'md2pdf', name: 'Markdown to PDF', desc: 'Convert .md files to formatted PDF', url: '/pages/md2pdf.html' },
 { id: 'docx2pdf', name: 'Word to PDF', desc: 'Convert Word documents to PDF', url: '/pages/docx2pdf.html' },
 { id: 'pdf2word', name: 'PDF to Word', desc: 'Extract PDF text into editable DOCX', url: '/pages/pdf2word.html' },
 { id: 'pptx2pdf', name: 'PPTX to PDF', desc: 'Convert PowerPoint slides to PDF', url: '/pages/pptx2pdf.html' },
 { id: 'img2pdf', name: 'Images to PDF', desc: 'Combine JPG and PNG into one PDF', url: '/pages/img2pdf.html' },
 { id: 'pdfencrypt', name: 'PDF Password', desc: 'Protect PDF files with encryption', url: '/pages/pdfencrypt.html' },
 { id: 'mergepdf', name: 'Merge PDFs', desc: 'Combine multiple PDF files', url: '/pages/mergepdf.html' },
 { id: 'splitpdf', name: 'Split PDF', desc: 'Break a PDF into pages or ranges', url: '/pages/splitpdf.html' },
 { id: 'rotatepdf', name: 'Rotate PDF', desc: 'Rotate pages by 90, 180, or 270 degrees', url: '/pages/rotatepdf.html' },
 { id: 'watermarkpdf',name: 'Watermark PDF', desc: 'Add text watermarks to pages', url: '/pages/watermarkpdf.html' },
 { id: 'pagenumbers', name: 'Page Numbers', desc: 'Add page numbers to PDF', url: '/pages/pagenumbers.html' },
 { id: 'compresspdf', name: 'Compress PDF', desc: 'Reduce PDF file size', url: '/pages/compresspdf.html' },
 { id: 'signpdf', name: 'Sign PDF', desc: 'Add visible signatures', url: '/pages/signpdf.html' },
 { id: 'txt2docx', name: 'TXT to Word', desc: 'Convert plain text to DOCX', url: '/pages/txt2docx.html' },
 { id: 'pdf2jpg', name: 'PDF to JPG', desc: 'Extract pages as images', url: '/pages/pdf2jpg.html' },
 { id: 'img2png', name: 'Image Converter', desc: 'Convert images to PNG, JPEG, or WebP', url: '/pages/img2png.html' },
 { id: 'web2pdf', name: 'HTML to PDF', desc: 'Paste HTML snippets to PDF', url: '/pages/web2pdf.html' },
 { id: 'qrmaker', name: 'QR Code', desc: 'Create QR codes as PNG or SVG', url: '/pages/qrmaker.html' },
 { id: 'imgcompress', name: 'Image Compression', desc: 'Reduce image size with quality controls', url: '/pages/imgcompress.html' },
 { id: 'organizepdf', name: 'Organize PDF', desc: 'Reorder, rotate, and delete PDF pages', url: '/pages/organizepdf.html' },
 { id: 'ocrtool', name: 'OCR Image to Text', desc: 'Extract text from images and scanned PDFs', url: '/pages/ocrtool.html' }
];

const grid = document.getElementById('toolGrid');
if (grid) {
 tools.forEach(t => {
 const card = document.createElement('a');
 card.href = t.url;
 card.className = 'tool-card';
 card.setAttribute('aria-label', t.name + ': ' + t.desc);

 const iconWrap = document.createElement('div');
 iconWrap.className = 'tool-icon';
 iconWrap.setAttribute('aria-hidden', 'true');
 iconWrap.innerHTML = TOOL_SVGS[t.id]
 ?? `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="6" width="24" height="28" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5"/></svg>`;

 const name = document.createElement('div');
 name.className = 'tool-name';
 name.textContent = t.name;

 const desc = document.createElement('div');
 desc.className = 'tool-desc';
 desc.textContent = t.desc;

 card.appendChild(iconWrap);
 card.appendChild(name);
 card.appendChild(desc);
 grid.appendChild(card);
 });
}




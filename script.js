// script.js – tool definitions (used by index.html only)

// ---------- TOOL DEFINITIONS ----------
const tools = [
    { id: 'md2pdf', name: '📝 Markdown → PDF', desc: 'convert .md to formatted PDF', icon: '📝', url: 'pages/md2pdf.html' },
    { id: 'docx2pdf', name: '📃 DOCX → PDF', desc: 'Word documents to PDF', icon: '📃', url: 'pages/docx2pdf.html' },
    { id: 'img2pdf', name: '🖼️ Images → PDF', desc: 'JPG/PNG to single PDF', icon: '🖼️', url: 'pages/img2pdf.html' },
    { id: 'pdfencrypt', name: '🔐 PDF Password', desc: 'protect PDF with encryption', icon: '🔐', url: 'pages/pdfencrypt.html' },
    { id: 'mergepdf', name: '🧩 Merge PDFs', desc: 'combine multiple PDF files', icon: '🧩', url: 'pages/mergepdf.html' },
    { id: 'splitpdf', name: '✂️ Split PDF', desc: 'break a PDF into single pages or a page range', icon: '✂️', url: 'pages/splitpdf.html' },
    { id: 'rotatepdf', name: '🔄 Rotate PDF', desc: 'rotate pages by 90°, 180°, or 270°', icon: '🔄', url: 'pages/rotatepdf.html' },
    { id: 'watermarkpdf', name: '💧 Watermark PDF', desc: 'add text watermarks to pages', icon: '💧', url: 'pages/watermarkpdf.html' },
    { id: 'pagenumbers', name: '📄 Page Numbers', desc: 'add page numbers to PDF', icon: '📄', url: 'pages/pagenumbers.html' },
    { id: 'compresspdf', name: '🗜️ Compress PDF', desc: 'reduce PDF file size', icon: '🗜️', url: 'pages/compresspdf.html' },
    { id: 'signpdf', name: '✍️ Sign PDF', desc: 'add digital signatures', icon: '✍️', url: 'pages/signpdf.html' },
    { id: 'txt2docx', name: '📄 TXT → DOCX', desc: 'plain text to Word file', icon: '📄', url: 'pages/txt2docx.html' },
    { id: 'pdf2jpg', name: '📸 PDF → JPG', desc: 'extract pages as images', icon: '📸', url: 'pages/pdf2jpg.html' },
    { id: 'img2png', name: '🎨 Image Converter', desc: 'convert images to PNG, JPEG, or WebP', icon: '🎨', url: 'pages/img2png.html' },
    { id: 'web2pdf', name: '🌐 HTML → PDF', desc: 'paste HTML snippet to PDF', icon: '🌐', url: 'pages/web2pdf.html' },
    { id: 'qrmaker', name: '📱 QR Code', desc: 'text/link → QR code PNG/SVG', icon: '📱', url: 'pages/qrmaker.html' },
    { id: 'imgcompress', name: '🗜️ Image Compression', desc: 'reduce image file size with quality controls', icon: '🗜️', url: 'pages/imgcompress.html' },
    { id: 'organizepdf', name: '🗂️ Organize PDF', desc: 'reorder, rotate, and delete PDF pages visually', icon: '🗂️', url: 'pages/organizepdf.html' },
    { id: 'ocrtool', name: '🔍 OCR Image to Text', desc: 'extract text from images and scanned PDFs', icon: '🔍', url: 'pages/ocrtool.html' },
    { id: 'ppt2pdf', name: '📊 PPT → PDF', desc: 'PowerPoint presentation to PDF', icon: '📊', url: 'pages/ppt2pdf.html' }
];

// Render tool cards on index.html
const grid = document.getElementById('toolGrid');
if (grid) {
    tools.forEach(t => {
        const card = document.createElement('a');
        card.href = t.url;
        card.className = 'tool-card';
        card.setAttribute('aria-label', t.name + ': ' + t.desc);

        const icon = document.createElement('div');
        icon.className = 'tool-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = t.icon;

        const name = document.createElement('div');
        name.className = 'tool-name';
        name.textContent = t.name;

        const desc = document.createElement('div');
        desc.className = 'tool-desc';
        desc.textContent = t.desc;

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(desc);
        grid.appendChild(card);
    });
}

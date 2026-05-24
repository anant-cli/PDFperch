const tools = [
    { id: 'md2pdf', name: 'Markdown to PDF', desc: 'Convert .md files to formatted PDF', icon: 'MD', url: 'pages/md2pdf.html' },
    { id: 'docx2pdf', name: 'Word to PDF', desc: 'Convert Word documents to PDF', icon: 'DOCX', url: 'pages/docx2pdf.html' },
    { id: 'pdf2word', name: 'PDF to Word', desc: 'Extract PDF text into editable DOCX', icon: 'DOC', url: 'pages/pdf2word.html' },
    { id: 'img2pdf', name: 'Images to PDF', desc: 'Combine JPG and PNG into one PDF', icon: 'IMG', url: 'pages/img2pdf.html' },
    { id: 'pdfencrypt', name: 'PDF Password', desc: 'Protect PDF files with encryption', icon: 'LOCK', url: 'pages/pdfencrypt.html' },
    { id: 'mergepdf', name: 'Merge PDFs', desc: 'Combine multiple PDF files', icon: 'JOIN', url: 'pages/mergepdf.html' },
    { id: 'splitpdf', name: 'Split PDF', desc: 'Break a PDF into pages or ranges', icon: 'CUT', url: 'pages/splitpdf.html' },
    { id: 'rotatepdf', name: 'Rotate PDF', desc: 'Rotate pages by 90, 180, or 270 degrees', icon: '90', url: 'pages/rotatepdf.html' },
    { id: 'watermarkpdf', name: 'Watermark PDF', desc: 'Add text watermarks to pages', icon: 'MARK', url: 'pages/watermarkpdf.html' },
    { id: 'pagenumbers', name: 'Page Numbers', desc: 'Add page numbers to PDF', icon: '#', url: 'pages/pagenumbers.html' },
    { id: 'compresspdf', name: 'Compress PDF', desc: 'Reduce PDF file size', icon: 'ZIP', url: 'pages/compresspdf.html' },
    { id: 'signpdf', name: 'Sign PDF', desc: 'Add visible signatures', icon: 'SIGN', url: 'pages/signpdf.html' },
    { id: 'txt2docx', name: 'TXT to Word', desc: 'Convert plain text to DOCX', icon: 'TXT', url: 'pages/txt2docx.html' },
    { id: 'pdf2jpg', name: 'PDF to JPG', desc: 'Extract pages as images', icon: 'JPG', url: 'pages/pdf2jpg.html' },
    { id: 'img2png', name: 'Image Converter', desc: 'Convert images to PNG, JPEG, or WebP', icon: 'IMG', url: 'pages/img2png.html' },
    { id: 'web2pdf', name: 'HTML to PDF', desc: 'Paste HTML snippets to PDF', icon: 'HTML', url: 'pages/web2pdf.html' },
    { id: 'qrmaker', name: 'QR Code', desc: 'Create QR codes as PNG or SVG', icon: 'QR', url: 'pages/qrmaker.html' },
    { id: 'imgcompress', name: 'Image Compression', desc: 'Reduce image size with quality controls', icon: 'IMG', url: 'pages/imgcompress.html' },
    { id: 'organizepdf', name: 'Organize PDF', desc: 'Reorder, rotate, and delete PDF pages', icon: 'ORG', url: 'pages/organizepdf.html' },
    { id: 'ocrtool', name: 'OCR Image to Text', desc: 'Extract text from images and scanned PDFs', icon: 'OCR', url: 'pages/ocrtool.html' }
];

const grid = document.getElementById('toolGrid');
if (grid) {
    tools.forEach(t => {
        const card = document.createElement('a');
        card.href = t.url;
        card.className = 'tool-card';
        card.setAttribute('aria-label', t.name + ': ' + t.desc);

        const icon = document.createElement('div');
        icon.className = 'tool-icon tool-code';
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

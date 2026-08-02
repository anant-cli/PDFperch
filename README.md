# PDFperch

PDFperch is a free, privacy-first collection of browser-based document tools. All conversions happen entirely in your browser — no document uploads, no user accounts, and no analytics or tracking of any kind.


---

## What PDFperch Offers

PDFperch includes a range of tools for everyday document workflows:

| Tool | Description |
|------|-------------|
| **Markdown to PDF** | Convert Markdown into formatted PDF with math support and syntax highlighting. |
| **DOCX to PDF** | Convert Microsoft Word documents to PDF in the browser. |
| **PDF to Word** | Extract selectable PDF text into an editable DOCX file. |
| **PPTX to PDF** | Convert PowerPoint slides into PDF pages or handouts. |
| **Images to PDF** | Combine JPG or PNG images into a single PDF file. |
| **PDF Password Protect** | Add password protection and permission restrictions to PDFs. |
| **Merge PDFs** | Combine multiple PDF files into one document. |
| **Split PDF** | Extract selected pages or page ranges from a PDF. |
| **Rotate PDF** | Rotate PDF pages to correct orientation. |
| **Watermark PDF** | Add text watermarks across one or more PDF pages. |
| **Page Numbers** | Add sequential page numbers to a PDF. |
| **Compress PDF** | Reduce PDF file size for easier sharing. |
| **TXT to DOCX** | Convert plain text files into Word documents. |
| **PDF to JPG** | Export individual PDF pages as JPG images. |
| **Image Converter** | Convert images to PNG, JPEG, or WebP formats. |
| **HTML to PDF** | Create printable PDF documents from HTML snippets. |
| **QR Code Generator** | Generate QR codes in PNG or SVG format. |

---

## Why PDFperch

- **Privacy-first:** Document processing happens locally in the browser. Files are never uploaded for conversion.
- **No account needed:** Use every tool without registration or subscription.
- **No analytics or tracking:** The site loads no analytics, tag manager, or search-console scripts, and sets no tracking cookies. See `privacy.html` for details.
- **Static architecture:** The site is delivered as static HTML, CSS, and JavaScript for speed and reliability.

---

## Technology

PDFperch is implemented using open web standards to stay fast, portable, and transparent:

- **HTML5 / CSS3 / Vanilla JavaScript** — lightweight front-end code without heavy frameworks.
- **pdf-lib** — for PDF creation, merging, and encryption.
- **Mammoth.js** — for DOCX conversion.
- **KaTeX** and **Prism.js** — for rendering Markdown, math, and code blocks.
- **QRCode** and **JSZip** — for QR code generation and file packaging.

---

## Project Structure

```
PDFperch/
├── index.html            Homepage
├── all-tools.html        Full tool directory
├── about.html, contact.html, privacy.html, terms.html
├── pages/                One HTML page per tool (compresspdf.html, mergepdf.html, ...)
├── tools/                One JS module per tool, matching the page names in pages/
├── blog/                 Blog articles
├── author/               Author bio page
├── components.js         Shared header/footer/theme-toggle logic
├── utils.js               Shared helpers used across tool pages
├── script.js              Homepage-specific behavior
├── styles.css             Site-wide styles
├── sw.js                  Service worker (offline caching)
├── manifest.json          PWA manifest
├── robots.txt, _headers, _redirects   Deployment/config files
└── scripts/
    ├── check-static-site.js   Static validation (see below)
    └── bump-cache.js          Cache-busting for deploys
```

---

## Running Locally

This project is a static website — no build step is required to view it.

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari).
- Node.js, only if you want to run the validation script below.

### Setup
1. Open the project folder.
2. Open `index.html` directly in your browser, or serve the folder with any static server (e.g. VS Code Live Server, `npx serve`).

### Validation
Run the static checks before deploying:

```bash
npm run check
```

This validates:
1. Every `.html` file has a `<head>` and `<body>`.
2. Every local `href="/..."` / `src="/..."` link resolves to a real file.
3. Every tool page's `<script src="/tools/*.js">` reference exists.
4. Every `.js` file parses without a syntax error.
5. `robots.txt` is present.

### Build
```bash
npm run build
```
Runs `scripts/bump-cache.js` to bump cache-busting parameters ahead of a deploy.

---

## License

This project is proprietary. Third-party open-source libraries retain their own licenses.

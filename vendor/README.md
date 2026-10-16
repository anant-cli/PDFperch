# Self-hosted third-party libraries

PDFperch runs entirely in the visitor's browser. To keep it that way **without
contacting any third-party server** (no CDNs, no Google Fonts), every library is
served from this folder on our own domain. Nothing here is ever sent anywhere;
files a user opens are processed in their browser and never uploaded.

All files are unmodified copies of the npm-published builds unless noted.

| Folder | Package | Version | License |
|---|---|---|---|
| pdf-lib | pdf-lib (dist/pdf-lib.min.js) | 1.17.1 | MIT |
| pdf-lib-with-encrypt | pdf-lib-with-encrypt (dist/pdf-lib.min.js) | 1.2.1 | MIT |
| pdfjs | pdfjs-dist (build/pdf.min.js, pdf.worker.min.js) | 3.11.174 | Apache-2.0 |
| jszip | jszip (dist/jszip.min.js) | 3.10.1 | MIT / GPLv3 |
| dompurify | dompurify (dist/purify.min.js) | 3.4.11 | MPL-2.0 / Apache-2.0 |
| docx | docx (build/index.js) | 7.8.2 | MIT |
| mammoth | mammoth (mammoth.browser.min.js) | 1.6.0 | BSD-2-Clause |
| html2pdf | html2pdf.js (dist/html2pdf.bundle.min.js) | 0.10.1 | MIT |
| html2canvas | html2canvas (dist/html2canvas.min.js) | 1.4.1 | MIT |
| qrcode | qrcode (build/qrcode.js) | 1.5.1 | MIT |
| marked | marked (lib/marked.umd.js) | 16.3.0 | MIT |
| katex | katex (dist: js, css, contrib/auto-render, woff2 fonts) | 0.16.10 | MIT |
| prism | prismjs (prism.js, tomorrow theme, autoloader, components/*.min.js) | 1.29.0 | MIT |
| tesseract | tesseract.js (dist) + tesseract.js-core (lstm .wasm.js builds) | 5.1.1 / 5.1.1 | Apache-2.0 |
| tesseract/lang | @tesseract.js-data/<lang> (4.0.0_best_int only) | 1.0.0 | Apache-2.0 |
| pptx-preview | pptx-preview, **bundled** with esbuild (see below) | 1.0.7 | ISC |
| fonts/inter | @fontsource/inter (latin, weights 300-800) | 5.1.0 | OFL-1.1 |

## Rebuilding pptx-preview

The npm package's browser build expects Node built-ins, so it is bundled:

```sh
npm i pptx-preview@1.0.7 esbuild@0.24.0
echo "export { init } from 'pptx-preview';" > entry.js
npx esbuild entry.js --bundle --minify --format=iife --global-name=pptxPreview \
  --platform=browser --target=es2020 --outfile=vendor/pptx-preview/pptx-preview.bundle.js
```

## Updating a library

Download the new version's file from npm (`npm pack <name>@<version>`), replace it
here, update this table and the matching path in the tool that loads it, then run
`npm run check` and test the tool.

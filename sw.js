/**
 * ConvertPDF Service Worker
 */
const CACHE_NAME = 'convertpdf-v12';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/all-tools.html',
    '/styles.css',
    '/utils.js',
    '/script.js',
    '/components.js',
    '/favicon.png',
    '/favicon.ico',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.json',
    '/tools/loader.js',
    '/pages/compresspdf.html',
    '/pages/docx2pdf.html',
    '/pages/pdf2word.html',
    '/pages/img2pdf.html',
    '/pages/img2png.html',
    '/pages/md2pdf.html',
    '/pages/mergepdf.html',
    '/pages/pagenumbers.html',
    '/pages/pdf2jpg.html',
    '/pages/pdfencrypt.html',
    '/pages/qrmaker.html',
    '/pages/rotatepdf.html',
    '/pages/signpdf.html',
    '/pages/splitpdf.html',
    '/pages/txt2docx.html',
    '/pages/watermarkpdf.html',
    '/pages/web2pdf.html',
    '/pages/imgcompress.html',
    '/pages/organizepdf.html',
    '/pages/ocrtool.html',
    '/tools/compresspdf.js',
    '/tools/docx2pdf.js',
    '/tools/pdf2word.js',
    '/tools/img2pdf.js',
    '/tools/img2png.js',
    '/tools/md2pdf.js',
    '/tools/mergepdf.js',
    '/tools/pagenumbers.js',
    '/tools/pdf2jpg.js',
    '/tools/pdfencrypt.js',
    '/tools/qrmaker.js',
    '/tools/rotatepdf.js',
    '/tools/signpdf.js',
    '/tools/splitpdf.js',
    '/tools/txt2docx.js',
    '/tools/watermarkpdf.js',
    '/tools/web2pdf.js',
    '/tools/imgcompress.js',
    '/tools/organizepdf.js',
    '/tools/ocrtool.js'
];

function isFontRequest(url) {
    return url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');
}

function isNavigationRequest(req) {
    return req.mode === 'navigate';
}

// Install: cache assets individually so a single 404 won't fail the whole SW.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            const promises = STATIC_ASSETS.map(url =>
                cache.add(url).catch(err => {
                    console.warn('[SW] Failed to pre-cache:', url, err);
                })
            );
            return Promise.all(promises);
        }).then(() => self.skipWaiting())
    );
});

// Activate: delete stale caches.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => {
                    console.log('[SW] Deleting old cache:', key);
                    return caches.delete(key);
                })
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: stale-while-revalidate for assets, network-first for navigation.
function isCDNRequest(url) {
    return url.includes('cdn.jsdelivr.net') || url.includes('cdnjs.cloudflare.com') || url.includes('unpkg.com');
}

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (isFontRequest(event.request.url)) return;

    // Navigation: try network first, fall back to cached index
    if (isNavigationRequest(event.request)) {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    if (res && res.status === 200) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return res;
                })
                .catch(() =>
                    caches.match(event.request).then(cached =>
                        cached || caches.match('/index.html')
                    )
                )
        );
        return;
    }

    // CDN assets: use explicit CORS mode so the response is not opaque and can be cached.
    // Strategy: cache-first (libs are versioned/immutable), fall back to network.
    if (isCDNRequest(event.request.url)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(event.request).then(cached => {
                    if (cached) return cached;
                    const corsRequest = new Request(event.request.url, {
                        mode: 'cors',
                        credentials: 'omit',
                    });
                    return fetch(corsRequest).then(res => {
                        if (res && res.status === 200 && res.type === 'cors') {
                            cache.put(event.request, res.clone());
                        }
                        return res;
                    });
                })
            )
        );
        return;
    }

    // Same-origin assets: stale-while-revalidate
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() =>
                    cachedResponse || new Response('Network error', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain' }
                    })
                );

                return cachedResponse || fetchPromise;
            });
        })
    );
});

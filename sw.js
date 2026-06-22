const CACHE_NAME = 'convertpdf-v21';

const STATIC_ASSETS = [
 '/',
 '/all-tools.html',
 '/offline.html',
 '/styles.css',
 '/utils.js',
 '/script.js',
 '/components.js',
 '/favicon.png',
 '/favicon.ico',
 '/icon-192.png',
 '/manifest.json',
 '/tools/loader.js'
];

function isFontRequest(url) {
 return url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');
}

function isNavigationRequest(req) {
 return req.mode === 'navigate';
}

function isThirdPartyRequest(url) {
 return url.includes('googletagmanager.com') ||
 url.includes('google-analytics.com') ||
 url.includes('analytics.google.com') ||
 url.includes('region1.google-analytics.com');
}

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

function isCDNRequest(url) {
 return url.includes('cdn.jsdelivr.net') || url.includes('cdnjs.cloudflare.com') || url.includes('esm.sh') || url.includes('unpkg.com');
}

self.addEventListener('fetch', event => {

 if (event.request.method !== 'GET') return;

 if (isThirdPartyRequest(event.request.url)) return;

 if (isFontRequest(event.request.url)) return;

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
 cached || caches.match('/offline.html')
 )
 )
 );
 return;
 }

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

 event.respondWith(
 caches.open(CACHE_NAME).then(cache => {
 return cache.match(event.request).then(cachedResponse => {
 const fetchPromise = fetch(event.request).then(networkResponse => {
 if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
 cache.put(event.request, networkResponse.clone());
 }
 return networkResponse;
 }).catch(() => {

 if (cachedResponse) return cachedResponse;
 return new Response('<!DOCTYPE html><html lang="en"><body><h1>Offline</h1><p>Please check your network connection.</p></body></html>', {
 status: 200,
 headers: { 'Content-Type': 'text/html' }
 });
 });

 return cachedResponse || fetchPromise;
 });
 })
 );
});



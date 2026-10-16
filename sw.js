const CACHE_NAME = 'pdfperch-v2026-10-16T15-15-38';

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

function isNavigationRequest(req) {
 return req.mode === 'navigate';
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
 keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
 ))
 .then(() => self.clients.claim())
 );
});

self.addEventListener('fetch', event => {

 if (event.request.method !== 'GET') return;

 // Everything (pages, scripts, fonts, /vendor libraries) is same-origin.
 // Leave any other request to the browser untouched.
 if (new URL(event.request.url).origin !== self.location.origin) return;

 if (isNavigationRequest(event.request)) {
 // Stale-while-revalidate: repeat visits to a tool page render instantly
 // from cache instead of blocking on the network, while a background
 // fetch refreshes the cache for the *next* visit. Each deploy still
 // gets a clean slate because `activate` wipes any CACHE_NAME that
 // doesn't match the one baked in by scripts/bump-cache.js.
 event.respondWith(
 caches.open(CACHE_NAME).then(cache =>
 cache.match(event.request).then(cachedResponse => {
 const fetchPromise = fetch(event.request)
 .then(res => {
 if (res && res.status === 200) {
 cache.put(event.request, res.clone());
 }
 return res;
 })
 .catch(() => cachedResponse || caches.match('/offline.html'));

 // Keep the worker alive until the background refresh is stored.
 if (cachedResponse) event.waitUntil(fetchPromise.catch(() => {}));
 return cachedResponse || fetchPromise;
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
  // Pages request /styles.css?v=<build> but STATIC_ASSETS precaches the bare
  // path, so an exact match never hit and offline pages had no CSS/JS. Fall
  // back to a query-insensitive match for same-origin files.
  if (new URL(event.request.url).origin === self.location.origin && event.request.mode !== 'navigate') {
    return cache.match(event.request, { ignoreSearch: true })
      .then(match => match || new Response('', { status: 408, statusText: 'Request timeout' }));
  }
  if (event.request.mode === 'navigate') {
    return cache.match('/offline.html').then(offlineRes => {
      if (offlineRes) return offlineRes;
      return new Response('<!DOCTYPE html><html lang="en"><body><h1>Offline</h1><p>Please check your network connection.</p></body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    });
  }
  return new Response('', { status: 408, statusText: 'Request timeout' });
  });

 return cachedResponse || fetchPromise;
 });
 })
  );
});

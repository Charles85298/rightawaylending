const CACHE_NAME = 'right-away-lending-v20';
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./mortgage-comparison.html",
  "./first-time-buyers.html",
  "./affordability-calculator.html",
  "./prequalify.html",
  "./css/tokens.css",
  "./css/styles.css",
  "./js/app.js",
  "./images/logo-transparent.png",
  "./images/hero-home.jpg",
  "./offline.html"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached =>
          cached || caches.match('./offline.html')
        )
      )
  );
});

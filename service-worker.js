/* Cache only public educational pages and named static assets. */
const CACHE_PREFIX = 'right-away-lending-';
const CACHE_NAME = CACHE_PREFIX + 'brand-20260918d';
const CORE_ASSETS = [
  './index.html', './offline.html', './mortgage-comparison.html', './resource-center.html',
  './css/tokens.css?v=20260918d', './css/styles.css?v=20260918d', './css/site.css?v=20260918d',
  './js/app.js?v=20260918d', './js/home.js?v=20260918d', './js/mortgage-math.js?v=20260918d',
  './js/offline.js?v=20260918d', './images/logo-transparent.png?v=20260918d',
  './images/right-away-mark-ultra.png?v=20260917-rwb', './images/right-away-mark-ultra.png',
  './images/reference-background-1.jpg', './assets/favicon.png?v=20260918d'
];
const SAFE_PAGES = new Set(['/', '/index.html', '/offline.html', '/mortgage-comparison.html', '/resource-center.html']);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  const request=event.request, url=new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(async response => {
      if (response.ok && SAFE_PAGES.has(url.pathname) && !url.search) {
        const cache=await caches.open(CACHE_NAME); await cache.put(request,response.clone());
      }
      return response;
    }).catch(async () => {
      const cache=await caches.open(CACHE_NAME);
      return (SAFE_PAGES.has(url.pathname) && !url.search && await cache.match(request)) || await cache.match('./offline.html');
    }));
    return;
  }
  const permitted=CORE_ASSETS.some(asset=>new URL(asset,self.location.href).href===url.href);
  if (!permitted) return;
  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const existing=await cache.match(request); if(existing) return existing;
    const response=await fetch(request); if(response.ok) await cache.put(request,response.clone()); return response;
  }));
});

const staticCacheName = 'sport-site-v1';
const assetUrls = [
  '/',
  '/index.html',
  '/football.html',
  '/basketball.html',
  '/styles.css',
  '/images/football.jpg',
  '/images/basketball.jpg',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/manifest.json'
];

self.addEventListener('install', async event => {
  const cache = await caches.open(staticCacheName);
  await cache.addAll(assetUrls);
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

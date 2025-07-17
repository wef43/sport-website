const CACHE_NAME = 'sport-site-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/football.html',
  '/basketball.html',
  '/styles.css',
  '/images/football.jpg',
  '/images/basketball.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

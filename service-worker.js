const CACHE_NAME = 'sport-site-v2';
const OFFLINE_URL = '/offline.html';
const urlsToCache = [
  '/',
  '/index.html',
  '/football.html',
  '/basketball.html',
  '/styles.css',
  '/images/football.jpg',
  '/images/basketball.jpg',
  OFFLINE_URL
];

// Установка Service Worker и кэширование ресурсов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэширование ресурсов');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Стратегия "Cache First, затем Network" с fallback для оффлайн-режима
self.addEventListener('fetch', (event) => {
  // Пропускаем запросы, не относящиеся к HTTP GET
  if (event.request.method !== 'GET') return;

  // Обработка запросов навигации (HTML-страницы)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Клонируем ответ для кэширования
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache));
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, возвращаем закэшированную страницу
          return caches.match(event.request)
            .then((response) => response || caches.match(OFFLINE_URL));
        })
    );
  } else {
    // Для остальных ресурсов (CSS, JS, изображения)
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Возвращаем закэшированный ресурс или делаем запрос к сети
          return response || fetch(event.request)
            .then((fetchResponse) => {
              // Кэшируем полученный ресурс
              if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                return fetchResponse;
              }

              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseToCache));

              return fetchResponse;
            });
        })
    );
  }
});

// Обработка push-уведомлений (опционально)
self.addEventListener('push', (event) => {
  const title = 'Спортивный сайт';
  const options = {
    body: event.data.text(),
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-192x192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
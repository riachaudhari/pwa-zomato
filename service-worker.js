const CACHE_NAME = 'zomato-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './images/icon-192x192.png',
  './images/icon-512x512.png',
  'item4.png'
];

// INSTALL EVENT – cache static assets
self.addEventListener('install', function (e) {
  console.log('[Service Worker] Installed');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ACTIVATE EVENT – clean old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activated');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH EVENT – serve from cache or fetch from network
self.addEventListener('fetch', function (e) {
  console.log('[Service Worker] Fetch successful:', e.request.url);
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});

// SYNC EVENT – background sync for 'sync-orders' tag
self.addEventListener('sync', event => {
  console.log('[Service Worker] Sync event received:', event.tag);
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

function syncOrders() {
  return new Promise((resolve) => {
    console.log('[Service Worker] 🔄 Syncing orders in background...');
    setTimeout(() => {
      console.log('[Service Worker] ✅ Orders synced!');
      resolve();
    }, 2000);
  });
}

// PUSH EVENT – show a notification
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received');
  const data = event.data ? event.data.text() : '🍽️ Time to order your favorite food!';
  const options = {
    body: data,
    icon: './images/icon-192x192.png',
    badge: './images/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification('Zomato PWA', options)
  );
});

// ✅ SIMULATED PUSH – trigger from console
self.addEventListener('message', function(event) {
  if (event.data === 'simulate-push') {
    console.log('[Service Worker] Simulating push...');
    self.registration.showNotification('🔔 Zomato Special!', {
      body: '🎉 50% off on your first order. Order now!',
      icon: './images/icon-192x192.png',
      badge: './images/icon-192x192.png'
    });
  }
});
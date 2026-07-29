const CACHE_NAME = 'islamic-blog-v2';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assets/default-cover.svg'
];

// Service Worker Install Event - Pre-cache essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching app shell & offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Service Worker Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Service Worker Fetch Event - Stale-while-revalidate for assets, Network-first for APIs with offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests or chrome extension schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  // For API calls: Network-first
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // For HTML navigation: Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match(OFFLINE_URL);
        });
      })
    );
    return;
  }

  // For static assets (CSS, JS, Images, Fonts): Cache-first with network update
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return networkResponse;
      });
    })
  );
});

// Push Notification Event Handler
self.addEventListener('push', (event) => {
  let notificationData = {
    title: '📖 Daily Islamic Reflection',
    body: 'A new post has been published on Nur & Hikmah.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    url: '/'
  };

  if (event.data) {
    try {
      notificationData = Object.assign(notificationData, event.data.json());
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: notificationData.badge || '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url || '/'
    },
    actions: [
      { action: 'read', title: 'Read Post 📖' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification Click Event Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If tab is already open, focus it and navigate
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

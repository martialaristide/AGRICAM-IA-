/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'agricam-ia-v3';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/manifest.json',
  '/offline.html',
];

// API routes to cache for offline access
const API_CACHE_ROUTES = [
  '/api/parcels',
  '/api/sensors',
  '/api/sensors/stats',
  '/api/dashboard/stats',
  '/api/recommendations',
  '/api/alerts'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
    })
  );
  self.skipWaiting();
});

// Listen for SKIP_WAITING message from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for offline use
          if (response.ok && API_CACHE_ROUTES.some(route => url.pathname.includes(route))) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API data if offline
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline JSON for API requests
            return new Response(
              JSON.stringify({ 
                error: 'Hors ligne', 
                message: 'Données non disponibles en mode hors ligne',
                offline: true 
              }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // CRITICAL: Network-first for app shell, JS bundles, CSS, and HTML navigations
  // (otherwise stale bundle.js will be served forever, causing splash freeze)
  const isAppShell = request.mode === 'navigate'
    || url.pathname === '/'
    || url.pathname === '/index.html'
    || url.pathname.startsWith('/static/js/')
    || url.pathname.startsWith('/static/css/')
    || url.pathname.endsWith('.js')
    || url.pathname.endsWith('.css')
    || url.pathname.endsWith('.html');

  if (isAppShell) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Handle other static assets (images, fonts) with cache-first strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached and update in background
        fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          }
        }).catch(() => {});
        return cached;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If navigation request fails, show offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Get any queued offline requests and replay them
  const cache = await caches.open(CACHE_NAME);
  const offlineQueue = await cache.match('offline-queue');
  
  if (offlineQueue) {
    const requests = await offlineQueue.json();
    for (const req of requests) {
      try {
        await fetch(req.url, req.options);
      } catch (e) {
        console.error('[ServiceWorker] Sync failed:', e);
      }
    }
    await cache.delete('offline-queue');
  }
}

// Push notification support (for future alerts)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification AGRICAM IA',
      icon: 'https://customer-assets.emergentagent.com/job_agricam-ia/artifacts/pkl5v1nd_logo%20Afrian%20ai%20solutions.png',
      badge: 'https://customer-assets.emergentagent.com/job_agricam-ia/artifacts/pkl5v1nd_logo%20Afrian%20ai%20solutions.png',
      vibrate: [100, 50, 100],
      data: data,
      actions: [
        { action: 'view', title: 'Voir' },
        { action: 'close', title: 'Fermer' }
      ]
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'AGRICAM IA', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view' && event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});

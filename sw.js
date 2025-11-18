/**
 * Service Worker for TT K1n3t1c
 * Enables offline functionality and asset caching
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `ttk1n3t1c-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/design-tokens.css',
  './css/base.css',
  './css/components.css',
  './css/animations.css',
  './js/index.js',
  './js/ui.js',
  './js/options.js',
  './js/fonts.js',
  './js/gl/index.js',
  './js/gl/Type.js',
  './js/gl/shaders.js',
  './manifest.json',
  // CDN resources (cache after first load)
  'https://unpkg.com/open-props@1.7.3/open-props.min.css',
  'https://unpkg.com/open-props@1.7.3/normalize.min.css',
  'https://unpkg.com/open-props@1.7.3/buttons.min.css',
  'https://unpkg.com/gsap@3.12.4/dist/gsap.min.js'
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets');
      // Cache what we can, but don't fail if some assets aren't available yet
      return cache.addAll(PRECACHE_ASSETS.filter(url => !url.startsWith('http'))).catch(err => {
        console.warn('[SW] Some assets failed to precache:', err);
      });
    }).then(() => {
      // Activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
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
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Strategy: Cache First, Network Fallback (with cache update)
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          // Update cache in background for next time
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
          }).catch(() => {
            // Network failed, but we have cache - no problem
          });

          return cachedResponse;
        }

        // No cache - fetch from network
        return fetch(request).then((networkResponse) => {
          // Cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            // Clone the response before caching
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((error) => {
          console.error('[SW] Fetch failed:', request.url, error);

          // Could return a custom offline page here
          throw error;
        });
      });
    })
  );
});

// Message event - allow cache control from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache cleared');
    });
  }
});

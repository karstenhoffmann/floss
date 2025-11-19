/**
 * Service Worker for Offline Support
 * Caches assets for offline functionality
 */

const CACHE_NAME = 'kinetic-typo-v2.0.0'; // Updated version to force cache refresh

// Assets to cache
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles/theme.css',
    './styles/main-modern.css',
    './styles/help-overlay.css',
    './styles/notifications.css',
    './js/app.js',
    './js/core/state.js',
    './js/core/scene.js',
    './js/core/renderer.js',
    './js/core/effect-manager.js',
    './js/core/preset-manager.js',
    './js/effects/effect-base.js',
    './js/effects/endless.js',
    './js/ui/notification.js',
    './js/ui/icons.js',
    './js/utils/storage.js',
    './js/utils/text-texture.js',
    './js/utils/webgl-check.js',
    './manifest.json',
    // Three.js from CDN
    'https://unpkg.com/three@0.115.0/build/three.min.js',
    'https://unpkg.com/three@0.115.0/examples/js/controls/OrbitControls.js',
    // Open Props
    'https://unpkg.com/open-props',
    'https://unpkg.com/open-props/normalize.min.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome extensions
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone response (can only be consumed once)
                        const responseToCache = response.clone();

                        // Cache successful response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[ServiceWorker] Fetch failed:', error);
                        // Return offline page or fallback
                        return new Response('Offline - resource not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Message event - handle commands from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

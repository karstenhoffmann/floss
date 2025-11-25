/**
 * Service Worker for Offline Support
 * Caches assets for offline functionality
 *
 * IMPORTANT: CACHE_NAME must match version in js/version.js
 * See CLAUDE.md → "Version Sync Invariant"
 */

const CACHE_NAME = 'floss-v5.9.6';

// Assets to cache (alphabetically sorted by category)
const ASSETS_TO_CACHE = [
    // Root
    './',
    './index.html',
    './manifest.json',

    // Core JavaScript
    './js/app.js',
    './js/config.js',
    './js/floss-app.js',
    './js/floss-app.iife.js',
    './js/version.js',

    // Core modules
    './js/core/app-settings.js',
    './js/core/camera-controller.js',
    './js/core/effect-manager.js',
    './js/core/preset-manager.js',
    './js/core/renderer.js',
    './js/core/scene.js',
    './js/core/state.js',
    './js/core/video-export.js',

    // Effects
    './js/effects/effect-base.js',
    './js/effects/endless.js',
    './js/effects/glitch-shader.js',
    './js/effects/glitch.js',
    './js/effects/particles.js',
    './js/effects/sphere-text.js',
    './js/effects/wave-plane.js',

    // UI components
    './js/ui/export-panel.js',
    './js/ui/icons.js',
    './js/ui/notification.js',
    './js/ui/safe-frame.js',

    // Utilities
    './js/utils/password-gate.js',
    './js/utils/storage.js',
    './js/utils/text-texture.js',
    './js/utils/webgl-check.js',

    // Styles
    './styles/help-overlay.css',
    './styles/main-modern.css',
    './styles/notifications.css',
    './styles/password-gate.css',
    './styles/preloader.css',
    './styles/settings-overlay.css',
    './styles/theme.css',
    './styles/video-export.css',

    // Three.js (vendored)
    './lib/three/three.min.js',
    './lib/three/examples/js/controls/OrbitControls.js',
    './lib/three/examples/js/postprocessing/EffectComposer.js',
    './lib/three/examples/js/postprocessing/RenderPass.js',
    './lib/three/examples/js/postprocessing/ShaderPass.js',
    './lib/three/examples/js/shaders/CopyShader.js',

    // Open Props (vendored)
    './lib/open-props/normalize.min.css',
    './lib/open-props/open-props.min.css',

    // Coloris (vendored)
    './lib/coloris/coloris.min.css',
    './lib/coloris/coloris.min.js',

    // canvas-record (vendored)
    './lib/canvas-record/canvas-record.iife.js',
    './lib/canvas-record/h264-mp4-encoder.umd.js',
    './lib/canvas-record/package/index.js',

    // canvas-record dependencies (Rollup bundles)
    './lib/esm/bundles/canvas-context.js',
    './lib/esm/bundles/canvas-screenshot.js',
    './lib/esm/bundles/h264-mp4-encoder.js',
    './lib/esm/bundles/media-codecs.js',
    './lib/esm/bundles/mediabunny.js'

    // Note: gifenc, @ffmpeg/ffmpeg, @ffmpeg/util remain on CDN (optional features)
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

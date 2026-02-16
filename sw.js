const CACHE_NAME = 'carlisle-ccm-v2';
const ASSETS = [
    './',
    './index.html',
    './register.html',
    './contractor-dashboard.html',
    './styles.css',
    './api.js',
    './ui.js',
    './app.js',
    './demoData.js',
    './roleConfig.js'
];

// Install — cache the app shell
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});

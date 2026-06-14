const CACHE = 'travis-workout-v12';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './media/session-complete.mp4',
  './media/ava-portrait.png',
  './media/pr-1.mp4',
  './media/pr-2.mp4',
  './media/welcome-back.mp4',
  './media/streak.mp4',
  './media/phase-change.mp4',
  './media/deload-week.mp4',
  './media/cycle-complete.mp4',
];

// Install: cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// NETWORK-FIRST for same-origin only. External requests (GitHub API,
// raw content, CDNs) are left to the browser so cloud sync isn't intercepted.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok && ASSETS.some(a => e.request.url.endsWith(a.replace('./', '')))) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(e.request).then(cached =>
          cached || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())
        )
      )
  );
});

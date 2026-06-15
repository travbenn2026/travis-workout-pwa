const CACHE = 'travis-workout-v17';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './media/session-complete.mp4',
  './media/ava-portrait.png',
  './media/ava-large.png',
  './media/pr-1.mp4',
  './media/pr-2.mp4',
  './media/welcome-back.mp4',
  './media/streak.mp4',
  './media/phase-change.mp4',
  './media/deload-week.mp4',
  './media/cycle-complete.mp4',
  './media/tricep-stretch.mp4',
  './media/overhead-lat-stretch.mp4',
  './media/cross-body-shoulder-stretch.mp4',
  './media/doorway-chest-opener.mp4',
  './media/standing-quad-stretch.mp4',
  './media/session-complete-2.mp4',
  './media/session-complete-3.mp4',
  './media/session-start.mp4',
  './media/pr-3.mp4',
  './media/pr-4.mp4',
  './media/session-start-push.mp4',
  './media/session-start-pull.mp4',
  './media/session-start-legs.mp4',
  './media/session-start-arms.mp4',
  './media/session-start-recovery.mp4',
  './media/wrist-flexor-stretch.mp4',
  './media/childs-pose.mp4',
  './media/thoracic-extension.mp4',
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

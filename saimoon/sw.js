/**
 * Saimoon Digital Universe - High-Performance Asset Service Worker
 * Native media streaming: Videos are handled directly by the browser's native C++
 * media stack with zero-copy GPU hardware decoding and HTTP byte-range streaming.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.includes('video') || name.includes('saimoon-video'))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Browser natively handles all media and asset requests for maximum 60fps performance

/**
 * Saimoon Digital Universe - High Performance Media & Asset Service Worker
 * Intercepts video requests, caches media in browser CacheStorage,
 * and serves 206 Partial Content (Range requests) for instant, lag-free video playback.
 */

const VIDEO_CACHE_NAME = 'saimoon-video-cache-v1';
const STATIC_CACHE_NAME = 'saimoon-static-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== VIDEO_CACHE_NAME && name !== STATIC_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Intercept video file requests (MP4 / WebM / MOV)
  if (url.pathname.match(/\.(mp4|webm|mov)$/i)) {
    event.respondWith(handleVideoRangeRequest(event.request));
    return;
  }
});

/**
 * Handles video requests with full HTTP 206 Partial Content (Range request) support
 * from local browser CacheStorage, eliminating network latency and buffering stutter.
 */
async function handleVideoRangeRequest(request) {
  const cache = await caches.open(VIDEO_CACHE_NAME);
  // Match without query strings/ranges
  const cleanUrl = request.url.split('?')[0];
  let cachedResponse = await cache.match(cleanUrl);

  if (!cachedResponse) {
    try {
      // Fetch from network, cache full response, and return
      const networkResponse = await fetch(request);
      if (networkResponse.status === 200) {
        cache.put(cleanUrl, networkResponse.clone()).catch(() => {});
      }
      return networkResponse;
    } catch (err) {
      if (cachedResponse) return cachedResponse;
      throw err;
    }
  }

  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) {
    return cachedResponse;
  }

  // Parse Range: bytes=start-end
  const fullBuffer = await cachedResponse.arrayBuffer();
  const totalSize = fullBuffer.byteLength;
  const parts = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10) || 0;
  const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

  if (start >= totalSize || end >= totalSize) {
    return new Response(null, {
      status: 416,
      statusText: 'Range Not Satisfiable',
      headers: {
        'Content-Range': `bytes */${totalSize}`,
      },
    });
  }

  const slicedBuffer = fullBuffer.slice(start, end + 1);
  return new Response(slicedBuffer, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cachedResponse.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      'Content-Length': slicedBuffer.byteLength.toString(),
      'Accept-Ranges': 'bytes',
      'X-Served-By': 'Saimoon-CacheStorage-SW',
    },
  });
}

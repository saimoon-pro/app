/**
 * Saimoon Video Cache & Progressive Preloading Engine
 * Manages browser CacheStorage for instant video playback on any connection.
 */

import { assetUrl } from '@/lib/assetUrl';

const VIDEO_CACHE_NAME = 'saimoon-video-cache-v1';

export const ALL_VIDEOS = [
  assetUrl('backgrounds/Intro.mp4'),
  assetUrl('backgrounds/Regulator 1_opt.mp4'),
  assetUrl('backgrounds/Regulator 2_opt.mp4'),
  assetUrl('backgrounds/Regulator 3_opt.mp4'),
  assetUrl('backgrounds/Regulator 4_opt.mp4'),
  assetUrl('backgrounds/Regulator 5_opt.mp4'),
  assetUrl('backgrounds/Regulator 6_opt.mp4'),
  assetUrl('backgrounds/Contact Screen_opt.mp4'),
];

class VideoCacheService {
  private cachePromise: Promise<Cache | null> | null = null;
  private preloadedUrls = new Set<string>();
  private isPreloadingQueue = false;

  constructor() {
    if (typeof window !== 'undefined' && 'caches' in window) {
      this.cachePromise = caches.open(VIDEO_CACHE_NAME).catch(() => null);
    }
  }

  /**
   * Registers the media service worker early
   */
  public registerServiceWorker(): void {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const swUrl = assetUrl('sw.js');
      navigator.serviceWorker
        .register(swUrl, { scope: assetUrl('') })
        .then((reg) => {
          // Check for updates
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn('Service Worker registration fallback to Cache API:', err);
        });
    }
  }

  /**
   * Preload critical intro video: Handled natively by HTML <video preload="auto">
   * for zero network contention and optimal 60fps streaming.
   */
  public async preloadIntroVideo(): Promise<void> {
    // Native <video preload="auto"> handles intro streaming directly
    return Promise.resolve();
  }

  /**
   * Start progressive background queue for remaining videos during idle browser cycles.
   * Only called AFTER intro has completed.
   */
  public startBackgroundPreloadQueue(): void {
    if (this.isPreloadingQueue) return;
    this.isPreloadingQueue = true;

    // Preload next key videos progressively
    const nextVideos = [
      assetUrl('backgrounds/Regulator 2_opt.mp4'),
      assetUrl('backgrounds/Contact Screen_opt.mp4'),
    ];
    let index = 0;

    const loadNext = () => {
      if (index >= nextVideos.length) {
        this.isPreloadingQueue = false;
        return;
      }

      const nextUrl = nextVideos[index++];
      this.cacheSingleVideo(nextUrl, 'low').finally(() => {
        // Schedule next with safe 4-second spacing during idle time
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            setTimeout(loadNext, 4000);
          }, { timeout: 8000 });
        } else {
          setTimeout(loadNext, 4000);
        }
      });
    };

    // Begin progressive background caching 4 seconds after intro is completed
    setTimeout(loadNext, 4000);
  }

  /**
   * Caches a single video in CacheStorage
   */
  public async cacheSingleVideo(url: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (!this.cachePromise || this.preloadedUrls.has(url)) return;

    try {
      const cache = await this.cachePromise;
      if (!cache) return;

      const cleanUrl = url.split('?')[0];
      const match = await cache.match(cleanUrl);
      if (match) {
        this.preloadedUrls.add(url);
        return;
      }

      // Fetch video stream and put in CacheStorage
      const response = await fetch(url, {
        priority: priority === 'high' ? 'high' : 'low',
        cache: 'force-cache',
      } as RequestInit);

      if (response.ok && response.status === 200) {
        await cache.put(cleanUrl, response);
        this.preloadedUrls.add(url);
      }
    } catch (err) {
      console.warn(`Video cache prefetch skipped for ${url}:`, err);
    }
  }
}

export const videoCacheService = new VideoCacheService();

import { assetUrl } from './assetUrl';

// Cache for in-browser captured video frames
const videoFrameCache = new Map<string, string>();

/**
 * Extracts a Google Drive file ID from any style of Google Drive URL.
 * Supports:
 * - https://drive.google.com/file/d/{ID}/view
 * - https://drive.google.com/file/d/{ID}
 * - https://drive.google.com/open?id={ID}
 * - https://drive.google.com/uc?id={ID}
 * - https://drive.google.com/uc?export=view&id={ID}
 * - https://drive.google.com/thumbnail?id={ID}
 * - https://lh3.googleusercontent.com/d/{ID}
 */
export function extractGoogleDriveId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Match /file/d/{ID} or /d/{ID}
  const matchFile = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) return matchFile[1];

  // Match [?&]id={ID}
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  // Match googleusercontent.com/d/{ID}
  const matchLh = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (matchLh && matchLh[1]) return matchLh[1];

  return null;
}

/**
 * Checks if a URL is a Google Drive URL.
 */
export function isGoogleDriveUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('drive.google.com') ||
    url.includes('docs.google.com') ||
    url.includes('googleusercontent.com/d/') ||
    extractGoogleDriveId(url) !== null
  );
}

/**
 * Returns a high-resolution direct image/thumbnail URL for a Google Drive file.
 * This works for both uploaded images and automatic video frame thumbnails!
 */
export function getGoogleDriveThumbnailUrl(urlOrId: string, size: number = 1280): string {
  const id = extractGoogleDriveId(urlOrId) || urlOrId.trim();
  if (!id) return '';
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

/**
 * Returns an alternate Google CDN image URL for a Google Drive file.
 */
export function getGoogleDriveDirectImageUrl(urlOrId: string): string {
  const id = extractGoogleDriveId(urlOrId) || urlOrId.trim();
  if (!id) return '';
  return `https://lh3.googleusercontent.com/d/${id}`;
}

/**
 * Returns the official Google Drive embedded player URL for videos.
 */
export function getGoogleDriveEmbedUrl(urlOrId: string): string {
  const id = extractGoogleDriveId(urlOrId) || urlOrId.trim();
  if (!id) return '';
  return `https://drive.google.com/file/d/${id}/preview`;
}

/**
 * Extracts a YouTube video ID from various URL formats (standard, shorts, embed, shortlink).
 */
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Returns a YouTube thumbnail URL.
 */
export function getYouTubeThumbnailUrl(
  urlOrId: string,
  quality: 'maxres' | 'hq' | 'mq' = 'hq'
): string {
  const id = getYouTubeId(urlOrId) || urlOrId.trim();
  if (!id) return '';
  const qualityMap = {
    maxres: 'maxresdefault',
    hq: 'hqdefault',
    mq: 'mqdefault',
  };
  return `https://img.youtube.com/vi/${id}/${qualityMap[quality]}.jpg`;
}

/**
 * Extracts Vimeo ID from a URL.
 */
export function getVimeoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/(?:vimeo\.com\/)(\d+)/);
  return match ? match[1] : null;
}

/**
 * Checks if a URL points directly to a video file.
 */
export function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase().split('?')[0];
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.ogv') ||
    clean.endsWith('.mkv')
  );
}

/**
 * Checks if a URL points directly to an image file.
 */
export function isDirectImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase().split('?')[0];
  return (
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.png') ||
    clean.endsWith('.webp') ||
    clean.endsWith('.svg') ||
    clean.endsWith('.gif') ||
    clean.endsWith('.avif')
  );
}

/**
 * Resolves the best thumbnail for any video item.
 * Priority:
 * 1. Valid custom thumbnail (if provided and not placeholder text "thumbnail")
 * 2. If Google Drive video: auto-extracted video frame from Google Drive backend
 * 3. If YouTube video: high-quality video frame from YouTube
 * 4. Fallback asset image
 */
export function getVideoBestThumbnail(
  videoUrl: string | null | undefined,
  explicitThumbnail?: string | null | undefined,
  fallback?: string
): string {
  const defaultFallback = fallback || assetUrl('images/thumb-video-1.jpg');

  // 1. Check custom thumbnail
  if (explicitThumbnail && typeof explicitThumbnail === 'string') {
    const cleanThumb = explicitThumbnail.trim();
    if (cleanThumb && cleanThumb.toLowerCase() !== 'thumbnail') {
      if (isGoogleDriveUrl(cleanThumb)) {
        return getGoogleDriveThumbnailUrl(cleanThumb, 1280);
      }
      return cleanThumb;
    }
  }

  if (!videoUrl || typeof videoUrl !== 'string') {
    return defaultFallback;
  }

  const cleanVideo = videoUrl.trim();

  // 2. YouTube Video
  const ytId = getYouTubeId(cleanVideo);
  if (ytId) {
    return getYouTubeThumbnailUrl(ytId, 'hq');
  }

  // 3. Google Drive Video -> Use Google's auto-generated best video frame!
  const driveId = extractGoogleDriveId(cleanVideo);
  if (driveId) {
    return getGoogleDriveThumbnailUrl(driveId, 1280);
  }

  // 4. Cached in-browser captured frame if available
  if (videoFrameCache.has(cleanVideo)) {
    return videoFrameCache.get(cleanVideo)!;
  }

  return defaultFallback;
}

/**
 * Resolves an image URL for UI/UX, Illustration, Post Design, or Web projects.
 */
export function resolveItemImageUrl(
  primaryUrl: string | null | undefined,
  explicitThumbnail?: string | null | undefined,
  fallback?: string
): string {
  const defaultFallback = fallback || assetUrl('images/illustration-1.jpg');

  // Check explicit thumbnail first
  if (explicitThumbnail && typeof explicitThumbnail === 'string') {
    const clean = explicitThumbnail.trim();
    if (clean && clean.toLowerCase() !== 'thumbnail') {
      if (isGoogleDriveUrl(clean)) {
        return getGoogleDriveThumbnailUrl(clean, 1280);
      }
      return clean;
    }
  }

  // Check primary URL
  if (primaryUrl && typeof primaryUrl === 'string') {
    const clean = primaryUrl.trim();
    if (clean) {
      if (isGoogleDriveUrl(clean)) {
        return getGoogleDriveThumbnailUrl(clean, 1280);
      }
      if (isDirectImageUrl(clean)) {
        return clean;
      }
    }
  }

  return defaultFallback;
}

/**
 * In-browser HTML5 video frame capturer for direct MP4/WebM files.
 * Seeks to ~1.5s (or 15% duration) to capture the best opening frame instead of black frame 0.
 */
export function captureVideoFrame(
  videoUrl: string,
  seekTimeSeconds: number = 1.5
): Promise<string> {
  if (videoFrameCache.has(videoUrl)) {
    return Promise.resolve(videoFrameCache.get(videoUrl)!);
  }

  return new Promise((resolve, reject) => {
    // Only works in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('Browser environment required'));
      return;
    }

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const cleanUp = () => {
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration || 10;
      const targetTime = Math.min(Math.max(seekTimeSeconds, duration * 0.15), duration - 0.5);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          videoFrameCache.set(videoUrl, dataUrl);
          cleanUp();
          resolve(dataUrl);
          return;
        }
      } catch (e) {
        // Canvas tainted or CORS
      }
      cleanUp();
      reject(new Error('Canvas capture failed'));
    };

    video.onerror = () => {
      cleanUp();
      reject(new Error('Failed to load video element'));
    };
  });
}

/**
 * Smart image error handler to try alternate Google CDN URL or fallback asset.
 */
export function handleMediaImageError(
  e: React.SyntheticEvent<HTMLImageElement>,
  sourceUrl?: string,
  fallbackAsset?: string
) {
  const target = e.currentTarget;
  const currentSrc = target.src || '';
  const driveId = extractGoogleDriveId(sourceUrl) || extractGoogleDriveId(currentSrc);

  if (driveId && !currentSrc.includes('googleusercontent.com/d/')) {
    // Try Google UserContent CDN alternate endpoint
    target.src = getGoogleDriveDirectImageUrl(driveId);
    return;
  }

  const fallback = fallbackAsset || assetUrl('images/thumb-video-1.jpg');
  if (currentSrc !== fallback) {
    target.src = fallback;
  }
}

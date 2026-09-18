/**
 * High-performance Cookie and Browser Storage Manager for Saimoon Digital Portfolio
 * Provides synchronized cookie & localStorage persistence for instant first-load optimization.
 */

const COOKIE_PREFIX = 'saimoon_';
const DEFAULT_DAYS = 365;

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const fullName = `${COOKIE_PREFIX}${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const c = cookies[i].trim();
    if (c.indexOf(fullName) === 0) {
      return decodeURIComponent(c.substring(fullName.length));
    }
  }
  // Fallback to localStorage
  try {
    return localStorage.getItem(`${COOKIE_PREFIX}${name}`);
  } catch {
    return null;
  }
}

export function setCookie(name: string, value: string, days = DEFAULT_DAYS): void {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${COOKIE_PREFIX}${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
  
  // Dual-write to localStorage for instant synchronous retrieval
  try {
    localStorage.setItem(`${COOKIE_PREFIX}${name}`, value);
  } catch {}
}

/**
 * Checks if the visitor has previously entered the site
 */
export function hasSeenIntro(): boolean {
  return getCookie('intro_seen') === '1';
}

export function markIntroSeen(): void {
  setCookie('intro_seen', '1', 180);
}

/**
 * Audio preference persistence - defaults to true (unmuted)
 */
export function getSavedAudioPref(): boolean {
  const val = getCookie('audio_unmuted');
  // Always default to true (unmuted entrance)
  if (val === null || val === undefined) return true;
  return val === '1';
}

export function saveAudioPref(unmuted: boolean): void {
  setCookie('audio_unmuted', unmuted ? '1' : '0', 365);
}

/**
 * Detects current client network conditions (4g, 3g, 2g, slow-2g)
 */
export function detectNetworkTier(): 'fast' | 'medium' | 'slow' {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    if (conn?.saveData) return 'slow';
    const type = conn?.effectiveType;
    if (type === 'slow-2g' || type === '2g') return 'slow';
    if (type === '3g') return 'medium';
  }
  return 'fast';
}

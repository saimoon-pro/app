/**
 * Returns the Vite base URL for resolving public assets.
 * In development it returns '/', in production it returns the configured base (e.g. '/saimoon/').
 */
export function getBaseUrl(): string {
  return import.meta.env.BASE_URL;
}

/**
 * Resolves a public asset path to be base-aware.
 * Converts paths like '/images/photo.jpg' to '/saimoon/images/photo.jpg' in production.
 */
export function assetUrl(path: string): string {
  const base = getBaseUrl();
  // Remove leading slash from path if base already has a trailing one
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}

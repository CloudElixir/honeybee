/**
 * Canonical public site origin (no trailing slash).
 * - Production: set `VITE_SITE_URL` in `.env` before `npm run build` (sitemap + JSON-LD when needed).
 * - Browser: falls back to `window.location.origin`.
 */
export function getSiteUrl() {
  const fromEnv = String(import.meta.env.VITE_SITE_URL || '')
    .trim()
    .replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'https://slategrey-hamster-219402.hostingersite.com'
}

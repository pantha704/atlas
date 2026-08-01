/**
 * Resolve API base URL for both browser and SSR.
 *
 * Relative `/api` works in the browser but FAILS during Astro SSR on Vercel
 * (Node fetch requires an absolute URL) → dashboard showed
 * "API not reachable. Start the stack with bun dev" even when live.
 */
export function getApiBase(requestUrl?: URL | string | null): string {
  const fromEnv = (import.meta.env.PUBLIC_ATLAS_API_URL as string | undefined)?.replace(/\/$/, '')
  if (fromEnv) return fromEnv

  if (requestUrl) {
    try {
      const u = typeof requestUrl === 'string' ? new URL(requestUrl) : requestUrl
      return `${u.origin}/api`
    } catch {
      /* fall through */
    }
  }

  // Browser (client scripts) or last-resort relative
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`
  }
  return '/api'
}

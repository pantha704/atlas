import apiDefault from './_bundle.mjs'

export const config = { runtime: 'nodejs' }

const apiApp = apiDefault as { fetch: (req: Request, env: Record<string, string>) => Promise<Response> }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  // Strip /api prefix + remove Vercel route params from query string
  const newPath = url.pathname.replace(/^\/api/, '') || '/'
  const cleanUrl = new URL(newPath, url.origin)
  // Preserve only non-route query params
  for (const [key, val] of url.searchParams) {
    if (!key.includes('route')) cleanUrl.searchParams.set(key, val)
  }
  const newReq = new Request(cleanUrl, req)
  return apiApp.fetch(newReq, process.env as Record<string, string>)
}

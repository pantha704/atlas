import apiDefault from './_bundle.mjs'

export const config = { runtime: 'nodejs' }

const apiApp = apiDefault as { fetch: (req: Request, env: Record<string, string>) => Promise<Response> }

export default async function handler(req: Request): Promise<Response> {
  // Strip /api prefix so Hono routes match (/api/health -> /health)
  const url = new URL(req.url)
  const newPath = url.pathname.replace(/^\/api/, '') || '/'
  const newUrl = new URL(newPath, url.origin)
  const newReq = new Request(newUrl, req)
  return apiApp.fetch(newReq, process.env as Record<string, string>)
}

import type { APIRoute } from 'astro'
import { app } from '@atlas/api'

export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  // strip /api prefix so Hono routes match (e.g. /api/health -> /health)
  const path = url.pathname.replace(/^\/api/, '') || '/'
  const newPath = `${url.origin}${path}${url.search}`
  const newReq = new Request(newPath, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    duplex: 'half',
  } as RequestInit)
  // inject process.env as Hono bindings (Vercel uses process.env, not CF Workers c.env)
  return app.fetch(newReq, process.env as any)
}

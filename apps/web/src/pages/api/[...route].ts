import { app } from '@atlas/api'
import type { APIRoute } from 'astro'

export const prerender = false
// Pipeline / cron can run long — raise Vercel function limit (Pro plan allows up to 300s)
export const maxDuration = 300

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
  return app.fetch(newReq, process.env as Record<string, string>)
}

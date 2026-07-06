// Astro server endpoint — mounts the Hono API on the same domain.
// All /api/* requests go through this catch-all. Strips /api prefix before passing to Hono.

import { app as apiApp } from '../../../../api/src/index'
import type { APIRoute } from 'astro'

export const prerender = false

export const ALL: APIRoute = async ({ request }) => {
  // Strip /api prefix from URL so Hono routes match (/api/health -> /health)
  const url = new URL(request.url)
  const newPath = url.pathname.replace(/^\/api/, '') || '/'
  const newUrl = new URL(newPath, url.origin)
  const newRequest = new Request(newUrl, request)

  // ponytail: Astro doesn't pass env bindings like CF Workers. process.env works on Vercel.
  return apiApp.fetch(newRequest, process.env as Record<string, string>)
}

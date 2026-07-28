import type { APIRoute } from 'astro'

export const prerender = true

const PATHS = [
  '/',
  '/dashboard',
  '/market',
  '/docs',
  '/signup',
  '/leaderboard',
  '/legal/privacy',
  '/legal/terms',
  '/legal/security',
]

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.href ?? 'https://atlas-nine-ashy.vercel.app').replace(/\/$/, '')
  const urls = PATHS.map(
    (p) => `  <url><loc>${origin}${p === '/' ? '/' : p}</loc><changefreq>weekly</changefreq></url>`,
  ).join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

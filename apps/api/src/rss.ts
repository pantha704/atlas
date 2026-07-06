// RSS feed — per-user, token-authenticated. ponytail: generate on-demand, no KV cache.
// Fetches recent digests from DB, renders as RSS 2.0 XML.

import { renderDigestMarkdown } from '@atlas/core'
import type { DB } from '@atlas/db'
import { digests, profiles } from '@atlas/db'
import { desc, eq } from 'drizzle-orm'

export async function handleRssFeed(token: string, db: DB, siteUrl: string): Promise<Response> {
  const rows = await db
    .select({ userId: profiles.userId, deliveryPrefs: profiles.deliveryPrefs })
    .from(profiles)
    .where(eq(profiles.rssToken, token))
    .limit(1)
  const profile = rows[0]
  if (!profile) return new Response('Not found', { status: 404 })

  const prefs = parsePrefs(profile.deliveryPrefs)
  if (!prefs.rss) return new Response('RSS not enabled', { status: 403 })

  const recent = await db
    .select()
    .from(digests)
    .where(eq(digests.userId, profile.userId))
    .orderBy(desc(digests.date))
    .limit(10)

  const items = recent.map((d) => {
    const html = d.renderedMd ? renderDigestMarkdown(d.renderedMd) : ''
    const link = `${siteUrl}/share/${d.id}`
    return `    <item>
      <title>Atlas Daily — ${d.date}</title>
      <link>${link}</link>
      <guid isPermaLink="false">atlas-digest-${d.date}</guid>
      <pubDate>${new Date(`${d.date}T06:00:00Z`).toUTCString()}</pubDate>
      <description><![CDATA[${html}]]></description>
    </item>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Atlas — Your Daily Digest</title>
    <link>${siteUrl}</link>
    <description>Personal tech news curated by Atlas</description>
    <language>en</language>
    <atom:link href="${siteUrl}/rss/${token}.xml" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}

function parsePrefs(json: string | null): { email?: boolean; rss?: boolean; webhookUrl?: string } {
  if (!json) return {}
  try {
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return {}
  }
}

// RSS scraper — TS port of code/src/scrapers/rss.py.
// Uses fast-xml-parser (works in CF Workers, no DOMParser available).
// Parses RSS 2.0 + Atom 1.0; extracts title/link/content/date per entry.

import { XMLParser } from 'fast-xml-parser'
import type { ContentItem, RSSSourceConfig } from '../types'
import { makeItem } from '../types'
import { parseDate, shortHash } from '../util'
import { type Scraper, fetchText } from './base'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  trimValues: true,
  parseAttributeValue: false,
  parseTagValue: false,
  textNodeName: '#text',
})

interface FeedEntry {
  title?: string
  link?: string | { '@_href': string }
  id?: string
  guid?: string
  pubDate?: string
  published?: string
  updated?: string
  created?: string
  summary?: string
  description?: string
  content?: string | { '#text': string } | Array<{ '#text': string }>
  author?: string | { name?: string }
  'dc:creator'?: string
  category?: string | string[] | Array<{ '@_term': string }>
}

export class RSSScraper implements Scraper {
  readonly sourceType = 'rss' as const
  constructor(private sources: RSSSourceConfig[]) {}

  async fetch(since: Date): Promise<ContentItem[]> {
    const allItems: ContentItem[] = []
    for (const source of this.sources) {
      if (!source.enabled) continue
      const items = await this.fetchFeed(source, since)
      allItems.push(...items)
    }
    return allItems
  }

  private async fetchFeed(source: RSSSourceConfig, since: Date): Promise<ContentItem[]> {
    // Expand ${VAR} in URL from env (matches Python behavior)
    const feedUrl = source.url.replace(/\$\{(\w+)\}/g, (_, name) => {
      const v = process.env[name]
      return v ?? `$\{${name}\}`
    })

    const text = await fetchText(feedUrl, { redirect: 'follow' })
    if (!text) return []

    try {
      const doc = parser.parse(text) as Record<string, unknown>
      // RSS 2.0: rss.channel.item[]; Atom: feed.entry[]
      const root = doc.rss ? (doc.rss as Record<string, unknown>) : doc.feed ? doc : null
      if (!root) return []

      let entries: FeedEntry[] = []
      if (doc.rss) {
        const channel = (doc.rss as Record<string, unknown>).channel as Record<string, unknown>
        const raw = channel?.item
        entries = Array.isArray(raw) ? (raw as FeedEntry[]) : raw ? [raw as FeedEntry] : []
      } else if (doc.feed) {
        const raw = (doc.feed as Record<string, unknown>).entry
        entries = Array.isArray(raw) ? (raw as FeedEntry[]) : raw ? [raw as FeedEntry] : []
      }

      const items: ContentItem[] = []
      const feedId = source.url.split('//')[1]?.replace(/\//g, '_') ?? source.name
      for (const entry of entries) {
        const publishedAt = parseEntryDate(entry)
        if (!publishedAt) continue
        if (new Date(publishedAt) < since) continue

        const entryId = entry.id ?? entry.guid ?? entry.link ?? ''
        const entryHash = await shortHash(String(entryId))
        const link = extractLink(entry) ?? source.url
        const content = extractContent(entry)
        const author = extractAuthor(entry) ?? source.name
        const tags = extractCategories(entry)

        items.push(
          makeItem({
            sourceType: 'rss',
            subtype: feedId,
            nativeId: entryHash,
            title: entry.title ?? 'Untitled',
            url: link,
            content,
            author,
            publishedAt,
            metadata: {
              feedName: source.name,
              category: source.category ?? null,
              tags,
            },
          }),
        )
      }
      return items
    } catch {
      // Parse failure for one feed must not kill the run
      return []
    }
  }
}

function parseEntryDate(entry: FeedEntry): string | null {
  for (const field of ['published', 'updated', 'created', 'pubDate'] as const) {
    const v = entry[field]
    if (typeof v === 'string') {
      const parsed = parseDate(v)
      if (parsed) return parsed
    }
  }
  return null
}

function extractLink(entry: FeedEntry): string | null {
  if (typeof entry.link === 'string') return entry.link
  if (entry.link && typeof entry.link === 'object' && entry.link['@_href']) {
    return entry.link['@_href']
  }
  return null
}

function extractContent(entry: FeedEntry): string {
  if (typeof entry.summary === 'string') return entry.summary
  if (typeof entry.description === 'string') return entry.description
  if (entry.content) {
    if (typeof entry.content === 'string') return entry.content
    if (typeof entry.content === 'object' && '#text' in entry.content) {
      return String(entry.content['#text'])
    }
    if (Array.isArray(entry.content)) {
      return entry.content.map((c) => c['#text'] ?? '').join('\n')
    }
  }
  return ''
}

function extractAuthor(entry: FeedEntry): string | null {
  if (typeof entry.author === 'string') return entry.author
  if (entry.author && typeof entry.author === 'object' && entry.author.name) {
    return entry.author.name
  }
  if (typeof entry['dc:creator'] === 'string') return entry['dc:creator']
  return null
}

function extractCategories(entry: FeedEntry): string[] {
  const out: string[] = []
  const c = entry.category
  if (typeof c === 'string') out.push(c)
  else if (Array.isArray(c)) {
    for (const item of c) {
      if (typeof item === 'string') out.push(item)
      else if (item && typeof item === 'object' && '@_term' in item)
        out.push(String(item['@_term']))
    }
  }
  return out
}

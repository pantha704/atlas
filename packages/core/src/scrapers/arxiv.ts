// arXiv scraper — NEW for Atlas. Free API: http://export.arxiv.org/api/query
// Atom 1.0 feed. Filters by category (e.g. cs.AI, cs.LG, stat.ML), sorts by submitted date desc.
// Core to the ML practitioner persona — adds research papers the original repo lacked.

import { XMLParser } from 'fast-xml-parser'
import type { ArxivConfig, ContentItem } from '../types'
import { makeItem } from '../types'
import { parseDate, shortHash } from '../util'
import { type Scraper, fetchText } from './base'

const ARXIV_API = 'http://export.arxiv.org/api/query'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  parseAttributeValue: false,
  parseTagValue: false,
  textNodeName: '#text',
})

interface ArxivEntry {
  id: string // e.g. "http://arxiv.org/abs/2401.00001v1"
  title?: string
  summary?: string
  published?: string
  updated?: string
  author?: Array<{ name?: string }> | { name?: string }
  link?:
    | Array<{ '@_href': string; '@_rel': string; '@_title': string }>
    | {
        '@_href': string
        '@_rel': string
        '@_title': string
      }
  'arxiv:primary_category'?: { '@_term': string }
  category?: Array<{ '@_term': string }> | { '@_term': string }
}

export class ArxivScraper implements Scraper {
  readonly sourceType = 'arxiv' as const
  constructor(private cfg: ArxivConfig) {}

  async fetch(since: Date): Promise<ContentItem[]> {
    if (!this.cfg.enabled) return []

    const items: ContentItem[] = []
    for (const cat of this.cfg.categories) {
      if (!cat.enabled) continue
      const sub = await this.fetchCategory(cat.category, since)
      items.push(...sub)
    }
    return items
  }

  private async fetchCategory(category: string, since: Date): Promise<ContentItem[]> {
    const url = `${ARXIV_API}?search_query=cat:${encodeURIComponent(
      category,
    )}&sortBy=submittedDate&sortOrder=descending&max_results=${this.cfg.maxResults}`

    const text = await fetchText(url, { redirect: 'follow' })
    if (!text) return []

    try {
      const doc = parser.parse(text) as { feed?: { entry?: ArxivEntry | ArxivEntry[] } }
      const raw = doc.feed?.entry
      const entries: ArxivEntry[] = Array.isArray(raw) ? raw : raw ? [raw] : []
      if (!entries.length) return []

      const items: ContentItem[] = []
      for (const entry of entries) {
        const publishedAt = parseDate(entry.published ?? entry.updated)
        if (!publishedAt || new Date(publishedAt) < since) continue

        // arXiv id from URL: "http://arxiv.org/abs/2401.00001v1" → "2401.00001v1"
        const idMatch = entry.id?.match(/\/abs\/([^/]+)$/)
        const arxivId = idMatch?.[1] ?? entry.id ?? ''
        if (!arxivId) continue
        const hash = await shortHash(arxivId)

        const absUrl = entry.id ?? `https://arxiv.org/abs/${arxivId}`
        const title = (entry.title ?? 'Untitled').replace(/\s+/g, ' ').trim()
        const authors = extractAuthors(entry)
        const primaryCat = extractPrimaryCategory(entry)

        items.push(
          makeItem({
            sourceType: 'arxiv',
            subtype: category,
            nativeId: hash,
            title,
            url: absUrl,
            content: (entry.summary ?? '').replace(/\s+/g, ' ').trim(),
            author: authors.join(', ') || null,
            publishedAt,
            metadata: {
              arxivId,
              category,
              primaryCategory: primaryCat,
              authors,
              type: 'paper',
            },
          }),
        )
      }
      return items
    } catch {
      return []
    }
  }
}

function extractAuthors(entry: ArxivEntry): string[] {
  if (!entry.author) return []
  const arr = Array.isArray(entry.author) ? entry.author : [entry.author]
  return arr.map((a) => a.name ?? '').filter(Boolean)
}

function extractPrimaryCategory(entry: ArxivEntry): string | null {
  if (entry['arxiv:primary_category']?.['@_term']) {
    return String(entry['arxiv:primary_category']['@_term'])
  }
  if (entry.category) {
    const arr = Array.isArray(entry.category) ? entry.category : [entry.category]
    if (arr[0]?.['@_term']) return String(arr[0]['@_term'])
  }
  return null
}

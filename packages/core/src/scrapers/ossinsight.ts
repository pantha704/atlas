// OSS Insight scraper — TS port of code/src/scrapers/ossinsight.py.
// Fetches star-gain trending repos from api.ossinsight.io for configured languages.
// Optional keyword filter (case-insensitive) on description/name/collections.

import type { ContentItem, OSSInsightConfig } from '../types'
import { makeItem } from '../types'
import { type Scraper, fetchJson } from './base'

const BASE_URL = 'https://api.ossinsight.io/v1/trends/repos'

interface OSSRow {
  repo_name?: string
  repo_id?: number | string
  stars?: number | string
  forks?: number | string
  pushes?: number | string
  pull_requests?: number | string
  description?: string
  primary_language?: string
  collection_names?: string | string[]
}

interface OSSResponse {
  data?: { rows?: OSSRow[] }
}

export class OSSInsightScraper implements Scraper {
  readonly sourceType = 'ossinsight' as const
  constructor(private cfg: OSSInsightConfig) {}

  async fetch(_since: Date): Promise<ContentItem[]> {
    if (!this.cfg.enabled) return []

    const items: ContentItem[] = []
    const seenIds = new Set<string>()
    const keywordsLower = this.cfg.keywords.map((k) => k.toLowerCase())

    for (const lang of this.cfg.languages) {
      const rows = await this.fetchPeriod(this.cfg.period, lang)
      for (const row of rows) {
        const item = this.rowToItem(row, lang)
        if (!item) continue
        if (seenIds.has(item.id)) continue
        const stars = toInt(row.stars)
        if (this.cfg.minStars && stars < this.cfg.minStars) continue
        if (keywordsLower.length && !matchesKeywords(row, keywordsLower)) continue
        seenIds.add(item.id)
        items.push(item)
      }
    }

    // Sort by stars gained desc, take top maxItems
    items.sort((a, b) => {
      const sa = (a.metadata.starsGained as number) ?? 0
      const sb = (b.metadata.starsGained as number) ?? 0
      return sb - sa
    })
    return items.slice(0, this.cfg.maxItems)
  }

  private async fetchPeriod(period: string, language: string): Promise<OSSRow[]> {
    const params = new URLSearchParams({ period, language })
    const data = await fetchJson<OSSResponse>(
      `${BASE_URL}?${params}`,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'Atlas/0.1' },
      },
      { timeoutMs: 20000 },
    )
    return data?.data?.rows ?? []
  }

  private rowToItem(row: OSSRow, language: string): ContentItem | null {
    const repoName = row.repo_name
    const repoId = row.repo_id
    if (!repoName || repoId == null) return null

    const starsGained = toInt(row.stars)
    const description = (row.description ?? '').trim()
    const primaryLanguage = row.primary_language ?? language

    const title = `${repoName} (+${starsGained}⭐ ${this.cfg.period})`
    const url = `https://github.com/${repoName}`

    const contentLines = [
      `Trending GitHub repo: ${repoName}`,
      `Stars gained (${this.cfg.period}): ${starsGained}`,
      `Forks gained: ${toInt(row.forks)}`,
      `Pushes: ${toInt(row.pushes)}`,
      `Pull requests: ${toInt(row.pull_requests)}`,
      `Language: ${primaryLanguage}`,
    ]
    if (description) {
      contentLines.push('')
      contentLines.push(description)
    }
    if (row.collection_names) {
      contentLines.push('')
      contentLines.push(`OSS Insight collections: ${row.collection_names}`)
    }

    return makeItem({
      sourceType: 'ossinsight',
      subtype: 'trending',
      nativeId: String(repoId),
      title,
      url,
      content: contentLines.join('\n'),
      author: repoName.includes('/') ? repoName.split('/')[0] : null,
      publishedAt: new Date().toISOString(),
      metadata: {
        repo: repoName,
        starsGained,
        forksGained: toInt(row.forks),
        pushes: toInt(row.pushes),
        pullRequests: toInt(row.pull_requests),
        primaryLanguage,
        period: this.cfg.period,
        collectionNames: row.collection_names ?? null,
        description,
      },
    })
  }
}

function toInt(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number.parseInt(v, 10)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function matchesKeywords(row: OSSRow, keywordsLower: string[]): boolean {
  const haystack = [
    (row.description ?? '').toLowerCase(),
    (Array.isArray(row.collection_names)
      ? row.collection_names.join(' ')
      : (row.collection_names ?? '')
    ).toLowerCase(),
    (row.repo_name ?? '').toLowerCase(),
  ].join(' ')
  return keywordsLower.some((kw) => haystack.includes(kw))
}

// Global fetch → per-user score store helpers.
// Items are global (keyed by external_id). Scores are per (item, user).

import type { ContentItem } from './types'

export interface StoredItemRow {
  id: string
  externalId: string
  url: string
  title: string
  author: string | null
  publishedAt: string
  raw: string | null
}

export interface StoredScoreRow {
  id: string
  itemId: string
  userId: string
  score: number
  reason: string
  tags: string | null
  impact: string | null
}

/** Map ContentItem → DB insert shape. Caller supplies id. */
export function contentItemToRow(
  item: ContentItem,
  id: string,
): {
  id: string
  externalId: string
  url: string
  title: string
  author: string | null
  publishedAt: string
  raw: string
} {
  return {
    id,
    externalId: item.id,
    url: item.url,
    title: item.title,
    author: item.author,
    publishedAt: item.publishedAt,
    raw: JSON.stringify({
      content: item.content,
      metadata: item.metadata,
      sourceType: item.sourceType,
      fetchedAt: item.fetchedAt,
    }),
  }
}

/** Rehydrate a ContentItem from a stored row (optionally with score). */
export function rowToContentItem(
  row: StoredItemRow,
  score?: Pick<StoredScoreRow, 'score' | 'reason' | 'tags'> | null,
): ContentItem {
  let content: string | null = null
  let metadata: Record<string, unknown> = {}
  let sourceType: ContentItem['sourceType'] = 'rss'
  let fetchedAt = row.publishedAt
  if (row.raw) {
    try {
      const parsed = JSON.parse(row.raw) as {
        content?: string | null
        metadata?: Record<string, unknown>
        sourceType?: ContentItem['sourceType']
        fetchedAt?: string
      }
      content = parsed.content ?? null
      metadata = parsed.metadata ?? {}
      if (parsed.sourceType) sourceType = parsed.sourceType
      if (parsed.fetchedAt) fetchedAt = parsed.fetchedAt
    } catch {
      // ignore corrupt raw
    }
  }
  let tags: string[] = []
  if (score?.tags) {
    try {
      tags = JSON.parse(score.tags) as string[]
    } catch {
      tags = []
    }
  }
  return {
    id: row.externalId,
    sourceType,
    title: row.title,
    url: row.url,
    content,
    author: row.author,
    publishedAt: row.publishedAt,
    fetchedAt,
    metadata,
    aiScore: score ? score.score : null,
    aiReason: score?.reason ?? null,
    aiSummary: null,
    aiTags: tags,
  }
}

/** Demo seed items for DEMO_MODE — no AI/auth required. */
export function demoItems(): ContentItem[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'demo:hn:1',
      sourceType: 'hackernews',
      title: 'Bun 1.3 ships faster cold starts for edge runtimes',
      url: 'https://example.com/demo/bun',
      content: 'Runtime improvements relevant to Cloudflare Workers and Vercel edge.',
      author: 'demo',
      publishedAt: now,
      fetchedAt: now,
      metadata: { points: 420 },
      aiScore: 9,
      aiReason: 'Directly relevant if you ship on edge JS runtimes.',
      aiSummary: 'Bun 1.3 improves cold start performance for edge deploys.',
      aiTags: ['bun', 'edge', 'javascript'],
    },
    {
      id: 'demo:rss:2',
      sourceType: 'rss',
      title: 'Postgres 18 planner improvements for OLTP',
      url: 'https://example.com/demo/pg',
      content: 'Query planner changes reduce latency for common index scans.',
      author: 'demo',
      publishedAt: now,
      fetchedAt: now,
      metadata: {},
      aiScore: 8,
      aiReason: 'Matters if Postgres is in your stack.',
      aiSummary: 'Postgres 18 ships planner wins for OLTP workloads.',
      aiTags: ['postgres', 'database'],
    },
    {
      id: 'demo:github:3',
      sourceType: 'github',
      title: 'openai/codex — new structured tool-calling examples',
      url: 'https://example.com/demo/codex',
      content: 'Examples for agent tool loops and JSON schema outputs.',
      author: 'openai',
      publishedAt: now,
      fetchedAt: now,
      metadata: { repo: 'openai/codex' },
      aiScore: 7,
      aiReason: 'Useful pattern reference for agent products.',
      aiSummary: 'Codex repo adds structured tool-calling samples.',
      aiTags: ['ai', 'agents', 'tools'],
    },
  ]
}

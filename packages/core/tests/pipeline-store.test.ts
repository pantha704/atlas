import { describe, expect, it } from 'vitest'
import { contentItemToRow, demoItems, rowToContentItem } from '../src/pipeline-store'
import type { ContentItem } from '../src/types'

describe('pipeline-store', () => {
  const item: ContentItem = {
    id: 'hackernews:story:42',
    sourceType: 'hackernews',
    title: 'Hello',
    url: 'https://example.com/a',
    content: 'body',
    author: 'alice',
    publishedAt: '2026-07-01T00:00:00.000Z',
    fetchedAt: '2026-07-01T01:00:00.000Z',
    metadata: { points: 10 },
    aiScore: null,
    aiReason: null,
    aiSummary: null,
    aiTags: [],
  }

  it('round-trips ContentItem via row raw JSON', () => {
    const row = contentItemToRow(item, 'uuid-1')
    expect(row.externalId).toBe(item.id)
    const restored = rowToContentItem({
      id: row.id,
      externalId: row.externalId,
      url: row.url,
      title: row.title,
      author: row.author,
      publishedAt: row.publishedAt,
      raw: row.raw,
    })
    expect(restored.id).toBe(item.id)
    expect(restored.sourceType).toBe('hackernews')
    expect(restored.content).toBe('body')
    expect(restored.metadata).toEqual({ points: 10 })
  })

  it('applies score fields when provided', () => {
    const row = contentItemToRow(item, 'uuid-1')
    const restored = rowToContentItem(
      {
        id: row.id,
        externalId: row.externalId,
        url: row.url,
        title: row.title,
        author: row.author,
        publishedAt: row.publishedAt,
        raw: row.raw,
      },
      { score: 8, reason: 'relevant', tags: '["rust"]' },
    )
    expect(restored.aiScore).toBe(8)
    expect(restored.aiReason).toBe('relevant')
    expect(restored.aiTags).toEqual(['rust'])
  })

  it('demoItems returns scored seed data', () => {
    const demo = demoItems()
    expect(demo.length).toBeGreaterThanOrEqual(3)
    expect(demo.every((d) => d.aiScore !== null)).toBe(true)
  })
})

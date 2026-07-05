import { describe, expect, it } from 'vitest'
import { applyTopicDedup, mergeCrossSourceDuplicates } from '../src/dedup'
import type { ContentItem } from '../src/types'
import { makeItem } from '../src/types'

function item(opts: Partial<ContentItem> & { url: string; id?: string }): ContentItem {
  return {
    id: opts.id ?? `test:${Math.random().toString(36).slice(2)}`,
    sourceType: opts.sourceType ?? 'hackernews',
    title: opts.title ?? 'Test item',
    url: opts.url,
    content: opts.content ?? null,
    author: opts.author ?? 'anon',
    publishedAt: opts.publishedAt ?? new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    metadata: opts.metadata ?? {},
    aiScore: opts.aiScore ?? null,
    aiReason: opts.aiReason ?? null,
    aiSummary: opts.aiSummary ?? null,
    aiTags: opts.aiTags ?? [],
  }
}

describe('mergeCrossSourceDuplicates', () => {
  it('keeps unique items unchanged', () => {
    const a = item({ url: 'https://example.com/a' })
    const b = item({ url: 'https://example.com/b' })
    const out = mergeCrossSourceDuplicates([a, b])
    expect(out).toHaveLength(2)
  })

  it('merges items with same normalized URL', () => {
    const a = item({ url: 'https://example.com/article/', content: 'short' })
    const b = item({
      url: 'http://www.example.com/article',
      content: 'much longer content here with more detail',
    })
    const out = mergeCrossSourceDuplicates([a, b])
    expect(out).toHaveLength(1)
    // Primary = richest content
    expect(out[0]?.content).toContain('much longer content')
  })

  it('normalizes www and trailing slash', () => {
    const a = item({ url: 'https://www.github.com/repo' })
    const b = item({ url: 'https://github.com/repo/' })
    const out = mergeCrossSourceDuplicates([a, b])
    expect(out).toHaveLength(1)
  })

  it('merges metadata from duplicates into primary', () => {
    const a = item({ url: 'https://x.com/y', metadata: { score: 100 } })
    const b = item({ url: 'https://x.com/y', metadata: { descendants: 50 } })
    const out = mergeCrossSourceDuplicates([a, b])
    expect(out).toHaveLength(1)
    expect(out[0]?.metadata.score).toBe(100)
    expect(out[0]?.metadata.descendants).toBe(50)
  })
})

describe('applyTopicDedup', () => {
  it('returns unchanged when no duplicates', () => {
    const items = [item({ url: 'https://a.com' }), item({ url: 'https://b.com' })]
    const out = applyTopicDedup(items, [])
    expect(out).toHaveLength(2)
  })

  it('drops duplicates, keeps primary', () => {
    const items = [
      item({ id: '0', url: 'https://a.com', aiScore: 9, content: 'primary' }),
      item({ id: '1', url: 'https://b.com', aiScore: 7, content: 'dup content' }),
      item({ id: '2', url: 'https://c.com', aiScore: 8 }),
    ]
    // Group [0, 1]: keep 0, drop 1
    const out = applyTopicDedup(items, [[0, 1]])
    expect(out).toHaveLength(2)
    expect(out[0]?.id).toBe('0')
    // Primary should have dup content merged in
    expect(out[0]?.content).toContain('dup content')
  })

  it('ignores invalid indices', () => {
    const items = [item({ url: 'https://a.com' })]
    const out = applyTopicDedup(items, [[0, 99], [-1, 0], [0]])
    expect(out).toHaveLength(1)
  })
})

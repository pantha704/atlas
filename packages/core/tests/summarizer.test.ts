import { describe, expect, it } from 'vitest'
import { DailySummarizer } from '../src/ai/summarizer'
import type { ContentItem } from '../src/types'
import { makeItem } from '../src/types'

function scoredItem(opts: {
  title: string
  url: string
  score: number
  summary?: string
  background?: string
  discussion?: string
  tags?: string[]
  sourceType?: ContentItem['sourceType']
  metadata?: Record<string, unknown>
}): ContentItem {
  const item = makeItem({
    sourceType: opts.sourceType ?? 'hackernews',
    subtype: 'story',
    nativeId: Math.random().toString(36).slice(2),
    title: opts.title,
    url: opts.url,
    content: null,
    author: 'testuser',
    publishedAt: '2026-07-05T12:00:00Z',
    metadata: {
      score: 200,
      descendants: 50,
      discussionUrl: 'https://news.ycombinator.com/item?id=1',
      detailedSummary: opts.summary,
      background: opts.background,
      communityDiscussion: opts.discussion,
      ...opts.metadata,
    },
  })
  item.aiScore = opts.score
  item.aiTags = opts.tags ?? []
  return item
}

describe('DailySummarizer', () => {
  const summarizer = new DailySummarizer()
  const date = '2026-07-05'

  it('generates empty summary when no items', async () => {
    const md = await summarizer.generateSummary([], date, 10, 'en')
    expect(md).toContain('Atlas Daily - 2026-07-05')
    expect(md).toContain('No items met the importance threshold')
  })

  it('generates header with selected count', async () => {
    const items = [
      scoredItem({ title: 'Item A', url: 'https://a.com', score: 9 }),
      scoredItem({ title: 'Item B', url: 'https://b.com', score: 7 }),
    ]
    const md = await summarizer.generateSummary(items, date, 30, 'en')
    expect(md).toContain('From 30 items, 2 important content pieces were selected')
  })

  it('TOC anchors match heading ids', async () => {
    const items = [scoredItem({ title: 'Test', url: 'https://a.com', score: 8 })]
    const md = await summarizer.generateSummary(items, date, 10, 'en')
    // TOC links to #item-1 — markdown link syntax: [title](#item-1)
    expect(md).toMatch(/\(#item-1\)/)
    // Heading has matching id anchor — fixes the broken original
    expect(md).toMatch(/\[\[item:1\]\]|<a id="item-1"><\/a>/)
  })

  it('omits discussion section when empty', async () => {
    const items = [scoredItem({ title: 'Test', url: 'https://a.com', score: 8, discussion: '' })]
    const md = await summarizer.generateSummary(items, date, 10, 'en')
    // No "Discussion:" label when empty — fixes original flaw
    expect(md).not.toContain('**Discussion**:')
  })

  it('includes discussion section when present', async () => {
    const items = [
      scoredItem({
        title: 'Test',
        url: 'https://a.com',
        score: 8,
        discussion: 'Great points raised',
      }),
    ]
    const md = await summarizer.generateSummary(items, date, 10, 'en')
    expect(md).toContain('**Discussion**: Great points raised')
  })

  it('renders tags as code spans', async () => {
    const items = [
      scoredItem({
        title: 'Test',
        url: 'https://a.com',
        score: 8,
        tags: ['rust', 'systems'],
      }),
    ]
    const md = await summarizer.generateSummary(items, date, 10, 'en')
    expect(md).toContain('`#rust`')
    expect(md).toContain('`#systems`')
  })

  it('sanitizes brackets in titles to avoid breaking markdown links', async () => {
    const items = [scoredItem({ title: 'Some [bracketed] title', url: 'https://a.com', score: 8 })]
    const md = await summarizer.generateSummary(items, date, 10, 'en')
    expect(md).toContain('(bracketed)')
    expect(md).not.toContain('[bracketed]')
  })

  it('generates ZH summary with pangu spacing', async () => {
    const items = [
      scoredItem({
        title: 'Rust发布新版本',
        url: 'https://a.com',
        score: 9,
        summary: 'Rust语言发布了1.0版本',
      }),
    ]
    const md = await summarizer.generateSummary(items, date, 10, 'zh')
    expect(md).toContain('Atlas 每日速递')
    // Pangu spacing between CJK and Latin
    expect(md).toContain('Rust 发布新版本')
  })

  it('references render as collapsible details', async () => {
    const items = [
      scoredItem({
        title: 'Test',
        url: 'https://a.com',
        score: 8,
        metadata: {
          sources: [
            { url: 'https://ref1.com', title: 'Ref 1' },
            { url: 'https://ref2.com', title: 'Ref 2' },
          ],
        },
      }),
    ]
    const md = await summarizer.generateSummary(items, date, 10, 'en')
    expect(md).toContain('<details><summary>References</summary>')
    expect(md).toContain('https://ref1.com')
  })
})

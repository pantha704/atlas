import { describe, expect, it } from 'vitest'
import { renderDigestMarkdown, scoreTier } from '../src/util'

describe('scoreTier', () => {
  it('high for >= 9', () => {
    expect(scoreTier(9.5)).toBe('high')
    expect(scoreTier(9)).toBe('high')
  })
  it('good for >= 7', () => {
    expect(scoreTier(7)).toBe('good')
    expect(scoreTier(8.9)).toBe('good')
  })
  it('mid for >= 5', () => {
    expect(scoreTier(5)).toBe('mid')
    expect(scoreTier(6.9)).toBe('mid')
  })
  it('low for < 5', () => {
    expect(scoreTier(4.9)).toBe('low')
    expect(scoreTier(0)).toBe('low')
  })
})

describe('renderDigestMarkdown', () => {
  it('escapes HTML entities', () => {
    const result = renderDigestMarkdown('<script>alert(1)</script>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('renders h1', () => {
    expect(renderDigestMarkdown('# Title')).toContain('<h1>Title</h1>')
  })

  it('renders score badges with correct tier', () => {
    const md = '## [Test Item](https://example.com) ⭐️ 8.5/10'
    const html = renderDigestMarkdown(md)
    expect(html).toContain('data-tier="good"')
    expect(html).toContain('8.5/10')
    expect(html).toContain('href="https://example.com"')
  })

  it('renders TOC entries with score badges', () => {
    const md = '1. [Item Name](#item-5) ⭐️ 9.2/10'
    const html = renderDigestMarkdown(md)
    expect(html).toContain('data-tier="high"')
    expect(html).toContain('#item-5')
  })

  it('renders bold text', () => {
    expect(renderDigestMarkdown('**bold**')).toContain('<strong>bold</strong>')
  })

  it('renders inline code', () => {
    expect(renderDigestMarkdown('`code`')).toContain('<code>code</code>')
  })

  it('renders links', () => {
    expect(renderDigestMarkdown('[text](url)')).toContain('<a href="url">text</a>')
  })

  it('renders hr', () => {
    expect(renderDigestMarkdown('---')).toContain('<hr />')
  })

  it('renders blockquote', () => {
    expect(renderDigestMarkdown('> quote')).toContain('<blockquote>')
  })

  it('restores details/summary tags', () => {
    const md = '<details><summary>Click</summary>Content</details>'
    const html = renderDigestMarkdown(md)
    expect(html).toContain('<details>')
    expect(html).toContain('<summary>Click</summary>')
  })

  it('wraps paragraphs in p tags', () => {
    const html = renderDigestMarkdown('Hello world')
    expect(html).toContain('<p>Hello world</p>')
  })

  it('renders score tier high for 10', () => {
    const md = '## [Perfect](https://x.com) ⭐️ 10/10'
    expect(renderDigestMarkdown(md)).toContain('data-tier="high"')
  })

  it('renders score tier low for 3', () => {
    const md = '## [Low](https://x.com) ⭐️ 3.0/10'
    expect(renderDigestMarkdown(md)).toContain('data-tier="low"')
  })
})

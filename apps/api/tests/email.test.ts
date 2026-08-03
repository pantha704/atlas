import { describe, expect, it } from 'vitest'
import { renderEmailHtml } from '../src/email'

describe('renderEmailHtml', () => {
  it('wraps digest in email-safe HTML with inline styles', () => {
    const html = renderEmailHtml('# Hello\n\nWorld', 'Test Subject')
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('Atlas')
    expect(html).toContain('Test Subject')
    expect(html).toContain('Powered by')
    expect(html).toContain('atlas-nine-ashy.vercel.app')
  })

  it('renders markdown content in email body', () => {
    const md = '# Digest Title\n\nSome **bold** text.'
    const html = renderEmailHtml(md, 'Daily')
    expect(html).toContain('<h1>Digest Title</h1>')
    expect(html).toContain('<strong>bold</strong>')
  })

  it('escapes title in header', () => {
    const html = renderEmailHtml('', '<script>alert(1)</script>')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('includes score badges from digest markdown', () => {
    const md = '## [Item](https://x.com) ⭐️ 9.5/10'
    const html = renderEmailHtml(md, 'Test')
    expect(html).toContain('data-tier="high"')
    expect(html).toContain('9.5/10')
  })

  it('returns valid HTML structure', () => {
    const html = renderEmailHtml('content', 'title')
    expect(html).toContain('<html>')
    expect(html).toContain('</html>')
    expect(html).toContain('<body')
    expect(html).toContain('</body>')
  })
})

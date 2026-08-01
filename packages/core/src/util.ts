// Shared utilities — TS port of code/src/scrapers/base.py + ai/utils.py helpers.

export function generateId(source: string, subtype: string, nativeId: string): string {
  return `${source}:${subtype}:${nativeId}`
}

// Strip HTML tags — used for HN/Reddit comment text (matches Python regex).
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').trim()
}

// Truncate with ellipsis — matches Python behavior.
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 3)}...`
}

// Retry with exponential backoff — TS port of tenacity decorator.
export async function retry<T>(
  fn: () => Promise<T>,
  opts: { maxAttempts?: number; minMs?: number; maxMs?: number } = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 3
  const minMs = opts.minMs ?? 2000
  const maxMs = opts.maxMs ?? 10000
  let lastErr: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt < maxAttempts - 1) {
        const backoff = Math.min(minMs * 2 ** attempt, maxMs)
        await new Promise((r) => setTimeout(r, backoff))
      }
    }
  }
  throw lastErr
}

// Parse HTTP date or ISO date to ISO string (UTC). Returns null on failure.
export function parseDate(input: string | number | Date | undefined | null): string | null {
  if (input == null) return null
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input.toISOString()
  if (typeof input === 'number') {
    // Unix seconds
    const d = new Date(input * 1000)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  const s = input.trim()
  if (!s) return null
  // Try ISO first
  const iso = new Date(s)
  if (!Number.isNaN(iso.getTime())) return iso.toISOString()
  // Try RFC 822 (RSS): "Wed, 02 Jul 2026 12:00:00 GMT"
  const rfc = new Date(s)
  if (!Number.isNaN(rfc.getTime())) return rfc.toISOString()
  return null
}

// Sleep helper for throttling.
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// SHA-256 hex hash, first 16 chars — for RSS entry IDs (matches Python hashlib).
export async function shortHash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const buf = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(buf)
  let hex = ''
  for (const b of bytes) hex += b.toString(16).padStart(2, '0')
  return hex.slice(0, 16)
}

// Pangu spacing — insert spaces between CJK and Latin/number (matches Python _pangu).
export function pangu(text: string): string {
  // CJK to Latin/number boundary
  return text
    .replace(/([\u4e00-\u9fff\u3400-\u4dbf])([A-Za-z0-9])/g, '$1 $2')
    .replace(/([A-Za-z0-9])([\u4e00-\u9fff\u3400-\u4dbf])/g, '$1 $2')
}

// Ponytail-safe JSON parse from LLM response — 5 strategies like Python parse_json_response.
export function parseJsonResponse<T = Record<string, unknown>>(response: string): T | null {
  if (!response) return null
  const trimmed = response.trim()

  // Strategy 1: direct parse
  try {
    return JSON.parse(trimmed) as T
  } catch {
    // continue
  }

  // Strategy 2: extract from ```json ... ``` fence
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T
    } catch {
      // continue
    }
  }

  // Strategy 3: find first { ... last } (greedy)
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T
    } catch {
      // continue
    }
  }

  // Strategy 4: find first [ ... last ] (array)
  const firstBracket = trimmed.indexOf('[')
  const lastBracket = trimmed.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1)) as T
    } catch {
      // continue
    }
  }

  // Strategy 5: strip trailing commas
  const cleaned = trimmed.replace(/,(\s*[}\]])/g, '$1')
  if (cleaned !== trimmed) {
    try {
      return JSON.parse(cleaned) as T
    } catch {
      // continue
    }
  }

  return null
}

// Score tier — maps numeric score to semantic label.
export function scoreTier(score: number): 'high' | 'good' | 'mid' | 'low' {
  if (score >= 9) return 'high'
  if (score >= 7) return 'good'
  if (score >= 5) return 'mid'
  return 'low'
}

// Star glyph used in digests: emoji with optional variation selector U+FE0F
const STAR = '⭐\uFE0F?'

// Render Atlas markdown digest to HTML. Handles score badges, TOC, details, pangu.
export function renderDigestMarkdown(md: string): string {
  // Already-rendered HTML (e.g. re-passed through by mistake) — return as-is
  if (/^\s*<(?:h1|h2|blockquote|div|p|hr)\b/i.test(md) && !md.includes('⭐')) {
    return md
  }

  let html = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Normalize item markers (new [[item:N]] and legacy empty <a id="item-N">)
  html = html
    .replace(/\[\[item:(\d+)\]\]/g, '§§ITEM:$1§§')
    .replace(
      /&lt;a\s+id=(?:&quot;|"|')item-(\d+)(?:&quot;|"|')\s*(?:\/)?&gt;(?:&lt;\/a&gt;)?/gi,
      '§§ITEM:$1§§',
    )

  // Restore intentional embedded markup from the summarizer
  html = html
    .replace(
      /&lt;details&gt;&lt;summary&gt;([\s\S]*?)&lt;\/summary&gt;/g,
      '<details><summary>$1</summary>',
    )
    .replace(/&lt;ul&gt;/g, '<ul>')
    .replace(/&lt;\/ul&gt;/g, '</ul>')
    .replace(/&lt;li&gt;/g, '<li>')
    .replace(/&lt;\/li&gt;/g, '</li>')
    .replace(/&lt;\/details&gt;/g, '</details>')

  // Item headings with score: ## [title](url) ⭐️ N/10  (optional preceding item marker)
  html = html.replace(
    new RegExp(
      `^(?:§§ITEM:(\\d+)§§\\s*)?## \\[([^\\]]+)\\]\\(([^)]+)\\) ${STAR} (\\d+(?:\\.\\d+)?)/10`,
      'gm',
    ),
    (_m, anchorId, title, url, score) => {
      const id = anchorId ? ` id="item-${anchorId}"` : ''
      return `<h2${id}><a href="${url}" rel="noopener noreferrer">${title}</a> <span class="score-badge" data-tier="${scoreTier(Number(score))}">${score}/10</span></h2>`
    },
  )

  // Fold remaining item markers onto the next h2
  html = html.replace(/§§ITEM:(\d+)§§\s*(<h2)(?![^>]*\bid=)/g, '$2 id="item-$1"')
  // Drop leftover markers (never show raw anchors as text)
  html = html.replace(/§§ITEM:\d+§§\s*/g, '')

  // TOC: 1. [title](#item-N) ⭐️ N/10
  html = html.replace(
    new RegExp(
      `^(\\d+)\\. \\[([^\\]]+)\\]\\(#item-(\\d+)\\) ${STAR} (\\d+(?:\\.\\d+)?)/10`,
      'gm',
    ),
    (_m, num, title, id, score) =>
      `<div class="toc-item"><span class="toc-num">${num}.</span> <a href="#item-${id}">${title}</a> <span class="score-badge" data-tier="${scoreTier(Number(score))}">${score}/10</span></div>`,
  )

  // Fallback TOC without markdown links: 1. title ⭐️ N/10
  html = html.replace(
    new RegExp(`^(\\d+)\\. (.+?) ${STAR} (\\d+(?:\\.\\d+)?)/10\\s*$`, 'gm'),
    (_m, num, title, score) =>
      `<div class="toc-item"><span class="toc-num">${num}.</span> <span>${title.trim()}</span> <span class="score-badge" data-tier="${scoreTier(Number(score))}">${score}/10</span></div>`,
  )

  // Fallback plain heading (no link): ## title ⭐️ N/10
  html = html.replace(
    new RegExp(`^## (.+?) ${STAR} (\\d+(?:\\.\\d+)?)/10\\s*$`, 'gm'),
    (_m, title, score) =>
      `<h2>${title.trim()} <span class="score-badge" data-tier="${scoreTier(Number(score))}">${score}/10</span></h2>`,
  )

  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/^---$/gm, '<hr />')
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" rel="noopener noreferrer">$1</a>',
  )

  // Restore list item links that were intentional HTML from summarizer
  html = html.replace(
    /&lt;a href=(?:&quot;|")([^"&]+)(?:&quot;|")&gt;([\s\S]*?)&lt;\/a&gt;/g,
    '<a href="$1" rel="noopener noreferrer">$2</a>',
  )

  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<(h[12]|blockquote|hr|div|details|ul|ol|p)\b/i.test(trimmed)) return trimmed
      if (/^<(?:h[12]|div|hr)\b/i.test(trimmed.split('\n')[0] ?? '')) return trimmed
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')

  // Final safety: never leave escaped empty item anchors as visible text
  html = html.replace(
    /&lt;a\s+id=(?:&quot;|"|')?item-\d+(?:&quot;|"|')?\s*(?:\/)?&gt;(?:&lt;\/a&gt;)?/gi,
    '',
  )

  return html
}

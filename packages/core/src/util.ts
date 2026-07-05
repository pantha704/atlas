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

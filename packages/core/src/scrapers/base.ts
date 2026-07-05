import type { ContentItem, SourceType } from '../types'

// Scraper interface — TS port of code/src/scrapers/base.py BaseScraper.
// All scrapers are async, take a since-cutoff, return ContentItems.
// Fetch is the only required method; the fetch implementation handles its own errors
// and returns [] on failure (graceful degradation — one dead source must not kill the run).

export interface Scraper {
  readonly sourceType: SourceType
  fetch(since: Date): Promise<ContentItem[]>
}

// Shared fetch JSON helper with timeout + graceful error.
export async function fetchJson<T = unknown>(
  url: string,
  init?: RequestInit,
  opts: { timeoutMs?: number } = {},
): Promise<T | null> {
  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 30000)
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchText(
  url: string,
  init?: RequestInit,
  opts: { timeoutMs?: number } = {},
): Promise<string | null> {
  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 30000)
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

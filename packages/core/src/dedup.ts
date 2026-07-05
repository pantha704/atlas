// Cross-source URL dedup — TS port of orchestrator.merge_cross_source_duplicates.
// Keeps the item with the richest content; merges metadata.

import type { ContentItem } from './types'

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    let host = u.hostname
    if (host.startsWith('www.')) host = host.slice(4)
    const path = u.pathname.replace(/\/+$/, '')
    return `${host}${path}`
  } catch {
    // Fallback: simple strip
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')
  }
}

export function mergeCrossSourceDuplicates(items: ContentItem[]): ContentItem[] {
  const groups = new Map<string, ContentItem[]>()
  for (const item of items) {
    const key = normalizeUrl(item.url)
    const arr = groups.get(key) ?? []
    arr.push(item)
    groups.set(key, arr)
  }

  const merged: ContentItem[] = []
  for (const group of groups.values()) {
    if (group.length === 1) {
      const single = group[0]
      if (single) merged.push(single)
      continue
    }
    // Pick richest content as primary
    let primary = group[0] ?? group[1]
    if (!primary) continue
    let primaryLen = primary.content?.length ?? 0
    for (const item of group.slice(1)) {
      if (!item) continue
      const len = item.content?.length ?? 0
      if (len > primaryLen) {
        primary = item
        primaryLen = len
      }
    }
    const allSources = new Set<string>()
    for (const item of group) {
      allSources.add(item.sourceType)
      // Merge metadata (don't overwrite existing)
      for (const [k, v] of Object.entries(item.metadata)) {
        if (!(k in primary.metadata) || !primary.metadata[k]) primary.metadata[k] = v
      }
      // Append content from non-primary
      if (item !== primary && item.content) {
        if (primary.content && !primary.content.includes(item.content)) {
          primary.content = `${primary.content}\n\n--- From ${item.sourceType} ---\n${item.content}`
        } else if (!primary.content) {
          primary.content = item.content
        }
      }
    }
    primary.metadata.mergedSources = [...allSources]
    merged.push(primary)
  }
  return merged
}

// Semantic topic dedup — port of orchestrator.merge_topic_duplicates.
// Items must be sorted by score descending; first item in each group is primary.
// AI call is in ai/analyzer.ts; this is the pure merge logic given duplicate groups.
export function applyTopicDedup(items: ContentItem[], duplicateGroups: number[][]): ContentItem[] {
  if (items.length <= 1 || duplicateGroups.length === 0) return items

  const dropIndices = new Set<number>()
  for (const group of duplicateGroups) {
    if (!Array.isArray(group) || group.length < 2) continue
    const primaryIdx = group[0]
    if (typeof primaryIdx !== 'number' || primaryIdx < 0 || primaryIdx >= items.length) continue
    const primary = items[primaryIdx]
    if (!primary) continue
    for (const dupIdx of group.slice(1)) {
      if (typeof dupIdx !== 'number' || dupIdx < 0 || dupIdx >= items.length) continue
      if (dupIdx === primaryIdx) continue
      const dup = items[dupIdx]
      if (!dup) continue
      if (dup.content) {
        if (!primary.content || !primary.content.includes(dup.content)) {
          primary.content = `${primary.content ?? ''}\n\n--- From ${dup.sourceType} ---\n${dup.content}`
        }
      }
      dropIndices.add(dupIdx)
    }
  }
  return items.filter((_, i) => !dropIndices.has(i))
}

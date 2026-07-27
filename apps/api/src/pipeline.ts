// Global fetch + per-user score helpers used by cron and /my-digest.

import {
  type Config,
  type ContentItem,
  contentItemToRow,
  mergeCrossSourceDuplicates,
  rowToContentItem,
} from '@atlas/core'
import { items, scores } from '@atlas/db'
import { and, eq, gte, inArray } from 'drizzle-orm'
import type { createDB } from '@atlas/db'

type DB = ReturnType<typeof createDB>['db']

/** Upsert fetched items into the global items table (by external_id). */
export async function storeGlobalItems(db: DB, fetched: ContentItem[]): Promise<Map<string, string>> {
  // externalId → db item id
  const idMap = new Map<string, string>()
  for (const item of fetched) {
    const existing = await db
      .select({ id: items.id })
      .from(items)
      .where(eq(items.externalId, item.id))
      .limit(1)
    if (existing[0]) {
      idMap.set(item.id, existing[0].id)
      continue
    }
    const id = crypto.randomUUID()
    const row = contentItemToRow(item, id)
    try {
      await db.insert(items).values(row)
      idMap.set(item.id, id)
    } catch {
      // Race: another request inserted — re-read
      const again = await db
        .select({ id: items.id })
        .from(items)
        .where(eq(items.externalId, item.id))
        .limit(1)
      if (again[0]) idMap.set(item.id, again[0].id)
    }
  }
  return idMap
}

/** Load recent global items (time window). */
export async function loadRecentItems(db: DB, sinceIso: string): Promise<ContentItem[]> {
  const rows = await db
    .select()
    .from(items)
    .where(gte(items.publishedAt, sinceIso))
    .limit(500)
  return rows.map((r) =>
    rowToContentItem({
      id: r.id,
      externalId: r.externalId,
      url: r.url,
      title: r.title,
      author: r.author,
      publishedAt: r.publishedAt,
      raw: r.raw,
    }),
  )
}

/** Existing scores for a user keyed by item external_id. */
export async function loadUserScoreMap(
  db: DB,
  userId: string,
  externalIds: string[],
): Promise<
  Map<
    string,
    {
      dbItemId: string
      scoreId: string
      score: number
      reason: string
      tags: string | null
      impact: string | null
    }
  >
> {
  const map = new Map<
    string,
    {
      dbItemId: string
      scoreId: string
      score: number
      reason: string
      tags: string | null
      impact: string | null
    }
  >()
  if (externalIds.length === 0) return map

  // Resolve external ids → item rows
  const itemRows = await db
    .select()
    .from(items)
    .where(inArray(items.externalId, externalIds))
  if (itemRows.length === 0) return map

  const itemIdToExternal = new Map(itemRows.map((r) => [r.id, r.externalId]))
  const dbItemIds = itemRows.map((r) => r.id)

  const scoreRows = await db
    .select()
    .from(scores)
    .where(and(eq(scores.userId, userId), inArray(scores.itemId, dbItemIds)))

  for (const s of scoreRows) {
    const ext = itemIdToExternal.get(s.itemId)
    if (!ext) continue
    map.set(ext, {
      dbItemId: s.itemId,
      scoreId: s.id,
      score: s.score,
      reason: s.reason,
      tags: s.tags,
      impact: s.impact,
    })
  }
  return map
}

/** Insert score if missing; update impact if provided and currently null. */
export async function upsertUserScore(
  db: DB,
  opts: {
    dbItemId: string
    userId: string
    score: number
    reason: string
    tags: string[]
    impact?: unknown | null
  },
): Promise<void> {
  const existing = await db
    .select()
    .from(scores)
    .where(and(eq(scores.itemId, opts.dbItemId), eq(scores.userId, opts.userId)))
    .limit(1)
  if (existing[0]) {
    if (opts.impact != null && !existing[0].impact) {
      await db
        .update(scores)
        .set({ impact: JSON.stringify(opts.impact) })
        .where(eq(scores.id, existing[0].id))
    }
    return
  }
  await db.insert(scores).values({
    id: crypto.randomUUID(),
    itemId: opts.dbItemId,
    userId: opts.userId,
    score: opts.score,
    reason: opts.reason,
    tags: JSON.stringify(opts.tags),
    impact: opts.impact != null ? JSON.stringify(opts.impact) : null,
  })
}

/** Merge live fetch with already-stored global items, URL-deduped. */
export function mergeFetchedWithStored(
  live: ContentItem[],
  stored: ContentItem[],
): ContentItem[] {
  return mergeCrossSourceDuplicates([...live, ...stored])
}

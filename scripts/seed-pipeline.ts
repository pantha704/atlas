/**
 * One-shot: run global pipeline and persist items + public digest to Turso.
 * Usage (from repo root):
 *   set -a && source <(grep -v '^#' apps/api/.dev.vars | sed 's/^/export /') && set +a
 *   bun run scripts/seed-pipeline.ts
 */
import { Orchestrator, createAIClient, DEFAULT_CONFIG } from '@atlas/core'
import { createDB, digests } from '@atlas/db'
import { and, eq } from 'drizzle-orm'
import { storeGlobalItems } from '../apps/api/src/pipeline'

const PUBLIC_DIGEST_USER = '__public__'

async function main() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) throw new Error('TURSO_DATABASE_URL + TURSO_AUTH_TOKEN required')
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY required')

  const { db } = createDB({ url, authToken })

  // Ensure public user for digests FK
  try {
    await db.insert(digests).values({
      id: 'noop',
      userId: PUBLIC_DIGEST_USER,
      date: '1970-01-01',
      items: '[]',
      renderedMd: null,
    })
  } catch {
    // ignore — we only care that FK parent may be missing; insert user via raw below
  }

  // raw ensure user via createDB client
  // createDB returns db; use insert on users through schema if available
  const { users } = await import('@atlas/db')
  try {
    await db.insert(users).values({
      id: PUBLIC_DIGEST_USER,
      email: 'public@atlas.local',
      name: 'Public Digest',
      plan: 'free',
    })
    console.log('created __public__ user')
  } catch {
    console.log('__public__ user exists')
  }

  // clean accidental noop digest
  try {
    await db.delete(digests).where(eq(digests.id, 'noop'))
  } catch {
    /* */
  }

  const config = {
    ...DEFAULT_CONFIG,
    ai: {
      ...DEFAULT_CONFIG.ai,
      apiKeyValue: process.env.GROQ_API_KEY,
      geminiApiKeyValue: process.env.GEMINI_API_KEY,
    },
  }

  console.log('pipeline starting…')
  const orch = new Orchestrator(config, createAIClient(config.ai))
  const result = await orch.run()
  console.log('items', result.items.length, 'digests', result.digests.length)

  const idMap = await storeGlobalItems(db as never, result.items)
  console.log('stored items', idMap.size)

  const en = result.digests.find((d) => d.lang === 'en')
  if (en?.markdown) {
    const today = new Date().toISOString().slice(0, 10)
    const existing = await db
      .select()
      .from(digests)
      .where(and(eq(digests.userId, PUBLIC_DIGEST_USER), eq(digests.date, today)))
      .limit(1)
    const itemsJson = JSON.stringify(
      result.items.slice(0, 50).map((i) => ({ id: i.id, title: i.title, score: i.aiScore })),
    )
    if (existing[0]) {
      await db
        .update(digests)
        .set({
          renderedMd: en.markdown,
          items: itemsJson,
          deliveredAt: new Date().toISOString(),
        })
        .where(eq(digests.id, existing[0].id))
      console.log('updated public digest', existing[0].id, 'len', en.markdown.length)
    } else {
      const id = crypto.randomUUID()
      await db.insert(digests).values({
        id,
        userId: PUBLIC_DIGEST_USER,
        date: today,
        items: itemsJson,
        renderedMd: en.markdown,
        deliveredAt: new Date().toISOString(),
      })
      console.log('inserted public digest', id, 'len', en.markdown.length)
    }
  } else {
    console.log('no EN digest produced')
  }
  console.log('done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

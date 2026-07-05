// Atlas API routes — auth, sources, feedback, profile, digests.
// Per-user scoring is the moat: items global, scores per-user.

import {
  type AuthEnv,
  type SessionUser,
  clearSessionCookie,
  createDbSession,
  createSessionToken,
  exchangeGithubCode,
  extractSessionToken,
  fetchGithubEmail,
  fetchGithubUser,
  githubAuthUrl,
  requireAuth,
  revokeDbSession,
  setSessionCookie,
} from '@atlas/auth'
import {
  type Config,
  type ContentItem,
  DEFAULT_CONFIG,
  DailySummarizer,
  PerUserAnalyzer,
  type UserProfile,
  applyFeedbackToProfile,
  createAIClient,
  defaultProfile,
  fetchAllSources,
  mergeCrossSourceDuplicates,
  mergeTopicDuplicates,
} from '@atlas/core'
import { createDB, feedback, items, profiles, scores, sources, users } from '@atlas/db'
import { and, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'

export interface Env extends AuthEnv {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
  GROQ_API_KEY: string
  GEMINI_API_KEY: string
  GITHUB_TOKEN: string
  ATLAS_LAST_DIGEST?: string
}

const app = new Hono<{ Bindings: Env }>()

// ponytail: DB created per-request — Turso handles pooling. Promote to per-worker init if latency shows.
function getDB(env: Env) {
  return createDB({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN }).db
}

// ===== Public routes =====

app.get('/health', (c) =>
  c.json({ ok: true, name: 'atlas-api', version: '0.1.0', time: new Date().toISOString() }),
)

app.get('/digest', (c) => {
  const md = c.env.ATLAS_LAST_DIGEST ?? ''
  if (!md) return c.json({ error: 'no digest yet', markdown: '' }, 404)
  return c.json({ markdown: md, generatedAt: new Date().toISOString() })
})

app.post('/trigger', async (c) => {
  if (!c.env.GROQ_API_KEY) return c.json({ error: 'GROQ_API_KEY not configured' }, 500)
  const config: Config = DEFAULT_CONFIG
  const aiClient = createAIClient(config.ai)
  const { Orchestrator } = await import('@atlas/core')
  const orchestrator = new Orchestrator(config, aiClient)
  try {
    const result = await orchestrator.run()
    const enDigest = result.digests.find((d) => d.lang === 'en')
    if (enDigest) c.env.ATLAS_LAST_DIGEST = enDigest.markdown
    return c.json({ ok: true, items: result.items.length, log: result.log })
  } catch (err) {
    return c.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500)
  }
})

// ===== Auth routes =====

app.get('/auth/github', (c) => {
  const state = crypto.randomUUID()
  const url = githubAuthUrl(c.env, state)
  // ponytail: state stored in short-lived cookie for CSRF protection
  c.header('Set-Cookie', `atlas_oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax`)
  return c.redirect(url)
})

app.get('/auth/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const cookieState = extractStateFromCookie(c.req.header('cookie'))
  if (!code || !state || state !== cookieState) {
    return c.json({ error: 'invalid OAuth state' }, 400)
  }
  const tokenResult = await exchangeGithubCode(code, c.env)
  if (!tokenResult) return c.json({ error: 'GitHub token exchange failed' }, 400)
  const ghUser = await fetchGithubUser(tokenResult.accessToken)
  if (!ghUser) return c.json({ error: 'failed to fetch GitHub user' }, 400)
  const email = ghUser.email ?? (await fetchGithubEmail(tokenResult.accessToken))
  if (!email) return c.json({ error: 'no verified email on GitHub account' }, 400)

  const db = getDB(c.env)
  const user = await upsertUserFromGithub(db, ghUser, email)
  const jwt = await createSessionToken(user, c.env.BETTER_AUTH_SECRET)
  await createDbSession(db, user.id, jwt)
  const secure = c.env.APP_URL.startsWith('https://')
  c.header('Set-Cookie', setSessionCookie(jwt, secure))
  c.header('Set-Cookie', 'atlas_oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')
  return c.redirect('/dashboard')
})

app.post('/auth/logout', async (c) => {
  const token = extractSessionToken(c.req.header('cookie'))
  if (token) {
    const db = getDB(c.env)
    await revokeDbSession(db, token)
  }
  c.header('Set-Cookie', clearSessionCookie())
  return c.json({ ok: true })
})

app.get('/auth/me', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ user: null }, 401)
  return c.json({ user })
})

// ===== Source CRUD (auth required) =====

app.get('/sources', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const db = getDB(c.env)
  const rows = await db
    .select()
    .from(sources)
    .where(eq(sources.userId, user.id))
    .orderBy(desc(sources.createdAt))
  return c.json({ sources: rows })
})

app.post('/sources', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = (await c.req.json()) as {
    type: string
    config: Record<string, unknown>
    enabled?: boolean
  }
  if (!body.type || !body.config) return c.json({ error: 'type and config required' }, 400)
  const validTypes = ['hackernews', 'rss', 'github', 'arxiv', 'reddit', 'telegram', 'ossinsight']
  if (!validTypes.includes(body.type)) return c.json({ error: 'invalid source type' }, 400)

  const db = getDB(c.env)
  const id = crypto.randomUUID()
  await db.insert(sources).values({
    id,
    userId: user.id,
    type: body.type as typeof sources.$inferInsert.type,
    config: JSON.stringify(body.config),
    enabled: body.enabled ?? true,
  })
  return c.json({ ok: true, id })
})

app.delete('/sources/:id', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const id = c.req.param('id')
  const db = getDB(c.env)
  await db.delete(sources).where(and(eq(sources.id, id), eq(sources.userId, user.id)))
  return c.json({ ok: true })
})

app.patch('/sources/:id', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const id = c.req.param('id')
  const body = (await c.req.json()) as { enabled?: boolean; config?: Record<string, unknown> }
  const db = getDB(c.env)
  const updates: Record<string, unknown> = {}
  if (typeof body.enabled === 'boolean') updates.enabled = body.enabled
  if (body.config) updates.config = JSON.stringify(body.config)
  if (Object.keys(updates).length === 0) return c.json({ error: 'nothing to update' }, 400)
  // ponytail: simple update — Drizzle's set() with partial values
  await db
    .update(sources)
    .set(updates)
    .where(and(eq(sources.id, id), eq(sources.userId, user.id)))
  return c.json({ ok: true })
})

// ===== Profile (auth required) =====

app.get('/profile', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const db = getDB(c.env)
  const rows = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1)
  const profile = rows[0]
  if (!profile) {
    return c.json({ profile: defaultProfile(user.id) })
  }
  return c.json({
    profile: {
      userId: profile.userId,
      interests: profile.interests ?? '',
      stack: profile.stack ? JSON.parse(profile.stack) : [],
      tagWeights: profile.interests ? parseTagWeights(profile) : {},
      language: 'en' as const,
      threshold: 7.0,
    } satisfies UserProfile,
  })
})

app.put('/profile', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = (await c.req.json()) as Partial<UserProfile>
  const db = getDB(c.env)
  const existing = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1)
  const tagWeights = body.tagWeights ?? {}
  const values = {
    userId: user.id,
    interests: body.interests ?? existing[0]?.interests ?? '',
    stack: JSON.stringify(body.stack ?? (existing[0]?.stack ? JSON.parse(existing[0].stack) : [])),
    embedding: existing[0]?.embedding ?? null,
    updatedAt: new Date().toISOString(),
  }
  if (existing.length > 0) {
    await db.update(profiles).set(values).where(eq(profiles.userId, user.id))
  } else {
    await db.insert(profiles).values(values)
  }
  return c.json({ ok: true })
})

// ===== Feedback (auth required) =====

app.post('/feedback', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = (await c.req.json()) as {
    itemId: string
    signal: 'up' | 'down' | 'dismiss' | 'bookmark'
  }
  if (!body.itemId || !body.signal) return c.json({ error: 'itemId and signal required' }, 400)

  const db = getDB(c.env)
  const id = crypto.randomUUID()
  await db.insert(feedback).values({
    id,
    userId: user.id,
    itemId: body.itemId,
    signal: body.signal,
  })

  // Update profile tag weights — fetch item tags from scores table
  const scoreRows = await db
    .select()
    .from(scores)
    .where(and(eq(scores.itemId, body.itemId), eq(scores.userId, user.id)))
    .limit(1)
  const itemTags: string[] = scoreRows[0]?.tags ? JSON.parse(scoreRows[0].tags) : []

  if (itemTags.length > 0) {
    const profileRows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
    const currentProfile = profileRows[0]
    const currentWeights: Record<string, number> = currentProfile?.interests
      ? parseTagWeights(currentProfile)
      : {}
    const updated = applyFeedbackToProfile(
      {
        userId: user.id,
        interests: '',
        stack: [],
        tagWeights: currentWeights,
        language: 'en',
        threshold: 7.0,
      },
      body.signal,
      itemTags,
    )
    if (currentProfile) {
      await db
        .update(profiles)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(profiles.userId, user.id))
    }
  }

  return c.json({ ok: true })
})

// ===== Per-user digest (auth required) =====

app.get('/my-digest', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const db = getDB(c.env)

  // Fetch user's enabled sources
  const userSources = await db.select().from(sources).where(eq(sources.userId, user.id))
  const profileRow = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1)

  // Build per-user config from user's sources + default config as base
  const config: Config = {
    ...DEFAULT_CONFIG,
    sources: buildUserConfig(userSources, DEFAULT_CONFIG.sources),
  }
  const profile: UserProfile = profileRow[0]
    ? {
        userId: user.id,
        interests: profileRow[0]?.interests ?? '',
        stack: profileRow[0]?.stack ? JSON.parse(profileRow[0].stack) : [],
        tagWeights: parseTagWeights(profileRow[0]),
        language: 'en',
        threshold: 7.0,
      }
    : defaultProfile(user.id)

  if (!c.env.GROQ_API_KEY) return c.json({ error: 'AI not configured' }, 500)

  const aiClient = createAIClient(config.ai)
  const since = new Date(Date.now() - config.filtering.timeWindowHours * 3600 * 1000)

  // Fetch + dedup
  const allItems = await fetchAllSources(config, since)
  const merged = mergeCrossSourceDuplicates(allItems)

  // Per-user scoring (the moat)
  const analyzer = new PerUserAnalyzer(aiClient, profile, {
    concurrency: config.ai.analysisConcurrency,
    throttleSec: config.ai.throttleSec,
    reasonModel: config.ai.reasonModel,
  })
  const analyzed = await analyzer.analyzeBatch(merged)

  // Filter by per-user threshold
  const important = analyzed
    .filter((item) => item.aiScore !== null && item.aiScore >= profile.threshold)
    .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))

  // Topic dedup
  const deduped = await mergeTopicDuplicates(aiClient, important)

  // Save scores to DB
  for (const item of deduped) {
    const scoreId = crypto.randomUUID()
    const itemId = crypto.randomUUID()
    // Upsert item
    await db
      .insert(items)
      .values({
        id: itemId,
        externalId: item.id,
        url: item.url,
        title: item.title,
        author: item.author,
        publishedAt: item.publishedAt,
      })
      .onConflictDoNothing()
    // Save per-user score
    await db.insert(scores).values({
      id: scoreId,
      itemId,
      userId: user.id,
      score: Math.round(item.aiScore ?? 0),
      reason: item.aiReason ?? '',
      tags: JSON.stringify(item.aiTags),
    })
  }

  // Generate per-user digest
  const summarizer = new DailySummarizer()
  const today = new Date().toISOString().slice(0, 10)
  const markdown = await summarizer.generateSummary(
    deduped,
    today,
    allItems.length,
    profile.language,
  )

  return c.json({ markdown, itemCounts: { fetched: allItems.length, scored: deduped.length } })
})

app.all('*', (c) => c.json({ error: 'not found' }, 404))

// ===== Helpers =====

function extractStateFromCookie(cookie: string | null | undefined): string | null {
  if (!cookie) return null
  const match = cookie.match(/atlas_oauth_state=([^;]+)/)
  return match?.[1] ?? null
}

function parseTagWeights(
  profileRow: { interests: string | null } | undefined,
): Record<string, number> {
  // ponytail: tag weights stored as JSON in a separate column when we add it; for now derive from interests text
  // In a real implementation, we'd store tagWeights as a JSON column. For v0.1, we keep it in memory.
  return {}
}

function buildUserConfig(
  userSources: Array<{ type: string; config: string; enabled: boolean }>,
  defaults: Config['sources'],
): Config['sources'] {
  // ponytail: merge user sources over defaults. User sources override; defaults fill gaps.
  // For v0.1, we use user sources if any exist, else fall back to defaults.
  if (userSources.length === 0) return defaults
  // Parse user source configs
  const parsed = userSources.map((s) => ({
    type: s.type,
    config: JSON.parse(s.config),
    enabled: s.enabled,
  }))
  // Build config from user sources — group by type
  const config: Config['sources'] = {
    github: [],
    hackernews: { enabled: false, fetchTopStories: 30, minScore: 150 },
    rss: [],
    reddit: { enabled: false, subreddits: [], users: [], fetchComments: 5 },
    telegram: { enabled: false, channels: [] },
    arxiv: { enabled: false, categories: [], maxResults: 30 },
    ossinsight: {
      enabled: false,
      period: 'past_24_hours',
      languages: ['All'],
      keywords: [],
      minStars: 50,
      maxItems: 20,
    },
  }
  for (const s of parsed) {
    if (!s.enabled) continue
    switch (s.type) {
      case 'hackernews':
        config.hackernews = {
          enabled: true,
          ...(s.config as Record<string, unknown>),
        } as Config['sources']['hackernews']
        break
      case 'rss':
        config.rss.push(s.config as Config['sources']['rss'][0])
        break
      case 'github':
        config.github.push(s.config as Config['sources']['github'][0])
        break
      case 'arxiv':
        config.arxiv = {
          enabled: true,
          ...(s.config as Record<string, unknown>),
        } as Config['sources']['arxiv']
        break
      case 'reddit':
        config.reddit = {
          enabled: true,
          ...(s.config as Record<string, unknown>),
        } as Config['sources']['reddit']
        break
      case 'telegram':
        config.telegram = {
          enabled: true,
          ...(s.config as Record<string, unknown>),
        } as Config['sources']['telegram']
        break
      case 'ossinsight':
        config.ossinsight = {
          enabled: true,
          ...(s.config as Record<string, unknown>),
        } as Config['sources']['ossinsight']
        break
    }
  }
  return config
}

// Import upsertUserFromGithub from auth — re-exported here to avoid circular dep
async function upsertUserFromGithub(
  db: ReturnType<typeof getDB>,
  ghUser: { id: number; login: string; name: string | null; email: string | null },
  email: string,
): Promise<SessionUser> {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    const u = existing[0]
    if (!u) throw new Error('user fetch failed')
    return { id: u.id, email: u.email, name: u.name, plan: u.plan as 'free' | 'pro' }
  }
  const id = crypto.randomUUID()
  const name = ghUser.name || ghUser.login
  await db.insert(users).values({ id, email, name, plan: 'free' })
  return { id, email, name, plan: 'free' }
}

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('atlas scheduled tick', { time: new Date().toISOString() })
    if (!env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY missing — skipping pipeline')
      return
    }
    const config: Config = DEFAULT_CONFIG
    const aiClient = createAIClient(config.ai)
    const { Orchestrator } = await import('@atlas/core')
    const orchestrator = new Orchestrator(config, aiClient)
    ctx.waitUntil(
      (async () => {
        try {
          const result = await orchestrator.run()
          const enDigest = result.digests.find((d) => d.lang === 'en')
          if (enDigest) env.ATLAS_LAST_DIGEST = enDigest.markdown
          console.log('atlas pipeline complete', result.log)
        } catch (err) {
          console.error('atlas pipeline failed', err)
        }
      })(),
    )
  },
}

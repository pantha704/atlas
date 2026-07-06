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
  ImpactReasoner,
  PerUserAnalyzer,
  type UserProfile,
  applyFeedbackToProfile,
  createAIClient,
  defaultProfile,
  fetchAllSources,
  mergeCrossSourceDuplicates,
  mergeTopicDuplicates,
} from '@atlas/core'
import {
  contributions,
  createDB,
  deliveries,
  digests,
  feedback,
  items,
  profiles,
  publicSources,
  referrals,
  scores,
  shares,
  sources,
  teamMembers,
  teams,
  users,
} from '@atlas/db'
import { and, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { sendDigestEmail } from './email'
import { handleRssFeed } from './rss'
import { sendWebhook } from './webhook'

export interface Env extends AuthEnv {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
  GROQ_API_KEY: string
  GEMINI_API_KEY: string
  GITHUB_TOKEN: string
  ATLAS_LAST_DIGEST?: string
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
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

app.get('/rss/:token.xml', async (c) => {
  const token = c.req.param('token') as string
  const db = getDB(c.env)
  const siteUrl = (c.env.APP_URL ?? 'https://atlas.pages.dev') as string
  return handleRssFeed(token, db, siteUrl)
})

// v0.7: Sitemap
app.get('/sitemap.xml', async (c) => {
  const db = getDB(c.env)
  const siteUrl = (c.env.APP_URL ?? 'https://atlas.pages.dev') as string
  const marketSources = await db
    .select({ id: publicSources.id, createdAt: publicSources.createdAt })
    .from(publicSources)
    .where(eq(publicSources.status, 'online'))
  const urls: Array<{ loc: string; lastmod?: string; priority: string }> = [
    { loc: siteUrl, priority: '1.0' },
    { loc: `${siteUrl}/dashboard`, priority: '0.8' },
    { loc: `${siteUrl}/market`, priority: '0.8' },
    { loc: `${siteUrl}/docs`, priority: '0.6' },
    ...marketSources.map((s) => ({
      loc: `${siteUrl}/market/source?id=${s.id}`,
      lastmod: s.createdAt,
      priority: '0.5',
    })),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
})

app.get('/digest', (c) => {
  const md = c.env.ATLAS_LAST_DIGEST ?? ''
  if (!md) return c.json({ error: 'no digest yet', markdown: '' }, 404)
  return c.json({ markdown: md, generatedAt: new Date().toISOString() })
})

app.post('/trigger', async (c) => {
  if (!c.env.GROQ_API_KEY) return c.json({ error: 'GROQ_API_KEY not configured' }, 500)
  const config: Config = { ...DEFAULT_CONFIG, ai: buildAIConfig(c.env) }
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

  // v0.7: Record referral if cookie present
  const refCookie = c.req.header('cookie')?.match(/atlas_ref=([^;]+)/)?.[1]
  if (refCookie && refCookie !== user.id) {
    const existing = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredId, user.id))
      .limit(1)
    if (existing.length === 0) {
      await db.insert(referrals).values({
        id: crypto.randomUUID(),
        referrerId: refCookie,
        referredId: user.id,
        reward: '1mo_pro',
      })
    }
    c.header('Set-Cookie', 'atlas_ref=; Path=/; Max-Age=0; SameSite=Lax')
  }

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
  // Generate RSS token if not exists
  if (!profile.rssToken) {
    const token = crypto.randomUUID()
    await db.update(profiles).set({ rssToken: token }).where(eq(profiles.userId, user.id))
    profile.rssToken = token
  }
  return c.json({
    profile: {
      userId: profile.userId,
      interests: profile.interests ?? '',
      stack: profile.stack ? JSON.parse(profile.stack) : [],
      tagWeights: profile.interests ? parseTagWeights(profile) : {},
      language: 'en' as const,
      threshold: 7.0,
      rssToken: profile.rssToken,
      deliveryPrefs: parseDeliveryPrefs(profile.deliveryPrefs),
    },
  })
})

app.put('/profile', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = (await c.req.json()) as Partial<UserProfile> & { deliveryPrefs?: DeliveryPrefs }
  const db = getDB(c.env)
  const existing = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1)
  const tagWeights = body.tagWeights ?? {}
  const values = {
    userId: user.id,
    interests: body.interests ?? existing[0]?.interests ?? '',
    stack: JSON.stringify(body.stack ?? (existing[0]?.stack ? JSON.parse(existing[0].stack) : [])),
    embedding: existing[0]?.embedding ?? null,
    updatedAt: new Date().toISOString(),
    rssToken: existing[0]?.rssToken ?? crypto.randomUUID(),
    deliveryPrefs: body.deliveryPrefs
      ? JSON.stringify(body.deliveryPrefs)
      : (existing[0]?.deliveryPrefs ?? null),
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
    ai: buildAIConfig(c.env),
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

  // v0.3: Impact reasoning on top-3 items — "does this affect YOUR stack?"
  const reasoner = new ImpactReasoner(aiClient, { reasonModel: config.ai.reasonModel })
  const impacts = await reasoner.reasonBatch(deduped, profile, 3)

  // Save scores to DB (with impact for top-3)
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
    // Save per-user score + impact (if available)
    const impact = impacts.get(item.id)
    await db.insert(scores).values({
      id: scoreId,
      itemId,
      userId: user.id,
      score: Math.round(item.aiScore ?? 0),
      reason: item.aiReason ?? '',
      tags: JSON.stringify(item.aiTags),
      impact: impact ? JSON.stringify(impact) : null,
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

  // Save digest to DB
  const digestId = crypto.randomUUID()
  await db.insert(digests).values({
    id: digestId,
    userId: user.id,
    date: today,
    items: JSON.stringify(deduped.map((i) => ({ id: i.id, title: i.title, score: i.aiScore }))),
    renderedMd: markdown,
  })

  // v0.4: Delivery — email + webhook
  const deliveryPrefs = parseDeliveryPrefs(profileRow[0]?.deliveryPrefs)
  const siteUrl = (c.env.APP_URL ?? 'https://atlas.pages.dev') as string
  const subject = `Atlas — Your Daily Digest (${today})`

  if (deliveryPrefs.email && user.email) {
    const emailResult = await sendDigestEmail(user.email, subject, markdown, c.env)
    await db.insert(deliveries).values({
      id: crypto.randomUUID(),
      digestId,
      channel: 'email',
      status: emailResult.ok ? 'sent' : 'failed',
      sentAt: emailResult.ok ? new Date().toISOString() : null,
    })
  }

  if (deliveryPrefs.webhookUrl) {
    const webhookResult = await sendWebhook(deliveryPrefs.webhookUrl, {
      event: 'digest_ready',
      digestUrl: `${siteUrl}/share/${digestId}`,
      date: today,
      itemCount: deduped.length,
      siteUrl,
    })
    await db.insert(deliveries).values({
      id: crypto.randomUUID(),
      digestId,
      channel: 'webhook',
      status: webhookResult.ok ? 'sent' : 'failed',
      sentAt: webhookResult.ok ? new Date().toISOString() : null,
    })
  }

  return c.json({ markdown, itemCounts: { fetched: allItems.length, scored: deduped.length } })
})

// ===== Item detail (auth required) — v0.3 =====

app.get('/items/:id', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const externalId = decodeURIComponent(c.req.param('id'))
  const db = getDB(c.env)
  const itemRows = await db.select().from(items).where(eq(items.externalId, externalId)).limit(1)
  if (itemRows.length === 0) return c.json({ error: 'item not found' }, 404)
  const item = itemRows[0]
  if (!item) return c.json({ error: 'item not found' }, 404)
  const scoreRows = await db
    .select()
    .from(scores)
    .where(and(eq(scores.itemId, item.id), eq(scores.userId, user.id)))
    .limit(1)
  const score = scoreRows[0]
  return c.json({
    item: {
      id: item.externalId,
      title: item.title,
      url: item.url,
      author: item.author,
      publishedAt: item.publishedAt,
    },
    score: score
      ? {
          value: score.score,
          reason: score.reason,
          tags: score.tags ? JSON.parse(score.tags) : [],
          impact: score.impact ? JSON.parse(score.impact) : null,
        }
      : null,
  })
})

// ===== Source market (v0.5) =====

app.get('/market', async (c) => {
  const db = getDB(c.env)
  const type = c.req.query('type')
  const field = c.req.query('field')
  const sort = c.req.query('sort') ?? 'latest'
  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100)
  const offset = Number(c.req.query('offset') ?? 0)

  let rows = await db
    .select()
    .from(publicSources)
    .where(eq(publicSources.status, 'online'))
    .limit(limit)
    .offset(offset)

  if (type) rows = rows.filter((r) => r.type === type)
  if (field) rows = rows.filter((r) => r.fieldTags?.toLowerCase().includes(field.toLowerCase()))

  if (sort === 'users') rows.sort((a, b) => b.userCount - a.userCount)
  else if (sort === 'quality') rows.sort((a, b) => b.avgScore - a.avgScore)
  else if (sort === 'snr') rows.sort((a, b) => b.snr - a.snr)
  else rows.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))

  return c.json({ sources: rows, total: rows.length })
})

app.get('/market/:id', async (c) => {
  const db = getDB(c.env)
  const id = c.req.param('id') as string
  const rows = await db.select().from(publicSources).where(eq(publicSources.id, id)).limit(1)
  if (rows.length === 0) return c.json({ error: 'source not found' }, 404)
  return c.json({ source: rows[0] })
})

app.post('/market', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = (await c.req.json()) as {
    type: string
    config: Record<string, unknown>
    name: string
    bio?: string
    fieldTags?: string
  }
  if (!body.type || !body.config || !body.name) {
    return c.json({ error: 'type, config, name required' }, 400)
  }

  const db = getDB(c.env)
  // ponytail: quality check skipped on submit — score after items fetched.
  // Set status=online by default, degrade to pending if quality check fails later.
  const id = crypto.randomUUID()
  await db.insert(publicSources).values({
    id,
    type: body.type as typeof publicSources.$inferInsert.type,
    configJson: JSON.stringify(body.config),
    name: body.name,
    bio: body.bio ?? null,
    fieldTags: body.fieldTags ?? null,
    contributorId: user.id,
    status: 'online',
  })
  await db.insert(contributions).values({
    id: crypto.randomUUID(),
    sourceId: id,
    userId: user.id,
    action: 'submit',
  })
  return c.json({ ok: true, id })
})

app.post('/market/:id/add', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const publicId = c.req.param('id') as string
  const db = getDB(c.env)

  const rows = await db.select().from(publicSources).where(eq(publicSources.id, publicId)).limit(1)
  const pub = rows[0]
  if (!pub) return c.json({ error: 'source not found' }, 404)

  // Duplicate check — same type + config for this user
  const existing = await db.select().from(sources).where(eq(sources.userId, user.id))
  const isDup = existing.some((s) => s.type === pub.type && s.config === pub.configJson)
  if (isDup) return c.json({ error: 'already added' }, 409)

  const id = crypto.randomUUID()
  await db.insert(sources).values({
    id,
    userId: user.id,
    type: pub.type as typeof sources.$inferInsert.type,
    config: pub.configJson,
    enabled: true,
  })
  // Increment user count
  await db
    .update(publicSources)
    .set({ userCount: pub.userCount + 1 })
    .where(eq(publicSources.id, pub.id))
  return c.json({ ok: true, id })
})

// ===== Teams (v1.1) =====

app.post('/teams', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = (await c.req.json()) as { name?: string }
  if (!body.name) return c.json({ error: 'name required' }, 400)
  const db = getDB(c.env)
  const teamId = crypto.randomUUID()
  await db.insert(teams).values({ id: teamId, name: body.name, creatorId: user.id })
  await db
    .insert(teamMembers)
    .values({ id: crypto.randomUUID(), teamId, userId: user.id, role: 'admin' })
  return c.json({ ok: true, id: teamId })
})

app.get('/teams', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const db = getDB(c.env)
  const memberships = await db.select().from(teamMembers).where(eq(teamMembers.userId, user.id))
  const teamIds = memberships.map((m) => m.teamId)
  if (teamIds.length === 0) return c.json({ teams: [] })
  const allTeams = await db.select().from(teams)
  const userTeams = allTeams.filter((t) => teamIds.includes(t.id))
  return c.json({ teams: userTeams })
})

app.post('/teams/:id/invite', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const teamId = c.req.param('id') as string
  const body = (await c.req.json()) as { userId?: string }
  if (!body.userId) return c.json({ error: 'userId required' }, 400)
  const db = getDB(c.env)
  // Check caller is admin
  const membership = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id)))
    .limit(1)
  if (membership[0]?.role !== 'admin') return c.json({ error: 'admin only' }, 403)
  // Add member
  const existing = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, body.userId)))
    .limit(1)
  if (existing.length > 0) return c.json({ error: 'already a member' }, 409)
  await db
    .insert(teamMembers)
    .values({ id: crypto.randomUUID(), teamId, userId: body.userId, role: 'member' })
  return c.json({ ok: true })
})

// ===== Leaderboard (v1.1) =====

app.get('/leaderboard', async (c) => {
  const db = getDB(c.env)
  const allContributions = await db
    .select()
    .from(contributions)
    .where(eq(contributions.action, 'submit'))
  const allSources = await db.select().from(publicSources)

  // Group by userId
  const byUser = new Map<
    string,
    { sourceCount: number; maxAvgScore: number; maxUserCount: number }
  >()
  for (const contrib of allContributions) {
    const existing = byUser.get(contrib.userId) ?? {
      sourceCount: 0,
      maxAvgScore: 0,
      maxUserCount: 0,
    }
    existing.sourceCount++
    const source = allSources.find((s) => s.id === contrib.sourceId)
    if (source) {
      existing.maxAvgScore = Math.max(existing.maxAvgScore, source.avgScore)
      existing.maxUserCount = Math.max(existing.maxUserCount, source.userCount)
    }
    byUser.set(contrib.userId, existing)
  }

  const leaderboard = [...byUser.entries()]
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.sourceCount - a.sourceCount)
    .slice(0, 50)

  return c.json({ leaderboard })
})

// ===== Badges (v1.1) =====

app.get('/badges/:userId', async (c) => {
  const userId = c.req.param('userId') as string
  const db = getDB(c.env)
  const userContributions = await db
    .select()
    .from(contributions)
    .where(and(eq(contributions.userId, userId), eq(contributions.action, 'submit')))
  const sourceIds = userContributions.map((c) => c.sourceId)
  const userSources =
    sourceIds.length > 0
      ? await db.select().from(publicSources).where(eq(publicSources.contributorId, userId))
      : []

  const { computeBadges } = await import('@atlas/core')
  const badges = computeBadges({
    sourceCount: userSources.length,
    maxAvgScore: Math.max(0, ...userSources.map((s) => s.avgScore)),
    maxUserCount: Math.max(0, ...userSources.map((s) => s.userCount)),
  })
  return c.json({ badges })
})

// ===== Billing (v0.6) — ponytail: stub routes, wire Stripe when ready =====

app.post('/billing/checkout', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  // ponytail: Stripe checkout requires STRIPE_SECRET_KEY + price ID. Return 501 until configured.
  return c.json({ error: 'billing not configured — set STRIPE_SECRET_KEY', status: 501 }, 501)
})

app.post('/billing/webhook', async (c) => {
  // ponytail: Stripe webhook signature verification. Stub until Stripe account set up.
  return c.json({ error: 'billing not configured' }, 501)
})

// ===== Share digest (v0.6) =====

app.post('/share', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = (await c.req.json()) as { digestId?: string }
  const db = getDB(c.env)
  const slug = crypto.randomUUID().slice(0, 8)
  await db.insert(shares).values({
    id: crypto.randomUUID(),
    slug,
    userId: user.id,
    digestId: body.digestId ?? null,
  })
  return c.json({ ok: true, slug, url: `/share/${slug}` })
})

app.get('/share/:slug', async (c) => {
  const slug = c.req.param('slug') as string
  const db = getDB(c.env)
  const rows = await db.select().from(shares).where(eq(shares.slug, slug)).limit(1)
  const share = rows[0]
  if (!share) return c.json({ error: 'not found' }, 404)
  const digest = share.digestId
    ? (await db.select().from(digests).where(eq(digests.id, share.digestId)).limit(1))[0]
    : null
  return c.json({
    share: { slug: share.slug, createdAt: share.createdAt },
    digest: digest ? { date: digest.date, markdown: digest.renderedMd } : null,
  })
})

// ===== Referral tracking (v0.6) =====

app.post('/referral', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = (await c.req.json()) as { referrerId?: string }
  if (!body.referrerId || body.referrerId === user.id) {
    return c.json({ error: 'invalid referrer' }, 400)
  }
  const db = getDB(c.env)
  // Check if already referred
  const existing = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredId, user.id))
    .limit(1)
  if (existing.length > 0) return c.json({ error: 'already referred' }, 409)
  await db.insert(referrals).values({
    id: crypto.randomUUID(),
    referrerId: body.referrerId,
    referredId: user.id,
    reward: '1mo_pro',
  })
  return c.json({ ok: true })
})

app.all('*', (c) => c.json({ error: 'not found' }, 404))

// ===== Helpers =====

// Build AI config with actual key values from worker env (CF Workers has no process.env)
function buildAIConfig(env: Env): Config['ai'] {
  return {
    ...DEFAULT_CONFIG.ai,
    apiKeyValue: env.GROQ_API_KEY,
    geminiApiKeyValue: env.GEMINI_API_KEY,
  }
}

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

interface DeliveryPrefs {
  email?: boolean
  rss?: boolean
  webhookUrl?: string
}

function parseDeliveryPrefs(json: string | null | undefined): DeliveryPrefs {
  if (!json) return {}
  try {
    return JSON.parse(json) as DeliveryPrefs
  } catch {
    return {}
  }
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
    const config: Config = { ...DEFAULT_CONFIG, ai: buildAIConfig(env) }
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

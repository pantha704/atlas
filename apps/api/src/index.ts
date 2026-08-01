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
  type Plan,
  type UserProfile,
  applyFeedbackToProfile,
  canAddSource,
  canUseDelivery,
  createAIClient,
  defaultProfile,
  demoItems,
  fetchAllSources,
  impactTopN,
  mergeCrossSourceDuplicates,
  mergeTopicDuplicates,
  sourceLimitMessage,
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
import { and, count, desc, eq } from 'drizzle-orm'
import { type Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  billingConfigured,
  createCheckoutSession,
  isProDowngradeEvent,
  isProUpgradeEvent,
  plusThirtyDays,
  subscriptionIdFromEvent,
  userIdFromRazorpayEvent,
  verifyRazorpayWebhook,
} from './billing'
import { sendDigestEmail } from './email'
import { reportError, track } from './observability'
import {
  loadRecentItems,
  loadUserScoreMap,
  mergeFetchedWithStored,
  storeGlobalItems,
  upsertUserScore,
} from './pipeline'
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
  WEB_URL?: string // Pages frontend URL for redirects
  // Billing (Razorpay — optional until configured)
  RAZORPAY_KEY_ID?: string
  RAZORPAY_KEY_SECRET?: string
  RAZORPAY_PLAN_ID?: string
  RAZORPAY_AMOUNT_PAISE?: string
  RAZORPAY_WEBHOOK_SECRET?: string
  // Vercel cron / external schedulers
  CRON_SECRET?: string
  DEMO_MODE?: string
  // Observability (optional)
  POSTHOG_KEY?: string
  POSTHOG_HOST?: string
  SENTRY_DSN?: string
}

/** Synthetic user id for the global public digest row in `digests`. */
const PUBLIC_DIGEST_USER = '__public__'

const app = new Hono<{ Bindings: Env }>()

// CORS — allow Pages frontend to make authenticated requests
app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    maxAge: 86400,
  }),
)

// Sentry on unhandled route errors (no-op without SENTRY_DSN)
app.onError((err, c) => {
  console.error('atlas unhandled', err)
  reportError(c.env, err, { path: c.req.path })
  return c.json({ error: 'internal error' }, 500)
})

// ponytail: DB created per-request — Turso handles pooling. Promote to per-worker init if latency shows.
function getDB(env: Env) {
  return createDB({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN }).db
}

// ===== Public routes =====

app.get('/health', (c) =>
  c.json({
    ok: true,
    name: 'atlas-api',
    version: '0.5.0',
    time: new Date().toISOString(),
    demo: c.env.DEMO_MODE === 'true',
    billing: billingConfigured(c.env),
  }),
)

// Demo digest — no auth, seeded data for pitch / empty-state
app.get('/demo/digest', (c) => {
  if (c.env.DEMO_MODE !== 'true' && c.req.query('force') !== '1') {
    // Always allow demo payload for marketing; DEMO_MODE just marks production demo site
  }
  const seeded = demoItems()
  const today = new Date().toISOString().slice(0, 10)
  const summarizer = new DailySummarizer()
  return summarizer.generateSummary(seeded, today, seeded.length, 'en').then((markdown) =>
    c.json({
      markdown,
      items: seeded.map((i) => ({
        id: i.id,
        title: i.title,
        score: i.aiScore,
        reason: i.aiReason,
        tags: i.aiTags,
        url: i.url,
      })),
      demo: true,
    }),
  )
})

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

app.get('/digest', async (c) => {
  // Prefer DB-persisted public digest (serverless env is ephemeral on Vercel)
  try {
    const db = getDB(c.env)
    const today = new Date().toISOString().slice(0, 10)
    const rows = await db
      .select()
      .from(digests)
      .where(and(eq(digests.userId, PUBLIC_DIGEST_USER), eq(digests.date, today)))
      .limit(1)
    if (rows[0]?.renderedMd) {
      return c.json({ markdown: rows[0].renderedMd, generatedAt: rows[0].deliveredAt ?? today, source: 'db' })
    }
    // fallback: latest public digest any day
    const latest = await db
      .select()
      .from(digests)
      .where(eq(digests.userId, PUBLIC_DIGEST_USER))
      .orderBy(desc(digests.date))
      .limit(1)
    if (latest[0]?.renderedMd) {
      return c.json({
        markdown: latest[0].renderedMd,
        generatedAt: latest[0].date,
        source: 'db',
      })
    }
  } catch {
    // fall through to env
  }
  const md = c.env.ATLAS_LAST_DIGEST ?? ''
  if (!md) return c.json({ error: 'no digest yet', markdown: '' }, 404)
  return c.json({ markdown: md, generatedAt: new Date().toISOString(), source: 'env' })
})

app.post('/trigger', async (c) => {
  return runGlobalFetch(c.env).then((result) => {
    if (!result.ok) return c.json(result, 500)
    return c.json(result)
  })
})

// Vercel Cron / external schedulers — Authorization: Bearer $CRON_SECRET
// Vercel Cron uses GET; external tools may POST.
async function handleCronFetch(c: Context<{ Bindings: Env }>) {
  const secret = c.env.CRON_SECRET
  if (secret) {
    const auth = c.req.header('authorization') ?? ''
    // Vercel also sends `x-vercel-cron: 1` on scheduled runs
    const isVercelCron = c.req.header('x-vercel-cron') === '1'
    if (!isVercelCron && auth !== `Bearer ${secret}`) {
      return c.json({ error: 'unauthorized' }, 401)
    }
  }
  const result = await runGlobalFetch(c.env)
  if (!result.ok) return c.json(result, 500)
  return c.json(result)
}
app.get('/cron/fetch', handleCronFetch)
app.post('/cron/fetch', handleCronFetch)

// ===== Auth routes =====

app.get('/auth/github', (c) => {
  const state = crypto.randomUUID()
  const url = githubAuthUrl(c.env, state)
  // ponytail: state stored in short-lived cookie for CSRF protection
  c.header('Set-Cookie', `atlas_oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax`)
  return c.redirect(url)
})

app.get('/auth/callback', handleAuthCallback)
// ponytail: alias for backwards compat — OAuth app might have /api/ prefix
app.get('/api/auth/callback', handleAuthCallback)

async function handleAuthCallback(c: Context) {
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
  const prior = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  const isNew = prior.length === 0
  const user = await upsertUserFromGithub(db, ghUser, email)
  const jwt = await createSessionToken(user, c.env.BETTER_AUTH_SECRET)
  await createDbSession(db, user.id, jwt)
  const secure = c.env.APP_URL.startsWith('https://')
  c.header('Set-Cookie', setSessionCookie(jwt, secure))
  c.header('Set-Cookie', 'atlas_oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')

  // v0.7: Record referral if cookie present
  const refCookie = c.req.header('cookie')?.match(/atlas_ref=([^;]+)/)?.[1]
  if (refCookie && refCookie !== user.id) {
    const existing = await db.select().from(referrals).where(eq(referrals.referredId, user.id)).limit(1)
    if (existing.length === 0) {
      await db.insert(referrals).values({
        id: crypto.randomUUID(),
        referrerId: refCookie,
        referredId: user.id,
        reward: '1mo_pro',
      })
      track(c.env, 'referral_recorded', user.id, { referrerId: refCookie })
    }
    c.header('Set-Cookie', 'atlas_ref=; Path=/; Max-Age=0; SameSite=Lax')
  }

  track(c.env, isNew ? 'user_signed_up' : 'user_signed_in', user.id, {
    plan: user.plan,
    provider: 'github',
  })

  // Redirect to web frontend — same domain on Vercel, or WEB_URL for separate deploy
  const webUrl = c.env.WEB_URL ?? ''
  return c.redirect(`${webUrl}/dashboard`)
}

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
  const plan = user.plan as Plan
  const existing = await db
    .select({ n: count() })
    .from(sources)
    .where(eq(sources.userId, user.id))
  const sourceCount = existing[0]?.n ?? 0
  if (!canAddSource(plan, sourceCount)) {
    return c.json({ error: sourceLimitMessage(plan), code: 'source_limit', limit: 10 }, 403)
  }

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
  const plan = user.plan as Plan
  // Free plan: strip pro-only delivery channels (email/rss/webhook)
  let deliveryPrefs = body.deliveryPrefs
  if (deliveryPrefs && plan === 'free') {
    deliveryPrefs = {
      email: false,
      rss: false,
      webhookUrl: undefined,
    }
  }
  const values = {
    userId: user.id,
    interests: body.interests ?? existing[0]?.interests ?? '',
    stack: JSON.stringify(body.stack ?? (existing[0]?.stack ? JSON.parse(existing[0].stack) : [])),
    embedding: existing[0]?.embedding ?? null,
    updatedAt: new Date().toISOString(),
    rssToken: existing[0]?.rssToken ?? crypto.randomUUID(),
    deliveryPrefs: deliveryPrefs
      ? JSON.stringify(deliveryPrefs)
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
  track(c.env, 'feedback_submitted', user.id, {
    signal: body.signal,
    itemId: body.itemId,
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
// Flow: load global items + user fetch → reuse cached scores → score only missing → impact top-N

app.get('/my-digest', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const db = getDB(c.env)
  const plan = user.plan as Plan
  const force = c.req.query('force') === '1'
  // peek/cached=1: return same-day digest only — never run scoring (safe for SSR)
  const peekOnly = c.req.query('peek') === '1' || c.req.query('cached') === '1'
  const today = new Date().toISOString().slice(0, 10)

  // Serve cached same-day digest unless force=1
  if (!force) {
    const cached = await db
      .select()
      .from(digests)
      .where(and(eq(digests.userId, user.id), eq(digests.date, today)))
      .limit(1)
    if (cached[0]?.renderedMd) {
      return c.json({
        markdown: cached[0].renderedMd,
        itemCounts: { cached: true },
        digestId: cached[0].id,
      })
    }
    if (peekOnly) {
      return c.json({ error: 'no cached digest for today', code: 'no_cache' }, 404)
    }
  }

  const userSources = await db.select().from(sources).where(eq(sources.userId, user.id))
  const profileRow = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1)

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
  const sinceIso = since.toISOString()

  // 1. Global items already fetched by cron + live fetch for user-specific sources
  const stored = await loadRecentItems(db, sinceIso)
  const live = await fetchAllSources(config, since)
  const merged = mergeFetchedWithStored(live, stored)

  // 2. Persist any new live items globally
  const idMap = await storeGlobalItems(db, merged)

  // 3. Load cached scores — only AI-score missing items
  const scoreMap = await loadUserScoreMap(db, user.id, merged.map((i) => i.id))
  const toScore: ContentItem[] = []
  const already: ContentItem[] = []
  for (const item of merged) {
    const cachedScore = scoreMap.get(item.id)
    if (cachedScore) {
      already.push({
        ...item,
        aiScore: cachedScore.score,
        aiReason: cachedScore.reason,
        aiTags: cachedScore.tags ? (JSON.parse(cachedScore.tags) as string[]) : [],
      })
    } else {
      toScore.push(item)
    }
  }

  let newlyScored: ContentItem[] = []
  if (toScore.length > 0) {
    const analyzer = new PerUserAnalyzer(aiClient, profile, {
      concurrency: config.ai.analysisConcurrency,
      throttleSec: config.ai.throttleSec,
      reasonModel: config.ai.reasonModel,
    })
    newlyScored = await analyzer.analyzeBatch(toScore)
    for (const item of newlyScored) {
      let dbItemId = idMap.get(item.id)
      if (!dbItemId) {
        const rows = await db
          .select({ id: items.id })
          .from(items)
          .where(eq(items.externalId, item.id))
          .limit(1)
        dbItemId = rows[0]?.id
      }
      if (!dbItemId || item.aiScore === null) continue
      await upsertUserScore(db, {
        dbItemId,
        userId: user.id,
        score: Math.round(item.aiScore),
        reason: item.aiReason ?? '',
        tags: item.aiTags,
      })
    }
  }

  const analyzed = [...already, ...newlyScored]
  const important = analyzed
    .filter((item) => item.aiScore !== null && item.aiScore >= profile.threshold)
    .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))

  const deduped = await mergeTopicDuplicates(aiClient, important)

  // 4. Impact reasoning — top-N by plan; skip items that already have impact cached
  const topN = impactTopN(plan)
  const needImpact = deduped.slice(0, topN).filter((item) => {
    const s = scoreMap.get(item.id)
    return !s?.impact
  })
  const reasoner = new ImpactReasoner(aiClient, { reasonModel: config.ai.reasonModel })
  const impacts = needImpact.length
    ? await reasoner.reasonBatch(needImpact, profile, topN)
    : new Map()

  for (const item of deduped.slice(0, topN)) {
    const impact = impacts.get(item.id)
    if (!impact) continue
    const dbItemId = idMap.get(item.id) ?? scoreMap.get(item.id)?.dbItemId
    if (!dbItemId) continue
    await upsertUserScore(db, {
      dbItemId,
      userId: user.id,
      score: Math.round(item.aiScore ?? 0),
      reason: item.aiReason ?? '',
      tags: item.aiTags,
      impact,
    })
  }

  // 5. Render + save digest
  const summarizer = new DailySummarizer()
  const markdown = await summarizer.generateSummary(
    deduped,
    today,
    merged.length,
    profile.language,
  )

  const digestId = crypto.randomUUID()
  await db.insert(digests).values({
    id: digestId,
    userId: user.id,
    date: today,
    items: JSON.stringify(deduped.map((i) => ({ id: i.id, title: i.title, score: i.aiScore }))),
    renderedMd: markdown,
  })

  // 6. Delivery — pro only for email/webhook (free = web dashboard)
  const deliveryPrefs = parseDeliveryPrefs(profileRow[0]?.deliveryPrefs)
  const siteUrl = (c.env.WEB_URL ?? c.env.APP_URL ?? 'https://atlas.pages.dev') as string
  const subject = `Atlas — Your Daily Digest (${today})`

  if (deliveryPrefs.email && user.email && canUseDelivery(plan, 'email')) {
    const emailResult = await sendDigestEmail(user.email, subject, markdown, c.env)
    await db.insert(deliveries).values({
      id: crypto.randomUUID(),
      digestId,
      channel: 'email',
      status: emailResult.ok ? 'sent' : 'failed',
      sentAt: emailResult.ok ? new Date().toISOString() : null,
    })
  }

  if (deliveryPrefs.webhookUrl && canUseDelivery(plan, 'webhook')) {
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

  track(c.env, 'digest_ready', user.id, {
    digestId,
    plan,
    itemCount: deduped.length,
    newlyScored: newlyScored.length,
    fromCache: already.length,
    forced: force,
  })

  return c.json({
    markdown,
    digestId,
    itemCounts: {
      fetched: merged.length,
      fromCache: already.length,
      newlyScored: newlyScored.length,
      scored: deduped.length,
    },
    plan,
  })
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
      /** Internal DB id for feedback / scores joins */
      itemId: item.id,
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
  const plan = user.plan as Plan
  if (!canAddSource(plan, existing.length)) {
    return c.json({ error: sourceLimitMessage(plan), code: 'source_limit' }, 403)
  }

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

// ===== Billing (Razorpay) =====

app.post('/billing/checkout', async (c) => {
  const user = await requireAuth(c.req.raw, c.env, getDB(c.env))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  if (!billingConfigured(c.env)) {
    return c.json(
      {
        error:
          'billing not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (optional RAZORPAY_PLAN_ID)',
      },
      501,
    )
  }
  const db = getDB(c.env)
  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
  const row = rows[0]
  const result = await createCheckoutSession(c.env, {
    customerId: row?.stripeCustomerId ?? null,
    customerEmail: user.email,
    customerName: user.name,
    userId: user.id,
  })
  if ('error' in result) {
    const status = result.status === 501 ? 501 : 502
    return c.json({ error: result.error }, status)
  }
  // Persist subscription / payment-link id for cancel reconciliation
  if (result.sessionId) {
    await db
      .update(users)
      .set({ stripeCustomerId: result.sessionId })
      .where(eq(users.id, user.id))
  }
  return c.json({
    ok: true,
    url: result.url,
    sessionId: result.sessionId,
    mode: result.mode,
    keyId: c.env.RAZORPAY_KEY_ID,
  })
})

app.post('/billing/webhook', async (c) => {
  const rawBody = await c.req.text()
  const sig =
    c.req.header('x-razorpay-signature') ?? c.req.header('X-Razorpay-Signature') ?? null
  const verified = await verifyRazorpayWebhook(c.env, rawBody, sig)
  if (!verified.ok) return c.json({ error: verified.error }, 400)

  const event = verified.event
  const db = getDB(c.env)
  const userId = userIdFromRazorpayEvent(event)
  const subId = subscriptionIdFromEvent(event)

  if (userId && isProUpgradeEvent(event.event)) {
    const updates: { plan: 'pro'; stripeCustomerId?: string; trialEndsAt?: string | null } = {
      plan: 'pro',
    }
    if (subId) updates.stripeCustomerId = subId
    // Payment-link one-shots get a 30-day window; subscriptions clear trial
    if (event.event === 'payment_link.paid' || event.event === 'payment.captured') {
      if (!c.env.RAZORPAY_PLAN_ID) {
        updates.trialEndsAt = plusThirtyDays()
      }
    } else {
      updates.trialEndsAt = null
    }
    await db.update(users).set(updates).where(eq(users.id, userId))
    track(c.env, 'plan_upgraded', userId, { plan: 'pro', source: 'razorpay', event: event.event })
  }

  if (userId && isProDowngradeEvent(event.event)) {
    await db.update(users).set({ plan: 'free', trialEndsAt: null }).where(eq(users.id, userId))
    track(c.env, 'plan_downgraded', userId, { plan: 'free', source: 'razorpay', event: event.event })
  } else if (!userId && subId && isProDowngradeEvent(event.event)) {
    await db
      .update(users)
      .set({ plan: 'free', trialEndsAt: null })
      .where(eq(users.stripeCustomerId, subId))
  }

  return c.json({ received: true })
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
    status: 'pending',
  })

  // 3 successful referrals → 1 month pro trial for referrer
  const pending = await db
    .select()
    .from(referrals)
    .where(and(eq(referrals.referrerId, body.referrerId), eq(referrals.status, 'pending')))
  if (pending.length >= 3) {
    const trialEnd = new Date()
    trialEnd.setMonth(trialEnd.getMonth() + 1)
    await db
      .update(users)
      .set({ plan: 'pro', trialEndsAt: trialEnd.toISOString() })
      .where(eq(users.id, body.referrerId))
    for (const r of pending.slice(0, 3)) {
      await db.update(referrals).set({ status: 'credited' }).where(eq(referrals.id, r.id))
    }
  }

  return c.json({ ok: true, referralsTowardReward: Math.min(pending.length, 3) })
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
    // Expire trial if past trialEndsAt
    if (u.plan === 'pro' && u.trialEndsAt && new Date(u.trialEndsAt) < new Date()) {
      await db.update(users).set({ plan: 'free', trialEndsAt: null }).where(eq(users.id, u.id))
      return { id: u.id, email: u.email, name: u.name, plan: 'free' }
    }
    return { id: u.id, email: u.email, name: u.name, plan: u.plan as 'free' | 'pro' }
  }
  const id = crypto.randomUUID()
  const name = ghUser.name || ghUser.login
  await db.insert(users).values({ id, email, name, plan: 'free' })
  return { id, email, name, plan: 'free' }
}

/** Global fetch once: store raw items + public digest. Per-user scoring is on-demand. */
async function runGlobalFetch(env: Env): Promise<{
  ok: boolean
  items?: number
  stored?: number
  log?: unknown
  error?: string
  status?: number
}> {
  if (!env.GROQ_API_KEY) {
    return { ok: false, error: 'GROQ_API_KEY not configured', status: 500 }
  }
  const config: Config = { ...DEFAULT_CONFIG, ai: buildAIConfig(env) }
  const aiClient = createAIClient(config.ai)
  const { Orchestrator } = await import('@atlas/core')
  const orchestrator = new Orchestrator(config, aiClient)
  try {
    const result = await orchestrator.run()
    const enDigest = result.digests.find((d) => d.lang === 'en')
    if (enDigest) env.ATLAS_LAST_DIGEST = enDigest.markdown

    // Store all fetched (pre-filter) items globally for per-user scoring later
    // Orchestrator returns filtered items; re-fetch raw window for storage is heavy —
    // store the scored global set at minimum.
    const db = getDB(env)
    const idMap = await storeGlobalItems(db, result.items)

    // Persist public digest (Vercel/serverless cannot keep ATLAS_LAST_DIGEST across invocations)
    if (enDigest?.markdown) {
      const today = new Date().toISOString().slice(0, 10)
      const existing = await db
        .select({ id: digests.id })
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
            renderedMd: enDigest.markdown,
            items: itemsJson,
            deliveredAt: new Date().toISOString(),
          })
          .where(eq(digests.id, existing[0].id))
      } else {
        await db.insert(digests).values({
          id: crypto.randomUUID(),
          userId: PUBLIC_DIGEST_USER,
          date: today,
          items: itemsJson,
          renderedMd: enDigest.markdown,
          deliveredAt: new Date().toISOString(),
        })
      }
    }

    return {
      ok: true,
      items: result.items.length,
      stored: idMap.size,
      log: result.log,
    }
  } catch (err) {
    reportError(env, err, { path: '/cron/fetch', extra: { stage: 'runGlobalFetch' } })
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      status: 500,
    }
  }
}

export { app }
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('atlas scheduled tick', { time: new Date().toISOString() })
    ctx.waitUntil(
      runGlobalFetch(env).then((r) => {
        if (r.ok) console.log('atlas pipeline complete', r.log)
        else console.error('atlas pipeline failed', r.error)
      }),
    )
  },
}

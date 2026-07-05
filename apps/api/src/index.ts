import {
  type Config,
  DEFAULT_CONFIG,
  DailySummarizer,
  Orchestrator,
  createAIClient,
} from '@atlas/core'
import { Hono } from 'hono'

export interface Env {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
  GROQ_API_KEY: string
  GEMINI_API_KEY: string
  GITHUB_TOKEN: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  BETTER_AUTH_SECRET: string
  // In-memory cache for the latest public digest (ponytail: KV in prod, in-memory for v0.1)
  ATLAS_LAST_DIGEST?: string
}

const app = new Hono<{ Bindings: Env }>()

app.get('/health', (c) =>
  c.json({ ok: true, name: 'atlas-api', version: '0.0.0', time: new Date().toISOString() }),
)

// Public digest endpoint — returns the latest global digest as markdown.
// P2: per-user digests behind auth.
app.get('/digest', (c) => {
  const md = c.env.ATLAS_LAST_DIGEST ?? ''
  if (!md) {
    return c.json({ error: 'no digest yet — pipeline has not run', markdown: '' }, 404)
  }
  return c.json({ markdown: md, generatedAt: new Date().toISOString() })
})

// Manual trigger — P1: open for testing; P2 behind auth + rate limit.
app.post('/trigger', async (c) => {
  const env = c.env
  if (!env.GROQ_API_KEY) {
    return c.json({ error: 'GROQ_API_KEY not configured' }, 500)
  }
  const config: Config = DEFAULT_CONFIG
  const aiClient = createAIClient(config.ai)
  const orchestrator = new Orchestrator(config, aiClient)
  try {
    const result = await orchestrator.run()
    // Cache the EN digest in-memory (ponytail: KV or D1 in prod)
    const enDigest = result.digests.find((d) => d.lang === 'en')
    if (enDigest) {
      // ponytail: in-memory cache lost on worker restart; move to D1/KV when persistence matters
      c.env.ATLAS_LAST_DIGEST = enDigest.markdown
    }
    return c.json({
      ok: true,
      items: result.items.length,
      log: result.log,
    })
  } catch (err) {
    return c.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500)
  }
})

app.all('*', (c) => c.json({ error: 'not found' }, 404))

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

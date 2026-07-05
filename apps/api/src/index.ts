import { Hono } from 'hono'

export interface Env {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
  GROQ_API_KEY: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  BETTER_AUTH_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

app.get('/health', (c) =>
  c.json({ ok: true, name: 'atlas-api', version: '0.0.0', time: new Date().toISOString() }),
)

app.all('*', (c) => c.json({ error: 'not found' }, 404))

// ponytail: cron folded into api worker; pipeline logic lands in P1
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('scheduled tick', { time: new Date().toISOString(), hasKey: !!env.GROQ_API_KEY })
    // P1: fetch sources → score → render → deliver
    ctx.waitUntil(Promise.resolve())
  },
}

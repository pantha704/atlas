// Lightweight PostHog + Sentry via fetch — works on CF Workers and Vercel/Node.
// No SDK deps; no-ops when keys are missing.

export interface ObservabilityEnv {
  POSTHOG_KEY?: string
  POSTHOG_HOST?: string
  SENTRY_DSN?: string
}

/** Fire-and-forget product analytics. Never throws. */
export function track(
  env: ObservabilityEnv,
  event: string,
  distinctId: string,
  properties: Record<string, unknown> = {},
): void {
  void capturePostHog(env, event, distinctId, properties).catch(() => {})
}

/** Fire-and-forget error report. Never throws. */
export function reportError(
  env: ObservabilityEnv,
  error: unknown,
  context: { userId?: string; path?: string; extra?: Record<string, unknown> } = {},
): void {
  void captureSentry(env, error, context).catch(() => {})
}

export async function capturePostHog(
  env: ObservabilityEnv,
  event: string,
  distinctId: string,
  properties: Record<string, unknown> = {},
): Promise<boolean> {
  const key = env.POSTHOG_KEY?.trim()
  if (!key) return false

  const host = (env.POSTHOG_HOST?.trim() || 'https://us.i.posthog.com').replace(/\/$/, '')
  const res = await fetch(`${host}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: key,
      event,
      distinct_id: distinctId,
      properties: {
        ...properties,
        $lib: 'atlas-api',
      },
      timestamp: new Date().toISOString(),
    }),
  })
  return res.ok
}

export async function captureSentry(
  env: ObservabilityEnv,
  error: unknown,
  context: { userId?: string; path?: string; extra?: Record<string, unknown> } = {},
): Promise<boolean> {
  const dsn = env.SENTRY_DSN?.trim()
  if (!dsn) return false

  const parsed = parseSentryDsn(dsn)
  if (!parsed) return false

  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  const type = error instanceof Error ? error.name : 'Error'

  const eventId = crypto.randomUUID().replace(/-/g, '')
  const payload = {
    event_id: eventId,
    timestamp: new Date().toISOString(),
    platform: 'javascript',
    level: 'error',
    server_name: 'atlas-api',
    environment: 'production',
    message,
    exception: {
      values: [
        {
          type,
          value: message,
          stacktrace: stack
            ? {
                frames: stack
                  .split('\n')
                  .slice(1)
                  .map((line) => ({ filename: line.trim(), function: '?' }))
                  .reverse(),
              }
            : undefined,
        },
      ],
    },
    user: context.userId ? { id: context.userId } : undefined,
    tags: context.path ? { path: context.path } : undefined,
    extra: context.extra,
  }

  const url = `${parsed.scheme}://${parsed.host}/api/${parsed.projectId}/store/`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sentry-Auth': [
        'Sentry sentry_version=7',
        `sentry_client=atlas-api/0.5`,
        `sentry_key=${parsed.publicKey}`,
      ].join(', '),
    },
    body: JSON.stringify(payload),
  })
  return res.ok
}

/** Parse `https://<key>@oXXX.ingest.sentry.io/<projectId>` (and variants). */
export function parseSentryDsn(dsn: string): {
  scheme: string
  publicKey: string
  host: string
  projectId: string
} | null {
  try {
    const u = new URL(dsn)
    const projectId = u.pathname.replace(/^\//, '').split('/')[0]
    if (!u.username || !projectId) return null
    return {
      scheme: u.protocol.replace(':', '') || 'https',
      publicKey: u.username,
      host: u.host,
      projectId,
    }
  } catch {
    return null
  }
}

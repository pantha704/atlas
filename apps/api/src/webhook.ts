// Webhook delivery — POST JSON to user's configured URL.
// ponytail: one JSON payload for all platforms. Slack/Discord/generic accept JSON.

export interface WebhookPayload {
  event: 'digest_ready'
  digestUrl: string
  date: string
  itemCount: number
  siteUrl: string
}

export async function sendWebhook(
  url: string,
  payload: WebhookPayload,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { ok: false, status: res.status, error: await res.text().catch(() => '') }
    return { ok: true, status: res.status }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

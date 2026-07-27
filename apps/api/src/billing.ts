// Stripe Checkout + webhook via REST (no SDK — edge-friendly).
// Requires STRIPE_SECRET_KEY + STRIPE_PRICE_ID + STRIPE_WEBHOOK_SECRET.

export interface StripeEnv {
  STRIPE_SECRET_KEY?: string
  STRIPE_PRICE_ID?: string
  STRIPE_WEBHOOK_SECRET?: string
  WEB_URL?: string
  APP_URL?: string
}

export function billingConfigured(env: StripeEnv): boolean {
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_ID)
}

export async function createCheckoutSession(
  env: StripeEnv,
  opts: { customerId?: string | null; customerEmail: string; userId: string },
): Promise<{ url: string; sessionId: string } | { error: string; status: number }> {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
    return { error: 'billing not configured — set STRIPE_SECRET_KEY and STRIPE_PRICE_ID', status: 501 }
  }
  const site = env.WEB_URL ?? env.APP_URL ?? 'https://atlas.pages.dev'
  const body = new URLSearchParams()
  body.set('mode', 'subscription')
  body.set('success_url', `${site}/profile?billing=success`)
  body.set('cancel_url', `${site}/profile?billing=cancel`)
  body.set('line_items[0][price]', env.STRIPE_PRICE_ID)
  body.set('line_items[0][quantity]', '1')
  body.set('client_reference_id', opts.userId)
  body.set('metadata[user_id]', opts.userId)
  if (opts.customerId) {
    body.set('customer', opts.customerId)
  } else {
    body.set('customer_email', opts.customerEmail)
  }

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { error: `Stripe ${res.status}: ${text.slice(0, 200)}`, status: 502 }
  }
  const data = (await res.json()) as { id: string; url: string }
  return { url: data.url, sessionId: data.id }
}

export async function verifyStripeWebhook(
  env: StripeEnv,
  rawBody: string,
  signatureHeader: string | null,
): Promise<{ ok: true; event: StripeEvent } | { ok: false; error: string }> {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return { ok: false, error: 'STRIPE_WEBHOOK_SECRET not set' }
  }
  if (!signatureHeader) return { ok: false, error: 'missing stripe-signature' }

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, v] = p.split('=')
      return [k ?? '', v ?? '']
    }),
  )
  const timestamp = parts.t
  const v1 = parts.v1
  if (!timestamp || !v1) return { ok: false, error: 'invalid signature header' }

  // Reject stale timestamps (>5 min)
  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
    return { ok: false, error: 'timestamp outside tolerance' }
  }

  const signed = `${timestamp}.${rawBody}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed))
  const expected = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
  if (!timingSafeEqualHex(expected, v1)) {
    return { ok: false, error: 'signature mismatch' }
  }

  try {
    const event = JSON.parse(rawBody) as StripeEvent
    return { ok: true, event }
  } catch {
    return { ok: false, error: 'invalid JSON body' }
  }
}

export interface StripeEvent {
  id: string
  type: string
  data: {
    object: {
      id?: string
      customer?: string
      client_reference_id?: string
      metadata?: { user_id?: string }
      subscription?: string
      status?: string
    }
  }
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

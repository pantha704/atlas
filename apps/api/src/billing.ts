// Razorpay billing via REST (no SDK — works on Vercel/Node + CF Workers).
// Preferred: RAZORPAY_PLAN_ID → hosted subscription (recurring).
// Fallback: one-time payment link for Pro month (extends trialEndsAt +30d).
//
// Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_PLAN_ID (optional),
//      RAZORPAY_AMOUNT_PAISE (optional, default 69900 = ₹699),
//      RAZORPAY_WEBHOOK_SECRET, WEB_URL / APP_URL

export interface BillingEnv {
  RAZORPAY_KEY_ID?: string
  RAZORPAY_KEY_SECRET?: string
  RAZORPAY_PLAN_ID?: string
  /** One-time Pro month amount in paise (INR). Default 69900 (₹699). */
  RAZORPAY_AMOUNT_PAISE?: string
  RAZORPAY_WEBHOOK_SECRET?: string
  WEB_URL?: string
  APP_URL?: string
}

export function billingConfigured(env: BillingEnv): boolean {
  return Boolean(env.RAZORPAY_KEY_ID?.trim() && env.RAZORPAY_KEY_SECRET?.trim())
}

function siteUrl(env: BillingEnv): string {
  return (env.WEB_URL ?? env.APP_URL ?? 'https://atlas.pages.dev').replace(/\/$/, '')
}

function basicAuth(env: BillingEnv): string {
  const id = env.RAZORPAY_KEY_ID!.trim()
  const secret = env.RAZORPAY_KEY_SECRET!.trim()
  // btoa is available in Workers + modern Node
  return `Basic ${btoa(`${id}:${secret}`)}`
}

/**
 * Create a hosted payment URL for Pro.
 * Returns short_url from subscription or payment_link.
 */
export async function createCheckoutSession(
  env: BillingEnv,
  opts: {
    customerId?: string | null
    customerEmail: string
    customerName?: string | null
    userId: string
  },
): Promise<
  | { url: string; sessionId: string; mode: 'subscription' | 'payment_link' }
  | { error: string; status: number }
> {
  if (!billingConfigured(env)) {
    return {
      error: 'billing not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET',
      status: 501,
    }
  }

  const site = siteUrl(env)
  const planId = env.RAZORPAY_PLAN_ID?.trim()

  if (planId) {
    return createSubscriptionCheckout(env, {
      planId,
      userId: opts.userId,
      email: opts.customerEmail,
      name: opts.customerName ?? undefined,
      site,
    })
  }

  return createPaymentLinkCheckout(env, {
    userId: opts.userId,
    email: opts.customerEmail,
    name: opts.customerName ?? undefined,
    site,
  })
}

async function createSubscriptionCheckout(
  env: BillingEnv,
  opts: { planId: string; userId: string; email: string; name?: string; site: string },
): Promise<
  | { url: string; sessionId: string; mode: 'subscription' }
  | { error: string; status: number }
> {
  // total_count: 120 months ≈ 10y; cancel anytime via Razorpay dashboard / future portal
  const body = {
    plan_id: opts.planId,
    total_count: 120,
    quantity: 1,
    customer_notify: 1,
    notes: {
      user_id: opts.userId,
      product: 'atlas_pro',
    },
    notify_info: {
      notify_email: opts.email,
    },
  }

  const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: basicAuth(env),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { error: `Razorpay subscription ${res.status}: ${text.slice(0, 240)}`, status: 502 }
  }

  const data = (await res.json()) as {
    id: string
    short_url?: string
    status?: string
  }

  // Prefer hosted short_url; else client can open checkout with subscription_id + key_id
  if (data.short_url) {
    return { url: data.short_url, sessionId: data.id, mode: 'subscription' }
  }

  // Fallback: Standard Checkout page we host? Without short_url, build payment page URL isn't public.
  // Razorpay always returns short_url for subscriptions when customer_notify is set — if missing, fail clearly.
  return {
    error: 'Razorpay subscription created but short_url missing — enable hosted payment in plan settings',
    status: 502,
  }
}

async function createPaymentLinkCheckout(
  env: BillingEnv,
  opts: { userId: string; email: string; name?: string; site: string },
): Promise<
  | { url: string; sessionId: string; mode: 'payment_link' }
  | { error: string; status: number }
> {
  const amount = Number(env.RAZORPAY_AMOUNT_PAISE ?? '69900')
  if (!Number.isFinite(amount) || amount < 100) {
    return { error: 'invalid RAZORPAY_AMOUNT_PAISE (min 100 paise)', status: 501 }
  }

  const body = {
    amount: Math.round(amount),
    currency: 'INR',
    accept_partial: false,
    description: 'Atlas Pro — 1 month',
    customer: {
      email: opts.email,
      name: opts.name || undefined,
    },
    notify: { email: true, sms: false },
    reminder_enable: false,
    notes: {
      user_id: opts.userId,
      product: 'atlas_pro',
      period: '1m',
    },
    callback_url: `${opts.site}/profile?billing=success`,
    callback_method: 'get',
  }

  const res = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: basicAuth(env),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { error: `Razorpay payment_link ${res.status}: ${text.slice(0, 240)}`, status: 502 }
  }

  const data = (await res.json()) as { id: string; short_url?: string }
  if (!data.short_url) {
    return { error: 'Razorpay payment link missing short_url', status: 502 }
  }
  return { url: data.short_url, sessionId: data.id, mode: 'payment_link' }
}

export interface RazorpayWebhookPayload {
  event: string
  payload?: {
    subscription?: { entity?: RazorpaySubscriptionEntity }
    payment?: { entity?: RazorpayPaymentEntity }
    payment_link?: { entity?: RazorpayPaymentLinkEntity }
  }
}

export interface RazorpaySubscriptionEntity {
  id: string
  status?: string
  customer_id?: string
  notes?: Record<string, string>
}

export interface RazorpayPaymentEntity {
  id: string
  status?: string
  notes?: Record<string, string>
  customer_id?: string
  email?: string
}

export interface RazorpayPaymentLinkEntity {
  id: string
  status?: string
  notes?: Record<string, string>
  customer?: { email?: string }
}

/** Verify X-Razorpay-Signature = HMAC-SHA256(body, webhook_secret) hex */
export async function verifyRazorpayWebhook(
  env: BillingEnv,
  rawBody: string,
  signatureHeader: string | null,
): Promise<{ ok: true; event: RazorpayWebhookPayload } | { ok: false; error: string }> {
  if (!env.RAZORPAY_WEBHOOK_SECRET?.trim()) {
    return { ok: false, error: 'RAZORPAY_WEBHOOK_SECRET not set' }
  }
  if (!signatureHeader) return { ok: false, error: 'missing X-Razorpay-Signature' }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.RAZORPAY_WEBHOOK_SECRET.trim()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')

  if (!timingSafeEqualHex(expected, signatureHeader.trim())) {
    return { ok: false, error: 'signature mismatch' }
  }

  try {
    const event = JSON.parse(rawBody) as RazorpayWebhookPayload
    return { ok: true, event }
  } catch {
    return { ok: false, error: 'invalid JSON body' }
  }
}

/** Extract user id from Razorpay notes on common entities */
export function userIdFromRazorpayEvent(event: RazorpayWebhookPayload): string | null {
  const notes =
    event.payload?.subscription?.entity?.notes ??
    event.payload?.payment?.entity?.notes ??
    event.payload?.payment_link?.entity?.notes
  const id = notes?.user_id?.trim()
  return id || null
}

export function subscriptionIdFromEvent(event: RazorpayWebhookPayload): string | null {
  return event.payload?.subscription?.entity?.id ?? null
}

export function isProUpgradeEvent(eventType: string): boolean {
  return [
    'subscription.activated',
    'subscription.charged',
    'subscription.resumed',
    'payment_link.paid',
    'payment.captured',
  ].includes(eventType)
}

export function isProDowngradeEvent(eventType: string): boolean {
  return [
    'subscription.cancelled',
    'subscription.completed',
    'subscription.halted',
    'subscription.paused',
  ].includes(eventType)
}

/** +30 days ISO for payment-link (one month) grants */
export function plusThirtyDays(from = new Date()): string {
  const d = new Date(from)
  d.setUTCDate(d.getUTCDate() + 30)
  return d.toISOString()
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

import { describe, expect, it } from 'vitest'
import {
  billingConfigured,
  isProDowngradeEvent,
  isProUpgradeEvent,
  plusThirtyDays,
  userIdFromRazorpayEvent,
  verifyRazorpayWebhook,
} from '../src/billing'

describe('billingConfigured', () => {
  it('false when keys missing', () => {
    expect(billingConfigured({})).toBe(false)
    expect(billingConfigured({ RAZORPAY_KEY_ID: 'rzp_test' })).toBe(false)
  })

  it('true when key id + secret set', () => {
    expect(
      billingConfigured({ RAZORPAY_KEY_ID: 'rzp_test', RAZORPAY_KEY_SECRET: 'secret' }),
    ).toBe(true)
  })
})

describe('event helpers', () => {
  it('classifies upgrade events', () => {
    expect(isProUpgradeEvent('subscription.activated')).toBe(true)
    expect(isProUpgradeEvent('payment_link.paid')).toBe(true)
    expect(isProUpgradeEvent('payment.captured')).toBe(true)
    expect(isProUpgradeEvent('subscription.cancelled')).toBe(false)
  })

  it('classifies downgrade events', () => {
    expect(isProDowngradeEvent('subscription.cancelled')).toBe(true)
    expect(isProDowngradeEvent('subscription.halted')).toBe(true)
    expect(isProDowngradeEvent('subscription.activated')).toBe(false)
  })

  it('extracts user_id from notes', () => {
    expect(
      userIdFromRazorpayEvent({
        event: 'payment.captured',
        payload: { payment: { entity: { notes: { user_id: 'u1' } } } },
      }),
    ).toBe('u1')
    expect(userIdFromRazorpayEvent({ event: 'x' })).toBeNull()
  })

  it('plusThirtyDays advances ~30 days', () => {
    const from = new Date('2026-01-01T00:00:00.000Z')
    const out = plusThirtyDays(from)
    expect(out.startsWith('2026-01-31')).toBe(true)
  })
})

describe('verifyRazorpayWebhook', () => {
  it('rejects missing secret / signature', async () => {
    const r1 = await verifyRazorpayWebhook({}, '{}', 'abc')
    expect(r1.ok).toBe(false)
    const r2 = await verifyRazorpayWebhook({ RAZORPAY_WEBHOOK_SECRET: 'whsec' }, '{}', null)
    expect(r2.ok).toBe(false)
  })

  it('accepts valid HMAC signature', async () => {
    const secret = 'test_webhook_secret'
    const body = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { notes: { user_id: 'user-1' } } } },
    })
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
    const sig = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, '0')).join('')

    const verified = await verifyRazorpayWebhook(
      { RAZORPAY_WEBHOOK_SECRET: secret },
      body,
      sig,
    )
    expect(verified.ok).toBe(true)
    if (verified.ok) {
      expect(verified.event.event).toBe('payment.captured')
      expect(userIdFromRazorpayEvent(verified.event)).toBe('user-1')
    }
  })

  it('rejects bad signature', async () => {
    const r = await verifyRazorpayWebhook(
      { RAZORPAY_WEBHOOK_SECRET: 'secret' },
      '{"event":"x"}',
      'deadbeef',
    )
    expect(r.ok).toBe(false)
  })
})

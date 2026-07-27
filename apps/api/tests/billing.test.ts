import { describe, expect, it } from 'vitest'
import { billingConfigured } from '../src/billing'

describe('billingConfigured', () => {
  it('false when keys missing', () => {
    expect(billingConfigured({})).toBe(false)
    expect(billingConfigured({ STRIPE_SECRET_KEY: 'sk_test' })).toBe(false)
  })

  it('true when secret + price set', () => {
    expect(
      billingConfigured({ STRIPE_SECRET_KEY: 'sk_test', STRIPE_PRICE_ID: 'price_x' }),
    ).toBe(true)
  })
})

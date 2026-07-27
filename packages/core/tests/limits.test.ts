import { describe, expect, it } from 'vitest'
import {
  FREE_SOURCE_LIMIT,
  canAddSource,
  canUseDelivery,
  impactTopN,
} from '../src/limits'

describe('plan limits', () => {
  it('caps free sources at FREE_SOURCE_LIMIT', () => {
    expect(canAddSource('free', FREE_SOURCE_LIMIT - 1)).toBe(true)
    expect(canAddSource('free', FREE_SOURCE_LIMIT)).toBe(false)
    expect(canAddSource('pro', 100)).toBe(true)
  })

  it('gates delivery channels by plan', () => {
    expect(canUseDelivery('free', 'web')).toBe(true)
    expect(canUseDelivery('free', 'email')).toBe(false)
    expect(canUseDelivery('free', 'rss')).toBe(false)
    expect(canUseDelivery('free', 'webhook')).toBe(false)
    expect(canUseDelivery('pro', 'email')).toBe(true)
    expect(canUseDelivery('pro', 'rss')).toBe(true)
    expect(canUseDelivery('pro', 'webhook')).toBe(true)
  })

  it('sets impact top-N by plan', () => {
    expect(impactTopN('free')).toBe(3)
    expect(impactTopN('pro')).toBe(10)
  })
})

import { describe, expect, it } from 'vitest'
import { qualityCheck } from '../src/market'

describe('qualityCheck', () => {
  it('passes when avg >= 6.0 and snr >= 30%', () => {
    const scores = [7, 8, 6, 7, 8, 7, 8, 6, 7, 8] // avg 7.2, 80% signal
    const result = qualityCheck(scores)
    expect(result.passes).toBe(true)
    expect(result.avgScore).toBe(7.2)
    expect(result.snr).toBe(0.8)
  })

  it('fails when avg too low', () => {
    const scores = [3, 4, 5, 3, 4, 5, 3, 4, 5, 3] // avg 3.9
    const result = qualityCheck(scores)
    expect(result.passes).toBe(false)
    expect(result.reason).toContain('need ≥6')
  })

  it('fails when snr too low', () => {
    const scores = [6, 6, 6, 6, 6, 6, 6, 6, 6, 9] // avg 6.3, 10% signal
    const result = qualityCheck(scores)
    expect(result.passes).toBe(false)
    expect(result.reason).toContain('need ≥30%')
  })

  it('fails on empty scores', () => {
    const result = qualityCheck([])
    expect(result.passes).toBe(false)
    expect(result.reason).toContain('No items')
  })

  it('rounds avg to 1 decimal', () => {
    const scores = [7, 7, 7]
    const result = qualityCheck(scores)
    expect(result.avgScore).toBe(7)
  })

  it('rounds snr to 2 decimals', () => {
    const scores = [7, 7, 7, 7, 7, 7, 7, 7, 7, 5] // 90% signal
    const result = qualityCheck(scores)
    expect(result.snr).toBe(0.9)
  })

  it('passes on edge case: exactly 6.0 avg and 30% snr', () => {
    const scores = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6] // avg 6.0, 0% signal — FAIL
    const r1 = qualityCheck(scores)
    expect(r1.passes).toBe(false)

    // Exactly 6.0 avg, exactly 30% signal
    const scores2 = [6, 6, 6, 6, 6, 6, 6, 7, 7, 7] // avg 6.3, 30% signal
    const r2 = qualityCheck(scores2)
    expect(r2.passes).toBe(true)
  })
})

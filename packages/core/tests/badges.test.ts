import { describe, expect, it } from 'vitest'
import { computeBadges } from '../src/badges'

describe('computeBadges', () => {
  it('awards first badge for >= 1 source', () => {
    expect(computeBadges({ sourceCount: 1, maxAvgScore: 0, maxUserCount: 0 })).toContain('first')
  })

  it('no badges for zero contributions', () => {
    expect(computeBadges({ sourceCount: 0, maxAvgScore: 0, maxUserCount: 0 })).toEqual([])
  })

  it('awards quality for maxAvgScore >= 7.0', () => {
    expect(computeBadges({ sourceCount: 1, maxAvgScore: 7.0, maxUserCount: 0 })).toContain(
      'quality',
    )
    expect(computeBadges({ sourceCount: 1, maxAvgScore: 6.9, maxUserCount: 0 })).not.toContain(
      'quality',
    )
  })

  it('awards popular for maxUserCount >= 50', () => {
    expect(computeBadges({ sourceCount: 1, maxAvgScore: 0, maxUserCount: 50 })).toContain('popular')
    expect(computeBadges({ sourceCount: 1, maxAvgScore: 0, maxUserCount: 49 })).not.toContain(
      'popular',
    )
  })

  it('awards core for sourceCount >= 10', () => {
    expect(computeBadges({ sourceCount: 10, maxAvgScore: 0, maxUserCount: 0 })).toContain('core')
    expect(computeBadges({ sourceCount: 9, maxAvgScore: 0, maxUserCount: 0 })).not.toContain('core')
  })

  it('awards all badges when all criteria met', () => {
    const badges = computeBadges({ sourceCount: 10, maxAvgScore: 8.0, maxUserCount: 100 })
    expect(badges).toContain('first')
    expect(badges).toContain('quality')
    expect(badges).toContain('popular')
    expect(badges).toContain('core')
    expect(badges).toHaveLength(4)
  })
})

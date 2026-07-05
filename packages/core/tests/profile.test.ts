import { describe, expect, it } from 'vitest'
import { applyFeedbackToProfile, defaultProfile, deriveInterestsFromWeights } from '../src/profile'

describe('defaultProfile', () => {
  it('creates empty profile with threshold 7.0', () => {
    const p = defaultProfile('user-1')
    expect(p.userId).toBe('user-1')
    expect(p.interests).toBe('')
    expect(p.stack).toEqual([])
    expect(p.tagWeights).toEqual({})
    expect(p.threshold).toBe(7.0)
    expect(p.language).toBe('en')
  })
})

describe('applyFeedbackToProfile', () => {
  it('upvote boosts tag weights', () => {
    const profile = defaultProfile('user-1')
    const updated = applyFeedbackToProfile(profile, 'up', ['rust', 'systems'])
    expect(updated.tagWeights.rust).toBe(1)
    expect(updated.tagWeights.systems).toBe(1)
  })

  it('downvote reduces tag weights', () => {
    const profile = { ...defaultProfile('user-1'), tagWeights: { rust: 3, python: 2 } }
    const updated = applyFeedbackToProfile(profile, 'down', ['rust'])
    expect(updated.tagWeights.rust).toBe(2)
    expect(updated.tagWeights.python).toBe(2) // unchanged
  })

  it('bookmark counts double', () => {
    const profile = defaultProfile('user-1')
    const updated = applyFeedbackToProfile(profile, 'bookmark', ['rust'])
    expect(updated.tagWeights.rust).toBe(2)
  })

  it('dismiss reduces like downvote', () => {
    const profile = { ...defaultProfile('user-1'), tagWeights: { ai: 2 } }
    const updated = applyFeedbackToProfile(profile, 'dismiss', ['ai'])
    expect(updated.tagWeights.ai).toBe(1)
  })

  it('weights never go below zero', () => {
    const profile = defaultProfile('user-1')
    const updated = applyFeedbackToProfile(profile, 'down', ['rust'])
    expect(updated.tagWeights.rust).toBe(0)
  })

  it('multiple feedbacks accumulate', () => {
    let profile = defaultProfile('user-1')
    profile = applyFeedbackToProfile(profile, 'up', ['rust'])
    profile = applyFeedbackToProfile(profile, 'up', ['rust', 'python'])
    profile = applyFeedbackToProfile(profile, 'bookmark', ['rust'])
    expect(profile.tagWeights.rust).toBe(4) // 1 + 1 + 2
    expect(profile.tagWeights.python).toBe(1)
  })

  it('does not mutate original profile', () => {
    const profile = defaultProfile('user-1')
    applyFeedbackToProfile(profile, 'up', ['rust'])
    expect(profile.tagWeights.rust).toBeUndefined()
  })
})

describe('deriveInterestsFromWeights', () => {
  it('returns top 10 tags sorted by weight', () => {
    const weights: Record<string, number> = {}
    for (let i = 0; i < 15; i++) weights[`tag${i}`] = 15 - i
    const interests = deriveInterestsFromWeights(weights)
    const tags = interests.split(', ')
    expect(tags).toHaveLength(10)
    expect(tags[0]).toBe('tag0') // highest weight
  })

  it('returns empty string for no weights', () => {
    expect(deriveInterestsFromWeights({})).toBe('')
  })
})

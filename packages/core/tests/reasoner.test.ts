import { describe, expect, it } from 'vitest'
import type { AIClient, CompletionRequest } from '../src/ai/client'
import { ImpactReasoner } from '../src/ai/reasoner'
import { defaultProfile } from '../src/profile'
import { makeItem } from '../src/types'

// Mock AIClient — returns canned JSON for impact reasoning
function mockClient(response: string): AIClient {
  return {
    async complete(_req: CompletionRequest): Promise<string> {
      return response
    },
  }
}

describe('ImpactReasoner', () => {
  it('parses valid impact response', async () => {
    const client = mockClient(
      JSON.stringify({
        affects_stack: true,
        affected_components: ['rust', 'wasm'],
        action: 'Review the new WASM component model proposal.',
        confidence: 'high',
      }),
    )
    const reasoner = new ImpactReasoner(client)
    const item = makeItem({
      sourceType: 'rss',
      subtype: 'feed',
      nativeId: '1',
      title: 'New WASM component model proposed',
      url: 'https://example.com',
      publishedAt: new Date().toISOString(),
    })
    const profile = { ...defaultProfile('u1'), stack: ['rust', 'wasm'] }
    const result = await reasoner.reason(item, profile)
    expect(result.affectsStack).toBe(true)
    expect(result.affectedComponents).toEqual(['rust', 'wasm'])
    expect(result.action).toBe('Review the new WASM component model proposal.')
    expect(result.confidence).toBe('high')
  })

  it('returns safe defaults on unparseable response', async () => {
    const client = mockClient('not json at all')
    const reasoner = new ImpactReasoner(client)
    const item = makeItem({
      sourceType: 'hackernews',
      subtype: 'story',
      nativeId: '2',
      title: 'Some news',
      url: 'https://example.com',
      publishedAt: new Date().toISOString(),
    })
    const result = await reasoner.reason(item, defaultProfile('u1'))
    expect(result.affectsStack).toBe(false)
    expect(result.affectedComponents).toEqual([])
    expect(result.confidence).toBe('low')
  })

  it('coerces invalid confidence to low', async () => {
    const client = mockClient(
      JSON.stringify({
        affects_stack: false,
        affected_components: [],
        action: 'No action needed.',
        confidence: 'invalid',
      }),
    )
    const reasoner = new ImpactReasoner(client)
    const item = makeItem({
      sourceType: 'rss',
      subtype: 'feed',
      nativeId: '3',
      title: 'Test',
      url: 'https://example.com',
      publishedAt: new Date().toISOString(),
    })
    const result = await reasoner.reason(item, defaultProfile('u1'))
    expect(result.confidence).toBe('low')
  })

  it('coerces non-boolean affects_stack to false', async () => {
    const client = mockClient(
      JSON.stringify({
        affects_stack: 'yes',
        affected_components: [],
        action: 'Nothing.',
        confidence: 'low',
      }),
    )
    const reasoner = new ImpactReasoner(client)
    const item = makeItem({
      sourceType: 'rss',
      subtype: 'feed',
      nativeId: '4',
      title: 'Test',
      url: 'https://example.com',
      publishedAt: new Date().toISOString(),
    })
    const result = await reasoner.reason(item, defaultProfile('u1'))
    expect(result.affectsStack).toBe(false)
  })

  it('filters non-string affected_components', async () => {
    const client = mockClient(
      JSON.stringify({
        affects_stack: true,
        affected_components: ['rust', 42, null, 'wasm'],
        action: 'Check it.',
        confidence: 'medium',
      }),
    )
    const reasoner = new ImpactReasoner(client)
    const item = makeItem({
      sourceType: 'rss',
      subtype: 'feed',
      nativeId: '5',
      title: 'Test',
      url: 'https://example.com',
      publishedAt: new Date().toISOString(),
    })
    const result = await reasoner.reason(item, defaultProfile('u1'))
    expect(result.affectedComponents).toEqual(['rust', 'wasm'])
  })

  it('reasonBatch limits to top N items', async () => {
    let callCount = 0
    const client: AIClient = {
      async complete(): Promise<string> {
        callCount++
        return JSON.stringify({
          affects_stack: false,
          affected_components: [],
          action: 'No action.',
          confidence: 'low',
        })
      },
    }
    const reasoner = new ImpactReasoner(client)
    const items = Array.from({ length: 5 }, (_, i) =>
      makeItem({
        sourceType: 'rss',
        subtype: 'feed',
        nativeId: String(i),
        title: `Item ${i}`,
        url: `https://example.com/${i}`,
        publishedAt: new Date().toISOString(),
      }),
    )
    const results = await reasoner.reasonBatch(items, defaultProfile('u1'), 3)
    expect(results.size).toBe(3)
    expect(callCount).toBe(3)
  })

  it('reasonBatch continues on error for individual item', async () => {
    let call = 0
    const client: AIClient = {
      async complete(): Promise<string> {
        call++
        if (call === 1) throw new Error('AI failed')
        return JSON.stringify({
          affects_stack: false,
          affected_components: [],
          action: 'No action.',
          confidence: 'low',
        })
      },
    }
    const reasoner = new ImpactReasoner(client)
    const items = [
      makeItem({
        sourceType: 'rss',
        subtype: 'feed',
        nativeId: 'a',
        title: 'A',
        url: 'https://a.com',
        publishedAt: new Date().toISOString(),
      }),
      makeItem({
        sourceType: 'rss',
        subtype: 'feed',
        nativeId: 'b',
        title: 'B',
        url: 'https://b.com',
        publishedAt: new Date().toISOString(),
      }),
    ]
    const results = await reasoner.reasonBatch(items, defaultProfile('u1'), 3)
    expect(results.size).toBe(1) // first failed, second succeeded
  })
})

import { describe, expect, it } from 'vitest'
import { capturePostHog, captureSentry, parseSentryDsn } from '../src/observability'

describe('parseSentryDsn', () => {
  it('parses standard DSN', () => {
    const p = parseSentryDsn('https://abc123@o999.ingest.sentry.io/450000')
    expect(p).toEqual({
      scheme: 'https',
      publicKey: 'abc123',
      host: 'o999.ingest.sentry.io',
      projectId: '450000',
    })
  })

  it('returns null for garbage', () => {
    expect(parseSentryDsn('not-a-url')).toBeNull()
    expect(parseSentryDsn('https://host.example/no-key')).toBeNull()
  })
})

describe('capturePostHog', () => {
  it('no-ops without key', async () => {
    expect(await capturePostHog({}, 'test', 'user-1')).toBe(false)
  })
})

describe('captureSentry', () => {
  it('no-ops without DSN', async () => {
    expect(await captureSentry({}, new Error('x'))).toBe(false)
  })

  it('no-ops on invalid DSN', async () => {
    expect(await captureSentry({ SENTRY_DSN: 'https://example.com' }, new Error('x'))).toBe(false)
  })
})

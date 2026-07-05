import { describe, expect, it } from 'vitest'
import { generateId, pangu, parseDate, parseJsonResponse, stripHtml, truncate } from '../src/util'

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>hello <b>world</b></p>')).toBe('hello  world')
  })
  it('handles empty string', () => {
    expect(stripHtml('')).toBe('')
  })
  it('handles no tags', () => {
    expect(stripHtml('plain text')).toBe('plain text')
  })
})

describe('truncate', () => {
  it('returns short text unchanged', () => {
    expect(truncate('short', 10)).toBe('short')
  })
  it('truncates long text with ellipsis', () => {
    expect(truncate('a'.repeat(100), 10)).toBe('aaaaaaa...')
  })
  it('handles exact length', () => {
    expect(truncate('a'.repeat(10), 10)).toBe('a'.repeat(10))
  })
})

describe('parseDate', () => {
  it('parses ISO', () => {
    expect(parseDate('2026-07-05T12:00:00Z')).toBe('2026-07-05T12:00:00.000Z')
  })
  it('parses unix seconds', () => {
    expect(parseDate(1751716800)).toBe('2025-07-05T12:00:00.000Z')
  })
  it('parses RFC 822', () => {
    expect(parseDate('Wed, 02 Jul 2026 12:00:00 GMT')).toBe('2026-07-02T12:00:00.000Z')
  })
  it('returns null for garbage', () => {
    expect(parseDate('not a date')).toBeNull()
  })
  it('returns null for null/undefined', () => {
    expect(parseDate(null)).toBeNull()
    expect(parseDate(undefined)).toBeNull()
  })
})

describe('pangu', () => {
  it('inserts space between CJK and Latin', () => {
    expect(pangu('你好World')).toBe('你好 World')
  })
  it('inserts space between Latin and CJK', () => {
    expect(pangu('Hello世界')).toBe('Hello 世界')
  })
  it('inserts space between CJK and numbers', () => {
    expect(pangu('版本3.5')).toBe('版本 3.5')
  })
  it('leaves pure ASCII alone', () => {
    expect(pangu('hello world')).toBe('hello world')
  })
})

describe('parseJsonResponse', () => {
  it('parses direct JSON', () => {
    expect(parseJsonResponse('{"score": 8}')).toEqual({ score: 8 })
  })
  it('parses JSON in code fence', () => {
    expect(parseJsonResponse('```json\n{"score": 8}\n```')).toEqual({ score: 8 })
  })
  it('parses JSON embedded in text', () => {
    expect(parseJsonResponse('Here is the result: {"score": 8} done')).toEqual({ score: 8 })
  })
  it('parses JSON with trailing comma', () => {
    expect(parseJsonResponse('{"a": 1, "b": 2,}')).toEqual({ a: 1, b: 2 })
  })
  it('returns null for non-JSON', () => {
    expect(parseJsonResponse('just text')).toBeNull()
  })
  it('returns null for empty', () => {
    expect(parseJsonResponse('')).toBeNull()
  })
})

describe('generateId', () => {
  it('formats as source:subtype:nativeId', () => {
    expect(generateId('hn', 'story', '123')).toBe('hn:story:123')
  })
})

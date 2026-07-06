import { describe, expect, it } from 'vitest'
import { extractStackFromRepos, mergeStack } from '../src/stack'

describe('extractStackFromRepos', () => {
  it('extracts languages and topics lowercased', () => {
    const repos = [
      { language: 'Rust', topics: ['wasm', 'systems'] },
      { language: 'TypeScript', topics: ['react'] },
    ]
    expect(extractStackFromRepos(repos).sort()).toEqual([
      'react',
      'rust',
      'systems',
      'typescript',
      'wasm',
    ])
  })

  it('handles null language', () => {
    const repos = [{ language: null, topics: ['ai'] }]
    expect(extractStackFromRepos(repos)).toEqual(['ai'])
  })

  it('handles empty topics array', () => {
    const repos = [{ language: 'Python', topics: [] }]
    expect(extractStackFromRepos(repos)).toEqual(['python'])
  })

  it('deduplicates across repos', () => {
    const repos = [
      { language: 'Rust', topics: ['wasm'] },
      { language: 'Rust', topics: ['wasm', 'cli'] },
    ]
    expect(extractStackFromRepos(repos).sort()).toEqual(['cli', 'rust', 'wasm'])
  })

  it('returns empty for no repos', () => {
    expect(extractStackFromRepos([])).toEqual([])
  })
})

describe('mergeStack', () => {
  it('merges declared and extracted, deduped lowercase', () => {
    expect(mergeStack(['Rust', 'Python'], ['rust', 'wasm']).sort()).toEqual([
      'python',
      'rust',
      'wasm',
    ])
  })

  it('trims whitespace', () => {
    expect(mergeStack(['  Rust  '], ['wasm'])).toEqual(['rust', 'wasm'])
  })

  it('filters empty strings', () => {
    expect(mergeStack(['', 'Rust'], [''])).toEqual(['rust'])
  })

  it('handles both empty', () => {
    expect(mergeStack([], [])).toEqual([])
  })
})

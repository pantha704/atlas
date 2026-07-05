// Hacker News scraper — TS port of code/src/scrapers/hackernews.py.
// Firebase API: https://hacker-news.firebaseio.com/v0
// Fetches top stories, filters by min_score + since, fetches top-5 comments per story.

import type { ContentItem, HackerNewsConfig } from '../types'
import { makeItem } from '../types'
import { stripHtml, truncate } from '../util'
import { type Scraper, fetchJson } from './base'

const BASE_URL = 'https://hacker-news.firebaseio.com/v0'
const TOP_COMMENTS_LIMIT = 5

interface HNStory {
  id: number
  title?: string
  url?: string
  by?: string
  time: number
  score?: number
  descendants?: number
  type?: string
  text?: string
  kids?: number[]
}

interface HNComment {
  id: number
  by?: string
  text?: string
  deleted?: boolean
  dead?: boolean
}

export class HackerNewsScraper implements Scraper {
  readonly sourceType = 'hackernews' as const
  constructor(private cfg: HackerNewsConfig) {}

  async fetch(since: Date): Promise<ContentItem[]> {
    if (!this.cfg.enabled) return []
    const ids = await fetchJson<number[]>(`${BASE_URL}/topstories.json`)
    if (!ids || !Array.isArray(ids)) return []

    const topIds = ids.slice(0, this.cfg.fetchTopStories)
    // Fetch stories concurrently
    const stories = await Promise.all(
      topIds.map((id) => fetchJson<HNStory>(`${BASE_URL}/item/${id}.json`)),
    )

    const valid: HNStory[] = []
    const commentTaskGroups: number[][] = []
    for (const story of stories) {
      if (!story) continue
      if ((story.score ?? 0) < this.cfg.minScore) continue
      const publishedAt = new Date(story.time * 1000)
      if (publishedAt < since) continue
      valid.push(story)
      commentTaskGroups.push((story.kids ?? []).slice(0, TOP_COMMENTS_LIMIT))
    }

    // Fetch comments concurrently per story
    const commentGroups = await Promise.all(
      commentTaskGroups.map(async (kids) => {
        const comments = await Promise.all(
          kids.map((cid) => fetchJson<HNComment>(`${BASE_URL}/item/${cid}.json`)),
        )
        return comments.filter((c): c is HNComment => !!c && !!c.text && !c.deleted && !c.dead)
      }),
    )

    const items: ContentItem[] = []
    for (let i = 0; i < valid.length; i++) {
      const story = valid[i]
      if (!story) continue
      const item = this.parseStory(story, commentGroups[i] ?? [])
      if (item) items.push(item)
    }
    return items
  }

  private parseStory(story: HNStory, comments: HNComment[]): ContentItem | null {
    const storyId = story.id
    const title = story.title ?? ''
    const url = story.url ?? `https://news.ycombinator.com/item?id=${storyId}`
    const author = story.by ?? 'unknown'
    const publishedAt = new Date(story.time * 1000).toISOString()

    const parts: string[] = []
    if (story.text) parts.push(story.text)
    if (comments.length) {
      parts.push('\n--- Top Comments ---')
      for (const c of comments) {
        const commenter = c.by ?? 'anon'
        const text = truncate(stripHtml(c.text ?? ''), 500)
        parts.push(`[${commenter}]: ${text}`)
      }
    }
    const content = parts.join('\n\n')
    const discussionUrl = `https://news.ycombinator.com/item?id=${storyId}`

    return makeItem({
      sourceType: 'hackernews',
      subtype: 'story',
      nativeId: String(storyId),
      title,
      url,
      content,
      author,
      publishedAt,
      metadata: {
        score: story.score ?? 0,
        descendants: story.descendants ?? 0,
        type: story.type ?? 'story',
        discussionUrl,
        commentCount: comments.length,
      },
    })
  }
}

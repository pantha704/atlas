// Reddit scraper — TS port of code/src/scrapers/reddit.py.
// JSON endpoints: /r/{sub}/{sort}.json + /user/{name}/submitted.json
// Optional top-comments fetch per post (throttled by semaphore-equivalent concurrency).

import type { ContentItem, RedditConfig, RedditSubredditConfig } from '../types'
import { makeItem } from '../types'
import { sleep, stripHtml, truncate } from '../util'
import { type Scraper, fetchJson } from './base'

const REDDIT_BASE = 'https://www.reddit.com'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
const HEADERS: Record<string, string> = {
  'User-Agent': USER_AGENT,
  Accept: 'application/json,text/plain,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: `${REDDIT_BASE}/`,
}

interface RedditListing {
  data?: { children?: Array<{ kind: string; data?: RedditPost | RedditComment }> }
}

interface RedditPost {
  id: string
  title?: string
  url?: string
  permalink?: string
  author?: string
  created_utc?: number
  score?: number
  upvote_ratio?: number | null
  num_comments?: number
  subreddit?: string
  is_self?: boolean
  selftext?: string
  link_flair_text?: string | null
}

interface RedditComment {
  body?: string
  author?: string
  score?: number
  distinguished?: string | null
}

function isRedditPost(d: RedditPost | RedditComment | undefined): d is RedditPost {
  return !!d && 'id' in d
}

function isRedditComment(d: RedditPost | RedditComment | undefined): d is RedditComment {
  return !!d && 'body' in d
}

export class RedditScraper implements Scraper {
  readonly sourceType = 'reddit' as const
  constructor(private cfg: RedditConfig) {}

  async fetch(since: Date): Promise<ContentItem[]> {
    if (!this.cfg.enabled) return []

    const tasks: Promise<ContentItem[]>[] = []
    for (const sub of this.cfg.subreddits) {
      if (sub.enabled) tasks.push(this.fetchSubreddit(sub, since))
    }
    for (const user of this.cfg.users) {
      if (user.enabled) tasks.push(this.fetchUser(user.username, user.sort, user.fetchLimit, since))
    }
    if (!tasks.length) return []

    const results = await Promise.allSettled(tasks)
    const items: ContentItem[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') items.push(...r.value)
    }
    return items
  }

  private async fetchSubreddit(cfg: RedditSubredditConfig, since: Date): Promise<ContentItem[]> {
    const params = new URLSearchParams({
      limit: String(Math.min(cfg.fetchLimit, 100)),
      raw_json: '1',
    })
    if (cfg.sort === 'top' || cfg.sort === 'controversial') params.set('t', cfg.timeFilter)
    const url = `${REDDIT_BASE}/r/${cfg.subreddit}/${cfg.sort}.json?${params}`
    const data = await this.redditGet<RedditListing>(url)
    if (!data?.data?.children) return []

    const posts = data.data.children
      .filter((c) => c.kind === 't3')
      .map((c) => c.data)
      .filter(isRedditPost)
    return this.processPosts(posts, since, 'subreddit', cfg.subreddit, cfg.minScore)
  }

  private async fetchUser(
    username: string,
    sort: 'new' | 'hot' | 'top',
    limit: number,
    since: Date,
  ): Promise<ContentItem[]> {
    const params = new URLSearchParams({
      limit: String(Math.min(limit, 100)),
      sort,
      raw_json: '1',
    })
    const url = `${REDDIT_BASE}/user/${username}/submitted.json?${params}`
    const data = await this.redditGet<RedditListing>(url)
    if (!data?.data?.children) return []

    const posts = data.data.children
      .filter((c) => c.kind === 't3')
      .map((c) => c.data)
      .filter(isRedditPost)
    return this.processPosts(posts, since, 'user', username, 0)
  }

  private async processPosts(
    posts: RedditPost[],
    since: Date,
    subtype: string,
    sourceName: string,
    minScore: number,
  ): Promise<ContentItem[]> {
    const valid: RedditPost[] = []
    for (const post of posts) {
      const created = new Date((post.created_utc ?? 0) * 1000)
      if (created < since) continue
      if ((post.score ?? 0) < minScore) continue
      valid.push(post)
    }
    if (!valid.length) return []

    // Fetch comments for each post (throttled — ponytail: simple sequential batch, semaphore if needed later)
    const commentGroups: RedditComment[][] = []
    for (const post of valid) {
      if (this.cfg.fetchComments > 0) {
        const comments = await this.fetchComments(post.subreddit ?? sourceName, post.id)
        commentGroups.push(comments)
      } else {
        commentGroups.push([])
      }
    }

    const items: ContentItem[] = []
    for (let i = 0; i < valid.length; i++) {
      const post = valid[i]
      if (!post) continue
      const item = this.parsePost(post, commentGroups[i] ?? [], subtype)
      if (item) items.push(item)
    }
    return items
  }

  private async fetchComments(subreddit: string, postId: string): Promise<RedditComment[]> {
    const fetchLimit = this.cfg.fetchComments
    const params = new URLSearchParams({
      limit: String(fetchLimit),
      depth: '1',
      sort: 'top',
      raw_json: '1',
    })
    const url = `${REDDIT_BASE}/r/${subreddit}/comments/${postId}.json?${params}`
    const data = await this.redditGet<RedditListing[]>(url)
    if (!data || !Array.isArray(data) || data.length < 2) return []

    const children = data[1]?.data?.children ?? []
    const comments: RedditComment[] = []
    for (const child of children) {
      if (child.kind !== 't1') continue
      const c = child.data
      if (c && isRedditComment(c) && c.body && c.distinguished !== 'moderator') comments.push(c)
    }
    comments.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    return comments.slice(0, fetchLimit)
  }

  private parsePost(
    post: RedditPost,
    comments: RedditComment[],
    subtype: string,
  ): ContentItem | null {
    const isSelf = post.is_self ?? false
    const subreddit = post.subreddit ?? ''
    const discussionUrl = `https://www.reddit.com${post.permalink ?? ''}`
    const url = isSelf ? discussionUrl : (post.url ?? discussionUrl)
    const author = post.author ?? 'unknown'
    const created = new Date((post.created_utc ?? 0) * 1000).toISOString()

    const parts: string[] = []
    if (post.selftext) parts.push(truncate(post.selftext, 1500))
    if (comments.length) {
      parts.push('\n--- Top Comments ---')
      for (const c of comments) {
        const commenter = c.author ?? 'anon'
        const body = truncate(stripHtml(c.body ?? '').trim(), 500)
        const score = c.score ?? 0
        parts.push(`[${commenter} (${score} pts)]: ${body}`)
      }
    }
    const content = parts.join('\n\n')

    return makeItem({
      sourceType: 'reddit',
      subtype,
      nativeId: post.id,
      title: post.title ?? '',
      url,
      content,
      author,
      publishedAt: created,
      metadata: {
        score: post.score ?? 0,
        upvoteRatio: post.upvote_ratio ?? null,
        numComments: post.num_comments ?? 0,
        subreddit,
        isSelf: isSelf,
        flair: post.link_flair_text ?? null,
        discussionUrl,
      },
    })
  }

  private async redditGet<T>(url: string): Promise<T | null> {
    let res = await fetchJson<T>(url, { headers: HEADERS, redirect: 'follow' })
    if (res === null) {
      // ponytail: single retry on 429 — full circuit-breaker if Reddit becomes flaky
      await sleep(5000)
      res = await fetchJson<T>(url, { headers: HEADERS, redirect: 'follow' })
    }
    return res
  }
}

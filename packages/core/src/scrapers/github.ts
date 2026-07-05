// GitHub scraper — TS port of code/src/scrapers/github.py.
// Two modes: user_events (public activity) + repo_releases.
// Uses optional GITHUB_TOKEN env for higher rate limits.

import type { ContentItem, GitHubSourceConfig } from '../types'
import { makeItem } from '../types'
import { parseDate } from '../util'
import { type Scraper, fetchJson } from './base'

const BASE_URL = 'https://api.github.com'
const INTERESTING_EVENTS = new Set([
  'PushEvent',
  'CreateEvent',
  'ReleaseEvent',
  'PublicEvent',
  'WatchEvent',
])

interface GHEvent {
  id: string
  type: string
  created_at: string
  repo: { name: string }
  payload: {
    commits?: Array<{ message?: string }>
    ref_type?: string
    description?: string
    release?: {
      tag_name?: string
      body?: string
      html_url?: string
      author?: { login?: string }
    }
  }
}

interface GHRelease {
  id: number
  tag_name: string
  html_url: string
  body?: string
  published_at: string
  author: { login?: string }
  prerelease?: boolean
}

export class GitHubScraper implements Scraper {
  readonly sourceType = 'github' as const
  constructor(private sources: GitHubSourceConfig[]) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Atlas-Aggregator',
    }
    const token = process.env.GITHUB_TOKEN
    if (token) h.Authorization = `token ${token}`
    return h
  }

  async fetch(since: Date): Promise<ContentItem[]> {
    const items: ContentItem[] = []
    for (const src of this.sources) {
      if (!src.enabled) continue
      if (src.type === 'user_events' && src.username) {
        const sub = await this.fetchUserEvents(src.username, since)
        items.push(...sub)
      } else if (src.type === 'repo_releases' && src.owner && src.repo) {
        const sub = await this.fetchRepoReleases(src.owner, src.repo, since)
        items.push(...sub)
      }
    }
    return items
  }

  private async fetchUserEvents(username: string, since: Date): Promise<ContentItem[]> {
    const events = await fetchJson<GHEvent[]>(`${BASE_URL}/users/${username}/events/public`, {
      headers: this.headers(),
      redirect: 'follow',
    })
    if (!events || !Array.isArray(events)) return []

    const items: ContentItem[] = []
    for (const event of events) {
      const createdAt = parseDate(event.created_at)
      if (!createdAt || new Date(createdAt) < since) continue
      if (!INTERESTING_EVENTS.has(event.type)) continue
      const item = this.parseEvent(event, username, createdAt)
      if (item) items.push(item)
    }
    return items
  }

  private parseEvent(event: GHEvent, username: string, createdAt: string): ContentItem | null {
    const repoName = event.repo.name
    let repoUrl = `https://github.com/${repoName}`
    let title = ''
    let content = ''

    switch (event.type) {
      case 'PushEvent': {
        const commits = event.payload.commits ?? []
        title = `${username} pushed ${commits.length} commit(s) to ${repoName}`
        content = commits
          .slice(0, 3)
          .map((c) => c.message ?? '')
          .join('\n')
        break
      }
      case 'CreateEvent': {
        const refType = event.payload.ref_type ?? 'repository'
        title = `${username} created ${refType} in ${repoName}`
        content = event.payload.description ?? ''
        break
      }
      case 'ReleaseEvent': {
        const release = event.payload.release ?? {}
        title = `${username} released ${release.tag_name ?? ''} in ${repoName}`
        content = release.body ?? ''
        if (release.html_url) repoUrl = release.html_url
        break
      }
      case 'PublicEvent':
        title = `${username} made ${repoName} public`
        break
      case 'WatchEvent':
        title = `${username} starred ${repoName}`
        break
      default:
        return null
    }

    return makeItem({
      sourceType: 'github',
      subtype: 'event',
      nativeId: event.id,
      title,
      url: repoUrl,
      content,
      author: username,
      publishedAt: createdAt,
      metadata: { eventType: event.type, repo: repoName },
    })
  }

  private async fetchRepoReleases(
    owner: string,
    repo: string,
    since: Date,
  ): Promise<ContentItem[]> {
    const releases = await fetchJson<GHRelease[]>(`${BASE_URL}/repos/${owner}/${repo}/releases`, {
      headers: this.headers(),
      redirect: 'follow',
    })
    if (!releases || !Array.isArray(releases)) return []

    const items: ContentItem[] = []
    for (const release of releases) {
      const publishedAt = parseDate(release.published_at)
      if (!publishedAt || new Date(publishedAt) < since) continue
      items.push(
        makeItem({
          sourceType: 'github',
          subtype: 'release',
          nativeId: String(release.id),
          title: `${owner}/${repo} released ${release.tag_name}`,
          url: release.html_url,
          content: release.body ?? '',
          author: release.author.login ?? 'unknown',
          publishedAt,
          metadata: {
            repo: `${owner}/${repo}`,
            tag: release.tag_name,
            prerelease: release.prerelease ?? false,
          },
        }),
      )
    }
    return items
  }
}

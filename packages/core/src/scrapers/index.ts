// Scraper registry — builds scrapers from config, runs all concurrently, collects results.

import type { Config, ContentItem, SourceType } from '../types'
import { ArxivScraper } from './arxiv'
import type { Scraper } from './base'
import { GitHubScraper } from './github'
import { HackerNewsScraper } from './hackernews'
import { OSSInsightScraper } from './ossinsight'
import { RedditScraper } from './reddit'
import { RSSScraper } from './rss'
import { TelegramScraper } from './telegram'

export type { Scraper } from './base'

export function buildScrapers(config: Config): Scraper[] {
  const scrapers: Scraper[] = []
  const s = config.sources

  if (s.github.length) scrapers.push(new GitHubScraper(s.github))
  if (s.hackernews.enabled) scrapers.push(new HackerNewsScraper(s.hackernews))
  if (s.rss.length) scrapers.push(new RSSScraper(s.rss))
  if (s.reddit.enabled) scrapers.push(new RedditScraper(s.reddit))
  if (s.telegram.enabled) scrapers.push(new TelegramScraper(s.telegram))
  if (s.arxiv.enabled) scrapers.push(new ArxivScraper(s.arxiv))
  if (s.ossinsight.enabled) scrapers.push(new OSSInsightScraper(s.ossinsight))

  return scrapers
}

export async function fetchAllSources(config: Config, since: Date): Promise<ContentItem[]> {
  const scrapers = buildScrapers(config)
  const results = await Promise.allSettled(scrapers.map((s) => s.fetch(since)))

  const items: ContentItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value)
    // ponytail: rejected scrapers logged by caller via run log; here we drop silently to keep run alive
  }
  return items
}

export const SCRAPER_ORDER: SourceType[] = [
  'hackernews',
  'rss',
  'github',
  'arxiv',
  'reddit',
  'telegram',
  'ossinsight',
]

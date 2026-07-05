// Orchestrator — TS port of code/src/orchestrator.py HorizonOrchestrator.run.
// P1: global pipeline. P2 adds per-user scoring + impact reasoning.

import { ContentAnalyzer, mergeTopicDuplicates } from './ai/analyzer'
import type { AIClient } from './ai/client'
import { DailySummarizer } from './ai/summarizer'
import { mergeCrossSourceDuplicates } from './dedup'
import { fetchAllSources } from './scrapers'
import type { Config, ContentItem } from './types'

export interface RunLog {
  startedAt: string
  endedAt: string | null
  stage: string
  itemCounts: {
    fetched: number
    merged: number
    analyzed: number
    filtered: number
    deduped: number
  }
  perSource: Record<string, number>
  error?: string
}

export interface RunResult {
  items: ContentItem[]
  digests: { lang: 'en' | 'zh'; markdown: string }[]
  log: RunLog
}

export class Orchestrator {
  constructor(
    private config: Config,
    private aiClient: AIClient,
  ) {}

  async run(): Promise<RunResult> {
    const startedAt = new Date().toISOString()
    const log: RunLog = {
      startedAt,
      endedAt: null,
      stage: 'start',
      itemCounts: { fetched: 0, merged: 0, analyzed: 0, filtered: 0, deduped: 0 },
      perSource: {},
    }

    try {
      // 1. Determine time window
      const since = new Date(Date.now() - this.config.filtering.timeWindowHours * 3600 * 1000)
      log.stage = 'fetch'

      // 2. Fetch all sources concurrently
      const allItems = await fetchAllSources(this.config, since)
      log.itemCounts.fetched = allItems.length
      for (const item of allItems) {
        const key = `${item.sourceType}/${subSourceLabel(item)}`
        log.perSource[key] = (log.perSource[key] ?? 0) + 1
      }

      if (!allItems.length) {
        log.stage = 'empty'
        log.endedAt = new Date().toISOString()
        return { items: [], digests: [], log }
      }

      // 3. Cross-source URL dedup
      log.stage = 'dedup-url'
      const merged = mergeCrossSourceDuplicates(allItems)
      log.itemCounts.merged = merged.length

      // 4. AI analysis pass (cheap filter model)
      log.stage = 'analyze'
      const analyzer = new ContentAnalyzer(this.aiClient, {
        concurrency: this.config.ai.analysisConcurrency,
        throttleSec: this.config.ai.throttleSec,
      })
      const analyzed = await analyzer.analyzeBatch(merged)
      log.itemCounts.analyzed = analyzed.length

      // 5. Score threshold filter
      log.stage = 'filter'
      const threshold = this.config.filtering.aiScoreThreshold
      const important = analyzed
        .filter((item) => item.aiScore !== null && item.aiScore >= threshold)
        .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
      log.itemCounts.filtered = important.length

      // 6. Semantic topic dedup (AI call)
      log.stage = 'dedup-topic'
      const deduped = await mergeTopicDuplicates(this.aiClient, important)
      log.itemCounts.deduped = deduped.length

      // 7. Generate summaries for each language
      log.stage = 'summarize'
      const today = new Date().toISOString().slice(0, 10)
      const summarizer = new DailySummarizer()
      const digests = await Promise.all(
        this.config.ai.languages.map(async (lang) => ({
          lang,
          markdown: await summarizer.generateSummary(deduped, today, allItems.length, lang),
        })),
      )

      log.stage = 'done'
      log.endedAt = new Date().toISOString()
      return { items: deduped, digests, log }
    } catch (err) {
      log.stage = 'error'
      log.error = err instanceof Error ? err.message : String(err)
      log.endedAt = new Date().toISOString()
      throw err
    }
  }
}

function subSourceLabel(item: ContentItem): string {
  const meta = item.metadata
  if (typeof meta.subreddit === 'string') return `r/${meta.subreddit}`
  if (typeof meta.feedName === 'string') return meta.feedName
  if (typeof meta.channel === 'string') return `@${meta.channel}`
  if (typeof meta.repo === 'string') return meta.repo
  if (typeof meta.category === 'string') return meta.category
  return item.author ?? 'unknown'
}

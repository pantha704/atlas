// Content analyzer — TS port of code/src/ai/analyzer.py ContentAnalyzer.
// Per-item AI call: score 0-10 + reason + summary + tags.
// P1: global scoring. P2: per-user scoring via profile injection.

import type { AnalysisResult, ContentItem } from '../types'
import { parseJsonResponse, sleep } from '../util'
import type { AIClient } from './client'
import { CONTENT_ANALYSIS_SYSTEM, CONTENT_ANALYSIS_USER } from './prompts'

const TOP_COMMENTS_MARKER = '--- Top Comments ---'

export class ContentAnalyzer {
  constructor(
    private client: AIClient,
    private opts: { concurrency?: number; throttleSec?: number; reasonModel?: string } = {},
  ) {}

  async analyzeBatch(items: ContentItem[]): Promise<ContentItem[]> {
    const concurrency = Math.max(this.opts.concurrency ?? 1, 1)
    const throttleSec = Math.max(this.opts.throttleSec ?? 0, 0)
    const semaphore = { count: 0, max: concurrency }

    const runOne = async (item: ContentItem, index: number): Promise<ContentItem> => {
      // Simple semaphore: wait until a slot is free
      while (semaphore.count >= semaphore.max) {
        await sleep(50)
      }
      semaphore.count++
      try {
        await this.analyzeItem(item)
      } catch (err) {
        console.error(`Error analyzing item ${item.id}:`, err)
        item.aiScore = 0
        item.aiReason = 'Analysis failed'
        item.aiSummary = item.title
        item.aiTags = []
      }
      if (throttleSec > 0 && index < items.length - 1) await sleep(throttleSec * 1000)
      return item
    }

    // ponytail: Promise.all runs them; semaphore gates concurrency. Simple and correct.
    await Promise.all(items.map((item, i) => runOne(item, i)))
    return items
  }

  private async analyzeItem(item: ContentItem): Promise<void> {
    // Prepare content section (split off comments if present)
    let contentSection = ''
    if (item.content) {
      const text = item.content
      if (text.includes(TOP_COMMENTS_MARKER)) {
        const parts = text.split(TOP_COMMENTS_MARKER, 1)
        const main = parts[0] ?? ''
        contentSection = `Content: ${main.trim().slice(0, 800)}`
      } else {
        contentSection = `Content: ${text.slice(0, 1000)}`
      }
    }

    // Prepare discussion section
    const discussionParts: string[] = []
    if (item.content?.includes(TOP_COMMENTS_MARKER)) {
      const commentsPart = item.content.split(TOP_COMMENTS_MARKER, 2)[1] ?? ''
      discussionParts.push(`Community Comments:\n${commentsPart.slice(0, 1500)}`)
    }
    const meta = item.metadata
    const engagement: string[] = []
    if (typeof meta.score === 'number') engagement.push(`score: ${meta.score}`)
    if (typeof meta.descendants === 'number') engagement.push(`${meta.descendants} comments`)
    if (typeof meta.numComments === 'number') engagement.push(`${meta.numComments} comments`)
    if (typeof meta.upvoteRatio === 'number')
      engagement.push(`upvote ratio: ${Math.round(meta.upvoteRatio * 100)}%`)
    if (engagement.length) discussionParts.push(`Engagement: ${engagement.join(', ')}`)
    if (typeof meta.discussionUrl === 'string')
      discussionParts.push(`Discussion: ${meta.discussionUrl}`)

    const discussionSection = discussionParts.join('\n')

    const userPrompt = CONTENT_ANALYSIS_USER.replace('{title}', item.title)
      .replace('{source}', item.sourceType)
      .replace('{author}', item.author ?? 'Unknown')
      .replace('{url}', item.url)
      .replace('{content_section}', contentSection)
      .replace('{discussion_section}', discussionSection)

    const response = await this.client.complete({
      system: CONTENT_ANALYSIS_SYSTEM,
      user: userPrompt,
      model: this.opts.reasonModel, // undefined → use client default
    })

    const parsed = parseJsonResponse<AnalysisResult>(response)
    if (!parsed || typeof parsed.score !== 'number') {
      item.aiScore = 0
      item.aiReason = 'Could not parse AI response'
      item.aiSummary = item.title
      item.aiTags = []
      return
    }
    item.aiScore = parsed.score
    item.aiReason = parsed.reason ?? ''
    item.aiSummary = parsed.summary ?? ''
    item.aiTags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t): t is string => typeof t === 'string')
      : []
  }
}

import { applyTopicDedup } from '../dedup'
// Semantic topic dedup — calls AI to identify duplicate groups, then applies merge.
import { TOPIC_DEDUP_SYSTEM, TOPIC_DEDUP_USER } from './prompts'

export async function mergeTopicDuplicates(
  client: AIClient,
  items: ContentItem[],
): Promise<ContentItem[]> {
  if (items.length <= 1) return items

  const lines = items.map((item, i) => {
    const tags = item.aiTags.length ? item.aiTags.join(', ') : '—'
    const summary = item.aiSummary ?? '—'
    return `[${i}] ${item.title}\n    Tags: ${tags}\n    Summary: ${summary}`
  })
  const itemsText = lines.join('\n\n')

  try {
    const response = await client.complete({
      system: TOPIC_DEDUP_SYSTEM,
      user: TOPIC_DEDUP_USER.replace('{items}', itemsText),
    })
    const result = parseJsonResponse<{ duplicates?: number[][] }>(response)
    if (!result?.duplicates) return items
    return applyTopicDedup(items, result.duplicates)
  } catch (err) {
    console.error('dedup: AI call failed, skipping', err)
    return items
  }
}

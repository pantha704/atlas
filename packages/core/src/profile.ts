// User profile + per-user scoring — the Atlas moat.
// Items are fetched globally, scored per-user against their profile.
// Feedback (up/down/dismiss) updates the profile's interest weights.

import type { AIClient } from './ai/client'
import { CONTENT_ANALYSIS_SYSTEM } from './ai/prompts'
import type { AnalysisResult, ContentItem } from './types'
import { parseJsonResponse, sleep } from './util'

// ===== Profile =====

export interface UserProfile {
  userId: string
  interests: string // free-text: "AI/ML, systems programming, Rust, distributed systems"
  stack: string[] // e.g. ["rust", "python", "pytorch", "k8s", "postgres"]
  // ponytail: tag weights as simple Record — promote to embedding when we add vector search
  tagWeights: Record<string, number> // tag → weight, updated by feedback
  language: 'en' | 'zh'
  threshold: number // per-user threshold override (default 7.0)
}

export function defaultProfile(userId: string): UserProfile {
  return {
    userId,
    interests: '',
    stack: [],
    tagWeights: {},
    language: 'en',
    threshold: 7.0,
  }
}

// ===== Per-user scoring prompt =====

const PER_USER_SYSTEM = `You are an expert content curator scoring news items for a specific user based on their profile.

Score content 0-10 based on TWO factors:
1. **Inherent importance** (same as global scoring): technical depth, novelty, impact on the field
2. **Relevance to THIS user**: how well it matches their stated interests, tech stack, and feedback history

The user's profile:
- Interests: {interests}
- Tech stack: {stack}
- Tags they care about (weighted by feedback): {tag_weights}

Scoring guidance:
- 9-10: Groundbreaking AND directly relevant to user's stack/interests
- 7-8: Important AND relevant to user's work
- 5-6: Interesting but only partially relevant
- 3-4: Routine or off-topic for this user
- 0-2: Noise or completely irrelevant

Return JSON only:
{
  "score": <number>,
  "reason": "<why this matters to THIS user specifically>",
  "summary": "<one-sentence summary>",
  "tags": ["<tag1>", "<tag2>", ...],
  "relevance": "<low|medium|high>" — how relevant to user's profile
}`

const PER_USER_USER = `Score this item for the user described in the system prompt.

Title: {title}
Source: {source}
Author: {author}
URL: {url}
{content_section}
{discussion_section}

Respond with valid JSON only.`

// ===== Per-user analyzer =====

export class PerUserAnalyzer {
  constructor(
    private client: AIClient,
    private profile: UserProfile,
    private opts: { concurrency?: number; throttleSec?: number; reasonModel?: string } = {},
  ) {}

  async analyzeBatch(items: ContentItem[]): Promise<ContentItem[]> {
    const concurrency = Math.max(this.opts.concurrency ?? 1, 1)
    const throttleSec = Math.max(this.opts.throttleSec ?? 0, 0)
    let active = 0

    const runOne = async (item: ContentItem, index: number): Promise<ContentItem> => {
      while (active >= concurrency) await sleep(50)
      active++
      try {
        await this.analyzeItem(item)
      } catch (err) {
        console.error(`Per-user analyze failed for ${item.id}:`, err)
        item.aiScore = 0
        item.aiReason = 'Analysis failed'
        item.aiSummary = item.title
        item.aiTags = []
      }
      if (throttleSec > 0 && index < items.length - 1) await sleep(throttleSec * 1000)
      active--
      return item
    }

    await Promise.all(items.map((item, i) => runOne(item, i)))
    return items
  }

  private async analyzeItem(item: ContentItem): Promise<void> {
    let contentSection = ''
    if (item.content) {
      const text = item.content
      if (text.includes('--- Top Comments ---')) {
        const parts = text.split('--- Top Comments ---', 1)
        const main = parts[0] ?? ''
        contentSection = `Content: ${main.trim().slice(0, 800)}`
      } else {
        contentSection = `Content: ${text.slice(0, 1000)}`
      }
    }

    const meta = item.metadata
    const discussionParts: string[] = []
    if (item.content?.includes('--- Top Comments ---')) {
      const commentsPart = item.content.split('--- Top Comments ---', 2)[1] ?? ''
      discussionParts.push(`Community Comments:\n${commentsPart.slice(0, 1500)}`)
    }
    const engagement: string[] = []
    if (typeof meta.score === 'number') engagement.push(`score: ${meta.score}`)
    if (typeof meta.descendants === 'number') engagement.push(`${meta.descendants} comments`)
    if (typeof meta.numComments === 'number') engagement.push(`${meta.numComments} comments`)
    if (engagement.length) discussionParts.push(`Engagement: ${engagement.join(', ')}`)
    if (typeof meta.discussionUrl === 'string')
      discussionParts.push(`Discussion: ${meta.discussionUrl}`)
    const discussionSection = discussionParts.join('\n')

    // Build per-user system prompt with profile injected
    const tagWeightsStr = Object.entries(this.profile.tagWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, weight]) => `${tag}(${weight})`)
      .join(', ')

    const systemPrompt = PER_USER_SYSTEM.replace(
      '{interests}',
      this.profile.interests || 'general tech news',
    )
      .replace('{stack}', this.profile.stack.join(', ') || 'not specified')
      .replace('{tag_weights}', tagWeightsStr || 'no feedback yet')

    const userPrompt = PER_USER_USER.replace('{title}', item.title)
      .replace('{source}', item.sourceType)
      .replace('{author}', item.author ?? 'Unknown')
      .replace('{url}', item.url)
      .replace('{content_section}', contentSection)
      .replace('{discussion_section}', discussionSection)

    const response = await this.client.complete({
      system: systemPrompt,
      user: userPrompt,
      model: this.opts.reasonModel,
    })

    const parsed = parseJsonResponse<AnalysisResult & { relevance?: string }>(response)
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

// ===== Feedback → profile update =====

export type FeedbackSignal = 'up' | 'down' | 'dismiss' | 'bookmark'

// Update tag weights based on feedback. Up/bookmark boost, down/dismiss reduce.
export function applyFeedbackToProfile(
  profile: UserProfile,
  signal: FeedbackSignal,
  itemTags: string[],
): UserProfile {
  const delta = signal === 'up' || signal === 'bookmark' ? 1 : -1
  const weight = signal === 'bookmark' ? 2 : 1 // bookmark counts double
  const newWeights = { ...profile.tagWeights }
  for (const tag of itemTags) {
    const current = newWeights[tag] ?? 0
    newWeights[tag] = Math.max(0, current + delta * weight)
  }
  return { ...profile, tagWeights: newWeights }
}

// Derive interests text from top tag weights (for display + AI prompt context)
export function deriveInterestsFromWeights(tagWeights: Record<string, number>): string {
  const top = Object.entries(tagWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag)
  return top.join(', ')
}

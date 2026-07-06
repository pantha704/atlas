// Impact reasoner — for a user's top-N items, answers:
// "does this affect YOUR stack? what should you do? confidence?"
// Uses the configured reason model (Groq 70b) with Gemini fallback via AIClient.

import type { UserProfile } from '../profile'
import type { ContentItem, ImpactResult } from '../types'
import { parseJsonResponse } from '../util'
import type { AIClient } from './client'

const IMPACT_SYSTEM = `You are a senior engineer advising a developer on whether a news item affects their specific tech stack.

The developer's stack: {stack}
The developer's interests: {interests}

Analyze the news item and determine:
1. **affects_stack**: Does this news directly impact any technology, tool, or framework in the developer's stack? Be specific — a Rust release affects Rust users; a Python tutorial does NOT affect a Rust-only developer.
2. **affected_components**: List which specific stack items are affected (empty array if none).
3. **action**: One concrete action the developer should take (e.g. "upgrade to v2.1", "review breaking changes", "no action needed"). Keep to one sentence.
4. **confidence**: How confident are you in this assessment? low/medium/high.

Return JSON only:
{
  "affects_stack": <true|false>,
  "affected_components": ["<stack_item>", ...],
  "action": "<one-sentence action>",
  "confidence": "<low|medium|high>"
}`

const IMPACT_USER = `Analyze the impact of this news item on the developer's stack.

Title: {title}
Source: {source}
Score: {score}/10
Summary: {summary}
Tags: {tags}
Content excerpt: {content}

Respond with valid JSON only.`

export class ImpactReasoner {
  constructor(
    private client: AIClient,
    private opts: { reasonModel?: string } = {},
  ) {}

  async reason(item: ContentItem, profile: UserProfile): Promise<ImpactResult> {
    const systemPrompt = IMPACT_SYSTEM.replace(
      '{stack}',
      profile.stack.join(', ') || 'not specified',
    ).replace('{interests}', profile.interests || 'general tech')

    const contentExcerpt = (item.content ?? '').slice(0, 600)
    const userPrompt = IMPACT_USER.replace('{title}', item.title)
      .replace('{source}', item.sourceType)
      .replace('{score}', String(item.aiScore ?? 'N/A'))
      .replace('{summary}', item.aiSummary ?? item.title)
      .replace('{tags}', item.aiTags.join(', ') || '—')
      .replace('{content}', contentExcerpt || 'no content available')

    const response = await this.client.complete({
      system: systemPrompt,
      user: userPrompt,
      model: this.opts.reasonModel,
    })

    // AI returns snake_case keys per prompt; map to camelCase interface
    const parsed = parseJsonResponse<{
      affects_stack?: boolean
      affected_components?: unknown[]
      action?: string
      confidence?: string
    }>(response)
    if (!parsed) {
      return {
        affectsStack: false,
        affectedComponents: [],
        action: 'Could not determine impact.',
        confidence: 'low' as const,
      }
    }
    const conf = parsed.confidence
    return {
      affectsStack: typeof parsed.affects_stack === 'boolean' ? parsed.affects_stack : false,
      affectedComponents: Array.isArray(parsed.affected_components)
        ? parsed.affected_components.filter((c): c is string => typeof c === 'string')
        : [],
      action: typeof parsed.action === 'string' ? parsed.action : 'No action needed.',
      confidence: conf === 'high' || conf === 'medium' || conf === 'low' ? conf : ('low' as const),
    }
  }

  async reasonBatch(
    items: ContentItem[],
    profile: UserProfile,
    limit = 3,
  ): Promise<Map<string, ImpactResult>> {
    const top = items.slice(0, limit)
    const results = new Map<string, ImpactResult>()
    // ponytail: sequential — reasoning calls are expensive, avoid hammering rate limits
    for (const item of top) {
      try {
        const impact = await this.reason(item, profile)
        results.set(item.id, impact)
      } catch (err) {
        console.error(`Impact reasoning failed for ${item.id}:`, err)
      }
    }
    return results
  }
}

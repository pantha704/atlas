// Atlas core types — TS port of code/src/models.py
// Per-user scoring is the moat: items are global, scores are per-user.

export type SourceType =
  | 'hackernews'
  | 'rss'
  | 'github'
  | 'arxiv'
  | 'reddit'
  | 'telegram'
  | 'ossinsight'

export const SOURCE_TYPES: readonly SourceType[] = [
  'hackernews',
  'rss',
  'github',
  'arxiv',
  'reddit',
  'telegram',
  'ossinsight',
] as const

// ponytail: metadata as Record<string, unknown> — promotes to typed per-source later if needed
export interface ContentItem {
  id: string // {source}:{subtype}:{native_id}
  sourceType: SourceType
  title: string
  url: string
  content: string | null
  author: string | null
  publishedAt: string // ISO 8601
  fetchedAt: string // ISO 8601
  metadata: Record<string, unknown>

  // AI analysis (filled by analyzer; per-user in DB but global on the item)
  aiScore: number | null
  aiReason: string | null
  aiSummary: string | null
  aiTags: string[]
}

export function makeItem(input: {
  sourceType: SourceType
  subtype: string
  nativeId: string
  title: string
  url: string
  content?: string | null
  author?: string | null
  publishedAt: string
  metadata?: Record<string, unknown>
}): ContentItem {
  return {
    id: `${input.sourceType}:${input.subtype}:${input.nativeId}`,
    sourceType: input.sourceType,
    title: input.title,
    url: input.url,
    content: input.content ?? null,
    author: input.author ?? null,
    publishedAt: input.publishedAt,
    fetchedAt: new Date().toISOString(),
    metadata: input.metadata ?? {},
    aiScore: null,
    aiReason: null,
    aiSummary: null,
    aiTags: [],
  }
}

// ===== Source configs (TS port of models.py source configs) =====

export interface GitHubSourceConfig {
  type: 'user_events' | 'repo_releases'
  username?: string
  owner?: string
  repo?: string
  enabled: boolean
}

export interface HackerNewsConfig {
  enabled: boolean
  fetchTopStories: number // default 30
  minScore: number // default 100
}

export interface RSSSourceConfig {
  name: string
  url: string
  enabled: boolean
  category?: string
}

export interface RedditSubredditConfig {
  subreddit: string
  enabled: boolean
  sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial'
  timeFilter: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  fetchLimit: number
  minScore: number
}

export interface RedditUserConfig {
  username: string
  enabled: boolean
  sort: 'new' | 'hot' | 'top'
  fetchLimit: number
}

export interface RedditConfig {
  enabled: boolean
  subreddits: RedditSubredditConfig[]
  users: RedditUserConfig[]
  fetchComments: number // top comments per post, 0 to disable
}

export interface TelegramChannelConfig {
  channel: string
  enabled: boolean
  fetchLimit: number
}

export interface TelegramConfig {
  enabled: boolean
  channels: TelegramChannelConfig[]
}

export interface ArxivCategoryConfig {
  category: string // e.g. "cs.AI", "cs.LG", "stat.ML"
  enabled: boolean
}

export interface ArxivConfig {
  enabled: boolean
  categories: ArxivCategoryConfig[]
  maxResults: number // per category, default 30
}

export interface OSSInsightConfig {
  enabled: boolean
  period: 'past_24_hours' | 'past_28_days'
  languages: string[] // ["All", "Python", "TypeScript"]
  keywords: string[]
  minStars: number
  maxItems: number
}

export interface SourcesConfig {
  github: GitHubSourceConfig[]
  hackernews: HackerNewsConfig
  rss: RSSSourceConfig[]
  reddit: RedditConfig
  telegram: TelegramConfig
  arxiv: ArxivConfig
  ossinsight: OSSInsightConfig
}

// ===== AI config =====

export interface AIConfig {
  provider: 'groq' | 'gemini'
  // Groq: cheap filter model + reasoning model
  cheapModel: string // e.g. "llama-3.1-8b-instant" — bulk filter pass
  reasonModel: string // e.g. "llama-3.3-70b-versatile" — top-K + impact
  apiKeyEnv: string // env var name
  baseUrl?: string
  temperature: number
  maxTokens: number
  throttleSec: number
  analysisConcurrency: number
  languages: ('en' | 'zh')[]
  // ponytail: gemini fallback fields — single env, optional
  geminiApiKeyEnv?: string
  geminiModel?: string
}

export interface FilteringConfig {
  aiScoreThreshold: number // default 7.0 — raised from current 5.0 filler
  timeWindowHours: number
}

export interface Config {
  version: string
  ai: AIConfig
  sources: SourcesConfig
  filtering: FilteringConfig
}

// ===== AI analysis result =====

export interface AnalysisResult {
  score: number
  reason: string
  summary: string
  tags: string[]
}

export interface EnrichmentResult {
  titleEn: string
  titleZh: string
  whatsNewEn: string
  whatsNewZh: string
  whyItMattersEn: string
  whyItMattersZh: string
  keyDetailsEn: string
  keyDetailsZh: string
  backgroundEn: string
  backgroundZh: string
  communityDiscussionEn: string
  communityDiscussionZh: string
  sources: string[]
}

// v0.3: impact reasoning — "does this affect YOUR stack? what should you do?"
export interface ImpactResult {
  affectsStack: boolean
  affectedComponents: string[] // which of user's stack items are affected
  action: string // what the user should do
  confidence: 'low' | 'medium' | 'high'
}

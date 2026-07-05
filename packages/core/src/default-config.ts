// Default Atlas config — free-tier-only, 7 sources, threshold 7.0 (no filler).
// This is the global/public config. P2 adds per-user overrides.

import type { Config } from './types'

export const DEFAULT_CONFIG: Config = {
  version: '0.1.0',
  ai: {
    provider: 'groq',
    cheapModel: 'llama-3.1-8b-instant',
    reasonModel: 'llama-3.3-70b-versatile',
    apiKeyEnv: 'GROQ_API_KEY',
    baseUrl: 'https://api.groq.com/openai/v1',
    temperature: 0.3,
    maxTokens: 2000,
    throttleSec: 1, // ponytail: light throttle; raise if Groq rate-limits
    analysisConcurrency: 3,
    languages: ['en', 'zh'],
    geminiApiKeyEnv: 'GEMINI_API_KEY',
    geminiModel: 'gemini-2.5-flash',
  },
  sources: {
    github: [
      { type: 'user_events', username: 'karpathy', enabled: true },
      { type: 'repo_releases', owner: 'vllm-project', repo: 'vllm', enabled: true },
      { type: 'repo_releases', owner: 'sgl-project', repo: 'sglang', enabled: true },
      { type: 'repo_releases', owner: 'triton-lang', repo: 'triton', enabled: true },
    ],
    hackernews: {
      enabled: true,
      fetchTopStories: 30,
      minScore: 150,
    },
    rss: [
      {
        name: 'Simon Willison',
        url: 'https://simonwillison.net/atom/everything/',
        enabled: true,
        category: 'ai-ml',
      },
      {
        name: 'GitHub Trending Daily',
        url: 'https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml',
        enabled: true,
        category: 'trending',
      },
    ],
    reddit: {
      enabled: true,
      subreddits: [
        {
          subreddit: 'MachineLearning',
          enabled: true,
          sort: 'hot',
          timeFilter: 'day',
          fetchLimit: 25,
          minScore: 10,
        },
        {
          subreddit: 'LocalLLaMA',
          enabled: true,
          sort: 'hot',
          timeFilter: 'day',
          fetchLimit: 25,
          minScore: 10,
        },
      ],
      users: [],
      fetchComments: 5,
    },
    telegram: {
      enabled: true,
      channels: [{ channel: 'ai_china', enabled: true, fetchLimit: 20 }],
    },
    arxiv: {
      enabled: true,
      categories: [
        { category: 'cs.AI', enabled: true },
        { category: 'cs.LG', enabled: true },
        { category: 'cs.CL', enabled: true },
        { category: 'stat.ML', enabled: true },
      ],
      maxResults: 30,
    },
    ossinsight: {
      enabled: true,
      period: 'past_24_hours',
      languages: ['All', 'Python', 'TypeScript'],
      keywords: [],
      minStars: 50,
      maxItems: 20,
    },
  },
  filtering: {
    aiScoreThreshold: 7.0, // raised from 5.0 — kills filler
    timeWindowHours: 24,
  },
}

// Badges — computed from contribution data, no DB calls.
// 🌱 first / 🌟 quality (avg >= 7.0) / 🔥 popular (>= 50 users) / 👑 core (>= 10 sources)

export interface BadgeInput {
  sourceCount: number
  maxAvgScore: number
  maxUserCount: number
}

export type Badge = 'first' | 'quality' | 'popular' | 'core'

export function computeBadges(input: BadgeInput): Badge[] {
  const badges: Badge[] = []
  if (input.sourceCount >= 1) badges.push('first')
  if (input.maxAvgScore >= 7.0) badges.push('quality')
  if (input.maxUserCount >= 50) badges.push('popular')
  if (input.sourceCount >= 10) badges.push('core')
  return badges
}

export const BADGE_EMOJI: Record<Badge, string> = {
  first: '🌱',
  quality: '🌟',
  popular: '🔥',
  core: '👑',
}

export const BADGE_LABEL: Record<Badge, string> = {
  first: 'First Contribution',
  quality: 'Quality Contributor',
  popular: 'Popular Contributor',
  core: 'Core Contributor',
}

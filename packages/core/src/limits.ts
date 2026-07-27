// Freemium plan limits — enforced at API boundaries.
// Free: web digest only, 10 sources, top-3 impact. Pro: full delivery + top-10 impact.

export type Plan = 'free' | 'pro'

export const FREE_SOURCE_LIMIT = 10
export const FREE_IMPACT_TOP_N = 3
export const PRO_IMPACT_TOP_N = 10
export const FREE_DIGEST_HISTORY_DAYS = 7
export const REFERRALS_FOR_PRO_MONTH = 3

export function impactTopN(plan: Plan): number {
  return plan === 'pro' ? PRO_IMPACT_TOP_N : FREE_IMPACT_TOP_N
}

export function canAddSource(plan: Plan, currentCount: number): boolean {
  if (plan === 'pro') return true
  return currentCount < FREE_SOURCE_LIMIT
}

export function canUseDelivery(plan: Plan, channel: 'web' | 'email' | 'rss' | 'webhook'): boolean {
  if (channel === 'web') return true
  return plan === 'pro'
}

export function sourceLimitMessage(plan: Plan): string {
  if (plan === 'pro') return ''
  return `Free plan allows ${FREE_SOURCE_LIMIT} sources. Upgrade to Pro for unlimited.`
}

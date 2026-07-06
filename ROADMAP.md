# Atlas roadmap

## v0.1 — Foundation ✅

- Monorepo: Astro + Hono + Turso + Better-Auth
- 7 scrapers: HN, RSS, GitHub, arXiv, Reddit, Telegram, OSS Insight
- Public daily digest (EN/ZH)
- CI: typecheck → lint → build → test → deploy preview

## v0.2 — Personalization ✅

- User profiles (interests + stack)
- Per-user scoring
- Feedback loop (up / down / dismiss / bookmark)
- Source connection UI + API
- Onboarding flow

## v0.3 — Impact reasoning ✅

- Stack extraction (GitHub deps, declared interests)
- Reasoning model pass on top-3 items
- Impact cards: "affects your stack? action? confidence?"

## v0.4 — Delivery ✅

- Email (Resend), per-user RSS, webhooks
- Delivery preferences UI in profile
- Digest saved to DB, delivery status tracked

## v0.5 — Source market ✅

- Public source directory (browse, filter, sort)
- Source submission + auto quality check
- One-click "add to my sources"

## v0.6 — Polish + trust ✅

- Landing page (marketing, not pitch)
- Docs page with self-host guide + API reference
- Legal pages (privacy, terms, security)
- Public digest sharing (shares table + /share route)
- Referral tracking (referrals table + ?ref= cookie)
- Billing stubs (Stripe routes, 501 until configured)

## v0.7 — Growth ✅

- Sitemap.xml (auto-generated with market pages)
- Public profile (/u/:username with contributions)
- Referral hook in signup flow

## v1.0 — OSS release ✅

- CLA + FUNDING.yml
- README v2 with architecture diagram
- Self-host guide (<15 min)
- Tagged release

## v1.1 — Team (next)

- Team workspaces (shared sources, team digest)
- Leaderboards (top contributors)
- Badges (🌱 first / 🌟 quality / 🔥 popular / 👑 core)
- Source health monitoring (decay detection)
- Pro analytics

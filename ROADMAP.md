# Atlas roadmap

## v0.1 — Foundation (current)

- Monorepo: Astro + Hono + Turso + Better-Auth
- 7 scrapers: HN, RSS, GitHub, arXiv, Reddit, Telegram, OSS Insight
- Public daily digest (EN/ZH)
- CI: typecheck → lint → build → test → deploy preview

## v0.2 — Personalization

- User profiles (interests + stack)
- Per-user scoring
- Feedback loop (up / down / dismiss / bookmark)
- Source connection UI + API
- Onboarding flow

## v0.3 — Impact reasoning

- Stack extraction (GitHub deps, declared interests)
- Reasoning model pass on top-3 items
- Impact cards: "affects your stack? action? confidence?"

## v0.4 — Delivery

- Dashboard with today's digest
- Item detail pages
- Email (Resend), per-user RSS, webhooks (Slack/Discord/generic)

## v0.5 — Polish + trust

- Landing page
- Starlight docs
- Legal pages (privacy, terms, security)
- PostHog + Sentry
- Lighthouse 95+, WCAG 2.2 AA
- Demo mode with seeded data

## v1.0 — OSS release

- CLA + FUNDING.yml
- Self-host quickstart (<15 min)
- Tagged release + changelog

# Atlas

**Your personal news agent.** Connect your sources — Atlas tells you what changed, what it means for your stack, and what to do next.

**Live:** [atlas-nine-ashy.vercel.app](https://atlas-nine-ashy.vercel.app) · **Repo:** [github.com/pantha704/atlas](https://github.com/pantha704/atlas)

[![CI](https://github.com/pantha704/atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/pantha704/atlas/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](./LICENSE)

## Why

Information overload is solved for the crowd (HN, daily.dev, TLDR). It's unsolved for _you_ — the engineer who cares about a specific stack, a handful of repos, a few research areas. You need 5 stories that matter to _your_ work, not 30 that matter to everyone's.

Atlas is a personal news agent, not a feed. It scores every item against _your_ profile, reasons about impact on _your_ stack, and compounds — the more you use it, the sharper it gets.

## How it works

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sources    │────▶│   Fetcher    │────▶│   Dedup      │
│  HN, RSS,   │     │  7 scrapers  │     │  URL + topic │
│  GitHub...  │     └──────────────┘     └──────┬───────┘
└─────────────┘                                  │
                                                 ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Dashboard  │◀────│  Summarizer  │◀────│  AI Scoring  │
│  /email/    │     │  EN + ZH     │     │  per-user    │
│  /rss/webhook│    └──────────────┘     │  Groq        │
└─────────────┘                          └──────┬───────┘
                                                │
                                         ┌──────▼───────┐
                                         │  Impact      │
                                         │  Reasoning   │
                                         │  "affects U?" │
                                         └──────────────┘
```

1. **Connect sources** — GitHub repos, arXiv, RSS, HN, Reddit, Telegram, OSS Insight. Or browse the [source market](https://atlas-nine-ashy.vercel.app/market).
2. **Atlas fetches daily** — deduplicates across sources, scores 0–10 against your profile.
3. **Impact reasoning** — for your top items, a reasoning model answers: does this affect your stack? what should you do?
4. **Deliver** — web dashboard, email, RSS, or webhook. EN + 中文.

## Moat

- **Your profile** — every upvote/downvote refines your scoring. Switching cost = lose your taste graph.
- **Network effect** — every user's source additions flow into the public market. Aggregated judgments → collective quality signal.
- **Unit economics** — items fetched once globally, scored per-user. Marginal cost per user ≈ $0 on free tiers.

## Stack

Astro (SSR) · Hono API · Vercel · Turso (libSQL) · Drizzle · Groq · Tailwind v4 · Razorpay (billing). Designed to run on free tiers.

## Quick start

```bash
git clone https://github.com/pantha704/atlas.git
cd atlas
bun install
cp .env.example .env   # GROQ_API_KEY, Turso, GitHub OAuth, secrets
bun dev
```

Open `http://localhost:4321` (web) — API is served under `/api` in the monorepo layout.

## Deploy (Vercel + Turso)

Production today:

| Piece | Service |
|-------|---------|
| Web + API | [Vercel](https://vercel.com) (`apps/web` + `/api/*` route) |
| Database | [Turso](https://turso.tech) |
| AI | [Groq](https://console.groq.com) |
| Auth | GitHub OAuth |

```bash
# Link project, set env (TURSO_*, GROQ_API_KEY, GITHUB_*, BETTER_AUTH_SECRET,
# APP_URL / WEB_URL = https://atlas-nine-ashy.vercel.app)
# GitHub OAuth callback:
#   https://atlas-nine-ashy.vercel.app/api/auth/callback
bun run build
# Deploy via Vercel Git integration or: bunx vercel --prod
```

See in-app [docs](https://atlas-nine-ashy.vercel.app/docs) for the full guide.

## Status

Active production on Vercel. Auth, personal digests, sources, and market are live. See [ROADMAP](./ROADMAP.md) and [EXECUTION_PLAN](./EXECUTION_PLAN.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). By contributing, you agree to the [CLA](./CLA.md).

## License

[AGPL-3.0-or-later](./LICENSE). Commercial SaaS use requires a license — see [CONTRIBUTING](./CONTRIBUTING.md).

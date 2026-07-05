# Atlas

**Your personal news agent.** Connect your sources — Atlas tells you what changed, what it means for your stack, and what to do next.

[![CI](https://github.com/pantha704/atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/pantha704/atlas/actions/workflows/ci.yml)

## Why

Information overload is solved for the crowd (Hacker News, daily.dev, TLDR). It's unsolved for _you_ — the engineer who cares about a specific stack, a handful of repos, a few research areas. You don't need 30 stories a day. You need the 5 that matter to _your_ work, with a note on what changed and what to do about it.

Atlas is a personal news agent, not a feed. It scores every item against _your_ profile, reasons about impact on _your_ stack, and compounds — the more you use it, the sharper it gets.

## How it works

1. **Connect sources** — GitHub repos, arXiv categories, RSS feeds, HN, Reddit, Telegram channels.
2. **Atlas fetches daily** — deduplicates across sources, scores 0–10 against your profile.
3. **Impact reasoning** — for your top items, a reasoning model answers: does this affect your stack? what should you do?
4. **Deliver** — web dashboard, email, RSS, or webhook. EN + 中文.

## Moat

Per-user scoring + feedback loop. Every upvote/downvote/dismiss refines your profile. Items fetched once globally, scored per-user. No competitor can replicate _your_ profile.

## Stack

Astro · Hono · Cloudflare Workers · Turso (libSQL) · Drizzle · Better-Auth · Groq + Gemini · Tailwind v4. Every service on a free tier.

## Quick start

```bash
git clone https://github.com/pantha704/atlas.git
cd atlas
bun install
bun dev
```

## Self-host

```bash
bun install
cp .env.example .env  # fill in GROQ_API_KEY, GITHUB_CLIENT_ID, etc.
bunx wrangler deploy
```

See [`docs/self-host`](https://atlas.pages.dev/docs/self-host).

## Status

v0.1 — in active development. See [ROADMAP](./ROADMAP.md).

## License

[AGPL-3.0-or-later](./LICENSE). Commercial SaaS use requires a license — see [CONTRIBUTING](./CONTRIBUTING.md) for CLA details.

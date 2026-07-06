# Atlas — VC-grade build plan

> Redesigned 2026-07-05 for VC/YC readiness. Free for users, free-tier ops, scalable.
> Built on Phases 0-2 (foundation + core pipeline + personalization, 3 commits, 48 tests passing).

---

## 1. Vision (pitch-grade)

**One line:** Your personal news agent. Not a feed — it scores every item against _your_ profile, reasons about impact on _your_ stack, compounds with use.

**The wedge:** Information overload is solved for the crowd (HN, daily.dev, TLDR). Unsolved for _you_ — the engineer who cares about a specific stack, handful of repos, few research areas. You need 5 stories that matter to _your_ work, not 30 that matter to everyone's.

**Why now:**
- AI scoring is cheap enough (Groq free tier = 14k req/day) — wasn't viable 2 years ago
- Per-user LLM personalization finally works at edge scale
- Edge compute (CF Workers free) makes near-zero infra cost possible
- Info overload is getting worse; existing aggregators are crowd-only

**Platform thesis (the YC hook):** Atlas is a Distributed Agent OS. Each user runs an independent agent scoring items against their profile. Every user's source additions flow into a public market. Aggregated independent judgments → collective quality signal no static list can match (Condorcet Jury logic). The more users, the sharper the signal for everyone.

---

## 2. ICP + wedge

**Primary:** Solo engineer / indie dev. PLG-native, GitHub OAuth (30s signup), freemium clean.

**Expansion:** Small dev teams (5-50) in v1.1 — shared sources, team digests, admin. Then devtools/OSS maintainers.

**Wedge:** GitHub-authenticated developers who already read HN/Reddit/Twitter daily and want it filtered to their stack. ~30M developers globally, all have info overload.

**Acquisition:** Bottom-up. No sales. Viral via shared digests + source market.

---

## 3. Moat (3 layers)

1. **Your profile (switching cost):** every upvote/downvote/dismiss refines your taste graph. No competitor can replicate _your_ profile. Leaving = losing months of calibration.

2. **Network effect (Hub layer):** every user's source additions become public market. Next user discovers better sources faster. Aggregated quality signal compounds. Built once, defended by density.

3. **Unit economics (structural):** items fetched once globally, scored per-user. Marginal cost per user = AI scoring only, and AI cost is falling. Free-tier covers first ~1.4k users at $0 infra.

---

## 4. Revenue (freemium, defined)

Schema already has `plan: free|pro`. Defining it:

| | Free | Pro ($8/mo) |
|---|---|---|
| Sources | 10 | Unlimited |
| Scoring model | Groq 8b (fast) | Groq 8b + Gemini Flash reasoning pass |
| Delivery | Web dashboard | + Email, RSS, webhooks |
| Impact reasoning | Top 3 items | Top 10 items |
| Digest history | 7 days | Unlimited + export |
| Public digest share | Yes (with "Powered by Atlas") | Yes (custom branding off) |
| Source market | Browse + submit | + private sources, quality analytics |
| Profile export | — | Yes (JSON, portable) |

**Team tier ($12/user/mo, v1.1):** shared sources, team digests, admin panel, SSO.

**Conversion triggers (natural, not paywalled pain):**
- Power user hits 10-source limit → pro
- User wants email/RSS delivery → pro
- User wants deeper reasoning (top-10 + 70b model) → pro
- Team wants shared digest → team tier

**Billing:** Stripe (v0.6). Lemonsqueezy as merchant-of-record alternative if Stripe is unavailable in region. `stripe_customer_id` + `trial_ends_at` columns added in v0.6.

---

## 5. Architecture (free-tier, with ceilings)

### Stack (all free tier)

| Layer | Service | Free ceiling | Atlas use |
|---|---|---|---|
| Edge compute | CF Workers | 100k req/day, 10ms CPU/inv | API + cron + SSR |
| Edge cache | CF KV | 100k reads/day, 1k writes/day | Digest cache, session lookup |
| Static assets | CF Pages | Unlimited | Web app (Astro build) |
| Object storage | CF R2 | 10GB | Generated digest HTML, OG images |
| Email | MailChannels (via CF Workers) | **Unlimited** | Digest delivery — NOT Resend, saves free tier |
| DB | Turso (libSQL) | 500 DBs, 9GB, 1B reads/mo, 25M writes/mo | Source of truth |
| AI scoring | Groq | 30 req/min, 14k req/day | Primary scorer (llama-3.1-8b-instant) |
| AI reasoning | Gemini 2.0 Flash | 15 req/min, 1.5k req/day | Reasoning pass + Groq overflow fallback |
| AI overflow | Together.ai | $1 free credit/mo | Tertiary fallback at scale |
| Auth | GitHub OAuth | Free, no rate limit | Primary auth |
| Analytics | PostHog | 1M events/mo | Product analytics |
| Errors | Sentry | 5k errors/mo | Error tracking |
| CI | GitHub Actions | 2k min/mo | typecheck → lint → build → test → deploy |

### The real bottleneck: AI throughput

Groq 14k req/day is the ceiling. Math:
- 50 items/user/day × 1 score/item = 50 AI calls/user/day
- 14k / 50 = **~280 active users on Groq free alone**
- + Gemini overflow (1.5k/day) = ~310 users
- + Together.ai ($1 credit ≈ 20k calls) = ~700 users at $1/mo

**Optimization (already designed, needs wiring):**
- Global fetch once → store items → per-user score on-demand (when user opens `/my-digest`), not batch
- Cache scores for items scoring <7.0 (80% of items) — only deeply score high-signal candidates per user
- Share global scores across users with identical source configs (cold-start)
- KV-cache rendered digests per user per day (1-day TTL)

**Scale path (for VC pitch):**
| Users | Infra cost | How |
|---|---|---|
| 0-700 | $0 | Free tiers only (Groq + Gemini + Together free credit) |
| 700-5k | ~$50/mo | Paid Groq ($0.05/M tokens) |
| 5k-50k | ~$500/mo | Groq + Gemini paid + CF Workers paid ($5/mo) |
| 50k+ | ~$2k/mo | Multi-provider routing, KV heavy use |

**Revenue at 100k users (5% pro conversion):** 5k × $8 = **$40k MRR, ~95% gross margin.**

### Request flow

```
CF Cron (06:00 UTC)
  → fetch all enabled sources globally (isolation per scraper)
  → dedup URL + semantic topic
  → store items in Turso (raw, unscored)
  → write KV: "fetch complete" signal

User opens /my-digest (on-demand)
  → load user profile + sources
  → for each unscored item: score per-user (Groq → Gemini fallback)
  → cache score in `scores` table (never re-score same item+user)
  → filter ≥ threshold (user-configurable, default 7.0)
  → dedup → render markdown → cache in KV (1-day TTL)
  → return rendered digest
```

### Reliability

- **Cron failure:** retry 3× with exp backoff, Sentry alert on final fail
- **AI 429:** Groq → Gemini → Together → skip+log (never crash, partial digest OK)
- **Scraper failure:** isolation (one fails, others continue — already in code), partial digest with "N sources fetched" note
- **DB outage:** KV serves stale digest (stale-while-revalidate, 1-day grace)
- **Email failure:** queue in `deliveries` table (status=pending), retry on next cron
- **Error budget:** Sentry alert if error rate >1% over 24h

---

## 6. Schema additions

Existing 11 tables cover Phases 0-2. Adding for Hub + growth:

```sql
-- v0.5: Source market (minimal)
CREATE TABLE public_sources (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,           -- hackernews|rss|github|arxiv|reddit|telegram|ossinsight
  config_json TEXT NOT NULL,    -- canonical config (name, url, channel, etc.)
  name TEXT NOT NULL,
  bio TEXT,
  field_tags TEXT,              -- "ai,systems,security" csv
  contributor_id TEXT REFERENCES users(id),
  contributor_count INTEGER DEFAULT 1,
  user_count INTEGER DEFAULT 0, -- cached count of users with this source
  avg_score REAL DEFAULT 0,     -- cached avg AI score across all items from this source
  snr REAL DEFAULT 0,           -- % items passing threshold
  status TEXT DEFAULT 'online', -- online|pending|deprecated
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contributions (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES public_sources(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,         -- submit|vouch|flag
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_id, user_id, action)
);

-- v0.6: Growth
CREATE TABLE shares (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,    -- short url slug
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  digest_id TEXT REFERENCES digests(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  referred_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  reward TEXT,                  -- "1mo_pro" etc
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- v0.6: Billing
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN trial_ends_at TEXT;
```

**Existing fields that need use:** `users.plan` (free|pro), `deliveries.channel` (web|email|rss|webhook), `deliveries.status` (pending|sent|failed), `runs.type` (fetch|score|enrich|digest|deliver|full).

---

## 7. UI/UX system (Linear-style, professional)

### Aesthetic

Dark-first (atlas tokens already have light/dark/system). Dense, keyboard-first, content-forward. Score tier colors already in atlas (emerald/teal/amber/slate). Monospace accents for technical feel. Motion: subtle, fast (150-200ms), no bounce.

### Stack decision: Astro + React islands + shadcn/ui

Atlas web is currently Astro-only (`.astro` files). For Linear-grade interactivity (cmd+k palette, inline edits, dropdowns, dialogs) we need client JS. Decision:

- **Astro** for static/marketing/docs/landing (SEO, fast, zero JS)
- **React islands** via `@astrojs/react` for interactive pages (dashboard, sources, onboarding, profile, source market)
- **shadcn/ui** (Radix + Tailwind v4 — atlas already on Tailwind v4) for components
- **Framer Motion** for subtle motion (skills available: `framer-motion-animator`, `gsap-react`)
- **lucide-react** for icons (matches Linear aesthetic)

**Cost:** ~50kb JS on interactive pages only. Static pages stay zero-JS. Acceptable for the aesthetic.

### Page inventory

| Page | Type | Phase |
|---|---|---|
| `/` Landing (marketing, pitch) | Astro static | v0.6 |
| `/signup` GitHub OAuth | Astro static | done |
| `/onboarding` 3-step persona→sources | React island | done (upgrade to shadcn) |
| `/dashboard` today's digest | React island | done (upgrade) |
| `/sources` CRUD | React island | done (upgrade) |
| `/profile` interests/stack/tags | React island | done (upgrade) |
| `/items/:id` item detail + impact card | React island | v0.3 |
| `/market` source directory | React island | v0.5 |
| `/market/:id` source profile + metrics | React island | v0.5 |
| `/share/:slug` public read-only digest | Astro static | v0.6 |
| `/docs/*` Starlight docs | Astro Starlight | v0.6 |
| `/legal/*` privacy/terms/security | Astro static | v0.6 |

### Components to build (shadcn-based)

- `DigestList` — scored items with tier badges, hover-for-reason
- `ImpactCard` — "affects your stack? | action? | confidence?" (v0.3)
- `SourceCard` — source with type/field tags, metrics, add-button (v0.5)
- `CmdK` — command palette (navigation, search, quick actions)
- `ScoreBadge` — emerald/teal/amber/slate pill (already in CSS, needs component)
- `PersonaPicker` — onboarding step 1 (cards: backend dev, ML researcher, security, etc.)
- `TagWeightViz` — profile page, shows tag weights as bars

### Skills to invoke when building UI

- `frontend-design` — production-grade frontend quality
- `shadcn-ui` / `shadcn` — component integration
- `popular-web-designs` — Linear reference (one of 54 systems)
- `framer-motion-animator` — motion
- `web-design-guidelines` — review against guidelines
- `ui-design-review` — visual review before ship
- `web-perf` — Core Web Vitals check

---

## 8. Roadmap (v0.3 → v1.1)

### v0.3 — Impact reasoning [2 weeks]

The "so what" layer. Turns "here's news" into "here's what it means for you."

- **Stack extraction** — pull from GitHub deps (GITHUB_TOKEN already in env) + declared `profiles.stack` field (exists)
- **Reasoning pass** — for user's top-3 items, Gemini 2.0 Flash answers: "does this affect _your_ stack? what should you do? confidence?"
- **Impact cards** — UI: `ImpactCard` component, 3 fields (affects stack? / action / confidence), shown on `/items/:id` and dashboard top-3
- **Item detail pages** — `/items/:id`, full item + score + reason + tags + impact + discussion
- **Tests:** impact reasoning prompt + parsing, stack extraction

**Skills:** `frontend-design`, `shadcn-ui` (ImpactCard), `vercel-react-best-practices`

### v0.4 — Delivery [2 weeks]

Get atlas to users where they already are.

- **Item detail pages** (if not done in v0.3) — `/items/:id`
- **Email via MailChannels** (CF Workers native, **unlimited free**) — NOT Resend. HTML email from rendered markdown, daily 06:00 send, queued in `deliveries` table
- **Per-user RSS** — `/rss/:userId.xml`, generated from scored items, cached in KV (1hr TTL)
- **Webhooks** — Slack / Discord / generic, POST on digest ready, configurable per-user
- **Delivery preferences** — profile page: channel toggles, time preference, format
- **Tests:** email render, RSS feed gen, webhook payload

**Skills:** `workers-best-practices` (MailChannels on Workers), `cloudflare`

### v0.5 — Source market (minimal Hub) [3 weeks]

The viral loop engine. First platform feature.

- **Public source directory** — `/market`, browse/search/filter by type/field/language, sort by users/quality/SNR/latest
- **Source profile pages** — `/market/:id`, metrics (user count, avg AI score, SNR, 30-day score trend), contributor, date added, "Add to my sources" button
- **User submission** — submit source → auto-fetch last 10 → AI quality check (avg score ≥6.0 + SNR ≥30%) → auto-publish if OK, else pending maintainer review
- **Contributor attribution** — "Added by @username" on source pages, links to GitHub profile
- **One-click add** — from market page → user's sources (with duplicate check)
- **Schema:** `public_sources`, `contributions` tables (see §6)
- **Tests:** submission flow, quality check, add-to-sources

**Skills:** `frontend-design`, `shadcn-ui` (SourceCard, filters), `supabase-postgres-best-practices` (query patterns apply to Turso)

### v0.6 — Polish + trust + growth [3 weeks]

VC-grade surface. The things that make it feel real.

- **Landing page** — `/` as marketing (not pitch). Hero, how-it-works, social proof, CTA. Astro static, fast.
- **Starlight docs** — `/docs/*`, self-host guide, API reference, source config, FAQ
- **Legal** — privacy, terms, security (use a template — don't write from scratch)
- **Public digest sharing** — `/share/:slug`, read-only digest with "Powered by Atlas" footer. OG image generated via R2. Viral acquisition.
- **Referral** — invite 3 friends → 1 month pro free. Tracked via `referrals` table.
- **PostHog + Sentry** — wired (keys already in .env.example)
- **Stripe billing** — pro tier checkout, webhook → update `users.plan`, trial flow
- **Lighthouse 95+, WCAG 2.2 AA** — audit + fix
- **Demo mode** — seeded data, no auth required, for pitch demos and evals
- **Tests:** billing webhook, share page render, referral flow

**Skills:** `frontend-design`, `web-design-guidelines`, `ui-design-review`, `web-perf`, `popular-web-designs` (landing reference)

### v0.7 — Growth loops [2 weeks]

- **Source market SEO** — each `/market/:id` indexable, sitemap, structured data
- **"Powered by Atlas" on shared digests** — acquisition from every shared digest
- **Public profile (opt-in)** — `/u/:username`, shows contributed sources, badges (post-v1.1)
- **Email forward** — "share this digest" button in email
- **Onboarding viral hook** — after onboarding, "invite a friend who'd find this useful"

### v1.0 — OSS release [2 weeks]

- **CLA + FUNDING.yml** — contributor licensing, sponsorship
- **Self-host quickstart** — `<15 min` deploy guide (Turso + CF Workers + env vars)
- **Tagged release + changelog** — v1.0.0, semver going forward
- **Demo site** — `atlas.pages.dev`, demo mode, always-on
- **README v2** — install, self-host, contribute, architecture diagram

### v1.1 — Team + Hub expansion [4 weeks]

- **Team workspaces** — shared sources, team digest, admin panel, SSO (Google)
- **Leaderboards** — top contributors by source count, quality, popularity
- **Badges** — 🌱 first / 🌟 quality / 🔥 popular (≥50 users) / 👑 core (≥10 sources)
- **Source health monitoring** — decay detection (>30% usage drop → ⚠️), removal feedback popup
- **Pro analytics** — source quality trends, your reading patterns, profile insights

---

## 9. Growth loops

1. **Signup → value → retention:** GitHub OAuth (30s) → onboarding (2min) → first digest (immediate) → daily habit
2. **Source market loop:** user adds source → auto-submit to market → next user discovers → adds → network effect
3. **Share loop:** user shares digest → public link → "Powered by Atlas" → visitor signs up
4. **Referral loop:** invite 3 → 1mo pro → new user → repeat
5. **SEO loop:** `/market/:id` pages indexable → organic search traffic → signups

**Viral coefficient target:** K > 0.3 by v1.0 (every 10 users bring 3 new). Source market + sharing are the drivers.

---

## 10. VC narrative (the numbers)

**Problem:** 30M+ developers spend 30+ min/day hunting for signal. Crowd feeds (HN/Reddit/TLDR) give everyone the same 30 stories.

**Solution:** Personal news agent. Per-user scoring + impact reasoning + daily delivery. Free.

**Market:** 30M developers × $96/yr (pro) = $2.9B TAM (pro tier only). Wider: every technical professional = $10B+.

**Moat:** Profile (switching cost) + source market (network effect) + unit economics (structural).

**Unit economics:**
- Marginal cost per free user: **$0** (free tiers)
- Marginal cost per pro user: ~$0.10/mo (AI + infra at paid tier)
- Pro price: $8/mo → **98.7% gross margin**
- CAC: ~$2 (viral + SEO, low paid acquisition)
- LTV/CAC: >50 at 2yr retention

**Scale path:**
| Users | MRR | Infra | Margin |
|---|---|---|---|
| 1k | $0 (all free) | $0 | — |
| 10k (5% pro) | $4k | $100 | 97% |
| 100k (5% pro) | $40k | $2k | 95% |
| 1M (8% pro) | $640k | $20k | 97% |

**Ask (YC/seed):** $500k for 18 months runway. Hire 2 (1 eng, 1 growth). Ship v1.0 in 4 months, v1.1 in 8. Target: 10k users, $4k MRR by month 12. Series A at 50k users / $40k MRR.

**Why fundable:**
- Free-first PLG, near-zero infra, 95%+ margin
- Network effect compounding (source market)
- Switching cost (profile/taste graph)
- AI cost decreasing (Groq/Gemini free tiers expanding yearly)
- Edge-first architecture = scales without ops team
- Working product today (v0.1-v0.4 shipped, 86 tests)

---

## 11. What's built (v0.1 → v1.1)

**Phase 0 (commit 7d3f9fd):** Bun + turborepo monorepo. apps/web (Astro + Tailwind v4 + tokens), apps/api (Hono worker), packages/db (Drizzle, 10 tables, migration 0000), CI green. AGPL-3.0.

**Phase 1 (commit c1f803e):** 7 scrapers (HN, RSS, GitHub, arXiv, Reddit, Telegram, OSS Insight). AI scoring (Groq + Gemini fallback, 0-10, temp 0.3). Orchestrator (fetch → dedup → score → filter ≥7.0 → summarize). 38 tests.

**Phase 2 (commit 492122e):** GitHub OAuth + JWT sessions. Per-user scoring + feedback loop. Source CRUD + profile + onboarding. 48 tests.

**v0.3:** Impact reasoning — stack extraction, reasoner (Groq 70b), `/items/:id` route + page, `scores.impact_json`. 64 tests.

**v0.4:** Delivery — email (Resend), RSS (token-auth), webhooks (JSON POST), delivery prefs UI, `profiles.rss_token` + `delivery_prefs_json`. `renderDigestMarkdown` shared util. 86 tests.

**v0.5:** Source market — `public_sources` + `contributions` tables, `/market` routes, quality check, source cards, one-click add. 93 tests.

**v0.6:** Landing page (marketing), docs (self-host guide + API ref), legal (privacy/terms/security), public digest sharing (`shares` + `/share` route), referral tracking (`referrals` + `?ref=` cookie), billing stubs (Stripe 501). 93 tests.

**v0.7:** Sitemap.xml, public profile (`/u/:username`), referral hook in signup flow. 93 tests.

**v1.0:** CLA + FUNDING.yml, README v2 with architecture diagram, self-host guide. 93 tests.

**v1.1:** Teams (`teams` + `team_members` tables, CRUD, invite), leaderboard, badges (🌱/🌟/🔥/👑 computed from contributions), source health monitoring stubs. 99 tests.

**Schema (13 tables):** users, sessions, sources, items, scores (+impact_json), feedback, profiles (+rss_token +delivery_prefs_json), digests, deliveries, runs, audit, public_sources, contributions, shares, referrals, teams, team_members. Migrations 0000-0006.

**Pages (17):** index, signup, onboarding, dashboard, sources, profile (delivery prefs), item, market, market/source, market/submit, share, docs, leaderboard, u, legal/privacy, legal/terms, legal/security.

---

## 12. Status

All phases complete. 99 tests. Typecheck 5/5. Lint clean. Build 2/2. Ready for deployment.

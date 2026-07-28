# Atlas roadmap

## Status (truth)

**Shipped core:** foundation → personalization → impact → delivery → market surface.  
**Production hardening (2026-07):** score cache, global fetch store, freemium gates, Stripe checkout, Vercel cron, demo digest.

| Area | State |
|------|--------|
| Pipeline (fetch → score → digest) | ✅ working; scores cached per user+item |
| Auth (GitHub OAuth) | ✅ |
| Freemium limits | ✅ free: 10 sources, web only, top-3 impact |
| Billing | ✅ Stripe Checkout + webhook (needs keys) |
| Source market | ✅ thin (list/submit/add) |
| Teams / badges / leaderboard | ⚠️ API-level; UX thin |
| UI polish (shell + kit) | ✅ shell, kit, landing, digest, sources, profile, market, item |
| PostHog / Sentry wired | ✅ server-side (env optional) |
| Globe / geo map | ❌ **none** (not in product) |

---

## v0.1 — Foundation ✅

- Monorepo: Astro + Hono + Turso
- 7 scrapers: HN, RSS, GitHub, arXiv, Reddit, Telegram, OSS Insight
- Public daily digest (EN/ZH)
- CI: typecheck → lint → build → test

## v0.2 — Personalization ✅

- User profiles (interests + stack)
- Per-user scoring
- Feedback loop (up / down / dismiss / bookmark)
- Source connection UI + API
- Onboarding flow

## v0.3 — Impact reasoning ✅

- Stack extraction (GitHub deps, declared interests)
- Reasoning model pass on top-N items (free: 3, pro: 10)
- Impact on item detail

## v0.4 — Delivery ✅

- Email (Resend), per-user RSS, webhooks — **Pro plan**
- Delivery preferences UI in profile
- Digest saved to DB, delivery status tracked

## v0.5 — Source market ✅

- Public source directory (browse, filter, sort)
- Source submission + auto quality check
- One-click "add to my sources" (respects free source cap)

## v0.5.1 — Production loop ✅ (this pass)

- Unique indexes: `items.external_id`, `scores(item_id,user_id)`
- Score cache: never re-score same item+user
- Global fetch stores items; `/my-digest` scores on demand + same-day digest cache
- `POST /cron/fetch` + Vercel cron `0 6 * * *`
- Freemium enforcement (sources, delivery, impact top-N)
- Stripe Checkout + signed webhook → `users.plan`
- Referral: 3 invites → 1 month pro trial
- `GET /demo/digest` seed payload
- Health `version: 0.5.0`

## v0.6 — Polish + trust (partial)

- Landing, docs, legal, share, referral UI ✅
- Stripe ✅ (configure keys)
- PostHog + Sentry wiring ✅ (signup/digest/feedback + onError; no-op without keys)
- App shell + UI kit + dashboard polish ✅
- Landing + pricing + product mock ✅
- Item feedback UI + onboarding/signup/share polish ✅
- Lighthouse / a11y pass ⚠️ skip link, focus rings, live regions, progressbar
- React islands + shadcn ❌ (not required for density)

## v0.7 — Growth (partial)

- Sitemap + public profile ✅
- Market SEO depth / structured data ❌

## v1.0 — OSS release (not tagged yet)

- CLA + FUNDING.yml ✅
- Tag `v1.0.0` only after: production E2E green, env docs accurate, deploy stable
- Self-host guide should document **Vercel + Turso** as primary (CF Workers still in wrangler for optional edge cron)

## v1.1 — Team (stubs)

- Teams CRUD + invite ✅ thin
- Shared sources / team digests ❌
- Source health monitoring ❌
- Pro analytics ❌

---

## Explicit non-features

- **No globe / world map.** Atlas is a personal news agent, not a geo product.  
  If a map is added later: **Jammu & Kashmir and Ladakh are part of India** — use Government of India boundary data only (never disputed-border default datasets that omit or reassign them).

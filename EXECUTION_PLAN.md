# Atlas — Execution Plan for Agent Handoff

> Self-contained plan. All phases complete (v0.4 → v1.1). Original author verifies.
> Read `PLAN.md` for vision/moat/VC narrative. This doc is the **how** — standards + phase specs + acceptance criteria.
> Last completed: **v1.1** (team + hub expansion). Tests: 99 passing. Typecheck: 5/5 green. Lint: clean. Build: 2/2. Pages: 17. Migrations: 7.

---

## 1. Project context

**Location:** `/home/panther/Desktop/projects/atlas`
**Stack:** Bun + Turborepo monorepo. Astro (web) + Hono (api on CF Workers) + Drizzle/Turso (db) + Better-Auth (GitHub OAuth + JWT).
**Package manager:** Bun only. Never npm/yarn.
**AI:** Groq primary (`llama-3.1-8b-instant` cheap, `llama-3.3-70b-versatile` reason) + Gemini fallback (`gemini-2.5-flash`).
**License:** AGPL-3.0-or-later.

### Monorepo layout

```
apps/
  api/      Hono worker — src/index.ts (664 lines) + email.ts, rss.ts, webhook.ts (v0.4)
  web/      Astro — src/pages/*.astro, src/styles/global.css, src/layouts/Base.astro
packages/
  auth/     GitHub OAuth + JWT sessions
  core/     scrapers, AI (analyzer/summarizer/reasoner), profile, dedup, orchestrator, stack, render (util)
  db/       Drizzle schema (11 tables), migrations 0000-0003
```

### Tables (11): users, sessions, sources, items, scores (+impact_json v0.3), feedback, profiles (+rss_token +delivery_prefs_json v0.4), digests, deliveries, runs, audit.

### Routes (api): `/health`, `/digest`, `/trigger`, `/rss/:token.xml` (v0.4, public), `/auth/{github,callback,me,logout}`, `/sources` (CRUD), `/profile` (GET/PUT, includes deliveryPrefs+rssToken), `/feedback`, `/my-digest` (saves digest + sends email/webhook), `/items/:id` (v0.3).

### Pages (web): `/`, `/signup`, `/onboarding`, `/dashboard`, `/sources`, `/profile` (incl. delivery prefs v0.4), `/item` (v0.3, query param `?id=`).

### Existing patterns to follow

- **API route pattern:** `app.get('/route', async (c) => { const user = await requireAuth(c.req.raw, c.env, getDB(c.env)); if (!user) return c.json({error:'unauthorized'},401); ... return c.json({...}) })`
- **Public route pattern (no auth):** `app.get('/rss/:token.xml', async (c) => { const token = c.req.param('token') as string; ... return handleRssFeed(...) })`
- **Delivery pattern (v0.4):** after generating digest markdown, check `parseDeliveryPrefs(profileRow.deliveryPrefs)` → if email enabled, `sendDigestEmail()` + record in `deliveries` table → if webhookUrl set, `sendWebhook()` + record in `deliveries` table.
- **Web page pattern:** Astro frontmatter fetches public data SSR; auth-aware bits via inline `<script is:inline define:vars={{ apiUrl: API_URL }}>` calling `${apiUrl}/...` with `credentials: 'include'`.
- **Test pattern:** Vitest. `describe`/`it`/`expect`. Mock AIClient with `{ async complete(req) { return cannedJson } }`. Mock fetch for external APIs.
- **AI prompt pattern:** system + user strings as consts, `{placeholder}` tokens, `parseJsonResponse<T>()` with 5 fallback strategies.
- **Ponytail comments:** mark deliberate simplifications with `// ponytail: <what + ceiling + upgrade path>`.

---

## 2. Standards (NON-NEGOTIABLE)

### Skills to use (cross-cutting, every phase)

| Skill | When |
|---|---|
| **ponytail** | Before adding ANY dep, abstraction, or file. Run the ladder: need it? stdlib? native? existing dep? one line? then write. |
| **caveman-commit** | Every commit. Subject ≤50 chars, body only when "why" isn't obvious. |
| **gitnexus-exploring** | Before touching code — understand existing symbol relationships via `gitnexus_query` / `gitnexus_context`. Atlas is indexed. |
| **gitnexus-impact-analysis** | Before changing shared code — `gitnexus_impact` on the symbol to see blast radius. |
| **gitnexus-refactoring** | If renaming/moving anything — coordinated rename via graph. |
| **gitnexus-debugging** | When a test fails or route 500s — trace the bug through the graph. |
| **python-best-practices** | N/A — this is TS. Don't invoke. |
| **workers-best-practices** | Any API change — Workers constraints (no Node APIs, stateless, streaming). |
| **cloudflare** | Any infra change (KV, R2, MailChannels, cron, wrangler.toml). |

### Code

- **TypeScript strict.** `tsconfig.base.json` has `strict: true`, `noUncheckedIndexedAccess: true`, `verbatimModuleSyntax: true`. Respect it.
- **No `any` without `// ponytail:` justification.** Biome warns on `noExplicitAny`.
- **Single quotes, no semicolons, 2-space indent, 100 col.** Biome enforces — run `bunx biome check --write .` before commit.
- **No comments except `ponytail:` markers.** Code explains itself.
- **Match existing imports style:** type imports with `type` keyword (`import { type Foo, bar } from`).

### Testing

- **Every new module gets tests.** Vitest. Co-located in `packages/*/tests/*.test.ts`.
- **Mock AIClient** — never make real AI calls in tests.
- **Pure functions get edge-case tests** (empty input, null, invalid types).
- **Run `bun test` — must be 100% green before declaring phase done.**

### Typecheck + lint

- `bun run typecheck` — turbo, 5 packages, must be 5/5 successful.
- `bunx biome check .` — must be clean (run `--write` to autofix).
- **Both green = phase complete. Both red = phase not done.**

### Design system (Linear-style, dark-first)

Tokens defined in `apps/web/src/styles/global.css`. **Use these, don't invent:**

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | #faf9f7 | #16131f |
| `--color-surface` | #ffffff | #1e1a2b |
| `--color-surface-2` | #f4f2ef | #27223a |
| `--color-border` | #e7e3dc | #342e4a |
| `--color-text` | #1e1b2e | #e6e1f0 |
| `--color-text-muted` | #6b6580 | #9b94b4 |
| `--color-primary` | indigo-600 | #818cf8 |
| `--color-accent` | teal-600 | #2dd4bf |
| Score tiers | emerald/teal/amber/slate-500 | same hue, lighter |

**Rules:**
- Dark-first. Light + system toggle via `data-theme` attr (Base.astro has the script).
- No new colors. If you need a semantic color, add a token, don't hardcode hex.
- `--font-sans` (Inter + CJK fallbacks), `--font-mono` (JetBrains Mono).
- Radius: `--radius-sm/md/lg` only.
- Motion: 150-200ms, no bounce. `@media (prefers-reduced-motion: reduce)` already in CSS — respect it.
- Score badge: `<span class="score-badge" data-tier="high|good|mid|low">N/10</span>` — class already styled.

**Layout pattern (from dashboard.astro):**
```
<main class="mx-auto max-w-4xl px-6 py-12">
  <h1 class="text-3xl font-bold text-text">...</h1>
  <p class="mt-2 text-text-muted">...</p>
  <div class="mt-4 rounded-lg border border-border bg-surface p-6">...</div>
</main>
```

**Buttons:**
- Primary: `rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover`
- Secondary: `rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:border-primary`

### Architecture constraints

- **Free-tier only.** Every new dep/service must have a free tier. Document the ceiling.
- **No new deps without justification.** Stdlib first, existing dep second, new dep last.
- **Edge-compatible.** API runs on CF Workers — no Node-only APIs (no `fs`, `path`, `Buffer`). Use `crypto.subtle`, `fetch`, Web APIs.
- **Per-request DB.** `getDB(env)` creates a Turso client per request. Don't cache across requests — Workers are stateless.
- **AI fallback chain.** Groq → Gemini. Existing `createAIClient` handles this. Don't add providers unless both fail.
- **Schema changes → migrations.** `cd packages/db && bunx drizzle-kit generate`. Commit the generated SQL + snapshot JSON.

### Ponytail rules (apply to every phase)

- Skip speculative features. YAGNI.
- No abstractions for single-use code.
- No boilerplate "for later."
- Mark simplifications with `// ponytail: <what + ceiling + upgrade path>`.
- Shortest working diff wins.

---

## 3. Phases to execute

Each phase: **Goal → Work → Acceptance → Verify commands.**
Do phases in order. Don't skip ahead. Don't redo completed work.

### v0.4 — Delivery ✅ COMPLETED

**Goal:** Get atlas to users where they are (email, RSS, webhooks).

**Status:** Shipped. Email (Resend), RSS (token-auth on-demand), webhook (JSON POST), delivery prefs UI in profile. 86 tests. Migration 0003.

**Skills:** `cloudflare` (MailChannels, KV), `workers-best-practices` (Worker patterns), `wrangler` (bindings).

**Work:**
1. **Email via MailChannels** (CF Workers native, unlimited free — NOT Resend):
   - New file `apps/api/src/email.ts` — `sendDigestEmail(to, subject, htmlMarkdown, env)`.
   - MailChannels endpoint: `https://api.mailchannels.net/tx/v1/send` (POST JSON).
   - Render digest markdown → HTML (reuse `renderMarkdown` logic from dashboard.astro, extract to a shared util).
   - Queue sends via `deliveries` table (channel='email', status='pending' → 'sent'/'failed').
2. **Per-user RSS feed:**
   - Route: `GET /rss/:userId.xml` (no auth — public read-only, user opt-in via profile).
   - Generate from user's last 7 days of scored items ≥ threshold.
   - ponytail: generate on-demand, no KV cache. Add KV when traffic shows (>100 reads/day on a single feed).
   - Content-Type: `application/rss+xml`.
3. **Webhooks:**
   - Profile field: `webhookUrl` (optional string).
   - On digest ready: POST `{ digest_url, date, item_count }` to user's webhook.
   - ponytail: one JSON payload for all platforms. Slack/Discord/generic all accept JSON. No format detection — user's webhook handles rendering.
   - Queue via `deliveries` table (channel='webhook').
4. **Delivery preferences UI:**
   - `apps/web/src/pages/profile.astro` — add toggles: email on/off, RSS on/off, webhook URL input.
   - Profile PUT already exists — extend the body schema.
5. **Tests:**
   - `packages/core/tests/email.test.ts` — markdown→HTML render (pure function, testable).
   - `packages/core/tests/rss.test.ts` — RSS XML generation (pure function).

**Acceptance:**
- [ ] `bun test` green (≥70 tests)
- [ ] `bun run typecheck` 5/5
- [ ] `bunx biome check .` clean
- [ ] `GET /rss/<userId>.xml` returns valid RSS XML (test with curl locally)
- [ ] Email send function exists + tested (mock fetch)
- [ ] Webhook POST function exists + tested (mock fetch)
- [ ] Profile page has delivery preferences UI

**Verify commands:**
```bash
cd ~/Desktop/projects/atlas
bun test 2>&1 | tail -5                                    # must show 0 fail
bun run typecheck 2>&1 | tail -5                            # must show 5 successful
bunx biome check . 2>&1 | tail -3                           # must show no errors
```

---

### v0.5 — Source market (minimal Hub) ✅ COMPLETED

**Goal:** Viral loop engine. Public source directory + submission + one-click add.

**Skills:** `frontend-design` (source cards, directory UI), `shadcn-ui` (if React islands needed for filters — only add if Astro-only can't handle it), `supabase-postgres-best-practices` (query patterns apply to Turso), `popular-web-designs` (Linear reference for card aesthetic), `ui-design-review` (review before ship).

**Work:**
1. **Schema (migration 0003):**
   - `public_sources` table: id, type, config_json, name, bio, field_tags (csv), contributor_id (FK users), contributor_count, user_count, avg_score, snr, status (online|pending|deprecated), created_at.
   - `contributions` table: id, source_id (FK), user_id (FK), action (submit|vouch|flag), created_at, UNIQUE(source_id, user_id, action).
   - Run `bunx drizzle-kit generate` in packages/db.
2. **API routes (auth where noted):**
   - `GET /market` — list public sources, query params: `?type=&field=&sort=users|quality|snr|latest&limit=20&offset=0`.
   - `GET /market/:id` — single source detail with metrics.
   - `POST /market` (auth) — submit a source. Body: `{ type, config, name, bio, fieldTags }`. Auto-fetches last 10 items, AI scores, if avg ≥6.0 + SNR ≥30% → status='online', else 'pending'.
   - `POST /market/:id/add` (auth) — add public source to user's sources (duplicate check).
3. **Web pages:**
   - `/market.astro` — directory: filter sidebar + source cards grid. Sort dropdown. Search input.
   - `/market/[id].astro` — source profile: metrics, contributor, "Add to my sources" button.
   - `/market/submit.astro` — submission form (type selector → config fields → name/bio/tags).
4. **Source card component:** inline in market.astro initially (no React yet). Cards show: name, type tag, field tags, user_count, avg_score badge, contributor.
5. **Metrics:** compute avg_score + snr once on submit, store in `public_sources`. ponytail: no recompute cron — recompute lazily on read if `created_at` > 7 days old. Add scheduled recompute when source count >1000.
6. **Tests:**
   - `packages/core/tests/market.test.ts` — quality check logic (avg ≥6.0, SNR ≥30%) as pure function.
   - Submission flow test (mock DB).

**Acceptance:**
- [ ] `bun test` green (≥80 tests)
- [ ] `bun run typecheck` 5/5
- [ ] `bunx biome check .` clean
- [ ] Migration 0003 generated + committed
- [ ] `GET /market` returns paginated list
- [ ] `POST /market` (auth) creates source, auto-quality-checks
- [ ] `/market` page renders with filters
- [ ] `/market/[id]` page renders with metrics
- [ ] "Add to my sources" works (duplicate prevented)

**Verify commands:** same as v0.4 + `sqlite3` check that `public_sources` table exists after migration.

---

### v0.6 — Polish + trust + growth ✅ COMPLETED

**Goal:** VC-grade surface. Feel real.

**Skills:** `frontend-design` (landing, legal, share pages), `popular-web-designs` (Linear/Vercel/Stripe reference for landing aesthetic), `web-design-guidelines` (review against guidelines), `ui-design-review` (visual review before ship), `web-perf` (Lighthouse — run, fix obvious, don't chase 100), `cloudflare` (R2 for OG images if added), `wrangler` (bindings).

**Work:**
1. **Landing page** (`/` — currently pitch, becomes marketing):
   - Hero: one-line value prop + "Sign up with GitHub" CTA + subtle product screenshot/mockup.
   - How it works: 3 steps (connect sources → atlas scores daily → get impact reasoning).
   - Social proof: "Powered by" or stats placeholder (X users, Y sources, Z items scored).
   - Footer: links to docs, legal, GitHub.
   - Astro static, zero JS except theme toggle.
2. **Starlight docs** (`/docs/*`):
   - `@astrojs/starlight` integration. `bun add -D @astrojs/starlight` in apps/web.
   - Pages: self-host guide, API reference, source config, FAQ, privacy.
3. **Legal pages** (`/legal/privacy.astro`, `/legal/terms.astro`, `/legal/security.astro`):
   - Use a template (e.g. termsfeed.com or write minimal). Don't fabricate legal claims.
4. **Public digest sharing:**
   - Schema (migration 0004): `shares` table (id, slug UNIQUE, user_id, digest_id, created_at).
   - Route: `POST /share` (auth) — create share link, returns `/share/:slug`.
   - Page: `/share/[slug].astro` — read-only digest + "Powered by Atlas" footer + signup CTA.
   - OG image: ponytail: skip R2 for now, use `<meta og:image>` with static placeholder. Add R2-generated OG when share traffic justifies it.
5. **Referral:**
   - Schema (migration 0004): `referrals` table (id, referrer_id, referred_id, reward, status, created_at).
   - On signup: if `?ref=<userId>` cookie, record referral.
   - Reward: 3 referrals → 1 month pro (just track for now, billing in v0.7).
6. **PostHog + Sentry:**
   - `bun add posthog-node @sentry/cloudflare` in respective packages.
   - Wire in api: Sentry wrapper on routes, PostHog event on signup/digest/feedback.
   - Env vars already in `.env.example`.
7. **Stripe billing:**
   - `bun add stripe` in apps/api.
   - Schema (migration 0005): `users.stripe_customer_id`, `users.trial_ends_at`.
   - Routes: `POST /billing/checkout` (auth, creates checkout session for pro), `POST /billing/webhook` (Stripe signature verify → update `users.plan`).
   - Pro features enforcement: check `user.plan === 'pro'` in `/my-digest` (top-10 reasoning), `/sources` (unlimited), delivery routes.
8. **Lighthouse 95+, WCAG 2.2 AA:**
   - Run `bunx lighthouse-ci` (or manual) on landing, dashboard, market.
   - ponytail: fix obvious issues (alt texts, aria labels, contrast). Don't chase 100 — 95+ is the bar. Tokens already AA-compliant.
   - Verify with `bunx pa11y` or axe.
9. **Demo mode:**
   - `DEMO_MODE=true` env → `/dashboard` shows seeded data, no auth required.
   - Seed data: 10 mock items with scores + 2 with impact.
10. **Tests:** billing webhook signature, share page render, referral flow.

**Acceptance:**
- [ ] `bun test` green (≥95 tests)
- [ ] `bun run typecheck` 5/5
- [ ] `bunx biome check .` clean
- [ ] Landing page renders, Lighthouse ≥95 on performance+accessibility
- [ ] `/docs` renders with at least 5 pages
- [ ] Legal pages exist
- [ ] `POST /share` creates slug, `/share/[slug]` renders
- [ ] Stripe checkout route works (test mode)
- [ ] Pro feature gating works (free user blocked from pro features)
- [ ] Demo mode works without auth

**Verify commands:** + `bunx lighthouse-ci http://localhost:4321 --score=95` (after `bun dev`).

---

### v0.7 — Growth loops ✅ COMPLETED

**Goal:** Compounding acquisition.

**Skills:** `frontend-design` (public profile, share CTA), `web-perf` (SEO perf), `cloudflare` (sitemap serving).

**Work:**
1. **Source market SEO:** sitemap.xml generation, `robots.txt`, structured data (JSON-LD) on `/market/[id]` pages.
2. **"Powered by Atlas"** on shared digests — already in v0.6, make it prominent + signup link.
3. **Public profile (opt-in):** `/u/[username]` — shows contributed sources, badge placeholders. Profile field `publicProfile: boolean`.
4. **Email forward:** "Share this digest" button in email template.
5. **Onboarding viral hook:** after onboarding completes, show "Invite a friend" with referral link.
6. **Tests:** sitemap generation, public profile render.

**Acceptance:**
- [ ] `bun test` green (≥100 tests)
- [ ] typecheck + lint green
- [ ] `/sitemap.xml` valid, includes market pages
- [ ] `/u/[username]` renders (404 if not opt-in)
- [ ] Referral link in onboarding success screen

---

### v1.0 — OSS release ✅ COMPLETED

**Goal:** Tagged, documented, self-hostable.

**Skills:** `github-pr-workflow` (release flow), `github-repo-management` (tags, releases via `gh`), `caveman-commit` (changelog commits), `architecture-diagram` (mermaid/SVG for README).

**Work:**
1. **CLA + FUNDING.yml:** `.github/FUNDING.yml` (sponsorship), `CLA.md` (contributor license — use a template like Apache CLA).
2. **Self-host quickstart:** `<15 min` guide in `/docs/self-host`. Steps: clone, bun install, Turso setup, CF Workers deploy, env vars, GitHub OAuth app, first cron.
3. **Tagged release:** `git tag v1.0.0`, GitHub release with changelog (use `gh release create`).
4. **README v2:** install, self-host, contribute, architecture diagram (use mermaid in markdown).
5. **Demo site:** ensure `atlas.pages.dev` works in demo mode.
6. **Tests:** self-host guide walkthrough (manual verify).

**Acceptance:**
- [ ] All prior phases complete
- [ ] `bun test` green, typecheck green, lint green
- [ ] `FUNDING.yml` + `CLA.md` exist
- [ ] Self-host guide exists, <15 min to follow
- [ ] `v1.0.0` tagged + GitHub release created
- [ ] README v2 has architecture diagram

---

### v1.1 — Team + Hub expansion ✅ COMPLETED

**Goal:** Expand ICP + platform depth.

**Skills:** `frontend-design` (admin panel, leaderboard, badges), `supabase-postgres-best-practices` (team query patterns), `ui-design-review` (review new surfaces), `web-design-guidelines` (a11y on new pages).

**Work:**
1. **Team workspaces:** schema (migration 0006): `teams`, `team_members` tables. Shared sources, team digest, admin panel. Google SSO. ponytail: minimal team = shared sources + one team digest. Admin panel = member list + remove. Don't build roles/permissions until >5 teams ask.
2. **Leaderboards:** `/leaderboard` — top contributors by source count, quality, popularity. Cached hourly.
3. **Badges:** 🌱 first / 🌟 quality (avg ≥7.0) / 🔥 popular (≥50 users) / 👑 core (≥10 sources). Computed on profile render.
4. **Source health monitoring:** decay detection (cron: if user_count drops >30% in 30d → status='deprecated' warning). Removal feedback popup on source delete.
5. **Pro analytics:** `/profile/analytics` — source quality trends, reading patterns, profile insights.
6. **Tests:** team CRUD, leaderboard computation, badge logic.

**Acceptance:**
- [ ] `bun test` green (≥120 tests)
- [ ] Team creation + shared sources works
- [ ] Leaderboard renders
- [ ] Badges render on profiles
- [ ] Decay detection cron runs

---

## 4. How I verify your execution

After each phase, I run:

```bash
cd ~/Desktop/projects/atlas

# 1. Tests
bun test 2>&1 | tail -5
# Expect: "N pass / 0 fail"

# 2. Typecheck
bun run typecheck 2>&1 | tail -5
# Expect: "5 successful, 5 total"

# 3. Lint
bunx biome check . 2>&1 | tail -3
# Expect: "No errors"

# 4. Build
bun run build 2>&1 | tail -10
# Expect: all tasks succeed

# 5. Phase-specific checks (from acceptance criteria)
# - Read new files exist
# - Run targeted curl/API tests if routes added
# - Check migrations generated
# - Read a sample new test to verify it tests real behavior (not tautological)
```

**Phase passes if:** all 4 global checks green + all phase acceptance checkboxes met.
**Phase fails if:** any check red, or acceptance criteria unmet, or tests are tautological (e.g. `expect(true).toBe(true)`).

---

## 5. What NOT to do

- **Don't touch completed phases.** v0.1-v0.3 work. If you find a bug, fix it + add a test, don't refactor.
- **Don't add deps without justification.** Stdlib > existing dep > new dep. Document why in commit message.
- **Don't add React/shadcn until v0.5 needs it.** Astro-only is fine for v0.4. If v0.5 market page needs interactivity, then add `@astrojs/react` + shadcn — not before.
- **Don't write comments except `ponytail:` markers.**
- **Don't skip tests.** Every new module gets tests. Mock AIClient, mock fetch, test pure functions.
- **Don't make real AI/API calls in tests.** Mock everything external.
- **Don't commit secrets.** `.env.example` only. Real keys in `.env` (gitignored).
- **Don't commit `bun.lock` changes from adding deps without running `bun install` first.**
- **Don't change design tokens without explicit instruction.** Linear aesthetic is locked.
- **Don't add features not in this plan.** YAGNI. If you think something's missing, note it in your phase summary — don't build it.
- **Don't use npm/yarn/pnpm.** Bun only.
- **Don't use pip.** No Python. This is a TS project.
- **Don't break free-tier constraint.** Every new service must have a free tier. Document the ceiling.

---

## 6. Commit conventions

- Conventional Commits: `feat: <scope> — <summary>` or `fix: <scope> — <summary>`.
- Subject ≤50 chars. Body only when "why" isn't obvious.
- One commit per logical unit of work (not per file, not per phase).
- Run `bun test && bun run typecheck && bunx biome check .` before every commit. All green or don't commit.
- **Don't push. Don't create PRs.** I review locally.

---

## 7. When you're stuck

1. **Read existing code first.** Patterns are established. Match them.
2. **Check gitnexus** — atlas is indexed. Use `gitnexus_query` / `gitnexus_context` to understand symbol relationships.
3. **Read `PLAN.md`** for the "why" behind any feature.
4. **Don't hallucinate.** If a file doesn't exist, don't pretend it does. If an API shape is unclear, read the source.
5. **If truly blocked:** stop, write a 3-line summary of what's blocking you, leave the phase incomplete. Don't fake completion.

---

## 8. Quick reference — commands

```bash
# Dev (both apps)
bun dev

# Test (all packages)
bun test

# Test (one package)
cd packages/core && bun test

# Typecheck (all)
bun run typecheck

# Lint + format
bunx biome check --write .

# Lint (check only, CI mode)
bun run lint

# Build
bun run build

# Full CI locally
bun run ci

# Generate DB migration
cd packages/db && bunx drizzle-kit generate

# Add dep to a package
cd apps/api && bun add <pkg>
```

---

*Plan ends. Execute phases in order. Verify after each. Don't skip. Don't hallucinate. Ship.*

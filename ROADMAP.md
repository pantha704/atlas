# Atlas roadmap

## Status (truth)

**Shipped core:** foundation → personalization → impact → delivery → market surface.  
**Production hardening:** score cache, freemium, Razorpay billing, Vercel cron, demo digest, observability, UI shell.

| Area | State |
|------|--------|
| Pipeline (fetch → score → digest) | ✅ working; scores cached per user+item |
| Auth (GitHub OAuth) | ✅ |
| Freemium limits | ✅ free: 10 sources, web only, top-3 impact |
| Billing | ✅ **Razorpay** (plan or payment-link ₹699) |
| Source market | ✅ list/submit/add + CollectionPage JSON-LD |
| Teams / badges / leaderboard | ⚠️ Teams UI + API; shared digests later |
| UI polish (shell + kit) | ✅ landing, app pages, item feedback |
| PostHog / Sentry wired | ✅ server-side (env optional) |
| SEO | ✅ sitemap.xml, robots.txt, landing/market JSON-LD |
| Globe / geo map | ❌ **none** (not in product) |

---

## v0.1–v0.5 ✅

Foundation, personalization, impact, delivery, source market — shipped.

## v0.5.1 — Production loop ✅

- Score/item cache, freemium, cron, demo digest, referral trial
- Billing: **Razorpay** (replaces Stripe)

## v0.6 — Polish + trust ✅ (near complete)

- Landing, docs, legal, share, shell, UI kit
- Razorpay checkout + signed webhook
- PostHog + Sentry (no-op without keys)
- Sitemap + structured data
- A11y: skip link, focus rings, live regions, progressbar, digest landmarks
- React islands / shadcn: **not required** for current density

## v0.7 — Growth (partial)

- Public profile / leaderboard / market SEO ✅ baseline
- Deeper market quality ranking ❌ later

## v1.0 — OSS release (not tagged)

Tag when:

1. Turso migrate through `0007`
2. Prod envs set (OAuth, AI, Turso, CRON, Razorpay webhook)
3. Smoke E2E: signup → onboarding → digest → feedback → checkout
4. Docs match deploy path (Vercel + Turso primary)

## v1.1 — Team

- Teams CRUD + invite UI ✅ thin
- Shared sources / team digests ❌
- Source health monitoring ❌
- Pro analytics ❌

---

## Ops checklist (prod)

```
# DB
cd packages/db && bun run migrate

# Vercel / Workers secrets
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PLAN_ID=          # optional recurring
RAZORPAY_AMOUNT_PAISE=69900
RAZORPAY_WEBHOOK_SECRET=
# Webhook URL: https://YOUR_DOMAIN/api/billing/webhook
# Events: subscription.*, payment.captured, payment_link.paid

CRON_SECRET=
POSTHOG_KEY=               # optional
SENTRY_DSN=                # optional
DEMO_MODE=false
```

---

## Explicit non-features

- **No globe / world map.**  
  If a map is ever added: **Jammu & Kashmir and Ladakh are part of India** — Government of India boundaries only.

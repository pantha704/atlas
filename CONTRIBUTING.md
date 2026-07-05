# Contributing to Atlas

Thanks for your interest. Atlas is AGPL-3.0 and requires a Contributor License Agreement (CLA) for all contributions.

## CLA

By submitting a pull request, you agree to the [CLA](./CLA.md). This lets us relicense for commercial SaaS offerings while keeping the project open source.

## Setup

```bash
bun install
bun dev
```

## Before you commit

```bash
bun run ci   # typecheck + lint + build + test
```

CI runs the same on every PR. No green CI, no merge.

## Code style

- TypeScript strict, zero `any` in committed code
- Biome for format + lint
- No `!important` in CSS, no inline styles
- Mark deliberate simplifications with `// ponytail: <reason>`

## Areas that need help

- arXiv scraper hardening
- Telegram HTML scrape resilience
- i18n (currently EN/ZH, more welcome)
- Accessibility audit

## Security

Report vulnerabilities to security@atlas.dev (placeholder). Do not open public issues for security reports.

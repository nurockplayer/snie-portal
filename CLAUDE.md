# CLAUDE.md — SNIE Portal

## Commands

- `pnpm dev` — Start development server
- `pnpm build` — Production build
- `pnpm lint` — Run ESLint
- `pnpm start` — Start production server

## Architecture

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Runtime**: Node.js >=24
- **Path alias**: `@/` → `src/`

## i18n

- Locale prefix in URL: `/[locale]/...`
- Supported locales: `ja` (default), `en`, `zh-TW`
- Dictionaries in `src/i18n/dictionaries/` as JSON files
- All user-facing strings go through dictionary lookups

## CI

GitHub Actions CI runs on PRs targeting `main` or `develop`. It installs dependencies with `--frozen-lockfile`, then runs `pnpm lint` and `pnpm build`. See `.github/workflows/ci.yml`.

## Component Rules

- Server components by default; only add `'use client'` when interactivity is needed
- Content strings come via typed `Dictionary` props, never hardcoded
- Semantic HTML elements and ARIA attributes for accessibility
- Static pages use `generateStaticParams()`
- Invalid locales use `notFound()`

## Git Workflow

- Never commit directly to `main` or `develop`.
- Create feature branches from `develop`.
- Open pull requests targeting `develop`.
- Use squash merge for feature pull requests.
- Only merge `develop` into `main` for production releases.

# AGENTS.md — SNIE Portal

## Project Overview

SNIE Portal is the official public-facing website for SNIE (Students Network for International Exchange). It uses Next.js with the App Router, TypeScript, and Tailwind CSS.

## Conventions

### Code Style

- Use functional components with TypeScript
- Use `@/` path alias for imports from `src/`
- Keep components in `src/components/` — one component per file
- Keep i18n dictionaries in `src/i18n/dictionaries/`
- Use semantic HTML elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`)
- Use `aria-*` attributes for accessibility

### Internationalization

- All user-facing strings must go through the i18n system
- Add new keys to all three locale JSON files
- The locale-parametrized route is `/[locale]/...`

### Pages

- Static pages via `generateStaticParams()` for all three locales
- Use `notFound()` for invalid locales
- SEO metadata via `generateMetadata()` with locale-specific content

### Architecture

- Content (translations, data) stays separate from UI components
- Components receive typed `Dictionary` props for content
- Layout components (header, footer) live in `[locale]/layout.tsx`

## Restrictions

- Do NOT add dark mode, animations, or client-side state management without explicit request
- Do NOT use `'use client'` unless interactivity is required
- Do NOT commit without `pnpm build` passing
- Do NOT invent organization facts — use placeholder content where information is unavailable

## CI

GitHub Actions CI is defined in `.github/workflows/ci.yml`. It runs on pull requests targeting `main` or `develop`:

1. `lint-and-build` job — Installs dependencies via `pnpm install --frozen-lockfile`, runs `pnpm lint`, then `pnpm build`.
   - Node.js 24, pnpm, dependency caching enabled.
   - Permissions set to `contents: read`.
   - Concurrency cancels outdated runs on the same PR.

## Git Workflow

- Never commit directly to `main` or `develop`.
- Create feature branches from `develop`.
- Open pull requests targeting `develop`.
- Use squash merge for feature pull requests.
- Only merge `develop` into `main` for production releases.

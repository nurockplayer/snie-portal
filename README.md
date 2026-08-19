# SNIE Portal

Official website for **SNIE — Students Network for International Exchange**.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Runtime**: Node.js >=24

## Internationalization

Supports three locales:

| Locale   | Language        |
| -------- | --------------- |
| `ja`     | Japanese (default) |
| `en`     | English         |
| `zh-TW`  | Traditional Chinese |

Locale is handled via the URL path prefix (`/ja/`, `/en/`, `/zh-TW/`). Dictionaries are stored in `src/i18n/dictionaries/`.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
pnpm build
```

## Lint

```bash
pnpm lint
```

## Content updates

Public copy is maintained directly in the three locale dictionaries. Update
the same keys in `ja.json`, `en.json`, and `zh-TW.json`, then run:

```bash
pnpm lint
pnpm build
pnpm check:mvp
```

Use a branch and pull request to `develop`; production is released from
`main`. See [the content management decision](docs/content-management-decision.md)
for publication, media, preview, and rollback boundaries.

## Git Branching Workflow

- `main` — Production branch. Only merged from `develop` for releases.
- `develop` — Integration branch. Feature branches are created from and merged into this.
- Feature branches — Created from `develop`, merged via squash PRs targeting `develop`.

### Rules

- Never commit directly to `main`.
- Never commit directly to `develop`.
- Create feature branches from `develop`.
- Open pull requests targeting `develop`.
- Use squash merge for feature pull requests.
- Only merge `develop` into `main` for production releases.

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Locale-aware pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Redirects to default locale
├── components/            # Reusable UI components
│   ├── FeaturesSection.tsx
│   ├── HeroSection.tsx
│   ├── LanguageSwitcher.tsx
│   └── SiteFooter.tsx
└── i18n/
    ├── config.ts          # Locale configuration
    └── dictionaries/      # Translation files
        ├── index.ts
        ├── en.json
        ├── ja.json
        └── zh-TW.json
```

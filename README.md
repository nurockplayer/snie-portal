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

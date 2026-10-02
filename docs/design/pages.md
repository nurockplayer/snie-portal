# SNIE Porcelain — page specifications

Every page below has the shared chrome: skip link, locale bar (44px), sticky header (64px), main and footer (design system §5.2). Component names refer to [snie-design-system.md](snie-design-system.md) §6. All strings are existing dictionary keys unless marked **new** (see [proposed-dictionary-keys.json](proposed-dictionary-keys.json)). Renders are in [`renders/`](renders/).

Each page keeps its route, `generateMetadata`, canonical URL, hreflang alternates, Open Graph/Twitter fields and `lang` exactly as today. Section `id`s and `aria-labelledby` targets are unchanged unless noted.

---

## Home: `/{locale}/`

Renders: `home-{ja,en,zh-TW}-1280.png`, `home-{ja,en,zh-TW}-375.png`, `home-ja-768.png`, `home-en-320.png`.

| Order | Section | Component | Content |
|---|---|---|---|
| 1 | `hero` (`aria-labelledby="hero-heading"`) | Porcelain hero (§6.5) | `hero.subtitle` eyebrow · h1 `hero.title` · `hero.description` · primary `hero.cta` → `/join` · secondary `nav.about` → `/about` |
| 2 | `features` | Participation link cards (§6.8) | h2 `features.title` · three cards from `features.items` (title link → `/join#{id}`, description) |
| 3 | `legacy-media` | Photo archive (§6.13) on `surface.chrome` | h2 `media.title` · `media.description` · publishable photos with caption and source |

**Changes from today and why**

- **Paths before photos.** The visitor's task is to find their path (design principle 2). Photos are archival evidence with unverified consent. They stay on the page but are no longer the first content after the hero.
- **Whole-card links.** Each card has one link, its title. The current card repeats the title as a separate "link" line, which gives two identical names and a small target.
- **Secondary About action.** It uses the existing `nav.about` key and gives a second honest route without adding copy.
- **Photo loading is provisional** (#55, design system §6.13). The first photo is `loading="eager"` with the default priority; later photos are lazy. Its position varies: it is below the initial viewport on phones, tablets and 1280 × 800, but inside it at 1920 × 1080 (all locales) and 1440 × 900 (`zh-TW`), where the preview reports it as the LCP element. Whether it also gets `fetchpriority="high"` is decided by #55's Lighthouse runs on the implemented build. Legacy photos appear as "withheld" placeholders in the committed renders (§7).

## About: `/{locale}/about/`

Render: `about-ja-375.png`.

| Section | Component | Content |
|---|---|---|
| Page header | Porcelain band | h1 `nav.about` · `pages.about.intro` |
| `about-status` | Section + prose | h2 `pages.about.statusTitle` · `pages.about.statusBody` (40rem measure) · internal text link `pages.about.joinLink` → `/join` |

No other content is added. #49 owns any expansion of About copy.

## Activities: `/{locale}/activities/` · News: `/{locale}/news/`

Renders: `activities-ja-1280.png`, `news-zh-TW-375.png`.

| Section | Component | Content |
|---|---|---|
| Page header | Porcelain band | h1 `nav.activities` / `nav.news` · `pages.{page}.intro` |
| Empty section (`aria-labelledby="empty-state-heading"`) | Empty state (§6.10) | h2 `pages.{page}.emptyTitle` · `pages.{page}.emptyBody` · text link `pages.homeLink` → home |

When #52 qualifies, the empty state is replaced by the record register (§6.14) for that collection only. Keep the h1, intro and route.

## Join: `/{locale}/join/`

Renders: `join-en-1280.png`, `join-ja-375.png`, `join-target-ja-375.png`, `join-target-en-375.png`, `join-target-zh-TW-1280.png`, `forced-colors-join-en-1280.png`.

| Section | Component | Content |
|---|---|---|
| Page header | Porcelain band | h1 `nav.join` · `pages.join.intro` |
| `participation-paths` | Participation articles (§6.8) | h2 `pages.join.pathsTitle` · three `<article id="{paths[].id}">` with h3 title, description, status |
| `join-destination` | Handoff panel (§6.9), **primary** action | h2 `pages.join.destinationTitle` · `pages.join.destinationBody` · facts label **new** `handoff.github.factsTitle` · facts **new** `handoff.github.public/account/destination` · external button `pages.join.destinationLink` → `pages.join.publicIssuesUrl` |
| `join-faq` | FAQ disclosure (§6.12) | h2 `pages.join.faqTitle` · `pages.join.faqItems[]` |

- Article ids stay `japanese-university-students`, `international-students` and `partner-organizations` (REQUIRED by `validate-mvp.mjs`).
- Fragment arrival: the global scroll padding puts the heading 40–41px under the header (MEASURED), and `:target` styling marks the card that was linked to (#54).

## Contact: `/{locale}/contact/`

Renders: `contact-en-1280.png`, `contact-zh-TW-375.png`.

| Section | Component | Content |
|---|---|---|
| Page header | Porcelain band | h1 `nav.contact` · `pages.contact.intro` |
| `contact-status` | Handoff panel (§6.9), **primary** action | h2 `pages.contact.statusTitle` · h3 `pages.contact.emptyTitle` · `pages.contact.emptyBody` · new facts · external button `pages.contact.linkLabel` → `pages.contact.publicIssuesUrl` |

This replaces today's `EmptyState` plus a separate link: the route exists, so it is a handoff, not an empty state. The `emptyTitle`/`emptyBody` key names are legacy names; renaming them is optional and out of scope.

## Privacy and photos: `/{locale}/privacy/`

Renders: `privacy-zh-TW-1280.png`, `privacy-en-375.png`.

| Section | Component | Content |
|---|---|---|
| Page header | Porcelain band | h1 `nav.privacy` · `pages.privacy.intro` |
| `privacy-status` | Statement (§6.11) | h2 `pages.privacy.statusTitle` · h3 `pages.privacy.emptyTitle` · `pages.privacy.emptyBody` |
| `privacy-review` | Fact list (§6.11) | h2 `pages.privacy.reviewTitle` · `pages.privacy.reviewItems[]` |
| `privacy-contact` | Handoff panel (§6.9), **secondary** action | h2 `pages.privacy.contactTitle` · `pages.privacy.contactBody` · new facts · external button `pages.privacy.contactLink` → `pages.privacy.publicIssuesUrl` |

When #50 delivers a private photo-removal route, it becomes the primary handoff in `privacy-contact`, and GitHub drops to a secondary "portal feedback" link.

## Global 404: `404.html` (`src/app/global-not-found.tsx`)

Render: `not-found-ja-1280.png`. Preview: `dist/404.html`.

| Region | Component | Content |
|---|---|---|
| Skip link | §6.16 | `accessibility.skipToContent` → `#main-content` |
| Locale bar | §6.2, **static variant** | Server-rendered links to `/ja/`, `/en/` and `/zh-TW/` (the locale homes), each with `lang` and `hrefLang`. There is no current locale and no `aria-current`, because the unmatched URL belongs to no locale. |
| Header | §6.3, wordmark only | Wordmark → `/ja/`. No primary navigation and no menu: this document has no client navigation component. |
| `main#main-content` | Porcelain band with eyebrow | eyebrow "404" · h1 `notFound.title` · lead `notFound.description` · primary button `notFound.backHome` → `/ja/` |

These contracts are REQUIRED by `validate-mvp.mjs` and are kept:

- `<html lang="ja">`.
- The three not-found strings.
- `href="/ja/"`, `href="/en/"` and `href="/zh-TW/"`. The static locale bar replaces today's separate locale-link list and supplies the same three hrefs exactly.
- The title `${notFound.title} | ${site.name}` and `robots: noindex, nofollow`.

There is no footer, as today. Inter is loaded on this root too (handoff, "HTML roots").

`src/app/not-found.tsx` renders `NotFoundContent` inside whichever root layout applies. It uses the same porcelain band and needs no separate composition.

## Root redirect fallback: `/` (`src/app/(redirect)/page.tsx`)

Render: `root-fallback-ja-375.png`. Preview: `dist/root/index.html` carries the production metadata (meta refresh, canonical, robots) and is what the checker verifies. `dist/root/fallback.html` is the same document without the refresh; it is what a visitor sees when the refresh doesn't fire, and it is what is measured and rendered. The checker enforces that the two differ only by the refresh.

| Region | Component | Content |
|---|---|---|
| Skip link, locale bar (static variant), wordmark-only header | As for the global 404 | Locale bar links to the three locale homes; no current locale |
| `main#main-content` | Porcelain band | h1 `site.title` · lead `site.description` · primary button `pages.homeLink` → `/ja/` |

Kept exactly (REQUIRED by `validate-mvp.mjs`):

- `<meta http-equiv="refresh" content="0;url=/ja/">`.
- The `/ja/` fallback link (now the primary button, with `href="/ja/"`).
- The canonical URL `/ja/`.
- `robots: noindex, follow`.
- `lang="ja"`.

The added `/en/` and `/zh-TW/` links are routes that `validate-mvp.mjs` already allows. Inter is loaded on this root too: today's `(redirect)/layout.tsx` loads only Geist.

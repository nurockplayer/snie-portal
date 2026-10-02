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
- **Photos stay lazy** (#55). With paths above the archive, the first photo starts 866–1427px down the page depending on width and locale (MEASURED), so it is never the LCP element. The #55 LCP target is still re-measured after implementation; see decision D-08.

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

## Not found: `404.html` and localized not-found

| Section | Component | Content |
|---|---|---|
| Page header | Porcelain band with eyebrow | eyebrow "404" · h1 `notFound.title` · lead `notFound.description` · primary button `notFound.backHome` → `/{locale}/` |

`global-not-found.tsx` keeps its default-locale content and its `/ja/`, `/en/` and `/zh-TW/` fallback links (REQUIRED by `validate-mvp.mjs`). Those links should use the locale-bar component, so the 404 page offers language choice the same way as every other page.

## Root redirect: `/`

There is no visual change beyond tokens. The root page keeps the meta refresh to `/ja/`, the `/ja/` fallback link, the canonical URL and `noindex` (REQUIRED by `validate-mvp.mjs`). It replaces `bg-brand-primary` and similar classes with the new tokens.

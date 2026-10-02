# SNIE Porcelain — implementation handoff

This is the change list for implementing the design in `src/`. **This design PR changes no product source.**

Before starting, read [snie-design-system.md](snie-design-system.md) and [pages.md](pages.md). Use [`preview/preview.css`](preview/preview.css) and [`preview/build-preview.mjs`](preview/build-preview.mjs) as the reference and translate them to Tailwind utilities on the existing components. Don't ship the preview files.

## Slice order and dependencies

| Slice | Depends on | Owner gate | Closes |
|---|---|---|---|
| 1. Tokens, fonts, all HTML roots | none | **U-01** decides whether the `action`/`accent`/`focus` values are violet or the current navy. The slice can ship either way. | — |
| 2. Chrome: locale bar, 64px header, mobile menu, footer, root and 404 compositions | 1 | U-03 (strings it consumes) | **#54** (offset), **#58** |
| 3. Page components | 1, 2 | U-03 | — (#55 is measured here, see gate G-1) |
| 4. Dictionary keys | lands inside 2 and 3 | U-03 | — |
| 5. Social preview | 1 | **U-02**, U-01 | #59 |

Each slice merges with CI green. A slice's checks only test what that slice delivers: the 64px header and fragment offset are slice 2 checks, not slice 1.

## HTML roots

Every document root that imports `globals.css` must set `--font-inter`. There are exactly three roots:

| Root | Today | Change |
|---|---|---|
| `src/app/(site)/[locale]/layout.tsx` | Geist + Geist Mono variables | `Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })` on `<html className>`; remove Geist |
| `src/app/(redirect)/layout.tsx` | Geist + Geist Mono variables | Same Inter variable on its `<html>`; remove Geist |
| `src/app/global-not-found.tsx` | No font variable | Same Inter variable on its `<html>` |

Define the `Inter(...)` call once, for example in `src/app/fonts.ts`, and import it in all three, so the roots can't drift apart. The theme's `var(--font-inter, Inter)` fallback is a safety net, not a substitute.

`src/app/not-found.tsx` isn't a root. It renders inside whichever root applies.

## Slice 1: tokens, fonts and all HTML roots

| File | Change |
|---|---|
| `src/app/globals.css` | Keep `@import "tailwindcss";` first. Replace the current `:root` and `@theme inline` blocks, `body`, `:focus-visible`, `summary` rules and `.page-container` with [`tokens/snie-theme.css`](tokens/snie-theme.css). Keep a `.page-container` helper: `width: min(100% - 2 * var(--snie-gutter), var(--snie-content-max)); margin-inline: auto`. Keep `.skip-link`, restyled per §6.16. Leave the global `summary::after` marker until slice 3 moves it into the FAQ. |
| `src/app/fonts.ts` (**new**) | The shared `Inter` definition. |
| The three HTML roots | As in the table above |

**Token migration.** Rename classes everywhere they appear in `src/`:

| Old utility | New utility |
|---|---|
| `bg-page-bg` | `bg-surface-page` |
| `bg-surface` | `bg-surface-chrome` (page bands) or `bg-surface-inset` (wells), per component spec |
| `bg-surface-elevated` | `bg-surface-raised` |
| `text-text-primary` / `text-text-secondary` | unchanged names |
| `border-border` | `border-border-subtle` |
| `bg-brand-primary` / `hover:bg-brand-primary-hover` | `bg-action-primary` / `hover:bg-action-primary-hover` + `active:bg-action-primary-pressed` |
| `text-brand-primary` (links) | `text-text-link` |
| `text-brand-primary` (current nav, eyebrow) | `text-accent-fg` |
| `outline-focus` | `outline-focus-ring` |
| `font-bold` | `font-semibold` (maximum weight is 600) |

Search for leftovers with `grep -rn "brand-primary\|page-bg\|surface-elevated\|border-border\b\|outline-focus\b\|font-bold\|font-geist" src`.

**Slice 1 checks**

- `pnpm lint && pnpm test:ops && pnpm build && pnpm check:mvp`.
- On `/ja/`, `/zh-TW/`, `/` (root) and a missing URL (404), the computed `--font-inter` is defined on `<html>`. The platform fonts for the h1 match the design system's §4.1 values (macOS: Inter + Hiragino Sans, Inter + PingFang TC).

## Slice 2: chrome, root and 404 compositions

Closes **#54** (offset) and **#58**.

| File | Change |
|---|---|
| `src/components/SiteHeader.tsx` | Render the locale bar (§6.2) **above** the header, as a sibling: `bg-surface-chrome`, a 44px row. The header is `[position:var(--snie-header-position)] top-0 h-header` with hairlines as `shadow-[inset_0_1px_0_var(--snie-border-subtle),0_1px_0_var(--snie-border-subtle)]`. In forced colours, add `forced-colors:border-y forced-colors:border-[CanvasText]` and shrink the inner row with `forced-colors:h-[calc(var(--snie-header-height)-2px)]`, so the outer box stays 64px. Show the full name from `sm` (40rem), `max-w-80`. |
| `src/components/LanguageSwitcher.tsx` | Keep it as the client component; `usePathname` is still needed. Add `lang={locale}` and `hrefLang={locale}`. The current-locale style changes from a violet pill to weight 600 + a 2px `accent-fg` bottom bar (§6.2). Keep `role="group"`, `aria-label` and `aria-current`. |
| **new** `src/components/LocaleBarStatic.tsx` | Server component for the root fallback and global 404. It renders the same markup and styles as the locale bar, with `href={`/${locale}/`}` for each locale, `lang`/`hrefLang`, and no `aria-current`. |
| `src/components/SiteNavigation.tsx` | Remove both `<LanguageSwitcher>` instances. Restyle the desktop links (§6.3). The menu panel (§6.4): `absolute inset-x-[calc(-1*var(--snie-gutter))] top-[calc(100%+1px)] shadow-overlay max-h-[calc(100dvh-var(--snie-header-height)-1px)] overflow-y-auto overscroll-contain`, plus `[@media(max-height:32rem)]:max-h-none [@media(max-height:32rem)]:overflow-visible`. Rows are 48px. Add the menu/close glyphs (inline SVG, `aria-hidden`). Never hide overflow to make it fit. |
| `src/components/SiteNavigation.tsx`, **behaviour** | Exactly what the preview implements; listeners go on the `<details>` element through a `ref`, with no state library. (1) `onKeyDown`: on `Escape` while open, `preventDefault()`, set `open = false`, focus the `<summary>`. (2) `onBlur` (React's bubbling focusout): if `event.relatedTarget` is non-null and outside the `<details>`, set `open = false` without moving focus. (3) `useEffect` on `pathname`: set `open = false`. (4) A `pageshow` listener: set `open = false`. Don't listen on `document`. |
| `src/components/SiteFooter.tsx` | Restyle per §6.15. The wordmark link keeps its 44px minimum. |
| `src/app/global-not-found.tsx` | Compose skip link + `LocaleBarStatic` + wordmark-only header + `<main id="main-content" tabIndex={-1}>` + `NotFoundContent` (pages.md, "Global 404"). Remove today's separate locale-link list; `LocaleBarStatic` supplies the same `/ja/`, `/en/`, `/zh-TW/` hrefs. |
| `src/app/(redirect)/page.tsx` | Compose skip link + `LocaleBarStatic` + wordmark-only header + `<main id="main-content">` with the porcelain band (pages.md, "Root redirect fallback"). Keep the meta refresh, the `/ja/` link, the canonical URL and `noindex` exactly. |

**Slice 2 checks.** Adapt [`capture-renders.mjs`](preview/capture-renders.mjs) to serve `out/` (`pageUrl` → `http://localhost:3000/...`) and run its layout, fragment and menu sections:

- The header box is 64px on every route at 320, 375, 768 and 1280px, and in forced colours.
- Fragment headings clear the header by at least 16px, by direct entry and by home card → Back → Forward. With Next.js client navigation this is new evidence the preview couldn't provide.
- The full menu suite passes at 320×200, 640×360, 320×640, 375×812 and 768×1024, with the header at its initial position and stuck, in all three locales.
- Every page still contains `/ja/`, `/en/` and `/zh-TW/` links.

## Slice 3: page components

| File | Change |
|---|---|
| `src/components/HeroSection.tsx` | Porcelain hero (§6.5): `bg-(image:--snie-material-porcelain)`, eyebrow without `uppercase`/tracking, `display` h1, lead, primary + secondary actions (secondary is `nav.about` → `/{locale}/about`). Two columns from `lg`. |
| `src/components/StaticPageFrame.tsx` | Page header uses the porcelain band and the `title` role. **Split `EmptyState`**: keep `EmptyState` for collections (dashed `border-control`, `bg-surface-inset`, no left bar) and add a `Statement` export for Privacy. |
| `src/app/(site)/[locale]/page.tsx` | Reorder to `<HeroSection/> <FeaturesSection/> <LegacyMediaSection/>`. |
| `src/components/FeaturesSection.tsx` | Participation link card (§6.8): the h3 contains the `<Link>` with a "→" glyph; `after:absolute after:inset-0` stretches it. Remove the second title-text link. One column, then `lg:grid-cols-3`. |
| `src/app/(site)/[locale]/join/page.tsx` | Article cards (§6.8) with `target:border-selection-edge target:bg-surface-selected target:shadow-[inset_0_3px_0_var(--snie-selection-edge)]` and the forced-colours fallback `forced-colors:target:border-t-[3px] forced-colors:target:border-[Highlight]`. `lg:grid-cols-3`. The destination uses `<ExternalHandoff emphasis="primary">`; the FAQ uses the restyled disclosure, which takes over the `+`/`−` marker from `globals.css`. |
| `src/app/(site)/[locale]/contact/page.tsx` | Replace `EmptyState` + `PublicIssuesLink` with `<ExternalHandoff title={emptyTitle} body={emptyBody} … emphasis="primary">`. |
| `src/app/(site)/[locale]/privacy/page.tsx` | `privacy-status` uses `Statement`; `privacy-review` uses the fact list; `privacy-contact` uses `<ExternalHandoff emphasis="secondary">`. |
| `src/app/(site)/[locale]/about/page.tsx` | Text link with "→" glyph; prose `max-w-measure`. |
| `src/app/(site)/[locale]/activities/page.tsx`, `news/page.tsx` | Restyled `EmptyState`; keep the `aria-labelledby="empty-state-heading"` section. |
| **new** `src/components/ExternalHandoff.tsx` | Server component. Props: `title?`, `body`, `href`, `label`, `emphasis: "primary" \| "secondary"`, `dict`. Renders the panel, the facts list (`aria-labelledby` the facts label) and the action via `PublicIssuesLink`. |
| `src/components/PublicIssuesLink.tsx` | Add `variant` (`"text" \| "primary" \| "secondary"`) and `opensInNewTabLabel`. Render `↗` (`aria-hidden`) plus `<span className="sr-only">{label}</span>`. **Keep `target="_blank" rel="noreferrer"` in that exact attribute order.** |
| `src/components/LegacyMediaSection.tsx` | Photo archive (§6.13) on `bg-surface-chrome`; one column, then `md:grid-cols-3`. Pass the provisional loading policy: index 0 gets `loading="eager"`, the rest `loading="lazy"`. **Keep the caption first line byte-identical:** `<span className="block">{dict.media.captionFallback}</span>`, no extra classes. |
| `src/components/RemoteMediaImage.tsx` | Replace the hard-coded `loading="lazy"` with explicit `loading` and `fetchPriority` props (#55 requirement 1); defaults `lazy` and `auto`. Add `width`/`height` props with `h-auto`. Frame: `aspect-[4/3] object-contain bg-surface-inset rounded-container border border-border-subtle`. Fallback block unchanged apart from tokens. |
| `src/components/NotFoundContent.tsx` | Porcelain band, eyebrow "404", `title` h1, primary button. |

**Gate G-1 (#55), part of slice 3 acceptance.** Run #55's protocol on the built site: three Lighthouse mobile runs each on `/ja/` and `/zh-TW/`, plus desktop runs. Record the LCP element.

- If the first photo is the mobile LCP element, add `fetchPriority="high"` to it.
- If it isn't, leave it at `auto`.
- In both cases the acceptance stays #55's: median mobile LCP ≤ 2.5s, CLS 0, no meaningful desktop regression.
- Add #55's regression assertion: the first photo is not emitted with `loading="lazy"`.

## Slice 4: dictionaries

These keys land in the same change as the components that use them (slices 2 and 3). Copy is in [proposed-dictionary-keys.json](proposed-dictionary-keys.json). **Native-speaker review of the `ja` and `zh-TW` copy, in context (U-03), before merging.**

| Key | Used by |
|---|---|
| `accessibility.opensInNewTab` | `PublicIssuesLink`, `LegacyMediaSection` source link |
| `handoff.github.factsTitle` | `ExternalHandoff` |
| `handoff.github.public` | `ExternalHandoff` |
| `handoff.github.account` | `ExternalHandoff` |
| `handoff.github.destination` | `ExternalHandoff` |
| `site.socialImageAlt` | `createPageMetadata`, **only after** #59's image is approved |

`handoff` is a new top-level key. `validate-mvp.mjs` doesn't require it, but `Dictionary` (`src/i18n/dictionaries/index.ts`) is the union of the three JSON types. A key missing from any one locale file therefore fails type-checking wherever it is read, so add it to all three in the same commit.

## Slice 5: social preview (#59, blocked on U-02 and U-01)

- After approval, export [`assets/social-preview.svg`](assets/social-preview.svg) as `public/og/snie-portal.png` (1200 × 630) with outlined text, so it doesn't depend on fonts.
- Add `openGraph.images` and `twitter.images` (with `card: "summary_large_image"`) in `src/i18n/metadata.ts`, using `site.socialImageAlt`.
- Update `validate-mvp.mjs`, which currently expects `twitter:card` to be `summary`, and extend the smoke checks per #59 (stable URL, 200, image content type, localized alt).

## Contract checklist

| Contract | Source | Design impact |
|---|---|---|
| 21 localized routes exported, `html lang` correct | `validate-mvp.mjs` | None. Routes are unchanged. |
| Title, description, canonical, hreflang (+ x-default), OG and Twitter fields exact | `validate-mvp.mjs` | None until slice 5 |
| `twitter:card` = `summary` | `validate-mvp.mjs` | Unchanged until #59 is approved |
| Favicon link | `validate-mvp.mjs` | None |
| `href="{publicIssuesUrl}"` on join, contact and privacy | `validate-mvp.mjs` | Kept inside `ExternalHandoff` |
| `target="_blank" rel="noreferrer"` substring present | `validate-mvp.mjs` | Kept; attribute order matters |
| `<span class="block">{captionFallback}</span>` on home | `validate-mvp.mjs` | Kept byte-identical; don't add classes to that span |
| Participation path ids, in order | `validate-mvp.mjs` | Kept as `<article id>` |
| Root: meta refresh to `/ja/`, `href="/ja/"`, canonical `/ja/`, noindex | `validate-mvp.mjs` | Kept in the new root composition (slice 2) |
| 404: `lang="ja"`, not-found strings, `href="/ja/"`, `href="/en/"`, `href="/zh-TW/"` | `validate-mvp.mjs` | `LocaleBarStatic` supplies exactly these hrefs (slice 2) |
| Sitemap = exactly 21 routes; robots rules | `validate-mvp.mjs` | None |
| Internal links resolve to expected routes | `validate-mvp.mjs` | Fragment links `/join#…` still resolve to `/join` |
| No `href="#"`, placeholder URLs, or draft markers in `src` | `validate-mvp.mjs` | New copy contains none (checked by check-design.mjs) |
| Production smoke metadata | `scripts/smoke-production.mjs` | None until slice 5 |
| No dark mode, no animation, minimal `'use client'` | AGENTS.md | No new client components; the menu behaviour lives in the existing `SiteNavigation` client component |
| No invented organisation facts | AGENTS.md, `docs/content-governance.md` | New keys restate existing facts only |

## Issue mapping

| Issue | Covered by | Slice |
|---|---|---|
| #54 Join anchors hidden under the sticky header | 64px header box + `scroll-padding-top` token (+ short-viewport offset); `:target` card | 2 (offset), 3 (card) |
| #55 Mobile LCP image lazy-loaded | Explicit loading policy on `RemoteMediaImage`; first photo eager; `fetchpriority` decided by Lighthouse (G-1); acceptance unchanged | 3 |
| #58 Escape doesn't close the mobile menu | `<details>`-scoped Escape + focus return; close on focus leaving, navigation and bfcache restore | 2 |
| #59 No social preview | Typographic candidate + metadata plan | 5 (blocked) |
| #52 Activities/News content model | Dormant register spec; empty state until qualified | Later |
| #50 Private contact route | `ExternalHandoff` takes provider facts unchanged; GitHub Issues remain unsuitable for private requests | Later |
| #49 Owner-approved information baseline | No new facts; palette replaceable via tokens | Later |

## Verification after implementation

1. `pnpm lint && pnpm test:ops && pnpm build && pnpm check:mvp`.
2. The capture harness against the served build (slice 2 checks), including forced colours.
3. Gate G-1: Lighthouse mobile and desktop.
4. Manual checks the preview can't certify:
   - VoiceOver and NVDA.
   - Native Windows High Contrast.
   - iOS Safari and Android Chrome with their system CJK fonts.
   - Windows with Microsoft JhengHei, Yu Gothic and Meiryo.
5. Human visual review of the implemented pages against the renders, in all three locales.

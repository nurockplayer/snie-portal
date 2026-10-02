# SNIE Porcelain — implementation handoff

This is the change list for implementing the design in `src/`. It is ordered so each slice can merge on its own with CI green. **This design PR changes no product source.**

Before starting, read [snie-design-system.md](snie-design-system.md) and [pages.md](pages.md). Use [`preview/preview.css`](preview/preview.css) as the visual reference and translate it to Tailwind utilities on the existing components. Don't ship the preview CSS.

## Slice 1: tokens, fonts and global behaviour

Closes **#54**.

| File | Change |
|---|---|
| `src/app/globals.css` | Keep `@import "tailwindcss";` as the first line. Replace the current `:root` and `@theme inline` blocks, `body`, `:focus-visible`, `summary` rules and `.page-container` with the contents of [`tokens/snie-theme.css`](tokens/snie-theme.css). Keep a `.page-container` helper defined as `width: min(100% - 2 * var(--snie-gutter), var(--snie-content-max)); margin-inline: auto`. Keep `.skip-link`, restyled per §6.16. Remove the `summary::after` "+" rule from the global scope; it moves to the FAQ component. |
| `src/app/(site)/[locale]/layout.tsx` | Replace `Geist`/`Geist_Mono` with `Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })`, applied to `<html className>`. Add `tabIndex={-1}` to `<main id="main-content">`. |
| `src/app/global-not-found.tsx` | Apply the Inter variable to its `<html>` as well, because it imports `globals.css` directly. |

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

Search for leftovers with `grep -rn "brand-primary\|page-bg\|surface-elevated\|border-border\b\|outline-focus\b\|font-bold" src`.

**Checks for this slice**

- `scroll-padding-top` resolves to 80px.
- The header measures 64px at 320, 375, 768 and 1280px in `ja`, `en` and `zh-TW`.
- `/zh-TW/` renders 直 with the Traditional Chinese form on macOS.

## Slice 2: chrome (locale bar, header, mobile menu, footer)

Closes **#58**.

| File | Change |
|---|---|
| `src/components/SiteHeader.tsx` | Render the locale bar (§6.2) **above** the sticky header, as a sibling: a `<div>` with `bg-surface-chrome` and a 44px row. The header becomes `h-header` (64px) with hairlines drawn as `shadow-[inset_0_1px_0_var(--snie-border-subtle),0_1px_0_var(--snie-border-subtle)]`. In forced colours it needs a real border: add a `forced-colors:border-y` utility. Show the full name from `sm` (40rem), with `max-w-80`. |
| `src/components/LanguageSwitcher.tsx` | Keep it as the client component; `usePathname` is still needed. Add `lang={locale}` and `hrefLang={locale}` to each link. The current-locale style changes from a violet pill to the weight-600 + 2px `accent-fg` bottom bar (§6.2). Keep `role="group"`, `aria-label` and `aria-current`. |
| `src/components/SiteNavigation.tsx` | Remove both `<LanguageSwitcher>` instances. Restyle the desktop links (§6.3). Replace the dropdown panel with a full-width panel (§6.4): `absolute inset-x-[calc(-1*var(--snie-gutter))] top-[calc(100%+1px)] shadow-overlay`, with 48px rows. Add the menu and close glyphs (inline SVG, `aria-hidden`). **#58:** attach a `keydown` listener to the `<details>` element. On `Escape`, set `open = false` and focus the `<summary>`. Close the menu when `pathname` changes (`useEffect` on `pathname`). Use a `ref`; no state library. |
| `src/components/SiteFooter.tsx` | Restyle per §6.15. The wordmark link keeps its 44px minimum. |
| `src/app/globals.css` | Move the FAQ `+`/`−` marker into the FAQ component (slice 3). |

**Checks for this slice**

- Keyboard sequence at 375px in each locale: focus Menu, press Enter (opens), Tab (focus inside), Escape (closes, focus on Menu).
- Desktop nav has no locale links.
- Every page still contains `/ja/`, `/en/` and `/zh-TW/` links: the locale bar provides them, and the 404 test needs them.

## Slice 3: page components

Resolves **#55** by layout (see D-08 and U-05).

| File | Change |
|---|---|
| `src/components/HeroSection.tsx` | Porcelain hero (§6.5): `bg-(image:--snie-material-porcelain)` (or an arbitrary `bg-[image:var(--snie-material-porcelain)]`), eyebrow without `uppercase`/tracking, `display` h1, lead, primary + secondary actions (secondary is `nav.about` → `/{locale}/about`). |
| `src/components/StaticPageFrame.tsx` | Page header uses the porcelain band and the `title` role. **Split `EmptyState`**: keep `EmptyState` for collections (dashed `border-control`, `bg-surface-inset`, no left bar) and add a `Statement` export for Privacy. |
| `src/app/(site)/[locale]/page.tsx` | Reorder to `<HeroSection/> <FeaturesSection/> <LegacyMediaSection/>`. |
| `src/components/FeaturesSection.tsx` | Participation link card (§6.8): the h3 contains the `<Link>` with a "→" glyph; `after:absolute after:inset-0` stretches it. Remove the second title-text link. Use one column, then `lg:grid-cols-3`. |
| `src/app/(site)/[locale]/join/page.tsx` | Article cards (§6.8) with `target:border-selection-edge target:bg-surface-selected target:shadow-[inset_0_3px_0_var(--snie-selection-edge)]`. Add the forced-colours fallback `forced-colors:target:border-t-[3px]`. Use `lg:grid-cols-3`. The destination section uses `<ExternalHandoff emphasis="primary">`. The FAQ uses the restyled disclosure. |
| `src/app/(site)/[locale]/contact/page.tsx` | Replace `EmptyState` + `PublicIssuesLink` with `<ExternalHandoff title={emptyTitle} body={emptyBody} … emphasis="primary">`. |
| `src/app/(site)/[locale]/privacy/page.tsx` | `privacy-status` uses `Statement`; `privacy-review` uses the fact list; `privacy-contact` uses `<ExternalHandoff emphasis="secondary">`. |
| `src/app/(site)/[locale]/about/page.tsx` | Text link with "→" glyph; prose max width `max-w-measure`. |
| `src/app/(site)/[locale]/activities/page.tsx`, `news/page.tsx` | Restyled `EmptyState` only; keep the `aria-labelledby="empty-state-heading"` section. |
| **new** `src/components/ExternalHandoff.tsx` | Server component. Props: `title?`, `body`, `href`, `label`, `emphasis: "primary" \| "secondary"`, `dict`. Renders the panel, the facts list (`aria-labelledby` the facts label) and the action via `PublicIssuesLink`. |
| `src/components/PublicIssuesLink.tsx` | Add a `variant` prop (`"text" \| "primary" \| "secondary"`) and an `opensInNewTabLabel` prop. Render `↗` (`aria-hidden`) plus `<span className="sr-only">{label}</span>`. **Keep `target="_blank" rel="noreferrer"` in that exact attribute order.** |
| `src/components/LegacyMediaSection.tsx` | Photo archive (§6.13) on `bg-surface-chrome`. Use one column, then `md:grid-cols-3`. Don't pass `priority`: no photo is above the fold (D-08). **Keep the caption first line byte-identical:** `<span className="block">{dict.media.captionFallback}</span>`, with no extra classes. The source link uses the external text-link pattern. |
| `src/components/RemoteMediaImage.tsx` | Add a `priority?: boolean` prop (default false). If true, use `loading="eager"` and `fetchPriority="high"`; otherwise `loading="lazy"` (#55 requirement 1; unused by the current layout, see D-08). Add `width`/`height` props with `h-auto`. Frame: `aspect-[4/3] object-contain bg-surface-inset rounded-container border border-border-subtle`. Fallback block unchanged apart from tokens. |
| `src/components/NotFoundContent.tsx` | Porcelain band, eyebrow "404", `title` h1, primary button. |
| `src/app/(redirect)/page.tsx` | Token rename only. |

## Slice 4: dictionaries

These keys must land in the same change as the components that use them (slices 2 and 3). Copy is in [proposed-dictionary-keys.json](proposed-dictionary-keys.json). **Get a native-speaker review of the `ja` and `zh-TW` strings before merging.**

| Key | Used by |
|---|---|
| `accessibility.opensInNewTab` | `PublicIssuesLink`, `LegacyMediaSection` source link |
| `handoff.github.factsTitle` | `ExternalHandoff` |
| `handoff.github.public` | `ExternalHandoff` |
| `handoff.github.account` | `ExternalHandoff` |
| `handoff.github.destination` | `ExternalHandoff` |
| `site.socialImageAlt` | `createPageMetadata`, **only after** #59's image is approved |

`handoff` is a new top-level key. `validate-mvp.mjs` doesn't require it, but `Dictionary` (`src/i18n/dictionaries/index.ts`) is the union of the three JSON types. A key missing from any one locale file therefore fails type-checking wherever it is read, so add it to all three in the same commit.

## Slice 5: social preview (#59, blocked on owner approval)

- After approval, export [`assets/social-preview.svg`](assets/social-preview.svg) as `public/og/snie-portal.png` (1200 × 630) with outlined text, so it doesn't depend on fonts.
- Add `openGraph.images` and `twitter.images` (with `card: "summary_large_image"`) in `src/i18n/metadata.ts`, using `site.socialImageAlt`.
- Update `validate-mvp.mjs`, which currently expects `twitter:card` to be `summary`, and extend the smoke checks per #59.

## Contract checklist

Each item must still hold after implementation. Most are enforced by `pnpm check:mvp`.

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
| Root meta refresh, fallback link, canonical, noindex | `validate-mvp.mjs` | Token rename only |
| 404: `lang="ja"`, not-found strings, three locale links | `validate-mvp.mjs` | Locale bar supplies the links |
| Sitemap = exactly 21 routes; robots rules | `validate-mvp.mjs` | None |
| Internal links resolve to expected routes | `validate-mvp.mjs` | Fragment links `/join#…` still resolve to `/join` |
| No `href="#"`, placeholder URLs, or draft markers in `src` | `validate-mvp.mjs` | New copy contains none (checked by check-design.mjs) |
| Production smoke metadata | `scripts/smoke-production.mjs` | None until slice 5 |
| No dark mode, no animation, minimal `'use client'` | AGENTS.md | No new client components; the Escape handler lives in the existing `SiteNavigation` client component |
| No invented organisation facts | AGENTS.md, `docs/content-governance.md` | New keys restate existing facts only |

## Issue mapping

| Issue | Covered by | Slice |
|---|---|---|
| #54 Join anchors hidden under the sticky header | Fixed 64px header + `scroll-padding-top` token + `:target` card | 1, 3 |
| #55 Mobile LCP image lazy-loaded | Paths moved above photos, so no photo is an LCP candidate; `priority` prop available; amend acceptance (U-05) | 3 |
| #58 Escape doesn't close the mobile menu | Escape handler + focus return; close on navigation | 2 |
| #59 No social preview | Typographic candidate + metadata plan | 5 (blocked) |
| #52 Activities/News content model | Dormant register spec; empty state until qualified | Later |
| #50 Private contact route | `ExternalHandoff` takes provider facts unchanged | Later |
| #49 Owner-approved information baseline | No new facts; brand palette replaceable via tokens | Later |

## Verification after implementation

1. Run `pnpm lint && pnpm test:ops && pnpm build && pnpm check:mvp`.
2. Point the capture harness at the real build. Serve `out/` (`pnpm dlx serve@latest out`) and repeat the [`capture-renders.mjs`](preview/capture-renders.mjs) measurements (header height, fragment clearance, targets, Escape path, forced colours) against `http://localhost:3000`. Adapting the harness's `pageUrl` is a small change.
3. Run Lighthouse mobile on `/ja/` and `/zh-TW/` three times each (#55 acceptance).
4. Do manual checks the preview can't certify: VoiceOver/NVDA, Windows High Contrast (native, not emulated), and iOS Safari with real CJK fonts.

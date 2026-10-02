# SNIE Porcelain — design system

> **Status:** proposed canonical design authority. It takes effect when its pull request is reviewed and merged into `develop`.
> **Supersedes:** the 2026-08-20 baseline formerly at `docs/design-system.md`.
> **Machine-readable values:** [`tokens/snie-tokens.json`](tokens/snie-tokens.json). The Tailwind v4 theme is [`tokens/snie-theme.css`](tokens/snie-theme.css).
> **Upstream:** Tachiko Sheet design authority, pinned at `nurockplayer/tachiko-sheet@f44ad23`. See [tachiko-alignment.md](tachiko-alignment.md).

Numbers and claims carry Tachiko's evidence labels:

- **REQUIRED:** an accepted SNIE product or accessibility rule.
- **REFERENCE:** adopted from Tachiko or an external guideline.
- **MEASURED:** recorded from the preview in [`renders/evidence.json`](renders/evidence.json).
- **HEURISTIC:** a proposed value that production use should calibrate.

---

## 1. What this system is for

SNIE Portal is a small, static, trilingual public site. It must route three audiences to the right inquiry path, and say plainly what is and is not known about the organisation. Most of what a visitor needs is short text and one external handoff. The design therefore has two jobs:

1. **Get people to the right place quickly** in their own language, on a phone, by touch, by keyboard, or with assistive technology.
2. **Show only what is known, and show absence on purpose.** Empty Activities and News sections, missing forms and unverified facts are deliberate states, not unfinished pages.

The second job is where Tachiko Sheet's design authority applies most directly. Tachiko's core rule is *state truth*: never let decoration turn uncertainty into apparent success (`ui-quality-contract.md` §1.3, §1.8). SNIE's content governance makes the same rule about facts. This system applies Tachiko's state grammar to content truth.

## 2. Principles

Each principle names the Tachiko source it adapts.

1. **Truthful content state.** An empty section, a missing form or an external handoff gets its own explicit component. It never borrows a component that implies something else, such as an alert, a "coming soon" placeholder or a disabled button. *(Tachiko §1.3, §1.8, §7.1)*
2. **Priority follows the visitor's task.** The visitor's task on the home page is "how do I take part?", so participation paths come before the photo archive. On inner pages the page's one action (usually the external handoff) is the strongest element. *(Tachiko §1.1)*
3. **Quiet chrome, readable content.** The locale bar, header and footer use low-contrast surfaces and hairlines. Violet appears only where something is actionable, current, or focused. *(Tachiko north star: "quiet chrome, explicit state")*
4. **Stable geometry.** The header is exactly 64px at every width and in every locale, so one token offsets every fragment target. Hover and focus never move layout. *(Tachiko §1.2)*
5. **Consequence next to the action.** What happens when you follow an external link (it's public, needs an account, and leaves the site) is stated beside the link, not only in surrounding prose. *(Tachiko §1.6, §1.8)*
6. **Equal standing for every audience and language.** The three participation paths share one card, in a fixed order with equal size, so none is featured. All three locales get correct script typography, including the correct Han glyph forms. *(SNIE principle 1.1; Tachiko §1.9 CJK requirement)*
7. **One behavioural grammar.** A text link, button, card or disclosure behaves the same on every page. *(Tachiko §1.10)*
8. **Accessibility is a constraint, not a pass.** Keyboard focus, 44px targets, forced colours, reduced motion and correct `lang` metadata are part of every component definition below. *(Tachiko §1.9)*

## 3. Colour

**REFERENCE.** All values come from Tachiko Sheet's `InterfaceProfileV1` porcelain profile and FES45/v3 status roles. SNIE renames the roles for a public site; the `tachiko` column of the token file records each source.

| Role | Value | Use |
|---|---|---|
| `surface.page` | `#FFFFFF` | Page and reading surface |
| `surface.chrome` | `#F8F8FC` | Locale bar, footer, photo-archive section |
| `surface.tint` | `#F0EDFD` | Leading stop of the porcelain band |
| `surface.raised` | `#FFFFFF` | Cards, handoff panel, open mobile menu |
| `surface.inset` | `#F5F6F9` | Empty state, photo frame, hover well |
| `surface.selected` | `#F6F4FE` | Participation card reached by a fragment link |
| `text.primary` | `#252735` | Headings and body |
| `text.secondary` | `#646879` | Supporting copy, captions |
| `text.onTint` | `#5B6072` | Secondary copy on `surface.tint` |
| `text.link` | `#5542B5` | Text links |
| `border.subtle` | `#DFE2EA` | Dividers and card outlines (decorative) |
| `border.control` | `#818798` | Boundaries of controls (3.59:1) |
| `action.primary.*` | `#6350D2` / `#5541C2` / `#4936AB` on `#FFFFFF` | Primary button rest / hover / pressed |
| `accent.foreground` | `#5542B5` | Current page, current locale, eyebrow |
| `selection.edge`, `focus.ring` | `#6551CE` | `:target` card edge, keyboard focus |
| `status.*` | FES45/v3 warning, error, success | Reserved. No current page has a status notice. |

**Porcelain material** (`--snie-material-porcelain`): `linear-gradient(108deg, #F0EDFD 0%, #F8F8FC 35%, #F8F8FC 100%)`. This is Tachiko's workbook-head treatment. SNIE uses it only for the home hero and inner-page title band, the one place that identifies "where am I".

**Why violet** (REQUIRED reasoning, HEURISTIC value): SNIE has no approved brand palette (previous baseline §9.4; issue #49). The interface colour must therefore avoid implying one. The previous navy `#1F4E79` sits close to the blues of the US and Taiwan flags; SNIE principle 1.1 rules out national colours. Violet is not a national colour of Japan, Taiwan or the US, it is Tachiko's accent, and it passes every contrast pair. It is an **interface colour, not an SNIE brand colour**. An owner-approved brand palette may replace the `action.*`, `accent.*`, `selection.edge` and `focus.ring` values later, provided [check-design.mjs](preview/check-design.mjs) still passes.

**Contrast** (REQUIRED minimums, MEASURED results; all 26 declared pairs pass): body text 14.79:1 on the page; secondary text at least 5.08:1 on every surface; links at least 6.81:1; primary button label 5.82:1; focus ring at least 5.04:1 on every surface; `border.control` 3.59:1.

**Rules**

- Violet means *actionable, current, or focused*. Never use it for decoration, section backgrounds or large text blocks.
- `border.subtle` (1.3:1) is decorative only. Any boundary that identifies a control uses `border.control`.
- Status colours always come with text and a glyph, and only when a real status exists.

## 4. Typography

### 4.1 Families (REQUIRED)

| Script | Stack | Selected by |
|---|---|---|
| Latin | Inter (via `next/font/google`, self-hosted at build), then `ui-sans-serif, system-ui, -apple-system, "Segoe UI"` | `[lang\|="en"]` and Latin glyphs in every locale |
| Japanese | Inter for Latin glyphs, then `"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans CJK JP", "Yu Gothic UI", "Yu Gothic", Meiryo` | `[lang\|="ja"]` |
| Traditional Chinese | Inter for Latin glyphs, then `"PingFang TC", "Noto Sans TC", "Noto Sans CJK TC", "Microsoft JhengHei UI", "Microsoft JhengHei"` | `[lang="zh-TW"]` |

**Finding (MEASURED):** the current shared stack puts `"Hiragino Sans"` first for every locale. On macOS and iOS, Traditional Chinese pages therefore render unified Han characters such as 直 骨 角 誤 遊 令 with **Japanese glyph forms**. The component board's Han comparison shows this. The stacks above are chosen by the nearest `lang` attribute, not only the `<html>` element. As a result the locale links, each marked with its own `lang`, render 繁體中文 and 日本語 correctly on any page.

No CJK webfont is loaded. System CJK faces avoid a multi-megabyte payload, and every supported platform ships a good one (REFERENCE: matches the current implementation's rationale and Tachiko's "real local faces" policy).

### 4.2 Roles (HEURISTIC sizes, REQUIRED 16px body)

| Role | Desktop | Mobile (<48rem) | Weight | Use |
|---|---|---|---|---|
| `display` | 40/48 | 32/40 | 600 | Home hero h1 |
| `title` | 36/44 | 28/36 | 600 | Inner-page h1 |
| `section` | 24/32 | 22/30 | 600 | h2 |
| `heading` | 18/26 | 18/26 | 600 | h3 card, panel and statement titles |
| `lead` | 18/30 (CJK 18/32) | same | 400 | Hero description, page intro |
| `body` | 16/28 (CJK line-height 1.85) | same | 400 | Paragraphs |
| `small` | 14/22 | same | 400 | Captions, disclosure items, footer |
| `label` | 14/20 | same | 500 | Navigation, locale links, eyebrow |
| `meta` | 13/20 | same | 400 | Dates and source lines in the register |

- Maximum weight is **600** (REFERENCE: Tachiko uses none heavier). The old 700 is removed.
- Negative tracking (−0.01 to −0.02em) applies to Latin display sizes only; CJK headings use 0.
- No uppercase transforms. The eyebrow is the organisation's proper name and keeps its case.
- Reading measure is 40rem (`--snie-measure`) for intros and prose.

### 4.3 Line breaking (HEURISTIC)

- `ja`, `zh-TW`: `line-break: strict; word-break: normal`. Japanese h1 to h3 also use `word-break: auto-phrase` as a progressive enhancement; browsers without it ignore it.
- All headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.
- No fixed-height text containers anywhere except the header row, whose contents are fixed-length (the wordmark and short nav labels; see §5.2).

## 5. Layout

### 5.1 Grid and spacing

- Content max width is 72rem. The gutter is 1rem below 48rem and 2rem from 48rem (REFERENCE: unchanged from the current `.page-container`).
- Breakpoints are Tailwind's `md` (48rem) and `lg` (64rem), the ones the codebase already uses.
- The spacing rhythm is 8 / 12 / 16 / 24 / 32 px within components and 48 px (mobile) or 64 px (≥48rem) for section padding (HEURISTIC).
- Adjacent sections are separated by a `border.subtle` hairline, not alternating backgrounds. The only tinted section is the photo archive (`surface.chrome`), which marks it as archival material.

### 5.2 Page chrome (REQUIRED geometry)

```
┌──────────────────────────────────────────────┐
│ locale bar · surface.chrome · 44px · scrolls  │   日本語  English  繁體中文
├──────────────────────────────────────────────┤
│ site header · white · 64px · sticky top:0     │   SNIE           nav / Menu
├──────────────────────────────────────────────┤
│ porcelain band (hero or page title)           │
│ sections…                                     │
│ footer · surface.chrome                       │
└──────────────────────────────────────────────┘
```

- **The locale bar is always visible at every width.** It is a scrolling row above the header, not inside the mobile menu, because a visitor who lands in the wrong language must be able to switch without opening a menu or knowing the word "Menu" in an unfamiliar language. At 320px all three labels fit (MEASURED: no horizontal overflow on any of the 84 route × width combinations).
- **The header is exactly 64px** (`--snie-header-height`) in every locale at 320, 375, 768 and 1280 px (MEASURED). Its hairlines are drawn as box-shadows so they don't add height; in forced colours they become real borders.
- **Fragment offset:** `html { scroll-padding-top: calc(var(--snie-header-height) + 1rem) }`. This is one rule for every fragment target, with no per-element magic numbers and no JavaScript (#54). MEASURED: every participation heading sits 40–41px below the header bottom in all 27 locale × target × width cases.
- The full organisation name sits under the wordmark from 40rem up. Below that it appears in the footer.

## 6. Components

Each component lists its states. State names follow Tachiko's grammar (`ui-quality-contract.md` §4); only states that actually exist are defined. The reference implementation is [`preview/preview.css`](preview/preview.css); [`renders/components-board-1280.png`](renders/components-board-1280.png) shows every state side by side.

### 6.1 Focus (applies to every interactive element)

- 3px solid `focus.ring` outline with a 2px offset (REFERENCE: Tachiko `.ts-app :focus-visible`).
- Elements flush with an edge (locale links, menu rows, FAQ summaries) use an inset outline (offset −3px) so the ring isn't clipped.
- Forced colours: `outline-color: Highlight`.
- Focus is never removed without a replacement, and is visibly distinct from hover (outline versus surface change).

### 6.2 Locale bar and links

- The links sit in a group (`role="group"`, `aria-label` = `accessibility.languageSwitcher`), right-aligned. Each link is at least 44 × 44px, 14/20 medium.
- Every link carries `lang` and `hreflang` for its own locale.
- **Rest:** `text.secondary`. **Hover:** `text.primary` with an underline. **Current:** `text.primary`, weight 600, a 2px `accent.foreground` bar along the bottom edge, and `aria-current="page"`. Weight plus the bar is a cue that doesn't rely on colour alone.
- Behaviour is unchanged: `getLocalizedPath` keeps the current page or falls back to the locale home.

### 6.3 Site header and primary navigation

- Wordmark: "SNIE" in Inter 20/24, weight 600, tracking 0.04em, `text.primary`, with the full name beneath it at 12/16 `text.secondary` (≥40rem). This is **typographic only**: no logo mark is drawn, because no SNIE mark is approved (#49).
- **Desktop nav (≥64rem):** links are 44px tall, 14/20 medium, `white-space: nowrap`. **Rest:** `text.secondary`. **Hover:** `surface.inset` well plus `text.primary`. **Current:** `accent.foreground`, weight 600, a 2px underline bar, and `aria-current="page"`.
- The locale switcher is no longer inside the nav; it lives in the locale bar.

### 6.4 Mobile menu (<64rem)

- A native `<details>`/`<summary>`, so content stays reachable without JavaScript.
- The summary is a 44px button with a 1px `border.control` boundary, `radius.control`, a menu glyph and the `nav.menu` label. When open, the glyph changes to a close glyph and the border darkens to `text.primary`.
- The panel spans the full width directly under the header, on `surface.raised` with the overlay shadow, the only shadow in the system. Rows are 48px tall and separated by hairlines. The current page uses `accent.foreground`, weight 600 and an underline.
- **Escape** closes the menu and returns focus to the summary (#58). Selecting a link closes it too, because the layout persists across client navigations. These are the only behaviours that need the existing client component.
- MEASURED in all three locales: Enter opens the menu, Tab moves focus into the panel, and Escape closes it and returns focus to the summary.

### 6.5 Porcelain band: hero and page header

- The home hero has an eyebrow (`hero.subtitle`, label role, `accent.foreground`), a `display` h1, a `lead` description, and two actions: primary `hero.cta` → Join, secondary `nav.about` → About. At ≥64rem it becomes a two-column grid, with the heading on the left and the lead and actions on the right, aligned to the bottom.
- The inner-page header has a `title` h1 and a `lead` intro. It has no breadcrumbs, because these are top-level pages (unchanged rule).
- Both have a porcelain background and a `border.subtle` bottom hairline. Neither uses photography; see §7.

### 6.6 Buttons

| | Primary | Secondary |
|---|---|---|
| Rest | `action.primary` fill, white label | `surface.raised`, 1px `border.control`, `text.primary` |
| Hover | `action.primary.hover` | border `text.primary`, `surface.inset` fill |
| Pressed | `action.primary.pressed` | `border.subtle` fill |
| Focus | §6.1 | §6.1 |

- Minimum 44px tall, 10px × 20px padding, 15/22 weight 600, `radius.control` (7px). Height grows with wrapped labels.
- There is no disabled state, because no control is ever disabled on this site. Don't add one; a missing capability is explained in text (principle 1).
- Use **one primary button per view**.

### 6.7 Text links

- `text.link`, weight 600, 1px underline at 4px offset. **Hover:** 2px underline. **Focus:** §6.1. Standalone links are 44px tall.
- **Internal standalone links** end with "→" (`aria-hidden`).
- **External links** end with "↗" (`aria-hidden`), followed by visually hidden `accessibility.opensInNewTab` text. They keep `target="_blank" rel="noreferrer"` exactly (REQUIRED by `validate-mvp.mjs`).
- There are no colour-only links: every link is underlined or shaped as a button or card.

### 6.8 Participation card

There is one component with two uses, and equal weight in both.

- **Shared:** `surface.raised`, 1px `border.subtle`, `radius.container` (10px), 24px padding, h3 `heading` title, `text.secondary` description. Cards keep dictionary order with no featured card. Layout is one column below 64rem and three equal columns from 64rem. (Two columns at tablet width would leave one card orphaned and visually demoted.)
- **Home (link card):** the h3 contains the link, which ends in "→". A pseudo-element stretches it over the whole card, so the card is one 44px+ target with one accessible name. **Hover:** `border.control` boundary, `surface.inset` fill, underlined title. **Focus:** the ring draws around the whole card. This replaces the current repeated-title link.
- **Join (article):** a static `<article id="…">` with no link. The `status` sentence sits under a hairline in `small` type. **`:target`:** `selection.edge` border, `surface.selected` fill, and a 3px top edge. The edge is a shape cue as well as a colour; in forced colours it becomes a real 3px `Highlight` border because shadows are dropped there. The style is pure CSS (`:target`) with no client state.

### 6.9 External handoff panel

This is the pattern for every hand-off to a third party. Today that means the public GitHub Issues link on Join, Contact and Privacy; later it covers any verified external form (#50).

- `surface.raised`, 1px `border.subtle`, `radius.container`, 24px padding (32px from 48rem), max-width 48rem.
- Content: an optional h3 title, the existing body text, a **disclosure list** with a visible label (`handoff.github.factsTitle`) and three facts, each with a 16px line glyph (`aria-hidden`), and finally the action.
- The facts are `handoff.github.public`, `.account` and `.destination`. They restate what the existing dictionary bodies already say; they are not new claims.
- **Action emphasis:** primary when the handoff is the page's main action (Join, Contact), secondary otherwise (Privacy).
- When a private route exists (#50), the panel takes the provider's facts instead: provider, sign-in requirement, data requested, recipient and retention boundary. The component doesn't change.

### 6.10 Empty state

This is reserved for a collection that has no publishable records: Activities and News.

- `surface.inset`, **1px dashed `border.control`**, `radius.container`, 24/32px padding. A dashed boundary means "this space is intentionally empty", which is different from a solid card (content) and a filled notice (status). (REFERENCE: Tachiko's placeholder pattern uses a dashed boundary.)
- Content: an h2 (`empty-state-heading`), the body text, and a "→" text link home.
- No illustration, no "coming soon" wording, and no violet accent bar (the current left bar reads as an alert).
- **Don't use** it for statements that aren't collections. Privacy's "no forms, accounts or file submission" is a statement (§6.11), and Contact's GitHub route is a handoff (§6.9). The current code uses `EmptyState` for both; the handoff corrects that.

### 6.11 Statement and fact list (Privacy)

- **Statement:** an h3 `heading` plus a `text.secondary` paragraph, with no container, because it is ordinary content.
- **Fact list:** a `<ul>` with top and bottom hairlines between items, a 6px dot marker and `text.secondary`. Use it for short declarative lists such as the external services.

### 6.12 FAQ disclosure

- Native `<details>`. The summary is at least 56px tall and weight 600, with a "+"/"−" marker in `text.link` on the right and an inset focus ring. Hover changes the text to `text.link`.
- Items are separated by hairlines, with a max-width of 48rem.

### 6.13 Photo card and photo archive

- **Frame:** `surface.inset`, 1px `border.subtle`, `radius.container`, and a **4:3 frame with `object-fit: contain`**, so legacy photos are never cropped (SNIE spec 7.3: no destructive crops). Use `width`/`height` attributes plus `height: auto` so layout is reserved (CLS 0).
- **Caption:** `small`, `text.secondary`. The first line must stay exactly `<span class="block">{media.captionFallback}</span>` (REQUIRED by `validate-mvp.mjs`). The second line is "{sourceLabel}: " followed by an external text link.
- **Loading (#55):** with participation paths above the archive, **no photo is in the initial viewport** at 320, 375, 768 or 1280px in any locale (MEASURED: the first photo's top is between 866 and 1427px). It is therefore not an LCP candidate, and every photo stays `loading="lazy"`. `RemoteMediaImage` still gains a `priority` prop (#55 requirement 1), so a future layout that puts a photo above the fold can prioritise exactly that one image. The capture harness fails if a photo enters the initial viewport, which forces this decision to be revisited.
- **Unavailable:** if a remote image fails, the frame shows `media.unavailable` centred in `small` type with `role="img"` and an `aria-label`, keeping the same 4:3 box.
- **Archive section:** `surface.chrome` background, h2 `media.title`, intro `media.description`. Layout is one column below 48rem and three from 48rem.

### 6.14 Record register (dormant)

**Do not build until #52's entry condition is met** (an owner-approved, dated, source-backed record). It is specified now so the eventual implementation has one shape.

- A list of rows separated by hairlines. From 48rem each row has a 9rem date column (`meta`, tabular figures, `<time datetime>`) beside the content.
- Content: an h3 `heading` title link, then a meta row with a type tag (`radius.control`, 1px `border.control`, 13/22 weight 500) and an external source link.
- Past or archived items go under their own h2 heading, so archive state is conveyed by position and heading, not colour (#52 requirement 4). A cancelled item shows the word in its tag.
- The home page gets a teaser (the latest one to three rows, same component) **only when records exist**.
- Until then, Activities and News show the empty state (§6.10).

### 6.15 Footer

- `surface.chrome` with a top hairline and `small` text.
- Content: the identity (wordmark plus full name), the footer nav (Contact, Privacy), and a legal line under a hairline.
- Footer links use `text.primary` with a `border.control`-coloured underline and are 44px tall. Hover changes them to `text.link`.

### 6.16 Skip link

The skip link is the first focusable element. It is fixed at the top left, hidden by transform until focused, and styled as a primary button (unchanged behaviour). `<main>` takes `tabindex="-1"` so the skip target receives focus in every browser.

## 7. Photography and imagery

- Real SNIE photographs appear **only in the provenance-labelled photo archive**, never in the hero, cards or social preview. Their consent status is `unknown-public-source` (`media-review.json`), so the design avoids amplifying them into identity imagery until #51 resolves rights.
- Don't use stock, AI-generated or illustrative imagery as a substitute (unchanged rule).
- **Social preview (#59) candidate:** [`assets/social-preview.svg`](assets/social-preview.svg), rendered at [`renders/social-preview-candidate.png`](renders/social-preview-candidate.png), 1200 × 630. It is typographic: the porcelain background, a short violet rule, "SNIE" and "Students Network for International Exchange". The name is identical in all three locales, so the image is language-neutral and needs no translated variants. It is **pending owner approval** and isn't wired into metadata. Alt text is proposed as `site.socialImageAlt`.

## 8. Accessibility contract (REQUIRED)

| Requirement | How the system meets it | Evidence |
|---|---|---|
| WCAG 2.2 AA contrast | §3 pairs | MEASURED, check-design.mjs |
| Visible focus distinct from hover | §6.1 | Component board |
| 44 × 44 targets | All links and controls | MEASURED: none under 44px on 84 route × width cases |
| Keyboard-operable menu with Escape | §6.4 | MEASURED, 3 locales |
| Fragment targets visible | §5.2 | MEASURED, 27 cases, 40–41px clearance |
| No colour-only state | Current page = weight + bar; `:target` = 3px edge; links underlined | Component board |
| Forced colours | Header border, `Highlight` focus, real `:target` border | Emulated render |
| Reduced motion | No motion exists; `scroll-behavior: auto` | — |
| Correct language metadata | `<html lang>`, a `lang` on each locale link, script-specific fonts | §4.1 |
| One h1, ordered headings, landmarks | Unchanged structure | check-design.mjs |

The preview checks don't certify screen-reader output, native Windows High Contrast, IME behaviour, or real-device rendering. Those need verification on the implemented build (Tachiko §8 evidence discipline).

## 9. Motion and dark mode

- **Motion: none** (REQUIRED, AGENTS.md). No transitions, no smooth scrolling and no animated disclosure.
- **Colour scheme: light only** (REQUIRED, AGENTS.md; Tachiko `InterfaceProfileV1.colorScheme: "light"`).

## 10. Content rules the design depends on

- All visible strings come from the dictionaries. The six new keys are listed in [proposed-dictionary-keys.json](proposed-dictionary-keys.json).
- Draft markers ("Coming soon", "To be verified", "Check back later") are forbidden in `src` (REQUIRED by `validate-mvp.mjs`).
- No organisation facts are invented. The design adds no copy that asserts a fact the dictionaries don't already state.

## 11. Changing this system

Follow Tachiko's design-before-implementation order:

1. Change [`tokens/snie-tokens.json`](tokens/snie-tokens.json) and [`tokens/snie-theme.css`](tokens/snie-theme.css) together.
2. Update this document and [`pages.md`](pages.md).
3. Run `node docs/design/preview/build-preview.mjs`, `node docs/design/preview/check-design.mjs`, then `node docs/design/preview/capture-renders.mjs`.
4. Review the renders, then implement.

A new value enters as HEURISTIC and becomes REQUIRED only with evidence.

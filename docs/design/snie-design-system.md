# SNIE Porcelain — design system

> **Status:** proposed canonical design authority. It takes effect when its pull request is reviewed and merged into `develop`.
> **Supersedes:** the 2026-08-20 baseline formerly at `docs/design-system.md`.
> **Machine-readable values:** [`tokens/snie-tokens.json`](tokens/snie-tokens.json). The Tailwind v4 theme is [`tokens/snie-theme.css`](tokens/snie-theme.css).
> **Upstream:** Tachiko Sheet design authority, pinned at `nurockplayer/tachiko-sheet@f44ad23`. See [tachiko-alignment.md](tachiko-alignment.md).
> **Scope:** this is the visual and interaction system for the portal as it exists. Approving it does **not** resolve the owner-approved information baseline (#49), a private contact and photo-removal route (#50), or legacy media rights (#51). The design invents no content or service to stand in for them.

Numbers and claims carry Tachiko's evidence labels:

- **REQUIRED:** an accepted SNIE product or accessibility rule.
- **REFERENCE:** adopted from Tachiko or an external guideline.
- **MEASURED:** recorded from the preview in [`renders/evidence.json`](renders/evidence.json) with macOS Chrome headless. Unless a claim says otherwise, MEASURED means that platform only.
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
4. **Stable geometry, without trapping content.** The header is exactly 64px at every width, in every locale and in forced colours, so one token offsets every fragment target. Hover and focus never move layout. In short viewports the header stops being sticky, and the open menu never extends past the viewport, so geometry never costs access. *(Tachiko §1.2; WCAG 1.4.10 Reflow)*
5. **Consequence next to the action.** What happens when you follow an external link (it's public, needs an account, and leaves the site) is stated beside the link, not only in surrounding prose. *(Tachiko §1.6, §1.8)*
6. **Equal standing for every audience and language.** The three participation paths share one card, in a fixed order with equal size, so none is featured. All three locales get correct script typography, including the correct Han glyph forms. *(SNIE principle 1.1; Tachiko §1.9 CJK requirement)*
7. **One behavioural grammar.** A text link, button, card or disclosure behaves the same on every page. *(Tachiko §1.10)*
8. **Accessibility is a constraint, not a pass.** Keyboard focus, 44px targets, forced colours, reduced motion and correct `lang` metadata are part of every component definition below. *(Tachiko §1.9)*

## 3. Colour

**REFERENCE.** All values come from Tachiko Sheet at `f44ad23`: the interface roles from `InterfaceProfileV1` (porcelain) and the status pairs from the product-owned values in `src/ui/sheet-shell.css`. SNIE renames the roles for a public site; the `tachiko` field of each token records its source, and [check-design.mjs](preview/check-design.mjs) re-reads both sources at that commit and verifies them by SHA-256.

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
| `status.*` | Tachiko `--ts-warn`, `--ts-error-ink`, `--ts-ok-ink` and their backgrounds | Reserved. No current page has a status notice. |

**Porcelain material** (`--snie-material-porcelain`): `linear-gradient(108deg, #F0EDFD 0%, #F8F8FC 35%, #F8F8FC 100%)`. This is Tachiko's workbook-head treatment. SNIE uses it only for the home hero and inner-page title band, the one place that identifies "where am I".

**Why violet** (HEURISTIC; **owner approval required, decision U-01**): SNIE has no approved brand palette (previous baseline §9.4; issue #49). This design adopts Tachiko's violet because Tachiko is the declared design authority and its accent passes every contrast pair. Violet is an **interface colour**: it marks actions, the current location and focus, and claims no SNIE brand. The previous neutral navy `#1F4E79` was explicitly permitted by the superseded baseline and was not a nationality-neutrality defect. Changing the site's most conspicuous colour is a public identity change, so it is proposed here and decided by the owner. If the owner keeps navy, only the `action.*`, `accent.*`, `selection.edge` and `focus.ring` values change, and [check-design.mjs](preview/check-design.mjs) must still pass. An owner-approved brand palette can replace them the same way later.

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

**Finding (MEASURED, macOS only):** the current shared stack puts `"Hiragino Sans"` first for every locale, so on macOS Traditional Chinese pages render unified Han characters such as 直 骨 角 誤 遊 令 with **Japanese glyph forms**. The component board's Han comparison shows this. iOS ships the same Hiragino and PingFang families and is expected to behave the same, but it is **untested**, as are Android and Windows. The stacks above are chosen by the nearest `lang` attribute, not only the `<html>` element. As a result the locale links, each marked with its own `lang`, render 繁體中文 and 日本語 correctly on any page. MEASURED with `CSS.getPlatformFontsForNode`: `zh-TW` text uses PingFang TC, `ja` text uses Hiragino Sans, Latin text uses Inter, and 繁體中文 on a Japanese page uses PingFang TC.

**Font variable (REQUIRED):** every stack starts with `var(--font-inter, Inter)`. Every HTML root must set `--font-inter` through `next/font` (implementation handoff, "HTML roots"). The fallback means a root that misses it still gets the intended stack. Without a fallback, an undefined variable invalidates the whole `font-family` declaration and the browser default serif renders. MEASURED: with `--font-inter` removed, headings still use Inter (from the local fallback) on macOS.

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

- Maximum weight is **600** (HEURISTIC). Tachiko's running text also stays at or below 600; it uses 700 only on status glyphs and icons, which SNIE doesn't have. The old 700 is removed.
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

- **The locale bar is always visible at every width.** It is a scrolling row above the header, not inside the mobile menu, because a visitor who lands in the wrong language must be able to switch without opening a menu or knowing the word "Menu" in an unfamiliar language. At 320px all three labels fit (MEASURED: no horizontal overflow on 21 routes × 4 widths, 21 routes × 2 widths in forced colours, or the root fallback and 404).
- **The header's outer box is exactly 64px** (`--snie-header-height`). MEASURED on 21 routes at 320, 375, 768 and 1280px, on 21 routes at 375 and 1280px in emulated forced colours, and on the root fallback and global 404. Its hairlines are drawn as box-shadows so they don't add height. Forced colours drop shadows, so there they become real 1px borders, and the inner row shrinks by 2px to keep the outer box at 64px.
- **Fragment offset:** `html { scroll-padding-top: var(--snie-anchor-offset) }`, where the offset is `calc(var(--snie-header-height) + 1rem)`. This is one rule for every fragment target, with no per-element magic numbers and no JavaScript (#54). MEASURED: every participation heading sits 40–41px below the header bottom in all 27 locale × target × width cases. The same holds after a home card link, Back and Forward in static-document navigation (6 cases); Next.js client-side navigation is an implementation gate.
- **Short viewports (height < 32rem, HEURISTIC threshold):** the header is `position: static` (`--snie-header-position`) and the anchor offset drops to 1rem. At 320 × 200 (a 1280 × 800 window at 400% zoom) a sticky 64px header plus an open menu would leave almost nothing for content. WCAG 1.4.10's understanding document names sticky headers as a reflow risk. MEASURED: at 320 × 200 the header is static and a linked participation heading is visible in all three locales.
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
- **Static variant** (root redirect fallback and global 404): a server-rendered bar linking to `/ja/`, `/en/` and `/zh-TW/`, with no `aria-current`, because those URLs belong to no locale. It looks identical. See pages.md.

### 6.3 Site header and primary navigation

- Wordmark: "SNIE" in Inter 20/24, weight 600, tracking 0.04em, `text.primary`, with the full name beneath it at 12/16 `text.secondary` (≥40rem). This is **typographic only**: no logo mark is drawn, because no SNIE mark is approved (#49).
- **Desktop nav (≥64rem):** links are 44px tall, 14/20 medium, `white-space: nowrap`. **Rest:** `text.secondary`. **Hover:** `surface.inset` well plus `text.primary`. **Current:** `accent.foreground`, weight 600, a 2px underline bar, and `aria-current="page"`.
- The locale switcher is no longer inside the nav; it lives in the locale bar.

### 6.4 Mobile menu (<64rem)

- A native `<details>`/`<summary>`, so content stays reachable without JavaScript.
- The summary is a 44px button with a 1px `border.control` boundary, `radius.control`, a menu glyph and the `nav.menu` label. When open, the glyph changes to a close glyph and the border darkens to `text.primary`.
- The panel spans the full width directly under the header, on `surface.raised` with the overlay shadow, the only shadow in the system. Rows are 48px tall and separated by hairlines. The current page uses `accent.foreground`, weight 600 and an underline.
- **Height (REQUIRED):** the panel is never taller than the viewport below the stuck header: `max-height: calc(100dvh - var(--snie-header-height) - 1px)` with `overflow-y: auto` and `overscroll-behavior: contain`, so its rows scroll inside it. Below 32rem viewport height the header is static, and the panel instead scrolls away with the page (`max-height: none`). Every link is reachable by Tab, Shift+Tab, or scrolling, whether the header is at its initial position or stuck. Overflow is never hidden.
- **Behaviour (REQUIRED; identical in the preview and the handoff).** Listeners sit on the `<details>` element:
  - **Escape** pressed on the summary or any menu link closes the menu and returns focus to the summary (#58).
  - **Focus leaving the menu** (a `focusout` whose `relatedTarget` is outside it) closes it, so the overlay never hides the newly focused element (WCAG 2.4.11).
  - **Navigation** closes it: on a client-side route change, and on a page restored from the back/forward cache.
  - Escape pressed elsewhere on the page doesn't move focus.
- MEASURED (36 runs: 3 locales × 5 viewports [320×200, 640×360, 320×640, 375×812, 768×1024] × initial and stuck header, plus 6 forced-colours runs):
  - Space and Enter open the menu.
  - Every link takes focus in order under Tab and Shift+Tab, fully inside the viewport and unobscured.
  - The last link is reachable by scrolling with the page scrolled to its end.
  - Tabbing out closes the menu and the next element is visible.
  - Escape from a link or from the summary closes the menu and returns focus.
  - After choosing a link and going Back, the menu is closed.
  - **Negative control:** the reviewed HEAD's CSS fails this suite at 320 × 200 in all three locales. Links 3–5 receive focus below the viewport ([`renders/negative-control-r1.txt`](renders/negative-control-r1.txt)).

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
- **Loading (#55): provisional, settled by measurement on the implemented build.**
  - *What the evidence shows:* with participation paths above the archive, the first photo starts 866–1427px down the page depending on width and locale (MEASURED). It is outside the initial viewport at 375×812, 412×823, 768×1024 and 1280×800. It is **inside** it at 1920×1080 in every locale and at 1440×900 in `zh-TW`, where the preview reports it as the LCP element. Where it is outside, the preview reports text (the lead paragraph or h1) as LCP. These are recorded observations from the preview, not performance measurements.
  - *Provisional policy:* `RemoteMediaImage` accepts an explicit loading and fetch-priority policy (#55 requirement 1). The first photo is `loading="eager"` with the default fetch priority, so it isn't delayed where it is visible on large screens, and it isn't promoted over the visible text on phones. Every later photo is `loading="lazy"`.
  - *Implementation gate:* run #55's Lighthouse protocol (three mobile runs on `/ja/` and `/zh-TW/`, plus desktop). Record the LCP element. Add `fetchpriority="high"` to the first photo only if it is the LCP element on the mobile profile. Keep #55's acceptance criteria unchanged: median mobile LCP ≤ 2.5s, CLS 0, no meaningful desktop regression.
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
- **Design evidence never reproduces them.** The capture harness answers every request to the legacy host with a neutral "photo withheld" placeholder, so committed renders contain no copy of an identifiable legacy photo (#51 separates provenance from permission to make further copies). Decision U-08 covers the copies already in this PR's branch history.

### 7.1 Safeguards carried forward from the 2026-08-20 baseline (REQUIRED)

These rules from the superseded document remain in force unchanged. `docs/content-governance.md` and `docs/archive-strategy.md` remain the governing sources where they say more.

- **Inventory is not approval.** The generated media inventory doesn't authorise publication. Every published image needs an explicit review entry and must pass the fail-closed selector in `src/content/legacy-media.ts`. Record unknown source permissions truthfully, and never promote an item by assuming ownership or consent.
- **Minors.** Don't infer a person's age or consent from an image. Don't newly publish an image known to contain an identifiable minor without documented permission appropriate to that publication. When age or permission creates a material unresolved risk, keep the image out of the publication selection.
- **Captions and provenance.** Credit a photographer or source only when the source establishes it. Images from social media carry source attribution and a link to the original post. Capture dates appear when known.
- **No crops that destroy context.** Faces, hands and the centre of activity are never cropped out (this is why the frame uses `object-fit: contain`, §6.13).
- **No substitutes.** No stock photography standing in for SNIE events. No AI-generated image may represent SNIE events, participants or activities; any other AI-generated image is labelled as such and only with explicit SNIE leadership request.
- **Placeholders.** With no approved image, use a same-size `surface.inset` block, never a broken-image icon.
- **Content states.** Production shows no draft or review markers. Missing translations are build failures, not fallbacks. Empty collections say so honestly without implying future content. Unsupported organisation facts are omitted, not marked.
- **Labels expand.** Size containers for the longest locale string; use no fixed-height text containers; navigation and buttons use `min-height` with padding.
- **Social preview (#59) candidate:** [`assets/social-preview.svg`](assets/social-preview.svg), rendered at [`renders/social-preview-candidate.png`](renders/social-preview-candidate.png), 1200 × 630. It is typographic: the porcelain background, a short violet rule, "SNIE" and "Students Network for International Exchange". The name is identical in all three locales, so the image is language-neutral and needs no translated variants. It is **pending owner approval** and isn't wired into metadata. Alt text is proposed as `site.socialImageAlt`.

## 8. Accessibility contract (REQUIRED)

| Requirement | How the system meets it | Evidence |
|---|---|---|
Evidence types:

- **Structural:** static source or markup check (`check-design.mjs`).
- **Measured:** browser measurement in `evidence.json` (macOS Chrome headless).
- **Visual:** human review of a render.
- **Untested:** not yet established; owned by the implementation PRs.

| Requirement | How the system meets it | Evidence |
|---|---|---|
| Text contrast ≥ 4.5:1, body 7:1 | §3 pairs | Structural (numeric token pairs; rendered-page contrast untested) |
| Visible focus, distinct from hover | §6.1 | Visual (component board) |
| 44 × 44 targets | All links, summaries and buttons | Measured: every visible one, width and height, on 21 routes × 4 widths and in forced colours (1,904 checks) |
| Menu operable by keyboard; Escape; focus not obscured | §6.4 | Measured: 36 runs including 320 × 200, plus a negative control |
| Reflow at 400% zoom (320 × 200) | §5.2 short viewports, §6.4 | Measured: menu suite and fragment visibility |
| Fragment targets visible | §5.2 | Measured: 27 direct-entry cases plus 6 back/forward paths |
| No colour-only state | Current page = weight + bar; `:target` = 3px edge; links underlined | Visual; the `:target` border width is measured in forced colours |
| Forced colours | Real header borders at 64px, `Highlight` focus, real `:target` border | Measured geometry and menu suite (**emulated**); native Windows High Contrast untested |
| Reduced motion | No motion exists; `scroll-behavior: auto` | Structural |
| Language metadata and script fonts | `<html lang>`, `lang` on each locale link, per-locale stacks | Structural; fonts measured on macOS |
| One h1, landmarks | Unchanged structure; root fallback and 404 included | Structural |
| Screen readers, IME, iOS/Android/Windows rendering, Lighthouse | — | Untested |

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
3. Run `node docs/design/preview/build-preview.mjs`, then `node docs/design/preview/capture-renders.mjs`, then `node docs/design/preview/check-design.mjs`. The checker fails if the evidence wasn't captured from the current inputs, and it needs a `tachiko-sheet` checkout containing the pinned commit.
4. Review the renders, then implement.

A new value enters as HEURISTIC and becomes REQUIRED only with evidence.

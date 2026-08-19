# Design System Specification — SNIE Portal

> **Status**: Implemented baseline  
> **Last updated**: 2026-08-20  
> **Purpose**: Record the visual language, component patterns, and interaction guidelines used by the SNIE Portal.

---

## 1. Design Principles

### 1.1 Welcoming without visually prioritizing nationality

The current Join page provides inquiry paths for Japanese university students, international students, and partner organisations or schools. The design must not make any nationality or region the visual default. Achieve this through:

- Using photography that depicts diverse participants across all hero, card, and gallery regions — never featuring one nationality exclusively.
- Avoiding flag imagery, national colours, or country-specific iconography as primary visual identifiers.
- Using the same layout quality and imagery investment for content in all three supported languages.
- Giving all three supported locales the same layout quality.

### 1.2 Clear separation of participation paths

The three current inquiry categories must remain understandable without implying unsupported eligibility or application details:

- Primary navigation items clearly label each path.
- Calls to action are audience-appropriate.
- Visual treatments (card styles, section backgrounds) may subtly differentiate audience-facing areas without creating a disjointed brand experience.

### 1.3 Friendly and energetic without being childish or commercial

The portal should feel open and useful without resembling a commercial recruitment service or a children's club:

- Use generous whitespace and open layouts; avoid dense, sales-oriented page compositions.
- Photograph real people in genuine event settings rather than staged stock photography.
- Use colour as an accent on an otherwise clean, typography-driven foundation — not as a primary decorative device.
- Tone is conveyed through content voice and photography, not through illustration style, cartoon elements, or exaggerated motion.

### 1.4 Content-first layouts that remain maintainable

Events and news accumulate over time. Layouts must accommodate growing content volume without requiring redesign:

- Define predictable, repeatable section patterns that content can be poured into.
- Separate content structure from visual decoration — adding a new event or article should not require layout changes.
- Archive sections use consistent list or card patterns identical in structure to active content, distinguished only by metadata labels.
- Avoid hard-coded feature counts or showcase slots that break when content exceeds expectations.

### 1.5 Visual continuity with current SNIE identity

The new portal should feel like an evolution of SNIE's existing public presence (e.g., the Canva site at `snie.my.canva.site/snie-com`), not a complete visual break:

- Retain the SNIE wordmark and acronym prominence. The full name "Students Network for International Exchange" always appears alongside or below the acronym on the homepage and in the site footer.
- Use the implemented neutral-blue interface palette without claiming it is an official organization brand palette.
- The Canva site's specific layout, font choices, and graphic elements are starting references only — do not copy them directly (see Section 9).
- Do not replicate the Canva site's background images, textured overlays, or decorative dividers unless they are confirmed as brand assets.

---

## 2. Design Tokens

> All example strings in this document (empty states, button labels, accessible names, notices, image captions, and status messages) must use the three-locale i18n dictionaries (`src/i18n/dictionaries/`) during Phase 2 implementation. No user-facing string should be hardcoded in a single language.

All implemented tokens use semantic role names and map to Tailwind CSS v4 `@theme inline` entries in `src/app/globals.css`. No `tailwind.config.ts` file is used. Additional roles in this specification are guidance for a future concrete need, not active production requirements.

> **Implementation note**: When translating these tokens to Tailwind v4 `@theme inline`, spacing tokens (`--space-*`) should use the `--spacing-*` namespace and breakpoint tokens (`--bp-*`) should use the `--breakpoint-*` namespace. Colour, typography, and other tokens (`--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`) are supported Tailwind theme namespaces. Layering (`--z-*`) and motion (`--motion-*`) tokens are not Tailwind theme namespaces and must be consumed as plain CSS variables via arbitrary-value syntax (e.g., `z-(--z-sticky)`, `duration-(--motion-fast)`). Exact mapping is a Phase 2 implementation task.

### 2.1 Colour Roles

| Token | Role | Selection criteria |
|---|---|---|
| `--color-page-bg` | Page background | Light, neutral. Sufficient contrast with text tokens. |
| `--color-surface` | Card, section, elevated container background | Slightly distinct from page-bg to create depth. |
| `--color-surface-elevated` | Dropdowns, modals, focused cards | One step lighter or more opaque than surface. |
| `--color-text-primary` | Body text, headings | High contrast (≥7:1 against page-bg for body, ≥4.5:1 for large text). |
| `--color-text-secondary` | Metadata, captions, supporting text | ≥4.5:1 against page-bg. |
| `--color-border` | Dividers, card outlines, input borders | Subtle; not visually dominant. |
| `--color-brand-primary` | Primary buttons, logo area, key interactive accents | Implemented neutral blue; not represented as an official brand colour. |
| `--color-brand-secondary` | Secondary accents, decorative elements | Add only if a concrete component needs it. |
| `--color-accent` | Highlights, active nav item, focused element | High-contrast accent distinct from brand colours. |
| `--color-success` | Success messages, verified status indicators | Green hue. |
| `--color-warning` | Warning messages, needs-review status | Amber/yellow hue. |
| `--color-error` | Error messages, destructive actions, required-field markers | Red hue. |
| `--color-focus` | Visible keyboard focus ring | Must pass 3:1 against adjacent background. Typically a high-contrast blue or the accent colour. |

The production values are defined in `src/app/globals.css`. A documented future brand kit may replace them, subject to contrast and regression checks.

### 2.2 Typography Roles

| Token | Role | Size | Weight | Line height |
|---|---|---|---|---|
| `--text-display` | Hero title, large page headings | `2.5rem–3.5rem` (fluid) | Bold (700) | `1.1–1.2` |
| `--text-heading-1` | Page title (h1) | `2rem–2.5rem` (fluid) | Bold (700) | `1.2–1.3` |
| `--text-heading-2` | Section heading (h2) | `1.5rem–1.75rem` | Semi-bold (600) | `1.3` |
| `--text-heading-3` | Subsection heading (h3) | `1.25rem–1.375rem` | Semi-bold (600) | `1.35` |
| `--text-heading-4` | Card title, sidebar heading (h4) | `1.125rem` | Medium (500) | `1.4` |
| `--text-body` | Paragraph body text | `1rem` (16px base) | Normal (400) | `1.6–1.8` |
| `--text-body-large` | Lead paragraph, intro text | `1.125rem` | Normal (400) | `1.6–1.8` |
| `--text-small` | Captions, footnotes, metadata | `0.875rem` | Normal (400) | `1.5` |
| `--text-label` | Form labels, tag labels, section labels | `0.875rem` | Medium (500) | `1.4` |
| `--text-button` | Button text | `1rem` | Medium (500) | `1` |
| `--text-metadata` | Date, author, reading time | `0.75rem–0.8125rem` | Normal (400) | `1.5` |

**Font family**: Geist with the following CJK and system fallbacks:

- **Latin glyphs (English)**: A system-available sans-serif (e.g., Inter, Noto Sans, or a Google Font selected by SNIE). Fall back to system UI font stack.
- **Japanese glyphs**: A Japanese system font (e.g., Noto Sans JP) or a specifically licensed Japanese typeface. Fall back to `"Hiragino Sans", "Noto Sans CJK JP", sans-serif`.
- **Traditional Chinese glyphs**: Share the CJK font with Japanese where possible (e.g., Noto Sans CJK covers both). If separate faces are needed, fall back to `"Noto Sans CJK TC", "Microsoft JhengHei", sans-serif`.
- Selection criteria: legibility at body sizes, good CJK coverage, reasonable loading weight, compatible metrics across scripts.

### 2.3 Spacing Scale

Use a 4px-base spacing scale:

| Token | Value |
|---|---|
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-12` | `3rem` (48px) |
| `--space-16` | `4rem` (64px) |
| `--space-20` | `5rem` (80px) |

Section vertical spacing: `--space-16` (between major content sections), `--space-8` (between related sections).

### 2.4 Content Widths and Page Gutters

| Token | Value |
|---|---|
| `--content-max` | `72rem` (1152px) — maximum content width |
| `--content-narrow` | `40rem` — reading-width container for articles and text-heavy pages |
| `--content-wide` | `90rem` — full-width breakout for hero, gallery, or featured sections |
| `--gutter-page` | `1rem` on mobile, `2rem` on tablet, `clamp(2rem, 5vw, 4rem)` on desktop |
| `--gutter-section` | Same as page gutter horizontally; applies as padding inside section containers |

### 2.5 Border Radius Scale

| Token | Value |
|---|---|
| `--radius-sm` | `0.25rem` (4px) |
| `--radius-md` | `0.5rem` (8px) |
| `--radius-lg` | `0.75rem` (12px) |
| `--radius-xl` | `1rem` (16px) |
| `--radius-full` | `9999px` (pill shapes) |

### 2.6 Border Usage

| Token | Width | Style | Role |
|---|---|---|---|
| `--border-default` | `1px` | Solid | Card borders, dividers, input borders |
| `--border-strong` | `2px` | Solid | Focused inputs, emphasised boundaries |
| `--border-focus` | `2px–3px` | Solid | Keyboard focus ring (combined with `--color-focus`) |

Border colour uses `--color-border` by default. Bottom borders on headings or section dividers use the same token.

### 2.7 Shadow / Elevation Levels

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.06)` | Subtle card elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.08)` | Elevated cards, dropdowns |
| `--shadow-lg` | `0 10px 24px rgba(0,0,0,0.1)` | Modals, full-screen overlays |

### 2.8 Motion Duration and Easing (requires explicit SNIE or project approval per AGENTS.md)

| Token | Duration | Easing | Use |
|---|---|---|---|
| `--motion-fast` | `150ms` | `ease-out` | Hover states, colour transitions |
| `--motion-normal` | `250ms` | `ease-out` | Dropdowns, focus transitions, minor layout shifts |

Motion tokens are defined here for future use. Per AGENTS.md, animations require explicit request before implementation. The tokens must not be implemented until that request is made. All transitions must respect `prefers-reduced-motion: reduce`. No page transitions or modal open/close animations are permitted without approval.

### 2.9 Breakpoints

Use content-driven breakpoints rather than device-specific pixel values:

| Token | Min-width | Target |
|---|---|---|
| `--bp-mobile` | `0` | Base (single-column) styles |
| `--bp-tablet` | `48rem` (768px) | Two-column layouts, expanded nav |
| `--bp-desktop` | `64rem` (1024px) | Full multi-column layouts, sidebars |
| `--bp-wide` | `90rem` (1440px) | Maximum content-width centering |

Layout is mobile-first: base styles assume narrow viewports; `min-width` breakpoints add complexity as space permits.

### 2.10 Layering / Z-Index Categories

| Token | Value | Use |
|---|---|---|
| `--z-base` | `0` | Page content |
| `--z-sticky` | `100` | Sticky headers |
| `--z-dropdown` | `200` | Dropdown menus, locale switcher |
| `--z-modal` | `300` | Modal overlays |
| `--z-toast` | `400` | Notification toasts |

---

## 3. Multilingual Typography and Layout

### 3.1 Font Fallback Strategy

All three locales share the same typeface selection where possible to minimise visual fragmentation:

**Implemented approach**: Use Geist for Latin glyphs and a system CJK fallback stack for Japanese and Traditional Chinese. This avoids an additional CJK webfont payload while preserving broad script coverage.

If separate fonts are used, declare fallback stacks in this order:

```
--font-latin: "Inter", "Noto Sans", system-ui, sans-serif;
--font-cjk: "Noto Sans CJK JP", "Noto Sans CJK TC", "Hiragino Sans", "Yu Gothic", sans-serif;
--font-japanese: "Noto Sans CJK JP", "Hiragino Sans", "Yu Gothic", sans-serif;
--font-chinese-trad: "Noto Sans CJK TC", "Microsoft JhengHei", sans-serif;
```

The locale-specific `<html>` element declares `lang="ja"`, `lang="en"`, or `lang="zh-TW"`. Font loading and selection must respect the active locale.

The fallback stack must continue to work when the Geist webfont cannot load.

### 3.2 Readable Body Line Length

- Body text containers should target a **maximum line length of 66–75 characters** (including spaces) for CJK and Latin text.
- Use `--content-narrow` (`40rem`) for long-form reading (articles, event descriptions).
- For CJK text, character count per line tends to be lower because CJK characters are wider; expect 25–35 CJK characters per line at `40rem` with `1rem` body text. This is acceptable — the priority is readable line count, not matching Latin character counts exactly.

### 3.3 Body Line Height

- **Latin (English) body text**: `1.6–1.8` line height for readability.
- **Japanese body text**: `1.7–1.9` line height. Japanese text benefits from slightly more leading because of the density of CJK characters and the lack of word spacing.
- **Traditional Chinese body text**: Same as Japanese (`1.7–1.9`).
- **Headings (all locales)**: `1.2–1.4` line height depending on heading level.

### 3.4 Heading Wrapping Rules

- Headings should wrap naturally. Do not use `white-space: nowrap` or fixed-width containers on headings.
- Long English headings in nav buttons may wrap to two lines. Ensure nav items have `min-height` or padding, not fixed height (see Section 3.6).
- CJK headings are typically shorter character-wise but each character is wider. A 6-character Japanese heading may be visually wider than a 12-character English one. Test all three locales for each heading element.

### 3.5 Longer English Labels vs. Denser CJK Text

- English text tends to be longer (word-count) but visually takes less horizontal space per word due to narrower Latin characters.
- CJK text is denser: fewer characters convey the same meaning, but each character is wider. A CJK string can be 40–60% of the character count of its English equivalent but occupy similar or greater horizontal width.
- **Rule**: Design for the longest string across all three locales. If the English button label is "Apply as a New Member" and the Japanese equivalent is "新規メンバーとして応募する", size containers for the longest rendering, not the shortest.
- Use `min-width` and `max-width` constraints rather than fixed widths.

### 3.6 Avoiding Fixed-Height Text Containers

- Buttons, cards, nav items, and callout boxes must not use fixed heights. Use `min-height` with vertical padding (`padding-block`) so content expansion (longer translations, wrapped text) does not overflow.
- This applies especially to:
  - Navigation link containers
  - Button elements
  - Card title areas
  - Metadata rows that may contain locale-specific date formats

### 3.7 Button and Navigation Behavior When Labels Expand

- Primary and secondary buttons: use `padding-inline` with generous minimums (`1.5rem–2rem`) and allow height to grow via `min-height` + padding.
- Navigation link containers: use `padding-block` with `min-height` of at least `2.75rem` to accommodate two-line labels.
- The locale switcher in the navigation must account for "繁體中文" being wider than "English" or "日本語". Use a dropdown or expandable pattern rather than a fixed-width tab bar.

### 3.8 Punctuation, Word Breaking, and Line-Breaking

- **English**: Standard word-level wrapping with `overflow-wrap: break-word` for long unbroken strings (URLs, technical terms).
- **Japanese**: Use `overflow-wrap: break-word` with `word-break: normal`. Japanese text typically breaks at grammatical boundaries (particles, clause endings) rather than arbitrary character breaks. Avoid `word-break: break-all` for Japanese body text.
- **Traditional Chinese**: Same as Japanese. Avoid character-level breaks for body text.
- **Punctuation**: In CJK locales, ensure hanging punctuation (closing brackets, quotation marks) is not orphaned at the start of a line. CSS `hanging-punctuation` is not widely supported; manual content review is the practical approach for MVP.
- **Mixed text**: When text contains both Latin and CJK characters (e.g., "SNIEについて"), line breaking should prefer CJK break opportunities over Latin ones. This is default browser behaviour with `word-break: normal`.

### 3.9 Locale Switcher Labels and Active-State Behavior

| Locale | Display label (per `src/i18n/config.ts`) |
|---|---|
| `ja` | 日本語 |
| `en` | English |
| `zh-TW` | 繁體中文 |

- The current locale is visually indicated (e.g., bold or underlined text, or a distinct background).
- The switcher shows all available locales as clickable options.
- Clicking a locale navigates to `/[locale]/` (preserving the current page path if that page exists in the target locale; falling back to the target locale's homepage otherwise — see Section 3.10).
- `ja` is the default locale. Users visiting `/` without a locale prefix are redirected to `/ja` (already implemented in `src/app/page.tsx`).

### 3.10 Missing-Locale Behavior

Per `docs/content-governance.md`:

- Home, About, Join Us, Contact, Privacy pages: must have reviewed content in all three locales before production.
- Events and News pages: require `ja: done`; `en` and `zh-TW` may be omitted temporarily.
- Missing locales must not produce broken pages, placeholder text, machine-generated translations, or unreviewed content on public pages.
- If a locale switcher click targets a page that lacks content in that locale, the site navigates to the target locale's homepage rather than showing an error or empty page.
- "Needs review" content may appear on staging but must not appear in production.

---

## 4. Layout and Responsive Behavior

All layouts follow a mobile-first approach. Base styles assume a single-column narrow viewport. `min-width` breakpoints (`--bp-tablet`, `--bp-desktop`) introduce multi-column arrangements.

### 4.1 Site Header and Navigation

| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| Logo/wordmark | Left-aligned, `--text-heading-4` size | Same | Same |
| Nav links | Hidden behind hamburger menu (see 4.2) | All visible in a horizontal row | All visible |
| Locale switcher | Inside mobile menu | At right end of nav bar | At right end of nav bar |
| Header height | Grows with content (`min-height` + padding) | Same | Same |

- Header is sticky (`position: sticky; top: 0; z-index: var(--z-sticky)`) with a subtle bottom border.
- Header background matches `--color-page-bg` with optional slight surface elevation.
- Navigation links use `--text-button` sizing with adequate tap targets.

### 4.2 Mobile Navigation

On viewports below `--bp-tablet`:

- Navigation links are hidden and a hamburger button (accessible name: "Open menu" / locale‑equivalent) opens a full-height overlay or off-screen drawer.
- The overlay includes all primary nav links, the locale switcher, and a close button (accessible name: "Close menu").
- The overlay background uses `--color-surface-elevated` or `--color-page-bg`.
- The first focusable element inside the overlay receives focus on open; focus is trapped within the overlay while open.
- Tapping the backdrop or pressing Escape closes the overlay.
- The hamburger button uses `aria-expanded` and `aria-controls` to indicate overlay state.
- **Implementation constraint**: The mobile navigation overlay requires a `'use client'` component or a small client-side island for open/close state. Per AGENTS.md, client-side state management must not be added without approval. During Phase 2, this must be explicitly requested or a server-form-based alternative (e.g., a details/summary pattern) must be used.

### 4.3 Footer

- Three-column layout on desktop (About, Quick Links, Contact/Privacy), collapsing to single-column on mobile.
- Contains: SNIE full name, nav links to Contact and Privacy pages, locale switcher (optional secondary placement), copyright line.
- Background slightly distinct from page (e.g., `--color-surface` or a tinted version of `--color-page-bg`).
- Footer content uses `--text-small` sizing.

### 4.4 Page Title / Hero Region

- The hero region spans full viewport width with `--gutter-page` horizontal padding.
- Hero content (heading, description, CTA) is centred or left-aligned within `--content-max`.
- Hero may include a background image or colour block, but text must remain readable at all viewport sizes (see Section 7 for image aspect ratios).
- On inner pages (About, Activities, News, etc.), the hero is replaced by a page title region: heading (h1), optional subtitle, and breadcrumbs if applicable.

### 4.5 Standard Content Section

- Full-width section with `--gutter-page` padding.
- Content constrained to `--content-max` and centred.
- Top and bottom spacing: `--space-16`.
- Examples: About intro, Contact form area, Privacy policy text.

### 4.6 Two-Column Section

- On desktop: two equal-width or 60/40 columns with a `--space-8` gap.
- On tablet: same two-column layout, or collapses if content width falls below usability.
- On mobile: single column, content stacked in source order.
- Gap value uses `--space-6` to `--space-8` depending on content density.
- Examples: Feature highlights (text + image), event detail (description + sidebar), Join Us (info + CTA card).

### 4.7 Card Grids

- Grid using CSS `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` for automatic responsive columns.
- Single column on small mobile, 2 columns on tablet, 3–4 columns on desktop depending on context.
- Card width should not exceed `360px` to maintain readable line lengths within cards.
- Consistent gap: `--space-6`.
- Examples: Feature cards, event preview cards, news article cards.

### 4.8 Article and Event Detail Layouts

- Article content constrained to `--content-narrow` for optimal reading width.
- Article metadata (date, author, tags) displayed above the title or between title and body.
- Featured image above the title, full-width within `--content-max`.
- Related articles/events section at the bottom, using the card grid pattern.
- Event details may add sourced date/time, location, an external registration link, and a photo gallery when those fields have documented values.

### 4.9 Lists and Archives

- Event and news lists use a consistent vertical list pattern: title, date, short excerpt, "Read more" link.
- Archived items may appear in a separate section when a future record model defines a useful archive boundary.
- Archive items may use reduced visual weight (smaller text, no thumbnail) but maintain consistent layout structure.

### 4.10 External handoff sections

- The current Join, Contact, and Privacy pages hand off to the public GitHub Issues route and disclose that it is public and account-required.
- Any future verified external-form handoff consists of descriptive text, a clear CTA, and the privacy or account behavior a visitor needs before following it.
- The section is visually distinct (e.g., highlighted surface background) but follows standard section layout.
- If custom forms are implemented in future phases, they follow standard form component patterns (Section 5.12).

### 4.11 Empty States

- Empty states use the standard content section layout with centred text.
- Content: a brief message explaining what would appear here, and a link to related content or the homepage.
- Empty states are honest communications, not decorative illustrations. Messages must not imply future content delivery (see Section 8.4).

---

## 5. Component Patterns

This section defines the purpose, hierarchy, states, and usage rules for reusable UI components. It is a specification, not a React component implementation.

### 5.1 Logo / Wordmark Area

| Property | Specification |
|---|---|
| **Content** | "SNIE" (acronym) in bold. Full name "Students Network for International Exchange" adjacent or below on desktop, visible in footer on mobile. |
| **Link** | Links to the homepage (`/[locale]`). |
| **States** | Default: brand-primary or text-primary colour. Hover/focus: no change (image links use standard focus ring). |
| **Responsive** | On mobile, acronym only. Full name appears in footer. |

### 5.2 Navigation Links

| Property | Specification |
|---|---|
| **Content** | Dictionary-driven labels per locale. Top-level: Home, About SNIE, Activities, News, Join Us. |
| **Link target** | `/[locale]/path` |
| **States** | Default: `--color-text-secondary`. Hover: `--color-brand-primary` or `--color-accent`. Active/current page: `--color-brand-primary` or `--color-accent` with underline or bolder weight. Focus: visible focus ring. |
| **Current page** | Indicated by `aria-current="page"`. Styled differently (e.g., underline or bold) but must not rely on colour alone (see Section 6). |
| **Responsive** | Full row on desktop; off-screen overlay on mobile (see 4.2). |

### 5.3 Locale Switcher

| Property | Specification |
|---|---|
| **Content** | All three locale labels (日本語, English, 繁體中文). Current locale visually distinct. |
| **Pattern** | Dropdown select on desktop; inline list on mobile inside the nav overlay. |
| **States** | Default: text-secondary. Hover/focus: brand-primary colour with focus ring. Active: same as hover plus bold weight. |
| **Behaviour** | Selecting a locale navigates to `/[locale]/current-path` or `/[locale]` fallback (see 3.10). |
| **Accessibility** | Native `<select>` or `role="listbox"` pattern. |

### 5.4 Primary, Secondary, and Text Buttons

| Property | Primary | Secondary | Text (Ghost) |
|---|---|---|---|
| **Background** | `--color-brand-primary` | Transparent with border | None |
| **Text colour** | White or high-contrast on brand | `--color-brand-primary` | `--color-brand-primary` |
| **Border** | None | `1px solid --color-brand-primary` | None |
| **Padding** | `0.75rem 1.5rem` | `0.75rem 1.5rem` | `0.5rem 0.75rem` |
| **Border radius** | `--radius-md` | `--radius-md` | None |
| **States** | Hover: darken 10%. Focus: focus ring. Disabled: 50% opacity. | Hover: bg tint. Focus: focus ring. Disabled: 50% opacity. | Hover: underline. Focus: focus ring. Disabled: 50% opacity. |

- Buttons use `--text-button` typography.
- Multiple buttons in a row: primary CTA on the left or as the first button, secondary/text after.
- Minimum touch target: `44×44px` (see Section 6).

### 5.5 Links

- Standard text links use `--color-brand-primary` with underline.
- Hover: underline remains (or darkens). Focus: visible focus ring.
- Visited links: may use a slightly different hue (implementation choice).
- External links: optional icon indicator (no icon-only reliance — see Section 6). Use `rel="noopener noreferrer"` for external links that open in new tabs.
- Links in card contexts: the entire card may be clickable (using a linked title with a card-region link pattern), but a separate "Read more" link must still exist for screen reader clarity.

### 5.6 Cards

| Property | Specification |
|---|---|
| **Background** | `--color-surface` |
| **Border** | `1px solid --color-border` |
| **Border radius** | `--radius-md` |
| **Shadow** | `--shadow-sm` (optional, at implementation's discretion) |
| **Padding** | `--space-4` to `--space-6` |
| **Content** | Title (h3 or h4), optional description, optional image, optional metadata, optional CTA link |
| **States** | Default: as specified. Hover: `--shadow-md` or slight border colour change. Focus: focus ring on the focusable element inside the card. |
| **Responsive** | Card width is fluid within the grid (see 4.7). |

### 5.7 Event and News List Items

- Vertical list pattern: date (metadata style), title (link), short excerpt (body small), "Read more" link.
- Event items additionally show location if available.
- Consistent spacing between items: `--space-6`.
- Archived items are listed in a separate section with a "Past events" heading.

### 5.8 Tags or Metadata Labels

| Property | Specification |
|---|---|
| **Background** | `--color-surface` with optional `--color-border` |
| **Text** | `--text-small` or `--text-metadata` |
| **Border radius** | `--radius-sm` |
| **Padding** | `0.125rem 0.5rem` |
| **Use** | Event type (e.g., "Workshop", "Exchange"), content status, category labels |
| **States** | May be clickable (linking to filtered view) in future phases; for MVP, static only |

### 5.9 Section Headings

- h2 section headings use `--text-heading-2` with `--space-4` bottom margin.
- For card grids, a section heading introduces the grid followed by the card row.
- Optional bottom border line for visual separation.
- Section headings may include a subdued "View all" link on the right side (desktop) or below (mobile).

### 5.10 Breadcrumbs

| Property | Specification |
|---|---|
| **Use** | Article/event detail pages, deep content. Not used on top-level pages. |
| **Separator** | `›` (single right-pointing angle bracket), `-` (en dash), or `/` (slash) with appropriate ARIA labelling. |
| **Position** | Above the page title, inside the page title region. |
| **Current page** | Last item is plain text (not a link), with `aria-current="page"`. |

### 5.11 Notices and Status Messages

| Type | Background | Border | Text | Icon |
|---|---|---|---|---|
| **Success** | Green tint (`--color-success` + low opacity) | Green border | `--color-success` text | Checkmark (non‑colour‑dependent indicator) |
| **Warning** | Amber tint | Amber border | `--color-warning` text | Warning triangle |
| **Error** | Red tint | Red border | `--color-error` text | Error circle / exclamation |
| **Info** | Neutral tint (surface-elevated) | `--color-border` | `--color-text-primary` | Info circle (optional) |

- Dismissible notices include a close button with accessible name.
- Notices use `--text-small` (inline) or `--text-body` (full-width banner) sizing.
- Status is conveyed with text and icon, not colour alone (see Section 6).

### 5.12 Form Fields (for Future Use)

Specification for when custom forms are implemented (post-MVP):

| Property | Specification |
|---|---|
| **Input background** | `--color-page-bg` or `--color-surface` |
| **Border** | `1px solid --color-border` |
| **Focus** | `2px solid --color-focus` ring |
| **Error** | `2px solid --color-error` border + error message below |
| **Disabled** | 50% opacity, non-interactive |
| **Labels** | `--text-label` above the input. Always visible (not placeholder-based). |
| **Required** | Asterisk or "(required)" text (non‑colour‑dependent). |

### 5.13 Empty States

- Centred text block with `--text-body` text and `--color-text-secondary` colour.
- Message explains context: "No upcoming events." / "No news articles yet."
- Includes a link to the homepage or related section.
- No "Coming soon", "Check back later", or decorative illustrations that imply content will arrive — empty states describe the present honestly.

### 5.14 Loading and Error States (for Future Dynamic Features)

Specification for future dynamic features (post-MVP):

- **Loading**: Content area shows a subtle skeleton or spinner. Use `aria-busy="true"`.
- **Error**: A notice (see Section 5.11) explaining the error, with a "Try again" action or link to contact support.
- Both states occupy the same layout space as the content they replace to prevent layout shift.

---

## 6. Accessibility

### 6.1 Target Level

**WCAG 2.2 Level AA** is the implementation target. This specification defines minimum requirements that implementers must follow.

Conformance must be verified during Phase 2 (implementation and testing). This document does not claim compliance before verification.

### 6.2 Text and Interactive-Element Contrast

- Body text (smaller than 18pt / 24px regular, or 14pt / ~18.5px bold): minimum contrast ratio **4.5:1** against background (`--color-text-primary` against `--color-page-bg`).
- Large text (≥18pt / 24px regular, or ≥14pt bold): minimum **3:1**.
- Interactive element boundaries (buttons, inputs, links): minimum **3:1** against adjacent background.
- Focus indicator: minimum **3:1** contrast of the focus ring against the element background.

### 6.3 Visible Keyboard Focus

- All interactive elements (links, buttons, inputs, controls) must have a visible focus indicator.
- Focus indicator is a `2–3px` solid ring in `--color-focus`, or a high-contrast outline.
- Focus must never be suppressed (`outline: none` without a replacement).
- The focus ring must have `3:1` contrast against the element's background.
- Skip-to-content link is the first focusable element on every page.

### 6.4 Complete Keyboard Navigation

- All interactive elements must be reachable and operable by keyboard alone.
- Tab order follows visual order (DOM order).
- No keyboard traps: focusable elements inside modals and overlays must cycle forward and backward without trapping focus outside the overlay.
- Escape key closes overlays, modals, and dropdowns.
- The mobile navigation must be fully keyboard-navigable (hamburger button → links → close button).

### 6.5 Semantic Heading Hierarchy

- Page title is `h1`. There must be exactly one `h1` per page.
- Section headings follow `h2` → `h3` → `h4` without skipping levels.
- Card titles use `h3` or `h4` depending on nesting context.
- Heading levels reflect content structure, not visual size.

### 6.6 Landmark Usage

Use semantic HTML elements with implicit landmark roles:

- `<header>` for site header (`role="banner"`).
- `<nav>` for primary navigation (`aria-label="Main navigation"` or locale-equivalent).
- `<main>` for page-unique content.
- `<footer>` for site footer (`role="contentinfo"`).
- `<section>` for distinct content groupings (with `aria-label` or `aria-labelledby` when more than one section exists).
- `<article>` for self-contained content items (news articles, event entries).

### 6.7 Accessible Names for Icon-Only Controls

- The hamburger menu button must have an `aria-label` (e.g., "Open menu" / locale-equivalent).
- The close button on the mobile navigation must have an `aria-label` (e.g., "Close menu").
- The locale switcher must have a visible label or an `aria-label`.
- External-link indicators (if icon-only) must have an accessible name (e.g., `aria-label="Opens in new tab"`).

### 6.8 Minimum Interactive Target Size

- All touch targets (links, buttons, controls): minimum **44×44 CSS pixels**.
- This includes nav links, locale switcher items, pagination controls, and button elements.
- If a link is inline text (smaller than 44px), ensure surrounding padding or additional spacing achieves the target size.

### 6.9 Reduced-Motion Support

- All transitions and animations must respect `prefers-reduced-motion: reduce`.
- When reduced motion is preferred, duration is `0ms` (instant transitions) or the animation is disabled.
- Functional motion (loading indicator) may remain but without animation.

### 6.10 Non-Colour Status Indicators

- Status (success, warning, error, active nav item) must be conveyed by text, icon, or pattern in addition to colour.
- Error states on form fields must include an error message in text, not just a red border.
- Link underline on hover is a non-colour indicator.
- Current-page indication in navigation includes underline or bold weight in addition to colour change.

### 6.11 Language Metadata for Localized Pages

The `<html>` element uses the correct `lang` attribute per locale (`ja`, `en`, `zh-TW`). Pages that mix languages use `lang` on the inline element.

### 6.12 Alt-Text Ownership and Review

- Every `<img>` element must have a meaningful `alt` attribute.
- Decorative images use `alt=""`.
- Informational images (event photos, team photos) have descriptive alt text that conveys the image's purpose.
- Alt text for event photography should describe the activity and participants, not just identify individuals (privacy consideration).
- Alt text must follow the same source-evidence and locale-consistency rules as other public copy.

---

## 7. Photography and Media

### 7.1 Preferred Aspect Ratios

| Use | Aspect ratio | Notes |
|---|---|---|
| Hero / page banner | `16:9` or `3:1` | Landscape. 3:1 is useful for wide hero images where the subject is centred. |
| Card thumbnail | `16:9` or `4:3` | 16:9 aligns with hero ratio; 4:3 gives more vertical space for portraits. |
| Gallery image (lightbox) | `4:3` or `3:2` | Classic photography ratios. Mixed ratios within a gallery are acceptable. |
| Article featured image | `16:9` | Standardised for consistent list layouts. |
| Portrait / team photo | `1:1` (square) or `3:4` | Consistent headshot framing. |

All ratios listed above are recommendations. Cropping must prioritise content preservation over ratio uniformity (see Section 7.3).

### 7.2 Responsive Cropping and Focal-Point Guidance

- Use `object-fit: cover` with CSS `object-position` to control cropping focus.
- Focal point should be faces and key activity areas — not the edges of the frame.
- On narrow viewports, hero images may be cropped more aggressively; verify that faces and key content remain visible.
- Use `<picture>` or `srcset` to serve appropriately sized images — never scale a single large image down on mobile.

### 7.3 Avoiding Destructive Crops

- Do not crop out faces, hands, or contextually important elements.
- When cropping to fit a ratio, prefer cropping from the edges (top/bottom/sides) rather than the centre of activity.
- If an image cannot be cropped to the target ratio without losing important content, use a different image or a different layout.
- Images containing people should not be cropped at the neck, wrist, or ankle joints.

### 7.4 Captions, Attribution, Source Provenance, and Capture-Date Metadata

- Every published image should have a caption when it provides context (event name, location, activity).
- Attribution: credit the photographer or source only when the available source establishes it.
- Source provenance: documented per `docs/archive-strategy.md` for all archived images.
- Capture date: displayed as part of the caption or metadata for event galleries.
- Images from social media must include source attribution and a link to the original post.

### 7.5 Consent-Status Requirements Before Publication

Per `docs/content-governance.md`, the generated inventory is not a publication approval. Every published image must have an explicit review entry and must satisfy the fail-closed publication selector. Record unknown source permissions truthfully; never promote an inventory item by assuming ownership or consent.

### 7.6 Handling Photos with Minors

- Do not infer a person's age or consent from an image.
- Do not newly publish an image known to contain an identifiable minor without documented permission appropriate to that publication.
- When age or permission creates a material unresolved risk, keep the image out of the publication selection.

### 7.7 Placeholder and Empty-State Behavior

- When no approved image is available, use a solid colour block (`--color-surface`) or a gentle gradient instead of a broken image icon.
- The placeholder region occupies the same dimensions as the image it replaces to maintain layout stability.
- Do not use generic stock photography as a substitute for real SNIE event photos.

### 7.8 Avoiding AI-Generated Images Mistaken for Real SNIE Events

- AI-generated images must not be used to represent SNIE events, participants, or activities.
- If AI-generated imagery is used for any purpose (e.g., decorative hero backgrounds), it must be clearly labelled as "AI-generated image" and must not depict identifiable individuals or specific SNIE events.
- The preferred approach: use real event photography for all content imagery, and avoid AI-generated visuals entirely unless explicitly requested by SNIE leadership.

---

## 8. Content States

### 8.1 Verified Production Content

- Full visual weight: primary typography, standard colours, interactive elements enabled.
- No visual markers indicating "draft", "needs review", or "unverified".

### 8.2 Draft content

- Draft content stays on a branch or draft pull request and may be inspected in its Cloudflare preview.
- Draft markers and editorial controls are not part of the public UI.
- Only `main` is a production deployment source.

### 8.3 Missing Translations

- Missing locale content must not produce broken pages, placeholder text, or unrelated fallback copy.
- All seven public areas remain available in Japanese, English, and Traditional Chinese.
- Critical facts, dates, and URLs stay consistent across the three dictionaries.

### 8.4 Empty Event or News Sections

- Display an honest empty-state message (see Section 5.13).
- No "Coming soon" or decorative illustrations that imply content will arrive.
- The section heading remains visible so users understand the empty area is intentional.

### 8.5 Archived Events

- If sourced event records are added later, archive rules must be based on the actual record model and current publishing need.
- Archived status is conveyed via section placement and heading, not by colour or icon alone.

### 8.6 External Links and Google Forms Handoffs

- Links to Google Forms and external sites have `rel="noopener noreferrer"` when opening in a new tab.
- A small external-link icon or "(External link)" text label is recommended but not required for MVP.
- Google Forms links are styled as primary buttons.

### 8.7 Unsupported Organization Facts

- Unsupported organization facts are omitted from the production dictionaries.
- Draft questions and verification notes stay in issues or draft pull requests, not in public-page source.
- Placeholder or review notation must never appear as polished public claims in production.

---

## 9. Reference Handling

### 9.1 Elements Worth Preserving from the Canva Site

- The SNIE acronym as the primary visual identifier.
- The full organisation name ("Students Network for International Exchange") as a subtitle.
- Positive, energetic tone in photography (if the Canva site uses real event photos).
- Simple, clear labelling of participation paths.

### 9.2 Elements That Need Modernization

- The Canva site's layout may rely on a single-page scroll design. The portal uses a multi-page architecture with clear navigation — this is an intentional improvement, not a divergence.
- Typography: the Canva site's font choices should be evaluated for web performance, licensing, and CJK coverage. If the existing choices are not available or suitable for the web, newer choices are acceptable.
- Responsive behaviour: the Canva site may not be fully responsive. The portal must be.

### 9.3 Elements That Should Not Be Copied

- The Canva site's exact visual layout, background treatments, and decorative dividers.
- Any Canva template graphic elements (shapes, icons, illustrations) that are not confirmed SNIE brand assets.
- Font choices that are not licensed for web use.
- Any content whose copyright or permission status is unknown (per `docs/archive-strategy.md`).
- Colour scheme if unconfirmed — do not assume the Canva site's colours are official brand colours.

### 9.4 Future identity inputs

The current implementation does not claim an official organization brand system. If documented identity assets become available, evaluate:

- Brand colour palette (`--color-brand-primary`, `--color-brand-secondary`).
- Font family selection across all three scripts.
- Official SNIE logo/wordmark files and usage guidelines.
- Whether the Canva site's design direction is endorsed or should be evolved.
- Any existing brand guidelines or style guides.

None of these inputs blocks use of the current accessible neutral interface.

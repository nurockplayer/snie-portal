# SNIE Porcelain — decision log

## Decided in this design

| ID | Decision | Basis |
|---|---|---|
| D-01 | Use Tachiko porcelain role values as the SNIE interface palette, with violet for action, current location and focus only | Tachiko authority; no approved SNIE palette; avoids national colours (SNIE principle 1.1); all contrast pairs pass |
| D-02 | Choose CJK font stacks by the nearest `lang` attribute | MEASURED: the current shared stack renders `zh-TW` Han with Japanese glyph forms |
| D-03 | Locale bar always visible above the header, not sticky; locale links removed from the menu and desktop nav | Language choice must not depend on finding a menu; one sticky element keeps the offset simple |
| D-04 | Header fixed at 64px; one `scroll-padding-top` token offsets all fragments | #54; MEASURED 40–41px clearance in 27 cases |
| D-05 | Home order is hero → participation paths → photo archive | Task priority (Tachiko §1.1); photos have unverified consent |
| D-06 | External handoff panel with disclosure facts beside the action | Tachiko §1.8; prepares #50 |
| D-07 | Separate components for collection empty state, statement and handoff | One meaning, one component (Tachiko §1.10); the current code uses `EmptyState` for all three |
| D-08 | All home photos stay lazy; `RemoteMediaImage` gains a `priority` prop but no current photo uses it | #55's outcome is to prioritise the first image "only when it is the mobile LCP candidate". After D-05 no photo is in the initial viewport at any tested width or locale (MEASURED: first photo top is 866–1427px, `inInitialViewport: false` in all 12 cases). Eager loading would spend mobile bandwidth on an off-screen image. The capture harness fails if a photo moves into the initial viewport. |
| D-09 | No logo mark; typographic wordmark only | No approved SNIE mark (#49) |
| D-10 | Record register specified but dormant | #52 entry condition |
| D-11 | Social preview is a typographic, language-neutral candidate, not wired in | #59 requires owner approval |
| D-12 | Max font weight 600; no uppercase eyebrow | Tachiko type policy; proper-name readability |
| D-13 | Participation cards are one column below 64rem, three from 64rem | No 2+1 layout that demotes one audience |

## Unresolved: needs an owner or maintainer decision

| ID | Question | Options and recommendation | Blocks |
|---|---|---|---|
| U-01 | **Is a violet interface palette acceptable for SNIE's public site** until an official palette exists? | (a) Accept (recommended): it is labelled an interface colour, not a brand colour. (b) Keep the old navy: it fails principle 1.1 more than violet does. (c) Wait for #49 brand input. | Slice 1 |
| U-02 | **Approve the social preview candidate** (#59)? | Approve as is, request changes, or replace with an owner-supplied asset | Slice 5 |
| U-03 | **Native-speaker review of the six proposed `ja`/`zh-TW` strings** | Required before slices 2 and 3 merge | Slices 2, 3 |
| U-04 | **Should Contact join the primary navigation?** Today it is only in the footer. | Recommended: yes, as a sixth item at ≥64rem and in the menu. It fits at 1024px in all locales (to be MEASURED at implementation), but it's an information-architecture change, so it is left out of this design. | — |
| U-05 | **Amend #55** to match D-08? | Requirements 2 and 6 ("mark the first homepage media item eager" and "assert it is not lazy") assume the photo is above the fold. Recommended: keep requirement 1 (`priority` prop), replace 2 and 6 with "no photo is an initial-viewport candidate; all remain lazy", and keep the LCP ≤ 2.5s target measured on whatever element is LCP. | Slice 3 acceptance |
| U-06 | **Inter via `next/font/google`** means a build-time fetch from Google Fonts (as Geist does today). Is that acceptable, or should Inter be vendored under `src/app/fonts/` with `next/font/local`? | Recommended: keep `next/font/google` (status quo). Vendor the font if builds must be offline. | Slice 1 |
| U-07 | **Independent design review.** Tachiko's workflow requires a reviewer who is not the author. | This design was authored by Claude in one session. A maintainer or second reviewer should review the renders before slice 1. | All slices |

## Not verified by this design

These require the implemented build: screen-reader output (VoiceOver, NVDA), native Windows High Contrast (only emulated `forced-colors` was rendered), iOS/Android rendering with real system CJK faces, Lighthouse LCP, and real-browser `:target` behaviour after client-side navigation from the home cards.

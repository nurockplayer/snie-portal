# Response to the independent review of PR #62

- **Reviewed HEAD:** `6124569ada7a7951258bf55894dbe454ca22a5d4`
- **Verdict received:** REQUEST CHANGES
- **This response:** the replacement candidate that follows it on `design/snie-porcelain-exchange`

Each finding is listed with its disposition, what changed, and the evidence. Evidence lives in [`../renders/evidence.json`](../renders/evidence.json) unless noted. All measurements are from macOS Chrome headless on the preview.

## Blocking findings

### R1 (P1): mobile menu inaccessible in a short viewport — **Accepted, fixed**

- **Root cause:** an absolutely positioned panel with no height bound, under a header that stays sticky at every height.
- **Fix, two layers** (design system §5.2 and §6.4; D-14):
  1. Below 32rem viewport height the header is `position: static` and the fragment offset drops to 1rem, so at 400% zoom the chrome scrolls away with the page.
  2. At every height the panel is bounded: `max-height: calc(100dvh - header - 1px)`, `overflow-y: auto`, `overscroll-behavior: contain`. In static-header mode it is unbounded and scrolls with the page instead. Overflow is never hidden.
- **Evidence (measured):** a 36-run menu suite: 3 locales × 5 viewports (320×200, 640×360, 320×640, 375×812, 768×1024) × header at its initial position and stuck after scrolling, plus 6 forced-colours runs. Each run checks:
  - Space and Enter open the menu.
  - Every link takes focus in order under Tab and under Shift+Tab, fully inside the viewport and unobscured (`elementFromPoint` hit test).
  - The last link is reachable by scrolling after the page is scrolled to its end.
  - Tabbing out closes the menu and the next focused element is visible.
  - Escape from a link and from the summary closes the menu and returns focus.

  Separately, the menu is closed after choosing a link and going Back.
- **Negative control:** with `preview.css` and `snie-theme.css` restored from `6124569`, the suite fails at 320×200 in all three locales, initial and scrolled, and in forced colours. Links 3–5 receive focus below the viewport, which reproduces the reviewer's result. Output: [`../renders/negative-control-r1.txt`](../renders/negative-control-r1.txt).
- **Renders:**
  - `menu-open-en-320x200-top.png`
  - `menu-open-en-320x200-last-link.png`
  - `menu-open-zh-TW-640x360.png`
  - `menu-open-zh-TW-375-stuck.png`
  - `forced-colors-menu-ja-375.png`

**Related, Escape scope (non-blocking): accepted.** The preview and the handoff now specify the same `<details>`-scoped behaviour (D-15). The review's Tab-out case exposed a further issue, now fixed: focus leaving an open overlay could land on content underneath it (WCAG 2.4.11), so focus leaving the menu now closes it.

### R2 (P2): HTML root missing the font variable, plus uncovered roots — **Accepted, fixed**

- **Font variable:** every font stack now starts with `var(--font-inter, Inter)`, and the checker rejects a bare `var(--font-inter)`. The handoff has an **HTML roots** section listing all three roots: `(site)/[locale]/layout.tsx`, `(redirect)/layout.tsx` and `global-not-found.tsx`. A shared `src/app/fonts.ts` keeps them from drifting.
  - Measured: with `--font-inter` removed, the h1 still renders in Inter. Platform fonts are recorded for `en`, `ja` and `zh-TW` text and for cross-locale locale links (`fontChecks`).
- **Root and 404 compositions:** both are now explicit in pages.md and generated in the preview (`dist/root/index.html`, `dist/404.html`). They use a static locale bar linking to the three locale homes, a wordmark-only header and the porcelain band.
  - Structural checks: `lang="ja"`, one h1, skip link, `noindex`, required strings, three locale-home links, no `aria-current`.
  - Measured: header and locale-bar geometry, 44×44 targets, no overflow.
  - Renders: `root-fallback-ja-375.png`, `not-found-ja-1280.png`.
  - The handoff states exactly how `LocaleBarStatic` supplies `/ja/`, `/en/` and `/zh-TW/` for `validate-mvp.mjs`.
- **Slice order:** the handoff now has a dependency table. The 64px header and fragment offset are slice 2 checks (where the header is restructured), not slice 1.

### R3 (P2): unsupported performance rule (D-08/U-05) — **Accepted, corrected**

- **Wrong claims withdrawn:** "never the LCP element", the checker's rejection of eager loading, and the capture rule that no photo may enter the initial viewport have all been removed.
- **Stronger evidence:** the first photo's position and the preview-reported LCP element are now recorded at six viewports per locale. This confirms the reviewer's point. The photo is inside the initial viewport at 1920×1080 in all locales and at 1440×900 in `zh-TW`, where the preview reports it as LCP; elsewhere text is LCP. These are labelled observations, not performance measurements.
- **New policy (D-08, §6.13):**
  - `RemoteMediaImage` takes an explicit loading/fetch-priority policy (#55 requirement 1).
  - The first photo is `loading="eager"` with default priority; later photos are lazy.
  - `fetchpriority="high"` is added only if Lighthouse shows the first photo is the mobile LCP element (gate G-1).
  - #55's acceptance criteria are unchanged.
- **U-05 is withdrawn** as an owner decision. #55 needs no amendment.

### R4 (P2): checker claims exceed what it checks — **Accepted, fixed**

| Gap | Change |
|---|---|
| Target check was `height < 44 \|\| width < 24`, with exclusions | Now `width < 44 \|\| height < 44` for every visible link, summary and button, with no exclusions except the off-screen skip link. 1,904 checks across 21 routes × 4 widths and forced colours; all pass. |
| Narrow keyboard path | Replaced by the R1 suite (Space/Enter, full Tab and Shift+Tab, scrolling, Tab out, Escape from a link and the summary, Back) |
| Forced colours checked only the `:target` edge; header was 66px | Header geometry fixed: borders are subtracted from the inner row, so the box is 64px in forced colours too. 42 forced-colours layout measurements plus 6 forced-colours menu runs. Still labelled **emulated**; native Windows High Contrast is untested. |
| Optional upstream check, not bound to the pin | `check-design.mjs` reads four Tachiko sources at `f44ad23` with `git show`, verifies their SHA-256 and compares 26 colour roles, the overlay shadow and the control radius. It fails if the pin is unreadable unless explicitly skipped. |
| Render provenance | `evidence.json` records the SHA-256 of 12 inputs and of every render; the checker fails when any input or render has changed since capture |
| Font resolution unqualified | `CSS.getPlatformFontsForNode` records the fonts actually used; claims are restricted to macOS, and iOS/Android/Windows are labelled untested |
| Evidence types blurred | README and design system §8 separate structural, measured, observed, visual and untested evidence, and state that CI doesn't run the design scripts |

## Other matters raised

| Matter | Disposition |
|---|---|
| U-01: navy argument | **Accepted.** The claim that navy was a national-colour problem has been withdrawn. Violet is a proposal and owner approval is required. |
| U-02 to U-04, U-06, U-07 | Wording updated as the review recommends. U-04 now has recorded fit evidence: a sixth item fits at 1024px in all locales. U-06 is reclassified as a build-reproducibility choice. U-07 is not passed; this candidate needs re-review. |
| Tachiko authority distinction | **Accepted.** tachiko-alignment.md states that SNIE adopts Tachiko's visual language and contract, not its authority chain or HTML workflow. SNIE's authority comes from owner approval and merge. FES45/v3 is cited as historical provenance only. Two inaccurate provenance claims found while re-verifying were corrected: "Tachiko uses no weight above 600" and "10px from Tachiko". |
| Media evidence boundary | **Accepted.** Committed renders replace every legacy photo with a "withheld" placeholder (D-16). The nine original photo-bearing blobs are now absent from the rewritten branch history; GitHub retains by-ID exposure pending Support assessment. See U-08 below. |
| Superseded safeguards | **Accepted.** Design system §7.1 restates the minors, consent, inventory, caption, crop, substitute, placeholder, content-state and label-expansion rules from the 2026-08-20 baseline. |
| Portal redesign versus complete visitor experience | **Accepted.** README and the design system scope statement say approval doesn't resolve #49–#51. |
| zh-TW terminology (新聞/消息, 留學生/國際學生) | Added to U-03's review scope as editorial issues, not layout regressions |
| Home → client navigation → Back/Forward (#54) | Static-document path now measured (6 cases). Next.js client navigation stays an implementation gate (G-2). |
| Full visual sign-off | **Outstanding.** The author inspected the renders, but an independent human review is still required (U-07, G-3). |

## Follow-up after `d679b71`

### U-08: branch-history remediation executed; retained GitHub exposure remains

- **Disposition:** the owner explicitly authorized the rewrite and force-push; no repeated approval was requested.
- **Executed on 2026-10-02 UTC:** the branch's four introduced commits were rebuilt without the nine original legacy-photo-bearing blobs and force-pushed with an exact lease on the old remote HEAD. Original authorship, messages, the approved current design tree and all later corrections were preserved.
- **Exact rewritten design HEAD before the audit-record commit:** `a0654bffc287a5b6ce314a615bce87e35206b180`. Its tree is byte-identical to the pre-rewrite candidate. The audit-record commit follows it and changes only U-08 reporting.
- **Verified:** the branch and PR #62 head moved to that exact rewritten HEAD; none of the nine original blobs or four old commits is reachable in the cleaned ancestry. No audited advertised branch/tag or PR head/merge reference retains the first old commit. Only PR #62 was affected.
- **Residual exposure:** all nine original render URLs were still retrievable after the force-push, with bytes matching the original blob IDs. A branch rewrite does not purge GitHub's retained/unreferenced objects, historical PR references or cached views, or earlier clones/fetches.
- **Validation:** structural design/upstream/evidence-hash and product checks pass. The original macOS measurements remain preserved. Fresh cloud browser-capture execution was blocked before startup by a runtime socket restriction; no new browser-capture pass is claimed.
- **Support follow-up:** prepared, not submitted. Request eligibility assessment, retained PR-reference handling, server garbage collection and cache removal. GitHub's published policy excludes non-sensitive data; eligibility for these already-public legacy photos is not guaranteed.
- **Full exact-commit/result record:** [`../decisions.md`](../decisions.md) → "U-08 remediation record". Original blob IDs and direct retrieval links remain omitted from the public record.

### Remaining R2 corrections: root fallback and global 404

- **Preserved metadata:**
  - The preview root now carries the production meta refresh, the canonical `/ja/` and `noindex, follow`, and the checker verifies them.
  - A second document, `root/fallback.html`, is identical except for the refresh. It is what is measured and rendered, and the checker enforces that the two differ only by the refresh.
  - The 404's title and `noindex, nofollow` are checked too.
- **Typography:** platform fonts are now recorded and asserted for the root fallback (Inter; Hiragino Sans for Japanese) and the 404 (Hiragino Sans; PingFang TC for the 繁體中文 link).
- **Focus:** both documents are included in the new focus sweep below.

### New: keyboard focus sweep (strengthens R4)

- **What it does:** on every localized route, the root fallback and the global 404, at 375×812 and 1280×800, it presses Tab forward through every focusable element, then Shift+Tab back the same number of stops. Each stop must show a focus indicator and be fully visible, hit-tested at its centre and three points along its top edge so partial occlusion by the stuck header counts.
- **Result:** 46 sweeps, all passing.
- **Negative control:** with `scroll-padding-top` removed, Shift+Tab leaves photo-source links under the header in all three locales ([`../renders/negative-control-focus.txt`](../renders/negative-control-focus.txt)).
- **Bug found and fixed while building it:** a single centre hit-test plus a pure-geometry check was first too weak (no failures in the control), then too strict (it flagged the skip link, which is stacked above the header). Headless Chrome also wraps focus at document edges, so the backward walk is now bounded by the forward count.

# SNIE Porcelain — decision log

## Decided in this design

| ID | Decision | Basis |
|---|---|---|
| D-01 | **Propose** Tachiko porcelain role values as the SNIE interface palette, with violet only for action, current location and focus | Tachiko is the declared design authority; all 26 contrast pairs pass. Adoption of violet over the current navy is **owner decision U-01**. |
| D-02 | Choose CJK font stacks by the nearest `lang` attribute; every stack starts with `var(--font-inter, Inter)` | MEASURED on macOS: the current shared stack renders `zh-TW` Han with Japanese forms; platform-font checks confirm the fix. The fallback prevents an invalid `font-family` on a root that misses the variable. |
| D-03 | Locale bar always visible above the header, not sticky; locale links removed from the menu and desktop nav | Language choice must not depend on finding a menu |
| D-04 | Header outer box fixed at 64px, including forced colours; one `scroll-padding-top` token offsets all fragments | #54. MEASURED: 40–41px clearance in 27 direct-entry cases and 6 back/forward paths |
| D-05 | Home order is hero → participation paths → photo archive | Task priority (Tachiko §1.1); photos have unverified consent |
| D-06 | External handoff panel with disclosure facts beside the action | Tachiko §1.8; prepares #50 without claiming GitHub is a private route |
| D-07 | Separate components for collection empty state, statement and handoff | One meaning, one component (Tachiko §1.10) |
| D-08 | **Photo loading is provisional:** explicit loading/fetch-priority props on `RemoteMediaImage`; first photo `loading="eager"` with default priority; later photos lazy; `fetchpriority="high"` only if Lighthouse shows the first photo is the mobile LCP element | Supersedes the earlier "all lazy" rule, which over-generalised four viewport samples. Recorded at six viewports: the first photo is outside the initial viewport on phones, tablets and 1280×800, but inside it at 1920×1080 (all locales) and 1440×900 (`zh-TW`), where the preview reports it as LCP. Fold position doesn't establish LCP; Lighthouse on the implemented build does (gate G-1). |
| D-09 | No logo mark; typographic wordmark only | No approved SNIE mark (#49) |
| D-10 | Record register specified but dormant | #52 entry condition |
| D-11 | Social preview is a typographic, language-neutral candidate, not wired in | #59 requires owner approval (U-02) |
| D-12 | Max font weight 600; no uppercase eyebrow | Readability; Tachiko running text also stays at or below 600 |
| D-13 | Participation cards are one column below 64rem, three from 64rem | No 2+1 layout that demotes one audience |
| D-14 | **Short viewports:** below 32rem height the header is static and the anchor offset is 1rem; the open menu is bounded to the viewport and scrolls internally at every height | Review finding R1. WCAG 1.4.10: 1280×800 at 400% zoom is about 320×200. MEASURED: 36-run menu suite passes; the reviewed HEAD's CSS fails it (negative control). |
| D-15 | **Menu behaviour is `<details>`-scoped:** Escape from the summary or a link closes it and returns focus; focus leaving the menu closes it; navigation and bfcache restore close it | One specification for the preview and the handoff (review); focus leaving an open overlay must not land under it (WCAG 2.4.11) |
| D-16 | **Design evidence withholds legacy photos** | Their consent is `unknown-public-source`; #51 hasn't decided whether more persistent copies are allowed. Committed renders use a neutral placeholder. |
| D-17 | **Root redirect fallback and global 404 get explicit compositions** (static locale bar, wordmark-only header, porcelain band) | Review finding R2. They are separate HTML roots with their own contracts. |

## Unresolved: owner decisions

| ID | Question | Recommendation | Blocks |
|---|---|---|---|
| U-01 | **Adopt violet as the interface colour, or keep the current neutral navy?** | Violet: it is the design authority's accent and is labelled an interface colour, not an SNIE brand colour. Navy remains valid: the superseded baseline allowed it and it is not a neutrality defect. This is a conspicuous public identity change, so the owner decides. Either way only the `action`/`accent`/`selection`/`focus` values change. | Slice 1 values |
| U-02 | **Approve the social preview candidate** (#59)? | Approve, request changes, or supply an asset. Its violet rule follows U-01. Approval still requires stable hosting, localized alt text and metadata checks (#59). | Slice 5 |
| U-03 | **Language review** of the six proposed strings, in the context of the pages that use them | Required. Also consider the existing terminology differences this review surfaced: 新聞 (nav) versus 消息 (body copy), and 留學生 versus 國際學生 in `zh-TW`. Those are editorial issues, not layout ones. | Slices 2–3 |
| U-04 | **Add Contact to the primary navigation?** It is currently only in the footer. | Optional; not a prerequisite. Recorded evidence: a sixth item fits on one row at 1024px in all three locales, with at least 191px to spare (`evidence.json` → `observations.contactFit`). Adoption would need the composition updated and the menu suite rerun with six rows. | — |
| U-07 | **Independent design review** of this candidate | Required before slice 1. The previous review found blocking issues at `6124569`; this candidate addresses them (see [reviews/pr62-review-response.md](reviews/pr62-review-response.md)) and needs re-review, including human inspection of the renders. | All slices |
| U-08 | **Legacy photo copies in this PR's history** | **Owner disposition: purge authorized** (relayed through dot; recorded 2026-10-03). **Remediation: not yet executed.** See "U-08 remediation record" below. | Remediation execution |

U-05 (amend #55) is **withdrawn**. #55's acceptance stays as written, and its implementation is gate G-1 in the handoff. U-06 (Inter via `next/font/google` or vendored) is a **build-reproducibility choice**, not an owner content decision. `next/font/google` downloads the font at build time and serves it from the deployment, so visitors make no request to Google. The default is to keep it; vendor it with `next/font/local` only if builds must run offline.

## U-08 remediation record

- **Disposition.** The owner authorized purging the renders that reproduce legacy SNIE photos from this PR's branch history. Approval is not being requested again.
- **Scope.** The branch's first commit (`6124569`) contains nine renders that reproduce the legacy photos: the home-page renders and the component-board render. No later commit reintroduces them: from the review-correction commit onward every render uses the "withheld" placeholder (D-16). This record deliberately omits object IDs and direct retrieval links.
- **Actual result (2026-10-03).** The purge was **not executed**. Rewriting the branch history and force-pushing were refused by the authoring agent's permission guard as a destructive Git operation, and the agent did not work around that refusal. The branch therefore still contains the original commit and those renders. Completing the purge needs a maintainer with permission to rewrite and force-push this branch, or an explicit grant of that permission to the agent.
- **Verified today:** the original commit and its renders are still publicly retrievable from GitHub by commit ID. The repository is public and has no forks.
- **Not exposed:** Cloudflare Pages previews are built from `out/`, which doesn't contain `docs/`; render paths on the preview deployments return 404. No PR comment or review embeds a render.
- **Residual exposure a branch rewrite alone cannot remove:**
  - GitHub keeps objects retrievable by ID, and the PR timeline keeps referencing the old commit after a force-push, until GitHub Support purges cached views and unreferenced objects.
  - Any clone or fetch made before the purge keeps the files. That includes this machine's local repository (until its reflogs expire and it is garbage-collected) and the independent reviewer's environment, which fetched branch content.
  - The photos themselves remain public at their original legacy URLs. That is outside this PR's control and part of #51.
- **Completion criteria:**
  - The branch history no longer contains the nine renders.
  - After a GitHub Support purge, the original commit is no longer retrievable by ID.
  - This record is updated with the date and the resulting commit IDs.

## Implementation gates (not owner decisions)

| ID | Gate |
|---|---|
| G-1 | #55: Lighthouse mobile ×3 on `/ja/` and `/zh-TW/` plus desktop; record the LCP element; set `fetchpriority="high"` on the first photo only if it is the mobile LCP element; acceptance unchanged |
| G-2 | Rerun the capture harness against the served build, covering header geometry, fragments with Next.js client navigation, and the menu suite in forced colours |
| G-3 | Manual checks: screen readers, native Windows High Contrast, iOS/Android/Windows fonts, human visual review in all three locales |

## Not verified by this design

These are still unverified:

- Screen-reader output (VoiceOver, NVDA).
- Native Windows High Contrast; forced colours were only emulated.
- iOS, Android and Windows rendering; fonts were measured on macOS only.
- Lighthouse LCP.
- Next.js client-side navigation.
- Human visual judgement of the renders by someone other than the author.

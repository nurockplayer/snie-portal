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
| U-08 | **Legacy photo copies originally committed in this PR** | **Owner disposition: purge authorized. Branch-history remediation executed and verified on 2026-10-02 UTC.** GitHub retained-object removal remains pending and is subject to Support eligibility. See "U-08 remediation record" below. | GitHub retained-object assessment/removal |

U-05 (amend #55) is **withdrawn**. #55's acceptance stays as written, and its implementation is gate G-1 in the handoff. U-06 (Inter via `next/font/google` or vendored) is a **build-reproducibility choice**, not an owner content decision. `next/font/google` downloads the font at build time and serves it from the deployment, so visitors make no request to Google. The default is to keep it; vendor it with `next/font/local` only if builds must run offline.

## U-08 remediation record

- **Disposition.** The owner explicitly authorized the branch-history rewrite and force-push. Approval was not requested again. The earlier authoring agent's refusal remains a historical fact; this later remediation proceeded under the owner's current explicit instruction.
- **Scope.** Only the nine original photo-bearing blobs from the first `6124569` revision were removed: `components-board-1280.png`, `home-en-1280.png`, `home-en-320.png`, `home-en-375.png`, `home-ja-1280.png`, `home-ja-375.png`, `home-ja-768.png`, `home-zh-TW-1280.png`, and `home-zh-TW-375.png`, all under `docs/design/renders/`. Corrected, withheld-placeholder renders at these paths remain. Original blob IDs and direct retrieval links are deliberately omitted from this public record.
- **Actual result (2026-10-02 UTC).** The four branch-introduced commits were rebuilt on the unchanged base `17cefe9dbe81c429be3dabee8128ff935d3abbe3`. The branch was force-pushed with an exact lease against the old remote HEAD `14d12627eae40955687f328668eac8dddd646fdc`; only `refs/heads/design/snie-porcelain-exchange` was updated. GitHub's branch and `refs/pull/62/head` both then resolved to the rewritten design HEAD `a0654bffc287a5b6ce314a615bce87e35206b180`. No merge or product implementation was performed.
- **Preservation.** Every original author, committer, timestamp and commit message was preserved. Only the original first commit's nine file entries and the descendant parent IDs changed. The rewritten design HEAD's tree is exactly `416d5aa8a578cda3f98a7e6b612c2b472a975f29`, byte-identical to the approved pre-rewrite HEAD. This subsequent audit commit changes only this record and the review response's U-08 status.

| Rebuilt revision | Exact new commit ID |
|---|---|
| Initial design authority, nine original photo-bearing blobs omitted | `4f8e28fdec4147b23040b25b5a5a8b8395df241b` |
| Independent-review corrections | `e5a29cead3b97e47b865da9acaba0195cd4037eb` |
| Root/404 and focus corrections; original disposition record | `d89b155c4e222ed05ba8a576504a3083cdcd5342` |
| Preserved capture-evidence tree; rewritten design HEAD | `a0654bffc287a5b6ce314a615bce87e35206b180` |

- **Audit-commit identity.** This record is a child of the exact rewritten design HEAD above. Its own ID is intentionally not written into itself: the exact resulting PR HEAD is recorded in PR #62's candidate/status update after publication and can be obtained from the branch ref or this file's commit history. This avoids a self-referential commit-ID claim.
- **Branch-history verification.** A complete reachable-object enumeration from the rewritten HEAD contains none of the nine original blob IDs and none of the four old branch commits. A fresh base-only repository successfully imported the transport bundle; none of its 482 imported objects contained a target blob. All advertised ordinary branch/tag and PR head/merge refs were audited: before the push only this branch and PR #62 contained the first original commit; after the push no advertised ref in that audit retained it. GitHub generated a new PR merge ref with cleaned ancestry. Exactly one PR was affected. Inaccessible internal or historical references are not covered by this advertised-ref audit.
- **Validation.** The dependency-free preview generator and `check-design.mjs` pass, including the pinned Tachiko `f44ad23` source hashes, 26 colour-role/contrast checks, six proposed keys, 21 localized preview routes, root/404 contracts, and the unchanged 31-render/12-input evidence hashes. Product lint, seven ops tests, build and MVP validation of 21 routes pass. The original macOS measurements and capture provenance are preserved, not relabelled as a new capture. A fresh menu-capture attempt in the cloud was blocked before browser startup by the runtime's `socket() ... Operation not permitted` restriction; no fresh browser-capture pass is claimed. Existing independent human review and implementation gates remain open.
- **Residual GitHub exposure verified after the force-push.** All nine original render URLs returned HTTP 200 and their response bytes matched the original Git blob IDs. Thus branch cleanup is complete, but GitHub object/cache removal is not. The old objects are no longer reachable through the audited current branch/PR refs; GitHub's retained objects, historical PR references, cached commit/blob/raw views or caches may still expose them. A force-push does not delete GitHub's read-only or internal retained references and does not run server-side garbage collection.
- **Other residual exposure.** Existing clones, reflogs, fetches and independent-review copies can retain the old history; they require separate holder-side cleanup. They must not merge the old ancestry back into this branch. The legacy photos' original public URLs and third-party copies/caches remain outside this PR and under #51. No claim is made that every third-party copy or fork has been inspected or removed. The earlier record found no PR comment embedding a render and reported Cloudflare previews built from `out/` without `docs/`; this branch rewrite does not constitute a new deployment/cache audit.
- **Exact GitHub Support follow-up, not submitted.** Request an eligibility assessment and, if eligible, removal of PR #62's obsolete/internal references to the first changed original commit and descendants, server-side garbage collection of the unreferenced commits/trees/nine blobs, and removal of cached commit, blob/raw and PR-diff views. Supply privately: repository `nurockplayer/snie-portal`, one affected PR (#62), the full first changed original commit ID, the four-commit old/new mapping, final verified branch HEAD, the nine original blob IDs and paths, and the before/after ref audit. The PNGs are ordinary Git blobs, with no LFS objects to purge. Ask Support to confirm retained-reference handling, any loss of historical review/diff visibility, and garbage-collection/cache completion; this request does not authorize closing, deleting, archiving or merging the live PR. GitHub's [official procedure](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) says Support does not remove non-sensitive data, so already-public legacy photos with unverified consent may not qualify. Removal is not promised. Use the [official Support portal](https://support.github.com/).
- **Remaining completion condition.** Obtain Support's eligibility decision and, if it accepts the request, verify that the old render/commit retrieval routes no longer return the removed data. Until then the accurate status is **branch-history remediation completed; retained GitHub exposure remains**.

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

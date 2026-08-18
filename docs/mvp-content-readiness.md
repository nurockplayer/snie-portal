# MVP Content Readiness and Provenance

> Internal implementation/review record for [Issue #19](https://github.com/nurockplayer/snie-portal/issues/19) under [Issue #26](https://github.com/nurockplayer/snie-portal/issues/26). Snapshot: 2026-08-19, reviewed against `origin/develop@603fd8002bd8a6f8c8eb2580af2309e82c66e3d1` after the #18 content merge. This is not public page copy.

## Readiness

**Overall status: BLOCKED_HUMAN_ACTION.** The repository contains the multilingual scaffold and the content rules, but it does not contain a human approval record for launch copy, critical organization facts, destinations, policy, or translations.

Status labels used here:

- **VERIFIED_REPOSITORY_FACT** — supported by a reviewed repository document or current source file. This is not, by itself, approval for public publication.
- **BLOCKED_HUMAN_ACTION** — a human must supply, verify, review, or approve the item before it can be published.
- **EMPTY_STATE_REQUIRED** — no verified item is available in the reviewed repository; use an honest empty state until a verified item is supplied. The empty-state wording still needs human review.

## Current safe content state

The safe, content-relevant facts currently available from the repository are:

- The project is identified as SNIE Portal, and the repository expands SNIE as “Students Network for International Exchange.” This is repository identity, not an approval record for public organization copy.
- The required locales are ja, en, and zh-TW; ja is the default and the canonical source language, with en and zh-TW as reviewed derivatives.
- The seven MVP areas are Home, About SNIE, Activities, News, Join Us, Contact, and Privacy / Photo Policy.
- Home, About, Join Us, Contact, Privacy, Activities, and News must remain reachable in all three locale routes for this MVP. Activities and News use reviewed empty-state copy in every locale until verified items exist; no locale is silently omitted from the public route family.
- The current source tree has localized route pages and a shared locale layout under `src/app/(site)/[locale]`, plus dictionaries at `src/i18n/dictionaries/ja.json`, `en.json`, and `zh-TW.json`. The dictionaries contain page strings, but no source, reviewer, or approval metadata was found for them; treat those strings as BLOCKED_HUMAN_ACTION, not as verified production copy.
- No verified event or article record is present in the reviewed content documents or current source tree.

## Per-locale publication status

All three locale dictionaries exist, but none has a recorded production approval.

| MVP content scope | ja | en | zh-TW | Publication gate |
|---|---|---|---|---|
| Home, About, Join Us, Contact, Privacy | BLOCKED_HUMAN_ACTION | BLOCKED_HUMAN_ACTION | BLOCKED_HUMAN_ACTION | Reviewed done status and an identifiable reviewer/approval record in all three locales |
| Activities | EMPTY_STATE_REQUIRED + BLOCKED_HUMAN_ACTION | EMPTY_STATE_REQUIRED + BLOCKED_HUMAN_ACTION | EMPTY_STATE_REQUIRED + BLOCKED_HUMAN_ACTION | No verified item is available. Publish the reviewed empty state in all three locale routes for this MVP. |
| News | EMPTY_STATE_REQUIRED + BLOCKED_HUMAN_ACTION | EMPTY_STATE_REQUIRED + BLOCKED_HUMAN_ACTION | EMPTY_STATE_REQUIRED + BLOCKED_HUMAN_ACTION | No verified item is available. Publish the reviewed empty state in all three locale routes for this MVP. |

### Activities and News decision

For this readiness record, the implementation decision is the honest-empty-state path for both Activities and News. Do not add fictional events, articles, dates, photos, partners, statistics, or links. A human must approve the empty-state wording; the internal status labels in this document must never appear as public copy. If a human later supplies a real verified item, replace the empty state only after recording its source, date, factual review, and photo-consent status where relevant.

## Exact human actions and resume points

| ID | Human action and evidence needed | Resume point |
|---|---|---|
| H1 | SNIE leadership or a designated representative confirms the official organization name, approved short description, mission/purpose, organization status and public scope. Add founding history, leadership, programs, partners, dates, fees, capacities, or statistics only when individually verified and approved. Record the source, reviewer identity, and approval date. | Update the Japanese canonical Home/About content, then update the provenance row and review status. |
| H2 | Provide approved participation paths for Japanese university students, international students, and partner organizations/schools, including eligibility, flow, application or inquiry destination, and any public fee, deadline, capacity, or condition. | Populate the Join Us content and its locale derivatives; verify every destination before release. |
| H3 | Supply the public contact email or form, participation form URL, and official Instagram, Facebook, X, or other channel URLs. Confirm ownership, publication permission, and that every link works. | Populate Contact and relevant CTAs; record each exact URL and verification result. |
| H4 | Either provide real Activities and News items with source, title, date, description, and required photo-consent evidence, or approve honest empty-state wording in all three locales. | Implement the selected state in Activities and News; record each locale's review status and provenance. |
| H5 | Review the minimum public Privacy / Photo Policy notice: data collected through linked forms, purpose, third-party handoff, photography notice, photo-removal route, and privacy contact route. Confirm the policy owner/reviewer and approval evidence; do not claim legal review unless it occurred. The current MVP publishes no photos, so select and record the consent model before any future photo publication; a private photo archive, if introduced later, needs its own conditional retention/access controls. | Populate the Privacy page and its reviewed locale versions; keep future photo-consent and archive-retention work conditional on publishing photos and separate from the current no-photo public-notice gate. |
| H6 | Review the Japanese source and both translations, assign identifiable reviewers, and record approval dates. Confirm that critical facts, dates, fees, capacities, and URLs are identical across locales. | Mark only actually reviewed locale content as done, then rerun the Issue #19/#26 content gate. |
| H7 | Deliver the approved content through a PR targeting `develop` that references #19, then record green `pnpm lint`/`pnpm build` evidence and the final route/link checks required by #26. | Reconcile the merged `develop` SHA, verify all 21 locale routes and internal destinations, then continue to #20/#21 release gates. |

## Delivery and final verification gate

Content approval is separate from implementation evidence. Before this lane can be called ready for the next stage, the content PR must target `develop` and reference #19; every locale-prefixed MVP route must render without a 404; internal links must resolve; and the source must contain no `href="#"`, placeholder URL, draft label, `To be verified` marker, fictional claim, or stale public fixture. Record the exact merged `develop` SHA and the green `pnpm lint` and `pnpm build` results before moving to the #20 quality gate.

## Provenance and approval table

| Item | Evidence currently available | Publication status |
|---|---|---|
| Project identity: SNIE Portal / Students Network for International Exchange | AGENTS.md and the current repository identify the project and acronym expansion | VERIFIED_REPOSITORY_FACT; public organization copy still requires H1 |
| Locale set and language ownership model | CLAUDE.md, src/i18n/config.ts, and docs/content-governance.md define ja, en, zh-TW, with ja canonical | VERIFIED_REPOSITORY_FACT; not a translation approval |
| SNIE Canva Site: https://snie.my.canva.site/snie-com | Listed in docs/content-inventory.md as an accessible known source | BLOCKED_HUMAN_ACTION until official ownership, reuse permission, freshness, and factual provenance are confirmed; do not treat it as an approved CTA or official link |
| Organization facts: approved name/description, mission, status, scope, founding, leadership, programs, partners, statistics | Required by Issue #19, but no approved values or source/reviewer record is present in the reviewed repository | BLOCKED_HUMAN_ACTION |
| Participation paths and conditions | Required by Issue #19; no approved eligibility, flow, fee, deadline, capacity, or destination values are present | BLOCKED_HUMAN_ACTION |
| Contact details and forms | Information architecture and roadmap require a contact route and Google Forms or mailto destination, but no public email or concrete form URL is recorded | BLOCKED_HUMAN_ACTION |
| Social URLs | Inventory lists Instagram, Facebook, and X/Twitter as items to verify, with handles and exact URLs still undetermined | BLOCKED_HUMAN_ACTION |
| Activities | No verified event record, source, date, or photo-consent record is present | EMPTY_STATE_REQUIRED + BLOCKED_HUMAN_ACTION |
| News | No verified article record, source, date, or editorial approval is present | EMPTY_STATE_REQUIRED + BLOCKED_HUMAN_ACTION |
| Privacy / Photo Policy | Required public notice is defined, but the policy owner/reviewer and approval evidence are not supplied. The current MVP publishes no photos; the consent model is a conditional gate before any future photo publication. Private archive retention is conditional future work, and legal review must not be claimed without evidence. | BLOCKED_HUMAN_ACTION |
| Locale dictionary copy | ja, en, and zh-TW files exist, but the reviewed repository contains no per-locale source, reviewer, or approval record | BLOCKED_HUMAN_ACTION |
| Reviewer identities and approval dates | Governance names roles, but no individual translation, factual, policy, or photo reviewer is identified | BLOCKED_HUMAN_ACTION |

Until H1–H7 are completed, this record is not a publication approval and the MVP content lane remains blocked.

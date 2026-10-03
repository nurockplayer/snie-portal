# Source-backed activity records

## Entry decision and delivered scope

Issue #52 is now implemented using the seven dated 2025 reports already published in editorial release [#63](https://github.com/nurockplayer/snie-portal/pull/63), rather than inventing a new event or treating an undated archive photograph as a record. The existing titles, summaries, event dates, source-publication dates, source names and URLs are preserved exactly. The delegated website work adds validation and detail routes; it does not claim a separate institutional sign-off on every source or establish current organization/contact facts.

The three source documents were rechecked on 2026-10-03 UTC:

- [Ogasawara-ryu's official report](https://ogasawararyuu.blog.jp/archives/1083003749.html): the 2025-09-07 Yoyogi sencha exchange, published 2025-09-10
- [JET's speech-contest report](https://jet.ac.jp/2025/07/31/250731/): the 2025-07-31 contest and SNIE participation; its original publication date is retained
- [JET Newsletter 112](https://jet.ac.jp/wp-content/uploads/2025/10/vol112.pdf), dated 2025-10-06: five dated SNIE exchange entries on printed pages 7 and 8

No new source photographs, third-party full articles, personal identities, current registration links, fees, officers or activity times are added. The date-only records do not infer a time or timezone. The existing 80-image gallery and all photo/source associations remain unchanged.

## Minimal model

`src/content/recent-records.json` remains the single editable content file. Each record has a stable date-based `id`, `type: activity-report`, `publication: published`, `eventState: past`, `datePrecision: day`, shared event/source-publication/review dates, the original source URL/name/locator, the editorial publication decision reference, and Japanese/English/Traditional Chinese title and summary objects.

`activity-records.mjs` validates that real Gregorian dates, chronology, supported source URLs, provenance, exact locale parity and publication state agree. It runs when the application imports the collection, so invalid or draft entries fail the static build instead of appearing in a list, detail page, homepage teaser or sitemap. Upcoming, cancelled, timed and registration-bearing entries are rejected by this deliberately small past-report model. Extend it only when a real approved record requires those semantics; do not label a cancelled or future event as a past report to make it pass.

Drafts stay on Git branches and draft PRs. The published data file contains no persistent draft workflow or inferred approval state. `publicationDecision: editorial-release-63` identifies the existing entry set; a genuinely new publication decision must be recorded and the explicit validation/test boundary reviewed along with its source-backed records.

## Public routes and navigation

Each stable record ID produces `/ja/news/<id>/`, `/en/news/<id>/`, and `/zh-TW/news/<id>/`. Seven records add 21 detail routes to the existing 24, for 45 localized routes total. Lists and homepage teasers link to those pages while retaining direct source links. Every detail page has a visible past-activity notice, separate activity/source-publication dates, localized summary, source attribution and return-to-list link.

Language switching preserves a safe record-shaped path without bundling translated record content into navigation JavaScript; unknown route shapes return to the target locale home. The static route generator only creates the seven validated slugs, and unknown records return the localized static 404. Metadata, canonical URLs, all language alternates, social images and sitemap entries use the same shared record IDs.

Do not rename or remove a published ID casually. Corrections retain the stable URL. Removing or renaming one requires an explicit redirect/retention decision and corresponding smoke tests.

## Direct Git authoring and verification

1. Check the actual source and publication decision first. Keep critical dates, URLs and state shared across locales; omit unknown facts rather than infer them.
2. Edit on a feature branch. Keep Japanese source-based copy and equivalent English/Traditional Chinese copy complete; leave unreviewed work in a draft PR.
3. Run `pnpm test:content`, `pnpm test:ops`, `pnpm test:archive`, `pnpm test:media`, `pnpm test:images`, `pnpm lint`, `pnpm build`, and `pnpm check:mvp`. The route/metadata/sitemap checks derive the 45-route set from validated records and check every rendered detail, source link and locale switch.
4. Require independent review plus exact hosted CI and Cloudflare preview. Verify direct detail entry, language switching, return-to-list, Back/Forward and narrow layout before release.
5. Publish through `develop` → `main`, then run production smoke against the exact deployment commit. Source-publication dates are not the website deployment date and must not be reset on a release.

Direct Git, static export and reviewed PRs remain sufficient for this small source-backed set. Reconsider an editor/CMS only when sustained publication volume or named editors unable to use GitHub make it materially useful. Reconsider translation automation only with an actual volume/review bottleneck and a human review plan. This change adds no CMS, database, authentication, admin UI, tags, search, pagination or translation service.

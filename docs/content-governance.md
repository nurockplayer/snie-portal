# Content governance

> Status: active. Last reconciled: 2026-10-03.

The production workflow is [Direct Git](content-management-decision.md).
Interface copy lives in the four locale dictionaries; shared dates, source
URLs, record state and curated media data live in `src/content/`.

## Publication and source rules

- Publish only source-backed SNIE claims within the recorded publication decision. AI assistance is not a source for organization facts
- Keep Japanese, English, Traditional Chinese and Korean critical facts and destinations coherent; do not independently translate dates or URLs
- Treat historical affiliations, officers, instructions and handles as historical unless current operation/authority is established
- Keep drafts on branches or draft PRs. The existing activity-report model rejects draft, invalid, future/unsupported and incomplete-locale records before static publication
- Do not publish fictional events, invented application details, placeholder promises or inferred private contact routes
- Keep source-publication dates distinct from event dates and website deployment dates. Preserve stable published IDs unless an explicit redirect/retention decision is reviewed
- Record source verification and the applicable editorial decision without publishing private approval messages or implying independent institutional sign-off that did not occur

See [activity-record authoring](activity-records.md) for the existing seven
reports and [content readiness](mvp-content-readiness.md) for unresolved current facts.

## Media and archive rules

- Preserve source URL, source-section association and capture/hash provenance. Gallery, presentation, school-image and portfolio manifests describe the approved editorial selection; the older legacy-media review file is not the whole current photo collection
- Keep original selected bytes and original-image links intact. Responsive delivery variants are separate hash-checked assets and do not establish new rights or alter source attribution
- Use meaningful localized accessible text and visible source context. Do not infer identities, dates, ownership, consent or licenses from public availability or an archive capture
- Existing former-public SNIE publication authorization is repository/site-specific. New material still requires an appropriate publication decision; CDX `publicationAllowed: false` prevents new archive-index findings from automatically entering the website
- If an origin disappears, preserve approved controlled copies and provenance while reviewing the affected public use; do not treat disappearance as consent or silently claim the source is still live
- Handle credible correction/removal requests promptly through an approved route. The lack of a verified private photo-removal endpoint remains an open limitation under #50; do not ask visitors to publish sensitive details in GitHub Issues
- This is a public Git repository. Files outside `public/` can still be exposed through GitHub. Do not commit private preservation packages, raw provider-token-bearing HTML, credentials or unreviewed source bodies

The [bounded archive tool](historical-archive.md) publishes reviewed CDX index
fields only; it does not download replay content or grant publication approval.
PR #61's old crawler/raw package is not adopted by that tool.

## Review and recovery

Every feature targets `develop`, receives independent review and an exact-head
CI/Cloudflare preview, and passes applicable validation. UI changes require
relevant browser checks; document any environment/device limits honestly.
Squash feature PRs, then release `develop` to `main` with a normal merge commit.
Only the exact successful deployment plus public smoke establishes completion.

Previous approved content is recoverable through Git history and Cloudflare
production deployments. Prefer a reviewed revert/release for recovery; see the
[release runbook](cloudflare-release-runbook.md) for emergency rollback and reconciliation.

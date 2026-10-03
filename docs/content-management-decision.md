# Content management decision

> Status: accepted. Last reconciled: 2026-10-03.

## Decision

SNIE Portal uses Direct Git. GitHub holds reviewed content and code; Cloudflare
Pages publishes the static export from `main`. No CMS, database, translation
service, custom authentication or always-on backend is required.

Interface copy lives in `src/i18n/dictionaries/`. Shared content and provenance
live in `src/content/`: `recent-records.json` plus `activity-records.mjs` define
the existing dated reports, while gallery, history, presentation, school-image,
portfolio and derivative manifests govern their curated content. The older
`media-review.json` selector remains relevant to its legacy-media component;
it does not describe the entire current rendered photo collection.

This workflow fits the current small source-backed set without another account,
permission model or recovery service. Git history and Cloudflare deployments
provide reviewable preview, rollback and recovery.

## Ordinary change

1. Create a feature branch from `develop`.
2. Update equivalent locale copy and shared facts in their actual source files. Omit unsupported facts. For dated records follow [activity-records.md](activity-records.md), including the publication decision, source checks and stable-ID rule.
3. Run lint, content/operations/archive/media/image tests, build and `check:mvp` as listed in the [README](../README.md#verification).
4. Open a draft PR to `develop`; obtain independent review and verify exact-head GitHub CI and Cloudflare preview. UI changes need relevant browser checks.
5. Squash the feature PR only after its gates pass. Release `develop` to `main` with a normal merge commit, then verify the final deployment SHA and public smoke.

When local execution is unavailable, disclose the skipped check and require its
actual equivalent on the exact hosted candidate. A pending, failed or never-run
build cannot be called a pass. Drafts remain on branches/draft PRs; previews are
not production.

## Safety and validation

The activity model fails static publication on malformed dates, contradictory
state, missing provenance, unsupported source destinations, draft entries and
incomplete locale content. The current route set is derived from the validated
records: 45 localized routes. `check:mvp` and production smoke cover metadata,
canonical/alternate/social URLs, content, source and internal links, generated
artifacts, static errors and placeholders. Image tests preserve originals,
verify responsive variants and retain source/hash associations.

Public source availability, archive-index success and translated copy are not
publication authority. New content/media needs an appropriate recorded decision;
current organization/contact facts need current evidence. Every committed file
may be public through GitHub regardless of directory; keep private source bodies
and credentials out of the repository.

Prefer a reviewed revert/release to restore known-good content. Emergency
Cloudflare rollback must be followed by Git reconciliation; see the [release
runbook](cloudflare-release-runbook.md).

## Reconsideration trigger

Revisit the workflow only for a demonstrated recurring problem, such as sustained
publication volume or confirmed editors unable to use GitHub. Preserve readable
content, static deployment where suitable, review, validation and recovery.

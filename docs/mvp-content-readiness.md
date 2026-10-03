# Content readiness and limits

> Current record reconciled 2026-10-03. The original [#19](https://github.com/nurockplayer/snie-portal/issues/19) launch record dates to 2026-08-20; its empty states and GitHub Issues inquiry substitute are historical, not current site behavior.

## Published content

The public site uses Japanese by default and maintains equivalent English,
Traditional Chinese and Korean routes. There are eight top-level pages in each locale
(Home, About, Activities, News, Join, Contact, Privacy and History), plus seven
activity-report detail pages per locale: 60 localized routes.

- The homepage preserves the approved photo-led Canva narrative: four club/university pairings, eight event-image associations, language-school exchange examples, the historical anonymous chair Q&A and 13 portfolio images
- Activities preserves 80 gallery entries with source context and original-image links; the gallery is not a claim of 80 independently dated events
- News and homepage teasers show seven source-backed 2025 activity reports. Each has a stable localized detail URL, a visible past-activity notice and separate activity/source-publication dates
- History presents text from 22 recovered baseline HTML sources and two 2009/2010 newsletter PDFs
- Selected original image bytes and attribution remain intact; local responsive variants reduce delivery size without replacing the originals
- Contact shows the two handles printed in the historical source, with copy/fallback controls and a source link. It no longer directs visitors to GitHub Issues as the SNIE inquiry route
- Privacy describes observable portal behavior and known limitations; no independent legal review, individual photo consent or license clearance is claimed

The publishing decision for the former public SNIE content/photos applies to
this repository and website. It is not proof of individual consent, ownership
or a particular license. The [editorial migration record](editorial-content-migration.md)
documents source pairings and limits; [activity-records.md](activity-records.md)
documents the existing dated-report entry set and authoring gate.

## Unresolved facts and coverage

Historical affiliations, participation wording, officers and source handles
are not automatically current. The 2024-style handles' current operation and
organization control remain unverified. There is no approved current private
inquiry, application or photo-removal destination or response operator on the
site. Do not invent a form, email address, current officer, fee, deadline,
capacity or upcoming event to fill that gap.

The readable historical baseline contains 22 HTML sources and two PDFs captured
on 2026-08-23. Nineteen later page-version bodies were unavailable to the website
implementation; this is not an exhaustive reconstruction of every revision.
The metadata-only Wayback reconciliation located an exact timestamp for the
third known historical Canva image. Empty results for other declared exact URLs
do not prove no archive captures exist, and no replay content was fetched.

## Maintenance and validation

Update interface dictionaries and shared structured content in one reviewed
feature PR. Draft, invalid or unsupported activity records fail the static
build. All published critical facts and source links stay coherent across
`ja`, `en`, `zh-TW` and `ko`; source-publication dates are not reset on a website release.

Run the commands in the [README](../README.md#verification), obtain independent
review, inspect the exact preview, release `develop` to `main`, and verify the
final production SHA. Route, content, metadata, image/hash, locale and source-link
checks cover the current site. Browser evidence has desktop and zoom-based
narrow coverage; it is not a physical-mobile-device claim or a new Core Web Vitals measurement.

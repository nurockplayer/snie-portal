# Content governance

> Status: active
> Last updated: 2026-08-20

The production workflow is defined in
[`content-management-decision.md`](content-management-decision.md). GitHub is
the source of truth; published copy is maintained directly in the three locale
dictionaries.

## Publication rules

- Publish only SNIE-specific claims supported by repository evidence or a
  documented public source. Omit facts that cannot be established.
- Japanese, English, and Traditional Chinese public routes stay complete and
  coherent. Keep the same dictionary structure and critical facts, dates, and
  URLs across locales.
- Activities and News may use an honest localized empty state when no sourced
  item is available. Do not add fictional entries or placeholder promises.
- Draft or unverified text stays on a branch or draft pull request and must not
  be merged into the production dictionaries.
- Public contact paths must state when the destination or conversation is
  external, public, or account-gated. Do not request sensitive information in
  a public channel.
- AI may help draft or translate text, but it is not a source for organization
  facts. The final repository content must meet the same evidence and locale
  consistency rules regardless of who wrote it.

## Media rules

- Preserve source URL and capture provenance for legacy media.
- The generated media inventory is not a publication approval. Only entries
  explicitly selected in `src/content/media-review.json` and accepted by the
  publication selector may render.
- Use meaningful localized alt text and a visible source link for every
  published legacy image.
- Do not assert ownership, consent, attribution, dates, identities, or event
  details that the available source does not establish.
- Remove or gate an image when its source disappears or a credible removal
  request is received. The public request route is documented on the Contact
  and Privacy pages.

## Review and recovery

Every content pull request targets `develop`, receives a Cloudflare preview,
and runs the repository checks. Production is released only from `main`.
Previous content is recoverable from Git history, and a bad release can be
reverted or replaced with a known-good deployment.

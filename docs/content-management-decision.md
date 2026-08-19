# Content management decision

> Status: accepted
> Last updated: 2026-08-20

## Decision

SNIE Portal uses a Direct Git workflow. GitHub is the durable source of truth,
and Cloudflare Pages publishes the static export produced from `main`.

Public page copy lives in the three JSON dictionaries under
`src/i18n/dictionaries/`. Reviewed legacy-media selections live in
`src/content/media-review.json`; the generated inventory remains in
`src/content/media-manifest.json`. No CMS, database, translation service,
custom authentication, or always-on backend is part of the production path.

This is the smallest workflow that fits the current site: content volume is
low, all public pages already share one typed structure, and repository checks
cover the production routes. Adding an editor service would introduce another
account, permission model, dependency, and recovery path without solving a
current problem. Git history and Cloudflare deployments already provide
preview, rollback, and recovery.

## Ordinary content change

1. Create a branch from `develop`.
2. Update the same keys in `ja.json`, `en.json`, and `zh-TW.json`. Use only
   facts supported by the repository or a documented public source; omit
   unsupported claims and use an honest empty state when needed.
3. Run `pnpm lint`, `pnpm build`, and `pnpm check:mvp`. Run
   `pnpm test:media` when media inventory or review data changes.
4. Open a pull request to `develop` and check its Cloudflare preview.
5. Squash-merge after the exact head is green. Production changes are released
   by merging `develop` to `main`.

Drafts stay on branches or draft pull requests; they are not stored in the
production dictionaries. A preview deployment is not production. Cloudflare
publishes production only from `main`.

## Safety boundaries

- `pnpm build` fails on type or static-generation errors.
- `pnpm check:mvp` validates all 21 localized routes, required dictionary and
  metadata content, shared critical URLs and participation IDs, internal
  links, generated metadata files, and forbidden placeholder markers.
- The media review file is fail-closed: inventory entries are not visible
  unless their review state explicitly satisfies the publication selector.
- Unsupported or unavailable content is omitted rather than represented by a
  draft marker or invented value.
- Revert the merge commit or redeploy a known-good Git revision to roll back.

## Reconsideration trigger

Revisit this decision only after a concrete recurring problem is demonstrated,
such as sustained content volume that the pull-request workflow cannot support
or a confirmed editor group that cannot use GitHub. Any replacement must keep
GitHub-readable content, static deployment, validation, preview, and rollback.


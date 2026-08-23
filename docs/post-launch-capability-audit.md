# Post-Launch Capability Audit

> Status: audit complete; post-launch roadmap proposed  
> Audited baseline: `main@a7f234553fb3b590fb8cb123ebb66f8e80173a5d`  
> Audit date: 2026-08-23  
> Scope: product capability and architecture; no production application changes

## Executive conclusion

The production-ready pass made the correct infrastructure trade: it delivered a
reliable multilingual static site without a CMS, database, authentication
system, custom backend, or unnecessary operations stack. Those decisions should
remain the default.

The pass did not complete the original product proposition. It converted several
missing human decisions into technically honest fallbacks:

- organization and participation content became a description of what the
  portal can verify;
- Activities and News became permanent-looking empty states;
- private contact, applications, and photo removal became public,
  account-gated GitHub Issues;
- historical preservation became a one-page media inventory and three remote
  image hotlinks;
- privacy/photo policy became a description of observable portal behavior;
- editor, translation, ownership, and review workflows became direct edits to
  three JSON dictionaries.

That was sufficient for launch. It is not the right definition of a mature
official portal. The next work should restore useful public outcomes, not revive
the discarded platform plan.

## Evidence and method

The audit reconciled:

- the fetched remote `main` ref and every commit reachable from it;
- all 21 pre-audit repository Issues, including original bodies recovered from
  GitHub body edit history for the issues later replaced by owner overrides;
- all 27 pull requests, with focused review of the static-launch series,
  production-ready series, and closed-unmerged [PR #15](https://github.com/nurockplayer/snie-portal/pull/15);
- current repository documents, content dictionaries, routes, validators,
  media manifests, CI, and production-smoke configuration;
- the public [legacy Canva source](https://snie.my.canva.site/snie-com), which
  returned HTTP 200 on the audit date and still contains candidate organization,
  affiliation, activity, and social-channel claims that are not established as
  current by the repository; and
- the latest scheduled [production smoke run](https://github.com/nurockplayer/snie-portal/actions/runs/32616811320),
  which succeeded on the audited SHA on 2026-08-23.

The audit did not interview a current SNIE decision maker, inspect private
organization records, or treat public legacy copy as current approval. Those are
human evidence gaps, not engineering gaps.

## Classification legend

| Classification | Meaning in this audit |
|---|---|
| `REJECTED` | Explicitly not selected and still unsupported by a current need. |
| `DEFERRED` | Valid possible capability intentionally moved beyond launch. |
| `SIMPLIFIED` | A smaller launch substitute shipped instead of the original outcome. |
| `SUPERSEDED` | A later decision or implementation replaced the earlier plan. |
| `MISSING` | The outcome is absent from the audited production tree. |
| `CONDITIONAL` | Reconsider only when a stated evidence-based trigger occurs. |
| `HUMAN-DEPENDENT` | Engineering cannot truthfully supply the missing facts, permission, owner, or policy. |
| `WORTH RESTORING NOW` | The user outcome is valuable enough to enter the active post-launch roadmap now. |

Classifications may be combined. For example, private contact was
`SIMPLIFIED` for launch, remains `HUMAN-DEPENDENT`, and is `WORTH RESTORING NOW`.

## Decision archaeology

### 1. The original plan was content- and continuity-heavy

The 2026-07-14 planning baseline prioritized historical preservation, verified
organization content, real Activities and News, external forms, multilingual
review, and an annually transferable publishing workflow. The original
[governance document](https://github.com/nurockplayer/snie-portal/blob/f84580567dd3702ecbaa8474077aa25bc7208f82/docs/content-governance.md)
defined named responsibilities, translation states, event archiving, photo
consent/removal, and annual content review. The original
[roadmap](https://github.com/nurockplayer/snie-portal/blob/f84580567dd3702ecbaa8474077aa25bc7208f82/docs/mvp-roadmap.md)
put archive capture beside the MVP and a Markdown event/news workflow before
production.

The plan was over-specified in two places: it made the publishing workflow a
launch dependency, and it assumed a non-developer editor/CMS need before any
editing cadence or editor group existed.

### 2. Static-first correctly removed the false launch dependency

[Issue #16](https://github.com/nurockplayer/snie-portal/issues/16) and
[PR #27](https://github.com/nurockplayer/snie-portal/pull/27) separated the
public static MVP from post-launch publishing work. This was the pivotal correct
decision: deployability no longer depended on CMS research, translation
automation, handover exercises, or a custom content platform.

[PR #30](https://github.com/nurockplayer/snie-portal/pull/30) then implemented
all seven top-level areas in three locales, using honest empty states wherever
facts or destinations were still human-gated.

### 3. The production-ready pass changed “required outcome” into “coherent fallback”

The original [Issue #19](https://github.com/nurockplayer/snie-portal/issues/19)
required approved organization copy, participation details, verified contact
and application destinations, a reviewed privacy/photo notice, and identifiable
locale reviewers. Its later owner override removed human approval as a release
gate. [PR #40](https://github.com/nurockplayer/snie-portal/pull/40) therefore
published only the organization expansion, conservative participation labels,
empty Activities/News, public GitHub Issues, and portal-observable privacy copy.

The original [Issue #22](https://github.com/nurockplayer/snie-portal/issues/22)
required source confirmation, raw capture, checksums, rights/consent review, and
curated history/events/news. Its override allowed a narrow current-value
migration. [PR #39](https://github.com/nurockplayer/snie-portal/pull/39) delivered
a 35-asset manifest and published three remote photos with provenance but
truthful `unknown-public-source` consent and ownership metadata.

### 4. Direct Git superseded the proposed editor platform

Closed-unmerged [PR #15](https://github.com/nurockplayer/snie-portal/pull/15)
was a 659-line provisional CMS comparison. It favored a Pages CMS spike, then
Keystatic, Decap, and Direct Git fallbacks. It also retained editor onboarding,
annual handover, structured publication states, media recovery, and
Japanese-canonical translation gates.

[PR #41](https://github.com/nurockplayer/snie-portal/pull/41) superseded it with
the accepted Direct Git decision and closed #12, #13, #23, and #24 as not
planned. This correctly rejected a speculative CMS and provider-backed
translation system. It also removed the earlier structured event/news model and
content-ownership controls before any real content was available to exercise
them.

### 5. Operations and technical UX were completed well

[PR #45](https://github.com/nurockplayer/snie-portal/pull/45) added daily and
manual public smoke checks without tracking or a monitoring vendor.
[PR #47](https://github.com/nurockplayer/snie-portal/pull/47) fixed responsive,
touch-target, heading, workflow-action, and stale release-record defects.
[PR #48](https://github.com/nurockplayer/snie-portal/pull/48) released the final
audit to `main` as the audited merge commit.

## Capability audit

| Area | Launch outcome | Classification | Post-launch judgment |
|---|---|---|---|
| Organization identity and public content | Only the expanded name and conservative portal description are asserted; mission, scope, history, affiliations, people, partners, and current channels are omitted. | `SIMPLIFIED` · `MISSING` · `HUMAN-DEPENDENT` · `WORTH RESTORING NOW` | Restore a small owner-approved information baseline through [#49](https://github.com/nurockplayer/snie-portal/issues/49). Keep the rule that unsupported claims are omitted. |
| Source inventory | The production inventory lists only the legacy Canva page and this repository because they are the only sources currently used. Candidate social accounts and other sources were removed from the working inventory. | `SIMPLIFIED` · `DEFERRED` · `HUMAN-DEPENDENT` · `WORTH RESTORING NOW` | Confirm current/official sources and their owner/date before using them; do not restore placeholder rows as facts. Track in [#49](https://github.com/nurockplayer/snie-portal/issues/49) and [#51](https://github.com/nurockplayer/snie-portal/issues/51). |
| Content governance and continuity | Direct Git rules remain, but named fact/locale/policy owners, annual review, and accountable approval evidence were removed. | `SUPERSEDED` · `SIMPLIFIED` · `HUMAN-DEPENDENT` · `WORTH RESTORING NOW` | Restore only a role-based owner and backup, source/verification evidence, and an explicit next review date in #49. Do not restore an editor study, handover exercise, approval ceremony, or ownership bureaucracy. |
| Raw historical preservation | No raw HTML, screenshot, WARC, attachment package, or checksum-verifiable archive exists in the tree. The public source remains externally hosted. | `MISSING` · `DEFERRED` · `WORTH RESTORING NOW` | Make one bounded, rights-aware capture now while the source is reachable. Keep raw material separate from production via [#51](https://github.com/nurockplayer/snie-portal/issues/51). |
| Standalone curated historical archive | Three undated photos are shown on Home; organization history, event records, text, and a browsable archive are absent. | `SIMPLIFIED` · `DEFERRED` · `HUMAN-DEPENDENT` · `CONDITIONAL` | Keep a curated or exhaustive browsable public archive outside the active roadmap. #51 covers bounded preservation and rights disposition, not publication permission. If either #49 or #51 produces an owner-approved, dated, source-backed past activity/event or news/announcement record actually suitable for the Activities or News collection, #52 may publish that individual record; this does not create an archive product. |
| Activities and Events | The route is an honest empty state. There are no event records, dates, lists, detail pages, registration links, or past/upcoming separation. | `SIMPLIFIED` · `MISSING` · `WORTH RESTORING NOW` | Enter #52 only when #49 or #51 produces at least one owner-approved, dated, source-backed activity/event record or news/announcement record actually suitable for publication in Activities or News. Publish only record types actually available and retain the other empty state. |
| News | The route is an honest empty state. No articles, detail routes, teasers, dates, or archive exist. | `SIMPLIFIED` · `MISSING` · `WORTH RESTORING NOW` | Enter #52 only when #49 or #51 produces at least one owner-approved, dated, source-backed activity/event record or news/announcement record actually suitable for publication in Activities or News. Publish only record types actually available and retain the other empty state. |
| Structured publishing model | Current validation is strong for the fixed seven-page/three-locale surface, shared GitHub Issue URL, and selected media. It has no event/news entity model; the sitemap and smoke assumptions are fixed to 21 localized routes. | `SUPERSEDED` · `SIMPLIFIED` · `CONDITIONAL` | Do not revive the original generalized schema, and do not prebuild schema, routes, detail pages, or platform work before #52's collection-specific entry condition is met. Then add only fields exercised by real approved records and make route validation additive. |
| CMS / visual editor | Pages CMS research and spike chain were closed; Direct Git plus PR previews is production. | `REJECTED` · `SUPERSEDED` · `CONDITIONAL` | Keep rejected now. Reconsider only after sustained content cadence demonstrates recurring PR friction or a confirmed editor group cannot use GitHub. Git-readable content, preview, validation, and rollback remain non-negotiable. |
| Translation workflow | All three dictionaries are edited together. There is no source revision, reviewer record, missing/generated/reviewed/stale state, or provider automation. | `SIMPLIFIED` · `SUPERSEDED` · `CONDITIONAL` | Keep manual translation at current volume. Reconsider lightweight stale detection or generation only after real editorial cadence makes triple editing a measured cost. Do not add a visitor translation widget. |
| Contact and participation forms | Join, Contact, and Privacy point to public GitHub Issues, require an account, and warn visitors not to post sensitive data. No verified application, email, private inquiry, or social route exists. | `SIMPLIFIED` · `MISSING` · `HUMAN-DEPENDENT` · `WORTH RESTORING NOW` | Provide an organization-controlled private email or hosted form through [#50](https://github.com/nurockplayer/snie-portal/issues/50). Prefer an external handoff over a custom backend. |
| Privacy and photo-removal policy | The page accurately describes the static portal and third parties, but it is not an organization policy. Removal is public/account-gated; no private route, policy owner, consent model, or response expectation is published. | `SIMPLIFIED` · `HUMAN-DEPENDENT` · `WORTH RESTORING NOW` | Approve a minimal real policy and private route in #50. Do not claim legal review or invent a response deadline. |
| Media provenance, rights, and hosting | Provenance, localized alt text, source links, deterministic inventory, and graceful failure are good. The three public photos still have unknown consent/ownership and load from the legacy host. | `SIMPLIFIED` · `HUMAN-DEPENDENT` · `WORTH RESTORING NOW` | Preserve these controls, resolve each published asset's disposition, and migrate/remove only with evidence via #51. Do not equate mirroring with permission. |
| Membership and visitor authentication | No member records, login, profiles, or sessions exist. No verified member-only workflow requires them. | `DEFERRED` · `CONDITIONAL` | This was cut correctly. Reconsider only after a documented workflow needs persistent identity or protected member data and external tools cannot satisfy it. |
| Admin dashboard / database | No Supabase, content database, custom admin, or always-on backend exists. | `DEFERRED` · `CONDITIONAL` | This was cut correctly. A database is not the next step for static events/news. Reconsider only after static content or external forms fail a measured requirement. |
| UX and information architecture | Navigation, locale switching, responsive behavior, focus, headings, metadata, and empty states are sound. Product journeys remain thin because the pages mostly explain missing information and route visitors to GitHub. | `SIMPLIFIED` | Do not start a standalone redesign. Restore content and destinations first through #49, #50, and #52, then evaluate UX against real tasks. |
| Analytics | No visitor analytics or CTA measurement is enabled. | `REJECTED` for launch · `CONDITIONAL` post-launch | Keep omitted until SNIE names a decision that traffic/CTA data will change and accepts a privacy notice. Prefer aggregate, low-burden measurement; never add advertising or visitor profiling. |
| Operations | CI, static builds, media tests, daily/manual smoke, Git rollback, and Cloudflare deployment history exist. The original analytics, notification ownership, configuration inventory, and restore drill were reduced. | `SIMPLIFIED` · `CONDITIONAL` | Keep the current layer. Add external-link checks and ownership/recovery details only as #50/#51 introduce organization-controlled dependencies. No monitoring vendor is justified now. |
| Search, tags, pagination, custom domain | None is implemented; the current public surface has seven top-level pages per locale and no content collection. | `DEFERRED` · `CONDITIONAL` | Reconsider search/tags/pagination after content exceeds a navigable single list (the IA suggests roughly 20 pages). Reconsider a custom domain only when an organization-owned domain and DNS owner are confirmed. |

## Decisions to preserve

The following are durable architecture principles, not merely MVP shortcuts:

1. Keep the public site statically generated on Cloudflare Pages until a proven
   runtime requirement exists.
2. Keep GitHub-readable content, pull-request review, preview, build-time
   validation, and Git/Cloudflare rollback even if an editor UI is added later.
3. Omit unsupported SNIE claims instead of inventing or laundering them through
   translation.
4. Keep the three public locales coherent and keep critical facts/URLs shared or
   cross-validated.
5. Prefer verified external forms/email over a custom registration/contact
   backend.
6. Keep raw historical captures separate from curated public content.
7. Keep media provenance, explicit publication selection, localized accessible
   text, and graceful remote failure.
8. Keep operations proportional to a static site and avoid invasive analytics,
   a monitoring vendor, or redundant backup infrastructure.

Direct Git is the correct current interface, not an eternal ban on editor tools.
Its reconsideration trigger is measured editor friction, not the existence of an
old CMS issue.

## Work worth restoring now

The audit created four non-duplicative Issues. They restore outcomes that the
launch fallback could not supply, while preserving the successful architecture:

1. [#49 — establish and publish an owner-approved SNIE information baseline](https://github.com/nurockplayer/snie-portal/issues/49)
2. [#50 — provide a private contact and photo-removal route](https://github.com/nurockplayer/snie-portal/issues/50)
3. [#51 — preserve the legacy source and resolve published-media rights](https://github.com/nurockplayer/snie-portal/issues/51)
4. [#52 — publish source-backed activities and news with a minimal static model](https://github.com/nurockplayer/snie-portal/issues/52)

These do not reopen the launch acceptance criteria of #19, #22, or #23. They
target residual product outcomes under the current architecture. #52 is a
conditional implementation track: it does not start until either #49 or #51
produces at least one owner-approved, dated, source-backed activity/event record
or news/announcement record that is actually suitable for publication in the
Activities or News collection.

## Still not worth building

| Capability | Do not build until |
|---|---|
| CMS / visual editor | Real publishing cadence produces recurring errors/delay, or confirmed editors cannot use GitHub after concise onboarding. |
| Translation provider/automation | Source-content volume makes manual three-locale updates a measured maintenance burden. |
| Membership/login/profiles | SNIE supplies a verified member lifecycle and protected member-only use case. |
| Supabase/custom admin | A proven relational or dynamic workflow cannot be handled by static content and external forms. |
| Custom form backend/file upload | An organization-controlled email/hosted form cannot meet a documented privacy or workflow requirement. |
| Site search/tags/pagination | The published collection is too large for a simple list/archive. |
| Visitor analytics | A named product decision needs defined aggregate metrics and the privacy owner accepts the collection/retention policy. |
| Monitoring vendor/full backup stack | Native GitHub/Cloudflare checks and history fail a demonstrated recovery or alerting need. |
| Standalone curated/exhaustive browsable public archive or social scraping | A bounded source list, rights basis, personal-data policy, storage owner, and concrete public use justify it. This is not in the active roadmap. |
| Custom domain | SNIE confirms an organization-owned domain, DNS owner, renewal path, and canonical migration plan. |

## First-month priority

### Week 1: unlock human truth and preserve the at-risk source

- For #49, confirm the approved identity, mission/scope, participation paths,
  and current official channels while recording only a role-based owner and
  backup, source/verification evidence, and an explicit next review date.
- Start #51 immediately and capture the bounded legacy page before its external
  host changes. Preservation can proceed without treating its claims as current
  or its capture as publication permission.

### Week 2: replace the harmful fallback

- Select and verify the private organization-controlled destination for #50.
- Approve the minimum data/photo notice and a realistic removal route.
- Keep the public GitHub Issue route only for portal feedback.

### Weeks 3–4: publish useful public content

- Publish the approved About/participation/source updates from #49.
- Resolve the three existing public photos under #51.
- Begin #52 only if #49 or #51 produces at least one owner-approved, dated,
  source-backed activity/event record or news/announcement record actually
  suitable for publication in Activities or News; either source is sufficient.
  About/mission/participation/channel records, photos, undated anecdotes, and
  provenance-only archive items do not qualify. Do not prebuild schema, routes,
  detail pages, or platform work, and keep any section without a qualifying
  record in its honest empty state.

The month succeeds even if #52 remains gated: verified current facts, a private
contact/removal route, and a recoverable historical capture are higher value than
shipping a content schema with no content.

## Three-to-six-month roadmap

### Months 2–3: establish a real publishing cadence

- If #52's entry condition is met, publish a small set of real activity/news
  records through its minimal static model.
- Review the authoring time, translation effort, validation failures, and
  correction turnaround after each release.
- If #49 or #51 supports individual owner-approved, dated, source-backed past
  activity/event or news/announcement records suitable for Activities or News,
  publish only those records through #52. Do not build a standalone
  curated/exhaustive browsable public archive or perform a bulk public dump.
- Add external-destination smoke checks after #50 introduces stable forms/email.

### Months 3–4: evaluate workflow triggers from evidence

- Keep Direct Git if the real cadence remains low and reliable.
- If editors are blocked by GitHub, run one reversible Git-backed editor spike
  against the actual #52 model. Do not reuse PR #15's dated vendor ranking
  without refreshing official evidence.
- If three-locale updates repeatedly drift or delay publication, add the
  smallest repository-readable stale-detection/generation aid; retain review of
  critical facts.

### Months 4–6: add only capabilities earned by scale

- Consider aggregate privacy-conscious analytics only after defining the
  decisions and metrics it will support.
- Add search, tags, or pagination only when the published collection crosses the
  navigation threshold.
- Consider an organization-owned custom domain after ownership and renewal are
  durable.
- Keep membership/auth/admin/database work outside the roadmap unless a verified
  member workflow emerges.

## Audited references

- Audited `main`: [`a7f234553fb3b590fb8cb123ebb66f8e80173a5d`](https://github.com/nurockplayer/snie-portal/commit/a7f234553fb3b590fb8cb123ebb66f8e80173a5d)
- Original planning baseline: [`f84580567dd3702ecbaa8474077aa25bc7208f82`](https://github.com/nurockplayer/snie-portal/commit/f84580567dd3702ecbaa8474077aa25bc7208f82)
- Static-first decision: [#16](https://github.com/nurockplayer/snie-portal/issues/16), [PR #27](https://github.com/nurockplayer/snie-portal/pull/27)
- Minimal content and fallbacks: [#19](https://github.com/nurockplayer/snie-portal/issues/19), [PR #40](https://github.com/nurockplayer/snie-portal/pull/40)
- Legacy-media scope: [#22](https://github.com/nurockplayer/snie-portal/issues/22), [#38](https://github.com/nurockplayer/snie-portal/issues/38), [PR #39](https://github.com/nurockplayer/snie-portal/pull/39)
- Superseded CMS research: [PR #15](https://github.com/nurockplayer/snie-portal/pull/15)
- Direct Git decision: [PR #41](https://github.com/nurockplayer/snie-portal/pull/41)
- Lightweight operations: [PR #45](https://github.com/nurockplayer/snie-portal/pull/45)
- Final production audit/release: [PR #47](https://github.com/nurockplayer/snie-portal/pull/47), [PR #48](https://github.com/nurockplayer/snie-portal/pull/48)

# Content Management Decision — SNIE Portal

> **Status**: Draft — provisional research recommendation only  
> **Last updated**: 2026-07-14  
> **Purpose**: Evaluate content-management approaches for SNIE Portal and define the evidence and decision gates required before any CMS adoption.  
> **Source**: AI-generated draft — review required before publication

---

## 1. Decision Status

This ADR does **not** select or implement a production CMS.

The current MVP roadmap defines Phase 3 as a Markdown-based publishing pipeline with GitHub pull-request review and explicitly places WYSIWYG editors, CMS integration, and admin dashboards outside that phase. Therefore:

- **Current implementation baseline**: Direct GitHub workflow with Markdown files and pull requests.
- **Provisional research recommendation**: Run a limited Pages CMS spike first if SNIE decides to evaluate a friendlier editor.
- **Fallback evaluation order**: Keystatic, then Decap CMS, then remain on Direct Git.
- **Deferred option**: A custom Supabase admin application.
- **Excluded as canonical public-content storage**: Notion and Google Forms/Sheets.

Changing the Phase 3 implementation baseline requires a separate approved issue or an explicit roadmap amendment. This document alone does not authorize that change.

---

## 2. Decision Context

SNIE Portal needs a publishing workflow that:

- can be handed over to new student officers each year;
- keeps Japanese as the canonical source language;
- produces English and Traditional Chinese as reviewed translations of Japanese;
- keeps public content durable and recoverable through GitHub;
- supports factual review, translation status, and photo-consent checks before publication;
- works with a static public site on Cloudflare Pages where practical;
- avoids a custom backend until there is demonstrated need and long-term developer capacity;
- preserves media provenance and keeps raw archives separate from curated website content.

The options were evaluated against the repository's:

- [information architecture](information-architecture.md),
- [content governance](content-governance.md),
- [archive strategy](archive-strategy.md),
- [design system](design-system.md), and
- [MVP roadmap](mvp-roadmap.md).

---

## 3. Evidence Model

This ADR deliberately separates three kinds of statements.

### Verified facts

A statement directly supported by current official product documentation, an official repository/release page, or an existing SNIE repository document.

### Implementation inferences

A conclusion about likely SNIE impact derived from verified facts. An inference is not treated as proven until a repository-backed spike validates it.

### Unresolved questions

A question that documentation alone cannot answer reliably, including actual editor usability, exact branch-protection behavior, deployment compatibility, account handover, or operating cost.

Official sources were checked on 2026-07-14. Version numbers, prices, quotas, and maintenance signals must be rechecked at spike time.

---

## 4. Evaluation Criteria

| Criterion | Question |
|---|---|
| Editor usability | Can a non-developer student officer create and update content without Git CLI knowledge? |
| Annual handover | Can ownership, credentials, and procedures be transferred in one documented handover session? |
| Git ownership | Are canonical content and media stored as durable files in GitHub? |
| Authentication | Who needs GitHub access, and what external identity or secret lifecycle is introduced? |
| Review safety | Can protected branches and pull-request review remain mandatory? |
| Structured content | Can required frontmatter and content schemas be enforced? |
| Japanese-canonical fit | Can Japanese remain authoritative while translations are generated and reviewed separately? |
| Media handling | Where are files stored, how are paths controlled, and can consent/provenance checks happen before publication? |
| Preview and rollback | Can editors preview proposed changes and recover from mistakes through Git history? |
| Cloudflare fit | Can the public static site remain on Pages, and where must any dynamic editor/auth service run? |
| Operational burden | What databases, OAuth applications, secrets, services, backups, and maintenance are required? |
| Maintenance risk | Is the project currently maintained, and how concentrated is maintenance? |
| Cost | What verified free-tier or paid limits affect SNIE? |
| Failure recovery | What remains recoverable if the editor service disappears or an account is lost? |

---

## 5. Candidate Evaluation

### 5.1 Direct GitHub Workflow

Markdown/YAML files are edited through a local Git workflow, GitHub's web editor, or `github.dev`, then reviewed through a pull request.

| Factor | Assessment |
|---|---|
| Editor usability | Low for first-time editors. GitHub's web editor reduces CLI requirements but does not remove branch, commit, and pull-request concepts. |
| Annual handover | Medium to high. A concise operating guide and practice PR are required each year. |
| Git ownership | Full. Content and repository-managed media remain in Git history. |
| Authentication | GitHub accounts with repository permissions only; no CMS-specific identity store. |
| Review safety | Strong. The repository's existing PR and CI workflow remains the publishing gate. |
| Structured content | Strong once Phase 3 adds frontmatter validation. |
| Japanese-canonical fit | Strong. Locale files and translation status can follow `content-governance.md` directly. |
| Media handling | Files can live in reviewed repository paths, but editors receive no dedicated media library or automatic optimization. Large binary growth needs a documented policy. |
| Preview and rollback | Strong when branch preview deployments are configured; rollback uses Git history. |
| Cloudflare fit | Strong for the static public site. No dynamic CMS runtime is introduced. |
| Operational burden | Lowest external-service burden, but highest training burden. |
| Maintenance risk | No third-party CMS dependency. The workflow depends on GitHub and project documentation. |
| Cost | No additional CMS service cost. Repository and deployment limits still apply. |
| Failure recovery | Strong. A repository clone contains canonical content and repository-managed media. |

#### Verified facts

- The repository roadmap already defines Phase 3 as Markdown files plus pull requests.
- The repository requires feature branches from `develop`, pull requests targeting `develop`, and squash merging.
- Japanese is the primary content language; English and Traditional Chinese are reviewed translations.
- Events and news require factual review, translation-status checks, and photo-consent review.

#### Implementation inferences

- Direct Git is the safest operational baseline because it adds no new CMS runtime, database, collaborator store, or OAuth application.
- Editor convenience is its principal weakness and may become a bottleneck during active event periods.

#### Unresolved questions

- Can a new non-developer officer publish a test article after one handover session?
- What repository media-size policy is acceptable for event photographs?
- Which Cloudflare preview workflow will be used for content pull requests?

#### SNIE fit

**Keep as the implementation baseline and final fallback.** It already matches the approved roadmap and governance model.

---

### 5.2 Pages CMS

Pages CMS is an open-source editing layer for static sites stored in GitHub. It edits repository files and media through a web UI.

| Factor | Assessment |
|---|---|
| Editor usability | Promising. The hosted application exposes structured content and media editing without requiring Git CLI use. |
| Annual handover | Potentially low for editors, but organization-owned GitHub App, admin access, collaborator export, and recovery procedures must be documented. |
| Git ownership | Strong for content and repository media. Pages CMS documentation states that content is edited directly in GitHub rather than stored in a separate content database. |
| Authentication | GitHub App for repository access and sign-in. Email-invited collaborators can edit without GitHub accounts; their records live in the Pages CMS database. |
| Review safety | Unproven for SNIE. Pages CMS commits repository changes, but current documentation does not establish a complete draft-review-approve workflow equivalent to mandatory PR review. |
| Structured content | Strong. `.pages.yml` defines content schemas, operations, editors, media, and commit settings. |
| Japanese-canonical fit | Likely strong if only Japanese fields are authorable and translated files are generated by a separate controlled workflow. This needs a schema spike. |
| Media handling | Strong repository-media support: image, file, and rich-text uploads; controlled input/output paths; extensions, categories, renaming, and per-media actions. |
| Preview and rollback | Git rollback remains available. Preview and PR behavior depend on the branch/deployment design and require a spike. |
| Cloudflare fit | The hosted editor is separate from the public site. Self-hosting is a dynamic Next.js application requiring PostgreSQL, migrations, secrets, a GitHub App, and a stable HTTPS endpoint. Cloudflare directs full-stack Next.js applications to Workers rather than static Pages. |
| Operational burden | Low if the hosted service proves acceptable; medium to high if self-hosted. Self-hosting is not database-free. |
| Maintenance risk | Current official release is 2.1.8, released 2026-06-08. The repository is principally maintained by one visible owner, creating a maintenance-concentration risk, but canonical content remains in Git. |
| Cost | The hosted path is available, but this ADR did not find an official service-level or long-term pricing guarantee. Self-hosting adds database and runtime costs even when free tiers are used. |
| Failure recovery | Content and repository media survive service loss. Email collaborator records do not; they require separate export/import. |

#### Verified facts

- Pages CMS edits content files in GitHub and uses `.pages.yml` for configuration.
- Media configuration supports repository paths, multiple media sources, file-type restrictions, rename policies, and action workflows.
- Email collaborators can edit content and media without GitHub accounts.
- Collaborator records live in the CMS database and must be migrated separately.
- Self-hosting requires PostgreSQL, environment secrets, database migrations, a GitHub App, a Node build/start process, and HTTPS.
- The GitHub App is used for repository access, sign-in, webhooks, and installation-scoped operations.
- Release 2.1.8 is marked latest on the official repository release page.

#### Implementation inferences

- Pages CMS currently offers the best apparent balance of editor friendliness and Git-backed content ownership.
- Its main SNIE risk is not data lock-in but operational and review-workflow uncertainty.
- Hosted Pages CMS may be much easier to hand over than self-hosting, provided SNIE accepts the external service and can transfer app ownership safely.
- A self-hosted deployment would be a materially larger operational commitment than the original roadmap's Direct Git workflow.

#### Unresolved questions

- Can all writes be forced onto a `cms/` branch and then merged only through SNIE's required PR review?
- Can branch protection prevent collaborators or the GitHub App from writing directly to `develop` and `main`?
- Does the hosted service provide acceptable organization ownership, admin recovery, availability, and pricing for SNIE?
- Can an organization-owned GitHub App and collaborator list be handed over without relying on one student's personal account?
- If self-hosted, does Pages CMS work correctly on Cloudflare Workers through the current OpenNext adapter, or does it require another Node host?
- Can the schema expose only Japanese canonical fields while preventing generated translations from being overwritten accidentally?
- How do media actions fit the consent, provenance, optimization, and deletion requirements?
- Is scheduling required, and if so, where should it be implemented? Current official documentation reviewed here does not establish a scheduling workflow.

#### SNIE fit

**Provisional first spike candidate only.** Do not adopt until every decision gate in Section 8 passes.

---

### 5.3 Keystatic

Keystatic embeds a typed content-management UI into a Next.js, Astro, or Remix application and stores content as files.

| Factor | Assessment |
|---|---|
| Editor usability | Promising structured editor, but the editor is coupled to application integration and configuration. |
| Annual handover | Medium. GitHub mode requires repository write access and a custom GitHub App; Keystatic Cloud can simplify auth and allow non-GitHub editors. |
| Git ownership | Strong. Local and GitHub modes save content and files into the repository. |
| Authentication | GitHub mode requires collaborators to have repository write access. Keystatic Cloud can remove that requirement for editors. |
| Review safety | Better primitives than a direct-commit-only editor: GitHub mode exposes branches and supports a branch prefix. A complete approval/publish policy still remains external to the editor. |
| Structured content | Strong TypeScript schema through collections, singletons, and typed fields. |
| Japanese-canonical fit | Likely strong through separate collections or file paths, but there is no verified SNIE-specific translation workflow. |
| Media handling | Repository-backed file and image fields support configured directories and public paths. Keystatic Cloud offers optional Cloud Images; that moves media outside Git and is a paid-plan feature. |
| Preview and rollback | Official documentation provides a Next.js Draft Mode recipe for branch previews. Git rollback remains available. |
| Cloudflare fit | GitHub mode documentation says the host must run Node.js for Keystatic API routes. Compatibility with Cloudflare Workers/OpenNext must be tested. |
| Operational burden | Medium. Embedded routes, GitHub App secrets, framework integration, and possible Cloud service management add moving parts. |
| Maintenance risk | Official documentation and repository are available and current as of this review. This ADR does not infer future support from issue counts or star counts. Maintenance cadence must be rechecked at spike time. |
| Cost | Keystatic Cloud free plan supports up to three users per team. Pro starts at USD 10/month, with additional users beyond three at USD 5/month each. |
| Failure recovery | Repository content and repository media remain recoverable. Cloud Images and Cloud-managed identity introduce service dependencies. |

#### Verified facts

- GitHub mode requires collaborators to have write access to the repository.
- GitHub mode uses a custom GitHub App, environment secrets, a branch dropdown, and optional `branchPrefix`.
- Deployment in GitHub mode requires a host capable of running Node.js API routes.
- File and image fields can commit files into configured repository paths.
- The official preview recipe reads content from a selected GitHub branch through Next.js Draft Mode.
- Keystatic Cloud supports editors without GitHub accounts, up to three users per team on the free plan, with documented paid pricing beyond that.

#### Implementation inferences

- Keystatic gives SNIE stronger branch-oriented primitives than Pages CMS documentation currently demonstrates.
- It also creates tighter coupling between the public Next.js codebase and the editor runtime, increasing implementation and upgrade work.
- Keystatic Cloud may reduce auth handover burden but adds a managed-service dependency and potentially non-Git media storage.

#### Unresolved questions

- Does GitHub mode run reliably on the current Cloudflare Workers/OpenNext stack?
- Can the embedded admin UI be deployed separately from the public static site without duplicating too much application code?
- Can editor actions be constrained to prefixed branches and mandatory PR review?
- Is a three-editor limit sufficient for annual handover and backup ownership?
- Would SNIE accept Cloud Images being outside the Git repository?
- What is the current release and maintenance cadence at the time of the spike?

#### SNIE fit

**Second spike candidate.** Evaluate only if Pages CMS fails a decision gate or if branch control is judged more important than lower setup complexity.

---

### 5.4 Decap CMS

Decap CMS is a static React application that wraps Git-provider APIs and can be hosted separately from the public site.

| Factor | Assessment |
|---|---|
| Editor usability | Mature editor UI with rich text, custom fields, previews, and drag-and-drop media. |
| Annual handover | Low for routine editing once configured; medium for auth ownership and troubleshooting. |
| Git ownership | Strong. Content is stored in Git alongside the site. |
| Authentication | The GitHub backend requires users with repository push access and a server-side or supported client-side OAuth flow. Netlify can provide one path, but Decap is not restricted to Netlify. |
| Review safety | Strong. `editorial_workflow` creates a branch and pull request for each draft and supports review and publish states. |
| Structured content | Strong and mature collection/widget configuration. |
| Japanese-canonical fit | Strong primitives. Built-in i18n supports locale folders/files and a default locale, but SNIE must configure Japanese as canonical and prevent unreviewed translations from publishing. |
| Media handling | Built-in repository media library plus Cloudinary and Uploadcare integrations. The GitHub backend does not support Git LFS. |
| Preview and rollback | Deploy-preview status integration and Git rollback are supported. |
| Cloudflare fit | The editor itself is static and can be served independently. GitHub authentication still needs an OAuth implementation. Official docs list community OAuth clients, including a Cloudflare Pages project, but that is not first-party support. |
| Operational burden | Medium. The static UI is simple; auth is the principal operational component. |
| Maintenance risk | Official release 3.14.1 was published 2026-06-15, indicating current release activity. |
| Cost | Core Decap CMS is open source under MIT. OAuth hosting and optional external media services may add cost. |
| Failure recovery | Repository content and repository media remain recoverable; external media requires a separate export/backup plan. |

#### Verified facts

- Decap CMS is platform-agnostic and can be used without Netlify.
- The GitHub backend requires users to have push access and requires authentication infrastructure.
- Editorial Workflow maps draft actions to branches and pull requests and can squash GitHub merges.
- Built-in i18n supports `multiple_folders`, `multiple_files`, or `single_file`, with a configurable default locale.
- The GitHub backend does not support Git LFS.
- Official release 3.14.1 is marked latest on the repository release page.
- Official docs list community-maintained external OAuth clients, including one targeting Cloudflare Pages.

#### Implementation inferences

- Decap has the clearest verified editorial workflow of the evaluated web editors.
- Its Cloudflare problem is narrower than "Decap cannot run on Cloudflare": the static editor is straightforward, while the OAuth bridge and its long-term ownership are the risk.
- A community OAuth project may reduce initial work but would add another dependency that student officers must understand and maintain.

#### Unresolved questions

- Can SNIE own and maintain a minimal OAuth service without a personal account dependency?
- Is the community Cloudflare OAuth implementation secure, current, and compatible with SNIE's GitHub organization setup?
- Can branch protection, required CI, and squash merge remain mandatory when publishing through Editorial Workflow?
- How should large event-photo libraries be handled without Git LFS?
- Can Decap's i18n UI enforce Japanese-canonical generation and human review rather than independent source editing?

#### SNIE fit

**Third spike candidate.** Strong workflow and maturity, but auth ownership must be simpler than it currently appears for SNIE's Cloudflare-first architecture.

---

### 5.5 Notion as Canonical CMS

Notion would hold source content in a workspace and expose it through the Notion API.

| Factor | Assessment |
|---|---|
| Editor usability | Excellent for ordinary editors. |
| Annual handover | Potentially low inside an organization-owned workspace, but integration tokens and page permissions still need handover. |
| Git ownership | Fails the requirement. Notion, not GitHub, would be canonical unless a custom export-and-commit pipeline is added. |
| Authentication | Internal connections, personal access tokens, and OAuth are supported. Team-owned automation should not depend on one member's personal token. |
| Review safety | Workspace permissions and properties can model review, but the GitHub PR gate is no longer native to the source workflow. |
| Structured content | Databases/data sources and page blocks are structured, but conversion into the repository's Markdown/frontmatter contract requires custom code. |
| Japanese-canonical fit | Possible through database properties and conventions, but not automatically aligned with repository translation status. |
| Media handling | Notion manages files and media, but a Git export pipeline must separately copy, name, verify, and preserve media with provenance. |
| Preview and rollback | Notion history is separate from Git history; website previews require a custom sync/build pipeline. |
| Cloudflare fit | API consumption can run in CI or a Worker, but adds remote API availability and secret management to publishing. |
| Operational burden | Medium to high because Git mirroring, media export, webhooks, retries, and reconciliation must be built. |
| Maintenance risk | Vendor-platform dependency rather than open-source maintainer risk. |
| Cost | Workspace and API limits must be reviewed against SNIE's plan at implementation time. |
| Failure recovery | A periodic Git export is only a replica unless the process explicitly promotes Git to canonical storage. |

#### Verified facts

- Notion supports internal connections, personal access tokens, and OAuth 2.0.
- Access is permission-scoped to shared workspace resources.
- The API exposes page content as structured objects and supports webhooks and rate limits.
- The repository requirement says GitHub should remain the durable source of truth.

#### Implementation inferences

- Making Notion canonical would violate the current architecture principle.
- Making Git canonical would require a bidirectional or one-way export pipeline whose operational burden largely cancels the editor simplicity.
- Notion may still be useful as a drafting or submission workspace outside the canonical publishing pipeline.

#### Unresolved questions

- None that change the current recommendation. Reconsider only if SNIE explicitly abandons GitHub as canonical storage.

#### SNIE fit

**Exclude as canonical public-content storage.** It may remain a non-canonical drafting tool.

---

### 5.6 Google Forms / Google Sheets as Canonical Publishing Backend

Google Forms can collect submissions into Sheets, while a custom process would transform rows into website content.

| Factor | Assessment |
|---|---|
| Editor usability | Familiar for form submission and simple tabular data; poor for long-form editorial content. |
| Annual handover | Low for form use, medium for API credentials and custom transformation code. |
| Git ownership | Fails the requirement unless a custom export process commits generated files into Git. |
| Authentication | Google account and API credential management. |
| Review safety | No native Git PR review until exported content is committed by a separate workflow. |
| Structured content | Cells are structured values, but there is no content schema comparable to a CMS collection without custom validation. |
| Japanese-canonical fit | Possible through columns, but cumbersome for long-form content and translation review. |
| Media handling | Forms can collect file references in some configurations, but Sheets is not a media library; provenance, consent, naming, storage, and export would remain custom work. |
| Preview and rollback | Sheet revision history is separate from website preview and Git rollback. |
| Cloudflare fit | A CI job or Worker can call the API, but publication becomes dependent on Google API access and synchronization. |
| Operational burden | Medium to high for a reliable publishing pipeline. |
| Maintenance risk | Vendor-platform dependency; custom integration becomes SNIE's responsibility. |
| Cost | API quotas exist and must be respected. |
| Failure recovery | The Sheet remains a separate source unless exports are consistently committed and verified. |

#### Verified facts

- The Sheets API exposes spreadsheet values and enforces usage quotas.
- Google Drive supports push notifications for resource changes, but a custom integration is still required to reconcile the changed spreadsheet into repository content.
- The SNIE roadmap already prefers Google Forms for registration and contact where sufficient.
- The roadmap does not designate Forms or Sheets as the public content store.

#### Implementation inferences

- Forms and Sheets are appropriate for collecting event registrations, contact requests, or draft submissions.
- They are poorly matched to rich editorial content, media governance, Git review, and Japanese-canonical translation management.

#### Unresolved questions

- None that change the canonical-storage decision.
- A future submission workflow could separately evaluate "Form submission → reviewed Markdown PR" without making Sheets canonical.

#### SNIE fit

**Exclude as canonical public-content storage.** Keep Google Forms for registration/contact and potentially for non-canonical content intake.

---

### 5.7 Supabase with a Custom Admin Application

This option stores content in PostgreSQL and media in object storage, with a custom editor built for SNIE.

| Factor | Assessment |
|---|---|
| Editor usability | Potentially excellent, but only after substantial product and UI work. |
| Annual handover | High. SNIE would own the application, database schema, auth, authorization, backups, and operational documentation. |
| Git ownership | Fails the current requirement. Database rows and storage objects are canonical rather than repository files. |
| Authentication | Supabase Auth and Row Level Security can support roles, but both require design and maintenance. |
| Review safety | Must be designed and implemented, including drafts, approvals, audit history, and publication transitions. |
| Structured content | Excellent relational modeling. |
| Japanese-canonical fit | Can be modeled explicitly, but all workflow rules require custom implementation. |
| Media handling | Supabase Storage provides object storage, but consent, provenance, optimization, retention, and deletion workflows remain custom. |
| Preview and rollback | Requires custom content versioning and preview support. |
| Cloudflare fit | The public site can remain on Cloudflare, but the database and admin backend add an external platform. |
| Operational burden | Highest of all options. |
| Maintenance risk | Platform maintenance is external; application maintenance is entirely SNIE's responsibility. |
| Cost | Current free tier includes 500 MB database, 5 GB egress, 5 GB cached egress, 1 GB file storage, and 50,000 monthly active users. Free projects pause after one week of inactivity and are limited to two active projects. |
| Failure recovery | Requires database and object-storage backup/export procedures; Git history does not contain content revisions. |

#### Verified facts

- The roadmap explicitly defers Supabase, membership systems, admin dashboards, and custom backends until needed after launch.
- Supabase publishes the free-tier limits listed above.
- A custom admin would need SNIE-specific content workflow, permissions, versioning, and media governance.

#### Implementation inferences

- Supabase is technically flexible but solves a future scale/custom-workflow problem that SNIE has not demonstrated.
- The free project's inactivity pause is an additional production-operability concern.
- Building this now would contradict the project's stated priorities and consume substantially more long-term developer capacity.

#### Unresolved questions

- None at the current phase. Revisit only after Git-backed workflows have been used in production and documented failures justify a custom system.

#### SNIE fit

**Intentionally deferred.**

---

## 6. Comparison Matrix

Legend: `Strong`, `Conditional`, `Weak`, `Custom`, or `Not applicable`.

| Criterion | Direct Git | Pages CMS | Keystatic | Decap CMS | Notion | Forms/Sheets | Supabase Admin |
|---|---|---|---|---|---|---|---|
| Non-developer editor | Weak | Strong | Strong | Strong | Strong | Conditional | Custom |
| Git canonical content | Strong | Strong | Strong | Strong | Weak | Weak | Weak |
| Mandatory PR workflow | Strong | Unverified | Conditional | Strong | Custom | Custom | Custom |
| Japanese-canonical fit | Strong | Conditional | Conditional | Conditional | Custom | Weak | Custom |
| Repository media | Manual | Strong | Strong | Strong | Weak | Weak | Not applicable |
| Media outside Git optional | Manual/external | Not primary | Keystatic Cloud | Cloudinary/Uploadcare | Yes | Yes | Yes |
| Preview support | Conditional | Unverified | Strong with integration | Strong | Custom | Custom | Custom |
| Static public site on Pages | Strong | Strong | Strong | Strong | Strong | Strong | Strong |
| Dynamic editor/auth runtime | None | Hosted or self-hosted | Embedded/Cloud | OAuth service | Sync service | Sync service | Full admin/backend |
| Handover burden | Training-heavy | Unverified | Medium | Medium | Low for editing, higher for sync | Low for forms, higher for sync | High |
| Canonical recovery from Git | Strong | Strong except collaborators | Strong except Cloud assets | Strong except external assets | Weak | Weak | Weak |
| Additional operational burden | Low | Low to high | Medium | Medium | Medium to high | Medium to high | High |
| Current recommendation | Baseline/fallback | First spike | Second spike | Third spike | Excluded | Excluded | Deferred |

---

## 7. Provisional Recommendation

### 7.1 Research recommendation: validate Pages CMS first

Pages CMS is the first spike candidate because it combines:

- repository-backed content;
- a web editor intended for non-developers;
- strong repository-media controls;
- email collaborators who do not require GitHub accounts; and
- recoverability of canonical content if the service is discontinued.

This is **not** a production selection. The spike must prove that SNIE can retain mandatory pull-request review, organization-owned access, clean annual handover, Japanese-canonical translation controls, and acceptable Cloudflare deployment or hosted-service boundaries.

### 7.2 Fallback order

If Pages CMS fails any decision gate:

1. **Keystatic** — evaluate its branch controls, typed schemas, and preview integration. Reject it if the embedded Node/runtime or account model is too heavy.
2. **Decap CMS** — evaluate its verified Editorial Workflow and i18n support. Reject it if the OAuth bridge cannot be organization-owned and maintained safely.
3. **Direct Git** — remain on the roadmap's existing Markdown + PR workflow rather than moving prematurely to a custom backend.

### 7.3 Excluded and deferred options

| Option | Decision | Reason |
|---|---|---|
| Notion | Excluded as canonical storage | GitHub would no longer be the source of truth unless SNIE builds and maintains a sync pipeline. |
| Google Forms/Sheets | Excluded as canonical storage | Suitable for registration, contact, and intake, but not for rich content, media governance, or native PR review. |
| Supabase custom admin | Deferred | Explicitly outside the current roadmap and carries the highest implementation and maintenance burden. |

---

## 8. Required Decision Gates

A CMS may be selected only after a separate spike issue records evidence for every gate below.

### Gate 1: Protected-branch and review safety

- The CMS must not publish directly to `develop` or `main`.
- Editor saves must land on a dedicated branch.
- A pull request, required CI, human factual review, and squash merge must remain mandatory.
- Test create, edit, rename, delete, and media operations.

**Pass condition**: No editor or CMS identity can bypass the required review path.

### Gate 2: Organization ownership and annual handover

- GitHub App, OAuth app, hosted-CMS account, billing, recovery email, secrets, and admin roles must be owned by SNIE rather than one student.
- Test inviting, removing, and replacing an editor.
- Document emergency recovery and offboarding.

**Pass condition**: A new officer can assume control using only organization-owned access and the handover document.

### Gate 3: Cloudflare architecture

- Keep the public static site on Cloudflare Pages.
- If a full-stack Next.js editor is deployed on Cloudflare, test the current Workers/OpenNext path rather than the older `next-on-pages` approach.
- Record any separate database, Worker, Node host, or hosted-service dependency.

**Pass condition**: Authentication, callbacks, webhooks, editor routes, and preview routes work in the chosen production-like topology.

### Gate 4: Editor onboarding

- Give one non-developer SNIE member only the handover guide.
- Ask them to create, preview, revise, and submit a Japanese event article.
- Record time to completion and every point of confusion.

**Pass condition**: The editor can submit a review-ready PR in one session without developer intervention.

### Gate 5: Japanese-canonical translation workflow

- Japanese must be the only authoritative source.
- Generated English and Traditional Chinese must be clearly marked `needs review`.
- Missing or unreviewed translations must not publish.
- Editors must not accidentally overwrite generated or reviewed translations.

**Pass condition**: The full Japanese → generated translation → human review → publication flow is reproducible and auditable.

### Gate 6: Media governance

- Test image and document upload, rename, replacement, deletion, and rollback.
- Record source, consent status, attribution, and verification metadata.
- Confirm that raw archive material remains separate from curated public media.
- Define image optimization and repository-size limits.
- If media leaves Git, prove export and backup.

**Pass condition**: A reviewer can verify consent/provenance before merge, and all published media can be recovered.

### Gate 7: Preview and rollback

- Confirm branch previews for content and media.
- Test reverting a bad publish and restoring deleted media.
- Confirm broken references are detected before merge.

**Pass condition**: Editors and reviewers can see the proposed result, and maintainers can restore a known-good state.

### Gate 8: Cost and operational ownership

- Record verified pricing, quotas, inactivity behavior, databases, secrets, backups, upgrades, and responsible owner.
- Include the failure mode when the CMS service or auth provider is unavailable.

**Pass condition**: SNIE explicitly accepts the recurring cost and can operate the system without the original implementer.

### Gate 9: Maintenance recheck

At spike time, recheck:

- latest release date;
- security advisories;
- unresolved critical issues;
- framework/runtime compatibility;
- maintainer concentration; and
- migration/export documentation.

**Pass condition**: No unmitigated maintenance or security risk is accepted silently.

---

## 9. Open Questions Requiring a Real Spike

1. Can Pages CMS be constrained to branch-only writes and mandatory PR review?
2. Can Pages CMS hosted access, GitHub App ownership, and collaborator data be transferred cleanly between annual officers?
3. Can self-hosted Pages CMS run reliably on Cloudflare Workers/OpenNext with PostgreSQL and GitHub callbacks?
4. Can Keystatic GitHub mode run on the same Cloudflare stack while preserving prefixed branches and required reviews?
5. Can Decap's GitHub OAuth flow be operated through an organization-owned Cloudflare service without relying on an unmaintained community bridge?
6. Which editor best prevents accidental publication of unreviewed English or Traditional Chinese?
7. What repository media-size and optimization policy is sustainable for SNIE event photography?
8. Is content scheduling actually required? If yes, should it live in the editor, frontmatter plus CI, or the application?
9. How many editors and backup administrators must be supported during annual handover?
10. What measurable failure of Direct Git would justify changing the approved roadmap?

---

## 10. Conditions Triggering Reevaluation

Revisit this ADR when any of the following occurs:

1. A completed spike supplies evidence for all decision gates.
2. Direct Git has been used in production and editor friction is measured rather than assumed.
3. The Phase 3 roadmap is explicitly amended to include CMS integration.
4. A candidate's release, pricing, authentication, or hosting model changes materially.
5. Cloudflare changes its supported full-stack Next.js deployment model.
6. SNIE gains or loses long-term developer capacity.
7. Content volume or media volume exceeds the documented Git workflow limits.
8. SNIE changes the requirement that GitHub remain canonical.
9. A new Git-backed editor offers stronger branch review, Japanese-canonical workflow, or Cloudflare support.
10. A candidate can no longer provide a credible export and recovery path.

---

## 11. Official Sources Reviewed

### SNIE repository sources

- [`docs/information-architecture.md`](information-architecture.md)
- [`docs/content-governance.md`](content-governance.md)
- [`docs/archive-strategy.md`](archive-strategy.md)
- [`docs/design-system.md`](design-system.md)
- [`docs/mvp-roadmap.md`](mvp-roadmap.md)
- [`AGENTS.md`](../AGENTS.md)
- [`CLAUDE.md`](../CLAUDE.md)

### Pages CMS

- [Introduction](https://pagescms.org/docs/)
- [Quick start](https://pagescms.org/docs/quick-start/)
- [Media configuration](https://pagescms.org/docs/configuration/media/)
- [Collaborators](https://pagescms.org/docs/configuration/collaborators/)
- [Repository settings and commits](https://pagescms.org/docs/configuration/settings/)
- [Self-hosting](https://pagescms.org/docs/guides/installing/self-host/)
- [GitHub App](https://pagescms.org/docs/guides/installing/github-app/)
- [Official releases](https://github.com/hunvreus/pagescms/releases)

### Keystatic

- [Introduction](https://keystatic.com/docs/introduction)
- [GitHub mode](https://keystatic.com/docs/github-mode)
- [Keystatic Cloud and pricing](https://keystatic.com/docs/cloud)
- [File field](https://keystatic.com/docs/fields/file)
- [Image field](https://keystatic.com/docs/fields/image)
- [Next.js real-time preview recipe](https://keystatic.com/docs/recipes/real-time-previews)
- [Official repository](https://github.com/Thinkmill/keystatic)

### Decap CMS

- [Overview](https://decapcms.org/docs/intro/)
- [GitHub backend](https://decapcms.org/docs/github-backend/)
- [External OAuth clients](https://decapcms.org/docs/external-oauth-clients/)
- [Editorial Workflow](https://decapcms.org/docs/editorial-workflows/)
- [i18n support](https://decapcms.org/docs/i18n/)
- [Official releases](https://github.com/decaporg/decap-cms/releases)

### Notion

- [Authorization](https://developers.notion.com/guides/get-started/authorization)
- [Block object](https://developers.notion.com/reference/block)
- [Request limits](https://developers.notion.com/reference/request-limits)
- [Webhooks](https://developers.notion.com/reference/webhooks)

### Google Sheets / Drive

- [Sheets API usage limits](https://developers.google.com/workspace/sheets/api/limits)
- [Spreadsheet values API](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values)
- [Drive resource-change notifications](https://developers.google.com/workspace/drive/api/guides/push)

### Supabase

- [Official pricing and free-tier limits](https://supabase.com/pricing)

### Cloudflare

- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Next.js on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)

# MVP Roadmap — SNIE Portal

> **Status**: Active  
> **Last updated**: 2026-08-20  
> **Purpose**: Define the phased delivery plan for the SNIE Portal website.

## Project Priorities

1. Long-term maintainability
2. Preservation of historical public content
3. Better visual design
4. Japanese, English, and Traditional Chinese support
5. Official events and news publishing channel
6. Verified external inquiry destinations where available
7. Cloudflare free services where practical
8. Supabase, membership, admin, and custom backend features only when needed later

---

## Phase 0: Source Inventory and Historical Preservation Planning

| Field | Definition |
|---|---|
| **Goal** | Identify and document all public SNIE sources; define a preservation strategy |
| **Deliverables** | `docs/content-inventory.md`, `docs/archive-strategy.md` |
| **Definition of done** | All known public sources are listed with verification status; archive strategy is documented |
| **Dependencies** | None |
| **Out of scope** | Crawling or downloading content; website UI; deployment |
| **Status** | Complete (Issue #2) |

---

## Phase 1: Information Architecture and Design System

| Field | Definition |
|---|---|
| **Goal** | Define the website structure, content ownership, and phased delivery plan; specify the design system for consistent UI |
| **Deliverables** | `docs/information-architecture.md`, `docs/content-governance.md`, `docs/mvp-roadmap.md`, `docs/design-system.md` |
| **Definition of done** | IA, governance, roadmap, and design system specification documents created and reviewed. |
| **Dependencies** | Requires Phase 0 completion |
| **Out of scope** | UI implementation; deployment |
| **Status** | Complete |

---

## Phase 2: Static Public MVP Launch

| Field | Definition |
|---|---|
| **Goal** | Build and prepare a fully functional static website for the seven MVP content areas (Home, About, Activities, News, Join Us, Contact, Privacy) plus language-switching capability |
| **Deliverables** | Next.js pages for each MVP area; i18n dictionaries for `ja`, `en`, `zh-TW`; reusable UI components; static content from verified sources |
| **Definition of done** | All pages render correctly in all required locales per the multilingual production policy; `pnpm build` passes; CI is green; the site is navigable with verified content or honest empty states where no verified content exists; launch quality checks are ready |
| **Dependencies** | Requires Phase 1 completion |
| **Out of scope** | Dynamic content; CMS; backend; historical archive migration |
| **Status** | Complete on `develop`; production release is tracked in Phase 4 |

### MVP Content Delivery Strategy

Content must come from verified historical sources, confirmed public sources, or SNIE-approved submissions.

| Area | Content approach |
|---|---|
| **About** | Hand-authored from repository or documented public evidence; unsupported facts are omitted |
| **Activities** | Real events only from verified sources. Honest empty state ("No events yet") if no verified content is available. Fictional content is not used in production. |
| **News** | Real articles only from verified sources. Honest empty state if no verified content is available. Fictional content is not used in production. |
| **Join Us** | Factual participation categories and the currently documented public inquiry path; unsupported application details are omitted |
| **Contact** | The currently documented public inquiry path, with its public and account-required behavior disclosed |
| **Privacy / Photo Policy** | Portal-observable behavior only; no organization-wide or legal-policy claim without evidence |

Fictional content — placeholder events, sample articles, or demo data — is allowed only in development or test fixtures. It must be clearly identified as such and must never appear on production pages.

## Historical Source and Media Workstream

This workstream preserves only public source material that has clear current value. It does not block the production site or require exhaustive archival capture.

| Field | Definition |
|---|---|
| **Goal** | Preserve provenance for useful public SNIE source material and curate only what improves the portal now |
| **Deliverables** | A reproducible public-media inventory, explicit publication review data, visible source links, and a small selected set of useful legacy images |
| **Definition of done** | Selected content retains its documented public source and non-selected inventory remains gated from publication |
| **Dependencies** | Requires Phase 0 completion (archive strategy) |
| **Out of scope** | Non-public content, exhaustive capture, WARC infrastructure, or migration without a current use |
| **Status** | Complete for the useful current scope under #22 and #38 |

Future source material may be added through the same fail-closed inventory and review path when it has a concrete public use.

---

## Post-Launch Phase 3: Publishing Workflow

| Field | Definition |
|---|---|
| **Goal** | Establish a sustainable publishing workflow after the static public MVP is launched |
| **Deliverables** | A documented content workflow with validation, preview, publication, and rollback boundaries |
| **Definition of done** | One minimal workflow is selected, documented, validated, and free of unnecessary external dependencies |
| **Dependencies** | Requires the public MVP launch; tracked by post-launch content-management issues |
| **Out of scope** | This phase is not a prerequisite for the first public launch; no CMS, editor, or backend is required by Phase 2 or Phase 4 |
| **Status** | Complete: Direct Git / repository-backed JSON |

### Publishing Workflow

The production workflow is Direct Git with repository-backed JSON. Branches and pull requests hold drafts, Cloudflare supplies previews, `main` is the production boundary, and Git history supplies rollback. See `docs/content-management-decision.md`.

---

## Phase 4: Cloudflare Deployment and Production Launch

| Field | Definition |
|---|---|
| **Goal** | Deploy the completed static public MVP to a production environment and make it publicly accessible |
| **Deliverables** | Cloudflare Pages production deployment, absolute public metadata, automated deployment from `main`, public smoke checks, and rollback notes |
| **Definition of done** | The site is usable at the existing HTTPS `pages.dev` URL, production tracks the exact `main` revision, and representative public routes and metadata pass smoke checks |
| **Dependencies** | Requires Phase 2 completion (static MVP site) and launch quality checks. It does not require Phase 3, #8, #10, #11, #12, #13, or #14. |
| **Out of scope** | CMS or publishing workflow selection; Supabase integration; custom backend; admin dashboard; complete historical content migration |
| **Status** | In progress under #21; the `pages.dev` production project already exists |

---

## Future: Post-Launch Features

These features are explicitly deferred beyond the initial launch and will be evaluated based on SNIE's needs and capacity.

### Supabase Integration

- **When**: After Phase 4, if dynamic data persistence is required
- **What**: Database for events, news, and member records
- **Why deferred**: Static files are sufficient for MVP; Supabase adds operational complexity and potential cost

### Membership System

- **When**: After the site is live and SNIE confirms a membership workflow is needed
- **What**: Member registration, profiles, login
- **Why deferred**: No verified membership workflow currently requires accounts or persistent member data; such a system would add authentication and privacy responsibilities

### Admin Dashboard

- **When**: If SNIE leadership needs to manage content without GitHub PRs
- **What**: Web-based editor for events, news, and member management
- **Why deferred**: The GitHub PR workflow covers Phase 3 needs; an admin dashboard is a significant development effort

### Custom Registration Forms

- **When**: Only if a documented registration or private-contact requirement cannot be met by a verified external destination
- **What**: Event registration, membership application, contact forms built into the site
- **Why deferred**: No verified form destination or custom-form requirements are currently available; the portal truthfully exposes the public inquiry path it can document

### Post-Launch Issue Tracks

These issue tracks are explicitly outside the first public launch and must not block the static MVP release:

- **#8 and #10-#14**: Resolved by the Direct Git content-management decision.
- **#22**: Completed for the useful current legacy-media scope.
- **#23-#24**: No separate publishing or translation platform is required for the current content volume.
- **#25**: Add only lightweight production checks with clear value; use Git and Cloudflare's native deployment history for recovery.

---

## Phase Dependency Graph

```
Phase 0 (Source Inventory and Historical Preservation Planning)
    ↓
Phase 1 (Information Architecture and Design System)
    ↓
Phase 2 (Static Public MVP Launch)
    ↓
Phase 4 (Cloudflare Deployment and Production Launch)

    ↓
Post-launch Phase 3 (Publishing Workflow)
    ├── Useful legacy-media scope (complete: #22, #38)
    ├── Direct Git content workflow (complete: #8, #10-#14; #23-#24 not planned)
    └── Lightweight production checks and native recovery (#25)
```

Phases 0 and 1 precede Phase 2. Phase 4 follows the static MVP and launch quality checks. The post-launch workstreams shown after Phase 4 are not deployment prerequisites and may be pursued independently after launch.

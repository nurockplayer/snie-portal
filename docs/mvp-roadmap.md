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
6. Google Forms for registration where sufficient
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

## Post-Launch Workstream: Historical Archive Capture and Content Migration

This separate workstream covers the execution of the Phase 0 archive strategy after the public MVP launch. It does not block Phase 2 or Phase 4.

| Field | Definition |
|---|---|
| **Goal** | Capture publicly accessible SNIE source materials and prepare them for curated use on the new website |
| **Deliverables** | For each captured source: raw source captures (HTML or direct export); public images and attachments; screenshots or WARC files where appropriate. For each captured item: source URL and capture date; checksums and provenance record; attribution or permission status; verification status; photo-consent status where relevant. A migration step from raw archives into curated site content. |
| **Definition of done** | All known public sources listed in the content inventory have been captured, verified, and documented with provenance. Curated content derived from archives is ready for a future content update. |
| **Dependencies** | Requires Phase 0 completion (archive strategy) |
| **Out of scope** | Capturing non-public content; automated crawling; this PR |

**Note**: The actual capture, migration, and content preparation are execution tasks belonging to a separate future issue. This PR defines the scope and deliverables only.

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
| **Deliverables** | Cloudflare deployment; custom domain (`To be verified`); DNS configuration; production CI/CD pipeline; launch checklist; rollback notes |
| **Definition of done** | The site is accessible at the official SNIE domain; CI/CD deploys automatically on merge to `main`; HTTPS is configured; basic monitoring is in place |
| **Dependencies** | Requires Phase 2 completion (static MVP site) and launch quality checks. It does not require Phase 3, #8, #10, #11, #12, #13, or #14. |
| **Out of scope** | CMS or publishing workflow selection; Supabase integration; custom backend; admin dashboard; complete historical content migration |
| **Status** | Planned |

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
- **Why deferred**: Google Forms is sufficient for MVP registration; a membership system requires authentication, session management, and data privacy compliance

### Admin Dashboard

- **When**: If SNIE leadership needs to manage content without GitHub PRs
- **What**: Web-based editor for events, news, and member management
- **Why deferred**: The GitHub PR workflow covers Phase 3 needs; an admin dashboard is a significant development effort

### Custom Registration Forms

- **When**: If Google Forms proves insufficient for SNIE's registration needs
- **What**: Event registration, membership application, contact forms built into the site
- **Why deferred**: Google Forms is free, simple, and sufficient for MVP registration volume

### Post-Launch Issue Tracks

These issue tracks are explicitly outside the first public launch and must not block the static MVP release:

- **#8 and #10-#14**: Resolved by the Direct Git content-management decision.
- **#22**: Capture and migrate verified historical SNIE content.
- **#23-#24**: No separate publishing or translation platform is required for the current content volume.
- **#25**: Add production analytics, monitoring, backup, and recovery checks.

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
    ├── Historical Archive Capture and Content Migration (#22)
    ├── Content-management issues (#8, #10-#14, #23-#24)
    └── Analytics, monitoring, backup, and recovery (#25)
```

Phases 0 and 1 precede Phase 2. Phase 4 follows the static MVP and launch quality checks. The post-launch workstreams shown after Phase 4 are not deployment prerequisites and may be pursued independently after launch.

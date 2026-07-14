# MVP Roadmap — SNIE Portal

> **Status**: Draft  
> **Last updated**: 2026-07-14  
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
| **Status** | Complete (Issue #6) |

---

## Phase 2: Multilingual Static MVP

| Field | Definition |
|---|---|
| **Goal** | Build a fully functional static website for the seven MVP content areas (Home, About, Activities, News, Join Us, Contact, Privacy) plus language-switching capability |
| **Deliverables** | Next.js pages for each MVP area; i18n dictionaries for `ja`, `en`, `zh-TW`; reusable UI components; static content from verified sources |
| **Definition of done** | All pages render correctly in all required locales per the multilingual production policy; `pnpm build` passes; CI is green; the site is navigable with honest empty states where no verified content exists |
| **Dependencies** | Requires Phase 1 completion |
| **Out of scope** | Dynamic content; CMS; backend; deployment |
| **Status** | Planned |

### MVP Content Delivery Strategy

Content must come from verified historical sources, confirmed public sources, or SNIE-approved submissions.

| Area | Content approach |
|---|---|
| **About** | Hand-authored; facts marked `To be verified` pending SNIE team confirmation |
| **Activities** | Real events only from verified sources. Honest empty state ("No events yet") if no verified content is available. Fictional content is not used in production. |
| **News** | Real articles only from verified sources. Honest empty state if no verified content is available. Fictional content is not used in production. |
| **Join Us** | Google Forms link; membership FAQ hand-authored |
| **Contact** | Email address and Google Forms link; social media links verified with SNIE team |
| **Privacy / Photo Policy** | Hand-authored draft; legal review `To be verified` |

Fictional content — placeholder events, sample articles, or demo data — is allowed only in development or test fixtures. It must be clearly identified as such and must never appear on production pages.

### Historical Archive Capture and Content Migration

This workstream covers the execution of the Phase 0 archive strategy. It runs alongside Phase 2 and must be substantially complete before production launch.

| Field | Definition |
|---|---|
| **Goal** | Capture publicly accessible SNIE source materials and prepare them for curated use on the new website |
| **Deliverables** | For each captured source: raw source captures (HTML or direct export); public images and attachments; screenshots or WARC files where appropriate. For each captured item: source URL and capture date; checksums and provenance record; attribution or permission status; verification status; photo-consent status where relevant. A migration step from raw archives into curated site content. |
| **Definition of done** | All known public sources listed in the content inventory have been captured, verified, and documented with provenance. Curated content derived from archives is ready for the MVP site. |
| **Dependencies** | Requires Phase 0 completion (archive strategy) |
| **Out of scope** | Capturing non-public content; automated crawling; this PR |

**Note**: The actual capture, migration, and content preparation are execution tasks belonging to a separate future issue. This PR defines the scope and deliverables only.

---

## Phase 3: Events and News Publishing Workflow

| Field | Definition |
|---|---|
| **Goal** | Enable SNIE leadership to publish events and news without editing code |
| **Deliverables** | Markdown-based content pipeline (file-based publishing); content review process (GitHub PR workflow); event archiving automation |
| **Definition of done** | A new event or news article can be added by creating a Markdown file and opening a PR; the review process is documented; CI validates required frontmatter fields |
| **Dependencies** | Requires Phase 2 completion |
| **Out of scope** | WYSIWYG editor; admin dashboard; CMS integration |
| **Status** | Planned |

### Publishing Workflow

1. Author creates a Markdown file in `content/events/` or `content/news/` with required frontmatter (title, date, locale, status)
2. Author opens a pull request
3. Reviewer checks facts, translation status, and photo consent
4. On merge to `develop`, the content is available on the staging site
5. On merge to `main`, the content is published to production

---

## Phase 4: Cloudflare Deployment and Production Launch

| Field | Definition |
|---|---|
| **Goal** | Deploy the SNIE Portal to a production environment and make it publicly accessible |
| **Deliverables** | Cloudflare Pages deployment; custom domain (`To be verified`); DNS configuration; production CI/CD pipeline; launch checklist |
| **Definition of done** | The site is accessible at the official SNIE domain; CI/CD deploys automatically on merge to `main`; HTTPS is configured; basic monitoring is in place |
| **Dependencies** | Requires Phase 2 completion (MVP site). Requires Phase 3 completion (events and news publishing workflow is required before production launch). |
| **Out of scope** | Supabase integration; custom backend; admin dashboard |
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

---

## Phase Dependency Graph

```
Phase 0 (Source Inventory and Historical Preservation Planning)
    ↓
Phase 1 (Information Architecture and Design System)
    ↓
Phase 2 (Multilingual Static MVP) ─── Archive Capture and Content Migration (alongside)
    ↓
Phase 3 (Events and News Publishing Workflow)
    ↓
Phase 4 (Cloudflare Deployment and Production Launch)
```

Phases 0–4 are sequential. The archive capture workstream runs alongside Phase 2 and shares its completion target. Future features (Supabase, Membership, Admin, Custom Registration) are independent and may be pursued in any order after launch.

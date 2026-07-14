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
| **Status** | ✅ Complete (Issue #2) |

---

## Phase 1: Information Architecture and Design System

| Field | Definition |
|---|---|
| **Goal** | Define the website structure, content ownership, and phased delivery plan |
| **Deliverables** | `docs/information-architecture.md`, `docs/content-governance.md`, `docs/mvp-roadmap.md` |
| **Definition of done** | All three documents are created, internally consistent, and reviewed |
| **Dependencies** | Phase 0 (source inventory) — completed |
| **Out of scope** | UI implementation; component design; deployment |
| **Status** | 🔄 In progress (this issue) |

---

## Phase 2: Multilingual Static MVP

| Field | Definition |
|---|---|
| **Goal** | Build a fully functional static website for all eight MVP areas (Home, About, Activities, News, Join Us, Contact, Privacy, Language Switching) |
| **Deliverables** | Next.js pages for each MVP area; i18n dictionaries for `ja`, `en`, `zh-TW`; reusable UI components; static event and news content |
| **Definition of done** | All pages render correctly in all three locales; `pnpm build` passes; CI is green; the site is visually complete and navigable |
| **Dependencies** | Phase 1 (IA and governance) — completed |
| **Out of scope** | Dynamic content; CMS; backend; real event data from live sources; deployment |
| **Status** | 📅 Planned |

### MVP Content Delivery Strategy

For the static MVP, create content as Markdown or TypeScript data files in the codebase. Content sources:

| Area | Content approach |
|---|---|
| **About** | Hand-authored; facts marked `To be verified` pending SNIE team confirmation |
| **Activities** | 3–5 hand-authored sample events to demonstrate the layout |
| **News** | 2–3 sample articles to demonstrate the layout |
| **Join Us** | Google Forms link; membership FAQ hand-authored |
| **Contact** | Email address and Google Forms link; social media links verified with SNIE team |
| **Privacy / Photo Policy** | Hand-authored; placeholder for legal review |

---

## Phase 3: Events and News Publishing Workflow

| Field | Definition |
|---|---|
| **Goal** | Enable SNIE leadership to publish events and news without editing code |
| **Deliverables** | Markdown-based content pipeline (file-based publishing); content review process (GitHub PR workflow); event archiving automation |
| **Definition of done** | A new event or news article can be added by creating a Markdown file and opening a PR; the review process is documented; CI validates required frontmatter fields |
| **Dependencies** | Phase 2 (MVP site structure) — completed |
| **Out of scope** | WYSIWYG editor; admin dashboard; CMS integration |
| **Status** | 📅 Planned |

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
| **Dependencies** | Phase 2 (MVP site structure) — completed |
| **Out of scope** | Supabase integration; custom backend; admin dashboard |
| **Status** | 📅 Planned |

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
Phase 0 (Source Inventory)
    ↓
Phase 1 (IA and Roadmap) ← You are here
    ↓
Phase 2 (Multilingual Static MVP)
    ↓
Phase 3 (Events and News Workflow) ─── Future Features (Supabase,
    ↓                                         Membership, Admin,
Phase 4 (Deployment and Launch)               Custom Registration)
```

Phases 0–4 are sequential dependencies. Future features are independent and may be pursued in any order after launch.

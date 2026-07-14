# Content Management Decision — SNIE Portal

> **Status**: Draft — provisional recommendation only  
> **Last updated**: 2026-07-14  
> **Purpose**: Evaluate content management options for the SNIE Portal and document a provisional recommendation for Phase 3 (Events and News Publishing Workflow).
> **Source**: AI-generated draft — review required before publication

---

## Decision Context

SNIE Portal needs an editorial workflow that:

- Ordinary student officers can learn quickly and hand over every year.
- Japanese remains the only canonical source language. English and Traditional Chinese are generated from Japanese through translation AI.
- GitHub should remain the durable source of truth for all content.
- Cloudflare-first services are preferred where practical.
- Google Forms may continue to handle registration and contact submissions.
- A custom Supabase admin backend is intentionally low priority and should remain deferred.

This document evaluates seven candidate approaches against criteria derived from the [information architecture](information-architecture.md), [content governance](content-governance.md), and [MVP roadmap](mvp-roadmap.md). It makes no unconditional production selection. A real repository-backed spike and operational validation must precede any final decision.

---

## Evaluation Criteria

For each option, the following criteria are assessed:

| Criterion | Definition |
|---|---|
| **Editor usability** | Can a non-developer student officer create, edit, and publish content without Git CLI knowledge? |
| **Annual handover cost** | How much training and documentation is needed when editors change each year? |
| **Git-based ownership** | Is content stored as durable files in a Git repository (GitHub as source of truth)? |
| **Authentication model** | How are editors authenticated? Does it create account management overhead? |
| **Operational burden** | What external services, deployment steps, or maintenance are required? |
| **Structured content** | Does it support frontmatter, media, and content modeling? |
| **Draft/review/publish safety** | Is there an editorial workflow with statuses before publication? |
| **Multilingual fit** | Does it work with Japanese-canonical, English/Chinese-translated content? |
| **Cloudflare compatibility** | Can it deploy on Cloudflare Pages? Does it require a non-Cloudflare server? |
| **Preview/rollback** | Can editors preview changes before publishing? Can content be rolled back? |
| **Maintenance status** | Is the project actively maintained? What is the bus-factor? |
| **Cost constraints** | Is the free tier sufficient for SNIE's likely scale? |
| **Failure/recovery** | What happens when the service is unavailable? Can content be recovered? |

---

## Option Comparison

### 1. Direct GitHub Workflow (Markdown/YAML + Pull Requests)

| Factor | Assessment |
|---|---|
| **Editor usability** | ❌ Requires Git CLI or GitHub web UI knowledge. Not suitable for non-developer editors without training. |
| **Annual handover cost** | Medium. Git workflows must be documented and taught each year. |
| **Git-based ownership** | ✅ Full. Content is Markdown/YAML in the repository. GitHub is the source of truth. |
| **Authentication model** | ✅ GitHub accounts only. No additional auth service. |
| **Operational burden** | ✅ Zero. No external CMS service. Entirely within the existing Next.js + GitHub setup. |
| **Structured content** | ✅ YAML frontmatter + Markdown body. Media stored in the repo or external CDN. |
| **Draft/review/publish safety** | ✅ Full PR review workflow via GitHub. Draft statuses via branch naming or frontmatter flags. |
| **Multilingual fit** | ✅ Files can be organized by locale. Translation status tracked in frontmatter. |
| **Cloudflare compatibility** | ✅ Fully compatible. Static output deploys to Cloudflare Pages. No server required. |
| **Preview/rollback** | ✅ PR preview via deploy previews. Full Git history for rollback. |
| **Maintenance status** | ✅ Not applicable — it is a workflow pattern, not a third-party project. |
| **Cost constraints** | ✅ Free. GitHub free tier, Cloudflare Pages free tier. |
| **Failure/recovery** | ✅ Fully Git-recoverable. Local clones are complete backups. |

**SNIE-specific fit**: Direct Git is the safest baseline. It requires no external CMS dependency. However, without additional tooling, every content change requires a PR — even a typo fix. This is viable for infrequent updates but becomes a bottleneck during active event seasons.

**Verdict**: Reliable fallback and baseline. Viable for Phase 3 if paired with good documentation and a Markdown editor like StackEdit or GitHub.dev.

---

### 2. Pages CMS

| Factor | Assessment |
|---|---|
| **Editor usability** | ✅ Purpose-built for non-developers. Visual editor (Notion-style), media manager, drag-and-drop. Editors never touch Git CLI. |
| **Annual handover cost** | Low. Single configuration file (`.pages.yml`). Web UI is self-explanatory. Email-invite collaboration means accounts persist across years. |
| **Git-based ownership** | ✅ Full. Content written as Markdown/YAML in the GitHub repository. GitHub remains source of truth. |
| **Authentication model** | ✅ GitHub App with fine-grained permissions. Email invites for non-GitHub users. |
| **Operational burden** | Low to medium. Hosted version at app.pagescms.org is free. Self-hosting possible. No database required. |
| **Structured content** | ✅ Configurable content types with YAML schema. Media manager with drag-and-drop. Rich text editing. |
| **Draft/review/publish safety** | ✅ Content scheduling is listed as "Soon". Current workflow: changes commit directly to a branch, which can be PR'd. |
| **Multilingual fit** | ✅ Content is locale-agnostic (handled at the application layer). Locale separation depends on how content types are configured. |
| **Cloudflare compatibility** | ⚠️ **Not confirmed**. The project's deployment documentation covers Vercel and self-hosting. Cloudflare Pages is not mentioned. A spike is required to verify whether the hosted version (app.pagescms.org) or a self-hosted instance works with Cloudflare Pages' serverless functions for the auth callback. |
| **Preview/rollback** | ⚠️ Depends on GitHub branch/preview workflow. No built-in preview environment documented. |
| **Maintenance status** | ✅ Actively maintained. Solo developer (Ronan Berder). v1.0.0 rebuilt on Next.js (Dec 2024). Latest release: v2.1.8 (June 2026). ~3.8K GitHub stars. MIT licensed. |
| **Cost constraints** | ✅ 100% free. "Free forever" including all features. MIT licensed. |
| **Failure/recovery** | ✅ Content is always in Git. Even if Pages CMS stops operating, content remains in the repository and can be edited directly. |

**SNIE-specific fit**: Pages CMS matches SNIE's requirements well: GitHub-backed, editor-friendly, low cost, low handover overhead. The main unresolved question is Cloudflare compatibility, which requires a spike. The solo-developer bus factor is a risk, but the Git-backed architecture means data is never locked in.

**Verdict**: **Provisional first choice** — pending Cloudflare and auth flow verification.

#### Verified Facts

- Pages CMS v2.1.8 released June 2026, rebuilt on Next.js 14 App Router, Drizzle, Lucia.
- GitHub App authentication with fine-grained permissions. Email invites available.
- MIT licensed, 100% free, all "Pro" features merged into open source as of v1.0.0.
- Solo developer (Ronan Berder) — bus factor of 1.
- Cloudflare Pages deployment is not documented. Vercel deployment is documented.

#### Unresolved Questions

- Does the Pages CMS OAuth/github-app callback work when the CMS frontend is served from Cloudflare Pages?
- Can a self-hosted Pages CMS instance run on Cloudflare Pages serverless functions, or does it require a Node.js server?
- Does Pages CMS support content scheduling (listed as "Soon" — not yet confirmed shipped)?
- How does Pages CMS handle locales? Can content types define a locale field or locale-based file paths?

---

### 3. Keystatic

| Factor | Assessment |
|---|---|
| **Editor usability** | ✅ WYSIWYG Admin UI, Markdoc/MDX support. Editors work through a web interface. |
| **Annual handover cost** | Low to medium. Well-documented configuration. Admin UI is straightforward. |
| **Git-based ownership** | ✅ Full. Content stored as Markdown, YAML, JSON in the codebase directory. |
| **Authentication model** | ✅ GitHub mode (GitHub OAuth). Keystatic Cloud available as managed auth. |
| **Operational burden** | Medium. Requires Keystatic Cloud or self-hosted auth handling. Local mode exists for development. |
| **Structured content** | ✅ Collections and Singletons. TypeScript API. Markdoc & MDX support. Readers API for data access. |
| **Draft/review/publish safety** | ✅ GitHub mode enables branch-based workflows. Admin UI can be disabled in production. |
| **Multilingual fit** | ⚠️ Content structure supports locale separation via collections, but no built-in translation workflow. |
| **Cloudflare compatibility** | ⚠️ **Not confirmed**. Keystatic's Next.js integration suggests it runs on Node.js. Cloudflare Pages compatibility has not been verified. |
| **Preview/rollback** | ✅ Next.js real-time previews with draft mode. Git rollback via standard GitHub workflow. |
| **Maintenance status** | ⚠️ **Active development has slowed significantly**. 2,214 GitHub stars. 171 open issues. Pushed as recently as July 2026, but commit frequency has dropped. No formal releases/tags found — only package-level tags. The "Thinkmill Labs R&D" label suggests it is not a core product. |
| **Cost constraints** | ⚠️ Core library is open source. Keystatic Cloud pricing is not publicly documented. |
| **Failure/recovery** | ✅ Content is always in Git. Data lock-in risk is low. |

**SNIE-specific fit**: Keystatic's feature set is strong, and the Thinkmill pedigree is credible. However, reduced maintenance activity and the absence of Cloudflare documentation make it a higher-risk choice than Pages CMS for SNIE's specific architecture.

**Verdict**: Strong candidate, but its declining maintenance cadence and unverified Cloudflare compatibility push it to the fallback position.

#### Verified Facts

- Active development has slowed; commit frequency reduced significantly.
- 171 open issues at time of evaluation.
- No versioned releases found — only package-level tags.
- Next.js, Astro, and Remix integrations documented.
- Thinkmill Labs R&D project — not a core product.

#### Unresolved Questions

- Does Keystatic work on Cloudflare Pages (Next.js runtime mode vs. edge mode)?
- What is the Keystatic Cloud pricing model?
- Is Keystatic's Admin UI deployable as a separate frontend, or must it be embedded in the Next.js app?
- Does the reduced maintenance cadence indicate the project is approaching deprecation?

---

### 4. Decap CMS

| Factor | Assessment |
|---|---|
| **Editor usability** | ✅ Mature editor UI. Rich text, live preview, structured fields. Suitable for non-developers. |
| **Annual handover cost** | Low. Well-established project with extensive documentation. Many tutorials available. |
| **Git-based ownership** | ✅ Full. Content stored in Git repository. Files are Markdown with frontmatter. |
| **Authentication model** | ⚠️ **Complex for Cloudflare**. The base tier requires "bring your own auth and backend." Decap Turbo adds centralized auth but is a paid extension. The Git Gateway backend (Netlify's auth proxy) is the most common setup and is tightly coupled to Netlify. Cloudflare Pages has no equivalent first-party Git Gateway. |
| **Operational burden** | Medium to high. The classic Netlify+Github+Git Gateway deployment is well-trodden, but a Cloudflare deployment would require custom auth infrastructure. |
| **Structured content** | ✅ Mature. Collections, nested structures, relation fields, custom widgets. |
| **Draft/review/publish safety** | ✅ Editorial Workflow provides draft → review → ready → publish statuses. |
| **Multilingual fit** | ✅ Locale-agnostic. Can be configured via collection structure. |
| **Cloudflare compatibility** | ⚠️ Decap CMS itself is static (served as a single-page app), so it _can_ be hosted on Cloudflare Pages. The challenge is authentication: Cloudflare Pages does not provide a Git Gateway equivalent. A Cloudflare Worker or third-party auth service would be needed for the OAuth flow. |
| **Preview/rollback** | ✅ Deploy previews via Cloudflare/Netlify. Git rollback. |
| **Maintenance status** | ✅ **Actively maintained**. Latest release: v3.11.0 (March 2026). ~18K GitHub stars. Multiple backend packages updated consistently. EU-based maintainers with EU co-financing. |
| **Cost constraints** | ✅ Base CMS is free and MIT-licensed. Decap Turbo is a paid extension. |
| **Failure/recovery** | ✅ Content fully in Git. Mature project with large community. |

**SNIE-specific fit**: Decap CMS is the most mature option but the authentication complexity for Cloudflare Pages is a significant barrier. Netlify is the recommended and documented host; anything else requires custom auth work. This increases operational burden and handover risk.

**Verdict**: Strong contender but the Cloudflare auth gap is significant. Evaluate only if Pages CMS and Keystatic fail.

#### Verified Facts

- Decap CMS v3.11.0 released March 24, 2026. Active maintenance with consistent releases.
- ~18K GitHub stars. Large community.
- MIT licensed base; "Decap Turbo" is a paid extension.
- Classic deployment targets Netlify with Git Gateway. Cloudflare deployment would require custom OAuth infrastructure.

#### Unresolved Questions

- Is the Cloudflare OAuth integration for Decap CMS straightforward enough to be maintained by student officers?
- Does Decap Turbo simplify Cloudflare deployment enough to justify its cost?
- What is the actual cost of Decap Turbo?

---

### 5. Notion as a CMS

| Factor | Assessment |
|---|---|
| **Editor usability** | ✅ Excellent. Notion's editor is best-in-class. Most students already know Notion. |
| **Annual handover cost** | ✅ Minimal if SNIE already uses Notion. Permissions transfer easily. |
| **Git-based ownership** | ❌ **Not Git-backed**. Content lives in Notion's proprietary database. No native Git sync. A build-time export pipeline (Notion API → Markdown → Git repo) is needed to make GitHub the durable source of truth. |
| **Authentication model** | ✅ Notion user accounts (workspace-based). PATs simplify single-user setups. |
| **Operational burden** | Medium to high. Requires a build server or CI step to fetch content from Notion API and commit to the repository. Webhooks needed for rebuild triggers. Notion API rate limits must be managed. |
| **Structured content** | ⚠️ Limited. Notion databases provide schema but the API returns rich text blocks rather than clean Markdown. Content modeling is constrained by Notion's block model. |
| **Draft/review/publish safety** | ⚠️ Notion has draft pages but no editorial workflow with status transitions. No PR-style review. |
| **Multilingual fit** | ⚠️ Notion supports multilingual content but has no built-in translation workflow. Locale management would be manual. |
| **Cloudflare compatibility** | ⚠️ Indirect. A build script could run on Cloudflare Pages build step, but the Notion API call adds failure risk in the build pipeline. |
| **Preview/rollback** | ⚠️ Notion version history exists but is not comparable to Git rollback. Build previews depend on the deployment platform. |
| **Maintenance status** | ✅ Notion is actively developed by a large company. No bus-factor risk for the platform itself. |
| **Cost constraints** | ⚠️ Notion's free tier is generous. API usage is subject to rate limits. Additional cost for workspace upgrades if needed. |
| **Failure/recovery** | ⚠️ **Data lock-in risk**. If Notion is unavailable, content cannot be fetched. Git cache provides a partial backup but the source of truth is Notion. |

**SNIE-specific fit**: Notion's editor quality is unmatched, but the lack of Git-native storage violates the "GitHub as durable source of truth" principle. A Notion→Markdown→Git pipeline adds complexity and failure modes that student officers would need to maintain.

**Verdict**: Not recommended as primary content storage. The data ownership and portability requirements disqualify Notion as the canonical source of truth.

#### Verified Facts

- Notion REST API supports PAT-based and OAuth 2.0 authentication.
- Content is retrieved as rich text blocks, not clean Markdown. Schema enforcement requires Notion database properties.
- No native Git sync exists. A custom build pipeline is required.
- Webhooks are supported for change notifications.

#### Unresolved Questions

- Would SNIE be willing to accept Notion as the canonical source of truth instead of GitHub? (Per the project's current principles, this is unlikely.)
- Could a Notion-to-Git sync bridge be maintained by student officers?

---

### 6. Google Forms / Google Sheets as a Publishing Backend

| Factor | Assessment |
|---|---|
| **Editor usability** | ✅ Google Forms editors are familiar to most students. Sheets is spreadsheet-based. |
| **Annual handover cost** | Low. Google Workspace is already in use by SNIE members. |
| **Git-based ownership** | ❌ **Not Git-backed**. Content lives in Google Sheets as cell data. No native Git export. A custom pipeline is required to extract sheet data into the repository. |
| **Authentication model** | ✅ Google accounts (managed via Google Workspace). No additional auth setup. |
| **Operational burden** | Medium to high. A build-time or serverless script must read sheet data, transform it, and generate content. Google Sheets API has rate limits and no push-change notifications (polling only). |
| **Structured content** | ❌ Very limited. Sheets have no schema enforcement, no rich text, no media management. Content modeling is constrained by cell layout. |
| **Draft/review/publish safety** | ❌ No editorial workflow. Sheets has basic revision history but no PR-style review. |
| **Multilingual fit** | ❌ Spreadsheet-based translation management is possible but awkward. No built-in locale handling. |
| **Cloudflare compatibility** | ⚠️ A Cloudflare Worker could read from the Sheets API, but this would be a runtime fetch, not a static build step. A scheduled Worker could poll and regenerate. |
| **Preview/rollback** | ⚠️ Sheets revision history is available but not comparable to Git rollback. |
| **Maintenance status** | ✅ Google Sheets is a mature, stable product. No bus-factor risk. |
| **Cost constraints** | ✅ Sheets API free tier is sufficient for SNIE's scale. |
| **Failure/recovery** | ⚠️ **Data lock-in risk**. Sheet is the source of truth. Periodic Git exports would be required for backup. |

**SNIE-specific fit**: Google Forms is already used by SNIE for registration. Extending this to general content publishing would be technically possible but architecturally poor. Sheets lack the content modeling, media support, and editorial workflow needed for a news/events publishing channel.

**Verdict**: Suitable for its existing role (registration and contact handoff) but not appropriate as a general content management backend. Must not be selected as canonical public content storage.

#### Verified Facts

- Google Sheets API is RESTful with A1/R1C1 notation. No schema enforcement. No built-in webhooks.
- Rate limits apply (Google Cloud quotas). No push notification model.

#### Unresolved Questions

- Could Google Apps Script provide a satisfactory middleware layer? (Still not Git-backed.)

---

### 7. Supabase with a Custom Admin Application

| Factor | Assessment |
|---|---|
| **Editor usability** | ⚠️ Depends entirely on implementation. Could range from basic CRUD forms to a polished dashboard. The Supabase Studio UI is developer-oriented, not editor-oriented. |
| **Annual handover cost** | High. A custom application must be documented and maintained. Every feature change requires developer time. |
| **Git-based ownership** | ❌ Content lives in a PostgreSQL database, not Git. Database migrations track schema, not content history. |
| **Authentication model** | ✅ Supabase Auth (Row-Level Security). Mature and well-documented. |
| **Operational burden** | High. Requires a database, an admin UI, and ongoing maintenance. Supabase free tier covers small projects, but operational complexity is significantly higher than any Git-backed option. |
| **Structured content** | ✅ Full relational database. Rich text via HTML/Markdown fields. Media via Supabase Storage. |
| **Draft/review/publish safety** | ⚠️ Requires custom implementation. RLS policies can enforce status transitions. |
| **Multilingual fit** | ✅ Database rows with locale columns. Query by locale at build time. |
| **Cloudflare compatibility** | ⚠️ Indirect. If the admin app is deployed separately, it could be anywhere. The static site output deploys to Cloudflare Pages. The database layer is external to Cloudflare. |
| **Preview/rollback** | ⚠️ Custom implementation required. No built-in content versioning. |
| **Maintenance status** | ✅ Supabase is actively developed (well-funded, large team). |
| **Cost constraints** | ⚠️ Supabase free tier is generous but has limits (database size, row count, bandwidth). A custom admin app adds development cost. |
| **Failure/recovery** | ⚠️ Database backup is required. Git is not the source of truth. Data recovery is more complex than file-based approaches. |

**SNIE-specific fit**: The MVP roadmap explicitly defers Supabase work: "Supabase adds operational complexity and potential cost." A custom admin backend is appropriate only when SNIE has dedicated developer capacity and the Git-based workflow has demonstrably failed.

**Verdict**: Intentionally deferred. Not appropriate at this stage.

#### Verified Facts

- Supabase free tier: 500 MB database, 5 GB bandwidth, 50,000 monthly active users (Auth), 1 GB file storage.
- Supabase is well-funded and actively maintained.
- Several community packages now provide embeddable admin UIs for Next.js/Nuxt (e.g., `@graphicscove/content`, `@matibaski/nuxt-supabase-admin`), reducing custom development effort.

#### Unresolved Questions

- None at this stage — Supabase is intentionally deferred.

---

## Summary Comparison Matrix

| Criterion | Direct Git | Pages CMS | Keystatic | Decap CMS | Notion CMS | Google Sheets | Supabase Custom |
|---|---|---|---|---|---|---|---|
| Editor usability | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| Low handover cost | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Git-based ownership | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Simple auth model | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| Low operational burden | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| Structured content | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| Draft/review safety | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ |
| Multilingual fit | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ❌ | ✅ |
| Cloudflare compat | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Preview/rollback | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ |
| Active maintenance | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Free tier sufficient | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Git-recoverable | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## SNIE-Specific Risks

### Editorial Handover Risk

All options face the same risk: student officers graduate or leave SNIE annually. The content management approach must be documented well enough that a new editor can take over within a single handover session. Options with a web UI (Pages CMS, Keystatic, Decap CMS) minimize this risk because the UI is self-explanatory. Direct Git workflows require the most documentation.

### Cloudflare Lock-In Risk

If a CMS option requires Netlify for optimal auth flow (Decap CMS), SNIE would need to either use both Cloudflare and Netlify (increasing operational complexity) or accept a suboptimal Cloudflare deployment. Pages CMS and Keystatic are the most likely candidates to work purely within Cloudflare, but this has not been verified.

### Bus-Factor Risk for Pages CMS

Pages CMS is maintained by a single developer. If the project is abandoned, the CMS frontend stops receiving updates, but the underlying Git content is unaffected. SNIE could continue editing content directly in GitHub or transition to another Git-backed CMS. This risk is manageable.

### Translation Pipeline Integration

None of the evaluated options include built-in AI translation features. The multilingual workflow (Japanese → English → Chinese via Gemini or DeepSeek) must be handled outside the CMS regardless of which option is selected. Translation status tracking (per [content governance](content-governance.md)) applies to all options equally.

---

## Provisional Recommendation

### First choice: Validate Pages CMS

Pages CMS has the strongest alignment with SNIE's requirements:

- GitHub-backed content with no database or external API dependency.
- Non-developer editor experience with visual editing and media management.
- Free and open source (MIT) with no cost barrier.
- Email invites reduce handover overhead.
- Active maintenance with recent releases (v2.1.8, June 2026).

**Before adopting, a spike must validate**:

1. Pages CMS authentication (GitHub App OAuth) works when the CMS frontend is served from Cloudflare Pages.
2. Self-hosted Pages CMS can deploy on Cloudflare Pages (or requires a separate server).
3. Content scheduling (if needed) is available or can be worked around.

### Fallback order

If Pages CMS fails validation at any decision gate, evaluate in this order:

1. **Keystatic** — Evaluate if Pages CMS fails. Strong feature set but reduced maintenance activity and unverified Cloudflare compatibility are concerns. Requires a separate spike.
2. **Decap CMS** — Evaluate only if its authentication and ownership model can be made simpler than it currently appears for the Cloudflare architecture. The Netlify coupling is a known friction point.
3. **Direct Git** — Retain as the working fallback for Phase 3 instead of jumping to a custom Supabase backend. Direct Git + a Markdown editor (StackEdit, GitHub.dev) provides a functional editorial workflow at zero operational cost. The trade-off is lower editor convenience but zero dependency risk.

### Excluded from recommendation

| Option | Reason for exclusion |
|---|---|
| **Notion as CMS** | Violates "GitHub as durable source of truth" requirement. Data lock-in risk is unacceptable. |
| **Google Forms/Sheets** | Inadequate content modeling, no editorial workflow, not Git-backed. Suitable only for its existing role (registration/contact). |
| **Supabase custom admin** | Intentionally deferred per MVP roadmap. Not appropriate until Git-backed options are exhausted and SNIE has developer capacity. |

---

## Decision Gates

Before any option is selected for production:

1. **Cloudflare compatibility spike**: Deploy the candidate CMS frontend to Cloudflare Pages and verify auth flow end to end.
2. **Editor onboarding test**: Have one non-developer SNIE member create and publish a test article using the candidate CMS. Measure time-to-first-publication and note confusion points.
3. **Handover simulation**: Document the setup process. A different team member should be able to take over editing following only the documentation.

---

## Open Questions Requiring a Real Spike

The following questions cannot be answered by documentation alone. Each requires building a test deployment and observing actual behavior:

1. **Pages CMS auth on Cloudflare Pages**: Does the GitHub App OAuth callback URL pattern work with Cloudflare Pages' deployment URL structure?
2. **Pages CMS self-hosting**: Can a self-hosted Pages CMS instance run on Cloudflare Pages? Or does it require a Node.js/Vercel environment?
3. **Keystatic Cloudflare deployment**: Does Keystatic's Admin UI work when the Next.js app is deployed to Cloudflare Pages (using `@cloudflare/next-on-pages` or similar)?
4. **Decap CMS auth without Netlify**: Can Decap CMS's OAuth flow be handled by a Cloudflare Worker at acceptable complexity?
5. **Content scheduling gap**: Do Pages CMS or Keystatic support content scheduling out of the box, or must this be handled at the CI/application layer?
6. **Translation workflow integration**: What is the practical integration between the chosen CMS and the AI translation workflow?

---

## Conditions Triggering Reevaluation

This recommendation should be revisited if any of the following occur:

1. **Pages CMS is abandoned or its maintenance cadence drops below one release per 6 months.**
2. **Cloudflare Pages adds first-party CMS/auth features that change the evaluation landscape.**
3. **SNIE gains dedicated developer capacity**, making the Supabase custom admin option more feasible.
4. **A new Git-backed CMS emerges** with better Cloudflare support and editor UX.
5. **The Keystatic project resumes active development** with committed maintenance resources.
6. **Decap CMS or its community produces an official Cloudflare Pages deployment guide**, eliminating the auth uncertainty.
7. **SNIE's content volume exceeds what Git-based workflows can manage** (e.g., hundreds of articles with frequent updates).

# Information Architecture — SNIE Portal

> **Status**: Implemented  
> **Last updated**: 2026-10-03
> **Purpose**: Define the page structure, content requirements, and multilingual strategy for the current static SNIE Portal.

## Current Areas (8 Top-Level Pages Plus Record Details)

### 1. Home

| Field | Definition |
|---|---|
| **Purpose** | Introduce SNIE at a glance; drive visitors to key actions and content |
| **Primary audience** | Prospective members, partner organizations, general visitors |
| **Required content** | Photo-led source presentation, navigation, curated gallery/portfolio previews and three recent dated-report teasers |
| **Content source** | Repository and documented public sources |
| **Main CTA** | "Get Involved" / "Join Us" linking to the Join Us page |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, `zh-TW`, and `ko` |

### 2. About SNIE

| Field | Definition |
|---|---|
| **Purpose** | Explain what the portal can factually establish about SNIE |
| **Primary audience** | Prospective members, partner universities, sponsors |
| **Required content** | Source-backed introduction, historical club/university pairings, school-exchange examples and the contextualized anonymous chair Q&A |
| **Content source** | Repository and documented public sources; unsupported history, people, statistics, and partner claims are omitted |
| **Main CTA** | "Join Us" linking to the Join Us page |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, `zh-TW`, and `ko` |

### 3. Activities / Events

| Field | Definition |
|---|---|
| **Purpose** | Present the curated historical activity-photo collection with source context |
| **Primary audience** | Current and prospective members, partner organizations |
| **Required content** | 80 curated gallery entries in source groups, attribution and original-image links; undated images remain undated |
| **Content source** | Repository or documented public sources |
| **Main CTA** | Browse source groups and original images |
| **MVP** | Yes, static |
| **Locales** | Complete routes in `ja`, `en`, `zh-TW`, and `ko` |

### 4. News

| Field | Definition |
|---|---|
| **Purpose** | Provide a dated source-backed public activity record |
| **Primary audience** | Members, alumni, partners, general visitors |
| **Required content** | Seven existing 2025 reports, localized detail pages, visible past-state notices and distinct activity/source-publication dates |
| **Content source** | Repository or documented public sources |
| **Main CTA** | Open a localized report detail or its original source |
| **MVP** | Yes, static |
| **Locales** | Complete routes in `ja`, `en`, `zh-TW`, and `ko` |

### 5. Join Us

| Field | Definition |
|---|---|
| **Purpose** | Describe available participation inquiry categories |
| **Primary audience** | Students and potential partner organizations or schools |
| **Required content** | Three participation paths, historical source context and honest current-contact/registration limitations |
| **Content source** | Repository and documented public sources |
| **Main CTA** | View relevant activities, historical affiliated clubs or recorded contact-source information |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, `zh-TW`, and `ko` |

### 6. Contact

| Field | Definition |
|---|---|
| **Purpose** | Present the contact handles actually printed by the historical SNIE source and their currentness limits |
| **Primary audience** | Prospective members, partners, media, general public |
| **Required content** | Two source-printed handles, accessible copy/fallback controls, source link and explicit unverified-current/private-route limitations |
| **Content source** | Historical Canva SNIE source; current organization control is unverified |
| **Main CTA** | Copy a printed handle or view the original source; no unverified private endpoint is invented |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, `zh-TW`, and `ko` |

### 7. Privacy / Photo Policy

| Field | Definition |
|---|---|
| **Purpose** | Describe observable portal data, external-link, hosting, and legacy-media behavior |
| **Primary audience** | Members, event participants, general visitors |
| **Required content** | Portal behavior, external-service boundaries, controlled-media provenance and the unresolved private removal-route limitation |
| **Content source** | Repository implementation and deployed architecture; no organization-wide policy is inferred |
| **Main CTA** | View the recorded source/contact limitations; no public-sensitive-data submission is requested |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, `zh-TW`, and `ko` |

### 8. History

Readable historical text from 22 baseline HTML sources and two 2009/2010 newsletter PDFs is separated from current activity reports. Source-specific dates, original links and known capture gaps remain visible.

### Record Details

Each of the seven validated report IDs generates `/[locale]/news/<id>/`. These 28 detail pages plus 32 top-level pages produce 60 localized routes. Lists and homepage teasers link to details while preserving direct source access. Removing or renaming a published ID requires an explicit redirect/retention decision.

### Language Switching

Language switching is a UI capability, not a content area. It allows visitors to switch between Japanese, English, Traditional Chinese, and Korean via a locale switcher in the navigation header, backed by URL-prefixed routes (`/[locale]/...`). Record detail navigation preserves the slug across all four locales; metadata alternates and sitemap follow the same IDs.

## Current Site Navigation Structure

```
/[locale]/
├── (home)
├── about
├── activities
├── news
│   └── <validated-record-id>
├── join
├── contact
├── privacy
└── history
```

Top-level navigation items: Home, About SNIE, Activities, News, Join Us.
History, Contact and Privacy / Photo Policy are linked from the footer. Unknown localized routes use the corresponding static 404/home action; the public root permanently redirects to Japanese.

## Future considerations

Search, tags and pagination need an actual findability/volume problem; multiplying seven records across four locales is not by itself a reason to introduce them. Membership and directories require a verified workflow and privacy/operating requirements. Keep the current static Direct Git approach until a concrete need changes those decisions.

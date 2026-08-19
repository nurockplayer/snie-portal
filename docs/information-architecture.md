# Information Architecture — SNIE Portal

> **Status**: Implemented  
> **Last updated**: 2026-08-20  
> **Purpose**: Define the page structure, content requirements, and multilingual strategy for the SNIE Portal MVP.

## MVP Areas (7 Content Areas Plus Language Switching)

### 1. Home

| Field | Definition |
|---|---|
| **Purpose** | Introduce SNIE at a glance; drive visitors to key actions and content |
| **Primary audience** | Prospective members, partner organizations, general visitors |
| **Required content** | Portal introduction, navigation to public areas, and selected legacy media with provenance |
| **Content source** | Repository and documented public sources |
| **Main CTA** | "Get Involved" / "Join Us" linking to the Join Us page |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, and `zh-TW` |

### 2. About SNIE

| Field | Definition |
|---|---|
| **Purpose** | Explain what the portal can factually establish about SNIE |
| **Primary audience** | Prospective members, partner universities, sponsors |
| **Required content** | The expanded organization name and a transparent description of available portal content |
| **Content source** | Repository and documented public sources; unsupported history, people, statistics, and partner claims are omitted |
| **Main CTA** | "Join Us" linking to the Join Us page |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, and `zh-TW` |

### 3. Activities / Events

| Field | Definition |
|---|---|
| **Purpose** | Showcase past and upcoming SNIE events, exchange programs, and activities |
| **Primary audience** | Current and prospective members, partner organizations |
| **Required content** | Sourced records when available; otherwise an honest empty state |
| **Content source** | Repository or documented public sources |
| **Main CTA** | None while the section is empty |
| **MVP** | Yes, static |
| **Locales** | Complete routes in `ja`, `en`, and `zh-TW` |

### 4. News

| Field | Definition |
|---|---|
| **Purpose** | Publish SNIE announcements, updates, and blog-style articles |
| **Primary audience** | Members, alumni, partners, general visitors |
| **Required content** | Sourced records when available; otherwise an honest empty state |
| **Content source** | Repository or documented public sources |
| **Main CTA** | None while the section is empty |
| **MVP** | Yes, static |
| **Locales** | Complete routes in `ja`, `en`, and `zh-TW` |

### 5. Join Us

| Field | Definition |
|---|---|
| **Purpose** | Describe available participation inquiry categories |
| **Primary audience** | Students and potential partner organizations or schools |
| **Required content** | Factual inquiry categories, unknown-state disclosure, and the current public inquiry route |
| **Content source** | Repository and documented public sources |
| **Main CTA** | Open a public GitHub Issue |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, and `zh-TW` |

### 6. Contact

| Field | Definition |
|---|---|
| **Purpose** | Provide a way for visitors to reach SNIE |
| **Primary audience** | Prospective members, partners, media, general public |
| **Required content** | The current public inquiry route and disclosure that it is public and account-required |
| **Content source** | Repository-controlled GitHub Issues route |
| **Main CTA** | Open a public GitHub Issue |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, and `zh-TW` |

### 7. Privacy / Photo Policy

| Field | Definition |
|---|---|
| **Purpose** | Describe observable portal data, external-link, hosting, and legacy-media behavior |
| **Primary audience** | Members, event participants, general visitors |
| **Required content** | Portal behavior, external service boundaries, media provenance, and the available public removal route |
| **Content source** | Repository implementation and deployed architecture; no organization-wide policy is inferred |
| **Main CTA** | Open a public GitHub Issue |
| **MVP** | Yes |
| **Locales** | Complete routes in `ja`, `en`, and `zh-TW` |

### Language Switching

Language switching is a UI capability, not a content area. It allows visitors to switch between Japanese, English, and Traditional Chinese via a locale switcher in the navigation header, backed by URL-prefixed routes (`/[locale]/...`). Already implemented in the initial scaffold.

## Site Navigation Structure (MVP)

```
/[locale]/
├── (home)
├── about
├── activities
├── news
├── join
├── contact
└── privacy
```

Top-level navigation items: Home, About SNIE, Activities, News, Join Us.
Contact and Privacy / Photo Policy are linked from the footer.

## Future Considerations

- **Search**: Site-wide search, useful when content volume grows past ~20 pages
- **Tags / Categories**: For news and events, enabling filtering by topic or year
- **Member directory**: Linked to a future membership system
- **Blog-style pagination**: For news archives beyond a single page

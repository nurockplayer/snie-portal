# Information Architecture — SNIE Portal

> **Status**: Draft  
> **Last updated**: 2026-07-14  
> **Purpose**: Define the page structure, content requirements, and multilingual strategy for the SNIE Portal MVP.

## MVP Areas

### 1. Home

| Field | Definition |
|---|---|
| **Purpose** | Introduce SNIE at a glance; drive visitors to key actions and content |
| **Primary audience** | Prospective members, partner organizations, general visitors |
| **Required content** | Hero section (tagline, description, CTA), feature highlights, latest news teaser |
| **Content source** | SNIE team (via Canva site, member knowledge); verified by SNIE leadership |
| **Main CTA** | "Get Involved" / "Join Us" linking to the Join Us page |
| **MVP** | Yes |
| **ja** | Full translation; hero copy and feature descriptions |
| **en** | Full translation; primary target for international visitors |
| **zh-TW** | Full translation; secondary international audience |

### 2. About SNIE

| Field | Definition |
|---|---|
| **Purpose** | Explain SNIE's mission, history, organizational structure, and leadership |
| **Primary audience** | Prospective members, partner universities, sponsors |
| **Required content** | Mission statement, founding story (if available), current leadership (if known), organizational overview |
| **Content source** | SNIE Canva site, SNIE team; all org facts must be verified — `To be verified` |
| **Main CTA** | "Join Us" linking to the Join Us page |
| **MVP** | Yes |
| **ja** | Full translation; primary audience for local context |
| **en** | Full translation; international partners and English-speaking visitors |
| **zh-TW** | Full translation |

### 3. Activities / Events

| Field | Definition |
|---|---|
| **Purpose** | Showcase past and upcoming SNIE events, exchange programs, and activities |
| **Primary audience** | Current and prospective members, partner organizations |
| **Required content** | Event list (title, date, description), past event archive, photo gallery (with consent) |
| **Content source** | SNIE team, social media posts (verified), member contributions |
| **Main CTA** | "Join Event" / "Learn More" |
| **MVP** | Yes (static event listing; dynamic publishing deferred to Phase 3) |
| **ja** | Full translation; event descriptions |
| **en** | Full translation; primary language for international events |
| **zh-TW** | Full translation |

### 4. News

| Field | Definition |
|---|---|
| **Purpose** | Publish SNIE announcements, updates, and blog-style articles |
| **Primary audience** | Members, alumni, partners, general visitors |
| **Required content** | Article list (title, date, excerpt), full article pages, category/tag navigation (future) |
| **Content source** | SNIE leadership, verified members; editorial review required |
| **Main CTA** | "Read More" |
| **MVP** | Yes (static articles; publishing workflow deferred to Phase 3) |
| **ja** | Full translation; primary publication language |
| **en** | Full translation; English articles as needed |
| **zh-TW** | Full translation |

### 5. Join Us

| Field | Definition |
|---|---|
| **Purpose** | Recruit new members; provide registration path |
| **Primary audience** | Prospective student members |
| **Required content** | Membership info, Google Forms embed or link, FAQ about joining |
| **Content source** | SNIE team; Google Forms is preferred over custom registration in MVP |
| **Main CTA** | "Apply Now" (Google Forms link) |
| **MVP** | Yes |
| **ja** | Full translation; primary recruitment audience |
| **en** | Full translation; for international students |
| **zh-TW** | Full translation |

### 6. Contact

| Field | Definition |
|---|---|
| **Purpose** | Provide a way for visitors to reach SNIE |
| **Primary audience** | Prospective members, partners, media, general public |
| **Required content** | Contact form (Google Forms or mailto), email address, social media links |
| **Content source** | SNIE team; verified contact details |
| **Main CTA** | "Send Message" (link to form or email) |
| **MVP** | Yes |
| **ja** | Full translation |
| **en** | Full translation |
| **zh-TW** | Full translation |

### 7. Privacy / Photo Policy

| Field | Definition |
|---|---|
| **Purpose** | Comply with privacy regulations; set expectations for photo use at SNIE events |
| **Primary audience** | Members, event participants, general visitors |
| **Required content** | Privacy policy, photo consent statement, data handling notice, removal request process |
| **Content source** | SNIE leadership; legal review may be required |
| **Main CTA** | Contact for concerns (link to Contact page) |
| **MVP** | Yes |
| **ja** | Full translation |
| **en** | Full translation |
| **zh-TW** | Full translation |

### 8. Language Switching

| Field | Definition |
|---|---|
| **Purpose** | Allow visitors to switch between Japanese, English, and Traditional Chinese |
| **Primary audience** | All visitors |
| **Required content** | Locale switcher in navigation header; URL-prefixed routes (`/[locale]/...`) |
| **Content source** | N/A (UI mechanism) |
| **Main CTA** | N/A |
| **MVP** | Yes (already implemented) |
| **ja** | N/A |
| **en** | N/A |
| **zh-TW** | N/A |

## Site Navigation Structure (MVP)

```
/[locale]/
├── (home)
├── about
├── activities
├── news
│   └── [slug]          (individual article pages)
├── join
└── contact
```

Top-level navigation items: Home, About SNIE, Activities, News, Join Us.
Contact and Privacy / Photo Policy are linked from the footer.

## Future Considerations

- **Search**: Site-wide search, useful when content volume grows past ~20 pages
- **Tags / Categories**: For news and events, enabling filtering by topic or year
- **Member directory**: Linked to a future membership system
- **Blog-style pagination**: For news archives beyond a single page

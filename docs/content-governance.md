# Content Governance — SNIE Portal

> **Status**: Draft  
> **Last updated**: 2026-07-14  
> **Purpose**: Define who may submit, verify, and maintain content for the SNIE Portal.

## Roles and Responsibilities

### Content Submission

Anyone with confirmed SNIE affiliation may propose content. Submissions must be sent to the SNIE leadership for review before publication.

- **Who may submit**: SNIE members, leadership, and verified alumni
- **Submission channel**: Email or direct message to SNIE leadership (`To be verified`)
- **Required for each submission**: Content text, language, suggested publication date, relevant event or context

### Fact Verification

Organization facts (leadership names, founding story, official programs, partner institutions) must be verified before publication.

- **Who verifies**: SNIE leadership or designated representative (`To be verified`)
- **Verification method**: Confirmation via email, documented conversation, or official SNIE source
- **Unverified content**: Must be marked with a `To be verified` note; AI must never invent organization information

### Language Ownership

| Language | Owner | Responsibility |
|---|---|---|
| **Japanese (ja)** | SNIE leadership (`To be verified`) | Primary content creation; first-language accuracy for core organizational content |
| **English (en)** | SNIE leadership or designated English-proficient member (`To be verified`) | Translation from Japanese; English-language content for international audience |
| **Traditional Chinese (zh-TW)** | `To be verified` | Translation from Japanese or English; may be deferred when bandwidth is limited |

Japanese is the primary content language. English and Traditional Chinese follow as translations or independent content where capacity allows.

## Translation Status Conventions

Every piece of content must have a clear translation status. Use the following labels:

| Status | Meaning |
|---|---|
| `ja: done` | Japanese original is complete and reviewed |
| `en: done` | English translation is complete and reviewed |
| `zh-TW: done` | Traditional Chinese translation is complete and reviewed |
| `en: needs review` | English draft exists but needs native/proficient review |
| `zh-TW: needs review` | Traditional Chinese draft exists but needs review |
| `xx: missing` | Translation not yet started for this locale |

`needs review` content may appear on staging but not in production.

### Production Multilingual Requirements

- **Home, About, Join Us, Contact, and Privacy**: Require reviewed `done` status in all three locales (`ja`, `en`, `zh-TW`) before production launch.
- **Events and News**: Require `ja: done`. May temporarily omit `en` or `zh-TW`.
- Missing locales must not produce broken pages, placeholder text, machine-generated translations, or unreviewed content on public pages.

## Event Archiving Process

1. After an event concludes, the responsible member submits event details (date, description, photos, attendance) within 14 days
2. Photos are reviewed for consent before publication (see Photo Consent section)
3. The event is added to the Activities page and marked with the event date
4. Events older than two years are moved to a separate archive section on the Activities page
5. The archive section lists events year-by-year with title, date, and a brief description

## Photo Consent and Removal

### Consent Model

SNIE's consent model is `To be verified`. It must be confirmed which approach applies:

- Explicit opt-in (individual written consent)
- Event notice plus opt-out (attendees are informed and may opt out)
- Another reviewed process

Once confirmed, the model must be consistently applied to all photo publications. Guardian consent for minors is required regardless of the model adopted.

### Removal Process

1. A removal request can be submitted via the Contact page or directly to SNIE leadership
2. The request must be processed within 14 days
3. Upon removal, the requestor is notified

### Retention of Removed Photos

The retention policy for removed photos is `To be verified`. The following must be defined before any private archive is established:

- **Purpose**: Why retained (compliance, audit, dispute resolution)
- **Access owner**: Who may access the archive
- **Retention period**: How long removed photos are kept
- **Security**: How the archive is protected
- **Deletion conditions**: When and how items are permanently deleted

## Periodic Review of Outdated Content

- A full content review is conducted every 12 months
- Review scope covers all pages: About, Activities, News, Join Us, Contact, Privacy
- Each item is checked for: factual accuracy, working links, current leadership info, outdated event references
- Content that is no longer accurate is updated; content that is no longer relevant is archived or removed
- The review is triggered by a GitHub Issue labeled `content-review`

## AI Content Rules

- AI must never invent SNIE organization information, including leadership names, founding history, membership numbers, partner institutions, or program details
- Unknown facts must be marked `To be verified`
- AI may draft placeholder text and suggested structure, but any organization facts in the final content must be verified by a human
- AI-generated drafts must be flagged at the top with `> **Source**: AI-generated draft — review required before publication`

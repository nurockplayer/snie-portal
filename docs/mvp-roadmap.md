# Roadmap and current delivery status

> Reconciled 2026-10-03. This is the current operating roadmap; the original static-MVP phases are retained below as delivery history.

## Current baseline

SNIE is publicly deployed on [Cloudflare Pages](https://snie-portal.pages.dev).
Japanese is the default, with English, Traditional Chinese and Korean parity. The site
has 60 localized routes: 32 top-level pages and 28 detail pages for the existing
seven dated 2025 activity reports. It retains the approved photo-rich editorial
presentation, 80 gallery entries, readable historical material and original
photo provenance. Direct Git, static export and reviewed PRs remain the publishing path.

Recent delivered work:

| Work | Evidence |
|---|---|
| Editorial content restoration and source-matched Canva presentation | #63, #65 and subsequent photo-delivery work |
| Local responsive photo variants and clearer historical contact actions | #67 / #68 |
| Permanent Japanese root redirect, localized static 404s and hashed-asset caching | #69 / #70; #56 and #57 closed |
| Source-controlled social preview and localized metadata | #71 / #72; #59 closed |
| Bounded, offline-first Wayback index reconciliation | #73 / #74; #60 closed |
| Validated past-activity records, localized detail pages and 45-route checks | #75 / #76; #52 closed |

The [content readiness record](mvp-content-readiness.md) and [release runbook](cloudflare-release-runbook.md)
state the operational limits. The August audit proposal in PR #53 described an
older baseline; its historical observations must not be read as the current
site state. PR #61's old raw-archive/crawler proposal and PR #62's design-authority
proposal remain separate and unmerged. Current releases do not imply approval
or merger of either proposal.

## Remaining bounded work

| Track | Current disposition |
|---|---|
| #49: current organization, participation and official-channel baseline | Historical/public-source copy is useful, but current SNIE decision ownership and channel operation still need accountable evidence; do not infer them |
| #50: private contact and photo-removal route | No approved private destination or response operator is available; preserve the visible limitation |
| #51: preservation and published-media disposition | Controlled local delivery/provenance and repository-specific publication authorization are recorded; independent consent/license claims, complete historical capture and the private removal route remain unresolved |
| #54: participation-anchor coverage | Shared CSS offset is implemented; complete requested locale/viewport/navigation acceptance evidence is still outstanding |
| #55: homepage LCP evidence | Current first hero is eager/high-priority and later images remain lazy; three comparable current mobile Lighthouse runs, CLS and desktop-regression evidence remain outstanding |
| #58: mobile-menu acceptance coverage | Escape/focus-return and other dismissal behavior are implemented; complete requested all-locale narrow acceptance evidence remains outstanding |

No current contact, membership, registration or leadership fact should be
invented merely to close a ticket. Functional implementation and complete
acceptance evidence are distinct; these open quality tickets are not represented
as finished measurements. A keyless PageSpeed attempt returned quota exhaustion,
so it supplied no replacement performance result.

## Historical milestone record

- Phase 0: initial source inventory and preservation planning completed; later discovery expanded beyond that initial bounded set
- Phase 1: initial information architecture and design planning completed; subsequent editorial implementation evolved independently of the still-unmerged PR #62 proposal
- Phase 2: static public launch completed; the initial seven-area/21-route empty-state MVP has been superseded by the current site
- Phase 3: Direct Git/repository-backed JSON selected and used for real publication; no separate CMS was required
- Phase 4: Cloudflare production launch and automated main-branch deployment completed; exact-commit smoke, rollback and production checks are in place

## Scope and future triggers

Prioritize maintainability, source fidelity, useful public content, four-locale
coherence and accessibility/performance evidence. Preserve known historical
material without promising exhaustive recovery or converting archive metadata
into publication approval.

A CMS/editor or translation service becomes relevant only with sustained
publication/review volume or a confirmed editor group unable to use GitHub.
Membership, authentication, a database or custom registration backend needs an
actual verified workflow and privacy/operating requirements first. None is a
prerequisite for the current static site or a solution to missing current facts.
Use existing reviewed sources and external destinations when they meet a real
need; do not add services, accounts, costs or generalized platform layers speculatively.

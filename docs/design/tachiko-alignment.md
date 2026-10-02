# Alignment with Tachiko Sheet design authority

SNIE Porcelain uses Tachiko Sheet as its design-system authority. This note records what was **adopted**, what was **adapted**, and what was **deliberately not taken**, with the reason for each.

**Upstream snapshot:** `nurockplayer/tachiko-sheet@f44ad23325ab345144f05a7903e86fab67d99234` (2026-09-30).

**Sources read:**

- `docs/design/README.md` (authority precedence)
- `docs/design/ui-quality-contract.md`
- `docs/design/interface-profile-v1-mapping.json` and `.md` (29 roles, including the #70 `border.control` amendment)
- `docs/design/fes45-v2/` (FES45/v3 `DESIGN.md`, `AUTHORITY.md`, `tokens.js`, `font-policy.js`)
- `src/ui/sheet-shell.css` (runtime focus, forced-colours and reduced-motion rules)

## Relationship

SNIE takes a **pinned copy** of the values. It doesn't depend on Tachiko at build or run time. This follows Tachiko's own non-goal: "a universal cross-product Tachiko design platform before actual multi-product pressure exists" (`ui-quality-contract.md` §11). [`preview/check-design.mjs`](preview/check-design.mjs) compares SNIE's colours with the upstream mapping whenever the sibling checkout is present, so drift is visible rather than silent.

SNIE has no Figma file. Tachiko's precedence puts approved canonical Figma nodes above the contract. For SNIE, the equivalent authority is this repository's spec plus the token files. The generated preview and renders are **evidence, not authority**, the same status Tachiko gives its HTML design harness.

## Adopted

| Tachiko source | What SNIE uses | Why |
|---|---|---|
| InterfaceProfileV1 porcelain roles | 20 of 29 role values (surfaces, text, link, borders including amended `border.control #818798`, action primary set, accent, selection, focus) | Already contrast-qualified and reviewed. SNIE needs a neutral, non-brand interface palette. |
| FES45/v3 `tokens.js` | Status ink/background pairs, `text/disabled` (reserved) | Same semantics; all pass 4.5:1 |
| Porcelain workbook-head gradient | `--snie-material-porcelain` on the hero and page header only | Same job: a quiet "where am I" identity band above the content plane |
| `ui-quality-contract.md` §1.3, §1.8 state truth | Principle 1: truthful content state, with a distinct component per state (empty, handoff, statement) | SNIE's no-invented-facts rule is the content equivalent of Tachiko's no-false-success rule |
| §1.1 task-based priority | Paths before photos on Home; one primary action per view | — |
| §1.2 stable geometry | Fixed 64px header, hairlines as shadows, one fragment offset token | Fixes #54 without magic numbers |
| §1.5 hide representation, not capability | The mobile menu is a native disclosure that works without JS; the locale switch is never hidden | — |
| §1.9 accessibility first-order | Focus, targets, forced colours, reduced motion and CJK correctness in every component | — |
| §1.10 one behavioural grammar | One card, link, button and handoff component across pages | — |
| §3 semantic token families | Role-named tokens (`surface.*`, `text.*`, `action.*`…), not component names | — |
| §6 borders, surfaces, radius, shadow and motion need a job | Shadow only on the transient menu; dashed border only for intentional emptiness; no decorative surfaces | — |
| §9 evidence labels | REQUIRED / REFERENCE / MEASURED / HEURISTIC on every number | — |
| Focus geometry (`sheet-shell.css`) | 3px ring, 2px offset; `Highlight` in forced colours | — |
| Radius vocabulary (porcelain 7px; FES45 menus 10px) | `radius.control` 7px, `radius.container` 10px | Radius by semantic container family, not per feature |
| Overlay shadow `--ts-shadow` | `--snie-shadow-overlay` | — |
| Inter for Latin text | Inter via `next/font/google` (self-hosted at build) | Same face, and SNIE already loads a Google font this way |
| Design-before-implementation workflow (#44) | This PR is design-only; implementation follows the handoff | — |

## Adapted

| Tachiko | SNIE | Reason |
|---|---|---|
| 14/20 data body, 12px labels, 11px metadata | 16px body (REQUIRED), 14px labels, 13px metadata | Public reading on phones, not dense spreadsheet work. Tachiko §11 rejects copying one universal font size. |
| 32px command hit height | 44 × 44px targets (REQUIRED by SNIE's accessibility spec) | Touch-first public audience |
| Local-only font faces, no font downloads | Inter self-hosted by `next/font` at build; CJK uses system faces only | No runtime third-party font request, which matches the intent of Tachiko's policy. A static site can't rely on visitors having Inter installed. |
| Noto Sans CJK JP / TC as chosen faces | System stacks per locale: Hiragino/Noto/Yu for `ja`; PingFang/Noto/JhengHei for `zh-TW` | Keeps Tachiko's rule that JP and TC are distinct faces, using what visitors actually have |
| Selection row / active cell | `surface.selected` + `selection.edge` for the `:target` card | It's the same meaning, "this is the item you were brought to", adapted from cells to cards |
| Placeholder chart uses a dashed border | The empty state uses a dashed `border.control` | Dashed means intentionally empty in both systems |
| `surface.chrome` behind the whole app | `surface.chrome` for the locale bar, footer and photo archive; white page | A reading surface needs maximum text contrast |

## Not taken

| Tachiko element | Reason |
|---|---|
| Grid lattice, row headers, active-cell and editing states, Views tabs | Workbook-specific; SNIE has no such objects |
| Persistence, publication, freshness and operation-outcome states | SNIE is static; no such runtime states exist. Inventing them would break principle 1. |
| Interface Profile runtime switching (density, chrome, typography profiles) | One public appearance; no runtime appearance selection |
| Tachiko sprout glyph, brand purple `#8E75E7`, brand orange `#B87036` | These are Tachiko product identity. SNIE must not look like a Tachiko product or claim a brand it doesn't have. |
| The workbook header's product-signature row | There is no product signature; SNIE's wordmark is plain type |
| Figma-node authority and the bridge workflow | SNIE has no Figma file; the repository spec is the authority |
| Disabled-control treatment | SNIE has no disabled controls; missing capability is explained in text |
| Any motion role | AGENTS.md forbids animation without an explicit request |

## Hypotheses from the pre-failure plan, as resolved

Before the disk failure, a direction was outlined. Deeper work changed several parts:

| Earlier hypothesis | Outcome | Why |
|---|---|---|
| Tachiko light surfaces and violet for actions, current page and focus | **Kept** | It also avoids national colours (SNIE principle 1.1) |
| Separate JA / TC font stacks | **Kept and strengthened** | Measurement showed the current stack renders TC pages with JP glyph forms; the stacks now follow the nearest `lang`, including the locale links |
| Language bar above a 64px sticky header | **Kept**; the bar scrolls and isn't sticky | Only the header needs to be sticky; one offset token covers fragment targets |
| A home "portal index" with a status label per section | **Dropped** | It would put two empty sections (Activities, News) in the most prominent position and repeat the header nav. Task priority says paths first. |
| Facts strips on every page header | **Replaced** by disclosure facts inside the external handoff panel | The only consequential facts on these pages are about the GitHub handoff, so they belong next to that action (Tachiko §1.8). Header facts would have needed new, unsourced claims. |
| Dated register for Activities and News | **Kept as a dormant spec** | #52 forbids creating the schema or routes before a qualifying record exists |
| Equal-weight path cards with target highlight | **Kept**; one column below 64rem | A 2+1 tablet layout would visually demote one audience |
| "Opens GitHub" link pattern, sourced photo cards | **Kept** | — |
| A new SNIE mark | **Dropped** | No SNIE mark is approved (#49); drawing one would invent brand identity. The wordmark stays typographic. |
| Social preview image | **Kept as a typographic, language-neutral candidate** pending owner approval | #59 requires an owner-approved or newly approved neutral graphic and no identifiable legacy photo |

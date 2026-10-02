# SNIE Portal design authority

Start here before changing anything a visitor sees.

## Precedence

When sources disagree, the higher one wins:

1. **Product and content governance:** `AGENTS.md`, `docs/content-governance.md`, `docs/information-architecture.md`, and the governing GitHub issue. These define what the site says and which capabilities exist.
2. **[snie-design-system.md](snie-design-system.md)** with **[tokens/snie-tokens.json](tokens/snie-tokens.json)** and **[tokens/snie-theme.css](tokens/snie-theme.css):** the canonical visual and interaction system, **once an SNIE owner approves and merges it**. Until then it is a proposal under review.
3. **[pages.md](pages.md):** page-by-page composition.
4. **[implementation-handoff.md](implementation-handoff.md):** how to build it without breaking existing contracts.
5. **Evidence:** [`renders/`](renders/) and the generated preview. These show a specific build of the design; they aren't authority on their own.
6. **Upstream reference:** Tachiko Sheet design authority, pinned at `nurockplayer/tachiko-sheet@f44ad23`. See [tachiko-alignment.md](tachiko-alignment.md).

## Scope

This authority covers the visual and interaction system for the portal as it exists. Approving it doesn't resolve:

- the owner-approved information baseline (#49);
- a private contact and photo-removal route (#50);
- legacy media rights (#51).

It invents no content or service to stand in for them, and it holds several decisions open for the owner ([decisions.md](decisions.md)).

## Files

| Path | What it is |
|---|---|
| [snie-design-system.md](snie-design-system.md) | Principles, colour, type, layout, components, accessibility |
| [pages.md](pages.md) | Composition of each route |
| [tachiko-alignment.md](tachiko-alignment.md) | What was adopted, adapted and not taken from Tachiko, and how the pre-failure hypotheses were resolved |
| [implementation-handoff.md](implementation-handoff.md) | File-by-file changes, token migration, new keys, contract checklist, issue mapping |
| [decisions.md](decisions.md) | Decided items and open questions for owners |
| [proposed-dictionary-keys.json](proposed-dictionary-keys.json) | Six new keys with `ja` / `en` / `zh-TW` copy |
| [tokens/](tokens/) | Canonical token JSON and the Tailwind v4 theme |
| [assets/social-preview.svg](assets/social-preview.svg) | #59 candidate, pending approval |
| [preview/](preview/) | Generator, component CSS, checker and capture harness (no dependencies) |
| [renders/](renders/) | 31 PNG renders; `evidence.json` (measurements, menu suite, focus sweep, fonts, navigation paths, observations, environment, and SHA-256 of every input and render); `negative-control-r1.txt` and `negative-control-focus.txt` |
| [reviews/](reviews/) | Responses to independent reviews |

## Regenerate and verify

```bash
node docs/design/preview/build-preview.mjs
```

```bash
node docs/design/preview/capture-renders.mjs
```

```bash
node docs/design/preview/check-design.mjs
```

- **Build** writes `docs/design/preview/dist/` (git-ignored): 21 localized pages, the root fallback, the global 404 and the component board. It renders from the real dictionaries and media manifest. Open `dist/index.html`.
- **Capture** needs Google Chrome (`CHROME_PATH` to override). It rewrites `renders/` and exits non-zero on any failed assertion. `DESIGN_CAPTURE_ONLY=menu` or `=focus` runs only that suite without touching `renders/`; these modes were used for the negative controls.
- **Check** needs a `tachiko-sheet` checkout containing the pinned commit (`TACHIKO_SHEET_DIR`, default `../tachiko-sheet`). It fails when the evidence is stale relative to its inputs.

### What the evidence does and doesn't establish

| Type | Meaning | Examples |
|---|---|---|
| Structural | Static checks of source and generated markup | Token parity, upstream hashes, contrast of token pairs, preview contracts, root/404 contracts including refresh, canonical, robots and titles |
| Measured | Browser measurements, macOS Chrome headless only | Header geometry, 44×44 targets, fragment clearance, menu keyboard and scroll suite, keyboard focus sweep, fonts used, forced-colours geometry (emulated) |
| Observed | Recorded, not asserted | LCP element and photo position; sixth-nav-item fit |
| Visual | Human review of the renders | Composition, hierarchy, locale quality |
| Untested | Owned by implementation | Screen readers, native Windows High Contrast, iOS/Android/Windows fonts, Lighthouse, Next.js client navigation |

**CI doesn't run these scripts.** The repository's GitHub Actions run the product checks (`lint`, `test:ops`, `build`, `check:mvp`). A green CI run shows the unchanged application still passes; it isn't evidence for this design. Run the three commands above to reproduce the design evidence.

Committed renders never reproduce legacy SNIE photos; the capture harness substitutes a neutral placeholder (decision D-16).

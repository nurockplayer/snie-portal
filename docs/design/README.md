# SNIE Portal design authority

Start here before changing anything a visitor sees.

## Precedence

When sources disagree, the higher one wins:

1. **Product and content governance:** `AGENTS.md`, `docs/content-governance.md`, `docs/information-architecture.md`, and the governing GitHub issue. These define what the site says and which capabilities exist.
2. **[snie-design-system.md](snie-design-system.md)** with **[tokens/snie-tokens.json](tokens/snie-tokens.json)** and **[tokens/snie-theme.css](tokens/snie-theme.css):** the canonical visual and interaction system.
3. **[pages.md](pages.md):** page-by-page composition.
4. **[implementation-handoff.md](implementation-handoff.md):** how to build it without breaking existing contracts.
5. **Evidence:** [`renders/`](renders/) and the generated preview. These show a specific build of the design; they aren't authority on their own.
6. **Upstream reference:** Tachiko Sheet design authority, pinned at `nurockplayer/tachiko-sheet@f44ad23`. See [tachiko-alignment.md](tachiko-alignment.md).

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
| [renders/](renders/) | 24 PNG renders plus `evidence.json` (measurements, keyboard test, environment) |

## Regenerate and verify

```bash
node docs/design/preview/build-preview.mjs
```

```bash
node docs/design/preview/check-design.mjs
```

```bash
node docs/design/preview/capture-renders.mjs
```

- The first command writes `docs/design/preview/dist/` (git-ignored); open `dist/index.html`.
- The second checks token parity, contrast, the proposed keys, and that the preview keeps the product contracts.
- The third needs Google Chrome; set `CHROME_PATH` to use another browser. It rewrites `renders/`.

The preview is rendered from the real dictionaries and media manifest, so it shows real copy in all three locales.

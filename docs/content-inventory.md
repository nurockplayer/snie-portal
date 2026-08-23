# Public content sources

> Repository inventory of sources actually used by SNIE Portal. Last reconciled: 2026-08-23.

| Source | Use in this portal | Evidence and constraints |
|---|---|---|
| [Legacy SNIE Canva site](https://snie.my.canva.site/snie-com) | Provenance for the reviewed legacy-photo selection | The crawler records source pages and original public image URLs in `src/content/media-manifest.json`. Publication remains fail-closed through `src/content/media-review.json`; the portal does not mirror the binaries or infer organization facts from the images. |
| [SNIE Portal GitHub repository](https://github.com/nurockplayer/snie-portal) | Project identity, public inquiry destination, and implementation records | Join and Contact disclose that GitHub Issues is public and requires a GitHub account. Repository documents support implementation facts only; they are not evidence for unrecorded organization claims. |

Unverified social accounts, contact details, organization history, programs, partners, statistics, events, and application forms are intentionally omitted. Add a source only when it is used and its exact public URL and purpose can be verified.

## Archive-only evidence

Historical Archive Phase 2 records additional primary candidates, historical first-party sites, dead URLs, social candidates, and third-party corroboration in `archive/source-registry.json`. These sources are preserved as evidence and are **not** sources currently used to render portal claims.

The archive currently covers:

- the separate legacy Canva root and `/snie-com`, including older Wayback-only media;
- the historical SNIE Grupo site and its 2012-2013-labelled pages;
- the historical 2010 FC2 site, two newsletters, and a dead predecessor URL;
- current/historical X and Instagram candidates at metadata level only;
- JET, MEXT/JASSO, and a third-party interview as corroboration only.

See `docs/historical-archive.md` for exact URLs, state meanings, coverage, exclusions, and risks. Archive discovery must not be copied into this portal-use table until a separate factual, rights, consent, and publication review is complete.

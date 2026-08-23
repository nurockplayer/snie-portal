# SNIE Historical Archive Phase 2 Implementation Plan

> **Spec:** `docs/superpowers/specs/2026-08-23-snie-historical-archive-phase-2-design.md`

1. Add failing unit tests for registry validation, independent archive states, bounded fetches, deterministic output, and fail-closed publication.
2. Implement the dependency-free crawler with injected fetch/time primitives so network behavior is fully unit-testable.
3. Add the reviewed registry for Canva, Grupo, FC2, historical dead links, social candidates, and third-party corroboration.
4. Run a pinned live capture, inspect every generated scope and exclusion, and commit the manifest plus reviewed, allowlisted raw first-party HTML/PDF artifacts only.
5. Document coverage and risks; update the source inventory, archive strategy, package scripts, and CI.
6. Run archive/media/operations tests, lint, production build, and MVP validation; then review the diff and open a PR to `develop` without merging.

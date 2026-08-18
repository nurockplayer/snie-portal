# SNIE Portal MVP release checklist

> Internal release record for Issue #20 and Issue #26. This checklist is evidence-oriented; an unchecked human or deployment item is not a release approval.

## Integrated implementation evidence

- [x] #16 roadmap correction is merged to `develop`.
- [x] #17 shell and navigation are merged to `develop`.
- [x] #18 static multilingual content areas are merged to `develop`.
- [x] #19 content readiness and provenance record is merged to `develop`.
- [x] #20 quality-gates PR is merged to `develop`.
- [ ] #21 deployment and production release are complete.

## Routes and localization

- [ ] All seven areas render in `ja`, `en`, and `zh-TW` after the final content review.
- [ ] Internal navigation and locale-preserving switches resolve without a 404.
- [ ] Japanese, English, and Traditional Chinese copy has an identifiable reviewer and approval date.
- [ ] Activities and News are either populated with verified records or have approved honest empty-state copy in every public locale.
- [ ] About, Join Us, Contact, and Privacy / Photo Policy contain only approved public content or an explicitly approved empty state.

## Destinations and policy

- [ ] Join paths have verified Google Forms, email, or approved external destinations.
- [ ] Contact has a verified public email or form and approved official social URLs, if published.
- [ ] Privacy / Photo Policy notice is reviewed by the designated policy owner; no legal review is claimed without evidence.
- [ ] The current no-photo MVP status and any future photo-consent model are recorded before photos are published.
- [ ] No fictional, draft, stale, placeholder, or `To be verified` public claim remains.

## Automated and manual quality

- [x] `pnpm lint` passes.
- [x] `pnpm build` passes.
- [x] `pnpm check:mvp` passes after build.
- [x] Metadata is localized per route, including canonical URLs, `hreflang` alternates, Open Graph defaults, favicon, sitemap, robots, and localized not-found behavior.
- [ ] `NEXT_PUBLIC_SITE_URL` is set to the approved production HTTPS URL before production deployment.
- [ ] Keyboard focus, landmarks, headings, controls, contrast, narrow mobile navigation, CJK wrapping, and long English text are smoke-tested.
- [ ] No console-blocking errors appear in the production smoke test.

## Release and rollback

- [ ] A release PR from `develop` to `main` is opened and references Issue #21.
- [ ] Required release checks pass at the exact release head.
- [ ] Production deploys from `main`; previews do not publish draft or unmerged content.
- [ ] The final public HTTPS URL is recorded in Issue #21 after direct observation.
- [ ] Cloudflare project ownership, build settings, environment values, and handover location are recorded.
- [ ] Rollback to the previous known-good deployment or commit is documented.
- [ ] All representative public routes pass after deployment, including `/ja`, `/en`, `/zh-TW`, all seven areas, metadata endpoints, and not-found behavior.

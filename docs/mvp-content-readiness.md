# MVP content readiness

> Repository record for [Issue #19](https://github.com/nurockplayer/snie-portal/issues/19). Last reconciled: 2026-08-20.

## Production state

The minimum JA / EN / zh-TW content is published. It deliberately states only facts supported by this repository and observable portal behavior:

- SNIE expands to Students Network for International Exchange.
- The portal provides public information about SNIE, participation, activities, and contact.
- Activities and News use honest empty states because no verified records are available.
- Join and Contact route inquiries to this repository's public GitHub Issues page. The copy explains that submissions are public and require a GitHub account.
- Privacy describes only the portal's observable behavior and does not claim legal review.
- Three legacy-site images are published from their original public URLs through the fail-closed review manifest. Their source pages and localized alternative text are retained.

No founding date, legal status, leadership, partner, program, event, fee, deadline, capacity, private contact detail, social account, or application form is asserted without evidence.

## Locale and route coverage

All seven areas are available in `ja`, `en`, and `zh-TW`: Home, About, Activities, News, Join, Contact, and Privacy. Japanese is the canonical editing locale; English and Traditional Chinese are maintained in the same pull request. All user-facing strings remain in the locale dictionaries.

## Content changes

The sustainable workflow is the direct Git workflow in [content-management-decision.md](./content-management-decision.md): update all three dictionaries and any reviewed structured content in one pull request to `develop`, run the repository checks, review, then release `develop` to `main`. Do not publish unavailable details as placeholders. Add a real activity, news item, contact destination, or organization claim only with a public source or owner-supplied evidence recorded in the pull request.

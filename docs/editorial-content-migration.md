# SNIE editorial content migration

## Content delivered

- Japanese is the root destination; Japanese, English and Traditional Chinese each have eight pages
- The public brand is SNIE
- Home introduces the three major events, five other activities, four university clubs and three recent source-backed records
- Activities preserves 80 display entries, organized into six recovered Grupo photo albums and two Canva source groups
- About includes the four clubs shown in the Canva snapshot, language-school exchange examples and the anonymous chair interview
- News separates seven verified 2025 activity records from historical source material
- History preserves readable text from all 22 recoverable baseline HTML sources and both 2009/2010 newsletter PDFs
- Join has three distinct participation paths; contact links to the source that actually lists SNIE's contact information

## Provenance and limits

The media archive has 137 unique files, not 137 distinct activity photos. The
photo display groups responsive variants and leaves decorative artwork out of
the activity gallery. `gallery.json` maps display entries to source pages,
original media URLs and hashes. `archive-provenance.json` preserves file-level
source associations. All displayed image bytes are local, with visible source
links and a full-size image link.

The user authorized republication of the former public SNIE content and photos
in this repository for the Cloudflare website. This is not a claim that individual
consent, ownership or a particular license has independently been established.

The recovered baseline comprises 22 HTML sources and two PDFs captured on
2026-08-23. Nineteen later page-version bodies were not available to this
implementation; this is not an exhaustive reconstruction of all revisions.
The two Grupo album entries without recovered photos remain in the historical
source collection rather than being illustrated with unrelated images.

Dates are source-specific. An archive capture date is not an event date. The
anonymous chair is not identified as a current officer. The Canva contact
handles include 2024 in their names, but their current operation is unverified.
Historical affiliations and participation instructions stay within historical
source context. No 2026 event or current officer has been invented.

## Verification

`pnpm check:mvp` covers 24 localized routes, metadata, local links and anchors,
the rendered 80-photo collection, source attribution, image SHA-256 hashes,
all 24 historical source entries and the exact newsletter PDF hashes.

`pnpm test:ops` also checks that the production root can be either the followed
Cloudflare redirect to Japanese or the accessible static fallback.

Cloudflare's immutable source revision is exposed through `/build-info.json`.
Run the public smoke with `EXPECTED_DEPLOY_COMMIT=<exact-main-sha>` to verify
that the live site comes from the expected release, in addition to route,
metadata, sitemap and robots checks. A local build leaves the commit null when
neither Cloudflare nor GitHub supplies a revision.

## Independent review corrections

- Removed adjacent-post navigation dates from the two 2013 article bodies;
  explicit publication dates and a contamination check protect those records
- Added focus-leave and browser-history restoration dismissal for the mobile
  menu, covered by five behavior tests in the operations suite
- Corrected featured-photo captions to use each image's actual album position
- Removed Japanese-only wording from Traditional Chinese interface copy and
  added dictionary parity/wording checks; tagged original Japanese names and
  multilingual historical bodies appropriately
- Updated Next.js and its ESLint configuration to 16.3.8 after the official
  [September 2026 security release](https://nextjs.org/blog/september-2026-security-release).
  Production is static-only, but the supported development server also needs
  the patch. Node 24, pnpm 10.33.0 and Tailwind 4 remain in place
- The existing production-smoke workflow now checks the deployment against
  the exact checked-out main revision, including manual runs
- Pinned every resolved PostCSS instance to 8.5.23 through a pnpm override
  for [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp)

## Homepage photo visibility refinement

The first production homepage contained six images across a long page, only one in the initial desktop viewport, and text-only university cards. User feedback requested more immediately visible photography and images for all four universities. The follow-on feature retains the approved design tokens and source bytes while adding four hero thumbnails, six open activity photographs, an explicit gallery link, and four affiliated-club images. Home now renders 20 images without opening disclosures.

`src/content/school-images.json` binds each image to the exact school/club pair in archived Canva `snie-com.html`, section `IPx7B1CK6jAokFU8`. Image blocks immediately precede the club/university labels. These are archived phone screenshots containing club marks, not campus pictures or official university logos. Original JPG bytes and source hashes remain unchanged; CSS centers the displayed crop and the original is linked. All three locales identify them as club images. Homepage density, school associations and exported source hashes have regression checks.

### Detailed Canva fidelity correction

A follow-on user comparison showed that more generic tiles alone did not preserve the 2024 site's character. A live and archived section-by-section comparison identified the following losses and repairs:

- The opening `PsSRKddS2ik9G85B` is a full-width SOP group photo. Home now opens with that exact source image in a large photo-led hero, keeping the approved editorial color/type tokens.
- Each of eight events has a specific associated image and substantive introduction. The three main cards now use the Canva Tokyo/SOP/Christmas photos rather than the much older Grupo album images; all five other events have their exact mapped images and restored details.
- The organization introduction and four-school section appear before the events, following the source's narrative.
- The Japanese-language-school section is now on home and About with all three source photos. They are associated with the overall school-exchange section, not falsely identified as individually captioned subevents.
- The historical chair portrait and all four Q&A topics are restored with the unknown-name/term caveat. The source's welcome message is represented without implying a currently open registration.
- All 13 images in the source's two portfolio panels are shown openly. The extra blurred-background group screenshot is preserved byte-for-byte and linked, rather than being mislabeled as decoration and omitted from this source presentation.

`presentation-images.json` records exact source section IDs and image associations. The root Canva site provides additional generic archive images and different organization-name wording but no additional substantive event/school/chair sections. Its images remain in the full archive. Current contacts remain unverified; no current leadership or new events are invented. The earlier 20-image/count-only candidate is superseded by this source-matched 31-image homepage.

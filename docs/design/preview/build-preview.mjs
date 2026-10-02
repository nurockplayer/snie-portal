// Renders the SNIE Porcelain design preview from the real locale dictionaries.
//
//   node docs/design/preview/build-preview.mjs
//
// Output goes to docs/design/preview/dist/ (git-ignored). Open dist/index.html.
// No dependencies: the preview is static HTML on top of ../tokens/snie-theme.css
// and ./preview.css. It is design tooling, not product implementation.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "../../..")
const dist = path.join(here, "dist")
const locales = ["ja", "en", "zh-TW"]
const localeLabels = { ja: "日本語", en: "English", "zh-TW": "繁體中文" }
const pages = ["", "about", "activities", "news", "join", "contact", "privacy"]
const primaryNavigation = [
  ["home", ""],
  ["about", "about"],
  ["activities", "activities"],
  ["news", "news"],
  ["join", "join"],
]

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"))

const dictionaries = Object.fromEntries(
  locales.map((locale) => [locale, readJson(`src/i18n/dictionaries/${locale}.json`)]),
)
const proposed = readJson("docs/design/proposed-dictionary-keys.json").keys
const manifest = readJson("src/content/media-manifest.json")

// Mirrors getPublishableLegacyMedia() in src/content/legacy-media.ts.
const publishableMedia = manifest.assets.filter((asset) => {
  const altText = asset.sourceMetadata.alt ?? asset.review.altTextKey

  return (
    asset.review.status === "reviewed" &&
    asset.review.publishable &&
    asset.review.reuse === "selected-for-publication" &&
    ["unknown-public-source", "confirmed", "not-applicable"].includes(asset.review.consent) &&
    typeof altText === "string" &&
    altText.trim().length > 0
  )
})

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character],
  )
}

const t = (locale, key) => escapeHtml(proposed[key][locale])

function pageFile(locale, page) {
  return page ? `${locale}/${page}/index.html` : `${locale}/index.html`
}

function hrefFrom(fromFile, toFile) {
  return path.posix.relative(path.posix.dirname(fromFile), toFile)
}

const icons = {
  menu: '<svg class="menu__icon menu__icon-open" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  close:
    '<svg class="menu__icon menu__icon-close" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  eye: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  person:
    '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="5.5" r="2.75" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M2.75 14c.6-2.9 2.7-4.5 5.25-4.5s4.65 1.6 5.25 4.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  exit: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M12 9.5v3.25c0 .41-.34.75-.75.75h-8c-.41 0-.75-.34-.75-.75v-8c0-.41.34-.75.75-.75H6.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

function externalLink({ locale, href, label, className }) {
  return `<a class="${className}" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)}<span class="glyph" aria-hidden="true">↗</span><span class="sr-only">${t(locale, "accessibility.opensInNewTab")}</span></a>`
}

function handoffPanel({ locale, title, body, href, label, emphasis }) {
  const factsId = `handoff-facts-${label.length}-${href.length}`

  return `<div class="handoff">
  ${title ? `<h3 class="handoff__title">${escapeHtml(title)}</h3>` : ""}
  <p class="handoff__body">${escapeHtml(body)}</p>
  <p class="handoff__facts-label" id="${factsId}">${t(locale, "handoff.github.factsTitle")}</p>
  <ul class="handoff__facts" aria-labelledby="${factsId}">
    <li class="handoff__fact">${icons.eye}<span>${t(locale, "handoff.github.public")}</span></li>
    <li class="handoff__fact">${icons.person}<span>${t(locale, "handoff.github.account")}</span></li>
    <li class="handoff__fact">${icons.exit}<span>${t(locale, "handoff.github.destination")}</span></li>
  </ul>
  <div class="handoff__action">${externalLink({ locale, href, label, className: `button button--${emphasis}` })}</div>
</div>`
}

function section({ id, title, intro, body, tone }) {
  return `<section${id ? ` id="${id}"` : ""} class="section${tone ? ` section--${tone}` : ""}" aria-labelledby="${id}-heading">
  <div class="container">
    <h2 id="${id}-heading" class="section-heading">${escapeHtml(title)}</h2>
    ${intro ? `<p class="section-intro">${escapeHtml(intro)}</p>` : ""}
    <div class="section-body">${body}</div>
  </div>
</section>`
}

function pageHeader(title, intro, eyebrow) {
  return `<header class="page-header porcelain" aria-labelledby="page-heading">
  <div class="container">
    ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
    <h1 id="page-heading" class="title">${escapeHtml(title)}</h1>
    ${intro ? `<p class="lead">${escapeHtml(intro)}</p>` : ""}
  </div>
</header>`
}

function emptyState({ title, body, linkHref, linkLabel }) {
  return `<div class="empty-state">
  <h2 id="empty-state-heading" class="empty-state__title">${escapeHtml(title)}</h2>
  <p class="empty-state__body">${escapeHtml(body)}</p>
  ${linkHref ? `<a class="text-link" href="${linkHref}">${escapeHtml(linkLabel)}<span class="glyph" aria-hidden="true">→</span></a>` : ""}
</div>`
}

function photoArchive(dict, locale) {
  if (!publishableMedia.length) {
    return ""
  }

  const items = publishableMedia
    .map((asset, index) => {
      const altText = dict.media.altTexts[asset.review.altTextKey] ?? dict.media.captionFallback
      const srcSet = [
        ...(asset.originalWidth ? [`${asset.originalUrl} ${asset.originalWidth}w`] : []),
        ...asset.variants.filter((variant) => variant.width).map((variant) => `${variant.url} ${variant.width}w`),
      ].join(", ")
      // Provisional #55 policy (design system §6.13): the first photo is not lazy because it
      // is in the initial viewport on large desktops (measured at 1920x1080); priority stays
      // "auto" until Lighthouse on the implemented build decides whether "high" is warranted.
      const loading = index === 0 ? 'loading="eager"' : 'loading="lazy"'

      return `<li>
  <figure class="photo-card">
    <div class="photo-card__frame"><img src="${escapeHtml(asset.originalUrl)}" srcset="${escapeHtml(srcSet)}" sizes="(min-width: 72rem) 368px, (min-width: 48rem) 31vw, 100vw" alt="${escapeHtml(altText)}" ${loading} decoding="async" width="${asset.originalWidth ?? 592}" height="${Math.round((asset.originalWidth ?? 592) * 0.75)}" data-unavailable="${escapeHtml(dict.media.unavailable)}"></div>
    <figcaption class="photo-card__caption"><span class="block">${escapeHtml(dict.media.captionFallback)}</span><span class="block photo-card__source">${escapeHtml(dict.media.sourceLabel)}: ${externalLink({ locale, href: asset.sourcePages[0] ?? asset.originalUrl, label: dict.media.sourceLink, className: "text-link" })}</span></figcaption>
  </figure>
</li>`
    })
    .join("\n")

  return section({
    id: "legacy-media",
    title: dict.media.title,
    intro: dict.media.description,
    tone: "chrome",
    body: `<ul class="photo-grid">${items}</ul>`,
  })
}

function renderMain(locale, page, file) {
  const dict = dictionaries[locale]
  const link = (target, hash = "") => `${hrefFrom(file, pageFile(locale, target))}${hash}`

  switch (page) {
    case "": {
      const paths = dict.features.items
        .map((item) => {
          const hash = item.href.split("#")[1]

          return `<li class="path-card">
  <h3 class="path-card__title"><a class="path-card__link" href="${link("join", `#${hash}`)}">${escapeHtml(item.title)}<span class="glyph" aria-hidden="true">→</span></a></h3>
  <p class="path-card__description">${escapeHtml(item.description)}</p>
</li>`
        })
        .join("\n")

      return `<section class="hero porcelain" aria-labelledby="hero-heading">
  <div class="container hero__grid">
    <div>
      <p class="eyebrow">${escapeHtml(dict.hero.subtitle)}</p>
      <h1 id="hero-heading" class="display">${escapeHtml(dict.hero.title)}</h1>
    </div>
    <div>
      <p class="lead">${escapeHtml(dict.hero.description)}</p>
      <div class="actions">
        <a class="button button--primary" href="${link("join")}">${escapeHtml(dict.hero.cta)}</a>
        <a class="button button--secondary" href="${link("about")}">${escapeHtml(dict.nav.about)}</a>
      </div>
    </div>
  </div>
</section>
${section({ id: "features", title: dict.features.title, body: `<ul class="path-grid">${paths}</ul>` })}
${photoArchive(dict, locale)}`
    }

    case "about":
      return `${pageHeader(dict.nav.about, dict.pages.about.intro)}
${section({
  id: "about-status",
  title: dict.pages.about.statusTitle,
  body: `<p class="prose">${escapeHtml(dict.pages.about.statusBody)}</p>
<p><a class="text-link" href="${link("join")}">${escapeHtml(dict.pages.about.joinLink)}<span class="glyph" aria-hidden="true">→</span></a></p>`,
})}`

    case "activities":
    case "news":
      return `${pageHeader(dict.nav[page], dict.pages[page].intro)}
<section class="section" aria-labelledby="empty-state-heading">
  <div class="container">${emptyState({
    title: dict.pages[page].emptyTitle,
    body: dict.pages[page].emptyBody,
    linkHref: link(""),
    linkLabel: dict.pages.homeLink,
  })}</div>
</section>`

    case "join": {
      const join = dict.pages.join
      const cards = join.paths
        .map(
          (item) => `<article id="${item.id}" class="path-card" aria-labelledby="${item.id}-heading">
  <h3 id="${item.id}-heading" class="path-card__title">${escapeHtml(item.title)}</h3>
  <p class="path-card__description">${escapeHtml(item.description)}</p>
  <p class="path-card__status">${escapeHtml(item.status)}</p>
</article>`,
        )
        .join("\n")
      const faq = join.faqItems
        .map(
          (item) => `<details class="faq__item">
  <summary class="faq__question">${escapeHtml(item.question)}</summary>
  <p class="faq__answer">${escapeHtml(item.answer)}</p>
</details>`,
        )
        .join("\n")

      return `${pageHeader(dict.nav.join, join.intro)}
${section({ id: "participation-paths", title: join.pathsTitle, body: `<div class="path-grid">${cards}</div>` })}
${section({
  id: "join-destination",
  title: join.destinationTitle,
  body: handoffPanel({ locale, body: join.destinationBody, href: join.publicIssuesUrl, label: join.destinationLink, emphasis: "primary" }),
})}
${section({ id: "join-faq", title: join.faqTitle, body: `<div class="faq">${faq}</div>` })}`
    }

    case "contact": {
      const contact = dict.pages.contact

      return `${pageHeader(dict.nav.contact, contact.intro)}
${section({
  id: "contact-status",
  title: contact.statusTitle,
  body: handoffPanel({
    locale,
    title: contact.emptyTitle,
    body: contact.emptyBody,
    href: contact.publicIssuesUrl,
    label: contact.linkLabel,
    emphasis: "primary",
  }),
})}`
    }

    case "privacy": {
      const privacy = dict.pages.privacy

      return `${pageHeader(dict.nav.privacy, privacy.intro)}
${section({
  id: "privacy-status",
  title: privacy.statusTitle,
  body: `<h3 class="statement__title">${escapeHtml(privacy.emptyTitle)}</h3><p class="statement__body">${escapeHtml(privacy.emptyBody)}</p>`,
})}
${section({
  id: "privacy-review",
  title: privacy.reviewTitle,
  body: `<ul class="fact-list">${privacy.reviewItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`,
})}
${section({
  id: "privacy-contact",
  title: privacy.contactTitle,
  body: handoffPanel({ locale, body: privacy.contactBody, href: privacy.publicIssuesUrl, label: privacy.contactLink, emphasis: "secondary" }),
})}`
    }

    default:
      throw new Error(`unknown page ${page}`)
  }
}

// chrome: "full" (locale bar, header with navigation and menu, footer) or
// "minimal" (locale bar and wordmark-only header) for the root redirect fallback
// and the global 404, which have no client navigation component.
function shell({ locale, page, file, title, main, alternates, chrome = "full", head = "" }) {
  const dict = dictionaries[locale]
  const root = hrefFrom(file, "") ? `${hrefFrom(file, "")}/` : ""
  const isCurrent = (target) => (target === "" ? page === "" : page === target)
  const navLinks = (className) =>
    primaryNavigation
      .map(
        ([key, target]) =>
          `<li><a class="${className}" href="${hrefFrom(file, pageFile(locale, target))}"${isCurrent(target) ? ' aria-current="page"' : ""}>${escapeHtml(dict.nav[key])}</a></li>`,
      )
      .join("")
  const localeLinks = locales
    .map(
      (target) =>
        `<li><a class="locale-link" lang="${target}" hreflang="${target}" href="${alternates(target)}"${target === locale ? ' aria-current="page"' : ""}>${localeLabels[target]}</a></li>`,
    )
    .join("")

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${root}../../tokens/snie-theme.css">
<link rel="stylesheet" href="${root}../preview.css">
${head}<style>:root { --font-inter: "Inter"; } /* stands in for next/font's class on <html> */</style>
<script>
// Mirrors RemoteMediaImage: a failed remote photo becomes the localized unavailable block.
document.addEventListener("error", function (event) {
  var img = event.target;
  if (!img || img.tagName !== "IMG" || !img.dataset.unavailable) return;
  var block = document.createElement("div");
  block.className = "photo-card__unavailable";
  block.setAttribute("role", "img");
  block.setAttribute("aria-label", img.dataset.unavailable);
  block.textContent = img.dataset.unavailable;
  img.replaceWith(block);
}, true);
</script>
</head>
<body>
<a class="skip-link" href="#main-content">${escapeHtml(dict.accessibility.skipToContent)}</a>
<div class="locale-bar">
  <div class="container locale-bar__inner">
    <div role="group" aria-label="${escapeHtml(dict.accessibility.languageSwitcher)}"><ul class="locale-list">${localeLinks}</ul></div>
  </div>
</div>
<header class="site-header">
  <div class="container site-header__inner">
    <a class="wordmark" href="${hrefFrom(file, pageFile(locale, ""))}"><span class="wordmark__acronym">${escapeHtml(dict.site.name)}</span><span class="wordmark__name">${escapeHtml(dict.site.fullName)}</span></a>
${chrome === "full" ? `    <nav class="primary-nav" aria-label="${escapeHtml(dict.accessibility.mainNavigation)}"><ul>${navLinks("nav-link")}</ul></nav>
    <details class="menu">
      <summary class="menu__button">${icons.menu}${icons.close}<span>${escapeHtml(dict.nav.menu)}</span></summary>
      <div class="menu__panel"><nav aria-label="${escapeHtml(dict.accessibility.mainNavigation)}"><ul>${navLinks("menu-link")}</ul></nav></div>
    </details>
` : ""}  </div>
</header>
<main id="main-content" tabindex="-1">
${main}
</main>
${chrome === "full" ? `<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="site-footer__identity">
      <a class="wordmark" href="${hrefFrom(file, pageFile(locale, ""))}"><span class="wordmark__acronym">${escapeHtml(dict.site.name)}</span></a>
      <p>${escapeHtml(dict.site.fullName)}</p>
    </div>
    <nav aria-label="${escapeHtml(dict.accessibility.footerNavigation)}"><ul>
      <li><a class="footer-link" href="${hrefFrom(file, pageFile(locale, "contact"))}"${page === "contact" ? ' aria-current="page"' : ""}>${escapeHtml(dict.nav.contact)}</a></li>
      <li><a class="footer-link" href="${hrefFrom(file, pageFile(locale, "privacy"))}"${page === "privacy" ? ' aria-current="page"' : ""}>${escapeHtml(dict.nav.privacy)}</a></li>
    </ul></nav>
    <p class="site-footer__legal">© ${new Date().getFullYear()} ${escapeHtml(dict.footer.copyright)}</p>
  </div>
</footer>` : ""}
<script>
// Mobile menu behaviour, identical to implementation-handoff.md slice 2 (#58):
// - Escape from the summary or any menu link closes it and returns focus to the summary;
// - focus moving to an element outside the menu closes it, so the overlay can never
//   hide the newly focused element (WCAG 2.4.11);
// - a page restored from the back/forward cache never shows a stale open menu.
document.querySelectorAll("details.menu").forEach(function (menu) {
  var summary = menu.querySelector("summary");
  menu.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !menu.open) return;
    event.preventDefault();
    menu.open = false;
    summary.focus();
  });
  menu.addEventListener("focusout", function (event) {
    if (menu.open && event.relatedTarget && !menu.contains(event.relatedTarget)) menu.open = false;
  });
});
window.addEventListener("pageshow", function () {
  document.querySelectorAll("details.menu[open]").forEach(function (menu) { menu.open = false; });
});
</script>
</body>
</html>
`
}

function renderComponentsBoard() {
  const tokens = readJson("docs/design/tokens/snie-tokens.json")
  const file = "components.html"
  const swatches = Object.entries(tokens.color)
    .map(
      ([role, token]) =>
        `<li class="swatch"><span class="swatch__chip" style="background:${token.value}"></span><span><strong>${role}</strong><br><code>${token.value}</code> · ${escapeHtml(token.tachiko)}<br><span class="swatch__use">${escapeHtml(token.use)}</span></span></li>`,
    )
    .join("")
  const han = "直 骨 角 誤 遊 写 令 化"
  const sample = (locale) => {
    const dict = dictionaries[locale]

    return `<div lang="${locale}" class="specimen">
  <p class="eyebrow">${locale}</p>
  <p class="display" style="margin-top:.5rem">${escapeHtml(dict.hero.title)}</p>
  <p class="section-heading" style="margin-top:1rem">${escapeHtml(dict.features.title)}</p>
  <p class="path-card__title" style="margin-top:1rem">${escapeHtml(dict.pages.join.paths[2].title)}</p>
  <p style="margin:.75rem 0 0;color:var(--snie-text-secondary)">${escapeHtml(dict.pages.join.destinationBody)}</p>
  <p class="photo-card__caption">${escapeHtml(dict.media.captionFallback)}</p>
</div>`
  }
  const en = dictionaries.en
  const register = [1, 2]
    .map(
      (n) => `<li class="register__item">
  <div class="register__date"><time>[canonical date]</time></div>
  <div>
    <h3 class="register__title"><a class="text-link" href="#register" style="min-height:auto">[record title from approved source ${n}]</a></h3>
    <div class="register__meta"><span class="tag">[type]</span><span>[source label] ↗</span></div>
  </div>
</li>`,
    )
    .join("")

  const main = `<section class="page-header porcelain" aria-labelledby="page-heading">
  <div class="container">
    <p class="eyebrow">SNIE Porcelain · design preview</p>
    <h1 id="page-heading" class="title">Component and state board</h1>
    <p class="lead">Every state shown here is a real or reserved state of the portal. Hover, pressed and focus are forced with preview-only classes so they can be compared side by side.</p>
  </div>
</section>
<section class="section" aria-labelledby="colour-heading"><div class="container">
  <h2 id="colour-heading" class="section-heading">Colour roles</h2>
  <p class="section-intro">Values are Tachiko Sheet InterfaceProfileV1 (porcelain) roles and the product-owned status values in src/ui/sheet-shell.css, pinned at tachiko-sheet f44ad23. Violet marks actions, the current location and focus. It is a proposed interface colour, not an SNIE brand colour, and needs owner approval (U-01).</p>
  <ul class="swatches">${swatches}</ul>
</div></section>
<section class="section" aria-labelledby="type-heading"><div class="container">
  <h2 id="type-heading" class="section-heading">Typography in three locales</h2>
  <p class="section-intro">Inter for Latin text. Each locale gets its own CJK stack through the lang attribute.</p>
  <div class="specimens">${locales.map(sample).join("")}</div>
  <h3 class="path-card__title" style="margin-top:2.5rem">Unified Han characters need the right face</h3>
  <p class="section-intro">The same code points rendered with the current shared stack (Hiragino first), the Japanese stack, and the Traditional Chinese stack. Measured on macOS, the current stack draws Traditional Chinese pages with Japanese glyph forms. Other platforms are untested.</p>
  <div class="han">
    <div><span class="han__label">Current stack on a zh-TW page</span><span class="han__glyphs" style="font-family:'Hiragino Sans','Noto Sans CJK JP','Noto Sans CJK TC','Microsoft JhengHei',sans-serif">${han}</span></div>
    <div lang="ja"><span class="han__label">--snie-font-ja</span><span class="han__glyphs">${han}</span></div>
    <div lang="zh-TW"><span class="han__label">--snie-font-zh-tw</span><span class="han__glyphs">${han}</span></div>
  </div>
</div></section>
<section class="section" aria-labelledby="controls-heading"><div class="container">
  <h2 id="controls-heading" class="section-heading">Actions and links</h2>
  <div class="state-row">
    <div><span class="state-label">rest</span><a class="button button--primary" href="#controls-heading">${escapeHtml(en.hero.cta)}</a></div>
    <div><span class="state-label">hover</span><a class="button button--primary is-hover" href="#controls-heading">${escapeHtml(en.hero.cta)}</a></div>
    <div><span class="state-label">pressed</span><a class="button button--primary is-active" href="#controls-heading">${escapeHtml(en.hero.cta)}</a></div>
    <div><span class="state-label">keyboard focus</span><a class="button button--primary is-focus" href="#controls-heading">${escapeHtml(en.hero.cta)}</a></div>
  </div>
  <div class="state-row">
    <div><span class="state-label">rest</span><a class="button button--secondary" href="#controls-heading">${escapeHtml(en.nav.about)}</a></div>
    <div><span class="state-label">hover</span><a class="button button--secondary is-hover" href="#controls-heading">${escapeHtml(en.nav.about)}</a></div>
    <div><span class="state-label">pressed</span><a class="button button--secondary is-active" href="#controls-heading">${escapeHtml(en.nav.about)}</a></div>
    <div><span class="state-label">keyboard focus</span><a class="button button--secondary is-focus" href="#controls-heading">${escapeHtml(en.nav.about)}</a></div>
  </div>
  <div class="state-row">
    <div><span class="state-label">rest</span><a class="text-link" href="#controls-heading">${escapeHtml(en.pages.about.joinLink)}<span class="glyph" aria-hidden="true">→</span></a></div>
    <div><span class="state-label">hover</span><a class="text-link is-hover" href="#controls-heading">${escapeHtml(en.pages.about.joinLink)}<span class="glyph" aria-hidden="true">→</span></a></div>
    <div><span class="state-label">keyboard focus</span><a class="text-link is-focus" href="#controls-heading">${escapeHtml(en.pages.about.joinLink)}<span class="glyph" aria-hidden="true">→</span></a></div>
    <div><span class="state-label">external</span>${externalLink({ locale: "en", href: en.pages.contact.publicIssuesUrl, label: en.pages.contact.linkLabel, className: "text-link" })}</div>
  </div>
</div></section>
<section class="section" aria-labelledby="nav-heading"><div class="container">
  <h2 id="nav-heading" class="section-heading">Navigation states</h2>
  <div class="state-row">
    <div><span class="state-label">rest</span><a class="nav-link" href="#nav-heading">${escapeHtml(en.nav.activities)}</a></div>
    <div><span class="state-label">hover</span><a class="nav-link is-hover" href="#nav-heading">${escapeHtml(en.nav.activities)}</a></div>
    <div><span class="state-label">current page</span><a class="nav-link" aria-current="page" href="#nav-heading">${escapeHtml(en.nav.activities)}</a></div>
    <div><span class="state-label">locale: current / hover / focus</span><span style="display:flex;background:var(--snie-surface-chrome)"><a class="locale-link" aria-current="page" lang="en" href="#nav-heading">English</a><a class="locale-link is-hover" lang="ja" href="#nav-heading">日本語</a><a class="locale-link is-focus" lang="zh-TW" href="#nav-heading">繁體中文</a></span></div>
  </div>
</div></section>
<section class="section" aria-labelledby="cards-heading"><div class="container">
  <h2 id="cards-heading" class="section-heading">Participation cards</h2>
  <p class="section-intro">Equal weight in every state. Home cards are whole-card links; Join cards are static articles that become the fragment target.</p>
  <div class="path-grid" style="margin-top:1.5rem">
    <div class="path-card"><span class="state-label">home · rest</span><h3 class="path-card__title"><a class="path-card__link" href="#cards-heading">${escapeHtml(en.features.items[0].title)}<span class="glyph" aria-hidden="true">→</span></a></h3><p class="path-card__description">${escapeHtml(en.features.items[0].description)}</p></div>
    <div class="path-card is-hover"><span class="state-label">home · hover</span><h3 class="path-card__title"><a class="path-card__link" href="#cards-heading">${escapeHtml(en.features.items[1].title)}<span class="glyph" aria-hidden="true">→</span></a></h3><p class="path-card__description">${escapeHtml(en.features.items[1].description)}</p></div>
    <div class="path-card is-focus"><span class="state-label">home · keyboard focus</span><h3 class="path-card__title"><a class="path-card__link" href="#cards-heading">${escapeHtml(en.features.items[2].title)}<span class="glyph" aria-hidden="true">→</span></a></h3><p class="path-card__description">${escapeHtml(en.features.items[2].description)}</p></div>
  </div>
  <div class="path-grid" style="margin-top:1.5rem">
    <article class="path-card"><span class="state-label">join · rest</span><h3 class="path-card__title">${escapeHtml(en.pages.join.paths[0].title)}</h3><p class="path-card__description">${escapeHtml(en.pages.join.paths[0].description)}</p><p class="path-card__status">${escapeHtml(en.pages.join.paths[0].status)}</p></article>
    <article class="path-card is-target"><span class="state-label">join · :target</span><h3 class="path-card__title">${escapeHtml(en.pages.join.paths[1].title)}</h3><p class="path-card__description">${escapeHtml(en.pages.join.paths[1].description)}</p><p class="path-card__status">${escapeHtml(en.pages.join.paths[1].status)}</p></article>
    <article class="path-card"><span class="state-label">join · rest</span><h3 class="path-card__title">${escapeHtml(en.pages.join.paths[2].title)}</h3><p class="path-card__description">${escapeHtml(en.pages.join.paths[2].description)}</p><p class="path-card__status">${escapeHtml(en.pages.join.paths[2].status)}</p></article>
  </div>
</div></section>
<section class="section" aria-labelledby="handoff-heading"><div class="container">
  <h2 id="handoff-heading" class="section-heading">External handoff and empty state</h2>
  <div class="board-pair">
    ${handoffPanel({ locale: "en", title: en.pages.contact.emptyTitle, body: en.pages.contact.emptyBody, href: en.pages.contact.publicIssuesUrl, label: en.pages.contact.linkLabel, emphasis: "primary" })}
    <div>${emptyState({ title: en.pages.news.emptyTitle, body: en.pages.news.emptyBody, linkHref: "#handoff-heading", linkLabel: en.pages.homeLink }).replace('id="empty-state-heading"', "")}</div>
  </div>
</div></section>
<section class="section" aria-labelledby="photo-heading"><div class="container">
  <h2 id="photo-heading" class="section-heading">Photo card: loaded and unavailable</h2>
  <p class="section-intro">In committed renders the loaded photo is replaced by a "withheld" placeholder (decision D-16); open the preview locally to see the original image from its public URL.</p>
  <ul class="photo-grid" style="margin-top:1.5rem">
    <li><figure class="photo-card"><div class="photo-card__frame"><img src="${escapeHtml(publishableMedia[0]?.originalUrl ?? "")}" alt="${escapeHtml(en.media.altTexts.costumeFieldGroup)}" loading="eager" width="592" height="444"></div><figcaption class="photo-card__caption"><span class="block">${escapeHtml(en.media.captionFallback)}</span><span class="block photo-card__source">${escapeHtml(en.media.sourceLabel)}: ${externalLink({ locale: "en", href: "https://snie.my.canva.site/snie-com", label: en.media.sourceLink, className: "text-link" })}</span></figcaption></figure></li>
    <li><figure class="photo-card"><div class="photo-card__frame"><div class="photo-card__unavailable" role="img" aria-label="${escapeHtml(en.media.unavailable)}">${escapeHtml(en.media.unavailable)}</div></div><figcaption class="photo-card__caption"><span class="block">${escapeHtml(en.media.captionFallback)}</span><span class="block photo-card__source">${escapeHtml(en.media.sourceLabel)}: ${externalLink({ locale: "en", href: "https://snie.my.canva.site/snie-com", label: en.media.sourceLink, className: "text-link" })}</span></figcaption></figure></li>
  </ul>
</div></section>
<section class="section" aria-labelledby="register"><div class="container">
  <h2 id="register" class="section-heading">Record register (dormant)</h2>
  <p class="section-intro">Schematic only. Activities and News keep their empty state until #52's entry condition is met; bracketed field names stand in for approved record content and must never ship.</p>
  <ul class="register" style="margin-top:1.5rem">${register}</ul>
</div></section>
<section class="section" aria-labelledby="social-heading"><div class="container">
  <h2 id="social-heading" class="section-heading">Social preview candidate (#59)</h2>
  <p class="section-intro">Language-neutral, typographic, no photographs. Pending owner approval; not wired into metadata.</p>
  <img src="../../assets/social-preview.svg" alt="${escapeHtml(proposed["site.socialImageAlt"].en)}" width="1200" height="630" style="width:100%;max-width:48rem;height:auto;margin-top:1.5rem;border:1px solid var(--snie-border-subtle);border-radius:var(--snie-radius-container)">
</div></section>`

  return shell({
    locale: "en",
    page: "components",
    file,
    title: "SNIE Porcelain — component board",
    main,
    alternates: () => "en/index.html",
  }).replace(
    "</head>",
    `<style>
.swatches{display:grid;gap:.75rem;margin:1.5rem 0 0;padding:0;list-style:none;grid-template-columns:repeat(auto-fill,minmax(17rem,1fr))}
.swatch{display:flex;gap:.75rem;font-size:.8125rem;line-height:1.25rem;color:var(--snie-text-secondary)}
.swatch strong{color:var(--snie-text-primary);font-weight:600}
.swatch__chip{flex:none;width:2.75rem;height:2.75rem;border:1px solid var(--snie-border-subtle);border-radius:var(--snie-radius-control)}
.swatch__use{color:var(--snie-text-secondary)}
.specimens{display:grid;gap:1.5rem;margin-top:1.5rem}
@media (min-width:64rem){.specimens{grid-template-columns:repeat(3,minmax(0,1fr))}}
.specimen{border:1px solid var(--snie-border-subtle);border-radius:var(--snie-radius-container);padding:1.5rem}
.han{display:grid;gap:1rem;margin-top:1rem}
@media (min-width:48rem){.han{grid-template-columns:repeat(3,1fr)}}
.han>div{border:1px solid var(--snie-border-subtle);border-radius:var(--snie-radius-container);padding:1rem}
.han__label{display:block;font-size:.8125rem;color:var(--snie-text-secondary);font-family:var(--snie-font-latin)}
.han__glyphs{display:block;font-size:1.75rem;line-height:2.75rem;letter-spacing:.06em}
.state-row{display:flex;flex-wrap:wrap;gap:1.5rem 2rem;margin-top:1.5rem;align-items:flex-end}
.state-row>div{display:grid;gap:.5rem;justify-items:start}
.state-label{display:block;font-size:.75rem;line-height:1rem;color:var(--snie-text-secondary);font-family:var(--snie-font-latin);text-transform:none;margin-bottom:.5rem}
.board-pair{display:grid;gap:1.5rem;margin-top:1.5rem}
@media (min-width:64rem){.board-pair{grid-template-columns:1fr 1fr;align-items:start}}
</style>
</head>`,
  )
}

function renderIndex() {
  const rows = locales
    .map(
      (locale) =>
        `<li><strong lang="${locale}">${localeLabels[locale]}</strong>: ${pages
          .map((page) => `<a class="text-link" href="${pageFile(locale, page)}" style="min-height:2rem">${page || "home"}</a>`)
          .join(" · ")} · <a class="text-link" href="${pageFile(locale, "join")}#international-students" style="min-height:2rem">join#international-students</a></li>`,
    )
    .join("")

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SNIE Porcelain preview</title>
<link rel="stylesheet" href="../../tokens/snie-theme.css">
<link rel="stylesheet" href="../preview.css">
<style>:root { --font-inter: "Inter"; } ul { line-height: 2.25rem; }</style>
</head>
<body>
<main class="section"><div class="container">
<p class="eyebrow">Design preview · generated ${new Date().toISOString().slice(0, 10)}</p>
<h1 class="title" style="margin-top:.75rem">SNIE Porcelain</h1>
<p class="lead">Every page below is rendered from src/i18n/dictionaries and src/content/media-manifest.json. Copy marked as proposed in docs/design/proposed-dictionary-keys.json is the only text not yet in the dictionaries.</p>
<p class="actions"><a class="button button--primary" href="components.html">Component and state board</a><a class="button button--secondary" href="root/fallback.html">Root redirect fallback</a><a class="button button--secondary" href="404.html">Global 404</a></p>
<ul>${rows}</ul>
</div></main>
</body>
</html>
`
}

fs.rmSync(dist, { recursive: true, force: true })

for (const locale of locales) {
  for (const page of pages) {
    const file = pageFile(locale, page)
    const dict = dictionaries[locale]
    const html = shell({
      locale,
      page,
      file,
      title: dict.metadata[page || "home"].title,
      main: renderMain(locale, page, file),
      alternates: (target) => hrefFrom(file, pageFile(target, page)),
    })

    fs.mkdirSync(path.join(dist, path.dirname(file)), { recursive: true })
    fs.writeFileSync(path.join(dist, file), html)
  }
}

// Root redirect fallback (src/app/(redirect)/page.tsx). root/index.html carries the production
// metadata (meta refresh to the ja home, canonical /ja/, noindex, follow) so the checker can
// verify it; root/fallback.html is the same document without the refresh, so the composition
// a visitor sees when the refresh doesn't fire can be measured and rendered.
for (const [file, refresh] of [["root/index.html", true], ["root/fallback.html", false]]) {
  const dict = dictionaries.ja
  const main = `<section class="page-header porcelain" aria-labelledby="root-page-heading">
  <div class="container">
    <h1 id="root-page-heading" class="title">${escapeHtml(dict.site.title)}</h1>
    <p class="lead">${escapeHtml(dict.site.description)}</p>
    <div class="actions"><a class="button button--primary" href="${hrefFrom(file, pageFile("ja", ""))}">${escapeHtml(dict.pages.homeLink)}</a></div>
  </div>
</section>`
  fs.mkdirSync(path.join(dist, "root"), { recursive: true })
  fs.writeFileSync(
    path.join(dist, file),
    shell({
      locale: "ja",
      page: "root",
      file,
      title: dict.site.title,
      main,
      chrome: "minimal",
      alternates: (target) => hrefFrom(file, pageFile(target, "")),
      head: `${refresh ? '<meta http-equiv="refresh" content="0;url=../ja/index.html">\n' : ""}<link rel="canonical" href="https://snie-portal.pages.dev/ja/">\n<meta name="robots" content="noindex, follow">\n`,
    }).replace('aria-current="page"', ""),
  )
}

// Global 404 (src/app/global-not-found.tsx): default locale, links to every locale home.
{
  const file = "404.html"
  const dict = dictionaries.ja
  const main = `<section class="page-header porcelain" aria-labelledby="not-found-heading">
  <div class="container">
    <p class="eyebrow">404</p>
    <h1 id="not-found-heading" class="title">${escapeHtml(dict.notFound.title)}</h1>
    <p class="lead">${escapeHtml(dict.notFound.description)}</p>
    <div class="actions"><a class="button button--primary" href="${hrefFrom(file, pageFile("ja", ""))}">${escapeHtml(dict.notFound.backHome)}</a></div>
  </div>
</section>`
  fs.writeFileSync(
    path.join(dist, file),
    shell({
      locale: "ja",
      page: "404",
      file,
      title: `${dict.notFound.title} | ${dict.site.name}`,
      main,
      chrome: "minimal",
      alternates: (target) => hrefFrom(file, pageFile(target, "")),
      head: '<meta name="robots" content="noindex, nofollow">\n',
    }).replace('aria-current="page"', ""),
  )
}

fs.writeFileSync(path.join(dist, "components.html"), renderComponentsBoard())
fs.writeFileSync(path.join(dist, "index.html"), renderIndex())

console.log(`Design preview written: ${locales.length * pages.length} localized pages, root fallback, global 404 and component board in ${path.relative(repoRoot, dist)}/`)

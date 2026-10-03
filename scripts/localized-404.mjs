function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" })[character])
}

// Reuse the built, styled error document but deliberately omit hydration scripts.
// A missing request has no Next route to hydrate; plain links keep this fallback reliable.
export function renderLocalized404(template, source, target, locale) {
  if (!["ja", "en", "zh-TW", "ko"].includes(locale)) throw new Error("Unsupported fallback locale")
  let html = template.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<link\b(?=[^>]*\bas="script")[^>]*>/gi, "")
  if (!html.includes('<html lang="ja"') || !html.includes('href="/ja/"')) throw new Error("Unexpected built 404 template")
  html = html.replace('<html lang="ja"', `<html lang="${locale}"`)
  for (const key of ["title", "description", "backHome"]) {
    const original = escapeHtml(source.notFound[key])
    if (!html.includes(original)) throw new Error(`Missing 404 template content: ${key}`)
    html = html.split(original).join(escapeHtml(target.notFound[key]))
  }
  html = html.replace(`aria-label="${escapeHtml(source.accessibility.languageSwitcher)}"`, `aria-label="${escapeHtml(target.accessibility.languageSwitcher)}"`)
  let primaryActions = 0
  html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (link, attributes, content) => {
    if (attributes.includes('href="/ja/"') && content.trim() === escapeHtml(target.notFound.backHome)) {
      primaryActions += 1
      return link.replace('href="/ja/"', `href="/${locale}/"`)
    }
    return link
  })
  if (primaryActions !== 1) throw new Error("Unexpected primary 404 home action")
  return html
}

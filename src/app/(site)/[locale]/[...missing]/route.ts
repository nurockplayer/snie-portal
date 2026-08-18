import { NextResponse } from "next/server"
import en from "@/i18n/dictionaries/en.json"
import ja from "@/i18n/dictionaries/ja.json"
import zhTW from "@/i18n/dictionaries/zh-TW.json"
import { defaultLocale, locales, type Locale } from "@/i18n/config"

const dictionaries = { ja, en, "zh-TW": zhTW }

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; missing: string[] }> },
) {
  const { locale } = await params
  const typedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale
  const dict = dictionaries[typedLocale]
  const safeLocale = escapeHtml(typedLocale)
  const title = escapeHtml(dict.notFound.title)
  const description = escapeHtml(dict.notFound.description)
  const backHome = escapeHtml(dict.notFound.backHome)
  const homePath = `/${safeLocale}/`
  const html = `<!doctype html><html lang="${safeLocale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} | ${escapeHtml(dict.site.name)}</title></head><body style="margin:0;background:#f8fafc;color:#16202b;font-family:system-ui,sans-serif;line-height:1.7"><main style="max-width:72rem;margin:0 auto;padding:4rem 1rem"><p style="color:#1f4e79;font-size:.875rem;font-weight:600;letter-spacing:.14em">404</p><h1 style="font-size:clamp(2.25rem,5vw,3.75rem);line-height:1.1">${title}</h1><p style="max-width:42rem;font-size:1.125rem;color:#405263">${description}</p><a href="${homePath}" style="display:inline-flex;align-items:center;min-height:2.75rem;margin-top:2rem;padding:.75rem 1.5rem;border-radius:.375rem;background:#1f4e79;color:#fff;font-weight:600">${backHome}</a></main></body></html>`

  return new NextResponse(html, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  })
}

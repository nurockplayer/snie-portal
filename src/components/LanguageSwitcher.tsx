"use client"

import { usePathname, useRouter } from "next/navigation"
import { locales, localeLabels, type Locale } from "@/i18n/config"
import { useCallback } from "react"

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = useCallback(
    (locale: Locale) => {
      const segments = pathname.split("/").filter(Boolean)
      if (locales.includes(segments[0] as Locale)) {
        segments[0] = locale
      } else {
        segments.unshift(locale)
      }
      router.push(`/${segments.join("/")}`)
    },
    [pathname, router],
  )

  return (
    <nav aria-label="Language switcher">
      <ul className="flex gap-2">
        {locales.map((locale) => (
          <li key={locale}>
            <button
              onClick={() => switchLocale(locale)}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                currentLocale === locale
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-current={currentLocale === locale ? "true" : undefined}
            >
              {localeLabels[locale]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

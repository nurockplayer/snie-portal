"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { locales, localeLabels, type Locale } from "@/i18n/config"
import { getLocalizedPath } from "@/i18n/routes"

export default function LanguageSwitcher({ currentLocale, label }: { currentLocale: Locale; label: string }) {
  const pathname = usePathname()
  return (
    <div role="group" aria-label={label}><ul className="locale-list">
      {locales.map((locale) => (
        <li key={locale}><Link href={getLocalizedPath(pathname, locale)} lang={locale} hrefLang={locale}
          aria-current={currentLocale === locale ? "page" : undefined} className="locale-link">{localeLabels[locale]}</Link></li>
      ))}
    </ul></div>
  )
}

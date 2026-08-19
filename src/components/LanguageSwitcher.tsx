"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { localeLabels, locales, type Locale } from "@/i18n/config"
import { getLocalizedPath } from "@/i18n/routes"

export default function LanguageSwitcher({
  currentLocale,
  label,
}: {
  currentLocale: Locale
  label: string
}) {
  const pathname = usePathname()

  return (
    <div role="group" aria-label={label}>
      <ul className="flex flex-wrap gap-1">
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={getLocalizedPath(pathname, locale)}
              aria-current={currentLocale === locale ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-sm px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                currentLocale === locale
                  ? "bg-brand-primary font-semibold text-white"
                  : "text-text-secondary hover:text-brand-primary"
              }`}
            >
              {localeLabels[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

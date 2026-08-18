"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries"

const primaryNavigation = [
  { key: "home", path: "" },
  { key: "about", path: "/about" },
  { key: "activities", path: "/activities" },
  { key: "news", path: "/news" },
  { key: "join", path: "/join" },
] as const

function normalizedPath(pathname: string) {
  const path = pathname.replace(/\/$/, "")
  return path || "/"
}

function isCurrentPath(pathname: string, locale: Locale, path: string) {
  const current = normalizedPath(pathname)
  const target = normalizedPath(`/${locale}${path}`)

  if (path === "") {
    return current === target
  }

  return current === target || current.startsWith(`${target}/`)
}

export default function SiteNavigation({
  dict,
  locale,
}: {
  dict: Dictionary
  locale: Locale
}) {
  const pathname = usePathname()

  const links = primaryNavigation.map(({ key, path }) => ({
    href: `/${locale}${path}`,
    label: dict.nav[key],
    current: isCurrentPath(pathname, locale, path),
  }))

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex" aria-label={dict.accessibility.mainNavigation}>
        <ul className="flex flex-wrap items-center justify-end gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={link.current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-sm px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                  link.current
                    ? "text-brand-primary underline decoration-2 underline-offset-4"
                    : "text-text-secondary hover:text-brand-primary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <LanguageSwitcher currentLocale={locale} label={dict.accessibility.languageSwitcher} />
          </li>
        </ul>
      </nav>

      <details className="relative lg:hidden">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-sm border border-border px-4 py-2 text-sm font-medium text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
          {dict.nav.menu}
        </summary>
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-(--z-dropdown) w-[min(20rem,calc(100vw-2rem))] border border-border bg-surface p-4 shadow-md">
          <nav aria-label={dict.accessibility.mainNavigation}>
            <ul className="grid gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={link.current ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-sm px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                      link.current
                        ? "text-brand-primary underline decoration-2 underline-offset-4"
                        : "text-text-secondary hover:text-brand-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-border pt-3">
                <LanguageSwitcher currentLocale={locale} label={dict.accessibility.languageSwitcher} />
              </li>
            </ul>
          </nav>
        </div>
      </details>
    </>
  )
}

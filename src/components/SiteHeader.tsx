import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"
import SiteNavigation from "@/components/SiteNavigation"

export default function SiteHeader({
  dict,
  locale,
}: {
  dict: Dictionary
  locale: Locale
}) {
  return (
    <header className="sticky top-0 z-(--z-sticky) border-b border-border bg-page-bg">
      <div className="page-container flex min-h-18 items-center justify-between gap-6 py-3">
        <Link
          href={`/${locale}`}
          className="flex min-h-11 min-w-0 flex-col justify-center rounded-sm text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          <span className="text-xl font-bold tracking-tight">{dict.site.name}</span>
          <span className="hidden max-w-56 text-xs leading-snug text-text-secondary sm:block">
            {dict.site.fullName}
          </span>
        </Link>
        <SiteNavigation dict={dict} locale={locale} />
      </div>
    </header>
  )
}

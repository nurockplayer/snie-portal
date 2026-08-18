import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"

export default function SiteFooter({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <footer className="border-t border-border bg-surface py-12">
      <div className="page-container grid gap-8 text-sm text-text-secondary md:grid-cols-[1.4fr_1fr]">
        <div>
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-11 items-center rounded-sm px-2 text-lg font-bold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            {dict.site.name}
          </Link>
          <p className="mt-2 max-w-md leading-relaxed">{dict.site.fullName}</p>
        </div>
        <nav aria-label={dict.accessibility.footerNavigation}>
          <ul className="grid gap-2 sm:grid-cols-2">
            <li>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex min-h-11 items-center rounded-sm px-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus hover:text-brand-primary"
              >
                {dict.nav.contact}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/privacy`}
                className="inline-flex min-h-11 items-center rounded-sm px-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus hover:text-brand-primary"
              >
                {dict.nav.privacy}
              </Link>
            </li>
          </ul>
        </nav>
        <p className="border-t border-border pt-4 md:col-span-2">
          © {new Date().getFullYear()} {dict.footer.copyright}
        </p>
      </div>
    </footer>
  )
}

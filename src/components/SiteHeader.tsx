import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"
import SiteNavigation from "@/components/SiteNavigation"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export default function SiteHeader({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <>
      <div className="locale-bar">
        <div className="container locale-bar__inner">
          <LanguageSwitcher currentLocale={locale} label={dict.accessibility.languageSwitcher} />
        </div>
      </div>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link href={`/${locale}`} className="wordmark">
            <span className="wordmark__acronym">{dict.site.name}</span>
            <span className="wordmark__name">{dict.site.fullName}</span>
          </Link>
          <SiteNavigation dict={dict} locale={locale} />
        </div>
      </header>
    </>
  )
}

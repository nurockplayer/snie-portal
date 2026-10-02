import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"

export default function SiteFooter({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <footer className="site-footer"><div className="container site-footer__inner">
      <div className="site-footer__identity">
        <Link href={`/${locale}`} className="wordmark"><span className="wordmark__acronym">{dict.site.name}</span></Link>
        <p>{dict.site.fullName}</p>
      </div>
      <nav aria-label={dict.accessibility.footerNavigation}><ul>
        <li><Link href={`/${locale}/history`} className="footer-link">{dict.nav.history}</Link></li>
        <li><Link href={`/${locale}/contact`} className="footer-link">{dict.nav.contact}</Link></li>
        <li><Link href={`/${locale}/privacy`} className="footer-link">{dict.nav.privacy}</Link></li>
      </ul></nav>
      <p className="site-footer__legal">© {new Date().getFullYear()} {dict.footer.copyright}</p>
    </div></footer>
  )
}

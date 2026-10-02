"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { bindMenuDismissal } from "@/components/menu-dismissal.mjs"
import { type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries"

const primaryNavigation = [
  { key: "home", path: "" },
  { key: "about", path: "/about" },
  { key: "activities", path: "/activities" },
  { key: "news", path: "/news" },
  { key: "join", path: "/join" },
] as const

function normalizedPath(pathname: string) { return pathname.replace(/\/$/, "") || "/" }
function isCurrentPath(pathname: string, locale: Locale, path: string) {
  const current = normalizedPath(pathname)
  const target = normalizedPath(`/${locale}${path}`)
  return path === "" ? current === target : current === target || current.startsWith(`${target}/`)
}

export default function SiteNavigation({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const pathname = usePathname()
  const menu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    if (!menu.current) return
    return bindMenuDismissal(menu.current, document, window)
  }, [])
  useEffect(() => { if (menu.current) menu.current.open = false }, [pathname])
  const links = primaryNavigation.map(({ key, path }) => ({
    href: `/${locale}${path}`, label: dict.nav[key], current: isCurrentPath(pathname, locale, path),
  }))
  return (
    <>
      <nav className="primary-nav" aria-label={dict.accessibility.mainNavigation}>
        <ul>{links.map((link) => (
          <li key={link.href}><Link href={link.href} aria-current={link.current ? "page" : undefined} className="nav-link">{link.label}</Link></li>
        ))}</ul>
      </nav>
      <details ref={menu} className="menu" onKeyDown={(event) => {
        if (event.key === "Escape" && menu.current?.open) {
          menu.current.open = false
          menu.current.querySelector("summary")?.focus()
          event.stopPropagation()
        }
      }}>
        <summary className="menu__button">
          <svg className="menu__icon menu__icon-open" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <svg className="menu__icon menu__icon-close" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <span>{dict.nav.menu}</span>
        </summary>
        <div className="menu__panel"><nav aria-label={dict.accessibility.mainNavigation}>
          <ul>{links.map((link) => (
            <li key={link.href}><Link href={link.href} aria-current={link.current ? "page" : undefined} className="menu-link"
              onClick={() => { if (menu.current) menu.current.open = false }}>{link.label}<span aria-hidden="true">↗</span></Link></li>
          ))}</ul>
        </nav></div>
      </details>
    </>
  )
}

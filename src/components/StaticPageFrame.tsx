import type { ReactNode } from "react"
import Link from "next/link"

export default function StaticPageFrame({
  title,
  intro,
  children,
}: {
  title: string
  intro?: string
  children?: ReactNode
}) {
  return (
    <>
      <header className="porcelain page-header" aria-labelledby="page-heading">
        <div className="container">
          <h1 id="page-heading" className="title">
            {title}
          </h1>
          {intro ? <p className="lead">{intro}</p> : null}
        </div>
      </header>
      {children}
    </>
  )
}

export function EmptyState({
  title,
  body,
  link,
  headingLevel = "h2",
}: {
  title: string
  body: string
  link?: { href: string; label: string }
  headingLevel?: "h2" | "h3"
}) {
  const Heading = headingLevel

  return (
    <div className="border-l-4 border-brand-primary bg-surface p-6 sm:p-8" aria-labelledby="empty-state-heading">
      <Heading id="empty-state-heading" className="max-w-2xl text-xl font-semibold text-text-primary">
        {title}
      </Heading>
      <p className="mt-3 max-w-2xl leading-relaxed text-text-secondary">{body}</p>
      {link ? (
        <Link
          href={link.href}
          className="mt-5 inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-brand-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus hover:text-brand-primary-hover"
        >
          {link.label}
        </Link>
      ) : null}
    </div>
  )
}

import type { ReactNode } from "react"

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
      <header className="border-b border-border bg-surface py-16 sm:py-20" aria-labelledby="page-heading">
        <div className="page-container">
          <h1 id="page-heading" className="max-w-3xl text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            {title}
          </h1>
          {intro ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">{intro}</p> : null}
        </div>
      </header>
      {children}
    </>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-4 border-brand-primary bg-surface p-6 sm:p-8" aria-labelledby="empty-state-heading">
      <h2 id="empty-state-heading" className="max-w-2xl text-xl font-semibold text-text-primary">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-text-secondary">{body}</p>
    </div>
  )
}

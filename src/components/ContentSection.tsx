import type { ReactNode } from "react"

export default function ContentSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="py-14 sm:py-18" aria-labelledby={`${id}-heading`}>
      <div className="page-container">
        <h2 id={`${id}-heading`} className="max-w-2xl text-2xl font-bold text-text-primary sm:text-3xl">
          {title}
        </h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

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
    <section id={id} className="section" aria-labelledby={`${id}-heading`}>
      <div className="container">
        <h2 id={`${id}-heading`} className="section-heading">
          {title}
        </h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

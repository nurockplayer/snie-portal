export default function StaticPageFrame({ title }: { title: string }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="page-heading">
      <div className="page-container">
        <h1 id="page-heading" className="max-w-3xl text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          {title}
        </h1>
      </div>
    </section>
  )
}

import type { Dictionary } from "@/i18n/dictionaries"

interface FeatureItemProps {
  title: string
  description: string
}

function FeatureCard({ title, description }: FeatureItemProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
    </article>
  )
}

export default function FeaturesSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="py-16" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="features-heading" className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          {dict.features.title}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dict.features.items.map((item, index) => (
            <FeatureCard key={index} title={item.title} description={item.description} />
          ))}
        </div>
      </div>
    </section>
  )
}

import type { Dictionary } from "@/i18n/dictionaries"

export default function HeroSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-24">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          {dict.hero.title}
        </h1>
        <p className="mt-4 text-lg font-medium text-blue-600 sm:text-xl">{dict.hero.subtitle}</p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
          {dict.hero.description}
        </p>
        <a
          href={`#`}
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {dict.hero.cta}
        </a>
      </div>
    </section>
  )
}

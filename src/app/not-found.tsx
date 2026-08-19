import NotFoundContent from "@/components/NotFoundContent"
import { defaultLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"

export default async function RootNotFound() {
  const dict = await getDictionary(defaultLocale)

  return (
    <main className="min-h-screen bg-page-bg text-text-primary">
      <NotFoundContent dict={dict} locale={defaultLocale} />
    </main>
  )
}

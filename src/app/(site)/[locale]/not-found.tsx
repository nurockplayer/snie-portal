import NotFoundContent from "@/components/NotFoundContent"
import { defaultLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"

export default async function LocaleNotFound() {
  const dict = await getDictionary(defaultLocale)

  return <NotFoundContent dict={dict} locale={defaultLocale} />
}

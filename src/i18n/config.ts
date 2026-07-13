export type Locale = "ja" | "en" | "zh-TW"

export const defaultLocale: Locale = "ja"
export const locales: Locale[] = ["ja", "en", "zh-TW"]
export const localeLabels: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  "zh-TW": "繁體中文",
}

export function getDictionary(locale: string) {
  switch (locale) {
    case "en":
      return import("./en.json").then((m) => m.default)
    case "zh-TW":
      return import("./zh-TW.json").then((m) => m.default)
    default:
      return import("./ja.json").then((m) => m.default)
  }
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>

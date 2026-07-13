import type { Dictionary } from "@/i18n/dictionaries"

export default function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {dict.footer.copyright}</p>
      </div>
    </footer>
  )
}

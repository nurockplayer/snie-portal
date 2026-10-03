/**
 * A skip action moves within the document, without adding a history entry.
 * Native hash navigation creates a null-state entry that Next's App Router
 * cannot restore after a client-side route change. Keep the anchor as the
 * no-JavaScript fallback, but leave router history untouched when enhanced.
 * @param {import("react").MouseEvent<HTMLAnchorElement>} event
 */
export function skipToContent(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  const main = event.currentTarget.ownerDocument.getElementById("main-content")
  if (!main) return

  event.preventDefault()
  main.focus({ preventScroll: true })
  main.scrollIntoView({ block: "start" })
}

export async function copyPublishedHandle(handle, clipboard, selectFallback) {
  try {
    if (typeof clipboard?.writeText !== "function") throw new Error("Clipboard unavailable")
    await clipboard.writeText(handle)
    return "copied"
  } catch {
    selectFallback()
    return "select"
  }
}

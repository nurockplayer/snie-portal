/** Keep the native details menu out of the way when focus or history moves on. */
/** @param {HTMLDetailsElement} menu @param {Document} documentTarget @param {Window} windowTarget */
export function bindMenuDismissal(menu, documentTarget, windowTarget) {
  /** @param {Event} event */
  function closeOutside(event) {
    if (menu.open && !menu.contains(/** @type {Node | null} */ (event.target))) menu.open = false
  }
  /** @param {FocusEvent} event */
  function closeOnFocusLeave(event) {
    if (menu.open && !menu.contains(/** @type {Node | null} */ (event.relatedTarget))) menu.open = false
  }
  function closeOnPageShow() {
    menu.open = false
  }
  documentTarget.addEventListener("pointerdown", closeOutside)
  menu.addEventListener("focusout", closeOnFocusLeave)
  windowTarget.addEventListener("pageshow", closeOnPageShow)
  return () => {
    documentTarget.removeEventListener("pointerdown", closeOutside)
    menu.removeEventListener("focusout", closeOnFocusLeave)
    windowTarget.removeEventListener("pageshow", closeOnPageShow)
  }
}

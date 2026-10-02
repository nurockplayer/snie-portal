import assert from "node:assert/strict"
import test from "node:test"
import { bindMenuDismissal } from "../src/components/menu-dismissal.mjs"

class Events {
  handlers = new Map()
  addEventListener(type, handler) { this.handlers.set(type, handler) }
  removeEventListener(type, handler) { if (this.handlers.get(type) === handler) this.handlers.delete(type) }
  emit(type, event = {}) { this.handlers.get(type)?.(event) }
}
function setup() {
  const inside = {}
  const menu = Object.assign(new Events(), { open: true, contains: (target) => target === inside })
  const doc = new Events()
  const win = new Events()
  const cleanup = bindMenuDismissal(menu, doc, win)
  return { menu, doc, win, inside, cleanup }
}
test("keeps the menu open while focus moves between its own controls", () => {
  const { menu, inside } = setup()
  menu.emit("focusout", { relatedTarget: inside })
  assert.equal(menu.open, true)
})
test("closes on Tab or Shift+Tab leaving the menu, including focus leaving the document", () => {
  const { menu } = setup()
  for (const relatedTarget of [{}, null]) {
    menu.open = true
    menu.emit("focusout", { relatedTarget })
    assert.equal(menu.open, false)
  }
})
test("closes an open menu when a page is restored from browser history", () => {
  const { menu, win } = setup()
  win.emit("pageshow", { persisted: true })
  assert.equal(menu.open, false)
})
test("outside pointer dismissal preserves inside interactions", () => {
  const { menu, doc, inside } = setup()
  doc.emit("pointerdown", { target: inside })
  assert.equal(menu.open, true)
  doc.emit("pointerdown", { target: {} })
  assert.equal(menu.open, false)
})
test("cleans up every dismissal listener", () => {
  const { menu, doc, win, cleanup } = setup()
  cleanup()
  assert.equal(menu.handlers.size + doc.handlers.size + win.handlers.size, 0)
})

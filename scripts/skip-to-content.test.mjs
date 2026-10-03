import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import { skipToContent } from "../src/components/skip-to-content.mjs"

function setup(overrides = {}) {
  const calls = []
  const main = {
    focus: (options) => calls.push(["focus", options]),
    scrollIntoView: (options) => calls.push(["scroll", options]),
  }
  const document = {
    getElementById: (id) => {
      assert.equal(id, "main-content")
      return main
    },
    // Neither the URL nor router state should be changed by a skip action.
    get defaultView() { assert.fail("skip must not access window/history") },
  }
  const event = {
    button: 0, detail: 0, defaultPrevented: false,
    metaKey: false, ctrlKey: false, shiftKey: false, altKey: false,
    currentTarget: { ownerDocument: document },
    preventDefault: () => calls.push(["preventDefault"]),
    ...overrides,
  }
  return { calls, document, event }
}

const expectedCalls = [
  ["preventDefault"],
  ["focus", { preventScroll: true }],
  ["scroll", { block: "start" }],
]

test("keyboard activation focuses the main landmark and scrolls without native hash navigation", () => {
  const { calls, event } = setup()
  skipToContent(event)
  assert.deepEqual(calls, expectedCalls)
})

test("ordinary pointer activation has the same accessible behavior", () => {
  const { calls, event } = setup({ detail: 1 })
  skipToContent(event)
  assert.deepEqual(calls, expectedCalls)
})

test("repeated activation always focuses and scrolls, without timers or duplicate history entries", () => {
  const { calls, event } = setup()
  for (let count = 0; count < 3; count++) skipToContent(event)
  assert.deepEqual(calls, [...expectedCalls, ...expectedCalls, ...expectedCalls])
})

test("activation uses the current document target after another navigation", () => {
  const { calls, document, event } = setup()
  skipToContent(event)
  document.getElementById = () => ({
    focus: () => calls.push(["new focus"]),
    scrollIntoView: () => calls.push(["new scroll"]),
  })
  skipToContent(event)
  assert.deepEqual(calls, [...expectedCalls, ["preventDefault"], ["new focus"], ["new scroll"]])
})

test("modified clicks, non-primary clicks and canceled events keep native behavior", () => {
  for (const override of [
    { metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true },
    { button: 1 }, { button: 2 }, { defaultPrevented: true },
  ]) {
    const { calls, event } = setup(override)
    skipToContent(event)
    assert.deepEqual(calls, [], JSON.stringify(override))
  }
})

test("a missing target does not swallow the anchor fallback", () => {
  const { calls, document, event } = setup()
  document.getElementById = () => null
  skipToContent(event)
  assert.deepEqual(calls, [])
})

test("the shared layout keeps a localized real anchor and a programmatically focusable main", () => {
  const component = fs.readFileSync(new URL("../src/components/SkipLink.tsx", import.meta.url), "utf8")
  const layout = fs.readFileSync(new URL("../src/app/(site)/[locale]/layout.tsx", import.meta.url), "utf8")
  assert.match(component, /<a\s+className="skip-link"\s+href="#main-content"\s+onClick=\{skipToContent\}/)
  assert.match(layout, /<SkipLink>\s*\{dict\.accessibility\.skipToContent\}\s*<\/SkipLink>/)
  assert.match(layout, /<main\s+id="main-content"\s+tabIndex=\{-1\}/)
})

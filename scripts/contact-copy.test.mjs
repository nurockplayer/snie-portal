import test from "node:test"
import assert from "node:assert/strict"
import { copyPublishedHandle } from "../src/components/contact-copy.mjs"

test("copies only the exact published handle", async () => {
  const writes = []
  assert.equal(await copyPublishedHandle("@snie.2024", { writeText: async (value) => { writes.push(value) } }, () => assert.fail("no fallback on success")), "copied")
  assert.deepEqual(writes, ["@snie.2024"])
})
test("selects the visible handle if clipboard is absent", async () => {
  let selected = false
  assert.equal(await copyPublishedHandle("@SNIE_2024", undefined, () => { selected = true }), "select")
  assert.equal(selected, true)
})
test("handles denied clipboard access without claiming success", async () => {
  let selected = false
  assert.equal(await copyPublishedHandle("@SNIE_2024", { writeText: async () => { throw new Error("Denied") } }, () => { selected = true }), "select")
  assert.equal(selected, true)
})

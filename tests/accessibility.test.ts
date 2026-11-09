// Dashboard and navigation accessibility (R8). Source checks only: rendering is covered by R11.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const page = readFileSync("app/dashboard/page.tsx", "utf8")
const hero = readFileSync("components/web3media-hero.tsx", "utf8")

test("every dashboard input has a label tied to it", () => {
  const inputs = [...page.matchAll(/<input\b[\s\S]*?\/>/g)].map((m) => m[0])
  assert.ok(inputs.length >= 2)
  for (const input of inputs) {
    const id = input.match(/\bid="([\w-]+)"/)?.[1]
    assert.ok(id, `input has no id: ${input}`)
    assert.match(page, new RegExp(`<label htmlFor="${id}"`), `no label for #${id}`)
  }
  assert.doesNotMatch(page, /placeholder=/, "a placeholder is not a label")
})

test("status messages go through a live region that is always mounted", () => {
  assert.match(page, /role="status" aria-live="polite"/)
  assert.doesNotMatch(page, /\{status && \(\s*<(motion\.)?div/, "a region added with its message is often not announced")
  assert.equal(page.match(/<StatusRegion\b/g)?.length, 2, "both dashboard states need it")
})

test("the dashboard grid stacks on phones and styles follow the theme", () => {
  assert.match(page, /grid-cols-1[^"]*md:grid-cols-2/)
  assert.doesNotMatch(page, /gridTemplateColumns/)
  assert.doesNotMatch(page, /\bstyle=\{\{/, "inline colours ignore the light and dark themes")
})

test("the landing navigation is not hidden on small screens", () => {
  const nav = hero.match(/<nav className="([^"]*)"/)?.[1]
  assert.ok(nav)
  assert.doesNotMatch(nav, /(^|\s)hidden(\s|$)/)
})

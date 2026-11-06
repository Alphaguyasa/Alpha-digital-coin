// Dead links and controls (R6): every link on the site goes somewhere real.
import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"

const root = new URL("..", import.meta.url).pathname
const read = (path: string) => readFileSync(root + path, "utf8")
const siteFiles = execFileSync("git", ["ls-files", "app", "components"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter((path) => /\.tsx?$/.test(path))
const site = siteFiles.map((path) => ({ path, text: read(path) }))

test("every in-page link on the landing page points to an id that exists", () => {
  const page = read("app/page.tsx")
  const anchors = [...page.matchAll(/href: "#([\w-]+)"/g)].map((m) => m[1])
  assert.ok(anchors.length >= 4, "the landing navigation should link to its sections")
  const ids = new Set(site.flatMap(({ text }) => [...text.matchAll(/\bid="([\w-]+)"/g)].map((m) => m[1])))
  for (const anchor of anchors) assert.ok(ids.has(anchor), `#${anchor} has no element with that id`)
})

test("every internal route that is linked or pushed has a page", () => {
  const routes = new Set<string>()
  for (const { text } of site) {
    for (const m of text.matchAll(/(?:href=|Url=|push\()\{?["'`](\/[\w/-]*)["'`]/g)) routes.add(m[1])
  }
  for (const route of routes) {
    const page = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`
    assert.ok(existsSync(root + page), `${route} is linked but ${page} does not exist`)
  }
})

test("no control is a placeholder that only logs or goes nowhere", () => {
  for (const { path, text } of site) {
    assert.doesNotMatch(text, /onClick:\s*\(\)\s*=>\s*console\.log/, `${path} has a control that only logs`)
    assert.doesNotMatch(text, /href=["']#["']/, `${path} has a link to "#"`)
  }
})

test("the site does not refer to Terms or Privacy pages that do not exist (A8)", () => {
  for (const { path, text } of site) {
    if (/Terms and Conditions|Privacy Policy/i.test(text)) {
      assert.ok(existsSync(root + "app/terms/page.tsx") && existsSync(root + "app/privacy/page.tsx"), path)
    }
  }
})

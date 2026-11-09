// Renders the real dashboard page in jsdom with the canister calls replaced (R11). The page is
// bundled with esbuild first, because node:test cannot load JSX or the "@/" import paths.
import { test, afterEach, before } from "node:test"
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { build } from "esbuild"
import { JSDOM } from "jsdom"

const outfile = resolve("node_modules/.cache/dashboard-render/page.cjs")
const stub = resolve("tests/support/canister-stub.ts")
const principalText = "rrkah-fqaaa-aaaaa-aaaaq-cai"

type Canister = {
  network: { ok: boolean; error?: string }
  authenticated: boolean
  principalText: string
  balance: () => Promise<bigint>
  claim: () => Promise<string>
  transfer: (to: string, amount: bigint) => Promise<string>
}

const signedIn = (overrides: Partial<Canister> = {}): Canister => ({
  network: { ok: true },
  authenticated: true,
  principalText,
  balance: async () => BigInt(1234),
  claim: async () => "success",
  transfer: async () => "success",
  ...overrides,
})

function useCanister(canister: Canister) {
  ;(globalThis as unknown as { __canister: Canister }).__canister = canister
}

// Assigned in before(): the DOM globals must exist before React and the testing library load.
let rtl: typeof import("@testing-library/react")
let Page: () => unknown
let createElement: typeof import("react").createElement

before(async () => {
  mkdirSync(dirname(outfile), { recursive: true })
  await build({
    entryPoints: ["app/dashboard/page.tsx"],
    outfile,
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    jsx: "automatic",
    logLevel: "error",
    plugins: [
      {
        name: "canister-stub",
        setup(b) {
          b.onResolve({ filter: /^@\/lib\/canister$/ }, () => ({ path: stub }))
        },
      },
    ],
  })

  const dom = new JSDOM("<!doctype html><body></body>", { url: "http://localhost/", pretendToBeVisual: true })
  const g = globalThis as unknown as Record<string, unknown>
  g.window = dom.window
  g.document = dom.window.document
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true })
  for (const name of ["HTMLElement", "Element", "Node", "Event", "MutationObserver", "getComputedStyle"]) {
    g[name] = (dom.window as unknown as Record<string, unknown>)[name]
  }
  g.requestAnimationFrame = (fn: (t: number) => void) => setTimeout(() => fn(Date.now()), 0)
  g.cancelAnimationFrame = (id: ReturnType<typeof setTimeout>) => clearTimeout(id)

  // The page logs failures on purpose; the tests assert what the person sees instead.
  console.error = () => {}

  const require = createRequire(import.meta.url)
  rtl = await import("@testing-library/react")
  createElement = (await import("react")).createElement
  Page = (require(outfile) as { default: () => unknown }).default
})

afterEach(() => rtl.cleanup())

function show() {
  return rtl.render(createElement(Page as () => null))
}

const fill = (id: string, value: string) =>
  rtl.fireEvent.change(document.getElementById(id) as HTMLElement, { target: { value } })

const button = (name: RegExp) => rtl.screen.getByRole("button", { name })

const statusText = () => rtl.screen.getByRole("status").textContent

test("signed out: offers to connect", async () => {
  useCanister(signedIn({ authenticated: false }))
  show()
  await rtl.waitFor(() => button(/connect wallet/i))
  assert.equal(rtl.screen.queryByLabelText(/recipient/i), null)
})

test("unconfigured build: shows the error and no connect button", () => {
  useCanister(signedIn({ authenticated: false, network: { ok: false, error: "No canister ID." } }))
  show()
  assert.match(rtl.screen.getByRole("alert").textContent ?? "", /not configured.*No canister ID/)
  assert.equal(rtl.screen.queryByRole("button", { name: /connect wallet/i }), null)
})

test("signed in: shows the balance and principal", async () => {
  useCanister(signedIn())
  show()
  await rtl.screen.findByText("1,234 ALPHA")
  rtl.screen.getByText(principalText)
})

test("signed in: a balance that cannot be read is never shown as zero", async () => {
  useCanister(signedIn({ balance: async () => { throw new Error("Failed to fetch") } }))
  show()
  await rtl.screen.findByText("Unavailable")
  assert.equal(rtl.screen.queryByText(/^0 ALPHA$/), null)
})

test("claim: announces success and refreshes the balance", async () => {
  let balance = BigInt(0)
  useCanister(signedIn({ balance: async () => balance, claim: async () => { balance = BigInt(10000); return "success" } }))
  show()
  await rtl.screen.findByText("0 ALPHA")
  rtl.fireEvent.click(button(/claim 10,000/i))
  await rtl.screen.findByText("10,000 ALPHA")
  assert.match(statusText() ?? "", /claimed/)
})

test("claim: while the call runs the buttons are disabled, and it ends on failure", async () => {
  let fail: (e: Error) => void = () => {}
  useCanister(signedIn({ claim: () => new Promise((_resolve, reject) => { fail = reject }) }))
  show()
  await rtl.screen.findByText("1,234 ALPHA")
  rtl.fireEvent.click(button(/claim 10,000/i))
  assert.equal((await rtl.waitFor(() => button(/processing/i)) as HTMLButtonElement).disabled, true)
  fail(new Error("Failed to fetch"))
  await rtl.waitFor(() => assert.match(statusText() ?? "", /did not answer/))
  assert.equal((button(/claim 10,000/i) as HTMLButtonElement).disabled, false)
})

test("claim: a refusal from the canister gets a plain message", async () => {
  useCanister(signedIn({ claim: async () => "Already claimed" }))
  show()
  await rtl.screen.findByText("1,234 ALPHA")
  rtl.fireEvent.click(button(/claim 10,000/i))
  await rtl.waitFor(() => assert.match(statusText() ?? "", /already claimed its test tokens/))
})

test("send: a bad recipient or amount is refused before any call", async () => {
  let calls = 0
  useCanister(signedIn({ transfer: async () => { calls++; return "success" } }))
  show()
  await rtl.screen.findByText("1,234 ALPHA")
  fill("recipient", "not a principal")
  fill("amount", "5")
  rtl.fireEvent.click(button(/^send$/i))
  await rtl.waitFor(() => assert.match(statusText() ?? "", /not a valid principal/))
  fill("recipient", principalText)
  fill("amount", "1.5")
  rtl.fireEvent.click(button(/^send$/i))
  await rtl.waitFor(() => assert.match(statusText() ?? "", /whole number of tokens/))
  assert.equal(calls, 0)
})

test("send: passes an exact bigint, clears the form and announces success", async () => {
  const sent: Array<[string, bigint]> = []
  useCanister(signedIn({ transfer: async (to, amount) => { sent.push([to, amount]); return "success" } }))
  show()
  await rtl.screen.findByText("1,234 ALPHA")
  fill("recipient", principalText)
  fill("amount", "9007199254740993")
  rtl.fireEvent.click(button(/^send$/i))
  await rtl.waitFor(() => assert.match(statusText() ?? "", /Sent 9,007,199,254,740,993 ALPHA/))
  assert.deepEqual(sent, [[principalText, BigInt("9007199254740993")]])
  assert.equal((document.getElementById("amount") as HTMLInputElement).value, "")
})

test("send: a network failure does not claim either outcome", async () => {
  useCanister(signedIn({ transfer: async () => { throw new Error("Failed to fetch") } }))
  show()
  await rtl.screen.findByText("1,234 ALPHA")
  fill("recipient", principalText)
  fill("amount", "5")
  rtl.fireEvent.click(button(/^send$/i))
  await rtl.waitFor(() => assert.match(statusText() ?? "", /Check your balance before sending again/))
})

test("polling: no read while the tab is hidden, one read on return", async () => {
  let reads = 0
  useCanister(signedIn({ balance: async () => { reads++; return BigInt(1234) } }))
  show()
  await rtl.screen.findByText("1,234 ALPHA")
  const setHidden = (value: boolean) => {
    Object.defineProperty(document, "hidden", { value, configurable: true })
    document.dispatchEvent(new (globalThis as unknown as { Event: typeof Event }).Event("visibilitychange"))
  }
  const before = reads
  setHidden(true)
  await new Promise((r) => setTimeout(r, 30))
  assert.equal(reads, before)
  setHidden(false)
  await rtl.waitFor(() => assert.equal(reads, before + 1))
  Object.defineProperty(document, "hidden", { value: false, configurable: true })
})

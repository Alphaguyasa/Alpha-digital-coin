// Dashboard error handling (R5): every failure ends with a message, and a failed balance
// read never looks like a zero balance.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { formatAmount } from "../lib/amount.ts"
import { balanceLabel, canisterMessage, failureMessage, parseRecipient } from "../lib/dashboard.ts"

// A throwaway local canister ID, used here only as a well-formed principal.
const VALID = "uxrrr-q7777-77774-qaaaq-cai"

test("a valid principal is accepted, with spaces trimmed", () => {
  const result = parseRecipient(`  ${VALID}  `)
  assert.ok(result.ok)
  if (result.ok) assert.equal(result.value.toText(), VALID)
})

test("empty, malformed and anonymous recipients are rejected with a message", () => {
  for (const input of ["", "   ", "abc", "not a principal", `${VALID}x`, "uxrrr-q7777-77774-qaaaq-caj"]) {
    const result = parseRecipient(input)
    assert.equal(result.ok, false, `expected "${input}" to be rejected`)
    if (!result.ok) assert.ok(result.error.length > 0)
  }
  const anonymous = parseRecipient("2vxsx-fae")
  assert.equal(anonymous.ok, false)
  if (!anonymous.ok) assert.match(anonymous.error, /anonymous/)
})

test("every canister result string has a plain message, and unknown ones pass through", () => {
  const ledger = readFileSync(new URL("../src/token/Ledger.mo", import.meta.url), "utf8")
  const results = [...ledger.matchAll(/public let \w+ = "([^"]+)";/g)].map((m) => m[1])
  assert.ok(results.includes("success"))
  for (const result of results.filter((r) => r !== "success")) {
    assert.notEqual(canisterMessage(result), result, `no plain message for "${result}"`)
  }
  assert.equal(canisterMessage("Something new"), "Something new")
})

test("a thrown error gives a short message that names the action and hides the detail", () => {
  const offline = failureMessage("claim", new TypeError("Failed to fetch"))
  assert.match(offline, /Could not claim/)
  assert.match(offline, /local replica/)
  const other = failureMessage("send", new Error("Certificate verification error: 0xdeadbeef…"))
  assert.match(other, /Could not send/)
  assert.doesNotMatch(other, /deadbeef/)
  assert.match(failureMessage("sign in", "a string"), /Could not sign in/)
  assert.match(failureMessage("load your balance", undefined), /Could not load your balance/)
})

test("a failed balance read never shows as zero", () => {
  assert.deepEqual(balanceLabel(null, false, formatAmount), { text: "Loading…", note: null })
  const failedFirst = balanceLabel(null, true, formatAmount)
  assert.equal(failedFirst.text, "Unavailable")
  assert.ok(failedFirst.note)
  const stale = balanceLabel(BigInt(10000), true, formatAmount)
  assert.equal(stale.text, "10,000 ALPHA")
  assert.match(stale.note ?? "", /last balance/)
  assert.deepEqual(balanceLabel(BigInt(0), false, formatAmount), { text: "0 ALPHA", note: null })
})

test("the dashboard wraps each canister call so loading always ends", () => {
  const page = readFileSync(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8")
  for (const call of ["await login()", "await claim()", "await transfer("]) {
    const at = page.indexOf(call)
    assert.ok(at > 0, `${call} not found`)
    const before = page.slice(Math.max(0, at - 200), at)
    const after = page.slice(at, at + 1200)
    assert.match(before, /try \{/, `${call} is not inside try`)
    assert.match(after, /finally \{\s*setLoading\(false\)/, `${call} has no finally that ends loading`)
  }
  assert.doesNotMatch(page, /setBalance\(null\);\s*\}\s*\}, \[\]\)/, "a failed fetch must not clear the balance")
})

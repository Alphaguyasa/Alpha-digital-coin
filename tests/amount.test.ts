// Amount parsing and display (R3). Amounts must stay exact integers: no floating point.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { formatAmount, MAX_AMOUNT_DIGITS, parseAmount } from "../lib/amount.ts"

const value = (input: string) => {
  const result = parseAmount(input)
  assert.ok(result.ok, `expected "${input}" to parse`)
  return result.value
}

const rejects = (input: string) => {
  const result = parseAmount(input)
  assert.equal(result.ok, false, `expected "${input}" to be rejected`)
  if (!result.ok) assert.ok(result.error.length > 0)
}

test("plain whole numbers parse to the exact bigint", () => {
  assert.equal(value("1"), BigInt(1))
  assert.equal(value("10000"), BigInt(10000))
  assert.equal(value("  42  "), BigInt(42))
  assert.equal(value("007"), BigInt(7))
})

test("comma groups of three are accepted", () => {
  assert.equal(value("10,000"), BigInt(10000))
  assert.equal(value("1,234,567"), BigInt(1234567))
})

test("amounts above 2^53 keep every digit", () => {
  // 2^53 + 1 is the first integer a JavaScript number cannot hold.
  assert.equal(value("9007199254740993"), BigInt("9007199254740993"))
  assert.notEqual(Number("9007199254740993").toString(), "9007199254740993")
  // The owner's whole supply in the canister.
  assert.equal(value("100000000000000000"), BigInt("100000000000000000"))
})

test("fractions, signs, exponents and junk are rejected", () => {
  for (const input of [
    "1.5", "0.1", "1.", ".5", "-1", "+1", "1e3", "1E3", "0x10", "Infinity", "NaN",
    "abc", "12abc", "1 000", "1_000", "١٢٣", "1,00", "10,0000", ",100", "100,",
  ]) {
    rejects(input)
  }
})

test("empty and zero are rejected", () => {
  for (const input of ["", "   ", "0", "000", "0,000"]) rejects(input)
})

test("absurdly long input is rejected before BigInt sees it", () => {
  rejects("9".repeat(MAX_AMOUNT_DIGITS + 1))
  rejects("1".repeat(100_000))
  assert.equal(value("9".repeat(MAX_AMOUNT_DIGITS)), BigInt("9".repeat(MAX_AMOUNT_DIGITS)))
  // Leading zeros do not count against the limit.
  assert.equal(value("0".repeat(5) + "1"), BigInt(1))
})

test("formatAmount is exact at any size", () => {
  assert.equal(formatAmount(BigInt(0)), "0")
  assert.equal(formatAmount(BigInt(999)), "999")
  assert.equal(formatAmount(BigInt(1000)), "1,000")
  assert.equal(formatAmount(BigInt("9007199254740993")), "9,007,199,254,740,993")
  assert.equal(formatAmount(BigInt("100000000000000000")), "100,000,000,000,000,000")
})

test("format and parse round-trip", () => {
  for (const n of ["1", "1000", "123456789", "9007199254740993"]) {
    assert.equal(value(formatAmount(BigInt(n))), BigInt(n))
  }
})

test("the frontend never turns an amount into a number", () => {
  const canister = readFileSync("lib/canister.ts", "utf8")
  assert.match(canister, /amount: bigint/)
  assert.doesNotMatch(canister, /amount: number/)
  const dashboard = readFileSync("app/dashboard/page.tsx", "utf8")
  assert.doesNotMatch(dashboard, /Number\(\s*(amount|balance)/)
  assert.doesNotMatch(dashboard, /parseFloat|parseInt/)
  assert.doesNotMatch(dashboard, /type="number"/, "a number input allows 1.5 and 1e3")
  assert.match(dashboard, /parseAmount\(/)
})

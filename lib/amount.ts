// Token amounts are whole numbers of the smallest unit: the canister uses Nat and has no
// decimals. They are handled as bigint end to end, never as a JavaScript number, which
// loses precision above 2^53 and allows fractions.

// A Nat can be any size, but no real input needs more digits than this. The cap keeps a
// pasted megabyte of digits from reaching BigInt or the canister.
export const MAX_AMOUNT_DIGITS = 30

export type AmountResult =
  | { ok: true; value: bigint }
  | { ok: false; error: string }

// Reads what a person typed in the amount field. Accepts plain digits, with optional
// spaces around them and commas between groups of three ("10,000"). Rejects everything
// else, including zero, signs, decimals and exponents ("1.5", "-1", "1e3").
export function parseAmount(input: string): AmountResult {
  const text = input.trim()
  if (text === "") return { ok: false, error: "Enter an amount." }
  if (!/^(\d+|\d{1,3}(,\d{3})+)$/.test(text)) {
    return {
      ok: false,
      error: "Enter a whole number of tokens, with no decimals or signs.",
    }
  }
  const digits = text.replace(/,/g, "").replace(/^0+(?=\d)/, "")
  if (digits.length > MAX_AMOUNT_DIGITS) {
    return { ok: false, error: "That amount is too large." }
  }
  const value = BigInt(digits)
  if (value === BigInt(0)) {
    return { ok: false, error: "Enter an amount greater than zero." }
  }
  return { ok: true, value }
}

// Shows an amount with thousands separators, exactly, at any size.
export function formatAmount(value: bigint): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

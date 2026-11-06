// Dashboard messages and checks (R5), kept free of React so node:test can cover them.
// Every call the dashboard makes can fail: the replica can be down, the identity can
// expire, the person can type a bad principal. Each failure must end the loading state
// and say what happened, and a failed balance read must never look like a zero balance.
import { Principal } from "@dfinity/principal"

export type Status = { msg: string; ok: boolean }

export type RecipientResult =
  | { ok: true; value: Principal }
  | { ok: false; error: string }

// Reads the recipient field. Rejects empty input, text that is not a principal, and the
// anonymous principal, which the canister refuses anyway.
export function parseRecipient(input: string): RecipientResult {
  const text = input.trim()
  if (text === "") return { ok: false, error: "Enter the recipient's principal ID." }
  let value: Principal
  try {
    value = Principal.fromText(text)
  } catch {
    return { ok: false, error: "That is not a valid principal ID. Check it and try again." }
  }
  if (value.isAnonymous()) {
    return { ok: false, error: "You cannot send tokens to the anonymous principal." }
  }
  return { ok: true, value }
}

// The canister answers claim and transfer with "success" or one of these strings (see
// src/token/Ledger.mo). Known ones get a plain explanation; anything else is shown as is.
const CANISTER_MESSAGES: Record<string, string> = {
  "Insufficient amount": "Not enough tokens for this.",
  "Already claimed": "This identity has already claimed its test tokens.",
  "Anonymous caller not allowed": "Your session has ended. Disconnect and sign in again.",
  "Invalid recipient": "That recipient cannot receive tokens.",
  "Invalid amount": "Enter an amount greater than zero.",
}

export function canisterMessage(result: string): string {
  return CANISTER_MESSAGES[result] ?? result
}

export type Action = "sign in" | "claim" | "send" | "load your balance"

// A thrown error from the agent or the network. The raw text is for the console only: it
// can be long and technical, so the person sees a short, fixed message.
export function failureMessage(action: Action, error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error)
  if (/fetch|network|ECONNREFUSED|Failed to connect|Load failed/i.test(detail)) {
    return `Could not ${action}: the token canister did not answer. Check that the local replica is running, then try again.`
  }
  return `Could not ${action}. Try again, and if it keeps failing, check the browser console.`
}

// What the balance card shows. null means no balance has been read yet.
export function balanceLabel(balance: bigint | null, failed: boolean, format: (v: bigint) => string): {
  text: string
  note: string | null
} {
  if (balance === null) {
    return failed
      ? { text: "Unavailable", note: "Could not read your balance. Retrying." }
      : { text: "Loading…", note: null }
  }
  return {
    text: `${format(balance)} ALPHA`,
    note: failed ? "Could not refresh. This is the last balance read." : null,
  }
}

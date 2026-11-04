# Roadmap

Priority: P0 (money or policy at risk), P1 (broken or misleading), P2 (quality), P3 (later).
Effort: S (under an hour), M (a run), L (several runs). Take the top open item.

## Open

### R1. [P0 · M] Make `transfer` and `claim` safe
`transfer` awaits self-calls in the middle of updating balances, so another message can run in
between: two parallel transfers can spend the same balance, and a credit can be lost. The
anonymous principal can claim and move tokens. Receiving a transfer, even of 0, blocks a later
claim. Move the rules into a module with no `await`, keep the public API, keep balances across
upgrades, and test double spend, access control and upgrades.

### R2. [P0 · M] Remove price and false claims from the site
The dashboard formats the balance as US dollars with a percentage and a "1X" leverage badge.
The landing page advertises a "public sale", "Get Alpha Coin", "Buy", ICRC-1, Plug Wallet,
on-chain history, holder governance, vesting and cold storage: none of it exists, and it invites
the public in. Show the balance as a plain token count, make the copy match the code, add a
visible "experimental, not financial advice" notice, and add a test that keeps it that way.

### R3. [P1 · S] Integer amounts in the frontend
`lib/canister.ts` takes `amount: number`, and the dashboard uses `Number(amount)` and
`Number(balance)`. Amounts above 2^53 lose precision, and `1.5` throws an unhandled error. Parse
input into `bigint` in a pure, tested function.

### R4. [P1 · M] Explicit network configuration that fails closed
A production build talks to mainnet (`ic0.app`, `identity.ic0.app`) using a local canister ID.
The local Internet Identity ID in `lib/canister.ts` is also out of date, and `CANISTER_ID` has to
be hand-edited after every deploy. Read both from `NEXT_PUBLIC_*` at build time, default to local,
and refuse to start with no canister ID.

### R5. [P1 · S] Dashboard error handling
`handleClaim` and `handleTransfer` have no `try`: a rejected call or a bad principal leaves
`loading` stuck and shows nothing. A failed balance fetch looks like a zero balance. Login
failure is silent.

### R6. [P1 · S] Dead links and controls
"Terms and Conditions" and "Privacy Policy" link to pages that do not exist (see A8). Landing nav
items only `console.log`. The "Get ALPHA" and final "Connect Wallet" buttons do nothing.

### R7. [P2 · S] Remove dead code and unused dependencies
`@icp-sdk/auth` and `@icp-sdk/core` appear unused next to `@dfinity/*`. `shadcn` is a CLI in
runtime dependencies. There are unused wallet icons in `connect-wallet-modal.tsx`, and the
`package.json` name is still `next-app`. Confirm each before removing.

### R8. [P2 · S] Dashboard layout and accessibility
The two-column grid is fixed and breaks on phones. Inputs have placeholders but no labels. The
status message is not announced to screen readers. Inline styles ignore the theme.

### R9. [P2 · S] Stop polling when the tab is hidden
The dashboard fetches the balance every 5 seconds, always. Pause when hidden and back off on
errors.

### R10. [P2 · S] Self-host the about-section image
`about-us-section.tsx` hot-links an Unsplash image, which leaks visitors' IPs to a third party
and breaks offline. Replace it with a local asset or remove it.

### R11. [P2 · M] Frontend test coverage
Add component tests for the dashboard's states: signed out, signed in, loading, each error. This
needs a test renderer, so check licences and audit first.

### R12. [P2 · S] Add CodeQL for the TypeScript code
Free on public repos. Fix or document each finding.

### R13. [P3 · M] Claim abuse limits
Each new Internet Identity gets free tokens, so one person can drain the reserve and grow canister
memory (Sybil). This only matters on a shared network: see A5 before building anything.

### R14. [P3 · L] ICRC-1 ledger (waits for A6)
Standard API, decimals, fee, memo, `created_at_time` deduplication (replay protection) and a
transaction log.

### R15. [P3 · S] Localization
All strings are English and hard-coded. Move them out and add Amharic when Alpha wants it.

## Done

- Repo setup: CI, release tags, context files, threat model (see `DAILY_LOG.md`).

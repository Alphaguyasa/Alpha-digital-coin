# Threat model

Scope: the token canister (`src/token/`), the dashboard (`app/dashboard/page.tsx`,
`lib/canister.ts`) and this repository. Every run keeps the status column current.

## What is being protected

- **Ledger integrity.** The sum of all balances never changes. Only the holder of a balance can
  spend it.
- **One claim per identity.**
- **Users' sessions.** Internet Identity delegations in browser storage.
- **Honesty.** The site must not imply price, returns or features that do not exist.
- **The repo.** No secrets, and no path from a merge to a mainnet deployment.

## Trust boundaries

| Boundary | Trust |
|---|---|
| Anyone → canister update and query calls | Untrusted. `msg.caller` is authenticated by the IC, nothing else is |
| Browser → canister | Untrusted input (recipient, amount) |
| Canister controller (a dfx identity) | Fully trusted: can replace the code and all balances |
| Hard-coded owner principal | Holds the whole reserve, see A2 |
| npm and dfx supply chain | Pinned by lockfile and by version plus checksum in CI |

## Threats

| ID | Threat | Status | Defence or plan |
|---|---|---|---|
| T1 | Double spend: parallel `transfer`s read one balance across an `await` | Fixed (R1) | No `await` in the canister, enforced by a policy test. Parallel tests in `scripts/test-canister.sh` |
| T2 | Lost credit: parallel transfers to one recipient overwrite each other | Fixed (R1) | Same as T1 |
| T3 | Debit committed, credit never runs (self-call fails after the first `await`) | Fixed (R1) | Same as T1 |
| T4 | Anonymous principal claims, or moves the shared anonymous balance | Fixed (R1) | Anonymous caller and recipient rejected |
| T5 | Griefing: a zero transfer to someone blocks their claim forever | Fixed (R1) | Claims tracked separately, zero amounts rejected |
| T6 | Overflow and underflow | Mitigated | Motoko `Nat` is unbounded, and a balance check precedes every subtraction. Tested in `tests/canister/Ledger.test.mo` |
| T7 | Rounding | Not applicable in the canister (whole units only). Fixed in the UI (R3) | `lib/amount.ts` parses input to `bigint`, rejects fractions, signs, exponents, zero and over-long input; tests in `tests/amount.test.ts` |
| T8 | Replay of a signed call | Partly mitigated | The IC rejects a duplicate ingress message within its expiry. A client retry after expiry is a new transfer, so there is no application-level dedup. Plan: R14 |
| T9 | Sybil drain of the claim reserve, memory growth | Open, accepted while local | R13, A5 |
| T10 | Loss of balances on upgrade | Mitigated | Stable storage. Upgrades tested, including from the old canister |
| T11 | Controller or owner key compromise: all funds | Open, accepted while local | A2 |
| T12 | Production build reaches mainnet by accident | Fixed (R4) | `lib/network.ts` accepts only network `local` and hosts on this machine, refuses a build with no canister IDs, and is the only reason `fetchRootKey` is safe. Tests in `tests/network.test.ts` |
| T13 | Sending to a principal nobody controls | Accepted | Same as any ledger. The UI should confirm (R5) |
| T14 | Misleading site copy | Fixed (R2) | Copy matches the code, notice on every page, policy test bans the old claims |
| T15 | XSS stealing the session | Low | React escaping, no `dangerouslySetInnerHTML`. No CSP yet (still to add) |
| T16 | Secret committed to the repo | Mitigated | `tests/policy.test.ts`, `.gitignore`. Public repo: treat anything pushed as leaked |
| T17 | Vulnerable dependency | Mitigated | `npm audit` fails CI at high or above |
| T18 | Malicious PR changes CI to reach secrets | Mitigated | CI has a read-only token and no secrets. `pull_request` only, not `pull_request_target` |
| T19 | Automated job deploys or spends | Mitigated | Policy test forbids mainnet flags in `scripts/`, workflows and `package.json`. No keys exist in CI |

## Out of scope for now

Canister cycle exhaustion and denial of service on mainnet: nothing runs there. Review before any
public deployment (A7).

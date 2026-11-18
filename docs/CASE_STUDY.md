# Case study: making a toy token honest and safe

Alpha Coin started in March 2026 as a weekend project: a Motoko token canister on the Internet
Computer, a Next.js dashboard and Internet Identity sign-in. It worked in a demo. In November 2026
it was reviewed as if real value could one day depend on it, and every finding was fixed or
written down as a decision. This page tells that story. The full list of items is in
[ROADMAP.md](../ROADMAP.md) and the threats are tracked in [THREAT_MODEL.md](../THREAT_MODEL.md).

The project is now frozen on purpose. It runs on a local replica only, has no price and is not
an investment. See "Why it stops here" below.

## Where it started

- `transfer` read the sender's balance, then `await`ed two calls to itself while updating
  balances. Other messages could run in between.
- The dashboard showed the token balance as **US dollars**, with a percentage change and a
  leverage badge. The landing page advertised a public sale, buying, ICRC-1, Plug Wallet, holder
  governance, vesting and cold storage. None of it existed.
- Amounts went through JavaScript `Number`, so large values lost digits and `1.5` crashed the page.
- The network was guessed at runtime, so a production build could talk to mainnet by accident.
- `npm audit` reported 43 vulnerabilities, 2 of them critical and 16 high.

## Three before and after examples

### 1. Double spend in `transfer` (R1, threats T1 to T5)

Before (`src/token/main.mo`):

```motoko
public shared ({ caller }) func transfer(to : Principal, amount : Nat) : async Text {
  let fromBalance = await balanceOf(caller);
  if (fromBalance >= amount) {
    balances.put(caller, fromBalance - amount);
    let toBalance = await balanceOf(to);
    balances.put(to, toBalance + amount);
    return "success";
  } ...
```

Each `await` is a point where the canister handles other messages. Tests on a local replica,
run against this code before the fix, showed:

- three parallel transfers of one 10,000 balance paid out 30,000 in total;
- eight parallel transfers of a 10,000 balance all reported success;
- four parallel credits of 1,000 to one account arrived as 1,000;
- the anonymous principal could claim and transfer.

After (`src/token/Ledger.mo`): the balance rules live in a module with no `await` at all, so each
transfer runs start to finish in one message.

```motoko
public func transfer(balances : Balances, from : Principal, to : Principal, amount : Nat) : Text {
  if (Principal.isAnonymous(from)) return anonymousCaller;
  if (Principal.isAnonymous(to)) return invalidRecipient;
  if (amount == 0) return invalidAmount;
  if (balanceOf(balances, from) < amount) return insufficient;
  move(balances, from, to, amount);
  success;
};
```

What keeps it fixed: a policy test fails the build if `await` appears in the canister again, and
`scripts/test-canister.sh` repeats the parallel attacks on a replica in CI ("exactly one parallel
transfer succeeds", "every parallel credit arrives"). Claims are tracked separately, so receiving
tokens no longer uses up someone's claim, and an upgrade from the old canister keeps balances.

### 2. A fake price on the dashboard (R2, threat T14)

Before: `components/ui/asset-card.tsx` took `currentPrice`, `percentageChange`,
`portfolioValue` and `leverage` props and the dashboard filled them from the token balance:

```tsx
currentPrice={Number(balance ?? 0)}
...
<p>{formatCurrency(currentPrice, "USD")}</p>
```

A balance of 10,000 tokens was shown as $10,000. The landing page promised "instant on-chain
transfers" and a "fully non-custodial and secure" product.

After: the card is deleted. The dashboard shows a plain token count, the landing page describes
only what the code does and labels the planned split as a draft, and every page carries a notice
that this is experimental and not financial advice. A policy test bans the old claims, so they
cannot creep back in.

### 3. Amounts that lost digits (R3, threat T7)

Before (`app/dashboard/page.tsx` and `lib/canister.ts`):

```ts
const result = await transfer(toAddress, Number(amount));
...
return actor.transfer(toPrincipal, BigInt(amount));
```

Above 2^53 a JavaScript `Number` silently rounds, so the amount sent could differ from the amount
typed. A fraction such as `1.5` reached `BigInt()` and threw an unhandled error.

After: `lib/amount.ts` parses the text field straight into a `bigint` and rejects fractions,
signs, exponents, zero and over-long input with a plain message. `transfer()` only accepts a
`bigint`, and balances are formatted from `bigint` without passing through `Number`. Unit tests
in `tests/amount.test.ts` cover the edge cases.

## The rest of the work

| Item | Change |
|---|---|
| R4 | The network comes from build config. Only a local replica is accepted, and a build with no canister ID shows an error instead of guessing |
| R5 | Every dashboard call ends its loading state with a message. A failed balance read keeps the last balance, marked stale, instead of showing zero |
| R6 | Every link and control goes somewhere real |
| R7 | Unused dependencies and dead code removed; a test fails if a runtime dependency is never imported |
| R8 | Responsive, labelled, theme-aware dashboard with AA contrast and reduced-motion support |
| R9 | Balance polling pauses in hidden tabs and backs off on errors |
| R10 | No third-party image host; a test keeps it that way |
| R11 | The real dashboard page is rendered in jsdom in tests, covering each state and failure |
| R12 | CodeQL on every push and weekly: zero findings |
| R17 | `npm audit`: from 43 findings to zero |

## Results

- The parallel double-spend and lost-credit attacks fail on every CI run.
- No price, return or missing feature is claimed anywhere on the site.
- `npm audit`: 0 findings. CodeQL: 0 findings.
- CI builds the site, runs the TypeScript tests, compiles and lints the canister, and runs the
  canister tests on a replica.

## Why it stops here

Turning this into a real token would need a legal opinion for each country it could reach
(Ethiopia's rules on digital currency are unsettled), a decision on supply and ownership, an
ICRC-1 ledger with replay protection, limits on the free claim, and an independent audit. None of
that is worth starting without a reason to put the token in front of the public, and there is
none today. The remaining items (R13 to R16) are written down so the work can resume cleanly if
that changes.

What the project shows as it stands: finding and proving a concurrency bug in a canister, keeping
money as exact integers end to end, removing misleading claims and making sure they stay removed,
and taking a codebase's supply chain from 43 known vulnerabilities to none.

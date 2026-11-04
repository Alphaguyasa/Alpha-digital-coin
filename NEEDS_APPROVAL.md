# Needs approval

Decisions only Alpha can make. Nothing here blocks the daily work unless it says so. Each item has
a safe default that stays in force until Alpha answers.

## A1. Legal and regulatory advice (before any public step)
Digital-currency rules vary by country, including Ethiopia. **Questions for a qualified adviser:**
May a token like this be issued, offered free or promoted to people in Ethiopia? Does a free claim
count as an offering? Does the National Bank of Ethiopia or another regulator need to approve it or
be notified? What applies to users abroad?
**Default:** local only. Nothing is launched, promoted or offered.

## A2. Hard-coded owner principal holds the whole supply
`src/token/main.mo` gives 100,000,000,000,000,000 units to one hard-coded principal (`mufkn-…`). There
is no mint function, but this is a privileged pre-mint, and whoever controls that principal, or the
canister's controller, controls the ledger. No written justification exists yet.
**Question:** Is this the intended model? What should the owner be: an init argument, a governance
canister, or nobody?
**Default:** unchanged locally. It must be answered before any shared deployment.

## A3. Which supply is right?
The canister has 100,000,000,000,000,000. The landing page used to say 1,000,000,000 total and
400,000,000 circulating, with a 40/25/20/10/5 split, vesting and "cold storage". None of that exists
in code. Which supply and split, if any, do you want?
**Default:** the page shows the canister's real figures and labels the split as a draft, not implemented. The code stays.

## A4. Which symbol is right?
The canister returns `DAlpha`. The site says `ALPHA`. The repo says "Alpha Digital Coin", the site
"Alpha Coin".
**Default:** unchanged. The UI keeps "ALPHA".

## A5. The free claim would be an airdrop on any shared network
On a local replica it is a test faucet. On a public network, handing out 10,000 tokens per identity
is an airdrop, which the project rules forbid without approval.
**Default:** local only.

## A6. Should the token become ICRC-1?
The site used to claim it was. It is not: the API is custom, so wallets and tools will not work with it.
Doing it means new endpoints, decimals and a fee decision (R14).
**Default:** the site no longer makes the claim. No ledger rewrite until Alpha decides.

## A7. Mainnet deployment
Needs cycles, which cost real money (`DEPLOYMENT.md` estimates about $0.65 to deploy and $0.13 a month;
unverified). It also needs A1, A2, A3 and A5 answered first, and a security review.
**Alternative:** local replica only (free).
**Default:** never. `DEPLOYMENT.md` now says this at the top.

## A8. Terms and Privacy pages
The wallet dialog says "you agree to our Terms and Conditions and Privacy Policy", but neither exists.
They need legal input, so they will not be written without Alpha.
**Default:** R6 removes the sentence until real pages exist.

## A9. Model: stay on Opus 5.5, or use Fable 5.1?
Anthropic's models page recommends Opus 5.5 for most work and Fable 5.1 for "demanding reasoning", at
2.5 times the API price and slower. Fable reads as a tier above Opus, though the page does not use that
word. The policy is met by either. The routine uses Opus 5.5, the same as Alpha's other routines.
**Question:** Do you want Fable 5.1 for this project? It may use your plan's limits faster.

## A10. Your Portfolio routine also has this repo attached
The routine "Portfolio daily lead developer" (`trig_01CoguLJqDwGNYT5n5SM3wbs`) lists Alpha-digital-coin among
its 12 repositories. If it ever works on this repo, the two could collide.
**Question:** Should that routine leave this repo alone?
**Default:** nothing changed. Only you can change that routine; this project's runs will not touch it.

## A11. Turn on branch protection for main?
`main` is unprotected, and the repo is public. The merge policy is followed by discipline only, so a mistake
could push straight to main. Requiring the `web` and `canister` checks would enforce it. It is free.
**Question:** Do you want this? It changes repository settings, so it waits for you.
**Default:** unchanged.

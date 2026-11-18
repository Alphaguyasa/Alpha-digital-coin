# Alpha Coin - ICP Token Dashboard

> **Experimental software, not financial advice.** This is a learning and development project.
> The token has no price, promises no returns and is not an investment. It runs on a local
> development replica. Nothing here is an offer to buy, sell or use anything. Rules on digital
> currency vary by country, including Ethiopia, and have not been reviewed for this project.
> It has had no security audit.

A token dashboard built on the Internet Computer Protocol (ICP) with Internet Identity authentication.

## Project status: frozen

Development stopped on purpose in November 2026. The project is complete as a learning and
portfolio piece and is not heading for a public release. Only security maintenance continues:
CodeQL and dependency updates run weekly.

**Why it stops here.** A real token would need a legal opinion for every country it could reach
(Ethiopia's rules on digital currency are unsettled), a decision on supply and ownership, an ICRC-1
ledger with replay protection, limits on the free claim and an independent audit. There is no
reason to put this token in front of the public, so none of that has been started. The open items
in [ROADMAP.md](./ROADMAP.md) are written down so the work can resume cleanly.

**What it shows.**

- A double-spend bug in the canister found, proved on a replica (one 10,000 balance paid out
  30,000) and fixed, with the parallel attacks rerun on every CI build.
- Token amounts kept as exact integers from the input field to the canister.
- Every misleading claim removed from the site, including a balance shown as US dollars, and a
  test that stops them coming back.
- `npm audit` taken from 43 findings to zero, and CodeQL at zero.

The full story, with before and after code, is in [docs/CASE_STUDY.md](./docs/CASE_STUDY.md).
To try it locally, see [Quick demo](#quick-demo).

## Features

- 🔐 Internet Identity wallet authentication
- 💰 View Alpha Coin (ALPHA) token balance
- 🎁 Claim free tokens (10,000 ALPHA per wallet, one-time)
- 📤 Transfer tokens to other principals
- 🎨 Modern UI with smooth animations

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Motoko (Internet Computer)
- **Authentication**: Internet Identity
- **Blockchain**: Internet Computer Protocol (ICP)

## Local Development

### Prerequisites

- Node.js 22.18+ and npm
- dfx 0.32.0 (the version CI pins)

### Quick demo

With dfx installed, one command starts a fresh local replica, deploys the canisters, gives two
throwaway identities real balances and starts the dashboard:

```bash
npm install
npm run demo
```

Then open http://localhost:3000/dashboard. The replica starts with `--clean`, so earlier local
canister state is wiped. Stop it afterwards with `dfx stop`.

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Alpha-digital-coin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local ICP replica:**
   ```bash
   dfx start --clean --background
   ```

4. **Deploy canisters:**
   ```bash
   dfx deploy
   ```

5. **Canister IDs are picked up automatically:**
   - `dfx deploy` writes the token and Internet Identity canister IDs to `.env.local` (ignored by git)
   - The site reads them at build time, so restart `npm run dev` after a redeploy
   - The site talks to a local replica only. With no canister ID it shows an error instead of guessing

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open the app:**
   - Navigate to http://localhost:3000/dashboard
   - Or use the frontend canister URL from dfx deploy output

## Tests

```bash
npm test                 # policy checks and TypeScript unit tests
npm run check:canister   # Motoko compile check and static analysis (needs dfx)
npm run test:canister    # token canister tests on a local replica (needs dfx)
npm run demo -- --check  # demo setup and seeded balances, then stop (needs dfx)
```

## Deployment

This project is local only. [DEPLOYMENT.md](./DEPLOYMENT.md) describes mainnet steps for reference;
see the notice at the top of that file before using it.

## Project documents

[ROADMAP.md](./ROADMAP.md), [THREAT_MODEL.md](./THREAT_MODEL.md) and [docs/CASE_STUDY.md](./docs/CASE_STUDY.md).

## Project Structure

```
├── app/
│   ├── dashboard/          # Dashboard page
│   └── page.tsx           # Landing page
├── components/
│   └── ui/                # Reusable UI components
├── lib/
│   └── canister.ts        # ICP canister integration
├── src/
│   └── token/
│       └── main.mo        # Motoko token canister
├── dfx.json               # dfx configuration
└── next.config.mjs        # Next.js configuration
```

## Token Canister Functions

- `balanceOf(principal)` - Query token balance
- `getSymbol()` - Get token symbol ("DAlpha")
- `claim()` - Claim 10,000 free tokens (once per principal)
- `transfer(to, amount)` - Transfer tokens to another principal

## License

MIT

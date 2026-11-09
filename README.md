# Alpha Coin - ICP Token Dashboard

> **Experimental software, not financial advice.** This is a learning and development project.
> The token has no price, promises no returns and is not an investment. It runs on a local
> development replica. Nothing here is an offer to buy, sell or use anything. Rules on digital
> currency vary by country, including Ethiopia, and have not been reviewed for this project.
> It has had no security audit.

A token dashboard built on the Internet Computer Protocol (ICP) with Internet Identity authentication.

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
- dfx 0.30.1 or later

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
```

## Deployment

This project is local only. [DEPLOYMENT.md](./DEPLOYMENT.md) describes mainnet steps for reference;
see the notice at the top of that file before using it.

## Project documents

[ROADMAP.md](./ROADMAP.md) and [THREAT_MODEL.md](./THREAT_MODEL.md).

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

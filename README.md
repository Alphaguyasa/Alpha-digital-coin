# Alpha Coin - ICP Token Dashboard

A decentralized token dashboard built on the Internet Computer Protocol (ICP) with Internet Identity authentication.

## Features

- 🔐 Internet Identity wallet authentication
- 💰 View Alpha Coin (ALPHA) token balance
- 🎁 Claim free tokens (10,000 ALPHA per wallet, one-time)
- 📤 Transfer tokens to other principals
- 🎨 Modern UI with smooth animations

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Motoko (Internet Computer)
- **Authentication**: Internet Identity
- **Blockchain**: Internet Computer Protocol (ICP)

## Local Development

### Prerequisites

- Node.js 18+ and npm
- dfx 0.30.1 or later

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd next-app
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

5. **Update the canister ID:**
   - After deployment, copy the token canister ID from the output
   - Update `CANISTER_ID` in `lib/canister.ts` with your token canister ID

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open the app:**
   - Navigate to http://localhost:3000/dashboard
   - Or use the frontend canister URL from dfx deploy output

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to the Internet Computer mainnet.

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

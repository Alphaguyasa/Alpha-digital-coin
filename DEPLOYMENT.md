# Production Deployment Guide

> **Not approved.** This project is local only. Do not follow this guide until the questions in
> [NEEDS_APPROVAL.md](./NEEDS_APPROVAL.md) (A1, A2, A3, A5, A7) are answered. Deploying costs real
> money and would make a token publicly reachable. Automated runs never deploy to mainnet.

This guide explains how to deploy Alpha Coin to the Internet Computer mainnet.

## Prerequisites

- dfx 0.30.1 or later installed
- ICP tokens or cycles for deployment
- Your project built and tested locally

## Step 1: Get Cycles

You need cycles to deploy canisters to mainnet. Here are your options:

### Option A: Buy ICP and Convert to Cycles
1. Buy ICP on an exchange (Coinbase, Binance, Kraken, etc.)
2. Send ICP to your dfx identity principal:
   ```bash
   dfx identity get-principal
   ```
3. Convert ICP to cycles using the NNS dapp or cycles wallet

### Option B: Use a Cycles Coupon
- If you have a coupon from DFINITY events/hackathons, redeem it:
  ```bash
  dfx wallet redeem-faucet-coupon <COUPON_CODE>
  ```

### Option C: Community Support
- Ask in the [DFINITY Developer Forum](https://forum.dfinity.org/)
- Sometimes community members help new developers with initial cycles

## Step 2: Deploy to Mainnet

1. **Deploy the token canister:**
   ```bash
   dfx deploy --network ic token
   ```

2. **Get your mainnet canister ID:**
   ```bash
   dfx canister --network ic id token
   ```

3. **The frontend will refuse it.** `lib/network.ts` accepts only a local replica, so a
   mainnet canister ID or host shows an error. Changing that needs Alpha's approval (A7).

4. **Build the frontend:**
   ```bash
   npm run build
   ```

5. **Deploy the frontend assets:**
   ```bash
   dfx deploy --network ic token_assets
   ```

## Step 3: Access Your Live App

After deployment, you'll get a URL like:
```
https://<canister-id>.ic0.app
```

Your app is now live on the Internet Computer mainnet!

## Step 4: Update GitHub

Nothing to commit: canister IDs live in `.env.local`, which git ignores, not in the code.

## Environment Configuration

The app automatically detects the environment:
Dev and production builds behave the same: both use the local replica and local Internet
Identity, with canister IDs from `.env.local`. See `lib/network.ts`.

## Estimated Costs

- Initial deployment: ~0.5 TC (trillion cycles) ≈ $0.65 USD
- Monthly running costs: ~0.1 TC ≈ $0.13 USD (varies with usage)

## Troubleshooting

### "Insufficient cycles" error
- You need more cycles in your wallet
- Top up using: `dfx ledger top-up <canister-id> --amount <ICP_amount> --network ic`

### "Canister not found" error
- Make sure you're using the correct network flag: `--network ic`
- Verify your canister ID is correct

### Frontend not loading
- Check that `.env.local` has the canister IDs from your last `dfx deploy`
- Ensure you ran `npm run build` before deploying token_assets
- Clear browser cache and try again

## Support

- [DFINITY Developer Forum](https://forum.dfinity.org/)
- [Internet Computer Discord](https://discord.gg/jnjVVQaE2C)
- [DFINITY Documentation](https://internetcomputer.org/docs)

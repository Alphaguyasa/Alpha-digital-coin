# Production Deployment Guide

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

3. **Update the canister ID in your code:**
   - Open `lib/canister.ts`
   - Replace the `CANISTER_ID` value with your mainnet token canister ID
   ```typescript
   export const CANISTER_ID = "your-mainnet-canister-id-here";
   ```

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

Commit and push your changes:
```bash
git add lib/canister.ts
git commit -m "Update canister ID for mainnet deployment"
git push origin main
```

## Environment Configuration

The app automatically detects the environment:
- **Development** (`NODE_ENV=development`): Uses local replica and local Internet Identity
- **Production** (built with `npm run build`): Uses mainnet and https://identity.ic0.app

No additional configuration needed!

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
- Check that `CANISTER_ID` in `lib/canister.ts` matches your deployed token canister
- Ensure you ran `npm run build` before deploying token_assets
- Clear browser cache and try again

## Support

- [DFINITY Developer Forum](https://forum.dfinity.org/)
- [Internet Computer Discord](https://discord.gg/jnjVVQaE2C)
- [DFINITY Documentation](https://internetcomputer.org/docs)

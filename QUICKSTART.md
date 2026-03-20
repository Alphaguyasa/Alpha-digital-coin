# Quick Start - Run Alpha Coin Locally

Follow these steps to run the Alpha Coin dashboard on your local machine.

## Step 1: Start the ICP Replica

Open a terminal and run:

```bash
dfx start --clean --background
```

This starts the local Internet Computer replica in the background.

**Note**: The `--clean` flag resets all data. If you want to keep existing data, use:

```bash
dfx start --background
```

## Step 2: Deploy the Canisters

In the same terminal, run:

```bash
dfx deploy
```

This will deploy:

- Token canister (Motoko backend) - **Owner gets 100,000,000,000,000,000 ALPHA tokens**
- Internet Identity canister
- Frontend assets canister

**Important**: After deployment, you'll see output like this:

```
token canister created with canister id: u6s2n-gx777-77774-qaaba-cai
```

Copy the token canister ID.

## Step 3: Update the Canister ID

Open `lib/canister.ts` and update the `CANISTER_ID` with your token canister ID:

```typescript
export const CANISTER_ID = "u6s2n-gx777-77774-qaaba-cai"; // Replace with your ID
```

## Step 4: Start the Development Server

Run:

```bash
npm run dev
```

## Step 5: Open the App

Open your browser and go to:

```
http://localhost:3000/dashboard
```

Or use the frontend canister URL from the dfx deploy output:

```
http://uzt4z-lp777-77774-qaabq-cai.localhost:4943/
```

## Step 6: Connect and Test

1. Click "Connect Wallet"
2. Select "Internet Identity"
3. Create a new Internet Identity or use an existing one
4. Once connected, you'll see your balance
5. Click "Claim 10,000 ALPHA" to get free tokens (owner has enough balance for many claims)
6. Try transferring tokens to another principal

## Restarting the Server

### If you want to keep your data (balances, claims):

```bash
# Stop dfx
dfx stop

# Start dfx without --clean flag
dfx start --background

# Restart Next.js dev server (Ctrl+C in terminal, then)
npm run dev
```

### If you want to reset everything (fresh start):

```bash
# Stop dfx
dfx stop

# Start with clean state
dfx start --clean --background

# Redeploy canisters (this resets owner balance to 100 quadrillion tokens)
dfx deploy

# Update CANISTER_ID in lib/canister.ts if it changed

# Restart Next.js dev server
npm run dev
```

## Stopping the App

To stop everything:

```bash
# Stop dfx
dfx stop

# Stop Next.js dev server (Ctrl+C in the terminal where it's running)
```

## Owner Balance Info

- **Owner Principal**: `mufkn-ru5es-fwug7-yutmo-tzrcy-bw55f-amulz-dul4h-skb5x-6l7ht-tae`
- **Initial Supply**: 100,000,000,000,000,000 ALPHA tokens
- **Claim Amount**: 10,000 ALPHA per user
- **Available Claims**: ~10 trillion claims possible from initial supply

The owner has more than enough balance for testing and demos!

## Troubleshooting

### "Canister not found" error

- Make sure you updated the `CANISTER_ID` in `lib/canister.ts`
- Restart the dev server after updating

### Internet Identity not loading

- Check that dfx is running: `dfx ping`
- Make sure you deployed all canisters: `dfx deploy`

### Port already in use

- Stop dfx: `dfx stop`
- Start again: `dfx start --clean --background`

### "Insufficient amount" when claiming

- This means the owner ran out of tokens (very unlikely with 100 quadrillion supply)
- Restart with `dfx start --clean --background` and `dfx deploy` to reset

## That's it!

Your Alpha Coin dashboard is now running locally. You can demo it to anyone on your local network.

---

## Command Line Testing

You can interact with the token canister directly using dfx commands:

### Check Balance

Check any principal's balance:

```bash
dfx canister call token balanceOf "(principal \"<PRINCIPAL_ID>\")"
```

Example - Check owner balance:

```bash
dfx canister call token balanceOf "(principal \"mufkn-ru5es-fwug7-yutmo-tzrcy-bw55f-amulz-dul4h-skb5x-6l7ht-tae\")"
```

Example - Check your logged-in user balance:

```bash
dfx canister call token balanceOf "(principal \"tgydz-3mdpf-xmgvg-asvd3-63kif-d34vo-7ujti-ihknj-qtqii-saomi-iae\")"
```

### Get Token Symbol

```bash
dfx canister call token getSymbol
```

Output: `("DAlpha")`

### Claim Tokens

Claim 10,000 tokens for your dfx identity:

```bash
dfx canister call token claim
```

Output: `("success")` or `("Already claimed")` if you already claimed

### Transfer Tokens

Transfer tokens from your dfx identity to another principal:

```bash
dfx canister call token transfer "(principal \"<RECIPIENT_PRINCIPAL>\", <AMOUNT>)"
```

Example - Send 200 tokens:

```bash
dfx canister call token transfer "(principal \"tgydz-3mdpf-xmgvg-asvd3-63kif-d34vo-7ujti-ihknj-qtqii-saomi-iae\", 200)"
```

### Get Your dfx Principal

To find your dfx identity principal:

```bash
dfx identity get-principal
```

### Use Candid UI

You can also interact with the canister through the Candid UI (web interface):

```
http://127.0.0.1:4943/?canisterId=<CANDID_UI_CANISTER>&id=<TOKEN_CANISTER_ID>
```

The URL is shown in the dfx deploy output. Example:

```
http://127.0.0.1:4943/?canisterId=umunu-kh777-77774-qaaca-cai&id=u6s2n-gx777-77774-qaaba-cai
```

In the Candid UI, you can:

- Click on any function name
- Fill in the parameters
- Click "Call" or "Query" to execute
- See the results instantly

### Useful dfx Commands

**Check if dfx is running:**

```bash
dfx ping
```

**List all deployed canisters:**

```bash
dfx canister id --all
```

**Get specific canister ID:**

```bash
dfx canister id token
dfx canister id internet_identity
dfx canister id token_assets
```

**View canister info:**

```bash
dfx canister info token
```

**Check canister status:**

```bash
dfx canister status token
```

Stop Next.js dev server
Run
pkill -f "next dev" || true

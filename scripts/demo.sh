#!/usr/bin/env bash
# One-command local demo: starts a fresh local replica, deploys the token and Internet
# Identity canisters, seeds two throwaway identities with real balances, then starts the
# dashboard. Local replica only: nothing here can reach a public network.
#
#   npm run demo           # set up, then run the dashboard at http://localhost:3000/dashboard
#   npm run demo -- --check  # set up, verify the seeded balances, stop the replica (used by CI)
#
# Warning: the replica is started with --clean, so any earlier local canister state is wiped.
set -euo pipefail
cd "$(dirname "$0")/.."

check=false
case "${1:-}" in
  --check) check=true ;;
  "") ;;
  *) echo "usage: npm run demo [-- --check]" >&2; exit 2 ;;
esac

if ! command -v dfx >/dev/null 2>&1; then
  echo "dfx is not installed. Install dfx 0.32.0 (the version CI pins), then run this again." >&2
  exit 1
fi

export DFX_WARNING="-mainnet_plaintext_identity"
names="ayana bekele"

as() { # name
  echo "throwaway-demo-$1"
}
id() { # name
  dfx identity get-principal --identity "$(as "$1")" 2>/dev/null
}
balance() { # name
  dfx canister call --identity "$(as ayana)" token balanceOf "(principal \"$(id "$1")\")" 2>/dev/null | sed -E 's/[^0-9]//g'
}
step() {
  printf '\n==> %s\n' "$1"
}

cleanup_check() {
  dfx stop >/dev/null 2>&1 || true
  for name in $names; do
    dfx identity remove "$(as "$name")" >/dev/null 2>&1 || true
  done
}
if $check; then
  trap cleanup_check EXIT
fi

step "Starting a fresh local replica"
dfx stop >/dev/null 2>&1 || true
dfx start --clean --background >/dev/null 2>&1
for _ in $(seq 1 60); do
  dfx ping >/dev/null 2>&1 && break
  sleep 2
done
dfx ping >/dev/null 2>&1 || { echo "the local replica did not start" >&2; exit 1; }

# The asset canister is skipped: it serves a static build, and the demo runs the dev server.
step "Deploying the token and Internet Identity canisters"
dfx deploy token >/dev/null 2>&1
dfx deploy internet_identity >/dev/null 2>&1
echo "canister IDs written to .env.local"

# Throwaway identities with plaintext keys on this machine. They hold no value and must
# never be used anywhere but this local replica.
step "Seeding two throwaway identities"
for name in $names; do
  dfx identity new --storage-mode plaintext "$(as "$name")" >/dev/null 2>&1 || true
done
for name in $names; do
  dfx canister call --identity "$(as "$name")" token claim >/dev/null 2>&1
done
dfx canister call --identity "$(as ayana)" token transfer "(principal \"$(id bekele)\", 2500 : nat)" >/dev/null 2>&1

ayana="$(balance ayana)"
bekele="$(balance bekele)"
printf '%-8s %s  balance %s\n' ayana "$(id ayana)" "$ayana"
printf '%-8s %s  balance %s\n' bekele "$(id bekele)" "$bekele"

if [ "$ayana" != "7500" ] || [ "$bekele" != "12500" ]; then
  echo "seeded balances are wrong: expected 7500 and 12500, got $ayana and $bekele" >&2
  exit 1
fi

if $check; then
  echo
  echo "demo check passed"
  exit 0
fi

cat <<EOF

Ready. Open http://localhost:3000/dashboard, sign in with the local Internet Identity,
claim your tokens and send some to one of the principals above.
Stop the replica afterwards with: dfx stop
EOF
exec npm run dev

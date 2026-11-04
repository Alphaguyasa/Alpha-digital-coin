#!/usr/bin/env bash
# Tests the token canister on a throwaway local replica. Needs dfx and never touches a
# public network. The identities are created here, labelled as throwaway, and removed
# afterwards: they hold no value and must never be reused.
set -euo pipefail
cd "$(dirname "$0")/.."

export DFX_WARNING="-mainnet_plaintext_identity"
alice=throwaway-test-alice
bob=throwaway-test-bob
failures=0

cleanup() {
  dfx stop >/dev/null 2>&1 || true
  dfx identity use default >/dev/null 2>&1 || true
  dfx identity remove "$alice" >/dev/null 2>&1 || true
  dfx identity remove "$bob" >/dev/null 2>&1 || true
}
trap cleanup EXIT

expect() { # name expected actual
  if [ "$2" = "$3" ]; then
    echo "ok   - $1"
  else
    echo "FAIL - $1: expected $2, got $3"
    failures=$((failures + 1))
  fi
}

call() { # identity method args
  dfx canister call --identity "$1" token "$2" "${3:-()}"
}
balance() { # principal
  call "$alice" balanceOf "(principal \"$1\")" | sed -E 's/[^0-9]//g'
}

dfx identity new --storage-mode plaintext "$alice" >/dev/null 2>&1 || true
dfx identity new --storage-mode plaintext "$bob" >/dev/null 2>&1 || true
alice_id="$(dfx identity get-principal --identity "$alice")"
bob_id="$(dfx identity get-principal --identity "$bob")"

dfx start --clean --background >/dev/null 2>&1
dfx deploy token >/dev/null 2>&1

expect "symbol" '("DAlpha")' "$(call "$alice" getSymbol)"
expect "a new principal has no balance" "0" "$(balance "$alice_id")"
expect "claim succeeds" '("success")' "$(call "$alice" claim)"
expect "claim pays 10,000" "10000" "$(balance "$alice_id")"
expect "second claim is refused" '("Already claimed")' "$(call "$alice" claim)"
expect "transfer succeeds" '("success")' "$(call "$alice" transfer "(principal \"$bob_id\", 200)")"
expect "transfer debits" "9800" "$(balance "$alice_id")"
expect "transfer credits" "200" "$(balance "$bob_id")"
expect "overspend is refused" '("Insufficient amount")' "$(call "$alice" transfer "(principal \"$bob_id\", 9801)")"
expect "overspend changes nothing" "9800" "$(balance "$alice_id")"

if [ "$failures" -gt 0 ]; then
  echo "$failures canister test(s) failed"
  exit 1
fi
echo "all canister tests passed"

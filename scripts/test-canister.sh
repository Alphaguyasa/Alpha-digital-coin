#!/usr/bin/env bash
# Tests the token canister on a throwaway local replica. Needs dfx and never touches a
# public network. The identities are created here, labelled as throwaway, and removed
# afterwards: they hold no value and must never be reused.
set -euo pipefail
cd "$(dirname "$0")/.."

export DFX_WARNING="-mainnet_plaintext_identity"
names="alice bob carol dave erin frank grace"
failures=0
tmp="$(mktemp -d)"

cleanup() {
  dfx stop >/dev/null 2>&1 || true
  dfx identity use default >/dev/null 2>&1 || true
  for name in $names; do
    dfx identity remove "throwaway-test-$name" >/dev/null 2>&1 || true
  done
  rm -rf "$tmp"
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

call() { # identity method [args]
  dfx canister call --identity "$1" token "$2" "${3:-()}"
}
id() { # name
  dfx identity get-principal --identity "throwaway-test-$1"
}
as() { # name
  echo "throwaway-test-$1"
}
balance() { # name
  call "$(as alice)" balanceOf "(principal \"$(id "$1")\")" | sed -E 's/[^0-9]//g'
}
send() { # from-name to-name amount
  call "$(as "$1")" transfer "(principal \"$(id "$2")\", $3)"
}

for name in $names; do
  dfx identity new --storage-mode plaintext "$(as "$name")" >/dev/null 2>&1 || true
done

dfx start --clean --background >/dev/null 2>&1

# Upgrading from the old code must keep balances, and must not hand out a second claim to
# anyone who could not claim before: the old code treated any balance entry as "claimed".
cache="$(dfx cache show)"
dfx canister create token >/dev/null 2>&1
"$cache/moc" --package base "$cache/base" tests/canister/legacy_token.mo -o "$tmp/legacy.wasm"
dfx canister install token --wasm "$tmp/legacy.wasm" --yes >/dev/null 2>&1
expect "old code: claim" '("success")' "$(call "$(as grace)" claim)"
expect "old code: transfer" '("success")' "$(send grace frank 200)"
dfx deploy token --yes >/dev/null 2>&1
expect "upgrade from old code keeps the sender's balance" "9800" "$(balance grace)"
expect "upgrade from old code keeps the recipient's balance" "200" "$(balance frank)"
expect "upgrade from old code: claimant cannot claim again" '("Already claimed")' "$(call "$(as grace)" claim)"
expect "upgrade from old code: earlier holder gets no new claim" '("Already claimed")' "$(call "$(as frank)" claim)"

# Everything below runs on the current code.
expect "symbol" '("DAlpha")' "$(call "$(as alice)" getSymbol)"
expect "a new principal has no balance" "0" "$(balance alice)"
expect "claim succeeds" '("success")' "$(call "$(as alice)" claim)"
expect "claim pays 10,000" "10000" "$(balance alice)"
expect "second claim is refused" '("Already claimed")' "$(call "$(as alice)" claim)"
expect "transfer succeeds" '("success")' "$(send alice bob 200)"
expect "transfer debits" "9800" "$(balance alice)"
expect "transfer credits" "200" "$(balance bob)"
expect "overspend is refused" '("Insufficient amount")' "$(send alice bob 9801)"
expect "overspend changes nothing" "9800" "$(balance alice)"
expect "a huge amount is refused" '("Insufficient amount")' \
  "$(send alice bob 340282366920938463463374607431768211456)"
expect "transfer to yourself succeeds" '("success")' "$(send alice alice 100)"
expect "transfer to yourself keeps the balance" "9800" "$(balance alice)"

# Access control.
expect "zero amount is refused" '("Invalid amount")' "$(send alice bob 0)"
expect "anonymous caller cannot claim" '("Anonymous caller not allowed")' "$(call anonymous claim)"
expect "anonymous caller cannot transfer" '("Anonymous caller not allowed")' \
  "$(call anonymous transfer "(principal \"$(id alice)\", 1)")"
expect "anonymous recipient is refused" '("Invalid recipient")' \
  "$(call "$(as alice)" transfer '(principal "2vxsx-fae", 1)')"

# Receiving tokens must not use up your claim.
expect "a recipient can still claim" '("success")' "$(call "$(as bob)" claim)"
expect "and has both amounts" "10200" "$(balance bob)"

# Double spend: parallel transfers of a whole balance. Only one may succeed.
expect "parallel test: claim" '("success")' "$(call "$(as carol)" claim)"
for i in 1 2 3 4 5 6 7 8; do
  send carol dave 10000 >"$tmp/spend$i" 2>&1 &
done
wait
expect "double spend: exactly one parallel transfer succeeds" "1" "$(cat "$tmp"/spend* | grep -c success || true)"
expect "double spend: the sender ends with nothing" "0" "$(balance carol)"
expect "double spend: the recipient gets the amount once" "10000" "$(balance dave)"

# Lost credit: parallel transfers from two senders to one recipient. Both must arrive.
send alice erin 1000 >/dev/null &
send bob erin 1000 >/dev/null &
send alice erin 1000 >/dev/null &
send bob erin 1000 >/dev/null &
wait
expect "lost credit: every parallel credit arrives" "4000" "$(balance erin)"

# Upgrades keep balances and claims.
dfx deploy token --upgrade-unchanged --yes >/dev/null 2>&1
expect "upgrade keeps a balance" "4000" "$(balance erin)"
expect "upgrade keeps claims" '("Already claimed")' "$(call "$(as alice)" claim)"
expect "after an upgrade, a recipient who never claimed still can" '("success")' "$(call "$(as erin)" claim)"

if [ "$failures" -gt 0 ]; then
  echo "$failures canister test(s) failed"
  exit 1
fi
echo "all canister tests passed"

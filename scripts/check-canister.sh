#!/usr/bin/env bash
# Compile-checks the token canister and runs the Motoko static analyzer. Needs dfx,
# which brings the compiler and base library. Lintoko is optional locally, required in CI.
set -euo pipefail
cd "$(dirname "$0")/.."

cache="$(dfx cache show)"
"$cache/moc" --check --package base "$cache/base" src/token/main.mo
echo "moc --check: ok"

if command -v lintoko >/dev/null; then
  lintoko -r scripts/lint-rules src/token
  echo "lintoko: ok"
elif [ -n "${CI:-}" ]; then
  echo "lintoko is required in CI" >&2
  exit 1
else
  echo "lintoko not installed: skipped (CI runs it)"
fi

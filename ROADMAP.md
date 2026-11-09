# Roadmap

Priority: P0 (money or policy at risk), P1 (broken or misleading), P2 (quality), P3 (later).
Effort: S (under an hour), M (a run), L (several runs). Take the top open item.

## Open

### R8. [P2 · S] Dashboard layout and accessibility
The two-column grid is fixed and breaks on phones. Inputs have placeholders but no labels. The
status message is not announced to screen readers. Inline styles ignore the theme. The landing
navigation is hidden below the `lg` breakpoint, so phones have no navigation at all.

### R9. [P2 · S] Stop polling when the tab is hidden
The dashboard fetches the balance every 5 seconds, always. Pause when hidden and back off on
errors.

### R10. [P2 · S] Self-host the about-section image
`about-us-section.tsx` hot-links an Unsplash image, which leaks visitors' IPs to a third party
and breaks offline. Replace it with a local asset or remove it.

### R11. [P2 · M] Frontend test coverage
Add component tests for the dashboard's states: signed out, signed in, loading, each error. This
needs a test renderer, so check licences and audit first.

### R12. [P2 · S] Add CodeQL for the TypeScript code
Free on public repos. Fix or document each finding.

### R13. [P3 · M] Claim abuse limits
Each new Internet Identity gets free tokens, so one person can drain the reserve and grow canister
memory (Sybil). This only matters on a shared network: see A5 before building anything.

### R14. [P3 · L] ICRC-1 ledger (waits for A6)
Standard API, decimals, fee, memo, `created_at_time` deduplication (replay protection) and a
transaction log.

### R16. [P2 · M] Move from dfx to icp-cli
dfx now prints "dfx is deprecated, use icp-cli". It still works and is pinned at 0.32.0 in CI. Plan
the move for the scripts, CI and docs before dfx stops getting fixes.

### R17. [P2 · S] Clear the remaining npm audit findings
20 remain (18 moderate, 2 low), none high or critical; CI fails only at high. `npm audit fix` cannot
reach them without major version changes, mostly in the ESLint chain. Review and upgrade them on
their own branch, and recheck after any `eslint-config-next` release.

### R15. [P3 · S] Localization
All strings are English and hard-coded. Move them out and add Amharic when Alpha wants it.

## Done

- Repo setup: CI, release tags, context files, threat model ([#1](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/1)).
- R1. `transfer` and `claim` made safe ([#2](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/2)).
- R2. Price display and false claims removed from the site, notice added ([#3](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/3)). `components/ui/asset-card.tsx` is deleted: it showed a balance as US dollars with a percentage and a leverage badge.
- R3. Integer amounts in the frontend: amounts are parsed to `bigint` in `lib/amount.ts` and never pass through a JavaScript number ([#5](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/5)).
- R4. Network configuration that fails closed: canister IDs come from `dfx deploy` via `.env.local`, only a local replica is accepted, and an unconfigured build shows an error ([#6](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/6)).
- R5. Dashboard error handling: every call ends loading and shows a message, the recipient is checked before sending, canister results get plain messages, and a failed balance read keeps the last balance marked stale ([#8](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/8)).
- R6. Dead links and controls: landing navigation links to its sections, and the wallet dialog no longer refers to Terms and Privacy pages that do not exist (A8) ([#9](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/9)).
- R7. Dead code and unused dependencies removed: `@icp-sdk/*`, `radix-ui`, `@radix-ui/react-slot`, `class-variance-authority`, the unused button component and wallet icons. `shadcn` moved to dev dependencies (only its stylesheet is used, at build time). A test now fails if a runtime dependency is not imported.

# Daily log

Newest first. Each run adds its REPORT table here.

Routine: "Alpha Digital Coin daily lead developer", `trig_01NuBX7q3J2ydbShVUxRVejq`, cron `0 6 * * *`
in UTC, which is 09:00 Africa/Nairobi. The cron field is UTC only, and Nairobi has no daylight saving,
so this is the same as `CRON_TZ=Africa/Nairobi 0 9 * * *`.

## 2026-11-06: Run 3 (scheduled, cloud)

| Field | Content |
|---|---|
| Done | R5: dashboard error handling ([#8](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/8)). R6: dead links and controls ([#9](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/9)). |
| Merged | #8 yes, `v2026-11-06-1`. #9 yes, `v2026-11-06-2`. Both green on first CI run (web and canister). |
| Failed or blocked | Nothing blocked. Merged branches still cannot be deleted from the cloud (A12). dfx is not installed in the cloud session, so Motoko checks ran only in CI. |
| Roadmap | 11 open (R7 to R17). No replan needed. R8 now also covers the missing phone navigation. |
| Model | Opus 5.5 (`claude-opus-5-5`). Anthropic's models page still lists it as the newest Opus; Fable 5.1 is the open A9 question. No switch. |
| Needs approval | A1 to A12. Nothing blocks daily work. A8's default is now in place. |
| Next | R7: remove dead code and unused dependencies. Then R8: dashboard layout and accessibility. |

**Checks run locally before each push:** `npm test` (37 pass after both changes), `npm run typecheck`,
`npm run lint` (exit 0, only old warnings), `npm audit --audit-level=high` (exit 0), `npm run build`. The
static build was opened in headless Chromium: the unconfigured dashboard renders with no page errors,
and each landing nav item scrolls to its section. #9 had `main` merged in after #8 so its CI tested both.

**Mistake to learn from.** The fresh checkout's `origin/main` ref was stale (it pointed at a commit from
before run 1), and the first R5 branch was cut from it. Caught before any commit. Run
`git fetch origin main` before branching.

## 2026-11-05: Run 2 (scheduled, cloud)

| Field | Content |
|---|---|
| Done | R3: token amounts stay exact integers in the frontend ([#5](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/5)). R4: network read from build config, local replica only, fails closed with no canister ID ([#6](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/6)). |
| Merged | #5 yes, `v2026-11-05-1`. #6 yes, `v2026-11-05-2`. Both green on first CI run (web and canister). |
| Failed or blocked | Nothing blocked. The cloud git proxy refuses branch deletes, so merged branches `claude/integer-amounts` and `claude/network-config` are still on GitHub (see A12). dfx is not installed in the cloud session, so Motoko checks ran only in CI. |
| Roadmap | 13 open (R5 to R17). No replan needed. |
| Model | Opus 5.5 (`claude-opus-5-5`). Anthropic's models page still lists it as the newest Opus; Fable 5.1 is the open A9 question. No switch. |
| Needs approval | A1 to A12. Nothing blocks daily work. |
| Next | R5: dashboard error handling. Then R6: dead links and controls. |

**Checks run locally before each push:** `npm test`, `npm run typecheck`, `npm run lint` (exit 0, only old
warnings), `npm audit --audit-level=high` (exit 0), `npm run build`. For R4 a static build was opened in
headless Chromium: with no `.env.local` the dashboard shows "This build is not configured" and no Connect
button; with a dfx-style `.env.local` both canister IDs are inlined into the bundle.

**Note for local use:** after this run, `dfx deploy` writes `.env.local` and the site reads the canister
IDs from it. Restart `npm run dev` after a redeploy.

## 2026-11-04: Run 1 (setup, interactive, from Alpha's PC)

| Field | Content |
|---|---|
| Done | Phase 0 setup ([#1](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/1)). R1: `transfer` and `claim` made safe ([#2](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/2)). R2: price display and false claims removed ([#3](https://github.com/Alphaguyasa/Alpha-digital-coin/pull/3)). Daily routine created. |
| Merged | #1 yes, `v2026-11-04-1`. #2 yes, `v2026-11-04-2`. #3 yes, `v2026-11-04-3`. |
| Failed or blocked | Nothing is blocked. #1 failed CI twice before passing: the dfx install step, then `npm audit`. The audit fix ran in a one-off cloud session because this PC's connection kept dropping (`trig_01M35fxnovobujTpuQb4BF1t`, finished, safe to delete). Limits: dfx could not be downloaded locally, so all Motoko checks ran only in CI, and `next build` cannot run on this PC, so the pages were built in CI but never viewed in a browser. |
| Roadmap | 15 open (R3 to R17). No replan needed. |
| Model | Opus 5.5 (`claude-opus-5-5`), the newest Opus on Anthropic's models page, pinned because that page lists no separate alias. Fable 5.1 reads as a tier above: see A9. |
| Needs approval | A1 to A11. Nothing blocks daily work. |
| Next | R3: integer amounts in the frontend. Then R4: explicit network configuration that fails closed. |

**Evidence for R1.** The abuse tests ran on the old code in CI before the fix (commit `98af4fa`): three
parallel transfers of one 10,000 balance paid 30,000 in total; eight parallel transfers of a 10,000
balance all reported success; four parallel credits of 1,000 delivered 1,000; anonymous callers could
claim and transfer. After the fix (`84efdbe`) all 36 replica checks and the unit tests pass.

**Mistakes to learn from.**
- `npm audit` was reported clean from a local run that printed nothing, when it had really found 43
  vulnerabilities (2 critical, 16 high). Read the exit code and the count: empty output is not a pass.
- Twice a command chain carried on after a failure and pushed to a branch (a failed rebase, a failing
  test). Nothing reached main. Check results before pushing, and do not chain a push after `;`.

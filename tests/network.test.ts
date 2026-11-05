// Network configuration (R4): local replica only, and no guessing when unconfigured.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolveNetwork, type NetworkEnv } from "../lib/network.ts"

// Throwaway local canister IDs, as a fresh local replica hands them out.
const TOKEN = "uxrrr-q7777-77774-qaaaq-cai"
const II = "u6s2n-gx777-77774-qaaba-cai"
const base: NetworkEnv = { canisterId: TOKEN, identityCanisterId: II }

const config = (env: NetworkEnv) => {
  const result = resolveNetwork(env)
  assert.ok(result.ok, result.ok ? "" : result.error)
  return result.config
}

const refuses = (env: NetworkEnv, pattern: RegExp) => {
  const result = resolveNetwork(env)
  assert.equal(result.ok, false, `expected ${JSON.stringify(env)} to be refused`)
  if (!result.ok) assert.match(result.error, pattern)
}

test("defaults to the local replica", () => {
  assert.deepEqual(config(base), {
    host: "http://localhost:4943",
    canisterId: TOKEN,
    identityProvider: `http://${II}.localhost:4943`,
  })
  assert.equal(config({ ...base, network: "local", host: "" }).host, "http://localhost:4943")
})

test("accepts other local addresses and ports", () => {
  assert.deepEqual(config({ ...base, host: "http://127.0.0.1:8080" }), {
    host: "http://127.0.0.1:8080",
    canisterId: TOKEN,
    identityProvider: `http://127.0.0.1:8080/?canisterId=${II}`,
  })
  assert.equal(config({ ...base, host: " http://localhost:4943/ " }).host, "http://localhost:4943")
})

test("refuses to run with no canister IDs", () => {
  refuses({}, /No token canister ID/)
  refuses({ canisterId: "  " }, /No token canister ID/)
  refuses({ canisterId: TOKEN }, /No Internet Identity canister ID/)
})

test("refuses malformed canister IDs", () => {
  for (const id of ["abc", "UXRRR-Q7777-77774-QAAAQ-CAI", "uxrrr-q7777-77774-qaaaq-ca1", `${TOKEN}-aaaaa`, "aaaaa-aa"]) {
    refuses({ ...base, canisterId: id }, /not a valid canister ID/)
    refuses({ ...base, identityCanisterId: id }, /not a valid canister ID/)
  }
})

test("refuses every public network", () => {
  for (const network of ["ic", "playground", "mainnet", "LOCAL"]) {
    refuses({ ...base, network }, /not allowed/)
  }
  for (const host of [
    "https://ic0.app",
    "https://icp0.io",
    "https://icp-api.io",
    "https://boundary.example.com",
    "http://localhost.evil.com:4943",
    "http://192.168.1.10:4943",
    "http://0.0.0.0:4943",
  ]) {
    refuses({ ...base, host }, /not on this machine/)
  }
})

test("refuses hosts that are not plain http addresses", () => {
  refuses({ ...base, host: "localhost:4943" }, /http/)
  refuses({ ...base, host: "not a url" }, /not a valid URL/)
  refuses({ ...base, host: "ftp://localhost:4943" }, /http/)
  refuses({ ...base, host: "javascript:alert(1)" }, /http/)
  refuses({ ...base, host: "http://user:pass@localhost:4943" }, /plain address/)
  refuses({ ...base, host: "http://localhost:4943/?x=1" }, /plain address/)
})

test("the client reads its network only from the checked config", () => {
  const client = readFileSync("lib/canister.ts", "utf8")
  assert.match(client, /resolveNetwork\(/)
  assert.doesNotMatch(client, /ic0\.app|icp0\.io|icp-api\.io/)
  assert.doesNotMatch(client, /NODE_ENV/, "the network must not depend on dev or production mode")
  assert.doesNotMatch(client, /[a-z2-7]{5}-[a-z2-7]{5}-[a-z2-7]{5}-[a-z2-7]{5}-cai/, "no hard-coded canister ID")
  const nextConfig = readFileSync("next.config.mjs", "utf8")
  assert.match(nextConfig, /CANISTER_ID_TOKEN/)
  assert.match(readFileSync("dfx.json", "utf8"), /"output_env_file": "\.env\.local"/)
})

test("the dashboard shows the configuration error instead of a login button", () => {
  const dashboard = readFileSync("app/dashboard/page.tsx", "utf8")
  assert.match(dashboard, /network\.ok \?/)
  assert.match(dashboard, /network\.error/)
})

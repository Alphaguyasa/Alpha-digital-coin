// Which network the dashboard talks to, read at build time and checked before use.
//
// This project runs on a local replica only (see A7 in the decision log). So the only
// accepted network is "local", the only accepted hosts are on this machine, and a build
// with no token canister ID refuses to make calls instead of guessing one. Pointing the
// site at a public network needs Alpha's approval and a change to this file.

export const DEFAULT_HOST = "http://localhost:4943"

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"])

// A canister ID in text form: 27 characters, groups of five letters a-z or digits 2-7.
const CANISTER_ID = /^([a-z2-7]{5}-){4}[a-z2-7]{3}$/

// The raw values, as the build provides them. Empty strings count as missing.
export type NetworkEnv = {
  network?: string
  host?: string
  canisterId?: string
  identityCanisterId?: string
}

export type NetworkConfig = {
  host: string
  canisterId: string
  identityProvider: string
}

export type NetworkResult =
  | { ok: true; config: NetworkConfig }
  | { ok: false; error: string }

const clean = (value: string | undefined) => value?.trim() || undefined

function fail(error: string): NetworkResult {
  return { ok: false, error }
}

export function resolveNetwork(env: NetworkEnv): NetworkResult {
  const network = clean(env.network) ?? "local"
  if (network !== "local") {
    return fail(
      `Network "${network}" is not allowed. This project runs on a local replica only.`
    )
  }

  const hostText = clean(env.host) ?? DEFAULT_HOST
  let host: URL
  try {
    host = new URL(hostText)
  } catch {
    return fail(`NEXT_PUBLIC_IC_HOST is not a valid URL: "${hostText}".`)
  }
  if (host.protocol !== "http:" && host.protocol !== "https:") {
    return fail("NEXT_PUBLIC_IC_HOST must start with http:// or https://.")
  }
  if (host.username || host.password || host.search || host.hash) {
    return fail("NEXT_PUBLIC_IC_HOST must be a plain address, like http://localhost:4943.")
  }
  if (!LOCAL_HOSTNAMES.has(host.hostname)) {
    return fail(
      `NEXT_PUBLIC_IC_HOST "${host.hostname}" is not on this machine. Only a local replica is allowed.`
    )
  }

  const canisterId = clean(env.canisterId)
  if (!canisterId) {
    return fail(
      "No token canister ID. Run `dfx deploy` (it writes .env.local), or set NEXT_PUBLIC_CANISTER_ID, then rebuild."
    )
  }
  if (!CANISTER_ID.test(canisterId)) {
    return fail(`The token canister ID "${canisterId}" is not a valid canister ID.`)
  }

  const identityCanisterId = clean(env.identityCanisterId)
  if (!identityCanisterId) {
    return fail(
      "No Internet Identity canister ID. Run `dfx deploy` (it writes .env.local), or set NEXT_PUBLIC_II_CANISTER_ID, then rebuild."
    )
  }
  if (!CANISTER_ID.test(identityCanisterId)) {
    return fail(
      `The Internet Identity canister ID "${identityCanisterId}" is not a valid canister ID.`
    )
  }

  const origin = `${host.protocol}//${host.host}`
  // A local replica serves each canister on its own subdomain of localhost. 127.0.0.1
  // has no subdomains, so the canister is named in the query string there instead.
  const identityProvider =
    host.hostname === "localhost"
      ? `${host.protocol}//${identityCanisterId}.${host.host}`
      : `${origin}/?canisterId=${identityCanisterId}`

  return { ok: true, config: { host: origin, canisterId, identityProvider } }
}

import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { IDL } from "@dfinity/candid";

import { resolveNetwork, type NetworkConfig, type NetworkResult } from "./network";

// ── Config ───────────────────────────────────────────────────────────────────
// Read at build time. `dfx deploy` writes the canister IDs to .env.local, and
// next.config.mjs passes them on, so nothing is hand-edited. Local replica only:
// see lib/network.ts. Each process.env name is written out in full because Next.js
// only inlines literal references.
export const network: NetworkResult = resolveNetwork({
  network: process.env.NEXT_PUBLIC_DFX_NETWORK,
  host: process.env.NEXT_PUBLIC_IC_HOST,
  canisterId: process.env.NEXT_PUBLIC_CANISTER_ID,
  identityCanisterId: process.env.NEXT_PUBLIC_II_CANISTER_ID,
});

// Throws instead of guessing when the build is not configured.
function config(): NetworkConfig {
  if (!network.ok) throw new Error(network.error);
  return network.config;
}
// ────────────────────────────────────────────────────────────────────────────

// Candid IDL matching your main.mo
const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  return IDL.Service({
    balanceOf: IDL.Func([IDL.Principal], [IDL.Nat], ["query"]),
    getSymbol: IDL.Func([], [IDL.Text], ["query"]),
    claim: IDL.Func([], [IDL.Text], []),
    transfer: IDL.Func([IDL.Principal, IDL.Nat], [IDL.Text], []),
  });
};

// Auth client singleton
let authClient: AuthClient | null = null;

export async function getAuthClient(): Promise<AuthClient> {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
}

export async function login(): Promise<Principal | null> {
  const { identityProvider } = config();
  const client = await getAuthClient();
  return new Promise((resolve) => {
    client.login({
      identityProvider,
      onSuccess: async () => {
        const identity = client.getIdentity();
        resolve(identity.getPrincipal());
      },
      onError: (err) => {
        console.error("Login error:", err);
        resolve(null);
      },
    });
  });
}

export async function logout(): Promise<void> {
  const client = await getAuthClient();
  await client.logout();
  authClient = null;
}

export async function getIdentity() {
  const client = await getAuthClient();
  return client.getIdentity();
}

export async function isAuthenticated(): Promise<boolean> {
  const client = await getAuthClient();
  return client.isAuthenticated();
}

export async function getPrincipal(): Promise<Principal | null> {
  const client = await getAuthClient();
  if (!(await client.isAuthenticated())) return null;
  return client.getIdentity().getPrincipal();
}

// Build actor with the caller's identity
async function getActor() {
  const { host, canisterId } = config();
  const identity = await getIdentity();
  const agent = await HttpAgent.create({ host, identity });
  // A local replica has its own root key. Fetching it is only safe because
  // lib/network.ts accepts nothing but local hosts.
  await agent.fetchRootKey();
  return Actor.createActor(idlFactory, { agent, canisterId });
}

// ── Token calls ──────────────────────────────────────────────────────────────

export async function balanceOf(principal: Principal): Promise<bigint> {
  const actor = await getActor();
  return actor.balanceOf(principal) as Promise<bigint>;
}

export async function getSymbol(): Promise<string> {
  const actor = await getActor();
  return actor.getSymbol() as Promise<string>;
}

export async function claim(): Promise<string> {
  const actor = await getActor();
  return actor.claim() as Promise<string>;
}

// amount is a whole number of tokens as a bigint (see lib/amount.ts), never a number.
export async function transfer(to: string, amount: bigint): Promise<string> {
  if (amount <= BigInt(0)) throw new RangeError("amount must be greater than zero");
  const actor = await getActor();
  const toPrincipal = Principal.fromText(to);
  return actor.transfer(toPrincipal, amount) as Promise<string>;
}

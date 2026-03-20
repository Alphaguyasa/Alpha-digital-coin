import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { IDL } from "@dfinity/candid";

// ── Config ───────────────────────────────────────────────────────────────────
// Live IC mainnet canister ID — from: dfx canister --network ic id token
// Paste your live canister ID below (run: dfx canister --network ic id token)
export const CANISTER_ID = "u6s2n-gx777-77774-qaaba-cai";

const IS_LOCAL = process.env.NODE_ENV === "development";
const ICP_HOST = IS_LOCAL ? "http://localhost:4943" : "https://ic0.app";
const IDENTITY_PROVIDER = IS_LOCAL 
  ? "http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943" 
  : "https://identity.ic0.app";
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
  const client = await getAuthClient();
  return new Promise((resolve) => {
    client.login({
      identityProvider: IDENTITY_PROVIDER,
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
  const identity = await getIdentity();
  const agent = await HttpAgent.create({ host: ICP_HOST, identity });
  if (IS_LOCAL) await agent.fetchRootKey(); // required for local replica
  return Actor.createActor(idlFactory, { agent, canisterId: CANISTER_ID });
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

export async function transfer(to: string, amount: number): Promise<string> {
  const actor = await getActor();
  const toPrincipal = Principal.fromText(to);
  return actor.transfer(toPrincipal, BigInt(amount)) as Promise<string>;
}

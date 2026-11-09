// Stands in for lib/canister.ts in the dashboard component tests. The test file sets the behaviour
// on globalThis, because the page and the test are loaded through different module systems.
type CanisterStub = {
  network: { ok: boolean; error?: string }
  authenticated: boolean
  principalText: string
  balance: () => Promise<bigint>
  claim: () => Promise<string>
  transfer: (to: string, amount: bigint) => Promise<string>
}

const state = () => (globalThis as unknown as { __canister: CanisterStub }).__canister

export const network = new Proxy({} as CanisterStub["network"], {
  get: (_target, key: "ok" | "error") => state().network[key],
})

const principal = () => ({ toText: () => state().principalText })

export const login = async () => principal()
export const logout = async () => {}
export const isAuthenticated = async () => state().authenticated
export const getPrincipal = async () => (state().authenticated ? principal() : null)
export const balanceOf = async () => state().balance()
export const claim = async () => state().claim()
export const transfer = async (to: string, amount: bigint) => state().transfer(to, amount)

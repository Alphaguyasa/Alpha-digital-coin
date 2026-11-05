// `dfx deploy` writes CANISTER_ID_TOKEN, CANISTER_ID_INTERNET_IDENTITY and DFX_NETWORK
// to .env.local (see output_env_file in dfx.json). Next.js loads that file before this
// one and only exposes NEXT_PUBLIC_* names to the browser, so they are passed on here.
// A NEXT_PUBLIC_* value set by hand wins. lib/network.ts checks the result.
const fromDfx = (publicName, dfxName) => process.env[publicName] || process.env[dfxName] || ""

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_DFX_NETWORK: fromDfx("NEXT_PUBLIC_DFX_NETWORK", "DFX_NETWORK"),
    NEXT_PUBLIC_CANISTER_ID: fromDfx("NEXT_PUBLIC_CANISTER_ID", "CANISTER_ID_TOKEN"),
    NEXT_PUBLIC_II_CANISTER_ID: fromDfx("NEXT_PUBLIC_II_CANISTER_ID", "CANISTER_ID_INTERNET_IDENTITY"),
    NEXT_PUBLIC_IC_HOST: process.env.NEXT_PUBLIC_IC_HOST || "",
  },
}

export default nextConfig

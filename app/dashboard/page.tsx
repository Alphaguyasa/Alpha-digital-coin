"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Wallet, Send, Gift, LogOut } from "lucide-react";
import {
  login,
  logout,
  isAuthenticated,
  getPrincipal,
  balanceOf,
  claim,
  transfer,
} from "@/lib/canister";
import { ConnectWalletModal } from "@/components/ui/connect-wallet-modal";
import { CryptoCard } from "@/components/ui/asset-card";

const AlphaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
    <text x="12" y="16" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">α</text>
  </svg>
);

const IIIcon = (props: { className?: string }) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#FF9900" />
    <text x="12" y="16" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">II</text>
  </svg>
);

export default function Dashboard() {
  const [principal, setPrincipal] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const wallets = [
    {
      id: "ii",
      name: "Internet Identity",
      icon: IIIcon,
      onConnect: async () => {
        setModalOpen(false);
        setLoading(true);
        const p = await login();
        if (p) {
          setPrincipal(p.toText());
          await fetchBalance(p.toText());
        }
        setLoading(false);
      },
    },
  ];

  // Transfer form
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  const fetchBalance = useCallback(async (p: string) => {
    try {
      const { Principal } = await import("@dfinity/principal");
      const bal = await balanceOf(Principal.fromText(p));
      setBalance(bal);
    } catch {
      setBalance(null);
    }
  }, []);

  const init = useCallback(async () => {
    const authed = await isAuthenticated();
    if (authed) {
      const p = await getPrincipal();
      if (p) {
        setPrincipal(p.toText());
        await fetchBalance(p.toText());
      }
    }
  }, [fetchBalance]);

  useEffect(() => {
    init();
  }, [init]);

  async function handleLogin() {
    setModalOpen(true);
  }

  async function handleLogout() {
    await logout();
    setPrincipal(null);
    setBalance(null);
  }

  async function handleClaim() {
    setLoading(true);
    setStatus(null);
    const result = await claim();
    const ok = result === "success";
    setStatus({ msg: ok ? "10,000 ALPHA claimed!" : result, ok });
    if (ok && principal) await fetchBalance(principal);
    setLoading(false);
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!toAddress || !amount) return;
    setLoading(true);
    setStatus(null);
    const result = await transfer(toAddress, Number(amount));
    const ok = result === "success";
    setStatus({ msg: ok ? `Sent ${amount} ALPHA successfully!` : result, ok });
    if (ok && principal) await fetchBalance(principal);
    setLoading(false);
    if (ok) { setToAddress(""); setAmount(""); }
  }

// ── Not logged in ──────────────────────────────────────────────────────────
  if (!principal) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg, #0A0500 0%, #1A0F00 100%)", fontFamily: "Inter, sans-serif" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-8 text-center px-4"
        >
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,153,0,0.15)", border: "1px solid rgba(255,153,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wallet size={36} color="#FF9900" />
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              Alpha Coin{" "}
              <span style={{ background: "linear-gradient(90deg, #FF9900, #FFB84D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Dashboard
              </span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 12, fontSize: 15 }}>
              Connect with Internet Identity to manage your ALPHA tokens
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            disabled={loading}
            style={{ background: "#FF9900", color: "#0A0500", padding: "14px 36px", borderRadius: 8, fontWeight: 600, fontSize: 15, border: "none", cursor: "pointer" }}
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </motion.button>
        </motion.div>

        <ConnectWalletModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          wallets={wallets}
          termsUrl="/terms"
          policyUrl="/privacy"
        />
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #0A0500 0%, #1A0F00 100%)", fontFamily: "Inter, sans-serif", padding: "32px 16px" }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF" }}>
            Alpha <span style={{ color: "#FF9900" }}>Coin</span>
          </h1>
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          >
            <LogOut size={14} /> Disconnect
          </button>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <CryptoCard
            icon={<AlphaIcon />}
            name="Alpha Coin"
            ticker="ALPHA"
            percentageChange={0}
            currentPrice={Number(balance ?? 0)}
            portfolioValue={Number(balance ?? 0)}
            portfolioChange={0}
            leverage={1}
            gradientFrom="from-orange-500"
            className="w-full max-w-md"
          />
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Claim Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ background: "rgba(255,153,0,0.05)", border: "1px solid rgba(255,153,0,0.15)", borderRadius: 16, padding: "28px 24px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Gift size={20} color="#FF9900" />
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#FFFFFF" }}>Claim Tokens</h2>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20, lineHeight: 1.6 }}>
              New to Alpha Coin? Claim your free <span style={{ color: "#FF9900", fontWeight: 600 }}>10,000 ALPHA</span> — one time per wallet.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClaim}
              disabled={loading}
              style={{ width: "100%", background: "#FF9900", color: "#0A0500", padding: "12px", borderRadius: 8, fontWeight: 600, fontSize: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Processing..." : "Claim 10,000 ALPHA"}
            </motion.button>
          </motion.div>

          {/* Transfer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ background: "rgba(255,153,0,0.05)", border: "1px solid rgba(255,153,0,0.15)", borderRadius: 16, padding: "28px 24px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Send size={20} color="#FF9900" />
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#FFFFFF" }}>Send ALPHA</h2>
            </div>
            <form onSubmit={handleTransfer} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Recipient Principal ID"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,153,0,0.2)", borderRadius: 8, padding: "10px 14px", color: "#FFFFFF", fontSize: 13, outline: "none", fontFamily: "monospace" }}
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,153,0,0.2)", borderRadius: 8, padding: "10px 14px", color: "#FFFFFF", fontSize: 13, outline: "none" }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                style={{ background: "transparent", border: "1px solid rgba(255,153,0,0.4)", color: "#FF9900", padding: "12px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Sending..." : "Send"}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Status Message */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 20, padding: "14px 20px", borderRadius: 10, background: status.ok ? "rgba(0,200,100,0.1)" : "rgba(255,60,60,0.1)", border: `1px solid ${status.ok ? "rgba(0,200,100,0.3)" : "rgba(255,60,60,0.3)"}`, color: status.ok ? "#00C864" : "#FF4444", fontSize: 14, textAlign: "center" }}
          >
            {status.msg}
          </motion.div>
        )}
      </div>
    </div>
  );
}

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
  network,
} from "@/lib/canister";
import { ConnectWalletModal } from "@/components/ui/connect-wallet-modal";
import { ExperimentalNotice } from "@/components/experimental-notice";
import { formatAmount, parseAmount } from "@/lib/amount";
import { balanceLabel, canisterMessage, failureMessage, parseRecipient, type Status } from "@/lib/dashboard";

const AlphaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-text" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
    <text x="12" y="16" fill="currentColor" fontSize="11" fontWeight="bold" textAnchor="middle">α</text>
  </svg>
);

const IIIcon = (props: { className?: string }) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#FF9900" />
    <text x="12" y="16" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">II</text>
  </svg>
);

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-brand-text focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const primaryButton = `${focusRing} rounded-lg bg-brand font-semibold text-brand-foreground disabled:cursor-not-allowed disabled:opacity-70`;
const card = "rounded-2xl border border-brand/15 bg-brand/5";
const fieldLabel = "text-xs font-medium text-muted-foreground";
// 16px on phones: iOS zooms the page when a focused input is smaller.
const fieldInput = `${focusRing} w-full rounded-lg border border-brand/20 bg-foreground/5 px-3.5 py-2.5 text-base text-foreground sm:text-[13px]`;
const statusBox = "rounded-[10px] border px-5 py-3.5 text-sm leading-relaxed";
const statusSuccess = "border-success-text/30 bg-success-text/10 text-success-text";
const statusError = "border-danger-text/30 bg-danger-text/10 text-danger-text";

// Stays mounted while empty: screen readers only announce changes inside a live region that
// already exists, so a region added together with its message is often missed.
function StatusRegion({ status, className = "" }: { status: Status | null; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={className}>
      {status && <div className={`${statusBox} ${status.ok ? statusSuccess : statusError}`}>{status.msg}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [principal, setPrincipal] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [balanceFailed, setBalanceFailed] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const wallets = [
    {
      id: "ii",
      name: "Internet Identity",
      icon: IIIcon,
      onConnect: async () => {
        setModalOpen(false);
        setLoading(true);
        setStatus(null);
        try {
          const p = await login();
          if (p) {
            setPrincipal(p.toText());
            await fetchBalance(p.toText());
          } else {
            setStatus({ msg: "Sign-in did not complete. Try again.", ok: false });
          }
        } catch (err) {
          console.error("Sign-in failed:", err);
          setStatus({ msg: failureMessage("sign in", err), ok: false });
        } finally {
          setLoading(false);
        }
      },
    },
  ];

  // Transfer form
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  // A failed read keeps the last balance and marks it as stale, so it never looks like zero.
  const fetchBalance = useCallback(async (p: string) => {
    try {
      const { Principal } = await import("@dfinity/principal");
      const bal = await balanceOf(Principal.fromText(p));
      setBalance(bal);
      setBalanceFailed(false);
    } catch (err) {
      console.error("Balance read failed:", err);
      setBalanceFailed(true);
    }
  }, []);

  const init = useCallback(async () => {
    if (!network.ok) return;
    try {
      const authed = await isAuthenticated();
      if (authed) {
        const p = await getPrincipal();
        if (p) {
          setPrincipal(p.toText());
          await fetchBalance(p.toText());
        }
      }
    } catch (err) {
      console.error("Restoring the session failed:", err);
    }
  }, [fetchBalance]);

  useEffect(() => {
    init();
  }, [init]);

  // Auto-refresh balance every 5 seconds when logged in
  useEffect(() => {
    if (!principal) return;
    
    const interval = setInterval(() => {
      fetchBalance(principal);
    }, 5000);

    return () => clearInterval(interval);
  }, [principal, fetchBalance]);

  async function handleLogin() {
    setModalOpen(true);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setPrincipal(null);
    setBalance(null);
    setBalanceFailed(false);
    setStatus(null);
  }

  async function handleClaim() {
    setLoading(true);
    setStatus(null);
    try {
      const result = await claim();
      const ok = result === "success";
      setStatus({ msg: ok ? "10,000 ALPHA claimed!" : canisterMessage(result), ok });
      if (ok && principal) await fetchBalance(principal);
    } catch (err) {
      console.error("Claim failed:", err);
      setStatus({ msg: failureMessage("claim", err), ok: false });
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    const recipient = parseRecipient(toAddress);
    if (!recipient.ok) {
      setStatus({ msg: recipient.error, ok: false });
      return;
    }
    const parsed = parseAmount(amount);
    if (!parsed.ok) {
      setStatus({ msg: parsed.error, ok: false });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const result = await transfer(recipient.value.toText(), parsed.value);
      const ok = result === "success";
      setStatus({ msg: ok ? `Sent ${formatAmount(parsed.value)} ALPHA successfully!` : canisterMessage(result), ok });
      if (ok) { setToAddress(""); setAmount(""); }
      if (ok && principal) await fetchBalance(principal);
    } catch (err) {
      // The call may or may not have reached the canister, so do not claim either way.
      console.error("Transfer failed:", err);
      setStatus({ msg: `${failureMessage("send", err)} Check your balance before sending again.`, ok: false });
    } finally {
      setLoading(false);
    }
  }

// ── Not logged in ──────────────────────────────────────────────────────────
  if (!principal) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-brand/40 bg-brand/15 text-brand-text">
              <Wallet size={36} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Alpha Coin <span className="text-brand-text">Dashboard</span>
              </h1>
              <p className="mt-3 text-[15px] text-muted-foreground">
                Connect with Internet Identity to manage your ALPHA tokens
              </p>
            </div>
            {network.ok ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                disabled={loading}
                className={`${primaryButton} px-9 py-3.5 text-[15px]`}
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </motion.button>
            ) : (
              <div role="alert" className={`${statusBox} ${statusError} max-w-[480px]`}>
                <strong>This build is not configured.</strong> {network.error}
              </div>
            )}
            <StatusRegion status={status && !status.ok ? status : null} className="max-w-[480px]" />
          </motion.div>

          <ConnectWalletModal open={modalOpen} onOpenChange={setModalOpen} wallets={wallets} />
        </main>

        <ExperimentalNotice />
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  const balanceView = balanceLabel(balance, balanceFailed, formatAmount);
  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <main className="mx-auto max-w-[900px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold">
              Alpha <span className="text-brand-text">Coin</span>
            </h1>
            <p className="mt-1 font-mono text-[11px] break-all text-muted-foreground">{principal}</p>
          </div>
          <button
            onClick={handleLogout}
            className={`${focusRing} flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground`}
          >
            <LogOut size={14} aria-hidden="true" /> Disconnect
          </button>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex justify-center"
        >
          <div className={`${card} w-full max-w-md p-6 text-center`}>
            <div className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
              <AlphaIcon /> Your balance
            </div>
            <p className="mt-2 text-[32px] font-bold wrap-anywhere">{balanceView.text}</p>
            {balanceView.note && <p className="mt-1.5 text-xs text-warning-text">{balanceView.note}</p>}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Claim Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${card} px-6 py-7`}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <Gift size={20} className="text-brand-text" aria-hidden="true" />
              <h2 className="text-base font-semibold">Claim Tokens</h2>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
              Claim <span className="font-semibold text-brand-text">10,000 ALPHA</span> in test tokens, one time per
              identity. They have no price.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClaim}
              disabled={loading}
              className={`${primaryButton} w-full p-3 text-sm`}
            >
              {loading ? "Processing..." : "Claim 10,000 ALPHA"}
            </motion.button>
          </motion.div>

          {/* Transfer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${card} px-6 py-7`}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <Send size={20} className="text-brand-text" aria-hidden="true" />
              <h2 className="text-base font-semibold">Send ALPHA</h2>
            </div>
            <form onSubmit={handleTransfer} className="flex flex-col gap-3" aria-busy={loading}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="recipient" className={fieldLabel}>
                  Recipient principal ID
                </label>
                <input
                  id="recipient"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className={`${fieldInput} font-mono`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="amount" className={fieldLabel}>
                  Amount (whole tokens)
                </label>
                <input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={fieldInput}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className={`${focusRing} rounded-lg border border-brand/40 p-3 text-sm font-semibold text-brand-text disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {loading ? "Sending..." : "Send"}
              </motion.button>
            </form>
          </motion.div>
        </div>

        <StatusRegion status={status} className="mt-5 text-center" />

        <div className="mt-8">
          <ExperimentalNotice />
        </div>
      </main>
    </div>
  );
}

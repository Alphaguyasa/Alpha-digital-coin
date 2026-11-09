import * as React from "react";
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- TYPES ---
interface Wallet {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  onConnect: () => void;
}

interface ConnectWalletModalProps
  extends React.ComponentProps<typeof Dialog> {
  wallets: Wallet[];
}

// --- ICONS ---
const ArrowRightIcon = (props: { className?: string }) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
);

// --- MAIN COMPONENT ---
export function ConnectWalletModal({
  wallets,
  ...props
}: ConnectWalletModalProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-sm p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-center text-lg font-semibold">
            Connect your Wallet
          </DialogTitle>
        </DialogHeader>

        <motion.div
          className="flex flex-col border-t px-2 pb-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {wallets.map((wallet) => (
            <motion.button
              key={wallet.id}
              variants={itemVariants}
              onClick={wallet.onConnect}
              className="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg text-left hover:bg-muted/80 transition-colors duration-200"
              aria-label={`Connect with ${wallet.name}`}
            >
              <div className="flex items-center gap-4">
                <wallet.icon className="h-8 w-8" />
                <span>{wallet.name}</span>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </motion.button>
          ))}
        </motion.div>

        {/* No Terms or Privacy pages exist yet, and they need legal input (the decision log A8),
            so the dialog links to neither. */}
        <div className="bg-muted/50 p-4 text-center rounded-b-xl border-t">
          <p className="text-xs text-muted-foreground">
            Experimental software on a local test network. Tokens here have no value.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
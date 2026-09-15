import { createContext, useContext } from "react";

export interface WalletContextValue {
  /** Remaining iRA Cash balance, 0 once expired. */
  balance: number;
  expiresAt: number;
  isExpired: boolean;
  /** How much of a transaction of this value could be covered right now — bounded by both the
   * "50% of this transaction" rule and the remaining balance. Doesn't deduct anything; call
   * `redeem` once the transaction it was previewed for actually goes through. */
  previewDiscount: (transactionValue: number) => number;
  /** Deducts `amount` from the balance — call once, at the point a transaction using this
   * discount is confirmed (this prototype's payment step always succeeds, so "confirmed" is
   * the moment the driver taps pay). */
  redeem: (amount: number) => void;
  /** Re-grants a fresh welcome credit — used by "Reset Prototype" to simulate a new user. */
  resetWallet: () => void;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}

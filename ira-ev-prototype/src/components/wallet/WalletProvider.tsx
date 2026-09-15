import { useCallback, useMemo, useState, type ReactNode } from "react";
import { WalletContext } from "../../hooks/useWallet";

const STORAGE_KEY = "ira-ev-wallet-credit";
export const WALLET_INITIAL_BALANCE = 200;
export const WALLET_EXPIRY_DAYS = 7;
export const WALLET_MAX_DISCOUNT_FRACTION = 0.5;

interface StoredWallet {
  balance: number;
  expiresAt: number;
}

function freshWallet(): StoredWallet {
  return {
    balance: WALLET_INITIAL_BALANCE,
    expiresAt: Date.now() + WALLET_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  };
}

function loadWallet(): StoredWallet {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.balance === "number" && typeof parsed?.expiresAt === "number") {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  // First-ever visit (or corrupted storage) — grant the welcome credit.
  const wallet = freshWallet();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  } catch {
    // private browsing / storage full — the credit just won't survive a reload
  }
  return wallet;
}

function persist(wallet: StoredWallet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  } catch {
    // ignore
  }
}

/**
 * iRA Cash: a ₹200 welcome credit. Any single transaction can only draw on up to 50% of its
 * own value from it (never covers a charge outright), and whatever's left over stays in the
 * balance for the next transaction until it expires.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<StoredWallet>(loadWallet);

  const isExpired = Date.now() > wallet.expiresAt;
  const effectiveBalance = isExpired ? 0 : wallet.balance;

  const previewDiscount = useCallback(
    (transactionValue: number) => {
      if (isExpired || !(transactionValue > 0) || wallet.balance <= 0) return 0;
      return Math.min(transactionValue * WALLET_MAX_DISCOUNT_FRACTION, wallet.balance);
    },
    [isExpired, wallet.balance]
  );

  const redeem = useCallback((amount: number) => {
    if (!(amount > 0)) return;
    setWallet((prev) => {
      const next = { ...prev, balance: Math.max(0, prev.balance - amount) };
      persist(next);
      return next;
    });
  }, []);

  const resetWallet = useCallback(() => {
    const next = freshWallet();
    persist(next);
    setWallet(next);
  }, []);

  const value = useMemo(
    () => ({ balance: effectiveBalance, expiresAt: wallet.expiresAt, isExpired, previewDiscount, redeem, resetWallet }),
    [effectiveBalance, wallet.expiresAt, isExpired, previewDiscount, redeem, resetWallet]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

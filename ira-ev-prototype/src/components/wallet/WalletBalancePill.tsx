import { Wallet } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";

/** Sits in the map screen's filter-chip row — the most-seen surface in the app — so the
 * balance stays visible well before the driver ever reaches a payment screen. */
export function WalletBalancePill({ onClick }: { onClick: () => void }) {
  const wallet = useWallet();
  if (wallet.balance <= 0 || wallet.isExpired) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 h-9 px-3.5 rounded-pill bg-primary/20 backdrop-blur text-primary text-[13px] font-semibold shrink-0 border border-primary/40"
    >
      <Wallet size={14} />
      ₹{wallet.balance.toFixed(0)} iRA Cash
    </button>
  );
}

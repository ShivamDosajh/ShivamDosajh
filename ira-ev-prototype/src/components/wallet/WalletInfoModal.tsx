import { Wallet, RefreshCw, Clock } from "lucide-react";
import { Modal } from "../common/Modal";
import { useWallet } from "../../hooks/useWallet";
import { formatCurrency } from "../../utils/pricing";

export function WalletInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const wallet = useWallet();
  const daysLeft = Math.max(0, Math.ceil((wallet.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));

  return (
    <Modal open={open} onClose={onClose} title="iRA Cash">
      <div className="rounded-card bg-primary/10 border border-primary/30 p-4 text-center mb-4">
        <div className="flex items-center justify-center gap-1.5 text-primary">
          <Wallet size={16} />
          <p className="text-[12px] lowercase font-medium">available balance</p>
        </div>
        <p className="text-[30px] font-bold text-primary mt-1">{formatCurrency(wallet.balance)}</p>
        {!wallet.isExpired && (
          <p className="text-[11px] text-secondaryText mt-1">
            expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <p className="text-text text-[14px] font-medium mb-3 lowercase">how it works</p>
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
            <Wallet size={15} />
          </div>
          <p className="text-[13px] text-secondaryText leading-relaxed">
            up to <span className="text-text font-medium">50% of any charging bill</span> is covered
            automatically at checkout — no minimum transaction amount.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
            <RefreshCw size={15} />
          </div>
          <p className="text-[13px] text-secondaryText leading-relaxed">
            whatever's left over after a charge <span className="text-text font-medium">carries forward</span> to
            your next one, until it's used up.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
            <Clock size={15} />
          </div>
          <p className="text-[13px] text-secondaryText leading-relaxed">
            valid for <span className="text-text font-medium">7 days</span> from when it was credited.
          </p>
        </div>
      </div>
    </Modal>
  );
}

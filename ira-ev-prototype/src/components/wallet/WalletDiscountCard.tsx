import { Wallet } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { formatCurrency } from "../../utils/pricing";

/** Sits right on the payment screen, where the discount actually gets applied — shows exactly
 * how much of this bill iRA Cash covers, and what (if anything) rolls over to the next charge,
 * so the mechanic reads as "money in your favor" rather than a hidden coupon. */
export function WalletDiscountCard({ transactionValue }: { transactionValue: number }) {
  const wallet = useWallet();
  const discount = wallet.previewDiscount(transactionValue);
  if (discount <= 0) return null;

  const remainingAfter = Math.max(0, wallet.balance - discount);
  const daysLeft = Math.max(1, Math.ceil((wallet.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));

  return (
    <div className="rounded-card bg-primary/10 border border-primary/30 px-3.5 py-3">
      <div className="flex items-center gap-2">
        <Wallet size={16} className="text-primary shrink-0" />
        <p className="text-[13px] font-semibold text-primary">iRA Cash applied — {formatCurrency(discount)} off</p>
      </div>
      <p className="text-[11px] text-secondaryText mt-1 leading-relaxed">
        50% of this bill covered from your iRA Cash balance.{" "}
        {remainingAfter > 0
          ? `${formatCurrency(remainingAfter)} carries forward to your next charge.`
          : "you've used your full balance."}{" "}
        expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}.
      </p>
    </div>
  );
}

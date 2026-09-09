import { IndianRupee } from "lucide-react";

export function PaymentPill() {
  return (
    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-pill bg-primary/15 text-primary text-[11px] font-medium">
      <IndianRupee size={11} />
      Pay in iRA.ev
    </span>
  );
}

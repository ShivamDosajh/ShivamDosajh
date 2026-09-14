import { ShieldCheck } from "lucide-react";

/** Sits right above the pay CTA on every payment-decision screen — reassurance plus a
 * concrete reason not to back out to a card reader or another app at the last step. */
export function PayTrustLine() {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-secondaryText mb-3">
      <ShieldCheck size={13} className="text-primary shrink-0" />
      secure UPI payment · charging starts instantly · no card reader needed
    </p>
  );
}

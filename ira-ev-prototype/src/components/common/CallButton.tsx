import { Phone } from "lucide-react";

interface CallButtonProps {
  className?: string;
}

/** A white rounded-square quick-call action, floating over the map and appearing next to the
 * CPO logo on the charger-selection screen — a persistent "reach a human" affordance. */
export function CallButton({ className = "" }: CallButtonProps) {
  return (
    <button
      aria-label="Call for support"
      className={`w-11 h-11 rounded-card bg-white flex items-center justify-center shadow-lg active:opacity-70 shrink-0 ${className}`}
    >
      <Phone size={20} className="text-[#1a1a1a]" />
    </button>
  );
}

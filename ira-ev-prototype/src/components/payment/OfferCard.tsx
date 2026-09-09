import { ChevronRight } from "lucide-react";
import type { Offer } from "../../types/charging";

export function OfferCard({ offer, onClick }: { offer: Offer; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 rounded-card bg-surfaceRaised border border-border px-4 py-3.5 text-left min-h-[44px]"
    >
      <div>
        <p className="text-[13px] font-semibold text-primary">{offer.title}</p>
        <p className="text-[13px] text-text mt-0.5">{offer.description}</p>
      </div>
      <ChevronRight size={18} className="text-secondaryText shrink-0" />
    </button>
  );
}

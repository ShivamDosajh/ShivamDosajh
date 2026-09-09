import { useState } from "react";
import { ChevronDown, ChevronUp, IndianRupee } from "lucide-react";
import { primaryPaymentMethods, otherUpiApps } from "../../data/payments";

const logoStyles: Record<string, { bg: string; text: string; label: string }> = {
  "amazon-pay": { bg: "bg-[#232f3e]", text: "text-[#ff9900]", label: "a" },
  "google-pay": { bg: "bg-white", text: "text-[#4285f4]", label: "G" },
  paytm: { bg: "bg-[#00baf2]", text: "text-white", label: "P" },
  "bhim-upi": { bg: "bg-[#1a1a1a]", text: "text-primary", label: "₹" },
};

function MethodLogo({ id }: { id: string }) {
  const style = logoStyles[id] ?? { bg: "bg-surfaceRaised", text: "text-text", label: "?" };
  return (
    <div
      className={`w-10 h-10 rounded-full ${style.bg} ${style.text} flex items-center justify-center font-bold text-[15px] shrink-0 border border-border/50`}
    >
      {style.label}
    </div>
  );
}

interface PaymentMethodListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PaymentMethodList({ selectedId, onSelect }: PaymentMethodListProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {primaryPaymentMethods.map((method) => (
        <button
          key={method.id}
          onClick={() => onSelect(method.id)}
          className={`w-full flex items-center gap-3 rounded-card border px-4 py-3 min-h-[44px] ${
            selectedId === method.id ? "border-primary bg-primary/10" : "border-border bg-surfaceRaised"
          }`}
        >
          <MethodLogo id={method.id} />
          <span className="text-[14px] font-medium flex-1 text-left">{method.label}</span>
          {selectedId === method.id && <IndianRupee size={16} className="text-primary" />}
        </button>
      ))}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-1 py-2.5 min-h-[44px]"
      >
        <span className="text-[14px] text-text">other UPI apps</span>
        {expanded ? (
          <ChevronUp size={18} className="text-secondaryText" />
        ) : (
          <ChevronDown size={18} className="text-secondaryText" />
        )}
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {otherUpiApps.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`w-full flex items-center gap-3 rounded-card border px-4 py-3 min-h-[44px] ${
                selectedId === method.id ? "border-primary bg-primary/10" : "border-border bg-surfaceRaised"
              }`}
            >
              <MethodLogo id={method.id} />
              <span className="text-[14px] font-medium flex-1 text-left">{method.label}</span>
              {selectedId === method.id && <IndianRupee size={16} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

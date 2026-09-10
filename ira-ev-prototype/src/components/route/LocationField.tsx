import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface LocationFieldProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string;
  onClick: () => void;
}

export function LocationField({ icon: Icon, iconColor = "text-primary", label, value, onClick }: LocationFieldProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-card bg-surfaceRaised border border-border px-3.5 py-3 min-h-[44px] text-left"
    >
      <div className={`w-9 h-9 rounded-full bg-background flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-secondaryText lowercase">{label}</p>
        <p className="text-[15px] text-text font-medium truncate">{value}</p>
      </div>
      <ChevronRight size={16} className="text-secondaryText shrink-0" />
    </button>
  );
}

import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}

export function Chip({ children, active = false, onClick, icon }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2 h-8 pl-1 pr-3 py-1 rounded-pill text-[12px] font-semibold leading-4 whitespace-nowrap shrink-0",
        "border transition-colors min-h-[32px]",
        active ? "bg-primary border-primary text-textOnChip" : "bg-surfaceRaised border-border text-text",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}

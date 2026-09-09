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
        "flex items-center gap-1.5 h-9 px-3.5 rounded-pill text-[13px] font-medium whitespace-nowrap shrink-0",
        "border transition-colors min-h-[36px]",
        active
          ? "bg-primary/15 border-primary text-primary"
          : "bg-surfaceRaised border-border text-text",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}

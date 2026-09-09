import type { LucideIcon } from "lucide-react";

interface IconActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function IconAction({ icon: Icon, label, onClick }: IconActionProps) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center gap-1.5 py-2 min-h-[44px] active:opacity-70">
      <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary">
        <Icon size={19} />
      </div>
      <span className="text-[12px] text-text lowercase">{label}</span>
    </button>
  );
}

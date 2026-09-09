import { Zap, Map, History, MessageSquareText } from "lucide-react";

export type BottomTab = "station" | "routes" | "history" | "feedback";

interface BottomNavigationProps {
  active: BottomTab;
  onChange: (tab: BottomTab) => void;
}

const tabs: { id: BottomTab; label: string; icon: typeof Zap }[] = [
  { id: "station", label: "station", icon: Zap },
  { id: "routes", label: "routes", icon: Map },
  { id: "history", label: "history", icon: History },
  { id: "feedback", label: "feedback", icon: MessageSquareText },
];

export function BottomNavigation({ active, onChange }: BottomNavigationProps) {
  return (
    <nav className="shrink-0 bg-background border-t border-border safe-bottom">
      <div className="flex items-stretch h-16">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] active:opacity-70"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={20} className={isActive ? "text-primary" : "text-secondaryText"} />
              <span
                className={`text-[11px] lowercase ${
                  isActive ? "text-primary font-medium" : "text-secondaryText"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

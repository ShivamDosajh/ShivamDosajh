type Tab = "overview" | "reviews";

interface StationTabsProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function StationTabs({ active, onChange }: StationTabsProps) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "overview" },
    { id: "reviews", label: "reviews" },
  ];

  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 pb-2.5 pt-1 text-[14px] font-medium lowercase border-b-2 min-h-[44px] ${
            active === tab.id ? "text-primary border-primary" : "text-secondaryText border-transparent"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

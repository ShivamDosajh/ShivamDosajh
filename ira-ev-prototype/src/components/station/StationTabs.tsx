type Tab = "overview" | "reviews" | "amenities";

interface StationTabsProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function StationTabs({ active, onChange }: StationTabsProps) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "overview" },
    { id: "reviews", label: "reviews" },
    { id: "amenities", label: "amenities" },
  ];

  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 h-[52px] pt-2.5 text-[16px] font-semibold leading-4 lowercase border-b-2 ${
            active === tab.id ? "text-primary border-primary" : "text-secondaryText border-inactiveIndicator"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

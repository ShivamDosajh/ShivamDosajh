import { Plug, PlugZap } from "lucide-react";
import type { Charger } from "../../types/charging";

interface ChargerCardProps {
  charger: Charger;
  selected: boolean;
  onSelect: () => void;
}

export function ChargerCard({ charger, selected, onSelect }: ChargerCardProps) {
  const disabled = !charger.available;

  return (
    <div className="rounded-card bg-surface border border-border overflow-hidden">
      <p className="text-[16px] font-semibold px-4 pt-3.5 pb-2.5">{charger.name}</p>
      <div className="h-px bg-border" />
      <button
        onClick={onSelect}
        disabled={disabled}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[44px] ${
          disabled ? "opacity-50" : "active:bg-surfaceRaised"
        }`}
      >
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          {charger.speed === "rapid" ? <PlugZap size={28} className="text-text" /> : <Plug size={28} className="text-text" />}
          <span className="text-[12px] leading-4 text-secondaryText">{charger.power.toFixed(0)} kW</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-medium">
            {charger.connector}({charger.name})
          </p>
          <p className="text-[14px] text-secondaryText">
            ₹{charger.pricePerKwh.toFixed(0)}/kWh • {charger.speed}
            {disabled ? " • in use" : ""}
          </p>
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? "border-primary" : "border-secondaryText"
          }`}
        >
          {selected && <div className="w-3 h-3 rounded-full bg-primary" />}
        </div>
      </button>
    </div>
  );
}

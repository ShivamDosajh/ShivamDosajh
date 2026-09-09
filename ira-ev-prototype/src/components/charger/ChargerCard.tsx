import { Check, Plug, PlugZap } from "lucide-react";
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
      <p className="text-[13px] text-secondaryText px-4 pt-3 pb-2">{charger.name}</p>
      <div className="h-px bg-border" />
      <button
        onClick={onSelect}
        disabled={disabled}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[44px] ${
          disabled ? "opacity-50" : "active:bg-surfaceRaised"
        }`}
      >
        <div className="w-11 h-11 rounded-full bg-surfaceRaised border border-border flex items-center justify-center shrink-0">
          {charger.speed === "rapid" ? (
            <PlugZap size={20} className="text-primary" />
          ) : (
            <Plug size={20} className="text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-secondaryText">{charger.power.toFixed(1)} kW</p>
          <p className="text-[15px] font-medium">
            {charger.connector}({charger.name})
          </p>
          <p className="text-[13px] text-secondaryText">
            ₹{charger.pricePerKwh.toFixed(2)}/kWh • {charger.speed}
            {disabled ? " • in use" : ""}
          </p>
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? "border-success bg-success" : "border-secondaryText"
          }`}
        >
          {selected && <Check size={14} className="text-black" strokeWidth={3} />}
        </div>
      </button>
    </div>
  );
}

import { Plug, PlugZap, ChevronRight } from "lucide-react";
import type { Charger } from "../../types/charging";

interface GunQuickSelectListProps {
  chargers: Charger[];
  onSelect: (chargerId: string) => void;
}

/** Every individual gun, tappable right from the station short card — used by the quick-pay
 * experiment so picking a charger takes one tap instead of a trip through a separate
 * charger-selection screen. */
export function GunQuickSelectList({ chargers, onSelect }: GunQuickSelectListProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] text-text">tap a gun to start</p>
      {chargers.map((charger) => {
        const disabled = !charger.available;
        return (
          <button
            key={charger.id}
            onClick={() => onSelect(charger.id)}
            disabled={disabled}
            className={`w-full flex items-center gap-3 rounded-card border px-3.5 py-3 min-h-[44px] text-left ${
              disabled ? "border-border bg-surfaceRaised opacity-50" : "border-border bg-surfaceRaised active:bg-surface"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
              {charger.speed === "rapid" ? (
                <PlugZap size={18} className="text-primary" />
              ) : (
                <Plug size={18} className="text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium truncate">
                {charger.connector}({charger.name}) · {charger.power.toFixed(1)} kW
              </p>
              <p className="text-[12px] text-secondaryText">
                ₹{charger.pricePerKwh.toFixed(2)}/kWh • {charger.speed}
                {disabled ? " • in use" : ""}
              </p>
            </div>
            {!disabled && <ChevronRight size={16} className="text-secondaryText shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

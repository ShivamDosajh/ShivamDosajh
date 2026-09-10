import { Car, Check } from "lucide-react";
import { vehicles } from "../../data/vehicles";

interface VehicleSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function VehicleSelector({ selectedId, onSelect }: VehicleSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
      {vehicles.map((vehicle) => {
        const active = vehicle.id === selectedId;
        return (
          <button
            key={vehicle.id}
            onClick={() => onSelect(vehicle.id)}
            className={`shrink-0 w-[160px] rounded-card border p-3.5 text-left relative ${
              active ? "border-primary bg-primary/10" : "border-border bg-surfaceRaised"
            }`}
          >
            {active && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check size={12} className="text-black" strokeWidth={3} />
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center mb-2">
              <Car size={18} className="text-primary" />
            </div>
            <p className="text-[13px] text-secondaryText">{vehicle.make}</p>
            <p className="text-[14px] font-semibold leading-snug">{vehicle.model}</p>
            <p className="text-[11px] text-secondaryText mt-1.5">
              {vehicle.batteryCapacityKwh} kWh · {vehicle.maxChargeRateKw}kW max
            </p>
          </button>
        );
      })}
    </div>
  );
}

import { Car, BatteryFull, BatteryMedium, BatteryLow, Gauge, Route as RouteIcon } from "lucide-react";
import { myConnectedVehicle } from "../../data/vehicles";

function batteryIcon(socPercent: number) {
  if (socPercent >= 60) return BatteryFull;
  if (socPercent >= 25) return BatteryMedium;
  return BatteryLow;
}

function batteryColor(socPercent: number) {
  if (socPercent >= 60) return "text-primary";
  if (socPercent >= 25) return "text-warning";
  return "text-error";
}

/**
 * This is a connected-car app — the vehicle, its live battery level, and its driving
 * history all come from the car itself rather than a picker, so this is a read-only
 * summary rather than a setting.
 */
export function ConnectedVehicleCard() {
  const vehicle = myConnectedVehicle;
  const BatteryIcon = batteryIcon(vehicle.currentSocPercent);

  return (
    <div className="rounded-card bg-surfaceRaised border border-border p-3.5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
          <Car size={18} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold truncate">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="text-[11px] text-secondaryText flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
            connected · synced {vehicle.lastSyncedMinutesAgo} min ago
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3.5">
        <div className="rounded-button bg-background px-2.5 py-2.5 flex flex-col items-center text-center gap-1">
          <BatteryIcon size={16} className={batteryColor(vehicle.currentSocPercent)} />
          <p className="text-[14px] font-semibold">{vehicle.currentSocPercent}%</p>
          <p className="text-[10px] text-secondaryText lowercase leading-tight">current charge</p>
        </div>
        <div className="rounded-button bg-background px-2.5 py-2.5 flex flex-col items-center text-center gap-1">
          <Gauge size={16} className="text-primary" />
          <p className="text-[14px] font-semibold">{vehicle.efficiencyScore}/100</p>
          <p className="text-[10px] text-secondaryText lowercase leading-tight">efficiency score</p>
        </div>
        <div className="rounded-button bg-background px-2.5 py-2.5 flex flex-col items-center text-center gap-1">
          <RouteIcon size={16} className="text-primary" />
          <p className="text-[14px] font-semibold">{(vehicle.drivingHistoryKm / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-secondaryText lowercase leading-tight">km driven</p>
        </div>
      </div>

      <p className="text-[11px] text-secondaryText mt-2.5">
        trip plan uses your car's live battery and its efficiency score from recent driving —
        no need to enter anything manually
      </p>
    </div>
  );
}

import { Route as RouteIcon, Clock, Zap, IndianRupee } from "lucide-react";
import type { RoutePlan } from "../../types/route";
import { formatDuration } from "../../utils/routePlanner";

export function TripSummaryCard({ plan }: { plan: RoutePlan }) {
  const stats = [
    { icon: RouteIcon, label: "distance", value: `${plan.totalDistanceKm} km` },
    { icon: Clock, label: "total trip time", value: formatDuration(plan.totalTripMin) },
    { icon: Zap, label: "charging stops", value: `${plan.stopCount}` },
    { icon: IndianRupee, label: "est. charging cost", value: `₹${plan.totalCost}` },
  ];

  return (
    <div className="rounded-card bg-surfaceRaised border border-border p-4">
      {!plan.feasible && (
        <div className="mb-3 rounded-button bg-error/15 text-error text-[12px] px-3 py-2">
          this trip may not be reachable with your current settings — try a lower driving style, a bigger
          battery, or loosen your charger filters.
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shrink-0 text-primary">
              <Icon size={14} />
            </div>
            <div>
              <p className="text-[11px] text-secondaryText lowercase">{label}</p>
              <p className="text-[15px] font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="h-px bg-border my-3.5" />
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-secondaryText">
          drive {formatDuration(plan.totalDriveMin)} · charge {formatDuration(plan.totalChargeMin)}
        </span>
        <span className="text-text font-medium">
          arrive at {plan.arrivalSoc}%
        </span>
      </div>
    </div>
  );
}

import { Car } from "lucide-react";

interface StopMarker {
  km: number;
  kind: "charge" | "waypoint";
}

interface TripProgressBarProps {
  totalDistanceKm: number;
  coveredKm: number;
  stopMarkers: StopMarker[];
  startLabel: string;
  destinationLabel: string;
}

/** Sticks to the top of the itinerary as it scrolls, with a car icon sliding along a road
 * line to show how far into the trip each stop is — driven by scroll position in
 * RouteResultsScreen, not by time, so it always matches whatever stop is on screen. */
export function TripProgressBar({ totalDistanceKm, coveredKm, stopMarkers, startLabel, destinationLabel }: TripProgressBarProps) {
  const progress = totalDistanceKm > 0 ? Math.min(1, Math.max(0, coveredKm / totalDistanceKm)) : 0;

  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 pt-2.5 pb-3 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] text-secondaryText truncate max-w-[30%]">{startLabel}</span>
        <span className="text-[12px] text-primary font-semibold tabular-nums shrink-0">
          {Math.round(coveredKm)} <span className="text-secondaryText font-normal">/ {totalDistanceKm} km</span>
        </span>
        <span className="text-[10px] text-secondaryText truncate max-w-[30%] text-right">{destinationLabel}</span>
      </div>
      <div className="relative h-1.5 rounded-pill bg-border mx-3">
        <div
          className="absolute inset-y-0 left-0 rounded-pill bg-primary"
          style={{ width: `${progress * 100}%` }}
        />
        {stopMarkers.map((marker, i) => (
          <div
            key={i}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-background ${
              marker.kind === "charge" ? "w-2 h-2" : "w-1.5 h-1.5"
            } ${marker.km <= coveredKm ? "bg-primary" : "bg-secondaryText/50"}`}
            style={{ left: `${totalDistanceKm > 0 ? (marker.km / totalDistanceKm) * 100 : 0}%` }}
          />
        ))}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-black border-2 border-white shadow"
          style={{ left: `${progress * 100}%` }}
        >
          <Car size={12} className="text-white" />
        </div>
      </div>
    </div>
  );
}

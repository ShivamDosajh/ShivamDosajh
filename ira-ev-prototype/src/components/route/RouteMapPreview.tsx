import { Navigation, Flag, Zap, MapPinned } from "lucide-react";
import { MockMapBackground } from "../map/MockMapBackground";
import type { RoutePlan } from "../../types/route";
import { getLocationById } from "../../data/routeLocations";

interface RouteMapPreviewProps {
  plan: RoutePlan;
  startId: string;
  destinationId: string;
  waypointIds: string[];
}

interface PreviewPoint {
  x: number;
  y: number;
  kind: "start" | "destination" | "charge" | "waypoint";
}

export function RouteMapPreview({ plan, startId, destinationId, waypointIds }: RouteMapPreviewProps) {
  const start = getLocationById(startId);
  const destination = getLocationById(destinationId);
  if (!start || !destination) return null;

  const waypointSet = new Set(waypointIds);
  const points: PreviewPoint[] = [{ ...start.coordinates, kind: "start" }];

  for (const leg of plan.legs) {
    if (leg.kind === "charge") {
      points.push({ ...leg.charger.coordinates, kind: "charge" });
    } else if (leg.isWaypointArrival) {
      const wp = [...waypointSet].map(getLocationById).find((l) => l?.label === leg.toLabel);
      if (wp) points.push({ ...wp.coordinates, kind: "waypoint" });
    }
  }
  points.push({ ...destination.coordinates, kind: "destination" });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="relative w-full h-56 rounded-card overflow-hidden border border-border">
      <MockMapBackground />
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke="#0a8f7e" strokeWidth="0.8" strokeDasharray="2 1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {points.map((p, i) => (
        <div
          key={i}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
        >
          {p.kind === "start" && (
            <div className="w-7 h-7 rounded-full bg-black border-2 border-white flex items-center justify-center shadow">
              <Navigation size={12} className="text-white" fill="white" />
            </div>
          )}
          {p.kind === "destination" && (
            <div className="w-7 h-7 rounded-full bg-error border-2 border-white flex items-center justify-center shadow">
              <Flag size={12} className="text-white" fill="white" />
            </div>
          )}
          {p.kind === "charge" && (
            <div className="w-6 h-6 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow">
              <Zap size={11} className="text-black" fill="black" />
            </div>
          )}
          {p.kind === "waypoint" && (
            <div className="w-6 h-6 rounded-full bg-warning border-2 border-white flex items-center justify-center shadow">
              <MapPinned size={11} className="text-black" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

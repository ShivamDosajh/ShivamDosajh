import { Flag, IndianRupee, Mountain, Navigation, Zap } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { MockMapBackground } from "../../components/map/MockMapBackground";
import { getLocationById } from "../../data/routeLocations";
import { formatDuration } from "../../utils/routePlanner";
import type { AdvancedRoutePlannerApi } from "../../hooks/useAdvancedRoutePlanner";
import type { RouteAlternative } from "../../utils/routeAlternatives";

function altPathD(alt: RouteAlternative, startCoords: { x: number; y: number }, destCoords: { x: number; y: number }): string {
  const points = [
    startCoords,
    ...alt.plan.legs.filter((l) => l.kind === "charge").map((l) => l.charger.coordinates),
    destCoords,
  ];
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

export function RouteOptionsScreen({ planner, onBack }: { planner: AdvancedRoutePlannerApi; onBack: () => void }) {
  const startLoc = getLocationById(planner.startId);
  const destLoc = getLocationById(planner.destinationId);
  if (!startLoc || !destLoc) return null;

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="route options" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <p className="text-[12px] text-secondaryText -mb-1">
            {planner.routeAlternatives.length} route{planner.routeAlternatives.length !== 1 ? "s" : ""} compared — tap a route or card to
            select
          </p>

          <div className="relative w-full h-56 rounded-card overflow-hidden border border-border">
            <MockMapBackground />
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {planner.routeAlternatives
                .filter((alt) => alt.id !== planner.selectedStrategy)
                .map((alt) => (
                  <path
                    key={alt.id}
                    d={altPathD(alt, startLoc.coordinates, destLoc.coordinates)}
                    fill="none"
                    stroke="#646464"
                    strokeWidth="0.6"
                    strokeDasharray="2 1.5"
                    vectorEffect="non-scaling-stroke"
                    onClick={() => planner.selectAlternative(alt.id)}
                  />
                ))}
              {planner.routeAlternatives
                .filter((alt) => alt.id === planner.selectedStrategy)
                .map((alt) => (
                  <path
                    key={alt.id}
                    d={altPathD(alt, startLoc.coordinates, destLoc.coordinates)}
                    fill="none"
                    stroke="#00AF9E"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
            </svg>
            <div style={{ left: `${startLoc.coordinates.x}%`, top: `${startLoc.coordinates.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-7 h-7 rounded-full bg-black border-2 border-white flex items-center justify-center shadow">
                <Navigation size={12} className="text-white" fill="white" />
              </div>
            </div>
            <div style={{ left: `${destLoc.coordinates.x}%`, top: `${destLoc.coordinates.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-7 h-7 rounded-full bg-error border-2 border-white flex items-center justify-center shadow">
                <Flag size={12} className="text-white" fill="white" />
              </div>
            </div>
          </div>

          {planner.routeAlternatives.map((alt) => {
            const selected = alt.id === planner.selectedStrategy;
            const { plan } = alt;
            return (
              <button
                key={alt.id}
                onClick={() => planner.selectAlternative(alt.id)}
                className={`w-full text-left rounded-card border px-3.5 py-3.5 flex flex-col gap-2.5 ${
                  selected ? "border-primary bg-primary/10" : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block text-[12px] font-semibold px-2 py-0.5 rounded-pill ${
                      selected ? "bg-primary text-textOnChip" : "bg-surfaceRaised text-text"
                    }`}
                  >
                    {alt.tag}
                  </span>
                  <span className="text-[14px] font-semibold">{Math.round(plan.totalDistanceKm)} km</span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
                  <span className="text-secondaryText">
                    drive {formatDuration(plan.totalDriveMin)} + charge {formatDuration(plan.totalChargeMin)}
                  </span>
                  <span className="text-secondaryText text-right">total {formatDuration(plan.totalTripMin)}</span>
                  <span className="flex items-center gap-1 text-secondaryText">
                    <Zap size={11} />
                    {plan.stopCount} stop{plan.stopCount !== 1 ? "s" : ""} · {alt.chargerCount} chargers · {alt.gunCount} guns
                  </span>
                  <span className="text-secondaryText text-right">
                    {alt.megaChargerCount} MegaCharger · {alt.verifiedCount} .ev verified
                  </span>
                  <span className="flex items-center gap-0.5 text-secondaryText">
                    <IndianRupee size={11} />
                    {plan.totalCost} est. charging cost
                  </span>
                  <span className="text-secondaryText text-right">arrive at {plan.arrivalSoc}%</span>
                  <span className="flex items-center gap-1 text-secondaryText">
                    <Mountain size={11} />
                    {plan.totalElevationGainM}m climb
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <StickyFooter>
        <Button disabled={!planner.selectedStrategy} onClick={planner.chooseThisRoute}>
          choose this route
        </Button>
      </StickyFooter>
    </div>
  );
}

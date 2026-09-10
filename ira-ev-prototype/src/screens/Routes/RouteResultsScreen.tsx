import { Navigation, Flag } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { RouteMapPreview } from "../../components/route/RouteMapPreview";
import { TripSummaryCard } from "../../components/route/TripSummaryCard";
import { DriveLegRow, ChargeLegRow } from "../../components/route/ItineraryLegRow";
import type { RoutePlannerApi } from "../../hooks/useRoutePlanner";

export function RouteResultsScreen({ planner, onStartNavigation }: { planner: RoutePlannerApi; onStartNavigation: () => void }) {
  const { plan } = planner;
  if (!plan) return null;

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="your route" onBack={planner.editTrip} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <RouteMapPreview
            plan={plan}
            startId={planner.startId}
            destinationId={planner.destinationId}
            waypointIds={planner.waypointIds}
          />

          <TripSummaryCard plan={plan} />

          <div>
            <p className="text-[14px] font-medium mb-1">itinerary</p>
            <div className="flex flex-col">
              <div className="flex gap-3 py-2.5">
                <div className="w-9 flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-black border-2 border-white flex items-center justify-center shadow">
                    <Navigation size={13} className="text-white" fill="white" />
                  </div>
                  <div className="w-px flex-1 bg-border mt-1" />
                </div>
                <div className="pt-1">
                  <p className="text-[13px] text-text">
                    start at <span className="font-medium">{plan.startLabel}</span>
                  </p>
                  <p className="text-[12px] text-secondaryText mt-0.5">SoC {plan.startSoc}%</p>
                </div>
              </div>

              {plan.legs.map((leg, i) =>
                leg.kind === "drive" ? <DriveLegRow key={i} leg={leg} /> : <ChargeLegRow key={i} leg={leg} />
              )}

              <div className="flex gap-3 py-2.5">
                <div className="w-9 flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-error border-2 border-white flex items-center justify-center shadow">
                    <Flag size={13} className="text-white" fill="white" />
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-[13px] text-text">
                    arrive at <span className="font-medium">{plan.destinationLabel}</span>
                  </p>
                  <p className="text-[12px] text-secondaryText mt-0.5">SoC {plan.arrivalSoc}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StickyFooter>
        <div className="flex gap-3">
          <Button variant="outline" onClick={planner.editTrip}>
            edit trip
          </Button>
          <Button variant="primary" onClick={onStartNavigation}>
            start navigation
          </Button>
        </div>
      </StickyFooter>
    </div>
  );
}

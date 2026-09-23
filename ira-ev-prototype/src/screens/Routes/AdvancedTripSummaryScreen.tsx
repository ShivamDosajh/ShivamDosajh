import { Flag, Navigation } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { TripSummaryCard } from "../../components/route/TripSummaryCard";
import { DriveLegRow, ChargeLegRow } from "../../components/route/ItineraryLegRow";
import type { AdvancedRoutePlannerApi } from "../../hooks/useAdvancedRoutePlanner";

export function AdvancedTripSummaryScreen({ planner, onBack }: { planner: AdvancedRoutePlannerApi; onBack: () => void }) {
  const { plan } = planner;
  if (!plan) return null;

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="trip summary" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <TripSummaryCard plan={plan} />

          <div>
            <p className="text-[14px] font-medium mb-2">itinerary</p>
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

              {plan.legs.map((leg, i) => (
                <div key={i}>{leg.kind === "drive" ? <DriveLegRow leg={leg} /> : <ChargeLegRow leg={leg} confirmed onEdit={() => planner.editLeg(Math.floor(i / 2))} />}</div>
              ))}

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
          <Button variant="outline" onClick={onBack}>
            edit trip
          </Button>
          <Button variant="primary" onClick={planner.startTrip}>
            start trip
          </Button>
        </div>
      </StickyFooter>
    </div>
  );
}

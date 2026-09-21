import { useMemo, useState } from "react";
import { Flag, Navigation } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { TripProgressBar } from "../../components/route/TripProgressBar";
import { TripSummaryCard } from "../../components/route/TripSummaryCard";
import { LegByLegMapPreview } from "../../components/route/LegByLegMapPreview";
import { LegOptionCard } from "../../components/route/LegOptionCard";
import { LegChargerDetailSheet } from "../../components/route/LegChargerDetailSheet";
import { DriveLegRow, ChargeLegRow } from "../../components/route/ItineraryLegRow";
import { getLocationById } from "../../data/routeLocations";
import { formatDuration } from "../../utils/routePlanner";
import type { LegByLegPlannerApi } from "../../hooks/useLegByLegPlanner";
import type { LegChargerOption } from "../../types/legByLeg";
import type { RouteLeg, RoutePlan } from "../../types/route";

interface LegByLegBuildScreenProps {
  planner: LegByLegPlannerApi;
  onBack: () => void;
  onStartNavigation: () => void;
  onStartCharging?: (routeChargerId: string, prefill: { units: number; amount: number }) => void;
}

/** 0-indexed charge-leg number a given position in a flat `RouteLeg[]` (drive, charge, drive,
 * charge, ...) belongs to — charge legs always land at odd indices. */
function legIndexForChargeAt(i: number): number {
  return Math.floor(i / 2);
}

export function LegByLegBuildScreen({ planner, onBack, onStartNavigation, onStartCharging }: LegByLegBuildScreenProps) {
  const startLoc = getLocationById(planner.startId);
  const destLoc = getLocationById(planner.destinationId);
  const [detailOption, setDetailOption] = useState<LegChargerOption | null>(null);

  const stopMarkers = useMemo(() => {
    let cum = 0;
    const markers: { km: number; kind: "charge" }[] = [];
    for (const leg of planner.confirmedLegs) {
      if (leg.kind === "drive") cum += leg.distanceKm;
      else markers.push({ km: cum, kind: "charge" });
    }
    return markers;
  }, [planner.confirmedLegs]);

  if (!startLoc || !destLoc) return null;

  if (planner.step === "complete" && planner.plan) {
    return (
      <LegByLegCompleteView
        plan={planner.plan}
        onEditTrip={planner.editTrip}
        onStartNavigation={onStartNavigation}
        onEditLeg={planner.editLeg}
        onStartCharging={onStartCharging}
      />
    );
  }

  const legNumber = Math.floor(planner.confirmedLegs.length / 2) + 1;

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="build your trip" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <LegByLegMapPreview
            startCoordinates={startLoc.coordinates}
            destinationCoordinates={destLoc.coordinates}
            confirmedLegs={planner.confirmedLegs}
            activeLeg={planner.activeLeg}
          />

          <TripProgressBar
            totalDistanceKm={Math.round(planner.totalDistanceKm)}
            coveredKm={planner.coveredKm}
            stopMarkers={stopMarkers}
            startLabel={startLoc.label}
            destinationLabel={destLoc.label}
          />

          {planner.confirmedLegs.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[12px] text-secondaryText lowercase">confirmed so far</p>
              {planner.confirmedLegs.map((leg, i) => {
                const legIndex = legIndexForChargeAt(i);
                return (
                  <div key={i}>
                    {leg.kind === "drive" ? (
                      <DriveLegRow leg={leg} />
                    ) : (
                      <ChargeLegRow
                        leg={leg}
                        confirmed
                        onStartCharging={onStartCharging}
                        onEdit={() => planner.editLeg(legIndex)}
                        laterLegCount={planner.confirmedLegCount - legIndex - 1}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {planner.activeLeg?.kind === "charge-choice" && (
            <div className="flex flex-col gap-2.5">
              <p className="text-[14px] font-medium">
                leg {legNumber}: choose a charger from {planner.activeLeg.leg.fromLabel}
              </p>
              <p className="text-[12px] text-secondaryText -mt-1.5">
                {planner.activeLeg.leg.options.length} option{planner.activeLeg.leg.options.length > 1 ? "s" : ""} within range —
                tap one to see full details
              </p>
              {planner.activeLeg.leg.options.map((opt) => (
                <LegOptionCard key={opt.charger.id} option={opt} onOpenDetail={setDetailOption} />
              ))}
            </div>
          )}

          {planner.activeLeg?.kind === "final" && (
            <div className="rounded-card bg-surfaceRaised border border-primary p-3.5 flex flex-col gap-2.5">
              <p className="text-[14px] font-medium flex items-center gap-1.5">
                <Flag size={14} className="text-primary" />
                final leg — no more charging needed
              </p>
              <p className="text-[12px] text-secondaryText">
                drive {planner.activeLeg.leg.driveLeg.distanceKm}km · {formatDuration(planner.activeLeg.leg.driveLeg.durationMin)} · arrive
                at {planner.activeLeg.leg.driveLeg.socEnd}%
              </p>
              <Button onClick={planner.confirmFinalLeg}>finish trip</Button>
            </div>
          )}

          {planner.activeLeg?.kind === "infeasible" && (
            <div className="rounded-card bg-error/10 border border-error p-3.5 flex flex-col gap-2">
              <p className="text-[14px] text-error font-medium">no reachable charger found</p>
              <p className="text-[12px] text-secondaryText">
                nothing matching your filters is within about {planner.activeLeg.maxReachableKm}km from {planner.activeLeg.fromLabel}. try
                loosening your connector/network/power filters, or lowering your minimum acceptable SoC.
              </p>
              <Button variant="outline" onClick={planner.editTrip}>
                edit trip
              </Button>
            </div>
          )}
        </div>
      </div>

      <LegChargerDetailSheet
        option={detailOption}
        onClose={() => setDetailOption(null)}
        onChoose={planner.chooseCharger}
        onStartCharging={onStartCharging}
      />
    </div>
  );
}

function LegByLegCompleteView({
  plan,
  onEditTrip,
  onStartNavigation,
  onEditLeg,
  onStartCharging,
}: {
  plan: RoutePlan;
  onEditTrip: () => void;
  onStartNavigation: () => void;
  onEditLeg: (legIndex: number) => void;
  onStartCharging?: (routeChargerId: string, prefill: { units: number; amount: number }) => void;
}) {
  const totalStops = plan.stopCount;

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="your route" onBack={onEditTrip} />
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
                  <p className="text-[14px] text-text">
                    start at <span className="font-medium">{plan.startLabel}</span>
                  </p>
                  <p className="text-[12px] text-secondaryText mt-0.5">SoC {plan.startSoc}%</p>
                </div>
              </div>

              {plan.legs.map((leg: RouteLeg, i: number) => {
                const legIndex = legIndexForChargeAt(i);
                return (
                  <div key={i}>
                    {leg.kind === "drive" ? (
                      <DriveLegRow leg={leg} />
                    ) : (
                      <ChargeLegRow
                        leg={leg}
                        confirmed
                        onStartCharging={onStartCharging}
                        onEdit={() => onEditLeg(legIndex)}
                        laterLegCount={totalStops - legIndex - 1}
                      />
                    )}
                  </div>
                );
              })}

              <div className="flex gap-3 py-2.5">
                <div className="w-9 flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-error border-2 border-white flex items-center justify-center shadow">
                    <Flag size={13} className="text-white" fill="white" />
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-[14px] text-text">
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
          <Button variant="outline" onClick={onEditTrip}>
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

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Flag, Pencil } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { LegByLegMapPreview } from "../../components/route/LegByLegMapPreview";
import { AdvancedLegOptionCard } from "../../components/route/AdvancedLegOptionCard";
import { getLocationById } from "../../data/routeLocations";
import { formatDuration } from "../../utils/routePlanner";
import type { AdvancedRoutePlannerApi } from "../../hooks/useAdvancedRoutePlanner";

const TOP_RECOMMENDATIONS = 3;

export function AdvancedLegPlannerScreen({ planner, onBack }: { planner: AdvancedRoutePlannerApi; onBack: () => void }) {
  const [seeAllOpen, setSeeAllOpen] = useState(false);
  const startLoc = getLocationById(planner.startId);
  const destLoc = getLocationById(planner.destinationId);

  const estimatedLegCount = useMemo(() => {
    const alt = planner.routeAlternatives.find((a) => a.id === planner.selectedStrategy);
    return alt ? alt.plan.stopCount + 1 : null;
  }, [planner.routeAlternatives, planner.selectedStrategy]);

  if (!startLoc || !destLoc) return null;

  const legNumber = Math.floor(planner.confirmedLegs.length / 2) + 1;
  const topOptions = planner.activeLeg?.kind === "charge-choice" ? planner.activeLeg.leg.options.slice(0, TOP_RECOMMENDATIONS) : [];
  const restOptions = planner.activeLeg?.kind === "charge-choice" ? planner.activeLeg.leg.options.slice(TOP_RECOMMENDATIONS) : [];

  const handleSelect = (chargerId: string) => {
    setSeeAllOpen(false);
    planner.chooseCharger(chargerId);
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        title={
          planner.activeLeg?.kind === "charge-choice"
            ? `leg ${legNumber}${estimatedLegCount ? ` of ${estimatedLegCount}` : ""}`
            : "final leg"
        }
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          {planner.confirmedLegCount > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {Array.from({ length: planner.confirmedLegCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => planner.editLeg(i)}
                  className="w-7 h-7 rounded-full bg-success/20 border border-success text-success text-[11px] font-semibold flex items-center justify-center shrink-0"
                  aria-label={`edit leg ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
              {planner.activeLeg?.kind === "charge-choice" && (
                <span className="w-7 h-7 rounded-full bg-primary text-textOnAction text-[11px] font-semibold flex items-center justify-center shrink-0">
                  {planner.confirmedLegCount + 1}
                </span>
              )}
              {estimatedLegCount &&
                Array.from({ length: Math.max(0, estimatedLegCount - planner.confirmedLegCount - 1) }).map((_, i) => (
                  <span
                    key={`future-${i}`}
                    className="w-7 h-7 rounded-full bg-surfaceRaised text-secondaryText text-[11px] font-semibold flex items-center justify-center shrink-0"
                  >
                    {planner.confirmedLegCount + 2 + i}
                  </span>
                ))}
            </div>
          )}

          <LegByLegMapPreview
            startCoordinates={startLoc.coordinates}
            destinationCoordinates={destLoc.coordinates}
            confirmedLegs={planner.confirmedLegs}
            activeLeg={planner.activeLeg}
          />

          {planner.confirmedLegs.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[12px] text-secondaryText lowercase">confirmed so far</p>
              {planner.confirmedLegs
                .filter((leg): leg is Extract<typeof leg, { kind: "charge" }> => leg.kind === "charge")
                .map((leg, i) => (
                  <button
                    key={i}
                    onClick={() => planner.editLeg(i)}
                    className="w-full flex items-center justify-between gap-2 rounded-card bg-surfaceRaised border border-border px-3 py-2.5 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{leg.charger.name}</p>
                      <p className="text-[11px] text-secondaryText">
                        {leg.arrivalSocPercent}% → {leg.departureSocPercent}% · ₹{leg.costEstimate}
                      </p>
                    </div>
                    <Pencil size={14} className="text-primary shrink-0" />
                  </button>
                ))}
            </div>
          )}

          {planner.activeLeg?.kind === "charge-choice" && (
            <div className="flex flex-col gap-2.5">
              <p className="text-[14px] font-medium">
                {topOptions.length} recommended charger{topOptions.length !== 1 ? "s" : ""} from {planner.activeLeg.leg.fromLabel}
              </p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-1">
                {topOptions.map((opt) => (
                  <AdvancedLegOptionCard key={opt.charger.id} option={opt} onSelect={handleSelect} />
                ))}
              </div>

              {restOptions.length > 0 && (
                <>
                  <button
                    onClick={() => setSeeAllOpen((v) => !v)}
                    className="flex items-center justify-center gap-1.5 h-10 rounded-button border border-border text-[13px] text-secondaryText"
                  >
                    see all {planner.activeLeg.leg.options.length} chargers in this leg
                    {seeAllOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {seeAllOpen && (
                    <div className="flex flex-col gap-2.5">
                      {restOptions.map((opt) => (
                        <div key={opt.charger.id} className="flex justify-center">
                          <AdvancedLegOptionCard option={opt} onSelect={handleSelect} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {planner.activeLeg?.kind === "final" && (
            <div className="rounded-card bg-surfaceRaised border border-primary p-3.5 flex flex-col gap-2.5">
              <p className="text-[14px] font-medium flex items-center gap-1.5">
                <Flag size={14} className="text-primary" />
                final leg — no more charging needed
              </p>
              <p className="text-[12px] text-secondaryText">
                drive {planner.activeLeg.leg.driveLeg.distanceKm}km · {formatDuration(planner.activeLeg.leg.driveLeg.durationMin)} ·
                arrive at {planner.activeLeg.leg.driveLeg.socEnd}%
              </p>
              <Button onClick={planner.confirmFinalLeg}>finish trip</Button>
            </div>
          )}

          {planner.activeLeg?.kind === "infeasible" && (
            <div className="rounded-card bg-error/10 border border-error p-3.5 flex flex-col gap-2">
              <p className="text-[13px] text-error font-medium">no reachable charger found</p>
              <p className="text-[12px] text-secondaryText">
                nothing matching your filters is within about {planner.activeLeg.maxReachableKm}km from{" "}
                {planner.activeLeg.fromLabel}. try loosening your connector/network/power filters, or lowering your minimum
                acceptable SoC.
              </p>
              <Button variant="outline" onClick={planner.editTrip}>
                edit trip
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

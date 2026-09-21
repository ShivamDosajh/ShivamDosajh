import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigation, Flag } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { RouteMapPreview } from "../../components/route/RouteMapPreview";
import { TripSummaryCard } from "../../components/route/TripSummaryCard";
import { TripProgressBar } from "../../components/route/TripProgressBar";
import { DriveLegRow, ChargeLegRow } from "../../components/route/ItineraryLegRow";
import { routeChargers } from "../../data/routeChargers";
import type { RoutePlannerApi } from "../../hooks/useRoutePlanner";

/** How far below the top of the scroll container the "reading line" sits — the point whose
 * nearest itinerary row decides the currently-shown distance-covered. Keeps the number tied
 * to whatever row is actually near the top of the visible list, just below the sticky bar. */
const READING_LINE_OFFSET_PX = 96;

interface RouteResultsScreenProps {
  planner: RoutePlannerApi;
  onStartNavigation: () => void;
  onStartCharging: (routeChargerId: string, prefill: { units: number; amount: number }) => void;
}

export function RouteResultsScreen({ planner, onStartNavigation, onStartCharging }: RouteResultsScreenProps) {
  const { plan } = planner;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const [coveredKm, setCoveredKm] = useState(0);

  // One entry per rendered timeline row (start, each leg, destination), holding the
  // cumulative distance at that point in the trip.
  const rowKm = useMemo(() => {
    if (!plan) return [];
    let cum = 0;
    const list: number[] = [0];
    for (const leg of plan.legs) {
      if (leg.kind === "drive") cum += leg.distanceKm;
      list.push(cum);
    }
    list.push(plan.totalDistanceKm);
    return list;
  }, [plan]);

  const stopMarkers = useMemo(() => {
    if (!plan) return [];
    let cum = 0;
    const markers: { km: number; kind: "charge" | "waypoint" }[] = [];
    for (const leg of plan.legs) {
      if (leg.kind === "drive") {
        cum += leg.distanceKm;
        if (leg.isWaypointArrival) markers.push({ km: cum, kind: "waypoint" });
      } else {
        markers.push({ km: cum, kind: "charge" });
      }
    }
    return markers;
  }, [plan]);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const container = scrollRef.current;
      const nodes = rowRefs.current;
      if (!container || nodes.length < 2) return;
      const referenceY = container.getBoundingClientRect().top + READING_LINE_OFFSET_PX;

      let km = rowKm[0] ?? 0;
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        if (!a || !b) continue;
        const aTop = a.getBoundingClientRect().top;
        const bTop = b.getBoundingClientRect().top;
        if (referenceY < aTop) {
          km = rowKm[i] ?? km;
          break;
        }
        if (referenceY < bTop) {
          const fraction = bTop > aTop ? (referenceY - aTop) / (bTop - aTop) : 0;
          km = (rowKm[i] ?? 0) + ((rowKm[i + 1] ?? 0) - (rowKm[i] ?? 0)) * fraction;
          break;
        }
        km = rowKm[i + 1] ?? km;
      }

      // The reading-line heuristic above can't reach 100%: once the destination row is the
      // last thing in the scrollable content, there's nothing below it to push its top up to
      // the reading line, so the loop stalls short of the full distance. Scrolled-to-bottom is
      // an unambiguous "trip complete" signal on its own — use it directly instead.
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 4;
      if (atBottom) {
        km = rowKm[rowKm.length - 1] ?? km;
      }

      setCoveredKm(km);
    });
  }, [rowKm]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [handleScroll]);

  if (!plan) return null;

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="your route" onBack={planner.editTrip} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <RouteMapPreview
            plan={plan}
            startId={planner.startId}
            destinationId={planner.destinationId}
            waypointRefs={planner.waypointRefs}
          />

          <TripSummaryCard plan={plan} />

          <div>
            <p className="text-[14px] font-medium mb-1">itinerary</p>

            <TripProgressBar
              totalDistanceKm={plan.totalDistanceKm}
              coveredKm={coveredKm}
              stopMarkers={stopMarkers}
              startLabel={plan.startLabel}
              destinationLabel={plan.destinationLabel}
            />

            <div className="flex flex-col">
              <div ref={(el) => (rowRefs.current[0] = el)} className="flex gap-3 py-2.5">
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

              {plan.legs.map((leg, i) => (
                <div key={i} ref={(el) => (rowRefs.current[i + 1] = el)}>
                  {leg.kind === "drive" ? (
                    <DriveLegRow leg={leg} />
                  ) : (
                    <ChargeLegRow
                      leg={leg}
                      onStartCharging={onStartCharging}
                      allChargers={routeChargers}
                      chargerSwaps={planner.chargerSwaps}
                      onSwapCharger={planner.swapCharger}
                      onRemoveStop={planner.removeChargerStop}
                    />
                  )}
                </div>
              ))}

              <div
                ref={(el) => (rowRefs.current[plan.legs.length + 1] = el)}
                className="flex gap-3 py-2.5"
              >
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

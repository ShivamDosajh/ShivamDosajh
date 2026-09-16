import { useCallback, useEffect, useMemo, useState } from "react";
import type { RoutePlan, RoutePreferences, RouteStopPoint } from "../types/route";
import { getLocationById } from "../data/routeLocations";
import { myConnectedVehicle } from "../data/vehicles";
import { routeChargers } from "../data/routeChargers";
import { resolveStopPoint } from "../data/routeStops";
import { planRoute } from "../utils/routePlanner";

export type RoutePlannerStep = "setup" | "results";

function buildDefaultPreferences(): RoutePreferences {
  return {
    // Starting charge defaults to the connected car's live battery level.
    startSocPercent: myConnectedVehicle.currentSocPercent,
    targetArrivalSocPercent: 20,
    minChargeSocPercent: 10,
    preferredConnectors: [],
    preferredNetworks: [],
    minChargerPowerKw: 0,
    drivingStyle: "normal",
    climateControlOn: false,
    avoidHighways: false,
    chargeStopStrategy: "fewest-stops",
    mealStops: [
      { id: "meal-lunch", label: "lunch", time: "13:00" },
      { id: "meal-snack", label: "snack", time: "17:00" },
      { id: "meal-dinner", label: "dinner", time: "20:00" },
    ],
  };
}

export interface RoutePlannerApi {
  step: RoutePlannerStep;
  startId: string;
  destinationId: string;
  /** Ordered stop refs ("loc:<id>" or "charger:<id>"), shown between start and destination. */
  waypointRefs: string[];
  preferences: RoutePreferences;
  plan: RoutePlan | null;
  /** Original charger id -> backup charger id, for stops the driver swapped because the
   * original charger might not be working. Keyed off the original so it survives the
   * original leg disappearing from the recomputed plan. */
  chargerSwaps: Record<string, string>;
  setStartId: (id: string) => void;
  setDestinationId: (id: string) => void;
  addWaypoint: (ref: string) => void;
  removeWaypoint: (ref: string) => void;
  reorderWaypoints: (fromIndex: number, toIndex: number) => void;
  reverseTrip: () => void;
  updatePreferences: (partial: Partial<RoutePreferences>) => void;
  planTrip: () => void;
  editTrip: () => void;
  reset: () => void;
  /** Swaps a charge stop for a backup charger and re-plans the rest of the trip around it.
   * Pass `undefined` as backupChargerId to undo a swap. */
  swapCharger: (originalChargerId: string, backupChargerId: string | undefined) => void;
}

export function useRoutePlanner(): RoutePlannerApi {
  const [step, setStep] = useState<RoutePlannerStep>("setup");
  const [startId, setStartId] = useState("panvel");
  const [destinationId, setDestinationId] = useState("bengaluru");
  const [waypointRefs, setWaypointRefs] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<RoutePreferences>(buildDefaultPreferences);
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [chargerSwaps, setChargerSwaps] = useState<Record<string, string>>({});

  const addWaypoint = useCallback((ref: string) => {
    setWaypointRefs((prev) => (prev.includes(ref) ? prev : [...prev, ref]));
  }, []);

  const removeWaypoint = useCallback((ref: string) => {
    setWaypointRefs((prev) => prev.filter((w) => w !== ref));
  }, []);

  const reorderWaypoints = useCallback((fromIndex: number, toIndex: number) => {
    setWaypointRefs((prev) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const reverseTrip = useCallback(() => {
    setStartId(destinationId);
    setDestinationId(startId);
    setWaypointRefs((prev) => [...prev].reverse());
  }, [startId, destinationId]);

  const updatePreferences = useCallback((partial: Partial<RoutePreferences>) => {
    setPreferences((prev) => ({ ...prev, ...partial }));
  }, []);

  // Backup-charger swaps are modeled as extra pinned waypoints (reusing the same
  // chargerId-pinning mechanism restaurant stops use) rather than special-cased in the
  // planning algorithm itself — the greedy chain walk already treats a pinned chain point
  // as a mandatory stop at that exact charger whenever it's reachable in one hop.
  const buildPlan = useCallback(() => {
    const start = getLocationById(startId);
    const destination = getLocationById(destinationId);
    if (!start || !destination) return null;
    const waypoints = waypointRefs.map(resolveStopPoint).filter((w): w is NonNullable<typeof w> => !!w);
    const swapWaypoints: RouteStopPoint[] = Object.values(chargerSwaps)
      .map((backupChargerId): RouteStopPoint | null => {
        const backup = routeChargers.find((c) => c.id === backupChargerId);
        if (!backup) return null;
        return {
          ref: `swap:${backup.id}`,
          kind: "location",
          label: backup.name,
          subtitle: "backup charger",
          distanceKm: backup.distanceKm,
          coordinates: backup.coordinates,
          elevationM: backup.elevationM,
          chargerId: backup.id,
        };
      })
      .filter((w): w is RouteStopPoint => !!w);
    return planRoute(start, destination, [...waypoints, ...swapWaypoints], myConnectedVehicle, preferences, routeChargers);
  }, [startId, destinationId, waypointRefs, preferences, chargerSwaps]);

  const planTrip = useCallback(() => {
    const nextPlan = buildPlan();
    if (!nextPlan) return;
    setPlan(nextPlan);
    setStep("results");
  }, [buildPlan]);

  // Re-plans automatically the moment a backup charger is chosen (or undone), so the rest
  // of the itinerary always reflects the swap without a separate "re-plan" tap.
  useEffect(() => {
    if (step !== "results") return;
    const nextPlan = buildPlan();
    if (nextPlan) setPlan(nextPlan);
    // Only react to swap changes here — buildPlan itself changes on every keystroke-level
    // preference edit, which shouldn't silently re-plan a screen the driver isn't on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargerSwaps]);

  const editTrip = useCallback(() => setStep("setup"), []);

  const swapCharger = useCallback((originalChargerId: string, backupChargerId: string | undefined) => {
    setChargerSwaps((prev) => {
      const next = { ...prev };
      if (backupChargerId) next[originalChargerId] = backupChargerId;
      else delete next[originalChargerId];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStep("setup");
    setStartId("panvel");
    setDestinationId("bengaluru");
    setWaypointRefs([]);
    setPreferences(buildDefaultPreferences());
    setChargerSwaps({});
    setPlan(null);
  }, []);

  return useMemo(
    () => ({
      step,
      startId,
      destinationId,
      waypointRefs,
      preferences,
      plan,
      chargerSwaps,
      setStartId,
      setDestinationId,
      addWaypoint,
      removeWaypoint,
      reorderWaypoints,
      reverseTrip,
      updatePreferences,
      planTrip,
      editTrip,
      reset,
      swapCharger,
    }),
    [
      step,
      startId,
      destinationId,
      waypointRefs,
      preferences,
      plan,
      chargerSwaps,
      addWaypoint,
      removeWaypoint,
      reorderWaypoints,
      reverseTrip,
      updatePreferences,
      planTrip,
      editTrip,
      reset,
      swapCharger,
    ]
  );
}

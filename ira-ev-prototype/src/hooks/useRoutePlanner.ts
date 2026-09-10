import { useCallback, useMemo, useState } from "react";
import type { RoutePlan, RoutePreferences } from "../types/route";
import { getLocationById } from "../data/routeLocations";
import { getVehicleById } from "../data/vehicles";
import { routeChargers } from "../data/routeChargers";
import { resolveStopPoint } from "../data/routeStops";
import { planRoute } from "../utils/routePlanner";

export type RoutePlannerStep = "setup" | "results";

const DEFAULT_VEHICLE_ID = "tata-nexon-ev-lr";

const defaultPreferences: RoutePreferences = {
  vehicleId: DEFAULT_VEHICLE_ID,
  useCustomVehicle: false,
  startSocPercent: 90,
  targetArrivalSocPercent: 20,
  minChargeSocPercent: 10,
  preferredConnectors: [],
  preferredNetworks: [],
  minChargerPowerKw: 0,
  drivingStyle: "normal",
  climateControlOn: false,
  avoidHighways: false,
  avoidTolls: false,
  trafficLevel: "light",
  chargeStopStrategy: "optimal",
};

export interface RoutePlannerApi {
  step: RoutePlannerStep;
  startId: string;
  destinationId: string;
  /** Ordered stop refs ("loc:<id>" or "charger:<id>"), shown between start and destination. */
  waypointRefs: string[];
  preferences: RoutePreferences;
  plan: RoutePlan | null;
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
}

export function useRoutePlanner(): RoutePlannerApi {
  const [step, setStep] = useState<RoutePlannerStep>("setup");
  const [startId, setStartId] = useState("panvel");
  const [destinationId, setDestinationId] = useState("bengaluru");
  const [waypointRefs, setWaypointRefs] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<RoutePreferences>(defaultPreferences);
  const [plan, setPlan] = useState<RoutePlan | null>(null);

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

  const planTrip = useCallback(() => {
    const start = getLocationById(startId);
    const destination = getLocationById(destinationId);
    if (!start || !destination) return;
    const waypoints = waypointRefs.map(resolveStopPoint).filter((w): w is NonNullable<typeof w> => !!w);
    const vehicle = getVehicleById(preferences.useCustomVehicle ? preferences.vehicleId : DEFAULT_VEHICLE_ID);
    const nextPlan = planRoute(start, destination, waypoints, vehicle, preferences, routeChargers);
    setPlan(nextPlan);
    setStep("results");
  }, [startId, destinationId, waypointRefs, preferences]);

  const editTrip = useCallback(() => setStep("setup"), []);

  const reset = useCallback(() => {
    setStep("setup");
    setStartId("panvel");
    setDestinationId("bengaluru");
    setWaypointRefs([]);
    setPreferences(defaultPreferences);
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
    }),
    [
      step,
      startId,
      destinationId,
      waypointRefs,
      preferences,
      plan,
      addWaypoint,
      removeWaypoint,
      reorderWaypoints,
      reverseTrip,
      updatePreferences,
      planTrip,
      editTrip,
      reset,
    ]
  );
}

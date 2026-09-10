import { useCallback, useMemo, useState } from "react";
import type { RoutePlan, RoutePreferences } from "../types/route";
import { getLocationById } from "../data/routeLocations";
import { getVehicleById } from "../data/vehicles";
import { routeChargers } from "../data/routeChargers";
import { planRoute } from "../utils/routePlanner";

export type RoutePlannerStep = "setup" | "results";

const defaultPreferences: RoutePreferences = {
  vehicleId: "tata-nexon-ev-lr",
  startSocPercent: 90,
  targetArrivalSocPercent: 20,
  minChargeSocPercent: 10,
  preferredConnectors: [],
  preferredNetworks: [],
  minChargerPowerKw: 0,
  drivingStyle: "normal",
  climateControlOn: false,
  avoidHighways: false,
};

export interface RoutePlannerApi {
  step: RoutePlannerStep;
  startId: string;
  destinationId: string;
  waypointIds: string[];
  preferences: RoutePreferences;
  plan: RoutePlan | null;
  setStartId: (id: string) => void;
  setDestinationId: (id: string) => void;
  addWaypoint: (id: string) => void;
  removeWaypoint: (id: string) => void;
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
  const [waypointIds, setWaypointIds] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<RoutePreferences>(defaultPreferences);
  const [plan, setPlan] = useState<RoutePlan | null>(null);

  const addWaypoint = useCallback((id: string) => {
    setWaypointIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeWaypoint = useCallback((id: string) => {
    setWaypointIds((prev) => prev.filter((w) => w !== id));
  }, []);

  const reverseTrip = useCallback(() => {
    setStartId(destinationId);
    setDestinationId(startId);
  }, [startId, destinationId]);

  const updatePreferences = useCallback((partial: Partial<RoutePreferences>) => {
    setPreferences((prev) => ({ ...prev, ...partial }));
  }, []);

  const planTrip = useCallback(() => {
    const start = getLocationById(startId);
    const destination = getLocationById(destinationId);
    if (!start || !destination) return;
    const waypoints = waypointIds.map(getLocationById).filter((w): w is NonNullable<typeof w> => !!w);
    const vehicle = getVehicleById(preferences.vehicleId);
    const nextPlan = planRoute(start, destination, waypoints, vehicle, preferences, routeChargers);
    setPlan(nextPlan);
    setStep("results");
  }, [startId, destinationId, waypointIds, preferences]);

  const editTrip = useCallback(() => setStep("setup"), []);

  const reset = useCallback(() => {
    setStep("setup");
    setStartId("panvel");
    setDestinationId("bengaluru");
    setWaypointIds([]);
    setPreferences(defaultPreferences);
    setPlan(null);
  }, []);

  return useMemo(
    () => ({
      step,
      startId,
      destinationId,
      waypointIds,
      preferences,
      plan,
      setStartId,
      setDestinationId,
      addWaypoint,
      removeWaypoint,
      reverseTrip,
      updatePreferences,
      planTrip,
      editTrip,
      reset,
    }),
    [step, startId, destinationId, waypointIds, preferences, plan, addWaypoint, removeWaypoint, reverseTrip, updatePreferences, planTrip, editTrip, reset]
  );
}

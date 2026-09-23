import { useCallback, useMemo, useState } from "react";
import type { ChargeStopStrategy, RouteLeg, RoutePlan, RoutePreferences, RouteStopPoint } from "../types/route";
import type { ActiveLeg } from "../types/legByLeg";
import type { AdvancedPlannerStep, TripConditions } from "../types/advancedRoute";
import { defaultTripConditions } from "../types/advancedRoute";
import { getLocationById } from "../data/routeLocations";
import { myConnectedVehicle } from "../data/vehicles";
import { routeChargers } from "../data/routeChargers";
import { resolveStopPoint } from "../data/routeStops";
import { computeActiveLeg, buildPlanSummary } from "../utils/legByLegPlanner";
import { generateRouteAlternatives, type RouteAlternative } from "../utils/routeAlternatives";

interface LegCheckpoint {
  posKm: number;
  fromLabel: string;
  soc: number;
  elapsedMin: number;
}

/** A demo-only in-trip alert (PRD v2 §5.6) — a fixed scenario shown on request, not a real
 * continuous SoC-projection loop. */
export interface LiveTripAlert {
  level: "info" | "warning" | "critical";
  message: string;
  alternativeChargerIds: string[];
}

function buildDefaultPreferences(): RoutePreferences {
  return {
    startSocPercent: myConnectedVehicle.currentSocPercent,
    targetArrivalSocPercent: 20,
    minChargeSocPercent: 15,
    preferredConnectors: [],
    preferredNetworks: [],
    minChargerPowerKw: 0,
    drivingStyle: "normal",
    climateControlOn: true,
    avoidHighways: false,
    chargeStopStrategy: "fastest",
    mealStops: [
      { id: "meal-lunch", label: "lunch", time: "13:00" },
      { id: "meal-snack", label: "snack", time: "17:00" },
      { id: "meal-dinner", label: "dinner", time: "20:00" },
    ],
  };
}

export interface AdvancedRoutePlannerApi {
  step: AdvancedPlannerStep;
  startId: string;
  destinationId: string;
  waypointRefs: string[];
  preferences: RoutePreferences;
  tripConditions: TripConditions;
  setStartId: (id: string) => void;
  setDestinationId: (id: string) => void;
  addWaypoint: (ref: string) => void;
  removeWaypoint: (ref: string) => void;
  reverseTrip: () => void;
  updatePreferences: (partial: Partial<RoutePreferences>) => void;
  updateTripConditions: (partial: Partial<TripConditions>) => void;
  /** Screen 1 -> 2: computes the route alternatives. */
  planRoute: () => void;
  /** Screen 1 <- 2/3/4: back to trip inputs. */
  editTrip: () => void;
  routeAlternatives: RouteAlternative[];
  selectedStrategy: ChargeStopStrategy | null;
  selectAlternative: (id: ChargeStopStrategy) => void;
  /** Screen 2 -> 3: locks in the chosen route and starts the leg-by-leg build. */
  chooseThisRoute: () => void;
  /** Legs already committed, in trip order. */
  confirmedLegs: RouteLeg[];
  activeLeg: ActiveLeg | null;
  confirmedLegCount: number;
  chooseCharger: (chargerId: string) => void;
  editLeg: (legIndex: number) => void;
  /** Screen 3 -> 4: commits the final "no more charging needed" leg. */
  confirmFinalLeg: () => void;
  plan: RoutePlan | null;
  coveredKm: number;
  totalDistanceKm: number;
  /** Screen 4 -> 5. */
  startTrip: () => void;
  liveAlert: LiveTripAlert | null;
  /** Demo-only: shows a canned alert scenario so the Live Trip screen has something to react to. */
  triggerDemoAlert: (level: LiveTripAlert["level"]) => void;
  dismissAlert: () => void;
  reset: () => void;
}

export function useAdvancedRoutePlanner(): AdvancedRoutePlannerApi {
  const [step, setStep] = useState<AdvancedPlannerStep>("inputs");
  const [startId, setStartId] = useState("panvel");
  const [destinationId, setDestinationId] = useState("bengaluru");
  const [waypointRefs, setWaypointRefs] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<RoutePreferences>(buildDefaultPreferences);
  const [tripConditions, setTripConditions] = useState<TripConditions>(defaultTripConditions);
  const [routeAlternatives, setRouteAlternatives] = useState<RouteAlternative[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<ChargeStopStrategy | null>(null);
  const [confirmedLegs, setConfirmedLegs] = useState<RouteLeg[]>([]);
  const [activeLeg, setActiveLeg] = useState<ActiveLeg | null>(null);
  const [checkpoints, setCheckpoints] = useState<LegCheckpoint[]>([]);
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [liveAlert, setLiveAlert] = useState<LiveTripAlert | null>(null);

  const [posKm, setPosKm] = useState(0);
  const [soc, setSoc] = useState(0);
  const [elapsedMin, setElapsedMin] = useState(0);
  const [departureTime, setDepartureTime] = useState<Date>(() => new Date());

  const addWaypoint = useCallback((ref: string) => {
    setWaypointRefs((prev) => (prev.includes(ref) ? prev : [...prev, ref]));
  }, []);

  const removeWaypoint = useCallback((ref: string) => {
    setWaypointRefs((prev) => prev.filter((w) => w !== ref));
  }, []);

  const reverseTrip = useCallback(() => {
    setStartId(destinationId);
    setDestinationId(startId);
    setWaypointRefs((prev) => [...prev].reverse());
  }, [startId, destinationId]);

  const updatePreferences = useCallback((partial: Partial<RoutePreferences>) => {
    setPreferences((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateTripConditions = useCallback((partial: Partial<TripConditions>) => {
    setTripConditions((prev) => ({ ...prev, ...partial }));
  }, []);

  const planRouteAction = useCallback(() => {
    const start = getLocationById(startId);
    const destination = getLocationById(destinationId);
    if (!start || !destination) return;
    const waypoints = waypointRefs.map(resolveStopPoint).filter((w): w is RouteStopPoint => !!w);
    const alternatives = generateRouteAlternatives(start, destination, waypoints, myConnectedVehicle, preferences);
    setRouteAlternatives(alternatives);
    setSelectedStrategy(alternatives[0]?.id ?? null);
    setStep("options");
  }, [startId, destinationId, waypointRefs, preferences]);

  const editTrip = useCallback(() => setStep("inputs"), []);

  const selectAlternative = useCallback((id: ChargeStopStrategy) => setSelectedStrategy(id), []);

  const chooseThisRoute = useCallback(() => {
    const start = getLocationById(startId);
    const destination = getLocationById(destinationId);
    if (!start || !destination || !selectedStrategy) return;
    const nextPrefs: RoutePreferences = { ...preferences, chargeStopStrategy: selectedStrategy };
    setPreferences(nextPrefs);

    const now = new Date();
    setDepartureTime(now);
    setPosKm(start.distanceKm);
    setSoc(nextPrefs.startSocPercent);
    setElapsedMin(0);
    setConfirmedLegs([]);
    setPlan(null);
    setCheckpoints([{ posKm: start.distanceKm, fromLabel: start.label, soc: nextPrefs.startSocPercent, elapsedMin: 0 }]);
    const next = computeActiveLeg(
      start.distanceKm,
      start.label,
      nextPrefs.startSocPercent,
      0,
      destination,
      myConnectedVehicle,
      nextPrefs,
      routeChargers,
      now
    );
    setActiveLeg(next);
    setStep("legs");
  }, [startId, destinationId, selectedStrategy, preferences]);

  const chooseCharger = useCallback(
    (chargerId: string) => {
      if (!activeLeg || activeLeg.kind !== "charge-choice") return;
      const option = activeLeg.leg.options.find((o) => o.charger.id === chargerId);
      if (!option) return;
      const destination = getLocationById(destinationId);
      if (!destination) return;

      const nextConfirmed = [...confirmedLegs, option.driveLeg, option.chargeLeg];
      const nextPosKm = option.charger.distanceKm;
      const nextSoc = option.chargeLeg.departureSocPercent;
      const nextElapsedMin = elapsedMin + option.driveLeg.durationMin + option.chargeLeg.chargeDurationMin;

      setConfirmedLegs(nextConfirmed);
      setPosKm(nextPosKm);
      setSoc(nextSoc);
      setElapsedMin(nextElapsedMin);
      setCheckpoints((prev) => [
        ...prev,
        { posKm: nextPosKm, fromLabel: option.charger.name, soc: nextSoc, elapsedMin: nextElapsedMin },
      ]);

      const next = computeActiveLeg(
        nextPosKm,
        option.charger.name,
        nextSoc,
        nextElapsedMin,
        destination,
        myConnectedVehicle,
        preferences,
        routeChargers,
        departureTime
      );
      setActiveLeg(next);
    },
    [activeLeg, confirmedLegs, elapsedMin, destinationId, preferences, departureTime]
  );

  const editLeg = useCallback(
    (legIndex: number) => {
      const checkpoint = checkpoints[legIndex];
      const destination = getLocationById(destinationId);
      if (!checkpoint || !destination) return;

      setConfirmedLegs((prev) => prev.slice(0, legIndex * 2));
      setCheckpoints((prev) => prev.slice(0, legIndex + 1));
      setPosKm(checkpoint.posKm);
      setSoc(checkpoint.soc);
      setElapsedMin(checkpoint.elapsedMin);
      setPlan(null);
      setStep("legs");

      const next = computeActiveLeg(
        checkpoint.posKm,
        checkpoint.fromLabel,
        checkpoint.soc,
        checkpoint.elapsedMin,
        destination,
        myConnectedVehicle,
        preferences,
        routeChargers,
        departureTime
      );
      setActiveLeg(next);
    },
    [checkpoints, destinationId, preferences, departureTime]
  );

  const confirmFinalLeg = useCallback(() => {
    if (!activeLeg || activeLeg.kind !== "final") return;
    const start = getLocationById(startId);
    const destination = getLocationById(destinationId);
    if (!start || !destination) return;
    const nextConfirmed = activeLeg.leg.driveLeg.distanceKm > 0 ? [...confirmedLegs, activeLeg.leg.driveLeg] : confirmedLegs;
    setConfirmedLegs(nextConfirmed);
    const summary = buildPlanSummary(start.label, destination.label, preferences.startSocPercent, nextConfirmed, preferences);
    setPlan(summary);
    setActiveLeg(null);
    setStep("summary");
  }, [activeLeg, confirmedLegs, startId, destinationId, preferences]);

  const startTrip = useCallback(() => {
    setLiveAlert(null);
    setStep("live");
  }, []);

  const triggerDemoAlert = useCallback(
    (level: LiveTripAlert["level"]) => {
      const upcomingChargerIds = confirmedLegs
        .filter((leg): leg is Extract<RouteLeg, { kind: "charge" }> => leg.kind === "charge")
        .slice(-3)
        .map((leg) => leg.charger.id);
      const messages: Record<LiveTripAlert["level"], string> = {
        info: "Running slightly behind plan — arrival SoC now projected 3% lower than expected.",
        warning: "Projected arrival SoC is close to your minimum. Consider easing off speed or switching chargers.",
        critical: "Your next charger looks unreachable at this pace. Switch to one of these now.",
      };
      setLiveAlert({ level, message: messages[level], alternativeChargerIds: upcomingChargerIds });
    },
    [confirmedLegs]
  );

  const dismissAlert = useCallback(() => setLiveAlert(null), []);

  const reset = useCallback(() => {
    setStep("inputs");
    setStartId("panvel");
    setDestinationId("bengaluru");
    setWaypointRefs([]);
    setPreferences(buildDefaultPreferences());
    setTripConditions(defaultTripConditions());
    setRouteAlternatives([]);
    setSelectedStrategy(null);
    setConfirmedLegs([]);
    setActiveLeg(null);
    setCheckpoints([]);
    setPlan(null);
    setLiveAlert(null);
  }, []);

  const totalDistanceKm = useMemo(() => {
    const start = getLocationById(startId);
    const destination = getLocationById(destinationId);
    if (!start || !destination) return 0;
    return Math.abs(destination.distanceKm - start.distanceKm);
  }, [startId, destinationId]);

  const coveredKm = useMemo(() => {
    const start = getLocationById(startId);
    if (!start) return 0;
    return Math.abs(posKm - start.distanceKm);
  }, [startId, posKm]);

  return useMemo(
    () => ({
      step,
      startId,
      destinationId,
      waypointRefs,
      preferences,
      tripConditions,
      setStartId,
      setDestinationId,
      addWaypoint,
      removeWaypoint,
      reverseTrip,
      updatePreferences,
      updateTripConditions,
      planRoute: planRouteAction,
      editTrip,
      routeAlternatives,
      selectedStrategy,
      selectAlternative,
      chooseThisRoute,
      confirmedLegs,
      activeLeg,
      confirmedLegCount: checkpoints.length > 0 ? checkpoints.length - 1 : 0,
      chooseCharger,
      editLeg,
      confirmFinalLeg,
      plan,
      coveredKm,
      totalDistanceKm,
      startTrip,
      liveAlert,
      triggerDemoAlert,
      dismissAlert,
      reset,
    }),
    [
      step,
      startId,
      destinationId,
      waypointRefs,
      preferences,
      tripConditions,
      addWaypoint,
      removeWaypoint,
      reverseTrip,
      updatePreferences,
      updateTripConditions,
      planRouteAction,
      editTrip,
      routeAlternatives,
      selectedStrategy,
      selectAlternative,
      chooseThisRoute,
      confirmedLegs,
      activeLeg,
      checkpoints,
      chooseCharger,
      editLeg,
      confirmFinalLeg,
      plan,
      coveredKm,
      totalDistanceKm,
      startTrip,
      liveAlert,
      triggerDemoAlert,
      dismissAlert,
      reset,
    ]
  );
}

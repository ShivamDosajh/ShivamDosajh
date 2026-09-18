import { useCallback, useMemo, useState } from "react";
import type { RouteLeg, RoutePlan, RoutePreferences } from "../types/route";
import type { ActiveLeg } from "../types/legByLeg";
import { getLocationById } from "../data/routeLocations";
import { myConnectedVehicle } from "../data/vehicles";
import { routeChargers } from "../data/routeChargers";
import { computeActiveLeg, buildPlanSummary } from "../utils/legByLegPlanner";

export type LegByLegStep = "setup" | "building" | "complete";

/** Snapshot of the build state right before a given leg's charger choice was made — lets a
 * confirmed leg be reopened and re-decided without replaying the whole trip from scratch. */
interface LegCheckpoint {
  posKm: number;
  fromLabel: string;
  soc: number;
  elapsedMin: number;
}

function buildDefaultPreferences(): RoutePreferences {
  return {
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

export interface LegByLegPlannerApi {
  step: LegByLegStep;
  startId: string;
  destinationId: string;
  preferences: RoutePreferences;
  setStartId: (id: string) => void;
  setDestinationId: (id: string) => void;
  reverseTrip: () => void;
  updatePreferences: (partial: Partial<RoutePreferences>) => void;
  /** Locks in the trip's start conditions and computes the first leg's charger options. */
  startBuilding: () => void;
  editTrip: () => void;
  reset: () => void;
  /** Legs already committed by the driver, in trip order. */
  confirmedLegs: RouteLeg[];
  /** What the driver needs to decide next — null once the trip is complete. */
  activeLeg: ActiveLeg | null;
  /** Commits one of the current leg's options and advances to the next leg. */
  chooseCharger: (chargerId: string) => void;
  /** Reopens an already-confirmed leg (0-indexed) so its charger can be re-decided — discards
   * that leg and every leg after it, and recomputes options from the state just before it. */
  editLeg: (legIndex: number) => void;
  /** How many charger choices have been confirmed so far — the number of legs `editLeg` can target. */
  confirmedLegCount: number;
  /** Commits the final "no more charging needed" leg and completes the trip. */
  confirmFinalLeg: () => void;
  /** Only set once the trip is complete — a full RoutePlan-shaped summary of every leg. */
  plan: RoutePlan | null;
  /** Cumulative distance traveled so far, for progress display while building. */
  coveredKm: number;
  totalDistanceKm: number;
}

export function useLegByLegPlanner(): LegByLegPlannerApi {
  const [step, setStep] = useState<LegByLegStep>("setup");
  const [startId, setStartId] = useState("panvel");
  const [destinationId, setDestinationId] = useState("bengaluru");
  const [preferences, setPreferences] = useState<RoutePreferences>(buildDefaultPreferences);
  const [confirmedLegs, setConfirmedLegs] = useState<RouteLeg[]>([]);
  const [activeLeg, setActiveLeg] = useState<ActiveLeg | null>(null);
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [checkpoints, setCheckpoints] = useState<LegCheckpoint[]>([]);

  // Running build state — not exposed directly, only through the derived activeLeg/plan.
  const [posKm, setPosKm] = useState(0);
  const [soc, setSoc] = useState(0);
  const [elapsedMin, setElapsedMin] = useState(0);
  const [departureTime, setDepartureTime] = useState<Date>(() => new Date());

  const reverseTrip = useCallback(() => {
    setStartId(destinationId);
    setDestinationId(startId);
  }, [startId, destinationId]);

  const updatePreferences = useCallback((partial: Partial<RoutePreferences>) => {
    setPreferences((prev) => ({ ...prev, ...partial }));
  }, []);

  const startBuilding = useCallback(() => {
    const start = getLocationById(startId);
    const destination = getLocationById(destinationId);
    if (!start || !destination) return;
    const now = new Date();
    setDepartureTime(now);
    setPosKm(start.distanceKm);
    setSoc(preferences.startSocPercent);
    setElapsedMin(0);
    setConfirmedLegs([]);
    setPlan(null);
    setCheckpoints([{ posKm: start.distanceKm, fromLabel: start.label, soc: preferences.startSocPercent, elapsedMin: 0 }]);
    const next = computeActiveLeg(
      start.distanceKm,
      start.label,
      preferences.startSocPercent,
      0,
      destination,
      myConnectedVehicle,
      preferences,
      routeChargers,
      now
    );
    setActiveLeg(next);
    setStep("building");
  }, [startId, destinationId, preferences]);

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
      setStep("building");

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
    setStep("complete");
  }, [activeLeg, confirmedLegs, startId, destinationId, preferences]);

  const editTrip = useCallback(() => setStep("setup"), []);

  const reset = useCallback(() => {
    setStep("setup");
    setStartId("panvel");
    setDestinationId("bengaluru");
    setPreferences(buildDefaultPreferences());
    setConfirmedLegs([]);
    setActiveLeg(null);
    setPlan(null);
    setCheckpoints([]);
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
      preferences,
      setStartId,
      setDestinationId,
      reverseTrip,
      updatePreferences,
      startBuilding,
      editTrip,
      reset,
      confirmedLegs,
      activeLeg,
      chooseCharger,
      editLeg,
      confirmedLegCount: checkpoints.length > 0 ? checkpoints.length - 1 : 0,
      confirmFinalLeg,
      plan,
      coveredKm,
      totalDistanceKm,
    }),
    [
      step,
      startId,
      destinationId,
      preferences,
      reverseTrip,
      updatePreferences,
      startBuilding,
      editTrip,
      reset,
      confirmedLegs,
      activeLeg,
      chooseCharger,
      editLeg,
      checkpoints,
      confirmFinalLeg,
      plan,
      coveredKm,
      totalDistanceKm,
    ]
  );
}

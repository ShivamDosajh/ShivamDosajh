import type {
  ChargeLeg,
  DriveLeg,
  DrivingStyle,
  RouteCharger,
  RouteLeg,
  RouteLocation,
  RoutePlan,
  RoutePreferences,
  VehicleProfile,
} from "../types/route";

const DRIVING_STYLE_CONSUMPTION_FACTOR: Record<DrivingStyle, number> = {
  eco: 0.88,
  normal: 1.0,
  spirited: 1.18,
};

const CLIMATE_CONSUMPTION_FACTOR = 1.1;
/** Approximates real-world charging-curve taper (rated kW is rarely sustained end to end). */
const CHARGE_CURVE_EFFICIENCY = 0.75;
const HIGHWAY_AVG_SPEED_KMH = 75;
const NON_HIGHWAY_AVG_SPEED_KMH = 55;
/** Mid-trip stops charge to a fast, practical level rather than a slow full charge. */
const INTERMEDIATE_STOP_CAP_PERCENT = 80;
const MAX_LEG_ITERATIONS = 40;

export function effectiveConsumptionWhPerKm(vehicle: VehicleProfile, prefs: RoutePreferences): number {
  const styleFactor = DRIVING_STYLE_CONSUMPTION_FACTOR[prefs.drivingStyle];
  const climateFactor = prefs.climateControlOn ? CLIMATE_CONSUMPTION_FACTOR : 1;
  return vehicle.efficiencyWhPerKm * styleFactor * climateFactor;
}

export function filterEligibleChargers(chargers: RouteCharger[], prefs: RoutePreferences): RouteCharger[] {
  return chargers
    .filter((c) => prefs.preferredConnectors.length === 0 || prefs.preferredConnectors.includes(c.connector))
    .filter((c) => prefs.preferredNetworks.length === 0 || prefs.preferredNetworks.includes(c.cpo))
    .filter((c) => c.powerKw >= prefs.minChargerPowerKw)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Plans start -> [waypoints] -> destination as one continuous corridor: charging
 * decisions always look at the overall remaining distance to the final destination,
 * never just to the next waypoint, so a waypoint that happens to fall right at the
 * edge of the car's range can't strand the trip immediately after it. Waypoints only
 * split the itinerary's drive legs for readability when a drive happens to pass one.
 */
export function planRoute(
  startLoc: RouteLocation,
  destinationLoc: RouteLocation,
  waypoints: RouteLocation[],
  vehicle: VehicleProfile,
  prefs: RoutePreferences,
  allChargers: RouteCharger[]
): RoutePlan {
  const direction = destinationLoc.distanceKm >= startLoc.distanceKm ? 1 : -1;
  const checkpoints = [...waypoints].sort((a, b) => direction * (a.distanceKm - b.distanceKm));
  const destKm = destinationLoc.distanceKm;

  const consumptionWhPerKm = effectiveConsumptionWhPerKm(vehicle, prefs);
  const avgSpeedKmh = prefs.avoidHighways ? NON_HIGHWAY_AVG_SPEED_KMH : HIGHWAY_AVG_SPEED_KMH;
  const eligibleChargers = filterEligibleChargers(allChargers, prefs);

  const rangeKmAtSoc = (socPercent: number) =>
    Math.max(0, (socPercent / 100) * vehicle.batteryCapacityKwh * 1000) / consumptionWhPerKm;

  const socAfterDriving = (fromSoc: number, distanceKm: number) =>
    fromSoc - ((distanceKm * consumptionWhPerKm) / (vehicle.batteryCapacityKwh * 1000)) * 100;

  const legs: RouteLeg[] = [];
  let soc = prefs.startSocPercent;
  let posKm = startLoc.distanceKm;
  let fromLabel = startLoc.label;
  let checkpointIdx = 0;
  let totalDriveMin = 0;
  let totalChargeMin = 0;
  let totalCost = 0;
  let feasible = true;

  const isBetween = (x: number, a: number, b: number) => (direction === 1 ? x > a && x < b : x < a && x > b);

  const emitDriveLeg = (toKm: number, toLabel: string, isWaypointArrival: boolean) => {
    const distanceKm = Math.abs(toKm - posKm);
    if (distanceKm <= 0) return;
    const durationMin = (distanceKm / avgSpeedKmh) * 60;
    const socEnd = Math.max(0, socAfterDriving(soc, distanceKm));
    legs.push({
      kind: "drive",
      fromLabel,
      toLabel,
      distanceKm: Math.round(distanceKm),
      durationMin: Math.round(durationMin),
      socStart: Math.round(soc),
      socEnd: Math.round(socEnd),
      isWaypointArrival,
    } satisfies DriveLeg);
    totalDriveMin += durationMin;
    soc = socEnd;
    posKm = toKm;
    fromLabel = toLabel;
  };

  /** Drives from the current position to targetKm, splitting the leg at any waypoints passed along the way. */
  const driveTo = (targetKm: number, toLabel: string) => {
    while (checkpointIdx < checkpoints.length && isBetween(checkpoints[checkpointIdx].distanceKm, posKm, targetKm)) {
      const cp = checkpoints[checkpointIdx];
      emitDriveLeg(cp.distanceKm, cp.label, true);
      checkpointIdx++;
    }
    emitDriveLeg(targetKm, toLabel, false);
  };

  let guard = 0;
  while (guard++ < MAX_LEG_ITERATIONS) {
    const remainingToFinal = Math.abs(destKm - posKm);
    const maxReachable = rangeKmAtSoc(soc - prefs.minChargeSocPercent);

    if (maxReachable >= remainingToFinal) {
      driveTo(destKm, destinationLoc.label);
      break;
    }

    const reachTargetKm = posKm + direction * Math.max(maxReachable * 0.85, 20);
    const candidates = eligibleChargers.filter((c) =>
      direction === 1
        ? c.distanceKm > posKm + 1 && c.distanceKm <= posKm + maxReachable && c.distanceKm < destKm
        : c.distanceKm < posKm - 1 && c.distanceKm >= posKm - maxReachable && c.distanceKm > destKm
    );

    if (candidates.length === 0) {
      feasible = false;
      const driveDist = Math.max(0, maxReachable);
      driveTo(posKm + direction * driveDist, "no reachable charger nearby");
      break;
    }

    const charger = candidates.reduce((best, c) =>
      Math.abs(c.distanceKm - reachTargetKm) < Math.abs(best.distanceKm - reachTargetKm) ? c : best
    );

    driveTo(charger.distanceKm, charger.name);
    const arrivalSoc = soc;

    const remainingAfterCharger = Math.abs(destKm - charger.distanceKm);
    const socNeededForRest =
      ((remainingAfterCharger * consumptionWhPerKm) / (vehicle.batteryCapacityKwh * 1000)) * 100 +
      prefs.minChargeSocPercent;
    // If even the standard intermediate cap would comfortably get us home, size this as
    // the final top-up instead of overcharging to 80% just to idle at a charger longer.
    const isLikelyFinalStop = socNeededForRest <= INTERMEDIATE_STOP_CAP_PERCENT;
    const targetCap = isLikelyFinalStop ? Math.max(prefs.targetArrivalSocPercent, socNeededForRest) : INTERMEDIATE_STOP_CAP_PERCENT;
    const departureSoc = Math.min(100, Math.max(targetCap, socNeededForRest));

    const energyAddedKwh = ((departureSoc - arrivalSoc) / 100) * vehicle.batteryCapacityKwh;
    const effectiveChargeRateKw = Math.min(charger.powerKw, vehicle.maxChargeRateKw) * CHARGE_CURVE_EFFICIENCY;
    const chargeDurationMin = (energyAddedKwh / effectiveChargeRateKw) * 60;
    const cost = energyAddedKwh * charger.pricePerKwh;

    legs.push({
      kind: "charge",
      charger,
      arrivalSocPercent: Math.round(arrivalSoc),
      departureSocPercent: Math.round(departureSoc),
      energyAddedKwh: Math.round(energyAddedKwh * 10) / 10,
      chargeDurationMin: Math.round(chargeDurationMin),
      costEstimate: Math.round(cost),
    } satisfies ChargeLeg);
    totalChargeMin += chargeDurationMin;
    totalCost += cost;
    soc = departureSoc;
  }

  const stopCount = legs.filter((l) => l.kind === "charge").length;

  return {
    legs,
    totalDistanceKm: Math.round(Math.abs(destinationLoc.distanceKm - startLoc.distanceKm)),
    totalDriveMin: Math.round(totalDriveMin),
    totalChargeMin: Math.round(totalChargeMin),
    totalTripMin: Math.round(totalDriveMin + totalChargeMin),
    totalCost: Math.round(totalCost),
    stopCount,
    startLabel: startLoc.label,
    destinationLabel: destinationLoc.label,
    startSoc: prefs.startSocPercent,
    arrivalSoc: Math.round(soc),
    feasible,
  };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

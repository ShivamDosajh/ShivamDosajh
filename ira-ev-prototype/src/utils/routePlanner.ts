import type {
  ChargeLeg,
  ChargeStopStrategy,
  DriveLeg,
  DrivingStyle,
  RouteCharger,
  RouteLeg,
  RouteLocation,
  RoutePlan,
  RoutePreferences,
  RouteStopPoint,
  TrafficLevel,
  VehicleProfile,
} from "../types/route";
import { elevationAtDistance } from "../data/routeLocations";

const DRIVING_STYLE_CONSUMPTION_FACTOR: Record<DrivingStyle, number> = {
  eco: 0.88,
  normal: 1.0,
  spirited: 1.18,
};

const TRAFFIC_SPEED_FACTOR: Record<TrafficLevel, number> = {
  light: 1.0,
  moderate: 0.82,
  heavy: 0.62,
};

/** Per-stop targets: [intermediate charge cap %, fraction of max range to push before stopping]. */
const CHARGE_STRATEGY: Record<ChargeStopStrategy, { cap: number; reachFraction: number }> = {
  optimal: { cap: 75, reachFraction: 0.85 },
  fewer: { cap: 90, reachFraction: 0.93 },
  fewest: { cap: 97, reachFraction: 0.98 },
};

const CLIMATE_CONSUMPTION_FACTOR = 1.1;
/** Approximates real-world charging-curve taper (rated kW is rarely sustained end to end). */
const CHARGE_CURVE_EFFICIENCY = 0.75;
const HIGHWAY_AVG_SPEED_KMH = 75;
const NON_HIGHWAY_AVG_SPEED_KMH = 55;
const MAX_LEG_ITERATIONS = 60;

/** J -> Wh conversion (3600 J/Wh) for the elevation energy model, m·g·h. */
const GRAVITY = 9.81;
const DRIVETRAIN_CLIMB_EFFICIENCY = 0.9;
const REGEN_RECOVERY_EFFICIENCY = 0.65;
const TOLL_RATE_PER_KM = 2.4;
/** Extra distance/time incurred by routing around toll roads. */
const AVOID_TOLLS_DISTANCE_PENALTY = 1.12;
const AVOID_TOLLS_TIME_PENALTY = 1.15;

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

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

interface ChainPoint {
  label: string;
  distanceKm: number;
}

/**
 * Plans start -> waypoints (in the exact order given — drag-to-reorder in the UI maps
 * straight onto this order) -> destination. Charging decisions always look at the
 * distance remaining across the *entire rest of the trip*, not just to the next
 * waypoint, so a waypoint sitting at the edge of the car's range can't strand the trip
 * right after it.
 *
 * Waypoints are re-sorted along the direction of travel before planning: dragging a
 * stop to a new position in the UI still controls which order it's *shown and visited
 * relative to other stops at similar distances*, but the corridor is one-dimensional
 * here, so letting an arbitrary manual order create a literal backward-then-forward
 * leg would make the trip loop on itself. (An earlier version respected raw manual
 * order and produced exactly that — a chain that isn't monotonic in one direction
 * bounced between two chargers indefinitely; caught via the sanity-test harness.)
 */
export function planRoute(
  startLoc: RouteLocation,
  destinationLoc: RouteLocation,
  waypoints: RouteStopPoint[],
  vehicle: VehicleProfile,
  prefs: RoutePreferences,
  allChargers: RouteCharger[],
  departureTime: Date = new Date()
): RoutePlan {
  const direction = destinationLoc.distanceKm >= startLoc.distanceKm ? 1 : -1;
  const sortedWaypoints = [...waypoints].sort((a, b) => direction * (a.distanceKm - b.distanceKm));
  const chain: ChainPoint[] = [
    { label: startLoc.label, distanceKm: startLoc.distanceKm },
    ...sortedWaypoints.map((w) => ({ label: w.label, distanceKm: w.distanceKm })),
    { label: destinationLoc.label, distanceKm: destinationLoc.distanceKm },
  ];

  const consumptionWhPerKm = effectiveConsumptionWhPerKm(vehicle, prefs);
  const baseAvgSpeedKmh = prefs.avoidHighways ? NON_HIGHWAY_AVG_SPEED_KMH : HIGHWAY_AVG_SPEED_KMH;
  const avgSpeedKmh = baseAvgSpeedKmh * TRAFFIC_SPEED_FACTOR[prefs.trafficLevel];
  const lightTrafficSpeedKmh = baseAvgSpeedKmh * TRAFFIC_SPEED_FACTOR.light;
  const distanceMultiplier = prefs.avoidTolls ? AVOID_TOLLS_DISTANCE_PENALTY : 1;
  const timeMultiplier = prefs.avoidTolls ? AVOID_TOLLS_TIME_PENALTY : 1;
  const eligibleChargers = filterEligibleChargers(allChargers, prefs);
  const { cap: intermediateCap, reachFraction } = CHARGE_STRATEGY[prefs.chargeStopStrategy];

  const rangeKmAtSoc = (socPercent: number) =>
    Math.max(0, (socPercent / 100) * vehicle.batteryCapacityKwh * 1000) / consumptionWhPerKm;

  /** Remaining travel distance from posKm (within chain segment segIdx) through to the final destination. */
  const chainRemainingKm = (segIdx: number, posKm: number) => {
    let remaining = Math.abs(chain[segIdx + 1].distanceKm - posKm) * distanceMultiplier;
    for (let i = segIdx + 1; i < chain.length - 1; i++) {
      remaining += Math.abs(chain[i + 1].distanceKm - chain[i].distanceKm) * distanceMultiplier;
    }
    return remaining;
  };

  const legs: RouteLeg[] = [];
  let soc = prefs.startSocPercent;
  let posKm = startLoc.distanceKm;
  let fromLabel = startLoc.label;
  let elapsedMin = 0;
  let totalDriveMin = 0;
  let totalIdealDriveMin = 0;
  let totalChargeMin = 0;
  let totalCost = 0;
  let totalElevationGainM = 0;
  let totalRegenRecoveredKwh = 0;
  let feasible = true;
  let segIdx = 0;

  const driveSegment = (toKm: number, toLabel: string, isWaypointArrival: boolean) => {
    const rawDistanceKm = Math.abs(toKm - posKm);
    if (rawDistanceKm <= 0) return;
    const distanceKm = rawDistanceKm * distanceMultiplier;
    const durationMin = ((distanceKm / avgSpeedKmh) * 60) * timeMultiplier;
    const idealDurationMin = (distanceKm / lightTrafficSpeedKmh) * 60;

    const elevFrom = elevationAtDistance(posKm);
    const elevTo = elevationAtDistance(toKm);
    const elevationDeltaM = elevTo - elevFrom;
    const elevationGainM = Math.max(0, elevationDeltaM);
    const elevationLossM = Math.max(0, -elevationDeltaM);

    const flatEnergyKwh = (distanceKm * consumptionWhPerKm) / 1000;
    const climbEnergyKwh = (vehicle.massKg * GRAVITY * elevationGainM) / 3_600_000 / DRIVETRAIN_CLIMB_EFFICIENCY;
    const regenEnergyKwh = (vehicle.massKg * GRAVITY * elevationLossM) / 3_600_000;
    const regenRecoveredKwh = regenEnergyKwh * REGEN_RECOVERY_EFFICIENCY;

    // Regen can offset a downhill leg's own consumption, but never turn driving into a net gain.
    const netEnergyKwh = Math.max(flatEnergyKwh * 0.15, flatEnergyKwh + climbEnergyKwh - regenRecoveredKwh);
    const socDelta = (netEnergyKwh / vehicle.batteryCapacityKwh) * 100;
    const socEnd = Math.max(0, soc - socDelta);

    elapsedMin += durationMin;
    legs.push({
      kind: "drive",
      fromLabel,
      toLabel,
      distanceKm: Math.round(distanceKm),
      durationMin: Math.round(durationMin),
      socStart: Math.round(soc),
      socEnd: Math.round(socEnd),
      elevationGainM: Math.round(elevationGainM),
      elevationLossM: Math.round(elevationLossM),
      regenRecoveredKwh: Math.round(regenRecoveredKwh * 10) / 10,
      etaClock: formatClock(new Date(departureTime.getTime() + elapsedMin * 60_000)),
      isWaypointArrival,
    } satisfies DriveLeg);

    totalDriveMin += durationMin;
    totalIdealDriveMin += idealDurationMin;
    totalElevationGainM += elevationGainM;
    totalRegenRecoveredKwh += regenRecoveredKwh;
    soc = socEnd;
    posKm = toKm;
    fromLabel = toLabel;
  };

  // Skips segIdx past any chain waypoints already at-or-behind posKm (in the overall
  // travel direction) — needed because a charging stop can legitimately overshoot a
  // pass-through waypoint to reach a farther charger. Without this, the next loop
  // iteration would target a waypoint now behind the car and (re-deriving direction
  // from position) start driving backwards, which is how the algorithm used to bounce
  // indefinitely between two chargers — caught via the sanity-test harness.
  const advanceSegIdx = () => {
    while (segIdx < chain.length - 1 && (chain[segIdx + 1].distanceKm - posKm) * direction <= 0) {
      segIdx++;
    }
  };

  let guard = 0;
  while (guard++ < MAX_LEG_ITERATIONS && segIdx < chain.length - 1) {
    const segTargetKm = chain[segIdx + 1].distanceKm;
    const remainingToFinal = chainRemainingKm(segIdx, posKm);
    const maxReachable = rangeKmAtSoc(soc - prefs.minChargeSocPercent);

    if (maxReachable >= remainingToFinal) {
      driveSegment(segTargetKm, chain[segIdx + 1].label, segIdx + 1 < chain.length - 1);
      advanceSegIdx();
      continue;
    }

    const reachTargetKm = posKm + direction * Math.max(maxReachable * reachFraction, 20);
    // Only consider chargers ahead of us in the overall direction of travel — a
    // charger "reachable" only by driving backwards isn't a real candidate.
    const candidates = eligibleChargers.filter((c) => {
      const aheadKm = (c.distanceKm - posKm) * direction;
      return aheadKm > 1 && aheadKm <= maxReachable;
    });

    if (candidates.length === 0) {
      feasible = false;
      const driveDist = Math.max(0, maxReachable);
      driveSegment(posKm + direction * driveDist, "no reachable charger nearby", false);
      break;
    }

    const charger = candidates.reduce((best, c) =>
      Math.abs(c.distanceKm - reachTargetKm) < Math.abs(best.distanceKm - reachTargetKm) ? c : best
    );

    driveSegment(charger.distanceKm, charger.name, false);
    advanceSegIdx();
    const arrivalSoc = soc;

    const remainingAfterCharger = chainRemainingKm(segIdx, posKm);
    const socNeededForRest = (remainingAfterCharger * consumptionWhPerKm) / (vehicle.batteryCapacityKwh * 1000) * 100 + prefs.minChargeSocPercent;
    // If even the strategy's standard cap would comfortably get us home, size this as
    // the final top-up instead of overcharging just to idle at a charger longer.
    const isLikelyFinalStop = socNeededForRest <= intermediateCap;
    const targetCap = isLikelyFinalStop ? Math.max(prefs.targetArrivalSocPercent, socNeededForRest) : intermediateCap;
    const departureSoc = Math.min(100, Math.max(targetCap, socNeededForRest));

    const energyAddedKwh = ((departureSoc - arrivalSoc) / 100) * vehicle.batteryCapacityKwh;
    const effectiveChargeRateKw = Math.min(charger.powerKw, vehicle.maxChargeRateKw) * CHARGE_CURVE_EFFICIENCY;
    const chargeDurationMin = (energyAddedKwh / effectiveChargeRateKw) * 60;
    const cost = energyAddedKwh * charger.pricePerKwh;

    elapsedMin += chargeDurationMin;
    legs.push({
      kind: "charge",
      charger,
      arrivalSocPercent: Math.round(arrivalSoc),
      departureSocPercent: Math.round(departureSoc),
      energyAddedKwh: Math.round(energyAddedKwh * 10) / 10,
      chargeDurationMin: Math.round(chargeDurationMin),
      costEstimate: Math.round(cost),
      etaClock: formatClock(new Date(departureTime.getTime() + elapsedMin * 60_000)),
    } satisfies ChargeLeg);
    totalChargeMin += chargeDurationMin;
    totalCost += cost;
    soc = departureSoc;
  }

  const stopCount = legs.filter((l) => l.kind === "charge").length;
  const totalDistanceKmRaw = chain.reduce((sum, pt, i) => (i === 0 ? 0 : sum + Math.abs(pt.distanceKm - chain[i - 1].distanceKm)), 0);
  const totalDistanceKm = Math.round(totalDistanceKmRaw * distanceMultiplier);
  const tollCost = prefs.avoidTolls ? 0 : Math.round(totalDistanceKm * TOLL_RATE_PER_KM);
  const totalTrafficDelayMin = Math.round(totalDriveMin - totalIdealDriveMin);

  return {
    legs,
    totalDistanceKm,
    totalDriveMin: Math.round(totalDriveMin),
    totalChargeMin: Math.round(totalChargeMin),
    totalTrafficDelayMin,
    totalTripMin: Math.round(totalDriveMin + totalChargeMin),
    totalCost: Math.round(totalCost),
    tollCost,
    stopCount,
    startLabel: startLoc.label,
    destinationLabel: destinationLoc.label,
    startSoc: prefs.startSocPercent,
    arrivalSoc: Math.round(soc),
    feasible,
    totalElevationGainM: Math.round(totalElevationGainM),
    totalRegenRecoveredKwh: Math.round(totalRegenRecoveredKwh * 10) / 10,
  };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

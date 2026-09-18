import type {
  ChargeLeg,
  ChargeStopStrategy,
  ConnectedVehicle,
  DriveLeg,
  DrivingStyle,
  RouteCharger,
  RouteLeg,
  RouteLocation,
  RoutePlan,
  RoutePreferences,
  RouteStopPoint,
} from "../types/route";
import { elevationAtDistance } from "../data/routeLocations";

const DRIVING_STYLE_CONSUMPTION_FACTOR: Record<DrivingStyle, number> = {
  eco: 0.88,
  normal: 1.0,
  spirited: 1.18,
};

/** Per-stop targets: [intermediate charge cap %, fraction of max range to push before stopping]. */
const CHARGE_STRATEGY: Record<ChargeStopStrategy, { cap: number; reachFraction: number }> = {
  cheapest: { cap: 90, reachFraction: 0.9 },
  fastest: { cap: 70, reachFraction: 0.78 },
  "fewest-stops": { cap: 97, reachFraction: 0.98 },
  amenities: { cap: 85, reachFraction: 0.88 },
};

/** Minimum share of the remaining range a candidate must cover before it's considered for
 * price/power-based picking — otherwise "cheapest"/"fastest" could pick a charger a few km
 * away just because it's marginally cheaper/faster, forcing far more stops than needed. */
const PROGRESS_FILTER_FRACTION = 0.4;
/** How close to a meal time an arrival has to be to count as "near lunch/dinner/snack". */
const MEAL_WINDOW_MIN = 90;

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h % 24) * 60 + (m || 0);
}

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
/** Surface roads (avoiding highways) are also toll-free, but less direct. */
const AVOID_HIGHWAYS_DISTANCE_PENALTY = 1.12;
const AVOID_HIGHWAYS_TIME_PENALTY = 1.15;

export function effectiveConsumptionWhPerKm(vehicle: ConnectedVehicle, prefs: RoutePreferences): number {
  const styleFactor = DRIVING_STYLE_CONSUMPTION_FACTOR[prefs.drivingStyle];
  const climateFactor = prefs.climateControlOn ? CLIMATE_CONSUMPTION_FACTOR : 1;
  // A car that's been achieving less than its rated efficiency on recent drives (lower
  // score) is modeled as consuming proportionally more than the rated Wh/km.
  const efficiencyFactor = 100 / vehicle.efficiencyScore;
  return vehicle.efficiencyWhPerKm * styleFactor * climateFactor * efficiencyFactor;
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

export interface SpeedProfile {
  avgSpeedKmh: number;
  distanceMultiplier: number;
  timeMultiplier: number;
}

/** Average speed and distance/time penalties from the "avoid highways" preference — shared by
 * any code simulating a drive leg, so the highway-vs-surface-roads model stays consistent. */
export function speedProfile(prefs: RoutePreferences): SpeedProfile {
  return {
    avgSpeedKmh: prefs.avoidHighways ? NON_HIGHWAY_AVG_SPEED_KMH : HIGHWAY_AVG_SPEED_KMH,
    distanceMultiplier: prefs.avoidHighways ? AVOID_HIGHWAYS_DISTANCE_PENALTY : 1,
    timeMultiplier: prefs.avoidHighways ? AVOID_HIGHWAYS_TIME_PENALTY : 1,
  };
}

export function getStrategyConfig(strategy: ChargeStopStrategy): { cap: number; reachFraction: number } {
  return CHARGE_STRATEGY[strategy];
}

export function computeTollCost(totalDistanceKm: number, prefs: RoutePreferences): number {
  return prefs.avoidHighways ? 0 : Math.round(totalDistanceKm * TOLL_RATE_PER_KM);
}

/** Farthest distance reachable on `socPercent` of battery, at the vehicle's current
 * effective consumption. */
export function rangeKmAtSoc(socPercent: number, vehicle: ConnectedVehicle, consumptionWhPerKm: number): number {
  return Math.max(0, (socPercent / 100) * vehicle.batteryCapacityKwh * 1000) / consumptionWhPerKm;
}

export interface DriveLegSimResult {
  /** Null when `fromKm`/`toKm` coincide — nothing to simulate. */
  leg: DriveLeg | null;
  soc: number;
  posKm: number;
  elapsedMin: number;
}

/** Simulates driving from `fromKm` to `toKm` — elevation-aware consumption, regen recovery,
 * and ETA — without mutating anything the caller owns, so both the auto-planner and the
 * leg-by-leg planner can run the exact same physics against their own state. */
export function simulateDriveLeg(
  fromKm: number,
  toKm: number,
  fromLabel: string,
  toLabel: string,
  soc: number,
  elapsedMin: number,
  vehicle: ConnectedVehicle,
  consumptionWhPerKm: number,
  profile: SpeedProfile,
  departureTime: Date,
  isWaypointArrival = false
): DriveLegSimResult {
  const rawDistanceKm = Math.abs(toKm - fromKm);
  if (rawDistanceKm <= 0) return { leg: null, soc, posKm: toKm, elapsedMin };

  const distanceKm = rawDistanceKm * profile.distanceMultiplier;
  const durationMin = ((distanceKm / profile.avgSpeedKmh) * 60) * profile.timeMultiplier;

  const elevFrom = elevationAtDistance(fromKm);
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
  const nextElapsedMin = elapsedMin + durationMin;

  const leg: DriveLeg = {
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
    etaClock: formatClock(new Date(departureTime.getTime() + nextElapsedMin * 60_000)),
    isWaypointArrival,
  };

  return { leg, soc: socEnd, posKm: toKm, elapsedMin: nextElapsedMin };
}

export interface ChargeLegSimResult {
  leg: ChargeLeg;
  soc: number;
  elapsedMin: number;
}

/** Simulates charging at `charger`, sized against `remainingAfterChargerKm` (everything left
 * to drive after this stop) so a stop at the edge of range can't strand the rest of the
 * journey, and `strategyCap` (the charging strategy's normal per-stop ceiling). */
export function simulateChargeLeg(
  charger: RouteCharger,
  arrivalSoc: number,
  remainingAfterChargerKm: number,
  elapsedMin: number,
  vehicle: ConnectedVehicle,
  prefs: RoutePreferences,
  consumptionWhPerKm: number,
  strategyCap: number,
  departureTime: Date,
  restaurantId?: string,
  mealStopLabel?: string
): ChargeLegSimResult {
  const socNeededForRest =
    (remainingAfterChargerKm * consumptionWhPerKm) / (vehicle.batteryCapacityKwh * 1000) * 100 + prefs.minChargeSocPercent;
  // If even the strategy's standard cap would comfortably get us home, size this as the
  // final top-up instead of overcharging just to idle at a charger longer.
  const isLikelyFinalStop = socNeededForRest <= strategyCap;
  const targetCap = isLikelyFinalStop ? Math.max(prefs.targetArrivalSocPercent, socNeededForRest) : strategyCap;
  // Never "charge" to below what the car already arrived with — targetCap/socNeededForRest
  // can come out just under arrivalSoc when the final leg barely needs a top-up. A
  // restaurant stop always gets at least a modest top-up even if not strictly needed, since
  // the point of the stop is charging while you eat.
  const minDepartureSoc = restaurantId ? Math.min(100, Math.max(strategyCap, arrivalSoc + 10)) : 0;
  const departureSoc = Math.min(100, Math.max(targetCap, socNeededForRest, arrivalSoc, minDepartureSoc));

  const energyAddedKwh = ((departureSoc - arrivalSoc) / 100) * vehicle.batteryCapacityKwh;
  const effectiveChargeRateKw = Math.min(charger.powerKw, vehicle.maxChargeRateKw) * CHARGE_CURVE_EFFICIENCY;
  const chargeDurationMin = (energyAddedKwh / effectiveChargeRateKw) * 60;
  const cost = energyAddedKwh * charger.pricePerKwh;
  const nextElapsedMin = elapsedMin + chargeDurationMin;

  const leg: ChargeLeg = {
    kind: "charge",
    charger,
    arrivalSocPercent: Math.round(arrivalSoc),
    departureSocPercent: Math.round(departureSoc),
    energyAddedKwh: Math.round(energyAddedKwh * 10) / 10,
    chargeDurationMin: Math.round(chargeDurationMin),
    costEstimate: Math.round(cost),
    etaClock: formatClock(new Date(departureTime.getTime() + nextElapsedMin * 60_000)),
    restaurantId,
    mealStopLabel,
  };

  return { leg, soc: departureSoc, elapsedMin: nextElapsedMin };
}

export interface PickChargerParams {
  candidates: RouteCharger[];
  prefs: RoutePreferences;
  posKm: number;
  direction: 1 | -1;
  maxReachable: number;
  reachTargetKm: number;
  /** Clock-minute-of-day the car would arrive at a given cumulative-km position — used by
   * the "amenities" strategy to judge closeness to a meal time. */
  estimateArrivalMinuteOfDay: (km: number) => number;
}

/** The charging-strategy decision itself — which of the reachable `candidates` a driver
 * following `prefs.chargeStopStrategy` would be pointed at. Shared by the auto-planner (which
 * commits straight to this pick) and the leg-by-leg planner (which shows it as the
 * "recommended" option alongside nearby backups). */
export function pickChargerForLeg(params: PickChargerParams): { charger: RouteCharger; mealStopLabel?: string } {
  const { candidates, prefs, posKm, direction, maxReachable, reachTargetKm, estimateArrivalMinuteOfDay } = params;

  const byReachTarget = (pool: RouteCharger[]) =>
    pool.reduce((best, c) => (Math.abs(c.distanceKm - reachTargetKm) < Math.abs(best.distanceKm - reachTargetKm) ? c : best));

  if (prefs.chargeStopStrategy === "amenities") {
    const mealMinutes = prefs.mealStops.map((m) => ({ label: m.label, minute: parseTimeToMinutes(m.time) }));
    const nearestMeal = (km: number) => {
      const arrivalMin = estimateArrivalMinuteOfDay(km);
      return mealMinutes.reduce<{ label: string; diff: number } | null>((best, m) => {
        const diff = Math.abs(arrivalMin - m.minute);
        return !best || diff < best.diff ? { label: m.label, diff } : best;
      }, null);
    };
    const withinMealWindow = candidates
      .filter((c) => c.amenities.includes("food"))
      .map((c) => ({ charger: c, meal: nearestMeal(c.distanceKm) }))
      .filter((c): c is { charger: RouteCharger; meal: { label: string; diff: number } } => !!c.meal && c.meal.diff <= MEAL_WINDOW_MIN);
    if (withinMealWindow.length > 0) {
      const best = withinMealWindow.reduce((best, c) => (c.meal.diff < best.meal.diff ? c : best));
      return { charger: best.charger, mealStopLabel: best.meal.label };
    }
    return { charger: byReachTarget(candidates) };
  }

  if (prefs.chargeStopStrategy === "cheapest" || prefs.chargeStopStrategy === "fastest") {
    // Only pick by price/power among candidates that make meaningful progress — otherwise a
    // marginally cheaper/faster charger a few km away would force far more stops than needed.
    const progressFiltered = candidates.filter((c) => (c.distanceKm - posKm) * direction >= maxReachable * PROGRESS_FILTER_FRACTION);
    const pool = progressFiltered.length > 0 ? progressFiltered : candidates;
    const charger =
      prefs.chargeStopStrategy === "cheapest"
        ? pool.reduce((best, c) => (c.pricePerKwh < best.pricePerKwh ? c : best))
        : pool.reduce((best, c) => (c.powerKw > best.powerKw ? c : best));
    return { charger };
  }

  return { charger: byReachTarget(candidates) };
}

interface ChainPoint {
  label: string;
  distanceKm: number;
  /** Set for restaurant stops — planning stops and charges at this exact charger rather
   * than treating the point as a generic pass-through waypoint. */
  chargerId?: string;
  restaurantId?: string;
}

/**
 * Plans start -> waypoints (in the exact order given — drag-to-reorder in the UI maps
 * straight onto this order) -> destination.
 *
 * Waypoints are re-sorted along the direction of travel before planning: dragging a
 * stop to a new position in the UI still controls which order it's *shown and visited
 * relative to other stops at similar distances*, but the corridor is one-dimensional
 * here, so letting an arbitrary manual order create a literal backward-then-forward
 * leg would make the trip loop on itself. (An earlier version respected raw manual
 * order and produced exactly that — a chain that isn't monotonic in one direction
 * bounced between two chargers indefinitely; caught via the sanity-test harness.)
 *
 * A restaurant waypoint always gets its own charge leg at its specific charger, labeled
 * with the restaurant's name, whenever that charger is reachable in one hop — checked
 * fresh every iteration, so a stop several charges away from the start still gets
 * visited once the car works its way close enough. (An earlier version only allowed
 * jumping straight to the next chain point when the *entire remaining trip* fit in
 * range, which on any multi-charge trip was almost never true — so restaurant stops
 * were silently skipped in favor of whatever charger a generic reach-distance search
 * happened to prefer, and never appeared in the itinerary at all.)
 */
export function planRoute(
  startLoc: RouteLocation,
  destinationLoc: RouteLocation,
  waypoints: RouteStopPoint[],
  vehicle: ConnectedVehicle,
  prefs: RoutePreferences,
  allChargers: RouteCharger[],
  departureTime: Date = new Date()
): RoutePlan {
  const direction = destinationLoc.distanceKm >= startLoc.distanceKm ? 1 : -1;
  const sortedWaypoints = [...waypoints].sort((a, b) => direction * (a.distanceKm - b.distanceKm));
  const chain: ChainPoint[] = [
    { label: startLoc.label, distanceKm: startLoc.distanceKm },
    ...sortedWaypoints.map((w) => ({
      label: w.label,
      distanceKm: w.distanceKm,
      chargerId: w.chargerId,
      restaurantId: w.kind === "restaurant" ? w.ref.slice("food:".length) : undefined,
    })),
    { label: destinationLoc.label, distanceKm: destinationLoc.distanceKm },
  ];

  const consumptionWhPerKm = effectiveConsumptionWhPerKm(vehicle, prefs);
  const profile = speedProfile(prefs);
  const eligibleChargers = filterEligibleChargers(allChargers, prefs);
  const { cap: intermediateCap, reachFraction } = getStrategyConfig(prefs.chargeStopStrategy);

  /** Remaining travel distance from posKm (within chain segment segIdx) through to the final destination. */
  const chainRemainingKm = (segIdx: number, posKm: number) => {
    let remaining = Math.abs(chain[segIdx + 1].distanceKm - posKm) * profile.distanceMultiplier;
    for (let i = segIdx + 1; i < chain.length - 1; i++) {
      remaining += Math.abs(chain[i + 1].distanceKm - chain[i].distanceKm) * profile.distanceMultiplier;
    }
    return remaining;
  };

  const legs: RouteLeg[] = [];
  let soc = prefs.startSocPercent;
  let posKm = startLoc.distanceKm;
  let fromLabel = startLoc.label;
  let elapsedMin = 0;
  let totalDriveMin = 0;
  let totalChargeMin = 0;
  let totalCost = 0;
  let totalElevationGainM = 0;
  let totalRegenRecoveredKwh = 0;
  let feasible = true;
  let segIdx = 0;

  const driveSegment = (toKm: number, toLabel: string, isWaypointArrival: boolean) => {
    const result = simulateDriveLeg(posKm, toKm, fromLabel, toLabel, soc, elapsedMin, vehicle, consumptionWhPerKm, profile, departureTime, isWaypointArrival);
    if (result.leg) {
      legs.push(result.leg);
      totalDriveMin += result.leg.durationMin;
      totalElevationGainM += result.leg.elevationGainM;
      totalRegenRecoveredKwh += result.leg.regenRecoveredKwh;
      fromLabel = toLabel;
    }
    soc = result.soc;
    posKm = result.posKm;
    elapsedMin = result.elapsedMin;
  };

  // Skips segIdx past any chain waypoints already at-or-behind posKm (in the overall
  // travel direction) — defensive only: the loop below never lets maxReachable exceed
  // the distance to the very next chain point when searching for a generic charger, so
  // a candidate can't actually overshoot a waypoint. Kept as a safety net for edge cases
  // (e.g. two points at nearly the same distance).
  const advanceSegIdx = () => {
    while (segIdx < chain.length - 1 && (chain[segIdx + 1].distanceKm - posKm) * direction <= 0) {
      segIdx++;
    }
  };

  /** Clock-minute-of-day the car would arrive at `toKm`, from the current position/elapsed
   * time — used by the "amenities" strategy to judge whether a candidate charger lands near
   * a meal time, without actually committing the drive leg yet. */
  const estimateArrivalMinuteOfDay = (toKm: number) => {
    const distanceKm = Math.abs(toKm - posKm) * profile.distanceMultiplier;
    const durationMin = ((distanceKm / profile.avgSpeedKmh) * 60) * profile.timeMultiplier;
    const arrivalDate = new Date(departureTime.getTime() + (elapsedMin + durationMin) * 60_000);
    return arrivalDate.getHours() * 60 + arrivalDate.getMinutes();
  };

  const chargeAt = (charger: RouteCharger, restaurantId?: string, mealStopLabel?: string) => {
    const remainingAfterCharger = chainRemainingKm(segIdx, posKm);
    const result = simulateChargeLeg(
      charger,
      soc,
      remainingAfterCharger,
      elapsedMin,
      vehicle,
      prefs,
      consumptionWhPerKm,
      intermediateCap,
      departureTime,
      restaurantId,
      mealStopLabel
    );
    legs.push(result.leg);
    totalChargeMin += result.leg.chargeDurationMin;
    totalCost += result.leg.costEstimate;
    soc = result.soc;
    elapsedMin = result.elapsedMin;
  };

  let guard = 0;
  while (guard++ < MAX_LEG_ITERATIONS && segIdx < chain.length - 1) {
    const nextPoint = chain[segIdx + 1];
    const distToNext = Math.abs(nextPoint.distanceKm - posKm);
    const maxReachable = rangeKmAtSoc(soc - prefs.minChargeSocPercent, vehicle, consumptionWhPerKm);

    if (maxReachable >= distToNext) {
      // The next chain point — waypoint or destination — is reachable in one hop.
      driveSegment(nextPoint.distanceKm, nextPoint.label, segIdx + 1 < chain.length - 1);
      segIdx++;
      if (nextPoint.chargerId) {
        const charger = allChargers.find((c) => c.id === nextPoint.chargerId);
        if (charger) chargeAt(charger, nextPoint.restaurantId);
      }
      continue;
    }

    const reachTargetKm = posKm + direction * Math.max(maxReachable * reachFraction, 20);
    // Only consider chargers ahead of us in the overall direction of travel, and never
    // past the next chain point itself (maxReachable < distToNext here, so this can't
    // overshoot it) — a charger "reachable" only by driving backwards isn't a real
    // candidate, and picking one beyond an upcoming stop would skip it.
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

    const { charger, mealStopLabel } = pickChargerForLeg({
      candidates,
      prefs,
      posKm,
      direction,
      maxReachable,
      reachTargetKm,
      estimateArrivalMinuteOfDay,
    });

    driveSegment(charger.distanceKm, charger.name, false);
    advanceSegIdx();
    chargeAt(charger, undefined, mealStopLabel);
  }

  const stopCount = legs.filter((l) => l.kind === "charge").length;
  const totalDistanceKmRaw = chain.reduce((sum, pt, i) => (i === 0 ? 0 : sum + Math.abs(pt.distanceKm - chain[i - 1].distanceKm)), 0);
  const totalDistanceKm = Math.round(totalDistanceKmRaw * profile.distanceMultiplier);
  const tollCost = computeTollCost(totalDistanceKm, prefs);

  return {
    legs,
    totalDistanceKm,
    totalDriveMin: Math.round(totalDriveMin),
    totalChargeMin: Math.round(totalChargeMin),
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

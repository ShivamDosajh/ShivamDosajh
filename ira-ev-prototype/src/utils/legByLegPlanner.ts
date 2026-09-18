import type { ConnectedVehicle, RouteCharger, RouteLeg, RouteLocation, RoutePlan, RoutePreferences } from "../types/route";
import type { ActiveLeg, LegChargerOption } from "../types/legByLeg";
import {
  computeTollCost,
  effectiveConsumptionWhPerKm,
  filterEligibleChargers,
  getStrategyConfig,
  pickChargerForLeg,
  rangeKmAtSoc,
  simulateChargeLeg,
  simulateDriveLeg,
  speedProfile,
} from "./routePlanner";

/** How far a backup can be from the recommended charger and still be offered as a realistic
 * alternative for the same leg — consecutive route chargers sit roughly 40-80km apart, so this
 * comfortably covers the next couple of chargers in either direction. */
const NEARBY_BACKUP_RADIUS_KM = 160;
const MAX_BACKUP_OPTIONS = 5;

/**
 * Figures out what the driver needs to decide next, from wherever they currently are: either
 * a shortlist of charger options for the next leg (one recommended, a few nearby backups with
 * their reroute distance), a final "drive straight to the destination" leg once that's within
 * reach, or "infeasible" if nothing reachable matches their filters.
 *
 * Reuses the exact same drive/charge physics and charging-strategy pick as the auto-planner
 * (`utils/routePlanner.ts`) — this is the same trip, just decided one leg at a time instead
 * of all at once.
 */
export function computeActiveLeg(
  fromKm: number,
  fromLabel: string,
  soc: number,
  elapsedMin: number,
  destination: RouteLocation,
  vehicle: ConnectedVehicle,
  prefs: RoutePreferences,
  allChargers: RouteCharger[],
  departureTime: Date
): ActiveLeg {
  const direction: 1 | -1 = destination.distanceKm >= fromKm ? 1 : -1;
  const consumptionWhPerKm = effectiveConsumptionWhPerKm(vehicle, prefs);
  const profile = speedProfile(prefs);
  const eligibleChargers = filterEligibleChargers(allChargers, prefs);
  const { cap: strategyCap, reachFraction } = getStrategyConfig(prefs.chargeStopStrategy);

  const distToDestination = Math.abs(destination.distanceKm - fromKm);
  const maxReachable = rangeKmAtSoc(soc - prefs.minChargeSocPercent, vehicle, consumptionWhPerKm);

  if (maxReachable >= distToDestination) {
    const result = simulateDriveLeg(
      fromKm,
      destination.distanceKm,
      fromLabel,
      destination.label,
      soc,
      elapsedMin,
      vehicle,
      consumptionWhPerKm,
      profile,
      departureTime,
      false
    );
    if (!result.leg) {
      // Already sitting at the destination — nothing left to drive.
      return {
        kind: "final",
        leg: {
          fromLabel,
          driveLeg: {
            kind: "drive",
            fromLabel,
            toLabel: destination.label,
            distanceKm: 0,
            durationMin: 0,
            socStart: Math.round(soc),
            socEnd: Math.round(soc),
            elevationGainM: 0,
            elevationLossM: 0,
            regenRecoveredKwh: 0,
            etaClock: "",
            isWaypointArrival: false,
          },
        },
      };
    }
    return { kind: "final", leg: { fromLabel, driveLeg: result.leg } };
  }

  const estimateArrivalMinuteOfDay = (toKm: number) => {
    const distanceKm = Math.abs(toKm - fromKm) * profile.distanceMultiplier;
    const durationMin = ((distanceKm / profile.avgSpeedKmh) * 60) * profile.timeMultiplier;
    const arrivalDate = new Date(departureTime.getTime() + (elapsedMin + durationMin) * 60_000);
    return arrivalDate.getHours() * 60 + arrivalDate.getMinutes();
  };

  const candidates = eligibleChargers.filter((c) => {
    const aheadKm = (c.distanceKm - fromKm) * direction;
    return aheadKm > 1 && aheadKm <= maxReachable;
  });

  if (candidates.length === 0) {
    return { kind: "infeasible", fromLabel, maxReachableKm: Math.round(maxReachable) };
  }

  const reachTargetKm = fromKm + direction * Math.max(maxReachable * reachFraction, 20);
  const { charger: recommendedCharger, mealStopLabel } = pickChargerForLeg({
    candidates,
    prefs,
    posKm: fromKm,
    direction,
    maxReachable,
    reachTargetKm,
    estimateArrivalMinuteOfDay,
  });

  const backups = candidates
    .filter((c) => c.id !== recommendedCharger.id)
    .map((c) => ({ charger: c, rerouteDistanceKm: Math.abs(c.distanceKm - recommendedCharger.distanceKm) }))
    .filter((c) => c.rerouteDistanceKm <= NEARBY_BACKUP_RADIUS_KM)
    .sort((a, b) => a.rerouteDistanceKm - b.rerouteDistanceKm)
    .slice(0, MAX_BACKUP_OPTIONS);

  const buildOption = (charger: RouteCharger, isRecommended: boolean, rerouteDistanceKm: number, mealLabel?: string): LegChargerOption | null => {
    const driveResult = simulateDriveLeg(
      fromKm,
      charger.distanceKm,
      fromLabel,
      charger.name,
      soc,
      elapsedMin,
      vehicle,
      consumptionWhPerKm,
      profile,
      departureTime,
      false
    );
    if (!driveResult.leg) return null;
    const remainingAfterCharger = Math.abs(destination.distanceKm - charger.distanceKm) * profile.distanceMultiplier;
    const chargeResult = simulateChargeLeg(
      charger,
      driveResult.soc,
      remainingAfterCharger,
      driveResult.elapsedMin,
      vehicle,
      prefs,
      consumptionWhPerKm,
      strategyCap,
      departureTime,
      undefined,
      isRecommended ? mealLabel : undefined
    );
    return {
      charger,
      isRecommended,
      rerouteDistanceKm,
      driveLeg: driveResult.leg,
      chargeLeg: chargeResult.leg,
    };
  };

  const options: LegChargerOption[] = [];
  const recommendedOption = buildOption(recommendedCharger, true, 0, mealStopLabel);
  if (recommendedOption) options.push(recommendedOption);
  for (const backup of backups) {
    const option = buildOption(backup.charger, false, backup.rerouteDistanceKm);
    if (option) options.push(option);
  }

  if (options.length === 0) {
    return { kind: "infeasible", fromLabel, maxReachableKm: Math.round(maxReachable) };
  }

  return { kind: "charge-choice", leg: { fromLabel, fromKm, options } };
}

/** Assembles a full RoutePlan-shaped summary from the legs confirmed so far — lets the "trip
 * complete" view reuse the same TripSummaryCard/map components the auto-planner's results
 * screen already uses, instead of a second bespoke summary UI. */
export function buildPlanSummary(
  startLabel: string,
  destinationLabel: string,
  startSoc: number,
  confirmedLegs: RouteLeg[],
  prefs: RoutePreferences
): RoutePlan {
  const totalDistanceKm = confirmedLegs.reduce((sum, leg) => (leg.kind === "drive" ? sum + leg.distanceKm : sum), 0);
  const totalDriveMin = confirmedLegs.reduce((sum, leg) => (leg.kind === "drive" ? sum + leg.durationMin : sum), 0);
  const totalChargeMin = confirmedLegs.reduce((sum, leg) => (leg.kind === "charge" ? sum + leg.chargeDurationMin : sum), 0);
  const totalCost = confirmedLegs.reduce((sum, leg) => (leg.kind === "charge" ? sum + leg.costEstimate : sum), 0);
  const totalElevationGainM = confirmedLegs.reduce((sum, leg) => (leg.kind === "drive" ? sum + leg.elevationGainM : sum), 0);
  const totalRegenRecoveredKwh =
    Math.round(confirmedLegs.reduce((sum, leg) => (leg.kind === "drive" ? sum + leg.regenRecoveredKwh : sum), 0) * 10) / 10;
  const stopCount = confirmedLegs.filter((l) => l.kind === "charge").length;
  const lastLeg = confirmedLegs[confirmedLegs.length - 1];
  const arrivalSoc = lastLeg?.kind === "drive" ? lastLeg.socEnd : Math.round(startSoc);

  return {
    legs: confirmedLegs,
    totalDistanceKm,
    totalDriveMin,
    totalChargeMin,
    totalTripMin: totalDriveMin + totalChargeMin,
    totalCost,
    tollCost: computeTollCost(totalDistanceKm, prefs),
    stopCount,
    startLabel,
    destinationLabel,
    startSoc: Math.round(startSoc),
    arrivalSoc,
    feasible: true,
    totalElevationGainM,
    totalRegenRecoveredKwh,
  };
}

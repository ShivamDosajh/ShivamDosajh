import type { ChargeStopStrategy, ConnectedVehicle, RouteLocation, RoutePlan, RoutePreferences, RouteStopPoint } from "../types/route";
import { routeChargers } from "../data/routeChargers";
import { planRoute } from "./routePlanner";

/** A route-power threshold above which a stop counts as a "MegaCharger" site — route chargers
 * don't carry the city dataset's isMegaCharger flag, so this mirrors the same convention. */
const MEGACHARGER_POWER_KW = 100;
/** Deterministic stand-in for the ".ev verified" CPO program — no such flag exists on the mock
 * route charger dataset, so a fixed subset of CPOs is treated as verified. */
const VERIFIED_CPOS = new Set(["Tata Power", "Statiq"]);

export interface RouteAlternative {
  id: ChargeStopStrategy;
  tag: string;
  plan: RoutePlan;
  chargerCount: number;
  gunCount: number;
  megaChargerCount: number;
  verifiedCount: number;
}

const ALTERNATIVE_STRATEGIES: { id: ChargeStopStrategy; tag: string }[] = [
  { id: "fastest", tag: "Fastest" },
  { id: "cheapest", tag: "Cheapest" },
  { id: "fewest-stops", tag: "Fewest stops" },
];

/**
 * Three route alternatives for the same corridor, one per charging strategy — reuses the
 * existing planner engine (already-built physics/decision logic) rather than modelling
 * separate physical paths, since the mock dataset is a single fixed highway corridor. Each
 * alternative is a genuinely different, fully-computed plan (different stop count, cost and
 * time), not synthetic/randomised data.
 */
export function generateRouteAlternatives(
  start: RouteLocation,
  destination: RouteLocation,
  waypoints: RouteStopPoint[],
  vehicle: ConnectedVehicle,
  basePrefs: RoutePreferences,
  departureTime: Date = new Date()
): RouteAlternative[] {
  return ALTERNATIVE_STRATEGIES.map(({ id, tag }) => {
    const prefs: RoutePreferences = { ...basePrefs, chargeStopStrategy: id };
    const plan = planRoute(start, destination, waypoints, vehicle, prefs, routeChargers, departureTime);
    const chargedStops = plan.legs.filter((leg) => leg.kind === "charge");
    const chargerCount = chargedStops.length;
    const gunCount = chargedStops.length; // mock dataset models one gun per route charger
    const megaChargerCount = chargedStops.filter((leg) => leg.kind === "charge" && leg.charger.powerKw >= MEGACHARGER_POWER_KW).length;
    const verifiedCount = chargedStops.filter((leg) => leg.kind === "charge" && VERIFIED_CPOS.has(leg.charger.cpo)).length;

    return { id, tag, plan, chargerCount, gunCount, megaChargerCount, verifiedCount };
  });
}

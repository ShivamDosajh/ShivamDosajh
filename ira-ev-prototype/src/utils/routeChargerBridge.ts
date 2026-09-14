import type { Charger, ChargerSpeed, Station } from "../types/charging";
import { getChargerById as getRouteChargerById } from "../data/routeChargers";

/** Route-planner chargers (data/routeChargers.ts) and the main charging flow's stations
 * (data/stations.ts) are two separate mock datasets — a highway corridor vs. a city map.
 * These prefixed ids let a route-planner charger stand in as a real Station/Charger for the
 * charging flow, so "go to charging screen" from an itinerary doesn't need a real match. */
const ROUTE_STATION_PREFIX = "route-charger:";

export function routeStationId(routeChargerId: string): string {
  return `${ROUTE_STATION_PREFIX}${routeChargerId}`;
}

export function routeConnectorId(routeChargerId: string): string {
  return `${routeChargerId}-connector`;
}

function speedForPower(powerKw: number): ChargerSpeed {
  if (powerKw >= 60) return "rapid";
  if (powerKw >= 25) return "fast";
  return "slow";
}

/** Builds a synthetic Station for a route-planner charger id (a `routeStationId(...)` value),
 * or undefined if `id` isn't one of those or the underlying route charger no longer exists. */
export function resolveRouteStation(id: string): Station | undefined {
  if (!id.startsWith(ROUTE_STATION_PREFIX)) return undefined;
  const routeChargerId = id.slice(ROUTE_STATION_PREFIX.length);
  const rc = getRouteChargerById(routeChargerId);
  if (!rc) return undefined;

  const charger: Charger = {
    id: routeConnectorId(routeChargerId),
    name: "Charger A",
    connector: rc.connector,
    power: rc.powerKw,
    pricePerKwh: rc.pricePerKwh,
    speed: speedForPower(rc.powerKw),
    available: true,
  };

  return {
    id,
    cpo: rc.cpo,
    name: rc.name,
    address: "a stop on your planned route",
    distance: rc.distanceKm,
    eta: 0,
    paymentStatus: "enabled",
    lastUsedMinutesAgo: null,
    rating: null,
    available: true,
    isMegaCharger: rc.powerKw >= 100,
    currentRangeKm: 0,
    arrivalRangeKm: 0,
    chargers: [charger],
    coordinates: rc.coordinates,
  };
}

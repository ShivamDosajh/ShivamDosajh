import type { RouteStopPoint } from "../types/route";
import { routeLocations, getLocationById } from "./routeLocations";
import { restaurants, getRestaurantById, getChargerForRestaurant, type RestaurantStop } from "./restaurants";

const LOCATION_PREFIX = "loc:";
const RESTAURANT_PREFIX = "food:";

function restaurantToStop(r: RestaurantStop): RouteStopPoint | undefined {
  const charger = getChargerForRestaurant(r);
  if (!charger) return undefined;
  return {
    ref: `${RESTAURANT_PREFIX}${r.id}`,
    kind: "restaurant",
    label: r.name,
    subtitle: `${r.cuisine} · ⭐${r.rating.toFixed(1)} · charging nearby (${charger.powerKw}kW ${charger.connector})`,
    distanceKm: charger.distanceKm,
    coordinates: charger.coordinates,
    elevationM: charger.elevationM,
    chargerId: charger.id,
  };
}

/** Every addable stop — named places, plus restaurants that have EV charging nearby. */
export const routeStops: RouteStopPoint[] = [
  ...routeLocations.map(
    (loc): RouteStopPoint => ({
      ref: `${LOCATION_PREFIX}${loc.id}`,
      kind: "location",
      label: loc.label,
      subtitle: loc.region,
      distanceKm: loc.distanceKm,
      coordinates: loc.coordinates,
      elevationM: loc.elevationM,
    })
  ),
  ...restaurants.map(restaurantToStop).filter((s): s is RouteStopPoint => !!s),
].sort((a, b) => a.distanceKm - b.distanceKm);

export function resolveStopPoint(ref: string): RouteStopPoint | undefined {
  if (ref.startsWith(LOCATION_PREFIX)) {
    const loc = getLocationById(ref.slice(LOCATION_PREFIX.length));
    if (!loc) return undefined;
    return {
      ref,
      kind: "location",
      label: loc.label,
      subtitle: loc.region,
      distanceKm: loc.distanceKm,
      coordinates: loc.coordinates,
      elevationM: loc.elevationM,
    };
  }
  if (ref.startsWith(RESTAURANT_PREFIX)) {
    const r = getRestaurantById(ref.slice(RESTAURANT_PREFIX.length));
    if (!r) return undefined;
    return restaurantToStop(r);
  }
  return undefined;
}

export function locationRef(locationId: string): string {
  return `${LOCATION_PREFIX}${locationId}`;
}

export function restaurantRef(restaurantId: string): string {
  return `${RESTAURANT_PREFIX}${restaurantId}`;
}

export function searchStopPoints(query: string, excludeRefs: string[] = []): RouteStopPoint[] {
  const q = query.trim().toLowerCase();
  return routeStops.filter((s) => {
    if (excludeRefs.includes(s.ref)) return false;
    if (!q) return true;
    return s.label.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q);
  });
}

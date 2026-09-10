import type { RouteStopPoint } from "../types/route";
import { routeLocations, getLocationById } from "./routeLocations";
import { routeChargers, getChargerById } from "./routeChargers";

const LOCATION_PREFIX = "loc:";
const CHARGER_PREFIX = "charger:";

/** Every addable stop — named places, plus charging stations that also have food nearby. */
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
  ...routeChargers
    .filter((c) => c.amenities.includes("food"))
    .map(
      (c): RouteStopPoint => ({
        ref: `${CHARGER_PREFIX}${c.id}`,
        kind: "charger-amenity",
        label: c.name,
        subtitle: `${c.cpo} · restaurant nearby · ${c.powerKw}kW ${c.connector}`,
        distanceKm: c.distanceKm,
        coordinates: c.coordinates,
        elevationM: c.elevationM,
      })
    ),
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
  if (ref.startsWith(CHARGER_PREFIX)) {
    const c = getChargerById(ref.slice(CHARGER_PREFIX.length));
    if (!c) return undefined;
    return {
      ref,
      kind: "charger-amenity",
      label: c.name,
      subtitle: `${c.cpo} · restaurant nearby · ${c.powerKw}kW ${c.connector}`,
      distanceKm: c.distanceKm,
      coordinates: c.coordinates,
      elevationM: c.elevationM,
    };
  }
  return undefined;
}

export function locationRef(locationId: string): string {
  return `${LOCATION_PREFIX}${locationId}`;
}

export function searchStopPoints(query: string, excludeRefs: string[] = []): RouteStopPoint[] {
  const q = query.trim().toLowerCase();
  return routeStops.filter((s) => {
    if (excludeRefs.includes(s.ref)) return false;
    if (!q) return true;
    return s.label.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q);
  });
}

import type { RouteLocation } from "../types/route";

/**
 * A single mock highway corridor (NH48, Mumbai -> Bengaluru) so trip distance can be
 * computed as a simple difference of cumulative km — no real geocoding/routing engine.
 * Elevations approximate the real corridor (a steep Western Ghats climb out of the
 * coastal plain around Lonavala, then the Deccan plateau) for the elevation/regen model.
 */
export const routeLocations: RouteLocation[] = [
  { id: "panvel", label: "Panvel, Raigad", region: "Maharashtra", distanceKm: 0, coordinates: { x: 30, y: 8 }, elevationM: 10 },
  { id: "lonavala", label: "Lonavala", region: "Maharashtra", distanceKm: 65, coordinates: { x: 36, y: 18 }, elevationM: 625 },
  { id: "pune", label: "Pune", region: "Maharashtra", distanceKm: 150, coordinates: { x: 42, y: 28 }, elevationM: 560 },
  { id: "satara", label: "Satara", region: "Maharashtra", distanceKm: 250, coordinates: { x: 48, y: 39 }, elevationM: 730 },
  { id: "kolhapur", label: "Kolhapur", region: "Maharashtra", distanceKm: 380, coordinates: { x: 54, y: 52 }, elevationM: 550 },
  { id: "belagavi", label: "Belagavi", region: "Karnataka", distanceKm: 480, coordinates: { x: 58, y: 62 }, elevationM: 750 },
  { id: "hubballi", label: "Hubballi-Dharwad", region: "Karnataka", distanceKm: 560, coordinates: { x: 62, y: 70 }, elevationM: 640 },
  { id: "chitradurga", label: "Chitradurga", region: "Karnataka", distanceKm: 730, coordinates: { x: 68, y: 84 }, elevationM: 730 },
  { id: "tumakuru", label: "Tumakuru", region: "Karnataka", distanceKm: 850, coordinates: { x: 72, y: 92 }, elevationM: 830 },
  { id: "bengaluru", label: "Bengaluru", region: "Karnataka", distanceKm: 900, coordinates: { x: 74, y: 95 }, elevationM: 920 },
];

export function getLocationById(id: string): RouteLocation | undefined {
  return routeLocations.find((l) => l.id === id);
}

export function searchLocations(query: string): RouteLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return routeLocations;
  return routeLocations.filter(
    (l) => l.label.toLowerCase().includes(q) || l.region.toLowerCase().includes(q)
  );
}

/** Linear interpolation of the corridor's elevation at an arbitrary distance, for chargers. */
export function elevationAtDistance(distanceKm: number): number {
  const sorted = [...routeLocations].sort((a, b) => a.distanceKm - b.distanceKm);
  if (distanceKm <= sorted[0].distanceKm) return sorted[0].elevationM;
  for (let i = 1; i < sorted.length; i++) {
    if (distanceKm <= sorted[i].distanceKm) {
      const a = sorted[i - 1];
      const b = sorted[i];
      const t = (distanceKm - a.distanceKm) / (b.distanceKm - a.distanceKm || 1);
      return Math.round(a.elevationM + (b.elevationM - a.elevationM) * t);
    }
  }
  return sorted[sorted.length - 1].elevationM;
}

import { Bath, Coffee, Car, Wifi, UtensilsCrossed, ShoppingBag, type LucideIcon } from "lucide-react";
import { hashString } from "../utils/hash";

export interface StationAmenity {
  id: string;
  label: string;
  icon: LucideIcon;
  distanceM: number;
}

const AMENITY_POOL: { label: string; icon: LucideIcon }[] = [
  { label: "restroom", icon: Bath },
  { label: "cafe", icon: Coffee },
  { label: "parking", icon: Car },
  { label: "wifi", icon: Wifi },
  { label: "restaurant", icon: UtensilsCrossed },
  { label: "convenience store", icon: ShoppingBag },
];

/** Deterministic mock "nearby amenities" for a station — same station always returns the
 * same set and distances, so they don't reshuffle on every render. */
export function getAmenitiesForStation(stationId: string): StationAmenity[] {
  const seed = hashString(stationId);
  const count = 3 + (seed % 3); // 3-5
  const picked: StationAmenity[] = [];
  const usedIndexes = new Set<number>();
  for (let i = 0; picked.length < count && i < AMENITY_POOL.length * 2; i++) {
    const idx = (seed + i * 11) % AMENITY_POOL.length;
    if (usedIndexes.has(idx)) continue;
    usedIndexes.add(idx);
    const entry = AMENITY_POOL[idx];
    picked.push({
      id: `${stationId}-amenity-${idx}`,
      label: entry.label,
      icon: entry.icon,
      distanceM: 30 + ((seed + idx * 17) % 220),
    });
  }
  return picked.sort((a, b) => a.distanceM - b.distanceM);
}

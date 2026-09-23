import type { RouteCharger } from "../types/route";
import { hashString } from "./hash";

const MEGACHARGER_POWER_KW = 100;
const VERIFIED_CPOS = new Set(["Tata Power", "Statiq"]);

export interface ChargerBadges {
  rating: number;
  reviewCount: number;
  uptimePercent: number;
  gunsTotal: number;
  gunsAvailable: number;
  verified: boolean;
  isMegaCharger: boolean;
}

/** Deterministic mock stats for fields the route-charger mock dataset doesn't model (reviews,
 * uptime, live gun availability) — same seed formula the station detail sheet already uses for
 * ratings, so a charger's numbers stay stable across screens without a shared random source. */
export function getChargerBadges(charger: RouteCharger): ChargerBadges {
  const seed = hashString(charger.id);
  const rating = Math.round((3.5 + (seed % 15) / 10) * 10) / 10;
  const reviewCount = 20 + (seed % 180);
  const uptimePercent = 90 + (seed % 10);
  const gunsTotal = 1 + (seed % 3);
  const gunsAvailable = 1 + ((seed >> 2) % gunsTotal);
  const verified = VERIFIED_CPOS.has(charger.cpo);
  const isMegaCharger = charger.powerKw >= MEGACHARGER_POWER_KW;
  return { rating, reviewCount, uptimePercent, gunsTotal, gunsAvailable, verified, isMegaCharger };
}

/** The PRD's "Why recommended" line — the top score driver stated in plain language, derived
 * from real fields (no mock scoring model, just the most notable real attribute). */
export function whyRecommended(charger: RouteCharger, badges: ChargerBadges): string {
  if (badges.isMegaCharger) return `MegaCharger · ${badges.uptimePercent}% uptime`;
  if (charger.powerKw >= 60) return `${charger.powerKw}kW fast charging · ${badges.uptimePercent}% uptime`;
  if (badges.verified) return `.ev verified · ${badges.reviewCount} reviews`;
  return `${badges.uptimePercent}% uptime · ₹${charger.pricePerKwh}/kWh`;
}

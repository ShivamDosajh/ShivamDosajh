import type { FoodStopWording } from "../types/charging";

/** CTA copy for a food stop, in whichever framing the "Food stop wording" experiment picked. */
export function foodStopCta(wording: FoodStopWording, restaurantName?: string): string {
  if (restaurantName) {
    return wording === "eat" ? `eat at ${restaurantName}` : `order from ${restaurantName}`;
  }
  return wording === "eat" ? "eat at a restaurant here" : "order food for pickup here";
}

export function foodStopVerbLabel(wording: FoodStopWording): string {
  return wording === "eat" ? "eating at" : "ordering from";
}

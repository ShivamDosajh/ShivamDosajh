export type AdvancedPlannerStep = "inputs" | "options" | "legs" | "summary" | "live";

/** Trip-condition inputs from PRD v2 §3 that the existing RoutePreferences shape doesn't cover.
 * Front-end only — collected and displayed, but (per the "no algorithm work" scope) not fed
 * into any calculation; the underlying planner still uses the same physics as the other two
 * planner variants. */
export interface TripConditions {
  maxReroutingKm: number;
  passengers: number;
  drivingSide: "LHS" | "RHS";
}

export function defaultTripConditions(): TripConditions {
  return { maxReroutingKm: 5, passengers: 2, drivingSide: "LHS" };
}

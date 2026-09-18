import type { ChargeLeg, DriveLeg, RouteCharger } from "./route";

/** One selectable charger for the leg currently being decided — a full preview of what
 * picking it would do (drive there, then charge), not just the charger's own details. */
export interface LegChargerOption {
  charger: RouteCharger;
  isRecommended: boolean;
  /** How far this option's charger is from the recommended one, in km — the detour a driver
   * would take relative to the "ideal" pick if that one turns out unavailable. */
  rerouteDistanceKm: number;
  driveLeg: DriveLeg;
  chargeLeg: ChargeLeg;
}

/** The leg the driver is currently deciding: drive from the last confirmed point to one of
 * several charger options. */
export interface PendingLeg {
  fromLabel: string;
  fromKm: number;
  options: LegChargerOption[];
}

/** The trip's last leg — the destination is reachable directly from here, no more charging
 * needed, so it just needs a final confirm rather than a charger choice. */
export interface FinalLeg {
  fromLabel: string;
  driveLeg: DriveLeg;
}

export type ActiveLeg =
  | { kind: "charge-choice"; leg: PendingLeg }
  | { kind: "final"; leg: FinalLeg }
  /** No reachable charger (matching the driver's filters) exists within range from here. */
  | { kind: "infeasible"; fromLabel: string; maxReachableKm: number };

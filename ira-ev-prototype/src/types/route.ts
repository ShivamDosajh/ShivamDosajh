export interface VehicleProfile {
  id: string;
  make: string;
  model: string;
  batteryCapacityKwh: number;
  /** Baseline consumption at "normal" driving style, climate off. */
  efficiencyWhPerKm: number;
  maxChargeRateKw: number;
  connector: string;
}

export type DrivingStyle = "eco" | "normal" | "spirited";

export interface RouteLocation {
  id: string;
  label: string;
  region: string;
  /** Cumulative distance along the mock highway corridor, km. */
  distanceKm: number;
  /** Position on the mock map, percentage coordinates. */
  coordinates: { x: number; y: number };
}

export interface RouteCharger {
  id: string;
  name: string;
  cpo: string;
  /** Cumulative distance along the mock highway corridor, km. */
  distanceKm: number;
  coordinates: { x: number; y: number };
  connector: string;
  powerKw: number;
  pricePerKwh: number;
}

export interface RoutePreferences {
  vehicleId: string;
  startSocPercent: number;
  targetArrivalSocPercent: number;
  minChargeSocPercent: number;
  preferredConnectors: string[];
  preferredNetworks: string[];
  minChargerPowerKw: number;
  drivingStyle: DrivingStyle;
  climateControlOn: boolean;
  avoidHighways: boolean;
}

export interface DriveLeg {
  kind: "drive";
  fromLabel: string;
  toLabel: string;
  distanceKm: number;
  durationMin: number;
  socStart: number;
  socEnd: number;
  isWaypointArrival?: boolean;
}

export interface ChargeLeg {
  kind: "charge";
  charger: RouteCharger;
  arrivalSocPercent: number;
  departureSocPercent: number;
  energyAddedKwh: number;
  chargeDurationMin: number;
  costEstimate: number;
}

export type RouteLeg = DriveLeg | ChargeLeg;

export interface RoutePlan {
  legs: RouteLeg[];
  totalDistanceKm: number;
  totalDriveMin: number;
  totalChargeMin: number;
  totalTripMin: number;
  totalCost: number;
  stopCount: number;
  startLabel: string;
  destinationLabel: string;
  startSoc: number;
  arrivalSoc: number;
  feasible: boolean;
}

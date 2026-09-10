export interface VehicleProfile {
  id: string;
  make: string;
  model: string;
  batteryCapacityKwh: number;
  /** Baseline consumption at "normal" driving style, climate off, flat road, light traffic. */
  efficiencyWhPerKm: number;
  maxChargeRateKw: number;
  connector: string;
  /** Approximate kerb weight, used for the elevation/regen energy model. */
  massKg: number;
}

export type DrivingStyle = "eco" | "normal" | "spirited";
export type ChargeStopStrategy = "optimal" | "fewer" | "fewest";
export type Amenity = "food" | "restroom" | "wifi";

/** The user's actual EV, read from the app's live connected-car telemetry — never picked from a list. */
export interface ConnectedVehicle extends VehicleProfile {
  /** Live battery level as of last sync. */
  currentSocPercent: number;
  /** How closely the car has been achieving its rated efficiency over recent drives, 0-100. */
  efficiencyScore: number;
  drivingHistoryKm: number;
  lastSyncedMinutesAgo: number;
}

export interface RouteLocation {
  id: string;
  label: string;
  region: string;
  /** Cumulative distance along the mock highway corridor, km. */
  distanceKm: number;
  /** Position on the mock map, percentage coordinates. */
  coordinates: { x: number; y: number };
  /** Elevation above sea level, metres — drives the climb/regen energy model. */
  elevationM: number;
}

export interface RouteCharger {
  id: string;
  name: string;
  cpo: string;
  /** Cumulative distance along the mock highway corridor, km. */
  distanceKm: number;
  coordinates: { x: number; y: number };
  elevationM: number;
  connector: string;
  powerKw: number;
  pricePerKwh: number;
  amenities: Amenity[];
}

/** A point that can appear in a trip's stop sequence — either a named place, or a restaurant that has EV charging nearby. */
export interface RouteStopPoint {
  /** Compound ref: "loc:<RouteLocation.id>" or "food:<RestaurantStop.id>". */
  ref: string;
  kind: "location" | "restaurant";
  label: string;
  subtitle: string;
  distanceKm: number;
  coordinates: { x: number; y: number };
  elevationM: number;
}

export interface RoutePreferences {
  startSocPercent: number;
  targetArrivalSocPercent: number;
  minChargeSocPercent: number;
  preferredConnectors: string[];
  preferredNetworks: string[];
  minChargerPowerKw: number;
  drivingStyle: DrivingStyle;
  climateControlOn: boolean;
  /** Sticks to surface roads instead of the highway — also means no tolls. */
  avoidHighways: boolean;
  chargeStopStrategy: ChargeStopStrategy;
}

export interface DriveLeg {
  kind: "drive";
  fromLabel: string;
  toLabel: string;
  distanceKm: number;
  durationMin: number;
  socStart: number;
  socEnd: number;
  elevationGainM: number;
  elevationLossM: number;
  regenRecoveredKwh: number;
  etaClock: string;
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
  etaClock: string;
}

export type RouteLeg = DriveLeg | ChargeLeg;

export interface RoutePlan {
  legs: RouteLeg[];
  totalDistanceKm: number;
  totalDriveMin: number;
  totalChargeMin: number;
  totalTripMin: number;
  totalCost: number;
  tollCost: number;
  stopCount: number;
  startLabel: string;
  destinationLabel: string;
  startSoc: number;
  arrivalSoc: number;
  feasible: boolean;
  totalElevationGainM: number;
  totalRegenRecoveredKwh: number;
}

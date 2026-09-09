export type ChargerSpeed = "fast" | "slow" | "rapid";

export interface Charger {
  id: string;
  name: string;
  connector: string;
  power: number; // kW
  pricePerKwh: number; // INR
  speed: ChargerSpeed;
  available: boolean;
  isMegaCharger?: boolean;
}

export type PaymentAvailability = "enabled" | "unavailable" | "coming-soon";

export interface Station {
  id: string;
  cpo: string;
  cpoLogo?: string;
  name: string;
  address: string;
  distance: number; // km
  eta: number; // minutes
  paymentStatus: PaymentAvailability;
  lastUsedMinutesAgo: number | null;
  rating: number | null;
  available: boolean;
  isMegaCharger: boolean;
  currentRangeKm: number;
  arrivalRangeKm: number;
  chargers: Charger[];
  coordinates: { x: number; y: number }; // position on mock map, 0-100 percent
}

export type ChargeType = "amount" | "units" | "full-charge";

export interface PaymentMethod {
  id: string;
  label: string;
  category: "upi" | "wallet" | "card";
  logo?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  terms: string;
}

export type FlowStep =
  | "map"
  | "station-details"
  | "charger-selection"
  | "charging-type"
  | "recharge-calculation"
  | "payment-processing"
  | "payment-success"
  | "simplified-charge"
  | "navigating";

export interface ChargingFlowState {
  step: FlowStep;
  history: FlowStep[];
  selectedStationId: string | null;
  selectedChargerId: string | null;
  chargeType: ChargeType | null;
  amount: number | null;
  units: number | null;
  selectedPaymentMethodId: string | null;
}

export type StationCardVariant = "current" | "customer" | "charging";

export interface ExperimentConfig {
  showPaymentPill: boolean;
  showRangePrediction: boolean;
  showChargingSpeed: boolean;
  showEstimatedCost: boolean;
  showMegaChargerBadge: boolean;
  showStationLastUsed: boolean;
  showAvailability: boolean;
  compactStationCards: boolean;
  stickyCTA: boolean;
  simplifiedChargingFlow: boolean;
  stationCardVariant: StationCardVariant;
}

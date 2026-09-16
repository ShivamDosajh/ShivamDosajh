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

export type ChargeType = "amount" | "units" | "full-charge" | "soc";

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
  | "quick-pay"
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
  /** iRA Cash actually applied to this transaction, set right before payment is submitted —
   * downstream success/in-progress screens subtract it from the recomputed cost so the "paid"
   * amount they show matches what the driver actually agreed to pay. */
  walletDiscount: number | null;
  /** True for a session started from a route-planner stop — lets the very first "back" press
   * exit to the route planner instead of surfacing the (unrelated) station map underneath. */
  fromRoutePlanner: boolean;
}

export type StationCardVariant = "current" | "customer" | "charging";
/** How food-stop CTAs are framed: delivery-style ("order food from X") or dine-in-style ("eat at X"). */
export type FoodStopWording = "order" | "eat";

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
  showStationCarousel: boolean;
  showZomatoOrdering: boolean;
  foodStopWording: FoodStopWording;
  showChargingInProgress: boolean;
  showConnectorAvailability: boolean;
  quickPayFlow: boolean;
  /** Simulated OCPI gun-connect verification + push notification -> one-tap quick charge. */
  oneClickCharging: boolean;
  /** Alternate charge-amount UI: a "full charge" checkbox plus interlinked units/cost sliders,
   * instead of the amount/units/full-charge segmented picker. */
  sliderChargeAmountUI: boolean;
  /** The big "payment enabled/unavailable/coming soon" banner at the top of the station sheet. */
  showPaymentStatusBanner: boolean;
}

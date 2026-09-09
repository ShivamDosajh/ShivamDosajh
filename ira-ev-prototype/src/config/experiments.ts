import type { ExperimentConfig } from "../types/charging";

export const defaultExperimentConfig: ExperimentConfig = {
  showPaymentPill: true,
  showRangePrediction: true,
  showChargingSpeed: true,
  showEstimatedCost: true,
  showMegaChargerBadge: true,
  showStationLastUsed: true,
  showAvailability: true,
  compactStationCards: false,
  stickyCTA: true,
  simplifiedChargingFlow: false,
  stationCardVariant: "current",
};

export const EXPERIMENT_STORAGE_KEY = "ira-ev-experiment-config";

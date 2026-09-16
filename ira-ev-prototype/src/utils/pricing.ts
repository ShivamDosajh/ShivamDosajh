import { myConnectedVehicle } from "../data/vehicles";

const TAX_RATE = 0.18;
const CONVENIENCE_FEE = 0;
const FULL_CHARGE_UNITS_REQUIRED = 2.75; // mock: units needed to top up to full
/** Approximates real-world charging-curve taper (rated kW is rarely sustained end to end) —
 * same figure used by ChargingInProgressScreen's live-session duration estimate. */
const CHARGE_CURVE_EFFICIENCY = 0.75;

export interface CostBreakdown {
  costOfRecharge: number;
  units: number;
  convenienceFee: number;
  tax: number;
  approximateValue: number;
}

export function unitsFromAmount(amount: number, pricePerKwh: number): number {
  if (pricePerKwh <= 0) return 0;
  return amount / pricePerKwh;
}

export function amountFromUnits(units: number, pricePerKwh: number): number {
  return units * pricePerKwh;
}

export function fullChargeUnits(): number {
  return FULL_CHARGE_UNITS_REQUIRED;
}

export function computeCostBreakdown(units: number, pricePerKwh: number): CostBreakdown {
  const costOfRecharge = amountFromUnits(units, pricePerKwh);
  const tax = costOfRecharge * TAX_RATE;
  const approximateValue = costOfRecharge + CONVENIENCE_FEE + tax;
  return {
    costOfRecharge,
    units,
    convenienceFee: CONVENIENCE_FEE,
    tax,
    approximateValue,
  };
}

/** Minutes to add `units` kWh on a charger of `chargerPowerKw`, capped by the connected
 * vehicle's own max charge rate. */
export function estimateChargeDurationMin(units: number, chargerPowerKw: number): number {
  if (units <= 0) return 0;
  const effectiveChargeRateKw = Math.min(chargerPowerKw, myConnectedVehicle.maxChargeRateKw) * CHARGE_CURVE_EFFICIENCY;
  if (effectiveChargeRateKw <= 0) return 0;
  return (units / effectiveChargeRateKw) * 60;
}

/** kWh needed to take the connected vehicle from its current SoC to `targetSocPercent`. */
export function unitsForTargetSoc(targetSocPercent: number): number {
  const deltaPercent = Math.max(0, targetSocPercent - myConnectedVehicle.currentSocPercent);
  return (deltaPercent / 100) * myConnectedVehicle.batteryCapacityKwh;
}

/** The SoC% `units` of charge would leave the connected vehicle at, from its current SoC. */
export function socForUnits(units: number): number {
  const deltaPercent = (Math.max(0, units) / myConnectedVehicle.batteryCapacityKwh) * 100;
  return Math.min(100, myConnectedVehicle.currentSocPercent + deltaPercent);
}

export function formatCurrency(value: number): string {
  return `₹${value.toFixed(2)}`;
}

export function formatUnits(value: number): string {
  return `${value.toFixed(2)} kWh`;
}

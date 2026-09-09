const TAX_RATE = 0.18;
const CONVENIENCE_FEE = 0;
const FULL_CHARGE_UNITS_REQUIRED = 2.75; // mock: units needed to top up to full

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

export function formatCurrency(value: number): string {
  return `₹${value.toFixed(2)}`;
}

export function formatUnits(value: number): string {
  return `${value.toFixed(2)} kWh`;
}

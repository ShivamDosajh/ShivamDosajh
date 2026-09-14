/** kg of CO2 avoided per kWh charged, vs. driving the same distance on petrol — a commonly
 * cited approximate figure comparing average petrol-car tailpipe emissions to an EV's
 * grid-charging footprint per equivalent kWh. Mock, not a precise regional calculation. */
const CO2_SAVED_PER_KWH = 0.85;

export function co2SavedKg(unitsKwh: number): number {
  return unitsKwh * CO2_SAVED_PER_KWH;
}

export function formatCo2(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}

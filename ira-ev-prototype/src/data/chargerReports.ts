export interface ChargerReportCounts {
  working: number;
  notWorking: number;
}

/**
 * Seeded mock reports simulating other drivers who already answered "is this charger
 * working?" — demonstrates the crowd-sourced issue warning without requiring the current
 * user to submit several reports themselves first. Keyed by the specific gun/connector id
 * (Charger.id), not the station — different guns at the same station can be in very
 * different condition, so reports must never be pooled across a whole station.
 */
export const seedChargerReports: Record<string, ChargerReportCounts> = {
  "charger-csmu-b": { working: 1, notWorking: 4 },
};

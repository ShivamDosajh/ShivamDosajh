import { useCallback, useState } from "react";
import { seedChargerReports, type ChargerReportCounts } from "../data/chargerReports";

const STORAGE_KEY = "ira-ev-charger-reports";
const EMPTY: ChargerReportCounts = { working: 0, notWorking: 0 };

function loadStoredReports(): Record<string, ChargerReportCounts> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredReports(reports: Record<string, ChargerReportCounts>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // private browsing / storage full — reports just won't survive a reload
  }
}

/**
 * Aggregate working/not-working report counts for one specific gun — combines the seeded
 * "other drivers already reported" data with whatever this browser has submitted itself,
 * persisted to localStorage so the count (and any resulting warning) survives a reload.
 */
export function useChargerReports(chargerId: string) {
  const [stored, setStored] = useState(loadStoredReports);

  const seed = seedChargerReports[chargerId] ?? EMPTY;
  const own = stored[chargerId] ?? EMPTY;
  const counts: ChargerReportCounts = {
    working: seed.working + own.working,
    notWorking: seed.notWorking + own.notWorking,
  };

  const submitReport = useCallback(
    (working: boolean) => {
      setStored((prev) => {
        const prevOwn = prev[chargerId] ?? EMPTY;
        const nextOwn: ChargerReportCounts = {
          working: prevOwn.working + (working ? 1 : 0),
          notWorking: prevOwn.notWorking + (working ? 0 : 1),
        };
        const next = { ...prev, [chargerId]: nextOwn };
        saveStoredReports(next);
        return next;
      });
    },
    [chargerId]
  );

  return { counts, submitReport };
}

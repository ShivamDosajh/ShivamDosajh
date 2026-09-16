import { createContext, useContext } from "react";
import type { OneClickNotification, OneClickSession } from "../types/oneClickCharging";

export interface OneClickChargingContextValue {
  session: OneClickSession | null;
  notification: OneClickNotification | null;
  startGunConnect: (stationId: string, stationName: string, chargerId: string, chargerLabel: string) => void;
  dismissNotification: () => void;
  clearSession: () => void;
}

export const OneClickChargingContext = createContext<OneClickChargingContextValue | null>(null);

export function useOneClickCharging(): OneClickChargingContextValue {
  const ctx = useContext(OneClickChargingContext);
  if (!ctx) {
    throw new Error("useOneClickCharging must be used within OneClickChargingProvider");
  }
  return ctx;
}

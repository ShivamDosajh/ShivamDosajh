import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { OneClickChargingContext } from "../../hooks/useOneClickCharging";
import type { OneClickNotification, OneClickSession, OneClickStage } from "../../types/oneClickCharging";

/**
 * Demo timing, not real time: standing in for the gun-connect -> OCPI verification ->
 * telematics authentication round trip a real car and CPO backend would do over a few
 * seconds. Compressed into a fixed sequence so the multi-step nature of the check is
 * visible without an actual wait.
 */
const STAGE_DELAYS_MS: { stage: OneClickStage; atMs: number }[] = [
  { stage: "connecting", atMs: 0 },
  { stage: "verifying-ocpi", atMs: 1200 },
  { stage: "authenticating", atMs: 2600 },
  { stage: "verified", atMs: 3800 },
];
const NOTIFICATION_DELAY_MS = 4500;

export function OneClickChargingProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<OneClickSession | null>(null);
  const [notification, setNotification] = useState<OneClickNotification | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const startGunConnect = useCallback(
    (stationId: string, stationName: string, chargerId: string, chargerLabel: string) => {
      clearTimeouts();
      setNotification(null);
      setSession({ stationId, stationName, chargerId, chargerLabel, stage: "connecting" });

      STAGE_DELAYS_MS.slice(1).forEach(({ stage, atMs }) => {
        const t = setTimeout(() => {
          setSession((prev) =>
            prev && prev.stationId === stationId && prev.chargerId === chargerId ? { ...prev, stage } : prev
          );
        }, atMs);
        timeoutsRef.current.push(t);
      });

      const notifyTimeout = setTimeout(() => {
        setSession(null);
        setNotification({ stationId, stationName, chargerId, chargerLabel, firedAt: Date.now() });
      }, NOTIFICATION_DELAY_MS);
      timeoutsRef.current.push(notifyTimeout);
    },
    []
  );

  const dismissNotification = useCallback(() => setNotification(null), []);

  const clearSession = useCallback(() => {
    clearTimeouts();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, notification, startGunConnect, dismissNotification, clearSession }),
    [session, notification, startGunConnect, dismissNotification, clearSession]
  );

  return <OneClickChargingContext.Provider value={value}>{children}</OneClickChargingContext.Provider>;
}

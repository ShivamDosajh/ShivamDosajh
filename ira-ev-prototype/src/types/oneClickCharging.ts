/** Mirrors a plausible real flow: physically plugging in, then the car's telematics unit
 * cross-checking over OCPI that the gun that was just plugged in is actually the one it's
 * been told to expect, before authenticating the session to the driver's account. */
export type OneClickStage = "connecting" | "verifying-ocpi" | "authenticating" | "verified";

export interface OneClickSession {
  stationId: string;
  stationName: string;
  chargerId: string;
  chargerLabel: string;
  stage: OneClickStage;
}

/** What the simulated push notification carries once verification completes. */
export interface OneClickNotification {
  stationId: string;
  stationName: string;
  chargerId: string;
  chargerLabel: string;
  firedAt: number;
}

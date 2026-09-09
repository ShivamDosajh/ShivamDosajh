import type { Charger } from "../types/charging";

export interface ConnectorGroup {
  connector: string;
  power: number;
  pricePerKwh: number;
  speed: Charger["speed"];
  chargers: Charger[];
  availableCount: number;
  inUseCount: number;
}

export function groupChargersByConnector(chargers: Charger[]): ConnectorGroup[] {
  const groups = new Map<string, Charger[]>();
  for (const charger of chargers) {
    const existing = groups.get(charger.connector);
    if (existing) existing.push(charger);
    else groups.set(charger.connector, [charger]);
  }

  return [...groups.entries()].map(([connector, members]) => ({
    connector,
    power: Math.max(...members.map((c) => c.power)),
    pricePerKwh: members[0].pricePerKwh,
    speed: members[0].speed,
    chargers: members,
    availableCount: members.filter((c) => c.available).length,
    inUseCount: members.filter((c) => !c.available).length,
  }));
}

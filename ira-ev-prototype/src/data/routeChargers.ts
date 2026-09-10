import type { RouteCharger } from "../types/route";

/** Mock chargers spread along the same NH48 corridor as routeLocations.ts. */
export const routeChargers: RouteCharger[] = [
  { id: "rc-01", name: "Lonavala Ghat Charging Plaza", cpo: "Tata Power", distanceKm: 40, coordinates: { x: 34, y: 14 }, connector: "CCS2", powerKw: 60, pricePerKwh: 24 },
  { id: "rc-02", name: "Pune Bypass Fast Charger", cpo: "Statiq", distanceKm: 110, coordinates: { x: 40, y: 23 }, connector: "CCS2", powerKw: 30, pricePerKwh: 20 },
  { id: "rc-03", name: "Satara Highway Hub", cpo: "Tata Power", distanceKm: 190, coordinates: { x: 45, y: 33 }, connector: "CCS2", powerKw: 120, pricePerKwh: 26 },
  { id: "rc-04", name: "Karad Rest Point", cpo: "Ather Grid", distanceKm: 270, coordinates: { x: 50, y: 43 }, connector: "Type 2", powerKw: 22, pricePerKwh: 18 },
  { id: "rc-05", name: "Kolhapur City Charger", cpo: "ChargeZone", distanceKm: 320, coordinates: { x: 52, y: 48 }, connector: "CCS2", powerKw: 50, pricePerKwh: 22 },
  { id: "rc-06", name: "Nipani Border Plaza", cpo: "Tata Power", distanceKm: 400, coordinates: { x: 56, y: 57 }, connector: "CCS2", powerKw: 90, pricePerKwh: 25 },
  { id: "rc-07", name: "Belagavi Mega Charger", cpo: "Tata Power", distanceKm: 440, coordinates: { x: 58, y: 61 }, connector: "CCS2", powerKw: 120, pricePerKwh: 27 },
  { id: "rc-08", name: "Dharwad Service Plaza", cpo: "Statiq", distanceKm: 510, coordinates: { x: 61, y: 68 }, connector: "CCS2", powerKw: 60, pricePerKwh: 23 },
  { id: "rc-09", name: "Ranebennur Highway Point", cpo: "ChargeZone", distanceKm: 590, coordinates: { x: 64, y: 74 }, connector: "CCS2", powerKw: 30, pricePerKwh: 21 },
  { id: "rc-10", name: "Davangere Charging Hub", cpo: "Tata Power", distanceKm: 650, coordinates: { x: 66, y: 79 }, connector: "CCS2", powerKw: 90, pricePerKwh: 24 },
  { id: "rc-11", name: "Chitradurga Fort Charger", cpo: "Ather Grid", distanceKm: 700, coordinates: { x: 68, y: 83 }, connector: "Type 2", powerKw: 22, pricePerKwh: 19 },
  { id: "rc-12", name: "Sira Rest Stop", cpo: "Statiq", distanceKm: 780, coordinates: { x: 70, y: 88 }, connector: "CCS2", powerKw: 50, pricePerKwh: 22 },
  { id: "rc-13", name: "Tumakuru Bypass Charger", cpo: "Tata Power", distanceKm: 830, coordinates: { x: 72, y: 91 }, connector: "CCS2", powerKw: 100, pricePerKwh: 26 },
  { id: "rc-14", name: "Nelamangala Toll Plaza", cpo: "ChargeZone", distanceKm: 880, coordinates: { x: 73, y: 94 }, connector: "CCS2", powerKw: 60, pricePerKwh: 23 },
];

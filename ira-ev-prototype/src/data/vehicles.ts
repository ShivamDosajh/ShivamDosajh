import type { VehicleProfile } from "../types/route";

export const vehicles: VehicleProfile[] = [
  {
    id: "tata-nexon-ev-lr",
    make: "Tata",
    model: "Nexon EV Long Range",
    batteryCapacityKwh: 40.5,
    efficiencyWhPerKm: 145,
    maxChargeRateKw: 50,
    connector: "CCS2",
    massKg: 1450,
  },
  {
    id: "tata-punch-ev",
    make: "Tata",
    model: "Punch EV",
    batteryCapacityKwh: 35,
    efficiencyWhPerKm: 140,
    maxChargeRateKw: 70,
    connector: "CCS2",
    massKg: 1350,
  },
  {
    id: "tata-curvv-ev",
    make: "Tata",
    model: "Curvv EV",
    batteryCapacityKwh: 45,
    efficiencyWhPerKm: 150,
    maxChargeRateKw: 120,
    connector: "CCS2",
    massKg: 1550,
  },
  {
    id: "mg-zs-ev",
    make: "MG",
    model: "ZS EV",
    batteryCapacityKwh: 50.3,
    efficiencyWhPerKm: 160,
    maxChargeRateKw: 76,
    connector: "CCS2",
    massKg: 1620,
  },
  {
    id: "hyundai-ioniq5",
    make: "Hyundai",
    model: "Ioniq 5",
    batteryCapacityKwh: 72.6,
    efficiencyWhPerKm: 165,
    maxChargeRateKw: 175,
    connector: "CCS2",
    massKg: 2000,
  },
  {
    id: "byd-atto3",
    make: "BYD",
    model: "Atto 3",
    batteryCapacityKwh: 60.5,
    efficiencyWhPerKm: 155,
    maxChargeRateKw: 88,
    connector: "CCS2",
    massKg: 1750,
  },
];

export function getVehicleById(id: string): VehicleProfile {
  return vehicles.find((v) => v.id === id) ?? vehicles[0];
}

import { createContext, useContext } from "react";
import type { CartLine, ZomatoOrder, ZomatoRestaurant } from "../types/zomato";

export interface ZomatoOrderContextValue {
  order: ZomatoOrder | null;
  placeOrder: (stationId: string, stationName: string, restaurant: ZomatoRestaurant, lines: CartLine[], arrivalLabel: string) => void;
  clearOrder: () => void;
}

export const ZomatoOrderContext = createContext<ZomatoOrderContextValue | null>(null);

export function useZomatoOrder(): ZomatoOrderContextValue {
  const ctx = useContext(ZomatoOrderContext);
  if (!ctx) {
    throw new Error("useZomatoOrder must be used within ZomatoOrderProvider");
  }
  return ctx;
}

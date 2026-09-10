import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ZomatoOrderContext } from "../../hooks/useZomatoOrder";
import type { CartLine, ZomatoOrder, ZomatoOrderStatus, ZomatoRestaurant } from "../../types/zomato";

/**
 * Demo timing, not real time: a real order would track against the driver's actual arrival
 * (order.arrivalLabel), landing right as they park. For a prototype with no live navigation
 * feed, the same status progression is compressed into a fixed, short window so the "meets
 * you when you arrive" idea is visible without an actual multi-minute (or, on a planned
 * trip, multi-hour) wait.
 */
const DEMO_DURATION_MS = 18_000;
const STATUS_THRESHOLDS: { status: ZomatoOrderStatus; atFraction: number }[] = [
  { status: "placed", atFraction: 0 },
  { status: "preparing", atFraction: 0.08 },
  { status: "on-the-way", atFraction: 0.45 },
  { status: "delivered", atFraction: 1 },
];

function statusForElapsed(elapsedMs: number): ZomatoOrderStatus {
  const fraction = Math.min(1, elapsedMs / DEMO_DURATION_MS);
  let current: ZomatoOrderStatus = "placed";
  for (const step of STATUS_THRESHOLDS) {
    if (fraction >= step.atFraction) current = step.status;
  }
  return current;
}

export function ZomatoOrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<ZomatoOrder | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!order || order.status === "delivered") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setOrder((prev) => {
        if (!prev) return prev;
        const nextStatus = statusForElapsed(Date.now() - prev.placedAt);
        if (nextStatus === prev.status) return prev;
        return { ...prev, status: nextStatus };
      });
    }, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [order?.id, order?.status]);

  const placeOrder = useCallback(
    (stationId: string, stationName: string, restaurant: ZomatoRestaurant, lines: CartLine[], arrivalLabel: string) => {
      const totalPrice = lines.reduce((sum, l) => sum + l.item.price * l.qty, 0);
      setOrder({
        id: `zo-${Date.now()}`,
        stationId,
        stationName,
        restaurant,
        lines,
        totalPrice,
        placedAt: Date.now(),
        arrivalLabel,
        status: "placed",
      });
    },
    []
  );

  const clearOrder = useCallback(() => setOrder(null), []);

  const value = useMemo(() => ({ order, placeOrder, clearOrder }), [order, placeOrder, clearOrder]);

  return <ZomatoOrderContext.Provider value={value}>{children}</ZomatoOrderContext.Provider>;
}

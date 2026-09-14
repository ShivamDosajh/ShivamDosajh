import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Zap, Clock, IndianRupee } from "lucide-react";
import { Button } from "../../components/common/Button";
import { ChargingProgressRing } from "../../components/charging/ChargingProgressRing";
import { PromoBannerCarousel } from "../../components/charging/PromoBannerCarousel";
import { ZomatoOrderStatusCard } from "../../components/zomato/ZomatoOrderStatusCard";
import { useZomatoOrder } from "../../hooks/useZomatoOrder";
import { myConnectedVehicle } from "../../data/vehicles";
import { formatCurrency } from "../../utils/pricing";
import type { Charger, Station } from "../../types/charging";

interface ChargingInProgressScreenProps {
  station: Station;
  charger: Charger;
  units: number;
  approximateCost: number;
  onDone: () => void;
}

/** Demo timing, not real time — see ZomatoOrderProvider for the same reasoning: a real
 * session takes many minutes, so the same start-to-finish progression is compressed into a
 * short, fixed window for the prototype. */
const DEMO_DURATION_MS = 22_000;
const CHARGE_CURVE_EFFICIENCY = 0.75;

export function ChargingInProgressScreen({ station, charger, units, approximateCost, onDone }: ChargingInProgressScreenProps) {
  const { order, clearOrder } = useZomatoOrder();
  const orderForThisStation = order && order.stationId === station.id ? order : null;

  const startedAt = useRef(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt.current), 300);
    return () => clearInterval(id);
  }, []);

  const fraction = Math.min(1, elapsedMs / DEMO_DURATION_MS);
  const complete = fraction >= 1;

  const startPercent = myConnectedVehicle.currentSocPercent;
  const targetPercent = Math.min(100, startPercent + (units / myConnectedVehicle.batteryCapacityKwh) * 100);
  const currentPercent = startPercent + (targetPercent - startPercent) * fraction;

  const effectiveChargeRateKw = Math.min(charger.power, myConnectedVehicle.maxChargeRateKw) * CHARGE_CURVE_EFFICIENCY;
  const totalDurationMin = Math.max(3, (units / effectiveChargeRateKw) * 60);
  const energyAddedKwh = units * fraction;
  const remainingMin = Math.round(totalDurationMin * (1 - fraction));

  // A little taper + jitter near full so the live power draw reads as real telemetry, not a ramp.
  const taper = fraction < 0.85 ? 1 : 1 - ((fraction - 0.85) / 0.15) * 0.55;
  const jitter = complete ? 0 : Math.sin(elapsedMs / 700) * (charger.power * 0.03);
  const livePowerKw = complete ? 0 : Math.max(1, charger.power * taper + jitter);

  return (
    <div className="flex flex-col h-full safe-top safe-bottom">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 flex flex-col items-center gap-5">
        <div className="text-center">
          <p className="text-[13px] text-secondaryText">{complete ? "charging complete" : "charging in progress"}</p>
          <h1 className="text-[18px] font-semibold mt-0.5">{station.name}</h1>
        </div>

        <ChargingProgressRing percent={currentPercent} complete={complete} />

        <div className="w-full grid grid-cols-3 gap-2.5">
          <div className="rounded-card bg-surfaceRaised border border-border px-2.5 py-2.5 flex flex-col items-center text-center gap-1">
            <Zap size={15} className="text-primary" />
            <p className="text-[13px] font-semibold tabular-nums">{complete ? units.toFixed(1) : livePowerKw.toFixed(1)}</p>
            <p className="text-[10px] text-secondaryText lowercase leading-tight">{complete ? "kWh added" : "kW now"}</p>
          </div>
          <div className="rounded-card bg-surfaceRaised border border-border px-2.5 py-2.5 flex flex-col items-center text-center gap-1">
            <Clock size={15} className="text-primary" />
            <p className="text-[13px] font-semibold tabular-nums">{complete ? "done" : `${remainingMin} min`}</p>
            <p className="text-[10px] text-secondaryText lowercase leading-tight">{complete ? "session" : "remaining"}</p>
          </div>
          <div className="rounded-card bg-surfaceRaised border border-border px-2.5 py-2.5 flex flex-col items-center text-center gap-1">
            <IndianRupee size={15} className="text-primary" />
            <p className="text-[13px] font-semibold tabular-nums">{formatCurrency(approximateCost * fraction).replace("₹", "")}</p>
            <p className="text-[10px] text-secondaryText lowercase leading-tight">spent so far</p>
          </div>
        </div>

        {complete && (
          <div className="flex items-center gap-2 text-success text-[13px]">
            <CheckCircle2 size={16} />
            {formatCurrency(approximateCost)} paid · {energyAddedKwh.toFixed(1)} kWh added
          </div>
        )}

        <div className="w-full">
          <PromoBannerCarousel />
        </div>

        {orderForThisStation && (
          <div className="w-full">
            <ZomatoOrderStatusCard order={orderForThisStation} onDismiss={clearOrder} />
          </div>
        )}
      </div>

      <div className="px-6 pb-4 pt-2 shrink-0">
        <Button variant={complete ? "primary" : "outline"} onClick={onDone}>
          {complete ? "done" : "end session early"}
        </Button>
      </div>
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";
import { Button } from "../../components/common/Button";
import { getStationById, getChargerById } from "../../data/stations";
import { computeCostBreakdown, formatCurrency } from "../../utils/pricing";
import { useZomatoOrder } from "../../hooks/useZomatoOrder";
import { useExperiments } from "../../hooks/useExperiments";
import { ZomatoOrderStatusCard } from "../../components/zomato/ZomatoOrderStatusCard";
import { ChargingInProgressScreen } from "./ChargingInProgressScreen";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";

export function PaymentSuccessScreen({ flow }: { flow: ChargingFlowApi }) {
  const { config } = useExperiments();
  const station = getStationById(flow.selectedStationId);
  const charger = getChargerById(station, flow.selectedChargerId);
  const breakdown = charger && flow.units ? computeCostBreakdown(flow.units, charger.pricePerKwh) : null;
  // The wallet discount was already deducted from what the driver agreed to pay at the
  // payment screen — carry it through so "amount paid" here matches that, not the full price.
  const amountPaid = breakdown ? Math.max(0, breakdown.approximateValue - (flow.walletDiscount ?? 0)) : null;
  const { order, clearOrder } = useZomatoOrder();
  const orderForThisStation = order && station && order.stationId === station.id ? order : null;

  if (config.showChargingInProgress && station && charger && flow.units && breakdown && amountPaid !== null) {
    return (
      <ChargingInProgressScreen
        station={station}
        charger={charger}
        units={flow.units}
        approximateCost={amountPaid}
        onDone={flow.reset}
      />
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center gap-6 safe-top safe-bottom px-6">
      <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
        <CheckCircle2 size={44} className="text-success" />
      </div>
      <div className="text-center">
        <p className="text-[18px] font-semibold">Payment successful</p>
        {amountPaid !== null && (
          <p className="text-[14px] text-secondaryText mt-2">
            {formatCurrency(amountPaid)} paid to {station?.name}
          </p>
        )}
        <p className="text-[14px] text-secondaryText mt-1">charging session will start shortly</p>
      </div>
      {orderForThisStation && (
        <div className="w-full max-w-xs">
          <ZomatoOrderStatusCard order={orderForThisStation} onDismiss={clearOrder} />
        </div>
      )}
      <div className="w-full max-w-xs mt-2">
        <Button onClick={flow.reset}>done</Button>
      </div>
    </div>
  );
}

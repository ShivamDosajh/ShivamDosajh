import { Zap, ShieldCheck } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { StationSummaryHeader } from "../../components/station/StationSummaryHeader";
import { getStationById, getChargerById } from "../../data/stations";
import { computeCostBreakdown, formatCurrency, formatUnits, fullChargeUnits } from "../../utils/pricing";
import { useExperiments } from "../../hooks/useExperiments";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";

/**
 * The "minimum clicks" charging path: once a charger is selected, this is the only screen
 * between that and a charging session actually starting. No separate charge-type, recharge
 * review, or payment-method screens — it defaults to a full charge on the default payment
 * method and puts everything the driver needs to confirm on one button.
 */
export function QuickPayScreen({ flow }: { flow: ChargingFlowApi }) {
  const { config } = useExperiments();
  const station = getStationById(flow.selectedStationId);
  const charger = getChargerById(station, flow.selectedChargerId);

  if (!station || !charger) return null;

  const units = fullChargeUnits();
  const breakdown = computeCostBreakdown(units, charger.pricePerKwh);

  const handlePayAndStart = () => {
    flow.setUnits(units);
    flow.setAmount(breakdown.costOfRecharge);
    if (!flow.selectedPaymentMethodId) {
      flow.selectPaymentMethod("bhim-upi");
    }
    flow.startPayment();
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="quick charge" onBack={flow.back} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <StationSummaryHeader station={station} />

        <div className="rounded-card bg-surfaceRaised border border-border p-4 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary">
            <Zap size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium truncate">
              {charger.connector} · {charger.power.toFixed(1)} kW
            </p>
            <p className="text-[12px] text-secondaryText">{formatUnits(units)} to full charge</p>
          </div>
          <p className="text-[18px] font-semibold shrink-0">{formatCurrency(breakdown.approximateValue)}</p>
        </div>

        <div className="flex items-center gap-2.5 rounded-card bg-primary/10 border border-primary/30 px-3.5 py-3 mb-4">
          <ShieldCheck size={16} className="text-primary shrink-0" />
          <p className="text-[12px] text-secondaryText">
            paying with <span className="text-text font-medium">BHIM UPI</span> · charging to{" "}
            <span className="text-text font-medium">full</span> — change either from the regular charging flow
          </p>
        </div>

        <p className="text-[11px] text-secondaryText leading-relaxed">
          includes {formatCurrency(breakdown.tax)} tax. any excess amount deducted will be refunded. by
          proceeding, you are agreeing to the Terms &amp; Conditions.
        </p>
      </div>

      <StickyFooter sticky={config.stickyCTA}>
        <Button onClick={handlePayAndStart}>pay {formatCurrency(breakdown.approximateValue)} &amp; start charging</Button>
      </StickyFooter>
    </div>
  );
}

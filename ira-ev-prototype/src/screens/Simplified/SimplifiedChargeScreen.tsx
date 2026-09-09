import { IndianRupee } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { StationSummaryHeader } from "../../components/station/StationSummaryHeader";
import { ChargerCard } from "../../components/charger/ChargerCard";
import { QuickSelectRow } from "../../components/common/QuickSelectRow";
import { getStationById, getChargerById } from "../../data/stations";
import { unitsFromAmount, formatUnits } from "../../utils/pricing";
import { useExperiments } from "../../hooks/useExperiments";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";

const quickAmounts = [250, 500, 750, 1000];

export function SimplifiedChargeScreen({ flow }: { flow: ChargingFlowApi }) {
  const { config } = useExperiments();
  const station = getStationById(flow.selectedStationId);
  const charger = getChargerById(station, flow.selectedChargerId);

  if (!station) return null;

  const isValid = !!flow.selectedChargerId && !!flow.amount && flow.amount > 0;

  const handlePay = () => {
    if (charger && flow.amount) {
      flow.setUnits(unitsFromAmount(flow.amount, charger.pricePerKwh));
    }
    if (!flow.selectedPaymentMethodId) {
      flow.selectPaymentMethod("bhim-upi");
    }
    flow.startPayment();
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="charge now" onBack={flow.back} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <StationSummaryHeader station={station} />

        <p className="text-[14px] text-text mb-3">select your charging connector</p>
        <div className="flex flex-col gap-3 mb-5">
          {station.chargers.map((c) => (
            <ChargerCard
              key={c.id}
              charger={c}
              selected={flow.selectedChargerId === c.id}
              onSelect={() => flow.selectCharger(c.id)}
            />
          ))}
        </div>

        {charger && (
          <div className="flex flex-col gap-3 mb-4">
            <p className="text-[13px] text-secondaryText">enter amount</p>
            <div className="flex items-center gap-2 h-14 rounded-button bg-surfaceRaised border border-border px-4">
              <IndianRupee size={18} className="text-secondaryText" />
              <input
                type="number"
                inputMode="decimal"
                value={flow.amount ?? ""}
                onChange={(e) => flow.setAmount(e.target.value ? Number(e.target.value) : null)}
                placeholder="0"
                className="bg-transparent outline-none border-none w-full text-[18px]"
              />
            </div>
            <QuickSelectRow
              values={quickAmounts}
              prefix="₹"
              activeValue={flow.amount}
              onSelect={(v) => flow.setAmount(v)}
            />
            {config.showEstimatedCost && flow.amount ? (
              <p className="text-[13px] text-secondaryText">
                ≈ {formatUnits(flow.amount / charger.pricePerKwh)} at ₹{charger.pricePerKwh}/kWh · taxes
                applied at checkout
              </p>
            ) : null}
          </div>
        )}
      </div>

      <StickyFooter sticky={config.stickyCTA}>
        <Button disabled={!isValid} onClick={handlePay}>
          {flow.amount ? `pay ₹${flow.amount}` : "pay"}
        </Button>
      </StickyFooter>
    </div>
  );
}

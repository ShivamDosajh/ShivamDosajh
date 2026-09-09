import { IndianRupee, Battery } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { SegmentedControl } from "../../components/common/SegmentedControl";
import { QuickSelectRow } from "../../components/common/QuickSelectRow";
import { getStationById, getChargerById } from "../../data/stations";
import { useExperiments } from "../../hooks/useExperiments";
import { amountFromUnits, unitsFromAmount, formatCurrency, formatUnits, fullChargeUnits } from "../../utils/pricing";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";
import type { ChargeType } from "../../types/charging";

interface ChargingTypeScreenProps {
  flow: ChargingFlowApi;
}

const chargeTypeOptions: { value: ChargeType; label: string }[] = [
  { value: "amount", label: "amount" },
  { value: "units", label: "units" },
  { value: "full-charge", label: "full charge" },
];

const quickAmounts = [250, 500, 750, 1000];
const quickUnits = [5, 10, 15, 20];

export function ChargingTypeScreen({ flow }: ChargingTypeScreenProps) {
  const { config } = useExperiments();
  const station = getStationById(flow.selectedStationId);
  const charger = getChargerById(station, flow.selectedChargerId);
  const chargeType = flow.chargeType ?? "amount";

  if (!station || !charger) return null;

  const fullUnits = fullChargeUnits();
  const fullCost = amountFromUnits(fullUnits, charger.pricePerKwh);

  const isValid =
    chargeType === "full-charge"
      ? true
      : chargeType === "amount"
      ? !!flow.amount && flow.amount > 0
      : !!flow.units && flow.units > 0;

  const handleContinue = () => {
    if (chargeType === "full-charge") {
      flow.setUnits(fullUnits);
      flow.setAmount(fullCost);
    } else if (chargeType === "amount" && flow.amount) {
      flow.setUnits(unitsFromAmount(flow.amount, charger.pricePerKwh));
    } else if (chargeType === "units" && flow.units) {
      flow.setAmount(amountFromUnits(flow.units, charger.pricePerKwh));
    }
    flow.confirmChargingType();
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="charging type" onBack={flow.back} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="py-4">
          <p className="text-[13px] text-secondaryText">{station.cpo}</p>
          <h2 className="text-[16px] font-semibold leading-snug mt-0.5">{station.name}</h2>
          <p className="text-[13px] text-secondaryText mt-2">
            {charger.connector}({charger.name}) · {charger.power.toFixed(1)} kW
          </p>
        </div>

        <div className="h-px bg-border mb-4" />

        <p className="text-[14px] mb-3">choose charge type</p>
        <SegmentedControl options={chargeTypeOptions} value={chargeType} onChange={(t) => flow.setChargeType(t)} />

        <div className="mt-5">
          {chargeType === "amount" && (
            <div className="flex flex-col gap-3">
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
                  ≈ {formatUnits(flow.amount / charger.pricePerKwh)} at ₹{charger.pricePerKwh}/kWh
                </p>
              ) : null}
            </div>
          )}

          {chargeType === "units" && (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] text-secondaryText">enter units</p>
              <div className="flex items-center gap-2 h-14 rounded-button bg-surfaceRaised border border-border px-4">
                <Battery size={18} className="text-secondaryText" />
                <input
                  type="number"
                  inputMode="decimal"
                  value={flow.units ?? ""}
                  onChange={(e) => flow.setUnits(e.target.value ? Number(e.target.value) : null)}
                  placeholder="0"
                  className="bg-transparent outline-none border-none w-full text-[18px]"
                />
                <span className="text-secondaryText text-[14px]">kWh</span>
              </div>
              <QuickSelectRow
                values={quickUnits}
                suffix=" kWh"
                activeValue={flow.units}
                onSelect={(v) => flow.setUnits(v)}
              />
              {config.showEstimatedCost && flow.units ? (
                <p className="text-[13px] text-secondaryText">
                  ≈ {formatCurrency(amountFromUnits(flow.units, charger.pricePerKwh))}
                </p>
              ) : null}
            </div>
          )}

          {chargeType === "full-charge" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-card bg-surfaceRaised border border-border p-4">
                <p className="text-[12px] text-secondaryText lowercase">units required for full charge</p>
                <p className="text-[20px] font-semibold mt-1">{formatUnits(fullUnits)}</p>
              </div>
              <div className="rounded-card bg-surfaceRaised border border-border p-4">
                <p className="text-[12px] text-secondaryText lowercase">approximate cost for full charge</p>
                <p className="text-[20px] font-semibold mt-1">{formatCurrency(fullCost)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <StickyFooter sticky={config.stickyCTA}>
        <Button disabled={!isValid} onClick={handleContinue}>
          done
        </Button>
      </StickyFooter>
    </div>
  );
}

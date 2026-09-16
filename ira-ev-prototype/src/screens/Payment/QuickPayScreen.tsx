import { useEffect } from "react";
import { IndianRupee, Battery } from "lucide-react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { StationSummaryHeader } from "../../components/station/StationSummaryHeader";
import { SegmentedControl } from "../../components/common/SegmentedControl";
import { QuickSelectRow } from "../../components/common/QuickSelectRow";
import { PaymentMethodList } from "../../components/payment/PaymentMethodList";
import { WalletDiscountCard } from "../../components/wallet/WalletDiscountCard";
import { LinkedChargeSliders } from "../../components/charging/LinkedChargeSliders";
import { getStationById, getChargerById } from "../../data/stations";
import { primaryPaymentMethods } from "../../data/payments";
import { useExperiments } from "../../hooks/useExperiments";
import { useWallet } from "../../hooks/useWallet";
import {
  amountFromUnits,
  unitsFromAmount,
  computeCostBreakdown,
  formatCurrency,
  formatUnits,
  fullChargeUnits,
} from "../../utils/pricing";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";
import type { ChargeType } from "../../types/charging";

const chargeTypeOptions: { value: ChargeType; label: string }[] = [
  { value: "full-charge", label: "full charge" },
  { value: "amount", label: "amount" },
  { value: "units", label: "units" },
];

const quickAmounts = [250, 500, 750, 1000];
const quickUnits = [5, 10, 15, 20];

/**
 * The "minimum clicks" charging path: reached by tapping a gun straight from the station
 * short card, this is the only screen between that and a charging session starting — it just
 * folds charge-type selection and payment-method selection (normally two separate screens)
 * into one, rather than skipping either choice.
 */
export function QuickPayScreen({ flow }: { flow: ChargingFlowApi }) {
  const { config } = useExperiments();
  const wallet = useWallet();
  const station = getStationById(flow.selectedStationId);
  const charger = getChargerById(station, flow.selectedChargerId);
  const chargeType = flow.chargeType ?? "full-charge";

  // Pre-select the driver's preferred payment method so "pay & start charging" is tappable
  // right away instead of forcing a redundant tap on the method they'd have picked anyway.
  useEffect(() => {
    if (!flow.selectedPaymentMethodId) {
      flow.selectPaymentMethod(primaryPaymentMethods[0].id);
    }
  }, []);

  if (!station || !charger) return null;

  const fullUnits = fullChargeUnits();
  const fullCost = amountFromUnits(fullUnits, charger.pricePerKwh);

  const displayUnits =
    chargeType === "full-charge" ? fullUnits : chargeType === "units" ? flow.units ?? 0 : flow.amount ? unitsFromAmount(flow.amount, charger.pricePerKwh) : 0;
  const breakdown = computeCostBreakdown(displayUnits, charger.pricePerKwh);
  const discount = wallet.previewDiscount(breakdown.approximateValue);
  const payable = Math.max(0, breakdown.approximateValue - discount);

  const isChargeValid =
    chargeType === "full-charge"
      ? true
      : chargeType === "amount"
      ? !!flow.amount && flow.amount > 0
      : !!flow.units && flow.units > 0;
  const isValid = isChargeValid && !!flow.selectedPaymentMethodId;

  const handlePayAndStart = () => {
    if (chargeType === "full-charge") {
      flow.setUnits(fullUnits);
      flow.setAmount(fullCost);
    } else if (chargeType === "amount" && flow.amount) {
      flow.setUnits(unitsFromAmount(flow.amount, charger.pricePerKwh));
    } else if (chargeType === "units" && flow.units) {
      flow.setAmount(amountFromUnits(flow.units, charger.pricePerKwh));
    }
    if (discount > 0) {
      flow.setWalletDiscount(discount);
      wallet.redeem(discount);
    }
    flow.startPayment();
  };

  const handleSliderUnitsChange = (nextUnits: number) => {
    const clamped = Math.max(0, nextUnits);
    flow.setChargeType("units");
    flow.setUnits(clamped);
    flow.setAmount(amountFromUnits(clamped, charger.pricePerKwh));
  };

  const handleToggleFullCharge = (checked: boolean) => {
    if (checked) {
      flow.setChargeType("full-charge");
      flow.setUnits(fullUnits);
      flow.setAmount(fullCost);
    } else {
      flow.setChargeType("units");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="quick charge" onBack={flow.back} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <StationSummaryHeader station={station} />
        <p className="text-[13px] text-secondaryText mb-4 -mt-2">
          {charger.connector}({charger.name}) · {charger.power.toFixed(1)} kW
        </p>

        {config.sliderChargeAmountUI ? (
          <LinkedChargeSliders
            charger={charger}
            units={chargeType === "full-charge" ? fullUnits : flow.units ?? 0}
            isFullCharge={chargeType === "full-charge"}
            fullChargeUnits={fullUnits}
            onChangeUnits={handleSliderUnitsChange}
            onToggleFullCharge={handleToggleFullCharge}
          />
        ) : (
          <>
            <p className="text-[14px] mb-3">choose charge type</p>
            <SegmentedControl options={chargeTypeOptions} value={chargeType} onChange={(t) => flow.setChargeType(t)} />

            <div className="mt-4">
              {chargeType === "amount" && (
                <div className="flex flex-col gap-3">
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
                </div>
              )}

              {chargeType === "units" && (
                <div className="flex flex-col gap-3">
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
                </div>
              )}

              {chargeType === "full-charge" && (
                <div className="rounded-card bg-surfaceRaised border border-border p-4 flex items-center justify-between">
                  <p className="text-[12px] text-secondaryText lowercase">units required for full charge</p>
                  <p className="text-[16px] font-semibold">{formatUnits(fullUnits)}</p>
                </div>
              )}

              {config.showEstimatedCost && displayUnits > 0 ? (
                <p className="text-[12px] text-secondaryText mt-2.5">
                  ≈ {formatCurrency(breakdown.approximateValue)} incl. tax
                </p>
              ) : null}
            </div>
          </>
        )}

        <div className="mt-3">
          <WalletDiscountCard transactionValue={breakdown.approximateValue} />
        </div>

        <div className="h-px bg-border my-4" />

        <p className="text-[14px] mb-3">choose your UPI app</p>
        <PaymentMethodList selectedId={flow.selectedPaymentMethodId} onSelect={(id) => flow.selectPaymentMethod(id)} />

        <p className="text-[11px] text-secondaryText leading-relaxed mt-4 pb-2">
          includes {formatCurrency(breakdown.tax)} tax. any excess amount deducted will be refunded. by
          proceeding, you are agreeing to the Terms &amp; Conditions.
        </p>
      </div>

      <StickyFooter sticky={config.stickyCTA}>
        {discount > 0 && (
          <p className="text-center text-[12px] text-secondaryText mb-2">
            <span className="line-through">{formatCurrency(breakdown.approximateValue)}</span>{" "}
            <span className="text-primary font-medium">{formatCurrency(payable)}</span> after iRA Cash
          </p>
        )}
        <Button disabled={!isValid} onClick={handlePayAndStart}>
          pay {formatCurrency(payable)} &amp; start charging
        </Button>
      </StickyFooter>
    </div>
  );
}

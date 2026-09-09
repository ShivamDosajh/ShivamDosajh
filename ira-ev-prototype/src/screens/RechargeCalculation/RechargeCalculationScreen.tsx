import { useState } from "react";
import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { CostBreakdown } from "../../components/payment/CostBreakdown";
import { OfferCard } from "../../components/payment/OfferCard";
import { OfferModal } from "../../components/payment/OfferModal";
import { TermsModal } from "../../components/payment/TermsModal";
import { PaymentMethodList } from "../../components/payment/PaymentMethodList";
import { getStationById, getChargerById } from "../../data/stations";
import { offers } from "../../data/offers";
import { computeCostBreakdown } from "../../utils/pricing";
import { useExperiments } from "../../hooks/useExperiments";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";
import type { Offer } from "../../types/charging";

export function RechargeCalculationScreen({ flow }: { flow: ChargingFlowApi }) {
  const { config } = useExperiments();
  const station = getStationById(flow.selectedStationId);
  const charger = getChargerById(station, flow.selectedChargerId);
  const [termsOpen, setTermsOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);

  if (!station || !charger || !flow.units) return null;

  const breakdown = computeCostBreakdown(flow.units, charger.pricePerKwh);

  const handlePay = () => {
    flow.startPayment();
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="recharge calculation" onBack={flow.back} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <div className="flex flex-col gap-4 py-4">
          <CostBreakdown data={breakdown} />

          <div className="text-[12px] text-secondaryText leading-relaxed">
            <p>* any excess amount deducted will be refunded.</p>
            <p className="mt-1">
              by proceeding, you are agreeing to the{" "}
              <button onClick={() => setTermsOpen(true)} className="text-primary underline underline-offset-2">
                Terms &amp; Conditions
              </button>
            </p>
          </div>

          <div>
            <p className="text-[14px] font-medium mb-2 lowercase">offers for you</p>
            <div className="flex flex-col gap-2">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onClick={() => setActiveOffer(offer)} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[14px] font-medium mb-2 lowercase">select payment method</p>
            <PaymentMethodList
              selectedId={flow.selectedPaymentMethodId}
              onSelect={(id) => flow.selectPaymentMethod(id)}
            />
          </div>
        </div>
      </div>

      <StickyFooter sticky={config.stickyCTA}>
        <Button disabled={!flow.selectedPaymentMethodId} onClick={handlePay}>
          pay {`₹${breakdown.approximateValue.toFixed(2)}`}
        </Button>
      </StickyFooter>

      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
      <OfferModal offer={activeOffer} onClose={() => setActiveOffer(null)} />
    </div>
  );
}

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";

const PROCESSING_MS = 1800;

export function PaymentProcessingScreen({ flow }: { flow: ChargingFlowApi }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      flow.completePayment();
    }, PROCESSING_MS);
    return () => clearTimeout(timer);
  }, [flow]);

  return (
    <div className="flex flex-col h-full items-center justify-center gap-5 safe-top safe-bottom px-6">
      <Loader2 size={40} className="text-primary animate-spin" />
      <div className="text-center">
        <p className="text-[16px] font-medium">Payment processing...</p>
        <p className="text-[13px] text-secondaryText mt-1">please do not close the app</p>
      </div>
    </div>
  );
}

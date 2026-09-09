import { IndianRupee, Clock } from "lucide-react";
import type { PaymentAvailability } from "../../types/charging";

interface PaymentStatusProps {
  status: PaymentAvailability;
}

const config: Record<PaymentAvailability, { label: string; classes: string; icon: "rupee" | "clock" }> = {
  enabled: {
    label: "payment enabled",
    classes: "bg-primary/15 text-primary",
    icon: "rupee",
  },
  unavailable: {
    label: "payment unavailable",
    classes: "bg-error/15 text-error",
    icon: "rupee",
  },
  "coming-soon": {
    label: "coming soon",
    classes: "bg-warning/15 text-warning",
    icon: "clock",
  },
};

export function PaymentStatus({ status }: PaymentStatusProps) {
  const c = config[status];
  return (
    <div
      className={`w-full h-11 rounded-button flex items-center justify-center gap-1.5 font-medium text-[15px] lowercase ${c.classes}`}
    >
      {c.icon === "rupee" ? <IndianRupee size={16} /> : <Clock size={16} />}
      {c.label}
    </div>
  );
}

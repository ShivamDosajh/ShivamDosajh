import { ChefHat, Bike, PackageCheck, ClipboardCheck, X } from "lucide-react";
import type { ZomatoOrder, ZomatoOrderStatus } from "../../types/zomato";

const STEPS: { status: ZomatoOrderStatus; label: string; icon: typeof ChefHat }[] = [
  { status: "placed", label: "placed", icon: ClipboardCheck },
  { status: "preparing", label: "preparing", icon: ChefHat },
  { status: "on-the-way", label: "on the way", icon: Bike },
  { status: "delivered", label: "delivered", icon: PackageCheck },
];

interface ZomatoOrderStatusCardProps {
  order: ZomatoOrder;
  onDismiss?: () => void;
}

export function ZomatoOrderStatusCard({ order, onDismiss }: ZomatoOrderStatusCardProps) {
  const activeIndex = STEPS.findIndex((s) => s.status === order.status);
  const itemCount = order.lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <div className="rounded-card bg-surfaceRaised border border-primary/40 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] text-primary font-medium">food order · {order.restaurant.name}</p>
          <p className="text-[13px] text-secondaryText mt-0.5">
            {itemCount} item{itemCount > 1 ? "s" : ""} · ₹{order.totalPrice} · to {order.stationName}
          </p>
        </div>
        {onDismiss && order.status === "delivered" && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss order status"
            className="w-7 h-7 flex items-center justify-center rounded-full text-secondaryText active:bg-background shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center mt-3.5">
        {STEPS.map((step, i) => {
          const reached = i <= activeIndex;
          const Icon = step.icon;
          return (
            <div key={step.status} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={[
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    reached ? "bg-primary text-black" : "bg-background text-secondaryText",
                  ].join(" ")}
                >
                  <Icon size={13} />
                </div>
                <span className={`text-[10px] lowercase ${reached ? "text-text" : "text-secondaryText"}`}>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-1 -mt-4 ${i < activeIndex ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {order.status === "delivered" ? (
        <p className="text-[12px] text-success mt-3">delivered to your charging bay — enjoy your meal!</p>
      ) : (
        <p className="text-[12px] text-secondaryText mt-3">
          {order.status === "placed" && "restaurant is confirming your order..."}
          {order.status === "preparing" && "your food is being prepared..."}
          {order.status === "on-the-way" && `on the way — will meet you at ${order.stationName}`}
        </p>
      )}
    </div>
  );
}

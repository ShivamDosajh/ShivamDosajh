import { BatteryCharging } from "lucide-react";

interface RangePredictionProps {
  currentRange: number;
  arrivalRange: number;
}

export function RangePrediction({ currentRange, arrivalRange }: RangePredictionProps) {
  return (
    <div className="w-full rounded-card bg-surfaceRaised border border-border px-3.5 py-3 flex items-center gap-3">
      <div className="flex flex-col items-center shrink-0">
        <BatteryCharging size={20} className="text-primary" />
        <span className="text-[13px] font-semibold mt-0.5">{currentRange} km</span>
      </div>
      <p className="text-[13px] text-secondaryText leading-snug">
        you are likely to reach the charger with{" "}
        <span className="text-text font-medium">{arrivalRange} km</span> range left*
      </p>
    </div>
  );
}

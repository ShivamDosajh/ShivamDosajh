import { Battery } from "lucide-react";

interface RangePredictionProps {
  currentRange: number;
  arrivalRange: number;
}

export function RangePrediction({ currentRange, arrivalRange }: RangePredictionProps) {
  return (
    <div className="w-full rounded-card bg-surfaceInset border-l-4 border-l-primary pl-3 pr-3.5 py-3 flex items-center gap-3">
      <div className="flex items-center gap-1.5 shrink-0">
        <Battery size={18} className="text-text" />
        <span className="text-[14px] font-medium text-text">{currentRange} km</span>
      </div>
      <div className="w-px self-stretch bg-border shrink-0" />
      <p className="text-[14px] leading-5 text-secondaryText">
        you are likely to reach the charger with{" "}
        <span className="text-text font-medium">{arrivalRange} km</span> range left*
      </p>
    </div>
  );
}

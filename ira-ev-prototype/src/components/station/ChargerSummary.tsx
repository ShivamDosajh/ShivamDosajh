import { Plug } from "lucide-react";
import type { Charger } from "../../types/charging";

interface ChargerSummaryProps {
  chargers: Charger[];
  showSpeed?: boolean;
}

export function ChargerSummary({ chargers, showSpeed = true }: ChargerSummaryProps) {
  const available = chargers.filter((c) => c.available).length;
  const maxPower = Math.max(...chargers.map((c) => c.power));
  const speed = chargers[0]?.speed;

  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-surfaceRaised border border-border flex items-center justify-center shrink-0">
        <Plug size={20} className="text-primary" />
      </div>
      <div>
        <p className="text-[13px] text-secondaryText">
          <span className="text-success font-semibold">
            {available}/{chargers.length}
          </span>
        </p>
        <p className="text-[15px] font-semibold">
          {maxPower.toFixed(1)}kW
          {showSpeed && speed ? <span className="text-secondaryText font-normal capitalize"> · {speed}</span> : null}
        </p>
      </div>
    </div>
  );
}

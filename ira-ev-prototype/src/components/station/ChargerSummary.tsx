import { Plug } from "lucide-react";
import type { Charger } from "../../types/charging";
import { groupChargersByConnector } from "../../utils/connectors";

interface ChargerSummaryProps {
  chargers: Charger[];
  showSpeed?: boolean;
}

export function ChargerSummary({ chargers, showSpeed = true }: ChargerSummaryProps) {
  const groups = groupChargersByConnector(chargers);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {groups.map((group) => (
        <div key={group.connector} className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-full bg-surfaceRaised border border-border flex items-center justify-center shrink-0">
            <Plug size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-[13px] text-secondaryText">
              <span className="text-success font-semibold">
                {group.availableCount}/{group.chargers.length}
              </span>
            </p>
            <p className="text-[15px] font-semibold">
              {group.power.toFixed(1)}kW
              {showSpeed ? <span className="text-secondaryText font-normal capitalize"> · {group.speed}</span> : null}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

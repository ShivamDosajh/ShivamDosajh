import { Navigation2 } from "lucide-react";
import { Button } from "../../components/common/Button";
import { getStationById } from "../../data/stations";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";

export function NavigatingScreen({ flow }: { flow: ChargingFlowApi }) {
  const station = getStationById(flow.selectedStationId);

  return (
    <div className="flex flex-col h-full items-center justify-center gap-5 px-6 text-center safe-top safe-bottom">
      <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center animate-pulse">
        <Navigation2 size={28} className="text-primary" />
      </div>
      <div>
        <p className="text-[16px] font-medium">navigating to {station?.name ?? "station"}</p>
        <p className="text-[13px] text-secondaryText mt-1.5">
          {station ? `${station.distance} km · ${station.eta} mins` : ""}
        </p>
        <p className="text-[12px] text-secondaryText mt-3">(mock navigation preview)</p>
      </div>
      <div className="w-full max-w-xs">
        <Button variant="outline" onClick={flow.back}>
          end navigation
        </Button>
      </div>
    </div>
  );
}

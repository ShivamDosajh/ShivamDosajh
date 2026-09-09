import { ScreenHeader } from "../../components/navigation/ScreenHeader";
import { StationSummaryHeader } from "../../components/station/StationSummaryHeader";
import { ChargerCard } from "../../components/charger/ChargerCard";
import { Button } from "../../components/common/Button";
import { StickyFooter } from "../../components/common/StickyFooter";
import { getStationById } from "../../data/stations";
import { useExperiments } from "../../hooks/useExperiments";
import type { ChargingFlowApi } from "../../hooks/useChargingFlow";

interface ChargerSelectionScreenProps {
  flow: ChargingFlowApi;
}

export function ChargerSelectionScreen({ flow }: ChargerSelectionScreenProps) {
  const { config } = useExperiments();
  const station = getStationById(flow.selectedStationId);

  if (!station) return null;

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="select charger" onBack={flow.back} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4">
        <StationSummaryHeader station={station} />
        <p className="text-[14px] text-text mb-3">select your charging connector</p>
        <div className="flex flex-col gap-3 pb-4">
          {station.chargers.map((charger) => (
            <ChargerCard
              key={charger.id}
              charger={charger}
              selected={flow.selectedChargerId === charger.id}
              onSelect={() => flow.selectCharger(charger.id)}
            />
          ))}
        </div>
      </div>
      <StickyFooter sticky={config.stickyCTA}>
        <Button disabled={!flow.selectedChargerId} onClick={flow.confirmChargerSelection}>
          continue
        </Button>
      </StickyFooter>
    </div>
  );
}

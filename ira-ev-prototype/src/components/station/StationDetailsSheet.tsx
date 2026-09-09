import { Star } from "lucide-react";
import type { Station } from "../../types/charging";
import { BottomSheet } from "../common/BottomSheet";
import { Button } from "../common/Button";
import { CpoLogo } from "../common/CpoLogo";
import { PaymentStatus } from "./PaymentStatus";
import { ChargerSummary } from "./ChargerSummary";
import { RangePrediction } from "./RangePrediction";
import { useExperiments } from "../../hooks/useExperiments";

interface StationDetailsSheetProps {
  station: Station | undefined;
  onClose: () => void;
  onNavigate: () => void;
  onSelectCharger: () => void;
}

function formatLastUsed(minutes: number | null): string {
  if (minutes === null) return "not used yet";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

export function StationDetailsSheet({ station, onClose, onNavigate, onSelectCharger }: StationDetailsSheetProps) {
  const { config } = useExperiments();

  if (!station) return null;

  return (
    <BottomSheet
      open={!!station}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onNavigate}>
            navigate
          </Button>
          <Button variant="primary" onClick={onSelectCharger}>
            select charger
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <PaymentStatus status={station.paymentStatus} />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-secondaryText">{station.cpo}</p>
            <h2 className="text-[19px] font-semibold leading-snug mt-0.5">{station.name}</h2>
            <p className="text-[13px] text-secondaryText mt-1 leading-relaxed">{station.address}</p>
            {config.showMegaChargerBadge && station.isMegaCharger && (
              <span className="inline-block mt-2 text-[11px] font-semibold text-orange-400 bg-orange-400/15 px-2 py-1 rounded-pill">
                TATA.ev Mega Charger
              </span>
            )}
          </div>
          <CpoLogo cpo={station.cpo} />
        </div>

        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="text-primary font-medium">ev rating</span>
          <span className="text-secondaryText">
            {station.rating !== null ? (
              <span className="flex items-center gap-1 text-text">
                <Star size={13} className="fill-warning text-warning" />
                {station.rating.toFixed(1)}
              </span>
            ) : (
              "--"
            )}
          </span>
        </div>

        <div className="flex items-stretch justify-between rounded-card bg-surfaceRaised border border-border px-3 py-3">
          <div className="flex-1 text-center">
            <p className="text-[11px] text-secondaryText lowercase">distance</p>
            <p className="text-[14px] font-semibold mt-0.5">{station.distance} km</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-[11px] text-secondaryText lowercase">ETA</p>
            <p className="text-[14px] font-semibold mt-0.5">{station.eta} mins</p>
          </div>
          {config.showStationLastUsed && (
            <>
              <div className="w-px bg-border" />
              <div className="flex-1 text-center">
                <p className="text-[11px] text-secondaryText lowercase">last used</p>
                <p className="text-[13px] font-semibold mt-0.5">{formatLastUsed(station.lastUsedMinutesAgo)}</p>
              </div>
            </>
          )}
        </div>

        <ChargerSummary chargers={station.chargers} showSpeed={config.showChargingSpeed} />

        {config.showRangePrediction && (
          <RangePrediction currentRange={station.currentRangeKm} arrivalRange={station.arrivalRangeKm} />
        )}

        {config.showEstimatedCost && (
          <p className="text-[12px] text-secondaryText">
            estimated cost from ₹{Math.min(...station.chargers.map((c) => c.pricePerKwh))}/kWh
          </p>
        )}
      </div>
    </BottomSheet>
  );
}

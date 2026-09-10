import { useEffect, useState } from "react";
import { Star, Phone, Navigation2, ChevronUp, ChevronDown } from "lucide-react";
import type { Station } from "../../types/charging";
import { BottomSheet } from "../common/BottomSheet";
import { Button } from "../common/Button";
import { CpoLogo } from "../common/CpoLogo";
import { IconAction } from "../common/IconAction";
import { PaymentStatus } from "./PaymentStatus";
import { ChargerSummary } from "./ChargerSummary";
import { RangePrediction } from "./RangePrediction";
import { StationTabs } from "./StationTabs";
import { ConnectorGroupRow } from "./ConnectorGroupRow";
import { useExperiments } from "../../hooks/useExperiments";
import { useSheetDrag } from "../../hooks/useSheetDrag";
import { groupChargersByConnector } from "../../utils/connectors";

interface StationDetailsSheetProps {
  station: Station | undefined;
  onClose: () => void;
  onNavigate: () => void;
  onSelectCharger: () => void;
}

const COLLAPSED_VH = 64;
const EXPANDED_VH = 92;

function formatLastUsed(minutes: number | null): string {
  if (minutes === null) return "not used yet";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

export function StationDetailsSheet({ station, onClose, onNavigate, onSelectCharger }: StationDetailsSheetProps) {
  const { config } = useExperiments();
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"overview" | "reviews">("overview");
  const { heightPx, isDragging, visualExpanded, handleProps } = useSheetDrag({
    collapsedVh: COLLAPSED_VH,
    expandedVh: EXPANDED_VH,
    expanded,
    onExpandedChange: setExpanded,
  });

  // Reset per-station UI state whenever a different station sheet opens.
  useEffect(() => {
    setExpanded(false);
    setTab("overview");
  }, [station?.id]);

  if (!station) return null;

  const connectorGroups = groupChargersByConnector(station.chargers);

  return (
    <BottomSheet
      open={!!station}
      onClose={onClose}
      heightPx={heightPx}
      isDragging={isDragging}
      dragHandleProps={handleProps}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={visualExpanded ? () => setExpanded(false) : onNavigate}>
            {visualExpanded ? "check in" : "navigate"}
          </Button>
          <Button variant="primary" onClick={onSelectCharger}>
            select charger
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-center gap-1 text-[11px] text-secondaryText -mt-1"
        >
          {visualExpanded ? (
            <>
              <ChevronDown size={13} /> show less
            </>
          ) : (
            <>
              <ChevronUp size={13} /> view all chargers
            </>
          )}
        </button>

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

        {!visualExpanded && (
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
        )}

        {!visualExpanded && (
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
        )}

        {!visualExpanded && <ChargerSummary chargers={station.chargers} showSpeed={config.showChargingSpeed} />}

        {!visualExpanded && config.showRangePrediction && (
          <RangePrediction currentRange={station.currentRangeKm} arrivalRange={station.arrivalRangeKm} />
        )}

        {!visualExpanded && config.showEstimatedCost && (
          <p className="text-[12px] text-secondaryText">
            estimated cost from ₹{Math.min(...station.chargers.map((c) => c.pricePerKwh))}/kWh
          </p>
        )}

        {visualExpanded && config.showRangePrediction && (
          <RangePrediction currentRange={station.currentRangeKm} arrivalRange={station.arrivalRangeKm} />
        )}

        {visualExpanded && (
          <>
            <div className="flex items-stretch">
              <IconAction icon={Phone} label="call" onClick={() => {}} />
              <div className="w-px bg-border my-2" />
              <IconAction icon={Navigation2} label="navigate" onClick={onNavigate} />
            </div>

            <StationTabs active={tab} onChange={setTab} />

            {tab === "overview" ? (
              <div className="rounded-card bg-surfaceRaised border border-border px-3.5">
                <div className="flex items-center gap-2.5 py-3 border-b border-border">
                  <span className="text-[13px] font-semibold">available connectors</span>
                </div>
                {connectorGroups.map((group) => (
                  <ConnectorGroupRow key={group.connector} group={group} />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-secondaryText text-center py-8">no reviews yet</p>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
}
